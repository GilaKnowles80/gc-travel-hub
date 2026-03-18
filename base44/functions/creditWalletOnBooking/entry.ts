import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Credits user's wallet with a percentage of successful booking payment
 * Called from payment webhooks (Stripe, PayPal, PayMongo)
 */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const { user_email, booking_id, booking_type, payment_amount, payment_method } = await req.json();

    // Validate input
    if (!user_email || !booking_id || !payment_amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate 5% cashback
    const cashback_amount = Math.round(payment_amount * 0.05 * 100) / 100;

    console.log(`Processing wallet credit: ${user_email}, ${cashback_amount} from ${booking_type} booking`);

    // Check if wallet exists
    let wallet = null;
    try {
      const wallets = await base44.asServiceRole.entities.Wallet.filter({ user_email });
      wallet = wallets[0];
    } catch (e) {
      console.error('Error fetching wallet:', e.message);
    }

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await base44.asServiceRole.entities.Wallet.create({
        user_email,
        balance: 0,
        currency: 'USD'
      });
    }

    // Create wallet transaction record
    const transaction = await base44.asServiceRole.entities.WalletTransaction.create({
      user_email,
      transaction_type: 'deposit',
      amount: cashback_amount,
      description: `Cashback from ${booking_type} booking (${booking_id})`,
      booking_id,
      booking_type,
      payment_method,
      reference_id: `cashback_${booking_id}_${Date.now()}`
    });

    // Update wallet balance
    const newBalance = (wallet.balance || 0) + cashback_amount;
    await base44.asServiceRole.entities.Wallet.update(wallet.id, {
      balance: newBalance
    });

    console.log(`Wallet credited successfully: ${cashback_amount} for ${user_email}`);

    return Response.json({
      success: true,
      transaction_id: transaction.id,
      amount_credited: cashback_amount,
      new_balance: newBalance
    });
  } catch (error) {
    console.error('Error crediting wallet:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});