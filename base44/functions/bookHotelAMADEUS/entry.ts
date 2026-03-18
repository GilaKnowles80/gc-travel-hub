import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      hotelOfferId,
      hotelName,
      roomType,
      checkInDate,
      checkOutDate,
      numberOfRooms,
      numberOfGuests,
      guestName,
      guestEmail,
      guestPhone,
      totalPrice,
      specialRequests
    } = await req.json();

    // Get AMADEUS credentials
    const apiKey = Deno.env.get("AMADEUS_API_KEY");
    const apiSecret = Deno.env.get("AMADEUS_API_SECRET");

    // Get access token
    const tokenResponse = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: apiKey,
        client_secret: apiSecret,
      }),
    });

    const { access_token } = await tokenResponse.json();

    // Create booking in app database
    const hotelBooking = await base44.asServiceRole.entities.HotelBooking.create({
      hotel_id: hotelOfferId,
      hotel_name: hotelName,
      room_type: roomType,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      number_of_rooms: numberOfRooms,
      number_of_guests: numberOfGuests,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      total_price: totalPrice,
      special_requests: specialRequests,
      status: "pending",
      payment_status: "unpaid",
      supplier: "amadeus",
      supplier_reference: hotelOfferId,
      trip_type: "roundtrip"
    });

    // Calculate supplier payment
    const markupPercent = parseFloat(Deno.env.get("FLIGHT_MARKUP_PERCENTAGE") || "15");
    const markupAmount = totalPrice * (markupPercent / 100);
    const supplierAmount = totalPrice - markupAmount;

    // Create supplier payment record
    await base44.asServiceRole.entities.SupplierPayment.create({
      booking_id: hotelBooking.id,
      booking_type: "hotel",
      supplier: "amadeus",
      supplier_amount: supplierAmount,
      customer_paid_amount: totalPrice,
      markup_retained: markupAmount,
      payment_status: "pending",
      payment_method: "paymongo_payout",
    });

    // Send confirmation notification
    await base44.functions.invoke('sendNotification', {
      userEmail: guestEmail,
      title: "Hotel Booking Confirmed",
      message: `Your hotel booking at ${hotelName} has been confirmed. Check-in: ${checkInDate}. Total: ₱${totalPrice.toLocaleString()}.`,
      type: "booking_created",
      bookingId: hotelBooking.id,
      link: `/hotel-booking-confirmation?bookingId=${hotelBooking.id}`,
    });

    return Response.json({
      success: true,
      hotelBooking,
      message: "Hotel booking created. Awaiting payment confirmation.",
    });
  } catch (error) {
    console.error("Hotel booking error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});