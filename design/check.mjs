import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  STORAGE_KEY, loadWorkspace, mergeSeed, moveFrameToPage, moveShelfItem, normalize, parseWorkspace, removeFrame, removePage, restoreFrame, saveDraft, setOverride, shelveFrame,
  pendingMerge, uniqueId, validateWorkspace,
} from './js/store.js';

const root = dirname(fileURLToPath(import.meta.url));
const tokens = {
  palettes: ['flamingo'],
  modes: ['light'],
  invariant: { 'spacing.medium': { kind: 'dimension', css: '20px' } },
  themed: { 'flamingo/light': { 'colors.text.primary': { kind: 'color', css: '#1A1A1A' } } },
};
const frame = (id, catalogId) => ({ id, catalogId, x: 0, y: 0, width: 100, height: 200 });
const doc = () => ({
  version: 1,
  settings: { palette: 'flamingo', mode: 'light', language: 'en' },
  selectedPageId: 'p1',
  startFrameId: 'f1',
  pages: [
    { id: 'p1', name: 'One', view: { x: 0, y: 0, zoom: 1 }, frames: [frame('f1', 'screens/a'), frame('f2', 'screens/b')] },
    { id: 'p2', name: 'Two', view: { x: 0, y: 0, zoom: 1 }, frames: [frame('f3', 'screens/a')] },
  ],
  connections: [
    { id: 'c1', from: { frameId: 'f1', hotspotId: 'go' }, to: { frameId: 'f2' }, trigger: 'click' },
    { id: 'c2', from: { frameId: 'f3', hotspotId: null }, to: { frameId: 'f1' }, trigger: 'click' },
  ],
  overrides: {
    tokens: { 'flamingo/light': { 'colors.text.primary': '#123456' }, invariant: { 'spacing.medium': '21dp' } },
    frames: { f1: { go: { text: { en: 'Hi' }, props: { variant: 'Primary' }, bindings: { color: { token: 'colors.text.primary' } } } } },
  },
});
const context = { catalogIds: new Set(['screens/a', 'screens/b']), hotspotIds: (id) => (id === 'screens/a' ? new Set(['go']) : null), tokens };
const errorsOf = (change) => {
  const data = doc();
  change(data);
  return validateWorkspace(data, context);
};
const rejects = (name, change, pattern) => {
  const errors = errorsOf(change);
  assert.ok(errors.some((error) => pattern.test(error)), `${name}: expected ${pattern}, got ${JSON.stringify(errors)}`);
};

assert.deepEqual(validateWorkspace(doc(), context), [], 'a valid document is accepted');
assert.deepEqual(errorsOf((d) => { d.settings.device = 'android'; }), [], 'a known device is accepted');
rejects('device', (d) => { d.settings.device = 'windows'; }, /settings.device/);
rejects('version', (d) => { d.version = 999; }, /Unsupported version/);
rejects('duplicate frame', (d) => { d.pages[1].frames[0].id = 'f1'; }, /Duplicate frame id f1/);
rejects('duplicate page', (d) => { d.pages[1].id = 'p1'; }, /Duplicate page id/);
rejects('duplicate connection', (d) => { d.connections[1].id = 'c1'; }, /Duplicate connection id/);
rejects('missing frame', (d) => { d.connections[0].to.frameId = 'nope'; }, /missing frame nope/);
rejects('missing hotspot', (d) => { d.connections[0].from.hotspotId = 'nope'; }, /missing hotspot nope/);
rejects('missing start', (d) => { d.startFrameId = 'nope'; }, /startFrameId/);
rejects('missing page', (d) => { d.selectedPageId = 'nope'; }, /selectedPageId/);
rejects('unknown catalog id', (d) => { d.pages[0].frames[0].catalogId = 'screens/zzz'; }, /unknown catalog id/);
rejects('token override', (d) => { d.overrides.tokens['flamingo/light']['colors.text.primary'] = 'red'; }, /Token override/);
rejects('token scope', (d) => { d.overrides.tokens['plum/dark'] = {}; }, /Unknown token scope/);
rejects('override frame', (d) => { d.overrides.frames.ghost = {}; }, /unknown frame ghost/);
rejects('override text', (d) => { d.overrides.frames.f1.go.text.en = 7; }, /must be a string/);
rejects('override binding', (d) => { d.overrides.frames.f1.go.bindings.color = { token: 'colors.nope' }; }, /existing token/);

const bad = parseWorkspace('{not json', context);
assert.ok(!bad.data && /Not valid JSON/.test(bad.errors[0]), 'malformed JSON is rejected without throwing');
assert.ok(parseWorkspace(JSON.stringify(doc()), context).data, 'valid JSON text parses');

let ws = doc();
removeFrame(ws, 'f2');
assert.deepEqual(ws.connections.map((c) => c.id), ['c2'], 'deleting a frame drops its connections');
removeFrame(ws, 'f1');
assert.equal(ws.startFrameId, null, 'deleting the start clears it');
assert.deepEqual(ws.connections, [], 'incoming connections go too');
assert.equal(ws.overrides.frames.f1, undefined, 'frame overrides go too');
ws = doc();
removePage(ws, 'p1');
assert.equal(ws.startFrameId, null);
assert.deepEqual(ws.connections.map((c) => c.id), []);
assert.equal(ws.selectedPageId, 'p2');
assert.deepEqual(ws.pages.map((p) => p.id), ['p2']);
assert.deepEqual(ws.trash.map((item) => item.frame.id), ['f2', 'f1'], 'deleting a page moves its frames to Trash');

ws = normalize(doc());
shelveFrame(ws, 'f1', 'archived');
assert.deepEqual(ws.pages[0].frames.map((f) => f.id), ['f2'], 'archiving takes the frame off its page');
assert.deepEqual(ws.connections, [], 'and its connections');
assert.equal(ws.startFrameId, null);
assert.deepEqual(validateWorkspace(ws, context), [], 'a workspace with archived frames is valid');
assert.equal(uniqueId(ws, 'f1'), 'f1-2', 'archived frame ids stay reserved');
rejects('shelved duplicate', (d) => { d.trash = [{ frame: frame('f2', 'screens/a'), connections: [], overrides: {} }]; }, /Duplicate frame id f2 in trash/);
rejects('connection to a shelved frame', (d) => { d.archived = [{ frame: frame('f9', 'screens/a') }]; d.connections[0].to.frameId = 'f9'; }, /missing frame f9/);
shelveFrame(ws, 'f3', 'trash');
moveShelfItem(ws, 'f3', 'trash', 'archived');
assert.deepEqual(ws.archived.map((item) => item.frame.id), ['f3', 'f1'], 'items move between Trash and Archived');
restoreFrame(ws, 'archived', 'f1', 'p1');
assert.deepEqual(ws.pages[0].frames.map((f) => f.id), ['f1', 'f2'], 'restoring returns the frame to its page and place');
assert.deepEqual(ws.connections.map((c) => c.id), ['c1'], 'with connections whose other end is live');
assert.equal(ws.startFrameId, 'f1', 'and the start frame');
assert.equal(ws.overrides.frames.f1.go.text.en, 'Hi', 'and its overrides');
assert.deepEqual(ws.archived[0].connections.map((c) => c.id), ['c2'], 'a connection to a still archived frame waits for it');
restoreFrame(ws, 'archived', 'f3', 'p1');
assert.deepEqual(ws.connections.map((c) => c.id).sort(), ['c1', 'c2'], 'and comes back with it');
assert.deepEqual(validateWorkspace(ws, context), [], 'the restored workspace is valid');
ws = doc();
moveFrameToPage(ws, 'f2', 'p2');
assert.deepEqual(ws.pages.map((p) => p.frames.map((f) => f.id)), [['f1'], ['f3', 'f2']], 'frames move between pages');
assert.equal(ws.connections.length, 2, 'moving keeps connections');

// Merging the committed seed into a draft: new frames, pages and links come in; the draft's own work stays.
ws = doc();
ws.pages[0].frames[0].x = 500;
shelveFrame(ws, 'f3', 'trash');
ws.connections[0].to.frameId = 'f1';
ws.connections.push({ id: 'mine', from: { frameId: 'f2', hotspotId: null }, to: { frameId: 'f1' }, trigger: 'click' });
const newer = doc();
newer.pages[0].frames.push(frame('f4', 'screens/b'));
newer.pages.push({ id: 'p3', name: 'Three', view: { x: 0, y: 0, zoom: 1 }, frames: [frame('f5', 'screens/a')] });
newer.connections.push({ id: 'c3', from: { frameId: 'f4', hotspotId: null }, to: { frameId: 'f5' }, trigger: 'click' });
assert.deepEqual(mergeSeed(ws, newer), { frames: 2, pages: 1, connections: 2 }, 'merging reports what it added');
assert.deepEqual(ws.pages.map((p) => p.frames.map((f) => f.id)), [['f1', 'f2', 'f4'], [], ['f5']], 'new frames join their page, or a new one');
assert.equal(ws.pages[0].frames[0].x, 500, 'moved frames keep their position');
assert.deepEqual(ws.trash.map((item) => item.frame.id), ['f3'], 'trashed frames stay in Trash');
assert.equal(ws.connections.find((c) => c.id === 'c1').to.frameId, 'f2', 'the seed link wins on the same hotspot');
assert.ok(ws.connections.some((c) => c.id === 'mine') && ws.connections.some((c) => c.id === 'c3'), 'own links stay and new ones come in');
assert.equal(ws.connections.some((c) => c.id === 'c2'), false, 'links to a trashed frame are not brought back');
assert.deepEqual(validateWorkspace(ws, context), [], 'the merged workspace is valid');
const again = pendingMerge(ws, newer);
assert.equal(again.frames.length + again.connections.length, 0, 'a second merge has nothing to do');

const overrides = { tokens: {}, frames: {} };
setOverride(overrides, ['frames', 'f1', 'go', 'text', 'en'], 'x');
assert.equal(overrides.frames.f1.go.text.en, 'x');
setOverride(overrides, ['frames', 'f1', 'go', 'text', 'en'], undefined);
assert.deepEqual(overrides, { tokens: {}, frames: {} }, 'resetting prunes empty parents');

const memory = (items = {}) => ({ getItem: (k) => items[k] ?? null, setItem: (k, v) => { items[k] = v; }, removeItem: (k) => delete items[k] });
const seed = doc();
assert.deepEqual(loadWorkspace({ storage: memory(), seed, context }).ws, normalize(doc()), 'no draft opens the seed');
const corrupt = loadWorkspace({ storage: memory({ [STORAGE_KEY]: '{oops' }), seed, context });
assert.ok(corrupt.notice && corrupt.draftText === '{oops', 'a corrupt draft is kept and flagged');
const stored = memory();
assert.ok(saveDraft(stored, seed));
assert.deepEqual(loadWorkspace({ storage: stored, seed: doc(), context }).ws, normalize(doc()), 'a valid draft wins over the seed');
assert.equal(saveDraft({ setItem() { throw new Error('quota'); } }, seed), false, 'a failed write reports false');

const catalogDir = join(root, 'catalog');
const guards = [
  [/\.style\b/, '.style'],
  [/style=["'`]|setAttribute\(\s*['"]style/, 'style attribute'],
  [/#[0-9a-fA-F]{3,8}\b/, 'hex color'],
  [/\d\s*px\b/, 'px literal'],
];
const violations = [];
for (const file of readdirSync(catalogDir).filter((name) => name.endsWith('.js') && name !== 'core.js')) {
  readFileSync(join(catalogDir, file), 'utf8').split('\n').forEach((line, i) => {
    for (const [pattern, label] of guards) if (pattern.test(line)) violations.push(`catalog/${file}:${i + 1} ${label}: ${line.trim()}`);
  });
}
assert.deepEqual(violations, [], `catalog modules must not style directly:\n${violations.join('\n')}`);

const seedPath = join(root, 'workspace.json');
const tokensPath = join(root, 'tokens.json');
if (existsSync(seedPath) && existsSync(tokensPath) && existsSync(join(catalogDir, 'index.js'))) {
  try {
    const { entries } = await import(pathToFileURL(join(catalogDir, 'index.js')));
    const real = { catalogIds: new Set(entries.map((entry) => entry.id)), hotspotIds: () => null, tokens: JSON.parse(readFileSync(tokensPath, 'utf8')) };
    const errors = validateWorkspace(JSON.parse(readFileSync(seedPath, 'utf8')), real);
    assert.deepEqual(errors, [], `workspace.json is invalid:\n${errors.join('\n')}`);
    console.log(`seed workspace.json valid against ${entries.length} catalog entries`);
  } catch (error) {
    if (error instanceof assert.AssertionError) throw error;
    console.log(`seed check skipped, the catalog does not import yet: ${error.message}`);
  }
} else {
  console.log('seed check skipped: workspace.json, tokens.json or the catalog is not there yet');
}
await import('./check-sync.mjs');
console.log('design/check.mjs passed');
