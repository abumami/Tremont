// ================= App configuration =================
// Plain constants meant to be edited directly in this file rather than
// exposed as UI controls. Loaded first (before every other script) since
// some of these are read at another file's own top level.

// Show the color-key legend under the month grid.
const SHOW_LEGEND = false;

// Candle-lighting offset (minutes before sunset), applied automatically
// whenever a location is set (see js/day-view.js) — based on common local
// minhag. Diaspora uses one value; Israel varies by city. Keys are matched
// case-insensitively against the resolved city name (English or Hebrew).
const CANDLE_LIGHTING_MINUTES = {
  diaspora: 18,
  israelDefault: 22,
  israelCities: {
    'jerusalem': 40, 'yerushalayim': 40, 'ירושלים': 40,
    'haifa': 30, 'חיפה': 30,
    'beer sheva': 30, "be'er sheva": 30, 'beersheba': 30, 'באר שבע': 30
  }
};

function candleMinutesForLocation(city, isIsrael){
  if (!isIsrael) return CANDLE_LIGHTING_MINUTES.diaspora;
  const key = (city || '').trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(CANDLE_LIGHTING_MINUTES.israelCities, key)){
    return CANDLE_LIGHTING_MINUTES.israelCities[key];
  }
  return CANDLE_LIGHTING_MINUTES.israelDefault;
}
