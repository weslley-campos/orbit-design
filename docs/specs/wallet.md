# Spec: Wallet draft

Status: Draft

## 1. Outcome
- User: anyone who pays with more than one credit card.
- Problem: expenses are tracked, but there is no place to see each card's open bill, when it closes and is due, or which purchases went on it.
- Desired result: a Wallet (Carteira) tab inspired by Apple Wallet. Cards sit in a stack; tapping one brings it to the top with its bill and recent transactions. Cards can be added, removed, reordered by hand or sorted.

## 2. Scope
- Included:
  - `screens/wallet`: the stacked cards, the total of open bills, Sort and Add actions, and Open bills (thumbnail, closing and due dates, amount) in the same order as the stack.
  - `screens/wallet-card`: a tapped card on top, with:
    - name and network with the last 4 digits, and the current bill with closing and due dates, limit usage and the amount available;
    - Edit and Remove, and recent transactions;
    - the other cards waiting in a short deck above the bar.
  - `screens/wallet-sort`: a sheet with Manual, Highest bill first, Next due date and A–Z (the selected one has a check), plus Edit order.
  - `screens/wallet-edit`: reorder by dragging a handle (one card is mid-drag), remove from each row, and Add card.
  - `screens/wallet-add`: import from the bank through Pluggy, or a manual form (name, last 4 digits, optional limit, network, closing and due days) with a live card preview.
  - `screens/wallet-remove`: confirmation that a card's expenses stay in history.
  - Prototype links among all six, the Wallet tab from Home, Charts and Settings, and Import → Connectors.
- Excluded: the full bill screen, editing a single card's details, flipping a card, paying a bill, Pluggy's card import flow, production app changes.
- Design: `screens/home` → `screens/wallet` → `screens/wallet-card`, `screens/wallet-sort`, `screens/wallet-edit`, `screens/wallet-add`, `screens/wallet-remove`.

## 3. Required behavior
- R1: The Wallet tab opens Wallet with Wallet selected. Each card behind the last shows a 64dp strip, and the last card is shown whole.
- R2: Tapping a card (or its Open bills row) opens it on top. The bill shows its closing and due dates, the limit used as a bar, and the amount available. Back or the deck returns to the stack.
- R3: Sort offers Manual, Highest bill first, Next due date and A–Z. Choosing one closes the sheet and reorders both the stack and Open bills. The header of Open bills names the current order and opens the sheet.
- R4: Edit order lists the cards with a remove button and a drag handle. Dragging lifts the row and changes the Manual order. Done returns to Wallet.
- R5: Add card offers Import from your bank first (opens Connectors). The manual form never asks for the full card number or the security code, and the preview shows the typed name, last 4 digits and network.
- R6: Removing a card asks for confirmation and says its expenses stay in history. Cancel returns to the card.
- R7: Palette, light/dark mode and English/Portuguese apply to all six frames, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse `OrbitCard`, `OrbitButton`, `OrbitIconButton`, `OrbitBottomSheet`, `OrbitFilterChip`, `OrbitOutlineTextField`, `OrbitLinearProgressIndicator`, `OrbitNavigationBar`, the Settings rows and the Home expense rows.
- Card art (`assets/proposed/cards/*.jpg`) is artwork the product owner supplied, cropped to the 1.586 card ratio. It belongs to its issuers and is used only as sample data. The app would use the issuer's image from Pluggy, or a generated card like the Add card preview.
- New literals are proposals: the 64dp stack strip (-169dp overlap), the deck strips, the 1dp card edge (keeps the white Amazon card visible on light surfaces) and the preview width. New icons are Lucide proposals (`ic_arrow_up_down`, `ic_grip_vertical`, `ic_circle_minus`, `ic_pencil`, `ic_check`).

## 6. Acceptance criteria
- [x] R1 · manual — Given Home in Play, when Wallet in the bar is activated, then four stacked cards show with Amex Green whole and "4 cards · R$ 4.812,40 in open bills".
- [x] R2 · manual — Given Wallet in Play, when the Azul Itaú card is activated, then it opens with R$ 2.140,20, "Closes Oct 12 · due Oct 20" and four transactions; the deck returns to Wallet.
- [x] R3 · manual — Given Wallet in Play, when Sort is activated, then the sheet shows four orders with Manual checked.
- [x] R4 · manual — Given the sort sheet, when Edit order is activated, then Edit cards shows Bradesco Diners lifted mid-drag.
- [x] R5 · manual — Given Add card, when inspected, then Import from your bank comes first and the preview reads "Nubank Ultravioleta •••• 6620 Mastercard".
- [x] R6 · manual — Given a card, when Remove is activated, then "Remove Azul Itaú?" asks for confirmation.
- [x] R7 · manual — Given Flamingo light and dark in English and Portuguese, when each frame is viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Are cards personal or shared with family members (e.g. Marina's purchases on Ana's card)? — product owner — blocks per-member filters on the card screen.
- Should Highest bill first sort by the open bill or by this month's spending? — product owner — does not block this draft.
- Where does card art come from in the app: Pluggy's connector image, a set of issuer templates, or a color the user picks? — product owner — does not block this draft.
- Assumptions: bills, dates and limits are sample data; the open bill total includes purchases from before this month, so it differs from Home's month total.
