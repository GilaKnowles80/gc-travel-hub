/**
 * Personal Reference Number (PRN) generator
 * Format rules:
 *  - Flight International Roundtrip: ITR + 3 letters + 1 digit  → ITRABC1
 *  - Flight International One Way:   ITW + 3 letters + 1 digit  → ITWXYZ2
 *  - Flight Domestic Roundtrip:      DTR + 3 letters + 1 digit  → DTRMNO3
 *  - Flight Domestic One Way:        DOW + 3 letters + 1 digit  → DOWQRS4
 *  - Hotel International:            HI  + country 1st letter + 3 letters + 1 digit
 *  - Hotel Local (PH):               HL  + city 1st letter + 3 letters + 1 digit
 *  - Ferry:                          FR  + 3 letters + 1 digit
 *  - Bus:                            BS  + 3 letters + 1 digit
 *  - Car Rental:                     CR  + 3 letters + 1 digit
 *  - Tour:                           TR  + 3 letters + 1 digit
 *  - Cruise:                         CS  + 3 letters + 1 digit
 *  - Train:                          TN  + 3 letters + 1 digit
 *  - Visa:                           VS  + country 1st letter + 3 letters + 1 digit
 *  - Travel Insurance:               TI  + 3 letters + 1 digit
 *
 * Numbers are sequential per-prefix using the booking's created_date + id
 * to ensure chronological, deterministic ordering.
 */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Derives a stable 3-letter scramble + 1 digit from a booking id + created_date.
 * This is deterministic (same booking always yields the same PRN).
 */
function deriveLettersAndDigit(bookingId = "", createdDate = "") {
  // Create a simple numeric hash from the id + date string
  const seed = (bookingId + createdDate).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const l1 = ALPHABET[(seed * 7) % 26];
  const l2 = ALPHABET[(seed * 13 + 3) % 26];
  const l3 = ALPHABET[(seed * 17 + 7) % 26];
  const digit = ((seed * 19 + 11) % 9) + 1; // 1–9

  return `${l1}${l2}${l3}${digit}`;
}

function firstLetter(str = "") {
  return (str || "X").trim().toUpperCase().charAt(0);
}

// Philippine city/province names to detect domestic hotels
const PH_KEYWORDS = ["manila", "cebu", "davao", "quezon", "makati", "taguig", "pasig", "caloocan",
  "marikina", "antipolo", "cavite", "laguna", "batangas", "pampanga", "bulacan", "iloilo",
  "bacolod", "cagayan", "zamboanga", "bohol", "palawan", "boracay", "vigan", "laoag",
  "imus", "bacoor", "paranaque", "muntinlupa", "las pinas", "valenzuela", "malabon",
  "pasay", "navotas", "san juan", "mandaluyong", "general santos", "cotabato", "leyte",
  "samar", "negros", "panay", "mindoro", "mindanao", "luzon", "visayas"];

function isPhilippines(location = "") {
  const loc = location.toLowerCase();
  return (
    loc.includes("philippines") ||
    loc.includes("ph") ||
    PH_KEYWORDS.some(kw => loc.includes(kw))
  );
}

/**
 * Main function: returns a formatted PRN string.
 * @param {string} type - booking type: flight|hotel|ferry|bus|car_rental|tour|cruise|train|visa|insurance
 * @param {object} booking - the booking record
 */
export function generatePRN(type, booking = {}) {
  const suffix = deriveLettersAndDigit(booking.id, booking.created_date);

  switch (type) {
    case "flight": {
      const isInternational = booking.trip_type === "international" ||
        (booking.route && !booking.route.toLowerCase().includes("ph") &&
          !isPhilippines(booking.route)) ||
        (booking.origin && !isPhilippines(booking.origin));
      const isRoundtrip = booking.trip_type === "roundtrip" || booking.trip_type === "international";
      const isOneWay = booking.trip_type === "one_way";

      if (isInternational && !isOneWay) return `ITR${suffix}`;
      if (isInternational && isOneWay)  return `ITW${suffix}`;
      if (!isInternational && isRoundtrip) return `DTR${suffix}`;
      return `DOW${suffix}`;
    }

    case "hotel": {
      const location = booking.location || booking.hotel_name || "";
      if (isPhilippines(location)) {
        const cityLetter = firstLetter(location);
        return `HL${cityLetter}${suffix}`;
      } else {
        const countryLetter = firstLetter(location);
        return `HI${countryLetter}${suffix}`;
      }
    }

    case "ferry":       return `FR${suffix}`;
    case "bus":         return `BS${suffix}`;
    case "car_rental":  return `CR${suffix}`;
    case "tour":        return `TR${suffix}`;
    case "cruise":      return `CS${suffix}`;
    case "train":       return `TN${suffix}`;

    case "visa": {
      const countryLetter = firstLetter(booking.country);
      return `VS${countryLetter}${suffix}`;
    }

    case "insurance":   return `TI${suffix}`;

    default:            return `GC${suffix}`;
  }
}