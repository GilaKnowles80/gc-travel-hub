import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Returns public-safe PayPal configuration for the frontend SDK.
// The client ID is safe to expose in the browser; the secret is never returned.
Deno.serve(async (req) => {
  try {
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    if (!clientId) {
      return Response.json({ error: "PayPal not configured" }, { status: 500 });
    }

    return Response.json({
      clientId,
      displayName: "ArGie-C Travel and Tours Agency",
      paymentLink: "https://www.paypal.com/ncp/payment/5K7C65YZDRMY2",
      mode: "live",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});