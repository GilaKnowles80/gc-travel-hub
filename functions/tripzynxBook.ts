import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tour_id, travelers_list, departure_date, addons } = await req.json();

    // Get credentials
    const credentials = await base44.asServiceRole.entities.SupplierCredentials.filter({}, '-created_date', 1);
    if (!credentials.length || !credentials[0].tripzynx_username) {
      return Response.json({ error: 'Tripzynx credentials not configured' }, { status: 400 });
    }

    const { tripzynx_username, tripzynx_password } = credentials[0];

    // Tripzynx booking API endpoint
    const apiUrl = 'https://api.tripzynx.com/book';

    const payload = {
      username: tripzynx_username,
      password: tripzynx_password,
      tour_id,
      travelers_list,
      departure_date,
      addons
    };

    console.log('Tripzynx booking request:', { tour_id, departure_date });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Tripzynx booking error:', error);
      return Response.json({ error: 'Tripzynx booking failed', details: error }, { status: response.status });
    }

    const booking = await response.json();
    
    // Update supplier stats
    const suppliers = await base44.asServiceRole.entities.Supplier.filter({ company_name: 'Tripzynx' });
    if (suppliers.length > 0) {
      const supplier = suppliers[0];
      await base44.asServiceRole.entities.Supplier.update(supplier.id, {
        total_bookings: (supplier.total_bookings || 0) + 1
      });
    }
    
    // Track successful integration
    await base44.analytics.track({
      eventName: 'supplier_integration_success',
      properties: {
        supplier: 'tripzynx',
        operation: 'booking',
        tour_id,
        reference: booking.booking_id
      }
    });

    return Response.json({ 
      success: true, 
      supplier: 'tripzynx',
      booking,
      reference: booking.booking_id
    });

  } catch (error) {
    console.error('Tripzynx booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});