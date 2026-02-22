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
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('Starting price tracking...');

    // Only check 2 items per run to avoid timeout (supplier scraping is slow)
    const [flights, hotels, tours] = await Promise.all([
      base44.asServiceRole.entities.Flight.filter({ status: 'active' }, '-created_date', 1),
      base44.asServiceRole.entities.Hotel.filter({ status: 'active' }, '-created_date', 1),
      base44.asServiceRole.entities.Tour.filter({ status: 'active' }, '-created_date', 0)
    ]);

    const alerts = [];
    const now = new Date().toISOString();
    const startTime = Date.now();

    // Only track 2 items total (supplier scraping takes 5-10s per item × 3 suppliers)
    const allItems = [
      ...flights.map(f => ({ type: 'flight', entity: 'Flight', item: f })),
      ...hotels.map(h => ({ type: 'hotel', entity: 'Hotel', item: h }))
    ].slice(0, 2);

    console.log(`Checking ${allItems.length} items...`);

    for (const { type, entity, item } of allItems) {
      try {
        const priceChecks = await checkSupplierPrices(base44, type, item);
        const alert = await updatePriceTracking(base44, entity, item, priceChecks, now);
        if (alert) alerts.push(alert);
        console.log(`✓ Checked ${type}: ${item.id}`);
      } catch (error) {
        console.error(`✗ Failed to check ${type} ${item.id}:`, error.message);
      }
    }

    // Send email alerts for significant price drops
    if (alerts.length > 0) {
      await sendPriceAlerts(base44, alerts);
    }

    console.log(`Price tracking complete. ${alerts.length} alerts generated from ${checked} items.`);

    return Response.json({
      success: true,
      checked: checked,
      total: allItems.length,
      alerts: alerts.length,
      runtime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
    });

  } catch (error) {
    console.error('Price tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// NOTE: Supplier scraping functions removed - too slow and unreliable
// Use Amadeus and Duffel APIs for real-time pricing instead