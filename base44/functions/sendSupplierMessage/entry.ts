import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { supplier_id, subject, message, message_type, priority, is_broadcast } = await req.json();

    if (!subject || !message || !message_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const messages = [];

    if (is_broadcast) {
      // Send to all active suppliers
      const suppliers = await base44.asServiceRole.entities.Supplier.filter({ status: 'active' });
      
      for (const supplier of suppliers) {
        const msg = await base44.asServiceRole.entities.SupplierMessage.create({
          supplier_id: supplier.id,
          sender_type: 'admin',
          sender_email: user.email,
          sender_name: user.full_name,
          subject,
          message,
          message_type,
          priority: priority || 'normal',
          is_broadcast: true
        });

        messages.push(msg);

        // Send notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: supplier.email,
          title: `📢 ${subject}`,
          message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          type: 'info',
          link: '/supplier-dashboard'
        }).catch(console.error);

        // Send email for urgent messages
        if (priority === 'urgent' || priority === 'high') {
          await base44.integrations.Core.SendEmail({
            to: supplier.email,
            subject: `[${priority.toUpperCase()}] ${subject}`,
            body: `Dear ${supplier.company_name},

${message}

Login to your supplier portal: ${Deno.env.get('APP_URL') || 'https://gctravelandtours.com'}/supplier-login

Best regards,
GC Travel & Tours Admin Team`
          }).catch(console.error);
        }
      }

      console.log(`Broadcast message sent to ${suppliers.length} suppliers`);
    } else {
      // Send to specific supplier
      const supplier = await base44.asServiceRole.entities.Supplier.get(supplier_id);
      if (!supplier) {
        return Response.json({ error: 'Supplier not found' }, { status: 404 });
      }

      const msg = await base44.asServiceRole.entities.SupplierMessage.create({
        supplier_id,
        sender_type: 'admin',
        sender_email: user.email,
        sender_name: user.full_name,
        subject,
        message,
        message_type,
        priority: priority || 'normal',
        is_broadcast: false
      });

      messages.push(msg);

      // Send notification
      await base44.asServiceRole.entities.Notification.create({
        user_email: supplier.email,
        title: `📧 ${subject}`,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        type: 'info',
        link: '/supplier-dashboard'
      }).catch(console.error);

      // Send email for urgent messages
      if (priority === 'urgent' || priority === 'high') {
        await base44.integrations.Core.SendEmail({
          to: supplier.email,
          subject: `[${priority.toUpperCase()}] ${subject}`,
          body: `Dear ${supplier.company_name},

${message}

Login to your supplier portal: ${Deno.env.get('APP_URL') || 'https://gctravelandtours.com'}/supplier-login

Best regards,
GC Travel & Tours Admin Team`
        }).catch(console.error);
      }
    }

    return Response.json({
      success: true,
      messages_sent: messages.length,
      message: `Message sent to ${messages.length} supplier(s)`
    });

  } catch (error) {
    console.error('Send supplier message error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});