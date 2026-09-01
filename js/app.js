// ================= App: state, rendering, event wiring =================
(function(){
  const grid = document.getElementById('grid');
  const civilTitle = document.getElementById('civilTitle');
  const hebrewTitle = document.getElementById('hebrewTitle');
  const saveNote = document.getElementById('saveNote');
  const weekdaysEl = document.getElementById('weekdays');
  const langBtn = document.getElementById('langBtn');
  const todayBtn = document.getElementById('todayBtn');
  const locBtn = document.getElementById('locBtn');

  const today = new Date();
  today.setHours(0,0,0,0);
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let lang = 'en';
  let israel = false;

  function applyStaticStrings(){
    const S = STRINGS[lang];
    todayBtn.textContent = S.today;
    langBtn.textContent = S.langToggle;
    locBtn.textContent = israel ? S.locDiaspora : S.locIsrael;
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

      if (omerMap[key]){
        const om = document.createElement('div');
        om.className = 'omer-tag';
        om.dir = lang === 'he' ? 'rtl' : 'ltr';
        om.textContent = STRINGS[lang].omer(omerMap[key]);
        body.appendChild(om);
      }

      if (chanukahMap[key]){
        const tag = document.createElement('div');
        tag.className = 'holiday-tag';
        tag.dir = lang === 'he' ? 'rtl' : 'ltr';
        tag.textContent = lang === 'he' ? ('חנוכה, נר ' + chanukahMap[key]) : ('Chanukah (day ' + chanukahMap[key] + ')');
        body.appendChild(tag);
      } else {
        const hLabel = holidayFor(d, israel, lang);
        if (hLabel){
          const tag = document.createElement('div');
          tag.className = 'holiday-tag';
          tag.dir = lang === 'he' ? 'rtl' : 'ltr';
          tag.textContent = hLabel;
          body.appendChild(tag);
        }
      }

      if (isShabbat){
        const p = computeParsha(d, israel);
        if (p){
          const names = p.indices.map(idx => lang === 'he' ? PARSHA_HE[idx] : PARSHA_EN[idx]);
          const tag = document.createElement('div');
          tag.className = 'parsha-tag';
          tag.dir = lang === 'he' ? 'rtl' : 'ltr';
          tag.textContent = STRINGS[lang].parshatPrefix + names.join(lang === 'he' ? '\u2013' : '-');
          body.appendChild(tag);
        }
      }

      const noteDisplay = document.createElement('div');
      noteDisplay.className = 'note-text';
      body.appendChild(noteDisplay);
      loadNote(key).then(val => { noteDisplay.textContent = val || ''; });

      cell.appendChild(body);

      cell.addEventListener('click', () => {
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
  langBtn.addEventListener('click', () => { lang = lang === 'en' ? 'he' : 'en'; render(); });
  locBtn.addEventListener('click', () => { israel = !israel; render(); });

  render();
})();
