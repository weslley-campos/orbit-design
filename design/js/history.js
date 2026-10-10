// Undo and redo over workspace edits, recorded at each save. Pan, zoom, the open page and the palette/mode/language
// options are views, not edits: they are ignored when comparing and the current ones are kept on undo and redo.
// Saves closer together than COALESCE_MS (a dragged color picker) make one step.
const LIMIT = 100;
const COALESCE_MS = 400;

const editsOf = (ws) => JSON.stringify({ ...ws, settings: null, selectedPageId: null, pages: ws.pages.map(({ view, ...page }) => page) });

export function createHistory(now = () => Date.now()) {
  let undo = [];
  let redo = [];
  // The last recorded state: its edits (for comparing) and the full workspace JSON (for restoring pages' views).
  let last = null;
  let lastAt = 0;
  const snapshot = (ws) => ({ edits: editsOf(ws), json: JSON.stringify(ws) });

  function restore(entry, current) {
    const ws = JSON.parse(entry.json);
    ws.settings = current.settings;
    for (const page of ws.pages) page.view = current.pages.find((p) => p.id === page.id)?.view ?? page.view;
    if (ws.pages.some((page) => page.id === current.selectedPageId)) ws.selectedPageId = current.selectedPageId;
    last = snapshot(ws);
    lastAt = 0;
    return ws;
  }

  return {
    // Starts over from ws, e.g. after opening another workspace.
    reset(ws) {
      undo = [];
      redo = [];
      last = snapshot(ws);
      lastAt = 0;
    },
    record(ws) {
      const next = snapshot(ws);
      if (!last) { last = next; return; }
      if (next.edits === last.edits) { last = next; return; }
      const t = now();
      if (t - lastAt >= COALESCE_MS) {
        undo.push(last);
        if (undo.length > LIMIT) undo.shift();
      }
      redo = [];
      last = next;
      lastAt = t;
    },
    canUndo: () => undo.length > 0,
    canRedo: () => redo.length > 0,
    // Returns the workspace to open, or null when there is nothing to undo or redo.
    undo(current) {
      if (!undo.length) return null;
      redo.push(last);
      return restore(undo.pop(), current);
    },
    redo(current) {
      if (!redo.length) return null;
      undo.push(last);
      return restore(redo.pop(), current);
    },
  };
}
