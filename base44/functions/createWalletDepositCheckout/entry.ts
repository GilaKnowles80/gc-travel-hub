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

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Wallet Deposit',
              description: `Add ₱${amount} to your GC Travel wallet`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin') || 'https://app.example.com'}/wallet?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${req.headers.get('origin') || 'https://app.example.com'}/wallet?status=cancelled`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        wallet_amount: amount.toString(),
      },
    });

    console.log(`Checkout session created for ${user.email}: ${session.id}`);

    return Response.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Wallet deposit checkout error:', error);
    return Response.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
});