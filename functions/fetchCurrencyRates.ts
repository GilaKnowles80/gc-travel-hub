import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'JPY', 'SGD', 'AUD'];
const BASE_CURRENCY = 'PHP';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch rates from exchangerate-api
    const apiKey = Deno.env.get('EXCHANGERATE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${BASE_CURRENCY}`
    );

    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch rates' }, { status: 500 });
    }

    const data = await response.json();
    
    if (data.result !== 'success') {
      return Response.json({ error: data['error-type'] }, { status: 500 });
    }

    // Store/update rates in database
    for (const targetCurrency of SUPPORTED_CURRENCIES) {
      const rate = data.conversion_rates[targetCurrency];
      
      if (rate) {
        // Check if rate exists
        const existing = await base44.asServiceRole.entities.CurrencyRate.filter({
          base_currency: BASE_CURRENCY,
          target_currency: targetCurrency
        });

        if (existing.length > 0) {
          // Update existing rate
          await base44.asServiceRole.entities.CurrencyRate.update(existing[0].id, {
            rate,
            last_updated: new Date().toISOString()
          });
        } else {
          // Create new rate
          await base44.asServiceRole.entities.CurrencyRate.create({
            base_currency: BASE_CURRENCY,
            target_currency: targetCurrency,
            rate,
            last_updated: new Date().toISOString()
          });
        }
      }
    }

    const allRates = await base44.asServiceRole.entities.CurrencyRate.list();
    return Response.json({ success: true, rates: allRates });
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});