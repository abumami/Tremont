// ================= Offline holiday lookup =================
// Approximate common observances, keyed by the Hebrew month/day. Verify
// exact times/dates against a trusted luach for anything halachically
// time-sensitive (candle-lighting, fast start/end, etc.).
function holidayFor(date, israel, lang){
  const hp = hebrewPartsEn(date);
  const m = hp.month, day = hp.day;
  const L = (en, he) => lang === 'he' ? he : en;
  if (m === 'Tishri'){
    if (day===1||day===2) return L('Rosh Hashanah','ראש השנה');
    if (day===3) return L('Fast of Gedaliah','צום גדליה');
    if (day===10) return L('Yom Kippur','יום כיפור');
    if (day===15||day===16) return L('Sukkot','סוכות');
    if (day>=17&&day<=20) return L('Chol HaMoed Sukkot','חול המועד סוכות');
    if (day===21) return L('Hoshana Rabbah','הושענא רבה');
    if (day===22) return israel ? L('Shemini Atzeret / Simchat Torah','שמיני עצרת ושמחת תורה') : L('Shemini Atzeret','שמיני עצרת');
    if (day===23 && !israel) return L('Simchat Torah','שמחת תורה');
  }
  if (m === 'Tevet' && day===10) return L("Asara B'Tevet (fast)",'עשרה בטבת');
  if (m === 'Shevat' && day===15) return L('Tu BiShvat','ט״ו בשבט');
  if (m === 'Adar' || m === 'Adar II'){
    if (day===13) return L("Ta'anit Esther (fast)",'תענית אסתר');
    if (day===14) return L('Purim','פורים');
    if (day===15) return L('Shushan Purim','שושן פורים');
  }
  if (m === 'Nisan'){
    if (day===14) return L('Erev Pesach','ערב פסח');
    if (day===15||day===16) return L('Pesach','פסח');
    if (day>=17&&day<=20) return L('Chol HaMoed Pesach','חול המועד פסח');
    if (day===21) return L('Pesach','פסח');
    if (day===22 && !israel) return L('Pesach','פסח');
    if (day===27) return L('Yom HaShoah','יום השואה');
  }
  if (m === 'Iyar'){
    if (day===5) return L('Yom HaAtzmaut*','יום העצמאות*');
    if (day===18) return L('Lag BaOmer','ל״ג בעומר');
    if (day===28) return L('Yom Yerushalayim','יום ירושלים');
  }
  if (m === 'Sivan'){
    if (day===6) return L('Shavuot','שבועות');
    if (day===7 && !israel) return L('Shavuot','שבועות');
  }
  if (m === 'Tamuz' && day===17) return L('Tzom Tammuz (fast)','צום תמוז');
  if (m === 'Av'){
    if (day===9) return L("Tisha B'Av (fast)",'תשעה באב');
    if (day===15) return L("Tu B'Av",'ט״ו באב');
  }
  return null;
}
