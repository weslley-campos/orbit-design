import { BASE_CSS, LANGUAGES, hotspotsOf, loadCatalog, overridesCss } from '../catalog/core.js';
import { MOBILE_SCREEN, deviceOf, h, kids, openMenu, preserveFocus } from './dom.js';
import {
  STORAGE_KEY, loadWorkspace, locate, moveFrameToPage, nextFreeX, normalize, parseWorkspace, removeFrame, removePage, saveDraft, uniqueId, validateWorkspace,
} from './store.js';
import { createCanvas } from './canvas.js';
import { createInspector } from './inspector.js';
import { openPlay } from './play.js';

const $ = (id) => document.getElementById(id);

function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return { getItem() { throw new Error('unavailable'); }, setItem() { throw new Error('unavailable'); }, removeItem() { throw new Error('unavailable'); } };
  }
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = h('a', { href: url, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function boot() {
  $('orbit-base').textContent = BASE_CSS;
  const [{ entries, assets }, seed] = await Promise.all([import('../catalog/index.js'), fetchJson('workspace.json')]);
  const catalog = await loadCatalog({ assets });
  const storage = browserStorage();
  const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
  const hotspotCache = new Map();
  const context = {
    catalogIds: new Set(entryMap.keys()),
    tokens: catalog.tokens,
    hotspotIds(catalogId) {
      const entry = entryMap.get(catalogId);
      if (!entry) return null;
      if (!hotspotCache.has(catalogId)) {
        const settings = { palette: catalog.tokens.defaultPalette, mode: 'light', language: 'en' };
        hotspotCache.set(catalogId, new Set(hotspotsOf(entry, catalog, settings).map((spot) => spot.id)));
      }
      return hotspotCache.get(catalogId);
    },
  };

  const app = {
    catalog,
    entries: entryMap,
    seed,
    ws: null,
    rawDraft: null,
    selection: null,
    page: () => app.ws.pages.find((page) => page.id === app.ws.selectedPageId) ?? null,
    locate: (frameId) => locate(app.ws, frameId),
    frameName: (frame) => entryMap.get(frame.catalogId)?.name ?? frame.catalogId,
  };

  const loaded = loadWorkspace({ storage, seed, context });
  app.ws = loaded.ws;
  app.rawDraft = loaded.draftText ?? null;

  const notice = $('notice');
  const clearNotice = () => { notice.hidden = true; notice.replaceChildren(); };
  function showNotice(message, details = []) {
    notice.replaceChildren(...kids([
      h('strong', {}, message),
      details.length ? h('ul', {}, ...details.slice(0, 8).map((detail) => h('li', {}, detail))) : null,
      app.rawDraft != null ? h('button', { onclick: () => download('workspace-draft.json', app.rawDraft) }, 'Download draft') : null,
      h('button', { onclick: clearNotice }, 'Dismiss'),
    ]));
    notice.hidden = false;
  }
  const seedErrors = validateWorkspace(seed, context);
  if (seedErrors.length) showNotice('The committed workspace.json has problems.', seedErrors);
  else if (loaded.notice) showNotice(loaded.notice);

  function setStatus(ok) {
    const status = $('save-status');
    status.textContent = ok ? 'Saved' : 'Not saved';
    status.classList.toggle('is-failed', !ok);
    status.title = ok ? '' : 'Browser storage rejected the write. Use Export to keep your work.';
  }
  app.save = () => setStatus(saveDraft(storage, app.ws));

  const refreshOverrides = () => { $('orbit-overrides').textContent = overridesCss(catalog.tokens, app.ws.overrides); };
  app.change = () => {
    app.save();
    refreshOverrides();
    app.canvas.refreshContent();
  };
  app.refresh = () => {
    refreshOverrides();
    syncToolbar();
    renderSidebar();
    app.canvas.render();
    app.inspector.render();
  };
  app.commit = () => {
    app.save();
    app.refresh();
  };
  app.select = (selection) => {
    app.selection = selection;
    app.canvas.updateSelection();
    renderSidebar();
    app.inspector.render();
  };
  app.newPage = () => {
    const id = uniqueId(app.ws, 'page');
    app.ws.pages.push({ id, name: `Page ${app.ws.pages.length + 1}`, view: { x: 80, y: 80, zoom: 1 }, frames: [] });
    app.ws.selectedPageId = id;
    app.selection = null;
    app.commit();
    startRename(id);
  };

  const fillSelect = (id, values, label = (value) => value[0].toUpperCase() + value.slice(1)) => {
    $(id).replaceChildren(...values.map((value) => h('option', { value }, label(value))));
    $(id).onchange = (e) => { app.ws.settings[id] = e.target.value; app.commit(); };
  };
  fillSelect('palette', catalog.tokens.palettes);
  fillSelect('mode', catalog.tokens.modes);
  fillSelect('language', LANGUAGES, (value) => value.toUpperCase());
  fillSelect('device', ['ios', 'android'], (value) => (value === 'ios' ? 'iOS' : 'Android'));
  function syncToolbar() {
    for (const key of ['palette', 'mode', 'language']) $(key).value = app.ws.settings[key];
    $('device').value = app.ws.settings.device ?? 'ios';
  }

  const left = $('left');
  let renaming = null;

  function addFrame(catalogId) {
    const page = app.page();
    const entry = entryMap.get(catalogId);
    if (!page || !entry) return;
    const frame = {
      id: uniqueId(app.ws, catalogId.replaceAll('/', '-')),
      catalogId,
      x: nextFreeX(page),
      y: 0,
      width: deviceOf(page, app.ws.settings) ? MOBILE_SCREEN.width : entry.viewport.width,
      height: deviceOf(page, app.ws.settings) ? MOBILE_SCREEN.height : entry.viewport.height,
    };
    page.frames.push(frame);
    app.selection = { frameId: frame.id, key: null };
    app.commit();
  }

  const addItems = [...new Set(entries.map((entry) => entry.group))].flatMap((group) => [
    { heading: group },
    ...entries.filter((entry) => entry.group === group).map((entry) => ({
      label: entry.name, tag: entry.status === 'proposed' ? 'proposed' : null, run: () => addFrame(entry.id),
    })),
  ]);
  app.addFrameMenu = (trigger) => openMenu(trigger, addItems);

  function startRename(pageId) {
    renaming = pageId;
    renderSidebar();
    const input = left.querySelector('[data-f="rename"]');
    input?.focus();
    input?.select();
  }

  function renameInput(page) {
    let done = false;
    const finish = (save, refocus) => {
      if (done) return;
      done = true;
      if (save) page.name = input.value.trim() || page.name;
      renaming = null;
      app.commit();
      if (refocus) left.querySelector(`[data-f="page-${page.id}"]`)?.focus();
    };
    const input = h('input', {
      class: 'ws-rename', value: page.name, 'aria-label': 'Page name', 'data-f': 'rename',
      onkeydown: (e) => {
        if (e.key === 'Enter') finish(true, true);
        else if (e.key === 'Escape') finish(false, true);
      },
      onblur: () => finish(true, false),
    });
    return input;
  }

  const moreButton = (label, id, items) => h('button', {
    class: 'ws-more', 'aria-label': label, 'aria-haspopup': 'menu', 'data-f': id, onclick: (e) => openMenu(e.currentTarget, items),
  }, '⋯');
  const sectionHead = (title, label, onclick, { popup = false, disabled = false } = {}) => h('div', { class: 'ws-section-head' },
    h('h2', {}, title), h('button', { class: 'ws-icon', 'aria-label': label, 'aria-haspopup': popup ? 'menu' : null, disabled, onclick }, '+'));

  function renderSidebar() {
    preserveFocus(left, () => {
      const { ws } = app;
      const page = app.page();
      const swap = (index, offset) => {
        [ws.pages[index], ws.pages[index + offset]] = [ws.pages[index + offset], ws.pages[index]];
        app.commit();
      };
      left.replaceChildren(...kids([
        sectionHead('Pages', 'New page', () => app.newPage()),
        h('ul', { class: 'ws-rows' }, ...ws.pages.map((p, index) => h('li', { class: p.id === ws.selectedPageId ? 'ws-row is-selected' : 'ws-row' },
          renaming === p.id ? renameInput(p) : h('button', {
            class: 'ws-row-main', 'data-f': `page-${p.id}`, 'aria-current': p.id === ws.selectedPageId ? 'page' : null,
            onclick: () => { if (p.id === ws.selectedPageId) return; ws.selectedPageId = p.id; app.selection = null; app.commit(); },
            ondblclick: () => startRename(p.id),
          }, p.name),
          moreButton(`Actions for page ${p.name}`, `page-more-${p.id}`, [
            { label: 'Rename', run: () => startRename(p.id) },
            { label: 'Move up', disabled: index === 0, run: () => swap(index, -1) },
            { label: 'Move down', disabled: index === ws.pages.length - 1, run: () => swap(index, 1) },
            {
              label: 'Delete page',
              run: () => {
                if (!confirm(`Delete the page "${p.name}" and its frames?`)) return;
                removePage(ws, p.id);
                app.selection = null;
                app.commit();
              },
            },
          ])))),
        sectionHead('Frames', 'Add frame', (e) => app.addFrameMenu(e.currentTarget), { popup: true, disabled: !page }),
        page && !page.frames.length ? h('p', { class: 'ws-hint' }, 'This page has no frames.') : null,
        page && h('ul', { class: 'ws-rows' }, ...page.frames.map((frame) => {
          const name = app.frameName(frame);
          const selected = app.selection?.frameId === frame.id;
          return h('li', { class: selected ? 'ws-row is-selected' : 'ws-row' },
            h('button', {
              class: 'ws-row-main', 'data-f': `frame-${frame.id}`, 'aria-current': selected ? 'true' : null,
              onclick: () => app.select({ frameId: frame.id, key: null }),
            }, h('span', { class: 'ws-glyph', 'aria-hidden': 'true' }), h('span', { class: 'ws-row-name' }, name),
            entryMap.get(frame.catalogId)?.status === 'proposed' ? h('span', { class: 'ws-tag' }, 'proposed') : null),
            moreButton(`Actions for frame ${name}`, `frame-more-${frame.id}`, [
              ...ws.pages.filter((p) => p !== page).map((p) => ({ label: `Move to ${p.name}`, run: () => { moveFrameToPage(ws, frame.id, p.id); app.commit(); } })),
              {
                label: 'Remove frame',
                run: () => {
                  removeFrame(ws, frame.id);
                  if (app.selection?.frameId === frame.id) app.selection = null;
                  app.commit();
                },
              },
            ]));
        })),
      ]));
    });
  }

  app.canvas = createCanvas(app);
  app.inspector = createInspector(app);

  $('play').onclick = () => openPlay(app, $('play'));
  $('export').onclick = () => download('workspace.json', `${JSON.stringify(app.ws, null, 2)}\n`);
  $('import').onclick = () => $('import-file').click();
  $('import-file').onchange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const { data, errors } = parseWorkspace(await file.text(), context);
    if (!data) {
      showNotice('Import failed. The current workspace was not changed.', errors);
      return;
    }
    app.ws = data;
    app.selection = null;
    clearNotice();
    app.commit();
  };
  $('reset').onclick = () => {
    if (!confirm('Discard the local draft and reload the committed workspace.json?')) return;
    try { storage.removeItem(STORAGE_KEY); } catch { /* the draft stays but is replaced on the next save */ }
    app.ws = normalize(structuredClone(seed));
    app.selection = null;
    app.rawDraft = null;
    clearNotice();
    setStatus(true);
    app.refresh();
  };

  const PANELS_KEY = 'orbit.design.panels';
  let panels = { left: true, right: true };
  try { panels = { ...panels, ...JSON.parse(localStorage.getItem(PANELS_KEY)) }; } catch { /* defaults: both shown */ }
  function applyPanels() {
    for (const [side, name] of [['left', 'pages'], ['right', 'inspector']]) {
      const open = panels[side] !== false;
      $(side).hidden = !open;
      document.body.classList.toggle(`no-${side}`, !open);
      $(`toggle-${side}`).setAttribute('aria-expanded', String(open));
      $(`toggle-${side}`).setAttribute('aria-label', `${open ? 'Hide' : 'Show'} ${name} panel`);
    }
  }
  for (const side of ['left', 'right']) {
    $(`toggle-${side}`).onclick = () => {
      panels[side] = panels[side] === false;
      try { localStorage.setItem(PANELS_KEY, JSON.stringify(panels)); } catch { /* the toggle still works for this session */ }
      applyPanels();
    };
  }
  applyPanels();

  app.refresh();
  setStatus(true);
}

boot().catch((error) => {
  console.error(error);
  const box = $('boot-error');
  box.hidden = false;
  box.replaceChildren(
    h('strong', {}, 'The workspace could not start.'),
    h('pre', {}, String(error?.stack ?? error)),
    h('p', {}, 'Serve design/ from http://localhost:4173 (python3 -m http.server 4173 --bind 127.0.0.1 --directory design) and check that tokens.json, workspace.json and the catalog modules exist.'),
  );
});
