import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { dataType, supplier, params = {} } = await req.json();

    let syncedData = [];

    // Real-time API sync logic based on supplier
    switch (supplier) {
      case 'amadeus':
        // Sync with Amadeus API
        if (dataType === 'flights') {
          const { data: flightData } = await base44.functions.invoke('searchFlightsAMADEUS', params);
          syncedData = flightData;
        } else if (dataType === 'hotels') {
          const { data: hotelData } = await base44.functions.invoke('searchHotelsAMADEUS', params);
          syncedData = hotelData;
        }
        break;

      case 'biyaheko':
        // Sync with Biyaheko
        console.log('Syncing with Biyaheko...');
        // Add Biyaheko API integration
        break;

      case 'wanderlinx':
        // Sync with Wanderlinx
        console.log('Syncing with Wanderlinx...');
        // Add Wanderlinx API integration
        break;

      default:
        return Response.json({ error: 'Unsupported supplier' }, { status: 400 });
    }

    // Store synced data to database
    const entityMap = {
      flights: 'Flight',
      hotels: 'Hotel',
      tours: 'Tour'
    };

    const entityName = entityMap[dataType];
    if (entityName && syncedData.length > 0) {
      // Store with timestamp for tracking
      const recordsWithMeta = syncedData.map(record => ({
        ...record,
        last_synced: new Date().toISOString(),
        sync_source: supplier
      }));

      await base44.asServiceRole.entities[entityName].bulkCreate(recordsWithMeta);
    }

    return Response.json({
      success: true,
      supplier,
      dataType,
      synced: syncedData.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});