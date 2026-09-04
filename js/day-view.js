// ================= Day view =================
// Everything specific to the single-day view: date/holiday/parsha display,
// the notes box, and halachic times (including the location settings form).
// Reads shared state from AppState (defined in app.js) and is invoked by
// app.js — this file never decides which view is showing.

(function(){
  const dayPrevBtn = document.getElementById('dayPrevBtn');
  const dayTodayBtn = document.getElementById('dayTodayBtn');
  const dayNextBtn = document.getElementById('dayNextBtn');
  const dayTags = document.getElementById('dayTags');
  const dayNoteLabel = document.getElementById('dayNoteLabel');
  const dayNoteInput = document.getElementById('dayNoteInput');
  const dayZmanimLabel = document.getElementById('dayZmanimLabel');
  const dayZmanimPlaceholder = document.getElementById('dayZmanimPlaceholder');
  const zmanimLocationLabel = document.getElementById('zmanimLocationLabel');
  const editLocationBtn = document.getElementById('editLocationBtn');
  const zmanimSettingsForm = document.getElementById('zmanimSettingsForm');
  const useMyLocationBtn = document.getElementById('useMyLocationBtn');
  const zmanimLatInput = document.getElementById('zmanimLatInput');
  const zmanimLonInput = document.getElementById('zmanimLonInput');
  const zmanimAlotInput = document.getElementById('zmanimAlotInput');
  const zmanimTzeitInput = document.getElementById('zmanimTzeitInput');
  const zmanimCandleInput = document.getElementById('zmanimCandleInput');
  const zmanimSaveBtn = document.getElementById('zmanimSaveBtn');
  const zmanimCancelBtn = document.getElementById('zmanimCancelBtn');
  const zmanimStatus = document.getElementById('zmanimStatus');
  const zmanimList = document.getElementById('zmanimList');
  const zmanimDisclaimerEl = document.getElementById('zmanimDisclaimer');
  const latLabel = document.getElementById('latLabel');
  const lonLabel = document.getElementById('lonLabel');
  const alotLabel = document.getElementById('alotLabel');
  const tzeitLabel = document.getElementById('tzeitLabel');
  const candleLabel = document.getElementById('candleLabel');

  let zmanimSettings = Object.assign({}, DEFAULT_ZMANIM_SETTINGS);
  let locationIsLiveGPS = false;

  // Called explicitly by app.js once AppState exists — kept out of this
  // file's own top-level execution because a .then() callback registered at
  // top level can fire (via a microtask checkpoint) right after this script
  // tag finishes, which is before app.js has even run.
  function initDayView(){
    loadZmanimSettings().then(s => {
      zmanimSettings = s;
      if (AppState.currentView === 'day') renderDayView();
      // Backfill: a location saved before timezone lookup existed won't have
      // one yet. Resolve it once in the background, best-effort, no UI needed.
      if (hasLocation() && !zmanimSettings.timezone){
        lookupTimezone(zmanimSettings.lat, zmanimSettings.lon).then(tz => {
          if (tz){
            zmanimSettings.timezone = tz;
            saveZmanimSettings(zmanimSettings);
            if (AppState.currentView === 'day') renderDayView();
          }
        });
      }
    });
  }

  function applyDayStrings(){
    const S = STRINGS[AppState.lang];
    dayTodayBtn.textContent = S.today;
    dayNoteLabel.textContent = S.dayNotesHeading;
    dayZmanimLabel.textContent = S.zmanimHeading;
    dayZmanimPlaceholder.textContent = S.zmanimPlaceholder;
    editLocationBtn.textContent = S.editLocation;
    useMyLocationBtn.textContent = S.useMyLocation;
    latLabel.textContent = S.latitude;
    lonLabel.textContent = S.longitude;
    alotLabel.textContent = S.alotOffset;
    tzeitLabel.textContent = S.tzeitOffset;
    candleLabel.textContent = S.candleOffset;
    zmanimSaveBtn.textContent = S.saveLocation;
    zmanimCancelBtn.textContent = S.cancel;
    zmanimDisclaimerEl.textContent = S.zmanimDisclaimer;
    dayNoteInput.placeholder = S.addNote;
  }

  function renderDayView(){
    applySharedStrings();
    applyDayStrings();
    const d = AppState.selectedDate;
    const lang = AppState.lang, israel = AppState.israel;

    civilTitle.textContent = (lang === 'he' ? MONTH_NAMES_HE[d.getMonth()] : MONTH_NAMES_EN[d.getMonth()]) + ' ' + d.getDate() + ', ' + d.getFullYear();
    civilTitle.dir = lang === 'he' ? 'rtl' : 'ltr';

    const hp = hebrewPartsDisplay(d, lang);
    hebrewTitle.textContent = hp.day + ' ' + hp.month + ' ' + hp.year;
    hebrewTitle.dir = lang === 'he' ? 'rtl' : 'ltr';

    const chanukahMap = buildSpanMap('Kislev', 25, 8, d);
    const omerMap = buildSpanMap('Nisan', 16, 49, d);
    dayTags.innerHTML = '';
    appendTags(dayTags, tagsForDay(d, chanukahMap, omerMap));

    AppState.currentDayKey = isoKey(d);
    dayNoteInput.value = '';
    loadNote(AppState.currentDayKey).then(val => { dayNoteInput.value = val || ''; });

    renderZmanimSection(d);
  }

  function hasLocation(){
    return typeof zmanimSettings.lat === 'number' && typeof zmanimSettings.lon === 'number';
  }

  function renderZmanimLocationLabel(){
    const S = STRINGS[AppState.lang];
    if (!hasLocation()){
      zmanimLocationLabel.textContent = S.locationNotSet;
      return;
    }
    const coords = zmanimSettings.lat.toFixed(3) + ', ' + zmanimSettings.lon.toFixed(3);
    let text = zmanimSettings.label ? (zmanimSettings.label + ' (' + coords + ')') : coords;
    if (zmanimSettings.labelSource === 'nominatim') text += ' \u2013 ' + S.osmAttribution;
    zmanimLocationLabel.textContent = text;
  }

  function renderZmanimSection(d){
    const S = STRINGS[AppState.lang];
    const lang = AppState.lang, israel = AppState.israel;
    renderZmanimLocationLabel();
    zmanimList.innerHTML = '';

    if (!hasLocation()){
      dayZmanimPlaceholder.classList.remove('hidden');
      dayZmanimPlaceholder.textContent = S.zmanimPlaceholder;
      return;
    }

    const result = computeZmanim(d, israel, zmanimSettings);
    if (result.polar){
      dayZmanimPlaceholder.classList.remove('hidden');
      dayZmanimPlaceholder.textContent = S.zmanimPolar;
      return;
    }
    dayZmanimPlaceholder.classList.add('hidden');
    zmanimList.style.gridTemplateRows = 'repeat(' + Math.ceil(result.list.length / 2) + ', auto)';

    result.list.forEach(z => {
      const row = document.createElement('div');
      const isSpecial = (z.key === 'candleLighting' || z.key === 'havdalah');
      row.className = 'zman-row' + (isSpecial ? ' zman-special' : '');
      row.dir = lang === 'he' ? 'rtl' : 'ltr';

      const label = document.createElement('span');
      label.className = 'zman-label';
      label.textContent = ZMANIM_LABELS[z.key][lang];

      const time = document.createElement('span');
      time.className = 'zman-time';
      time.textContent = formatTime(z.time, lang, zmanimSettings.timezone);

      row.appendChild(label);
      row.appendChild(time);
      zmanimList.appendChild(row);
    });
  }

  function openLocationForm(){
    zmanimLatInput.value = zmanimSettings.lat !== null ? zmanimSettings.lat : '';
    zmanimLonInput.value = zmanimSettings.lon !== null ? zmanimSettings.lon : '';
    zmanimAlotInput.value = zmanimSettings.alotMin;
    zmanimTzeitInput.value = zmanimSettings.tzeitMin;
    zmanimCandleInput.value = zmanimSettings.candleMin;
    zmanimStatus.textContent = '';
    zmanimSettingsForm.classList.remove('hidden');
  }
  function closeLocationForm(){
    zmanimSettingsForm.classList.add('hidden');
  }

  editLocationBtn.addEventListener('click', () => {
    if (zmanimSettingsForm.classList.contains('hidden')) openLocationForm();
    else closeLocationForm();
  });
  zmanimCancelBtn.addEventListener('click', closeLocationForm);

  // Typing directly into lat/lon means whatever came from geolocation (if
  // any) no longer applies — the coordinates on save should be treated as
  // manually entered from that point on.
  zmanimLatInput.addEventListener('input', () => { locationIsLiveGPS = false; });
  zmanimLonInput.addEventListener('input', () => { locationIsLiveGPS = false; });

  useMyLocationBtn.addEventListener('click', () => {
    const S = STRINGS[AppState.lang];
    if (!navigator.geolocation){
      zmanimStatus.textContent = S.geoUnsupported;
      return;
    }
    zmanimStatus.textContent = '...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        zmanimLatInput.value = pos.coords.latitude.toFixed(4);
        zmanimLonInput.value = pos.coords.longitude.toFixed(4);
        locationIsLiveGPS = true;
        zmanimStatus.textContent = '';
      },
      () => { zmanimStatus.textContent = S.geoError; }
    );
  });

  zmanimSaveBtn.addEventListener('click', async () => {
    const lat = parseFloat(zmanimLatInput.value);
    const lon = parseFloat(zmanimLonInput.value);
    const alotMin = parseFloat(zmanimAlotInput.value);
    const tzeitMin = parseFloat(zmanimTzeitInput.value);
    const candleMin = parseFloat(zmanimCandleInput.value);
    if (isNaN(lat) || isNaN(lon)) return;

    const fromGPS = locationIsLiveGPS;
    zmanimStatus.textContent = '...';
    const [tz, place] = await Promise.all([
      lookupTimezone(lat, lon),
      lookupPlaceName(lat, lon, fromGPS)
    ]);

    zmanimSettings = {
      lat, lon,
      timezone: tz,
      label: place ? place.label : '',
      labelSource: place ? place.source : null,
      alotMin: isNaN(alotMin) ? DEFAULT_ZMANIM_SETTINGS.alotMin : alotMin,
      tzeitMin: isNaN(tzeitMin) ? DEFAULT_ZMANIM_SETTINGS.tzeitMin : tzeitMin,
      candleMin: isNaN(candleMin) ? DEFAULT_ZMANIM_SETTINGS.candleMin : candleMin
    };
    saveZmanimSettings(zmanimSettings);
    zmanimStatus.textContent = '';
    closeLocationForm();
    renderZmanimSection(AppState.selectedDate);
  });

  dayPrevBtn.addEventListener('click', () => { AppState.selectedDate = addDays(AppState.selectedDate, -1); renderDayView(); });
  dayTodayBtn.addEventListener('click', () => { AppState.selectedDate = new Date(AppState.today); renderDayView(); });
  dayNextBtn.addEventListener('click', () => { AppState.selectedDate = addDays(AppState.selectedDate, 1); renderDayView(); });
  dayNoteInput.addEventListener('blur', () => {
    if (AppState.currentDayKey) saveNoteFor(AppState.currentDayKey, dayNoteInput.value, AppState.lang, saveNote);
  });

  // Exposed for app.js to call.
  window.renderDayView = renderDayView;
  window.initDayView = initDayView;
})();
