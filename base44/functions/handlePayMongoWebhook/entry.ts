import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ─── DISABLED ───────────────────────────────────────────────────────────
// PayMongo has been disconnected. This webhook handler is disabled and
// returns 410 Gone for all incoming events. Payment processing has moved
// to PayPal (see handlePayPalWebhook). Delete the PayMongo secrets in
// Settings to fully remove the integration.
// ──────────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  return Response.json(
    { received: false, disabled: true, message: "PayMongo webhook handler is disabled. Payments now processed via PayPal." },
    { status: 410 }
  );
});