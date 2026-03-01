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

        // Step 1: GET the login page to get any CSRF token / cookies first
        const loginPageRes = await fetch(`${BASE_URL}/`, {
            method: "GET",
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        });

        const initialCookies = (loginPageRes.headers.getSetCookie?.() || []).map(c => c.split(";")[0]).join("; ");
        console.log("Initial cookies:", initialCookies);

        // Step 2: POST login
        const loginBody = new URLSearchParams({
            TerminalID: terminalId,
            UserID: userId,
            Password: password,
        });

        const loginResponse = await fetch(`${BASE_URL}/Home/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": `${BASE_URL}/`,
                "Accept": "application/json, text/html, */*",
                "Cookie": initialCookies,
            },
            body: loginBody.toString(),
            redirect: "manual",
        });

        console.log("Login status:", loginResponse.status);
        console.log("Login Location:", loginResponse.headers.get("location"));

        const loginSetCookies = loginResponse.headers.getSetCookie?.() || [];
        const allCookies = [
            ...initialCookies.split("; ").filter(Boolean),
            ...loginSetCookies.map(c => c.split(";")[0])
        ].filter(Boolean).join("; ");

        console.log("All cookies after login:", allCookies);

        // If no cookies, check response body
        if (!allCookies || loginSetCookies.length === 0) {
            const loginText = await loginResponse.text();
            console.error("Login response body snippet:", loginText.substring(0, 800));
            return Response.json({
                error: "Login did not return session cookies",
                status: loginResponse.status,
                hint: "Biyaheko may have changed their login endpoint or credentials are wrong"
            }, { status: 401 });
        }

        // Step 3: Follow redirect if needed
        let sessionCookie = allCookies;
        const redirectUrl = loginResponse.headers.get("location");
        if (redirectUrl) {
            const redirectFull = redirectUrl.startsWith("http") ? redirectUrl : `${BASE_URL}${redirectUrl}`;
            const redirectRes = await fetch(redirectFull, {
                headers: {
                    "Cookie": sessionCookie,
                    "User-Agent": "Mozilla/5.0",
                },
                redirect: "manual",
            });
            const redirectCookies = (redirectRes.headers.getSetCookie?.() || []).map(c => c.split(";")[0]);
            if (redirectCookies.length > 0) {
                sessionCookie = [...sessionCookie.split("; "), ...redirectCookies].join("; ");
            }
            console.log("After redirect, cookie count:", sessionCookie.split("; ").length);
        }

        // Step 4: POST flight search
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
                "Cookie": sessionCookie,
                "User-Agent": "Mozilla/5.0",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": `${BASE_URL}/Airline`,
                "Accept": "application/json, */*",
            },
            body: searchBody.toString(),
        });

        const searchText = await searchResponse.text();
        console.log("Search status:", searchResponse.status, "Length:", searchText.length, "Snippet:", searchText.substring(0, 300));

        let searchData = null;
        try {
            searchData = JSON.parse(searchText);
        } catch {
            return Response.json({
                error: "Biyaheko search returned non-JSON",
                status: searchResponse.status,
                hint: "The flight search endpoint may have changed or session is invalid",
                snippet: searchText.substring(0, 300)
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