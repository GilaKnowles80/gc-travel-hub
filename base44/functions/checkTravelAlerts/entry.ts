import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        console.log('Starting travel alerts check...');

        // Get all active alert preferences
        const preferences = await base44.asServiceRole.entities.TravelAlertPreference.filter({
            is_active: true
        });

        console.log(`Checking alerts for ${preferences.length} users`);

        const alertsCreated = [];

        for (const pref of preferences) {
            try {
                // Check if in quiet hours
                if (pref.quiet_hours?.enabled) {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const startHour = parseInt(pref.quiet_hours.start_time.split(':')[0]);
                    const endHour = parseInt(pref.quiet_hours.end_time.split(':')[0]);
                    
                    if (currentHour >= startHour || currentHour < endHour) {
                        console.log(`Skipping ${pref.user_email} - quiet hours`);
                        continue;
                    }
                }

                // 1. Check price alerts for watched flights
                if (pref.alert_types?.price_drops || pref.alert_types?.price_increases) {
                    const priceAlerts = await base44.asServiceRole.entities.PriceAlert.filter({
                        user_email: pref.user_email,
                        is_active: true
                    });

                    for (const alert of priceAlerts) {
                        // Get current flight price
                        const flights = await base44.asServiceRole.entities.Flight.filter({
                            id: alert.item_id
                        });

                        if (flights.length > 0) {
                            const flight = flights[0];
                            const currentPrice = flight.base_price;
                            const targetPrice = alert.target_price;
                            const percentChange = ((currentPrice - targetPrice) / targetPrice) * 100;

                            // Price dropped
                            if (currentPrice < targetPrice && Math.abs(percentChange) >= pref.price_drop_threshold) {
                                if (pref.alert_types.price_drops) {
                                    const newAlert = await base44.asServiceRole.entities.TravelAlert.create({
                                        user_email: pref.user_email,
                                        alert_type: 'price_drop',
                                        severity: 'warning',
                                        title: `🎉 Price Drop Alert: ${flight.origin} → ${flight.destination}`,
                                        message: `Flight price dropped by ${Math.abs(percentChange).toFixed(0)}%! Now $${currentPrice} (was $${targetPrice})`,
                                        related_entity: {
                                            type: 'flight',
                                            id: flight.id
                                        },
                                        data: {
                                            old_price: targetPrice,
                                            new_price: currentPrice,
                                            savings: targetPrice - currentPrice,
                                            percent_change: percentChange
                                        },
                                        action_url: `/flights/${flight.id}`,
                                        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
                                        sent_via: pref.notification_channels.in_app ? ['in_app'] : []
                                    });

                                    alertsCreated.push(newAlert);

                                    // Send notification
                                    await base44.asServiceRole.entities.Notification.create({
                                        user_email: pref.user_email,
                                        title: `Price Drop: ${flight.origin} → ${flight.destination}`,
                                        message: `Flight price dropped to $${currentPrice}! Save $${(targetPrice - currentPrice).toFixed(2)}`,
                                        type: 'info',
                                        link: `/flights/${flight.id}`
                                    });
                                }
                            }
                            // Price increased
                            else if (currentPrice > targetPrice && pref.alert_types.price_increases) {
                                const newAlert = await base44.asServiceRole.entities.TravelAlert.create({
                                    user_email: pref.user_email,
                                    alert_type: 'price_increase',
                                    severity: 'info',
                                    title: `Price Increase: ${flight.origin} → ${flight.destination}`,
                                    message: `Flight price increased by ${Math.abs(percentChange).toFixed(0)}% to $${currentPrice}`,
                                    related_entity: {
                                        type: 'flight',
                                        id: flight.id
                                    },
                                    data: {
                                        old_price: targetPrice,
                                        new_price: currentPrice,
                                        increase: currentPrice - targetPrice,
                                        percent_change: percentChange
                                    },
                                    action_url: `/flights/${flight.id}`,
                                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                                    sent_via: ['in_app']
                                });

                                alertsCreated.push(newAlert);
                            }
                        }
                    }
                }

                // 2. Check upcoming bookings for delays/cancellations
                if (pref.alert_types?.flight_delays || pref.alert_types?.flight_cancellations || pref.alert_types?.gate_changes) {
                    const bookings = await base44.asServiceRole.entities.FlightBooking.filter({
                        passenger_email: pref.user_email,
                        status: 'confirmed'
                    });

                    for (const booking of bookings) {
                        const flights = await base44.asServiceRole.entities.Flight.filter({
                            id: booking.flight_id
                        });

                        if (flights.length > 0) {
                            const flight = flights[0];
                            const departureDate = new Date(flight.departure_time);
                            const hoursUntilDeparture = (departureDate - new Date()) / (1000 * 60 * 60);

                            // Only alert for flights within advance notice window
                            if (hoursUntilDeparture > 0 && hoursUntilDeparture <= pref.advance_notice_hours) {
                                // Check for delays (mock - in production, integrate with flight status API)
                                if (flight.status === 'delayed' && pref.alert_types.flight_delays) {
                                    await base44.asServiceRole.entities.TravelAlert.create({
                                        user_email: pref.user_email,
                                        alert_type: 'flight_delay',
                                        severity: 'urgent',
                                        title: `⚠️ Flight Delay: ${flight.flight_number}`,
                                        message: `Your flight from ${flight.origin} to ${flight.destination} is delayed. Please check with airline for updates.`,
                                        related_entity: {
                                            type: 'booking',
                                            id: booking.id
                                        },
                                        data: {
                                            flight_number: flight.flight_number,
                                            original_time: flight.departure_time
                                        },
                                        action_url: `/my-bookings`,
                                        sent_via: ['in_app']
                                    });

                                    await base44.asServiceRole.entities.Notification.create({
                                        user_email: pref.user_email,
                                        title: `Flight Delay: ${flight.flight_number}`,
                                        message: `Your flight is delayed. Check your booking for updates.`,
                                        type: 'info',
                                        booking_id: booking.id,
                                        link: '/my-bookings'
                                    });
                                }

                                // Check for cancellations
                                if (flight.status === 'cancelled' && pref.alert_types.flight_cancellations) {
                                    await base44.asServiceRole.entities.TravelAlert.create({
                                        user_email: pref.user_email,
                                        alert_type: 'flight_cancellation',
                                        severity: 'critical',
                                        title: `🚨 Flight Cancelled: ${flight.flight_number}`,
                                        message: `Your flight from ${flight.origin} to ${flight.destination} has been cancelled. Please contact support immediately.`,
                                        related_entity: {
                                            type: 'booking',
                                            id: booking.id
                                        },
                                        data: {
                                            flight_number: flight.flight_number,
                                            departure_time: flight.departure_time
                                        },
                                        action_url: `/my-bookings`,
                                        sent_via: ['in_app']
                                    });

                                    await base44.asServiceRole.entities.Notification.create({
                                        user_email: pref.user_email,
                                        title: `Flight Cancelled: ${flight.flight_number}`,
                                        message: `URGENT: Your flight has been cancelled. Contact us immediately.`,
                                        type: 'booking_cancelled',
                                        booking_id: booking.id,
                                        link: '/my-bookings'
                                    });
                                }
                            }
                        }
                    }
                }

                // 3. Check for last-minute deals matching user preferences
                if (pref.alert_types?.last_minute_deals || pref.alert_types?.destination_deals) {
                    const userPreferences = await base44.asServiceRole.entities.UserFlightPreferences.filter({
                        user_email: pref.user_email
                    });

                    if (userPreferences.length > 0) {
                        const userPref = userPreferences[0];
                        const maxDaysAdvance = pref.deal_max_days_advance || 30;
                        const dealCutoffDate = new Date(Date.now() + maxDaysAdvance * 24 * 60 * 60 * 1000);

                        // Find flights with significant discounts
                        const allFlights = await base44.asServiceRole.entities.Flight.filter({
                            status: 'active'
                        });

                        for (const flight of allFlights) {
                            const departureDate = new Date(flight.departure_time);
                            const daysUntilDeparture = (departureDate - new Date()) / (1000 * 60 * 60 * 24);

                            // Last minute deal (within deal window)
                            if (daysUntilDeparture > 0 && daysUntilDeparture <= maxDaysAdvance) {
                                const isPreferredDestination = userPref.preferred_destinations?.includes(flight.destination);
                                const isDreamDestination = userPref.dream_destinations?.includes(flight.destination);
                                
                                // Check if price is below user's budget
                                const withinBudget = !userPref.budget_range || 
                                    (flight.base_price >= (userPref.budget_range.min || 0) && 
                                     flight.base_price <= (userPref.budget_range.max || Infinity));

                                if (withinBudget && (isPreferredDestination || isDreamDestination)) {
                                    // Check if we haven't alerted about this flight recently
                                    const recentAlerts = await base44.asServiceRole.entities.TravelAlert.filter({
                                        user_email: pref.user_email,
                                        alert_type: 'destination_deal',
                                        'related_entity.id': flight.id
                                    });

                                    const lastAlertDate = recentAlerts.length > 0 
                                        ? new Date(recentAlerts[0].created_date)
                                        : new Date(0);
                                    const hoursSinceLastAlert = (new Date() - lastAlertDate) / (1000 * 60 * 60);

                                    if (hoursSinceLastAlert > 24) {
                                        await base44.asServiceRole.entities.TravelAlert.create({
                                            user_email: pref.user_email,
                                            alert_type: isDreamDestination ? 'destination_deal' : 'last_minute_deal',
                                            severity: isDreamDestination ? 'warning' : 'info',
                                            title: `✈️ ${isDreamDestination ? 'Dream Destination' : 'Deal'}: ${flight.origin} → ${flight.destination}`,
                                            message: `${isDreamDestination ? '🌟 Your dream destination is available!' : 'Great deal found!'} From $${flight.base_price} - Departs in ${Math.round(daysUntilDeparture)} days`,
                                            related_entity: {
                                                type: 'flight',
                                                id: flight.id
                                            },
                                            data: {
                                                price: flight.base_price,
                                                days_until_departure: Math.round(daysUntilDeparture),
                                                is_dream_destination: isDreamDestination
                                            },
                                            action_url: `/flights/${flight.id}`,
                                            expires_at: departureDate.toISOString(),
                                            sent_via: ['in_app']
                                        });

                                        await base44.asServiceRole.entities.Notification.create({
                                            user_email: pref.user_email,
                                            title: `Deal Alert: ${flight.destination}`,
                                            message: `${isDreamDestination ? '🌟 Dream destination available!' : 'Great deal found!'} From $${flight.base_price}`,
                                            type: 'info',
                                            link: `/flights/${flight.id}`
                                        });

                                        alertsCreated.push({ destination: flight.destination, price: flight.base_price });
                                    }
                                }
                            }
                        }
                    }
                }

            } catch (userError) {
                console.error(`Error processing alerts for ${pref.user_email}:`, userError);
            }
        }

        console.log(`Travel alerts check completed. Created ${alertsCreated.length} alerts`);

        return Response.json({
            success: true,
            alerts_checked: preferences.length,
            alerts_created: alertsCreated.length,
            summary: alertsCreated.slice(0, 10)
        });

    } catch (error) {
        console.error('Travel alerts error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});