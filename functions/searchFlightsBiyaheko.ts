import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BASE_URL = "https://biyaheko.ph";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const terminalId = Deno.env.get("BIYAHEKO_TERMINAL_ID");
        const userId = Deno.env.get("BIYAHEKO_USER_ID");
        const password = Deno.env.get("BIYAHEKO_PASSWORD");

        if (!terminalId || !userId || !password) {
            return Response.json({ error: "Biyaheko credentials not configured" }, { status: 500 });
        }

        const { origin, destination, departureDate, returnDate, adults = 1, children = 0, infants = 0, cabinClass = "ECONOMY" } = await req.json();

        if (!origin || !destination || !departureDate) {
            return Response.json({ error: "Missing required fields: origin, destination, departureDate" }, { status: 400 });
        }

        const classMap = { "ECONOMY": "ECONOMY", "BUSINESS": "BUSINESS", "FIRST": "FIRST", "PREMIUM_ECONOMY": "PREMIUM_ECONOMY" };
        const tripType = returnDate ? "R" : "O";

        // Step 1: Login via web form POST (session-based)
        const loginBody = new URLSearchParams({
            TerminalID: terminalId,
            UserID: userId,
            Password: password,
        });

        const loginResponse = await fetch(`${BASE_URL}/Home/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0",
                "Referer": `${BASE_URL}/`,
            },
            body: loginBody.toString(),
            redirect: "manual",
        });

        // Collect cookies from login response
        const setCookies = loginResponse.headers.getSetCookie?.() || [];
        const cookieHeader = setCookies.map(c => c.split(";")[0]).join("; ");
        console.log("Login status:", loginResponse.status, "Cookies count:", setCookies.length);

        if (!cookieHeader) {
            const loginText = await loginResponse.text();
            console.error("Login failed, no cookies. Response snippet:", loginText.substring(0, 500));
            return Response.json({ error: "Biyaheko login failed - no session cookies", hint: "Check credentials in secrets" }, { status: 401 });
        }

        // Step 2: Flight search POST
        const searchBody = new URLSearchParams({
            TripType: tripType,
            Origin: origin,
            Destination: destination,
            DepartDate: departureDate,
            ReturnDate: returnDate || "",
            Adult: adults.toString(),
            Child: children.toString(),
            Infant: infants.toString(),
            Class: classMap[cabinClass] || "ECONOMY",
        });

        const searchResponse = await fetch(`${BASE_URL}/Airline/SearchFlight`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": cookieHeader,
                "User-Agent": "Mozilla/5.0",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": `${BASE_URL}/Airline`,
            },
            body: searchBody.toString(),
        });

        const searchText = await searchResponse.text();
        console.log("Search status:", searchResponse.status, "Response length:", searchText.length);

        // Try JSON parse first
        let searchData = null;
        try {
            searchData = JSON.parse(searchText);
        } catch {
            // Not JSON - might be HTML with embedded data
            console.log("Response is not JSON, snippet:", searchText.substring(0, 500));
        }

        if (!searchData) {
            return Response.json({
                error: "Biyaheko returned non-JSON response",
                hint: "Portal may require browser interaction or endpoint URL has changed",
                status: searchResponse.status
            }, { status: 502 });
        }

        // Transform to app format
        const rawFlights = searchData.Flights || searchData.flights || searchData.Data || searchData.data || [];
        const flights = rawFlights.map((flight, idx) => ({
            id: `biyaheko_${idx}`,
            biyaheko_key: flight.FlightKey || flight.flightKey || "",
            airline_name: flight.AirlineName || flight.airlineName || flight.Airline || "",
            airline_code: flight.AirlineCode || flight.airlineCode || "",
            flight_number: flight.FlightNumber || flight.flightNumber || "",
            origin: flight.Origin || flight.origin || origin,
            destination: flight.Destination || flight.destination || destination,
            departure_time: flight.DepartureDateTime || flight.DepartureTime || flight.departureTime || departureDate,
            arrival_time: flight.ArrivalDateTime || flight.ArrivalTime || flight.arrivalTime || "",
            duration_hours: parseFloat(flight.Duration || flight.duration || 0),
            is_direct: !(flight.Stops > 0 || flight.stops > 0),
            stops: parseInt(flight.Stops || flight.stops || 0),
            price: parseFloat(flight.TotalFare || flight.totalFare || flight.Fare || flight.fare || 0),
            currency: "PHP",
            cabin_classes: [{
                class: cabinClass.toLowerCase(),
                price: parseFloat(flight.TotalFare || flight.totalFare || flight.Fare || flight.fare || 0),
                seats_available: parseInt(flight.SeatsAvailable || 9),
            }],
            baggage_allowance: flight.BaggageAllowance || flight.HandBaggage || "7kg carry-on",
            fare_basis: flight.FareBasis || flight.fareBasis || "",
            fare_class: flight.BookingClass || flight.bookingClass || "",
            is_refundable: !!(flight.IsRefundable || flight.isRefundable),
            status: "active",
            source: "biyaheko",
        }));

        return Response.json({ flights, total: flights.length, source: "biyaheko", raw_count: rawFlights.length });

    } catch (error) {
        console.error("searchFlightsBiyaheko error:", error.message, error.stack);
        return Response.json({ error: error.message }, { status: 500 });
    }
});