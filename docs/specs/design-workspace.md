# Spec: Design workspace

Status: Draft

## 1. Outcome
- User: Weslley, designing and reviewing Orbit, a personal expense manager with optional family sharing.
- Problem: the reference contact sheet lacks platform organization, editable flows and a sidebar inspector.
- Desired result: a local workspace in `design/` with a pages sidebar, movable canvas, and right sidebar for inspection, editing and prototyping.

## 2. Scope
- Included: [design system extraction](design-system-extraction.md); pages/platforms; canvas; inspection/editing; flow connections/play; saving/export/import.
- Excluded: freeform drawing/layout editing; automatic design-to-Kotlin export; production app changes; authentication/backend calls; collaboration, undo and animated transitions.

## 3. Required behavior
- R1: Support page selection/create/rename/reorder/delete and catalog frame add/remove/move between pages. Seed Design system, Components, Screens / Mobile, Desktop, Web and Emails, reusing extracted layouts with platform metadata and editable viewports. Mobile frames sit in an iOS or Android device wireframe chosen in the toolbar. Empty pages offer Add frame.
- R2: Support background pan, pinch/modifier-wheel zoom, zoom buttons, Fit and frame movement by title or X/Y fields. Coordinates are unscaled; inner screen scrolling remains usable.
- R3: Inspect selects without activation and shows component, variant/state, source, logical dimensions, declared token/resource bindings and resolved values. Never infer identity from equal values. Label literals “no token” and unsupported mappings “unmapped”. Copy gives a reference Compose snippet using actual APIs, identifying overrides/unmapped values.
- R4: Prototype selects a start and creates/retargets/deletes frame or hotspot connections. Show source, click trigger and destination; arrows track movement/zoom/inner scrolling, with labeled cross-page endpoints. Frame/page deletion removes affected connections and clears a removed start.
- R5: Play opens the start at its viewport size, follows connections and provides Back/Restart/Exit/Esc. Hotspots precede background frame connections; unconnected controls do not invent navigation. Exit restores view/focus; a missing start prompts selection.
- R6: Persist pages, stable IDs, ordering, positions/viewports, connections/start, selected page/view, palette/mode/language and overrides. Export/Import round-trips versioned `workspace.json`. Local drafts override the committed seed; Reset restores it. Exported files replace the seed manually.
- R7: Reject malformed JSON, unsupported versions, duplicate IDs, missing references and invalid overrides without replacement. Failed writes show “Not saved” and retain Export. Corrupt drafts remain downloadable while the seed opens with a recovery notice.
- R8: Inspector edits text, semantic-token values/bindings and supported properties with immediate preview. Text/properties affect the instance, text in the selected language; token values affect all consumers within their palette/mode or invariant scope. Validate types/references, distinguish baseline/draft and offer Reset to source. Persist overrides without rewriting source artifacts.

## 4. Constraints
- Keep runtime artifacts in `design/`; document startup, regeneration, editing and saving in its README.
- Use HTML/CSS/JS on a fixed localhost origin with a standard static server; no framework, bundler, external service or viewing-time Gradle build. `file://` storage is [undefined across browsers](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
- Import catalog references and JSON data only; edited text cannot execute markup/scripts.
- At zoom/font scale 1, CSS px represents design dp; preserve typography sp. Inspected values remain independent of zoom/device pixels.
- Provide labels, visible focus and keyboard drag alternatives; suppress destructive shortcuts during text editing. Properties follow existing APIs: e.g. `variant`, `enabled`, `loading`.

## 6. Acceptance criteria
- [ ] R1 · manual — Given the seeded pages, when Review is created, renamed to Mobile review, reordered, given a Sign in frame from Screens / Mobile and deleted, then the sidebar reflects those changes and other pages remain intact.
- [ ] R2 · manual — Given Sign in at (0, 0) and 50% zoom, when its title moves 100 displayed px right, then X becomes 200 and Fit shows the whole frame.
- [ ] R3 · manual — Given Google Sign in and the Splash logo, when inspected at 50% and 200% zoom, then logical values and copied bindings stay unchanged, Google uses `OrbitButton` Outlined and `CoreUiRes.drawable.ic_google`, and Splash shows `256.dp · no token`.
- [ ] R4 · manual — Given Terms connected to Legal / Terms, when the target moves, its source screen scrolls, the edge is retargeted to Legal / Privacy and that destination is removed, then the arrow follows its endpoints until removal and leaves no dangling reference.
- [ ] R5 · manual — Given Sign in as start and Terms linked to Legal / Terms, when Play follows Terms, Back, Restart and Esc, then the expected frames appear and the original canvas view and focus return.
- [ ] R6 · manual — Given Mobile review with Sign in at (200, 0), a Terms edge and draft edits in Spruce dark/Portuguese, when reloaded and exported/imported into a fresh workspace, then organization, connections, display settings and edits are restored.
- [ ] R7 · manual — Given a valid workspace, when imports with malformed JSON, version 999, duplicate IDs, missing hotspots or invalid token overrides are tried, then each reports its error and leaves the workspace unchanged.
- [ ] R7 · manual — Given unavailable browser storage or a corrupt saved draft, when the workspace loads and a frame moves, then it identifies the saving/recovery problem and allows export of the current workspace and recovery of any corrupt draft.
- [ ] R8 · manual — Given Flamingo light/English, when Google's label becomes “Try Google”, its variant becomes Primary and `colors.text.primary` becomes `#123456`, then previews show scoped, marked overrides that Reset to source removes without changing repository sources.
- [ ] R1, R2, R4, R5, R8 · manual — Given keyboard-only input, when adding a page/frame, changing X/Y and text, connecting Terms and entering/exiting Play, then actions work with visible focus and text editing does not delete canvas items.

## 7. Definition of Done (Verification)
- [ ] Extraction spec verified; every manual criterion passes in Chrome and Safari at the documented origin.
- [ ] Verify empty/all-platform pages, zoom/pan/inner scrolling, deletion cleanup, cross-page links, Play without a start, focus and labels.
- [ ] Verify override scope, invalid field values, reload/export/import/reset, and a replaced seed in a fresh browser profile.
- [ ] No external runtime requests; document remaining HTML/Compose rendering differences.

## 8. Open questions
- Assumptions: adopting design edits in Orbit is separate work. Initial viewports: Mobile 402 × 874; Desktop/Web 1280 × 800, using current shared layouts.
