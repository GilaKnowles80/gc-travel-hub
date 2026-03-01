import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BIYAHEKO_BASE_URL = "https://biyaheko.ph";

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

        // Step 1: Login to Biyaheko
        const loginPayload = new URLSearchParams({
            TerminalID: terminalId,
            UserID: userId,
            Password: password,
        });

        const loginResponse = await fetch(`${BIYAHEKO_BASE_URL}/api/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
            },
            body: loginPayload.toString(),
        });

        if (!loginResponse.ok) {
            const errText = await loginResponse.text();
            console.error("Biyaheko login failed:", errText);
            return Response.json({ error: "Biyaheko login failed", details: errText }, { status: 401 });
        }

        const loginData = await loginResponse.json();
        console.log("Biyaheko login response:", JSON.stringify(loginData));

        // Extract session token
        const sessionToken = loginData.SessionID || loginData.Token || loginData.token || loginData.session_id;
        if (!sessionToken) {
            console.error("No session token in login response:", JSON.stringify(loginData));
            return Response.json({ error: "No session token received from Biyaheko", details: loginData }, { status: 401 });
        }

        // Step 2: Search flights
        const tripType = returnDate ? "R" : "O"; // O = One Way, R = Round Trip
        const classMap = {
            "ECONOMY": "Y",
            "BUSINESS": "C",
            "FIRST": "F",
            "PREMIUM_ECONOMY": "W"
        };
        const cabinCode = classMap[cabinClass] || "Y";

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
            Class: cabinCode,
        };

        const searchResponse = await fetch(`${BIYAHEKO_BASE_URL}/api/FlightSearch`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(searchPayload),
        });

        if (!searchResponse.ok) {
            const errText = await searchResponse.text();
            console.error("Biyaheko flight search failed:", errText);
            return Response.json({ error: "Biyaheko flight search failed", details: errText }, { status: searchResponse.status });
        }

        const searchData = await searchResponse.json();
        console.log("Biyaheko search results count:", searchData?.Flights?.length || 0);

        // Transform response to app format
        const flights = (searchData.Flights || searchData.flights || []).map((flight, idx) => ({
            id: `biyaheko_${idx}`,
            biyaheko_key: flight.FlightKey || flight.flightKey || "",
            airline_name: flight.AirlineName || flight.airlineName || flight.Airline || "",
            airline_code: flight.AirlineCode || flight.airlineCode || "",
            flight_number: flight.FlightNumber || flight.flightNumber || "",
            origin: flight.Origin || flight.origin || origin,
            destination: flight.Destination || flight.destination || destination,
            departure_time: flight.DepartureTime || flight.departureTime || flight.DepartDate || departureDate,
            arrival_time: flight.ArrivalTime || flight.arrivalTime || "",
            duration_hours: parseFloat(flight.Duration || flight.duration || 0),
            is_direct: (flight.Stops === 0 || flight.stops === 0 || flight.IsNonStop === true),
            stops: parseInt(flight.Stops || flight.stops || 0),
            price: parseFloat(flight.TotalFare || flight.totalFare || flight.Fare || flight.fare || 0),
            currency: "PHP",
            cabin_classes: [{
                class: cabinClass.toLowerCase(),
                price: parseFloat(flight.TotalFare || flight.totalFare || flight.Fare || flight.fare || 0),
                seats_available: parseInt(flight.SeatsAvailable || flight.seatsAvailable || 9),
            }],
            baggage_allowance: flight.BaggageAllowance || flight.baggageAllowance || "7kg carry-on",
            fare_basis: flight.FareBasis || flight.fareBasis || "",
            fare_class: flight.Class || flight.class || cabinCode,
            is_refundable: flight.IsRefundable || flight.isRefundable || false,
            status: "active",
            source: "biyaheko",
        }));

        return Response.json({ flights, total: flights.length, source: "biyaheko" });

    } catch (error) {
        console.error("searchFlightsBiyaheko error:", error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});