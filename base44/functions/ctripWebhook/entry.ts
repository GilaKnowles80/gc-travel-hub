import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Ctrip production IPs for validation
const CTRIP_IPS = [
  '114.80.56.0/24', '211.95.54.0/24', '180.163.115.0/24', '220.196.164.0/24',
  '114.80.56.130', '114.80.56.132', '114.80.56.133', '114.80.56.134', '114.80.56.135',
  '114.80.56.137', '211.95.54.133', '211.95.54.134', '211.95.54.135', '211.95.54.136',
  '211.95.54.137', '180.163.115.69', '180.163.115.70', '180.163.115.71', '180.163.115.72',
  '180.163.115.73', '220.196.164.64', '220.196.164.65', '220.196.164.66', '220.196.164.67',
  '220.196.164.68', '220.196.164.69', '139.196.221.35', '106.15.9.84', '139.224.228.82',
  '47.101.222.105', '139.224.42.110', '47.103.131.255', '47.103.154.48', '139.224.8.76',
  '101.132.191.193', '106.15.46.160', '106.14.17.45', '47.100.76.135',
  '103.48.141.160/27', '103.158.15.66', '103.158.15.67', '103.158.15.68', '103.158.15.69',
  '103.158.15.70', '103.158.15.71', '103.158.15.72', '103.158.15.73', '103.158.15.74',
  '103.158.15.75', '47.236.97.202', '47.236.93.167', '47.236.151.89', '8.219.166.104',
  '47.236.92.39', '8.219.222.124', '47.236.151.68', '47.245.107.167'
];

function ipToInt(ip) {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + (parseInt(oct, 10) >>> 0), 0) >>> 0;
}

function isCtripIp(ip) {
  if (!ip || !/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return false;
  const ipInt = ipToInt(ip);
  for (const entry of CTRIP_IPS) {
    if (entry === ip) return true;
    if (entry.includes('/')) {
      const [base, bitsStr] = entry.split('/');
      if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(base)) continue;
      const bits = parseInt(bitsStr, 10);
      if (Number.isNaN(bits) || bits < 0 || bits > 32) continue;
      const baseInt = ipToInt(base);
      const mask = bits === 0 ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
      if ((ipInt & mask) >>> 0 === (baseInt & mask) >>> 0) return true;
    }
  }
  return false;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Validate that the request originates from a trusted Ctrip source IP.
    const clientIP = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim();
    console.log('Ctrip webhook received from IP:', clientIP);

    if (!clientIP || !isCtripIp(clientIP)) {
      console.warn('Ctrip webhook rejected: untrusted IP', clientIP);
      return new Response(buildErrorResponse('Unauthorized source'), {
        headers: { 'Content-Type': 'text/xml' },
        status: 401
      });
    }

    // Parse XML body
    const xmlBody = await req.text();
    console.log('Ctrip XML payload:', xmlBody);

    // Parse OTA_HotelResNotifRQ (booking notification)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlBody, 'text/xml');
    
    // Extract booking details
    const resStatus = xmlDoc.querySelector('ResStatus');
    if (!resStatus) {
      return new Response(buildErrorResponse('Invalid booking data'), {
        headers: { 'Content-Type': 'text/xml' }
      });
    }

    const bookingData = {
      ctrip_reservation_id: resStatus.getAttribute('ResStatusCode'),
      hotel_code: xmlDoc.querySelector('HotelCode')?.textContent,
      guest_name: xmlDoc.querySelector('GivenName')?.textContent + ' ' + 
                  xmlDoc.querySelector('Surname')?.textContent,
      guest_email: xmlDoc.querySelector('Email')?.textContent,
      guest_phone: xmlDoc.querySelector('PhoneNumber')?.textContent,
      check_in_date: xmlDoc.querySelector('Start')?.textContent,
      check_out_date: xmlDoc.querySelector('End')?.textContent,
      room_type: xmlDoc.querySelector('RoomTypeCode')?.textContent,
      number_of_rooms: parseInt(xmlDoc.querySelector('NumberOfUnits')?.textContent || '1'),
      number_of_guests: parseInt(xmlDoc.querySelector('GuestCount')?.getAttribute('Count') || '1'),
      total_price: parseFloat(xmlDoc.querySelector('Total')?.getAttribute('AmountAfterTax') || '0'),
      currency: xmlDoc.querySelector('Total')?.getAttribute('CurrencyCode') || 'USD',
      status: 'confirmed',
      payment_status: 'paid',
      supplier: 'ctrip',
      supplier_reference: resStatus.getAttribute('ResStatusCode'),
      special_requests: xmlDoc.querySelector('SpecialRequest')?.textContent || ''
    };

    // Find matching hotel in database
    const hotels = await base44.asServiceRole.entities.Hotel.filter({
      name: bookingData.hotel_code
    });

    if (hotels.length === 0) {
      console.warn('Hotel not found for code:', bookingData.hotel_code);
    } else {
      bookingData.hotel_id = hotels[0].id;
      bookingData.hotel_name = hotels[0].name;
    }

    // Create hotel booking
    const booking = await base44.asServiceRole.entities.HotelBooking.create(bookingData);

    console.log('Ctrip booking created:', booking.id);

    // Send success response (OTA_HotelResNotifRS)
    const successResponse = buildSuccessResponse(booking.id);
    
    return new Response(successResponse, {
      headers: { 'Content-Type': 'text/xml' },
      status: 200
    });

  } catch (error) {
    console.error('Ctrip webhook error:', error);
    return new Response(buildErrorResponse(error.message), {
      headers: { 'Content-Type': 'text/xml' },
      status: 200
    });
  }
});

function buildSuccessResponse(bookingId) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<OTA_HotelResNotifRS xmlns="http://www.opentravel.org/OTA/2003/05" 
                     TimeStamp="${new Date().toISOString()}" 
                     Version="1.0">
  <Success/>
  <HotelReservations>
    <HotelReservation>
      <UniqueID Type="14" ID="${bookingId}"/>
    </HotelReservation>
  </HotelReservations>
</OTA_HotelResNotifRS>`;
}

function buildErrorResponse(message) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<OTA_HotelResNotifRS xmlns="http://www.opentravel.org/OTA/2003/05" 
                     TimeStamp="${new Date().toISOString()}" 
                     Version="1.0">
  <Errors>
    <Error Type="3" Code="450">${message}</Error>
  </Errors>
</OTA_HotelResNotifRS>`;
}