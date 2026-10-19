# Spec: Pluggy screen and disconnect draft

Status: Draft

## 1. Outcome
- User: someone whose Orbit is connected to Pluggy and who wants to stop that connection or check what Orbit saved.
- Problem: tapping Pluggy on Connectors opens the setup form for a new connection, so there's no way to see the saved connection or remove it.
- Desired result: once Pluggy is connected, its row opens a Pluggy screen with the saved credentials, Edit credentials and Disconnect Pluggy, and disconnecting asks for confirmation first.

## 2. Scope
- Included:
  - `screens/pluggy`: a Pluggy badge, title, guidance and "Connected · 4 banks"; a Credentials card with Client ID, Client secret ("Saved encrypted · never shown") and Edit credentials; a note that each bank added in Orbit uses its own item ID; and a Disconnect Pluggy button.
  - `screens/pluggy-disconnect`: a confirmation sheet over the Pluggy screen with an "Imported data" choice (Keep in Orbit, default / Delete from Orbit), one Disconnect button and Cancel. The button reads "Disconnect and delete data" when Delete from Orbit is chosen.
  - `screens/pluggy-disconnect-delete`: the same sheet with Delete from Orbit chosen.
  - Prototype links from Connectors, to Pluggy setup and back to Connectors · Not set up.
- Excluded: removing a single bank (done in MeuPluggy), revoking the Items or the consent at Pluggy, error and loading states, and production app changes.
- Design: `screens/connectors` → `screens/pluggy` → `screens/pluggy-disconnect` ⇄ `screens/pluggy-disconnect-delete` → `screens/connectors-empty`; `screens/pluggy` → `screens/pluggy-setup`.

## 3. Required behavior
- R1: When Pluggy is connected, activating its row on Connectors opens the Pluggy screen, and Back returns to Connectors.
- R2: The Pluggy screen shows the saved Client ID, never the client secret, and the number of banks. Item IDs belong to each bank ([pluggy-banks.md](pluggy-banks.md)), so the screen shows none. Edit credentials opens Pluggy setup.
- R3: Disconnect Pluggy opens a confirmation sheet that says Orbit stops syncing the banks and deletes the saved client ID and secret, that the banks stay connected in MeuPluggy, and asks whether to keep or delete the imported accounts, cards and expenses. Keep in Orbit is selected by default.
- R4: Disconnect (Keep in Orbit) deletes the saved credentials and keeps the imported data; Disconnect and delete data (Delete from Orbit) also deletes the accounts, cards and expenses imported from Pluggy. Both return to Connectors · Not set up. Cancel returns to the Pluggy screen without changes.
- R5: Palette, light/dark mode and English/Portuguese settings apply to both frames, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse `OrbitCard`, `HorizontalDivider`, `OrbitButton` (`Outlined` with `Settings/danger` like Sign out, `Destructive` in the sheet), `OrbitBottomSheet`, the Settings rows and the sign-out sheet layout (`EmailSent/badge`, `Settings/dangerBadge`), with declared theme tokens.
- The "Imported data" choice reuses the Wallet sort sheet's radio rows (`Settings/stack` + `settingsRow` with a brand check).
- The new icon is a Lucide proposal (`ic_unplug`) under `design/assets/proposed`.
- Pluggy's own terms ("Client ID", "Client secret") stay in English in the Portuguese copy, as in Pluggy setup.

## 6. Acceptance criteria
- [x] R1 · manual — Given Connectors in Play, when Pluggy is activated, then the Pluggy screen opens; when Back is activated, then Connectors is shown.
- [x] R2 · manual — Given the Pluggy screen, when inspected, then Client ID shows a UUID, there is no Connector ID row, and Client secret reads "Saved encrypted · never shown"; when Edit credentials is activated in Play, then Pluggy setup opens.
- [ ] R3 · manual — Given the Pluggy screen in Play, when Disconnect Pluggy is activated, then the sheet "Disconnect Pluggy?" opens over the dimmed screen with Keep in Orbit selected, the Disconnect button and Cancel; when Delete from Orbit is activated, then it is selected and the button reads "Disconnect and delete data".
- [ ] R4 · manual — Given the disconnect sheet in Play (either choice), when Disconnect or Disconnect and delete data is activated, then Connectors · Not set up is shown; when Cancel is activated, then the Pluggy screen is shown.
- [ ] R4 · unit — Given saved Pluggy credentials, when Pluggy is disconnected, then the client ID, client secret and every bank's item ID are deleted; with Keep the imported data remains, with Delete the imported accounts, cards and expenses are deleted too. (Belongs to the app implementation.)
- [x] R5 · manual — Given Flamingo light and dark in English and Portuguese, when both frames are viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [ ] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Should disconnecting also delete the Items at Pluggy, or only Orbit's saved credentials? MeuPluggy keeps the banks either way. — engineering — blocks implementation.
- Do imported expenses stay after disconnecting, or should the sheet offer to delete them? Resolved: the sheet asks; Keep is the default.
- Assumptions: the values shown are samples; the bank count matches Connectors.
