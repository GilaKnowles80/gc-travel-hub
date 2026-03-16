import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ENTITY_MAP = {
  flight: 'FlightBooking',
  hotel: 'HotelBooking',
  ferry: 'FerryBooking',
  cruise: 'CruiseBooking',
  train: 'TrainBooking',
  tour: 'Booking',
  car: 'CarRentalBooking',
  bus: 'BusBooking',
  visa: 'VisaAppointment',
  insurance: 'InsurancePolicy',
};

Deno.serve(async (req) => {
  try {
    // Verify Xendit webhook token
    const incomingToken = req.headers.get('x-callback-token');
    const expectedToken = Deno.env.get('XENDIT_WEBHOOK_TOKEN');

    if (!expectedToken || incomingToken !== expectedToken) {
      console.warn('Xendit webhook: invalid or missing callback token');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Xendit webhook received:', body.event || body.status, body.external_id);

    const base44 = createClientFromRequest(req);

    // Xendit sends different event shapes for invoices vs payments
    const status = body.status;
    const externalId = body.external_id || body.id;
    const metadata = body.metadata || {};
    const paidAmount = body.paid_amount || body.amount || 0;

    // Only process PAID/SETTLED events
    if (status !== 'PAID' && status !== 'SETTLED') {
      console.log(`Xendit webhook: ignoring status ${status}`);
      return Response.json({ received: true });
    }

    const bookingRef = metadata.booking_ref || externalId;
    const bookingType = metadata.booking_type;
    const userEmail = metadata.user_email || body.payer_email;

    console.log(`Xendit PAID: ref=${bookingRef}, type=${bookingType}, amount=${paidAmount}`);

    // Update booking if we have type info
    if (bookingType && ENTITY_MAP[bookingType]) {
      const entityName = ENTITY_MAP[bookingType];
      const statusValue = bookingType === 'insurance' ? 'active' : 'confirmed';

      // Try to find booking by booking_ref field
      const bookings = await base44.asServiceRole.entities[entityName].filter({ booking_ref: bookingRef });
      if (bookings.length > 0) {
        await base44.asServiceRole.entities[entityName].update(bookings[0].id, {
          payment_status: 'paid',
          status: statusValue,
        });
        console.log(`Updated ${entityName} ${bookings[0].id} to paid/confirmed`);
      } else {
        console.warn(`No ${entityName} found with booking_ref=${bookingRef}`);
      }
    }

    // Send confirmation email
    if (userEmail) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: userEmail,
        subject: '✅ Payment Confirmed — GC Travel & Tours',
        body: `Your payment of ₱${Number(paidAmount).toLocaleString()} has been confirmed (Ref: ${bookingRef}). Thank you for booking with GC Travel & Tours!`,
      });

      // Credit wallet cashback
      try {
        await base44.asServiceRole.functions.invoke('creditWalletOnBooking', {
          user_email: userEmail,
          booking_id: bookingRef,
          booking_type: bookingType || 'general',
          payment_amount: paidAmount,
          payment_method: 'xendit',
        });
      } catch (err) {
        console.error('Wallet credit error:', err.message);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Xendit webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});