import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, preferences, budget } = await req.json();

        // Fetch user's past bookings
        const bookings = await base44.entities.FlightBooking.filter({ 
            passenger_email: user.email 
        }, '-created_date', 20);

        // Fetch user preferences
        let userPrefs = await base44.entities.UserFlightPreferences.filter({ 
            user_email: user.email 
        });
        userPrefs = userPrefs[0] || null;

        // Fetch available flights
        const flights = await base44.entities.Flight.filter({ 
            status: 'available' 
        }, '-departure_time', 50);

        // Build AI prompt based on request type
        let prompt = '';
        
        if (type === 'personalized') {
            prompt = `Analyze the user's travel history and preferences to recommend 5 personalized flight deals.

Past Bookings: ${JSON.stringify(bookings.map(b => ({ route: b.route, cabin: b.cabin_class, price: b.total_price })))}
User Preferences: ${userPrefs ? JSON.stringify(userPrefs) : 'No preferences set'}
Available Flights: ${JSON.stringify(flights.map(f => ({ 
    id: f.id, 
    airline: f.airline, 
    route: `${f.origin} to ${f.destination}`,
    departure: f.departure_time,
    prices: f.cabin_prices 
})))}

Recommend 5 flights that match their history, interests, and budget. Focus on value and their preferences.`;
        } else if (type === 'discover') {
            prompt = `Suggest 5 interesting flight routes and destinations based on user interests and budget.

User Interests: ${preferences?.interests?.join(', ') || 'General travel'}
Budget: $${budget?.min || 0} - $${budget?.max || 5000}
Preferred Class: ${preferences?.preferred_cabin_class || 'economy'}
Past Destinations: ${bookings.map(b => b.route).join(', ') || 'None'}

Available Flights: ${JSON.stringify(flights.map(f => ({ 
    id: f.id, 
    airline: f.airline, 
    route: `${f.origin} to ${f.destination}`,
    departure: f.departure_time,
    prices: f.cabin_prices,
    duration: f.duration_hours
})))}

Suggest diverse, interesting destinations they haven't been to yet. Include adventure, culture, and relaxation options.`;
        } else if (type === 'dream') {
            const dreamDestinations = preferences?.dream_destinations || [];
            prompt = `Find the best flight options to reach these dream destinations: ${dreamDestinations.join(', ')}

Budget: $${budget?.min || 0} - $${budget?.max || 10000}
Flexible Dates: ${preferences?.flexible_dates ? 'Yes' : 'No'}
Preferred Class: ${preferences?.preferred_cabin_class || 'economy'}

Available Flights: ${JSON.stringify(flights.map(f => ({ 
    id: f.id, 
    airline: f.airline, 
    route: `${f.origin} to ${f.destination}`,
    destination: f.destination,
    departure: f.departure_time,
    prices: f.cabin_prices
})))}

Find the best flight options that get them to or near their dream destinations. Consider layovers and connections.`;
        }

        // Call AI to analyze and recommend
        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                flight_id: { type: "string" },
                                title: { type: "string" },
                                reason: { type: "string" },
                                highlights: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                savings: { type: "string" },
                                match_score: { type: "number" }
                            }
                        }
                    },
                    insights: { type: "string" }
                }
            }
        });

        return Response.json(aiResponse);
    } catch (error) {
        console.error('AI Flight Recommendations Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});