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

    // Fetch flight details
    const flights = await base44.entities.Flight.filter({ id: booking.flight_id });
    const flight = flights[0];

    // Create PDF
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // ===== PAGE 1: AGENCY & BOOKING DETAILS =====
    
    // Header with gradient background
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 0, 210, 55, 'F');

    // Logo placeholder
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 12, 18, 18, 2, 2, 'F');
    doc.setFillColor(245, 158, 11);
    doc.setFontSize(12);
    doc.setTextColor(245, 158, 11);
    doc.text('GC', 18.5, 23);

    // Company Name & Title
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('GC TRAVEL AND TOURS AGENCY', 38, 20);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('FLIGHT ITINERARY & BOOKING CONFIRMATION', 38, 28);

    // Contact Information
    doc.setFontSize(8);
    doc.text('Business Registration No: 3956850', 38, 36);
    doc.text('Mobile: +63915-440-1150 / +639620595263', 38, 41);
    doc.text('Email: gctravelandtours2021@gmail.com', 38, 46);

    // Booking Reference Box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(145, 12, 50, 16, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('GC Reference No:', 148, 18);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(booking.id.substring(0, 10).toUpperCase(), 148, 25);

    // Reset
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');

    // Issue Date & Status
    let yPos = 65;
    doc.setFillColor(248, 250, 252);
    doc.rect(15, yPos, 180, 18, 'F');
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Issued On:', 20, yPos + 7);
    doc.setFont(undefined, 'normal');
    doc.text(currentDate, 42, yPos + 7);
    
    doc.setFont(undefined, 'bold');
    doc.text('Booking Status:', 20, yPos + 14);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(booking.status === 'confirmed' ? 34 : 180, booking.status === 'confirmed' ? 139 : 83, booking.status === 'confirmed' ? 34 : 9);
    doc.text(booking.status.toUpperCase(), 50, yPos + 14);
    doc.setTextColor(0, 0, 0);
    
    doc.setFont(undefined, 'bold');
    doc.text('Payment Status:', 100, yPos + 7);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(booking.payment_status === 'paid' ? 34 : 220, booking.payment_status === 'paid' ? 139 : 38, booking.payment_status === 'paid' ? 34 : 38);
    doc.text(booking.payment_status.toUpperCase(), 135, yPos + 7);
    doc.setTextColor(0, 0, 0);

    // Passenger Details Section
    yPos += 28;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('PASSENGER DETAILS', 20, yPos);
    
    yPos += 2;
    doc.setLineWidth(0.5);
    doc.setDrawColor(245, 158, 11);
    doc.line(20, yPos, 70, yPos);

    yPos += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Passenger Name:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(booking.passenger_name, 55, yPos);

    yPos += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Pax Type:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('ADULT', 55, yPos);

    doc.setFont(undefined, 'bold');
    doc.text('No. of Passengers:', 100, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(booking.number_of_passengers.toString(), 145, yPos);

    yPos += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Email:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(booking.passenger_email, 55, yPos);

    yPos += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Phone:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(booking.passenger_phone || 'N/A', 55, yPos);

    if (booking.passport_number) {
      yPos += 6;
      doc.setFont(undefined, 'bold');
      doc.text('Passport No:', 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(booking.passport_number, 55, yPos);
    }

    if (booking.date_of_birth) {
      yPos += 6;
      doc.setFont(undefined, 'bold');
      doc.text('Date of Birth:', 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(new Date(booking.date_of_birth).toLocaleDateString(), 55, yPos);
    }

    // Flight Details Section
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('FLIGHT DETAILS', 20, yPos);
    
    yPos += 2;
    doc.setDrawColor(245, 158, 11);
    doc.line(20, yPos, 65, yPos);

    yPos += 8;
    doc.setFillColor(248, 250, 252);
    doc.rect(15, yPos - 3, 180, 45, 'F');

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Airline:', 20, yPos + 2);
    doc.setFont(undefined, 'normal');
    doc.text(flight?.airline_name || 'N/A', 55, yPos + 2);

    doc.setFont(undefined, 'bold');
    doc.text('Flight Number:', 100, yPos + 2);
    doc.setFont(undefined, 'normal');
    doc.text(booking.flight_number || 'N/A', 135, yPos + 2);

    yPos += 7;
    doc.setFont(undefined, 'bold');
    doc.text('Route:', 20, yPos + 2);
    doc.setFont(undefined, 'normal');
    doc.text(booking.route, 55, yPos + 2);

    doc.setFont(undefined, 'bold');
    doc.text('Class:', 100, yPos + 2);
    doc.setFont(undefined, 'normal');
    doc.text(booking.cabin_class.replace(/_/g, ' ').toUpperCase(), 135, yPos + 2);

    yPos += 7;
    doc.setFont(undefined, 'bold');
    doc.text('Departure Date:', 20, yPos + 2);
    doc.setFont(undefined, 'normal');
    doc.text(flight?.departure_time ? new Date(flight.departure_time).toLocaleDateString() : 'TBA', 55, yPos + 2);

    doc.setFont(undefined, 'bold');
    doc.text('Departure Time:', 100, yPos + 2);
    doc.setFont(undefined, 'normal');
    doc.text(flight?.departure_time ? new Date(flight.departure_time).toLocaleTimeString() : 'TBA', 135, yPos + 2);

    yPos += 7;
    doc.setFont(undefined, 'bold');
    doc.text('Arrival Date:', 20, yPos + 2);
    doc.setFont(undefined, 'normal');
    doc.text(flight?.arrival_time ? new Date(flight.arrival_time).toLocaleDateString() : 'TBA', 55, yPos + 2);

    doc.setFont(undefined, 'bold');
    doc.text('Arrival Time:', 100, yPos + 2);
    doc.setFont(undefined, 'normal');
    doc.text(flight?.arrival_time ? new Date(flight.arrival_time).toLocaleTimeString() : 'TBA', 135, yPos + 2);

    yPos += 7;
    doc.setFont(undefined, 'bold');
    doc.text('Duration:', 20, yPos + 2);
    doc.setFont(undefined, 'normal');
    doc.text(`${flight?.duration_hours || 'N/A'} hours`, 55, yPos + 2);

    doc.setFont(undefined, 'bold');
    doc.text('Aircraft:', 100, yPos + 2);
    doc.setFont(undefined, 'normal');
    doc.text(flight?.aircraft_type || 'TBA', 135, yPos + 2);

    yPos += 7;
    doc.setFont(undefined, 'bold');
    doc.text('Terminal:', 20, yPos + 2);
    doc.setFont(undefined, 'normal');
    doc.text('TBA', 55, yPos + 2);

    doc.setFont(undefined, 'bold');
    doc.text('Ticket Number:', 100, yPos + 2);
    doc.setFont(undefined, 'normal');
    doc.text('To be issued', 135, yPos + 2);

    // Special Services Section
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('SPECIAL SERVICES & REQUESTS', 20, yPos);
    
    yPos += 2;
    doc.setDrawColor(245, 158, 11);
    doc.line(20, yPos, 95, yPos);

    yPos += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Seat:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(booking.selected_seats?.join(', ') || 'To be assigned', 50, yPos);

    yPos += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Baggage:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(flight?.baggage_allowance || '23kg checked, 7kg cabin', 50, yPos);

    yPos += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Meal:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('Standard meal service', 50, yPos);

    yPos += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Refundable:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('Non-refundable', 50, yPos);

    if (booking.special_requests) {
      yPos += 6;
      doc.setFont(undefined, 'bold');
      doc.text('Special Requests:', 20, yPos);
      doc.setFont(undefined, 'normal');
      const splitText = doc.splitTextToSize(booking.special_requests, 140);
      doc.text(splitText, 20, yPos + 5);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing GC Travel and Tours Agency!', 20, 280);
    doc.text('Mobile: +63915-440-1150 / +639620595263 | Email: gctravelandtours2021@gmail.com', 20, 285);
    doc.text(`Business No: 3956850 | Generated on ${currentDate}`, 20, 290);

    // ===== PAGE 2: FARE DETAILS =====
    doc.addPage();

    // Header (Simplified)
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('FARE BREAKDOWN', 20, 20);

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Booking Reference: ${booking.id.substring(0, 10).toUpperCase()}`, 150, 20);

    doc.setTextColor(0, 0, 0);

    // Fare Details Table
    yPos = 50;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('FARE DETAILS', 20, yPos);
    
    yPos += 2;
    doc.setDrawColor(245, 158, 11);
    doc.line(20, yPos, 60, yPos);

    yPos += 10;

    // Table Header
    doc.setFillColor(245, 158, 11);
    doc.rect(15, yPos - 5, 180, 10, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('Description', 20, yPos + 1);
    doc.text('Amount (USD)', 150, yPos + 1);
    doc.text('PHP', 175, yPos + 1);

    doc.setTextColor(0, 0, 0);
    yPos += 10;

    // Calculate fare breakdown (assuming 80% base fare, 15% tax, 5% service fee)
    const baseFare = booking.total_price * 0.80;
    const taxAmount = booking.total_price * 0.15;
    const serviceFee = booking.total_price * 0.05;
    const phpRate = 56; // USD to PHP exchange rate

    // Base Fare
    doc.setFillColor(248, 250, 252);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setFont(undefined, 'normal');
    doc.text('Base Fare', 20, yPos);
    doc.text(`$${baseFare.toFixed(2)}`, 150, yPos);
    doc.text(`₱${(baseFare * phpRate).toFixed(2)}`, 175, yPos);

    yPos += 8;
    doc.text('Taxes & Fees', 20, yPos);
    doc.text(`$${taxAmount.toFixed(2)}`, 150, yPos);
    doc.text(`₱${(taxAmount * phpRate).toFixed(2)}`, 175, yPos);

    yPos += 8;
    doc.setFillColor(248, 250, 252);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.text('Service Fee (GC Travel)', 20, yPos);
    doc.text(`$${serviceFee.toFixed(2)}`, 150, yPos);
    doc.text(`₱${(serviceFee * phpRate).toFixed(2)}`, 175, yPos);

    yPos += 10;
    doc.setLineWidth(0.5);
    doc.line(15, yPos, 195, yPos);

    // Total
    yPos += 8;
    doc.setFillColor(245, 158, 11);
    doc.rect(15, yPos - 5, 180, 12, 'F');
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('GROSS FARE', 20, yPos + 2);
    doc.text(`$${booking.total_price.toFixed(2)}`, 150, yPos + 2);
    doc.text(`₱${(booking.total_price * phpRate).toFixed(2)}`, 175, yPos + 2);

    doc.setTextColor(0, 0, 0);

    // Payment Information
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('PAYMENT INFORMATION', 20, yPos);
    
    yPos += 2;
    doc.setDrawColor(245, 158, 11);
    doc.line(20, yPos, 85, yPos);

    yPos += 10;
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Status:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(booking.payment_status === 'paid' ? 34 : 220, booking.payment_status === 'paid' ? 139 : 38, booking.payment_status === 'paid' ? 34 : 38);
    doc.text(booking.payment_status.toUpperCase(), 65, yPos);
    doc.setTextColor(0, 0, 0);

    yPos += 7;
    doc.setFont(undefined, 'bold');
    doc.text('Currency:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('USD / PHP', 65, yPos);

    yPos += 7;
    doc.setFont(undefined, 'bold');
    doc.text('Exchange Rate:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(`1 USD = ${phpRate} PHP`, 65, yPos);

    // Important Notes
    yPos += 15;
    doc.setFillColor(255, 243, 224);
    doc.rect(15, yPos - 3, 180, 40, 'F');

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('IMPORTANT NOTES:', 20, yPos + 3);

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('• This is an electronic ticket. Please check-in online or at the airport.', 20, yPos + 10);
    doc.text('• Arrive at the airport at least 2 hours before domestic flights, 3 hours for international.', 20, yPos + 15);
    doc.text('• Ticket is non-refundable. Changes may be subject to airline fees.', 20, yPos + 20);
    doc.text('• Please verify all details are correct. Contact us immediately if corrections are needed.', 20, yPos + 25);
    doc.text('• Ensure your passport is valid for at least 6 months from travel date for international flights.', 20, yPos + 30);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing GC Travel and Tours Agency!', 20, 280);
    doc.text('Mobile: +63915-440-1150 / +639620595263 | Email: gctravelandtours2021@gmail.com', 20, 285);
    doc.text(`Business No: 3956850 | Page 2 of 2`, 20, 290);

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