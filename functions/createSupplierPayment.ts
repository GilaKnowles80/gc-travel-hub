import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { bookingId, bookingType } = await req.json();

        if (!bookingId || !bookingType) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Map booking type to entity name
        const entityMap = {
            flight: 'FlightBooking',
            hotel: 'HotelBooking',
            tour: 'Booking',
            ferry: 'FerryBooking',
            bus: 'BusBooking',
            car_rental: 'CarRentalBooking',
        };

        const entityName = entityMap[bookingType];
        if (!entityName) {
            return Response.json({ error: 'Invalid booking type' }, { status: 400 });
        }

        // Fetch the booking
        const bookings = await base44.asServiceRole.entities[entityName].filter({ id: bookingId });
        const booking = bookings[0];

        if (!booking) {
            return Response.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Check if supplier payment already exists
        const existingPayments = await base44.asServiceRole.entities.SupplierPayment.filter({
            booking_id: bookingId
        });

        if (existingPayments.length > 0) {
            return Response.json({ 
                message: 'Supplier payment already exists',
                payment: existingPayments[0]
            });
        }

        // Calculate markup
        const customerPaid = booking.total_price || 0;
        const supplierAmount = booking.supplier_price || customerPaid;
        const markup = customerPaid - supplierAmount;

        // Create supplier payment record
        const payment = await base44.asServiceRole.entities.SupplierPayment.create({
            booking_id: bookingId,
            booking_type: bookingType,
            supplier: booking.supplier || 'direct',
            supplier_amount: supplierAmount,
            customer_paid_amount: customerPaid,
            markup_retained: markup,
            payment_status: 'pending',
        });

        return Response.json({ 
            success: true,
            payment,
            breakdown: {
                customerPaid,
                supplierAmount,
                markup,
                markupPercentage: ((markup / customerPaid) * 100).toFixed(2)
            }
        });

    } catch (error) {
        console.error('Error creating supplier payment:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});