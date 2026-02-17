import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { dataType } = await req.json();

    const entityMap = {
      flights: 'Flight',
      hotels: 'Hotel',
      tours: 'Tour',
      visas: 'Visa',
      ferry: 'FerryBooking',
      bus: 'BusBooking',
      car: 'CarRentalBooking',
      insurance: 'TravelInsurance'
    };

    const entityName = entityMap[dataType];
    if (!entityName) {
      return Response.json({ error: 'Invalid dataType' }, { status: 400 });
    }

    // Fetch all records
    const records = await base44.asServiceRole.entities[entityName].list();

    return Response.json({
      dataType,
      count: records.length,
      exported_at: new Date().toISOString(),
      records
    });

  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});