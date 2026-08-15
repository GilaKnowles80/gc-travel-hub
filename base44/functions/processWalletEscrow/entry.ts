import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Wallet escrow engine for real-time itinerary transactions.
//   action=hold   → user payment received & held in wallet escrow (held_balance)
//   action=settle → on booking outcome: success splits 75% merchant (monthly Duffel
//                   collection) + 25% admin commission; failure releases 100% to
//                   the user's withdrawable balance. Idempotent.
//   action=refund → admin credits a user's withdrawable balance (wallet refunds).
// Service-role (workflow-triggered) for hold/settle; refund requires an admin.

const MERCHANT_RATE = 0.75;
const COMMISSION_RATE = 0.25;

const TYPE_CONFIG = {
  flight: { entity: 'FlightBooking', emailField: 'passenger_email', totalField: 'total_price', supplierField: 'supplier' },
  hotel: { entity: 'HotelBooking', emailField: 'guest_email', totalField: 'total_price', supplierField: 'supplier' },
  tour: { entity: 'Booking', emailField: 'customer_email', totalField: 'total_price', supplierField: 'supplier' },
  bus: { entity: 'BusBooking', emailField: 'passenger_email', totalField: 'total_price', supplierField: 'supplier' },
  ferry: { entity: 'FerryBooking', emailField: 'passenger_email', totalField: 'total_price', supplierField: 'supplier' },
  cruise: { entity: 'CruiseBooking', emailField: 'guest_email', totalField: 'total_price', supplierField: 'supplier' },
  car_rental: { entity: 'CarRentalBooking', emailField: 'driver_email', totalField: 'total_price', supplierField: 'supplier' },
  visa: { entity: 'VisaAppointment', emailField: 'applicant_email', totalField: 'total_price', supplierField: null, commissionOnly: true },
  train: { entity: 'TrainBooking', emailField: 'passenger_email', totalField: 'total_price', supplierField: 'supplier' },
  package: { entity: 'PackageBooking', emailField: 'user_email', totalField: 'final_price', supplierField: null, successStatus: 'paid', failureStatuses: ['cancelled'] },
  insurance: { entity: 'InsurancePolicy', emailField: 'user_email', totalField: 'premium', supplierField: null, successStatus: 'paid', failureStatuses: ['cancelled', 'refunded'] },
  digital: { entity: 'DigitalOrder', emailField: 'user_email', totalField: 'total_amount', supplierField: null, successStatus: 'paid', failureStatuses: ['failed', 'cancelled', 'refunded'], commissionOnly: true },
};

const SUPPLIER_ENUM = ['biyaheko', 'wanderlinx', 'tripzynx', 'duffel', '12go', 'trainline', 'direct'];
const TERMINAL_RELEASE = ['cancelled', 'rejected', 'failed'];

const round2 = (n) => Math.round(n * 100) / 100;

async function getOrCreateWallet(base44, userEmail) {
  const wallets = await base44.asServiceRole.entities.Wallet.filter({ user_email: userEmail });
  if (wallets[0]) return wallets[0];
  return await base44.asServiceRole.entities.Wallet.create({ user_email: userEmail, balance: 0, held_balance: 0 });
}

function coerceSupplier(supplier) {
  return SUPPLIER_ENUM.includes(supplier) ? supplier : 'direct';
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const action = body?.action;

    // ── refund: admin-only ────────────────────────────────────────────────
    if (action === 'refund') {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Admin access required for refunds' }, { status: 403 });
      }
      const { user_email, booking_id, booking_type, amount, reason } = body;
      if (!user_email || !amount || amount <= 0) {
        return Response.json({ error: 'user_email and a positive amount are required' }, { status: 400 });
      }
      const wallet = await getOrCreateWallet(base44, user_email);
      const newBal = (wallet.balance || 0) + amount;
      await base44.asServiceRole.entities.Wallet.update(wallet.id, { balance: newBal });
      await base44.asServiceRole.entities.WalletTransaction.create({
        user_email,
        transaction_type: 'refund',
        amount,
        description: `Wallet refund${booking_type ? ` — ${booking_type} ${booking_id || ''}` : ''}${reason ? `: ${reason}` : ''}`,
        reference_id: booking_id || '',
        status: 'completed',
      });
      return Response.json({ success: true, action: 'refund', new_balance: newBal });
    }

    // ── hold: escrow incoming payment at checkout ──────────────────────────
    if (action === 'hold') {
      const { user_email, booking_id, booking_type, amount, supplier } = body;
      if (!user_email || !booking_id || !booking_type || !amount || amount <= 0) {
        return Response.json({ error: 'user_email, booking_id, booking_type, amount required' }, { status: 400 });
      }
      const wallet = await getOrCreateWallet(base44, user_email);
      const newHeld = (wallet.held_balance || 0) + amount;
      await base44.asServiceRole.entities.Wallet.update(wallet.id, { held_balance: newHeld });

      const merchant = round2(amount * MERCHANT_RATE);
      const commission = round2(amount * COMMISSION_RATE);
      await base44.asServiceRole.entities.PaymentSplit.create({
        booking_id, booking_type, total_amount: amount,
        wallet_debit: amount, supplier_payout: merchant, gc_commission: commission,
        payment_method: 'wallet', supplier_id: coerceSupplier(supplier), currency: 'PHP',
        status: 'pending', reconciliation_status: 'pending',
      });
      await base44.asServiceRole.entities.WalletTransaction.create({
        user_email, transaction_type: 'booking_payment', amount,
        description: `Escrow hold for ${booking_type} booking (${booking_id})`,
        reference_id: booking_id, status: 'pending',
      });
      return Response.json({ success: true, action: 'hold', held_balance: newHeld });
    }

    // ── settle: triggered on booking status change ─────────────────────────
    if (action === 'settle') {
      const { booking_id, booking_type, status } = body;
      if (!booking_id || !booking_type) {
        return Response.json({ error: 'booking_id, booking_type required' }, { status: 400 });
      }
      const cfg = TYPE_CONFIG[booking_type];
      if (!cfg) return Response.json({ error: `Unsupported booking_type: ${booking_type}` }, { status: 400 });

      // Idempotency: skip if already settled.
      const existing = await base44.asServiceRole.entities.PaymentSplit.filter({ booking_id, booking_type });
      const split = existing[0];
      if (split && (split.status === 'confirmed' || split.status === 'failed')) {
        return Response.json({ success: true, skipped: true, reason: 'already_settled' });
      }

      const bookings = await base44.asServiceRole.entities[cfg.entity].filter({ id: booking_id });
      const booking = bookings?.[0];
      if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

      // Prefer the hold record's user_email + amount (set during checkout) so
      // settlement targets the same wallet that escrowed the funds; fall back to
      // the booking record when no prior hold exists.
      let amount = booking[cfg.totalField] || 0;
      if (split?.total_amount) amount = split.total_amount;
      let userEmail = booking[cfg.emailField];
      const holdTxns = await base44.asServiceRole.entities.WalletTransaction.filter({
        reference_id: booking_id, transaction_type: 'booking_payment', status: 'pending',
      });
      if (holdTxns?.[0]?.user_email) userEmail = holdTxns[0].user_email;
      const supplier = coerceSupplier((cfg.supplierField && booking[cfg.supplierField]) || split?.supplier_id || 'direct');

      // ── SUCCESS: split 75% merchant (monthly) + 25% admin commission ──
      if (status === (cfg.successStatus || 'confirmed')) {
        const commissionOnly = cfg.commissionOnly === true;
        const merchant = commissionOnly ? 0 : round2(amount * MERCHANT_RATE);
        const commission = commissionOnly ? amount : round2(amount * COMMISSION_RATE);

        if (userEmail) {
          const wallet = await getOrCreateWallet(base44, userEmail);
          const newHeld = Math.max((wallet.held_balance || 0) - amount, 0);
          await base44.asServiceRole.entities.Wallet.update(wallet.id, { held_balance: newHeld });
          await base44.asServiceRole.entities.WalletTransaction.create({
            user_email: userEmail, transaction_type: 'booking_payment', amount,
            description: `Escrow settled (success) — ${booking_type} ${booking_id}`,
            reference_id: booking_id, status: 'completed',
          });
        }

        if (split) {
          await base44.asServiceRole.entities.PaymentSplit.update(split.id, {
            supplier_payout: merchant, gc_commission: commission, status: 'confirmed',
          });
        } else {
          await base44.asServiceRole.entities.PaymentSplit.create({
            booking_id, booking_type, total_amount: amount, wallet_debit: amount,
            supplier_payout: merchant, gc_commission: commission, payment_method: 'wallet',
            supplier_id: supplier, currency: 'PHP', status: 'confirmed', reconciliation_status: 'pending',
          });
        }

        // 75% merchant payable — settled monthly as Duffel collects (skipped for
        // commission-only types like visa, where the held amount is the service fee).
        if (merchant > 0) {
          await base44.asServiceRole.entities.SupplierPayment.create({
            booking_id, booking_type, supplier,
            supplier_amount: merchant, customer_paid_amount: amount, markup_retained: commission,
            payment_status: 'pending', payment_method: 'manual',
            notes: 'Auto-split 75% merchant share — monthly Duffel collection',
          });
        }

        return Response.json({ success: true, action: 'settle', outcome: 'success', merchant, commission });
      }

      // ── FAILURE: release 100% to withdrawable balance ─────────────────
      if ((cfg.failureStatuses || TERMINAL_RELEASE).includes(status)) {
        if (userEmail) {
          const wallet = await getOrCreateWallet(base44, userEmail);
          const newHeld = Math.max((wallet.held_balance || 0) - amount, 0);
          const newBal = (wallet.balance || 0) + amount;
          await base44.asServiceRole.entities.Wallet.update(wallet.id, { held_balance: newHeld, balance: newBal });
          await base44.asServiceRole.entities.WalletTransaction.create({
            user_email: userEmail, transaction_type: 'refund', amount,
            description: `Escrow released (failed booking) — ${booking_type} ${booking_id}`,
            reference_id: booking_id, status: 'completed',
          });
        }
        if (split) {
          await base44.asServiceRole.entities.PaymentSplit.update(split.id, { status: 'failed' });
        }
        return Response.json({ success: true, action: 'settle', outcome: 'released', amount });
      }

      return Response.json({ success: true, skipped: true, reason: 'status_not_actionable' });
    }

    return Response.json({ error: 'Unknown action. Use: hold | settle | refund' }, { status: 400 });
  } catch (error) {
    console.error('processWalletEscrow error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}