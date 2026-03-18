import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      flightOfferId,
      passengerName,
      passengerEmail,
      passengerPhone,
      passportNumber,
      dateOfBirth,
      cabinClass,
      numberOfPassengers,
      totalPrice,
      specialRequests,
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

    // Create booking in app database first
    const flightBooking = await base44.asServiceRole.entities.FlightBooking.create({
      flight_id: flightOfferId,
      flight_number: "TBD",
      route: "TBD",
      trip_type: "one_way",
      passenger_name: passengerName,
      passenger_email: passengerEmail,
      passenger_phone: passengerPhone,
      passport_number: passportNumber,
      date_of_birth: dateOfBirth,
      cabin_class: cabinClass,
      number_of_passengers: numberOfPassengers,
      total_price: totalPrice,
      special_requests: specialRequests,
      status: "pending",
      payment_status: "unpaid",
      supplier: "amadeus",
      supplier_reference: flightOfferId,
    });

    // Calculate supplier payment (using FLIGHT_MARKUP_PERCENTAGE)
    const markupPercent = parseFloat(Deno.env.get("FLIGHT_MARKUP_PERCENTAGE") || "15");
    const markupAmount = totalPrice * (markupPercent / 100);
    const supplierAmount = totalPrice - markupAmount;

    // Create supplier payment record
    const supplierPayment = await base44.asServiceRole.entities.SupplierPayment.create({
      booking_id: flightBooking.id,
      booking_type: "flight",
      supplier: "amadeus",
      supplier_amount: supplierAmount,
      customer_paid_amount: totalPrice,
      markup_retained: markupAmount,
      payment_status: "pending",
      payment_method: "paymongo_payout",
    });

    // Send confirmation to user
    await base44.functions.invoke('sendNotification', {
      userEmail: passengerEmail,
      title: "Flight Booking Confirmed",
      message: `Your flight booking for ${numberOfPassengers} passenger(s) has been confirmed. Total: ₱${totalPrice.toLocaleString()}. You will receive your e-ticket within 24 hours.`,
      type: "booking_created",
      bookingId: flightBooking.id,
      link: `/flight-booking-confirmation?bookingId=${flightBooking.id}`,
    });

    return Response.json({
      success: true,
      flightBooking,
      supplierPayment,
      message: "Booking created. Awaiting payment confirmation.",
    });
  } catch (error) {
    console.error("Booking error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});