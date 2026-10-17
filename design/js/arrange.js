// Pure geometry for the Arrange tab: rects are outer boxes [{ id, x, y, width, height }], the result is [{ id, x, y }] in the same order.
const AXES = { x: ['x', 'width', 'y'], y: ['y', 'height', 'x'] };

export function arrangeRects(rects, op, gap = 0) {
  const out = rects.map(({ id, x, y }) => ({ id, x, y }));
  const at = new Map(out.map((o) => [o.id, o]));
  const align = (axis, mode) => {
    const [pos, size] = AXES[axis];
    const low = Math.min(...rects.map((r) => r[pos]));
    const high = Math.max(...rects.map((r) => r[pos] + r[size]));
    for (const r of rects) at.get(r.id)[pos] = Math.round(mode === 'low' ? low : mode === 'high' ? high - r[size] : (low + high) / 2 - r[size] / 2);
  };
  // Sorted by center along the axis, then by the other axis; the sort is stable, so ties keep their order.
  const sorted = (axis) => {
    const [pos, size, other] = AXES[axis];
    return [...rects].sort((a, b) => a[pos] + a[size] / 2 - (b[pos] + b[size] / 2) || a[other] - b[other]);
  };
  const space = (axis) => {
    const [pos, size] = AXES[axis];
    const list = sorted(axis);
    if (list.length < 3) return;
    const first = list[0][pos];
    const step = (list.at(-1)[pos] + list.at(-1)[size] - first - list.reduce((sum, r) => sum + r[size], 0)) / (list.length - 1);
    let used = 0;
    list.forEach((r, i) => { at.get(r.id)[pos] = Math.round(first + used + i * step); used += r[size]; });
  };
  const chain = (axis) => {
    const [pos, size] = AXES[axis];
    const list = sorted(axis);
    let next = list[0]?.[pos];
    for (const r of list) { at.get(r.id)[pos] = next; next += r[size] + gap; }
  };
  const run = {
    left: () => align('x', 'low'), right: () => align('x', 'high'), centerX: () => align('x', 'mid'),
    top: () => align('y', 'low'), bottom: () => align('y', 'high'), centerY: () => align('y', 'mid'),
    spaceX: () => space('x'), spaceY: () => space('y'), gapX: () => chain('x'), gapY: () => chain('y'),
  }[op];
  if (rects.length && run) run();
  return out;
}
