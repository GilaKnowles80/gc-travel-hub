import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { flightOffer } = await req.json();

        if (!flightOffer) {
            return Response.json({ error: 'Flight offer data required' }, { status: 400 });
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

        // Price the flight offer to get updated pricing
        const priceResponse = await fetch(
            'https://api.amadeus.com/v1/shopping/flight-offers/pricing',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: {
                        type: 'flight-offers-pricing',
                        flightOffers: [flightOffer]
                    }
                })
            }
        );

        if (!priceResponse.ok) {
            const error = await priceResponse.text();
            console.error('Amadeus pricing error:', error);
            throw new Error('Failed to get flight pricing');
        }

        const pricingData = await priceResponse.json();

        // Get markup from admin settings
        const markupResponse = await base44.asServiceRole.functions.invoke('getAdminMarkup');
        const markup = markupResponse.data.markup / 100;

        const offer = pricingData.data.flightOffers[0];
        const basePrice = parseFloat(offer.price.total);
        const markedUpPrice = basePrice * (1 + markup);

        return Response.json({
            ...offer,
            price: {
                ...offer.price,
                total: markedUpPrice.toFixed(2),
                base: basePrice.toFixed(2),
                markup: (markedUpPrice - basePrice).toFixed(2)
            }
        });

    } catch (error) {
        console.error('Get flight details error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});