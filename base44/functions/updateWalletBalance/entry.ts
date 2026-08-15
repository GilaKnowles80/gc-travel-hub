import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    const body = await req.json();
    const {
      userEmail,
      amount,
      transactionType = 'deposit',
      description = '',
      referenceId = null
    } = body;

    if (!userEmail || !amount) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create wallet
    let wallet = await base44.asServiceRole.entities.Wallet.filter(
      { user_email: userEmail }
    ).then(results => results[0]);

    if (!wallet) {
      wallet = await base44.asServiceRole.entities.Wallet.create({
        user_email: userEmail,
        balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
        total_used: 0,
        status: 'active'
      });
    }

    // Calculate new balance
    let newBalance = wallet.balance;
    let newTotalEarned = wallet.total_earned;
    let newTotalWithdrawn = wallet.total_withdrawn;
    let newTotalUsed = wallet.total_used;

    if (transactionType === 'deposit' || transactionType === 'refund') {
      newBalance += amount;
      newTotalEarned += amount;
    } else if (transactionType === 'withdrawal') {
      if (newBalance < amount) {
        return Response.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }
      newBalance -= amount;
      newTotalWithdrawn += amount;
    } else if (transactionType === 'booking_payment') {
      if (newBalance < amount) {
        return Response.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }
      newBalance -= amount;
      newTotalUsed += amount;
    }

    // Update wallet
    await base44.asServiceRole.entities.Wallet.update(wallet.id, {
      balance: newBalance,
      total_earned: newTotalEarned,
      total_withdrawn: newTotalWithdrawn,
      total_used: newTotalUsed
    });

    // Create transaction record
    const transaction = await base44.asServiceRole.entities.WalletTransaction.create({
      user_email: userEmail,
      transaction_type: transactionType,
      amount,
      description,
      reference_id: referenceId,
      status: 'completed'
    });

    console.log('Wallet updated for:', userEmail, 'Amount:', amount, 'Type:', transactionType);

    return Response.json({
      success: true,
      wallet: { balance: newBalance },
      transaction: transaction.id
    });
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});