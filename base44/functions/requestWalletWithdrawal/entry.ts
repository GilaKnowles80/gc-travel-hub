import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, withdrawalMethod } = body;

    if (!amount || !withdrawalMethod) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get wallet
    const wallets = await base44.asServiceRole.entities.Wallet.filter({
      user_email: user.email
    });

    const wallet = wallets[0];
    if (!wallet || wallet.balance < amount) {
      return Response.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create pending withdrawal transaction
    const transaction = await base44.asServiceRole.entities.WalletTransaction.create({
      user_email: user.email,
      transaction_type: 'withdrawal',
      amount,
      description: `Withdrawal request - ${withdrawalMethod}`,
      withdrawal_method: withdrawalMethod,
      status: 'pending'
    });

    // Send notification email
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Withdrawal Request Received',
        body: `Dear ${user.full_name},\n\nYour withdrawal request of PHP ${amount} has been received and is pending approval.\n\nWithdrawal Method: ${withdrawalMethod}\nTransaction ID: ${transaction.id}\n\nWe will process this within 3-5 business days.\n\nBest regards,\nGC Travel & Tours Finance Team`
      });
    } catch (emailError) {
      console.error('Error sending withdrawal notification:', emailError);
    }

    console.log('Withdrawal request created:', transaction.id, 'Amount:', amount);

    return Response.json({
      success: true,
      transactionId: transaction.id,
      message: 'Withdrawal request submitted successfully'
    });
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});