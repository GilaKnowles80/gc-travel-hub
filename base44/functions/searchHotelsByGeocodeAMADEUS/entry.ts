import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { latitude, longitude, radius = 5, checkInDate, checkOutDate, adults = 1, roomQuantity = 1, page = 1, pageSize = 20 } = await req.json();

    if (!latitude || !longitude || !checkInDate || !checkOutDate) {
      return Response.json({ error: 'Missing required parameters: latitude, longitude, checkInDate, checkOutDate' }, { status: 400 });
    }

    // Get Amadeus token
    const tokenRes = await base44.functions.invoke('amadeusBearerToken', {});
    const accessToken = tokenRes.data;

    // Search hotels by geocode
    const searchUrl = `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?latitude=${latitude}&longitude=${longitude}&radius=${radius}&radiusUnit=KM&hotelSource=ALL`;
    
    const hotelListRes = await fetch(searchUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!hotelListRes.ok) {
      const error = await hotelListRes.text();
      console.error('Amadeus hotel list error:', error);
      return Response.json({ error: 'Failed to fetch hotels by location' }, { status: 500 });
    }

    const hotelListData = await hotelListRes.json();
    const hotelIds = hotelListData.data?.map(h => h.hotelId).slice(0, 50) || [];

    if (hotelIds.length === 0) {
      return Response.json({ hotels: [], pagination: { total: 0, page, pageSize, totalPages: 0 } });
    }

    // Get hotel offers
    const offersUrl = `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelIds.join(',')}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&adults=${adults}&roomQuantity=${roomQuantity}`;
    
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
        roomDescription: offer?.room?.typeEstimated?.category
      };
    });

    // Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedHotels = hotels.slice(start, end);

    return Response.json({
      hotels: paginatedHotels,
      pagination: {
        total: hotels.length,
        page,
        pageSize,
        totalPages: Math.ceil(hotels.length / pageSize)
      }
    });

  } catch (error) {
    console.error('Hotel geocode search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});