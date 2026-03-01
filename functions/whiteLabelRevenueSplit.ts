import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ─── Phase 11: White-Label Partner & Phase 12: Franchise Revenue Split ────────
// White-label: 80% Supplier / 10% Sub-Agent / 10% GC Travel
// Franchise: 80% Supplier / GC Travel keeps remainder - 5-10% royalty to GC

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      bookingId,
      bookingType,
      totalAmount,
      partnerType, // 'white_label' | 'franchise'
      partnerCode,  // sub-agent code or franchise code
      currency = 'PHP'
    } = await req.json();

    if (!bookingId || !totalAmount || !partnerType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[PARTNER SPLIT] ${partnerType} | ${partnerCode} | Amount: ${totalAmount}`);

    let split;

    if (partnerType === 'white_label') {
      // ── Phase 11: White-Label Split ──────────────────────────────────
      // 80% Supplier / 10% Sub-Agent / 10% GC Travel
      const supplierAmount   = parseFloat((totalAmount * 0.80).toFixed(2));
      const subAgentAmount   = parseFloat((totalAmount * 0.10).toFixed(2));
      const gcTravelAmount   = parseFloat((totalAmount * 0.10).toFixed(2));
      const stripeFee        = parseFloat((totalAmount * 0.029).toFixed(2));
      const gcNetProfit      = parseFloat((gcTravelAmount - stripeFee).toFixed(2));

      split = {
        model: 'white_label_10/10/80',
        supplier_amount: supplierAmount,
        sub_agent_amount: subAgentAmount,
        gc_travel_amount: gcTravelAmount,
        stripe_fee: stripeFee,
        gc_net_profit: gcNetProfit
      };

      // Record affiliate/sub-agent commission
      try {
        await base44.asServiceRole.entities.AffiliateCommission.create({
          affiliate_code: partnerCode,
          booking_id: bookingId,
          booking_type: bookingType,
          booking_amount: totalAmount,
          commission_rate: 10,
          commission_amount: subAgentAmount,
          currency,
          status: 'pending',
          created_date: new Date().toISOString()
        });
      } catch (err) {
        console.error('Affiliate commission record error:', err.message);
      }

    } else if (partnerType === 'franchise') {
      // ── Phase 12: Franchise Split ────────────────────────────────────
      // 80% Supplier | GC Travel retains revenue | 5-10% royalty from franchise
      const royaltyRate      = 0.075; // 7.5% average royalty
      const supplierAmount   = parseFloat((totalAmount * 0.80).toFixed(2));
      const franchiseeAmount = parseFloat((totalAmount * 0.20 * (1 - royaltyRate)).toFixed(2));
      const royaltyAmount    = parseFloat((totalAmount * 0.20 * royaltyRate).toFixed(2));
      const stripeFee        = parseFloat((totalAmount * 0.029).toFixed(2));
      const gcNetProfit      = parseFloat((royaltyAmount - stripeFee).toFixed(2));

      split = {
        model: 'franchise_7.5%_royalty',
        supplier_amount: supplierAmount,
        franchisee_amount: franchiseeAmount,
        royalty_amount: royaltyAmount,
        stripe_fee: stripeFee,
        gc_net_profit: gcNetProfit
      };

    } else {
      return Response.json({ error: 'Invalid partnerType. Use: white_label or franchise' }, { status: 400 });
    }

    // ── Log the split to PaymentSplit entity ──────────────────────────────
    await base44.asServiceRole.entities.PaymentSplit.create({
      booking_id: bookingId,
      booking_type: bookingType,
      gross_amount: totalAmount,
      supplier_amount: split.supplier_amount,
      agency_amount: split.gc_travel_amount || split.royalty_amount,
      stripe_fee: split.stripe_fee,
      net_profit: split.gc_net_profit,
      currency,
      split_date: new Date().toISOString(),
      status: 'settled',
      model: split.model,
      partner_code: partnerCode
    });

    // ── Create pending supplier payment ───────────────────────────────────
    await base44.asServiceRole.entities.SupplierPayment.create({
      booking_id: bookingId,
      booking_type: bookingType,
      supplier: 'direct',
      supplier_amount: split.supplier_amount,
      customer_paid_amount: totalAmount,
      markup_retained: split.gc_travel_amount || split.royalty_amount,
      payment_status: 'pending',
      notes: `${partnerType} model – Partner: ${partnerCode}`
    });

    console.log(`[PARTNER SPLIT COMPLETE] ${partnerType} | GC Net: ${split.gc_net_profit}`);

    return Response.json({
      success: true,
      split,
      booking_id: bookingId,
      partner_type: partnerType,
      partner_code: partnerCode,
      total_amount: totalAmount,
      currency
    });

  } catch (error) {
    console.error('[WHITE-LABEL SPLIT ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});