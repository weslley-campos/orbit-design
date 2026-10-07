import { deviceFrame, deviceOf, h, kids, outerSize, tintDevice } from './dom.js';
import { icon } from './icons.js';
import { setConnection } from './store.js';
import { renderFrame, inspectInfo } from '../catalog/core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const TITLE_HEIGHT = 28;
const STUB = 64;
const clamp = (value, low, high) => Math.min(Math.max(value, low), high);

export function createCanvas(app) {
  const root = document.getElementById('canvas');
  const stage = h('div', { class: 'ws-stage' });
  const hover = h('div', { class: 'ws-box ws-box-hover', hidden: true });
  const selected = h('div', { class: 'ws-box ws-box-selected', hidden: true });
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'ws-arrows');
  const emptyText = h('p');
  const emptyAction = h('button', { onclick: (e) => (app.page() ? app.addFrameMenu(e.currentTarget) : app.newPage()) });
  const empty = h('div', { class: 'ws-empty' }, emptyText, emptyAction);
  const bar = h('div', { class: 'ws-frame-bar', role: 'toolbar', 'aria-label': 'Screen actions', hidden: true });
  root.append(stage, empty, bar);
  // A pending prototype connection: source frame and hotspot (null for the whole frame) and the last pointer position.
  let link = null;

  const els = new Map();
  // Shelf frames carry their own platform, since one shelf view mixes screens from several pages.
  const host = (frame, page) => ('platform' in frame ? frame : page);
  const readOnly = () => Boolean(app.canvasPage()?.shelf);
  const view = () => app.canvasPage()?.view;
  const zoom = () => view()?.zoom ?? 1;

  function applyView() {
    const v = view() ?? { x: 0, y: 0, zoom: 1 };
    stage.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.zoom})`;
    stage.style.setProperty('--ws-zoom', v.zoom);
    app.onZoom?.(v.zoom);
    placeBar();
  }

  function place(frame) {
    const e = els.get(frame.id);
    if (!e) return;
    e.wrap.style.left = `${frame.x}px`;
    e.wrap.style.top = `${frame.y}px`;
    const box = e.screen ?? e.vp;
    box.style.width = `${frame.width}px`;
    box.style.height = `${frame.height}px`;
  }

  function fill(frame, vp, page) {
    const { settings } = app.ws;
    const overrides = page.overrides ?? app.ws.overrides;
    vp.dataset.palette = settings.palette;
    vp.dataset.mode = settings.mode;
    vp.lang = settings.language;
    const screen = els.get(frame.id)?.screen;
    if (screen) tintDevice(screen, settings);
    // ponytail: scroll positions are restored by element index, so a structural change (e.g. a variant swap) may misplace them; key them by data-key if it matters.
    const scrolls = [...vp.querySelectorAll('*')].map((node) => node.scrollTop);
    const entry = app.entries.get(frame.catalogId);
    vp.replaceChildren(entry
      ? renderFrame(entry, { catalog: app.catalog, settings, overrides, frameId: frame.id, platform: host(frame, page).platform })
      : h('div', { class: 'ws-missing' }, `Missing catalog entry: ${frame.catalogId}`));
    [...vp.querySelectorAll('*')].forEach((node, i) => { if (scrolls[i]) node.scrollTop = scrolls[i]; });
  }

  function frameEl(frame, page) {
    const entry = app.entries.get(frame.catalogId);
    const name = app.frameName(frame);
    const title = h('div', {
      class: 'ws-frame-title',
      tabindex: 0,
      role: 'button',
      'aria-label': `${name}: select frame. Arrow keys move it, Shift for 10 at a time.`,
    }, h('span', { class: 'ws-frame-name' }, name), entry?.status === 'proposed' && h('span', { class: 'ws-badge' }, 'proposed'));
    const vp = h('div', { class: 'orbit-frame' });
    const kind = deviceOf(host(frame, page), app.ws.settings);
    const { device, screen } = kind ? deviceFrame(vp, app.ws.settings, kind) : { device: vp };
    const wrap = h('div', { class: kind ? `ws-frame is-device is-${kind}` : 'ws-frame', 'data-frame-id': frame.id }, title, device);
    els.set(frame.id, { wrap, vp, title, screen });
    place(frame);
    fill(frame, vp, page);
    bindTitle(title, frame);
    return wrap;
  }

  function moved(frame) {
    place(frame);
    updateSelection();
    paint();
    app.save();
  }

  function drag(e, frame, handle) {
    e.preventDefault();
    app.select({ frameId: frame.id, key: null });
    handle.setPointerCapture(e.pointerId);
    const start = { x: e.clientX, y: e.clientY, fx: frame.x, fy: frame.y };
    const move = (ev) => {
      frame.x = Math.round(start.fx + (ev.clientX - start.x) / zoom());
      frame.y = Math.round(start.fy + (ev.clientY - start.y) / zoom());
      place(frame);
      updateSelection();
      schedulePaint();
    };
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      if (frame.x !== start.fx || frame.y !== start.fy) moved(frame);
      app.inspector.render();
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }

  function bindTitle(title, frame) {
    title.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || link) return;
      title.focus();
      if (readOnly()) { app.select({ frameId: frame.id, key: null }); return; }
      drag(e, frame, title);
    });
    title.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 1;
      const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (delta && !readOnly()) {
        e.preventDefault();
        frame.x += delta[0];
        frame.y += delta[1];
        moved(frame);
        app.inspector.render();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        app.select({ frameId: frame.id, key: null });
      }
    });
  }

  function nodeOf(sel) {
    const vp = els.get(sel?.frameId)?.vp;
    if (!vp || !sel.key) return null;
    return [...vp.querySelectorAll('[data-key]')].find((node) => node.dataset.key === sel.key) ?? null;
  }

  function box(div, el) {
    const vp = el?.closest('.orbit-frame');
    if (!el?.isConnected || !vp) { div.hidden = true; return; }
    const r = el.getBoundingClientRect();
    const f = vp.getBoundingClientRect();
    if (r.right < f.left || r.left > f.right || r.bottom < f.top || r.top > f.bottom) { div.hidden = true; return; }
    const o = stage.getBoundingClientRect();
    const z = zoom();
    Object.assign(div.style, { left: `${(r.left - o.left) / z}px`, top: `${(r.top - o.top) / z}px`, width: `${r.width / z}px`, height: `${r.height / z}px` });
    div.hidden = false;
  }

  function updateSelection() {
    const sel = app.selection;
    for (const [id, e] of els) e.wrap.classList.toggle('is-selected', sel?.frameId === id && (!sel.key || app.mode === 'move'));
    box(selected, app.mode === 'move' || readOnly() ? null : nodeOf(sel));
    renderBar();
    schedulePaint();
  }

  const barButton = (name, label, onclick) => h('button', { class: 'ws-icon', 'aria-label': label, title: label, 'data-f': `bar-${name}`, onclick }, icon(name));
  function renderBar() {
    const id = app.selection?.frameId;
    if (!id || !els.has(id) || link) { bar.hidden = true; return; }
    const shelf = app.canvasPage()?.shelf;
    bar.replaceChildren(...kids(shelf ? [
      barButton('restore', 'Restore screen', () => app.restore(shelf, id)),
      shelf === 'trash'
        ? barButton('archive', 'Move to Archived', () => app.moveShelf(id, 'trash', 'archived'))
        : barButton('trash', 'Move to Trash', () => app.moveShelf(id, 'archived', 'trash')),
    ] : [
      app.mode === 'prototype' ? barButton('link', 'Connect the whole screen', (e) => startLink(id, null, e)) : null,
      barButton('archive', 'Archive screen', () => app.shelve(id, 'archived')),
      barButton('trash', 'Move screen to Trash', () => app.shelve(id, 'trash')),
    ]));
    bar.hidden = false;
    placeBar();
  }

  function placeBar() {
    const wrap = els.get(app.selection?.frameId)?.wrap;
    if (!wrap || bar.hidden) return;
    const r = wrap.getBoundingClientRect();
    const o = root.getBoundingClientRect();
    const top = r.top - o.top - (TITLE_HEIGHT + 4) * zoom() - 6;
    const below = top < (readOnly() ? 100 : 46);
    bar.classList.toggle('is-below', below);
    bar.style.left = `${clamp(r.left - o.left + r.width / 2, 60, o.width - 60)}px`;
    bar.style.top = `${below ? Math.min(r.bottom - o.top + 8, o.height - 120) : top}px`;
    bar.style.visibility = r.right < o.left || r.left > o.right || r.bottom < o.top || r.top > o.bottom ? 'hidden' : '';
  }

  function startLink(frameId, hotspotId, e) {
    link = { frameId, hotspotId, x: e.clientX, y: e.clientY };
    root.classList.add('is-linking');
    renderBar();
    schedulePaint();
  }

  function endLink() {
    if (!link) return false;
    link = null;
    root.classList.remove('is-linking');
    for (const e of els.values()) e.wrap.classList.remove('is-link-target');
    renderBar();
    schedulePaint();
    return true;
  }

  function finishLink(frameId) {
    if (frameId === link.frameId) return;
    setConnection(app.ws, link.frameId, link.hotspotId, frameId);
    endLink();
    app.change();
    app.inspector.render();
  }

  function svgEl(tag, attrs, text) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
    if (text) el.textContent = text;
    return el;
  }

  function sourceRect(connection, frame, size) {
    const whole = { l: frame.x, r: frame.x + size.width, cy: frame.y + size.height / 2 };
    if (connection.from.hotspotId == null) return whole;
    const el = [...els.get(frame.id).vp.querySelectorAll('[data-hotspot]')].find((node) => node.dataset.hotspot === connection.from.hotspotId);
    if (!el) return whole;
    const r = el.getBoundingClientRect();
    const o = stage.getBoundingClientRect();
    const z = zoom();
    const x = (px) => clamp((px - o.left) / z, frame.x, frame.x + size.width);
    const y = (px) => clamp((px - o.top) / z, frame.y, frame.y + size.height);
    return { l: x(r.left), r: x(r.right), cy: y((r.top + r.bottom) / 2) };
  }

  function arrow(from, to, label, dim) {
    const z = zoom();
    const dir = to.x >= from.x ? 1 : -1;
    const k = Math.max(40, Math.abs(to.x - from.x) / 2);
    const s = 10 / z;
    const group = svgEl('g', dim ? { opacity: 0.25 } : {});
    svg.append(group);
    group.append(
      svgEl('circle', { class: 'ws-arrow-dot', cx: from.x, cy: from.y, r: 3 / z }),
      svgEl('path', { class: 'ws-arrow', d: `M ${from.x} ${from.y} C ${from.x + dir * k} ${from.y}, ${to.x - dir * k} ${to.y}, ${to.x} ${to.y}` }),
      svgEl('path', { class: 'ws-arrowhead', d: `M ${to.x} ${to.y} L ${to.x - dir * s} ${to.y - s * 0.6} L ${to.x - dir * s} ${to.y + s * 0.6} Z` }),
    );
    if (label) group.append(svgEl('text', { class: 'ws-arrow-label', x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 6 / z, 'font-size': 12 / z, 'text-anchor': 'middle' }, label));
  }

  // ponytail: arrows are redrawn from scratch on every change and show one page at a time; diff the SVG or draw all pages if the frame count grows.
  function paint() {
    svg.replaceChildren();
    const page = app.canvasPage();
    if (!page || app.inspector.tab() !== 'prototype') return;
    const sel = app.selection?.frameId;
    const local = new Map(page.frames.map((frame) => [frame.id, frame]));
    const size = (frame) => outerSize(frame, host(frame, page), app.ws.settings);
    const edge = (frame, side) => ({ x: side > 0 ? frame.x + size(frame).width : frame.x, y: frame.y + size(frame).height / 2 });
    for (const c of app.ws.connections) {
      const src = local.get(c.from.frameId);
      const dst = local.get(c.to.frameId);
      const dim = sel != null && c.from.frameId !== sel && c.to.frameId !== sel;
      const other = app.locate(src ? c.to.frameId : c.from.frameId);
      if (src && dst) {
        const rect = sourceRect(c, src, size(src));
        const dir = dst.x + size(dst).width / 2 >= (rect.l + rect.r) / 2 ? 1 : -1;
        arrow({ x: dir > 0 ? rect.r : rect.l, y: rect.cy }, edge(dst, -dir), null, dim);
      } else if (src && other) {
        const rect = sourceRect(c, src, size(src));
        arrow({ x: rect.r, y: rect.cy }, { x: rect.r + STUB, y: rect.cy }, `→ ${other.page.name} / ${app.frameName(other.frame)}`, dim);
      } else if (dst && other) {
        const to = edge(dst, -1);
        arrow({ x: to.x - STUB, y: to.y }, to, `← ${other.page.name} / ${app.frameName(other.frame)}`, dim);
      }
    }
    const src = link && local.get(link.frameId);
    if (src) {
      const o = stage.getBoundingClientRect();
      const to = { x: (link.x - o.left) / zoom(), y: (link.y - o.top) / zoom() };
      const rect = sourceRect({ from: { hotspotId: link.hotspotId } }, src, size(src));
      arrow({ x: to.x >= (rect.l + rect.r) / 2 ? rect.r : rect.l, y: rect.cy }, to, null, false);
      svg.lastChild.classList.add('is-pending');
    }
  }

  let queued = 0;
  function schedulePaint() {
    if (queued) return;
    queued = requestAnimationFrame(() => { queued = 0; paint(); });
  }

  function zoomAt(next, clientX, clientY) {
    const v = view();
    if (!v) return;
    const z = clamp(Math.round(next * 1000) / 1000, MIN_ZOOM, MAX_ZOOM);
    const r = root.getBoundingClientRect();
    const px = clientX - r.left;
    const py = clientY - r.top;
    v.x = px - ((px - v.x) * z) / v.zoom;
    v.y = py - ((py - v.y) * z) / v.zoom;
    v.zoom = z;
    applyView();
    app.save();
  }

  function zoomFromCenter(factor) {
    const r = root.getBoundingClientRect();
    zoomAt(zoom() * factor, r.left + r.width / 2, r.top + r.height / 2);
  }

  function fit() {
    const page = app.canvasPage();
    const v = view();
    if (!v) return;
    const r = root.getBoundingClientRect();
    if (!page.frames.length) {
      Object.assign(v, { x: 80, y: 80, zoom: 1 });
    } else {
      const left = Math.min(...page.frames.map((f) => f.x));
      const top = Math.min(...page.frames.map((f) => f.y)) - TITLE_HEIGHT - 4;
      const w = Math.max(...page.frames.map((f) => f.x + outerSize(f, host(f, page), app.ws.settings).width)) - left;
      const hgt = Math.max(...page.frames.map((f) => f.y + outerSize(f, host(f, page), app.ws.settings).height)) - top;
      const z = clamp(Math.min((r.width - 96) / w, (r.height - 96) / hgt, 1), MIN_ZOOM, MAX_ZOOM);
      Object.assign(v, { zoom: z, x: (r.width - w * z) / 2 - left * z, y: (r.height - hgt * z) / 2 - top * z });
    }
    applyView();
    app.save();
  }

  function scrollsNatively(e) {
    const vertical = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
    for (let el = e.target; el instanceof Element && el.closest('.orbit-frame'); el = el.parentElement) {
      const s = getComputedStyle(el);
      const [overflow, size, client, pos, delta] = vertical
        ? [s.overflowY, el.scrollHeight, el.clientHeight, el.scrollTop, e.deltaY]
        : [s.overflowX, el.scrollWidth, el.clientWidth, el.scrollLeft, e.deltaX];
      if (/auto|scroll/.test(overflow) && size > client && (delta < 0 ? pos > 0 : pos + client < size - 1)) return true;
    }
    return false;
  }

  root.addEventListener('wheel', (e) => {
    const v = view();
    if (!v) return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      zoomAt(v.zoom * Math.exp(-clamp(e.deltaY, -50, 50) * 0.01), e.clientX, e.clientY);
    } else if (!scrollsNatively(e)) {
      e.preventDefault();
      v.x -= e.deltaX;
      v.y -= e.deltaY;
      applyView();
      app.save();
    }
  }, { passive: false });

  let gestureStart = 1;
  root.addEventListener('gesturestart', (e) => { e.preventDefault(); gestureStart = zoom(); });
  root.addEventListener('gesturechange', (e) => { e.preventDefault(); zoomAt(gestureStart * e.scale, e.clientX, e.clientY); });

  root.addEventListener('pointerdown', (e) => {
    const v = view();
    if (e.button !== 0 || !v || e.target.closest('.ws-frame, .ws-empty, .ws-frame-bar')) return;
    const start = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y, moved: false };
    root.setPointerCapture(e.pointerId);
    root.classList.add('is-panning');
    hover.hidden = true;
    const move = (ev) => {
      start.moved = true;
      v.x = start.vx + ev.clientX - start.x;
      v.y = start.vy + ev.clientY - start.y;
      applyView();
    };
    const up = () => {
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerup', up);
      root.removeEventListener('pointercancel', up);
      root.classList.remove('is-panning');
      if (start.moved) app.save();
      else if (!link) app.select(null);
    };
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerup', up);
    root.addEventListener('pointercancel', up);
  });

  // Move mode: dragging anywhere on a screen moves it, and nothing inside is inspected.
  stage.addEventListener('pointerdown', (e) => {
    const wrap = e.target.closest?.('.ws-frame');
    if (e.button !== 0 || !wrap || link || app.mode !== 'move' || readOnly()) return;
    e.stopPropagation();
    const frame = app.canvasPage()?.frames.find((f) => f.id === wrap.dataset.frameId);
    if (frame) drag(e, frame, wrap);
  }, true);

  stage.addEventListener('click', (e) => {
    const wrap = e.target.closest?.('.ws-frame');
    if (!wrap) return;
    const frameId = wrap.dataset.frameId;
    if (link) {
      e.preventDefault();
      e.stopPropagation();
      finishLink(frameId);
      return;
    }
    const vp = e.target.closest('.orbit-frame');
    if (!vp) return;
    e.preventDefault();
    e.stopPropagation();
    if (readOnly()) { app.select({ frameId, key: null }); return; }
    if (app.mode === 'move') return;
    app.select({ frameId, key: inspectInfo(e.target)?.key ?? null });
    const spot = app.mode === 'prototype' ? e.target.closest('[data-hotspot]') : null;
    if (spot && vp.contains(spot)) startLink(frameId, spot.dataset.hotspot, e);
  }, true);

  stage.addEventListener('pointermove', (e) => {
    const inside = e.target.closest?.('.orbit-frame');
    if (link || app.mode === 'move' || !inside || readOnly()) box(hover, null);
    else if (app.mode === 'prototype') box(hover, e.target.closest('[data-hotspot]'));
    else box(hover, inspectInfo(e.target)?.el);
  });

  root.addEventListener('pointermove', (e) => {
    if (!link) return;
    link.x = e.clientX;
    link.y = e.clientY;
    const target = e.target.closest?.('.ws-frame')?.dataset.frameId;
    for (const [id, el] of els) el.wrap.classList.toggle('is-link-target', id === target && id !== link.frameId);
    schedulePaint();
  });
  root.addEventListener('contextmenu', (e) => {
    if (!link) return;
    e.preventDefault();
    endLink();
  });
  stage.addEventListener('pointerleave', () => { hover.hidden = true; });

  root.addEventListener('scroll', () => { updateSelection(); schedulePaint(); }, true);

  return {
    zoom,
    endLink,
    linking: () => Boolean(link),
    setMode(mode) {
      if (mode !== 'prototype') endLink();
      root.dataset.mode = mode;
      hover.hidden = true;
      updateSelection();
    },
    zoomIn: () => zoomFromCenter(1.25),
    zoomOut: () => zoomFromCenter(0.8),
    zoomReset: () => zoomFromCenter(1 / zoom()),
    fit,
    nodeOf,
    place,
    paint,
    updateSelection,
    viewport: (frameId) => els.get(frameId)?.vp,
    render() {
      const page = app.canvasPage();
      if (link && !page?.frames.some((f) => f.id === link.frameId)) endLink();
      els.clear();
      stage.replaceChildren(...(page?.frames ?? []).map((frame) => frameEl(frame, page)), svg, hover, selected);
      empty.hidden = Boolean(page?.frames.length);
      emptyText.textContent = page?.shelf ? `${page.name} is empty.` : page ? 'This page is empty.' : 'There are no pages.';
      emptyAction.textContent = page ? 'Add frame' : 'New page';
      emptyAction.hidden = Boolean(page?.shelf);
      root.classList.toggle('is-shelf', Boolean(page?.shelf));
      if (page) emptyAction.setAttribute('aria-haspopup', 'menu');
      else emptyAction.removeAttribute('aria-haspopup');
      applyView();
      updateSelection();
      paint();
    },
    refreshContent() {
      const page = app.canvasPage();
      for (const frame of page?.frames ?? []) {
        const e = els.get(frame.id);
        if (e) fill(frame, e.vp, page);
      }
      updateSelection();
      paint();
    },
  };
}
