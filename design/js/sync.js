// Cloud saving for a signed-in account, independent of the provider (see cloud.js for the Supabase backend).
// The account copy is cached in this browser under a key per user, with the revision it was based on, so unsynced
// edits survive reloads, offline periods and expired sessions, and never leak into another account.

export const ACCOUNT_PREFIX = 'orbit.design.account.';
const RETRY_MS = [2000, 5000, 15000, 30000, 60000];

// Statuses: loading | saving | saved | pending (offline, will retry) | failed | conflict | blocked (cloud copy not loaded).
export function createSync({ backend, storage, onStatus = () => {}, debounceMs = 800, timers = globalThis }) {
  let user = null;
  let session = 0; // bumps on every start/stop so late responses from a previous account are ignored
  let base = null; // revision the local copy is based on
  let generation = null;
  let doc = null; // latest local document (JSON text)
  let dirty = false;
  let inflight = null;
  let timer = 0;
  let retry = 0;
  let status = 'idle';
  let detail = null;

  const key = () => `${ACCOUNT_PREFIX}${user.id}`;
  const set = (next, info = null) => { status = next; detail = info; onStatus(status, detail); };
  function persist() {
    try {
      storage.setItem(key(), JSON.stringify({ document: doc, revision: base, generation, dirty, at: new Date().toISOString() }));
      return true;
    } catch {
      return false;
    }
  }
  function cached(id) {
    try {
      const value = JSON.parse(storage.getItem(`${ACCOUNT_PREFIX}${id}`));
      return value && typeof value.document === 'string' ? value : null;
    } catch {
      return null;
    }
  }

  function schedule(ms) {
    timers.clearTimeout(timer);
    timer = timers.setTimeout(push, ms);
  }

  async function push() {
    if (!user || !dirty || inflight || status === 'conflict' || status === 'blocked') return;
    const mine = session;
    const sent = doc;
    set('saving');
    inflight = backend.saveWorkspace(JSON.parse(sent), base);
    const { data, error } = await inflight;
    inflight = null;
    if (mine !== session) return;
    if (error) return failed(error);
    retry = 0;
    base = data.revision;
    generation = data.generation;
    dirty = doc !== sent;
    persist();
    if (dirty) schedule(0);
    else set('saved', { revision: base, at: data.updatedAt });
  }

  function failed(error) {
    if (error.code === 'offline') {
      set('pending');
      schedule(RETRY_MS[Math.min(retry++, RETRY_MS.length - 1)]);
    } else if (error.code === 'stale_revision') {
      set('conflict', { cloudRevision: error.revision });
    } else {
      set('failed', { code: error.code, message: error.message });
    }
  }

  return {
    status: () => status,
    detail: () => detail,
    revision: () => base,
    generation: () => generation,
    pending: () => dirty,
    user: () => user,
    // Loads the account copy. Resolves to { document } to open, { choose: true } when the account has no cloud copy
    // yet (adopt or start fresh), or { blocked: true } when nothing could be loaded; then nothing is ever uploaded.
    async start(nextUser) {
      this.stop();
      user = nextUser;
      const mine = ++session;
      set('loading');
      const local = cached(user.id);
      const { data, error } = await backend.loadWorkspace();
      if (mine !== session) return { stale: true };
      if (error) {
        if (local?.dirty && local.revision != null) {
          // Offline with unsynced edits on a known revision: keep editing; the revision check protects the cloud copy.
          ({ document: doc, revision: base, generation } = local);
          dirty = true;
          failed(error.code === 'offline' ? error : { code: 'offline' });
          return { document: JSON.parse(doc), cachedAt: local.at };
        }
        set('blocked', { code: error.code, message: error.message });
        return { blocked: true, error, local: local ? JSON.parse(local.document) : null };
      }
      if (!data) {
        if (local?.dirty && local.revision == null) {
          // An adoption that was never acknowledged: finish it.
          doc = local.document; base = null; dirty = true;
          schedule(0);
          return { document: JSON.parse(doc) };
        }
        set('saved');
        return { choose: true };
      }
      if (local?.dirty && local.revision === data.revision && local.generation === data.generation) {
        ({ document: doc, revision: base, generation } = local);
        dirty = true;
        schedule(0);
        return { document: JSON.parse(doc) };
      }
      if (local?.dirty) {
        // Local edits were made on an older revision: never overwrite the newer cloud copy.
        ({ document: doc, revision: base, generation } = local);
        dirty = true;
        set('conflict', { cloudRevision: data.revision });
        return { document: JSON.parse(doc), conflict: { cloud: data.document, revision: data.revision } };
      }
      doc = JSON.stringify(data.document);
      base = data.revision;
      generation = data.generation;
      dirty = false;
      persist();
      set('saved', { revision: base, at: data.updatedAt });
      return { document: data.document };
    },
    // First cloud copy for an account (adopted guest draft or the seed).
    adopt(document) {
      doc = JSON.stringify(document);
      base = null;
      dirty = true;
      persist();
      return push();
    },
    // Records a local edit; saved after a short pause.
    edit(document) {
      if (!user || status === 'blocked') return false;
      const next = JSON.stringify(document);
      if (next === doc) return true;
      doc = next;
      dirty = true;
      const stored = persist();
      if (status !== 'conflict') schedule(debounceMs);
      return stored;
    },
    retry() {
      if (status === 'conflict' || status === 'blocked') return;
      retry = 0;
      schedule(0);
    },
    flush: () => push(),
    // Reset or replacing Import: the cloud keeps the prior copy and starts a new review generation.
    async replace(document, reason) {
      if (dirty || inflight) return { error: { code: 'unsynced', message: 'Wait until your changes are saved to the cloud.' } };
      const mine = session;
      set('saving');
      const { data, error } = await backend.replaceWorkspace(document, base, reason);
      if (mine !== session) return { error: { code: 'stale_session' } };
      if (error) { failed(error); return { error }; }
      doc = JSON.stringify(document);
      base = data.revision;
      generation = data.generation;
      dirty = false;
      persist();
      set('saved', { revision: base, at: data.updatedAt });
      return { data };
    },
    // Drops local edits and opens the cloud copy (after a conflict or a failed load).
    async reload() {
      const id = user;
      try { storage.removeItem(`${ACCOUNT_PREFIX}${id.id}`); } catch { /* nothing cached */ }
      dirty = false;
      return this.start(id);
    },
    localCopy: () => (doc ? JSON.parse(doc) : null),
    // Sign-out or account switch. Unsynced edits stay cached for that account only; a clean cache is removed.
    stop() {
      timers.clearTimeout(timer);
      session += 1;
      if (user && !dirty) { try { storage.removeItem(key()); } catch { /* ignore */ } }
      user = null; base = null; generation = null; doc = null; dirty = false; inflight = null; retry = 0;
      set('idle');
    },
  };
}

// Keeps profile preferences (workspace theme, panel visibility) in step with the account, separately from the document.
export function createPreferenceSync({ backend, debounceMs = 600, timers = globalThis }) {
  let timer = 0;
  let active = false;
  return {
    async start(local) {
      active = true;
      const { data, error } = await backend.getProfile();
      if (error || !active) return { error };
      const stored = data?.preferences ?? {};
      if (!stored.theme && !stored.panels) this.save(local);
      return { profile: data, preferences: { ...local, ...stored } };
    },
    save(preferences) {
      if (!active) return;
      timers.clearTimeout(timer);
      timer = timers.setTimeout(() => backend.savePreferences(preferences), debounceMs);
    },
    stop() { active = false; timers.clearTimeout(timer); },
  };
}
