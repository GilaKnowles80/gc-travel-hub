import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@15.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      product_type,
      item_id,
      item_name,
      customer_name,
      customer_email,
      customer_phone,
      number_of_travelers,
      base_price,
      total_price,
      addons,
      payment_method,
    } = await req.json();

    // Generate PNR
    const pnrRes = await base44.functions.invoke('generatePNR', {
      product_type,
      customer_name,
      booking_date: new Date().toISOString(),
    });

    const pnr = pnrRes.pnr;

    // Create booking record
    const bookingEntity = `${product_type.charAt(0).toUpperCase() + product_type.slice(1)}Booking`;
    const booking = await base44.asServiceRole.entities[bookingEntity].create({
      [`${product_type === 'car_rental' ? 'driver' : 'customer'}_name`]: customer_name,
      [`${product_type === 'car_rental' ? 'driver' : 'customer'}_email`]: customer_email,
      [`${product_type === 'car_rental' ? 'driver' : 'customer'}_phone`]: customer_phone,
      [`${product_type}_id`]: item_id,
      [`${product_type}_reference`]: pnr,
      total_price,
      status: 'pending',
      payment_status: 'unpaid',
      supplier: 'direct',
    });

    // Create payment split record
    const paymentSplit = await base44.asServiceRole.entities.PaymentSplit.create({
      booking_id: booking.id,
      booking_type: product_type,
      total_amount: total_price,
      supplier_cost: base_price,
      markup_amount: addons.reduce((sum, a) => sum + a.price, 0),
      supplier: 'direct',
      supplier_payment_status: 'pending',
      bank_transfer_status: 'pending',
      currency: 'PHP',
      notes: `${product_type.toUpperCase()} booking via unified checkout`,
    });

    // Handle payment based on method
    if (payment_method === 'stripe') {
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'php',
              product_data: {
                name: `${item_name} (${number_of_travelers} traveler${number_of_travelers > 1 ? 's' : ''})`,
                description: `PNR: ${pnr}`,
              },
              unit_amount: Math.round(total_price * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: customer_email,
        success_url: `${Deno.env.get('BASE44_APP_URL')}/payment-success?booking_id=${booking.id}&pnr=${pnr}`,
        cancel_url: `${Deno.env.get('BASE44_APP_URL')}/payment-cancelled?booking_id=${booking.id}`,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          booking_id: booking.id,
          payment_split_id: paymentSplit.id,
          pnr,
          product_type,
        },
      });

      // Send confirmation email
      await base44.integrations.Core.SendEmail({
        to: customer_email,
        subject: `Booking Confirmation - PNR: ${pnr}`,
        body: `
Dear ${customer_name},

Thank you for booking with GC Travel and Tours!

Your booking reference: ${pnr}
Product: ${item_name}
Total Amount: ₱${total_price.toLocaleString()}

Please complete your payment to confirm this booking.

Best regards,
GC Travel and Tours Team
        `,
      });

      return Response.json({ checkout_url: session.url, pnr, booking_id: booking.id });
    }

    // For other payment methods, auto-confirm booking
    await base44.asServiceRole.entities[bookingEntity].update(booking.id, {
      status: 'confirmed',
      payment_status: 'paid',
    });

    await base44.asServiceRole.entities.PaymentSplit.update(paymentSplit.id, {
      supplier_payment_status: 'completed',
      bank_transfer_status: 'completed',
    });

    // Send confirmation email
    await base44.integrations.Core.SendEmail({
      to: customer_email,
      subject: `Booking Confirmed - PNR: ${pnr}`,
      body: `
Dear ${customer_name},

Your booking has been confirmed!

PNR: ${pnr}
Product: ${item_name}
Total Amount: ₱${total_price.toLocaleString()}
Payment Status: Received

You will receive further details via email shortly.

Best regards,
GC Travel and Tours Team
      `,
    });

    return Response.json({ pnr, booking_id: booking.id, status: 'confirmed' });
  } catch (error) {
    console.error('Unified Checkout Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});