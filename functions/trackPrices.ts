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

async function checkSupplierPrices(base44, itemType, item) {
  const checks = [];

  for (const supplier of SUPPLIERS) {
    try {
      // Use LLM to extract price from supplier website
      const searchQuery = buildSearchQuery(itemType, item);
      
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a price checker. Visit ${supplier.url} and find the current price for this ${itemType}:
        
${searchQuery}

Search the website and return ONLY a JSON object with the price in this exact format:
{
  "price": <number or null if not found>,
  "available": <boolean>
}

If the item is not available or you cannot find a price, return {"price": null, "available": false}.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            price: { type: ["number", "null"] },
            available: { type: "boolean" }
          },
          required: ["price", "available"]
        }
      });

      if (result.available && result.price) {
        checks.push({
          supplier: supplier.name,
          price: result.price,
          checked_at: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error(`Error checking ${supplier.name}:`, error.message);
    }
  }

  return checks;
}

function buildSearchQuery(itemType, item) {
  if (itemType === 'flight') {
    return `Flight ${item.flight_number} from ${item.origin} to ${item.destination} on ${item.departure_time}`;
  } else if (itemType === 'hotel') {
    return `Hotel: ${item.name} in ${item.location}`;
  } else if (itemType === 'tour') {
    return `Tour: ${item.title} to ${item.destination}, ${item.duration_days} days`;
  }
  return '';
}

async function updatePriceTracking(base44, entityName, item, newChecks, now) {
  if (newChecks.length === 0) return null;

  const priceTracking = item.price_tracking || { price_history: [] };
  const priceHistory = priceTracking.price_history || [];

  // Add new checks to history
  priceHistory.push(...newChecks);

  // Find best current price
  const bestPrice = newChecks.reduce((best, check) => 
    !best || check.price < best.price ? check : best
  , null);

  // Check for significant price drop
  let alert = null;
  if (priceTracking.best_price && bestPrice.price < priceTracking.best_price.price) {
    const dropPercentage = (priceTracking.best_price.price - bestPrice.price) / priceTracking.best_price.price;
    
    if (dropPercentage >= PRICE_DROP_THRESHOLD) {
      alert = {
        itemType: entityName,
        itemId: item.id,
        itemName: item.title || item.name || `${item.origin}-${item.destination}`,
        oldPrice: priceTracking.best_price.price,
        newPrice: bestPrice.price,
        dropPercentage: (dropPercentage * 100).toFixed(1),
        supplier: bestPrice.supplier
      };
    }
  }

  // Update entity
  await base44.asServiceRole.entities[entityName].update(item.id, {
    price_tracking: {
      last_checked: now,
      price_history: priceHistory.slice(-50), // Keep last 50 entries
      best_price: bestPrice
    }
  });

  return alert;
}

async function sendPriceAlerts(base44, alerts) {
  const markup = parseFloat(Deno.env.get("FLIGHT_MARKUP_PERCENTAGE") || "15");

  const emailBody = `
    <h2>🔔 Price Drop Alerts - Profit Opportunities</h2>
    <p>The following items have significant price drops with excellent profit margins:</p>
    <ul>
      ${alerts.map(alert => {
        const expectedPrice = alert.newPrice * (1 + markup / 100);
        const profitAmount = expectedPrice - alert.newPrice;
        const profitMargin = markup;
        
        return `
        <li style="margin-bottom: 15px;">
          <strong>${alert.itemName}</strong> (${alert.itemType})<br>
          <span style="color: #dc2626;">Old Supplier Price: ₱${alert.oldPrice.toFixed(2)}</span><br>
          <span style="color: #059669; font-weight: bold;">New Supplier Price: ₱${alert.newPrice.toFixed(2)} @ ${alert.supplier}</span><br>
          <span style="color: #f59e0b; font-weight: bold;">💰 Expected Profit: ₱${profitAmount.toFixed(2)} (${profitMargin}% margin)</span><br>
          <span style="color: green; font-weight: bold;">📉 Price Drop: ${alert.dropPercentage}%</span>
        </li>
      `}).join('')}
    </ul>
    <p><strong>Action Required:</strong> Book these items now to maximize profit margins!</p>
    <p><em>Profit calculations based on ${markup}% markup percentage.</em></p>
  `;

  try {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'info@gctraveltours.com',
      subject: `💰 ${alerts.length} Profit Opportunit${alerts.length > 1 ? 'ies' : 'y'} - Price Drops Detected`,
      body: emailBody
    });
    console.log('Price alert email sent successfully');
  } catch (error) {
    console.error('Error sending alert email:', error.message);
  }
}