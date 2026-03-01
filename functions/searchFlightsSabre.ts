import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origin, destination, departureDate, returnDate, adults = 1, cabin = 'economy' } = await req.json();

    if (!origin || !destination || !departureDate) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const sabreClientId = Deno.env.get('SABRE_CLIENT_ID');
    const sabreClientSecret = Deno.env.get('SABRE_CLIENT_SECRET');
    const markup = parseFloat(Deno.env.get('FLIGHT_MARKUP_PERCENTAGE') || '15');

    if (!sabreClientId || !sabreClientSecret) {
      return Response.json({ error: 'Sabre credentials not configured' }, { status: 500 });
    }

    // Get OAuth token from Sabre
    const tokenResponse = await fetch('https://api.cert.sabre.com/v2/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${sabreClientId}:${sabreClientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return Response.json({ error: 'Failed to get Sabre token' }, { status: 500 });
    }

    // Search flights on Sabre
    const searchBody = {
      OTA_AirLowFareSearchRQ: {
        Version: '2.3.0',
        OriginDestinationInformation: {
          RPH: '1',
          DepartureDateTime: `${departureDate}T00:00:00`,
          OriginLocation: { LocationCode: origin },
          DestinationLocation: { LocationCode: destination }
        },
        TravelPreferences: { ValidInterlineTicket: true },
        TravelerInfoSummary: {
          AirTravelerInfo: {
            PassengerTypeQuantity: { Code: 'ADT', Quantity: adults }
          }
        },
        MaxResponses: 50
      }
    };

    const flightResponse = await fetch('https://api.cert.sabre.com/v1/shop/flights/fares', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Conversation-ID': `${Date.now()}`
      },
      body: JSON.stringify(searchBody)
    });

    const flightData = await flightResponse.json();
    const priceOptions = flightData.PricedItineraries || [];

    // Transform Sabre offers to standard format
    const transformedOffers = priceOptions.slice(0, 50).map((option, idx) => {
      const itinerary = option.AirItinerary.OriginDestinationOptions[0];
      const segment = itinerary.FlightSegment[0];
      const netPrice = parseFloat(option.AirItineraryPricingInfo.ItinTotalFare.TotalFare.Amount);
      const sellingPrice = netPrice * (1 + markup / 100);

      return {
        id: `sabre_${idx}`,
        airline_name: segment.OperatingAirline.CompanyShortName || 'Sabre Airlines',
        flight_number: `${segment.OperatingAirline.Code}${segment.FlightNumber}`,
        origin: segment.DepartureAirport.LocationCode,
        destination: segment.ArrivalAirport.LocationCode,
        departure_time: `${segment.DepartureDateTime.Date}T${segment.DepartureDateTime.Time}`,
        arrival_time: `${segment.ArrivalAirport.DepartureDateTime.Date}T${segment.ArrivalAirport.DepartureDateTime.Time}`,
        duration_hours: Math.round((itinerary.ElapsedTime || 0) / 60),
        is_direct: itinerary.FlightSegment.length === 1,
        stops: Math.max(0, itinerary.FlightSegment.length - 1),
        price: Math.round(sellingPrice),
        currency: option.AirItineraryPricingInfo.ItinTotalFare.CurrencyCode,
        cabin_classes: [{ class: cabin, price: Math.round(sellingPrice), seats_available: 8 }],
        source: 'sabre',
        net_price: netPrice,
        markup_percentage: markup
      };
    });

    return Response.json({ offers: transformedOffers });
  } catch (error) {
    console.error('Sabre flight search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});