# Orbit design workspace

A local, Figma-like tool for reviewing Orbit's screens and components: pages of frames on a pan/zoom canvas, an inspector that reports declared tokens and resources, editable previews, clickable prototype flows and a Play mode. Plain HTML, CSS and ES modules, with no framework or build step. Without an account it makes no network request; signing in (optional, see [Accounts, cloud saving and review](#accounts-cloud-saving-and-review)) adds cloud saving, share links and comments.

## Start

```bash
python3 design/serve.py
```

Open <http://localhost:4173> in Chrome or Safari. The server sends `Cache-Control: no-store`, so a normal reload picks up file changes. Pass another port if 4173 is taken: `python3 design/serve.py 4174`. Use this origin: `file://` has no reliable storage.

## Published preview

`.github/workflows/pages.yml` runs `node design/check.mjs` and `node supabase/tests/service.test.mjs`, then publishes `design/` to GitHub Pages on every push to `main` (or manually from the Actions tab): <https://weslley-campos.github.io/orbit-design/>. The deploy stamps script and stylesheet URLs with the commit, so browsers never mix cached modules from an older deploy. Drafts are kept per origin, so the published site and localhost keep separate drafts.

## Basics

- **Layout:** the left sidebar starts with the Orbit logo (tinted by the selected palette), the save status and the main menu (Export, Import, Reset and the workspace theme). The right panel starts with the account, Play and Share. A floating bar at the bottom of the canvas switches between Inspect and Prototype and opens a balloon for Palette, Mode, Language, Device and Zoom.
- **Workspace theme:** the main menu's Theme is System (default), Light or Dark. It styles the workspace chrome only; frames follow Mode. The choice is kept per browser in `localStorage['orbit.design.theme']`.
- **Pages (left):** two plain lists. Pages: click a row to select it, "+" creates a page and starts renaming it; the "⋯" on a row (shown on hover, focus or selection) offers Rename, Move up/down and Delete page, and double-clicking a row renames it inline (Enter or blur saves, Esc cancels). Frames: the selected page's frames, with "+" to add a catalog entry (grouped Design system / Components / Screens / Emails; entries not in the app yet are tagged "proposed") and a "⋯" menu to move a frame to another page or remove it. Selecting a row selects the frame on the canvas, and the reverse.
- **Mobile pages and Device:** frames on pages with platform `mobile` are shown in a wireframe chosen by the Device option of the floating bar, `iOS` (iPhone 18 Pro, default) or `Android` (generic Pixel), on the canvas and in Play. Both are approximations. Frame width/height mean the 402 × 874 screen size for either device, and X/Y the wireframe's outer corner. Changing Device redraws the frames and keeps the selection. A saved draft keeps its old separate Android and iOS pages until Reset; they follow the Device option too, and iOS frames keep their old 392 × 846 sizes.
- **Panel toggles:** the sidebar buttons next to the logo and next to Play hide the panels; the canvas grows into the freed space and a small chip in its corner shows the panel again (the right chip also has Play). The choice is kept per browser in `localStorage['orbit.design.panels']`, separate from the workspace draft and not exported.
- **Canvas:** drag the background to pan. Ctrl/Cmd + wheel (and trackpad pinch) zooms around the cursor; the Zoom balloon has zoom in/out, Zoom to 100% and Zoom to fit, also on the keys `+`, `-`, Shift+0 and Shift+1. A plain wheel scrolls a screen's own content, or pans over empty canvas. Drag a frame's title to move it, or focus the title and use the arrow keys (Shift for 10). X/Y/width/height are also number fields in the Inspect tab. Coordinates are unscaled design coordinates: CSS px equal dp at zoom 1.
- **Modes:** the floating bar's first group picks Move (H), Inspect (V) or Prototype (P). Move drags a screen from anywhere on it and never inspects; Inspect and Prototype also pick the inspector tab.
- **Screen actions:** a selected screen shows a small toolbar above it (below it near the top of the view): Archive and Move to Trash, plus Connect the whole screen in Prototype mode. Delete/Backspace also moves the selected screen to Trash, and a toast offers Undo. The same actions are in a frame's "⋯" menu.
- **Archived and Trash:** collapsible sections at the bottom of the left sidebar. Neither deletes anything: an item keeps its frame, connections, overrides and start-frame flag. Restore puts it back on its page at its old position (or on the current page if that page is gone) with every connection whose other end is live; a connection to a screen that is still shelved waits for that screen. Items can move between the two sections. Click an item to see that screen on the canvas, or "View all" in a section header to lay out every screen of that section side by side. This shelf view is read-only (no moving, editing or connecting): a banner offers "View all" and "Back to" the page (Esc also leaves), the toolbar above a selected screen has Restore and Move to Trash/Archived, and the inspector shows where it came from, when it was shelved and its Restore button. Deleting a page moves its frames to Trash. Both are part of the draft and of Export.
- **Inspect:** click inside a frame (nothing is activated). The tab shows the component, variant/state, source, logical size in dp, text and string resource, props, and every declared binding as a token path, "no token" or "unmapped", with its resolved value. "Copy" gives a reference Compose snippet.
- **Prototype:** pick the start frame. In Prototype mode, click a component (hotspots are highlighted on hover) and a dashed connector follows the pointer; left-click another screen to connect it, right-click or Esc to cancel. The link button above a selected screen does the same for the whole screen. The tab still lists every hotspot with a destination select. Arrows follow the frames, zoom and inner scrolling. A link to another page is drawn as a labelled stub.
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

- Signed out, every change is saved to a local draft (`localStorage['orbit.design.workspace']`). The sidebar shows "Saved in this browser", or "Not saved" when the browser refuses the write. Signed in, see [Accounts, cloud saving and review](#accounts-cloud-saving-and-review).
- A valid draft opens instead of the committed seed `design/workspace.json`.
- **Export** (main menu) downloads a versioned `workspace.json`; **Import** reads one back. An invalid file (malformed JSON, unsupported version, duplicate ids, missing references, invalid overrides) is rejected with its errors and nothing changes.
- **Reset** drops the draft and reloads the seed (after a confirmation). Signed in, Import and Reset replace the cloud copy instead (below).
- A corrupt or invalid draft is not loaded: the seed opens with a notice and "Download draft".
- To publish a flow, export, replace `design/workspace.json` with the exported file and commit it.

## Accounts, cloud saving and review

Optional, specified in [docs/specs/workspace-auth-sharing.md](../docs/specs/workspace-auth-sharing.md). With empty values in `design/cloud.config.js` (the default) none of this appears and the workspace stays browser-only.

### Setup (once)

The complete checklist, with troubleshooting, is in [docs/deployment.md](../docs/deployment.md).

1. Create a [Supabase](https://supabase.com) project. In its SQL editor run [`supabase/migrations/20261007120000_design_workspace_auth_sharing.sql`](../supabase/migrations/20261007120000_design_workspace_auth_sharing.sql) (or `supabase db push` with the Supabase CLI). It creates private tables and the `design_*` functions; clients can call only those functions, which check the signed-in user or the share link on every request.
2. Create a GitHub OAuth app (GitHub → Settings → Developer settings) with the callback URL `https://<project-ref>.supabase.co/auth/v1/callback`, and enable the GitHub provider in Supabase (Authentication → Sign In / Providers) with its client id and secret.
3. In Authentication → URL Configuration, set the Site URL to `https://weslley-campos.github.io/orbit-design/` and add `http://localhost:4173/` to the redirect URLs.
4. For the published site, add the project URL and the anon (public) key as repository variables `SUPABASE_URL` and `SUPABASE_ANON_KEY` (Settings → Secrets and variables → Actions; secrets with those names work too). The deploy writes them into the published `cloud.config.js`; the committed file stays empty. For localhost, put the same two values in `design/cloud.config.js` without committing them. The anon key is meant to be public; never store the service-role key or the GitHub secret here.

The browser loads `@supabase/supabase-js` 2.116.0 from jsDelivr only when the config is filled in.

### Signing in and saving

- The top of the right panel works like Figma's: your avatar and account menu (or **Sign in**), then Play and **Share** for the selected screen. Signing in never deletes the browser draft. A first sign-in on an account without a cloud copy asks whether to upload this browser's draft (pages, edits, Archived, Trash) or start from the committed `workspace.json`. Later sign-ins on any device open the account copy.
- Every edit is saved to the account after a short pause, including moves, prototype links, Archived/Trash and restoring. Shelf views never save their temporary side-by-side layout. Unsynced edits are also kept in this browser per account (`localStorage['orbit.design.account.<user id>']`), so a closed tab, a reload, going offline or switching accounts loses nothing and never mixes accounts.
- The sidebar status says *Saving to the cloud…*, *Saved to the cloud* (only after the service acknowledged it), *Offline · changes pending* (retried automatically), *Not saved to the cloud*, *Newer copy in the cloud* or *Cloud copy not loaded*.
- Profile preferences sync separately from the document: the workspace theme (System/Light/Dark) and which panels are open. The frames' light/dark Mode belongs to the document.
- Signing out returns to the browser draft. The account menu (avatar) has Download previous cloud copy and Sign out, plus Retry, Download local copy and Load cloud copy while saving has a problem.

### Recovery

- **Newer copy in the cloud**: another device saved since your edits started. The cloud copy is never overwritten. Use *Download local copy* to keep your version, then *Load cloud copy*; re-apply or Import what you need.
- **Not saved / session ended**: your edits stay in this browser. *Retry*, or sign in again; *Download local copy* always works.
- **Cloud copy not loaded**: nothing is saved over the account (not even the seed). You keep editing the browser draft; *Retry* when online.
- **Import** and **Reset** while signed in replace the whole cloud copy, including Archived and Trash, after a confirmation. The previous copy is kept (the last 20); *Download previous cloud copy* gets the latest, which Import restores. Replacing also starts a new review generation: existing share links stop working and comments start over, even for reused frame ids. Both need saved changes and a connection.

### Sharing and comments

- **Share** (top of the right panel, or the toolbar above a selected screen, once its changes are saved to the cloud) creates a link like `…/orbit-design/#/review/<64 hex characters>`. Anyone with it can view that one screen as last saved, with its comments; people signed in with GitHub can comment. Nothing else is exposed: no other screens, connections or other screens' edits. Reopening Share shows the same link with **Copy link** and **Revoke link**; a revoked link never works again (share again for a new one).
- Archiving or trashing a screen (or deleting its page) suspends its link; restoring the same screen resumes it unless it was revoked.
- **Comments**: the inspector's Comments tab shows the selected screen's thread; shelf views show it read-only. Comments are plain text (1–2,000 characters) and show the author's GitHub name and avatar (never an email), the time and the revision they saw. Each screen instance has its own thread, which follows moves, shelving and restoring. A failed post keeps its text; retrying never duplicates it.
- **Review page**: a share link opens a read-only page with the screen, its comments and Refresh. A guest can start a comment, sign in and come back to the same screen with the draft. Reviewing never loads or saves the reviewer's own workspace; *Open my workspace* goes back to it.

## Regenerate and verify

Run the JavaScript self-check from this repository:

```bash
node design/check.mjs                    # workspace, store and cloud-sync checks
node supabase/tests/service.test.mjs     # database functions on a throwaway local PostgreSQL (13+; set PG_BIN if needed)
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
- Canvas connections only reach screens on the same page; use the destination select for another page.
- Re-rendering a frame (any edit) keeps inner scroll positions only when the structure is unchanged.
- Token editing covers colors and dp dimensions; typography, gradients, shapes and elevations are read-only, and derived colors are edited through their source token.
- Rebinding a token keeps the baseline alpha but cannot change it.
- No undo; use "Reset to source" per field or Reset for everything.
- Hover and selection outlines are drawn from element rectangles; they are hidden when the element scrolls out of its frame.
- Frames render HTML approximations of Compose; shadows, tonal elevation and font rasterization differ.
