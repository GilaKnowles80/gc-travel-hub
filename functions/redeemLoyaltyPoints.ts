import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { points_to_redeem } = await req.json();

    if (!points_to_redeem || points_to_redeem <= 0) {
      return Response.json({ error: 'Invalid points amount' }, { status: 400 });
    }

    // Get loyalty settings
    const settingsList = await base44.asServiceRole.entities.LoyaltySettings.list();
    const settings = settingsList[0];

    if (!settings) {
      return Response.json({ error: 'Loyalty program not configured' }, { status: 500 });
    }

    // Check minimum redemption
    if (points_to_redeem < settings.min_redemption_points) {
      return Response.json({ 
        error: `Minimum ${settings.min_redemption_points} points required` 
      }, { status: 400 });
    }

    // Get loyalty account
    const accounts = await base44.asServiceRole.entities.LoyaltyAccount.filter({ 
      user_email: user.email 
    });
    const account = accounts[0];

    if (!account) {
      return Response.json({ error: 'No loyalty account found' }, { status: 404 });
    }

    if (account.points_balance < points_to_redeem) {
      return Response.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // Calculate discount
    const discount = points_to_redeem * settings.peso_per_point;

    // Update account balance
    const newBalance = account.points_balance - points_to_redeem;
    await base44.asServiceRole.entities.LoyaltyAccount.update(account.id, {
      points_balance: newBalance,
    });

    // Create transaction record
    await base44.asServiceRole.entities.LoyaltyTransaction.create({
      user_email: user.email,
      transaction_type: 'redeem',
      points: -points_to_redeem,
      description: `Redeemed ${points_to_redeem} points for ₱${discount.toFixed(2)} discount`,
    });

    return Response.json({
      success: true,
      points_redeemed: points_to_redeem,
      discount_amount: discount,
      new_balance: newBalance,
    });
  } catch (error) {
    console.error('Error redeeming loyalty points:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});