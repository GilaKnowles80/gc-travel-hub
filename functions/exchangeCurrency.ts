import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { from_currency, to_currency, amount } = await req.json();

    if (!from_currency || !to_currency || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch live exchange rates (mock data, integrate with real API)
    const rates = {
      'PHP_USD': 0.018,
      'PHP_EUR': 0.0166,
      'USD_PHP': 55.5,
      'EUR_PHP': 60.25,
      'GBP_PHP': 69.8,
      'SGD_PHP': 41.3,
      'JPY_PHP': 0.38,
      'CNY_PHP': 7.7,
    };

    const rateKey = `${from_currency}_${to_currency}`;
    const rate = rates[rateKey] || 1;
    const convertedAmount = amount * rate;

    // Deduct from source currency account
    const fromAccounts = await base44.entities.CurrencyAccount.filter({
      user_email: user.email,
      currency: from_currency,
    });

    if (!fromAccounts.length) {
      return Response.json({ error: `No ${from_currency} account found` }, { status: 400 });
    }

    const fromAccount = fromAccounts[0];
    if (fromAccount.balance < amount) {
      return Response.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Update source account
    await base44.entities.CurrencyAccount.update(fromAccount.id, {
      balance: fromAccount.balance - amount,
    });

    // Add to destination account or create if not exists
    let toAccounts = await base44.entities.CurrencyAccount.filter({
      user_email: user.email,
      currency: to_currency,
    });

    if (toAccounts.length) {
      await base44.entities.CurrencyAccount.update(toAccounts[0].id, {
        balance: toAccounts[0].balance + convertedAmount,
      });
    } else {
      await base44.entities.CurrencyAccount.create({
        user_email: user.email,
        currency: to_currency,
        balance: convertedAmount,
      });
    }

    // Log transaction
    await base44.entities.WalletTransaction.create({
      user_email: user.email,
      transaction_type: 'exchange',
      amount: convertedAmount,
      description: `Exchanged ${amount} ${from_currency} to ${convertedAmount} ${to_currency} at rate ${rate}`,
      status: 'completed',
    });

    return Response.json({
      success: true,
      from: { currency: from_currency, amount },
      to: { currency: to_currency, amount: convertedAmount },
      rate,
    });
  } catch (error) {
    console.error('Exchange error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});