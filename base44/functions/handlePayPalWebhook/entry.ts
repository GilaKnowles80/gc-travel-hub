import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ─── PayPal Webhook Receiver ──────────────────────────────────────────────
// Verifies the webhook signature via PayPal's verify-webhook-signature API
// using PAYPAL_WEBHOOK_ID, then processes payment capture events to confirm
// bookings across all booking types.
// ──────────────────────────────────────────────────────────────────────────

const PAYPAL_API_BASE = "https://api-m.paypal.com";

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

async function verifyWebhookSignature(headers, rawBody) {
  const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
  if (!webhookId) return false;

  const accessToken = await getPayPalAccessToken();

  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");
  const authSig = headers.get("paypal-auth-signature");

  if (!transmissionId || !certUrl || !authAlgo || !authSig) return false;

  const verifyResponse = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: authSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });

  const verifyData = await verifyResponse.json();
  return verifyData.verification_status === "SUCCESS";
}

function getEntityName(bookingType) {
  const mapping = {
    flight: 'FlightBooking',
    hotel: 'HotelBooking',
    ferry: 'FerryBooking',
    cruise: 'CruiseBooking',
    train: 'TrainBooking',
    tour: 'Booking',
    car: 'CarRentalBooking',
    bus: 'BusBooking',
    visa: 'VisaAppointment',
    insurance: 'InsurancePolicy',
    package: 'PackageBooking',
    digital: 'DigitalOrder',
  };
  return mapping[bookingType] || 'Booking';
}

Deno.serve(async (req) => {
  try {
    const rawBody = await req.text();
    const headers = req.headers;

    const valid = await verifyWebhookSignature(headers, rawBody);
    if (!valid) {
      console.warn("[PAYPAL WEBHOOK] signature verification failed");
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type;
    console.log(`[PAYPAL WEBHOOK] type=${eventType} id=${event.id}`);

    const base44 = createClientFromRequest(req);

    // Handle payment capture completed
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = event.resource;
      const customId = resource?.purchase_units?.[0]?.custom_id ||
                       resource?.supplementary_data?.related_ids?.order_id ||
                       resource?.invoice_id || "";
      const metadata = resource?.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id || customId;

      // custom_id format: "bookingType:bookingId" (set by createPayPalOrder)
      const [bookingType, bookingId] = (metadata || customId || "").split(":");

      if (!bookingType || !bookingId) {
        console.log("[PAYPAL WEBHOOK] No booking metadata found, skipping");
        return Response.json({ received: true, ignored: "no booking metadata" });
      }

      console.log(`[PAYPAL WEBHOOK] Confirming ${bookingType} booking ${bookingId}`);
      const entityName = getEntityName(bookingType);

      // Update booking payment status
      try {
        const updateData = { payment_status: "paid" };
        if (bookingType !== "flight") {
          updateData.status = "confirmed";
        }
        await base44.asServiceRole.entities[entityName].update(bookingId, updateData);
      } catch (err) {
        console.error(`[PAYPAL WEBHOOK] Failed to update ${entityName}:`, err.message);
      }

      // For flights, trigger the Duffel airline order creation now that payment is confirmed
      if (bookingType === "flight") {
        try {
          await base44.asServiceRole.functions.invoke("bookFlightDuffel", { bookingId });
        } catch (err) {
          console.error("[PAYPAL WEBHOOK] Duffel booking failed:", err.message);
        }
      }

      // Send confirmation email + wallet cashback
      try {
        const booking = await base44.asServiceRole.entities[entityName].get(bookingId);
        if (booking) {
          const userEmail = booking.passenger_email || booking.guest_email ||
                            booking.customer_email || booking.applicant_email ||
                            booking.user_email || booking.renter_email;

          if (userEmail && bookingType !== "flight") {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: userEmail,
              subject: "Payment Confirmed - ArGie-C Travel & Tours",
              body: `Your payment has been confirmed for booking ${bookingId}. You will receive your booking details shortly.`,
            });
          }

          // Credit wallet with 5% cashback
          if (userEmail) {
            try {
              await base44.asServiceRole.functions.invoke("creditWalletOnBooking", {
                user_email: userEmail,
                booking_id: bookingId,
                booking_type: bookingType,
                payment_amount: parseFloat(resource?.amount?.value || "0"),
                payment_method: "paypal",
              });
            } catch (err) {
              console.error("[PAYPAL WEBHOOK] Wallet credit error:", err.message);
            }
          }
        }
      } catch (err) {
        console.error("[PAYPAL WEBHOOK] Post-payment processing error:", err.message);
      }
    }

    // Handle refunds
    if (eventType === "PAYMENT.CAPTURE.REFUNDED") {
      const resource = event.resource;
      const customId = resource?.purchase_units?.[0]?.custom_id || "";
      const [bookingType, bookingId] = (customId || "").split(":");

      if (bookingType && bookingId) {
        const entityName = getEntityName(bookingType);
        try {
          await base44.asServiceRole.entities[entityName].update(bookingId, {
            payment_status: "refunded",
            status: "cancelled",
          });
        } catch (err) {
          console.error("[PAYPAL WEBHOOK] Refund update failed:", err.message);
        }
      }
    }

    return Response.json({ received: true, type: eventType });
  } catch (error) {
    console.error("[PAYPAL WEBHOOK ERROR]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});