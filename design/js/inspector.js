import { h, preserveFocus } from './dom.js';
import {
  composeSnippet, describeBinding, inspectInfo, scopeOf, tokenEntry, validateBindingOverride, validateTokenOverride, validProp,
} from '../catalog/core.js';
import { setConnection, connectionOf, setOverride } from './store.js';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = h('textarea', { value: text, 'aria-hidden': 'true' });
    document.body.append(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* falls through to the failure message */ }
    area.remove();
    return ok;
  }
}

export function createInspector(app) {
  const panel = document.getElementById('panel');
  const tabs = { inspect: document.getElementById('tab-inspect'), prototype: document.getElementById('tab-prototype') };
  let tab = 'inspect';

  function showTab(name) {
    tab = name;
    for (const [id, button] of Object.entries(tabs)) button.setAttribute('aria-selected', String(id === name));
    panel.setAttribute('aria-labelledby', `tab-${name}`);
    render();
    app.canvas.paint();
    app.onTab?.(name);
  }
  for (const [id, button] of Object.entries(tabs)) button.onclick = () => showTab(id);

  const pairs = (rows) => h('dl', { class: 'ws-pairs' }, ...rows.flatMap(([term, value]) => [h('dt', {}, term), h('dd', {}, value)]));
  const hint = (text) => h('p', { class: 'ws-hint' }, text);

  function field(label, control, baselineText, isDraft, onReset) {
    const badge = h('span', { class: 'ws-badge ws-badge-edit' }, 'edited');
    const error = h('div', { class: 'ws-error', role: 'alert' });
    const reset = h('button', { type: 'button', onclick: () => { onReset(); sync(); } }, 'Reset to source');
    const sync = () => { badge.hidden = reset.hidden = !isDraft(); };
    sync();
    const el = h('div', { class: 'ws-field' },
      h('label', {}, h('span', {}, label), control),
      h('div', { class: 'ws-baseline' }, `Source: ${baselineText}`, ' ', badge),
      reset, error);
    return { el, sync, fail: (message) => { error.textContent = message ?? ''; } };
  }

  function frameView({ frame, page }) {
    const entry = app.entries.get(frame.catalogId);
    const number = (label, prop, min) => h('label', {}, h('span', {}, label), h('input', {
      type: 'number', step: 1, min, value: frame[prop], 'data-f': `frame-${prop}`,
      oninput: (e) => {
        const value = e.target.valueAsNumber;
        if (!Number.isFinite(value) || (min != null && value < min)) return;
        frame[prop] = Math.round(value);
        app.canvas.place(frame);
        app.canvas.paint();
        app.canvas.updateSelection();
        app.save();
      },
    }));
    return [
      h('h3', {}, app.frameName(frame)),
      pairs([
        ['Catalog id', frame.catalogId],
        ['Source', entry?.source ?? 'missing catalog entry'],
        ['Status', entry?.status ?? 'missing'],
        ['Page', page.name],
        ['Frame id', frame.id],
      ]),
      h('div', { class: 'ws-geometry' }, number('X', 'x'), number('Y', 'y'), number('Width', 'width', 1), number('Height', 'height', 1)),
    ];
  }

  function nodeView(info) {
    const { ws, catalog } = app;
    const nodePath = ['frames', info.frameId, info.key];
    const draftNode = () => ws.overrides.frames?.[info.frameId]?.[info.key];
    const out = [h('h3', {}, info.component ?? 'Element')];
    out.push(pairs([
      ['Variant / state', [info.variant, info.state].filter(Boolean).join(' / ') || 'none'],
      ['Source', info.source ?? 'unknown'],
      ['Size', `${info.el.offsetWidth} × ${info.el.offsetHeight} dp`],
      ['Node', info.key],
      info.text && ['Text', info.text.value],
      info.text && ['String resource', info.text.resource ?? 'sample text'],
      info.props && ['Props', Object.entries(info.props).map(([name, value]) => `${name} = ${value}`).join(', ')],
      info.inactive && ['Inactive', info.inactive],
    ].filter(Boolean)));

    if (info.text) {
      const language = ws.settings.language;
      const path = [...nodePath, 'text', language];
      const area = h('textarea', {
        rows: 3, value: info.text.value, 'data-f': 'text',
        oninput: () => {
          setOverride(ws.overrides, path, area.value === info.text.baseline ? undefined : area.value);
          app.change();
          editor.sync();
        },
      });
      const editor = field(`Text (${language})`, area, JSON.stringify(info.text.baseline), () => typeof draftNode()?.text?.[language] === 'string', () => {
        setOverride(ws.overrides, path, undefined);
        area.value = info.text.baseline;
        app.change();
      });
      out.push(h('h4', {}, 'Edit text'), editor.el);
    }

    const editableProps = Object.entries(info.propDecls ?? {}).filter(([, decl]) => decl.type === 'enum' || decl.type === 'boolean');
    if (editableProps.length) out.push(h('h4', {}, 'Edit props'));
    for (const [name, decl] of editableProps) {
      const path = [...nodePath, 'props', name];
      const baseline = info.baselineProps[name];
      let editor;
      const apply = (value) => {
        if (!validProp(decl, value)) { editor.fail(`Invalid value for ${name}`); return; }
        setOverride(ws.overrides, path, value === baseline ? undefined : value);
        app.change();
        render();
      };
      const control = decl.type === 'enum'
        ? h('select', { 'data-f': `prop-${name}`, value: info.props[name], onchange: (e) => apply(e.target.value) }, ...decl.values.map((v) => h('option', { value: v }, v)))
        : h('input', { type: 'checkbox', 'data-f': `prop-${name}`, checked: info.props[name], onchange: (e) => apply(e.target.checked) });
      editor = field(name, control, String(baseline), () => draftNode()?.props?.[name] !== undefined, () => { setOverride(ws.overrides, path, undefined); app.change(); render(); });
      out.push(editor.el);
    }

    out.push(h('h4', {}, 'Bindings'));
    if (!info.bindings.length) out.push(hint('This node declares no bindings.'));
    const edited = new Set();
    for (const binding of info.bindings) {
      const rows = describeBinding(binding.binding, catalog, ws.settings, ws.overrides);
      const card = h('div', { class: 'ws-binding' }, h('h5', {}, binding.prop, binding.overridden && h('span', { class: 'ws-badge ws-badge-edit' }, 'rebound')));
      for (const row of rows) {
        card.append(h('div', { class: 'ws-binding-row' },
          h('strong', { class: row.kind === 'literal' || row.kind === 'unmapped' ? 'ws-flag' : '' }, row.label),
          h('div', {}, h('code', {}, row.kotlin), ' → ', row.resolved),
          row.note && h('small', {}, row.note)));
      }
      if (!Array.isArray(binding.binding) && binding.baseline.token) card.append(bindingEditor(binding, info));
      for (const row of rows) {
        if (row.token && !edited.has(row.token) && (row.kind === 'color' || row.kind === 'dimension')) {
          edited.add(row.token);
          card.append(tokenEditor(row));
        }
      }
      out.push(card);
    }

    const snippet = composeSnippet(info, catalog);
    const status = h('span', { role: 'status', class: 'ws-hint' });
    out.push(
      h('h4', {}, 'Compose reference'),
      h('pre', { class: 'ws-snippet' }, snippet),
      h('button', { type: 'button', onclick: async () => { status.textContent = (await copyText(snippet)) ? 'Copied' : 'Copy failed'; } }, 'Copy'),
      status,
    );
    return out;
  }

  function bindingEditor(binding, info) {
    const { ws, catalog } = app;
    const tokens = catalog.tokens;
    const kind = tokenEntry(tokens, binding.baseline.token, ws.settings)?.kind;
    // ponytail: rebinding keeps only the baseline alpha, it cannot be edited; add an alpha field if needed.
    const candidates = [...Object.keys(tokens.invariant), ...Object.keys(tokens.themed[scopeOf(ws.settings)] ?? {})]
      .filter((path) => tokenEntry(tokens, path, ws.settings)?.kind === kind).sort();
    const path = ['frames', info.frameId, info.key, 'bindings', binding.prop];
    let editor;
    const control = h('select', {
      'data-f': `binding-${binding.prop}`,
      value: binding.binding.token,
      onchange: (e) => {
        const next = { token: e.target.value };
        if (binding.baseline.alpha != null) next.alpha = binding.baseline.alpha;
        const error = next.token === binding.baseline.token ? null : validateBindingOverride(tokens, binding.baseline, next);
        if (error) { editor.fail(error); return; }
        setOverride(ws.overrides, path, next.token === binding.baseline.token ? undefined : next);
        app.change();
        render();
      },
    }, ...candidates.map((candidate) => h('option', { value: candidate }, candidate)));
    editor = field(`Token for ${binding.prop}`, control, binding.baseline.token, () => binding.overridden, () => {
      setOverride(ws.overrides, path, undefined);
      app.change();
      render();
    });
    return editor.el;
  }

  function tokenEditor(row) {
    const { ws, catalog } = app;
    const entry = tokenEntry(catalog.tokens, row.token, ws.settings);
    if (entry.derived) return hint(`${row.token} is derived from ${entry.derived.from}; edit that token instead.`);
    const path = ['tokens', row.scope, row.token];
    const draft = () => ws.overrides.tokens?.[row.scope]?.[row.token];
    const baseline = entry.kind === 'color' ? entry.css : `${parseFloat(entry.css)}dp`;
    let editor;
    const apply = (value, live) => {
      const error = value === baseline ? null : validateTokenOverride(catalog.tokens, row.scope, row.token, value);
      editor.fail(error);
      if (error) return;
      setOverride(ws.overrides, path, value === baseline ? undefined : value);
      app.change();
      if (!live) render();
    };
    let control;
    if (entry.kind === 'color') {
      const text = h('input', { type: 'text', value: draft() ?? baseline, 'data-f': `token-${row.token}`, spellcheck: false, onchange: (e) => apply(e.target.value.trim()) });
      const picker = h('input', {
        type: 'color', value: (draft() ?? baseline).slice(0, 7).toLowerCase(), 'aria-label': `Pick ${row.token}`, 'data-f': `picker-${row.token}`,
        oninput: (e) => { text.value = e.target.value.toUpperCase(); apply(text.value, true); },
        onchange: () => apply(text.value),
      });
      control = h('span', { class: 'ws-inline' }, text, picker);
    } else {
      control = h('input', { type: 'number', min: 0, step: 1, value: parseFloat(draft() ?? baseline), 'data-f': `token-${row.token}`, onchange: (e) => apply(`${e.target.value}dp`) });
    }
    editor = field(`Value of ${row.token}`, control, baseline, () => draft() !== undefined, () => { setOverride(ws.overrides, path, undefined); app.change(); render(); });
    return h('div', {}, editor.el, hint(`Changes every consumer of ${row.token} in ${row.scope === 'invariant' ? 'all palettes and modes' : row.scope}.`));
  }

  // ponytail: connections are made with a destination select, not by dragging an arrow; add drag-to-connect on the canvas if the select gets tedious.
  function groupedFrames(current, exclude, label, onchange) {
    return h('select', { 'aria-label': label, value: current ?? '', onchange: (e) => onchange(e.target.value || null) },
      h('option', { value: '' }, 'None'),
      ...app.ws.pages.map((page) => h('optgroup', { label: page.name },
        ...page.frames.filter((frame) => frame.id !== exclude).map((frame) => h('option', { value: frame.id }, `${app.frameName(frame)} (${page.name})`)))));
  }

  function prototypeView() {
    const { ws } = app;
    const out = [h('label', { class: 'ws-field' }, h('span', {}, 'Start frame'), groupedFrames(ws.startFrameId, null, 'Start frame', (value) => {
      ws.startFrameId = value;
      app.change();
    }))];
    const loc = app.selection && app.locate(app.selection.frameId);
    if (!loc) return [...out, hint('Select a frame on the canvas to connect it to another frame.')];
    const vp = app.canvas.viewport(loc.frame.id);
    const spots = [...(vp?.querySelectorAll('[data-hotspot]') ?? [])].map((el) => ({
      id: el.dataset.hotspot,
      label: el.textContent.trim().slice(0, 40) || el.getAttribute('aria-label') || el.dataset.hotspot,
      inactive: inspectInfo(el)?.inactive,
    }));
    out.push(h('h3', {}, app.frameName(loc.frame)));
    for (const spot of [{ id: null, label: 'Whole frame' }, ...spots]) {
      const connection = connectionOf(ws, loc.frame.id, spot.id);
      out.push(h('div', { class: 'ws-binding' },
        h('h5', {}, spot.label),
        spot.inactive && h('small', {}, `Inactive in the app: ${spot.inactive}`),
        h('div', {}, `Source: ${app.frameName(loc.frame)}${spot.id ? ` / ${spot.id}` : ''} · Trigger: click`),
        h('label', {}, h('span', {}, 'Destination'), groupedFrames(connection?.to.frameId, loc.frame.id, `Destination of ${spot.label}`, (value) => {
          setConnection(ws, loc.frame.id, spot.id, value);
          app.change();
          render();
        }))));
    }
    return out;
  }

  function inspectView() {
    const sel = app.selection;
    const loc = sel && app.locate(sel.frameId);
    if (!loc) return [hint('Click inside a frame to inspect an element, or select a frame title.')];
    const node = app.canvas.nodeOf(sel);
    return node ? nodeView(inspectInfo(node)) : frameView(loc);
  }

  function render() {
    preserveFocus(panel, () => panel.replaceChildren(...(tab === 'inspect' ? inspectView() : prototypeView())));
  }

  return { render, showTab, tab: () => tab };
}
