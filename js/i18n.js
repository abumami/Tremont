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
    zmanimPlaceholder: 'Halachic times for this day will appear here once location-based calculation is added.'
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
    zmanimPlaceholder: 'זמנים הלכתיים ליום זה יופיעו כאן לאחר הוספת חישוב לפי מיקום.'
  }
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
