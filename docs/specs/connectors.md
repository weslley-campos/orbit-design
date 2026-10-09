# Spec: Connectors draft

Status: Draft

## 1. Outcome
- User: someone who tracks expenses in Orbit and doesn't want to type each one.
- Problem: there is no place to connect Orbit to an aggregator or to see which banks feed it transactions.
- Desired result: a Connectors (Conexões) screen, opened from Settings. It lists connectors, and today that means Pluggy only. Once Pluggy is set up, the banks it reads transactions from are shown beneath it.

## 2. Scope
- Included:
  - `screens/connectors-empty`: Pluggy not set up yet, with a Set up Pluggy button.
  - `screens/connectors`: Pluggy connected, with its banks (one synced, one paused with Reconnect) and Add a bank.
  - `screens/connectors-institutions`: the institutions Pluggy's `GET /connectors` returns, with search, type filters, health status and a Connected tag.
  - A "More connectors coming soon" placeholder and prototype links.
- Excluded: the Pluggy setup screen (opened by tapping Pluggy or Set up Pluggy), the Settings screen ([settings.md](settings.md)), the Pluggy Connect consent flow, disconnecting, per-bank detail and production app changes.
- Design: `screens/settings` → `screens/connectors` → `screens/connectors-institutions`; `screens/connectors-empty`.

## 3. Required behavior
- R1: Activating Connectors on Settings in Play opens Connectors, and Back returns to Settings.
- R2: Connectors shows a single Pluggy card. Not set up, it shows "Open Finance · not set up", a short explanation and Set up Pluggy. Connected, it shows "Connected · 2 banks" and a chevron for the future setup screen.
- R3: Under "Transactions from", each bank shows its Pluggy `primaryColor` logo, its name and a sync status. Synced uses the success color with a check icon. Paused uses the warning color with an alert icon and Reconnect. Add a bank opens the institutions list.
- R4: The institutions list shows Pluggy's connectors with name, logo color and type (`PERSONAL_BANK` → Personal bank, `INVESTMENT` → Brokerage), plus search (`name`) and All / Banks / Investments filters (`types`). `health.status` `UNSTABLE` shows "Unstable right now". `OFFLINE` fades the row and disables it. Banks already connected show Connected.
- R5: Palette, light/dark mode and English/Portuguese settings apply to all three frames, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse `OrbitCard`, `HorizontalDivider`, `OrbitButton`, `OrbitIconButton`, `OrbitOutlineTextField`, `OrbitFilterChip` and the Family members list styles, with declared theme tokens.
- Institution colors are sample `primaryColor` literals declared as proposals. The app shows the connector's `imageUrl` logo instead of initials.
- New icons are Lucide proposals (`ic_plug`, `ic_landmark`, `ic_search`, `ic_shield_check`, `ic_circle_check`) under `design/assets/proposed`.

## 6. Acceptance criteria
- [x] R1 · manual — Given Settings in Play, when Connectors is activated, then Connectors opens; when Back is activated, then Settings is shown.
- [x] R2 · manual — Given Connectors · Not set up, when inspected, then Pluggy shows "Open Finance · not set up" and Set up Pluggy; given Connectors, then Pluggy shows "Connected · 2 banks".
- [x] R3 · manual — Given Connectors, when Add a bank is activated in Play, then the institutions list opens; Nubank shows "Synced 5 min ago" and Itaú "Sync paused" with Reconnect.
- [x] R4 · manual — Given the institutions list, when inspected, then nine institutions show; Caixa reads "Unstable right now", Santander is faded without a chevron, and Itaú and Nubank show Connected.
- [x] R5 · manual — Given Flamingo light and dark in English and Portuguese, when each frame is viewed at 402 × 874, then no text is clipped and the list scrolls to the last institution.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- What does the Pluggy setup screen contain (consent, Pluggy Connect widget, choosing banks)? — product owner — next design.
- Does Add a bank open Orbit's own institutions list or Pluggy Connect directly? — product owner — does not block this draft.
- Assumptions: Pluggy is the only connector for now; its institutions are filtered to `PERSONAL_BANK` and `INVESTMENT`; statuses, colors and counts are sample data.
