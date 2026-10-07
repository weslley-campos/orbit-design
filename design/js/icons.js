// Workspace chrome icons: 24 × 24 strokes drawn with currentColor.
const PATHS = {
  inspect: '<path d="M5 3l14 7-6 2-2 6z"/>',
  prototype: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H14a4 4 0 0 1 4 4v5.5"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.5-1.2-.3-.4-.5-.8-.5-1.3 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10.5" cy="7" r="1.2" fill="currentColor"/><circle cx="15.5" cy="7.5" r="1.2" fill="currentColor"/>',
  light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  dark: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  system: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  language: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  ios: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 5.5h3"/>',
  android: '<rect x="6" y="2.5" width="12" height="19" rx="2"/><circle cx="12" cy="5.5" r=".8" fill="currentColor"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  sidebar: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  sidebarRight: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
  chevron: '<path d="M7 10l5 5 5-5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
};

export function icon(name, size = 18) {
  const span = document.createElement('span');
  span.className = 'ws-svg';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${PATHS[name]}</svg>`;
  return span;
}
