import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Creates a PayPal order for a Premium Membership (monthly ₱499 / annual ₱4,990)
// and returns the PayPal approval URL. After the user approves on PayPal, they
// are redirected back to /PremiumMembership where capturePayPalOrder captures
// the payment and activates the membership (booking_type 'premium').
const PAYPAL_API_BASE = Deno.env.get('PAYPAL_MODE') === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const secret = Deno.env.get('PAYPAL_SECRET');
  const auth = btoa(`${clientId}:${secret}`);
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan_type } = await req.json();
    const plan = plan_type === 'annual'
      ? { price: 4990, label: 'Annual' }
      : { price: 499, label: 'Monthly' };

    const accessToken = await getPayPalAccessToken();
    const origin = new URL(req.url).origin;

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'PHP', value: plan.price.toFixed(2) },
        description: `GC Travel Premium — ${plan.label} Membership`,
        custom_id: `premium-${plan_type}-${user.email}`,
      }],
      application_context: {
        brand_name: 'GC Travel and Tours Agency',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${origin}/PremiumMembership?paypal=1&plan_type=${plan_type}`,
        cancel_url: `${origin}/PremiumMembership?cancelled=1`,
      },
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const order = await response.json();
    if (!response.ok) {
      console.error('PayPal order creation failed:', order);
      return Response.json(
        { error: order.message || 'Failed to create PayPal order' },
        { status: response.status }
      );
    }

    // Pending payment record — completed on capture
    await base44.entities.Payment.create({
      user_email: user.email,
      booking_type: 'premium',
      booking_id: `premium-${plan_type}-${Date.now()}`,
      amount: plan.price,
      currency: 'PHP',
      payment_method: 'paypal',
      status: 'pending',
      metadata: { plan_type, paypal_order_id: order.id },
    });

    const approveLink = order.links?.find((l) => l.rel === 'approve')
      || order.links?.find((l) => l.rel === 'payer-action');

    console.log(`[PREMIUM] PayPal order ${order.id} for ${user.email} (${plan_type})`);
    return Response.json({ url: approveLink?.href, orderId: order.id, status: order.status });
  } catch (error) {
    console.error('createPremiumCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});