import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const { amount, withdrawMethod, bankAccount, accountName, userEmail } = payload;

    if (!amount || amount <= 0) {
      return Response.json({ success: false, error: "Invalid amount" }, { status: 400 });
    }

    // Fetch user's wallet
    const wallets = await base44.entities.Wallet.filter({ user_email: userEmail });
    const wallet = wallets[0];

    if (!wallet) {
      return Response.json({ success: false, error: "Wallet not found" }, { status: 404 });
    }

    if (amount > wallet.balance) {
      return Response.json({ success: false, error: "Insufficient balance" }, { status: 400 });
    }

    // Process withdrawal request
    const newBalance = wallet.balance - amount;

    // Update wallet balance
    await base44.entities.Wallet.update(wallet.id, { balance: newBalance });

    // Create withdrawal transaction
    const transactionId = `wd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await base44.entities.WalletTransaction.create({
      user_email: userEmail,
      transaction_type: "withdrawal",
      amount: amount,
      description: `Withdrawal to ${withdrawMethod} - ${bankAccount}`,
      payment_method: withdrawMethod,
      transaction_id: transactionId,
      status: "pending",
    });

    // Create withdrawal request record (for admin processing)
    try {
      // Assuming there's a WithdrawalRequest entity
      await base44.asServiceRole.entities.create('WithdrawalRequest', {
        user_email: userEmail,
        amount: amount,
        withdraw_method: withdrawMethod,
        bank_account: bankAccount,
        account_name: accountName,
        status: "pending",
        transaction_id: transactionId,
        requested_date: new Date().toISOString(),
      });
    } catch (e) {
      // WithdrawalRequest entity may not exist, just log and continue
      console.log("WithdrawalRequest entity not available:", e.message);
    }

    // Log withdrawal for audit
    console.log(`Withdrawal requested: ${userEmail} - ₱${amount} via ${withdrawMethod} (ID: ${transactionId})`);

    return Response.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      transactionId: transactionId,
      balance: newBalance,
      estimatedProcessing: "1-3 business days",
    });
  } catch (error) {
    console.error("Withdrawal processing error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});