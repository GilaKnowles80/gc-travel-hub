import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function getCommissionRate(amount) {
  if (amount < 10000) return 5; // 5% for <₱10k
  if (amount <= 50000) return 8; // 8% for ₱10k-50k
  return 10; // 10% for >₱50k
}

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

    const { bookingId, bookingType, bookingAmount, customerEmail } = await req.json();

    if (!bookingId || !bookingType || !bookingAmount || !customerEmail) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if customer was referred by an affiliate
    const referrals = await base44.entities.AffiliateReferral.filter({
      referred_email: customerEmail,
      status: "active"
    });

    if (referrals.length === 0) {
      return Response.json({ 
        hasAffiliate: false,
        message: "No affiliate referral found" 
      });
    }

    const referral = referrals[0];

    // Get affiliate
    const affiliates = await base44.entities.Affiliate.filter({
      id: referral.affiliate_id,
      status: "active"
    });

    if (affiliates.length === 0) {
      return Response.json({ 
        hasAffiliate: false,
        message: "Affiliate not active" 
      });
    }

    const affiliate = affiliates[0];

    // Calculate commission
    const commissionRate = getCommissionRate(bookingAmount);
    const commissionAmount = (bookingAmount * commissionRate) / 100;

    // Create commission record
    const commission = await base44.entities.AffiliateCommission.create({
      affiliate_id: affiliate.id,
      affiliate_code: affiliate.affiliate_code,
      customer_email: customerEmail,
      booking_id: bookingId,
      booking_type: bookingType,
      booking_amount: bookingAmount,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      status: "pending"
    });

    // Update affiliate stats
    await base44.entities.Affiliate.update(affiliate.id, {
      total_bookings: (affiliate.total_bookings || 0) + 1,
      total_revenue: (affiliate.total_revenue || 0) + bookingAmount,
      total_commission_earned: (affiliate.total_commission_earned || 0) + commissionAmount,
      commission_balance: (affiliate.commission_balance || 0) + commissionAmount
    });

    // Update referral stats
    await base44.entities.AffiliateReferral.update(referral.id, {
      total_bookings: (referral.total_bookings || 0) + 1,
      total_revenue: (referral.total_revenue || 0) + bookingAmount,
      first_booking_id: referral.first_booking_id || bookingId
    });

    console.log(`Affiliate commission created: ${commission.id} (₱${commissionAmount})`);

    return Response.json({
      success: true,
      hasAffiliate: true,
      commission: {
        id: commission.id,
        rate: commissionRate,
        amount: commissionAmount,
        affiliate_code: affiliate.affiliate_code
      }
    });
  } catch (error) {
    console.error("Affiliate commission error:", error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});