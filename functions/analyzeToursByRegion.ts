import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlebigquery');

    const query = `
      SELECT
        t.destination as region,
        t.title as package_name,
        COUNT(b.id) as total_bookings,
        SUM(b.total_price) as total_revenue,
        AVG(t.rating) as avg_rating,
        COUNT(DISTINCT b.customer_email) as unique_customers
      FROM
        \`gc-travel-tours.Travel.Tour\` t
      LEFT JOIN
        \`gc-travel-tours.Travel.Booking\` b
      ON
        t.id = b.tour_id
      WHERE
        t.status = 'active'
      GROUP BY
        t.destination, t.title
      ORDER BY
        total_bookings DESC,
        total_revenue DESC
      LIMIT 50
    `;

    const response = await fetch('https://bigquery.googleapis.com/bigquery/v2/projects/gc-travel-tours/queries', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        useLegacySql: false,
        maxResults: 50
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('BigQuery API error:', error);
      return Response.json({ error: 'Failed to query BigQuery' }, { status: 500 });
    }

    const data = await response.json();

    if (data.rows && data.rows.length > 0) {
      const results = data.rows.map(row => ({
        region: row.f[0]?.v || 'Unknown',
        packageName: row.f[1]?.v || 'Unknown',
        bookings: parseInt(row.f[2]?.v || '0'),
        revenue: parseFloat(row.f[3]?.v || '0'),
        rating: parseFloat(row.f[4]?.v || '0'),
        customers: parseInt(row.f[5]?.v || '0')
      }));

      return Response.json({
        status: 'success',
        data: results,
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({
      status: 'success',
      data: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing tours by region:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});