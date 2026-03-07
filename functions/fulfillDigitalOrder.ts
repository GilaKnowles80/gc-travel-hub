import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id } = await req.json();

    // Fetch the order
    const orders = await base44.asServiceRole.entities.DigitalOrder.filter({ stripe_session_id: order_id });
    const order = orders.find(o => o.user_email === user.email && o.payment_status === 'paid');

    if (!order) {
      // Try by order ID directly
      const directOrder = await base44.asServiceRole.entities.DigitalOrder.filter({ id: order_id });
      const found = directOrder.find(o => o.user_email === user.email && o.payment_status === 'paid');
      if (!found) {
        return Response.json({ error: 'Order not found or not paid' }, { status: 404 });
      }
    }

    const targetOrder = order || (await base44.asServiceRole.entities.DigitalOrder.filter({ id: order_id })).find(o => o.user_email === user.email);

    // Fetch products
    const allProducts = await base44.asServiceRole.entities.DigitalProduct.list();
    const purchasedProducts = allProducts.filter(p => targetOrder.product_ids?.includes(p.id));

    // Generate signed URLs for each product
    const downloadLinks = [];
    for (const product of purchasedProducts) {
      if (product.file_uri) {
        const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
          file_uri: product.file_uri,
          expires_in: 3600, // 1 hour
        });
        downloadLinks.push({
          product_id: product.id,
          title: product.title,
          download_url: signed.signed_url,
          file_name: product.file_name || product.title,
        });
      }
    }

    // Update download count
    await base44.asServiceRole.entities.DigitalOrder.update(targetOrder.id, {
      download_count: (targetOrder.download_count || 0) + 1,
    });

    return Response.json({ download_links: downloadLinks });
  } catch (error) {
    console.error('Fulfill digital order error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});