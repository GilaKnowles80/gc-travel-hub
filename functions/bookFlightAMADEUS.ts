import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      flightOfferId,
      passengerInfo,
      contactInfo,
      totalPrice,
      markup
    } = await req.json();

    // Get AMADEUS token
    const tokenResponse = await base44.functions.invoke('amadeusBearerToken', {});
    const token = tokenResponse.data.token;

    if (!token) {
      throw new Error('Failed to obtain AMADEUS token');
    }

    // Create order payload for AMADEUS
    const orderPayload = {
      data: {
        type: 'flight-order',
        flightOffers: [{ id: flightOfferId }],
        travelers: passengerInfo.map((p, idx) => ({
          id: `${idx + 1}`,
          dateOfBirth: p.dateOfBirth,
          name: {
            firstName: p.firstName,
            lastName: p.lastName
          },
          gender: p.gender || 'MALE',
          contact: {
            emailAddress: contactInfo.email,
            phones: [{
              deviceType: 'MOBILE',
              countryCallingCode: '1',
              number: contactInfo.phone
            }]
          },
          documents: [{
            documentType: 'PASSPORT',
            birthPlace: p.birthPlace || 'Unknown',
            issuanceLocation: p.issuanceLocation || 'Unknown',
            issuanceDate: p.issuanceDate || new Date().toISOString().split('T')[0],
            number: p.passportNumber,
            expiryDate: p.passportExpiry,
            issuanceCountry: p.issuanceCountry || 'US',
            validityCountry: p.validityCountry || 'US',
            nationality: p.nationality || 'US',
            holder: true
          }]
        }))
      }
    };

    // Call AMADEUS booking API
    const bookingResponse = await fetch('https://api.amadeus.com/v1/booking/flight-orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/vnd.amadeus+json'
      },
      body: JSON.stringify(orderPayload)
    });

    const bookingData = await bookingResponse.json();

    if (!bookingResponse.ok) {
      throw new Error(bookingData.errors?.[0]?.detail || 'AMADEUS booking failed');
    }

    const booking = bookingData.data;

    // Create flight booking record in database
    const flightBooking = await base44.asServiceRole.entities.FlightBooking.create({
      flight_id: flightOfferId,
      flight_number: booking.flightOffers?.[0]?.validatingAirlineCodes?.[0] || 'Unknown',
      route: `${passengerInfo[0]?.origin || ''} - ${passengerInfo[0]?.destination || ''}`,
      trip_type: 'one_way',
      passenger_name: passengerInfo[0]?.firstName + ' ' + passengerInfo[0]?.lastName,
      passenger_email: contactInfo.email,
      passenger_phone: contactInfo.phone,
      passport_number: passengerInfo[0]?.passportNumber,
      date_of_birth: passengerInfo[0]?.dateOfBirth,
      cabin_class: 'economy',
      number_of_passengers: passengerInfo.length,
      total_price: totalPrice,
      status: 'confirmed',
      payment_status: 'paid',
      supplier: 'amadeus',
      supplier_reference: booking.id,
      price_comparison_notes: `AMADEUS live booking - Markup: ₱${markup}`
    });

    // Create supplier payment record
    const supplierAmount = totalPrice - markup;
    await base44.asServiceRole.entities.SupplierPayment.create({
      booking_id: flightBooking.id,
      booking_type: 'flight',
      supplier: 'amadeus',
      supplier_amount: supplierAmount,
      customer_paid_amount: totalPrice,
      markup_retained: markup,
      payment_status: 'pending',
      payment_method: 'paymongo_payout'
    });

    // Send confirmation email
    await base44.functions.invoke('sendNotification', {
      userEmail: contactInfo.email,
      title: 'Flight Booking Confirmed',
      message: `Your flight booking has been confirmed. Reference: ${booking.id}`,
      type: 'booking_created',
      bookingId: flightBooking.id
    });

    return Response.json({
      success: true,
      booking: flightBooking,
      amadeusReference: booking.id
    });
  } catch (error) {
    console.error('Flight booking error:', error);
    return Response.json({
      error: error.message,
      success: false
    }, { status: 500 });
  }
});