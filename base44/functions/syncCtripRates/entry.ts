import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { hotel_id, room_type, date_range, rate_plan, base_rate } = await req.json();

    if (!hotel_id || !room_type || !date_range || !base_rate) {
      return Response.json({ 
        error: 'Missing required fields: hotel_id, room_type, date_range, base_rate' 
      }, { status: 400 });
    }

    // Get hotel details
    const hotel = await base44.entities.Hotel.filter({ id: hotel_id });
    if (hotel.length === 0) {
      return Response.json({ error: 'Hotel not found' }, { status: 404 });
    }

    const ctripUrl = Deno.env.get('CTRIP_VENDOR_URL');
    const username = Deno.env.get('CTRIP_USERNAME');
    const password = Deno.env.get('CTRIP_PASSWORD');
    const hotelCode = Deno.env.get('CTRIP_HOTEL_CODE');

    // Build OTA_HotelRateAmountNotifRQ XML
    const xml = buildRateXML(hotelCode, room_type, date_range, rate_plan || 'BAR', base_rate);

    console.log('Sending rates to Ctrip:', xml);

    // Send to Ctrip
    const response = await fetch(ctripUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`)
      },
      body: xml
    });

    const responseText = await response.text();
    console.log('Ctrip response:', responseText);

    if (!response.ok) {
      throw new Error(`Ctrip API error: ${response.status} - ${responseText}`);
    }

    // Parse response
    const success = responseText.includes('<Success');

    return Response.json({
      success,
      message: success ? 'Rates synced successfully' : 'Sync failed',
      ctrip_response: responseText
    });

  } catch (error) {
    console.error('Ctrip rate sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildRateXML(hotelCode, roomType, dateRange, ratePlanCode, baseRate) {
  const { start_date, end_date } = dateRange;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<OTA_HotelRateAmountNotifRQ xmlns="http://www.opentravel.org/OTA/2003/05" 
                            TimeStamp="${new Date().toISOString()}" 
                            Version="1.0">
  <RateAmountMessages HotelCode="${hotelCode}">
    <RateAmountMessage>
      <StatusApplicationControl Start="${start_date}" End="${end_date}" 
                                RatePlanCode="${ratePlanCode}"/>
      <Rates>
        <Rate>
          <BaseByGuestAmts>
            <BaseByGuestAmt AmountAfterTax="${baseRate}" CurrencyCode="USD" NumberOfGuests="2"/>
          </BaseByGuestAmts>
        </Rate>
      </Rates>
    </RateAmountMessage>
  </RateAmountMessages>
</OTA_HotelRateAmountNotifRQ>`;
}