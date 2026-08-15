import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MAX_WALLET_AMOUNT = 1_000_000_000; // 1 billion

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { amount, bookingId, bookingType, description } = await req.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get or create wallet
    const wallets = await base44.entities.Wallet.filter({ user_email: user.email });
    let wallet = wallets[0];

    if (!wallet) {
      // Create new wallet
      wallet = await base44.entities.Wallet.create({
        user_email: user.email,
        balance: amount,
        points_balance: 0,
      });
    } else {
      // Update existing wallet
      const newBalance = wallet.balance + amount;
      if (newBalance > MAX_WALLET_AMOUNT) {
        return Response.json(
          { error: `Wallet balance cannot exceed ${MAX_WALLET_AMOUNT.toLocaleString()}` },
          { status: 400 }
        );
      }
      wallet = await base44.entities.Wallet.update(wallet.id, { balance: newBalance });
    }

    // Record transaction
    await base44.entities.WalletTransaction.create({
      user_email: user.email,
      transaction_type: 'deposit',
      amount: amount,
      description: description || `Payment received - ${bookingType} (${bookingId})`,
    });

    // Record payment
    if (bookingId && bookingType) {
      await base44.entities.Payment.create({
        booking_id: bookingId,
        booking_type: bookingType,
        amount: amount,
        payment_method: 'wallet',
        status: 'completed',
        description: description || `${bookingType} payment`,
      });
    }

    console.log(`Wallet payment processed: ${user.email} - ${amount} - ${bookingType}`);

    return Response.json({
      success: true,
      message: 'Payment received',
      wallet_balance: wallet.balance,
      transaction_id: `WAL-${Date.now()}`,
    });
  } catch (error) {
    console.error('Wallet payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});