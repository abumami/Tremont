// ================= Local parasha (Torah portion) engine =================
// Implements the standard deterministic algorithm for which portions are
// combined, based on: I. Bromberg, "Weekly Torah Portions and Special
// Sabbaths" (individual.utoronto.ca/kalendis/hebrew/parshah.htm).
function isOverriddenShabbat(d, israel){
  const hp = hebrewPartsEn(d);
  const m = hp.month, day = hp.day;
  if (m === 'Tishri'){
    if (day===1||day===2) return true;
    if (day===10) return true;
    if (day>=15 && day<=22) return true;
    if (!israel && day===23) return true;
  }
  if (m === 'Nisan'){
    if (day>=15 && day<=21) return true;
    if (!israel && day===22) return true;
  }
  if (m === 'Sivan'){
    if (day===6) return true;
    if (!israel && day===7) return true;
  }
  return false;
}

function cycleIsLeap(simchatTorahDate){
  for (let o=90; o<=210; o++){
    const d = addDays(simchatTorahDate, o);
    const hp = hebrewPartsEn(d);
    if (hp.month === 'Adar I') return true;
    if (hp.month === 'Adar') return false;
  }
  return false;
}

function countSaturdaysInclusive(start, end){
  let count = 0;
  for (let d = new Date(start); d.getTime() <= end.getTime(); d = addDays(d,7)) count++;
  return count;
}

const parshaCache = new Map();
function computeParsha(targetSaturday, israel){
  if (targetSaturday.getDay() !== 6) return null;
  const cacheKey = isoKey(targetSaturday) + '_' + (israel?'il':'d');
  if (parshaCache.has(cacheKey)) return parshaCache.get(cacheKey);

  const stDay = israel ? 22 : 23;
  const simchatTorah = findPriorHebrewDate('Tishri', stDay, targetSaturday, 400);
  let result = null;

  if (simchatTorah && !isOverriddenShabbat(targetSaturday, israel)){
    let bereshitShabbat = addDays(simchatTorah, 1);
    while (bereshitShabbat.getDay() !== 6) bereshitShabbat = addDays(bereshitShabbat, 1);

    if (targetSaturday.getTime() === bereshitShabbat.getTime()){
      result = { indices: [0] };
    } else {
      const weeksElapsed = Math.round(daysBetween(bereshitShabbat, targetSaturday) / 7);
      const pnSimple = weeksElapsed + 1;
      if (pnSimple >= 1 && pnSimple < 22){
        result = { indices: [pnSimple - 1] };
      } else {
        const leap = cycleIsLeap(simchatTorah);
        const pesach = findNextHebrewDate('Nisan', 15, simchatTorah, 260);
        const tishaBav = findNextHebrewDate('Av', 9, simchatTorah, 340);
        const nextRoshHashanah = findNextHebrewDate('Tishri', 1, simchatTorah, 400);

        let tempShabbat = addDays(bereshitShabbat, 20*7);
        let pn = 21;
        let lastCombined = false;

        while (tempShabbat.getTime() < targetSaturday.getTime()){
          tempShabbat = addDays(tempShabbat, 7);
          if (isOverriddenShabbat(tempShabbat, israel)) continue;
          pn += 1;
          let combined = false;
          if (pesach && tishaBav && nextRoshHashanah){
            switch (pn){
              case 22: {
                const upper = addDays(pesach, -1);
                combined = countSaturdaysInclusive(tempShabbat, upper) < 4;
                break;
              }
              case 27: combined = !leap; break;
              case 29: combined = !leap; break;
              case 32: {
                if (!israel) combined = !leap;
                else combined = (pesach.getDay() !== 6) && !leap;
                break;
              }
              case 39: {
                combined = !israel && pesach.getDay() === 4;
                break;
              }
              case 42: {
                combined = countSaturdaysInclusive(tempShabbat, tishaBav) < 3;
                break;
              }
              case 51: {
                combined = daysBetween(tempShabbat, nextRoshHashanah) > 3;
                break;
              }
            }
          }
          if (combined) pn += 1;
          lastCombined = combined;
        }

        if (tempShabbat.getTime() === targetSaturday.getTime() && pn >= 1 && pn <= 54){
          result = lastCombined ? { indices: [pn-2, pn-1] } : { indices: [pn-1] };
        }
      }
    }
  }
  parshaCache.set(cacheKey, result);
  return result;
}
