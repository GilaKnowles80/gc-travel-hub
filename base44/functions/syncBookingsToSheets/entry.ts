import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sheetId, bookingTypes = ['flight', 'hotel', 'tour', 'ferry', 'bus'] } = body;

    if (!sheetId) {
      return Response.json(
        { error: 'sheetId is required' },
        { status: 400 }
      );
    }

    // Get Google Sheets access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    // Fetch all bookings
    const allBookings = [];

    if (bookingTypes.includes('flight')) {
      const flights = await base44.asServiceRole.entities.FlightBooking.list();
      allBookings.push(...flights.map(b => ({ ...b, type: 'Flight' })));
    }

    if (bookingTypes.includes('hotel')) {
      const hotels = await base44.asServiceRole.entities.HotelBooking.list();
      allBookings.push(...hotels.map(b => ({ ...b, type: 'Hotel' })));
    }

    if (bookingTypes.includes('tour')) {
      const tours = await base44.asServiceRole.entities.Booking.list();
      allBookings.push(...tours.map(b => ({ ...b, type: 'Tour' })));
    }

    if (bookingTypes.includes('ferry')) {
      const ferries = await base44.asServiceRole.entities.FerryBooking.list();
      allBookings.push(...ferries.map(b => ({ ...b, type: 'Ferry' })));
    }

    if (bookingTypes.includes('bus')) {
      const buses = await base44.asServiceRole.entities.BusBooking.list();
      allBookings.push(...buses.map(b => ({ ...b, type: 'Bus' })));
    }

    // Prepare data for sheets
    const headers = ['Type', 'Booking ID', 'Customer/Passenger', 'Email', 'Phone', 'Total Price', 'Status', 'Payment Status', 'Stripe Link', 'Date Created'];
    const rows = allBookings.map(booking => [
      booking.type,
      booking.id,
      booking.customer_name || booking.passenger_name || booking.guest_name || 'N/A',
      booking.customer_email || booking.passenger_email || booking.guest_email || '',
      booking.customer_phone || booking.passenger_phone || booking.guest_phone || '',
      booking.total_price || 0,
      booking.status || 'unknown',
      booking.payment_status || 'unpaid',
      `https://dashboard.stripe.com/search?query=${booking.id}`,
      booking.created_date || new Date().toISOString()
    ]);

    // Clear existing data in sheet
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/'Bookings'!A1:Z1000?alt=json`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Append headers and data
    const values = [headers, ...rows];

    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/'Bookings'!A1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: values
        })
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(`Failed to update sheet: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await updateResponse.json();

    return Response.json({
      success: true,
      rowsSync: allBookings.length,
      sheetId: sheetId,
      updatedCells: result.updatedCells,
      updatedRows: result.updatedRows
    });
  } catch (error) {
    console.error('Error syncing bookings to sheets:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});