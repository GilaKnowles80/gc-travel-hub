import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SUPPLIERS = [
  { name: 'biyaheko', url: 'https://biyaheko.ph' },
  { name: 'wanderlinx', url: 'https://mywanderlinx.com' },
  { name: 'tripzynx', url: 'https://tripzynx.com' }
];

const PRICE_DROP_THRESHOLD = 0.10; // 10% price drop triggers alert

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // NOTE: Scheduled automations don't have user context
    // Skip auth check for automated runs

    console.log('Starting price tracking...');

    // NOTE: Supplier scraping disabled - use Amadeus/Duffel APIs instead
    // This automation now only tracks internal price history
    
    const now = new Date().toISOString();
    const startTime = Date.now();

    // Update last_checked timestamp for active items (limit to 5 each to avoid timeout)
    const [flights, hotels, tours] = await Promise.all([
      base44.asServiceRole.entities.Flight.filter({ status: 'active' }, '-created_date', 5),
      base44.asServiceRole.entities.Hotel.filter({ status: 'active' }, '-created_date', 5),
      base44.asServiceRole.entities.Tour.filter({ status: 'active' }, '-created_date', 5)
    ]);

    // Batch updates in parallel for better performance
    const updates = [];
    
    for (const flight of flights) {
      updates.push(
        base44.asServiceRole.entities.Flight.update(flight.id, {
          price_tracking: {
            ...flight.price_tracking,
            last_checked: now
          }
        })
      );
    }

    for (const hotel of hotels) {
      updates.push(
        base44.asServiceRole.entities.Hotel.update(hotel.id, {
          price_tracking: {
            ...hotel.price_tracking,
            last_checked: now
          }
        })
      );
    }

    for (const tour of tours) {
      updates.push(
        base44.asServiceRole.entities.Tour.update(tour.id, {
          price_tracking: {
            ...tour.price_tracking,
            last_checked: now
          }
        })
      );
    }

    // Execute all updates in parallel
    await Promise.all(updates);
    const checked = updates.length;

    console.log(`Price tracking complete. Updated ${checked} items.`);

    return Response.json({
      success: true,
      checked,
      message: 'Supplier scraping disabled. Use Amadeus/Duffel APIs for real-time pricing.',
      runtime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
    });

  } catch (error) {
    console.error('Price tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// NOTE: Supplier scraping functions removed - too slow and unreliable
// Use Amadeus and Duffel APIs for real-time pricing instead