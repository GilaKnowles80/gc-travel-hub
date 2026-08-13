import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, description, booking_id, booking_type, paymentMethod } = await req.json();
    const bookingId = booking_id;
    const bookingType = booking_type;

    if (!amount || !description) {
      return Response.json({ error: 'Amount and description are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('PayMongo_Secret_Key') || Deno.env.get('PayMongo_API_KEY');
    if (!apiKey) {
      console.error('PayMongo_Secret_Key not set');
      return Response.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    // Create PayMongo Payment Intent or Source based on payment method
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(apiKey + ':')}`
    };

    let paymentData;

    if (paymentMethod === 'gcash' || paymentMethod === 'paymaya' || paymentMethod === 'grabpay') {
      // Create Source for e-wallet payments (generates QR code)
      const sourceResponse = await fetch('https://api.paymongo.com/v1/sources', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: {
            attributes: {
              type: paymentMethod,
              amount: Math.round(amount * 100), // Convert to centavos
              currency: 'PHP',
              redirect: {
                success: `${Deno.env.get('BASE44_APP_URL')}/BookingConfirmation?id=${bookingId}`,
                failed: `${Deno.env.get('BASE44_APP_URL')}/MyBookings`
              },
              billing: {
                name: user.full_name,
                email: user.email
              },
              description: description,
              metadata: {
                booking_id: bookingId,
                booking_type: bookingType,
                base44_app_id: Deno.env.get('BASE44_APP_ID')
              }
            }
          }
        })
      });

      if (!sourceResponse.ok) {
        const error = await sourceResponse.text();
        console.error('PayMongo Source creation failed:', error);
        return Response.json({ error: 'Failed to create payment' }, { status: 500 });
      }

      const source = await sourceResponse.json();
      paymentData = {
        source_id: source.data.id,
        checkout_url: source.data.attributes.redirect.checkout_url,
        qr_code: source.data.attributes.redirect.checkout_url, // QR code URL
        status: source.data.attributes.status,
        payment_method: paymentMethod
      };

    } else if (paymentMethod === 'bank_transfer') {
      // Create Payment Intent for bank transfers
      const intentResponse = await fetch('https://api.paymongo.com/v1/payment_intents', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: {
            attributes: {
              amount: Math.round(amount * 100),
              currency: 'PHP',
              payment_method_allowed: ['paymaya', 'gcash', 'grab_pay', 'billease', 'dob', 'dob_ubp'],
              description: description,
              statement_descriptor: 'GC Travel',
              metadata: {
                booking_id: bookingId,
                booking_type: bookingType,
                user_email: user.email,
                base44_app_id: Deno.env.get('BASE44_APP_ID')
              }
            }
          }
        })
      });

      if (!intentResponse.ok) {
        const error = await intentResponse.text();
        console.error('PayMongo Intent creation failed:', error);
        return Response.json({ error: 'Failed to create payment intent' }, { status: 500 });
      }

      const intent = await intentResponse.json();
      paymentData = {
        intent_id: intent.data.id,
        client_key: intent.data.attributes.client_key,
        status: intent.data.attributes.status,
        payment_method: 'bank_transfer'
      };
    }

    // Store payment reference in database if needed
    // You can create a Payment entity to track these

    return Response.json({ success: true, payment: paymentData });

  } catch (error) {
    console.error('Payment creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});