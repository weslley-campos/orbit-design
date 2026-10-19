# Spec: Connectors draft

Status: Draft

## 1. Outcome
- User: someone who tracks expenses in Orbit and doesn't want to type each one.
- Problem: there is no place to connect Orbit to an aggregator or to see which banks feed it transactions.
- Desired result: a Connectors (Conexões) screen, opened from Settings. It lists connectors, and today that means Pluggy only. Once Pluggy is set up, the banks it reads transactions from are shown beneath it, each with what the user can do when its sync is paused.

## 2. Scope
- Included:
  - `screens/connectors-empty`: Pluggy not set up yet, with a Set up Pluggy button.
  - `screens/connectors`: Pluggy connected, with its banks (Nubank synced, Itaú paused for `AUTHORIZATION`, Inter paused for `CREDENTIALS`, C6 Bank waiting for the first sync) and Add a bank, which opens Choose a bank ([pluggy-banks.md](pluggy-banks.md)).
  - A "More connectors coming soon" placeholder and prototype links.
- Excluded: the Pluggy screen and disconnecting ([pluggy-disconnect.md](pluggy-disconnect.md)), Pluggy setup ([pluggy-setup.md](pluggy-setup.md)), adding a bank and the no-banks state ([pluggy-banks.md](pluggy-banks.md)), the Settings screen ([settings.md](settings.md)), MeuPluggy itself, per-bank detail and production app changes.
- Design: `screens/settings` → `screens/connectors` → `screens/pluggy`, `screens/pluggy-setup` and `screens/connectors-institutions`; `screens/connectors-empty`.

## 3. Required behavior
- R1: Activating Connectors on Settings in Play opens Connectors, and Back returns to Settings.
- R2: Connectors shows a single Pluggy card. Not set up, it shows "Open Finance · not set up", a short explanation and Set up Pluggy. Connected, it shows "Connected · 4 banks" and a chevron that opens the Pluggy screen.
- R3: Under "Transactions from", each bank shows Orbit's logo for it (`logo.background`), its name and a sync status. A bank just added shows a clock and "Waiting for the first sync". Synced uses the success color with a check icon. Paused uses the warning color with an alert icon and "Sync paused", followed by what fixes it, from the `reconnect` that the Orbit API's `GET /connectors` sends:
  - `AUTHORIZATION` (consent expired or revoked, login error, pending input): the user fixes it in MeuPluggy and the next sync picks it up. Orbit can't do this step, so the row shows a non-interactive "Authorize in MeuPluggy" pill and no Reconnect. This is the common case.
  - `CREDENTIALS` (Pluggy rejects the saved client ID or secret): Reconnect opens Pluggy setup to re-enter them.
  - `ITEM` (Pluggy no longer has the saved Item): Reconnect opens Connect bank for that bank to paste the new Item ID.
- R4: Add a bank is a row with a chevron (no external-link icon) that opens Choose a bank, where the user links a bank already connected in MeuPluggy to its Item ID ([pluggy-banks.md](pluggy-banks.md)).
- R5: Palette, light/dark mode and English/Portuguese settings apply to both frames, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse `OrbitCard`, `HorizontalDivider`, `OrbitButton`, `OrbitIconButton` and the Family members list styles, with declared theme tokens. The authorization pill is `Family/youPill`, recolored by `Connectors/authorizePill` with `colors.text.warning` on `colors.direction.warnSubtle`.
- Bank logos are Orbit's own SVGs from orbit-api (`images/banks/bg_<uuid>.svg`), copied for ten sample banks into `design/assets/proposed/banks`, clipped to a circle like the app's `ConnectorLogo`.
- New icons are Lucide proposals (`ic_plug`, `ic_landmark`, `ic_search`, `ic_shield_check`, `ic_circle_check`) under `design/assets/proposed`.

## 6. Acceptance criteria
- [x] R1 · manual — Given Settings in Play, when Connectors is activated, then Connectors opens; when Back is activated, then Settings is shown.
- [x] R2 · manual — Given Connectors · Not set up, when inspected, then Pluggy shows "Open Finance · not set up" and Set up Pluggy; given Connectors, then Pluggy shows "Connected · 4 banks", and activating it in Play opens the Pluggy screen.
- [x] R3 · manual — Given Connectors, when inspected, then Nubank shows "Synced 5 min ago"; Itaú shows "Sync paused" with the "Authorize in MeuPluggy" pill, no Reconnect and no hotspot on the pill; Inter shows "Sync paused" with Reconnect, which opens Pluggy setup in Play; C6 Bank shows "Waiting for the first sync".
- [x] R4 · manual — Given Connectors in Play, when Add a bank is activated, then Choose a bank opens; the row has a chevron and no external-link icon.
- [x] R5 · manual — Given Flamingo light and dark in English and Portuguese, when each frame is viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Should the "Authorize in MeuPluggy" pill link to MeuPluggy, and what should it say when the Item was created in the user's own Pluggy application instead of MeuPluggy? — product owner — does not block this draft.
- Assumptions: Pluggy is the only connector for now; statuses and counts are sample data. In Portuguese, Itaú's "Sincronização pausada" wraps to two lines next to the pill and stays inside its row.
