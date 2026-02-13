import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { hotelOffer, guestDetails } = await req.json();

        if (!hotelOffer || !guestDetails) {
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

        // Create hotel booking with Amadeus
        const bookingPayload = {
            data: {
                offerId: hotelOffer.id,
                guests: guestDetails.guests,
                payments: [{
                    method: 'creditCard',
                    card: {
                        vendorCode: 'VI',
                        cardNumber: '4111111111111111',
                        expiryDate: '2027-12'
                    }
                }]
            }
        };

        const bookingResponse = await fetch(
            'https://test.api.amadeus.com/v1/booking/hotel-bookings',
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
            console.error('Amadeus hotel booking error:', error);
            throw new Error('Failed to create hotel booking');
        }

        const bookingData = await bookingResponse.json();

        // Get markup from admin settings
        const markupResponse = await base44.asServiceRole.functions.invoke('getAdminMarkup');
        const markup = markupResponse.data.markup / 100;
        const basePrice = parseFloat(hotelOffer.price.base);
        const markedUpPrice = basePrice * (1 + markup);

        const confirmationData = {
            bookingReference: bookingData.data[0].id,
            hotelName: hotelOffer.hotel.name,
            hotelAddress: hotelOffer.hotel.address,
            roomDescription: hotelOffer.room.description?.text || 'Standard Room',
            checkIn: hotelOffer.checkInDate,
            checkOut: hotelOffer.checkOutDate,
            guests: guestDetails.guests,
            basePrice: basePrice.toFixed(2),
            markup: (markedUpPrice - basePrice).toFixed(2),
            totalPrice: markedUpPrice.toFixed(2),
            currency: hotelOffer.price.currency,
            bookingDate: new Date().toISOString()
        };

        // Send confirmation email
        const emailBody = `
            <h2>Hotel Booking Confirmation</h2>
            <p>Dear ${user.full_name},</p>
            <p>Your hotel reservation has been confirmed!</p>
            
            <h3>Booking Reference: ${confirmationData.bookingReference}</h3>
            
            <h3>Hotel Details:</h3>
            <ul>
                <li><strong>Hotel:</strong> ${confirmationData.hotelName}</li>
                <li><strong>Address:</strong> ${confirmationData.hotelAddress?.lines?.join(', ')}, ${confirmationData.hotelAddress?.cityName}</li>
                <li><strong>Room Type:</strong> ${confirmationData.roomDescription}</li>
            </ul>
            
            <h3>Stay Details:</h3>
            <ul>
                <li><strong>Check-in:</strong> ${new Date(confirmationData.checkIn).toLocaleDateString()}</li>
                <li><strong>Check-out:</strong> ${new Date(confirmationData.checkOut).toLocaleDateString()}</li>
                <li><strong>Guests:</strong> ${confirmationData.guests.length} guest(s)</li>
            </ul>
            
            <h3>Pricing:</h3>
            <ul>
                <li><strong>Base Price:</strong> ${confirmationData.currency} ${confirmationData.basePrice}</li>
                <li><strong>Service Fee:</strong> ${confirmationData.currency} ${confirmationData.markup}</li>
                <li><strong>Total Price:</strong> ${confirmationData.currency} ${confirmationData.totalPrice}</li>
            </ul>
            
            <h3>Guest(s):</h3>
            ${confirmationData.guests.map(g => `<p>${g.name.firstName} ${g.name.lastName}</p>`).join('')}
            
            <p>Thank you for booking with GC Travel & Tours!</p>
            <p>For any questions, please contact us at info@gctraveltours.com</p>
        `;

        await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: `Hotel Booking Confirmed - ${confirmationData.bookingReference}`,
            body: emailBody,
            from_name: 'GC Travel & Tours'
        });

        return Response.json(confirmationData);

    } catch (error) {
        console.error('Book hotel error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});