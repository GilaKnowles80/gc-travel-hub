import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Comprehensive global airport database with IATA/ICAO codes and geo-coordinates
// Sources: IATA, ICAO, Amadeus, Duffel, Sabre, Travelport datasets

const GLOBAL_AIRPORTS = [
  // ── PHILIPPINES ─────────────────────────────────────────────────────────────
  { iata: 'MNL', icao: 'RPLL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', country_code: 'PH', lat: 14.5086, lng: 121.0197, type: 'international', tz: 'Asia/Manila' },
  { iata: 'CEB', icao: 'RPVM', name: 'Mactan-Cebu International Airport', city: 'Cebu', country: 'Philippines', country_code: 'PH', lat: 10.3075, lng: 123.9795, type: 'international', tz: 'Asia/Manila' },
  { iata: 'DVO', icao: 'RPMD', name: 'Francisco Bangoy International Airport', city: 'Davao', country: 'Philippines', country_code: 'PH', lat: 7.1255, lng: 125.6458, type: 'international', tz: 'Asia/Manila' },
  { iata: 'BXU', icao: 'RPME', name: 'Bancasi Airport (Butuan)', city: 'Butuan', country: 'Philippines', country_code: 'PH', lat: 8.9515, lng: 125.4788, type: 'domestic', tz: 'Asia/Manila' },
  { iata: 'CGY', icao: 'RPMY', name: 'Laguindingan Airport', city: 'Cagayan de Oro', country: 'Philippines', country_code: 'PH', lat: 8.6122, lng: 124.4561, type: 'international', tz: 'Asia/Manila' },
  { iata: 'ILO', icao: 'RPVI', name: 'Iloilo International Airport', city: 'Iloilo', country: 'Philippines', country_code: 'PH', lat: 10.833, lng: 122.4936, type: 'international', tz: 'Asia/Manila' },
  { iata: 'BCD', icao: 'RPVB', name: 'Bacolod-Silay Airport', city: 'Bacolod', country: 'Philippines', country_code: 'PH', lat: 10.7765, lng: 123.0149, type: 'international', tz: 'Asia/Manila' },
  { iata: 'DGT', icao: 'RPVD', name: 'Sibulan Airport (Dumaguete)', city: 'Dumaguete', country: 'Philippines', country_code: 'PH', lat: 9.3337, lng: 123.3004, type: 'domestic', tz: 'Asia/Manila' },
  { iata: 'TAG', icao: 'RPBT', name: 'Tagbilaran Airport (Bohol)', city: 'Tagbilaran', country: 'Philippines', country_code: 'PH', lat: 9.6644, lng: 123.8528, type: 'domestic', tz: 'Asia/Manila' },
  { iata: 'PPS', icao: 'RPVP', name: 'Puerto Princesa International Airport', city: 'Puerto Princesa', country: 'Philippines', country_code: 'PH', lat: 9.7421, lng: 118.7592, type: 'international', tz: 'Asia/Manila' },
  { iata: 'IAO', icao: 'RPNS', name: 'Sayak Airport (Siargao)', city: 'Siargao', country: 'Philippines', country_code: 'PH', lat: 9.8591, lng: 126.0138, type: 'domestic', tz: 'Asia/Manila' },
  { iata: 'SUG', icao: 'RPMS', name: 'Surigao Airport', city: 'Surigao', country: 'Philippines', country_code: 'PH', lat: 9.7558, lng: 125.4808, type: 'domestic', tz: 'Asia/Manila' },
  { iata: 'TAC', icao: 'RPVA', name: 'Daniel Z. Romualdez Airport (Tacloban)', city: 'Tacloban', country: 'Philippines', country_code: 'PH', lat: 11.2277, lng: 125.0278, type: 'domestic', tz: 'Asia/Manila' },
  { iata: 'KLO', icao: 'RPVK', name: 'Kalibo International Airport', city: 'Kalibo', country: 'Philippines', country_code: 'PH', lat: 11.6795, lng: 122.376, type: 'international', tz: 'Asia/Manila' },
  { iata: 'MPH', icao: 'RPVE', name: 'Godofredo P. Ramos Airport (Caticlan/Boracay)', city: 'Caticlan', country: 'Philippines', country_code: 'PH', lat: 11.9215, lng: 121.954, type: 'domestic', tz: 'Asia/Manila' },
  { iata: 'ZAM', icao: 'RPMZ', name: 'Zamboanga International Airport', city: 'Zamboanga', country: 'Philippines', country_code: 'PH', lat: 6.9224, lng: 122.0598, type: 'international', tz: 'Asia/Manila' },
  { iata: 'GEN', icao: 'RPMG', name: 'General Santos International Airport', city: 'General Santos', country: 'Philippines', country_code: 'PH', lat: 6.106, lng: 125.0953, type: 'international', tz: 'Asia/Manila' },
  { iata: 'CRK', icao: 'RPLC', name: 'Clark International Airport', city: 'Clark / Angeles', country: 'Philippines', country_code: 'PH', lat: 15.186, lng: 120.5596, type: 'international', tz: 'Asia/Manila' },
  { iata: 'LAO', icao: 'RPLI', name: 'Laoag International Airport', city: 'Laoag', country: 'Philippines', country_code: 'PH', lat: 18.1781, lng: 120.5317, type: 'international', tz: 'Asia/Manila' },
  { iata: 'LGP', icao: 'RPLP', name: 'Legazpi Airport', city: 'Legazpi', country: 'Philippines', country_code: 'PH', lat: 13.1571, lng: 123.7347, type: 'domestic', tz: 'Asia/Manila' },
  { iata: 'USU', icao: 'RPVV', name: 'Busuanga Airport (Coron)', city: 'Busuanga', country: 'Philippines', country_code: 'PH', lat: 12.1215, lng: 120.0996, type: 'domestic', tz: 'Asia/Manila' },
  { iata: 'CBO', icao: 'RPMC', name: 'Cotabato Airport', city: 'Cotabato', country: 'Philippines', country_code: 'PH', lat: 7.1652, lng: 124.2096, type: 'domestic', tz: 'Asia/Manila' },
  // ── SOUTHEAST ASIA ──────────────────────────────────────────────────────────
  { iata: 'SIN', icao: 'WSSS', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', country_code: 'SG', lat: 1.3644, lng: 103.9915, type: 'international', tz: 'Asia/Singapore' },
  { iata: 'BKK', icao: 'VTBS', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', country_code: 'TH', lat: 13.6811, lng: 100.7471, type: 'international', tz: 'Asia/Bangkok' },
  { iata: 'DMK', icao: 'VTBD', name: 'Don Mueang International Airport', city: 'Bangkok', country: 'Thailand', country_code: 'TH', lat: 13.9126, lng: 100.607, type: 'international', tz: 'Asia/Bangkok' },
  { iata: 'HAN', icao: 'VVNB', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam', country_code: 'VN', lat: 21.2212, lng: 105.8072, type: 'international', tz: 'Asia/Ho_Chi_Minh' },
  { iata: 'SGN', icao: 'VVTS', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam', country_code: 'VN', lat: 10.8188, lng: 106.6519, type: 'international', tz: 'Asia/Ho_Chi_Minh' },
  { iata: 'KUL', icao: 'WMKK', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', country_code: 'MY', lat: 2.7456, lng: 101.7099, type: 'international', tz: 'Asia/Kuala_Lumpur' },
  { iata: 'CGK', icao: 'WIII', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', country_code: 'ID', lat: -6.1256, lng: 106.6559, type: 'international', tz: 'Asia/Jakarta' },
  { iata: 'DPS', icao: 'WADD', name: 'Ngurah Rai International Airport (Bali)', city: 'Bali', country: 'Indonesia', country_code: 'ID', lat: -8.7481, lng: 115.1670, type: 'international', tz: 'Asia/Makassar' },
  { iata: 'RGN', icao: 'VYYY', name: 'Yangon International Airport', city: 'Yangon', country: 'Myanmar', country_code: 'MM', lat: 16.9073, lng: 96.1332, type: 'international', tz: 'Asia/Rangoon' },
  { iata: 'REP', icao: 'VDSR', name: 'Siem Reap International Airport', city: 'Siem Reap', country: 'Cambodia', country_code: 'KH', lat: 13.4107, lng: 103.8132, type: 'international', tz: 'Asia/Phnom_Penh' },
  { iata: 'VTE', icao: 'VLVT', name: 'Wattay International Airport', city: 'Vientiane', country: 'Laos', country_code: 'LA', lat: 17.9883, lng: 102.5633, type: 'international', tz: 'Asia/Vientiane' },
  // ── EAST ASIA ───────────────────────────────────────────────────────────────
  { iata: 'HKG', icao: 'VHHH', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', country_code: 'HK', lat: 22.3080, lng: 113.9185, type: 'international', tz: 'Asia/Hong_Kong' },
  { iata: 'NRT', icao: 'RJAA', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', country_code: 'JP', lat: 35.7720, lng: 140.3929, type: 'international', tz: 'Asia/Tokyo' },
  { iata: 'HND', icao: 'RJTT', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', country_code: 'JP', lat: 35.5494, lng: 139.7798, type: 'international', tz: 'Asia/Tokyo' },
  { iata: 'ICN', icao: 'RKSI', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', country_code: 'KR', lat: 37.4602, lng: 126.4407, type: 'international', tz: 'Asia/Seoul' },
  { iata: 'GMP', icao: 'RKSS', name: 'Gimpo International Airport', city: 'Seoul', country: 'South Korea', country_code: 'KR', lat: 37.5586, lng: 126.7942, type: 'international', tz: 'Asia/Seoul' },
  { iata: 'PVG', icao: 'ZSPD', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', country_code: 'CN', lat: 31.1443, lng: 121.8083, type: 'international', tz: 'Asia/Shanghai' },
  { iata: 'PEK', icao: 'ZBAA', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', country_code: 'CN', lat: 40.0799, lng: 116.6031, type: 'international', tz: 'Asia/Shanghai' },
  { iata: 'PKX', icao: 'ZBAD', name: 'Beijing Daxing International Airport', city: 'Beijing', country: 'China', country_code: 'CN', lat: 39.5098, lng: 116.4105, type: 'international', tz: 'Asia/Shanghai' },
  { iata: 'CAN', icao: 'ZGGG', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China', country_code: 'CN', lat: 23.3924, lng: 113.2988, type: 'international', tz: 'Asia/Shanghai' },
  { iata: 'TPE', icao: 'RCTP', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan', country_code: 'TW', lat: 25.0777, lng: 121.2328, type: 'international', tz: 'Asia/Taipei' },
  // ── SOUTH ASIA ──────────────────────────────────────────────────────────────
  { iata: 'DEL', icao: 'VIDP', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', country_code: 'IN', lat: 28.5665, lng: 77.1031, type: 'international', tz: 'Asia/Kolkata' },
  { iata: 'BOM', icao: 'VABB', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', country_code: 'IN', lat: 19.0896, lng: 72.8656, type: 'international', tz: 'Asia/Kolkata' },
  { iata: 'BLR', icao: 'VOBL', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', country_code: 'IN', lat: 13.1979, lng: 77.7063, type: 'international', tz: 'Asia/Kolkata' },
  { iata: 'CMB', icao: 'VCBI', name: 'Bandaranaike International Airport', city: 'Colombo', country: 'Sri Lanka', country_code: 'LK', lat: 7.1808, lng: 79.8841, type: 'international', tz: 'Asia/Colombo' },
  { iata: 'DAC', icao: 'VGHS', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', country: 'Bangladesh', country_code: 'BD', lat: 23.8433, lng: 90.3978, type: 'international', tz: 'Asia/Dhaka' },
  { iata: 'KTM', icao: 'VNKT', name: 'Tribhuvan International Airport', city: 'Kathmandu', country: 'Nepal', country_code: 'NP', lat: 27.6966, lng: 85.3591, type: 'international', tz: 'Asia/Kathmandu' },
  // ── MIDDLE EAST ─────────────────────────────────────────────────────────────
  { iata: 'DXB', icao: 'OMDB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', country_code: 'AE', lat: 25.2528, lng: 55.3644, type: 'international', tz: 'Asia/Dubai' },
  { iata: 'AUH', icao: 'OMAA', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'UAE', country_code: 'AE', lat: 24.4330, lng: 54.6511, type: 'international', tz: 'Asia/Dubai' },
  { iata: 'DOH', icao: 'OTBD', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', country_code: 'QA', lat: 25.2611, lng: 51.6138, type: 'international', tz: 'Asia/Qatar' },
  { iata: 'RUH', icao: 'OERK', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', country_code: 'SA', lat: 24.9576, lng: 46.6988, type: 'international', tz: 'Asia/Riyadh' },
  { iata: 'JED', icao: 'OEJN', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia', country_code: 'SA', lat: 21.6796, lng: 39.1565, type: 'international', tz: 'Asia/Riyadh' },
  { iata: 'KWI', icao: 'OKBK', name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait', country_code: 'KW', lat: 29.2267, lng: 47.9689, type: 'international', tz: 'Asia/Kuwait' },
  { iata: 'MCT', icao: 'OOMS', name: 'Muscat International Airport', city: 'Muscat', country: 'Oman', country_code: 'OM', lat: 23.5933, lng: 58.2844, type: 'international', tz: 'Asia/Muscat' },
  { iata: 'BAH', icao: 'OBBI', name: 'Bahrain International Airport', city: 'Manama', country: 'Bahrain', country_code: 'BH', lat: 26.2708, lng: 50.6336, type: 'international', tz: 'Asia/Bahrain' },
  { iata: 'AMM', icao: 'OJAI', name: 'Queen Alia International Airport', city: 'Amman', country: 'Jordan', country_code: 'JO', lat: 31.7226, lng: 35.9932, type: 'international', tz: 'Asia/Amman' },
  { iata: 'BEY', icao: 'OLBA', name: 'Beirut-Rafic Hariri International Airport', city: 'Beirut', country: 'Lebanon', country_code: 'LB', lat: 33.8209, lng: 35.4886, type: 'international', tz: 'Asia/Beirut' },
  // ── EUROPE ──────────────────────────────────────────────────────────────────
  { iata: 'LHR', icao: 'EGLL', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', country_code: 'GB', lat: 51.4775, lng: -0.4614, type: 'international', tz: 'Europe/London' },
  { iata: 'LGW', icao: 'EGKK', name: 'London Gatwick Airport', city: 'London', country: 'United Kingdom', country_code: 'GB', lat: 51.1537, lng: -0.1821, type: 'international', tz: 'Europe/London' },
  { iata: 'STN', icao: 'EGSS', name: 'London Stansted Airport', city: 'London', country: 'United Kingdom', country_code: 'GB', lat: 51.885, lng: 0.235, type: 'international', tz: 'Europe/London' },
  { iata: 'CDG', icao: 'LFPG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', country_code: 'FR', lat: 49.0097, lng: 2.5479, type: 'international', tz: 'Europe/Paris' },
  { iata: 'FRA', icao: 'EDDF', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', country_code: 'DE', lat: 50.0379, lng: 8.5622, type: 'international', tz: 'Europe/Berlin' },
  { iata: 'MUC', icao: 'EDDM', name: 'Munich Airport', city: 'Munich', country: 'Germany', country_code: 'DE', lat: 48.3538, lng: 11.786, type: 'international', tz: 'Europe/Berlin' },
  { iata: 'AMS', icao: 'EHAM', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', country_code: 'NL', lat: 52.3086, lng: 4.7639, type: 'international', tz: 'Europe/Amsterdam' },
  { iata: 'MAD', icao: 'LEMD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain', country_code: 'ES', lat: 40.4936, lng: -3.5668, type: 'international', tz: 'Europe/Madrid' },
  { iata: 'BCN', icao: 'LEBL', name: 'Barcelona–El Prat Airport', city: 'Barcelona', country: 'Spain', country_code: 'ES', lat: 41.2971, lng: 2.0785, type: 'international', tz: 'Europe/Madrid' },
  { iata: 'FCO', icao: 'LIRF', name: 'Rome Fiumicino Airport', city: 'Rome', country: 'Italy', country_code: 'IT', lat: 41.8003, lng: 12.2389, type: 'international', tz: 'Europe/Rome' },
  { iata: 'MXP', icao: 'LIMC', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', country_code: 'IT', lat: 45.63, lng: 8.7281, type: 'international', tz: 'Europe/Rome' },
  { iata: 'VIE', icao: 'LOWW', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', country_code: 'AT', lat: 48.1103, lng: 16.5697, type: 'international', tz: 'Europe/Vienna' },
  { iata: 'ZRH', icao: 'LSZH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', country_code: 'CH', lat: 47.4647, lng: 8.5492, type: 'international', tz: 'Europe/Zurich' },
  { iata: 'BRU', icao: 'EBBR', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', country_code: 'BE', lat: 50.9014, lng: 4.4844, type: 'international', tz: 'Europe/Brussels' },
  { iata: 'CPH', icao: 'EKCH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', country_code: 'DK', lat: 55.6180, lng: 12.6561, type: 'international', tz: 'Europe/Copenhagen' },
  { iata: 'ARN', icao: 'ESSA', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden', country_code: 'SE', lat: 59.6519, lng: 17.9186, type: 'international', tz: 'Europe/Stockholm' },
  { iata: 'OSL', icao: 'ENGM', name: 'Oslo Gardermoen Airport', city: 'Oslo', country: 'Norway', country_code: 'NO', lat: 60.1939, lng: 11.1004, type: 'international', tz: 'Europe/Oslo' },
  { iata: 'HEL', icao: 'EFHK', name: 'Helsinki-Vantaa Airport', city: 'Helsinki', country: 'Finland', country_code: 'FI', lat: 60.3172, lng: 24.9633, type: 'international', tz: 'Europe/Helsinki' },
  { iata: 'LIS', icao: 'LPPT', name: 'Humberto Delgado Airport (Lisbon)', city: 'Lisbon', country: 'Portugal', country_code: 'PT', lat: 38.7813, lng: -9.136, type: 'international', tz: 'Europe/Lisbon' },
  { iata: 'ATH', icao: 'LGAV', name: 'Athens International Airport', city: 'Athens', country: 'Greece', country_code: 'GR', lat: 37.9364, lng: 23.9445, type: 'international', tz: 'Europe/Athens' },
  { iata: 'WAW', icao: 'EPWA', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland', country_code: 'PL', lat: 52.1657, lng: 20.9671, type: 'international', tz: 'Europe/Warsaw' },
  { iata: 'PRG', icao: 'LKPR', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic', country_code: 'CZ', lat: 50.1008, lng: 14.26, type: 'international', tz: 'Europe/Prague' },
  { iata: 'BUD', icao: 'LHBP', name: 'Budapest Ferenc Liszt International Airport', city: 'Budapest', country: 'Hungary', country_code: 'HU', lat: 47.4298, lng: 19.2611, type: 'international', tz: 'Europe/Budapest' },
  { iata: 'SVO', icao: 'UUEE', name: 'Sheremetyevo International Airport', city: 'Moscow', country: 'Russia', country_code: 'RU', lat: 55.9726, lng: 37.4146, type: 'international', tz: 'Europe/Moscow' },
  // ── NORTH AMERICA ───────────────────────────────────────────────────────────
  { iata: 'JFK', icao: 'KJFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', country_code: 'US', lat: 40.6413, lng: -73.7781, type: 'international', tz: 'America/New_York' },
  { iata: 'EWR', icao: 'KEWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'USA', country_code: 'US', lat: 40.6895, lng: -74.1745, type: 'international', tz: 'America/New_York' },
  { iata: 'LGA', icao: 'KLGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA', country_code: 'US', lat: 40.7772, lng: -73.8726, type: 'domestic', tz: 'America/New_York' },
  { iata: 'LAX', icao: 'KLAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', country_code: 'US', lat: 33.9425, lng: -118.408, type: 'international', tz: 'America/Los_Angeles' },
  { iata: 'SFO', icao: 'KSFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', country_code: 'US', lat: 37.6213, lng: -122.379, type: 'international', tz: 'America/Los_Angeles' },
  { iata: 'ORD', icao: 'KORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'USA', country_code: 'US', lat: 41.9742, lng: -87.9073, type: 'international', tz: 'America/Chicago' },
  { iata: 'DFW', icao: 'KDFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'USA', country_code: 'US', lat: 32.8969, lng: -97.038, type: 'international', tz: 'America/Chicago' },
  { iata: 'MIA', icao: 'KMIA', name: 'Miami International Airport', city: 'Miami', country: 'USA', country_code: 'US', lat: 25.7959, lng: -80.287, type: 'international', tz: 'America/New_York' },
  { iata: 'ATL', icao: 'KATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'USA', country_code: 'US', lat: 33.6407, lng: -84.4277, type: 'international', tz: 'America/New_York' },
  { iata: 'SEA', icao: 'KSEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'USA', country_code: 'US', lat: 47.4502, lng: -122.3088, type: 'international', tz: 'America/Los_Angeles' },
  { iata: 'YVR', icao: 'CYVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', country_code: 'CA', lat: 49.1967, lng: -123.1815, type: 'international', tz: 'America/Vancouver' },
  { iata: 'YYZ', icao: 'CYYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', country_code: 'CA', lat: 43.6772, lng: -79.6306, type: 'international', tz: 'America/Toronto' },
  { iata: 'MEX', icao: 'MMMX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', country_code: 'MX', lat: 19.4363, lng: -99.0721, type: 'international', tz: 'America/Mexico_City' },
  // ── OCEANIA ─────────────────────────────────────────────────────────────────
  { iata: 'SYD', icao: 'YSSY', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', country_code: 'AU', lat: -33.9399, lng: 151.1753, type: 'international', tz: 'Australia/Sydney' },
  { iata: 'MEL', icao: 'YMML', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', country_code: 'AU', lat: -37.6733, lng: 144.8430, type: 'international', tz: 'Australia/Melbourne' },
  { iata: 'BNE', icao: 'YBBN', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', country_code: 'AU', lat: -27.3842, lng: 153.1175, type: 'international', tz: 'Australia/Brisbane' },
  { iata: 'PER', icao: 'YPPH', name: 'Perth Airport', city: 'Perth', country: 'Australia', country_code: 'AU', lat: -31.9403, lng: 115.9672, type: 'international', tz: 'Australia/Perth' },
  { iata: 'AKL', icao: 'NZAA', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', country_code: 'NZ', lat: -37.0082, lng: 174.7917, type: 'international', tz: 'Pacific/Auckland' },
  // ── AFRICA ──────────────────────────────────────────────────────────────────
  { iata: 'JNB', icao: 'FAOR', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', country_code: 'ZA', lat: -26.1392, lng: 28.246, type: 'international', tz: 'Africa/Johannesburg' },
  { iata: 'CPT', icao: 'FACT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', country_code: 'ZA', lat: -33.9648, lng: 18.6017, type: 'international', tz: 'Africa/Johannesburg' },
  { iata: 'NBO', icao: 'HKJK', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', country_code: 'KE', lat: -1.3192, lng: 36.9275, type: 'international', tz: 'Africa/Nairobi' },
  { iata: 'CAI', icao: 'HECA', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', country_code: 'EG', lat: 30.1219, lng: 31.4056, type: 'international', tz: 'Africa/Cairo' },
  { iata: 'ADD', icao: 'HAAB', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', country_code: 'ET', lat: 8.9779, lng: 38.799, type: 'international', tz: 'Africa/Addis_Ababa' },
  { iata: 'LOS', icao: 'DNMM', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria', country_code: 'NG', lat: 6.5774, lng: 3.3212, type: 'international', tz: 'Africa/Lagos' },
  // ── SOUTH AMERICA ───────────────────────────────────────────────────────────
  { iata: 'GRU', icao: 'SBGR', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', country_code: 'BR', lat: -23.4356, lng: -46.4731, type: 'international', tz: 'America/Sao_Paulo' },
  { iata: 'BOG', icao: 'SKBO', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', country_code: 'CO', lat: 4.7016, lng: -74.1469, type: 'international', tz: 'America/Bogota' },
  { iata: 'LIM', icao: 'SPJC', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', country_code: 'PE', lat: -12.0219, lng: -77.1143, type: 'international', tz: 'America/Lima' },
  { iata: 'EZE', icao: 'SAEZ', name: 'Ministro Pistarini International Airport (Buenos Aires)', city: 'Buenos Aires', country: 'Argentina', country_code: 'AR', lat: -34.8222, lng: -58.5358, type: 'international', tz: 'America/Argentina/Buenos_Aires' },
  { iata: 'SCL', icao: 'SCEL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile', country_code: 'CL', lat: -33.3898, lng: -70.7945, type: 'international', tz: 'America/Santiago' },
];

Deno.serve(async (req) => {
  try {
    const { query = '', country_code = '', limit = 20 } = await req.json().catch(() => ({}));
    
    const q = query.toLowerCase().trim();
    let results = GLOBAL_AIRPORTS;

    // Filter by country first if provided
    if (country_code) {
      const countryAirports = results.filter(a => a.country_code === country_code);
      const others = results.filter(a => a.country_code !== country_code);
      results = [...countryAirports, ...others];
    }

    // Filter by search query
    if (q) {
      results = results.filter(a =>
        a.iata.toLowerCase().includes(q) ||
        a.icao.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
      );
    }

    return Response.json({
      success: true,
      airports: results.slice(0, parseInt(limit)),
      total: results.length,
      source: 'IATA/ICAO/Duffel/Amadeus/Sabre/Travelport'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});