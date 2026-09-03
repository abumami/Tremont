// ================= Notes storage =================
// Persists per-day free-text notes (see js/storage.js for where they're saved).
const notesCache = {};

async function loadNote(key){
  if (key in notesCache) return notesCache[key];
  const val = await LocalStore.get('note:' + key);
  notesCache[key] = val || '';
  return notesCache[key];
}

async function saveNoteFor(key, value, lang, saveNoteEl){
  notesCache[key] = value;
  const S = STRINGS[lang];
  try{
    if (value && value.trim().length) await LocalStore.set('note:' + key, value);
    else await LocalStore.delete('note:' + key);
    saveNoteEl.textContent = S.saved;
    setTimeout(()=>{ saveNoteEl.textContent=''; }, 1200);
  }catch(e){
    saveNoteEl.textContent = S.couldNotSave;
    setTimeout(()=>{ saveNoteEl.textContent=''; }, 1500);
  }
}
