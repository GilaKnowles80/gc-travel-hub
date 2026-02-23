import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.6.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    console.log('Webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const paymentId = session.metadata.payment_id;
        const bookingId = session.metadata.booking_id;
        const bookingType = session.metadata.booking_type;
        
        // Handle package booking payment
        if (bookingType === 'package' && session.metadata.package_id) {
          await base44.asServiceRole.entities.PackageBooking.update(
            session.metadata.package_id,
            { status: 'paid' }
          );
          
          const paymentRecord = await base44.asServiceRole.entities.Payment.create({
            user_email: session.metadata.user_email,
            amount: session.amount_total / 100,
            currency: session.currency,
            status: 'completed',
            payment_method: 'stripe',
            stripe_session_id: session.id,
            metadata: {
              package_id: session.metadata.package_id,
              booking_type: 'package'
            }
          });
          
          // Send confirmation notification
          try {
            await base44.asServiceRole.entities.Notification.create({
              user_email: session.metadata.user_email,
              title: 'Package Booking Confirmed',
              message: 'Your custom travel package has been successfully booked and paid for!',
              type: 'payment_confirmed',
              booking_id: session.metadata.package_id,
              link: `/PackageBookingSuccess?package_id=${session.metadata.package_id}&session_id=${session.id}`
            });
          } catch (notifError) {
            console.error('Notification error:', notifError);
          }
          
          await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: 'GC Travel & Tours',
            to: session.customer_email,
            subject: 'Package Booking Confirmed - GC Travel & Tours',
            body: `
              <h2>Package Booking Confirmed!</h2>
              <p>Your custom travel package has been successfully booked.</p>
              <p><strong>Package ID:</strong> ${session.metadata.package_id}</p>
              <p><strong>Amount:</strong> $${session.amount_total / 100}</p>
              <p>View your booking details in My Packages section.</p>
              <p><a href="${req.headers.get('origin')}/PackageBookingSuccess?package_id=${session.metadata.package_id}&session_id=${session.id}">View Booking Confirmation</a></p>
            `
          });
          
          console.log(`Package booking completed: ${session.metadata.package_id}`);
          break;
        }

        // Update payment record if exists
        if (paymentId) {
          await base44.asServiceRole.entities.Payment.update(paymentId, {
            status: 'completed',
            stripe_payment_intent: session.payment_intent,
            payment_date: new Date().toISOString(),
            receipt_url: session.url
          });
          
          // Calculate and track affiliate commission
          try {
            await base44.asServiceRole.functions.invoke('calculateAffiliateCommission', {
              bookingId: bookingId,
              bookingType: bookingType,
              bookingAmount: session.amount_total / 100,
              customerEmail: session.metadata.user_email
            });
          } catch (commError) {
            console.error('Affiliate commission error:', commError);
          }
        }

        // Update booking payment status based on type
        if (bookingId && bookingType) {
          switch (bookingType) {
            case 'flight':
              await base44.asServiceRole.entities.FlightBooking.update(bookingId, {
                payment_status: 'paid',
                status: 'confirmed'
              });
              break;
            case 'hotel':
              await base44.asServiceRole.entities.HotelBooking.update(bookingId, {
                payment_status: 'paid',
                status: 'confirmed'
              });
              break;
            case 'ferry':
              await base44.asServiceRole.entities.FerryBooking.update(bookingId, {
                payment_status: 'paid',
                status: 'confirmed'
              });
              break;
            case 'cruise':
              await base44.asServiceRole.entities.CruiseBooking.update(bookingId, {
                payment_status: 'paid',
                status: 'confirmed'
              });
              break;
            case 'train':
              await base44.asServiceRole.entities.TrainBooking.update(bookingId, {
                payment_status: 'paid',
                status: 'confirmed'
              });
              break;
            case 'tour':
              const tourBooking = await base44.asServiceRole.entities.Booking.get(bookingId);
              await base44.asServiceRole.entities.Booking.update(bookingId, {
                payment_status: 'paid',
                status: 'confirmed'
              });
              
              // Track tour booking completion
              if (tourBooking) {
                try {
                  await base44.asServiceRole.analytics.track({
                    eventName: 'tour_booking_completed',
                    properties: {
                      booking_id: bookingId,
                      tour_id: tourBooking.tour_id,
                      tour_title: tourBooking.tour_title,
                      destination: tourBooking.destination,
                      travelers: tourBooking.number_of_travelers,
                      total_price: session.amount_total / 100,
                      currency: session.currency.toUpperCase(),
                      trip_type: tourBooking.trip_type
                    }
                  });
                } catch (trackError) {
                  console.error('Analytics tracking error:', trackError);
                }
              }
              break;
            case 'car':
              await base44.asServiceRole.entities.CarRentalBooking.update(bookingId, {
                payment_status: 'paid',
                status: 'confirmed'
              });
              break;
            case 'bus':
              await base44.asServiceRole.entities.BusBooking.update(bookingId, {
                payment_status: 'paid',
                status: 'confirmed'
              });
              break;
            case 'visa':
              await base44.asServiceRole.entities.VisaAppointment.update(bookingId, {
                payment_status: 'paid',
                status: 'confirmed'
              });
              break;
            case 'insurance':
              await base44.asServiceRole.entities.InsurancePolicy.update(bookingId, {
                payment_status: 'paid',
                status: 'active'
              });
              break;
            case 'bulk':
              await base44.asServiceRole.entities.BulkBooking.update(bookingId, {
                payment_status: 'paid',
                status: 'confirmed'
              });
              break;
          }
        }

        // Send confirmation email
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'GC Travel & Tours',
          to: session.customer_email,
          subject: 'Payment Confirmation - GC Travel & Tours',
          body: `
            <h2>Payment Confirmed!</h2>
            <p>Thank you for your payment.</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Amount:</strong> ${session.amount_total / 100} ${session.currency.toUpperCase()}</p>
            <p><strong>Status:</strong> Confirmed</p>
            <p>We'll send you booking details shortly.</p>
          `
        });

        console.log(`Payment completed for booking ${bookingId}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error('Payment failed:', paymentIntent.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        // Handle refund
        console.log('Refund processed:', charge.id);
        break;
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});