// ================= i18n: month/weekday names, UI strings =================
const MONTH_NAMES_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_NAMES_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const WEEKDAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const WEEKDAYS_HE = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];

const STRINGS = {
  en: {
    today: 'Today', langToggle: 'עברית',
    addNote: 'Add a note or event…', saved: 'Saved', couldNotSave: 'Could not save',
    legendCivil: 'Civil date', legendHebrew: 'Hebrew date',
    legendParsha: 'Torah portion (Shabbat)',
    legendHoliday: 'Holiday (approximate — verify for observance)',
    omer: (n) => 'Omer, day ' + n,
    locDiaspora: 'Diaspora', locIsrael: 'Israel',
    parshatPrefix: 'Parashat ',
    dayViewBtn: 'Day View', backToMonth: '\u2039 Month View',
    prevDay: '\u2039 Prev Day', nextDay: 'Next Day \u203a',
    dayNotesHeading: 'Notes', zmanimHeading: 'Halachic times',
    zmanimPlaceholder: 'Set a location to see halachic times for this day.',
    zmanimPolar: 'The sun does not rise or set here on this date — halachic times can\u2019t be calculated.',
    zmanimDisclaimer: 'Calculated locally from sunrise/sunset for your location. Time zone is looked up automatically for your coordinates (falls back to your device\u2019s time zone if that lookup fails or you\u2019re offline). Common conventions (Gra-based); consult your rav/local luach for practical use.',
    useMyLocation: 'Use My Location', editLocation: 'Location Settings',
    locationNotSet: 'No location set',
    locationSetTo: (lat,lon) => 'Location: ' + lat + ', ' + lon,
    latitude: 'Latitude', longitude: 'Longitude',
    alotOffset: 'Alot (min before sunrise)', tzeitOffset: 'Tzeit (min after sunset)',
    candleOffset: 'Candle lighting (min before sunset)',
    saveLocation: 'Save', cancel: 'Cancel',
    geoError: 'Could not get your location. Enter it manually below.',
    geoUnsupported: 'Geolocation isn\u2019t available in this browser. Enter your location manually.',
    osmAttribution: 'via OpenStreetMap'
  },
  he: {
    today: 'היום', langToggle: 'English',
    addNote: 'הוסף הערה או אירוע…', saved: 'נשמר', couldNotSave: 'לא ניתן לשמור',
    legendCivil: 'תאריך אזרחי', legendHebrew: 'תאריך עברי',
    legendParsha: 'פרשת השבוע',
    legendHoliday: 'חג (יש לוודא זמנים/תאריכים מדויקים)',
    omer: (n) => 'העומר, יום ' + n,
    locDiaspora: 'תפוצות', locIsrael: 'ישראל',
    parshatPrefix: 'פרשת ',
    dayViewBtn: 'תצוגת יום', backToMonth: '\u2039 תצוגת חודש',
    prevDay: '\u2039 יום קודם', nextDay: 'יום הבא \u203a',
    dayNotesHeading: 'הערות', zmanimHeading: 'זמנים הלכתיים',
    zmanimPlaceholder: 'הגדר/י מיקום כדי לראות זמנים הלכתיים ליום זה.',
    zmanimPolar: 'השמש אינה זורחת/שוקעת כאן בתאריך זה — לא ניתן לחשב זמנים הלכתיים.',
    zmanimDisclaimer: 'מחושב באופן מקומי משעות הזריחה/שקיעה במיקום שלך. אזור הזמן מתקבל אוטומטית לפי הקואורדינטות (ובמקרה של כשל בחיפוש או ניתוק מהאינטרנט, מוצג לפי אזור הזמן של המכשיר). לפי שיטת הגר״א. יש להתייעץ עם רב או לוח מקומי לשימוש הלכה למעשה.',
    useMyLocation: 'השתמש/י במיקום שלי', editLocation: 'הגדרות מיקום',
    locationNotSet: 'לא הוגדר מיקום',
    locationSetTo: (lat,lon) => 'מיקום: ' + lat + ', ' + lon,
    latitude: 'קו רוחב', longitude: 'קו אורך',
    alotOffset: 'עלות (דקות לפני הזריחה)', tzeitOffset: 'צאת הכוכבים (דקות אחרי השקיעה)',
    candleOffset: 'הדלקת נרות (דקות לפני השקיעה)',
    saveLocation: 'שמור', cancel: 'ביטול',
    geoError: 'לא ניתן לאתר את מיקומך. הזן/י אותו ידנית למטה.',
    geoUnsupported: 'איתור מיקום אינו זמין בדפדפן זה. הזן/י את המיקום ידנית.',
    osmAttribution: 'מקור: OpenStreetMap'
  }
};

// Labels for each zman key computed in zmanim.js.
const ZMANIM_LABELS = {
  alotHaShachar: { en: 'Alot HaShachar (Dawn)', he: 'עלות השחר' },
  netzHaChamah: { en: 'HaNetz HaChamah (Sunrise)', he: 'הנץ החמה' },
  sofZmanShema: { en: "Sof Zman Shema (Gra)", he: 'סוף זמן קריאת שמע (גר״א)' },
  sofZmanTefillah: { en: 'Sof Zman Tefillah (Gra)', he: 'סוף זמן תפילה (גר״א)' },
  chatzot: { en: 'Chatzot (Midday)', he: 'חצות היום' },
  minchaGedolah: { en: 'Mincha Gedolah', he: 'מנחה גדולה' },
  minchaKetanah: { en: 'Mincha Ketanah', he: 'מנחה קטנה' },
  plagHaMincha: { en: 'Plag HaMincha', he: 'פלג המנחה' },
  shkiah: { en: 'Shkiah (Sunset)', he: 'שקיעה' },
  tzeitHaKochavim: { en: 'Tzeit HaKochavim (Nightfall)', he: 'צאת הכוכבים' },
  candleLighting: { en: 'Candle Lighting', he: 'הדלקת נרות' },
  havdalah: { en: 'Havdalah', he: 'הבדלה' }
};

// 54 weekly Torah portions, in reading order (Vezot HaBerakhah is read on
// Simchat Torah itself, never on a regular Shabbat, but is kept in the list
// for indexing purposes).
const PARSHA_EN = ['Bereshit','Noach','Lech Lecha','Vayera',"Chayei Sara",'Toldot','Vayetzei','Vayishlach',
  'Vayeshev','Miketz','Vayigash','Vayechi','Shemot','Vaera','Bo','Beshalach','Yitro','Mishpatim','Terumah',
  'Tetzaveh','Ki Tisa','Vayakhel','Pekudei','Vayikra','Tzav','Shmini','Tazria','Metzora','Achrei Mot',
  'Kedoshim','Emor','Behar','Bechukotai','Bamidbar','Nasso',"Beha'alotcha","Sh'lach",'Korach','Chukat',
  'Balak','Pinchas','Matot','Masei','Devarim',"Va'etchanan",'Eikev','Re\u2019eh','Shoftim','Ki Teitzei',
  'Ki Tavo','Nitzavim','Vayelech',"Ha'azinu",'Vezot HaBerakhah'];
const PARSHA_HE = ['בראשית','נח','לך לך','וירא','חיי שרה','תולדות','ויצא','וישלח','וישב','מקץ','ויגש','ויחי',
  'שמות','וארא','בא','בשלח','יתרו','משפטים','תרומה','תצוה','כי תשא','ויקהל','פקודי','ויקרא','צו','שמיני',
  'תזריע','מצורע','אחרי מות','קדושים','אמור','בהר','בחוקותי','במדבר','נשא','בהעלותך','שלח','קרח','חוקת',
  'בלק','פינחס','מטות','מסעי','דברים','ואתחנן','עקב','ראה','שופטים','כי תצא','כי תבוא','נצבים','וילך',
  'האזינו','וזאת הברכה'];
