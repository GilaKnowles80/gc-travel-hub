import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TERMINAL_ID = Deno.env.get("BIYAHEKO_TERMINAL_ID");
const USER_ID = Deno.env.get("BIYAHEKO_USER_ID");
const PASSWORD = Deno.env.get("BIYAHEKO_PASSWORD");
const BASE_URL = "https://biyaheko.ph";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      booking_type,
      flight_key,
      fare_key,
      passengers, // array of { title, first_name, last_name, gender, dob, nationality, passport_number, passport_expiry }
      contact_email,
      contact_phone,
      add_insurance = false
    } = await req.json();

    console.log('Biyaheko book request:', { booking_type, flight_key, passengers: passengers?.length });

    let bookUrl, bookPayload;

    if (booking_type === 'flight') {
      bookUrl = `${BASE_URL}/Airline/Book`;
      bookPayload = {
        TerminalID: TERMINAL_ID,
        UserID: USER_ID,
        Password: PASSWORD,
        FlightKey: flight_key,
        FareKey: fare_key,
        Passengers: passengers,
        ContactEmail: contact_email,
        ContactPhone: contact_phone,
        AddInsurance: add_insurance
      };
    } else if (booking_type === 'bus') {
      bookUrl = `${BASE_URL}/Bus/Book`;
      bookPayload = {
        TerminalID: TERMINAL_ID,
        UserID: USER_ID,
        Password: PASSWORD,
        TripKey: flight_key,
        Passengers: passengers,
        ContactEmail: contact_email,
        ContactPhone: contact_phone
      };
    } else if (booking_type === 'ferry') {
      bookUrl = `${BASE_URL}/Ferry/Book`;
      bookPayload = {
        TerminalID: TERMINAL_ID,
        UserID: USER_ID,
        Password: PASSWORD,
        TripKey: flight_key,
        Passengers: passengers,
        ContactEmail: contact_email,
        ContactPhone: contact_phone
      };
    } else {
      return Response.json({ error: 'Unsupported booking_type. Use: flight, bus, ferry' }, { status: 400 });
    }

    console.log('Booking at:', bookUrl);

    const response = await fetch(bookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookPayload)
    });

    const resultText = await response.text();
    console.log('Book response status:', response.status);
    console.log('Book result (first 500 chars):', resultText.substring(0, 500));

    let booking;
    try {
      booking = JSON.parse(resultText);
    } catch {
      booking = { raw: resultText };
    }

    if (!response.ok) {
      console.error('Biyaheko booking failed:', resultText);
      return Response.json({ error: 'Biyaheko booking failed', details: booking }, { status: response.status });
    }

    // Update supplier stats
    try {
      const suppliers = await base44.asServiceRole.entities.Supplier.filter({ company_name: 'Biyaheko' });
      if (suppliers.length > 0) {
        await base44.asServiceRole.entities.Supplier.update(suppliers[0].id, {
          total_bookings: (suppliers[0].total_bookings || 0) + 1
        });
      }
    } catch (e) {
      console.warn('Could not update supplier stats:', e.message);
    }

    return Response.json({
      success: true,
      supplier: 'biyaheko',
      booking,
      reference: booking.PNR || booking.reference_number || booking.BookingReference
    });

  } catch (error) {
    console.error('Biyaheko booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});