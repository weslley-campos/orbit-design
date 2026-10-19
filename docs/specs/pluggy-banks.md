# Spec: Pluggy banks, one Item ID each draft

Status: Draft

## 1. Outcome
- User: someone who connected their banks in MeuPluggy and wants Orbit to bring in each bank's expenses.
- Problem: Pluggy setup asked for one "Connector ID" with the credentials. That value is a Pluggy Item UUID, and each bank shared from MeuPluggy is its own Item. In the Pluggy dashboard they all appear as "MeuPluggy". One form with one ID could only ever connect one bank.
- Desired result: setup keeps only the Client ID and Client secret. The user then adds banks one at a time: they pick the bank from Orbit's list, then paste the ID of the Item that reads it. A bottom sheet explains how to create that Item.

## 2. Scope
- Included:
  - `screens/connectors-no-banks`: Pluggy set up with no bank yet, "Connected · no banks yet", a short explanation and an Add a bank button.
  - `screens/connectors-institutions` (Choose a bank, taken out of Archived): title, guidance, a "How does this work?" link, search, "10 BANKS" and the banks with Orbit's logos and a chevron, plus a note that only bank accounts and credit cards are read.
  - `screens/connectors-connect-bank` (Connect bank): the picked bank's logo, "Connect C6 Bank", guidance, an "Item ID" field, a "How do I find the item ID?" link, Connect bank and Cancel.
  - `screens/connectors-choose-bank-help` and `screens/connectors-connect-bank-help`: the same "Connecting a bank" sheet over each screen.
  - Add a bank on `screens/connectors` and C6 Bank there as a bank waiting for its first sync.
- Excluded: creating Items from Orbit (Pluggy Connect), checking that an Item belongs to the picked bank, investments and brokers, removing a single bank, search results and empty search, error and loading states, and production app and API changes.
- Design: `screens/pluggy-setup` → `screens/connectors-no-banks` → `screens/connectors-institutions` ⇄ `screens/connectors-choose-bank-help`; `screens/connectors` → `screens/connectors-institutions` → `screens/connectors-connect-bank` ⇄ `screens/connectors-connect-bank-help`; `screens/connectors-connect-bank` → `screens/connectors`.

## 3. Required behavior
- R1: After Pluggy setup saves the credentials and no bank is added yet, Connectors shows Pluggy "Connected · no banks yet" with "Add the banks you’ve already connected in MeuPluggy, one at a time." and Add a bank. The Pluggy row opens the Pluggy screen.
- R2: Add a bank, on Connectors or Connectors · No banks yet, opens Choose a bank. Back returns to Connectors.
- R3: Choose a bank lists banks and payment institutions from Orbit's catalog (types `BANK` and `PAYMENTS`, the ones with a logo), sorted by name, each with Orbit's logo, its catalog name and a chevron. A row shows no status: no Connected, Unstable or Offline, because Orbit only knows a bank's state once an Item is linked to it. There are no type filters.
- R4: Picking a bank opens Connect bank for it (C6 Bank in the prototype). The screen shows the bank's logo, "Connect C6 Bank", "Paste the ID of the item you created for C6 Bank in the Pluggy dashboard with the MeuPluggy connector." and one Item ID field. Connect bank returns to Connectors, where the bank shows "Waiting for the first sync" until the first import. Cancel returns to Connectors, and Back to Choose a bank.
- R5: "How does this work?" on Choose a bank and "How do I find the item ID?" on Connect bank open the "Connecting a bank" sheet. It lists three steps: add the bank at meu.pluggy.ai; at dashboard.pluggy.ai, connect a new item with the MeuPluggy connector and choose that bank; copy the new item's ID into Orbit. A note says every bank needs its own item and that they're all named MeuPluggy in the dashboard. Got it and Close return to the screen underneath.
- R6: Palette, light/dark mode and English/Portuguese settings apply to every frame, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse `OrbitCard`, `HorizontalDivider`, `OrbitOutlineTextField`, `OrbitButton`, `OrbitIconButton`, `OrbitBottomSheet`, the Family list rows, `helpPoint` from the secret help sheet and the `sheetFrame` layout, with declared theme tokens.
- Bank logos are Orbit's own (orbit-api `src/static/images/banks`, the `bg_` variant that `GET /connectors` sends as `logo.background`). Ten sample banks are copied into `design/assets/proposed/banks` and clipped to a 36dp circle (56dp on Connect bank) over `colors.brand.subtleSolid`, like the app's `ConnectorLogo`.
- The bank list keeps the `screens/connectors-institutions` id so saved drafts still load; it now reads "Connectors · Choose a bank".
- Pluggy's own names ("MeuPluggy", "Pluggy") stay as they are in Portuguese. "Item ID" is "ID do item".

## 6. Acceptance criteria
- [x] R1 · manual — Given Pluggy setup in Play, when Save and connect is activated, then Connectors · No banks yet shows "Connected · no banks yet" and Add a bank.
- [x] R2 · manual — Given Connectors or Connectors · No banks yet in Play, when Add a bank is activated, then Choose a bank opens; when Back is activated, then Connectors is shown.
- [x] R3 · manual — Given Choose a bank, when inspected, then it shows "10 BANKS" with ten logos and names and a chevron each, and no status, filter or Connected pill.
- [x] R4 · manual — Given Choose a bank in Play, when C6 Bank is activated, then Connect C6 Bank opens with an Item ID field; when Connect bank is activated, then Connectors shows C6 Bank "Waiting for the first sync".
- [x] R5 · manual — Given Choose a bank or Connect bank in Play, when the help link is activated, then the "Connecting a bank" sheet opens over it with three steps and the note; when Got it or Close is activated, then the screen underneath is shown.
- [x] R6 · manual — Given Flamingo light and dark in English and Portuguese, when each new frame is viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- After the first import, if the imported accounts' bank code isn't the picked bank's, should Orbit warn the user or rename the bank? — product owner — does not block.
- What do the error states show (Item not found, Item belonging to another Orbit account, Item already added)? — product owner — next design.
- Assumptions: the bank list comes from Orbit's catalog through a new `GET /institutions?types=BANK,PAYMENTS` that needs no Pluggy call. Connect bank sends the Item ID with the picked bank's code. Through MeuPluggy every Item reports Pluggy's MeuPluggy connector (`200`), so the picked bank is what names the row until the first import. The ten banks and the UUID are samples.
