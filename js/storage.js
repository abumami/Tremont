// ================= Storage abstraction =================
// Prefers the Claude Artifacts persistence API (window.storage) when
// available, but this project is meant to be downloaded and opened as a
// plain local site — where window.storage does not exist — so it falls
// back to the browser's own localStorage, which is what actually persists
// data across reloads for a file:// or self-hosted page.
const LocalStore = {
  async get(key){
    if (window.storage && typeof window.storage.get === 'function'){
      try{
        const res = await window.storage.get(key);
        return res ? res.value : null;
      }catch(e){ /* fall through to localStorage */ }
    }
    try{ return localStorage.getItem(key); }
    catch(e){ return null; }
  },
  async set(key, value){
    if (window.storage && typeof window.storage.set === 'function'){
      try{ await window.storage.set(key, value); return; }
      catch(e){ /* fall through to localStorage */ }
    }
    try{ localStorage.setItem(key, value); }
    catch(e){ /* storage unavailable (private browsing, quota, etc.) */ }
  },
  async delete(key){
    if (window.storage && typeof window.storage.delete === 'function'){
      try{ await window.storage.delete(key); return; }
      catch(e){ /* fall through to localStorage */ }
    }
    try{ localStorage.removeItem(key); }
    catch(e){ /* ignore */ }
  },
  // Lists keys starting with `prefix` (or all keys if omitted). Needed for
  // backup/export, since notes are stored one-per-day under 'note:<date>'
  // with no central index of which dates exist.
  async list(prefix){
    if (window.storage && typeof window.storage.list === 'function'){
      try{
        const res = await window.storage.list(prefix);
        return res ? res.keys : [];
      }catch(e){ /* fall through to localStorage */ }
    }
    try{
      const keys = [];
      for (let i=0; i<localStorage.length; i++){
        const k = localStorage.key(i);
        if (!prefix || (k && k.startsWith(prefix))) keys.push(k);
      }
      return keys;
    }catch(e){ return []; }
  }
};
