import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const signature = req.headers.get('paymongo-signature');
    const payload = await req.text();

    // Verify webhook signature (optional but recommended)
    // const webhookSecret = Deno.env.get('PAYMONGO_WEBHOOK_SECRET');
    
    const event = JSON.parse(payload);
    console.log('PayMongo webhook event:', event.data.attributes.type);

    // Handle payment.paid event
    if (event.data.attributes.type === 'payment.paid') {
      const paymentIntent = event.data.attributes.data;
      const metadata = paymentIntent.attributes.metadata;
      
      if (!metadata || !metadata.booking_id || !metadata.booking_type) {
        console.log('Missing metadata in payment intent');
        return Response.json({ received: true });
      }

      const { booking_id, booking_type } = metadata;
      console.log(`Processing payment for ${booking_type} booking ${booking_id}`);

      // Update booking based on type
      switch (booking_type) {
        case 'flight':
          await base44.asServiceRole.entities.FlightBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'hotel':
          await base44.asServiceRole.entities.HotelBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'ferry':
          await base44.asServiceRole.entities.FerryBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'cruise':
          await base44.asServiceRole.entities.CruiseBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'train':
          await base44.asServiceRole.entities.TrainBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'tour':
          await base44.asServiceRole.entities.Booking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'car':
          await base44.asServiceRole.entities.CarRentalBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'bus':
          await base44.asServiceRole.entities.BusBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'visa':
          await base44.asServiceRole.entities.VisaAppointment.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'insurance':
          await base44.asServiceRole.entities.InsurancePolicy.update(booking_id, {
            payment_status: 'paid',
            status: 'active'
          });
          break;
        
        default:
          console.log(`Unknown booking type: ${booking_type}`);
      }

      // Send confirmation notification
      const booking = await base44.asServiceRole.entities[getEntityName(booking_type)].get(booking_id);
      if (booking) {
        const userEmail = booking.passenger_email || booking.guest_email || booking.renter_email || booking.applicant_email || booking.user_email;
        
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: userEmail,
          subject: 'Payment Confirmed - GC Travel & Tours',
          body: `Your payment has been confirmed for booking ${booking_id}. You will receive your booking details shortly.`
        });

        // Credit wallet with 5% cashback
        try {
          await base44.asServiceRole.functions.invoke('creditWalletOnBooking', {
            user_email: userEmail,
            booking_id: booking_id,
            booking_type: booking_type,
            payment_amount: paymentIntent.attributes.amount / 100,
            payment_method: 'paymongo'
          });
        } catch (err) { console.error('Wallet credit error:', err.message); }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('PayMongo webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getEntityName(bookingType) {
  const mapping = {
    flight: 'FlightBooking',
    hotel: 'HotelBooking',
    ferry: 'FerryBooking',
    cruise: 'CruiseBooking',
    train: 'TrainBooking',
    tour: 'Booking',
    car: 'CarRentalBooking',
    bus: 'BusBooking',
    visa: 'VisaAppointment',
    insurance: 'InsurancePolicy'
  };
  return mapping[bookingType] || 'Booking';
}