# Spec: Transactions draft

Status: Draft

## 1. Outcome
- User: anyone checking where their money went, alone or with family members.
- Problem: Home, Charts and Wallet show only a few recent expenses. There is no complete list for a chosen day, week, month or year, and no screen for a single transaction.
- Desired result: one Transactions screen for any period, and a Transaction screen that opens from every expense row in the app.

## 2. Scope
- Included:
  - `screens/transactions` (Month), `screens/transactions-week`, `screens/transactions-day`, `screens/transactions-year`. They share:
    - search, filters, Day / Week / Month / Year chips and a ‹ period › stepper;
    - a summary (total, purchases, average);
    - category, card and family member filter chips.
  - Grouping by period:
    - Day: by time.
    - Week and Month: by day, with each day's total.
    - Year: by month, each row with its total against the budget, opening that month.
  - Week and Year add a column chart (days against an even daily budget, months against the monthly budget).
  - `screens/transaction-detail`, using iFood as the example:
    - category, card, who paid, payment type, source (Pluggy) and the bank's statement text;
    - a note, the effect on the category budget, and the purchases at the same merchant;
    - Edit and Delete.
  - Every expense row (Home, Charts · Restaurants, Wallet · Card) is a hotspot. Prototype links connect the periods, iFood → Transaction, and Transaction → Card, Budget and Merchant.
- Excluded: search results, the filter sheets, editing and deleting flows, splitting a transaction with family members, installments over several bills, production app changes.
- Design: `screens/home` (See all) → `screens/transactions` ⇄ `-day`, `-week`, `-year` → `screens/transaction-detail`.

## 3. Required behavior
- R1: Choosing Day, Week, Month or Year switches the list and keeps search and filters. The stepper moves to the previous or next period, and its label shows the current one (Today, Oct 7 · Oct 5 – 11 · October 2026 · 2026).
- R2: Week and Month group expenses under day headers with the day's total. Today and Yesterday are named; other days show weekday and date.
- R3: Day lists that day's expenses with their time first.
- R4: Week shows a column per day against an even daily budget (R$ 161). Today is in the brand color, and days still to come are empty.
- R5: Year shows a column per month against the R$ 5.000 budget, and one row per month with purchases, share of budget and a bar (warning near the budget, error over it). A row opens that month.
- R6: Each row shows merchant, category, card (short name) and the family member when it isn't you. Tapping it opens the transaction.
- R7: The Transaction screen shows merchant, amount, date and time, plus:
  - category, card and who paid (each can be changed), payment type and source;
  - the statement text, a note, and the budget the purchase counts against (opens the category);
  - the purchases at the same merchant this month (opens the filtered list), and Edit and Delete.
- R8: Palette, light/dark mode and English/Portuguese apply to all five frames, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse the Charts column chart, `OrbitCard`, `OrbitFilterChip`, `OrbitLinearProgressIndicator`, `OrbitIconButton`, the Home switcher and the Settings rows.
- New icons are Lucide proposals (`ic_sliders_horizontal`, `ic_trash`, `ic_store`).

## 6. Acceptance criteria
- [x] R1 · manual — Given Transactions · Month in Play, when Week, Day and Year are activated, then each list opens with its own stepper label.
- [x] R2 · manual — Given Transactions · Month, when inspected, then "TODAY · WED, OCT 7 · R$ 230,70" heads three expenses.
- [x] R3 · manual — Given Transactions · Day, when inspected, then Pão de Açúcar reads "18:42 · Groceries · Azul".
- [x] R4 · manual — Given Transactions · Week, when inspected, then Mon R$ 362, Tue R$ 523 and Wed R$ 231 are labeled above "R$ 161 a day".
- [x] R5 · manual — Given Transactions · Year in Play, when October is activated, then Transactions · Month opens; July shows 106% with an error bar.
- [x] R6 · manual — Given Home in Play, when iFood is activated, then the Transaction screen opens.
- [x] R7 · manual — Given the Transaction screen in Play, when Card is activated, then Wallet · Card opens; when the budget card is activated, then Charts · Restaurants opens.
- [x] R8 · manual — Given Flamingo light and dark in English and Portuguese, when each frame is viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Should Transactions become a tab, or stay behind See all? The bar is full: Home, Charts, Add, Wallet, Settings. — product owner — does not block this draft.
- How are installments shown: one row per bill ("2 of 6") or one purchase with its schedule? — product owner — blocks the installments design.
- Do family members see each other's notes? — product owner — does not block this draft.
- Assumptions: today is Wednesday, 7 October 2026; amounts and statement text are sample data.
