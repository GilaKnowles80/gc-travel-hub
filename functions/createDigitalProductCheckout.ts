import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Please log in to purchase products' }, { status: 401 });
    }

    const { product_ids, success_url, cancel_url } = await req.json();

    if (!product_ids || product_ids.length === 0) {
      return Response.json({ error: 'No products selected' }, { status: 400 });
    }

    // Fetch all products from database
    const allProducts = await base44.asServiceRole.entities.DigitalProduct.list();
    const selectedProducts = allProducts.filter(p => product_ids.includes(p.id) && p.status === 'available');

    if (selectedProducts.length === 0) {
      return Response.json({ error: 'No valid products found' }, { status: 400 });
    }

    // Build Stripe line items
    const lineItems = selectedProducts.map(product => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.title,
          description: product.description || '',
          images: product.image_url ? [product.image_url] : [],
        },
        unit_amount: Math.round((product.price_usd || product.price / 56) * 100), // fallback PHP to USD
      },
      quantity: 1,
    }));

    const totalUSD = selectedProducts.reduce((sum, p) => sum + (p.price_usd || p.price / 56), 0);

    // Create pending order first
    const order = await base44.asServiceRole.entities.DigitalOrder.create({
      user_email: user.email,
      product_ids: selectedProducts.map(p => p.id),
      product_titles: selectedProducts.map(p => p.title),
      total_amount: Math.round(totalUSD * 100) / 100,
      currency: 'usd',
      payment_status: 'pending',
      download_links_sent: false,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: success_url || `${req.headers.get('origin')}/DigitalStore?success=true`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/DigitalStore?cancelled=true`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        order_id: order.id,
        user_email: user.email,
        product_ids: selectedProducts.map(p => p.id).join(','),
        type: 'digital_product',
      },
    });

    // Update order with session ID
    await base44.asServiceRole.entities.DigitalOrder.update(order.id, {
      stripe_session_id: session.id,
    });

    console.log(`Digital checkout created: session=${session.id}, order=${order.id}, user=${user.email}`);

    return Response.json({ checkout_url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Digital checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});