# Spec: Pluggy setup draft

Status: Draft

## 1. Outcome
- User: someone connecting Orbit to their own Pluggy account so it can read their bank transactions.
- Problem: Orbit needs a client ID, a client secret and a connector ID to call Pluggy, and there's no place to enter them.
- Desired result: a setup screen, opened by tapping Pluggy on Connectors, that collects the three values and connects.

## 2. Scope
- Included: a proposed `screens/pluggy-setup` frame with a Pluggy badge, title and guidance; Client ID, Client secret (masked, with show) and Connector ID fields with hints; a "Where do I find these?" link; Save and connect and Cancel. Prototype links from Connectors and Connectors · Not set up.
- Excluded: validating credentials against Pluggy, error and loading states, the help content, editing or removing saved credentials, disconnecting, and production app changes.
- Design: `screens/connectors` / `screens/connectors-empty` → `screens/pluggy-setup` → `screens/connectors`.

## 3. Required behavior
- R1: Tapping the Pluggy row on Connectors, or Set up Pluggy on Connectors · Not set up, opens Pluggy setup in Play.
- R2: The screen shows Client ID, Client secret and Connector ID, each with a label. The secret is masked and has a show toggle. The secret and Connector ID fields have hints.
- R3: Save and connect returns to Connectors in its connected state. Cancel and Back return to Connectors without saving.
- R4: The client secret is stored encrypted and never shown again after saving.
- R5: Palette, light/dark mode and English/Portuguese settings apply to the whole screen, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse `OrbitOutlineTextField`, `OrbitIconButton`, `OrbitButton` and the existing form styles (`Screen/eyebrow`, `EmailSent/badge`), with declared theme tokens.
- Pluggy's own terms stay in Portuguese ("Client ID", "Client secret") to match its dashboard. "Connector ID" is translated as "ID do conector".

## 6. Acceptance criteria
- [x] R1 · manual — Given Connectors in Play, when Pluggy is activated, then Pluggy setup opens; given Connectors · Not set up, when Set up Pluggy is activated, then Pluggy setup opens.
- [x] R2 · manual — Given Pluggy setup, when inspected, then Client ID shows a UUID, Client secret shows dots with an eye button, and Connector ID shows 201 with its hint.
- [x] R3 · manual — Given Pluggy setup, when Save and connect, Cancel or Back is activated, then Connectors is shown.
- [ ] R4 · unit — Given a saved client secret, when settings are read back, then the secret is not returned in plain text. (Belongs to the app implementation.)
- [x] R5 · manual — Given Flamingo light and dark in English and Portuguese, when Pluggy setup is viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Where are the client ID and secret kept: on the device, or on a backend that calls Pluggy? Pluggy recommends keeping the client secret server-side. — engineering — blocks implementation.
- Is the connector ID a single value, or one per bank? — product owner — may change the field into a list.
- What do the error states show (wrong credentials, unknown connector)? — product owner — next design.
- Assumptions: the three values come from the user's own Pluggy dashboard; the values shown are samples.
