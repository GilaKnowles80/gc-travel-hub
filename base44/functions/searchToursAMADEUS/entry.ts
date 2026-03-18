import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { destination, startDate, endDate, duration, adults = 1, page = 1, limit = 20 } = await req.json();

        if (!destination || !startDate || !endDate) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Get Amadeus access token
        const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
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

        // Search tours by destination
        const searchParams = new URLSearchParams({
            destination: destination,
            startDate: startDate,
            endDate: endDate,
            adults: adults.toString()
        });

        const tourResponse = await fetch(
            `https://test.api.amadeus.com/v2/shopping/activities?${searchParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );

        if (!tourResponse.ok) {
            const error = await tourResponse.text();
            console.error('Amadeus Tour API error:', error);
            throw new Error('Failed to search tours');
        }

        const tourData = await tourResponse.json();

        // Get markup from admin settings
        const markupResponse = await base44.asServiceRole.functions.invoke('getAdminMarkup');
        const markup = markupResponse.data.markup / 100;

        // Pagination logic
        const allTours = tourData.data || [];
        const totalCount = allTours.length;
        const skip = (page - 1) * limit;
        const paginatedTours = allTours.slice(skip, skip + limit);

        const processedTours = paginatedTours.map(tour => {
            const basePrice = parseFloat(tour.price?.amount || 0);
            const markedUpPrice = basePrice * (1 + markup);

            return {
                ...tour,
                price_per_person: markedUpPrice.toFixed(2),
                base_price: basePrice.toFixed(2),
                markup_amount: (markedUpPrice - basePrice).toFixed(2),
                category: tour.shortDescription?.category || 'adventure',
                duration_days: parseInt(tour.duration) || 3,
                image_url: tour.pictures?.[0] || '',
                gallery_urls: tour.pictures || [],
                itinerary: tour.description ? [{ day: 1, title: 'Tour', description: tour.description }] : [],
                inclusions: tour.includedServices || [],
                rating: tour.rating || 4.5,
                reviews_count: tour.reviews_count || 0,
                status: 'active'
            };
        });

        return Response.json({
            data: processedTours,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: skip + limit < totalCount
            }
        });

    } catch (error) {
        console.error('Search tours error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});