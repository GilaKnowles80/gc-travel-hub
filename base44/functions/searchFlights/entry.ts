import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { origin, destination, departureDate, returnDate, adults = 1, cabinClass = 'ECONOMY' } = await req.json();

        if (!origin || !destination || !departureDate) {
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

        // Search flight offers
        const searchParams = new URLSearchParams({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: departureDate,
            adults: adults.toString(),
            travelClass: cabinClass,
            max: '50'
        });

        if (returnDate) {
            searchParams.append('returnDate', returnDate);
        }

        const flightResponse = await fetch(
            `https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );

        if (!flightResponse.ok) {
            const error = await flightResponse.text();
            console.error('Amadeus API error:', error);
            throw new Error('Failed to search flights');
        }

        const flightData = await flightResponse.json();

        // Detect domestic PH route
        const PH_AIRPORTS = ['MNL','CEB','DVO','ILO','BCD','KLO','GES','CYP','LGP','TAG','ZAM','MPH','USU','CGY','DPL','ENI','MBT','OMC','OZC','PPS','RXS','SFE','SUG','TDG','TUG','VRC','WNP','XMA','CRM','GNI','MLP','SGS'];
        const isDomestic = PH_AIRPORTS.includes(origin.toUpperCase()) && PH_AIRPORTS.includes(destination.toUpperCase());

        // Get markup from admin settings
        const markupResponse = await base44.asServiceRole.functions.invoke('getAdminMarkup');
        const baseMarkup = markupResponse.data.markup / 100;
        const domesticMarkup = parseFloat(Deno.env.get('DOMESTIC_FLIGHT_MARKUP_PERCENTAGE') || '20') / 100;
        const markup = isDomestic ? domesticMarkup : baseMarkup;
        console.log(`[MARKUP] Route ${origin}-${destination} is ${isDomestic ? 'DOMESTIC' : 'INTERNATIONAL'}, applying ${(markup*100).toFixed(0)}% markup`);

        const processedOffers = flightData.data.map(offer => {
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

        return Response.json({
            data: processedOffers,
            meta: flightData.meta,
            dictionaries: flightData.dictionaries
        });

    } catch (error) {
        console.error('Search flights error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});