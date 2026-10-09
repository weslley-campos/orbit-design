import { BASE_CSS, LANGUAGES, hotspotsOf, loadCatalog, overridesCss } from '../catalog/core.js';
import { MOBILE_SCREEN, deviceOf, h, kids, openMenu, outerSize, preserveFocus } from './dom.js';
import { icon } from './icons.js';
import {
  STORAGE_KEY, loadWorkspace, locate, mergeSeed, moveFrameToPage, moveShelfItem, nextFreeX, normalize, parseWorkspace, pendingMerge, removePage, restoreFrame,
  shelveFrame, uniqueId, validateWorkspace,
} from './store.js';
import { createCanvas } from './canvas.js';
import { createInspector } from './inspector.js';
import { openPlay } from './play.js';
import { createAccount } from './account.js';
import { createReview, reviewToken } from './review.js';
import { applyAuthReturn, cloudConfigured } from './cloud.js';

const $ = (id) => document.getElementById(id);

function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return { getItem() { throw new Error('unavailable'); }, setItem() { throw new Error('unavailable'); }, removeItem() { throw new Error('unavailable'); } };
  }
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-cache' });
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

for (const el of document.querySelectorAll('[data-icon]')) el.prepend(icon(el.dataset.icon));

const THEME_KEY = 'orbit.design.theme';
function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;
}
function currentTheme() {
  return document.documentElement.dataset.theme ?? 'system';
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
    mode: 'inspect',
    // Read-only canvas over Archived or Trash: { shelf, frameId } for one screen, frameId null for all of them.
    shelfView: null,
    shelfPage: null,
    page: () => app.ws.pages.find((page) => page.id === app.ws.selectedPageId) ?? null,
    canvasPage: () => app.shelfPage ?? app.page(),
    locate: (frameId) => locate(app.ws, frameId),
    frameName: (frame) => entryMap.get(frame.catalogId)?.name ?? frame.catalogId,
    // Copy for the sign-in, sharing and comment UI, in the workspace language (design/catalog/strings.proposed.json).
    t: (key, vars = {}) => {
      const text = catalog.strings[app.ws?.settings.language]?.[key] ?? catalog.strings.en[key] ?? key;
      return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
    },
  };
  applyAuthReturn();
  const token = reviewToken();
  app.review = Boolean(token);
  let account = null;
  let review = null;
  const emptyWorkspace = () => normalize({
    version: 1, settings: { ...seed.settings, language: navigator.language?.startsWith('pt') ? 'pt' : 'en' }, selectedPageId: 'review', startFrameId: null,
    pages: [{ id: 'review', name: 'Review', readOnly: true, view: { x: 80, y: 80, zoom: 1 }, frames: [] }], connections: [], overrides: {},
  });
  const loadGuest = () => loadWorkspace({ storage, seed, context });

  // With sign-in configured, nothing is shown until the account is confirmed as an editor (review links excepted).
  let locked = !app.review && cloudConfigured();
  const lockedWorkspace = () => normalize({ ...emptyWorkspace(), selectedPageId: null, pages: [] });
  const loaded = app.review ? { ws: emptyWorkspace() } : locked ? { ws: lockedWorkspace() } : loadGuest();
  app.ws = loaded.ws;
  app.rawDraft = loaded.draftText ?? null;

  const notice = $('notice');
  const clearNotice = () => { notice.hidden = true; notice.replaceChildren(); };
  function showNotice(message, details = [], actions = []) {
    notice.replaceChildren(...kids([
      h('strong', {}, message),
      details.length ? h('ul', {}, ...details.slice(0, 8).map((detail) => h('li', {}, detail))) : null,
      app.rawDraft != null ? h('button', { onclick: () => download('workspace-draft.json', app.rawDraft) }, 'Download draft') : null,
      ...actions.map((action) => h('button', { onclick: action.run }, action.label)),
      h('button', { onclick: clearNotice }, app.t('workspace_dismiss')),
    ]));
    notice.hidden = false;
  }
  const seedErrors = validateWorkspace(seed, context);
  if (seedErrors.length) showNotice('The committed workspace.json has problems.', seedErrors);
  else if (loaded.notice) showNotice(loaded.notice);

  // Browser draft or cloud copy, decided by the account module; a review page never saves.
  app.save = () => { if (!app.review && !locked) account?.save(); };

  const refreshOverrides = () => { $('orbit-overrides').textContent = overridesCss(catalog.tokens, app.ws.overrides); };
  app.change = () => {
    app.save();
    refreshOverrides();
    app.canvas.refreshContent();
  };
  app.refresh = () => {
    app.shelfPage = buildShelfPage();
    refreshOverrides();
    syncToolbar();
    renderBanner();
    renderSidebar();
    app.canvas.render();
    app.inspector.render();
    syncShare();
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
    syncShare();
  };
  // Share in the inspector header, like Figma: shares the selected screen once it is saved to the cloud.
  function syncShare() {
    const button = $('share');
    button.hidden = app.review || !cloudConfigured() || !account;
    if (button.hidden) return;
    button.textContent = app.t('workspace_share');
    if (!account.user()) {
      button.disabled = false;
      button.title = app.t('workspace_share_needs_account');
      button.onclick = () => account.signIn();
      return;
    }
    // Nothing selected shares the whole project (live pages only); a selected screen shares just that screen.
    const frameId = app.selection?.frameId ?? null;
    const action = account.shareAction(frameId);
    button.disabled = !action || action.disabled;
    button.title = action?.label ?? app.t('workspace_share_select');
    button.onclick = () => action?.run();
  }
  app.setMode = (mode) => {
    app.mode = mode;
    if (mode !== 'move' && app.inspector.tab() !== mode) app.inspector.showTab(mode);
    app.canvas.setMode(mode);
    syncModes();
  };

  const SHELF_NAMES = { archived: 'Archived', trash: 'Trash' };
  const toast = h('div', { class: 'ws-toast', role: 'status', hidden: true });
  $('stage-wrap').append(toast);
  let toastTimer = 0;
  function showToast(message, action) {
    clearTimeout(toastTimer);
    toast.replaceChildren(...kids([h('span', {}, message), action && h('button', { onclick: () => { toast.hidden = true; action.run(); } }, action.label)]));
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 6000);
  }
  app.shelve = (frameId, shelf) => {
    const loc = app.locate(frameId);
    if (!loc) return;
    const name = app.frameName(loc.frame);
    shelveFrame(app.ws, frameId, shelf);
    if (app.selection?.frameId === frameId) app.selection = null;
    shelvesOpen.add(shelf);
    app.commit();
    showToast(`${name} moved to ${SHELF_NAMES[shelf]}.`, { label: 'Undo', run: () => restore(shelf, frameId) });
  };
  function restore(shelf, frameId) {
    const page = restoreFrame(app.ws, shelf, frameId, app.ws.selectedPageId);
    if (!page) return;
    app.ws.selectedPageId = page.id;
    app.selection = { frameId, key: null };
    app.shelfView = null;
    app.commit();
    showToast(`${app.frameName(app.locate(frameId).frame)} restored to ${page.name}.`);
  }
  app.restore = restore;
  app.moveShelf = (frameId, from, to) => {
    moveShelfItem(app.ws, frameId, from, to);
    shelvesOpen.add(to);
    // A view of that one screen follows it to the other shelf.
    if (app.shelfView?.frameId === frameId) app.shelfView = { shelf: to, frameId };
    app.commit();
  };

  const shelfViews = {};
  const platformOf = (item) => (item.platform !== undefined ? item.platform : app.ws.pages.find((p) => p.id === item.pageId)?.platform ?? null);
  function buildShelfPage() {
    const v = app.shelfView;
    if (!v) return null;
    const items = (app.ws[v.shelf] ?? []).filter((item) => !v.frameId || item.frame.id === v.frameId);
    if (v.frameId && !items.length) { app.shelfView = { shelf: v.shelf, frameId: null }; return buildShelfPage(); }
    let x = 0;
    const frames = items.map((item) => {
      const frame = { ...item.frame, x, y: 0, platform: platformOf(item) };
      x += outerSize(frame, frame, app.ws.settings).width + 96;
      return frame;
    });
    const key = `${v.shelf}:${v.frameId ?? '*'}`;
    return {
      id: `shelf-${key}`,
      shelf: v.shelf,
      name: SHELF_NAMES[v.shelf],
      view: (shelfViews[key] ??= { x: 80, y: 80, zoom: 1, fresh: true }),
      frames,
      overrides: { ...app.ws.overrides, frames: Object.fromEntries(items.map((item) => [item.frame.id, item.overrides ?? {}])) },
    };
  }
  app.openShelf = (shelf, frameId = null) => {
    app.canvas.endLink();
    app.shelfView = { shelf, frameId };
    app.selection = frameId ? { frameId, key: null } : null;
    shelvesOpen.add(shelf);
    app.refresh();
    if (app.shelfPage.view.fresh) { delete app.shelfPage.view.fresh; app.canvas.fit(); }
  };
  app.closeShelf = () => {
    if (!app.shelfView) return false;
    app.shelfView = null;
    app.selection = null;
    app.refresh();
    return true;
  };

  const banner = h('div', { class: 'ws-shelf-banner', role: 'region', 'aria-label': 'Shelf view', hidden: true });
  $('stage-wrap').append(banner);
  function renderBanner() {
    const page = app.shelfPage;
    banner.hidden = !page;
    if (!page) return;
    const total = (app.ws[page.shelf] ?? []).length;
    const one = app.shelfView.frameId;
    banner.replaceChildren(...kids([
      icon(page.shelf === 'archived' ? 'archive' : 'trash', 16),
      h('strong', {}, page.name),
      h('span', { class: 'ws-banner-note' }, one ? `${app.frameName(page.frames[0])} · read-only` : `${total} ${total === 1 ? 'screen' : 'screens'} · read-only`),
      one && total > 1 ? h('button', { onclick: () => app.openShelf(page.shelf) }, 'View all') : null,
      h('button', { class: 'ws-primary', onclick: () => app.closeShelf() }, `Back to ${app.page()?.name ?? 'pages'}`),
    ]));
  }

  app.shelfInfo = () => {
    const page = app.shelfPage;
    const shelf = page.shelf;
    const item = (app.ws[shelf] ?? []).find((candidate) => candidate.frame.id === app.selection?.frameId);
    if (!item) {
      return [h('h3', {}, page.name), h('p', { class: 'ws-hint' }, page.frames.length
        ? 'Read-only view. Select a screen to see where it came from and to restore it.'
        : `${page.name} is empty.`)];
    }
    const other = shelf === 'archived' ? 'trash' : 'archived';
    const entry = entryMap.get(item.frame.catalogId);
    const when = item.at ? new Date(item.at).toLocaleString() : 'unknown';
    const pageLive = app.ws.pages.some((p) => p.id === item.pageId);
    return kids([
      h('h3', {}, app.frameName(item.frame)),
      h('dl', { class: 'ws-pairs' },
        h('dt', {}, 'Status'), h('dd', {}, `${shelf === 'archived' ? 'Archived' : 'In Trash'} since ${when}`),
        h('dt', {}, 'From page'), h('dd', {}, `${item.pageName ?? 'unknown'}${pageLive ? '' : ' (deleted)'}`),
        h('dt', {}, 'Catalog id'), h('dd', {}, item.frame.catalogId),
        entry?.source ? h('dt', {}, 'Source') : null, entry?.source ? h('dd', {}, entry.source) : null,
        h('dt', {}, 'Connections'), h('dd', {}, String(item.connections.length)),
        h('dt', {}, 'Size'), h('dd', {}, `${item.frame.width} × ${item.frame.height}`)),
      h('div', { class: 'ws-inline ws-actions' },
        h('button', { class: 'ws-primary', 'data-f': 'shelf-restore', onclick: () => restore(shelf, item.frame.id) }, `Restore to ${pageLive ? item.pageName : app.page()?.name ?? 'a page'}`),
        h('button', { 'data-f': 'shelf-move', onclick: () => app.moveShelf(item.frame.id, shelf, other) }, `Move to ${SHELF_NAMES[other]}`)),
      app.shelfView.frameId ? null : h('button', { class: 'ws-link', onclick: () => app.openShelf(shelf, item.frame.id) }, 'View this screen alone'),
      h('p', { class: 'ws-hint' }, 'Shelved screens are read-only. Restore one to inspect, edit or connect it.'),
      ...(account?.active() ? account.commentsView() : []),
    ]);
  };

  app.newPage = () => {
    const id = uniqueId(app.ws, 'page');
    app.ws.pages.push({ id, name: `Page ${app.ws.pages.length + 1}`, view: { x: 80, y: 80, zoom: 1 }, frames: [] });
    app.ws.selectedPageId = id;
    app.selection = null;
    app.commit();
    startRename(id);
  };

  const capital = (value) => value[0].toUpperCase() + value.slice(1);
  const LANGUAGE_NAMES = { en: 'English', pt: 'Português' };
  const DEVICE_NAMES = { ios: 'iOS', android: 'Android' };
  const logoOf = (palette) => `assets/core-ui/drawable/ic_logo_${palette}.svg`;
  const setting = (key, value) => { app.ws.settings[key] = value; app.commit(); };
  const choices = (key, values, label, iconOf) => values.map((value) => ({
    label: label(value), icon: iconOf?.(value), checked: (app.ws.settings[key] ?? values[0]) === value, run: () => setting(key, value),
  }));
  const swatch = (palette) => h('img', { class: 'ws-swatch', src: logoOf(palette), alt: '', width: 18, height: 18 });

  const tool = (id, label, onclick, ...content) => h('button', {
    class: 'ws-tool', 'data-f': `tool-${id}`, 'aria-label': label, title: label, 'aria-haspopup': 'menu', 'aria-expanded': 'false', onclick,
  }, ...content);
  const balloon = (items) => (e) => openMenu(e.currentTarget, items(), { above: true });
  const modeButton = (name, label) => h('button', {
    class: 'ws-seg', 'data-f': `tool-${name}`, 'aria-pressed': 'false', 'aria-label': label, title: label,
    onclick: () => app.setMode(name),
  }, icon(name));
  const zoomText = h('span', { class: 'ws-zoom-pct' }, '100%');
  const tools = {
    move: modeButton('move', 'Move mode (H)'),
    inspect: modeButton('inspect', 'Inspect mode (V)'),
    prototype: modeButton('prototype', 'Prototype mode (P)'),
    palette: tool('palette', 'Palette', balloon(() => [{ heading: 'Palette' }, ...choices('palette', catalog.tokens.palettes, capital, swatch)]), h('img', { class: 'ws-swatch', alt: '', width: 24, height: 24 })),
    mode: tool('mode', 'Mode', balloon(() => [{ heading: 'Mode' }, ...choices('mode', catalog.tokens.modes, capital, (value) => icon(value))]), icon('light')),
    language: tool('language', 'Language', balloon(() => [{ heading: 'Language' }, ...choices('language', LANGUAGES, (value) => LANGUAGE_NAMES[value] ?? value.toUpperCase())]),
      icon('language'), h('span', { class: 'ws-tool-text' })),
    device: tool('device', 'Device', balloon(() => [{ heading: 'Device' }, ...choices('device', ['ios', 'android'], (value) => DEVICE_NAMES[value], (value) => icon(value))]), icon('ios')),
    zoom: tool('zoom', 'Zoom', balloon(() => [
      { heading: 'Zoom' },
      { label: 'Zoom in', tag: '+', run: () => app.canvas.zoomIn() },
      { label: 'Zoom out', tag: '−', run: () => app.canvas.zoomOut() },
      { label: 'Zoom to 100%', tag: 'Shift 0', run: () => app.canvas.zoomReset() },
      { label: 'Zoom to fit', tag: 'Shift 1', run: () => app.canvas.fit() },
    ]), zoomText, icon('chevron', 14)),
  };
  $('tools').replaceChildren(
    h('div', { class: 'ws-segment', role: 'group', 'aria-label': 'Canvas mode' }, tools.move, tools.inspect, tools.prototype),
    h('span', { class: 'ws-tools-sep', 'aria-hidden': 'true' }),
    tools.palette, tools.mode, tools.language, tools.device,
    h('span', { class: 'ws-tools-sep', 'aria-hidden': 'true' }),
    tools.zoom,
  );
  app.onZoom = (zoom) => { zoomText.textContent = `${Math.round(zoom * 100)}%`; };
  function syncModes() {
    for (const key of ['move', 'inspect', 'prototype']) tools[key].setAttribute('aria-pressed', String(key === app.mode));
  }
  // Choosing a tab in the inspector switches the canvas to that mode too.
  app.onTab = (name) => { if (name !== 'comments' && app.mode !== name) app.setMode(name); };
  function syncToolbar() {
    const { palette, mode, language, device = 'ios' } = app.ws.settings;
    const label = (key, text) => { tools[key].title = text; tools[key].setAttribute('aria-label', text); };
    tools.palette.querySelector('img').src = logoOf(palette);
    for (const img of document.querySelectorAll('.ws-logo')) img.src = logoOf(palette);
    tools.mode.replaceChildren(icon(mode === 'dark' ? 'dark' : 'light'));
    tools.language.querySelector('.ws-tool-text').textContent = language.toUpperCase();
    tools.device.replaceChildren(icon(device));
    label('palette', `Palette: ${capital(palette)}`);
    label('mode', `Mode: ${capital(mode)}`);
    label('language', `Language: ${LANGUAGE_NAMES[language] ?? language}`);
    label('device', `Device: ${DEVICE_NAMES[device]}`);
    $('tab-comments').textContent = app.t('workspace_comments');
    if (app.review) $('save-status').textContent = app.t('workspace_review');
    syncModes();
  }

  const left = $('left-body');
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

  const shelvesOpen = new Set();
  function shelfSection(shelf) {
    const items = app.ws[shelf] ?? [];
    const other = shelf === 'archived' ? 'trash' : 'archived';
    const section = h('details', { class: 'ws-shelf', open: shelvesOpen.has(shelf) },
      h('summary', {}, h('span', { class: 'ws-shelf-title' }, icon(shelf === 'archived' ? 'archive' : 'trash', 16), SHELF_NAMES[shelf]),
        h('span', { class: 'ws-shelf-tools' },
          items.length ? h('button', {
            class: 'ws-view-all', 'data-f': `view-${shelf}`, 'aria-pressed': String(app.shelfView?.shelf === shelf && !app.shelfView.frameId),
            onclick: (e) => { e.preventDefault(); app.openShelf(shelf); },
          }, 'View all') : null,
          h('span', { class: 'ws-count' }, String(items.length)))),
      items.length ? null : h('p', { class: 'ws-hint' }, shelf === 'archived' ? 'Archived screens are kept here for reference.' : 'Deleted screens wait here until you restore them.'),
      h('ul', { class: 'ws-rows' }, ...items.map((item) => {
        const name = app.frameName(item.frame);
        const viewing = app.shelfView?.shelf === shelf && (app.shelfView.frameId ?? app.selection?.frameId) === item.frame.id;
        return h('li', { class: viewing ? 'ws-row is-selected' : 'ws-row' },
          h('button', {
            class: 'ws-row-main ws-shelf-row', 'data-f': `shelf-${item.frame.id}`, 'aria-current': viewing ? 'true' : null, title: `View ${name} on the canvas`,
            onclick: () => app.openShelf(shelf, item.frame.id),
          }, h('span', { class: 'ws-glyph', 'aria-hidden': 'true' }),
          h('span', { class: 'ws-row-name' }, name), h('span', { class: 'ws-tag' }, item.pageName ?? '')),
          h('button', { class: 'ws-icon', 'aria-label': `Restore ${name}`, title: 'Restore', 'data-f': `restore-${item.frame.id}`, onclick: () => restore(shelf, item.frame.id) }, icon('restore', 16)),
          moreButton(`Actions for ${name} in ${SHELF_NAMES[shelf]}`, `shelf-more-${item.frame.id}`, [
            { label: `Restore to ${app.ws.pages.some((p) => p.id === item.pageId) ? item.pageName : 'the current page'}`, run: () => restore(shelf, item.frame.id) },
            { label: 'View on canvas', run: () => app.openShelf(shelf, item.frame.id) },
            { label: `Move to ${SHELF_NAMES[other]}`, run: () => app.moveShelf(item.frame.id, shelf, other) },
          ]));
      })));
    section.addEventListener('toggle', () => { if (section.open) shelvesOpen.add(shelf); else shelvesOpen.delete(shelf); });
    return section;
  }

  function renderSidebar() {
    if (app.review) { left.replaceChildren(...(review?.sidebarView() ?? [])); return; }
    preserveFocus(left, () => {
      const { ws } = app;
      const page = app.page();
      const swap = (index, offset) => {
        [ws.pages[index], ws.pages[index + offset]] = [ws.pages[index + offset], ws.pages[index]];
        app.commit();
      };
      left.replaceChildren(...kids([
        sectionHead('Pages', 'New page', () => app.newPage()),
        h('ul', { class: 'ws-rows' }, ...ws.pages.map((p, index) => h('li', { class: p.id === ws.selectedPageId && !app.shelfView ? 'ws-row is-selected' : 'ws-row' },
          renaming === p.id ? renameInput(p) : h('button', {
            class: 'ws-row-main', 'data-f': `page-${p.id}`, 'aria-current': p.id === ws.selectedPageId && !app.shelfView ? 'page' : null,
            onclick: () => { if (p.id === ws.selectedPageId && !app.shelfView) return; ws.selectedPageId = p.id; app.shelfView = null; app.selection = null; app.commit(); },
            ondblclick: () => startRename(p.id),
          }, p.name),
          moreButton(`Actions for page ${p.name}`, `page-more-${p.id}`, [
            { label: 'Rename', run: () => startRename(p.id) },
            { label: 'Move up', disabled: index === 0, run: () => swap(index, -1) },
            { label: 'Move down', disabled: index === ws.pages.length - 1, run: () => swap(index, 1) },
            {
              label: 'Delete page',
              run: () => {
                if (p.frames.length && !confirm(`Delete the page "${p.name}"? Its ${p.frames.length} frames move to Trash.`)) return;
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
              onclick: () => { if (app.shelfView) { app.shelfView = null; app.selection = { frameId: frame.id, key: null }; app.refresh(); } else app.select({ frameId: frame.id, key: null }); },
            }, h('span', { class: 'ws-glyph', 'aria-hidden': 'true' }), h('span', { class: 'ws-row-name' }, name),
            entryMap.get(frame.catalogId)?.status === 'proposed' ? h('span', { class: 'ws-tag' }, 'proposed') : null),
            moreButton(`Actions for frame ${name}`, `frame-more-${frame.id}`, [
              ...ws.pages.filter((p) => p !== page).map((p) => ({ label: `Move to ${p.name}`, run: () => { moveFrameToPage(ws, frame.id, p.id); app.commit(); } })),
              { label: 'Archive', run: () => app.shelve(frame.id, 'archived') },
              { label: 'Move to Trash', run: () => app.shelve(frame.id, 'trash') },
            ]));
        })),
        ...Object.keys(SHELF_NAMES).map(shelfSection),
      ]));
    });
  }

  app.canvas = createCanvas(app);
  app.inspector = createInspector(app);

  for (const id of ['play', 'play-mini']) $(id).onclick = () => openPlay(app, $(id));
  $('import-file').onchange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const { data, errors } = parseWorkspace(await file.text(), context);
    if (!data) {
      showNotice('Import failed. The current workspace was not changed.', errors);
      return;
    }
    const replaced = await account.replace(data, 'import');
    if (replaced !== null) return;
    app.ws = data;
    app.selection = null;
    clearNotice();
    app.commit();
  };
  // New screens, pages and links from the committed workspace.json join the open workspace; its own work stays (see mergeSeed).
  const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const mergeSummary = ({ frames, pages, connections }) => new Intl.ListFormat('en').format([
    frames && count(frames, 'new screen', 'new screens'),
    pages && count(pages, 'new page', 'new pages'),
    connections && count(connections, 'prototype link', 'prototype links'),
  ].filter(Boolean));
  const sizes = (pending) => ({ frames: pending.frames.length, pages: pending.pages, connections: pending.connections.length });
  const hasMerge = (pending) => pending.frames.length > 0 || pending.connections.length > 0;
  function mergeCommitted(ask) {
    const pending = pendingMerge(app.ws, seed);
    if (!hasMerge(pending)) { showToast('Already up to date with the committed workspace.'); return; }
    if (ask && !confirm(`Merge ${mergeSummary(sizes(pending))} from the committed workspace.json? Positions, Archived, Trash, edits and your other links stay as they are.`)) return;
    const merged = structuredClone(app.ws);
    const done = mergeSeed(merged, seed);
    const errors = validateWorkspace(merged, context);
    if (errors.length) { showNotice('The merge would make the workspace invalid, so nothing changed.', errors); return; }
    app.ws = merged;
    app.selection = null;
    clearNotice();
    app.commit();
    showToast(`Merged ${mergeSummary(done)}.`);
  }
  app.offerMerge = () => {
    if (app.review || locked || !notice.hidden) return;
    const pending = pendingMerge(app.ws, seed);
    if (hasMerge(pending)) {
      showNotice(`The committed workspace has ${mergeSummary(sizes(pending))} that this workspace doesn't have yet.`, [], [{ label: 'Merge', run: () => mergeCommitted(false) }]);
    }
  };
  async function reset() {
    if (account.active()) { await account.replace(normalize(structuredClone(seed)), 'reset'); return; }
    if (!confirm('Discard the local draft and reload the committed workspace.json?')) return;
    try { storage.removeItem(STORAGE_KEY); } catch { /* the draft stays but is replaced on the next save */ }
    app.ws = normalize(structuredClone(seed));
    app.selection = null;
    app.rawDraft = null;
    clearNotice();
    app.refresh();
    app.save();
  }
  const themeNames = { system: 'System', light: 'Light', dark: 'Dark' };
  function setTheme(theme) {
    applyTheme(theme);
    try { if (theme === 'system') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, theme); } catch { /* the theme still applies for this session */ }
  }
  $('main-menu').onclick = (e) => openMenu(e.currentTarget, [
    ...(app.review ? [
      { heading: app.t('workspace_review') },
      { label: app.t('workspace_review_open_workspace'), run: () => { location.href = location.pathname; } },
    ] : [
      { heading: 'Workspace' },
      { label: 'Export workspace.json', run: () => download('workspace.json', `${JSON.stringify(app.ws, null, 2)}\n`) },
      { label: 'Import workspace.json…', run: () => $('import-file').click() },
      { label: 'Merge committed changes…', run: () => mergeCommitted(true) },
      { label: 'Reset to committed workspace…', run: reset },
      ...account.menuItems(),
    ]),
    { heading: 'Theme' },
    ...Object.entries(themeNames).map(([theme, label]) => ({
      label, icon: icon(theme), checked: currentTheme() === theme,
      run: () => { setTheme(theme); account?.preferencesChanged(preferences()); },
    })),
  ]);

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input, textarea, select, [contenteditable], dialog')) return;
    if (e.key === 'Escape' && (app.canvas.endLink() || app.closeShelf())) { e.preventDefault(); return; }
    if (app.review) return;
    const mode = !e.shiftKey && { v: 'inspect', h: 'move', p: 'prototype' }[e.key.toLowerCase()];
    if (mode) { e.preventDefault(); app.setMode(mode); return; }
    const frameId = app.selection?.frameId;
    if ((e.key === 'Delete' || e.key === 'Backspace') && frameId && app.locate(frameId) && !e.target.closest?.('[role="menu"]')) {
      e.preventDefault();
      app.shelve(frameId, 'trash');
      return;
    }
    const run = { '+': app.canvas.zoomIn, '=': app.canvas.zoomIn, '-': app.canvas.zoomOut, ')': app.canvas.zoomReset, '!': app.canvas.fit }[e.key]
      ?? (e.shiftKey ? { Digit0: app.canvas.zoomReset, Digit1: app.canvas.fit }[e.code] : null);
    if (!run) return;
    e.preventDefault();
    run();
  });

  const PANELS_KEY = 'orbit.design.panels';
  let panels = { left: true, right: true };
  try { panels = { ...panels, ...JSON.parse(localStorage.getItem(PANELS_KEY)) }; } catch { /* defaults: both shown */ }
  function applyPanels() {
    for (const [side, name] of [['left', 'pages'], ['right', 'inspector']]) {
      const open = panels[side] !== false;
      $(side).hidden = !open;
      $(`${side}-mini`).hidden = open;
      document.body.classList.toggle(`no-${side}`, !open);
      $(`toggle-${side}`).setAttribute('aria-expanded', String(open));
      $(`toggle-${side}`).setAttribute('aria-label', `Hide ${name} panel`);
    }
  }
  for (const side of ['left', 'right']) {
    const toggle = (show) => {
      panels[side] = show;
      try { localStorage.setItem(PANELS_KEY, JSON.stringify(panels)); } catch { /* the toggle still works for this session */ }
      applyPanels();
      account?.preferencesChanged(preferences());
      $(show ? `toggle-${side}` : `show-${side}`).focus();
    };
    $(`toggle-${side}`).onclick = () => toggle(false);
    $(`show-${side}`).onclick = () => toggle(true);
  }
  applyPanels();

  // Profile preferences synced for signed-in accounts: workspace theme and panel visibility.
  function preferences() {
    return { theme: currentTheme(), panels: { left: panels.left !== false, right: panels.right !== false } };
  }
  function applyPreferences(next) {
    if (next.theme) setTheme(next.theme);
    if (next.panels) {
      panels = { ...panels, ...next.panels };
      try { localStorage.setItem(PANELS_KEY, JSON.stringify(panels)); } catch { /* applies for this session */ }
      applyPanels();
    }
  }

  const gate = h('div', { class: 'ws-gate', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'gate-title', hidden: true });
  document.body.append(gate);
  function lock(state) {
    locked = true;
    document.body.classList.add('is-locked');
    if (app.ws.pages.length) {
      app.ws = lockedWorkspace();
      app.selection = null;
      app.shelfView = null;
      app.refresh();
    }
    const t = app.t;
    const action = (label, run, primary = true) => h('button', { class: primary ? 'ws-primary' : '', 'data-f': 'gate-action', onclick: run }, label);
    gate.replaceChildren(...kids([
      h('img', { class: 'ws-logo', src: `assets/core-ui/drawable/ic_logo_${seed.settings.palette}.svg`, alt: '', width: 48, height: 48 }),
      h('h1', { id: 'gate-title' }, t('workspace_gate_title')),
      h('p', { role: 'status' }, {
        checking: t('workspace_gate_checking'),
        'signed-out': t('workspace_gate_body'),
        denied: t('workspace_gate_denied', { name: state.name, handle: state.handle }),
        error: t('workspace_gate_error', { reason: account?.reason(state.error) ?? state.error?.code }),
      }[state.kind]),
      state.kind === 'signed-out' ? action(t('workspace_sign_in'), state.signIn) : null,
      state.kind === 'error' ? action(t('workspace_retry'), state.retry) : null,
      state.signOut ? action(t('workspace_sign_out'), state.signOut, state.kind !== 'denied' ? false : true) : null,
    ]));
    gate.hidden = false;
    gate.querySelector('[data-f="gate-action"]')?.focus();
  }
  function unlock() {
    if (!locked) return;
    locked = false;
    document.body.classList.remove('is-locked');
    gate.hidden = true;
    app.ws = loadGuest().ws;
    app.selection = null;
    app.shelfView = null;
    app.refresh();
    app.offerMerge();
  }

  const env = {
    t: app.t, storage, seed, context, download, showNotice, clearNotice, showToast, loadGuest: () => loadGuest().ws,
    emptyWorkspace, preferences, applyPreferences, renderAccount: renderReviewAccount, lock, unlock,
  };
  if (app.review) {
    review = createReview(app, env, token);
    app.commentsView = () => review.commentsView();
    app.reviewEmptyText = () => review.emptyText();
  } else {
    account = createAccount(app, env);
    app.commentsView = () => account.commentsView();
    app.shareAction = (frameId) => account.shareAction(frameId);
    app.onCloudStatus = () => { app.canvas.updateSelection(); syncShare(); };
  }
  function renderReviewAccount() {
    const box = $('account');
    const user = review?.user();
    box.hidden = !review?.cloud();
    if (box.hidden) return;
    box.replaceChildren(user
      ? h('button', {
        class: 'ws-account-button', 'data-f': 'account', 'aria-label': app.t('workspace_signed_in_as', { name: user.name }), title: user.name, 'aria-haspopup': 'menu',
        onclick: (e) => openMenu(e.currentTarget, [{ heading: user.name }, { label: app.t('workspace_sign_out'), run: () => review.signOut() }]),
      }, user.avatarUrl ? h('img', { class: 'ws-avatar', src: user.avatarUrl, alt: '', width: 26, height: 26, referrerPolicy: 'no-referrer' }) : h('span', { class: 'ws-avatar' }, user.name[0]?.toUpperCase()), icon('chevron', 14))
      : h('button', { class: 'ws-signin', 'data-f': 'sign-in', title: app.t('workspace_sign_in'), 'aria-label': app.t('workspace_sign_in'), onclick: () => review.signIn() }, app.t('workspace_sign_in_short')));
  }

  // The review page shows comments only; the workspace adds a Comments tab when sign-in is configured.
  $('tab-comments').hidden = !(app.review || cloudConfigured());
  $('tab-comments').textContent = app.t('workspace_comments');
  for (const id of ['tab-inspect', 'tab-prototype', 'play']) $(id).hidden = app.review;
  document.querySelector('.ws-segment').hidden = app.review;
  if (app.review) { app.mode = 'move'; app.inspector.showTab('comments'); }
  addEventListener('hashchange', () => { if (reviewToken() !== token) location.reload(); });

  if (locked) lock({ kind: 'checking' });
  app.refresh();
  app.canvas.setMode(app.mode);
  await (review ?? account).start();
  app.offerMerge();
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
