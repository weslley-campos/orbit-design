# Orbit design workspace

A local, Figma-like tool for reviewing Orbit's screens and components: pages of frames on a pan/zoom canvas, an inspector that reports declared tokens and resources, editable previews, clickable prototype flows and a Play mode. Plain HTML, CSS and ES modules. No framework, build step or network request.

## Start

```bash
python3 design/serve.py
```

Open <http://localhost:4173> in Chrome or Safari. The server sends `Cache-Control: no-store`, so a normal reload picks up file changes. Pass another port if 4173 is taken: `python3 design/serve.py 4174`. Use this origin: `file://` has no reliable storage.

## Published preview

`.github/workflows/pages.yml` runs `node design/check.mjs` and publishes `design/` to GitHub Pages on every push to `main` (or manually from the Actions tab): <https://weslley-campos.github.io/orbit-design/>. Drafts are kept per origin, so the published site and localhost keep separate drafts.

## Basics

- **Layout:** the left sidebar starts with the Orbit logo (tinted by the selected palette), the save status and the main menu (Export, Import, Reset and the workspace theme). The right panel starts with Play. A floating bar at the bottom of the canvas switches between Inspect and Prototype and opens a balloon for Palette, Mode, Language, Device and Zoom.
- **Workspace theme:** the main menu's Theme is System (default), Light or Dark. It styles the workspace chrome only; frames follow Mode. The choice is kept per browser in `localStorage['orbit.design.theme']`.
- **Pages (left):** two plain lists. Pages: click a row to select it, "+" creates a page and starts renaming it; the "⋯" on a row (shown on hover, focus or selection) offers Rename, Move up/down and Delete page, and double-clicking a row renames it inline (Enter or blur saves, Esc cancels). Frames: the selected page's frames, with "+" to add a catalog entry (grouped Design system / Components / Screens / Emails; entries not in the app yet are tagged "proposed") and a "⋯" menu to move a frame to another page or remove it. Selecting a row selects the frame on the canvas, and the reverse.
- **Mobile pages and Device:** frames on pages with platform `mobile` are shown in a wireframe chosen by the Device option of the floating bar, `iOS` (iPhone 18 Pro, default) or `Android` (generic Pixel), on the canvas and in Play. Both are approximations. Frame width/height mean the 402 × 874 screen size for either device, and X/Y the wireframe's outer corner. Changing Device redraws the frames and keeps the selection. A saved draft keeps its old separate Android and iOS pages until Reset; they follow the Device option too, and iOS frames keep their old 392 × 846 sizes.
- **Panel toggles:** the sidebar buttons next to the logo and next to Play hide the panels; the canvas grows into the freed space and a small chip in its corner shows the panel again (the right chip also has Play). The choice is kept per browser in `localStorage['orbit.design.panels']`, separate from the workspace draft and not exported.
- **Canvas:** drag the background to pan. Ctrl/Cmd + wheel (and trackpad pinch) zooms around the cursor; the Zoom balloon has zoom in/out, Zoom to 100% and Zoom to fit, also on the keys `+`, `-`, Shift+0 and Shift+1. A plain wheel scrolls a screen's own content, or pans over empty canvas. Drag a frame's title to move it, or focus the title and use the arrow keys (Shift for 10). X/Y/width/height are also number fields in the Inspect tab. Coordinates are unscaled design coordinates: CSS px equal dp at zoom 1.
- **Inspect:** click inside a frame (nothing is activated). The tab shows the component, variant/state, source, logical size in dp, text and string resource, props, and every declared binding as a token path, "no token" or "unmapped", with its resolved value. "Copy" gives a reference Compose snippet.
- **Prototype:** pick the start frame; for the selected frame, choose a destination for the whole frame or for each hotspot. Arrows follow the frames, zoom and inner scrolling. A link to another page is drawn as a labelled stub.
- **Play:** opens the start frame at its size in a dialog. A click follows the matching hotspot connection, else the whole-frame connection, else does nothing. Back, Restart, Exit and Esc; exiting returns to the canvas and the Play button.
- **Palette, mode, language** in the floating bar apply to every frame, Inspect and Play.

## Editing and overrides

Edits live only in the workspace's `overrides`; no source file is touched.

- **Text:** per frame instance, for the selected language only.
- **Props:** `variant`, `enabled`, `loading` and other declared props, per instance.
- **Token binding:** swap a single-token binding for another token of the same kind, per instance.
- **Token value:** colors and dp dimensions. This changes every consumer of that token in its scope (`palette/mode`, or `invariant`), through generated CSS in `#orbit-overrides`.

Each field shows the source value, marks drafts as "edited" and offers "Reset to source". Invalid values show an error and are not applied. Adopting a design edit in the Orbit app is separate work.

## Saving

- Every change is saved to a local draft (`localStorage['orbit.design.workspace']`). The sidebar shows "Saved" or "Not saved" when the browser refuses the write.
- A valid draft opens instead of the committed seed `design/workspace.json`.
- **Export** (main menu) downloads a versioned `workspace.json`; **Import** reads one back. An invalid file (malformed JSON, unsupported version, duplicate ids, missing references, invalid overrides) is rejected with its errors and nothing changes.
- **Reset** drops the draft and reloads the seed (after a confirmation).
- A corrupt or invalid draft is not loaded: the seed opens with a notice and "Download draft".
- To publish a flow, export, replace `design/workspace.json` with the exported file and commit it.

## Regenerate and verify

Run the JavaScript self-check from this repository:

```bash
node design/check.mjs
```

Theme extraction and Kotlin source validation run from the [Orbit application checkout](https://github.com/weslley-campos/orbit). With both repositories next to each other, run these commands from `orbit/` (JDK 21+):

```bash
# read-only: fails when orbit-design's tokens or declarations drift from the Kotlin sources
./gradlew :core:ui:jvmTest --tests "br.com.weslleycampos.orbit.core.ui.design.*"
# regenerate orbit-design/design/tokens.css and tokens.json from the Kotlin theme
ORBIT_DESIGN_REGENERATE=true ./gradlew :core:ui:jvmTest --rerun --tests "br.com.weslleycampos.orbit.core.ui.design.DesignTokensSpec"
```

For another checkout location, set `ORBIT_DESIGN_DIR` to this repository's `design/` directory; relative paths resolve from the Orbit application root. Application tests validate the external artifacts when that directory exists or is explicitly configured. Their validator unit tests run without a design checkout.

`assets/core-ui` and `assets/feature-auth` are committed snapshots, so this workspace previews without the application checkout. Refresh them from the Kotlin resources by running these commands here:

```bash
rsync -a --delete ../orbit/core/ui/src/commonMain/composeResources/ design/assets/core-ui/
rsync -a --delete ../orbit/feature/auth/src/commonMain/composeResources/ design/assets/feature-auth/
```

Catalog `source` paths refer to the Orbit application repository. Screen specs owned by the application, such as email verification and password reset, remain in its `docs/specs` directory.

## Known limits

- Only one page is shown at a time; arrows to frames on other pages are stubs.
- Connections are made with a destination `<select>`, not by dragging an arrow.
- Re-rendering a frame (any edit) keeps inner scroll positions only when the structure is unchanged.
- Token editing covers colors and dp dimensions; typography, gradients, shapes and elevations are read-only, and derived colors are edited through their source token.
- Rebinding a token keeps the baseline alpha but cannot change it.
- No undo; use "Reset to source" per field or Reset for everything.
- Hover and selection outlines are drawn from element rectangles; they are hidden when the element scrolls out of its frame.
- Frames render HTML approximations of Compose; shadows, tonal elevation and font rasterization differ.
