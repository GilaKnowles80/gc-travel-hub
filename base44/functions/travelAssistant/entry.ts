import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, context = {} } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch relevant travel data for context
    const [tours, flights, hotels, visas] = await Promise.all([
      base44.entities.Tour.filter({ status: "active" }, "-rating", 30),
      base44.entities.Flight.filter({ status: "active" }, "-departure_time", 20),
      base44.entities.Hotel.filter({ status: "active" }, "-star_rating", 20),
      base44.entities.Visa.filter({ status: "active" }, "", 10).catch(() => []),
    ]);

    // Filter based on user preferences
    let filteredTours = tours;
    let filteredFlights = flights;
    let filteredHotels = hotels;

    // Budget filtering
    if (context.budget) {
      const [min, max] = context.budget.split('-').map(v => parseInt(v.replace('+', '000000')));
      filteredTours = tours.filter(t => t.price_per_person >= min && (max ? t.price_per_person <= max : true));
    }

    // Interest-based filtering
    if (context.interests) {
      filteredTours = filteredTours.filter(t => 
        t.category?.toLowerCase().includes(context.interests.toLowerCase()) ||
        t.title?.toLowerCase().includes(context.interests.toLowerCase())
      );
    }

    // Destination filtering
    if (context.destination) {
      filteredTours = filteredTours.filter(t => 
        t.destination?.toLowerCase().includes(context.destination.toLowerCase())
      );
      filteredFlights = filteredFlights.filter(f => 
        f.destination?.toLowerCase().includes(context.destination.toLowerCase()) ||
        f.origin?.toLowerCase().includes(context.destination.toLowerCase())
      );
      filteredHotels = filteredHotels.filter(h => 
        h.location?.toLowerCase().includes(context.destination.toLowerCase())
      );
    }

    const travelContext = `
AVAILABLE TOURS (top matches):
${filteredTours.slice(0, 5).map(t => `- ${t.title} in ${t.destination} | ${t.category} | $${t.price_per_person}/person | ${t.duration_days} days | Rating: ${t.rating || 'N/A'}/5`).join('\n')}

AVAILABLE FLIGHTS (recent):
${filteredFlights.slice(0, 5).map(f => `- ${f.airline_name} ${f.flight_number}: ${f.origin} → ${f.destination} | Departs: ${f.departure_time} | Status: ${f.flight_status}`).join('\n')}

AVAILABLE HOTELS (top rated):
${filteredHotels.slice(0, 5).map(h => `- ${h.name} in ${h.location} | ${h.star_rating}⭐ | From $${h.price_per_night}/night`).join('\n')}

VISA INFORMATION (if applicable):
${visas.length > 0 ? visas.slice(0, 3).map(v => `- ${v.country} ${v.visa_type}: $${v.fee} | Processing: ${v.processing_time_days} days`).join('\n') : 'Contact us for visa requirements'}

USER PREFERENCES:
${context.budget ? `Budget: $${context.budget}` : "Budget: Not specified"}
${context.interests ? `Interests: ${context.interests}` : "Interests: Not specified"}
${context.dates ? `Travel dates: ${context.dates}` : "Travel dates: Flexible"}
${context.destination ? `Preferred destination: ${context.destination}` : "Destination: Open to suggestions"}
    `;

    const systemPrompt = `You are an expert AI travel assistant for GC Travel & Tours Agency. Your role is to:

1. RECOMMEND DESTINATIONS: Analyze user preferences (budget, interests, dates) and suggest the best-fit destinations from our tour catalog. Explain WHY each destination matches their needs.

2. SUGGEST FLIGHTS & HOTELS: When planning itineraries, recommend specific flights and hotels from our inventory. Provide flight times, prices, and hotel ratings.

3. ANSWER TRAVEL QUESTIONS: Provide accurate information about:
   - Visa requirements and processing times
   - Best travel seasons and weather
   - Packing tips and travel essentials
   - Booking policies and cancellations
   - Travel insurance and safety tips
   - Local customs and currency

4. PERSONALIZATION: Always consider the user's stated budget, interests, and dates. Suggest alternatives if their preferences are outside our available options.

5. ACTIONABILITY: End recommendations with clear next steps (e.g., "Would you like me to show you more details about this tour?" or "Shall I help you book flights?")

Current travel inventory:
${travelContext}

Be conversational, helpful, and concise. Use emojis sparingly for emphasis.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}

User message: "${message}"

Provide a helpful, personalized response based on their preferences and our available travel options.`,
      add_context_from_internet: true,
    });

    return Response.json({ 
      message: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Travel Assistant Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});