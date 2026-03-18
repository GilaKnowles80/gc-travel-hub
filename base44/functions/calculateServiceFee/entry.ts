import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { bookingType, bookingAmount, userEmail } = await req.json();

    if (!bookingType || !bookingAmount) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get service fee settings for this booking type
    const settings = await base44.entities.ServiceFeeSettings.filter({
      booking_type: bookingType,
      is_active: true
    });

    if (settings.length === 0) {
      return Response.json({ 
        serviceFee: 0,
        isPremium: false,
        message: "No service fee configured"
      });
    }

    const feeSetting = settings[0];

    // Check if user has premium membership
    let isPremium = false;
    let premiumDiscount = 0;

    if (userEmail) {
      const memberships = await base44.entities.PremiumMembership.filter({
        user_email: userEmail,
        status: "active"
      });

      if (memberships.length > 0) {
        const membership = memberships[0];
        const now = new Date();
        const endDate = new Date(membership.end_date);
        
        if (endDate > now) {
          isPremium = true;
          premiumDiscount = feeSetting.premium_discount || 50;
        }
      }
    }

    // Calculate service fee
    let serviceFee = 0;
    
    if (feeSetting.fee_type === "percentage") {
      serviceFee = (bookingAmount * feeSetting.fee_value) / 100;
    } else {
      serviceFee = feeSetting.fee_value;
    }

    // Apply minimum fee
    if (feeSetting.minimum_fee && serviceFee < feeSetting.minimum_fee) {
      serviceFee = feeSetting.minimum_fee;
    }

    // Apply maximum fee
    if (feeSetting.maximum_fee && serviceFee > feeSetting.maximum_fee) {
      serviceFee = feeSetting.maximum_fee;
    }

    // Apply premium discount
    const originalFee = serviceFee;
    if (isPremium && premiumDiscount > 0) {
      serviceFee = serviceFee * (1 - premiumDiscount / 100);
    }

    const savings = originalFee - serviceFee;

    return Response.json({
      success: true,
      serviceFee: Math.round(serviceFee * 100) / 100,
      originalFee: Math.round(originalFee * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      isPremium,
      premiumDiscount,
      feeDetails: {
        type: feeSetting.fee_type,
        value: feeSetting.fee_value,
        minimumFee: feeSetting.minimum_fee,
        maximumFee: feeSetting.maximum_fee
      }
    });
  } catch (error) {
    console.error("Service fee calculation error:", error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});