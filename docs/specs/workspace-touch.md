# Spec: Touch input on tablets

Status: Implemented

Extends: [Design workspace](design-workspace.md) R2, R3, R4 and R10.

## 1. Outcome
- User: Weslley, reviewing Orbit's screens on a tablet (iPad Safari, Android Chrome).
- Problem: on a tablet the canvas could not be used. A second finger started a second pan, so pinching jumped instead of zooming (Chrome had no touch zoom at all). Dragging on a screen did nothing, and every screen's scroll container handed the touch back to the browser, which cancelled the gesture. In portrait the two panels left a canvas about 150 px wide.
- Desired result: pan, pinch zoom, selection, frame moving and prototype linking work with fingers, with mouse, trackpad and keyboard behavior unchanged.

## 2. Scope
- Included: one- and two-finger canvas gestures, finger scrolling inside screens, tap selection, touch linking, tablet panel layout and finger-sized controls.
- Excluded: touch multi-select (Shift-click, marquee and Ctrl/Cmd+A still need a keyboard); long-press menus; an on-screen undo button; phone-sized layouts.

## 3. Required behavior
- R1: When one finger drags the empty canvas, or a screen in Inspect or Prototype mode, the canvas must pan. A movement under 8 px is a tap, not a pan.
- R2: When one finger drags inside a screen's scrollable content that can still scroll that way, that content must scroll instead of the canvas.
- R3: When two fingers are down, the canvas must zoom about their midpoint by the change in their distance (10% to 400%) and pan with the midpoint. A second finger cancels a one-finger pan, marquee or frame drag; a cancelled frame drag returns the frames to where they started.
- R4: When a finger taps a screen, it must select the tapped component (Inspect) or start a link from its hotspot (Prototype), as a click does. Tapping the empty canvas clears the selection, or cancels a pending link. The click that ends a pan or pinch must not select or deselect.
- R5: In Move mode, one finger dragging a screen must move it, as a mouse drag does.
- R6: After a touch, long-pressing a screen must not select its text or open the system callout, and touch must not show the hover outline.
- R7: On a touch screen narrower than 1200 px, the panels must float over the canvas instead of narrowing it, and the inspector starts hidden until it is opened once. On touch screens, icon buttons are at least 40 px and toolbar buttons 44 px.

## 4. Constraints
- Pointer Events only, with `touch-action: none` on the canvas and everything in it; mouse, pen, trackpad, wheel and keyboard paths stay as they were. Safari's trackpad pinch (`gesturechange`) still zooms, but is ignored while two fingers are down so a touch pinch is not applied twice.
- Pan and zoom are not edits (design-workspace R9): a pinch saves the view without an undo step.

## 6. Acceptance criteria
- [x] R3 · unit — Given a view at (0, 0) and 100%, when fingers at (100, 100) and (200, 100) spread to (50, 100) and (250, 100), then the view is (−150, −100) at 200%; moving both by (30, 20) pans by (30, 20); zoom stops at 10% and 400% (`design/check.mjs`).
- [ ] R1, R3 · manual — Given Screens / Mobile on an iPad at Fit, when one finger drags across a screen and two fingers pinch out and back in, then the canvas follows the finger, zooms about the fingers and returns to the starting zoom.
- [ ] R2 · manual — Given Legal / Terms at 100%, when one finger drags up on its text, then the terms scroll and the canvas stays still.
- [ ] R4 · manual — Given Inspect mode, when the Google button on Sign in is tapped and then the empty canvas, then the Inspect tab shows `OrbitButton` and the selection then clears; a pan ending on a screen selects nothing.
- [ ] R4 · manual — Given Prototype mode, when Terms is tapped, then Legal / Terms is tapped, then the link is drawn; tapping a hotspot and then the empty canvas leaves no link.
- [ ] R3, R5 · manual — Given Move mode, when one finger drags Sign in 100 px and then a second finger lands mid-drag, then Sign in returns to its start and the canvas pinches instead.
- [ ] R6, R7 · manual — Given an iPad in portrait, when the workspace opens and a screen is long-pressed, then the canvas is full width with the pages panel over it, the inspector is hidden and no text is selected.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [ ] Manual criteria pass on iPad Safari and Android Chrome; the design-workspace R2 manual criterion still passes with a mouse in Chrome and Safari.

## 8. Open questions
- Touch multi-select and an on-screen undo — Weslley — not blocking.
- Assumptions: 1200 px and `pointer: coarse` separate tablets from laptops, so a touch laptop at full width keeps the side-by-side panels.
