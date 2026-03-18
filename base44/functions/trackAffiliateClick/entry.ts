import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get user if logged in (optional)
    let userEmail = null;
    try {
      const user = await base44.auth.me();
      userEmail = user?.email || null;
    } catch {
      // User not logged in, that's fine
    }

    const { affiliate_link_id, referring_page } = await req.json();

    if (!affiliate_link_id) {
      return Response.json({ error: 'affiliate_link_id is required' }, { status: 400 });
    }

    // Get the affiliate link details
    const links = await base44.asServiceRole.entities.AffiliateLink.filter({ id: affiliate_link_id });
    const link = links[0];

    if (!link) {
      return Response.json({ error: 'Affiliate link not found' }, { status: 404 });
    }

    const userAgent = req.headers.get('user-agent') || '';

    // Log the click
    await base44.asServiceRole.entities.AffiliateClick.create({
      affiliate_link_id,
      link_name: link.name,
      platform: link.platform,
      category: link.category,
      user_email: userEmail,
      referring_page: referring_page || '',
      user_agent: userAgent.substring(0, 300),
      clicked_at: new Date().toISOString(),
    });

    // Update cached total_clicks on the link
    await base44.asServiceRole.entities.AffiliateLink.update(affiliate_link_id, {
      total_clicks: (link.total_clicks || 0) + 1,
    });

    console.log(`Affiliate click tracked: link=${link.name}, platform=${link.platform}, user=${userEmail}`);

    return Response.json({ success: true, redirect_url: link.base_url });
  } catch (error) {
    console.error('Affiliate click tracking error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});