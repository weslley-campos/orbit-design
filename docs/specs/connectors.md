# Spec: Connectors draft

Status: Draft

## 1. Outcome
- User: someone who tracks expenses in Orbit and doesn't want to type each one.
- Problem: there is no place to see or manage the banks and cards linked to Orbit.
- Desired result: a Connectors (Conexões) screen, opened from the profile, that lists connected and available connectors. Each connector will get its own detail screen later.

## 2. Scope
- Included: a proposed `screens/connectors` frame with a back button, title and guidance, a Connected card (one connector synced, one paused with Reconnect), an Available card (three banks and "Find another bank"), and a note saying Orbit only reads transactions. Prototype links from Home's Profile tab and back to Home.
- Excluded: the Profile screen, the per-connector detail screen, the connect/consent flow, search, disconnecting, and production app changes.
- Design: `screens/home` → `screens/connectors`.

## 3. Required behavior
- R1: Activating the Profile tab on Home in Play opens Connectors, and Back returns to Home. This link stands in until a Profile frame exists.
- R2: The Connected card shows each connector's initials, name and sync status. Synced uses the success color with a check icon. Paused uses the warning color with an alert icon and a Reconnect action.
- R3: The Available card lists Inter, Banco do Brasil and Bradesco with a chevron, followed by "Find another bank". Every row is a hotspot ready to link to the future connector screen.
- R4: Palette, light/dark mode and English/Portuguese settings apply to the whole screen, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse `OrbitCard`, `HorizontalDivider`, `OrbitButton`, `OrbitIconButton` and the Family members list styles (`Family/row`, `Family/avatar`, `Family/note`) with declared theme tokens.
- New icons are Lucide proposals (`ic_landmark`, `ic_shield_check`, `ic_circle_check`) under `design/assets/proposed`.

## 6. Acceptance criteria
- [x] R1 · manual — Given Home in Play, when the Profile tab is activated, then Connectors opens; when Back is activated, then Home is shown.
- [x] R2 · manual — Given Connectors, when inspected, then Nubank shows "Synced 5 min ago" in the success color and Itaú shows "Sync paused" in the warning color with Reconnect.
- [x] R3 · manual — Given Connectors, when inspected, then Inter, Banco do Brasil, Bradesco and "Find another bank" are hotspots with a trailing chevron.
- [x] R4 · manual — Given Flamingo light and dark in English and Portuguese, when Connectors is viewed at 402 × 874, then no text is clipped and Reconnect/Reconectar stays on one line.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Profile → Connectors → Home flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Which connector types exist besides banks (Open Finance), e.g. card issuers or e-mail receipts? — product owner — blocks the final Available list.
- Does Connectors live as a row on the Profile screen or as its own tab? — product owner — does not block this draft.
- Assumptions: connectors are Brazilian banks reached through Open Finance; bank initials stand in for logos; the timestamps and statuses are sample data.
