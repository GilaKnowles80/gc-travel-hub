import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Generic auto-attach: invoked by the "Auto-Attach <Type> to Itinerary on
// Confirmation" workflows whenever any booking type transitions to
// status=confirmed. Finds (or creates) the passenger's itinerary and appends
// the booking to its items array (de-duplicated by booking_id).
// Service-role (no user session) — workflows call this with booking_id + booking_type.

const TYPE_CONFIG = {
  flight: { entity: 'FlightBooking', emailField: 'passenger_email' },
  hotel: { entity: 'HotelBooking', emailField: 'guest_email' },
  tour: { entity: 'TourBooking', emailField: 'client_email' },
  bus: { entity: 'BusBooking', emailField: 'passenger_email' },
  ferry: { entity: 'FerryBooking', emailField: 'passenger_email' },
  cruise: { entity: 'CruiseBooking', emailField: 'guest_email' },
  car_rental: { entity: 'CarRentalBooking', emailField: 'driver_email' },
  visa: { entity: 'VisaAppointment', emailField: 'applicant_email' },
  train: { entity: 'TrainBooking', emailField: 'passenger_email' },
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function dateOnly(value) {
  if (!value) return todayStr();
  return String(value).split('T')[0];
}

// Build the itinerary item entry + a title/destination for a new itinerary.
function buildEntry(bookingType, booking, bookingId) {
  switch (bookingType) {
    case 'flight':
      return {
        title: `Flight Itinerary — ${booking.route || booking.flight_number || 'Booking'}`,
        destination: booking.route || '',
        item: {
          booking_type: 'flight',
          booking_id: bookingId,
          booking_data: {
            flight_number: booking.flight_number,
            airline_name: booking.airline_name,
            route: booking.route,
            departure_time: booking.departure_time,
            cabin_class: booking.cabin_class,
            passenger_name: booking.passenger_name,
            booking_ref: booking.booking_ref,
            total_price: booking.total_price,
          },
          start_date: dateOnly(booking.departure_time),
          end_date: dateOnly(booking.departure_time),
        },
      };
    case 'hotel':
      return {
        title: `Hotel Itinerary — ${booking.hotel_name || 'Hotel'}`,
        destination: booking.hotel_name || '',
        item: {
          booking_type: 'hotel',
          booking_id: bookingId,
          booking_data: {
            hotel_name: booking.hotel_name,
            room_type: booking.room_type,
            check_in_date: booking.check_in_date,
            check_out_date: booking.check_out_date,
            guest_name: booking.guest_name,
            number_of_rooms: booking.number_of_rooms,
            total_price: booking.total_price,
          },
          start_date: dateOnly(booking.check_in_date),
          end_date: dateOnly(booking.check_out_date),
        },
      };
    case 'tour':
      return {
        title: `Tour Itinerary — ${booking.tour_id || 'Tour'}`,
        destination: booking.tour_id || '',
        item: {
          booking_type: 'tour',
          booking_id: bookingId,
          booking_data: {
            tour_id: booking.tour_id,
            client_name: booking.client_name,
            number_of_participants: booking.number_of_participants,
            departure_date: booking.departure_date,
            total_price: booking.total_price,
          },
          start_date: dateOnly(booking.departure_date),
          end_date: dateOnly(booking.departure_date),
        },
      };
    case 'bus':
      return {
        title: `Bus Itinerary — ${booking.route || 'Bus'}`,
        destination: booking.route || '',
        item: {
          booking_type: 'bus',
          booking_id: bookingId,
          booking_data: {
            route: booking.route,
            bus_company: booking.bus_company,
            departure_date: booking.departure_date,
            departure_time: booking.departure_time,
            passenger_name: booking.passenger_name,
            number_of_passengers: booking.number_of_passengers,
            total_price: booking.total_price,
          },
          start_date: dateOnly(booking.departure_date),
          end_date: dateOnly(booking.departure_date),
        },
      };
    case 'ferry':
      return {
        title: `Ferry Itinerary — ${booking.route || 'Ferry'}`,
        destination: booking.route || '',
        item: {
          booking_type: 'ferry',
          booking_id: bookingId,
          booking_data: {
            route: booking.route,
            ferry_company: booking.ferry_company,
            departure_date: booking.departure_date,
            departure_time: booking.departure_time,
            passenger_name: booking.passenger_name,
            accommodation_type: booking.accommodation_type,
            total_price: booking.total_price,
          },
          start_date: dateOnly(booking.departure_date),
          end_date: dateOnly(booking.departure_date),
        },
      };
    case 'cruise':
      return {
        title: `Cruise Itinerary — ${booking.cruise_name || 'Cruise'}`,
        destination: booking.cruise_name || '',
        item: {
          booking_type: 'cruise',
          booking_id: bookingId,
          booking_data: {
            cruise_name: booking.cruise_name,
            cabin_category: booking.cabin_category,
            guest_name: booking.guest_name,
            number_of_guests: booking.number_of_guests,
            total_price: booking.total_price,
          },
          start_date: todayStr(),
          end_date: todayStr(),
        },
      };
    case 'car_rental':
      return {
        title: `Car Rental Itinerary — ${booking.pickup_location || 'Car Rental'}`,
        destination: booking.pickup_location || '',
        item: {
          booking_type: 'car_rental',
          booking_id: bookingId,
          booking_data: {
            pickup_location: booking.pickup_location,
            dropoff_location: booking.dropoff_location,
            car_type: booking.car_type,
            pickup_date: booking.pickup_date,
            dropoff_date: booking.dropoff_date,
            driver_name: booking.driver_name,
            with_driver: booking.with_driver,
            total_price: booking.total_price,
          },
          start_date: dateOnly(booking.pickup_date),
          end_date: dateOnly(booking.dropoff_date),
        },
      };
    case 'visa':
      return {
        title: `Visa Appointment — ${booking.country || 'Visa'}`,
        destination: booking.country || '',
        item: {
          booking_type: 'visa',
          booking_id: bookingId,
          booking_data: {
            country: booking.country,
            visa_type: booking.visa_type,
            applicant_name: booking.applicant_name,
            appointment_date: booking.appointment_date,
            travel_date: booking.travel_date,
            purpose: booking.purpose,
            total_price: booking.total_price,
          },
          start_date: dateOnly(booking.appointment_date),
          end_date: dateOnly(booking.appointment_date),
        },
      };
    case 'train':
      return {
        title: `Train Itinerary — ${booking.route || 'Train'}`,
        destination: booking.route || '',
        item: {
          booking_type: 'train',
          booking_id: bookingId,
          booking_data: {
            route: booking.route,
            train_number: booking.train_number,
            departure_date: booking.departure_date,
            departure_time: booking.departure_time,
            passenger_name: booking.passenger_name,
            class_type: booking.class_type,
            total_price: booking.total_price,
          },
          start_date: dateOnly(booking.departure_date),
          end_date: dateOnly(booking.departure_date),
        },
      };
    default:
      return null;
  }
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const booking_id = body?.booking_id;
    const booking_type = body?.booking_type;

    if (!booking_id || !booking_type) {
      return Response.json({ error: 'booking_id and booking_type required' }, { status: 400 });
    }

    const cfg = TYPE_CONFIG[booking_type];
    if (!cfg) {
      return Response.json({ error: `Unsupported booking_type: ${booking_type}` }, { status: 400 });
    }

    const entityApi = base44.asServiceRole.entities[cfg.entity];
    const bookings = await entityApi.filter({ id: booking_id });
    const booking = bookings?.[0];
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'confirmed') {
      return Response.json({ success: false, skipped: true, reason: 'not_confirmed' });
    }

    const userEmail = booking[cfg.emailField];
    if (!userEmail) {
      return Response.json({ success: false, skipped: true, reason: 'no_passenger_email' });
    }

    // Find itineraries owned by this passenger.
    const existing = await base44.asServiceRole.entities.Itinerary.filter({ user_email: userEmail });

    // De-duplicate: skip if this booking is already attached to any itinerary.
    const alreadyAttached = (existing || []).some(
      (it) => Array.isArray(it.items) && it.items.some((itm) => itm?.booking_id === booking_id)
    );
    if (alreadyAttached) {
      return Response.json({ success: true, skipped: true, reason: 'already_attached' });
    }

    const entry = buildEntry(booking_type, booking, booking_id);
    if (!entry) {
      return Response.json({ error: 'Could not build itinerary entry' }, { status: 400 });
    }

    // Pick the most recently updated itinerary (if any), else create a new one.
    const sorted = [...(existing || [])].sort(
      (a, b) => new Date(b.updated_date || 0).getTime() - new Date(a.updated_date || 0).getTime()
    );
    let itinerary = sorted[0];

    if (!itinerary) {
      itinerary = await base44.asServiceRole.entities.Itinerary.create({
        user_email: userEmail,
        title: entry.title,
        destination: entry.destination,
        start_date: entry.item.start_date,
        end_date: entry.item.end_date,
        items: [entry.item],
        notes: '',
      });
    } else {
      const items = Array.isArray(itinerary.items) ? itinerary.items : [];
      items.push(entry.item);
      itinerary = await base44.asServiceRole.entities.Itinerary.update(itinerary.id, {
        items,
        start_date: itinerary.start_date || entry.item.start_date,
        end_date: itinerary.end_date || entry.item.end_date,
      });
    }

    try {
      await base44.asServiceRole.analytics.track({
        eventName: 'booking_auto_attached_to_itinerary',
        properties: {
          booking_type,
          booking_id,
          itinerary_id: itinerary.id,
          user_email: userEmail,
        },
      });
    } catch (_e) {
      // analytics failure is non-fatal
    }

    return Response.json({ success: true, itinerary_id: itinerary.id });
  } catch (error) {
    console.error('autoAttachBookingToItinerary error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}