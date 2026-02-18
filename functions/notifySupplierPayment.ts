import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { supplier_payment_id } = await req.json();

    if (!supplier_payment_id) {
      return Response.json({ error: 'Payment ID required' }, { status: 400 });
    }

    const payment = await base44.asServiceRole.entities.SupplierPayment.get(supplier_payment_id);
    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    const supplier = await base44.asServiceRole.entities.Supplier.get(payment.supplier_id);
    if (!supplier) {
      return Response.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Send email notification
    await base44.integrations.Core.SendEmail({
      to: supplier.email,
      subject: `Payment Notification - $${payment.amount} ${payment.status}`,
      body: `Dear ${supplier.company_name},

Payment Status: ${payment.status.toUpperCase()}
Amount: $${payment.amount}
Booking Reference: ${payment.booking_id}
Payment Method: ${payment.payment_method}
${payment.transaction_id ? `Transaction ID: ${payment.transaction_id}` : ''}

${payment.status === 'completed' ? 'The payment has been processed successfully and will be transferred to your account.' : ''}
${payment.status === 'pending' ? 'The payment is being processed and will be transferred soon.' : ''}

Login to your supplier portal for more details: ${Deno.env.get('APP_URL') || 'https://gctravelandtours.com'}/supplier-login

Best regards,
GC Travel & Tours`
    });

    // Create in-app notification if supplier uses the platform
    await base44.asServiceRole.entities.Notification.create({
      user_email: supplier.email,
      title: `💰 Payment ${payment.status}`,
      message: `Payment of $${payment.amount} is ${payment.status} for booking ${payment.booking_id}`,
      type: 'info',
      link: '/supplier-payments'
    }).catch(console.error);

    return Response.json({ success: true, message: 'Notification sent' });

  } catch (error) {
    console.error('Notify supplier payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});