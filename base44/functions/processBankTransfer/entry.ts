import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transfer_id } = await req.json();

    if (!transfer_id) {
      return Response.json({ error: 'Missing transfer ID' }, { status: 400 });
    }

    // Fetch transfer details
    const transfer = await base44.entities.BankTransfer.list();
    const targetTransfer = transfer.find(t => t.id === transfer_id);

    if (!targetTransfer) {
      return Response.json({ error: 'Transfer not found' }, { status: 404 });
    }

    if (targetTransfer.user_email !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch wallet
    const wallets = await base44.entities.Wallet.filter({ user_email: user.email });
    if (!wallets.length) {
      return Response.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const wallet = wallets[0];
    const totalAmount = targetTransfer.amount + targetTransfer.fee;

    // Check balance
    if (wallet.balance < totalAmount) {
      await base44.entities.BankTransfer.update(targetTransfer.id, {
        status: 'failed',
        error_message: 'Insufficient wallet balance',
      });
      return Response.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Deduct from wallet
    await base44.entities.Wallet.update(wallet.id, {
      balance: wallet.balance - totalAmount,
    });

    // Update transfer status
    await base44.entities.BankTransfer.update(targetTransfer.id, {
      status: 'completed',
      reference_number: `BT${Date.now()}`,
      processed_date: new Date().toISOString(),
    });

    // Log transaction
    await base44.entities.WalletTransaction.create({
      user_email: user.email,
      transaction_type: 'withdrawal',
      amount: targetTransfer.amount,
      description: `Bank transfer to ${targetTransfer.recipient_name} (${targetTransfer.recipient_bank})`,
      status: 'completed',
      booking_id: transfer_id,
    });

    return Response.json({
      success: true,
      transfer: {
        id: targetTransfer.id,
        status: 'completed',
        amount: targetTransfer.amount,
        fee: targetTransfer.fee,
        total: totalAmount,
        reference_number: `BT${Date.now()}`,
      },
    });
  } catch (error) {
    console.error('Bank transfer error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});