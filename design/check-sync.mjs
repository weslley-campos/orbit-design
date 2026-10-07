// Sync engine checks with a fake backend (the database side is covered by supabase/tests/service.test.mjs).
import assert from 'node:assert/strict';
import { ACCOUNT_PREFIX, createPreferenceSync, createSync } from './js/sync.js';
import { classifyError } from './js/cloud-errors.js';

const memory = (items = {}) => ({ items, getItem: (k) => items[k] ?? null, setItem: (k, v) => { items[k] = v; }, removeItem: (k) => { delete items[k]; } });
function fakeTimers() {
  const queue = new Map();
  let next = 1;
  return {
    setTimeout(fn) { queue.set(next, fn); return next++; },
    clearTimeout(id) { queue.delete(id); },
    async run() { const fns = [...queue.values()]; queue.clear(); for (const fn of fns) await fn(); },
    get size() { return queue.size; },
  };
}
// One cloud per account; `offline` makes every call fail like a dropped connection.
function fakeBackend(cloud = {}) {
  const calls = [];
  let current = null;
  const backend = {
    cloud, calls, offline: false, gate: null,
    as(id) { current = id; return backend; },
    async loadWorkspace() {
      calls.push(['load', current]);
      if (backend.offline) return { error: { code: 'offline' } };
      const row = cloud[current];
      return { data: row ? structuredClone(row) : null };
    },
    async saveWorkspace(document, baseRevision) {
      const owner = current;
      calls.push(['save', owner, baseRevision]);
      if (backend.gate) await backend.gate;
      if (backend.offline) return { error: { code: 'offline' } };
      const row = cloud[owner];
      if ((row?.revision ?? null) !== baseRevision) return { error: { code: 'stale_revision', revision: row?.revision ?? null } };
      cloud[owner] = { document, revision: (row?.revision ?? 0) + 1, generation: row?.generation ?? 'g1', updatedAt: 'now' };
      return { data: { revision: cloud[owner].revision, generation: cloud[owner].generation, updatedAt: 'now' } };
    },
    async replaceWorkspace(document, baseRevision) {
      const row = cloud[current];
      if (row.revision !== baseRevision) return { error: { code: 'stale_revision' } };
      cloud[current] = { document, revision: row.revision + 1, generation: `${row.generation}+`, updatedAt: 'now' };
      return { data: { revision: cloud[current].revision, generation: cloud[current].generation } };
    },
    async getProfile() { return { data: { display_name: 'W', preferences: cloud.prefs ?? {} } }; },
    async savePreferences(p) { cloud.prefs = p; return { data: p }; },
  };
  return backend;
}
const doc = (name, extra = {}) => ({ version: 1, name, ...extra });
const W = { id: 'weslley' };
const M = { id: 'marina' };

// First sign-in without a cloud copy offers a choice; adopting uploads with no base revision.
{
  const backend = fakeBackend().as('weslley');
  const timers = fakeTimers();
  const statuses = [];
  const sync = createSync({ backend, storage: memory(), timers, onStatus: (s) => statuses.push(s) });
  assert.deepEqual(await sync.start(W), { choose: true });
  await sync.adopt(doc('guest draft'));
  assert.deepEqual(backend.calls.at(-1), ['save', 'weslley', null]);
  assert.equal(sync.status(), 'saved');
  assert.equal(backend.cloud.weslley.document.name, 'guest draft');
  sync.edit(doc('edit 1'));
  assert.equal(sync.status(), 'saved', 'edits wait for the debounce');
  await timers.run();
  assert.deepEqual(backend.calls.at(-1), ['save', 'weslley', 1]);
  assert.equal(backend.cloud.weslley.revision, 2);
  assert.ok(statuses.includes('saving'));
}

// R4: offline edits based on revision 7 never replace cloud revision 8 and never report cloud success.
{
  const backend = fakeBackend({ weslley: { document: doc('rev 7'), revision: 7, generation: 'g1' } }).as('weslley');
  const storage = memory();
  const timers = fakeTimers();
  const sync = createSync({ backend, storage, timers });
  await sync.start(W);
  backend.offline = true;
  sync.edit(doc('offline edit'));
  await timers.run();
  assert.equal(sync.status(), 'pending', 'offline saves stay pending');
  assert.equal(timers.size, 1, 'and retry later');
  backend.cloud.weslley = { document: doc('rev 8 from another device'), revision: 8, generation: 'g1' };
  backend.offline = false;
  await timers.run();
  assert.equal(sync.status(), 'conflict');
  assert.equal(backend.cloud.weslley.revision, 8, 'the cloud stays at revision 8');
  assert.equal(backend.cloud.weslley.document.name, 'rev 8 from another device');
  assert.equal(sync.localCopy().name, 'offline edit', 'the local work stays downloadable');
  sync.edit(doc('more'));
  await timers.run();
  assert.equal(backend.calls.filter(([op]) => op === 'save').length, 2, 'no more saves while in conflict');
  // Reloading after the conflict also reports it instead of silently reverting.
  const again = createSync({ backend, storage, timers });
  const opened = await again.start(W);
  assert.equal(again.status(), 'conflict');
  assert.equal(opened.conflict.revision, 8);
  const reloaded = await again.reload();
  assert.equal(reloaded.document.name, 'rev 8 from another device', 'reload takes the cloud copy');
  assert.equal(again.status(), 'saved');
}

// R4: a failed load never uploads anything over an existing account.
{
  const backend = fakeBackend({ weslley: { document: doc('cloud'), revision: 3, generation: 'g1' } }).as('weslley');
  const timers = fakeTimers();
  const sync = createSync({ backend, storage: memory(), timers });
  backend.offline = true;
  const opened = await sync.start(W);
  assert.ok(opened.blocked);
  assert.equal(sync.edit(doc('seed')), false);
  await timers.run();
  assert.equal(backend.calls.filter(([op]) => op === 'save').length, 0);
  assert.equal(backend.cloud.weslley.document.name, 'cloud');
}

// Unsynced edits survive a reload and are saved on top of the same revision.
{
  const backend = fakeBackend({ weslley: { document: doc('cloud'), revision: 3, generation: 'g1' } }).as('weslley');
  const storage = memory();
  const timers = fakeTimers();
  let sync = createSync({ backend, storage, timers });
  await sync.start(W);
  sync.edit(doc('typed before closing the tab'));
  sync = createSync({ backend, storage, timers: fakeTimers() });
  const t2 = fakeTimers();
  sync = createSync({ backend, storage, timers: t2 });
  const opened = await sync.start(W);
  assert.equal(opened.document.name, 'typed before closing the tab');
  await t2.run();
  assert.equal(backend.cloud.weslley.revision, 4);
  assert.equal(backend.cloud.weslley.document.name, 'typed before closing the tab');
}

// R3: switching accounts isolates caches and pending operations.
{
  const backend = fakeBackend({ weslley: { document: doc('weslley'), revision: 1, generation: 'g1' }, marina: { document: doc('marina'), revision: 5, generation: 'm1' } }).as('weslley');
  const storage = memory({ 'orbit.design.workspace': JSON.stringify(doc('guest')) });
  const timers = fakeTimers();
  const sync = createSync({ backend, storage, timers });
  await sync.start(W);
  sync.edit(doc('weslley pending'));
  let release;
  backend.gate = new Promise((resolve) => { release = resolve; });
  const saving = timers.run();
  sync.stop();
  assert.ok(storage.items[`${ACCOUNT_PREFIX}weslley`], 'his unsynced edit stays cached for him');
  backend.as('marina');
  backend.gate = null;
  const opened = await sync.start(M);
  release();
  await saving;
  assert.equal(opened.document.name, 'marina', 'only Marina’s data loads');
  assert.equal(sync.status(), 'saved', 'his late response does not touch her status');
  sync.edit(doc('marina edit'));
  await timers.run();
  assert.equal(backend.cloud.marina.document.name, 'marina edit', 'subsequent saves go to Marina');
  assert.equal(backend.cloud.marina.revision, 6);
  assert.equal(JSON.parse(storage.items[`${ACCOUNT_PREFIX}weslley`]).document.includes('weslley pending'), true);
  assert.equal(JSON.parse(storage.items['orbit.design.workspace']).name, 'guest', 'the guest draft is untouched');
}

// Replace (Reset / Import) needs a synced copy and updates revision and generation.
{
  const backend = fakeBackend({ weslley: { document: doc('cloud'), revision: 2, generation: 'g1' } }).as('weslley');
  const timers = fakeTimers();
  const sync = createSync({ backend, storage: memory(), timers });
  await sync.start(W);
  sync.edit(doc('unsynced'));
  assert.equal((await sync.replace(doc('seed'), 'reset')).error.code, 'unsynced');
  await timers.run();
  const { data } = await sync.replace(doc('seed'), 'reset');
  assert.equal(data.revision, 4);
  assert.equal(sync.generation(), 'g1+');
}

// Preferences: the account's stored preferences win; an empty profile adopts the browser's.
{
  const backend = fakeBackend({ prefs: { theme: 'dark', panels: { left: true, right: false } } });
  const prefs = createPreferenceSync({ backend, timers: fakeTimers() });
  const { preferences } = await prefs.start({ theme: 'system', panels: { left: true, right: true } });
  assert.deepEqual(preferences, { theme: 'dark', panels: { left: true, right: false } });
  const empty = fakeBackend();
  const timers = fakeTimers();
  await createPreferenceSync({ backend: empty, timers }).start({ theme: 'light', panels: { left: false, right: true } });
  await timers.run();
  assert.deepEqual(empty.cloud.prefs, { theme: 'light', panels: { left: false, right: true } });
}

// Provider errors map to the codes the UI understands.
assert.equal(classifyError({ message: 'TypeError: Failed to fetch', code: '' }).code, 'offline');
assert.deepEqual(classifyError({ message: 'stale_revision', code: 'P0001', details: '8' }), { code: 'stale_revision', message: 'stale_revision', revision: 8 });
assert.equal(classifyError({ message: 'invalid_document: duplicate frame id home in trash', code: 'P0001' }).code, 'invalid_document');
assert.equal(classifyError({ message: 'JWT expired', code: 'PGRST301' }).code, 'session_expired');
assert.equal(classifyError({ message: 'permission denied for function design_save_workspace', code: '42501' }).code, 'not_authenticated');

console.log('design/check-sync.mjs passed');
