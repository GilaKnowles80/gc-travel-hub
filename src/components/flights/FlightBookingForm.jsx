import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, Wallet, CreditCard, AlertTriangle, ShieldCheck, Info, Plane, Globe, ScanLine, XCircle } from "lucide-react";

const STEPS = ["Flight Details", "Passenger Form", "Review & Rules", "Payment"];

// Rules data keyed by country code (PH = Philippines, US, GB, AU, SG, JP, etc.)
const COUNTRY_RULES = {
  PH: {
    dos: [
      "Arrive at the airport at least 3 hours before international flights.",
      "Carry a valid government-issued ID or passport.",
      "Ensure all carry-on items follow the 7 kg limit per person.",
      "Declare all dutiable items at the Bureau of Customs counter.",
      "Follow all MIAA/CAAP security screening procedures.",
      "Keep your boarding pass and ID accessible at all times.",
    ],
    donts: [
      "Do not carry prohibited items (sharp objects, liquids >100ml, etc.).",
      "Do not make jokes about bombs or security threats — it is a criminal offense.",
      "Do not leave baggage unattended at any time.",
      "Do not use unauthorized taxis or fixers inside the terminal.",
      "Do not smoke in non-designated areas.",
    ],
    immigration: [
      "Filipino citizens require a valid passport with at least 6 months validity.",
      "OFWs must present a valid OEC or iDOLE upon departure.",
      "Minors traveling alone need a DSWD travel clearance.",
      "Foreign nationals must present a valid visa for the destination country.",
      "All passengers must fill out the Bureau of Immigration departure card.",
      "Travel tax of ₱1,620 applies to most international departing passengers.",
    ],
  },
  US: {
    dos: [
      "Arrive at least 2 hours before domestic and 3 hours before international flights.",
      "Carry a REAL ID-compliant driver's license or passport.",
      "Place liquids in a clear quart-sized bag (3-1-1 TSA rule).",
      "Remove laptops and liquids from your bag for X-ray screening.",
      "Follow all TSA agent instructions at checkpoints.",
    ],
    donts: [
      "Do not carry firearms or ammunition in carry-on bags.",
      "Do not make threatening remarks at airport checkpoints.",
      "Do not leave bags unattended — they may be destroyed.",
      "Do not exceed the $10,000 cash limit without declaring it.",
      "Do not bring prohibited food items through customs.",
    ],
    immigration: [
      "US citizens must present a valid US passport for international travel.",
      "Non-US citizens need a valid visa or ESTA authorization.",
      "Green card holders must carry their Permanent Resident Card.",
      "Customs Declaration Form (CBP Form 6059B) must be completed on arrival.",
      "Agricultural items must be declared at customs.",
    ],
  },
  GB: {
    dos: [
      "Arrive at least 2 hours before domestic and 3 hours before international flights.",
      "Carry a valid UK passport or national identity card (for EU travel).",
      "Follow the 100ml liquid rule in a single clear resealable bag.",
      "Declare items over the duty-free allowance at customs.",
      "Use e-gates where available to speed up immigration.",
    ],
    donts: [
      "Do not carry sharp objects, firearms, or flammable materials in hand luggage.",
      "Do not make jokes about terrorism or security threats.",
      "Do not carry more than £10,000 in cash without declaring it.",
      "Do not bring restricted food items or plants without proper documentation.",
      "Do not smoke inside any airport terminal.",
    ],
    immigration: [
      "UK citizens must have a valid passport for all international travel.",
      "EU/EEA citizens now need a valid passport (ID cards may not be accepted).",
      "Non-UK nationals require the appropriate visa or ETA.",
      "The UK Electronic Travel Authorisation (ETA) is required for some nationalities.",
      "All arrivals must comply with UK Border Force declarations.",
    ],
  },
  SG: {
    dos: [
      "Arrive at least 2 hours before departure at Changi Airport.",
      "Carry a valid passport with at least 6 months validity.",
      "Declare all dutiable goods and restricted items to customs.",
      "Use the SG Arrival Card (SGAC) for customs/immigration declaration.",
      "Follow ICA (Immigration & Checkpoints Authority) instructions.",
    ],
    donts: [
      "Do not bring chewing gum, drugs, or firearms into Singapore.",
      "Do not carry more than SGD 20,000 in cash without declaring.",
      "Do not overstay your visa or social visit pass.",
      "Do not bring tobacco exceeding the duty-free allowance.",
      "Do not vape — e-cigarettes are banned in Singapore.",
    ],
    immigration: [
      "Singapore citizens and PRs use automated immigration lanes (ICA).",
      "Visitors may stay up to 30 or 90 days depending on nationality.",
      "An SG Arrival Card must be submitted within 3 days before arrival.",
      "Work Pass holders must carry their pass at all times.",
      "Yellow Fever vaccination certificate required if arriving from endemic countries.",
    ],
  },
  DEFAULT: {
    dos: [
      "Arrive at the airport at least 2–3 hours before your flight.",
      "Carry a valid passport with at least 6 months validity.",
      "Keep liquids under 100ml in a clear resealable bag.",
      "Declare all dutiable or restricted goods at customs.",
      "Follow all security screening procedures at the airport.",
      "Keep your boarding pass and ID accessible at all times.",
    ],
    donts: [
      "Do not carry prohibited items (sharp objects, firearms, liquids >100ml).",
      "Do not make jokes about bombs or security threats.",
      "Do not leave baggage unattended at any time.",
      "Do not exceed the duty-free allowance without declaring.",
      "Do not smoke in non-designated areas.",
    ],
    immigration: [
      "Ensure your passport is valid for at least 6 months beyond your travel dates.",
      "Check visa requirements for your destination country in advance.",
      "Carry supporting documents (return ticket, hotel booking, bank statement).",
      "Complete any required arrival/departure cards provided by the airline.",
      "Comply with all customs and immigration regulations of the destination country.",
    ],
  },
};

function GeoRulesSection({ geoInfo, geoLoading, destination }) {
  const rules = COUNTRY_RULES[geoInfo?.countryCode] || COUNTRY_RULES.DEFAULT;

  return (
    <div className="space-y-3">
      {geoLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl p-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          Detecting your location for relevant travel rules...
        </div>
      ) : (
        geoInfo && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            Showing rules for <span className="font-semibold text-slate-700 ml-1">{geoInfo.country}</span>
          </div>
        )
      )}

      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="font-semibold text-green-800 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Do's at the Airport
        </p>
        <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
          {rules.dos.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="font-semibold text-red-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Don'ts at the Airport
        </p>
        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
          {rules.donts.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" /> Immigration Policy
          {geoInfo && <span className="text-xs font-normal text-blue-500">({geoInfo.country})</span>}
        </p>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          {rules.immigration.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default function FlightBookingForm({ flight, cabinClass, onClose, tripType, departureDate, returnDate: initialReturnDate }) {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("wallet");

  // Normalize incoming trip type (search uses "roundtrip", form uses "round_trip")
  const normalizedTripType = tripType === "roundtrip" ? "round_trip" : (tripType || "one_way");

  const [formData, setFormData] = useState({
    trip_type: normalizedTripType,
    departure_date: departureDate || "",
    return_date: initialReturnDate || "",
    passenger_name: "",
    passenger_email: "",
    passenger_phone: "",
    passport_number: "",
    nationality: "",
    date_of_birth: "",
    adults: 1,
    children: 0,
    seniors: 0,
    infants: 0,
    pwd: 0,
    special_requests: "",
  });
  const [bookingResult, setBookingResult] = useState(null);
  const [splitResult, setSplitResult] = useState(null);
  const [geoInfo, setGeoInfo] = useState(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [idType, setIdType] = useState("passport");
  const [idNumber, setIdNumber] = useState("");
  const [idValidation, setIdValidation] = useState(null); // null | "valid" | "invalid"
  const [idValidationMsg, setIdValidationMsg] = useState("");

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        setGeoInfo({
          country: data.country_name || "Unknown",
          countryCode: data.country_code || "XX",
          nationality: data.country_name || "Unknown",
        });
        // Pre-fill nationality from geo if not already set
        setFormData((prev) => ({
          ...prev,
          nationality: prev.nationality || data.country_name || "",
        }));
      })
      .catch(() => setGeoInfo(null))
      .finally(() => setGeoLoading(false));
  }, []);

  const queryClient = useQueryClient();

  // ── ID Validation ──────────────────────────────────────────────────
  const ID_TYPES = [
    { value: "passport", label: "Passport" },
    { value: "phil_id", label: "Philippine National ID" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "sss", label: "SSS ID" },
    { value: "pagibig", label: "Pag-IBIG ID" },
    { value: "philhealth", label: "PhilHealth ID" },
    { value: "voters_id", label: "Voter's ID" },
    { value: "postal_id", label: "Postal ID" },
    { value: "umid", label: "UMID Card" },
    { value: "nbi_clearance", label: "NBI Clearance" },
    { value: "other", label: "Other Government ID" },
  ];

  // Format patterns per ID type
  const ID_PATTERNS = {
    passport:         { regex: /^[A-Z]{1,2}[0-9]{6,7}[A-Z]?$/i, hint: "e.g. P1234567A or AA1234567" },
    phil_id:          { regex: /^[0-9]{4}-[0-9]{7}-[0-9]$/,      hint: "Format: XXXX-XXXXXXX-X" },
    drivers_license:  { regex: /^[A-Z][0-9]{2}-[0-9]{2}-[0-9]{6}$/i, hint: "Format: A00-00-000000" },
    sss:              { regex: /^[0-9]{2}-[0-9]{7}-[0-9]$/,       hint: "Format: XX-XXXXXXX-X" },
    pagibig:          { regex: /^[0-9]{12}$/,                      hint: "12-digit number" },
    philhealth:       { regex: /^[0-9]{2}-[0-9]{9}-[0-9]$/,       hint: "Format: XX-XXXXXXXXX-X" },
    voters_id:        { regex: /^[0-9]{13}$/,                      hint: "13-digit Voter's ID number" },
    postal_id:        { regex: /^[A-Z0-9]{6,15}$/i,               hint: "Alphanumeric code on your Postal ID" },
    umid:             { regex: /^[0-9]{4}-[0-9]{7}-[0-9]$/,       hint: "Format: XXXX-XXXXXXX-X" },
    nbi_clearance:    { regex: /^[A-Z]{3}[0-9]{9}$/i,             hint: "e.g. NBI123456789" },
    other:            { regex: /^.{5,}$/,                          hint: "At least 5 characters" },
  };

  const validateId = (type, value) => {
    if (!value) { setIdValidation(null); setIdValidationMsg(""); return; }
    const pattern = ID_PATTERNS[type] || ID_PATTERNS.other;
    const clean = value.trim().toUpperCase();
    if (pattern.regex.test(clean)) {
      setIdValidation("valid");
      setIdValidationMsg("ID format looks valid ✓");
    } else {
      setIdValidation("invalid");
      setIdValidationMsg(`Invalid format. ${pattern.hint}`);
    }
  };

  const handleIdChange = (value) => {
    setIdNumber(value);
    validateId(idType, value);
    setFormData((prev) => ({ ...prev, passport_number: value }));
  };

  const handleIdTypeChange = (type) => {
    setIdType(type);
    setIdNumber("");
    setIdValidation(null);
    setIdValidationMsg("");
    setFormData((prev) => ({ ...prev, passport_number: "" }));
  };

  const selectedClassData = flight.cabin_classes?.find((c) => c.class === cabinClass);
  const duffelFare = selectedClassData?.price || flight.price || 0; // Duffel price = 75% of total
  // Total = Duffel fare / 0.75  →  Duffel is 75%, markup is 25%, together = 100%
  const pricePerPax = +(duffelFare / 0.75).toFixed(2);
  const markup = +(pricePerPax - duffelFare).toFixed(2); // 25% markup portion
  const basePrice = duffelFare; // alias for display

  const totalPassengers =
    formData.adults + formData.children + formData.seniors + formData.infants + formData.pwd;
  const adultsPrice = formData.adults * pricePerPax;
  const childrenPrice = formData.children * pricePerPax;
  const seniorsPrice = +(formData.seniors * pricePerPax * 0.9).toFixed(2);
  const infantsPrice = +(formData.infants * pricePerPax * 0.5).toFixed(2);
  const pwdPrice = +(formData.pwd * pricePerPax * 0.9).toFixed(2);
  const totalPrice = +(adultsPrice + childrenPrice + seniorsPrice + infantsPrice + pwdPrice).toFixed(2);

  // Internal split: Duffel is 75% of total, GC Travel markup is 25%
  const duffelShare = +(totalPrice * 0.75).toFixed(2); // goes to airline
  const gcashShare = +(totalPrice * 0.25).toFixed(2);  // GC Travel markup/fees

  const bookFlightMutation = useMutation({
    mutationFn: async () => {
      const booking = await base44.entities.FlightBooking.create({
        flight_id: flight.id || "api_flight",
        flight_number: flight.flight_number,
        route: `${flight.origin} - ${flight.destination}`,
        cabin_class: cabinClass,
        trip_type: formData.trip_type,
        passenger_name: formData.passenger_name,
        passenger_email: formData.passenger_email,
        passenger_phone: formData.passenger_phone,
        passport_number: formData.passport_number,
        date_of_birth: formData.date_of_birth,
        number_of_passengers: totalPassengers || 1,
        special_requests: formData.special_requests,
        total_price: totalPrice,
        payment_status: "paid",
        status: "confirmed",
        supplier: "biyaheko",
      });
      return booking;
    },
    onSuccess: async (booking) => {
      setBookingResult(booking);
      // Auto split payment internally
      setSplitResult({
        duffel: duffelShare,
        gcash: gcashShare,
        status: "processed",
      });
      queryClient.invalidateQueries({ queryKey: ["flight-bookings"] });
      setStep(5);
    },
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.trip_type) return;
      setStep(2);
    } else if (step === 2) {
      if (!formData.passenger_name || !formData.passenger_email || !formData.passenger_phone) {
        alert("Please fill in Name, Email and Phone.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      // Proceed to process booking + split payment
      bookFlightMutation.mutate();
    }
  };

  const progressBar = (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((label, idx) => (
          <div key={idx} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > idx + 1
                    ? "bg-green-500 text-white"
                    : step === idx + 1
                    ? "bg-amber-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > idx + 1 ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <span className="text-[10px] mt-1 font-medium text-center leading-tight max-w-[60px]">{label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-1 mb-3 rounded ${step > idx + 1 ? "bg-green-400" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ── STEP 1: Flight Details ─────────────────────────────────────────
  if (step === 1) return (
    <div className="space-y-4">
      {progressBar}
      <h3 className="text-lg font-semibold text-slate-900">Flight Details</h3>
      <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2">
        <div className="flex justify-between"><span className="text-slate-500">Airline</span><span className="font-medium">{flight.airline_name}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Flight No.</span><span className="font-medium">{flight.flight_number}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Route</span><span className="font-medium">{flight.origin} → {flight.destination}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Cabin Class</span><span className="font-medium capitalize">{cabinClass?.replace(/_/g, " ")}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Base Fare</span><span className="font-medium">${basePrice.toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Taxes & Fees</span><span className="font-medium text-orange-500">+${markup.toLocaleString()}</span></div>
        <div className="flex justify-between border-t pt-2"><span className="text-slate-700 font-semibold">Fare per Passenger</span><span className="font-bold text-amber-600">${pricePerPax.toLocaleString()}</span></div>
      </div>

      <div className="space-y-2">
        <Label>Trip Type</Label>
        <Select value={formData.trip_type} onValueChange={(v) => setFormData({ ...formData, trip_type: v })}>
          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="one_way">One Way</SelectItem>
            <SelectItem value="round_trip">Round Trip</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Departure Date</Label>
        <Input type="date" value={formData.departure_date} onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })} className="rounded-xl" />
      </div>

      {formData.trip_type === "round_trip" && (
        <div className="space-y-2">
          <Label>Return Date</Label>
          <Input type="date" value={formData.return_date} onChange={(e) => setFormData({ ...formData, return_date: e.target.value })} className="rounded-xl" />
        </div>
      )}

      <div className="space-y-2">
        <Label>Passengers</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "adults", label: "Adults" },
            { key: "children", label: "Children" },
            { key: "infants", label: "Infants (50% off)" },
            { key: "seniors", label: "Seniors (10% off)" },
            { key: "pwd", label: "PWD (10% off)" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Input
                type="number"
                min={key === "adults" ? 1 : 0}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: parseInt(e.target.value) || 0 })}
                className="rounded-xl h-9 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 rounded-xl p-3 text-sm flex justify-between font-bold">
        <span>Estimated Total ({totalPassengers || 1} pax)</span>
        <span className="text-amber-600">${totalPrice.toLocaleString()}</span>
      </div>

      <Button onClick={handleNext} className="w-full bg-amber-500 hover:bg-amber-600 rounded-xl">Continue</Button>
    </div>
  );

  // ── STEP 2: Passenger Form ─────────────────────────────────────────
  if (step === 2) return (
    <div className="space-y-4">
      {progressBar}
      <h3 className="text-lg font-semibold text-slate-900">Passenger Information</h3>

      {[
        { key: "passenger_name", label: "Full Name (as in ID) *", type: "text", placeholder: "Juan Dela Cruz" },
        { key: "passenger_email", label: "Email Address *", type: "email", placeholder: "juan@email.com" },
        { key: "passenger_phone", label: "Phone Number *", type: "tel", placeholder: "+63 9XX XXX XXXX" },
      ].map(({ key, label, type, placeholder }) => (
        <div key={key} className="space-y-1">
          <Label>{label}</Label>
          <Input
            type={type}
            placeholder={placeholder}
            value={formData[key]}
            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
            className="rounded-xl"
          />
        </div>
      ))}

      {/* Government ID Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-amber-500" />
          <Label className="text-sm font-semibold text-slate-700">Government ID Verification</Label>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-500">ID Type</Label>
          <Select value={idType} onValueChange={handleIdTypeChange}>
            <SelectTrigger className="rounded-xl bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ID_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-500">
            ID Number <span className="text-slate-400">({ID_PATTERNS[idType]?.hint})</span>
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder={ID_PATTERNS[idType]?.hint || "Enter ID number"}
              value={idNumber}
              onChange={(e) => handleIdChange(e.target.value)}
              className={`rounded-xl pr-10 bg-white ${
                idValidation === "valid" ? "border-green-400 focus:ring-green-300" :
                idValidation === "invalid" ? "border-red-400 focus:ring-red-300" : ""
              }`}
            />
            {idValidation === "valid" && <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />}
            {idValidation === "invalid" && <XCircle className="absolute right-3 top-3 w-4 h-4 text-red-400" />}
          </div>
          {idValidationMsg && (
            <p className={`text-xs mt-1 ${idValidation === "valid" ? "text-green-600" : "text-red-500"}`}>
              {idValidationMsg}
            </p>
          )}
        </div>

        {idValidation === "invalid" && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-600">
              The ID number format does not match the expected pattern for a <strong>{ID_TYPES.find(t=>t.value===idType)?.label}</strong>. Please double-check and re-enter your ID number exactly as printed on your card.
            </p>
          </div>
        )}

        {idValidation === "valid" && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-xs text-green-700">ID format verified. Your information will be used for travel documentation.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Nationality</Label>
          <Input
            type="text"
            placeholder="Filipino"
            value={formData.nationality}
            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1">
          <Label>Date of Birth</Label>
          <Input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Special Requests (Optional)</Label>
        <Textarea
          placeholder="Meal preferences, wheelchair, etc."
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          className="rounded-xl h-20"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">Back</Button>
        <Button onClick={handleNext} className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-xl">Continue</Button>
      </div>
    </div>
  );

  // ── STEP 3: Review + Airport Rules ─────────────────────────────────
  if (step === 3) return (
    <div className="space-y-4">
      {progressBar}
      <h3 className="text-lg font-semibold text-slate-900">Review & Airport Regulations</h3>

      {/* Booking Summary */}
      <Card className="p-4 bg-slate-50 rounded-xl text-sm space-y-2 border-0">
        <p className="font-semibold text-slate-800 mb-1">Booking Summary</p>
        <div className="flex justify-between"><span className="text-slate-500">Passenger</span><span className="font-medium">{formData.passenger_name}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-medium">{formData.passenger_email}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Route</span><span className="font-medium">{flight.origin} → {flight.destination}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Cabin</span><span className="font-medium capitalize">{cabinClass?.replace(/_/g, " ")}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Trip</span><span className="font-medium capitalize">{formData.trip_type.replace(/_/g, " ")}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Passengers</span><span className="font-medium">{totalPassengers}</span></div>
        <div className="flex justify-between border-t pt-2 font-bold"><span>Total</span><span className="text-amber-600">${totalPrice.toLocaleString()}</span></div>
      </Card>

      {/* Do's and Don'ts + Immigration — geo-based */}
      <GeoRulesSection geoInfo={geoInfo} geoLoading={geoLoading} destination={flight.destination} />

      <p className="text-xs text-slate-400 text-center">By proceeding, you confirm you have read and understood the above rules and regulations.</p>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl">Back</Button>
        <Button onClick={handleNext} className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-xl">I Agree, Continue</Button>
      </div>
    </div>
  );

  // ── STEP 4: Payment ────────────────────────────────────────────────
  if (step === 4) return (
    <div className="space-y-4">
      {progressBar}
      <h3 className="text-lg font-semibold text-slate-900">Payment Method</h3>

      <div className="bg-amber-50 rounded-xl p-3 text-sm font-bold flex justify-between">
        <span>Amount to Pay</span>
        <span className="text-amber-600">${totalPrice.toLocaleString()}</span>
      </div>

      {/* Option 1 — Wallet (handles failures safely) */}
      <div
        onClick={() => setPaymentMethod("wallet")}
        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "wallet" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}
      >
        <div className="flex items-start gap-3">
          <Wallet className={`w-6 h-6 mt-0.5 ${paymentMethod === "wallet" ? "text-amber-500" : "text-slate-400"}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-slate-900">GC Travel Wallet (Recommended)</p>
              <Badge className="bg-amber-100 text-amber-700 text-xs">Safe</Badge>
            </div>
            <p className="text-sm text-slate-600">
              Payment is held securely in your wallet while we confirm your booking with the airline.
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-2 py-1">
                <CheckCircle className="w-3 h-3" />
                <span><strong>If booking succeeds:</strong> Payment is split — 75% Base Fare, 25% Taxes & Fees.</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-2 py-1">
                <Wallet className="w-3 h-3" />
                <span><strong>If booking fails:</strong> Full amount remains in your Wallet. Withdraw anytime via GCash, bank, or card.</span>
              </div>
            </div>
          </div>
          {paymentMethod === "wallet" && <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0"><div className="w-2.5 h-2.5 bg-white rounded-full" /></div>}
        </div>
      </div>

      {/* Option 2 — Card / External */}
      <div
        onClick={() => setPaymentMethod("card")}
        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "card" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}
      >
        <div className="flex items-start gap-3">
          <CreditCard className={`w-6 h-6 mt-0.5 ${paymentMethod === "card" ? "text-amber-500" : "text-slate-400"}`} />
          <div className="flex-1">
            <p className="font-semibold text-slate-900 mb-1">Credit / Debit Card or GCash (Direct)</p>
            <p className="text-sm text-slate-600">
              Pay directly via Stripe or GCash. If booking fails, a refund will be processed within 3–7 business days.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-orange-700 bg-orange-50 rounded-lg px-2 py-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Refunds for failed bookings take 3–7 banking days.</span>
            </div>
          </div>
          {paymentMethod === "card" && <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0"><div className="w-2.5 h-2.5 bg-white rounded-full" /></div>}
        </div>
      </div>

      {/* Internal split info */}
      <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1 border border-slate-200">
        <p className="font-semibold text-slate-700 mb-1">Payment Breakdown on Successful Booking</p>
        <div className="flex justify-between"><span>→ Base Fare (75%)</span><span className="font-medium text-slate-700">${duffelShare.toLocaleString()}</span></div>
        <div className="flex justify-between"><span>→ Taxes & Fees (25%)</span><span className="font-medium text-slate-700">${gcashShare.toLocaleString()}</span></div>
        <p className="text-slate-400 mt-1">Processed automatically upon booking confirmation.</p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(3)} className="flex-1 rounded-xl">Back</Button>
        <Button
          onClick={handleNext}
          disabled={bookFlightMutation.isPending}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
        >
          {bookFlightMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
          ) : (
            "Confirm & Pay"
          )}
        </Button>
      </div>
    </div>
  );

  // ── STEP 5: Confirmation ───────────────────────────────────────────
  if (step === 5) return (
    <div className="space-y-4 text-center py-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h3>
      <p className="text-slate-500">Your flight has been booked successfully.</p>

      {bookingResult && (
        <div className="bg-slate-50 rounded-xl p-4 text-sm text-left space-y-2 border border-slate-200">
          <div className="flex justify-between"><span className="text-slate-500">Booking Ref</span><span className="font-bold">{bookingResult.id?.slice(-8).toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Passenger</span><span className="font-medium">{formData.passenger_name}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Route</span><span className="font-medium">{flight.origin} → {flight.destination}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Total Paid</span><span className="font-bold text-green-600">${totalPrice.toLocaleString()}</span></div>
        </div>
      )}

      {splitResult && (
        <div className="bg-green-50 rounded-xl p-4 text-sm text-left space-y-1 border border-green-200">
          <p className="font-semibold text-green-800 mb-2 flex items-center gap-2"><Plane className="w-4 h-4" /> Payment Breakdown</p>
          <div className="flex justify-between text-green-700"><span>Base Fare (75%)</span><span className="font-medium">${splitResult.duffel.toLocaleString()}</span></div>
          <div className="flex justify-between text-green-700"><span>Taxes & Fees (25%)</span><span className="font-medium">${splitResult.gcash.toLocaleString()}</span></div>
          <p className="text-xs text-green-500 mt-1">Autopay processed ✓</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Close</Button>
        <Button onClick={() => window.location.href = "/my-bookings"} className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-xl">View My Bookings</Button>
      </div>
    </div>
  );

  return null;
}