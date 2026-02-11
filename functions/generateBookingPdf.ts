import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return Response.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Fetch booking details
    const bookings = await base44.entities.FlightBooking.filter({ id: bookingId });
    const booking = bookings[0];

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Create PDF
    const doc = new jsPDF();

    // Header with gradient background
    doc.setFillColor(245, 158, 11); // Amber color
    doc.rect(0, 0, 210, 50, 'F');

    // Logo placeholder (square)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 10, 15, 15, 2, 2, 'F');
    doc.setFillColor(245, 158, 11);
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    doc.text('GC', 18, 19);

    // Company Name
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('GC Travel and Tours Agency', 35, 18);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Flight Booking Confirmation', 35, 25);

    // Contact Information
    doc.setFontSize(8);
    doc.text('Business No: 3956850', 35, 32);
    doc.text('Mobile: +63915-440-1150 / +639620595263', 35, 37);
    doc.text('Email: gctravelandtours2021@gmail.com', 35, 42);

    // Booking reference
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`Booking Ref: ${booking.id.substring(0, 8).toUpperCase()}`, 150, 20);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Flight Details Section
    let yPos = 65;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Flight Details', 20, yPos);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPos += 10;

    const flightDetails = [
      ['Flight Number:', booking.flight_number],
      ['Route:', booking.route],
      ['Cabin Class:', booking.cabin_class?.replace(/_/g, ' ').toUpperCase()],
      ['Trip Type:', booking.trip_type?.replace(/_/g, ' ').toUpperCase()],
      ['Passengers:', booking.number_of_passengers.toString()],
      ['Booking Status:', booking.status.toUpperCase()],
      ['Payment Status:', booking.payment_status.toUpperCase()],
    ];

    flightDetails.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(value, 70, yPos);
      yPos += 7;
    });

    // Passenger Information Section
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Passenger Information', 20, yPos);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPos += 10;

    const passengerDetails = [
      ['Name:', booking.passenger_name],
      ['Email:', booking.passenger_email],
      ['Phone:', booking.passenger_phone],
    ];

    if (booking.passport_number) {
      passengerDetails.push(['Passport:', booking.passport_number]);
    }

    if (booking.date_of_birth) {
      passengerDetails.push(['Date of Birth:', new Date(booking.date_of_birth).toLocaleDateString()]);
    }

    passengerDetails.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(value, 70, yPos);
      yPos += 7;
    });

    // Special Requests
    if (booking.special_requests) {
      yPos += 5;
      doc.setFont(undefined, 'bold');
      doc.text('Special Requests:', 20, yPos);
      yPos += 7;
      doc.setFont(undefined, 'normal');
      const splitText = doc.splitTextToSize(booking.special_requests, 170);
      doc.text(splitText, 20, yPos);
      yPos += splitText.length * 7;
    }

    // Price Section
    yPos += 10;
    doc.setFillColor(250, 250, 250);
    doc.rect(20, yPos - 5, 170, 20, 'F');
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Total Amount:', 20, yPos + 5);
    doc.setFontSize(18);
    doc.setTextColor(245, 158, 11);
    doc.text(`$${booking.total_price?.toLocaleString()}`, 150, yPos + 5);
    doc.setTextColor(0, 0, 0);

    // Footer
    yPos = 270;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing GC Travel and Tours Agency!', 20, yPos);
    doc.text('Mobile: +63915-440-1150 / +639620595263 | Email: gctravelandtours2021@gmail.com', 20, yPos + 5);
    doc.text(`Business No: 3956850 | Generated on ${new Date().toLocaleDateString()}`, 20, yPos + 10);

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=booking-${booking.flight_number}.pdf`
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});