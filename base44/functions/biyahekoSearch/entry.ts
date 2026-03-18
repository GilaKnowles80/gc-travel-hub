import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TERMINAL_ID = Deno.env.get("BIYAHEKO_TERMINAL_ID");
const USER_ID = Deno.env.get("BIYAHEKO_USER_ID");
const PASSWORD = Deno.env.get("BIYAHEKO_PASSWORD");
const BASE_URL = "https://biyaheko.ph";

async function getBiyahekoToken() {
  const response = await fetch(`${BASE_URL}/Authentication/Index`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      TerminalID: TERMINAL_ID,
      UserID: USER_ID,
      Password: PASSWORD
    })
  });

  const text = await response.text();
  console.log('Auth response status:', response.status);
  console.log('Auth response headers:', JSON.stringify([...response.headers.entries()]));

  // Try to extract session/token from cookies or response
  const cookies = response.headers.get('set-cookie');
  console.log('Cookies:', cookies);

  return { cookies, body: text, status: response.status };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { search_type, origin, destination, date, passengers = 1, cabin_class = 'Economy', return_date } = body;

    console.log('Biyaheko search:', { search_type, origin, destination, date, passengers });

    // Attempt login
    const auth = await getBiyahekoToken();
    if (auth.status !== 200) {
      console.error('Auth failed:', auth.body);
      return Response.json({ error: 'Biyaheko authentication failed', details: auth.body }, { status: 401 });
    }

    // For flight search - use Biyaheko's flight search endpoint
    let searchUrl, searchPayload;

    if (search_type === 'flight') {
      searchUrl = `${BASE_URL}/Airline/FlightSearch`;
      searchPayload = {
        Origin: origin,
        Destination: destination,
        DepartureDate: date,
        ReturnDate: return_date || '',
        Adults: passengers,
        Children: 0,
        Infant: 0,
        CabinClass: cabin_class,
        TripType: return_date ? 'R' : 'O', // O=oneway, R=roundtrip
        TerminalID: TERMINAL_ID,
        UserID: USER_ID,
        Password: PASSWORD
      };
    } else if (search_type === 'bus') {
      searchUrl = `${BASE_URL}/Bus/Search`;
      searchPayload = {
        Origin: origin,
        Destination: destination,
        DepartureDate: date,
        Adults: passengers,
        TerminalID: TERMINAL_ID,
        UserID: USER_ID,
        Password: PASSWORD
      };
    } else if (search_type === 'ferry') {
      searchUrl = `${BASE_URL}/Ferry/Search`;
      searchPayload = {
        Origin: origin,
        Destination: destination,
        DepartureDate: date,
        Adults: passengers,
        TerminalID: TERMINAL_ID,
        UserID: USER_ID,
        Password: PASSWORD
      };
    } else {
      return Response.json({ error: 'Unsupported search_type. Use: flight, bus, ferry' }, { status: 400 });
    }

    console.log('Searching:', searchUrl, searchPayload);

    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': auth.cookies || ''
      },
      body: JSON.stringify(searchPayload)
    });

    const resultText = await searchResponse.text();
    console.log('Search response status:', searchResponse.status);
    console.log('Search result (first 500 chars):', resultText.substring(0, 500));

    let results;
    try {
      results = JSON.parse(resultText);
    } catch {
      results = { raw: resultText };
    }

    return Response.json({
      success: true,
      supplier: 'biyaheko',
      search_type,
      results
    });

  } catch (error) {
    console.error('Biyaheko search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});