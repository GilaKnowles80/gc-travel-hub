import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { itemType, itemId, basePrice, departureDate, bookingDate } = await req.json();

    if (!itemType || !basePrice) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let finalPrice = basePrice;
    const adjustments = [];

    // Fetch active pricing rules
    const rules = await base44.entities.PricingRule.filter({ 
      status: 'active',
      item_type: itemType 
    });

    const now = new Date();
    const departure = departureDate ? new Date(departureDate) : null;
    const booking = bookingDate ? new Date(bookingDate) : now;

    for (const rule of rules) {
      let applies = false;
      let adjustment = 0;

      // Check seasonality
      if (rule.rule_type === 'seasonal' && departure) {
        const month = departure.getMonth() + 1;
        if (rule.season_months && rule.season_months.includes(month)) {
          applies = true;
          adjustment = rule.adjustment_type === 'percentage' 
            ? (finalPrice * rule.adjustment_value) / 100 
            : rule.adjustment_value;
        }
      }

      // Check advance booking
      if (rule.rule_type === 'advance_booking' && departure) {
        const daysInAdvance = Math.floor((departure - booking) / (1000 * 60 * 60 * 24));
        if (daysInAdvance >= rule.min_days_advance) {
          applies = true;
          adjustment = rule.adjustment_type === 'percentage' 
            ? (finalPrice * rule.adjustment_value) / 100 
            : rule.adjustment_value;
        }
      }

      // Check demand-based (simulated based on day of week)
      if (rule.rule_type === 'demand' && departure) {
        const dayOfWeek = departure.getDay();
        // Weekend premium (Friday, Saturday, Sunday)
        if ([5, 6, 0].includes(dayOfWeek) && rule.demand_level === 'high') {
          applies = true;
          adjustment = rule.adjustment_type === 'percentage' 
            ? (finalPrice * rule.adjustment_value) / 100 
            : rule.adjustment_value;
        }
      }

      // Check last-minute
      if (rule.rule_type === 'last_minute' && departure) {
        const daysUntilDeparture = Math.floor((departure - now) / (1000 * 60 * 60 * 24));
        if (daysUntilDeparture <= rule.max_days_before) {
          applies = true;
          adjustment = rule.adjustment_type === 'percentage' 
            ? (finalPrice * rule.adjustment_value) / 100 
            : rule.adjustment_value;
        }
      }

      if (applies) {
        if (rule.is_increase) {
          finalPrice += adjustment;
        } else {
          finalPrice -= adjustment;
        }

        adjustments.push({
          rule_name: rule.rule_name,
          rule_type: rule.rule_type,
          adjustment: adjustment,
          is_increase: rule.is_increase
        });
      }
    }

    // Ensure price doesn't go below minimum
    finalPrice = Math.max(finalPrice, basePrice * 0.5); // Min 50% of base

    return Response.json({
      base_price: basePrice,
      final_price: Math.round(finalPrice * 100) / 100,
      adjustments,
      total_adjustment: Math.round((finalPrice - basePrice) * 100) / 100
    });

  } catch (error) {
    console.error('Calculate dynamic price error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});