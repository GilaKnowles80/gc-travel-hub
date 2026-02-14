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
    const [tours, flights, hotels] = await Promise.all([
      base44.entities.Tour.filter({ status: "active" }, "-rating", 20),
      base44.entities.Flight.filter({ status: "active" }, "-departure_time", 10),
      base44.entities.Hotel.filter({ status: "active" }, "-star_rating", 10),
    ]);

    const travelContext = `
Available Tours (sample): ${tours.slice(0, 3).map(t => `${t.title} in ${t.destination} (${t.category}, $${t.price_per_person})`).join("; ")}
Available Flights (sample): ${flights.slice(0, 3).map(f => `${f.origin} to ${f.destination} on ${f.airline_name}`).join("; ")}
Available Hotels (sample): ${hotels.slice(0, 3).map(h => `${h.name} in ${h.location} (${h.star_rating}⭐)`).join("; ")}
User preferences: ${context.budget ? `Budget: $${context.budget}` : ""} ${context.interests ? `Interests: ${context.interests}` : ""} ${context.dates ? `Travel dates: ${context.dates}` : ""}
    `;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a knowledgeable travel assistant for GC Travel & Tours Agency. Help users plan trips, recommend destinations, answer travel questions, and provide travel tips.

Current travel data available:
${travelContext}

User message: "${message}"

Provide helpful, personalized travel advice. If recommending destinations or tours, mention specific options from our available inventory when relevant. Keep responses concise and actionable.`,
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