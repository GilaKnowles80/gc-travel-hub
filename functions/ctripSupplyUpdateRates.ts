import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { hotel_id, room_type_code, rate_plan_code, date_from, date_to, rate } = await req.json();

    if (!hotel_id || !room_type_code || !date_from || !date_to || !rate) {
      return Response.json({ 
        error: 'Missing required fields: hotel_id, room_type_code, date_from, date_to, rate' 
      }, { status: 400 });
    }

    const supplyUrl = Deno.env.get('CTRIP_SUPPLY_API_URL');
    const apiKey = Deno.env.get('CTRIP_SUPPLY_API_KEY');
    const hotelCode = Deno.env.get('CTRIP_HOTEL_CODE');

    const payload = {
      hotel_code: hotelCode,
      room_type_code: room_type_code,
      rate_plan_code: rate_plan_code || 'BAR',
      date_from: date_from,
      date_to: date_to,
      rate: {
        currency: 'USD',
        amount: parseFloat(rate)
      }
    };

    console.log('Sending to Ctrip Supply API:', payload);

    const response = await fetch(`${supplyUrl}/rates/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('Ctrip Supply API response:', result);

    if (!response.ok) {
      throw new Error(`Ctrip Supply API error: ${result.message || response.status}`);
    }

    return Response.json({
      success: true,
      message: 'Rates updated successfully via Supply API',
      data: result
    });

  } catch (error) {
    console.error('Ctrip Supply rates error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});