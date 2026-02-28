import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = await import('npm:stripe@14.21.0');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      bookingType, 
      bookingId, 
      customerEmail, 
      amount, 
      currency = 'usd',
      successUrl,
      cancelUrl 
    } = body;

    if (!bookingType || !bookingId || !customerEmail || !amount || !successUrl || !cancelUrl) {
      return Response.json(
        { error: 'Missing required fields: bookingType, bookingId, customerEmail, amount, successUrl, cancelUrl' },
        { status: 400 }
      );
    }

    // Product ID mapping
    const productMap = {
      flight: 'prod_U44Q61woWo8gJF',
      hotel: 'prod_U44QLef462oLTH',
      tour: 'prod_U44Q9o7seIGXeh',
      ferry: 'prod_U44Q29Cc123de5',
      bus: 'prod_U44QbV58DK58HD'
    };

    const productId = productMap[bookingType.toLowerCase()];
    if (!productId) {
      return Response.json(
        { error: `Invalid booking type: ${bookingType}` },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    // Create checkout session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product: productId,
            unit_amount: Math.round(amount * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        booking_type: bookingType,
        booking_id: bookingId,
        user_email: user.email
      }
    });

    console.log('Checkout session created:', session.id);

    return Response.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});