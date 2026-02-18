import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            destination, 
            startDate, 
            endDate, 
            budget, 
            interests, 
            travelStyle,
            travelers
        } = await req.json();

        console.log('Generating AI itinerary for:', { destination, startDate, endDate });

        // Calculate trip duration
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        // Fetch available flights, hotels, tours
        const [flights, hotels, tours] = await Promise.all([
            base44.asServiceRole.entities.Flight.filter({ status: 'active' }),
            base44.asServiceRole.entities.Hotel.filter({ status: 'active' }),
            base44.asServiceRole.entities.Tour.filter({ status: 'active' })
        ]);

        // Filter relevant options
        const relevantFlights = flights.filter(f => 
            f.destination?.toLowerCase().includes(destination.toLowerCase())
        );
        const relevantHotels = hotels.filter(h => 
            h.location?.toLowerCase().includes(destination.toLowerCase())
        );
        const relevantTours = tours.filter(t => 
            t.destination?.toLowerCase().includes(destination.toLowerCase())
        );

        // Generate AI itinerary
        const prompt = `You are a professional travel planner. Create a detailed ${days}-day itinerary for a trip to ${destination} from ${startDate} to ${endDate}.

Trip Details:
- Destination: ${destination}
- Duration: ${days} days
- Budget: $${budget} per person
- Number of travelers: ${travelers}
- Interests: ${interests.join(', ')}
- Travel style: ${travelStyle}

Available options:
- Flights: ${relevantFlights.length > 0 ? relevantFlights.slice(0, 3).map(f => `${f.airline} ${f.flight_number} from ${f.origin} to ${f.destination} at $${f.base_price}`).join(', ') : 'Search general flights'}
- Hotels: ${relevantHotels.length > 0 ? relevantHotels.slice(0, 3).map(h => `${h.name} - ${h.star_rating} stars at $${h.price_per_night}/night`).join(', ') : 'Search general accommodations'}
- Tours: ${relevantTours.length > 0 ? relevantTours.slice(0, 3).map(t => `${t.title} - $${t.price_per_person}`).join(', ') : 'Suggest local activities'}

Create a comprehensive day-by-day itinerary that includes:
1. Recommended flights (departure and return)
2. Suggested accommodation
3. Daily activities and attractions
4. Restaurant recommendations
5. Transportation tips
6. Estimated daily budget breakdown
7. Packing suggestions
8. Local tips and cultural notes

Make the itinerary realistic, detailed, and personalized to their interests and travel style.`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    summary: { type: 'string' },
                    total_estimated_cost: { type: 'number' },
                    recommended_flight: {
                        type: 'object',
                        properties: {
                            outbound: { type: 'string' },
                            return: { type: 'string' },
                            estimated_cost: { type: 'number' }
                        }
                    },
                    recommended_hotel: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            location: { type: 'string' },
                            estimated_cost: { type: 'number' }
                        }
                    },
                    daily_itinerary: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                day: { type: 'number' },
                                date: { type: 'string' },
                                title: { type: 'string' },
                                activities: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            time: { type: 'string' },
                                            activity: { type: 'string' },
                                            description: { type: 'string' },
                                            estimated_cost: { type: 'number' },
                                            location: { type: 'string' }
                                        }
                                    }
                                },
                                meals: {
                                    type: 'object',
                                    properties: {
                                        breakfast: { type: 'string' },
                                        lunch: { type: 'string' },
                                        dinner: { type: 'string' }
                                    }
                                },
                                estimated_daily_cost: { type: 'number' }
                            }
                        }
                    },
                    packing_list: {
                        type: 'array',
                        items: { type: 'string' }
                    },
                    local_tips: {
                        type: 'array',
                        items: { type: 'string' }
                    },
                    transportation_tips: { type: 'string' }
                }
            }
        });

        console.log('AI itinerary generated successfully');

        // Save to Itinerary entity
        const itinerary = await base44.entities.Itinerary.create({
            user_email: user.email,
            title: aiResponse.title,
            destination: destination,
            start_date: startDate,
            end_date: endDate,
            is_public: false,
            items: aiResponse.daily_itinerary.map(day => ({
                day: day.day,
                date: day.date,
                title: day.title,
                type: 'activity',
                details: JSON.stringify(day.activities),
                notes: JSON.stringify({
                    meals: day.meals,
                    estimated_cost: day.estimated_daily_cost
                })
            })),
            notes: JSON.stringify({
                summary: aiResponse.summary,
                total_cost: aiResponse.total_estimated_cost,
                flight: aiResponse.recommended_flight,
                hotel: aiResponse.recommended_hotel,
                packing_list: aiResponse.packing_list,
                local_tips: aiResponse.local_tips,
                transportation_tips: aiResponse.transportation_tips,
                preferences: {
                    budget,
                    interests,
                    travelStyle,
                    travelers
                }
            })
        });

        return Response.json({
            success: true,
            itinerary_id: itinerary.id,
            itinerary: aiResponse
        });

    } catch (error) {
        console.error('AI itinerary generation error:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to generate itinerary'
        }, { status: 500 });
    }
});