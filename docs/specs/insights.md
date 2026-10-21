# Spec: Insights draft

Status: Draft

Replaces the Charts draft ([charts.md](charts.md)): the second tab becomes Insights, an overview of a week, month or year whose every mark opens the Transactions list ([transactions.md](transactions.md)) already narrowed to it.

## 1. Outcome
- User: anyone checking where their money went, alone or with family members.
- Problem: Charts and Transactions answered parts of the same questions in two places, and Charts leaned on budgets the API doesn't have. Home says how the month is going, but nothing says why, or how it compares with before.
- Desired result: one tab that answers, in this order, how much went out, whether that is more than before, where it went, who spent it and on what, and that leads straight to the matching purchases.

## 2. Scope
- Included:
  - The second tab renamed Insights (Análises), keeping the pie-chart icon.
  - `screens/insights` (Month), `screens/insights-week`, `screens/insights-year`: Week / Month / Year chips, the ‹ period › stepper, a summary with the change against the same days of the previous period and its chart, By category, Last 6 months (Month only), Family members, and Biggest expenses with See all.
  - `screens/insights-first-month`: the first month of a user without family members, with nothing to compare against.
  - `screens/insights-empty`: a user with no expenses yet.
  - Prototype links: the bar's Insights from Home, Wallet, Card and Settings; the period chips; summaries, category rows, columns, family members and See all into the Transactions frames; expense rows into Transaction; Connect a bank into Connectors.
- Excluded: budgets (the even-pace line, budget lines, "over budget"), the Day period, a category screen (Charts · Restaurants), generated insights ("Saturdays are your biggest days"), the filtered Transactions frames themselves, loading and error frames, exporting, production app changes.
- Design: `screens/home` → `screens/insights` ⇄ `-week`, `-year` → `screens/transactions*` → `screens/transaction-detail`. `screens/charts` and `screens/charts-category` move to Archived, with their links, and stay there for reference.

## 3. Required behavior
- R1: The bar's second item must read Insights (Análises) with the pie-chart icon, and open Month on the current month with Insights selected.
- R2: Week, Month and Year must switch the period, and the stepper must step through them: "Oct 5 – 11", "October 2026", "2026".
- R3: The summary must show the period's total and its change against the same days of the previous period, signed, with an arrow, in the error color when spending is higher and the success color when lower. Under it: daily average (monthly for Year), biggest day (month for Year) and purchases. Tapping it must open Transactions for the period.
- R4: The summary's chart must show Month as this month's running total against last month's, Week as a column per day and Year as a column per month, today's in the brand color and days or months still to come empty.
- R5: By category must show a part-to-whole bar (the three largest in their category colors, the rest as Other) and one row per category with icon, amount, share and change, largest first. Tapping a row must open Transactions filtered to it.
- R6: Month must show Last 6 months as columns, the current one in the brand color, the highest and current labeled, with the average of the five complete months. Tapping a column must open that month in Transactions.
- R7: Family members must show each member's amount and share, and appear only when the user has family members. Tapping one must open Transactions filtered to them.
- R8: Biggest expenses must list the period's three largest purchases, each opening its Transaction, with See all opening Transactions for the period.
- R9: In a user's first month, the change, last month's line and Last 6 months must be hidden, the summary must read "Comparisons start in November", and category rows must show their purchase count instead of a change.
- R10: With no expenses, Insights must hide the period controls and explain what will appear, with Connect a bank and Add expense.
- R11: Palette, light/dark mode and English/Portuguese must apply to all five frames, with no text clipped at 402 × 874.

## 4. Constraints
- Every number comes from `GET /transactions` (orbit-api's `transactions.md`): `total`, `count` and `totals` for the period and the previous one, and the lines' `category` and `member` for the breakdowns. No new endpoint is needed for this draft.
- "The same days" means the previous period up to the same day: Oct 1–7 against Sep 1–7, Mon–Wed against the previous Mon–Wed, Jan 1–Oct 7 against the same days of last year.
- Charts are SVG marks bound to theme tokens, reusing the Charts draft's line and column charts: 2dp lines, 24dp columns with 4dp rounded caps.
- The category colors still fail the colorblind check ([charts.md](charts.md)), so every colored mark has a row with an icon and a label beside it.
- No new icons. The only new style, `Insights/deltaDown`, reuses `Charts/deltaUp`'s proposed 1dp border with the success colors.

## 6. Acceptance criteria
- [ ] R1 · manual — Given Home in Play, when Insights in the bar is activated, then Insights opens on October 2026 with Insights selected.
- [ ] R2 · manual — Given Insights in Play, when Week and then Year are activated, then the stepper reads "Oct 5 – 11" and then "2026".
- [ ] R3, R4 · manual — Given Insights, when inspected, then the summary reads R$ 3.450,00 with "+R$ 1.910 vs. Sep 1–7", and Pace shows October to day 7 against September.
- [ ] R5 · manual — Given Insights in Play, when Restaurants is activated, then Transactions · Month opens.
- [ ] R6 · manual — Given Insights, when inspected, then Jul (5.32k) and Oct (3.45k) are the only labeled columns and the average reads R$ 4.726.
- [ ] R7, R8 · manual — Given Insights in Play, when Marina, then See all, then Carrefour are activated, then Transactions, Transactions and Transaction open.
- [ ] R9 · manual — Given the first-month frame, when inspected, then it has no change, no September line, no Last 6 months and no family members, and Groceries reads "14 purchases".
- [ ] R10 · manual — Given the empty frame in Play, when Connect a bank is activated, then Connectors opens.
- [ ] R11 · manual — Given Flamingo light and dark in English and Portuguese, when the five frames are viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [ ] `node design/check.mjs` passes.
- [ ] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Is "Análises" the Portuguese label, or "Insights" as in English? — product owner — does not block this draft.
- Should the per-category change compare the same days of last month (as drafted, noisy early in a month) or the category's usual month? — product owner — does not block this draft.
- Should By category and the family split come from a summary endpoint instead of the app adding up a period's lines? A year holds hundreds of lines. — orbit-api — blocks implementation of Year, not this draft.
- Do budgets, once `GET /budget` exists, come back as the even-pace and budget lines of the Charts draft? — product owner — does not block this draft.
- Assumptions: today is Wed 7 October 2026; the user is Ana, with Marina as a family member, except in the first-month frame; amounts and counts match Home and Transactions.
