import { validateTokenOverride } from '../catalog/core.js';

export const STORAGE_KEY = 'orbit.design.workspace';
export const VERSION = 1;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const isString = (value) => typeof value === 'string' && value !== '';

// Archived and Trash keep removed frames with their connections and overrides so they can be restored.
export const SHELVES = ['archived', 'trash'];

export function validateWorkspace(data, { catalogIds, hotspotIds = () => null, tokens }) {
  const errors = [];
  if (!isObject(data)) return ['The workspace must be a JSON object'];
  if (data.version !== VERSION) return [`Unsupported version ${JSON.stringify(data.version)} (expected ${VERSION})`];

  const settings = data.settings;
  if (!isObject(settings) || !tokens.palettes.includes(settings.palette) || !tokens.modes.includes(settings.mode) || !isString(settings.language)) {
    errors.push('settings needs a known palette, a known mode and a language');
  } else if (settings.device != null && !['ios', 'android'].includes(settings.device)) {
    errors.push(`settings.device must be ios or android, not ${settings.device}`);
  }

  const pageIds = new Set();
  const frames = new Map();
  for (const page of Array.isArray(data.pages) ? data.pages : []) {
    if (!isObject(page) || !isString(page.id)) { errors.push('A page has no id'); continue; }
    if (pageIds.has(page.id)) errors.push(`Duplicate page id ${page.id}`);
    pageIds.add(page.id);
    if (typeof page.name !== 'string') errors.push(`Page ${page.id} has no name`);
    const view = page.view;
    if (!isObject(view) || !isNumber(view.x) || !isNumber(view.y) || !(view.zoom > 0)) errors.push(`Page ${page.id} has an invalid view`);
    if (!Array.isArray(page.frames)) { errors.push(`Page ${page.id} has no frames array`); continue; }
    for (const frame of page.frames) {
      if (!isObject(frame) || !isString(frame.id)) { errors.push(`A frame on page ${page.id} has no id`); continue; }
      if (frames.has(frame.id)) errors.push(`Duplicate frame id ${frame.id}`);
      frames.set(frame.id, frame);
      if (!catalogIds.has(frame.catalogId)) errors.push(`Frame ${frame.id} uses unknown catalog id ${frame.catalogId}`);
      if (![frame.x, frame.y].every(isNumber) || !(frame.width > 0) || !(frame.height > 0)) errors.push(`Frame ${frame.id} has an invalid position or size`);
    }
  }
  if (!Array.isArray(data.pages)) errors.push('pages must be an array');
  if (data.selectedPageId != null && !pageIds.has(data.selectedPageId)) errors.push(`selectedPageId ${data.selectedPageId} is not a page`);
  if (data.startFrameId != null && !frames.has(data.startFrameId)) errors.push(`startFrameId ${data.startFrameId} is not a frame`);

  const live = new Map(frames);
  const connectionIds = new Set();
  if (!Array.isArray(data.connections)) errors.push('connections must be an array');
  for (const connection of Array.isArray(data.connections) ? data.connections : []) {
    if (!isObject(connection) || !isString(connection.id)) { errors.push('A connection has no id'); continue; }
    if (connectionIds.has(connection.id)) errors.push(`Duplicate connection id ${connection.id}`);
    connectionIds.add(connection.id);
    const { from, to } = connection;
    const source = live.get(from?.frameId);
    if (!source) errors.push(`Connection ${connection.id} starts at missing frame ${from?.frameId}`);
    if (!live.has(to?.frameId)) errors.push(`Connection ${connection.id} points at missing frame ${to?.frameId}`);
    if (from?.hotspotId != null) {
      const known = source && hotspotIds(source.catalogId);
      if (known && !known.has(from.hotspotId)) errors.push(`Connection ${connection.id} uses missing hotspot ${from.hotspotId} of ${source.catalogId}`);
    }
    if (connection.trigger !== 'click') errors.push(`Connection ${connection.id} has unsupported trigger ${connection.trigger}`);
  }

  for (const shelf of SHELVES) {
    if (data[shelf] == null) continue;
    if (!Array.isArray(data[shelf])) { errors.push(`${shelf} must be an array`); continue; }
    for (const item of data[shelf]) {
      const frame = item?.frame;
      if (!isObject(item) || !isObject(frame) || !isString(frame.id)) { errors.push(`An item in ${shelf} has no frame`); continue; }
      if (frames.has(frame.id)) errors.push(`Duplicate frame id ${frame.id} in ${shelf}`);
      frames.set(frame.id, frame);
      if (!catalogIds.has(frame.catalogId)) errors.push(`Frame ${frame.id} in ${shelf} uses unknown catalog id ${frame.catalogId}`);
      if (![frame.x, frame.y].every(isNumber) || !(frame.width > 0) || !(frame.height > 0)) errors.push(`Frame ${frame.id} in ${shelf} has an invalid position or size`);
      if (!Array.isArray(item.connections ?? []) || !isObject(item.overrides ?? {})) errors.push(`Frame ${frame.id} in ${shelf} has invalid connections or overrides`);
    }
  }

  validateOverrides(data.overrides ?? {}, frames, tokens, errors);
  return errors;
}

function validateOverrides(overrides, frames, tokens, errors) {
  if (!isObject(overrides)) { errors.push('overrides must be an object'); return; }
  const tokenExists = (path) => path in tokens.invariant || Object.values(tokens.themed).some((scope) => path in scope);
  for (const [scope, values] of Object.entries(overrides.tokens ?? {})) {
    if (scope !== 'invariant' && !tokens.themed[scope]) { errors.push(`Unknown token scope ${scope}`); continue; }
    if (!isObject(values)) { errors.push(`Token overrides of ${scope} must be an object`); continue; }
    for (const [path, value] of Object.entries(values)) {
      const error = validateTokenOverride(tokens, scope, path, value);
      if (error) errors.push(`Token override ${scope} ${path}: ${error}`);
    }
  }
  for (const [frameId, nodes] of Object.entries(overrides.frames ?? {})) {
    if (!frames.has(frameId)) { errors.push(`Overrides refer to unknown frame ${frameId}`); continue; }
    for (const [key, node] of Object.entries(isObject(nodes) ? nodes : {})) {
      const where = `${frameId}/${key}`;
      for (const [language, text] of Object.entries(node.text ?? {})) {
        if (typeof text !== 'string') errors.push(`Text override ${where} (${language}) must be a string`);
      }
      for (const [name, value] of Object.entries(node.props ?? {})) {
        if (!['string', 'boolean', 'number'].includes(typeof value)) errors.push(`Prop override ${where}.${name} has an invalid value`);
      }
      for (const [prop, binding] of Object.entries(node.bindings ?? {})) {
        if (!isObject(binding) || typeof binding.token !== 'string' || !tokenExists(binding.token)) {
          errors.push(`Binding override ${where}.${prop} must be { token } with an existing token`);
        }
      }
    }
  }
}

export function normalize(data) {
  data.connections ??= [];
  data.overrides ??= {};
  data.overrides.tokens ??= {};
  data.overrides.frames ??= {};
  for (const shelf of SHELVES) data[shelf] ??= [];
  return data;
}

export function parseWorkspace(text, context) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    return { errors: [`Not valid JSON: ${error.message}`] };
  }
  const errors = validateWorkspace(data, context);
  return errors.length ? { errors } : { data: normalize(data), errors };
}

export function loadWorkspace({ storage, seed, context }) {
  let draftText;
  try {
    draftText = storage.getItem(STORAGE_KEY);
  } catch {
    return { ws: normalize(structuredClone(seed)), notice: 'Browser storage is unavailable, so changes cannot be saved. Use Export to keep your work.' };
  }
  if (draftText == null) return { ws: normalize(structuredClone(seed)) };
  const { data, errors } = parseWorkspace(draftText, context);
  if (data) return { ws: data };
  return {
    ws: normalize(structuredClone(seed)),
    draftText,
    notice: `The saved draft could not be loaded (${errors[0]}). The committed workspace is open; the draft stays available to download.`,
  };
}

export function saveDraft(storage, ws) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(ws));
    return true;
  } catch {
    return false;
  }
}

export const allFrames = (ws) => ws.pages.flatMap((page) => page.frames);

export function locate(ws, frameId) {
  for (const page of ws.pages) {
    const frame = page.frames.find((candidate) => candidate.id === frameId);
    if (frame) return { frame, page };
  }
  return null;
}

const shelved = (ws) => SHELVES.flatMap((shelf) => ws[shelf] ?? []);

export function uniqueId(ws, base) {
  const used = new Set([
    ...ws.pages.map((page) => page.id), ...allFrames(ws).map((frame) => frame.id), ...ws.connections.map((c) => c.id),
    ...shelved(ws).flatMap((item) => [item.frame.id, ...item.connections.map((c) => c.id)]),
  ]);
  let id = base;
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
  return id;
}

export function removeFrame(ws, frameId) {
  for (const page of ws.pages) page.frames = page.frames.filter((frame) => frame.id !== frameId);
  ws.connections = ws.connections.filter((c) => c.from.frameId !== frameId && c.to.frameId !== frameId);
  if (ws.startFrameId === frameId) ws.startFrameId = null;
  delete ws.overrides.frames?.[frameId];
}

// Moves a live frame to Archived or Trash, keeping what removeFrame would drop.
export function shelveFrame(ws, frameId, shelf) {
  const loc = locate(ws, frameId);
  if (!loc || !SHELVES.includes(shelf)) return;
  ws[shelf] ??= [];
  ws[shelf].unshift({
    frame: loc.frame,
    pageId: loc.page.id,
    pageName: loc.page.name,
    index: loc.page.frames.indexOf(loc.frame),
    platform: loc.page.platform ?? null,
    connections: ws.connections.filter((c) => c.from.frameId === frameId || c.to.frameId === frameId),
    overrides: ws.overrides.frames?.[frameId] ?? {},
    start: ws.startFrameId === frameId,
    at: new Date().toISOString(),
  });
  removeFrame(ws, frameId);
}

export const shelfItem = (ws, shelf, frameId) => (ws[shelf] ?? []).find((item) => item.frame.id === frameId);

export function moveShelfItem(ws, frameId, from, to) {
  const item = shelfItem(ws, from, frameId);
  if (!item || from === to) return;
  ws[from].splice(ws[from].indexOf(item), 1);
  (ws[to] ??= []).unshift({ ...item, at: new Date().toISOString() });
}

// Puts a shelved frame back on its page (or fallbackPageId), with the connections whose other end is live.
// A connection to a frame that is still shelved moves to that frame's item, so it returns with it.
export function restoreFrame(ws, shelf, frameId, fallbackPageId) {
  const item = shelfItem(ws, shelf, frameId);
  const page = ws.pages.find((p) => p.id === item?.pageId) ?? ws.pages.find((p) => p.id === fallbackPageId) ?? ws.pages[0];
  if (!item || !page) return null;
  ws[shelf].splice(ws[shelf].indexOf(item), 1);
  const { frame } = item;
  if (page.id !== item.pageId) Object.assign(frame, { x: nextFreeX(page), y: 0 });
  page.frames.splice(page.id === item.pageId ? Math.min(item.index ?? Infinity, page.frames.length) : page.frames.length, 0, frame);
  for (const c of item.connections) {
    const other = c.from.frameId === frameId ? c.to.frameId : c.from.frameId;
    if (other !== frameId && !locate(ws, other)) {
      shelved(ws).find((candidate) => candidate.frame.id === other)?.connections.push(c);
    } else if (!connectionOf(ws, c.from.frameId, c.from.hotspotId)) {
      ws.connections.push({ ...c, id: uniqueId(ws, c.id) });
    }
  }
  if (Object.keys(item.overrides).length) ws.overrides.frames[frameId] = item.overrides;
  if (item.start && !ws.startFrameId) ws.startFrameId = frameId;
  return page;
}

// Brings what the committed seed added into a draft without losing the draft's own work. Frames are never deleted (only shelved),
// so a seed frame whose id the draft doesn't know is new: it joins its page (a new page if the draft lacks it) at the seed position.
// Seed connections between live frames are added, and win over the draft's link from the same hotspot. Positions, Archived, Trash,
// overrides, settings, pages and the draft's other connections stay as they are. Returns what changed; ws is untouched if nothing did.
export function pendingMerge(ws, seed) {
  const known = new Set([...allFrames(ws), ...shelved(ws).map((item) => item.frame)].map((frame) => frame.id));
  const frames = seed.pages.flatMap((page) => page.frames.filter((frame) => !known.has(frame.id)).map((frame) => ({ frame, page })));
  const pages = new Set(frames.filter(({ page }) => !ws.pages.some((p) => p.id === page.id)).map(({ page }) => page.id));
  const live = new Set([...allFrames(ws), ...frames.map(({ frame }) => frame)].map((frame) => frame.id));
  const connections = seed.connections.filter((c) => live.has(c.from.frameId) && live.has(c.to.frameId)).filter((c) => {
    const mine = connectionOf(ws, c.from.frameId, c.from.hotspotId);
    return !mine || mine.to.frameId !== c.to.frameId;
  });
  return { frames, pages: pages.size, connections };
}

export function mergeSeed(ws, seed) {
  const pending = pendingMerge(ws, seed);
  for (const { frame, page } of pending.frames) {
    let target = ws.pages.find((p) => p.id === page.id);
    if (!target) {
      target = { ...structuredClone(page), frames: [] };
      ws.pages.push(target);
    }
    target.frames.push(structuredClone(frame));
  }
  for (const c of pending.connections) {
    const mine = connectionOf(ws, c.from.frameId, c.from.hotspotId);
    if (mine) mine.to = { frameId: c.to.frameId };
    else ws.connections.push({ ...structuredClone(c), id: uniqueId(ws, c.id) });
  }
  return { frames: pending.frames.length, pages: pending.pages, connections: pending.connections.length };
}

// Deleting a page moves its frames to Trash.
export function removePage(ws, pageId) {
  const index = ws.pages.findIndex((page) => page.id === pageId);
  if (index < 0) return;
  for (const frame of [...ws.pages[index].frames]) shelveFrame(ws, frame.id, 'trash');
  ws.pages.splice(index, 1);
  if (ws.selectedPageId === pageId) ws.selectedPageId = ws.pages[Math.min(index, ws.pages.length - 1)]?.id ?? null;
}

export const nextFreeX = (page) => (page.frames.length ? Math.max(...page.frames.map((f) => f.x + f.width)) + 48 : 0);

export function moveFrameToPage(ws, frameId, pageId) {
  const from = locate(ws, frameId);
  const target = ws.pages.find((page) => page.id === pageId);
  if (!from || !target || from.page === target) return;
  from.page.frames = from.page.frames.filter((frame) => frame.id !== frameId);
  from.frame.x = nextFreeX(target);
  from.frame.y = 0;
  target.frames.push(from.frame);
}

export const connectionOf = (ws, frameId, hotspotId) => ws.connections.find((c) => c.from.frameId === frameId && c.from.hotspotId === hotspotId);

export function setConnection(ws, frameId, hotspotId, toFrameId) {
  const existing = connectionOf(ws, frameId, hotspotId);
  if (!toFrameId) {
    if (existing) ws.connections.splice(ws.connections.indexOf(existing), 1);
  } else if (existing) {
    existing.to = { frameId: toFrameId };
  } else {
    ws.connections.push({ id: uniqueId(ws, `${frameId}-${hotspotId ?? 'frame'}`), from: { frameId, hotspotId }, to: { frameId: toFrameId }, trigger: 'click' });
  }
}

// root is ws.overrides; value undefined deletes the entry and prunes emptied parents (never the two top containers).
export function setOverride(root, path, value) {
  const parents = [root];
  for (const key of path.slice(0, -1)) {
    if (value === undefined && !parents.at(-1)[key]) return;
    parents.push((parents.at(-1)[key] ??= {}));
  }
  if (value === undefined) delete parents.at(-1)[path.at(-1)];
  else parents.at(-1)[path.at(-1)] = value;
  for (let i = parents.length - 1; i > 1 && !Object.keys(parents[i]).length; i--) delete parents[i - 1][path[i - 1]];
}
