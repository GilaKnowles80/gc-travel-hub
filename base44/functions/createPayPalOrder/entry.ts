import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PAYPAL_API_BASE = "https://api-m.paypal.com"; // Live mode

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

    const { amount, currency = "USD", bookingData } = await req.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: `ArGie-C Travel Booking - ${bookingData?.bookingType || "Travel Service"}`,
          custom_id: bookingData?.bookingType && bookingData?.bookingId
            ? `${bookingData.bookingType}:${bookingData.bookingId}`
            : bookingData?.bookingId || "",
        },
      ],
      application_context: {
        brand_name: "GC Travel and Tours Agency",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${new URL(req.url).origin}/payment-success`,
        cancel_url: `${new URL(req.url).origin}/payment-cancelled`,
      },
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const order = await response.json();

    if (!response.ok) {
      console.error("PayPal order creation failed:", order);
      return Response.json({ 
        error: order.message || "Failed to create PayPal order" 
      }, { status: response.status });
    }

    console.log("PayPal order created:", order.id);

    return Response.json({
      id: order.id,
      status: order.status,
    });
  } catch (error) {
    console.error("PayPal order creation error:", error);
    return Response.json({ 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
});