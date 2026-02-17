import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, bookingType, amount } = await req.json();

    if (!code || !bookingType || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find discount code
    const discounts = await base44.entities.DiscountCode.filter({ 
      code: code.toUpperCase(),
      status: 'active'
    });

    if (discounts.length === 0) {
      return Response.json({ 
        valid: false, 
        error: 'Invalid or expired discount code' 
      });
    }

    const discount = discounts[0];

    // Check date validity
    const now = new Date();
    if (discount.valid_from && new Date(discount.valid_from) > now) {
      return Response.json({ 
        valid: false, 
        error: 'This code is not yet active' 
      });
    }
    if (discount.valid_until && new Date(discount.valid_until) < now) {
      await base44.asServiceRole.entities.DiscountCode.update(discount.id, { status: 'expired' });
      return Response.json({ 
        valid: false, 
        error: 'This code has expired' 
      });
    }

    // Check applicable services
    if (!discount.applicable_to.includes('all') && !discount.applicable_to.includes(bookingType)) {
      return Response.json({ 
        valid: false, 
        error: `This code is not applicable to ${bookingType} bookings` 
      });
    }

    // Check minimum purchase
    if (discount.min_purchase && amount < discount.min_purchase) {
      return Response.json({ 
        valid: false, 
        error: `Minimum purchase of $${discount.min_purchase} required` 
      });
    }

    // Check usage limit
    if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
      return Response.json({ 
        valid: false, 
        error: 'This code has reached its usage limit' 
      });
    }

    // Check per-user limit
    const userUsage = await base44.entities.DiscountUsage.filter({
      discount_code_id: discount.id,
      user_email: user.email
    });

    if (discount.per_user_limit && userUsage.length >= discount.per_user_limit) {
      return Response.json({ 
        valid: false, 
        error: 'You have already used this code the maximum number of times' 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (discount.discount_type === 'percentage') {
      discountAmount = (amount * discount.discount_value) / 100;
      if (discount.max_discount && discountAmount > discount.max_discount) {
        discountAmount = discount.max_discount;
      }
    } else {
      discountAmount = discount.discount_value;
    }

    const finalPrice = Math.max(0, amount - discountAmount);

    return Response.json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        title: discount.title,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        discount_amount: discountAmount,
        final_price: finalPrice,
        original_price: amount,
        is_flash_sale: discount.is_flash_sale
      }
    });

  } catch (error) {
    console.error('Validate discount error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});