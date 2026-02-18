import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { basePrice, countryCode, latitude, longitude } = await req.json();

    if (!basePrice) {
      return Response.json({ error: 'Base price is required' }, { status: 400 });
    }

    // Default multiplier
    let priceMultiplier = 1.0;
    let locationInfo = {
      country_code: countryCode || 'US',
      country_name: 'Unknown',
      region: 'unknown',
      applied_multiplier: 1.0
    };

    // If country code provided, look up pricing rules
    if (countryCode) {
      try {
        const pricingRules = await base44.asServiceRole.entities.LocationPricing.filter({
          country_code: countryCode.toUpperCase(),
          is_active: true
        });

        if (pricingRules && pricingRules.length > 0) {
          const rule = pricingRules[0];
          priceMultiplier = rule.price_multiplier || 1.0;
          locationInfo = {
            country_code: rule.country_code,
            country_name: rule.country_name || countryCode,
            region: rule.region,
            applied_multiplier: priceMultiplier,
            currency_code: rule.currency_code
          };
        } else {
          // Apply default regional pricing if no specific rule
          const regionDefaults = {
            'PH': 1.0,  // Philippines - base
            'US': 1.3,  // USA - 30% higher
            'GB': 1.25, // UK - 25% higher
            'AU': 1.2,  // Australia - 20% higher
            'CA': 1.25, // Canada - 25% higher
            'JP': 1.15, // Japan - 15% higher
            'CN': 1.1,  // China - 10% higher
            'IN': 0.9,  // India - 10% lower
            'SG': 1.2,  // Singapore - 20% higher
            'MY': 1.0,  // Malaysia - base
            'TH': 0.95, // Thailand - 5% lower
            'VN': 0.9,  // Vietnam - 10% lower
          };

          priceMultiplier = regionDefaults[countryCode.toUpperCase()] || 1.0;
          locationInfo.applied_multiplier = priceMultiplier;
        }
      } catch (error) {
        console.error('Error fetching pricing rules:', error);
        // Continue with default multiplier
      }
    }

    const adjustedPrice = basePrice * priceMultiplier;

    return Response.json({
      base_price: basePrice,
      adjusted_price: Math.round(adjustedPrice * 100) / 100,
      price_multiplier: priceMultiplier,
      location: locationInfo,
      savings: priceMultiplier < 1.0 ? Math.round((basePrice - adjustedPrice) * 100) / 100 : null,
      extra_cost: priceMultiplier > 1.0 ? Math.round((adjustedPrice - basePrice) * 100) / 100 : null
    });
  } catch (error) {
    console.error('Location pricing calculation error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return Response.json({ error: error.message }, { status: 500 });
  }
});