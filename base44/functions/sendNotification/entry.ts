import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { 
            userEmail, 
            title, 
            message, 
            type, 
            bookingId, 
            link,
            sendEmail = true 
        } = await req.json();

        if (!userEmail || !title || !message || !type) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create in-app notification
        const notification = await base44.asServiceRole.entities.Notification.create({
            user_email: userEmail,
            title,
            message,
            type,
            booking_id: bookingId,
            link,
            is_read: false
        });

        // Send email notification
        if (sendEmail) {
            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    from_name: "GC Travel & Tours",
                    to: userEmail,
                    subject: title,
                    body: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
                                <h1 style="color: white; margin: 0;">GC Travel & Tours</h1>
                            </div>
                            <div style="padding: 30px; background: #f9fafb;">
                                <h2 style="color: #1e293b; margin-top: 0;">${title}</h2>
                                <p style="color: #475569; line-height: 1.6;">${message}</p>
                                ${bookingId ? `<p style="color: #64748b; font-size: 14px;">Booking Reference: <strong>${bookingId.slice(-8).toUpperCase()}</strong></p>` : ''}
                                ${link ? `<div style="margin-top: 30px;"><a href="${link}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Details</a></div>` : ''}
                            </div>
                            <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                                <p>© ${new Date().getFullYear()} GC Travel & Tours. All rights reserved.</p>
                            </div>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }
        }

        return Response.json({ 
            success: true,
            notification
        });

    } catch (error) {
        console.error('Notification error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});