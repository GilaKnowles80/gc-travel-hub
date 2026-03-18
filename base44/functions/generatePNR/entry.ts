import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_type, customer_name, booking_date } = await req.json();

    // Generate PNR format: 2-letter product code + 4-digit random + date suffix
    const productCodes = {
      flight: 'FL',
      hotel: 'HT',
      tour: 'TR',
      bus: 'BS',
      ferry: 'FR',
      cruise: 'CR',
      visa: 'VS',
      car_rental: 'CR',
      train: 'TN',
    };

    const code = productCodes[product_type] || 'BK';
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const datePart = new Date().toISOString().slice(2, 8).replace(/-/g, '');
    const pnr = `${code}${randomNum}${datePart}`;

    return Response.json({ pnr, generated_at: new Date().toISOString() });
  } catch (error) {
    console.error('PNR Generation Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});