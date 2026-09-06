// ================= External location lookups (optional, best-effort) =================
// These are the only network calls in this app, both free and keyless. If
// either fails — offline, blocked, rate-limited — every caller here falls
// back to null and the rest of the app keeps working exactly as it did
// before this file existed (raw coordinates, system-local time zone).
//
// 1. Timezone — resolved via Open-Meteo's public weather API
//    (open-meteo.com), purely for the `timezone` field it returns alongside
//    a weather request. Free for non-commercial use, no API key, no
//    practical rate limit for a personal app like this.
//
// 2. Place name (reverse geocoding) — split across two providers based on
//    how the coordinates were obtained, to respect each one's usage policy:
//      - BigDataCloud's free client-side endpoint is explicitly for the
//        device's own LIVE GPS reading at the moment of the call — their
//        fair-use policy prohibits using it for manually-typed or stored
//        coordinates (violations can get an IP banned). Use only right
//        after a successful navigator.geolocation call.
//      - OpenStreetMap Nominatim is used for manually-typed coordinates
//        instead. It's rate-limited (~1 request/second) and asks for
//        attribution, which is why the UI credits OpenStreetMap when a
//        label comes from here.
//
// 3. Place search (forward geocoding, for the autosuggest box) — Komoot's
//    Photon (photon.komoot.io), an open-source geocoder built specifically
//    for search-as-you-type. Free and keyless for reasonable personal use;
//    also OpenStreetMap-derived, so results are credited the same way.
//
// Normalization for this app's purpose: reverse-geocoding data sometimes
// labels the country for coordinates in this region as "Palestine"/"State
// of Palestine", and the IANA time zone database has separate zones for it
// (Asia/Gaza, Asia/Hebron) that have, in some years, observed different
// daylight-saving start/end dates than Asia/Jerusalem. Since this app's
// halachic times need to follow Israel's clock rules regardless of which
// zone a geocoder happens to return, both the displayed country and the
// resolved time zone are normalized to Israel below.

function normalizeCountryName(country){
  if (!country) return country;
  // Substring match (rather than an exact-phrase list) so this catches any
  // phrasing a geocoder returns — "Palestine", "State of Palestine",
  // "Palestine, State of" (the ISO 3166 official-name ordering), "Palestinian
  // Territory/Territories", "occupied Palestinian territory", etc. — since
  // they all contain "palestin" somewhere in the string.
  return /palestin/i.test(country) ? 'Israel' : country;
}
function normalizeTimezone(tz){
  return (tz === 'Asia/Gaza' || tz === 'Asia/Hebron') ? 'Asia/Jerusalem' : tz;
}

async function lookupTimezone(lat, lon){
  try{
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
      '&longitude=' + lon + '&current_weather=true&timezone=auto';
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.timezone ? normalizeTimezone(data.timezone) : null;
  }catch(e){ return null; }
}

async function lookupPlaceNameFromLiveGPS(lat, lon){
  try{
    const url = 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat +
      '&longitude=' + lon + '&localityLanguage=en';
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const city = data.city || data.locality || '';
    const region = data.principalSubdivision || '';
    const country = normalizeCountryName(data.countryName || '');
    const parts = [city || region, country].filter(Boolean);
    return parts.length ? { label: parts.join(', '), source: 'bigdatacloud', country: country } : null;
  }catch(e){ return null; }
}

async function lookupPlaceNameManual(lat, lon){
  try{
    const url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat +
      '&lon=' + lon + '&zoom=10&addressdetails=1';
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address || {};
    const city = a.city || a.town || a.village || a.municipality || a.county || '';
    const country = normalizeCountryName(a.country || '');
    const parts = [city, country].filter(Boolean);
    return parts.length ? { label: parts.join(', '), source: 'nominatim', country: country } : null;
  }catch(e){ return null; }
}

// Picks the right provider for how these coordinates were obtained.
async function lookupPlaceName(lat, lon, fromLiveGPS){
  return fromLiveGPS ? lookupPlaceNameFromLiveGPS(lat, lon) : lookupPlaceNameManual(lat, lon);
}

// Forward search for the autosuggest box — returns up to `limit` candidate
// places for a partial query, each with coordinates and a normalized
// country name ready to use directly (no separate reverse-geocode call
// needed once the user picks one).
async function searchPlaces(query, lang, limit){
  if (!query || query.trim().length < 2) return [];
  try{
    const langParam = lang === 'he' ? 'he' : 'en';
    const url = 'https://photon.komoot.io/api/?q=' + encodeURIComponent(query.trim()) +
      '&limit=' + (limit || 6) + '&lang=' + langParam;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features || []).map(f => {
      const p = f.properties || {};
      const coords = f.geometry && f.geometry.coordinates; // GeoJSON: [lon, lat]
      if (!coords) return null;
      const country = normalizeCountryName(p.country || '');
      const parts = [p.name, (p.city && p.city !== p.name) ? p.city : null, p.state, country].filter(Boolean);
      if (!parts.length) return null;
      return { label: parts.join(', '), lat: coords[1], lon: coords[0], country: country };
    }).filter(Boolean);
  }catch(e){ return []; }
}
