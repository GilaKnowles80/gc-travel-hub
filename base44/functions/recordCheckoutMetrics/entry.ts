import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_type, booking_type, amount, passenger_count, addons_selected, conversion_time_ms } = await req.json();

    // Track analytics
    base44.analytics.track({
      eventName: `checkout_${event_type}`,
      properties: {
        booking_type,
        amount: Math.round(amount),
        passenger_count,
        addons_count: addons_selected?.length || 0,
        conversion_time_ms: conversion_time_ms || 0,
        user_email: user.email,
      },
    });

    return Response.json({ 
      success: true,
      message: "Metrics recorded"
    });
  } catch (error) {
    console.error('Checkout metrics error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return Response.json({ error: error.message }, { status: 500 });
  }
});