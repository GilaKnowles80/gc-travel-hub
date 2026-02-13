import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { flightOffer, passengerDetails } = await req.json();

        if (!flightOffer || !passengerDetails) {
            return Response.json({ error: 'Missing required booking data' }, { status: 400 });
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

        // Create booking with Amadeus
        const bookingPayload = {
            data: {
                type: 'flight-order',
                flightOffers: [flightOffer],
                travelers: passengerDetails.travelers,
                contacts: [{
                    emailAddress: user.email,
                    phones: [{
                        deviceType: 'MOBILE',
                        countryCallingCode: '63',
                        number: passengerDetails.phone || '9171234567'
                    }]
                }]
            }
        };

        const bookingResponse = await fetch(
            'https://test.api.amadeus.com/v1/booking/flight-orders',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingPayload)
            }
        );

        if (!bookingResponse.ok) {
            const error = await bookingResponse.text();
            console.error('Amadeus booking error:', error);
            throw new Error('Failed to create booking');
        }

        const bookingData = await bookingResponse.json();

        // Get markup from admin settings
        const markupResponse = await base44.asServiceRole.functions.invoke('getAdminMarkup');
        const markup = markupResponse.data.markup / 100;
        const basePrice = parseFloat(bookingData.data.flightOffers[0].price.total);
        const markedUpPrice = basePrice * (1 + markup);

        const confirmationData = {
            bookingReference: bookingData.data.id,
            amadeusPNR: bookingData.data.associatedRecords?.[0]?.reference || bookingData.data.id,
            flightDetails: bookingData.data.flightOffers[0],
            travelers: bookingData.data.travelers,
            basePrice: basePrice.toFixed(2),
            markup: (markedUpPrice - basePrice).toFixed(2),
            totalPrice: markedUpPrice.toFixed(2),
            currency: bookingData.data.flightOffers[0].price.currency,
            bookingDate: new Date().toISOString()
        };

        // Send confirmation email
        const firstSegment = confirmationData.flightDetails.itineraries[0].segments[0];
        const lastSegment = confirmationData.flightDetails.itineraries[0].segments[
            confirmationData.flightDetails.itineraries[0].segments.length - 1
        ];

        const emailBody = `
            <h2>Flight Booking Confirmation</h2>
            <p>Dear ${user.full_name},</p>
            <p>Your flight booking has been confirmed!</p>
            
            <h3>Booking Reference: ${confirmationData.amadeusPNR}</h3>
            
            <h3>Flight Details:</h3>
            <ul>
                <li><strong>Route:</strong> ${firstSegment.departure.iataCode} → ${lastSegment.arrival.iataCode}</li>
                <li><strong>Departure:</strong> ${new Date(firstSegment.departure.at).toLocaleString()}</li>
                <li><strong>Arrival:</strong> ${new Date(lastSegment.arrival.at).toLocaleString()}</li>
                <li><strong>Flight Number:</strong> ${firstSegment.carrierCode}${firstSegment.number}</li>
            </ul>
            
            <h3>Pricing:</h3>
            <ul>
                <li><strong>Base Price:</strong> ${confirmationData.currency} ${confirmationData.basePrice}</li>
                <li><strong>Service Fee:</strong> ${confirmationData.currency} ${confirmationData.markup}</li>
                <li><strong>Total Price:</strong> ${confirmationData.currency} ${confirmationData.totalPrice}</li>
            </ul>
            
            <h3>Passenger(s):</h3>
            ${confirmationData.travelers.map(t => `<p>${t.name.firstName} ${t.name.lastName}</p>`).join('')}
            
            <p>Thank you for booking with GC Travel & Tours!</p>
            <p>For any questions, please contact us at info@gctraveltours.com</p>
        `;

        await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: `Flight Booking Confirmed - ${confirmationData.amadeusPNR}`,
            body: emailBody,
            from_name: 'GC Travel & Tours'
        });

        return Response.json(confirmationData);

    } catch (error) {
        console.error('Book flight error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});