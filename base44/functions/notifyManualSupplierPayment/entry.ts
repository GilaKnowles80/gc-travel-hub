import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Only process manual payments
    if (data.payment_method !== 'manual') {
      return Response.json({ success: true, reason: 'Not a manual payment' });
    }

    const isStatusChange = old_data && old_data.payment_status !== data.payment_status;
    const isNewPayment = !old_data;

    // Get all users
    const users = await base44.asServiceRole.entities.User.list();

    // Create notification messages
    let title = '';
    let message = '';

    if (isNewPayment) {
      title = '🔔 New Manual Supplier Payment';
      message = `New ${data.booking_type} booking payment created for ${data.supplier} - ₱${data.supplier_amount?.toLocaleString()}. Status: ${data.payment_status}`;
    } else if (isStatusChange && data.payment_status === 'paid') {
      title = '✅ Supplier Payment Marked as Paid';
      message = `Manual payment to ${data.supplier} for ₱${data.supplier_amount?.toLocaleString()} has been confirmed as paid.`;
    } else if (isStatusChange) {
      title = '📢 Supplier Payment Status Updated';
      message = `Payment status changed from ${old_data.payment_status} to ${data.payment_status} for ${data.supplier}.`;
    } else {
      return Response.json({ success: true, reason: 'No actionable change' });
    }

    // Create notifications for all users
    const notifications = users.map(user => ({
      user_email: user.email,
      title,
      message,
      type: 'supplier_payment_done',
      booking_id: data.booking_id,
      link: '/admin-supplier-payments'
    }));

    await base44.asServiceRole.entities.Notification.bulkCreate(notifications);

    return Response.json({
      success: true,
      notificationsCreated: notifications.length,
      title,
      message
    });
  } catch (error) {
    console.error('Error in notifyManualSupplierPayment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});