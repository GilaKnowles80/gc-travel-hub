import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PAYPAL_API_BASE = Deno.env.get("PAYPAL_MODE") === "live" 
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_SECRET");

  const auth = btoa(`${clientId}:${secret}`);
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, bookingData } = await req.json();

    if (!orderId) {
      return Response.json({ error: "Order ID required" }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const captureData = await response.json();

    if (!response.ok) {
      console.error("PayPal capture failed:", captureData);
      return Response.json({ 
        error: captureData.message || "Failed to capture payment" 
      }, { status: response.status });
    }

    const capture = captureData.purchase_units[0].payments.captures[0];

    // Create payment record
    const payment = await base44.entities.Payment.create({
      user_email: user.email,
      booking_id: bookingData?.bookingId || "",
      amount: parseFloat(capture.amount.value),
      currency: capture.amount.currency_code,
      payment_method: "paypal",
      status: "completed",
      transaction_id: capture.id,
      payment_date: new Date().toISOString(),
      payment_details: {
        paypal_order_id: orderId,
        payer_email: captureData.payer?.email_address,
        payer_name: captureData.payer?.name?.given_name + " " + captureData.payer?.name?.surname,
      },
    });

    // Update booking status if bookingId provided
    if (bookingData?.bookingId && bookingData?.bookingType) {
      try {
        const entityMap = {
          flight: "FlightBooking",
          hotel: "HotelBooking",
          tour: "Tour",
          package: "PackageBooking",
        };

        const entityName = entityMap[bookingData.bookingType];
        
        if (entityName) {
          await base44.entities[entityName].update(bookingData.bookingId, {
            status: "confirmed",
            payment_status: "paid",
            payment_id: payment.id,
          });
        }
      } catch (err) {
        console.error("Error updating booking:", err);
      }
    }

    // Send notification
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Payment Successful - GC Travel",
        body: `
          <h2>Payment Confirmed</h2>
          <p>Your payment of ${capture.amount.currency_code} ${capture.amount.value} has been successfully processed via PayPal.</p>
          <p><strong>Transaction ID:</strong> ${capture.id}</p>
          <p>Thank you for booking with GC Travel and Tours Agency!</p>
        `,
      });
    } catch (err) {
      console.error("Email notification failed:", err);
    }

    console.log("PayPal payment captured:", capture.id);

    return Response.json({
      success: true,
      captureId: capture.id,
      orderId: orderId,
      amount: capture.amount.value,
      currency: capture.amount.currency_code,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("PayPal capture error:", error);
    return Response.json({ 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
});