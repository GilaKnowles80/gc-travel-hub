import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { supplier_id, start_date, end_date, action } = await req.json();

    if (!supplier_id) {
      return Response.json({ error: 'Supplier ID required' }, { status: 400 });
    }

    // Get supplier data
    const supplier = await base44.asServiceRole.entities.Supplier.get(supplier_id);

    // Fetch all bookings for the supplier
    const [flights, hotels, tours, ferries, trains, cruises] = await Promise.all([
      base44.asServiceRole.entities.FlightBooking.filter({ supplier: supplier.company_name }),
      base44.asServiceRole.entities.HotelBooking.filter({ supplier: supplier.company_name }),
      base44.asServiceRole.entities.Booking.filter({ supplier: supplier.company_name }),
      base44.asServiceRole.entities.FerryBooking.filter({ supplier: supplier.company_name }),
      base44.asServiceRole.entities.TrainBooking.filter({ supplier: supplier.company_name }),
      base44.asServiceRole.entities.CruiseBooking.filter({ supplier: supplier.company_name })
    ]);

    const allBookings = [...flights, ...hotels, ...tours, ...ferries, ...trains, ...cruises].map(b => ({
      ...b,
      type: flights.includes(b) ? 'flight' : hotels.includes(b) ? 'hotel' : 
            tours.includes(b) ? 'tour' : ferries.includes(b) ? 'ferry' : 
            trains.includes(b) ? 'train' : 'cruise'
    }));

    // Filter by date range
    const filteredBookings = allBookings.filter(b => {
      const bookingDate = new Date(b.created_date);
      if (start_date && bookingDate < new Date(start_date)) return false;
      if (end_date && bookingDate > new Date(end_date)) return false;
      return true;
    });

    if (action === 'export') {
      // Generate CSV export
      const csv = generateCSV(filteredBookings);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=analytics-${supplier_id}-${Date.now()}.csv`
        }
      });
    }

    // Calculate analytics
    const analytics = {
      overview: calculateOverview(filteredBookings),
      trends: calculateTrends(filteredBookings),
      demographics: calculateDemographics(filteredBookings),
      popular_routes: calculatePopularRoutes(filteredBookings),
      seasonality: calculateSeasonality(allBookings),
      performance: calculatePerformance(filteredBookings, supplier)
    };

    return Response.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateOverview(bookings) {
  const total_revenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const total_bookings = bookings.length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  const avg_booking_value = total_bookings > 0 ? total_revenue / total_bookings : 0;

  return {
    total_revenue,
    total_bookings,
    confirmed,
    pending,
    cancelled,
    avg_booking_value,
    conversion_rate: total_bookings > 0 ? (confirmed / total_bookings * 100).toFixed(1) : 0
  };
}

function calculateTrends(bookings) {
  // Group by month
  const monthlyData = {};
  bookings.forEach(b => {
    const month = new Date(b.created_date).toISOString().substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { bookings: 0, revenue: 0 };
    }
    monthlyData[month].bookings++;
    monthlyData[month].revenue += b.total_price || 0;
  });

  return Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function calculateDemographics(bookings) {
  const byType = {};
  const byStatus = {};
  
  bookings.forEach(b => {
    byType[b.type] = (byType[b.type] || 0) + 1;
    byStatus[b.payment_status] = (byStatus[b.payment_status] || 0) + 1;
  });

  // Extract email domains as proxy for customer types
  const domains = bookings.map(b => {
    const email = b.passenger_email || b.guest_email || '';
    return email.split('@')[1];
  }).filter(Boolean);

  const domainCounts = {};
  domains.forEach(d => {
    domainCounts[d] = (domainCounts[d] || 0) + 1;
  });

  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain, count]) => ({ domain, count }));

  return {
    booking_types: Object.entries(byType).map(([type, count]) => ({ type, count })),
    payment_status: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    top_customer_domains: topDomains
  };
}

function calculatePopularRoutes(bookings) {
  const routes = {};
  
  bookings.forEach(b => {
    let route = '';
    if (b.type === 'flight') route = b.route || `${b.origin} - ${b.destination}`;
    else if (b.type === 'hotel') route = b.location || '';
    else if (b.type === 'train') route = `${b.origin_station} - ${b.destination_station}`;
    else if (b.type === 'ferry') route = `${b.origin_port} - ${b.destination_port}`;
    else if (b.type === 'cruise') route = b.departure_port || '';
    else route = b.tour_name || b.destination || 'Unknown';

    if (route) {
      if (!routes[route]) {
        routes[route] = { bookings: 0, revenue: 0 };
      }
      routes[route].bookings++;
      routes[route].revenue += b.total_price || 0;
    }
  });

  return Object.entries(routes)
    .map(([route, data]) => ({ route, ...data }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 10);
}

function calculateSeasonality(bookings) {
  const monthlyBookings = {};
  
  bookings.forEach(b => {
    const month = new Date(b.created_date).getMonth();
    monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((name, index) => ({
    month: name,
    bookings: monthlyBookings[index] || 0
  }));
}

function calculatePerformance(bookings, supplier) {
  const thisMonth = new Date().getMonth();
  const lastMonth = thisMonth - 1;
  
  const thisMonthBookings = bookings.filter(b => new Date(b.created_date).getMonth() === thisMonth);
  const lastMonthBookings = bookings.filter(b => new Date(b.created_date).getMonth() === lastMonth);
  
  const thisMonthRevenue = thisMonthBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  
  const revenueGrowth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : 0;
  
  const bookingGrowth = lastMonthBookings.length > 0
    ? ((thisMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length * 100).toFixed(1)
    : 0;

  return {
    current_month_revenue: thisMonthRevenue,
    last_month_revenue: lastMonthRevenue,
    revenue_growth: revenueGrowth,
    current_month_bookings: thisMonthBookings.length,
    last_month_bookings: lastMonthBookings.length,
    booking_growth: bookingGrowth,
    rating: supplier.rating || 0,
    total_bookings_all_time: supplier.total_bookings || 0
  };
}

function generateCSV(bookings) {
  const headers = ['Date', 'Type', 'Route/Location', 'Customer', 'Amount', 'Status', 'Payment Status'];
  const rows = bookings.map(b => [
    new Date(b.created_date).toLocaleDateString(),
    b.type,
    b.route || b.location || b.tour_name || 'N/A',
    b.passenger_name || b.guest_name || 'N/A',
    b.total_price || 0,
    b.status,
    b.payment_status
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}