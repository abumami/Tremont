// ================= Month view =================
// Everything specific to the month grid. Reads shared state (language,
// Israel/Diaspora, today, selected date) from AppState (defined in app.js)
// and is invoked by app.js — this file never decides which view is showing.

(function(){
  // --- Internal config (not exposed as a UI control) ---
  // Set to false to hide the color-key legend under the month grid entirely.
  const SHOW_LEGEND = false;

  const grid = document.getElementById('grid');
  const weekdaysEl = document.getElementById('weekdays');
  const prevBtn = document.getElementById('prevBtn');
  const todayBtn = document.getElementById('todayBtn');
  const nextBtn = document.getElementById('nextBtn');
  const legendItems = document.getElementById('legendItems');

  legendItems.style.display = SHOW_LEGEND ? 'contents' : 'none';

  let viewYear = new Date().getFullYear();
  let viewMonth = new Date().getMonth();

  function applyMonthStrings(){
    const S = STRINGS[AppState.lang];
    todayBtn.textContent = S.today;
    document.getElementById('legendCivil').textContent = S.legendCivil;
    document.getElementById('legendHebrew').textContent = S.legendHebrew;
    document.getElementById('legendParsha').textContent = S.legendParsha;
    document.getElementById('legendHoliday').textContent = S.legendHoliday;

    weekdaysEl.innerHTML = '';
    const names = AppState.lang === 'he' ? WEEKDAYS_HE : WEEKDAYS_EN;
    names.forEach(n => {
      const div = document.createElement('div');
      div.textContent = n;
      weekdaysEl.appendChild(div);
    });
  }

  function renderMonthView(){
    applySharedStrings();
    applyMonthStrings();
    grid.innerHTML = '';

    const lang = AppState.lang, israel = AppState.israel, today = AppState.today;

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
        AppState.selectedDate = new Date(d);
        if (cell.querySelector('textarea')) return;
        const textarea = document.createElement('textarea');
        textarea.className = 'note-input';
        textarea.value = notesCache[key] || '';
        textarea.placeholder = STRINGS[AppState.lang].addNote;
        noteDisplay.replaceWith(textarea);
        textarea.focus();
        const finish = () => {
          const val = textarea.value;
          saveNoteFor(key, val, AppState.lang, saveNote);
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

  prevBtn.addEventListener('click', () => {
    viewMonth -= 1;
    if (viewMonth < 0){ viewMonth = 11; viewYear -= 1; }
    renderMonthView();
  });
  nextBtn.addEventListener('click', () => {
    viewMonth += 1;
    if (viewMonth > 11){ viewMonth = 0; viewYear += 1; }
    renderMonthView();
  });
  todayBtn.addEventListener('click', () => {
    viewYear = AppState.today.getFullYear();
    viewMonth = AppState.today.getMonth();
    renderMonthView();
  });

  // Exposed for app.js to call.
  window.renderMonthView = renderMonthView;
})();
