import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Returns the PayMongo PUBLIC key + mode for client-side use (PayMongo.js card tokenization).
// Public keys (pk_*) are safe to expose to the frontend. The secret key is never returned.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const publicKey = Deno.env.get('PayMongo_Public_Key') || '';
    const secretKey = Deno.env.get('PayMongo_Secret_Key') || '';

    if (!publicKey) {
      console.error('PayMongo_Public_Key not set');
      return Response.json({ error: 'PayMongo public key not configured' }, { status: 500 });
    }

    const mode = secretKey.startsWith('sk_live') ? 'live' : 'test';

    return Response.json({
      success: true,
      publicKey,
      mode,
      methods: ['gcash', 'paymaya', 'grab_pay', 'card', 'billease', 'dob', 'dob_ubp', 'qrph']
    });
  } catch (error) {
    console.error('getPayMongoConfig error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});