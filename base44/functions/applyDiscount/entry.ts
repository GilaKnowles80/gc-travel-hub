import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { discountCodeId, bookingType, bookingId, originalPrice, discountAmount, finalPrice } = await req.json();

    // Record usage
    await base44.entities.DiscountUsage.create({
      discount_code_id: discountCodeId,
      user_email: user.email,
      booking_type: bookingType,
      booking_id: bookingId,
      original_price: originalPrice,
      discount_amount: discountAmount,
      final_price: finalPrice
    });

    // Increment usage count
    const discount = await base44.asServiceRole.entities.DiscountCode.filter({ id: discountCodeId });
    if (discount.length > 0) {
      await base44.asServiceRole.entities.DiscountCode.update(discountCodeId, {
        usage_count: (discount[0].usage_count || 0) + 1
      });
    }

    return Response.json({
      success: true,
      message: 'Discount applied successfully'
    });

  } catch (error) {
    console.error('Apply discount error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});