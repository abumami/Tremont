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
  }
};
