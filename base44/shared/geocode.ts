// Resolves a location query (city name or IATA airport code) to geographic coordinates.
// Shared by searchHotelsDuffel and searchCarRentalsDuffel.

export async function geocodeLocation(base44, query) {
  const q = (query || '').toString().trim();
  if (!q) return null;

  // 1) Airport entity lookup for IATA-style codes (3 letters)
  if (/^[a-zA-Z]{3}$/.test(q)) {
    try {
      const airports = await base44.asServiceRole.entities.Airport.filter({ iata_code: q.toUpperCase() });
      if (airports && airports.length > 0) {
        const a = airports[0];
        if (typeof a.latitude === 'number' && typeof a.longitude === 'number') {
          return { latitude: a.latitude, longitude: a.longitude, name: a.city || a.airport_name || q };
        }
      }
    } catch (e) {
      /* fall through to geocoder */
    }
  }

  // 2) Open-Meteo geocoding (free, no API key required)
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const hit = data?.results?.[0];
      if (hit && typeof hit.latitude === 'number' && typeof hit.longitude === 'number') {
        return { latitude: hit.latitude, longitude: hit.longitude, name: hit.name };
      }
    }
  } catch (e) {
    /* ignore geocoder errors */
  }

  return null;
}