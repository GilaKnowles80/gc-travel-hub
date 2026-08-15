import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id, booking_type } = await req.json();

    if (!booking_id || !booking_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the caller owns the booking (user-scoped fetch respects each booking
    // entity's RLS — only the owner's bookings are returned) and derive the amount
    // server-side so a caller cannot award themselves arbitrary points.
    const BOOKING_ENTITIES = {
      flight: 'FlightBooking', hotel: 'HotelBooking', tour: 'TourBooking',
      bus: 'BusBooking', ferry: 'FerryBooking', car: 'CarRentalBooking',
      train: 'TrainBooking', cruise: 'CruiseBooking', package: 'PackageBooking',
    };
    const entityName = BOOKING_ENTITIES[booking_type];
    if (!entityName) {
      return Response.json({ error: 'Invalid booking_type' }, { status: 400 });
    }
    const found = await base44.entities[entityName].filter({ id: booking_id });
    const booking = found?.[0];
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (booking.status && booking.status !== 'confirmed') {
      return Response.json({ error: 'Booking must be confirmed to earn points' }, { status: 400 });
    }
    const booking_amount = Number(booking.total_price) || 0;
    if (booking_amount <= 0) {
      return Response.json({ error: 'Booking amount unavailable' }, { status: 400 });
    }

    // Prevent double-award for the same booking.
    const alreadyAwarded = await base44.asServiceRole.entities.LoyaltyTransaction.filter({
      booking_id, user_email: user.email,
    });
    if (alreadyAwarded.length > 0) {
      return Response.json({ error: 'Points already awarded for this booking' }, { status: 400 });
    }

    // Get loyalty settings
    const settingsList = await base44.asServiceRole.entities.LoyaltySettings.list();
    const settings = settingsList[0];

    if (!settings) {
      return Response.json({ error: 'Loyalty program not configured' }, { status: 500 });
    }

    // Get or create loyalty account
    const accounts = await base44.asServiceRole.entities.LoyaltyAccount.filter({ 
      user_email: user.email 
    });
    let account = accounts[0];

    if (!account) {
      account = await base44.asServiceRole.entities.LoyaltyAccount.create({
        user_email: user.email,
        points_balance: 0,
        lifetime_points: 0,
        tier: 'bronze',
      });
    }

    // Calculate points with tier bonus
    const basePoints = Math.floor(booking_amount * settings.points_per_peso);
    const tierBonus = {
      bronze: settings.bronze_bonus || 0,
      silver: settings.silver_bonus || 10,
      gold: settings.gold_bonus || 25,
      platinum: settings.platinum_bonus || 50,
    }[account.tier] || 0;

    const bonusPoints = Math.floor(basePoints * (tierBonus / 100));
    const totalPoints = basePoints + bonusPoints;

    // Update account
    const newBalance = (account.points_balance || 0) + totalPoints;
    const newLifetime = (account.lifetime_points || 0) + totalPoints;

    // Determine new tier
    let newTier = 'bronze';
    if (newLifetime >= settings.platinum_threshold) newTier = 'platinum';
    else if (newLifetime >= settings.gold_threshold) newTier = 'gold';
    else if (newLifetime >= settings.silver_threshold) newTier = 'silver';

    await base44.asServiceRole.entities.LoyaltyAccount.update(account.id, {
      points_balance: newBalance,
      lifetime_points: newLifetime,
      tier: newTier,
    });

    // Create transaction record
    await base44.asServiceRole.entities.LoyaltyTransaction.create({
      user_email: user.email,
      transaction_type: 'earn',
      points: totalPoints,
      booking_id,
      booking_type,
      description: `Earned ${totalPoints} points from ${booking_type} booking (${basePoints} base + ${bonusPoints} ${account.tier} bonus)`,
    });

    return Response.json({
      success: true,
      points_awarded: totalPoints,
      base_points: basePoints,
      bonus_points: bonusPoints,
      new_balance: newBalance,
      tier: newTier,
      tier_upgraded: newTier !== account.tier,
    });
  } catch (error) {
    console.error('Error awarding loyalty points:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});