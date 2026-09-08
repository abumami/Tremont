// ================= Halachic times (zmanim) =================
// Sunrise/sunset are computed locally with the classic "Sunrise/Sunset
// Algorithm" (Almanac for Computers, 1990, US Naval Observatory) — a public,
// well-established formula, verified here against published times. Everything
// else (alot, tzeit, the proportional "shaah zmanit" times, candle lighting,
// havdalah) follows common Gra-based conventions with configurable minute
// offsets. Different communities/poskim vary on several of these — treat this
// as a solid estimate, not a psak.

function deg2rad(d){ return d * Math.PI / 180; }
function rad2deg(r){ return r * 180 / Math.PI; }
function norm360(x){ x = x % 360; if (x < 0) x += 360; return x; }
function norm24(x){ x = x % 24; if (x < 0) x += 24; return x; }

function calcSunUTCHours(year, month, day, lat, lng, isSunrise, zenith){
  const N1 = Math.floor(275 * month / 9);
  const N2 = Math.floor((month + 9) / 12);
  const N3 = (1 + Math.floor((year - 4 * Math.floor(year/4) + 2) / 3));
  const N = N1 - (N2 * N3) + day - 30;

  const lngHour = lng / 15;
  const t = isSunrise ? N + ((6 - lngHour) / 24) : N + ((18 - lngHour) / 24);

  const M = (0.9856 * t) - 3.289;

  let L = M + (1.916 * Math.sin(deg2rad(M))) + (0.020 * Math.sin(2*deg2rad(M))) + 282.634;
  L = norm360(L);

  let RA = rad2deg(Math.atan(0.91764 * Math.tan(deg2rad(L))));
  RA = norm360(RA);

  const Lquadrant = Math.floor(L/90) * 90;
  const RAquadrant = Math.floor(RA/90) * 90;
  RA = RA + (Lquadrant - RAquadrant);
  RA = RA / 15;

  const sinDec = 0.39782 * Math.sin(deg2rad(L));
  const cosDec = Math.cos(Math.asin(sinDec));

  const cosH = (Math.cos(deg2rad(zenith)) - (sinDec * Math.sin(deg2rad(lat)))) / (cosDec * Math.cos(deg2rad(lat)));
  if (cosH > 1 || cosH < -1) return null; // sun never sets/rises here on this date

  let H = isSunrise ? (360 - rad2deg(Math.acos(cosH))) : rad2deg(Math.acos(cosH));
  H = H / 15;

  const T = H + RA - (0.06571 * t) - 6.622;
  return norm24(T - lngHour);
}

// Returns {sunrise, sunset} as JS Date objects (or null if the sun doesn't
// rise/set that day at that latitude), for the given calendar date/lat/lon.
// `zenith` is the sun's angular distance from the zenith (in degrees) at the
// moment counted as "rise"/"set" — defaults to 90.8333°, the standard value
// accounting for atmospheric refraction and the sun's apparent radius (i.e.
// true geometric sunrise/sunset). Pass a different angle to get other
// depression-angle-based times instead — e.g. 96° is roughly the common
// 16.1°-below-horizon standard some use for alot hashachar/tzeit hakochavim,
// 100.5° is close to the 10.2° some use for misheyakir, etc.
function sunTimesFor(date, lat, lon, zenith){
  if (zenith === undefined || zenith === null) zenith = 90.8333;
  const y = date.getFullYear(), m = date.getMonth()+1, d = date.getDate();
  const srUTC = calcSunUTCHours(y, m, d, lat, lon, true, zenith);
  const ssUTC = calcSunUTCHours(y, m, d, lat, lon, false, zenith);
  const toDate = (utcHours) => utcHours === null ? null : new Date(Date.UTC(y, m-1, d) + utcHours*3600000);
  return { sunrise: toDate(srUTC), sunset: toDate(ssUTC) };
}

function addMinutes(date, min){ return new Date(date.getTime() + min*60000); }

// Is this Hebrew date a full Yom Tov day (for candle-lighting/havdalah
// purposes) — not Chol HaMoed, fasts, or minor/rabbinic days.
function isYomTovDay(hp, israel){
  const m = hp.month, d = hp.day;
  if (m === 'Tishri'){
    if (d===1||d===2) return true;
    if (d===10) return true;
    if (d===15||d===16) return true;
    if (d===22) return true;
    if (!israel && d===23) return true;
  }
  if (m === 'Nisan'){
    if (d===15||d===16) return true;
    if (d===21) return true;
    if (!israel && d===22) return true;
  }
  if (m === 'Sivan'){
    if (d===6) return true;
    if (!israel && d===7) return true;
  }
  return false;
}
function isSacredDay(date, israel){
  if (date.getDay() === 6) return true;
  return isYomTovDay(hebrewPartsEn(date), israel);
}

// Builds the ordered list of zmanim for one day. `settings` is
// {lat, lon, candleMin}. Returns an array of {key, time: Date|null};
// `key` is looked up against ZMANIM_LABELS for display.
function computeZmanim(date, israel, settings){
  const { sunrise, sunset } = sunTimesFor(date, settings.lat, settings.lon);
  const list = [];
  if (!sunrise || !sunset){
    return { polar: true, list: [] };
  }
  const shaahZmanit = (sunset.getTime() - sunrise.getTime()) / 12; // ms
  const plus = (hours) => new Date(sunrise.getTime() + hours*shaahZmanit);

  // Alot HaShachar and Tzeit HaKochavim as sun-angle (depression) times
  // rather than fixed minute offsets — 106.1° zenith (16.1° below horizon)
  // for alot, 96° zenith (6° below horizon) for tzeit.
  const alotTimes = sunTimesFor(date, settings.lat, settings.lon, 106.1);
  const tzeitTimes = sunTimesFor(date, settings.lat, settings.lon, 96.0);

  if (alotTimes.sunrise) list.push({ key: 'alotHaShachar', time: alotTimes.sunrise });
  list.push({ key: 'netzHaChamah', time: sunrise });
  list.push({ key: 'sofZmanShema', time: plus(3) });
  list.push({ key: 'sofZmanTefillah', time: plus(4) });
  list.push({ key: 'chatzot', time: new Date((sunrise.getTime()+sunset.getTime())/2) });
  list.push({ key: 'minchaGedolah', time: plus(6.5) });
  list.push({ key: 'minchaKetanah', time: plus(9.5) });
  list.push({ key: 'plagHaMincha', time: plus(10.75) });
  list.push({ key: 'shkiah', time: sunset });
  if (tzeitTimes.sunset) list.push({ key: 'tzeitHaKochavim', time: tzeitTimes.sunset });

  const tomorrow = addDays(date, 1);
  if (isSacredDay(tomorrow, israel) && !isSacredDay(date, israel)){
    list.push({ key: 'candleLighting', time: addMinutes(sunset, -settings.candleMin) });
  }
  if (isSacredDay(date, israel) && !isSacredDay(tomorrow, israel) && tzeitTimes.sunset){
    list.push({ key: 'havdalah', time: tzeitTimes.sunset });
  }

  list.sort((a,b) => a.time.getTime() - b.time.getTime());
  return { polar: false, list };
}

function formatTime(date, lang, timezone){
  const opts = { hour: 'numeric', minute: '2-digit' };
  if (timezone) opts.timeZone = timezone;
  return date.toLocaleTimeString(lang === 'he' ? 'he-IL' : 'en-US', opts);
}

const DEFAULT_ZMANIM_SETTINGS = {
  lat: null, lon: null, timezone: null, label: '', labelSource: null,
  candleMin: 18
};

async function loadZmanimSettings(){
  try{
    const val = await LocalStore.get('zmanim-settings');
    if (val) return Object.assign({}, DEFAULT_ZMANIM_SETTINGS, JSON.parse(val));
  }catch(e){ /* no settings saved yet */ }
  return Object.assign({}, DEFAULT_ZMANIM_SETTINGS);
}
async function saveZmanimSettings(settings){
  await LocalStore.set('zmanim-settings', JSON.stringify(settings));
}
