import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@15.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, withdrawMethod, bankAccount, accountName } = await req.json();

    // Validate input
    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!withdrawMethod || !bankAccount) {
      return Response.json({ error: 'Missing withdrawal details' }, { status: 400 });
    }

    // Get user wallet
    const wallets = await base44.asServiceRole.entities.Wallet.filter({
      user_email: user.email
    });

    const wallet = wallets[0];
    if (!wallet || wallet.balance < amount) {
      return Response.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Create withdrawal record in WalletLedger for audit trail
    const ledgerEntry = await base44.asServiceRole.entities.WalletLedger.create({
      user_email: user.email,
      transaction_type: 'withdrawal',
      amount,
      status: 'pending',
      balance_before: wallet.balance,
      balance_after: wallet.balance - amount,
      notes: `${withdrawMethod.toUpperCase()} withdrawal - ${accountName || bankAccount}`,
      currency: 'PHP'
    });

    // Create Stripe transfer (using connected accounts or standard transfers)
    let transferResult = {
      id: null,
      status: 'pending',
      reference: null
    };

    try {
      // For bank transfers, create a Stripe payout
      if (withdrawMethod === 'bank') {
        const payout = await stripe.payouts.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'php',
          method: 'bank_account',
          destination: 'default', // Uses default payout method - adjust for your setup
          description: `Withdrawal for ${accountName}`,
          metadata: {
            base44_app_id: Deno.env.get('BASE44_APP_ID'),
            user_email: user.email,
            ledger_id: ledgerEntry.id,
            account_name: accountName,
            account_number: bankAccount,
          }
        });

        transferResult = {
          id: payout.id,
          status: payout.status,
          reference: payout.id
        };
      }

      // Update ledger with Stripe reference
      await base44.asServiceRole.entities.WalletLedger.update(ledgerEntry.id, {
        reference_id: transferResult.reference || 'paymongo-' + Date.now(),
        status: 'confirmed'
      });

      // Deduct from wallet balance
      await base44.asServiceRole.entities.Wallet.update(wallet.id, {
        balance: wallet.balance - amount
      });

      console.log(`Withdrawal processed for ${user.email}: ${amount} PHP via ${withdrawMethod}, Stripe ref: ${transferResult.id}`);

      return Response.json({
        success: true,
        withdrawalId: ledgerEntry.id,
        stripeReference: transferResult.id,
        message: 'Withdrawal request submitted successfully',
      });
    } catch (stripeError) {
      console.error('Stripe transfer error:', stripeError);
      
      // Update ledger as failed
      await base44.asServiceRole.entities.WalletLedger.update(ledgerEntry.id, {
        status: 'failed',
        notes: `${withdrawMethod.toUpperCase()} withdrawal - FAILED: ${stripeError.message}`
      });

      throw new Error(`Stripe processing failed: ${stripeError.message}`);
    }
  } catch (error) {
    console.error('Wallet withdrawal error:', error);
    return Response.json(
      { error: error.message || 'Withdrawal processing failed' },
      { status: 500 }
    );
  }
});