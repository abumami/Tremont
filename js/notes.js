// ================= Notes storage =================
// Persists per-day free-text notes via the artifact storage API.
const notesCache = {};

async function loadNote(key){
  if (key in notesCache) return notesCache[key];
  try{
    const res = await window.storage.get('note:' + key);
    notesCache[key] = res ? res.value : '';
  }catch(e){ notesCache[key] = ''; }
  return notesCache[key];
}

async function saveNoteFor(key, value, lang, saveNoteEl){
  notesCache[key] = value;
  const S = STRINGS[lang];
  try{
    if (value && value.trim().length) await window.storage.set('note:' + key, value);
    else await window.storage.delete('note:' + key);
    saveNoteEl.textContent = S.saved;
    setTimeout(()=>{ saveNoteEl.textContent=''; }, 1200);
  }catch(e){
    saveNoteEl.textContent = S.couldNotSave;
    setTimeout(()=>{ saveNoteEl.textContent=''; }, 1500);
  }
}
