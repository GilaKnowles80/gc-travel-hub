import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { service_type, origin, destination, date, location } = body;

    // Build a targeted prompt per service type
    let prompt = '';
    if (service_type === 'bus') {
      prompt = `Find real bus routes and schedules from "${origin}" to "${destination}" on or around ${date || 'today'}.
List up to 8 options with: operator name, departure time, arrival time, duration (hours), price (USD), bus type (standard/deluxe/sleeper/express), available seats estimate, and key amenities (WiFi, AC, restroom).
Return realistic, practical options a travel agency would offer. Format as JSON array.`;
    } else if (service_type === 'ferry') {
      prompt = `Find real ferry/boat routes from port "${origin}" to port "${destination}" on or around ${date || 'today'}.
List up to 6 options with: operator name, vessel name, departure time, arrival time, duration (hours), cabin types (each with type and price in USD), and available amenities.
Return realistic options. Format as JSON array.`;
    } else if (service_type === 'train') {
      prompt = `Find real train routes from "${origin}" to "${destination}" on or around ${date || 'today'}.
List up to 8 options with: operator name, train number, train type (high_speed/intercity/regional/express/sleeper), departure time, arrival time, duration (hours), class types (each with class and price in USD), and amenities.
Return realistic options for these actual stations/routes. Format as JSON array.`;
    } else if (service_type === 'car') {
      prompt = `List realistic car rental options available in "${location || destination}" for pickup around ${date || 'today'}.
List up to 9 cars across different companies (Hertz, Avis, Budget, Enterprise, Sixt, etc.) with: company name, car model, car type (economy/compact/midsize/suv/luxury/van), seats, transmission, fuel type, price per day (USD), features, insurance included (boolean).
Format as JSON array.`;
    } else if (service_type === 'cruise') {
      prompt = `List realistic cruise itineraries departing from "${origin || destination}" around ${date || 'this month'}.
List up to 6 options with: cruise line, ship name, itinerary name, departure port, duration nights, ports of call (array), cabin categories (each with category and price_per_person in USD), and a short description.
Format as JSON array.`;
    } else {
      return Response.json({ error: 'Invalid service_type' }, { status: 400 });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          results: { type: "array", items: { type: "object" } }
        }
      }
    });

    return Response.json({ results: result.results || [] });
  } catch (error) {
    console.error('getAISchedules error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});