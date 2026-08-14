import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { cityCode, checkInDate, checkOutDate, adults = 1, rooms = 1, page = 1, limit = 20 } = await req.json();

        if (!cityCode || !checkInDate || !checkOutDate) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Get Amadeus access token
        const tokenResponse = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: Deno.env.get('AMADEUS_API_KEY'),
                client_secret: Deno.env.get('AMADEUS_API_SECRET')
            })
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to authenticate with Amadeus');
        }

        const { access_token } = await tokenResponse.json();

        // Search hotels by city using Amadeus API
        const searchParams = new URLSearchParams({
            cityCode: cityCode,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            adults: adults.toString(),
            roomQuantity: rooms.toString(),
            radius: '50',
            radiusUnit: 'KM',
            ratings: '1,2,3,4,5',
            currency: 'PHP',
            paymentPolicy: 'NONE',
            includeClosed: 'false',
            bestRateOnly: 'false',
            view: 'FULL',
            sort: 'PRICE'
        });

        const hotelResponse = await fetch(
            `https://api.amadeus.com/v3/shopping/hotel-offers?${searchParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Accept': 'application/vnd.amadeus+json'
                }
            }
        );

        if (!hotelResponse.ok) {
            const error = await hotelResponse.text();
            console.error('Amadeus Hotel API error:', error);
            throw new Error('Failed to search hotels');
        }

        const hotelData = await hotelResponse.json();

        // Get markup from admin settings
        const markupResponse = await base44.asServiceRole.functions.invoke('getAdminMarkup');
        const markup = markupResponse.data.markup / 100;

        // Pagination logic
        const allHotels = hotelData.data || [];
        const totalCount = allHotels.length;
        const skip = (page - 1) * limit;
        const paginatedHotels = allHotels.slice(skip, skip + limit);

        const processedOffers = paginatedHotels.map(hotel => {
            const processedOffers = hotel.offers.map(offer => {
                const basePrice = parseFloat(offer.price.total);
                const markedUpPrice = basePrice * (1 + markup);

                return {
                    ...offer,
                    price: {
                        ...offer.price,
                        total: markedUpPrice.toFixed(2),
                        base: basePrice.toFixed(2),
                        markup: (markedUpPrice - basePrice).toFixed(2)
                    }
                };
            });

            return {
                ...hotel,
                offers: processedOffers
            };
        });

        return Response.json({
            data: processedOffers,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: skip + limit < totalCount
            }
        });

    } catch (error) {
        console.error('Search hotels error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});