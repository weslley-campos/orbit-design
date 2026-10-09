# Spec: Pluggy setup draft

Status: Draft

## 1. Outcome
- User: someone connecting Orbit to their own Pluggy account so it can read their bank transactions.
- Problem: Orbit needs a client ID, a client secret and a connector ID to call Pluggy, and there's no place to enter them.
- Desired result: a setup screen, opened by tapping Pluggy on Connectors, that collects the three values and connects.

## 2. Scope
- Included:
  - `screens/pluggy-setup`: a Pluggy badge, title and guidance; Client ID, Client secret (masked, with show, and a ? button) and Connector ID fields; a "Where do I find these?" link; Save and connect and Cancel.
  - `screens/pluggy-secret-help`: a bottom sheet, opened from the ? button, explaining how the secret is stored.
  - Prototype links from Connectors and Connectors · Not set up.
- Excluded: validating credentials against Pluggy, error and loading states, the content behind "Where do I find these?", editing or removing saved credentials, disconnecting, and production app changes.
- Design: `screens/connectors` / `screens/connectors-empty` → `screens/pluggy-setup` → `screens/connectors`; `screens/pluggy-setup` ⇄ `screens/pluggy-secret-help`.

## 3. Required behavior
- R1: Tapping the Pluggy row on Connectors, or Set up Pluggy on Connectors · Not set up, opens Pluggy setup in Play.
- R2: The screen shows Client ID, Client secret and Connector ID, each with a label and no hint underneath. Client ID and Connector ID are UUIDs. The secret is masked and has a show toggle, and its label has a ? button.
- R3: Save and connect returns to Connectors in its connected state. Cancel and Back return to Connectors without saving.
- R4: The ? button opens a sheet with three points: stored encrypted, never shown again after saving (paste a new one to change it), and keep it private. Got it and Close return to setup. The app stores the secret encrypted and never shows it again.
- R5: Palette, light/dark mode and English/Portuguese settings apply to the whole screen, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse `OrbitOutlineTextField`, `OrbitIconButton`, `OrbitButton`, `OrbitBottomSheet` and the existing form styles (`Screen/eyebrow`, `EmailSent/badge`), with declared theme tokens.
- Pluggy's own terms ("Client ID", "Client secret") stay in English in the Portuguese copy, to match its dashboard. "Connector ID" is translated as "ID do conector".

## 6. Acceptance criteria
- [x] R1 · manual — Given Connectors in Play, when Pluggy is activated, then Pluggy setup opens; given Connectors · Not set up, when Set up Pluggy is activated, then Pluggy setup opens.
- [x] R2 · manual — Given Pluggy setup, when inspected, then Client ID and Connector ID show UUIDs, Client secret shows dots with an eye button and a ? next to its label, and no field has a hint.
- [x] R3 · manual — Given Pluggy setup, when Save and connect, Cancel or Back is activated, then Connectors is shown.
- [x] R4 · manual — Given Pluggy setup in Play, when ? is activated, then the secret help sheet opens over dimmed setup; when Got it or Close is activated, then setup is shown.
- [ ] R4 · unit — Given a saved client secret, when settings are read back, then the secret is not returned in plain text. (Belongs to the app implementation.)
- [x] R5 · manual — Given Flamingo light and dark in English and Portuguese, when Pluggy setup is viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Where are the client ID and secret kept: on the device, or on a backend that calls Pluggy? Pluggy recommends keeping the client secret server-side. — engineering — blocks implementation.
- What do the error states show (wrong credentials, unknown connector)? — product owner — next design.
- Assumptions: the three values come from the user's own Pluggy dashboard; the values shown are samples.
