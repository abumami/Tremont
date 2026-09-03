# Tremont

A Hebrew/civil dual calendar that runs entirely as a static site — no build step, no server, no account. Open `index.html` in a browser and it works.

Each day cell shows the civil date and the Hebrew date side by side, along with holidays, the weekly Torah portion, the Omer count, and space for your own notes. A day view adds halachic times (zmanim) for a location you set once.

## Features

- **Dual-date month grid** — civil date and Hebrew date on every day, computed with the browser's built-in Hebrew calendar (`Intl.DateTimeFormat`), so no calendar data is bundled or hardcoded.
- **Holidays** — the standard yearly cycle (Rosh Hashanah, Yom Kippur, Sukkot, Chanukah, Tu BiShvat, Purim, Pesach, Yom HaShoah, Yom HaAtzmaut, Lag BaOmer, Yom Yerushalayim, Shavuot, the summer fasts, Tisha B'Av, Tu B'Av), computed locally.
- **Weekly Torah portion (parsha)** — computed from scratch with a real implementation of the standard rules for which portions combine in a given year (leap year, where Rosh Hashanah and Pesach fall, etc.), not looked up from an external calendar service.
- **Omer counter** — shown automatically each day of the counting period.
- **Israel / Diaspora toggle** — affects holiday lengths, which Shabbat readings combine, and candle-lighting/havdalah timing.
- **English / Hebrew interface toggle** — including Hebrew-numeral Hebrew dates (e.g. כ״ה) when in Hebrew mode.
- **Day view** — a focused view for one day: civil/Hebrew date, holiday and parsha tags, a notes box, and halachic times.
- **Halachic times (zmanim)** — alot hashachar, hanetz hachamah, sof zman shema/tefillah, chatzot, mincha gedolah/ketanah, plag hamincha, shkiah, tzeit hakochavim, and candle-lighting/havdalah on the days they apply. Computed from real sunrise/sunset for a location you provide (see below).
- **Per-day notes**, saved locally.
- **Mobile-responsive** layout.

## Getting started

No installation. Clone or download the repo and open `index.html` in any modern browser.

```
git clone <this-repo>
cd tremont
open index.html   # or just double-click it
```

Everything (notes, your zmanim location, display preferences) is saved in the browser's `localStorage`, scoped to wherever you're opening the file from. There's no backend and nothing is ever sent anywhere except the two optional lookups described below.

## Project structure

```
index.html              Markup only
styles.css              All styling, including mobile breakpoints
js/
  i18n.js                Month/weekday names, all UI strings (English + Hebrew), parsha names
  hebrew-dates.js         Intl-based Hebrew calendar helpers (date lookups, anchor-finding)
  holidays.js             The holiday-by-date table
  parsha.js                The weekly Torah portion calculation engine
  zmanim.js                Sunrise/sunset math and the halachic-times list
  location-lookup.js       Optional timezone + place-name lookups (see below)
  storage.js                Persistence (falls back to localStorage; see below)
  notes.js                  Per-day note storage
  app.js                     State, rendering, and event wiring — pulls everything above together
```

Everything is loaded as plain `<script>` tags (no bundler, no build step), so the file structure above must stay intact relative to `index.html`.

## How the weekly Torah portion is computed

`js/parsha.js` implements the standard deterministic rule set for which of the 54 weekly portions get combined in a given Hebrew year — based on whether it's a leap year, and where Pesach, Rosh Hashanah, and Tisha B'Av fall — following the algorithm described in I. Bromberg's *"Weekly Torah Portions and Special Sabbaths"* (individual.utoronto.ca/kalendis/hebrew/parshah.htm). It does not call any external calendar API.

## Halachic times: how location works

Zmanim depend on your latitude/longitude. Open the **Location Settings** panel in the day view to either:

- **Use My Location** (browser geolocation), or
- type in coordinates manually.

Two things are resolved automatically once you save a location:

- **Time zone** — via [Open-Meteo](https://open-meteo.com)'s free, keyless weather API (used only for the `timezone` field it returns), so times display correctly regardless of what time zone your device's clock is set to.
- **Place name** — via [BigDataCloud](https://www.bigdatacloud.com)'s free reverse-geocoding endpoint when the coordinates came from live GPS, or [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org) when they were typed in manually (chosen per-provider to respect each service's usage policy — BigDataCloud's free endpoint is restricted to live device GPS only).

Both lookups are best-effort: if you're offline or a lookup fails, the app still works from just latitude/longitude, with times falling back to your device's local time zone. Country names matching "Palestine" and time zones `Asia/Gaza`/`Asia/Hebron` are normalized to Israel/`Asia/Jerusalem`, since this app's times need to follow Israel's clock and DST rules.

**These are estimates, not a psak.** Sunrise/sunset are computed with the classic Sunrise/Sunset Algorithm (*Almanac for Computers*, 1990, US Naval Observatory), verified against published times. Alot, tzeit, and candle-lighting use common fixed-minute offsets (72 / 42 / 18, all adjustable in Location Settings), and the proportional-hour times (sof zman shema/tefillah, mincha gedolah/ketanah, plag hamincha) follow the Gra method. Different communities and poskim vary on several of these — check with your rav or local luach for anything you're relying on practically.

## Browser support

Requires a browser with `Intl.DateTimeFormat` support for the Hebrew calendar (`'en-u-ca-hebrew'`) and Hebrew-numeral formatting (`'he-u-ca-hebrew-nu-hebr'`) — current versions of Chrome, Firefox, Safari, and Edge all support this.

## Privacy

No accounts, no analytics, no server. All data (notes, location, preferences) lives in your browser's local storage. The only outbound network requests are the two optional, keyless lookups described above, made directly from your browser to Open-Meteo/BigDataCloud/Nominatim when you set a zmanim location — nothing is sent anywhere otherwise.

## License

This project is licensed under the DGAS License - see the [LICENSE](LICENSE) file for details.