// ================= Hebrew-date helpers =================
// Wraps the browser's built-in Hebrew calendar (Intl) with small utilities
// for finding anchor dates (e.g. "the nearest Simchat Torah before X").
const hebFmtEnCache = new Intl.DateTimeFormat('en-u-ca-hebrew', { year:'numeric', month:'long', day:'numeric' });
const hebFmtHeCache = new Intl.DateTimeFormat('he-u-ca-hebrew-nu-hebr', { year:'numeric', month:'long', day:'numeric' });

function hebrewPartsEn(date){
  const parts = hebFmtEnCache.formatToParts(date);
  const map = {};
  parts.forEach(p => map[p.type] = p.value);
  return { day: parseInt(map.day,10), month: map.month, year: parseInt(map.year,10) };
}

function hebrewPartsDisplay(date, lang){
  const fmt = lang === 'he' ? hebFmtHeCache : hebFmtEnCache;
  const parts = fmt.formatToParts(date);
  const map = {};
  parts.forEach(p => map[p.type] = p.value);
  return { day: map.day, month: map.month, year: map.year };
}

function isoKey(date){
  return date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
}
function addDays(date, n){ const d = new Date(date); d.setDate(d.getDate()+n); return d; }
function daysBetween(a,b){ return Math.round((b.getTime()-a.getTime())/86400000); }

function findNextHebrewDate(monthName, day, refDate, radius){
  for (let o=1; o<=radius; o++){
    const d = addDays(refDate, o);
    const hp = hebrewPartsEn(d);
    if (hp.month === monthName && hp.day === day) return d;
  }
  return null;
}
function findPriorHebrewDate(monthName, day, refDate, radius){
  for (let o=1; o<=radius; o++){
    const d = addDays(refDate, -o);
    const hp = hebrewPartsEn(d);
    if (hp.month === monthName && hp.day === day) return d;
  }
  return null;
}

// Anchor-based multi-day spans (robust to Kislev's variable length etc.)
function findAnchorNearby(monthName, day, refDate, radius){
  for (let o=0; o<=radius; o++){
    for (const sign of (o===0?[1]:[-1,1])){
      const d = addDays(refDate, sign*o);
      const hp = hebrewPartsEn(d);
      if (hp.month === monthName && hp.day === day) return d;
    }
  }
  return null;
}

// Chanukah + Omer: N consecutive civil days from a fixed Hebrew anchor,
// which sidesteps needing to know Kislev's variable month length.
function buildSpanMap(monthName, day, length, refDate){
  const anchor = findAnchorNearby(monthName, day, refDate, 200);
  const map = {};
  if (anchor){
    for (let i=0;i<length;i++) map[isoKey(addDays(anchor,i))] = i+1;
  }
  return map;
}
