# Spec: Pluggy setup draft

Status: Draft

## 1. Outcome
- User: someone connecting Orbit to their own Pluggy account so it can read their bank transactions.
- Problem: Orbit needs a client ID and a client secret to call Pluggy, and there's no place to enter them.
- Desired result: a setup screen, opened from Set up Pluggy, Edit credentials or Reconnect, that collects the two credentials and saves them. Banks are added afterwards, one Item ID each ([pluggy-banks.md](pluggy-banks.md)).

## 2. Scope
- Included:
  - `screens/pluggy-setup`: a Pluggy badge, title and guidance; Client ID and Client secret (masked, with show, and a ? button) fields; a "Where do I find these?" link; Save and connect and Cancel.
  - `screens/pluggy-secret-help`: a bottom sheet, opened from the ? button, explaining how the secret is stored.
  - Prototype links from Connectors · Not set up, the Pluggy screen and Reconnect on Connectors.
- Excluded: adding banks ([pluggy-banks.md](pluggy-banks.md)), error and loading states, the content behind "Where do I find these?", an edit-mode title and button for saved credentials, disconnecting ([pluggy-disconnect.md](pluggy-disconnect.md)), and production app changes.
- Design: `screens/connectors-empty` / `screens/pluggy` / `screens/connectors` → `screens/pluggy-setup` → `screens/connectors-no-banks`; `screens/pluggy-setup` ⇄ `screens/pluggy-secret-help`.

## 3. Required behavior
- R1: Set up Pluggy on Connectors · Not set up, Edit credentials on the Pluggy screen, or Reconnect on a bank paused for `CREDENTIALS` or `ITEM` on Connectors opens Pluggy setup in Play.
- R2: The screen shows only Client ID and Client secret, each with a label and no hint underneath. Client ID is a UUID. There is no Connector ID field: one Pluggy Item reads one bank, so the Item ID is asked per bank. The secret is masked and has a show toggle, and its label has a ? button.
- R3: Save and connect checks the pair with Pluggy and, the first time, lands on Connectors · No banks yet; from Edit credentials or Reconnect the app returns to Connectors with its banks (the prototype shows the first case). Cancel and Back return to Connectors without saving.
- R4: The ? button opens a sheet with three points: stored encrypted, never shown again after saving (paste a new one to change it), and keep it private. Got it and Close return to setup. The app stores the secret encrypted and never shows it again.
- R5: Palette, light/dark mode and English/Portuguese settings apply to the whole screen, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse `OrbitOutlineTextField`, `OrbitIconButton`, `OrbitButton`, `OrbitBottomSheet` and the existing form styles (`Screen/eyebrow`, `EmailSent/badge`), with declared theme tokens.
- Pluggy's own terms ("Client ID", "Client secret") stay in English in the Portuguese copy, to match its dashboard.

## 6. Acceptance criteria
- [x] R1 · manual — Given Connectors · Not set up in Play, when Set up Pluggy is activated, then Pluggy setup opens; given the Pluggy screen, when Edit credentials is activated, then Pluggy setup opens; given Connectors, when Inter's Reconnect is activated, then Pluggy setup opens.
- [x] R2 · manual — Given Pluggy setup, when inspected, then Client ID shows a UUID, there is no Connector ID field, Client secret shows dots with an eye button and a ? next to its label, and no field has a hint.
- [x] R3 · manual — Given Pluggy setup, when Save and connect is activated, then Connectors · No banks yet is shown; when Cancel or Back is activated, then Connectors is shown.
- [x] R4 · manual — Given Pluggy setup in Play, when ? is activated, then the secret help sheet opens over dimmed setup; when Got it or Close is activated, then setup is shown.
- [ ] R4 · unit — Given a saved client secret, when settings are read back, then the secret is not returned in plain text. (Belongs to the app implementation.)
- [x] R5 · manual — Given Flamingo light and dark in English and Portuguese, when Pluggy setup is viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Where are the client ID and secret kept: on the device, or on a backend that calls Pluggy? Pluggy recommends keeping the client secret server-side. — engineering — blocks implementation.
- What do the error states show (wrong credentials)? — product owner — next design.
- Assumptions: both values come from the user's own Pluggy dashboard; the values shown are samples. The API checks them with Pluggy's `POST /auth`, which needs no Item.
