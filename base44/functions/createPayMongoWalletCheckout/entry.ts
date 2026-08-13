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

    const apiKey = Deno.env.get('PayMongo_Secret_Key');
    const auth = btoa(`${apiKey}:`);

    // Create PayMongo checkout session
    const checkoutResponse = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_payment_details: true,
            line_items: [
              {
                name: 'GC Travel Wallet Deposit',
                description: `Deposit ₱${amount}`,
                amount: Math.round(amount * 100), // PayMongo uses cents
                currency: 'PHP',
                quantity: 1,
              },
            ],
            payment_method_types: ['card', 'paymaya', 'gcash', 'grab_pay'],
            billing: {
              email: user.email,
            },
            reference_number: `WALLET-${user.email}-${Date.now()}`,
            description: `Wallet deposit for ${user.email}`,
          },
        },
      }),
    });

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.json();
      console.error('PayMongo checkout creation error:', error);
      throw new Error('Failed to create PayMongo checkout');
    }

    const checkout = await checkoutResponse.json();

    console.log(`PayMongo checkout created for ${user.email}: ${checkout.data.id}`);

    return Response.json({
      success: true,
      checkoutId: checkout.data.id,
      checkoutUrl: checkout.data.attributes.checkout_url,
      reference: checkout.data.attributes.reference_number,
    });
  } catch (error) {
    console.error('PayMongo checkout error:', error);
    return Response.json(
      { error: error.message || 'Failed to create PayMongo checkout' },
      { status: 500 }
    );
  }
});