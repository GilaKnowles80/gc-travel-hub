import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_type, item_id, passenger_details, payment_method } = await req.json();

    // Get credentials
    const credentials = await base44.asServiceRole.entities.SupplierCredentials.filter({}, '-created_date', 1);
    if (!credentials.length || !credentials[0].biyaheko_terminal_id) {
      return Response.json({ error: 'Biyaheko credentials not configured' }, { status: 400 });
    }

    const { biyaheko_terminal_id, biyaheko_user_id, biyaheko_password } = credentials[0];

    // Biyaheko booking API endpoint
    const apiUrl = 'https://api.biyaheko.ph/book';

    const payload = {
      terminal_id: biyaheko_terminal_id,
      user_id: biyaheko_user_id,
      password: biyaheko_password,
      booking_type,
      item_id,
      passenger_details,
      payment_method
    };

    console.log('Biyaheko booking request:', { booking_type, item_id });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Biyaheko booking error:', error);
      return Response.json({ error: 'Biyaheko booking failed', details: error }, { status: response.status });
    }

    const booking = await response.json();
    
    // Update supplier stats
    const suppliers = await base44.asServiceRole.entities.Supplier.filter({ company_name: 'Biyaheko' });
    if (suppliers.length > 0) {
      const supplier = suppliers[0];
      await base44.asServiceRole.entities.Supplier.update(supplier.id, {
        total_bookings: (supplier.total_bookings || 0) + 1
      });
    }

    return Response.json({ 
      success: true, 
      supplier: 'biyaheko',
      booking,
      reference: booking.reference_number
    });

  } catch (error) {
    console.error('Biyaheko booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});