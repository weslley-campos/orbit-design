// Pure geometry for two-finger canvas gestures. Points are canvas-local CSS px ({ x, y }); a view is { x, y, zoom }.
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// The view after the fingers moved from (a0, b0) to (a1, b1): the canvas point under the starting midpoint
// follows the current midpoint, and the zoom scales with the finger distance, clamped to [min, max].
export function pinchView(view, a0, b0, a1, b1, min, max) {
  const from = mid(a0, b0);
  const to = mid(a1, b1);
  const start = dist(a0, b0);
  const scale = start > 0 ? dist(a1, b1) / start : 1;
  const zoom = Math.min(Math.max(Math.round(view.zoom * scale * 1000) / 1000, min), max);
  return {
    x: to.x - ((from.x - view.x) * zoom) / view.zoom,
    y: to.y - ((from.y - view.y) * zoom) / view.zoom,
    zoom,
  };
}
