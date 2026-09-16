import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ADMIN_EMAIL = "gctravelandtours2021@gmail.com";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const {
      bookingType,
      bookingId,
      amount,
      currency = "USD",
      paymentMode,
      customerEmail,
      customerName,
      referenceNo,
    } = await req.json();

    if (!paymentMode) {
      return Response.json({ error: "Missing paymentMode" }, { status: 400 });
    }

    const modeLabel = paymentMode === "paypal_qr"
      ? "PayPal QR Code (Manual)"
      : paymentMode === "paypal_email"
      ? "PayPal Email Transfer (Manual)"
      : paymentMode === "paypal_automatic"
      ? "PayPal (Automatic Checkout)"
      : paymentMode;

    const amountStr = `${currency} ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const bookingLabel = bookingType ? bookingType.charAt(0).toUpperCase() + bookingType.slice(1) : "Booking";
    const refSuffix = bookingId ? ` (${bookingId.slice(-8).toUpperCase()})` : "";

    const title = `New Checkout: ${bookingLabel}${refSuffix} — ${modeLabel}`;
    const message = [
      `A customer completed checkout via ${modeLabel}.`,
      ``,
      `Booking Type: ${bookingLabel}`,
      bookingId ? `Booking ID: ${bookingId}` : null,
      `Amount: ${amountStr}`,
      customerName ? `Customer: ${customerName}` : null,
      customerEmail ? `Customer Email: ${customerEmail}` : null,
      referenceNo ? `PayPal Reference No: ${referenceNo}` : null,
      ``,
      paymentMode.startsWith("paypal_") && !paymentMode.includes("automatic")
        ? `Action needed: Verify the PayPal payment in your account ${ADMIN_EMAIL} before confirming the booking.`
        : `Payment captured automatically. Please review in the admin dashboard.`,
    ].filter(Boolean).join("\n");

    // 1. Create in-app notifications for all admin users
    try {
      const admins = await base44.asServiceRole.entities.User.list('-created_date', 100);
      const adminUsers = admins.filter(u => u.role === "admin");
      for (const admin of adminUsers) {
        await base44.asServiceRole.entities.Notification.create({
          user_email: admin.email,
          title,
          message,
          type: "checkout_payment",
          booking_id: bookingId,
          is_read: false,
        });
      }
    } catch (notifErr) {
      console.error("In-app notification failed:", notifErr);
    }

    // 2. Send email to admin
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: "ArGie-C Travel & Tours",
        to: ADMIN_EMAIL,
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">ArGie-C Travel & Tours</h1>
              <p style="color: #fef3c7; margin: 5px 0 0;">New Checkout Notification</p>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1e293b; margin-top: 0;">${modeLabel}</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 6px 0; color: #64748b;">Booking Type:</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${bookingLabel}</td></tr>
                ${bookingId ? `<tr><td style="padding: 6px 0; color: #64748b;">Booking ID:</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${bookingId}</td></tr>` : ""}
                <tr><td style="padding: 6px 0; color: #64748b;">Amount:</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${amountStr}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Payment Mode:</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${modeLabel}</td></tr>
                ${customerName ? `<tr><td style="padding: 6px 0; color: #64748b;">Customer:</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${customerName}</td></tr>` : ""}
                ${customerEmail ? `<tr><td style="padding: 6px 0; color: #64748b;">Customer Email:</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${customerEmail}</td></tr>` : ""}
                ${referenceNo ? `<tr><td style="padding: 6px 0; color: #64748b;">PayPal Ref No:</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${referenceNo}</td></tr>` : ""}
              </table>
              <div style="margin-top: 20px; padding: 15px; background: ${paymentMode.includes("automatic") ? "#dcfce7" : "#fef3c7"}; border-radius: 8px;">
                <p style="margin: 0; color: ${paymentMode.includes("automatic") ? "#166534" : "#92400e"}; font-size: 13px;">
                  ${paymentMode.includes("automatic")
                    ? "✅ Payment captured automatically. Review in admin dashboard."
                    : `⚠️ Action needed: Verify the PayPal payment in your account (${ADMIN_EMAIL}) before confirming the booking.`}
                </p>
              </div>
            </div>
            <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ArGie-C Travel & Tours. All rights reserved.</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Admin email failed:", emailErr);
    }

    return Response.json({ success: true, message: "Admin notified" });
  } catch (error) {
    console.error("notifyCheckoutPayment error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});