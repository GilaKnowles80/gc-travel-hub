import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Philippine domestic airport IATA codes
const PH_AIRPORTS = new Set([
  'MNL','CEB','DVO','ILO','BCD','KLO','LGP','CGY','ZAM','BXU','GES','TAG',
  'CYP','TUG','CRK','LAO','MPH','PPS','RXS','SJI','TAC','VRC','WNP','DPL',
  'ENI','MBO','OZC','MLP','SFE','TWT','USU','VIS'
]);

function isDomesticRoute(origin, destination) {
  return PH_AIRPORTS.has((origin || '').toUpperCase()) && PH_AIRPORTS.has((destination || '').toUpperCase());
}

// Prefix mapping:
// IRTT = International Round Trip Ticket
// IOWT = International One Way Ticket
// DRTT = Domestic Round Trip Ticket
// DOWT = Domestic One Way Ticket
function getPrefix(origin, destination, tripType) {
  const domestic = isDomesticRoute(origin, destination);
  const isRoundTrip = tripType === 'round_trip' || tripType === 'roundtrip';
  if (domestic) {
    return isRoundTrip ? 'DRTT' : 'DOWT';
  } else {
    return isRoundTrip ? 'IRTT' : 'IOWT';
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { origin, destination, trip_type } = body;

    const prefix = getPrefix(origin, destination, trip_type);

    // Pad length: IRTT/IOWT = 10 digits, DRTT/DOWT = 7 digits (matching examples)
    // IRTT0000000001 = 10 digits, DRTT0000001 = 7 digits
    const padLength = prefix.startsWith('I') ? 10 : 7;

    const bookings = await base44.asServiceRole.entities.FlightBooking.list('created_date');

    // Find the highest sequential number for this prefix
    const existingNums = bookings
      .map(b => b.booking_ref)
      .filter(r => r && r.startsWith(prefix))
      .map(r => parseInt(r.replace(prefix, ''), 10))
      .filter(n => !isNaN(n));

    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    const booking_ref = `${prefix}${String(nextNum).padStart(padLength, '0')}`;

    return Response.json({ booking_ref });
  } catch (error) {
    console.error('generateFlightBookingRef error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});