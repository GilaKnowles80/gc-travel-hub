import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { bookings, bookingType, chunkSize = 100 } = await req.json();

    if (!bookings || !Array.isArray(bookings)) {
      return Response.json({ error: 'Invalid bookings array' }, { status: 400 });
    }

    const entityMap = {
      flight: 'FlightBooking',
      hotel: 'HotelBooking',
      tour: 'Booking',
      bulk: 'BulkBooking'
    };

    const entityName = entityMap[bookingType];
    if (!entityName) {
      return Response.json({ error: 'Invalid booking type' }, { status: 400 });
    }

    // Process in chunks to avoid memory issues
    const chunks = [];
    for (let i = 0; i < bookings.length; i += chunkSize) {
      chunks.push(bookings.slice(i, i + chunkSize));
    }

    const results = {
      totalChunks: chunks.length,
      totalBookings: bookings.length,
      processed: 0,
      failed: 0,
      chunkResults: []
    };

    // Process chunks sequentially with delays
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const created = await base44.asServiceRole.entities[entityName].bulkCreate(chunk);
        results.processed += chunk.length;
        results.chunkResults.push({
          chunkIndex: i,
          count: chunk.length,
          status: 'success'
        });

        console.log(`Chunk ${i + 1}/${chunks.length} processed: ${chunk.length} bookings`);

        // Delay between chunks to prevent rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`Chunk ${i} failed:`, error);
        results.failed += chunk.length;
        results.chunkResults.push({
          chunkIndex: i,
          count: chunk.length,
          status: 'failed',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      results,
      message: `Bulk processing complete: ${results.processed}/${results.totalBookings} bookings created`
    });

  } catch (error) {
    console.error('Bulk booking processor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});