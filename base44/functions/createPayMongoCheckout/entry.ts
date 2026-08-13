import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// PayMongo checkout link (supports GCash, Maya, credit card, bank transfers)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      bookingType,
      bookingId,
      amount,       // PHP amount (e.g. 5000)
      description,
      successUrl,
      cancelUrl
    } = await req.json();

    if (!bookingType || !bookingId || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // PayMongo SECRET key (sk_live_... or sk_test_...)
    const apiKey = Deno.env.get('PayMongo_Secret_Key');
    if (!apiKey) {
      return Response.json({ error: 'PayMongo not configured' }, { status: 500 });
    }
    if (!apiKey.startsWith('sk_')) {
      console.error('[PAYMONGO] Key does not start with sk_ – likely a public key. Please set PAYMONGO_SECRET_KEY with your secret key.');
      return Response.json({ error: 'PayMongo secret key not configured. Please contact support.' }, { status: 500 });
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(apiKey + ':')}`
    };

    // Create PayMongo Checkout Session (supports all local PH payment methods)
    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            cancel_url: cancelUrl || 'https://gctravelandtours.com/PaymentCancelled',
            success_url: successUrl || 'https://gctravelandtours.com/PaymentSuccess',
            description: description || `GC Travel - ${bookingType} booking`,
            line_items: [{
              currency: 'PHP',
              amount: Math.round(amount * 100),
              description: description || `${bookingType} booking`,
              name: `GC Travel - ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} Booking`,
              quantity: 1
            }],
            payment_method_types: [
              'gcash',
              'paymaya',
              'grab_pay',
              'card',
              'billease',
              'dob',
              'dob_ubp',
              'qrph'
            ],
            metadata: {
              booking_type: bookingType,
              booking_id: bookingId,
              user_email: user.email,
              base44_app_id: Deno.env.get('BASE44_APP_ID')
            },
            billing: {
              name: user.full_name || '',
              email: user.email || '',
            }
          }
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[PAYMONGO ERROR]', JSON.stringify(result));
      return Response.json({ error: result?.errors?.[0]?.detail || 'PayMongo error' }, { status: 500 });
    }

    const checkoutUrl = result.data?.attributes?.checkout_url;
    const sessionId = result.data?.id;

    // Track payment
    try {
      await base44.entities.Payment.create({
        user_email: user.email,
        booking_type: bookingType,
        booking_id: bookingId,
        amount: amount,
        currency: 'PHP',
        payment_method: 'paymongo',
        status: 'pending',
      });
    } catch (err) {
      console.error('Payment record error:', err.message);
    }

    console.log(`[PAYMONGO] Session ${sessionId} created for ${bookingType}:${bookingId}`);

    return Response.json({
      success: true,
      checkoutUrl,
      sessionId
    });

  } catch (error) {
    console.error('[PAYMONGO CHECKOUT ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});