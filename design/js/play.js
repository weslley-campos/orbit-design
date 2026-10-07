import { deviceFrame, deviceOf, h, outerSize } from './dom.js';
import { renderFrame } from '../catalog/core.js';
import { connectionOf } from './store.js';

export function openPlay(app, opener) {
  const { ws } = app;
  const dialog = h('dialog', { class: 'ws-play', 'aria-label': 'Prototype' });
  let refit = () => {};
  let start = () => {};
  dialog.addEventListener('close', () => {
    removeEventListener('resize', refit);
    dialog.remove();
    opener.focus();
  });

  if (!app.locate(ws.startFrameId)) {
    dialog.append(
      h('p', {}, 'Pick a start frame in the Prototype tab to play the prototype.'),
      h('button', { onclick: () => { app.inspector.showTab('prototype'); dialog.close(); } }, 'Open Prototype tab'),
      h('button', { onclick: () => dialog.close() }, 'Close'),
    );
  } else {
    let current = ws.startFrameId;
    let history = [];
    const viewport = h('div', { class: 'orbit-frame' });
    const holder = h('div', { class: 'ws-play-holder' }, viewport);
    let scaled = viewport;
    const title = h('span', { class: 'ws-play-title', role: 'status' });
    const back = h('button', { onclick: () => { current = history.pop(); show(); } }, 'Back');

    const bar = h('div', { class: 'ws-play-bar' }, back,
      h('button', { onclick: () => { history = []; current = ws.startFrameId; show(); } }, 'Restart'),
      h('button', { onclick: () => dialog.close() }, 'Exit'), title);

    function fit() {
      const { frame, page } = app.locate(current);
      const size = outerSize(frame, page, ws.settings);
      const scale = Math.min(1, (innerWidth - 48) / size.width, (innerHeight - bar.offsetHeight - 70) / size.height);
      scaled.style.transform = `scale(${scale})`;
      Object.assign(holder.style, { width: `${size.width * scale}px`, height: `${size.height * scale}px` });
    }

    function show() {
      const { frame, page } = app.locate(current);
      const { settings, overrides } = ws;
      const entry = app.entries.get(frame.catalogId);
      Object.assign(viewport.dataset, { palette: settings.palette, mode: settings.mode });
      viewport.lang = settings.language;
      const kind = deviceOf(page, settings);
      Object.assign(viewport.style, { width: kind ? '' : `${frame.width}px`, height: kind ? '' : `${frame.height}px`, transform: '' });
      const device = kind ? deviceFrame(viewport, settings, kind) : null;
      if (device) device.screen.style.cssText = `width:${frame.width}px;height:${frame.height}px`;
      scaled = device?.device ?? viewport;
      scaled.style.transformOrigin = '0 0';
      holder.replaceChildren(scaled);
      fit();
      viewport.replaceChildren(entry
        ? renderFrame(entry, { catalog: app.catalog, settings, overrides, frameId: frame.id, platform: page.platform })
        : h('div', { class: 'ws-missing' }, `Missing catalog entry: ${frame.catalogId}`));
      for (const spot of viewport.querySelectorAll('[data-hotspot]')) {
        if (!connectionOf(ws, current, spot.dataset.hotspot)) continue;
        spot.tabIndex = 0;
        spot.setAttribute('role', 'button');
        spot.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); spot.click(); }
        });
      }
      back.disabled = !history.length;
      title.textContent = app.frameName(frame);
    }

    viewport.addEventListener('click', (e) => {
      e.preventDefault();
      let connection;
      for (let el = e.target; el && el !== viewport && !connection; el = el.parentElement) {
        if (el.dataset?.hotspot != null) connection = connectionOf(ws, current, el.dataset.hotspot);
      }
      connection ??= connectionOf(ws, current, null);
      if (!connection || !app.locate(connection.to.frameId)) return;
      history.push(current);
      current = connection.to.frameId;
      show();
    });

    dialog.append(bar, holder);
    refit = fit;
    addEventListener('resize', refit);
    start = show;
  }
  document.body.append(dialog);
  dialog.showModal();
  start();
}
