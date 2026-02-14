import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    await base44.auth.me();

    const markup = parseFloat(Deno.env.get("FLIGHT_MARKUP_PERCENTAGE") || "15");

    return Response.json({ markup });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});