import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all tours and bookings from local entities
    const tours = await base44.asServiceRole.entities.Tour.list();
    const bookings = await base44.asServiceRole.entities.Booking.list();

    // Group bookings by tour
    const bookingsByTour = {};
    bookings.forEach(booking => {
      if (!bookingsByTour[booking.tour_id]) {
        bookingsByTour[booking.tour_id] = [];
      }
      bookingsByTour[booking.tour_id].push(booking);
    });

    // Analyze tours by region
    const results = tours
      .filter(t => t.status === 'active')
      .map(tour => {
        const tourBookings = bookingsByTour[tour.id] || [];
        const confirmedBookings = tourBookings.filter(b => 
          b.status === 'confirmed' || b.payment_status === 'paid'
        );

        return {
          region: tour.destination || 'Unknown',
          packageName: tour.title,
          bookings: confirmedBookings.length,
          revenue: confirmedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0),
          rating: tour.rating || 0,
          customers: new Set(confirmedBookings.map(b => b.customer_email)).size
        };
      })
      .filter(t => t.bookings > 0)
      .sort((a, b) => b.bookings - a.bookings || b.revenue - a.revenue);

    return Response.json({
      status: 'success',
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing tours by region:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});