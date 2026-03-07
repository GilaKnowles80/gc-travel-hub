import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origin, destination, departure_date } = await req.json();

    if (!origin || !destination || !departure_date) {
      return Response.json(
        { error: 'Missing required fields: origin, destination, departure_date' },
        { status: 400 }
      );
    }

    // Get Trainline credentials from SupplierCredentials
    const creds = await base44.asServiceRole.entities.SupplierCredentials.list();
    const trainlineCredentials = creds[0]; // Assuming one credentials record per app

    if (!trainlineCredentials?.trainline_email || !trainlineCredentials?.trainline_api_key) {
      return Response.json(
        { 
          error: 'Trainline credentials not configured',
          message: 'Please set up Trainline Business credentials in Admin → Supplier Bank Accounts'
        },
        { status: 503 }
      );
    }

    // Format: YYYY-MM-DD to ISO datetime for Trainline API
    const departureDateTime = `${departure_date}T00:00:00Z`;

    // Trainline Global API endpoint (requires B2B partnership)
    // This is a placeholder for future full API integration
    const trainlineApiUrl = 'https://api.thetrainline.com/search';
    
    // For now, return formatted search params to redirect to Trainline's booking page
    const trainlineSearchUrl = new URL('https://www.thetrainline.com/');
    trainlineSearchUrl.searchParams.append('origin', origin);
    trainlineSearchUrl.searchParams.append('destination', destination);
    trainlineSearchUrl.searchParams.append('date', departure_date);
    trainlineSearchUrl.searchParams.append('lang', 'en');

    // Log search for analytics
    await base44.analytics.track({
      eventName: 'trainline_search',
      properties: {
        origin,
        destination,
        departure_date,
        user_email: user.email
      }
    });

    return Response.json({
      success: true,
      message: 'Trainline search initiated',
      redirect_url: trainlineSearchUrl.toString(),
      note: 'Full API integration available with Trainline B2B partnership (contact Trainline sales)'
    });

  } catch (error) {
    console.error('Trainline search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});