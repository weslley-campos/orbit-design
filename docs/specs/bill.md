# Spec: Bill draft

Status: Draft

## 1. Outcome
- User: anyone who pays with a credit card, alone or with family members on the same card. In Brazil it is common for other people to use someone's card, often as an additional card.
- Problem: Wallet · Card shows only the open bill's amount and four recent purchases. There is no way to see a whole bill: who spent it, where it went, what is on it, or what installments already take from coming bills. Orbit also loads every card from the bank, including cards used by people outside the family.
- Desired result: a Bill screen for one card, one cycle at a time, that opens from See bill, and a Card sync screen that decides which cards Orbit loads, from when, and who uses each one.

## 2. Scope
- Included:
  - `screens/wallet-bill` (October, open), `screens/wallet-bill-september` (paid) and `screens/wallet-bill-november` (next). They share:
    - the card and a ‹ month bill › stepper;
    - the bill card: amount, closing and due dates, and a status line as the bank reports it;
    - Installments: each row shows "3 of 10", how many are left, the installment and the purchase total, and a bar for what is already charged.
  - October and September add By family member (a split bar and one row per person) and By category, then See all. October adds the limit, "Closes in N days", what installments already take from coming bills (opens November) and the purchases grouped by day.
  - November shows when it opens and only the installments already scheduled on it.
  - `screens/wallet-card-sync`:
    - Load / Don't load for the card;
    - a period with From and an optional Until;
    - the cards the bank reports on this account (main and additional), each with the family member who uses it, or someone outside the family whose card is not loaded.
  - Prototype links: See bill → Bill; the stepper among September, October and November; coming bills → November; the sliders on each bill and ⋯ on Wallet · Card → Card sync; back, iFood → Transaction, Restaurants → Charts · Restaurants, See all → Transactions · Month.
- Excluded: paying a bill or marking it as paid, a closed-but-unpaid or overdue bill frame, the installment schedule of one purchase, choosing a family member for a card, per-card periods, the bills before September and after November, production app changes.
- Design: `screens/wallet-card` → `screens/wallet-bill` ⇄ `-september`, `-november`; `screens/wallet-card-sync`.

## 3. Required behavior
- R1: See bill on a card opens that card's open bill. Back returns to the card.
- R2: A bill's status, payment and dates come only from the bank. Orbit never marks a bill as paid: a paid bill reads "Paid Sep 20 · reported by Itaú".
- R3: The stepper moves to the previous or next bill of the same card. The open bill shows the limit and "Closes in N days"; the next bill shows when it opens and that new purchases go to it.
- R4: Installments are listed in their own section, never among the day's purchases: a purchase made months ago shows on each bill it is charged to with its number ("3 of 10 · 7 left", or "3 of 3 · last"), the installment amount and the purchase total. The open bill sums what installments already take from coming bills, which opens the next bill.
- R5: By family member splits the bill by who uses each card; By category lists each category with amount, purchases and share, the bar segments in the same order. A category row opens that category.
- R6: On the open bill, purchases are grouped by day with the day's total and leave out the card. A row opens the transaction; See all opens Transactions with the bill's purchases.
- R7: Card sync turns loading a card on or off; turning it off keeps what is already in the history. Orbit loads purchases from the From date; without an Until date it keeps fetching new purchases.
- R8: Card sync lists every card the bank reports on the account with who uses it. Purchases on a card count for that family member, and a card used by someone outside the family can stay out of Orbit.
- R9: Palette, light/dark mode and English/Portuguese apply to all four frames, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse the Wallet · Card bill card, the Transactions stepper, day groups and rows, the Charts category bar and rows, the Home family split, the Settings rows and option chips, `OrbitCard`, `OrbitButton`, `OrbitFilterChip`, `OrbitOutlineTextField` and `OrbitLinearProgressIndicator`.
- One new style, `Bill/installment`: a list row with token padding and no fixed height, so the bar fits. No new tokens, literals or icons.
- Main and additional cards come from the bank through Pluggy with their last 4 digits.

## 6. Acceptance criteria
- [x] R1 · manual — Given Wallet · Card in Play, when See bill is activated, then Wallet · Bill opens with "October bill"; Back returns to Wallet · Card.
- [x] R2 · manual — Given Wallet · Bill · September, when inspected, then it reads R$ 1.986,40 and "Paid Sep 20 · reported by Itaú", with no action to mark it paid.
- [x] R3 · manual — Given Wallet · Bill in Play, when the previous and next arrows are activated, then September and November open; November reads "Opens Oct 13" and R$ 412,30.
- [x] R4 · manual — Given Wallet · Bill, when inspected, then Magazine Luiza reads "Installment 3 of 10 · 7 left", R$ 289,90 of R$ 2.899,00, and "R$ 2.151,70 on coming bills" opens November.
- [x] R5 · manual — Given Wallet · Bill, when inspected, then Ana has R$ 1.498,10 (70%) and Marina R$ 642,10 (30%), and the four categories add up to R$ 2.140,20.
- [x] R6 · manual — Given Wallet · Bill in Play, when iFood is activated, then Transaction opens; Uber reads "Transport · Marina" without the card.
- [x] R7 · manual — Given Card sync, when inspected, then Load is selected, From reads "Sep 1, 2026" and Until reads "No end date".
- [x] R8 · manual — Given Card sync, when inspected, then •••• 4821 is Ana's, •••• 7730 Marina's, and •••• 5512 reads "Carlos · not loaded since Aug 1".
- [x] R9 · manual — Given Flamingo light and dark in English and Portuguese, when each frame is viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Is the period set per account or per card (e.g. Carlos's additional card left out only from Aug 1)? — product owner — blocks the per-card sync screen.
- When the bank reports no payment by the due date, how does an overdue bill look? — product owner — does not block this draft.
- Decided: Orbit only shows what the bank reports about payments; installments have their own section on each bill (see R4); a shared card splits its bill by family member, by who uses each card.
- Assumptions: today is Wednesday, 7 October 2026; the October cycle runs Sep 13 – Oct 12; amounts, cards, people and dates are sample data.
