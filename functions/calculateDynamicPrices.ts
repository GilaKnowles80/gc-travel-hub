import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { product_type, product_id, base_price, date, destination } = await req.json();

    // Get competitor data via LLM web search
    const competitorResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Find current pricing for ${product_type} in ${destination} for ${date}. Search for competitor prices from major OTAs.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          competitor_prices: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source: { type: 'string' },
                price: { type: 'number' }
              }
            }
          },
          demand_level: { type: 'string', enum: ['low', 'medium', 'high', 'very_high'] },
          market_analysis: { type: 'string' }
        }
      }
    });

    // Calculate average competitor price
    const competitorPrices = competitorResponse.competitor_prices || [];
    const avgCompetitorPrice = competitorPrices.length > 0
      ? competitorPrices.reduce((sum, p) => sum + p.price, 0) / competitorPrices.length
      : base_price;

    // Demand-based multiplier
    const demandMultipliers = {
      low: 0.85,
      medium: 1.0,
      high: 1.15,
      very_high: 1.3
    };
    const demandMultiplier = demandMultipliers[competitorResponse.demand_level] || 1.0;

    // Check how many bookings for similar dates
    let recentBookings = 0;
    try {
      const bookings = await base44.entities.Booking.filter({
        departure_date: { $regex: date?.substring(0, 7) }
      });
      recentBookings = bookings.length;
    } catch {
      recentBookings = 0;
    }

    // Calculate final dynamic price
    const competitivenessAdjustment = avgCompetitorPrice > 0 
      ? 1 + (Math.min(avgCompetitorPrice - base_price, base_price * 0.2) / base_price)
      : 1.0;

    const dynamicPrice = Math.round(base_price * demandMultiplier * competitivenessAdjustment * 100) / 100;
    const priceChange = dynamicPrice - base_price;
    const priceChangePercent = Math.round((priceChange / base_price) * 100);

    return Response.json({
      success: true,
      base_price,
      dynamic_price: dynamicPrice,
      price_change: priceChange,
      price_change_percent: priceChangePercent,
      demand_level: competitorResponse.demand_level,
      avg_competitor_price: Math.round(avgCompetitorPrice * 100) / 100,
      reason: `${competitorResponse.demand_level} demand detected. ${priceChangePercent > 0 ? 'Price increased' : 'Price decreased'} based on market conditions.`,
      is_discounted: priceChangePercent < 0,
      competitiveness: base_price < avgCompetitorPrice ? 'competitive' : 'premium'
    });
  } catch (error) {
    console.error('Dynamic Pricing Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});