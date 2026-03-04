import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PAYPAL_API_BASE = 'https://api-m.paypal.com'; // Live

async function getPayPalAccessToken() {
  const auth = btoa(`${Deno.env.get('PAYPAL_CLIENT_ID')}:${Deno.env.get('PAYPAL_SECRET')}`);
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, bookingType, bookingId, amount } = await req.json();

    if (!orderId) {
      return Response.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const capture = await response.json();

    if (!response.ok || capture.status !== 'COMPLETED') {
      console.error('[PAYPAL CAPTURE ERROR]', JSON.stringify(capture));
      return Response.json({ error: capture.message || 'Capture failed', details: capture }, { status: 400 });
    }

    console.log('[PAYPAL] Order captured:', orderId, 'Status:', capture.status);

    // Update booking status
    const entityMap = {
      flight: 'FlightBooking', hotel: 'HotelBooking', tour: 'Booking',
      ferry: 'FerryBooking', bus: 'BusBooking', cruise: 'CruiseBooking',
      train: 'TrainBooking', car: 'CarRentalBooking', car_rental: 'CarRentalBooking',
      insurance: 'InsurancePolicy', visa: 'VisaAppointment'
    };

    const entity = entityMap[bookingType?.toLowerCase()];
    if (entity && bookingId) {
      try {
        const statusFields = bookingType === 'insurance'
          ? { payment_status: 'paid', status: 'active' }
          : { payment_status: 'paid', status: 'confirmed' };
        await base44.entities[entity].update(bookingId, statusFields);
        console.log(`[PAYPAL] Booking ${bookingType}:${bookingId} confirmed`);
      } catch (err) {
        console.error('Booking update error:', err.message);
      }
    }

    // Track payment & revenue split
    try {
      await base44.entities.Payment.create({
        user_email: user.email,
        booking_type: bookingType,
        booking_id: bookingId,
        amount: amount,
        currency: 'USD',
        payment_method: 'paypal',
        status: 'completed',
        paypal_order_id: orderId
      });

      const supplierAmount = parseFloat((amount * 0.75).toFixed(2));
      const agencyAmount = parseFloat((amount * 0.25).toFixed(2));
      await base44.entities.PaymentSplit.create({
        booking_id: bookingId,
        booking_type: bookingType,
        gross_amount: amount,
        supplier_amount: supplierAmount,
        agency_amount: agencyAmount,
        stripe_fee: 0,
        net_profit: agencyAmount,
        currency: 'USD',
        user_email: user.email,
        split_date: new Date().toISOString(),
        status: 'settled'
      });
    } catch (err) {
      console.error('Payment tracking error:', err.message);
    }

    // Send confirmation notification
    try {
      await base44.entities.Notification.create({
        user_email: user.email,
        title: '✅ Booking Confirmed via PayPal',
        message: `Your ${bookingType} booking has been confirmed. PayPal Order: ${orderId}`,
        type: 'payment_confirmed',
        booking_id: bookingId,
        link: '/MyBookings'
      });
    } catch (err) {
      console.error('Notification error:', err.message);
    }

    return Response.json({ success: true, status: capture.status, orderId });

  } catch (error) {
    console.error('[PAYPAL CAPTURE ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});