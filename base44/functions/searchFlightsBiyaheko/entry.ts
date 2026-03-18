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

        const tripType = returnDate ? "R" : "O";
        const classMap = { "ECONOMY": "ECONOMY", "BUSINESS": "BUSINESS", "FIRST": "FIRST", "PREMIUM_ECONOMY": "PREMIUM_ECONOMY" };

        // Step 1: Login via Biyaheko's AngularJS API
        const loginPayload = {
            TERMINALID: terminalId,
            USERID: userId,
            PASSWORD: password,
        };

        const loginResponse = await fetch(`${BASE_URL}/api/UserLogin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0",
                "Referer": `${BASE_URL}/`,
            },
            body: JSON.stringify(loginPayload),
        });

        console.log("Login status:", loginResponse.status);
        const loginText = await loginResponse.text();
        console.log("Login response snippet:", loginText.substring(0, 500));

        let loginData = null;
        try { loginData = JSON.parse(loginText); } catch { /* not json */ }

        const sessionToken = loginData?.SessionID || loginData?.sessionID || loginData?.Token || loginData?.token
            || loginData?.SessionId || loginData?.data?.SessionID || loginData?.data?.Token;

        if (!sessionToken) {
            return Response.json({
                error: "Biyaheko login did not return session token",
                status: loginResponse.status,
                raw: loginText.substring(0, 500),
            }, { status: 401 });
        }

        console.log("Got session token:", sessionToken.substring(0, 20) + "...");

        // Step 2: Search flights
        const searchPayload = {
            SessionID: sessionToken,
            TripType: tripType,
            Origin: origin,
            Destination: destination,
            DepartDate: departureDate,
            ReturnDate: returnDate || "",
            Adult: adults,
            Child: children,
            Infant: infants,
            Class: classMap[cabinClass] || "ECONOMY",
        };

        const searchResponse = await fetch(`${BASE_URL}/api/AirlineSearch`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0",
                "Referer": `${BASE_URL}/`,
            },
            body: JSON.stringify(searchPayload),
        });

        const searchText = await searchResponse.text();
        console.log("Search status:", searchResponse.status, "Length:", searchText.length);
        console.log("Search snippet:", searchText.substring(0, 400));

        let searchData = null;
        try { searchData = JSON.parse(searchText); } catch {
            return Response.json({
                error: "Biyaheko search returned non-JSON response",
                status: searchResponse.status,
                snippet: searchText.substring(0, 400),
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

        return Response.json({ flights, total: flights.length, source: "biyaheko" });

    } catch (error) {
        console.error("searchFlightsBiyaheko error:", error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});