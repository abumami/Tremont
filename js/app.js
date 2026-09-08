// ================= App: shared state + orchestration =================
// Owns the state and DOM elements shared by both views (header title, the
// language/Israel-Diaspora/Day-View toggles, the notes-save indicator), the
// helpers both views use to build holiday/parsha/Omer tags, and the logic
// that switches between the two views. The views themselves live in
// js/month-view.js and js/day-view.js, each exposing a render function
// (window.renderMonthView / window.renderDayView) that this file calls.

const civilTitle = document.getElementById('civilTitle');
const hebrewTitle = document.getElementById('hebrewTitle');
const saveNote = document.getElementById('saveNote');
const langBtn = document.getElementById('langBtn');
const locBtn = document.getElementById('locBtn');
const dayViewBtn = document.getElementById('dayViewBtn');
const monthView = document.getElementById('monthView');
const dayView = document.getElementById('dayView');
const monthNav = document.getElementById('monthNav');
const dayNav = document.getElementById('dayNav');
const legendWrap = document.getElementById('legendWrap');

// Shared, mutable state both view files read from and write to.
const AppState = (function(){
  function computeToday(){
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }
  const state = {
    lang: 'en',
    israel: false,
    currentView: 'month',
    selectedDate: computeToday(),
    currentDayKey: null
  };
  // `today` is a live getter, not a cached value — recomputed on every read
  // so it can't go stale if the tab is left open across midnight (a plain
  // cached Date here previously meant "Today" would keep pointing at
  // whatever day it was when the page first loaded).
  Object.defineProperty(state, 'today', { get: computeToday });
  return state;
})();

function applySharedStrings(){
  const S = STRINGS[AppState.lang];
  langBtn.textContent = S.langToggle;
  locBtn.textContent = AppState.israel ? S.locDiaspora : S.locIsrael;
  dayViewBtn.textContent = AppState.currentView === 'day' ? S.backToMonth : S.dayViewBtn;
}

// Builds the holiday/parsha/Omer tags for a single day — shared by both
// views. chanukahMap/omerMap are precomputed span-maps (hebrew-dates.js) so
// callers looping over many days only pay the anchor-search cost once.
function tagsForDay(d, chanukahMap, omerMap){
  const lang = AppState.lang, israel = AppState.israel;
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
    el.dir = AppState.lang === 'he' ? 'rtl' : 'ltr';
    el.textContent = t.text;
    container.appendChild(el);
  });
}

function showMonthView(){
  AppState.currentView = 'month';
  dayView.classList.add('hidden');
  monthView.classList.remove('hidden');
  legendWrap.classList.remove('hidden');
  monthNav.classList.remove('hidden');
  dayNav.classList.add('hidden');
  renderMonthView();
}

function showDayView(){
  AppState.currentView = 'day';
  monthView.classList.add('hidden');
  legendWrap.classList.add('hidden');
  monthNav.classList.add('hidden');
  dayNav.classList.remove('hidden');
  dayView.classList.remove('hidden');
  renderDayView();
}

function renderCurrent(){
  if (AppState.currentView === 'day') renderDayView();
  else renderMonthView();
}

langBtn.addEventListener('click', () => { AppState.lang = AppState.lang === 'en' ? 'he' : 'en'; renderCurrent(); });
locBtn.addEventListener('click', () => { AppState.israel = !AppState.israel; renderCurrent(); });
dayViewBtn.addEventListener('click', () => {
  if (AppState.currentView === 'day') showMonthView();
  else showDayView();
});

initDayView();
renderMonthView();
