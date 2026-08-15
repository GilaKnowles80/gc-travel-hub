import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Links a newly-logged-in user to the affiliate whose code they arrived with
// (?ref=CODE). Creates an AffiliateReferral (idempotent) and bumps the
// affiliate's referral counter — enabling commission on the customer's
// future bookings (calculated by calculateAffiliateCommission at checkout).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { affiliate_code } = await req.json();
    if (!affiliate_code) {
      return Response.json({ error: 'Missing affiliate_code' }, { status: 400 });
    }

    const referred_email = user.email;

    const affiliates = await base44.asServiceRole.entities.Affiliate.filter({
      affiliate_code,
      status: 'active',
    });
    const affiliate = affiliates[0];
    if (!affiliate) {
      return Response.json({ captured: false, reason: 'invalid_code' });
    }

    // Don't let affiliates self-refer
    if (affiliate.user_email === referred_email) {
      return Response.json({ captured: false, reason: 'self_referral' });
    }

    // Idempotent: a customer is only ever referred once
    const existing = await base44.asServiceRole.entities.AffiliateReferral.filter({
      affiliate_id: affiliate.id,
      referred_email,
    });
    if (existing.length > 0) {
      return Response.json({ captured: true, already: true });
    }

    await base44.asServiceRole.entities.AffiliateReferral.create({
      affiliate_id: affiliate.id,
      affiliate_code: affiliate.affiliate_code,
      referred_email,
      referral_source: 'ref_link',
      total_bookings: 0,
      total_revenue: 0,
      status: 'active',
    });

    await base44.asServiceRole.entities.Affiliate.update(affiliate.id, {
      total_referrals: (affiliate.total_referrals || 0) + 1,
    });

    console.log(`[REFERRAL] ${affiliate.affiliate_code} referred ${referred_email}`);
    return Response.json({ captured: true });
  } catch (error) {
    console.error('captureAffiliateReferral error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});