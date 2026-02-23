import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_type, item_id, guest_details, special_requests } = await req.json();

    // Get credentials
    const credentials = await base44.asServiceRole.entities.SupplierCredentials.filter({}, '-created_date', 1);
    if (!credentials.length || !credentials[0].wanderlinx_email) {
      return Response.json({ error: 'Wanderlinx credentials not configured' }, { status: 400 });
    }

    const { wanderlinx_email, wanderlinx_password } = credentials[0];

    // Wanderlinx booking API endpoint
    const apiUrl = 'https://api.mywanderlinx.com/book';

    const payload = {
      email: wanderlinx_email,
      password: wanderlinx_password,
      booking_type,
      item_id,
      guest_details,
      special_requests
    };

    console.log('Wanderlinx booking request:', { booking_type, item_id });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Wanderlinx booking error:', error);
      return Response.json({ error: 'Wanderlinx booking failed', details: error }, { status: response.status });
    }

    const booking = await response.json();
    
    // Update supplier stats
    const suppliers = await base44.asServiceRole.entities.Supplier.filter({ company_name: 'Wanderlinx' });
    if (suppliers.length > 0) {
      const supplier = suppliers[0];
      await base44.asServiceRole.entities.Supplier.update(supplier.id, {
        total_bookings: (supplier.total_bookings || 0) + 1
      });
    }

    return Response.json({ 
      success: true, 
      supplier: 'wanderlinx',
      booking,
      reference: booking.confirmation_code
    });

  } catch (error) {
    console.error('Wanderlinx booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});