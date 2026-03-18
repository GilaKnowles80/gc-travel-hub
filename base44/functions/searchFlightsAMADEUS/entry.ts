import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { origin, destination, departureDate, returnDate, adults, children, infants, cabin } = await req.json();

    // Get AMADEUS credentials
    const apiKey = Deno.env.get("AMADEUS_API_KEY");
    const apiSecret = Deno.env.get("AMADEUS_API_SECRET");

    if (!apiKey || !apiSecret) {
      return Response.json({ error: "AMADEUS credentials not configured" }, { status: 500 });
    }

    // Get access token
    const tokenResponse = await fetch("https://api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: apiKey,
        client_secret: apiSecret,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to get AMADEUS token");
    }

    const { access_token } = await tokenResponse.json();

    // Build search parameters
    const params = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults: adults.toString(),
      nonStop: "false",
      max: "50",
    });

    if (children) params.append("children", children.toString());
    if (infants) params.append("infants", infants.toString());
    if (returnDate) params.append("returnDate", returnDate);
    if (cabin) params.append("travelClass", cabin.toUpperCase());

    // Search flights
    const searchResponse = await fetch(
      `https://api.amadeus.com/v2/shopping/flight-offers?${params}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      console.error("AMADEUS search error:", error);
      return Response.json({ error: "Flight search failed", details: error }, { status: searchResponse.status });
    }

    const data = await searchResponse.json();

    // Transform AMADEUS response to match app format
    const flights = data.data.map((offer, idx) => ({
      id: `amadeus_${idx}`,
      amadeus_id: offer.id,
      airline_name: offer.validatingAirlineCodes?.[0] || "Unknown",
      flight_number: offer.itineraries?.[0]?.segments?.[0]?.operating?.carrierCode || "N/A",
      origin: offer.itineraries?.[0]?.segments?.[0]?.departure?.iataCode,
      destination: offer.itineraries?.[0]?.segments?.[offer.itineraries[0].segments.length - 1]?.arrival?.iataCode,
      departure_time: offer.itineraries?.[0]?.segments?.[0]?.departure?.at,
      arrival_time: offer.itineraries?.[0]?.segments?.[offer.itineraries[0].segments.length - 1]?.arrival?.at,
      duration_hours: calculateDuration(offer.itineraries?.[0]),
      is_direct: offer.itineraries?.[0]?.segments?.length === 1,
      stops: offer.itineraries?.[0]?.segments?.length - 1 || 0,
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      cabin_classes: [
        {
          class: (offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "economy").toLowerCase(),
          price: parseFloat(offer.price.total),
          seats_available: 9,
        },
      ],
      baggage_allowance: "1 checked bag, 1 carry-on",
      amenities: ["Seat selection", "Online check-in"],
      status: "active",
      baggage_details: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight,
    }));

    return Response.json({ flights, total: flights.length });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateDuration(itinerary) {
  if (!itinerary?.segments?.length) return 0;
  const departure = new Date(itinerary.segments[0].departure.at);
  const arrival = new Date(itinerary.segments[itinerary.segments.length - 1].arrival.at);
  return (arrival - departure) / (1000 * 60 * 60); // Convert to hours
}