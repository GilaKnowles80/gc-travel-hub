/**
 * GC Travel & Tours — Personal Reference Number (PRN) Generator
 *
 * ── FORMAT RULES ────────────────────────────────────────────────────────────
 *
 * FLIGHTS  (prefix + 3 scrambled letters + 1 digit, sequential)
 *   International Roundtrip : ITR + AAA–ZZZ + 1–9  → ITRAAA1, ITRAAA2...ITRZZZ9...
 *   International One-Way   : IOW + AAA–ZZZ + 1–9  → IOWAAA1 ...
 *   Domestic Roundtrip      : DTR + AAA–ZZZ + 1–9  → DTRAAA1 ...
 *   Domestic One-Way        : DOW + AAA–ZZZ + 1–9  → DOWAAA1 ...
 *
 * HOTELS
 *   International  : HI  + 1st letter of country + seq#  → HIT1, HIJ2 ...
 *   Local (PH)     : HL  + 1st letter of city    + seq#  → HLM1, HLC2 ...
 *
 * BUS
 *   International  : BSI + 1st letter of destination + seq#
 *   Local          : BSL + 1st letter of destination + seq#
 *
 * FERRY
 *   International  : FRI + 1st letter of destination + seq#
 *   Local          : FRL + 1st letter of destination + seq#
 *
 * CRUISE
 *   International  : CRI + 1st letter of destination + seq#
 *   Local          : CRL + 1st letter of destination + seq#
 *
 * TOURS
 *   International  : TRI + 1st letter of destination + seq#
 *   Local          : TRL + 1st letter of destination + seq#
 *
 * VISA PROCESSING : VIS + 1st letter of country + seq#  → VIST1, VISJ2 ...
 *
 * CAR RENTAL
 *   International  : CAI + 1st letter of destination + seq#
 *   Local          : CAL + 1st letter of destination + seq#
 *
 * TRAVEL INSURANCE: TIN + 1st letter of destination + seq#  → TINT1 ...
 *
 * ── SEQUENCE ────────────────────────────────────────────────────────────────
 * Flight sequence: letters cycle AAA→ZZZ (26³ = 17,576 combos × 9 digits = 158,184 unique IDs before overflow)
 * Location sequence: just increments numerically (HIT1, HIT2, HIT3 ...)
 * ────────────────────────────────────────────────────────────────────────────
 */

// ── Prefix map ───────────────────────────────────────────────────────────────
export const PRN_PREFIXES = {
  flight_international_roundtrip: "ITR",
  flight_international_oneway:    "IOW",
  flight_domestic_roundtrip:      "DTR",
  flight_domestic_oneway:         "DOW",
  hotel_international:            "HI",
  hotel_local:                    "HL",
  bus_international:              "BSI",
  bus_local:                      "BSL",
  ferry_international:            "FRI",
  ferry_local:                    "FRL",
  cruise_international:           "CRI",
  cruise_local:                   "CRL",
  tour_international:             "TRI",
  tour_local:                     "TRL",
  visa:                           "VIS",
  car_international:              "CAI",
  car_local:                      "CAL",
  insurance:                      "TIN",
};

// ── Letter-sequence helpers ──────────────────────────────────────────────────

/** Convert 0-based index → 3-letter string. 0→"AAA", 1→"AAB", 25→"AAZ", 26→"ABA" ... */
function indexToLetters(n) {
  const a = String.fromCharCode(65 + (n % 26));               // 3rd letter (fastest)
  n = Math.floor(n / 26);
  const b = String.fromCharCode(65 + (n % 26));               // 2nd letter
  n = Math.floor(n / 26);
  const c = String.fromCharCode(65 + (n % 26));               // 1st letter
  return c + b + a;
}

// ── Flight PRN ───────────────────────────────────────────────────────────────

/**
 * Generate a flight PRN.
 * sequenceNumber is 1-based (first booking = 1 → ITRAAA1)
 */
export function generateFlightPRN(type, sequenceNumber) {
  const prefix = PRN_PREFIXES[type];
  if (!prefix) throw new Error(`Unknown flight PRN type: ${type}`);
  const pos         = sequenceNumber - 1;           // 0-based
  const letterIndex = Math.floor(pos / 9);          // letters advance every 9 bookings
  const digit       = (pos % 9) + 1;                // 1–9
  return `${prefix}${indexToLetters(letterIndex)}${digit}`;
}

// ── Location PRN (hotel, bus, ferry, cruise, tour, visa, car, insurance) ─────

/**
 * Generate a location-based PRN.
 * locationKey = first letter of country/city/destination
 * sequenceNumber = how many of this exact prefix+letter already exist + 1
 */
export function generateLocationPRN(type, locationKey, sequenceNumber) {
  const prefix = PRN_PREFIXES[type];
  if (!prefix) throw new Error(`Unknown PRN type: ${type}`);
  const letter = (locationKey || "X").toUpperCase().charAt(0);
  return `${prefix}${letter}${sequenceNumber}`;
}

// ── Type resolver ────────────────────────────────────────────────────────────

/**
 * Resolve the PRN type key from booking metadata.
 * @param {string}  bookingCategory  "flight"|"hotel"|"bus"|"ferry"|"cruise"|"tour"|"visa"|"car"|"insurance"
 * @param {string}  tripType         "roundtrip"|"one_way"
 * @param {boolean} isInternational
 */
export function getPRNType(bookingCategory, tripType, isInternational) {
  const intl = !!isInternational;
  const rt   = tripType === "roundtrip";

  switch (bookingCategory) {
    case "flight":
      if (intl && rt)   return "flight_international_roundtrip";
      if (intl && !rt)  return "flight_international_oneway";
      if (!intl && rt)  return "flight_domestic_roundtrip";
      return "flight_domestic_oneway";
    case "hotel":
      return intl ? "hotel_international" : "hotel_local";
    case "bus":
      return intl ? "bus_international" : "bus_local";
    case "ferry":
      return intl ? "ferry_international" : "ferry_local";
    case "cruise":
      return intl ? "cruise_international" : "cruise_local";
    case "tour":
      return intl ? "tour_international" : "tour_local";
    case "visa":
      return "visa";
    case "car":
    case "car_rental":
      return intl ? "car_international" : "car_local";
    case "insurance":
    case "travel_insurance":
      return "insurance";
    default:
      throw new Error(`Unknown booking category: ${bookingCategory}`);
  }
}

/** Get first letter of a location string safely */
export function getLocationKey(locationString) {
  if (!locationString) return "X";
  return locationString.trim().toUpperCase().charAt(0);
}

// ── Main async generator (queries DB for sequential count) ───────────────────

const ENTITY_MAP = {
  flight:           "FlightBooking",
  hotel:            "HotelBooking",
  bus:              "BusBooking",
  ferry:            "FerryBooking",
  cruise:           "CruiseBooking",
  tour:             "TourBooking",
  visa:             "Visa",
  car:              "CarRentalBooking",
  car_rental:       "CarRentalBooking",
  insurance:        "TravelInsurance",
  travel_insurance: "TravelInsurance",
};

/**
 * Generate the next PRN for a booking by querying existing records.
 *
 * @param {object}  base44           - base44 SDK instance
 * @param {string}  bookingCategory  - "flight"|"hotel"|"bus"|"ferry"|"cruise"|"tour"|"visa"|"car"|"insurance"
 * @param {string}  tripType         - "roundtrip"|"one_way"
 * @param {boolean} isInternational  - true for international
 * @param {string}  locationName     - country/city/destination name (used for first-letter key)
 * @returns {Promise<string>}        - e.g. "ITRAAA1", "HIT3", "DOWAAB5"
 */
export async function generatePRN(base44, bookingCategory, tripType, isInternational, locationName) {
  const type       = getPRNType(bookingCategory, tripType, isInternational);
  const prefix     = PRN_PREFIXES[type];
  const entityName = ENTITY_MAP[bookingCategory];
  const isFlight   = bookingCategory === "flight";

  let existingRecords = [];
  try {
    if (entityName) {
      existingRecords = await base44.entities[entityName].list();
    }
  } catch (_) {
    existingRecords = [];
  }

  if (isFlight) {
    const count = existingRecords.filter(b =>
      b.supplier_reference && b.supplier_reference.startsWith(prefix)
    ).length;
    return generateFlightPRN(type, count + 1);
  } else {
    const letter      = getLocationKey(locationName);
    const fullPrefix  = `${prefix}${letter}`;
    const count = existingRecords.filter(b =>
      b.supplier_reference && b.supplier_reference.startsWith(fullPrefix)
    ).length;
    return generateLocationPRN(type, letter, count + 1);
  }
}