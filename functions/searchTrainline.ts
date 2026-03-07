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
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build Trainline booking URL
    const trainlineUrl = new URL('https://www.thetrainline.com/');
    trainlineUrl.searchParams.set('origin', origin);
    trainlineUrl.searchParams.set('destination', destination);
    trainlineUrl.searchParams.set('date', departure_date);

    return Response.json({
      success: true,
      redirect_url: trainlineUrl.toString()
    });

  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});