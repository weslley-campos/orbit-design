// Every catalog frame is built from declared bindings (catalog/*.decl.json), so Inspect reports what was
// declared instead of guessing identity from computed styles.

const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_TAGS = new Set(['svg', 'g', 'circle']);
const ANDROID_NS = 'http://schemas.android.com/apk/res/android';
const STRING_SOURCES = { CoreUiRes: 'assets/core-ui', FeatureAuthRes: 'assets/feature-auth' };
const TYPOGRAPHY_CSS = {
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
  fontFeatureSettings: 'font-feature-settings',
};
const HEX_COLOR = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const DP_VALUE = /^\d+(?:\.\d+)?dp$/;

export const LANGUAGES = ['en', 'pt'];

export const BASE_CSS = `
.orbit-frame, .orbit-frame * { box-sizing: border-box; margin: 0; }
.orbit-frame button { appearance: none; border: 0; padding: 0; background: none; font: inherit; color: inherit; }
.orbit-frame svg { display: block; width: 100%; height: 100%; }
@keyframes orbit-rotate { to { transform: rotate(360deg); } }
`;

const meta = new WeakMap();

export const cssVar = (path) => `--orbit-${path.replaceAll('.', '-')}`;
export const scopeOf = (settings) => `${settings.palette}/${settings.mode}`;

export function tokenEntry(tokens, path, settings) {
  return tokens.invariant[path] ?? tokens.themed[scopeOf(settings)]?.[path] ?? null;
}

export function tokenScope(tokens, path, settings) {
  return path in tokens.invariant ? 'invariant' : scopeOf(settings);
}

// ponytail: only color and dp tokens are editable; typography, gradient, shape and elevation values stay
// read-only until someone needs to tweak them from the inspector.
export function validateTokenOverride(tokens, scope, path, value) {
  const entry = scope === 'invariant' ? tokens.invariant[path] : tokens.themed[scope]?.[path];
  if (!entry) return `Unknown token ${path} in ${scope}`;
  if (entry.derived) return `${path} is derived from ${entry.derived.from}; edit that token instead`;
  if (typeof value !== 'string') return `${path} needs a text value`;
  if (entry.kind === 'color') return HEX_COLOR.test(value) ? null : `${path} needs a #RRGGBB or #RRGGBBAA color`;
  if (entry.kind === 'dimension') return DP_VALUE.test(value) ? null : `${path} needs a dp value such as 20dp`;
  return `${path} (${entry.kind}) is read-only`;
}

export function validateBindingOverride(tokens, baseline, binding) {
  if (!baseline?.token) return 'Only token bindings can be rebound';
  const kindOf = (path) => (tokens.invariant[path] ?? Object.values(tokens.themed)[0]?.[path])?.kind;
  if (!binding || typeof binding.token !== 'string' || !kindOf(binding.token)) return 'Unknown token';
  if (kindOf(binding.token) !== kindOf(baseline.token)) return `${binding.token} is not a ${kindOf(baseline.token)} token`;
  return null;
}

export function validProp(decl, value) {
  if (!decl) return false;
  if (decl.type === 'enum') return decl.values.includes(value);
  return typeof value === decl.type;
}

// The returned rules must be placed after tokens.css so they win at equal specificity.
export function overridesCss(tokens, overrides) {
  return Object.entries(overrides?.tokens ?? {}).map(([scope, values]) => {
    const [palette, mode] = scope.split('/');
    const selector = scope === 'invariant' ? ':root' : `[data-palette="${palette}"][data-mode="${mode}"]`;
    const body = Object.entries(values)
      .filter(([path, value]) => !validateTokenOverride(tokens, scope, path, value))
      .map(([path, value]) => `${cssVar(path)}: ${value.replace(/dp$/, 'px')};`)
      .join(' ');
    return `${selector} { ${body} }`;
  }).join('\n');
}

const literalCss = (value) => String(value).replace(/(\d)(?:dp|sp)\b/g, '$1px');

function bindingCss(binding) {
  if (Array.isArray(binding)) return binding.map(bindingCss).join(' ');
  if (binding.token) {
    const reference = `var(${cssVar(binding.token)})`;
    if (binding.alpha == null) return reference;
    return `color-mix(in srgb, ${reference} ${Math.round(binding.alpha * 1000) / 10}%, transparent)`;
  }
  if (binding.literal != null) return literalCss(binding.literal);
  return binding.css ?? '';
}

function bindingKotlin(binding) {
  if (Array.isArray(binding)) return binding.map(bindingKotlin).join(', ');
  if (binding.token) return `OrbitTheme.${binding.token}${binding.alpha == null ? '' : `.copy(alpha = ${binding.alpha}f)`}`;
  if (binding.literal != null) return String(binding.literal).replace(/(\d)(dp|sp)\b/g, '$1.$2');
  if (binding.resource) return `painterResource(${binding.resource})`;
  return `/* unmapped: ${binding.unmapped} */`;
}

function resolvedCss(entry) {
  if (!entry) return 'unresolved';
  if (entry.css && typeof entry.css === 'object') {
    const { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } = entry.css;
    return `${fontFamily} ${fontWeight} ${fontSize}/${lineHeight} · ${letterSpacing}`;
  }
  return entry.css ?? String(entry.value);
}

// One inspector row per declared part: { label, kotlin, resolved, note, kind, token, scope }.
export function describeBinding(binding, catalog, settings, overrides) {
  if (Array.isArray(binding)) return binding.flatMap((part) => describeBinding(part, catalog, settings, overrides));
  if (binding.token) {
    const entry = tokenEntry(catalog.tokens, binding.token, settings);
    const scope = tokenScope(catalog.tokens, binding.token, settings);
    const draft = overrides?.tokens?.[scope]?.[binding.token];
    return [{
      label: binding.token,
      kotlin: bindingKotlin(binding),
      resolved: draft ?? resolvedCss(entry),
      baseline: resolvedCss(entry),
      note: entry?.approximation ?? binding.source ?? null,
      kind: entry?.kind ?? 'unresolved',
      token: binding.token,
      scope,
      overridden: draft != null,
    }];
  }
  if (binding.literal != null) {
    return [{
      label: 'no token',
      kotlin: bindingKotlin(binding),
      resolved: literalCss(binding.literal),
      note: binding.source ?? `proposal: ${binding.proposal}`,
      kind: 'literal',
    }];
  }
  if (binding.resource) {
    return [{
      label: binding.resource.replace('{palette}', settings.palette),
      kotlin: bindingKotlin(binding).replace('{palette}', settings.palette),
      resolved: catalog.tokens.resources?.[binding.resource.replace('{palette}', settings.palette)] ?? 'design/assets/proposed',
      note: binding.artwork ? 'intrinsic artwork colors' : binding.proposal ? `proposal: ${binding.proposal}` : null,
      kind: 'resource',
    }];
  }
  return [{ label: 'unmapped', kotlin: bindingKotlin(binding), resolved: binding.css ?? '', note: binding.unmapped, kind: 'unmapped' }];
}

export function composeSnippet(info, catalog) {
  const lines = [];
  const used = new Set();
  const component = catalog.decls.components[info.component];
  const tokenOf = (prop) => {
    const binding = info.bindings.find((row) => row.prop === prop)?.binding;
    if (!binding?.token) return null;
    used.add(prop);
    return bindingKotlin(binding);
  };
  if (component?.snippet) {
    lines.push(component.snippet.replace(/\{(\w+)\}/g, (match, name) => info.props?.[name] ?? match));
  } else if (info.text) {
    const text = info.text.resource && !info.text.resource.startsWith('proposed.')
      ? `stringResource(${info.text.resource})`
      : JSON.stringify(info.text.value);
    const style = tokenOf('font');
    const color = tokenOf('color');
    lines.push('Text(', `    text = ${text},`);
    if (style) lines.push(`    style = ${style},`);
    if (color) lines.push(`    color = ${color},`);
    lines.push(')');
  }
  for (const { prop, binding, overridden } of info.bindings) {
    if (used.has(prop)) continue;
    const parts = [binding].flat();
    const flags = [
      parts.some((part) => part.literal != null) && 'no token',
      parts.some((part) => part.unmapped) && 'unmapped',
      overridden && 'workspace override',
    ].filter(Boolean);
    lines.push(`// ${prop}: ${bindingKotlin(binding)}${flags.length ? ` (${flags.join(', ')})` : ''}`);
  }
  if (info.text?.overridden) lines.push('// text: workspace override');
  if (info.inactive) lines.push(`// inactive: ${info.inactive}`);
  return lines.join('\n');
}

export function inspectInfo(target) {
  for (let el = target; el; el = el.parentElement) {
    const info = meta.get(el);
    if (info) return { ...info, el };
  }
  return null;
}

const unescapeAndroid = (text) => text.replace(/\\n/g, '\n').replace(/\\(['"@?])/g, '$1');

function format(template, args) {
  let next = 0;
  return template.replace(/%(?:(\d+)\$)?[sd]/g, (_, index) => String(args[index ? index - 1 : next++] ?? ''));
}

function androidColor(color) {
  if (!color) return null;
  if (color.length === 9) return `#${color.slice(3)}${color.slice(1, 3)}`;
  if (color.length === 5) return `#${color.slice(2)}${color[1]}`;
  return color;
}

// ponytail: flattens <group> transforms and ignores clip paths and gradients, which the current flat
// icons do not use; convert through a real vector-drawable parser if an icon needs them.
function vectorToSvg(vector) {
  const android = (el, name) => el.getAttributeNS(ANDROID_NS, name);
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${android(vector, 'viewportWidth')} ${android(vector, 'viewportHeight')}`);
  for (const path of vector.getElementsByTagName('path')) {
    const out = document.createElementNS(SVG_NS, 'path');
    out.setAttribute('d', android(path, 'pathData'));
    out.setAttribute('fill', androidColor(android(path, 'fillColor')) ?? 'none');
    if (android(path, 'fillType') === 'evenOdd') out.setAttribute('fill-rule', 'evenodd');
    if (android(path, 'strokeColor')) {
      out.setAttribute('stroke', androidColor(android(path, 'strokeColor')));
      out.setAttribute('stroke-width', android(path, 'strokeWidth') ?? '1');
      out.setAttribute('stroke-linecap', android(path, 'strokeLineCap') ?? 'butt');
      out.setAttribute('stroke-linejoin', android(path, 'strokeLineJoin') ?? 'miter');
    }
    svg.append(out);
  }
  return svg;
}

function parseDrawable(text, path) {
  if (path.endsWith('.xml')) return vectorToSvg(new DOMParser().parseFromString(text, 'application/xml').documentElement);
  const svg = document.importNode(new DOMParser().parseFromString(text, 'image/svg+xml').documentElement, true);
  if (!svg.hasAttribute('viewBox')) {
    svg.setAttribute('viewBox', `0 0 ${parseFloat(svg.getAttribute('width'))} ${parseFloat(svg.getAttribute('height'))}`);
  }
  return svg;
}

function drawable(binding, catalog, settings) {
  const resource = binding.resource.replace('{palette}', settings.palette);
  const source = catalog.drawables.get(resource);
  if (!source) {
    console.error(`Unknown drawable "${resource}"`);
    return null;
  }
  const svg = source.cloneNode(true);
  svg.setAttribute('aria-hidden', 'true');
  if (!binding.artwork) {
    for (const shape of svg.querySelectorAll('[fill], [stroke]')) {
      for (const name of ['fill', 'stroke']) {
        if (shape.hasAttribute(name) && shape.getAttribute(name) !== 'none') shape.setAttribute(name, 'currentColor');
      }
    }
  }
  return svg;
}

function collectResources(value, found = new Set()) {
  if (Array.isArray(value)) value.forEach((item) => collectResources(item, found));
  else if (value && typeof value === 'object') {
    if (typeof value.resource === 'string') found.add(value.resource);
    Object.values(value).forEach((item) => collectResources(item, found));
  }
  return found;
}

// `assets` lists extra text files (paths relative to design/) that frames read synchronously with ctx.asset().
export async function loadCatalog({ assets = [], base = new URL('../', import.meta.url) } = {}) {
  const text = async (path) => {
    const response = await fetch(new URL(path, base), { cache: 'no-cache' });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.text();
  };
  const json = async (path) => JSON.parse(await text(path));
  const [tokens, components, screens, emails, proposed] = await Promise.all([
    json('tokens.json'),
    json('catalog/components.decl.json'),
    json('catalog/screens.decl.json'),
    json('catalog/emails.decl.json'),
    json('catalog/strings.proposed.json'),
  ]);
  const decls = {
    components: { ...components.components, ...screens.components, ...emails.components },
    styles: { ...components.styles, ...screens.styles, ...emails.styles },
  };

  const strings = { en: {}, pt: {} };
  const stringOwners = {};
  await Promise.all(Object.entries(STRING_SOURCES).flatMap(([owner, root]) => LANGUAGES.map(async (language) => {
    const folder = language === 'en' ? 'values' : `values-${language}`;
    const xml = new DOMParser().parseFromString(await text(`${root}/${folder}/strings.xml`), 'application/xml');
    for (const string of xml.getElementsByTagName('string')) {
      const name = string.getAttribute('name');
      strings[language][name] = unescapeAndroid(string.textContent);
      stringOwners[name] = owner;
    }
  })));
  for (const language of LANGUAGES) {
    for (const [name, value] of Object.entries(proposed[language] ?? {})) {
      strings[language][name] = value;
      stringOwners[name] = 'proposed';
    }
  }

  const drawablePaths = Object.fromEntries(Object.entries(tokens.resources ?? {}).filter(([name]) => name.includes('.drawable.')));
  for (const resource of collectResources(decls)) {
    if (resource.startsWith('proposed.drawable.')) drawablePaths[resource] = `assets/proposed/${resource.split('.')[2]}.svg`;
  }
  const drawables = new Map(await Promise.all(Object.entries(drawablePaths).map(async ([resource, path]) => (
    [resource, parseDrawable(await text(path), path)]
  ))));

  const loaded = new Map(await Promise.all(assets.map(async (path) => [path, await text(path)])));
  return { tokens, decls, strings, stringOwners, drawables, assets: loaded };
}

export function createContext({ catalog, settings, overrides = {}, frameId = null, entry = null, platform = null }) {
  const seen = new Set();
  const propsByKey = new Map();
  const nodeOverride = (key) => overrides.frames?.[frameId]?.[key] ?? {};
  const template = (key) => catalog.strings[settings.language]?.[key] ?? catalog.strings.en[key];

  return {
    catalog,
    settings,
    platform,
    tokens: catalog.tokens,
    asset: (path) => catalog.assets.get(path) ?? '',
    token: (path) => tokenEntry(catalog.tokens, path, settings),

    // Without args the raw template is returned, placeholders included.
    t(key, ...args) {
      const value = template(key);
      if (value == null) {
        console.error(`Unknown string "${key}"`);
        return key;
      }
      return args.length ? format(value, args) : value;
    },

    props(key, component, given = {}) {
      const declared = catalog.decls.components[component]?.props ?? {};
      const defaults = Object.fromEntries(Object.entries(declared).map(([name, decl]) => [name, decl.default]));
      const baseline = { ...defaults, ...given };
      const resolved = { ...baseline };
      for (const [name, value] of Object.entries(nodeOverride(key).props ?? {})) {
        if (validProp(declared[name], value)) resolved[name] = value;
      }
      propsByKey.set(key, { resolved, baseline, declared });
      return resolved;
    },

    node({
      key, tag = 'div', styles = [], bind = {}, component, variant, state,
      textKey, textArgs = [], text, attrs = {}, children = [], hotspot = false, inactive, source,
    }) {
      if (!key) throw new Error(`A node in ${entry?.id ?? 'a frame'} has no key`);
      if (seen.has(key)) console.error(`Duplicate node key "${key}" in ${entry?.id}`);
      seen.add(key);

      const el = SVG_TAGS.has(tag) ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);
      el.dataset.key = key;
      if (hotspot) el.dataset.hotspot = key;
      for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);

      const baseline = {};
      const css = {};
      for (const id of styles.filter(Boolean)) {
        const style = catalog.decls.styles[id];
        if (!style) {
          console.error(`Unknown style "${id}" on "${key}"`);
          continue;
        }
        Object.assign(baseline, style.bind);
        Object.assign(css, style.css);
      }
      for (const [prop, binding] of Object.entries(bind)) {
        if (!binding?.token) throw new Error(`Inline binding "${prop}" on "${key}" must reference a token`);
        baseline[prop] = binding;
      }
      const override = nodeOverride(key);
      const bindings = Object.entries(baseline).map(([prop, binding]) => {
        const draft = override.bindings?.[prop];
        const overridden = draft != null && !validateBindingOverride(catalog.tokens, binding, draft);
        return { prop, binding: overridden ? draft : binding, baseline: binding, overridden };
      });

      for (const { prop, binding } of bindings) {
        if (prop === 'icon') {
          const svg = drawable(binding, catalog, settings);
          if (svg) el.append(svg);
        } else if (prop === 'font' && binding.token) {
          for (const [part, name] of Object.entries(TYPOGRAPHY_CSS)) {
            el.style.setProperty(name, `var(${cssVar(binding.token)}-${part})`);
          }
        } else {
          el.style.setProperty(prop, bindingCss(binding));
        }
      }
      // Layout css goes last: a bound `border` shorthand would otherwise reset `border-style`.
      for (const [prop, value] of Object.entries(css)) el.style.setProperty(prop, value);

      let textInfo = null;
      if (textKey != null || text != null) {
        const baselineText = textKey != null ? format(template(textKey) ?? textKey, textArgs) : String(text);
        const draft = override.text?.[settings.language];
        const value = typeof draft === 'string' ? draft : baselineText;
        el.append(document.createTextNode(value));
        textInfo = {
          resource: textKey != null ? `${catalog.stringOwners[textKey] ?? 'unknown'}.string.${textKey}` : null,
          baseline: baselineText,
          value,
          overridden: typeof draft === 'string',
        };
      }
      el.append(...children.flat(Infinity).filter(Boolean));

      const props = component ? propsByKey.get(key) : null;
      meta.set(el, {
        frameId,
        key,
        component: component ?? null,
        variant: variant ?? null,
        state: state ?? null,
        props: props?.resolved ?? null,
        baselineProps: props?.baseline ?? null,
        propDecls: props?.declared ?? null,
        source: source ?? catalog.decls.components[component]?.source ?? entry?.source ?? null,
        styles,
        bindings,
        text: textInfo,
        hotspot,
        inactive: inactive ?? null,
      });
      return el;
    },
  };
}

// A frame that fails to render shows its error instead of breaking the canvas.
export function renderFrame(entry, options) {
  try {
    return entry.render(createContext({ ...options, entry }));
  } catch (error) {
    console.error(`Frame ${entry.id} failed to render`, error);
    const failure = document.createElement('pre');
    failure.textContent = `${entry.id} failed to render:\n${error.message}`;
    return failure;
  }
}

export function hotspotsOf(entry, catalog, settings) {
  const root = renderFrame(entry, { catalog, settings });
  return [...root.querySelectorAll('[data-hotspot]')].map((el) => ({
    id: el.dataset.hotspot,
    label: el.textContent.trim().slice(0, 40) || el.getAttribute('aria-label') || el.dataset.hotspot,
  }));
}
