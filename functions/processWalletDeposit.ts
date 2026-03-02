import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
const PayMongo_API_KEY = Deno.env.get("PayMongo_API_KEY");

async function processStripeDeposit(cardData, amount) {
  try {
    const stripe = await import("npm:stripe");
    const stripeClient = new stripe.default(STRIPE_SECRET_KEY);

    // Create a payment method
    const paymentMethod = await stripeClient.paymentMethods.create({
      type: "card",
      card: {
        number: cardData.cardNumber,
        exp_month: parseInt(cardData.expMonth),
        exp_year: 2000 + parseInt(cardData.expYear),
        cvc: cardData.cvv,
      },
      billing_details: {
        name: cardData.cardName,
      },
    });

    // Create payment intent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "php",
      payment_method: paymentMethod.id,
      confirm: true,
    });

    if (paymentIntent.status === "succeeded") {
      return { success: true, transactionId: paymentIntent.id };
    } else {
      return { success: false, error: "Payment failed" };
    }
  } catch (error) {
    console.error("Stripe error:", error);
    return { success: false, error: error.message };
  }
}

async function processPayMongoDeposit(cardData, amount) {
  try {
    const auth = btoa(PayMongo_API_KEY + ":");
    
    // Create payment source
    const sourceResponse = await fetch("https://api.paymongo.com/v1/sources", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: "card",
            amount: Math.round(amount * 100),
            currency: "PHP",
            redirect: {
              success: "https://example.com/success",
              failed: "https://example.com/failed",
            },
            source: {
              type: "card",
              details: {
                card_number: cardData.cardNumber,
                exp_month: parseInt(cardData.expMonth),
                exp_year: 2000 + parseInt(cardData.expYear),
                cvc: cardData.cvv,
              },
            },
          },
        },
      }),
    });

    const sourceData = await sourceResponse.json();
    
    if (sourceData.data?.id) {
      return { success: true, transactionId: sourceData.data.id };
    } else {
      return { success: false, error: "Payment source creation failed" };
    }
  } catch (error) {
    console.error("PayMongo error:", error);
    return { success: false, error: error.message };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const { amount, paymentMethod, cardName, cardNumber, expMonth, expYear, cvv, userEmail } = payload;

    if (!amount || amount <= 0) {
      return Response.json({ success: false, error: "Invalid amount" }, { status: 400 });
    }

    let result;
    
    if (paymentMethod === "stripe") {
      result = await processStripeDeposit({ cardName, cardNumber, expMonth, expYear, cvv }, amount);
    } else if (paymentMethod === "paymongo") {
      result = await processPayMongoDeposit({ cardName, cardNumber, expMonth, expYear, cvv }, amount);
    } else if (paymentMethod === "paypal") {
      // PayPal would typically redirect to PayPal's flow
      result = { success: true, transactionId: "paypal_" + Date.now() };
    } else {
      return Response.json({ success: false, error: "Invalid payment method" }, { status: 400 });
    }

    if (!result.success) {
      return Response.json(result, { status: 400 });
    }

    // If payment succeeded, update wallet
    const wallets = await base44.entities.Wallet.filter({ user_email: userEmail });
    const currentWallet = wallets[0];
    const newBalance = (currentWallet?.balance || 0) + amount;

    if (currentWallet) {
      await base44.entities.Wallet.update(currentWallet.id, { balance: newBalance });
    } else {
      await base44.entities.Wallet.create({
        user_email: userEmail,
        balance: amount,
        points_balance: 0,
      });
    }

    // Record transaction
    await base44.entities.WalletTransaction.create({
      user_email: userEmail,
      transaction_type: "deposit",
      amount: amount,
      description: `Deposited ₱${amount.toLocaleString()} via ${paymentMethod}`,
      payment_method: paymentMethod,
      transaction_id: result.transactionId,
    });

    console.log(`Deposit processed: ${userEmail} - ₱${amount} via ${paymentMethod}`);

    return Response.json({ success: true, message: "Deposit successful", balance: newBalance });
  } catch (error) {
    console.error("Deposit processing error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});