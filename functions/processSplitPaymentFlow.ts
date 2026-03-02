import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, bookingType, totalAmount, supplier, supplierAmount } = await req.json();

    if (!bookingId || !bookingType || !totalAmount || !supplier) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate payment split
    const merchantAmount = totalAmount * 0.75; // 75% to merchant
    const markupAmount = totalAmount * 0.20; // 20% markup
    const taxFeesAmount = totalAmount * 0.05; // 5% taxes & fees
    const userTotalAmount = markupAmount + taxFeesAmount; // 25% total to user

    // Create payment split record
    const paymentSplit = await base44.entities.PaymentSplit.create({
      booking_id: bookingId,
      booking_type: bookingType,
      total_amount: totalAmount,
      supplier: supplier,
      merchant_amount: merchantAmount,
      markup_amount: markupAmount,
      tax_fees_amount: taxFeesAmount,
      user_total_amount: userTotalAmount,
      merchant_status: 'pending',
      user_payment_status: 'pending',
      user_email: user.email,
      gcash_account: 'pending', // Will be set when user provides GCash details
    });

    // Create supplier payment record (for merchant)
    await base44.entities.SupplierPayment.create({
      booking_id: bookingId,
      booking_type: bookingType,
      supplier: supplier,
      supplier_amount: merchantAmount,
      customer_paid_amount: totalAmount,
      markup_retained: userTotalAmount,
      payment_status: 'pending',
      payment_method: 'manual',
    });

    // Create wallet deposit for user (markup + taxes/fees)
    const wallets = await base44.entities.Wallet.filter({ user_email: user.email });
    if (wallets.length > 0) {
      const wallet = wallets[0];
      await base44.entities.Wallet.update(wallet.id, {
        balance: wallet.balance + userTotalAmount,
      });
    } else {
      await base44.entities.Wallet.create({
        user_email: user.email,
        balance: userTotalAmount,
        points_balance: 0,
      });
    }

    // Record transaction
    await base44.entities.WalletTransaction.create({
      user_email: user.email,
      transaction_type: 'earning',
      amount: userTotalAmount,
      description: `Payment split from ${bookingType} booking (${supplier}) - Markup: ${markupAmount}, Taxes/Fees: ${taxFeesAmount}`,
    });

    console.log(`Split payment processed for ${bookingId}:
      - Merchant (${supplier}): ${merchantAmount}
      - User markup: ${markupAmount}
      - User taxes/fees: ${taxFeesAmount}
      - Total to user: ${userTotalAmount}`);

    return Response.json({
      success: true,
      paymentSplit: {
        id: paymentSplit.id,
        totalAmount,
        merchantAmount,
        markupAmount,
        taxFeesAmount,
        userTotalAmount,
      },
      message: 'Payment split calculated and recorded',
    });
  } catch (error) {
    console.error('Split payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});