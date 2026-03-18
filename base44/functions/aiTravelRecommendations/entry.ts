import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchType, destination, preferences = {} } = await req.json();

    // Fetch user's past bookings
    let pastBookings = [];
    try {
      pastBookings = await base44.entities.Booking.filter({ customer_email: user.email }, '-created_date', 5);
    } catch {
      pastBookings = [];
    }

    // Fetch available products based on search type
    let products = [];
    if (searchType === 'tours' && destination) {
      products = await base44.entities.Tour.filter({ destination }, 'rating', 10);
    } else if (searchType === 'hotels' && destination) {
      products = await base44.entities.Hotel.filter({ location: { $regex: destination } }, 'star_rating', 10);
    } else if (searchType === 'flights') {
      products = await base44.entities.Flight.filter({ destination }, '-created_date', 15);
    }

    // Build prompt for AI recommendation
    const bookingHistory = pastBookings.map(b => `${b.tour_title || 'Booking'} (${b.total_price}$)`).join(', ');
    const productSummary = products.slice(0, 5).map(p => `${p.title || p.name || p.flight_number}: $${p.price_per_person || p.price || p.cabin_classes?.[0]?.price || 0}`).join(', ');

    const prompt = `Based on the user's travel preferences and past bookings, recommend the top 3 ${searchType} for their trip to ${destination}.

User Profile:
- Past bookings: ${bookingHistory || 'None'}
- Preferences: ${JSON.stringify(preferences)}
- Budget range: ${preferences.budget_min || 'Flexible'} - ${preferences.budget_max || 'Flexible'}

Available options:
${productSummary}

For each recommendation, provide:
1. Product name/title
2. Why it matches their preferences (2-3 sentences)
3. Estimated value (price estimate)
4. Confidence score (0-100%)

Return as JSON array with objects containing: name, reason, price, confidence`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                reason: { type: 'string' },
                price: { type: 'number' },
                confidence: { type: 'number' }
              }
            }
          }
        }
      }
    });

    // Enrich recommendations with actual product data
    const enrichedRecommendations = await Promise.all(
      (response.recommendations || []).map(async (rec) => {
        let productMatch = products.find(p => 
          (p.title || p.name || p.flight_number || '').toLowerCase().includes(rec.name.toLowerCase())
        );
        
        if (!productMatch && products.length > 0) {
          productMatch = products[0];
        }

        return {
          ...rec,
          product_id: productMatch?.id,
          image_url: productMatch?.image_url || productMatch?.gallery_urls?.[0],
          rating: productMatch?.rating || productMatch?.star_rating,
          full_product: productMatch
        };
      })
    );

    return Response.json({ 
      success: true,
      recommendations: enrichedRecommendations.slice(0, 3),
      search_type: searchType
    });
  } catch (error) {
    console.error('AI Recommendations Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});