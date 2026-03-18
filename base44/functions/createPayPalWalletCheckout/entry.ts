import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    const auth = btoa(`${Deno.env.get('PAYPAL_CLIENT_ID')}:${Deno.env.get('PAYPAL_SECRET')}`);

    // Create PayPal order
    const orderResponse = await fetch('https://api.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'PHP',
              value: amount.toFixed(2),
            },
            description: 'GC Travel Wallet Deposit',
          },
        ],
        payer: {
          email_address: user.email,
        },
        return_url: `${req.headers.get('origin') || 'https://app.example.com'}/wallet?payment_method=paypal&status=success`,
        cancel_url: `${req.headers.get('origin') || 'https://app.example.com'}/wallet?payment_method=paypal&status=cancelled`,
        application_context: {
          brand_name: 'GC Travel & Tours',
          locale: 'en-US',
          return_url: `${req.headers.get('origin') || 'https://app.example.com'}/wallet?payment_method=paypal&status=success`,
          cancel_url: `${req.headers.get('origin') || 'https://app.example.com'}/wallet?payment_method=paypal&status=cancelled`,
        },
      }),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      console.error('PayPal order creation error:', error);
      throw new Error('Failed to create PayPal order');
    }

    const order = await orderResponse.json();
    const approvalLink = order.links.find((link) => link.rel === 'approve');

    console.log(`PayPal order created for ${user.email}: ${order.id}`);

    return Response.json({
      success: true,
      orderId: order.id,
      approvalUrl: approvalLink?.href,
    });
  } catch (error) {
    console.error('PayPal checkout error:', error);
    return Response.json(
      { error: error.message || 'Failed to create PayPal checkout' },
      { status: 500 }
    );
  }
});