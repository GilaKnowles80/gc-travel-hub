import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = await import('npm:stripe@14.21.0');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Stripe
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    // Fetch all payment intents to sync payment statuses
    const intents = await stripeClient.paymentIntents.list({ limit: 100 });

    let updated = 0;
    
    for (const intent of intents.data) {
      const metadata = intent.metadata;
      if (!metadata || !metadata.booking_id || !metadata.booking_type) continue;

      const { booking_id, booking_type } = metadata;
      let paymentStatus = 'unpaid';

      if (intent.status === 'succeeded') {
        paymentStatus = 'paid';
      } else if (intent.status === 'processing') {
        paymentStatus = 'partial';
      }

      // Update booking entity based on type
      const entityMap = {
        flight: 'FlightBooking',
        hotel: 'HotelBooking',
        tour: 'Booking',
        ferry: 'FerryBooking',
        bus: 'BusBooking'
      };

      const entityName = entityMap[booking_type];
      if (entityName) {
        try {
          await base44.asServiceRole.entities[entityName].update(booking_id, {
            payment_status: paymentStatus
          });
          updated++;
        } catch (e) {
          console.error(`Failed to update ${booking_type} ${booking_id}:`, e.message);
        }
      }
    }

    return Response.json({
      success: true,
      synced: intents.data.length,
      updated: updated,
      message: `Synced ${intents.data.length} payment intents, updated ${updated} bookings`
    });
  } catch (error) {
    console.error('Error updating payment statuses:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});