import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Starting AI-powered price monitoring...');
    
    let results = {
      flightAlertsChecked: 0,
      hotelAlertsChecked: 0,
      notificationsSent: 0,
      errors: []
    };

    // Get all active flight alerts
    const flightAlerts = await base44.asServiceRole.entities.PriceAlert.filter({ is_active: true });
    results.flightAlertsChecked = flightAlerts.length;

    for (const alert of flightAlerts) {
      try {
        // Get current flight price
        const flight = await base44.asServiceRole.entities.Flight.get(alert.flight_id);
        
        if (!flight) continue;

        const cabinClass = flight.cabin_classes?.find(c => c.class === alert.cabin_class);
        if (!cabinClass) continue;

        const currentPrice = cabinClass.price;

        // Use AI to analyze price trends and predict if it's a good deal
        const aiAnalysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this flight price data:
          
Route: ${alert.route}
Current Price: $${currentPrice}
Target Price: $${alert.target_price}
Previous Price: $${alert.current_price}
Cabin Class: ${alert.cabin_class}

Based on typical flight pricing patterns, is this a significant price drop? Should we alert the user?
Respond with JSON: {"should_alert": boolean, "savings_percentage": number, "recommendation": string}`,
          response_json_schema: {
            type: "object",
            properties: {
              should_alert: { type: "boolean" },
              savings_percentage: { type: "number" },
              recommendation: { type: "string" }
            }
          }
        });

        // Update current price
        await base44.asServiceRole.entities.PriceAlert.update(alert.id, {
          current_price: currentPrice,
          last_checked: new Date().toISOString()
        });

        // Send notification if price dropped and AI recommends it
        if (currentPrice <= alert.target_price && !alert.notified && aiAnalysis.should_alert) {
          const savings = alert.current_price - currentPrice;
          
          // Create notification
          await base44.asServiceRole.entities.Notification.create({
            user_email: alert.user_email,
            title: '🎉 Price Drop Alert!',
            message: `${alert.route} dropped to $${currentPrice}! You save $${savings.toFixed(2)} (${aiAnalysis.savings_percentage}%). ${aiAnalysis.recommendation}`,
            type: 'info',
            link: `/flights?flight_id=${alert.flight_id}`
          });

          // Send email
          await base44.integrations.Core.SendEmail({
            to: alert.user_email,
            subject: `Price Alert: ${alert.route} dropped to $${currentPrice}`,
            body: `Great news! The flight you're tracking has dropped in price.

Route: ${alert.route}
New Price: $${currentPrice}
Your Target: $${alert.target_price}
Savings: $${savings.toFixed(2)} (${aiAnalysis.savings_percentage}%)

AI Recommendation: ${aiAnalysis.recommendation}

Book now: ${Deno.env.get('APP_URL') || 'https://gctravelandtours.com'}/flights?flight_id=${alert.flight_id}

- GC Travel & Tours`
          });

          await base44.asServiceRole.entities.PriceAlert.update(alert.id, { notified: true });
          results.notificationsSent++;
        }

      } catch (error) {
        console.error('Flight alert error:', error);
        results.errors.push({ type: 'flight', alert_id: alert.id, error: error.message });
      }
    }

    // Get all active hotel alerts
    const hotelAlerts = await base44.asServiceRole.entities.HotelPriceAlert.filter({ is_active: true });
    results.hotelAlertsChecked = hotelAlerts.length;

    for (const alert of hotelAlerts) {
      try {
        const hotel = await base44.asServiceRole.entities.Hotel.get(alert.hotel_id);
        
        if (!hotel) continue;

        const roomType = hotel.room_types?.find(r => r.type === alert.room_type);
        if (!roomType) continue;

        const currentPrice = roomType.price_per_night;

        // AI analysis for hotel pricing
        const aiAnalysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this hotel price data:
          
Hotel: ${alert.hotel_name}
Location: ${alert.location}
Room Type: ${alert.room_type}
Current Price: $${currentPrice}/night
Target Price: $${alert.target_price}
Previous Price: $${alert.current_price}
Check-in: ${alert.check_in_date}
Check-out: ${alert.check_out_date}

Is this a good deal? Should we alert the user?
Respond with JSON: {"should_alert": boolean, "savings_percentage": number, "recommendation": string}`,
          response_json_schema: {
            type: "object",
            properties: {
              should_alert: { type: "boolean" },
              savings_percentage: { type: "number" },
              recommendation: { type: "string" }
            }
          }
        });

        await base44.asServiceRole.entities.HotelPriceAlert.update(alert.id, {
          current_price: currentPrice,
          last_checked: new Date().toISOString()
        });

        if (currentPrice <= alert.target_price && !alert.notified && aiAnalysis.should_alert) {
          const savings = alert.current_price - currentPrice;
          
          await base44.asServiceRole.entities.Notification.create({
            user_email: alert.user_email,
            title: '🏨 Hotel Price Drop!',
            message: `${alert.hotel_name} dropped to $${currentPrice}/night! Save $${savings.toFixed(2)} (${aiAnalysis.savings_percentage}%). ${aiAnalysis.recommendation}`,
            type: 'info',
            link: `/hotels?hotel_id=${alert.hotel_id}`
          });

          await base44.integrations.Core.SendEmail({
            to: alert.user_email,
            subject: `Price Alert: ${alert.hotel_name} dropped to $${currentPrice}/night`,
            body: `Great news! The hotel you're tracking has dropped in price.

Hotel: ${alert.hotel_name}
Location: ${alert.location}
Room: ${alert.room_type}
New Price: $${currentPrice}/night
Your Target: $${alert.target_price}
Savings: $${savings.toFixed(2)} (${aiAnalysis.savings_percentage}%)

Check-in: ${alert.check_in_date}
Check-out: ${alert.check_out_date}

AI Recommendation: ${aiAnalysis.recommendation}

Book now: ${Deno.env.get('APP_URL') || 'https://gctravelandtours.com'}/hotels?hotel_id=${alert.hotel_id}

- GC Travel & Tours`
          });

          await base44.asServiceRole.entities.HotelPriceAlert.update(alert.id, { notified: true });
          results.notificationsSent++;
        }

      } catch (error) {
        console.error('Hotel alert error:', error);
        results.errors.push({ type: 'hotel', alert_id: alert.id, error: error.message });
      }
    }

    console.log('Price monitoring completed:', results);

    return Response.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Price Monitor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});