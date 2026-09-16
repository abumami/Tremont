// ================= Backup & restore =================
// The app's only persisted data is per-day notes and the zmanim location
// settings — both live in this browser's local storage only, so this is
// the only way to move them between browsers/devices or keep a safety copy.
// Exports/imports a single JSON file the user keeps on their own computer.
//
// NOTE ON LOAD ORDER: this file's top-level code must not touch AppState or
// STRINGS directly (those live in app.js, which loads after this file) —
// only code inside event-listener callbacks may, since those only run long
// after every script has finished loading.

const BACKUP_NOTE_PREFIX = 'note:';
const BACKUP_ZMANIM_KEY = 'zmanim-settings';
const BACKUP_FORMAT_VERSION = 1;

async function buildBackupObject(){
  const noteKeys = await LocalStore.list(BACKUP_NOTE_PREFIX);
  const notes = {};
  for (const k of noteKeys){
    const val = await LocalStore.get(k);
    if (val) notes[k.slice(BACKUP_NOTE_PREFIX.length)] = val;
  }
  const zmanimRaw = await LocalStore.get(BACKUP_ZMANIM_KEY);
  return {
    app: 'kaluach-calendar',
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    notes: notes,
    zmanimSettings: zmanimRaw ? JSON.parse(zmanimRaw) : null
  };
}

function downloadJSON(obj, filename){
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function exportBackup(){
  const data = await buildBackupObject();
  const dateStr = new Date().toISOString().slice(0,10);
  downloadJSON(data, 'kaluach-backup-' + dateStr + '.json');
  return data;
}

function isValidBackup(data){
  // Accepts both the current app id and the old "tremont-calendar" one, so
  // backup files exported before this rename can still be imported.
  return !!(data && typeof data === 'object' &&
    (data.app === 'kaluach-calendar' || data.app === 'tremont-calendar') &&
    data.notes && typeof data.notes === 'object');
}

// Merges a parsed backup into storage: every note in the file overwrites
// the current note for that date; dates not present in the file are left
// untouched. Zmanim settings, if present in the file, replace the current
// ones outright (it's a single object, not a per-day collection).
async function importBackup(data){
  const noteDates = Object.keys(data.notes || {});
  for (const dateKey of noteDates){
    await LocalStore.set(BACKUP_NOTE_PREFIX + dateKey, data.notes[dateKey]);
    delete notesCache[dateKey]; // invalidate the in-memory cache from notes.js
  }
  if (data.zmanimSettings){
    await LocalStore.set(BACKUP_ZMANIM_KEY, JSON.stringify(data.zmanimSettings));
  }
  return { noteCount: noteDates.length, hasZmanim: !!data.zmanimSettings };
}

(function(){
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFileInput = document.getElementById('importFileInput');
  const backupStatus = document.getElementById('backupStatus');
  const exportInfoPanel = document.getElementById('exportInfoPanel');
  const exportInfoText = document.getElementById('exportInfoText');
  const exportConfirmBtn = document.getElementById('exportConfirmBtn');
  const exportCancelBtn = document.getElementById('exportCancelBtn');
  const importInfoPanel = document.getElementById('importInfoPanel');
  const importInfoText = document.getElementById('importInfoText');
  const importChooseFileBtn = document.getElementById('importChooseFileBtn');
  const importInfoCancelBtn = document.getElementById('importInfoCancelBtn');
  const importPreview = document.getElementById('importPreview');
  const importSummary = document.getElementById('importSummary');
  const importConfirmBtn = document.getElementById('importConfirmBtn');
  const importCancelBtn = document.getElementById('importCancelBtn');

  let pendingImportData = null;

  function setStatus(text){
    backupStatus.textContent = text;
    setTimeout(() => { backupStatus.textContent = ''; }, 2500);
  }

  function hideAllBackupPanels(){
    exportInfoPanel.classList.add('hidden');
    importInfoPanel.classList.add('hidden');
    importPreview.classList.add('hidden');
  }

  exportBtn.addEventListener('click', () => {
    hideAllBackupPanels();
    exportInfoPanel.classList.remove('hidden');
  });
  exportCancelBtn.addEventListener('click', () => {
    exportInfoPanel.classList.add('hidden');
  });
  exportConfirmBtn.addEventListener('click', async () => {
    await exportBackup();
    exportInfoPanel.classList.add('hidden');
    setStatus(STRINGS[AppState.lang].backupExported);
  });

  importBtn.addEventListener('click', () => {
    hideAllBackupPanels();
    importInfoPanel.classList.remove('hidden');
  });
  importInfoCancelBtn.addEventListener('click', () => {
    importInfoPanel.classList.add('hidden');
  });
  importChooseFileBtn.addEventListener('click', () => {
    importInfoPanel.classList.add('hidden');
    importFileInput.value = '';
    importFileInput.click();
  });

  importFileInput.addEventListener('change', () => {
    const file = importFileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const S = STRINGS[AppState.lang];
      let data;
      try{ data = JSON.parse(reader.result); }
      catch(e){ setStatus(S.backupInvalid); return; }
      if (!isValidBackup(data)){ setStatus(S.backupInvalid); return; }

      pendingImportData = data;
      const noteCount = Object.keys(data.notes || {}).length;
      const dateStr = data.exportedAt ? new Date(data.exportedAt).toLocaleDateString(AppState.lang === 'he' ? 'he-IL' : 'en-US') : '?';
      importSummary.textContent = S.importSummary(noteCount, !!data.zmanimSettings, dateStr);
      importPreview.classList.remove('hidden');
    };
    reader.readAsText(file);
  });

  importConfirmBtn.addEventListener('click', async () => {
    if (!pendingImportData) return;
    await importBackup(pendingImportData);
    pendingImportData = null;
    importPreview.classList.add('hidden');
    setStatus(STRINGS[AppState.lang].backupImported);
    if (typeof initDayView === 'function') initDayView(); // reload zmanim settings from storage
    renderCurrent();
  });

  importCancelBtn.addEventListener('click', () => {
    pendingImportData = null;
    importPreview.classList.add('hidden');
  });

  // Exposed so app.js can (re-)apply translated labels for this UI whenever
  // the month view renders (this UI only appears there).
  window.applyBackupStrings = function(){
    const S = STRINGS[AppState.lang];
    exportBtn.textContent = S.exportBackup;
    importBtn.textContent = S.importBackup;
    exportInfoText.textContent = S.exportInfoText;
    exportConfirmBtn.textContent = S.downloadBackup;
    exportCancelBtn.textContent = S.cancel;
    importInfoText.textContent = S.importInfoText;
    importChooseFileBtn.textContent = S.chooseFile;
    importInfoCancelBtn.textContent = S.cancel;
    importConfirmBtn.textContent = S.importConfirm;
    importCancelBtn.textContent = S.cancel;
  };
})();
