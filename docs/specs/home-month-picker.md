# Spec: Home month picker draft

Status: Draft

## 1. Outcome
- User: someone reviewing monthly expenses in Orbit.
- Problem: the Home month dropdown has no destination showing how to choose a period.
- Desired result: a bottom-sheet design for choosing the year and month.

## 2. Scope
- Included: a proposed Home frame with a modal sheet, year controls, twelve month options, selected October 2026, Apply and Close; prototype links from and back to Home.
- Excluded: production app changes, expense filtering and interactive year/month state changes in the static design workspace.
- Design: `screens/home` → `screens/home-month-picker`.

## 3. Required behavior
- R1: Clicking the Home month hotspot in Play opens the picker over a dimmed copy of Home.
- R2: The sheet shows a drag handle, title, Close, previous/next year controls around 2026, twelve months with October selected, and Apply.
- R3: Close and Apply return to Home; Apply represents confirming the displayed October 2026 selection.
- R4: Palette, light/dark mode and English/Portuguese settings apply to the entire sheet; controls fit within the mobile frame and have at least 48dp touch targets.

## 4. Constraints
- Reuse `OrbitBottomSheet`, `OrbitIconButton`, `OrbitFilterChip`, `OrbitButton` and declared theme tokens.
- Preserve the original Home header and content; proposed dimensions belong in the declarations.

## 6. Acceptance criteria
- [x] R1 · manual — Given Home in Play, when OCTOBER 2026 is activated, then Home · Month picker opens with a bottom sheet over dimmed Home.
- [x] R2 · manual — Given the picker, when inspected, then 2026 has previous/next controls and all twelve month options are visible with October selected.
- [x] R3 · manual — Given the picker showing October 2026, when Close or Apply is activated, then Home is shown with October 2026.
- [x] R4 · manual — Given Flamingo light and dark in English and Portuguese, when the picker is viewed at 402 × 874, then localized controls remain unclipped and their touch targets are at least 48dp.

## 7. Definition of Done (Verification)
- [x] JavaScript design check and Gradle token/declaration checks pass.
- [x] Open/close/apply flow and both languages/themes visually verified.

## 8. Open questions
- Assumptions: this is a proposed static selection state; year range, future periods and expense filtering belong to the eventual Home feature spec.
