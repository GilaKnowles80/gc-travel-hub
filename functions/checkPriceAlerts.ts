import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all active alerts
    const alerts = await base44.asServiceRole.entities.PriceAlert.filter({ 
      is_active: true, 
      notified: false 
    });

    console.log(`Checking ${alerts.length} active price alerts`);

    let notifiedCount = 0;

    for (const alert of alerts) {
      try {
        // Get current flight price
        const flights = await base44.asServiceRole.entities.Flight.filter({ id: alert.flight_id });
        const flight = flights[0];

        if (!flight) {
          console.log(`Flight ${alert.flight_id} not found, skipping alert ${alert.id}`);
          continue;
        }

        const cabin = flight.cabin_classes?.find(c => c.class === alert.cabin_class);
        if (!cabin) {
          console.log(`Cabin class ${alert.cabin_class} not found for flight ${alert.flight_id}`);
          continue;
        }

        const currentPrice = cabin.price;
        
        // Update alert with current price and last checked time
        await base44.asServiceRole.entities.PriceAlert.update(alert.id, {
          current_price: currentPrice,
          last_checked: new Date().toISOString()
        });

        // Check if price has dropped to or below target
        if (currentPrice <= alert.target_price) {
          console.log(`Price alert triggered for ${alert.flight_number}: $${currentPrice} <= $${alert.target_price}`);
          
          // Send email notification
          const savingsAmount = alert.current_price - currentPrice;
          const savingsPercent = Math.round((savingsAmount / alert.current_price) * 100);

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: alert.user_email,
            subject: `🔔 Price Alert: ${alert.flight_number} price dropped!`,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f59e0b;">✈️ Great News! Your Price Alert Triggered</h2>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Flight ${alert.flight_number}</h3>
                  <p style="font-size: 18px; margin: 10px 0;">
                    <strong>Route:</strong> ${alert.route}
                  </p>
                  <p style="font-size: 18px; margin: 10px 0;">
                    <strong>Class:</strong> ${alert.cabin_class.replace('_', ' ')}
                  </p>
                </div>

                <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                  <h3 style="color: #16a34a; margin-top: 0;">💰 Price Dropped!</h3>
                  <p style="font-size: 24px; margin: 10px 0;">
                    <span style="text-decoration: line-through; color: #64748b;">$${alert.current_price.toLocaleString()}</span>
                    <strong style="color: #16a34a; margin-left: 10px;">$${currentPrice.toLocaleString()}</strong>
                  </p>
                  <p style="font-size: 18px; color: #16a34a;">
                    You save <strong>$${savingsAmount.toLocaleString()}</strong> (${savingsPercent}%)!
                  </p>
                </div>

                <div style="margin: 30px 0;">
                  <a href="${Deno.env.get('VITE_APP_URL') || 'https://your-app-url.base44.com'}/FlightDetail?id=${alert.flight_id}" 
                     style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            display: inline-block;
                            font-weight: bold;">
                    Book This Flight Now
                  </a>
                </div>

                <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                  This price alert has been automatically deactivated. You can set new alerts anytime from the flight details page.
                </p>
              </div>
            `
          });

          // Mark alert as notified
          await base44.asServiceRole.entities.PriceAlert.update(alert.id, {
            notified: true,
            is_active: false
          });

          notifiedCount++;
        }
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
      }
    }

    return Response.json({
      success: true,
      message: `Checked ${alerts.length} alerts, sent ${notifiedCount} notifications`,
      checked: alerts.length,
      notified: notifiedCount
    });

  } catch (error) {
    console.error("Error checking price alerts:", error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});