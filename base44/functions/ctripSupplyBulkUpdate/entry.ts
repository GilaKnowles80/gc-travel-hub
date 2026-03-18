import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { updates } = await req.json();

    if (!updates || !Array.isArray(updates)) {
      return Response.json({ 
        error: 'Missing or invalid updates array' 
      }, { status: 400 });
    }

    const supplyUrl = Deno.env.get('CTRIP_SUPPLY_API_URL');
    const apiKey = Deno.env.get('CTRIP_SUPPLY_API_KEY');
    const hotelCode = Deno.env.get('CTRIP_HOTEL_CODE');

    const payload = {
      hotel_code: hotelCode,
      updates: updates.map(u => ({
        room_type_code: u.room_type_code,
        date_from: u.date_from,
        date_to: u.date_to,
        inventory: u.inventory,
        rate: u.rate ? {
          rate_plan_code: u.rate_plan_code || 'BAR',
          currency: 'USD',
          amount: parseFloat(u.rate)
        } : undefined
      }))
    };

    console.log('Bulk update to Ctrip Supply API:', payload);

    const response = await fetch(`${supplyUrl}/bulk/update`, {
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
      message: `Bulk updated ${updates.length} items successfully`,
      data: result
    });

  } catch (error) {
    console.error('Ctrip Supply bulk update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});