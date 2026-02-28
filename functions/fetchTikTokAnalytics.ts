import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get TikTok access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('tiktok');

    // Fetch TikTok user info and stats
    const userInfoResponse = await fetch('https://open.tiktokapis.com/v0/user/info/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userInfoResponse.ok) {
      throw new Error(`TikTok API error: ${userInfoResponse.statusText}`);
    }

    const userData = await userInfoResponse.json();
    const tiktokUser = userData.data?.user;
    const tiktokStats = userData.data?.user?.stats;

    if (!tiktokUser) {
      throw new Error('Failed to fetch TikTok user data');
    }

    // Store analytics snapshot
    const snapshot = await base44.asServiceRole.entities.TikTokAnalytics.create({
      follower_count: tiktokStats?.follower_count || 0,
      video_count: tiktokStats?.video_count || 0,
      heart_count: tiktokStats?.heart_count || 0,
      username: tiktokUser.username || '',
      display_name: tiktokUser.display_name || '',
      avatar_url: tiktokUser.avatar_url || '',
      bio: tiktokUser.bio || '',
      is_verified: tiktokUser.is_verified || false,
      recorded_at: new Date().toISOString()
    });

    console.log('TikTok analytics snapshot created:', snapshot.id);

    return Response.json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    console.error('Error fetching TikTok analytics:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});