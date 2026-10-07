import { OrbitScaffold } from './components.js';

const THEME = 'core/ui/src/commonMain/kotlin/br/com/weslleycampos/orbit/core/ui/theme/';

const entriesOf = (ctx, kind, prefix) => {
  const { invariant, themed } = ctx.tokens;
  const scope = themed[`${ctx.settings.palette}/${ctx.settings.mode}`] ?? {};
  return Object.entries({ ...invariant, ...scope }).filter(([path, entry]) => entry.kind === kind && path.startsWith(prefix));
};

const resolved = (entry) => (typeof entry.css === 'string' ? entry.css : `${entry.css.fontSize}/${entry.css.lineHeight} ${entry.css.fontWeight}`);

const labelled = (ctx, path, entry, sample) => ctx.node({
  key: `${path}/swatch`,
  styles: ['DesignSystem/swatch'],
  source: entry.source,
  children: [
    sample,
    ctx.node({ key: `${path}/caption`, styles: ['DesignSystem/caption'], text: path }),
    ctx.node({ key: `${path}/value`, styles: ['DesignSystem/value'], text: resolved(entry) }),
  ],
});

const group = (ctx, key, title, children) => ctx.node({
  key,
  styles: ['DesignSystem/group'],
  children: [ctx.node({ key: `${key}/title`, styles: ['DesignSystem/groupTitle'], text: title }), ctx.node({ key: `${key}/row`, styles: ['DesignSystem/row'], children })],
});

const page = (ctx, title, children) => OrbitScaffold(ctx, { key: 'root' }, [ctx.node({
  key: 'page',
  styles: ['DesignSystem/page'],
  children: [ctx.node({ key: 'heading', styles: ['DesignSystem/heading'], text: title }), ...children],
})]);

const sample = (ctx, path, entry, style, bind) => labelled(ctx, path, entry, ctx.node({ key: `${path}/sample`, styles: [style], bind, source: entry.source }));
const bound = (property) => (path) => ({ [property]: { token: path } });
const frame = (slug, name, viewport, source, render) => ({ id: `design-system/${slug}`, name, group: 'Design system', viewport, status: 'implemented', source, render });

const byGroup = (entries, depth) => Object.entries(Object.groupBy(entries, ([path]) => path.split('.')[depth]));

const section = (ctx, prefix, kind, key, style, property, depth) => byGroup(entriesOf(ctx, kind, prefix), depth).map(([name, entries]) => group(
  ctx, `${key}-${name}`, name,
  entries.map(([path, entry]) => sample(ctx, path, entry, style, bound(property)(path))),
));

const typeRow = (ctx, [path, entry]) => ctx.node({
  key: `${path}/row`,
  styles: ['DesignSystem/typeRow'],
  source: entry.source,
  children: [
    ctx.node({ key: `${path}/sample`, styles: ['DesignSystem/typeSample'], bind: { font: { token: path } }, text: 'Orbit keeps family spending in view', source: entry.source }),
    ctx.node({ key: `${path}/caption`, styles: ['DesignSystem/caption'], text: path }),
    ctx.node({ key: `${path}/value`, styles: ['DesignSystem/value'], text: resolved(entry) }),
  ],
});

const barRow = (ctx, [path, entry], style, property) => ctx.node({
  key: `${path}/row`,
  styles: ['DesignSystem/barRow'],
  source: entry.source,
  children: [
    ctx.node({ key: `${path}/sample`, styles: [style], bind: property === 'size' ? { width: { token: path }, height: { token: path } } : bound(property)(path), source: entry.source }),
    ctx.node({ key: `${path}/caption`, styles: ['DesignSystem/caption'], text: path }),
    ctx.node({ key: `${path}/value`, styles: ['DesignSystem/value'], text: resolved(entry) }),
  ],
});

export const frames = [
  frame('colors', 'Colors', { width: 960, height: 1900 }, `${THEME}Colors.kt`, (ctx) => page(ctx, 'Colors', section(ctx, 'colors.', 'color', 'colors', 'DesignSystem/swatchChip', 'background', 1))),

  frame('typography', 'Typography', { width: 960, height: 1200 }, `${THEME}Types.kt`, (ctx) => page(ctx, 'Typography', entriesOf(ctx, 'typography', 'typography.').map((row) => typeRow(ctx, row)))),

  frame('spacing-sizes', 'Spacing and sizes', { width: 960, height: 1300 }, `${THEME}Spacings.kt`, (ctx) => page(ctx, 'Spacing and sizes', [
    group(ctx, 'spacing', 'spacing', entriesOf(ctx, 'dimension', 'spacing.').map((row) => barRow(ctx, row, 'DesignSystem/bar', 'width'))),
    group(ctx, 'sizes', 'sizes', entriesOf(ctx, 'dimension', 'sizes.').map((row) => barRow(ctx, row, 'DesignSystem/square', 'size'))),
  ])),

  frame('shapes', 'Shapes', { width: 960, height: 620 }, `${THEME}Shapes.kt`, (ctx) => page(ctx, 'Shapes', [
    group(ctx, 'shapes', 'shapes', entriesOf(ctx, 'shape', 'shapes.').map(([path, entry]) => sample(ctx, path, entry, 'DesignSystem/shapeBox', { 'border-radius': { token: path } }))),
  ])),

  frame('elevation-gradients', 'Elevation and gradients', { width: 960, height: 700 }, `${THEME}Elevations.kt`, (ctx) => page(ctx, 'Elevation and gradients', [
    group(ctx, 'elevation', 'elevation', entriesOf(ctx, 'elevation', 'elevation.').map(([path, entry]) => sample(ctx, path, entry, 'DesignSystem/elevationBox', { 'box-shadow': { token: path } }))),
    group(ctx, 'gradients', 'gradients', entriesOf(ctx, 'gradient', 'gradients.').map(([path, entry]) => sample(ctx, path, entry, 'DesignSystem/gradientBox', { background: { token: path } }))),
  ])),
];
