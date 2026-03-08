import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Prefix map per product type
// Format: PREFIX + zero-padded sequential number
const PRODUCT_CONFIG = {
  hotel:     { prefix: 'HTL',    entity: 'HotelBooking',      pad: 7 },
  car:       { prefix: 'CAR',    entity: 'CarRentalBooking',  pad: 7 },
  tour:      { prefix: 'TRP',    entity: 'TourBooking',       pad: 7 },
  cruise:    { prefix: 'CRS',    entity: 'CruiseBooking',     pad: 7 },
  ferry:     { prefix: 'FRY',    entity: 'FerryBooking',      pad: 7 },
  train:     { prefix: 'TRN',    entity: 'TrainBooking',      pad: 7 },
  visa:      { prefix: 'VSA',    entity: 'VisaAppointment',   pad: 7 },
  bus:       { prefix: 'BUS',    entity: 'BusBooking',        pad: 7 },
  insurance: { prefix: 'INS',    entity: 'TravelInsurance',   pad: 7 },
  package:   { prefix: 'PKG',    entity: 'PackageBooking',    pad: 7 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { product_type } = body;

    const config = PRODUCT_CONFIG[product_type];
    if (!config) {
      return Response.json({ error: `Unknown product_type: ${product_type}` }, { status: 400 });
    }

    const { prefix, entity, pad } = config;

    // Fetch existing records to find the next sequential number
    let records = [];
    try {
      records = await base44.asServiceRole.entities[entity].list('created_date');
    } catch (e) {
      console.warn(`Could not fetch ${entity}: ${e.message}`);
    }

    const existingNums = records
      .map(r => r.booking_ref)
      .filter(ref => ref && ref.startsWith(prefix))
      .map(ref => parseInt(ref.replace(prefix, ''), 10))
      .filter(n => !isNaN(n));

    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    const booking_ref = `${prefix}${String(nextNum).padStart(pad, '0')}`;

    return Response.json({ booking_ref });
  } catch (error) {
    console.error('generateBookingRef error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});