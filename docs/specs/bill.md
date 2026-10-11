# Spec: Bill

Status: Draft

## 1. Outcome
- User: anyone who pays with a credit card, alone or with family members holding additional cards on the same account.
- Problem: Wallet · Card shows only the open bill's amount and four recent lines. A bill belongs to the credit account, not to a physical card: every card on the account shares one bill, one limit, one closing day and one due day. There is no place to see a whole bill, what the bank reported about it, how much of it is installments, or what later bills already owe.
- Desired result: a Bill screen that opens from a card or from Open bills, says which cards the bill covers, and steps through past, current and future bills. It shows only what the bank or the user's own lines support.

## 2. Scope
- Included:
  - One screen with these parts:
    - the account (card art, name, the cards the bill covers);
    - a ‹ bill › stepper like Transactions;
    - a header: amount, "Closes … · due …", a status pill, and on the open bill the limit bar from Wallet · Card;
    - Payments, on closed bills;
    - Installments: how much of this bill is installments, and on the open and future bills a strip with what the next bills already owe;
    - Lines grouped by day, with a card filter when the account has more than one card.
  - States, each a frame:
    - `screens/wallet-bill`: October, open;
    - `screens/wallet-bill-card`: October filtered to •••• 7730;
    - `screens/wallet-bill-closed`: October closed and unpaid, seen on Wed 14 Oct;
    - `screens/wallet-bill-september`: paid in full;
    - `screens/wallet-bill-august`: partially paid;
    - `screens/wallet-bill-july`: an older month with lines but no bill record;
    - `screens/wallet-bill-november`: future, installments only;
    - `screens/wallet-bill-manual`: Amex Green, a manual card.
  - The previous draft, kept unchanged for comparison in Archived (restore one to see it on the canvas):
    - `screens/wallet-bill-v1-september`, `screens/wallet-bill-v1` and `screens/wallet-bill-v1-november`;
    - their strings are prefixed `bill_v1_` where the redraw changed them;
    - delete them once the comparison is done.
  - Prototype links:
    - See bill and the Azul Itaú Open bills row → October; the Amex Green row → the manual bill;
    - the stepper July ⇄ August ⇄ September ⇄ October ⇄ November;
    - the card chips between October and its filtered frame, and Nov in the strip → November;
    - back to Wallet · Card (manual: Wallet); the sliders → Card sync ([card-sync.md](card-sync.md));
    - a line → Transaction; See all → Transactions.
- Excluded:
  - paying from Orbit, the bill PDF, a boleto barcode or Pix code;
  - interest rate, revolving credit, IOF or late fees as separate numbers;
  - who holds each card (assigned in Card sync, not shown here);
  - merchant names, logos, location or time of a card purchase;
  - an overdue bill frame, a finance-charge frame, December and later bills;
  - bills for Amazon and Bradesco (same screen, not drawn);
  - category and family member splits (Charts and Home cover them);
  - production app changes.
- Design: `screens/wallet-card`, `screens/wallet` → `screens/wallet-bill` and the seven state frames above. Wallet · Card's available amount changes to R$ 7.708,10 (see R5).

## 3. Required behavior
- R1: See bill on a card and an Open bills row open that account's current bill. The header names every card it covers ("One bill for •••• 4821 and •••• 7730"); a manual card reads "Amex •••• 3005 · added by you".
- R2: The stepper moves through bills by due month, from the first cycle Orbit has in full to about 12 months ahead. The previous button is disabled at the first one.
- R3: A closed bill shows the bank's total ("TOTAL FROM ITAÚ"), closed and due dates and a pill. Status and payments come only from the bank; Orbit never marks a bill as paid.
  - Unpaid with the due date ahead: "Due in N days", the minimum payment and "No payment reported yet". When the bank allows it: "Itaú offers to split this bill into installments". It says to pay in the bank's app.
  - Paid in full: "Paid" and each payment with date, method and Full.
  - Partially paid: "Partially paid", the minimum, each payment with Partial, and the total minus the payments as "Not reported as paid".
  - Finance charges show only when the bank sends any, with the bank's type and amount.
- R4: A closed bill's total can differ from the sum of the lines shown. The list never sums up to it: it shows day totals and a count. A note says the total can include amounts with no line, such as a balance carried from an earlier bill or a card Orbit doesn't load.
- R5: The open bill shows "SO FAR" with the sum of its lines, the dates worked out from the account's closing and due days (and says so), no minimum and no payments. It shows the limit bar of Wallet · Card. In use counts every future installment, so it is more than the bill: R$ 4.291,90 in use, R$ 2.151,70 of it future installments, R$ 7.708,10 available.
- R6: A future bill reads "AT LEAST" with only the installments already committed. Each line shows its number and original purchase date, and the note says new purchases add to it.
- R7: Installments: the amount and share of this bill that are installments. On the open and future bills, a strip shows what each next bill already owes (Nov R$ 412,30, then R$ 289,90 until May 2027). An item opens that bill.
- R8: Lines are grouped by day with the day's total. Each line shows:
  - the statement text as the bank sends it;
  - the category badge, the category, and the card's last 4 when the account has more than one card and no filter is on;
  - "Pending" for pending lines;
  - for an installment, "3 of 10" or "Last of 3" under the amount and "bought Jul 14" in the detail;
  - refunds and credits as negative amounts in green.
  A line opens Transaction.
- R9: When the account has more than one card, chips filter the lines: All cards (default), then each card's last 4. A filter keeps the header on the whole bill and adds "R$ 642,10 of this bill is on •••• 7730".
- R10: An older month with lines but no bill record shows "NO BILL FROM ITAÚ" and "No record", the period worked out from the closing day, and its lines. It has no amount, due date, minimum, payments or installments.
- R11: A manual card shows "SUM OF YOUR LINES", the closing and due days the user typed, the lines the user typed, and no minimum, payments or Card sync.
- R12: Palette, light/dark mode and English/Portuguese apply to every frame. At 402 × 874, only statement text and the category in a line's detail may be cut with an ellipsis.

## 4. Constraints
- Data comes from Pluggy as checked against real bank data:
  - closed bills: closing and due dates, total, minimum, payments (date, amount, method, full or partial), installments allowed (yes/no) and finance charges;
  - lines: statement text, signed amount, one of Orbit's seven categories, "n of N" with the purchase date, last 4, posted or pending, date without time;
  - the account: limit, available, in use, network, name and last 4.
- On first sync the bank returns only the 2 most recent closed bills. Older months have lines but no bill record.
- Reuse the Wallet · Card thumbnail and limit bar, the Transactions stepper, day groups and filter chips, the Settings rows, `OrbitCard`, `OrbitButton`, `OrbitIconButton`, `OrbitFilterChip`, `OrbitLinearProgressIndicator` and `HorizontalDivider`.
- New styles, all on tokens:
  - `Bill/statement`: statement text in `typography.money`;
  - `Bill/pill` with the tones open, paid, due and neutral, whose 1dp border is a proposal like the Home status pill;
  - `Bill/notes`, `Bill/note`, `Bill/noteIcon`, `Bill/strip`, `Bill/stripItem`.
- `Bill/installment` is removed. There are no new icons.

## 6. Acceptance criteria
- [ ] R1, R5 · manual — Given Wallet · Card in Play, when See bill is activated, then October bill opens with "One bill for •••• 4821 and •••• 7730", R$ 2.140,20, "Closes Oct 12 · due Oct 20", Open, and "R$ 4.291,90 in use, including R$ 2.151,70 in future installments".
- [ ] R2 · manual — Given Wallet · Bill in Play, when the previous arrow is activated three times, then September, August and July open, and on July the previous arrow is disabled.
- [ ] R3 · manual — Given the September, August and closed October frames, when inspected, then they read Paid with "Full payment · Paid Sep 18 · Pix"; Partially paid with R$ 1.200,00 and "Not reported as paid R$ 542,15"; and "Due in 6 days", minimum R$ 347,79 and "No payment reported yet".
- [ ] R4 · manual — Given Wallet · Bill · September, when inspected, then the total reads R$ 1.986,40 from Itaú, the lines show only day totals and "28 lines", and the note about amounts with no line is shown.
- [ ] R6, R7 · manual — Given Wallet · Bill in Play, when Nov in the strip is activated, then November reads "AT LEAST R$ 412,30" with MAGALU*MAGAZINELUIZA "4 of 10 · bought Jul 14" and FAST SHOP*FASTSHOP "Last of 3".
- [ ] R8, R9 · manual — Given Wallet · Bill in Play, when •••• 7730 is activated, then the header still reads R$ 2.140,20, "R$ 642,10 of this bill is on •••• 7730" shows, and the lines leave out the card; UBER *TRIP reads "Pending · Transport".
- [ ] R10 · manual — Given Wallet · Bill · July, when inspected, then it reads "NO BILL FROM ITAÚ", "No record" and "Purchases from Jun 13 to Jul 12", with no amount, payments or installments.
- [ ] R11 · manual — Given Wallet in Play, when the Amex Green Open bills row is activated, then November bill reads "SUM OF YOUR LINES R$ 870,30", "Closes Oct 26 · due Nov 2", and has no card filter or sliders.
- [ ] R12 · manual — Given Flamingo light and dark in English and Portuguese, when each frame is viewed at 402 × 874, then only statement text and line categories are ellipsized.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Every frame rendered in light/English, dark/Portuguese, light/Portuguese and dark/English; every prototype link resolves to a hotspot.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- With several cards on one account, does the bill open filtered to the card it was opened from? — product owner — does not block. This draft opens on All cards, because the amount, limit and dates belong to the account; the filter is one tap away.
- Do future bills belong on this screen or on Charts? — product owner — does not block. This draft keeps one future bill here, reached by the stepper and the strip, and labels it "at least" so it never reads as a forecast.
- What does an older month without a bill record show? — product owner — does not block. This draft shows its lines with the period worked out from the closing day, and no amount. Alternative: a sum labelled as Orbit's lines, which risks reading as the bill's total.
- How does an overdue bill look (due date passed, no payment reported)? — product owner — does not block.
- Is a payment line the bank posts on the open cycle ("PAGAMENTO EFETUADO") counted in "so far"? — engineering — blocks implementation of the open bill's sum. This draft assumes it is shown under the bill it pays, not in the sum; refunds are counted.
- Assumptions:
  - Today is Wed 7 Oct 2026, except `wallet-bill-closed` (Wed 14 Oct).
  - Bills are named by due month. Azul Itaú closes on day 12 and is due on day 20.
  - Card sync loads from Jun 1, so July is the first full cycle.
  - Statement texts, amounts and dates are sample data.
