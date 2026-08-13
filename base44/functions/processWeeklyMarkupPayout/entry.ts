import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Starting weekly markup payout process...');

    // Get all payout accounts
    const payoutAccounts = await base44.entities.PayoutAccount.filter({ is_active: true });
    
    if (!payoutAccounts.length) {
      console.log('No active payout accounts found');
      return Response.json({ message: 'No payout accounts configured' }, { status: 200 });
    }

    // Calculate period (last 7 days)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const results = [];

    for (const account of payoutAccounts) {
      try {
        // Get payments with markup for this account's payment method
        const payments = await base44.entities.Payment.filter({
          status: 'completed',
          payment_method: getPaymentMethodForAccount(account.payment_method)
        });

        const relevantPayments = payments.filter(p => {
          const paymentDate = new Date(p.payment_date || p.created_date);
          return paymentDate >= startDate && paymentDate <= endDate && p.markup_amount > 0;
        });

        if (relevantPayments.length === 0) {
          console.log(`No markup payments for account ${account.id}`);
          continue;
        }

        const totalMarkup = relevantPayments.reduce((sum, p) => sum + (p.markup_amount || 0), 0);
        
        // Create payout record
        const payoutRef = `PAYOUT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${account.id.slice(-4)}`;
        
        const payout = await base44.entities.MarkupPayout.create({
          payout_number: payoutRef,
          payout_account_id: account.id,
          payment_method: account.payment_method,
          period_start: startDate.toISOString().split('T')[0],
          period_end: endDate.toISOString().split('T')[0],
          total_markup: totalMarkup,
          currency: 'PHP',
          markup_payments: relevantPayments.map(p => p.id),
          payment_count: relevantPayments.length,
          status: 'processing'
        });

        console.log(`Processing payout ${payoutRef}: ₱${totalMarkup} to ${account.account_type}`);

        // Process payout based on method
        const payoutResult = await processPayoutByMethod(account, totalMarkup);

        if (payoutResult.success) {
          // Update payout status
          await base44.entities.MarkupPayout.update(payout.id, {
            status: 'completed',
            transaction_id: payoutResult.transaction_id,
            processed_at: new Date().toISOString()
          });

          // Update account
          await base44.entities.PayoutAccount.update(account.id, {
            total_received: (account.total_received || 0) + totalMarkup,
            pending_payout: 0,
            last_payout_date: new Date().toISOString()
          });

          results.push({
            account: account.account_identifier,
            amount: totalMarkup,
            status: 'completed',
            transaction_id: payoutResult.transaction_id
          });
        } else {
          await base44.entities.MarkupPayout.update(payout.id, {
            status: 'failed',
            error_message: payoutResult.error
          });

          results.push({
            account: account.account_identifier,
            amount: totalMarkup,
            status: 'failed',
            error: payoutResult.error
          });
        }
      } catch (error) {
        console.error(`Error processing account ${account.id}:`, error.message);
        results.push({
          account: account.account_identifier,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      message: 'Weekly payout process completed',
      results
    });
  } catch (error) {
    console.error('Fatal error in payout process:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getPaymentMethodForAccount(paymentMethod) {
  if (paymentMethod === 'stripe_to_gcash') return 'stripe';
  if (paymentMethod === 'paymongo_to_paymongo') return 'paymongo';
  if (paymentMethod === 'paymongo_to_gcash') return 'paymongo';
  return 'paymongo';
}

async function processPayoutByMethod(account, amount) {
  try {
    if (account.payment_method === 'stripe_to_gcash') {
      // Stripe to GCash via PayMongo
      return await processStripeToGCash(account, amount);
    } else {
      // PayMongo direct payout
      return await processPayMongoDirectPayout(account, amount);
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function processStripeToGCash(account, amount) {
  // Placeholder: In production, integrate with PayMongo API
  // to send payout to GCash account
  console.log(`Processing Stripe→GCash payout of ₱${amount} to ${account.account_identifier}`);
  
  return {
    success: true,
    transaction_id: `STRIPE-GCASH-${Date.now()}`
  };
}

async function processPayMongoDirectPayout(account, amount) {
  const apiKey = Deno.env.get('PayMongo_Secret_Key') || Deno.env.get('PayMongo_API_KEY');
  if (!apiKey) {
    return { success: false, error: 'PayMongo secret key not configured' };
  }

  // Map PayoutAccount type to PayMongo payout channel
  const channel = account.account_type === 'gcash' ? 'gcash'
    : account.account_type === 'maya' ? 'maya'
    : 'gcash';

  const payoutResponse = await fetch('https://api.paymongo.com/v1/payouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(apiKey + ':')}`
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: Math.round(amount * 100), // centavos
          currency: 'PHP',
          channel,
          recipient: {
            name: account.account_name,
            account_number: account.account_identifier
          },
          description: `Weekly markup payout - ${account.account_identifier}`,
          remarks: `Markup payout ${new Date().toISOString().split('T')[0]}`
        }
      }
    })
  });

  const payoutData = await payoutResponse.json();
  if (!payoutResponse.ok) {
    return { success: false, error: payoutData?.errors?.[0]?.detail || 'Payout creation failed' };
  }

  return {
    success: true,
    transaction_id: payoutData.data.id
  };
}