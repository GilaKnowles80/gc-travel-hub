import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!data) {
      return Response.json({ success: true, skipped: true });
    }

    // Only record completed/paid payments
    if (data.status !== 'completed' && data.payment_status !== 'paid') {
      return Response.json({ success: true, skipped: true });
    }

    const markupAmount = data.markup_amount || 0;
    const bookingType = data.booking_type || 'unknown';
    const bookingRef = data.booking_id || `${bookingType}-${data.id}`;

    // Create AuditLog for markup tracking
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: 'system@gctravelandtours.com',
      action: 'markup_recorded',
      entity_type: 'Payment',
      entity_id: data.id,
      changes: {
        booking_type: bookingType,
        booking_ref: bookingRef,
        markup_amount: markupAmount,
        payment_status: data.payment_status
      },
      severity: 'medium',
      status: 'success'
    });

    // Create SalesActivity record for earnings tracking
    await base44.asServiceRole.entities.SalesActivity.create({
      lead_id: 'markup-earnings',
      sales_person: 'system@gctravelandtours.com',
      activity_type: 'status_change',
      subject: `Markup Earned - ${bookingRef}`,
      description: `₱${markupAmount} markup earned from ${bookingType} booking (Ref: ${bookingRef})`,
      outcome: 'positive'
    });

    console.log(`✓ Recorded ₱${markupAmount} markup from ${bookingRef}`);
    return Response.json({ success: true, markup_recorded: markupAmount });

  } catch (error) {
    console.error('Error recording markup earnings:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});