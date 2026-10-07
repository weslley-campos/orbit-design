export const kids = (list) => list.flat().filter((child) => child != null && child !== false);

export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  el.append(...kids(children));
  for (const [name, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (name.startsWith('on')) el.addEventListener(name.slice(2), value);
    else if (name in el) el[name] = value;
    else el.setAttribute(name, value === true ? '' : value);
  }
  return el;
}

export function preserveFocus(root, render) {
  const id = root.contains(document.activeElement) ? document.activeElement.dataset.f : null;
  render();
  if (id) root.querySelector(`[data-f="${CSS.escape(id)}"]`)?.focus();
}

let menu;
let menuTrigger;
let closedAt = 0;

export function openMenu(trigger, items, { above = false } = {}) {
  if (!menu) {
    menu = h('div', { popover: 'auto', class: 'ws-menu', role: 'menu' });
    menu.addEventListener('toggle', (e) => {
      if (e.newState === 'closed') { menuTrigger.setAttribute('aria-expanded', 'false'); closedAt = performance.now(); }
      if (e.newState !== 'closed' || !(document.activeElement === document.body || menu.contains(document.activeElement))) return;
      (menuTrigger.isConnected ? menuTrigger : document.querySelector(`[data-f="${menuTrigger.dataset.f}"]`))?.focus();
    });
    menu.addEventListener('keydown', (e) => {
      const buttons = [...menu.querySelectorAll('button:not(:disabled)')];
      const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      buttons[(buttons.indexOf(document.activeElement) + step + buttons.length) % buttons.length]?.focus();
    });
    document.body.append(menu);
  }
  // A click on the trigger of an open menu closes it: light dismiss already hid it on pointerdown.
  if (menuTrigger === trigger && performance.now() - closedAt < 400) return;
  menuTrigger = trigger;
  menu.classList.toggle('is-balloon', above);
  menu.replaceChildren(...items.map((item) => (item.heading
    ? h('div', { class: 'ws-menu-heading' }, item.heading)
    : h('button', {
      role: item.checked == null ? 'menuitem' : 'menuitemradio',
      'aria-checked': item.checked == null ? null : String(item.checked),
      disabled: item.disabled,
      onclick: () => { menu.hidePopover(); item.run(); },
    }, item.icon ?? null, h('span', { class: 'ws-menu-label' }, item.label), item.tag ? h('span', { class: 'ws-tag' }, item.tag) : null))));
  const rect = trigger.getBoundingClientRect();
  Object.assign(menu.style, above
    ? { top: 'auto', bottom: `${innerHeight - rect.top + 10}px`, left: `${rect.left}px`, maxHeight: `${rect.top - 20}px` }
    : { top: `${rect.bottom + 2}px`, bottom: 'auto', left: `${rect.left}px`, maxHeight: `${innerHeight - rect.bottom - 12}px` });
  menu.showPopover();
  trigger.setAttribute('aria-expanded', 'true');
  const want = above ? rect.left + rect.width / 2 - menu.offsetWidth / 2 : rect.left;
  const left = Math.max(8, Math.min(want, innerWidth - menu.offsetWidth - 8));
  menu.style.left = `${left}px`;
  menu.style.setProperty('--ws-tip', `${rect.left + rect.width / 2 - left}px`);
  (menu.querySelector('[aria-checked="true"]:not(:disabled)') ?? menu.querySelector('button:not(:disabled)'))?.focus();
}

// ponytail: iPhone island size and insets are approximations taken from the 17 Pro (Apple does not publish iPhone 18 Pro values in points); the Pixel values are a generic Pixel with approximate status bar, navigation bar and camera sizes.
export const DEVICES = {
  ios: {
    radius: 62, top: 62, bottom: 34, bezel: 12, bodyRadius: 74,
    islandW: 100, islandH: 34, islandTop: 14, islandRadius: 17, homeW: 134, homeH: 5, homeBottom: 8,
  },
  android: {
    radius: 40, top: 48, bottom: 24, bezel: 10, bodyRadius: 50,
    islandW: 22, islandH: 22, islandTop: 13, islandRadius: 11, homeW: 108, homeH: 4, homeBottom: 10,
  },
};

// ponytail: the Pixel wraps the same 402 × 874 screen as the iPhone; give each device its own size here if exact Pixel dimensions matter.
export const MOBILE_SCREEN = { width: 402, height: 874 };

const DEVICE_UI = {
  ios: {
    time: '9:41',
    buttons: [['left', 118, 32], ['left', 176, 56], ['left', 246, 56], ['right', 200, 92], ['right', 330, 56]],
    icons: `
<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true"><rect y="8" width="3" height="4" rx="0.8"/><rect x="5" y="5.5" width="3" height="6.5" rx="0.8"/><rect x="10" y="2.8" width="3" height="9.2" rx="0.8"/><rect x="15" width="3" height="12" rx="0.8"/></svg>
<svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2 5a9 9 0 0 1 13 0"/><path d="M4.8 7.6a5 5 0 0 1 7.4 0"/><circle cx="8.5" cy="10.4" r="0.9" fill="currentColor"/></svg>
<svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity="0.45"/><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor"/><path d="M25 4.5v4a2 2 0 0 0 0-4Z" fill="currentColor" opacity="0.5"/></svg>`,
  },
  android: {
    time: '9:30',
    buttons: [['right', 180, 60], ['right', 268, 110]],
    icons: `
<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true"><path d="M8 12 .5 3.6a10.6 10.6 0 0 1 15 0Z"/></svg>
<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M12 0v12H0Z"/></svg>
<svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true"><rect x="3.5" width="3" height="2" rx="0.6"/><rect x="1" y="2" width="8" height="13" rx="1.6"/></svg>`,
  },
};

export const deviceOf = (page, settings) => (['mobile', 'ios', 'android'].includes(page?.platform) ? settings.device ?? 'ios' : null);

export function outerSize(frame, page, settings) {
  const kind = deviceOf(page, settings);
  const ring = kind ? DEVICES[kind].bezel * 2 : 0;
  return { width: frame.width + ring, height: frame.height + ring };
}

export function deviceFrame(viewport, settings, kind) {
  const ui = DEVICE_UI[kind];
  const status = h('div', { class: 'ws-device-status', 'aria-hidden': 'true' },
    h('span', { class: 'ws-device-time' }, ui.time), h('span', { class: 'ws-device-island' }), h('span', { class: 'ws-device-icons' }));
  status.lastChild.innerHTML = ui.icons;
  const screen = h('div', { class: 'ws-device-screen' }, status, viewport,
    h('div', { class: 'ws-device-home', 'aria-hidden': 'true' }, h('span')));
  const device = h('div', { class: `ws-device is-${kind}` },
    ...ui.buttons.map(([side]) => h('span', { class: `ws-device-button is-${side}`, 'aria-hidden': 'true' })),
    screen);
  ui.buttons.forEach(([, top, height], i) => { device.children[i].style.cssText = `top:${top}px;height:${height}px`; });
  for (const [name, value] of Object.entries(DEVICES[kind])) device.style.setProperty(`--d-${name}`, `${value}px`);
  tintDevice(screen, settings);
  return { device, screen };
}

export function tintDevice(screen, { palette, mode }) {
  screen.dataset.palette = palette;
  screen.dataset.mode = mode;
}
