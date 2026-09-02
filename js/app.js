// ================= App: state, rendering, event wiring =================
(function(){
  const grid = document.getElementById('grid');
  const monthView = document.getElementById('monthView');
  const civilTitle = document.getElementById('civilTitle');
  const hebrewTitle = document.getElementById('hebrewTitle');
  const saveNote = document.getElementById('saveNote');
  const weekdaysEl = document.getElementById('weekdays');
  const langBtn = document.getElementById('langBtn');
  const todayBtn = document.getElementById('todayBtn');
  const locBtn = document.getElementById('locBtn');
  const monthNav = document.getElementById('monthNav');
  const legendWrap = document.getElementById('legendWrap');
  legendWrap.classList.add('hidden');


  const dayViewBtn = document.getElementById('dayViewBtn');
  const dayView = document.getElementById('dayView');
  const backToMonthBtn = document.getElementById('backToMonthBtn');
  const dayPrevBtn = document.getElementById('dayPrevBtn');
  const dayTodayBtn = document.getElementById('dayTodayBtn');
  const dayNextBtn = document.getElementById('dayNextBtn');
  // (dayCivil/dayHebrew were removed — the day view now reuses the shared
  // civilTitle/hebrewTitle header elements instead of duplicating them.)
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
  loadZmanimSettings().then(s => {
    zmanimSettings = s;
    if (currentView === 'day') renderDayView();
  });

  const today = new Date();
  today.setHours(0,0,0,0);
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let lang = 'en';
  let israel = false;
  let currentView = 'month';
  let selectedDate = new Date(today);
  let currentDayKey = null;

  function applyStaticStrings(){
    const S = STRINGS[lang];
    todayBtn.textContent = S.today;
    langBtn.textContent = S.langToggle;
    locBtn.textContent = israel ? S.locDiaspora : S.locIsrael;
    dayViewBtn.textContent = S.dayViewBtn;
    backToMonthBtn.textContent = S.backToMonth;
    dayPrevBtn.textContent = S.prevDay;
    dayTodayBtn.textContent = S.today;
    dayNextBtn.textContent = S.nextDay;
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
    document.getElementById('legendCivil').textContent = S.legendCivil;
    document.getElementById('legendHebrew').textContent = S.legendHebrew;
    document.getElementById('legendParsha').textContent = S.legendParsha;
    document.getElementById('legendHoliday').textContent = S.legendHoliday;

    weekdaysEl.innerHTML = '';
    const names = lang === 'he' ? WEEKDAYS_HE : WEEKDAYS_EN;
    names.forEach(n => {
      const div = document.createElement('div');
      div.textContent = n;
      weekdaysEl.appendChild(div);
    });
  }

  // Builds the holiday/parsha/omer tags for a single day. chanukahMap and
  // omerMap are precomputed span-maps (see hebrew-dates.js) so callers that
  // loop over many days only pay the anchor-search cost once.
  function tagsForDay(d, chanukahMap, omerMap){
    const key = isoKey(d);
    const tags = [];
    if (omerMap[key]){
      tags.push({ cls: 'omer-tag', text: STRINGS[lang].omer(omerMap[key]) });
    }
    if (chanukahMap[key]){
      tags.push({ cls: 'holiday-tag', text: lang === 'he' ? ('חנוכה, נר ' + chanukahMap[key]) : ('Chanukah (day ' + chanukahMap[key] + ')') });
    } else {
      const hLabel = holidayFor(d, israel, lang);
      if (hLabel) tags.push({ cls: 'holiday-tag', text: hLabel });
    }
    if (d.getDay() === 6){
      const p = computeParsha(d, israel);
      if (p){
        const names = p.indices.map(idx => lang === 'he' ? PARSHA_HE[idx] : PARSHA_EN[idx]);
        tags.push({ cls: 'parsha-tag', text: STRINGS[lang].parshatPrefix + names.join(lang === 'he' ? '\u2013' : '-') });
      }
    }
    return tags;
  }

  function appendTags(container, tagList){
    tagList.forEach(t => {
      const el = document.createElement('div');
      el.className = t.cls;
      el.dir = lang === 'he' ? 'rtl' : 'ltr';
      el.textContent = t.text;
      container.appendChild(el);
    });
  }

  function render(){
    applyStaticStrings();
    grid.innerHTML = '';

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const lastOfMonth = new Date(viewYear, viewMonth+1, 0);
    const startDow = firstOfMonth.getDay();
    const totalDaysShown = Math.ceil((startDow + lastOfMonth.getDate()) / 7) * 7;
    const gridStart = addDays(firstOfMonth, -startDow);

    civilTitle.textContent = (lang === 'he' ? MONTH_NAMES_HE[viewMonth] : MONTH_NAMES_EN[viewMonth]) + ' ' + viewYear;
    civilTitle.dir = lang === 'he' ? 'rtl' : 'ltr';

    const hStart = hebrewPartsDisplay(firstOfMonth, lang);
    const hEnd = hebrewPartsDisplay(lastOfMonth, lang);
    if (hStart.month === hEnd.month && hStart.year === hEnd.year){
      hebrewTitle.textContent = hStart.month + ' ' + hStart.year;
    } else if (hStart.year === hEnd.year){
      hebrewTitle.textContent = hStart.month + ' \u2013 ' + hEnd.month + ' ' + hEnd.year;
    } else {
      hebrewTitle.textContent = hStart.month + ' ' + hStart.year + ' \u2013 ' + hEnd.month + ' ' + hEnd.year;
    }
    hebrewTitle.dir = lang === 'he' ? 'rtl' : 'ltr';

    const chanukahMap = buildSpanMap('Kislev', 25, 8, firstOfMonth);
    const omerMap = buildSpanMap('Nisan', 16, 49, firstOfMonth);

    for (let i=0; i<totalDaysShown; i++){
      const d = addDays(gridStart, i);
      const key = isoKey(d);
      const isPad = d.getMonth() !== viewMonth;
      const isToday = d.getTime() === today.getTime();
      const isShabbat = d.getDay() === 6;

      const cell = document.createElement('div');
      cell.className = 'cell' + (isPad ? ' pad' : '') + (isToday ? ' today' : '') + (isShabbat ? ' shabbat' : '');

      const head = document.createElement('div');
      head.className = 'cell-head';

      const civilNum = document.createElement('div');
      civilNum.className = 'civil-num';
      civilNum.textContent = d.getDate();

      const hp = hebrewPartsDisplay(d, lang);
      const hebrewNum = document.createElement('div');
      hebrewNum.className = 'hebrew-num';
      hebrewNum.dir = lang === 'he' ? 'rtl' : 'ltr';
      hebrewNum.textContent = hp.day + ' ' + hp.month;

      head.appendChild(civilNum);
      head.appendChild(hebrewNum);
      cell.appendChild(head);

      const body = document.createElement('div');
      body.className = 'cell-body';
      appendTags(body, tagsForDay(d, chanukahMap, omerMap));

      const noteDisplay = document.createElement('div');
      noteDisplay.className = 'note-text';
      body.appendChild(noteDisplay);
      loadNote(key).then(val => { noteDisplay.textContent = val || ''; });

      cell.appendChild(body);

      cell.addEventListener('click', () => {
        selectedDate = new Date(d);
        if (cell.querySelector('textarea')) return;
        const textarea = document.createElement('textarea');
        textarea.className = 'note-input';
        textarea.value = notesCache[key] || '';
        textarea.placeholder = STRINGS[lang].addNote;
        noteDisplay.replaceWith(textarea);
        textarea.focus();
        const finish = () => {
          const val = textarea.value;
          saveNoteFor(key, val, lang, saveNote);
          const nd = document.createElement('div');
          nd.className = 'note-text';
          nd.textContent = val;
          textarea.replaceWith(nd);
        };
        textarea.addEventListener('blur', finish);
        textarea.addEventListener('keydown', (e) => { if (e.key === 'Escape') textarea.blur(); });
        textarea.addEventListener('click', (e) => e.stopPropagation());
      });

      grid.appendChild(cell);
    }
  }

  function renderDayView(){
    applyStaticStrings();
    const d = selectedDate;

    civilTitle.textContent = (lang === 'he' ? MONTH_NAMES_HE[d.getMonth()] : MONTH_NAMES_EN[d.getMonth()]) + ' ' + d.getDate() + ', ' + d.getFullYear();
    civilTitle.dir = lang === 'he' ? 'rtl' : 'ltr';

    const hp = hebrewPartsDisplay(d, lang);
    hebrewTitle.textContent = hp.day + ' ' + hp.month + ' ' + hp.year;
    hebrewTitle.dir = lang === 'he' ? 'rtl' : 'ltr';

    const chanukahMap = buildSpanMap('Kislev', 25, 8, d);
    const omerMap = buildSpanMap('Nisan', 16, 49, d);
    dayTags.innerHTML = '';
    appendTags(dayTags, tagsForDay(d, chanukahMap, omerMap));

    currentDayKey = isoKey(d);
    dayNoteInput.value = '';
    loadNote(currentDayKey).then(val => { dayNoteInput.value = val || ''; });

    renderZmanimSection(d);
  }

  function hasLocation(){
    return typeof zmanimSettings.lat === 'number' && typeof zmanimSettings.lon === 'number';
  }

  function renderZmanimLocationLabel(){
    const S = STRINGS[lang];
    zmanimLocationLabel.textContent = hasLocation()
      ? S.locationSetTo(zmanimSettings.lat.toFixed(3), zmanimSettings.lon.toFixed(3))
      : S.locationNotSet;
  }

  function renderZmanimSection(d){
    const S = STRINGS[lang];
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
      time.textContent = formatTime(z.time, lang);

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

  useMyLocationBtn.addEventListener('click', () => {
    const S = STRINGS[lang];
    if (!navigator.geolocation){
      zmanimStatus.textContent = S.geoUnsupported;
      return;
    }
    zmanimStatus.textContent = '...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        zmanimLatInput.value = pos.coords.latitude.toFixed(4);
        zmanimLonInput.value = pos.coords.longitude.toFixed(4);
        zmanimStatus.textContent = '';
      },
      () => { zmanimStatus.textContent = S.geoError; }
    );
  });

  zmanimSaveBtn.addEventListener('click', () => {
    const lat = parseFloat(zmanimLatInput.value);
    const lon = parseFloat(zmanimLonInput.value);
    const alotMin = parseFloat(zmanimAlotInput.value);
    const tzeitMin = parseFloat(zmanimTzeitInput.value);
    const candleMin = parseFloat(zmanimCandleInput.value);
    if (isNaN(lat) || isNaN(lon)) return;
    zmanimSettings = {
      lat, lon,
      alotMin: isNaN(alotMin) ? DEFAULT_ZMANIM_SETTINGS.alotMin : alotMin,
      tzeitMin: isNaN(tzeitMin) ? DEFAULT_ZMANIM_SETTINGS.tzeitMin : tzeitMin,
      candleMin: isNaN(candleMin) ? DEFAULT_ZMANIM_SETTINGS.candleMin : candleMin
    };
    saveZmanimSettings(zmanimSettings);
    closeLocationForm();
    renderZmanimSection(selectedDate);
  });

  function showMonthView(){
    currentView = 'month';
    dayView.classList.add('hidden');
    monthView.classList.remove('hidden');
//    legendWrap.classList.remove('hidden');
    monthNav.classList.remove('hidden');
    render();
  }

  function showDayView(){
    currentView = 'day';
    monthView.classList.add('hidden');
//    legendWrap.classList.add('hidden');
    monthNav.classList.add('hidden');
    dayView.classList.remove('hidden');
    renderDayView();
  }

  function renderCurrent(){
    if (currentView === 'day') renderDayView();
    else render();
  }

  document.getElementById('prevBtn').addEventListener('click', () => {
    viewMonth -= 1;
    if (viewMonth < 0){ viewMonth = 11; viewYear -= 1; }
    render();
  });
  document.getElementById('nextBtn').addEventListener('click', () => {
    viewMonth += 1;
    if (viewMonth > 11){ viewMonth = 0; viewYear += 1; }
    render();
  });
  todayBtn.addEventListener('click', () => {
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    render();
  });
  langBtn.addEventListener('click', () => { lang = lang === 'en' ? 'he' : 'en'; renderCurrent(); });
  locBtn.addEventListener('click', () => { israel = !israel; renderCurrent(); });

  dayViewBtn.addEventListener('click', showDayView);
  backToMonthBtn.addEventListener('click', showMonthView);
  dayPrevBtn.addEventListener('click', () => { selectedDate = addDays(selectedDate, -1); renderDayView(); });
  dayTodayBtn.addEventListener('click', () => { selectedDate = new Date(today); renderDayView(); });
  dayNextBtn.addEventListener('click', () => { selectedDate = addDays(selectedDate, 1); renderDayView(); });
  dayNoteInput.addEventListener('blur', () => {
    if (currentDayKey) saveNoteFor(currentDayKey, dayNoteInput.value, lang, saveNote);
  });

  render();
})();
