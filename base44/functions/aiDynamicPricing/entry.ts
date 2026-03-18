import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { supplier_id } = await req.json();

    if (!supplier_id) {
      return Response.json({ error: 'Supplier ID required' }, { status: 400 });
    }

    console.log('Starting AI dynamic pricing analysis for supplier:', supplier_id);

    // Get supplier settings
    const settings = await base44.asServiceRole.entities.AIPricingSettings.filter({ 
      supplier_id 
    }, '-created_date', 1);

    const config = settings[0] || {
      max_increase_percentage: 20,
      max_decrease_percentage: 30,
      min_confidence_score: 70,
      priority_metric: 'balanced'
    };

    if (!config.ai_enabled && settings.length > 0) {
      return Response.json({ 
        success: false, 
        message: 'AI pricing is disabled for this supplier' 
      });
    }

    // Get supplier inventory
    const inventory = await base44.asServiceRole.entities.SupplierInventory.filter({ 
      supplier_id 
    });

    console.log(`Found ${inventory.length} inventory items to analyze`);

    // Get historical bookings for this supplier
    const supplier = await base44.asServiceRole.entities.Supplier.get(supplier_id);
    const allBookings = [
      ...(await base44.asServiceRole.entities.FlightBooking.filter({ 
        supplier: supplier.company_name 
      })),
      ...(await base44.asServiceRole.entities.HotelBooking.filter({ 
        supplier: supplier.company_name 
      })),
      ...(await base44.asServiceRole.entities.Booking.filter({ 
        supplier: supplier.company_name 
      }))
    ];

    const suggestions = [];

    for (const item of inventory) {
      try {
        // Get similar items for competitor analysis
        const similarItems = await base44.asServiceRole.entities.SupplierInventory.filter({
          item_type: item.item_type
        }, '-created_date', 10);

        // Prepare data for AI analysis
        const currentMonth = new Date().getMonth();
        const currentDate = new Date().toISOString().split('T')[0];

        const analysisPrompt = `Analyze this travel inventory pricing and provide dynamic pricing recommendations:

ITEM DETAILS:
- Type: ${item.item_type}
- Name: ${item.item_name}
- Current Price: $${item.current_price || 'Not Set'}
- Availability: ${item.availability}/${item.total_capacity}
- Date Range: ${item.date_range_start} to ${item.date_range_end}

SUPPLIER GOALS:
- Priority: ${config.priority_metric} (revenue vs bookings)
- Max Increase: ${config.max_increase_percentage}%
- Max Decrease: ${config.max_decrease_percentage}%

MARKET CONTEXT:
- Current Month: ${currentMonth + 1} (1=Jan, 12=Dec)
- Date: ${currentDate}
- Historical Bookings: ${allBookings.filter(b => b.created_date > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()).length} in last 90 days
- Competitor Items: ${similarItems.length} similar items in market

ANALYZE:
1. Demand forecast (considering seasonality, month, availability)
2. Optimal pricing strategy
3. Revenue and booking impact predictions

Respond with JSON:`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: analysisPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              suggested_price: { type: "number" },
              confidence_score: { type: "number" },
              reasoning: { type: "string" },
              demand_forecast: { 
                type: "string",
                enum: ["low", "medium", "high", "very_high"]
              },
              seasonality_factor: { type: "string" },
              competitor_insights: { type: "string" },
              revenue_impact_percentage: { type: "number" },
              booking_impact_percentage: { type: "number" }
            }
          }
        });

        // Validate suggested price within limits
        const currentPrice = item.current_price || 100;
        const maxIncrease = currentPrice * (1 + config.max_increase_percentage / 100);
        const maxDecrease = currentPrice * (1 - config.max_decrease_percentage / 100);
        
        let suggestedPrice = aiResponse.suggested_price;
        if (suggestedPrice > maxIncrease) suggestedPrice = maxIncrease;
        if (suggestedPrice < maxDecrease) suggestedPrice = maxDecrease;

        const priceChange = ((suggestedPrice - currentPrice) / currentPrice) * 100;

        // Only create suggestion if confidence meets threshold
        if (aiResponse.confidence_score >= config.min_confidence_score) {
          const suggestion = await base44.asServiceRole.entities.AIPricingSuggestion.create({
            supplier_id,
            inventory_id: item.id,
            item_name: item.item_name,
            item_type: item.item_type,
            current_price: currentPrice,
            suggested_price: Math.round(suggestedPrice * 100) / 100,
            price_change_percentage: Math.round(priceChange * 100) / 100,
            confidence_score: aiResponse.confidence_score,
            reasoning: aiResponse.reasoning,
            demand_forecast: aiResponse.demand_forecast,
            seasonality_factor: aiResponse.seasonality_factor,
            competitor_insights: aiResponse.competitor_insights,
            revenue_impact: aiResponse.revenue_impact_percentage,
            booking_impact: aiResponse.booking_impact_percentage,
            valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });

          suggestions.push(suggestion);

          // Auto-apply if enabled and confidence is very high
          if (config.auto_apply && aiResponse.confidence_score >= 85) {
            await base44.asServiceRole.entities.SupplierInventory.update(item.id, {
              current_price: suggestedPrice
            });

            await base44.asServiceRole.entities.AIPricingSuggestion.update(suggestion.id, {
              status: 'applied'
            });

            console.log(`Auto-applied pricing for ${item.item_name}: $${currentPrice} → $${suggestedPrice}`);
          }
        }

      } catch (error) {
        console.error(`Error analyzing ${item.item_name}:`, error.message);
      }
    }

    // Send summary notification to supplier
    if (suggestions.length > 0) {
      await base44.asServiceRole.entities.Notification.create({
        user_email: supplier.email,
        title: '🤖 AI Pricing Suggestions Ready',
        message: `${suggestions.length} new pricing suggestions available. Review them in your dashboard.`,
        type: 'info',
        link: '/supplier-dashboard'
      }).catch(console.error);
    }

    return Response.json({
      success: true,
      suggestions_created: suggestions.length,
      auto_applied: suggestions.filter(s => s.status === 'applied').length,
      message: `Generated ${suggestions.length} pricing suggestions`
    });

  } catch (error) {
    console.error('AI Dynamic Pricing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});