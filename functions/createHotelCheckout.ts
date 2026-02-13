import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { hotel, offer, guestDetails } = await req.json();

        if (!hotel || !offer || !guestDetails) {
            return Response.json({ error: 'Missing required data' }, { status: 400 });
        }

        // Calculate markup
        const markup = parseFloat(Deno.env.get('FLIGHT_MARKUP_PERCENTAGE') || '0') / 100;
        const basePrice = parseFloat(offer.price.total);
        const markedUpPrice = basePrice * (1 + markup);
        const totalAmount = Math.round(markedUpPrice * 100);

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: offer.price.currency.toLowerCase(),
                    product_data: {
                        name: `${hotel.name} - ${offer.room?.description?.text || 'Room Booking'}`,
                        description: `Check-in: ${offer.checkInDate}, Check-out: ${offer.checkOutDate}`,
                    },
                    unit_amount: totalAmount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}${Deno.env.get('BASE44_APP_ID') ? `/${Deno.env.get('BASE44_APP_ID')}` : ''}/HotelBookingConfirmation?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}${Deno.env.get('BASE44_APP_ID') ? `/${Deno.env.get('BASE44_APP_ID')}` : ''}/HotelSearch`,
            metadata: {
                base44_app_id: Deno.env.get('BASE44_APP_ID'),
                user_email: user.email,
                hotel_name: hotel.name,
                offer_id: offer.id,
                check_in: offer.checkInDate,
                check_out: offer.checkOutDate,
                booking_data: JSON.stringify({ hotel, offer, guestDetails })
            }
        });

        return Response.json({ 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error('Create hotel checkout error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});