# Spec: Bill draft

Status: Draft

## 1. Outcome
- User: anyone who pays with a credit card, alone or with family members on the same card.
- Problem: Wallet · Card shows only the open bill's amount and four recent purchases. There is no way to see a whole bill: where it went, what is on it, or how it compares with the last one.
- Desired result: a Bill screen for one card, one cycle at a time, that opens from See bill.

## 2. Scope
- Included:
  - `screens/wallet-bill`, using Azul Itaú's October bill as the example:
    - the card (thumbnail, name, network and last 4 digits) and a ‹ October bill › stepper to move between bills;
    - the open bill: amount, days until it closes, closing and due dates, limit used and available, and the last bill with its payment date;
    - By category: a split bar and one row per category with amount, purchases and share;
    - the purchases on this bill grouped by day with each day's total, then See all.
  - Prototype links: Wallet · Card's See bill → Bill; Bill's back → Wallet · Card, iFood → Transaction, Restaurants → Charts · Restaurants, See all → Transactions · Month.
- Excluded: previous and future bill frames, paying a bill or copying its payment code, installments, per-family-member totals, the More menu, production app changes.
- Design: `screens/wallet-card` (See bill) → `screens/wallet-bill` → `screens/transaction-detail`, `screens/charts-category`, `screens/transactions`.

## 3. Required behavior
- R1: See bill on a card opens that card's open bill. Back returns to the card.
- R2: The bill card shows the total, "Closes in N days" while it is open, the closing and due dates, the limit bar with the amount available, and the last bill's amount and payment date.
- R3: The stepper moves to the previous or next bill of the same card; its label names the bill's month.
- R4: By category lists every category on the bill with amount, purchases and share, the bar segments in the same order. A category row opens that category.
- R5: Purchases are grouped by day with the day's total; rows leave the card out, since it is the same on every row. A row opens the transaction, and See all opens Transactions with all of the bill's purchases.
- R6: Palette, light/dark mode and English/Portuguese apply to the frame, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse the Wallet · Card bill card, the Transactions stepper, day groups and rows, the Charts category bar and rows, `OrbitCard`, `OrbitButton` and `OrbitLinearProgressIndicator`.
- No new tokens, literals or icons: `ic_clock` and `ic_circle_check` are existing proposals.

## 6. Acceptance criteria
- [x] R1 · manual — Given Wallet · Card in Play, when See bill is activated, then Wallet · Bill opens with "October bill"; Back returns to Wallet · Card.
- [x] R2 · manual — Given Wallet · Bill, when inspected, then it reads R$ 2.140,20, "Closes in 5 days", "Closes Oct 12 · due Oct 20", R$ 9.859,80 available and "Last bill R$ 1.986,40 · paid Sep 20".
- [x] R4 · manual — Given Wallet · Bill in Play, when Restaurants is activated, then Charts · Restaurants opens; the four rows add up to R$ 2.140,20.
- [x] R5 · manual — Given Wallet · Bill in Play, when iFood is activated, then Transaction opens; Uber reads "Transport · Marina" without the card.
- [x] R6 · manual — Given Flamingo light and dark in English and Portuguese, when the frame is viewed at 402 × 874, then no text is clipped.
- [ ] R3 · manual — Given Wallet · Bill, when the previous arrow is activated, then September's paid bill opens (needs its frame).

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Should Orbit follow payments (mark as paid, copy the payment code), or only show what the bank reports? — product owner — blocks a paid or overdue bill state.
- How are installments shown on a bill: "2 of 6" rows, or a separate section with what is still to come? — product owner — blocks the installments design (shared with Transactions).
- Should a shared card split its bill by family member? — product owner — does not block this draft (shared with Wallet).
- Assumptions: today is Wednesday, 7 October 2026; the cycle runs Sep 13 – Oct 12; amounts, counts and the September payment are sample data.
