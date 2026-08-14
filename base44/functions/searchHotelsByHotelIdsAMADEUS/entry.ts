import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hotelIds, checkInDate, checkOutDate, adults = 1, roomQuantity = 1 } = await req.json();

    if (!hotelIds || hotelIds.length === 0 || !checkInDate || !checkOutDate) {
      return Response.json({ error: 'Missing required parameters: hotelIds, checkInDate, checkOutDate' }, { status: 400 });
    }

    // Get Amadeus token
    const tokenRes = await base44.functions.invoke('amadeusBearerToken', {});
    const accessToken = tokenRes.data;

    // Get hotel offers
    const offersUrl = `https://api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelIds.join(',')}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&adults=${adults}&roomQuantity=${roomQuantity}`;
    
    const offersRes = await fetch(offersUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!offersRes.ok) {
      const error = await offersRes.text();
      console.error('Amadeus offers error:', error);
      return Response.json({ error: 'Failed to fetch hotel offers' }, { status: 500 });
    }

    const offersData = await offersRes.json();

    // Get markup settings
    const markupSettings = await base44.asServiceRole.entities.PackageMarkupSettings.list();
    const markup = markupSettings[0]?.hotel_markup_percentage || 12;

    // Process hotels
    const hotels = (offersData.data || []).map(hotel => {
      const offer = hotel.offers?.[0];
      const basePrice = parseFloat(offer?.price?.total || 0);
      const markedUpPrice = basePrice * (1 + markup / 100);

      return {
        hotelId: hotel.hotel.hotelId,
        name: hotel.hotel.name,
        latitude: hotel.hotel.latitude,
        longitude: hotel.hotel.longitude,
        address: hotel.hotel.address?.lines?.join(', '),
        cityCode: hotel.hotel.cityCode,
        rating: hotel.hotel.rating,
        amenities: hotel.hotel.amenities || [],
        price: markedUpPrice.toFixed(2),
        currency: offer?.price?.currency || 'USD',
        offerId: offer?.id,
        roomType: offer?.room?.type,
        roomDescription: offer?.room?.typeEstimated?.category,
        checkInDate,
        checkOutDate
      };
    });

    return Response.json({ hotels });

  } catch (error) {
    console.error('Hotel search by IDs error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});