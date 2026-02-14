import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { item_id, item_type, base_price, departure_date } = await req.json();

    if (!item_id || !item_type || !base_price) {
      return Response.json(
        { error: 'Missing required parameters: item_id, item_type, base_price' },
        { status: 400 }
      );
    }

    // Fetch all active pricing rules
    const rules = await base44.asServiceRole.entities.PricingRule.list("-created_date", 100);
    const activeRules = rules.filter(r => r.is_active);

    let multiplier = 1;
    const appliedRules = [];
    const today = new Date();

    // Calculate booking window in days
    const depDate = new Date(departure_date);
    const bookingWindowDays = Math.floor((depDate - today) / (1000 * 60 * 60 * 24));

    // Check each rule against conditions
    for (const rule of activeRules) {
      // Check if rule applies to this item type
      if (rule.item_type !== item_type) continue;

      // Check date range
      const startDate = new Date(rule.start_date);
      const endDate = new Date(rule.end_date);
      if (today < startDate || today > endDate) continue;

      // Check booking window condition
      if (rule.conditions?.min_booking_window_days && bookingWindowDays < rule.conditions.min_booking_window_days) {
        continue;
      }
      if (rule.conditions?.max_booking_window_days && bookingWindowDays > rule.conditions.max_booking_window_days) {
        continue;
      }

      // Apply the rule (use highest multiplier if multiple rules match)
      if (rule.multiplier > multiplier) {
        multiplier = rule.multiplier;
      }
      appliedRules.push(rule.id);
    }

    // Calculate final price
    const currentPrice = Math.round(base_price * multiplier * 100) / 100;
    const discountPercent = multiplier < 1 ? Math.round((1 - multiplier) * 100) : 0;

    return Response.json({
      item_id,
      item_type,
      base_price,
      current_price: currentPrice,
      price_multiplier: multiplier,
      discount_percent: discountPercent,
      applicable_rules: appliedRules,
      calculation_date: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error calculating dynamic price:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});