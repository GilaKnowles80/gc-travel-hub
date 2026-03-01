import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ─── Phase 14: Multi-Currency Revenue Ledger ──────────────────────────────────
// Records revenue per currency after conversion
// Supports: PHP, USD, SGD, EUR, AUD, GBP, JPY, HKD

const SUPPORTED_CURRENCIES = ['PHP', 'USD', 'SGD', 'EUR', 'AUD', 'GBP', 'JPY', 'HKD'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, bookingId, bookingType, amount, sourceCurrency, userCountry } = await req.json();

    // ── Action: get_display_currency ─────────────────────────────────────
    // Phase 14 Step 1: Detect user location → return display currency
    if (action === 'get_display_currency') {
      const countryToCurrency = {
        PH: 'PHP', US: 'USD', SG: 'SGD', GB: 'GBP',
        AU: 'AUD', JP: 'JPY', HK: 'HKD', EU: 'EUR',
        DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR',
        CA: 'CAD', NZ: 'NZD', KR: 'KRW', TW: 'TWD'
      };

      const displayCurrency = countryToCurrency[userCountry] || 'PHP';
      console.log(`[MULTI-CURRENCY] Country: ${userCountry} → Currency: ${displayCurrency}`);

      // Fetch current exchange rate
      let exchangeRate = 1;
      if (displayCurrency !== 'PHP') {
        try {
          const apiKey = Deno.env.get('EXCHANGERATE_API_KEY');
          const rateRes = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/PHP/${displayCurrency}`);
          const rateData = await rateRes.json();
          exchangeRate = rateData.conversion_rate || 1;
        } catch (err) {
          console.error('[FX RATE] Error:', err.message);
        }
      }

      return Response.json({
        display_currency: displayCurrency,
        exchange_rate_from_php: exchangeRate,
        supported_currencies: SUPPORTED_CURRENCIES
      });
    }

    // ── Action: record_ledger ─────────────────────────────────────────────
    // Phase 14 Step 4: Record revenue in per-currency ledger
    if (action === 'record_ledger') {
      if (!bookingId || !amount || !sourceCurrency) {
        return Response.json({ error: 'Missing bookingId, amount, or sourceCurrency' }, { status: 400 });
      }

      // Convert to PHP for unified accounting
      let phpAmount = amount;
      let exchangeRate = 1;

      if (sourceCurrency !== 'PHP') {
        try {
          const apiKey = Deno.env.get('EXCHANGERATE_API_KEY');
          const rateRes = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${sourceCurrency}/PHP`);
          const rateData = await rateRes.json();
          exchangeRate = rateData.conversion_rate || 1;
          phpAmount = parseFloat((amount * exchangeRate).toFixed(2));
        } catch (err) {
          console.error('[FX RATE] Conversion error:', err.message);
        }
      }

      // Revenue split in PHP
      const supplierPHP   = parseFloat((phpAmount * 0.80).toFixed(2));
      const agencyPHP     = parseFloat((phpAmount * 0.20).toFixed(2));
      const stripeFeesPHP = parseFloat((phpAmount * 0.029).toFixed(2));
      const netProfitPHP  = parseFloat((agencyPHP - stripeFeesPHP).toFixed(2));

      // Record in CurrencyRate entity for audit trail
      await base44.asServiceRole.entities.CurrencyRate.create({
        booking_id: bookingId,
        source_currency: sourceCurrency,
        target_currency: 'PHP',
        exchange_rate: exchangeRate,
        original_amount: amount,
        converted_amount: phpAmount,
        recorded_date: new Date().toISOString()
      }).catch(err => console.error('CurrencyRate log error:', err.message));

      console.log(`[MULTI-CURRENCY LEDGER] ${amount} ${sourceCurrency} → ${phpAmount} PHP | Net Profit: ${netProfitPHP} PHP`);

      return Response.json({
        success: true,
        source_currency: sourceCurrency,
        source_amount: amount,
        exchange_rate: exchangeRate,
        php_equivalent: phpAmount,
        revenue_split: {
          supplier_php: supplierPHP,
          agency_php: agencyPHP,
          stripe_fees_php: stripeFeesPHP,
          net_profit_php: netProfitPHP
        },
        ledger_recorded: true
      });
    }

    // ── Action: get_summary ───────────────────────────────────────────────
    // Return multi-currency revenue summary for admin
    if (action === 'get_summary') {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Admin only' }, { status: 403 });
      }

      const rates = await base44.asServiceRole.entities.CurrencyRate.list('-recorded_date', 500);

      const byCurrency = {};
      rates.forEach(r => {
        const cur = r.source_currency || 'PHP';
        if (!byCurrency[cur]) byCurrency[cur] = { currency: cur, total_original: 0, total_php: 0, count: 0 };
        byCurrency[cur].total_original += r.original_amount || 0;
        byCurrency[cur].total_php += r.converted_amount || 0;
        byCurrency[cur].count += 1;
      });

      return Response.json({
        success: true,
        currency_breakdown: Object.values(byCurrency),
        total_transactions: rates.length
      });
    }

    return Response.json({ error: 'Invalid action. Use: get_display_currency | record_ledger | get_summary' }, { status: 400 });

  } catch (error) {
    console.error('[MULTI-CURRENCY ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});