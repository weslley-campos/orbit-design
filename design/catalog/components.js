const KOTLIN = 'core/ui/src/commonMain/kotlin/br/com/weslleycampos/orbit/core/ui/';

const given = (options, ...names) => Object.fromEntries(names.filter((name) => options[name] !== undefined).map((name) => [name, options[name]]));
const forwarded = ({ hotspot, inactive, attrs }) => ({ hotspot, inactive, attrs });
const own = (options) => options.styles ?? [];
const text = (options, name) => (options[`${name}Key`] != null ? { textKey: options[`${name}Key`] } : { text: options[name] });

export function OrbitScaffold(ctx, options, children = []) {
  ctx.props(options.key, 'OrbitScaffold');
  return ctx.node({ key: options.key, component: 'OrbitScaffold', styles: ['OrbitScaffold', ...own(options)], children, ...forwarded(options) });
}

// Focus draws a border and 4dp padding around the control, so the face is wrapped in a ring.
function ringed(ctx, options, component, ringStyles, face, ringFace) {
  if (!ringFace) return ctx.node({ ...face, styles: [...face.styles, ...own(options)] });
  const inner = ctx.node({ ...face, styles: [...face.styles, `${component}/inRing`] });
  return ctx.node({ key: `${options.key}/ring`, styles: [...ringStyles, ...own(options)], children: [inner] });
}

export function OrbitButton(ctx, options, children = []) {
  const { variant, enabled, loading, state } = ctx.props(options.key, 'OrbitButton', given(options, 'variant', 'enabled', 'loading', 'state'));
  const shown = enabled && !loading ? state : 'Default';
  const overlaid = variant === 'Primary' || variant === 'Destructive';
  const pressedLike = shown === 'Hovered' || shown === 'Pressed';
  const ring = shown === 'Focused';
  return ringed(ctx, options, 'OrbitButton', ['OrbitButton/Focused', variant === 'Destructive' && 'OrbitButton/Destructive/Focused'], {
    key: options.key,
    component: 'OrbitButton',
    variant,
    state: loading ? 'Loading' : !enabled ? 'Disabled' : shown,
    styles: [
      'OrbitButton',
      !ring && 'OrbitButton/size',
      `OrbitButton/${variant}`,
      pressedLike && !overlaid && `OrbitButton/${variant}/${shown}`,
      !enabled && !loading && `OrbitButton/${variant}/Disabled`,
    ],
    children: [
      pressedLike && overlaid && ctx.node({ key: `${options.key}/overlay`, styles: ['OrbitButton/overlay', `OrbitButton/overlay/${variant}/${shown}`] }),
      loading && ctx.node({ key: `${options.key}/spinner`, styles: ['OrbitButton/spinner', `OrbitButton/spinner/${variant}`] }),
      ...children,
    ],
    attrs: options.attrs,
    hotspot: options.hotspot,
    inactive: options.inactive,
  }, ring);
}

export function OrbitIconButton(ctx, options, children = []) {
  const { variant, enabled, state, contentDescription } = ctx.props(options.key, 'OrbitIconButton', given(options, 'variant', 'enabled', 'state', 'contentDescription'));
  const shown = enabled ? state : 'Default';
  const overlaid = variant === 'Filled' || variant === 'Tonal';
  const pressedLike = shown === 'Hovered' || shown === 'Pressed';
  const ring = shown === 'Focused';
  return ringed(ctx, options, 'OrbitIconButton', ['OrbitIconButton/Focused'], {
    key: options.key,
    tag: 'button',
    component: 'OrbitIconButton',
    variant,
    state: enabled ? shown : 'Disabled',
    styles: [
      'OrbitIconButton',
      !ring && 'OrbitIconButton/size',
      `OrbitIconButton/${variant}`,
      pressedLike && !overlaid && `OrbitIconButton/${variant}/${shown}`,
      !enabled && `OrbitIconButton/${variant}/Disabled`,
    ],
    children: [
      pressedLike && overlaid && ctx.node({ key: `${options.key}/overlay`, styles: ['OrbitIconButton/overlay', `OrbitIconButton/overlay/${variant}/${shown}`] }),
      ...children,
    ],
    attrs: { 'aria-label': contentDescription, ...options.attrs },
    hotspot: options.hotspot,
    inactive: options.inactive,
  }, ring);
}

export function OrbitOutlineTextField(ctx, options) {
  const { key } = options;
  const { value, enabled, isError, focused, password } = ctx.props(key, 'OrbitOutlineTextField', given(options, 'value', 'enabled', 'isError', 'focused', 'password'));
  const state = !enabled ? 'Disabled' : isError ? 'Error' : focused ? 'Focused' : 'Default';
  const focusing = enabled && focused;
  const hasLabel = options.labelKey != null || options.label != null;
  const hasPlaceholder = options.placeholderKey != null || options.placeholder != null;
  const hasSupporting = options.supportingTextKey != null || options.supportingText != null;
  const floated = focusing || value !== '';
  const part = (name) => `OrbitOutlineTextField/${name}`;
  const slot = (name, element) => element && ctx.node({ key: `${key}/${name}`, styles: [part('slot'), state === 'Error' && part('slot/Error'), state === 'Disabled' && part('slot/Disabled')], children: [element] });
  const boxStyles = state === 'Focused' ? [part('box/Focused'), part('box/FocusedThickness')] : [part(`box/${state}`), focusing && part('box/FocusedThickness')];

  return ctx.node({
    key,
    component: 'OrbitOutlineTextField',
    state,
    styles: ['OrbitOutlineTextField', ...own(options)],
    ...forwarded(options),
    children: [
      ctx.node({
        key: `${key}/box`,
        styles: [part('box'), ...boxStyles],
        children: [
          slot('leading', options.leadingIcon),
          ctx.node({
            key: `${key}/content`,
            styles: [part('content')],
            children: [
              hasLabel && ctx.node({ key: `${key}/label`, styles: [part('label'), part(`label/${state}`), floated && part('label/Floated'), floated && options.leadingIcon && part('label/FloatedLeading')], ...text(options, 'label') }),
              value === '' && hasPlaceholder && (!hasLabel || focusing)
                && ctx.node({ key: `${key}/placeholder`, styles: [part('placeholder'), !enabled && part('placeholder/Disabled')], ...text(options, 'placeholder') }),
              value !== '' && ctx.node({ key: `${key}/value`, styles: [part('input'), !enabled && part('input/Disabled')], text: password ? '•'.repeat(value.length) : value }),
              focusing && ctx.node({ key: `${key}/caret`, styles: [part('caret'), isError && part('caret/Error')] }),
            ],
          }),
          slot('trailing', options.trailingIcon),
        ],
      }),
      hasSupporting && ctx.node({ key: `${key}/supporting`, styles: [part('supporting'), state === 'Error' && part('supporting/Error'), state === 'Disabled' && part('supporting/Disabled')], ...text(options, 'supportingText') }),
    ],
  });
}

// Proposed: there is no Kotlin source yet, so it is not a declared component and has no editable props.
export function CodeField(ctx, options) {
  const { key, value = '', placeholder = '', focused = false, readOnly = false } = options;
  const hasSupporting = options.supportingTextKey != null || options.supportingText != null;
  const rest = placeholder.slice(value.length);
  const part = (name) => `CodeField/${name}`;
  return ctx.node({
    key,
    styles: ['CodeField', focused && part('Focused'), ...own(options)],
    ...forwarded(options),
    children: [
      ctx.node({ key: `${key}/eyebrow`, styles: [part('eyebrow')], ...text(options, 'label') }),
      ctx.node({
        key: `${key}/input`,
        styles: [part('input'), !readOnly && part('input/Editable')],
        children: [
          value !== '' && ctx.node({ key: `${key}/code`, styles: [part('code')], text: value }),
          focused && ctx.node({ key: `${key}/caret`, styles: ['OrbitOutlineTextField/caret'] }),
          rest !== '' && ctx.node({ key: `${key}/placeholder`, styles: [part('placeholder')], text: rest }),
        ],
      }),
      hasSupporting && ctx.node({ key: `${key}/supporting`, styles: [part('supporting')], ...text(options, 'supportingText') }),
    ],
  });
}

export function OrbitTopAppBar(ctx, options) {
  const { key } = options;
  const { variant, scrolled } = ctx.props(key, 'OrbitTopAppBar', given(options, 'variant', 'scrolled'));
  const big = variant === 'Medium' || variant === 'Large';
  const expanded = big && !scrolled;
  const part = (name) => `OrbitTopAppBar/${name}`;
  const title = ctx.node({
    key: `${key}/title`,
    styles: [part('title'), options.navigationIcon ? part('title/WithIcon') : part('title/NoIcon'), variant === 'CenterAligned' && part('title/Center'), expanded && part(`title/${variant}`)],
    ...text(options, 'title'),
  });
  return ctx.node({
    key,
    component: 'OrbitTopAppBar',
    variant,
    state: scrolled ? 'Scrolled' : 'Expanded',
    styles: ['OrbitTopAppBar', scrolled && part('Scrolled'), expanded && part(variant), ...own(options)],
    ...forwarded(options),
    children: [
      ctx.node({
        key: `${key}/row`,
        styles: [part('row')],
        children: [
          options.navigationIcon,
          !expanded && title,
          expanded && ctx.node({ key: `${key}/spacer`, styles: [part('expanded')] }),
          ctx.node({ key: `${key}/actions`, styles: [part('actions')], children: options.actions ?? [] }),
        ],
      }),
      expanded && ctx.node({ key: `${key}/expanded`, styles: [part('expanded'), part(`expanded/${variant}`)], children: [title] }),
    ],
  });
}

export function OrbitCard(ctx, options, children = []) {
  const { variant, enabled, state } = ctx.props(options.key, 'OrbitCard', given(options, 'variant', 'enabled', 'state'));
  const part = (name) => `OrbitCard/${name}`;
  return ctx.node({
    key: options.key,
    component: 'OrbitCard',
    variant,
    state: enabled ? state : 'Disabled',
    styles: [
      'OrbitCard',
      part(variant),
      !enabled && part(`${variant}/Disabled`),
      enabled && state === 'Hovered' && variant === 'Raised' && part('Raised/Hovered'),
      enabled && state === 'Focused' && part('Focused'),
      ...own(options),
    ],
    children,
    ...forwarded(options),
  });
}

export function OrbitFilterChip(ctx, options) {
  const { selected, enabled, state } = ctx.props(options.key, 'OrbitFilterChip', given(options, 'selected', 'enabled', 'state'));
  const part = (name) => `OrbitFilterChip/${name}`;
  return ctx.node({
    key: options.key,
    component: 'OrbitFilterChip',
    state: enabled ? state : 'Disabled',
    styles: [
      'OrbitFilterChip',
      selected && part('Selected'),
      enabled && (state === 'Hovered' || state === 'Pressed' || state === 'Focused') && part(state),
      !enabled && part('Disabled'),
      ...own(options),
    ],
    ...text(options, 'label'),
    ...forwarded(options),
  });
}

export function OrbitLinearProgressIndicator(ctx, options) {
  const { key } = options;
  const { progress, indeterminate, status } = ctx.props(key, 'OrbitLinearProgressIndicator', given(options, 'progress', 'indeterminate', 'status'));
  const part = (name) => `OrbitLinearProgressIndicator/${name}`;
  const percent = Math.round(Math.min(Math.max(progress, 0), 1) * 20) * 5;
  const open = indeterminate || options.progress === null;
  return ctx.node({
    key,
    component: 'OrbitLinearProgressIndicator',
    variant: status,
    styles: ['OrbitLinearProgressIndicator', ...own(options)],
    attrs: { role: 'progressbar', ...options.attrs },
    hotspot: options.hotspot,
    inactive: options.inactive,
    children: [ctx.node({ key: `${key}/fill`, styles: [part('fill'), part(status), open ? part('indeterminate') : part(`fill/p${percent}`)] })],
  });
}

export function OrbitNavigationBar(ctx, options) {
  const { key } = options;
  const { selectedIndex } = ctx.props(key, 'OrbitNavigationBar', given(options, 'selectedIndex'));
  const part = (name) => `OrbitNavigationBar/${name}`;
  const items = (options.items ?? []).map((item, index) => {
    if (item.slot) return item.slot;
    const selected = index === selectedIndex;
    const itemKey = `${key}/item-${index}`;
    return ctx.node({
      key: itemKey,
      styles: [part('item'), selected && part('item/Selected')],
      children: [
        // An icon given as a function receives `selected`, like the Kotlin icon slot that picks filled or outlined artwork.
        ctx.node({
          key: `${itemKey}/indicator`,
          styles: [part('indicator'), selected && part('indicator/Selected')],
          children: [typeof item.icon === 'function' ? item.icon(selected) : item.icon],
        }),
        ctx.node({ key: `${itemKey}/label`, styles: [part('label')], ...text(item, 'label') }),
      ],
    });
  });
  return ctx.node({ key, component: 'OrbitNavigationBar', styles: ['OrbitNavigationBar', ...own(options)], children: items, ...forwarded(options) });
}

export function OrbitBottomSheet(ctx, options, children = []) {
  const { key } = options;
  const { showDragHandle } = ctx.props(key, 'OrbitBottomSheet', given(options, 'showDragHandle'));
  return ctx.node({
    key,
    component: 'OrbitBottomSheet',
    styles: ['OrbitBottomSheet', ...own(options)],
    ...forwarded(options),
    children: [ctx.node({
      key: `${key}/sheet`,
      styles: ['OrbitBottomSheet/sheet'],
      children: [showDragHandle && ctx.node({ key: `${key}/handle`, styles: ['OrbitBottomSheet/handle'] }), ...children],
    })],
  });
}

export function OrbitSnackbar(ctx, options) {
  const { key } = options;
  const { type } = ctx.props(key, 'OrbitSnackbar', given(options, 'type'));
  const part = (name) => `OrbitSnackbar/${name}`;
  const hasTitle = options.titleKey != null || options.title != null;
  const hasAction = options.actionLabelKey != null || options.actionLabel != null;
  return ctx.node({
    key,
    component: 'OrbitSnackbar',
    variant: type,
    styles: ['OrbitSnackbar', part(type), ...own(options)],
    ...forwarded(options),
    children: [
      ctx.node({ key: `${key}/overlay`, styles: [part('overlay'), part(`${type}/overlay`)] }),
      ctx.node({
        key: `${key}/content`,
        styles: [part('content')],
        children: [
          ctx.node({ key: `${key}/icon`, styles: [part(`${type}/icon`)] }),
          ctx.node({
            key: `${key}/text`,
            styles: [part('text')],
            children: [
              hasTitle && ctx.node({ key: `${key}/title`, styles: [part('title')], ...text(options, 'title') }),
              ctx.node({ key: `${key}/message`, styles: [part('message')], ...text(options, 'text') }),
            ],
          }),
        ],
      }),
      hasAction && ctx.node({ key: `${key}/action`, styles: [part('action'), part(`${type}/action`)], ...text(options, 'actionLabel') }),
      OrbitIconButton(ctx, { key: `${key}/dismiss`, contentDescription: ctx.t('snackbar_close') }, [ctx.node({ key: `${key}/dismiss/icon`, styles: ['OrbitIconButton/icon/close'] })]),
    ],
  });
}

export function AnimatedOrbitLogo(ctx, options) {
  const { key } = options;
  ctx.props(key, 'AnimatedOrbitLogo');
  const layer = (name, children) => ctx.node({ key: `${key}/${name}`, styles: [`AnimatedOrbitLogo/${name}`], children });
  return ctx.node({
    key,
    component: 'AnimatedOrbitLogo',
    styles: ['AnimatedOrbitLogo', ...own(options)],
    attrs: { role: 'img', 'aria-label': 'Orbit Logo', ...options.attrs },
    hotspot: options.hotspot,
    inactive: options.inactive,
    children: [layer('tilt', [layer('arm', [layer('offset', [layer('arm2', [layer('satellite')])])])])],
  });
}

export function Checkbox(ctx, options) {
  const { checked, enabled } = ctx.props(options.key, 'Checkbox', given(options, 'checked', 'enabled'));
  return ctx.node({
    key: options.key,
    component: 'Checkbox',
    state: enabled ? (checked ? 'Checked' : 'Unchecked') : 'Disabled',
    styles: ['Checkbox', checked && 'Checkbox/Checked', !enabled && 'Checkbox/Disabled', checked && !enabled && 'Checkbox/CheckedDisabled', ...own(options)],
    text: checked ? '✓' : undefined,
    attrs: { role: 'checkbox', 'aria-checked': String(checked), ...options.attrs },
    hotspot: options.hotspot,
    inactive: options.inactive,
  });
}

export function HorizontalDivider(ctx, options) {
  ctx.props(options.key, 'HorizontalDivider');
  return ctx.node({ key: options.key, component: 'HorizontalDivider', styles: ['HorizontalDivider', ...own(options)], attrs: { role: 'separator', ...options.attrs }, hotspot: options.hotspot, inactive: options.inactive });
}

const caption = (ctx, key, label) => ctx.node({ key: `${key}/caption`, styles: ['Catalog/caption'], text: label });
const cell = (ctx, key, label, child, width = null) => ctx.node({ key: `${key}/cell`, styles: ['Catalog/cell', width], children: [caption(ctx, key, label), child] });
const block = (ctx, key, title, cells) => ctx.node({
  key,
  styles: ['Catalog/section'],
  children: [ctx.node({ key: `${key}/title`, styles: ['Catalog/title'], text: title }), ctx.node({ key: `${key}/row`, styles: ['Catalog/row'], children: cells })],
});
const page = (ctx, children) => OrbitScaffold(ctx, { key: 'root' }, [ctx.node({ key: 'page', styles: ['Catalog/page'], children })]);
const closeIcon = (ctx, key) => ctx.node({ key, styles: ['OrbitIconButton/icon/close'] });
const glyph = (ctx, key, character) => ctx.node({ key, styles: ['Catalog/glyph'], text: character });
const navIcon = (ctx, key, name) => ctx.node({ key, styles: [`OrbitNavigationBar/icon/${name}`], bind: { width: { token: 'sizes.large' }, height: { token: 'sizes.large' } } });

const frame = (name, viewport, render, extra = {}) => {
  const slug = name.toLowerCase().replaceAll(' ', '-');
  return { id: `components/${slug}`, name, group: 'Components', viewport, status: 'implemented', render, ...extra };
};

const BUTTON_STATES = ['Default', 'Hovered', 'Pressed', 'Focused', 'Disabled', 'Loading'];
const ICON_BUTTON_STATES = ['Default', 'Hovered', 'Pressed', 'Focused', 'Disabled'];
const INTERACTIONS = new Set(['Hovered', 'Pressed', 'Focused']);
const interaction = (state) => (INTERACTIONS.has(state) ? state : 'Default');

export const frames = [
  frame('Button', { width: 760, height: 1360 }, (ctx) => page(ctx, ['Primary', 'Outlined', 'Text', 'Destructive'].map((variant) => block(ctx, variant, variant, BUTTON_STATES.map((state) => {
    const key = `${variant}-${state}`;
    return cell(ctx, key, `${variant} · ${state}`, OrbitButton(ctx, { key, variant, state: interaction(state), enabled: state !== 'Disabled', loading: state === 'Loading' }, [
      ctx.node({ key: `${key}/label`, text: variant === 'Destructive' ? 'Delete entry' : 'Save changes' }),
    ]), 'Catalog/wide');
  })))), { source: `${KOTLIN}components/OrbitButton.kt` }),

  frame('Icon Button', { width: 760, height: 560 }, (ctx) => page(ctx, ['Standard', 'Filled', 'Tonal', 'Outlined'].map((variant) => block(ctx, variant, variant, ICON_BUTTON_STATES.map((state) => {
    const key = `${variant}-${state}`;
    return cell(ctx, key, state, OrbitIconButton(ctx, { key, variant, state: interaction(state), enabled: state !== 'Disabled', contentDescription: 'Close' }, [closeIcon(ctx, `${key}/icon`)]));
  })))), { source: `${KOTLIN}components/OrbitIconButton.kt` }),

  frame('Outline Text Field', { width: 760, height: 900 }, (ctx) => {
    const field = (name, extra) => {
      const key = name.toLowerCase().replaceAll(' ', '-');
      return cell(ctx, key, name, OrbitOutlineTextField(ctx, {
        key,
        label: 'Email address',
        placeholder: 'Enter your email',
        supportingText: extra.isError ? 'Enter a valid email address.' : 'Supporting text',
        ...extra,
      }), 'Catalog/wide');
    };
    const email = 'you@example.com';
    return page(ctx, [ctx.node({
      key: 'fields',
      styles: ['Catalog/row'],
      children: [
        field('Empty', {}),
        field('Filled', { value: email }),
        field('Focused empty', { focused: true }),
        field('Focused', { value: email, focused: true }),
        field('Error', { value: 'invalid-email', isError: true }),
        field('Focused error', { value: 'invalid-email', isError: true, focused: true }),
        field('Disabled empty', { enabled: false }),
        field('Disabled', { value: email, enabled: false }),
        field('Disabled error', { value: 'invalid-email', enabled: false, isError: true }),
        field('Password', { value: 'OrbitPassword', password: true, label: 'Password', placeholder: 'Enter your password' }),
        field('Icons', { value: email, leadingIcon: glyph(ctx, 'icons/leading/glyph', '@'), trailingIcon: glyph(ctx, 'icons/trailing/glyph', '✓') }),
      ],
    })]);
  }, { source: `${KOTLIN}components/OrbitOutlineTextField.kt` }),

  frame('Code Field', { width: 760, height: 640 }, (ctx) => {
    const field = (name, extra) => {
      const key = name.toLowerCase().replaceAll(' ', '-');
      return cell(ctx, key, name, CodeField(ctx, {
        key, labelKey: 'invite_code_eyebrow', placeholder: 'ORB-0000-00', supportingTextKey: 'invite_validity', ...extra,
      }), 'Catalog/wide');
    };
    const code = 'ORB-4K9P-27';
    return page(ctx, [ctx.node({
      key: 'fields',
      styles: ['Catalog/row'],
      children: [
        field('Empty', {}),
        field('Focused', { focused: true }),
        field('Typing', { value: 'ORB-4K', focused: true }),
        field('Filled', { value: code }),
        field('Read only', { value: code, readOnly: true }),
      ],
    })]);
  }, { status: 'proposed' }),

  frame('Card', { width: 760, height: 1400 }, (ctx) => page(ctx, ['Base', 'Raised', 'Gradient'].map((variant) => block(ctx, variant, variant, ['Default', 'Hovered', 'Pressed', 'Focused', 'Disabled'].map((state) => {
    const key = `${variant}-${state}`;
    return cell(ctx, key, `${variant} · ${state}`, OrbitCard(ctx, { key, variant, state: interaction(state), enabled: state !== 'Disabled' }, [
      ctx.node({
        key: `${key}/content`,
        styles: ['OrbitCard/content'],
        children: [ctx.node({ key: `${key}/title`, styles: ['OrbitCard/title'], text: 'Monthly balance' }), ctx.node({ key: `${key}/amount`, styles: ['OrbitCard/amount'], text: 'R$ 9.382,30' })],
      }),
    ]), 'Catalog/wide');
  })))), { source: `${KOTLIN}components/OrbitCard.kt` }),

  frame('Filter Chip', { width: 760, height: 360 }, (ctx) => page(ctx, [block(ctx, 'chips', 'Filter chip', [
    ['Default', false, 'Default', true], ['Selected', true, 'Default', true],
    ['Hovered', false, 'Hovered', true], ['Selected hovered', true, 'Hovered', true],
    ['Pressed', false, 'Pressed', true], ['Selected pressed', true, 'Pressed', true],
    ['Focused', false, 'Focused', true], ['Selected focused', true, 'Focused', true],
    ['Disabled', false, 'Default', false], ['Selected disabled', true, 'Default', false],
  ].map(([name, selected, state, enabled]) => {
    const key = name.toLowerCase().replaceAll(' ', '-');
    return cell(ctx, key, name, OrbitFilterChip(ctx, { key, label: 'Groceries', selected, state, enabled }));
  }))]), { source: `${KOTLIN}components/OrbitFilterChip.kt` }),

  frame('Linear Progress Indicator', { width: 760, height: 760 }, (ctx) => page(ctx, ['Primary', 'Success', 'Warning', 'Error'].map((status) => block(ctx, status, status, [
    ['Empty', 0], ['Half', 0.5], ['Complete', 1], ['Over limit', 1.25], ['Indeterminate', null],
  ].map(([name, progress]) => {
    const key = `${status}-${name.toLowerCase().replaceAll(' ', '-')}`;
    return cell(ctx, key, `${status} · ${name}`, OrbitLinearProgressIndicator(ctx, { key, status, progress: progress === null ? 0.5 : Math.min(progress, 1), indeterminate: progress === null }), 'Catalog/wide');
  })))), { source: `${KOTLIN}components/OrbitLinearProgressIndicator.kt` }),

  frame('Top App Bar', { width: 760, height: 940 }, (ctx) => page(ctx, ['Small', 'CenterAligned', 'Medium', 'Large'].map((variant) => block(ctx, variant, variant, ['Expanded', 'Scrolled'].map((state) => {
    const key = `${variant}-${state}`;
    return cell(ctx, key, `${variant} · ${state}`, OrbitTopAppBar(ctx, {
      key,
      title: 'Overview',
      variant,
      scrolled: state === 'Scrolled',
      navigationIcon: OrbitIconButton(ctx, { key: `${key}/back`, contentDescription: 'Navigate back' }, [glyph(ctx, `${key}/back/glyph`, '‹')]),
      actions: [OrbitIconButton(ctx, { key: `${key}/more`, contentDescription: 'More options' }, [glyph(ctx, `${key}/more/glyph`, '⋮')])],
    }), 'Catalog/screen');
  })))), { source: `${KOTLIN}components/OrbitTopAppBar.kt` }),

  frame('Navigation Bar', { width: 760, height: 700 }, (ctx) => page(ctx, [block(ctx, 'destinations', 'Destinations', [
    ['Home', 0], ['Charts', 1], ['Wallet', 3], ['Settings', 4],
  ].map(([name, selectedIndex]) => {
    const key = `selected-${name.toLowerCase()}`;
    const destination = (label, icon) => ({
      labelKey: `common_${label}`,
      icon: (selected) => navIcon(ctx, `${key}/${label}`, `${icon}_${selected ? 'filled' : 'outline'}`),
    });
    return cell(ctx, key, name, OrbitNavigationBar(ctx, {
      key,
      selectedIndex,
      items: [
        destination('home', 'home'),
        destination('charts', 'pie_chart'),
        { slot: ctx.node({
          key: `${key}/add-slot`,
          styles: ['OrbitNavigationBar/action'],
          children: [OrbitIconButton(ctx, {
            key: `${key}/add`, variant: 'Filled', contentDescription: ctx.t('a11y_icon_add_description'),
          }, [navIcon(ctx, `${key}/add/icon`, 'plus')])],
        }) },
        destination('wallet', 'wallet'),
        destination('settings', 'settings'),
      ],
    }), 'Catalog/screen');
  }))]), { source: `${KOTLIN}components/OrbitNavigationBar.kt` }),

  frame('Bottom Sheet', { width: 392, height: 640 }, (ctx) => page(ctx, [
    caption(ctx, 'sheet', 'Expanded'),
    OrbitBottomSheet(ctx, { key: 'bottom-sheet' }, [ctx.node({
      key: 'sheet-content',
      styles: ['Catalog/padded'],
      children: [
        ctx.node({ key: 'sheet-title', styles: ['Catalog/headline'], text: 'New entry' }),
        ctx.node({ key: 'sheet-body', styles: ['Catalog/body'], text: 'Content uses Orbit colors and typography.' }),
        OrbitButton(ctx, { key: 'done' }, [ctx.node({ key: 'done/label', text: 'Done' })]),
      ],
    })]),
  ]), { source: `${KOTLIN}components/OrbitBottomSheet.kt` }),

  frame('Snackbar', { width: 402, height: 460 }, (ctx) => page(ctx, ['Success', 'Error', 'Info', 'Warning'].map((type) => OrbitSnackbar(ctx, {
    key: type,
    type,
    title: type === 'Info' ? undefined : type,
    text: 'Your changes were saved.',
    actionLabel: type === 'Warning' ? undefined : 'Undo',
  }))), { source: `${KOTLIN}snackbar/OrbitSnackbar.kt` }),

  frame('Animated Logo', { width: 760, height: 420 }, (ctx) => page(ctx, [block(ctx, 'logos', 'Animated Orbit logo', ['large', 'medium', 'small'].map((size) => {
    const key = `logo-${size}`;
    return cell(ctx, key, size, AnimatedOrbitLogo(ctx, { key, styles: [`Catalog/logo/${size}`] }));
  }))]), { source: `${KOTLIN}components/AnimatedOrbitLogo.kt` }),

  frame('Checkbox', { width: 760, height: 360 }, (ctx) => page(ctx, [
    block(ctx, 'checkboxes', 'Checkbox', [['Unchecked', false, true], ['Checked', true, true], ['Disabled unchecked', false, false], ['Disabled checked', true, false]].map(([name, checked, enabled]) => {
      const key = name.toLowerCase().replaceAll(' ', '-');
      return cell(ctx, key, name, Checkbox(ctx, { key, checked, enabled }));
    })),
    block(ctx, 'dividers', 'Horizontal divider', [cell(ctx, 'divider', 'border.base', HorizontalDivider(ctx, { key: 'divider' }), 'Catalog/wide')]),
  ]), { source: `${KOTLIN}OrbitTheme.kt` }),
];
