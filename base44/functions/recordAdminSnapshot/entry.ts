import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PH_AIRPORTS = ['MNL','CEB','DVO','ILO','BCD','KLO','LGP','MXI','CGY','ZAM','BXU','GES','TAG','CYP','TUG','CRK','LAO','MPH','PPS','RXS','SJI','TAC','VRC','WNP','DPL','ENI','MBO','OZC','MLP','SFE','TWT','USU','VIS'];
const INTL_AIRPORTS = ['LAX','HKG','SIN','KUL','BKK','HND','NRT','ICN','LHR','CDG','DXB','SYD','JFK','SFO','ORD','AMS','FRA','DOH','MEL','AUH','PVG','PEK','TPE','HAN','SGN'];

function isDomestic(booking) {
  const route = (booking.route || booking.price_comparison_notes || '').toUpperCase();
  const hasPh = PH_AIRPORTS.some(c => route.includes(c));
  const hasIntl = INTL_AIRPORTS.some(c => route.includes(c));
  return hasPh && !hasIntl;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both authenticated admin calls and scheduled automation calls
    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user?.role === 'admin') isAuthorized = true;
    } catch (_) {
      // Scheduled automation - use service role
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today + 'T00:00:00.000Z').toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch all data in parallel
    const [
      flightBookings, hotelBookings, tourBookings, carBookings,
      ferryBookings, busBookings, trainBookings, cruiseBookings, visaBookings,
      packages, payments, allUsers, affiliates, affiliateCommissions,
      premiumMembers, supportTickets, wallets
    ] = await Promise.all([
      base44.asServiceRole.entities.FlightBooking.list(),
      base44.asServiceRole.entities.HotelBooking.list(),
      base44.asServiceRole.entities.TourBooking.list(),
      base44.asServiceRole.entities.CarRentalBooking.list(),
      base44.asServiceRole.entities.FerryBooking.list(),
      base44.asServiceRole.entities.BusBooking.list(),
      base44.asServiceRole.entities.TrainBooking.list(),
      base44.asServiceRole.entities.CruiseBooking.list(),
      base44.asServiceRole.entities.TourBooking.list(), // visa uses TourBooking for now
      base44.asServiceRole.entities.PackageBooking.list(),
      base44.asServiceRole.entities.Payment.filter({ status: 'completed' }),
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.Affiliate.list(),
      base44.asServiceRole.entities.AffiliateCommission.list(),
      base44.asServiceRole.entities.PremiumMembership.filter({ status: 'active' }),
      base44.asServiceRole.entities.HelpdeskTicket.list(),
      base44.asServiceRole.entities.Wallet.list(),
    ]);

    const paidFilter = b => b.payment_status === 'paid' || b.status === 'confirmed';
    const allBookings = [
      ...flightBookings, ...hotelBookings, ...tourBookings, ...carBookings,
      ...ferryBookings, ...busBookings, ...trainBookings, ...cruiseBookings, ...packages
    ];

    // Revenue calculations
    const domesticFlights = flightBookings.filter(isDomestic);
    const internationalFlights = flightBookings.filter(b => !isDomestic(b));
    const domesticRevenue = domesticFlights.filter(paidFilter).reduce((s, b) => s + (b.total_price || 0), 0);
    const internationalRevenue = internationalFlights.filter(paidFilter).reduce((s, b) => s + (b.total_price || 0), 0);
    const otherRevenue = [...hotelBookings, ...tourBookings, ...carBookings, ...ferryBookings, ...busBookings, ...trainBookings, ...cruiseBookings, ...packages]
      .filter(paidFilter).reduce((s, b) => s + (b.total_price || b.final_price || 0), 0);
    const paymentRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const bookingRevenue = domesticRevenue + internationalRevenue + otherRevenue;
    const totalRevenue = Math.max(paymentRevenue, bookingRevenue);
    const totalProfit = totalRevenue * 0.12;

    // Customer metrics
    const newCustomersToday = allUsers.filter(u => u.created_date >= todayStart).length;
    const recentBookingEmails = new Set(allBookings
      .filter(b => b.created_date >= thirtyDaysAgo)
      .map(b => b.passenger_email || b.guest_email || b.customer_email || b.driver_email || b.user_email)
      .filter(Boolean));
    const activeCustomers = recentBookingEmails.size;
    const conversionRate = allUsers.length > 0 ? (activeCustomers / allUsers.length) * 100 : 0;

    // Revenue by type
    const revenueByType = {
      Flight: flightBookings.filter(paidFilter).reduce((s, b) => s + (b.total_price || 0), 0),
      Hotel: hotelBookings.filter(paidFilter).reduce((s, b) => s + (b.total_price || 0), 0),
      Tour: tourBookings.filter(paidFilter).reduce((s, b) => s + (b.total_price || 0), 0),
      Ferry: ferryBookings.filter(paidFilter).reduce((s, b) => s + (b.total_price || 0), 0),
      Bus: busBookings.filter(paidFilter).reduce((s, b) => s + (b.total_price || 0), 0),
      Train: trainBookings.filter(paidFilter).reduce((s, b) => s + (b.total_price || 0), 0),
      Car: carBookings.filter(paidFilter).reduce((s, b) => s + (b.total_price || 0), 0),
      Cruise: cruiseBookings.filter(paidFilter).reduce((s, b) => s + (b.total_price || 0), 0),
      Package: packages.filter(paidFilter).reduce((s, b) => s + (b.final_price || b.total_price || 0), 0),
    };

    // Support metrics
    const openTickets = supportTickets.filter(t => t.status === 'open' || t.status === 'pending').length;
    const resolvedTickets = supportTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

    // Wallet total
    const walletTotal = wallets.reduce((s, w) => s + (w.balance || 0), 0);

    // Premium revenue
    const premiumRevenue = premiumMembers.reduce((s, m) => s + (m.plan_type === 'monthly' ? (m.plan_price || 0) : (m.plan_price || 0) / 12), 0);

    const avgBookingValue = allBookings.length > 0 ? totalRevenue / allBookings.length : 0;

    const snapshot = {
      snapshot_date: today,
      total_revenue: totalRevenue,
      total_profit: totalProfit,
      total_bookings: allBookings.length,
      confirmed_bookings: allBookings.filter(b => b.status === 'confirmed').length,
      pending_bookings: allBookings.filter(b => b.status === 'pending').length,
      total_customers: allUsers.length,
      new_customers_today: newCustomersToday,
      active_customers: activeCustomers,
      flight_bookings: flightBookings.length,
      hotel_bookings: hotelBookings.length,
      tour_bookings: tourBookings.length,
      ferry_bookings: ferryBookings.length,
      bus_bookings: busBookings.length,
      train_bookings: trainBookings.length,
      car_bookings: carBookings.length,
      cruise_bookings: cruiseBookings.length,
      visa_bookings: 0,
      package_bookings: packages.length,
      domestic_flight_count: domesticFlights.length,
      international_flight_count: internationalFlights.length,
      domestic_revenue: domesticRevenue,
      international_revenue: internationalRevenue,
      active_affiliates: affiliates.filter(a => a.status === 'active').length,
      affiliate_commissions: affiliateCommissions.reduce((s, c) => s + (c.commission_amount || 0), 0),
      premium_members: premiumMembers.length,
      premium_revenue: premiumRevenue,
      avg_booking_value: avgBookingValue,
      conversion_rate: conversionRate,
      open_support_tickets: openTickets,
      resolved_support_tickets: resolvedTickets,
      wallet_balance_total: walletTotal,
      revenue_by_type: revenueByType,
    };

    // Check if today's snapshot already exists (upsert pattern)
    const existing = await base44.asServiceRole.entities.AdminSnapshot.filter({ snapshot_date: today });
    let result;
    if (existing && existing.length > 0) {
      result = await base44.asServiceRole.entities.AdminSnapshot.update(existing[0].id, snapshot);
      console.log(`Updated snapshot for ${today}`);
    } else {
      result = await base44.asServiceRole.entities.AdminSnapshot.create(snapshot);
      console.log(`Created snapshot for ${today}`);
    }

    return Response.json({ success: true, snapshot_date: today, snapshot: result });
  } catch (error) {
    console.error('recordAdminSnapshot error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});