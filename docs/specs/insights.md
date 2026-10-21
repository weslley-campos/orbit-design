# Spec: Insights draft

Status: Draft

Replaces the Charts draft ([charts.md](charts.md)): the second tab becomes Insights, an overview of a week, month or year whose every mark opens the Transactions list ([transactions.md](transactions.md)) already narrowed to it.

## 1. Outcome
- User: anyone checking where their money went, alone or with family members.
- Problem: Charts and Transactions answered parts of the same questions in two places, and Charts leaned on budgets the API doesn't have. Home says how the month is going, but nothing says why, or how it compares with before.
- Desired result: one tab that answers, in this order, how much went out, whether that is more than before, where the period is heading, where it went, who spent it and on what, and that leads straight to the matching purchases.

## 2. Scope
- Included:
  - The second tab renamed Insights (Análises), keeping the pie-chart icon.
  - `screens/insights` (Month), `screens/insights-week`, `screens/insights-year` with `screens/insights-year-line`: a Week / Month / Year segmented control under the title, the period as a heading with a chevron that opens a picker, its days so far ("Oct 1 – 7 · 7 of 31 days") and a ‹ › pill, a summary with the change against the same days of the previous period and its chart, By category, Last 6 months (Month only), Family members, and Biggest expenses with See all.
  - Archived for reference, as Month, Week and Year: `screens/insights-chips-*`, the first draft's chips over a ‹ period › stepper, and `screens/insights-timeline-*`, the candidate not chosen, with the segmented control beside the title and a rail of recent periods, each with a mini bar of what it spent.
  - `screens/insights-first-month`: the first month of a user without family members, with nothing to compare against.
  - `screens/insights-empty`: a user with no expenses yet.
  - Prototype links: the bar's Insights from Home, Wallet, Card and Settings; the period segments; the Year chart's view switch; summaries, category rows, columns, family members and See all into the Transactions frames; expense rows into Transaction; Connect a bank into Connectors.
- Excluded: budgets (the even-pace line, budget lines, "over budget"), a projection for Week or for a first month, the Day period, a category screen (Charts · Restaurants), generated insights ("Saturdays are your biggest days"), the filtered Transactions frames themselves, loading and error frames, exporting, production app changes.
- Design: `screens/home` → `screens/insights` ⇄ `-week`, `-year` ⇄ `-year-line` → `screens/transactions*` → `screens/transaction-detail`. `screens/charts` and `screens/charts-category` move to Archived, with their links, and stay there for reference.

## 3. Required behavior
- R1: The bar's second item must read Insights (Análises) with the pie-chart icon, and open Month on the current month with Insights selected.
- R2: Week, Month and Year must switch the period, and the ‹ › pill must step through them, with › disabled on the current period; the heading names it: "Oct 5 – 11", "October 2026", "2026".
- R3: The summary must show the period's total and its change against the same days of the previous period, signed, with an arrow, in the error color when spending is higher and the success color when lower. Under it: daily average (monthly for Year), biggest day (month for Year) and purchases. Tapping it must open Transactions for the period.
- R4: The summary's chart must show Week as a column per day, today's at full strength and days still to come empty.
- R5: Month's chart must show this month's running total against last month's, with a dashed projection from today to the month's end labeled with its total ("R$ 4.620"), and Projected in the legend. This month's line and its area take the palette's gradient.
- R6: Year's chart must show past, present and future in one of two views, picked by two icon buttons beside its header (columns, the default, and lines), the selected one tonal. Its header must read the year's projected total ("R$ 54.480 projected").
  - Columns: past months as softened spent columns, the current month's spent part at full strength with its projected rest dashed on top, months to come as dashed projected columns. Legend: Spent, Projected.
  - Lines: spending as a smooth line, solid through last month and dashed through the projection to December, with the current month's spent so far as a dot under its projected point; income as a thinner smooth line, solid through the current month and dashed after it. Legend: Spending, Income, Projected.
  - Tapping October (its column, or its dot) must open Transactions for it.
- R7: By category must show a part-to-whole bar (the three largest in their category colors, the rest as Other) and one row per category with icon, amount, share and change, largest first. Tapping a row must open Transactions filtered to it.
- R8: Month must show Last 6 months as columns, the current one at full strength, the highest and current labeled, with the average of the five complete months. Tapping a column must open that month in Transactions.
- R9: Family members must show each member's amount and share, and appear only when the user has family members. Tapping one must open Transactions filtered to them.
- R10: Biggest expenses must list the period's three largest purchases, each opening its Transaction, with See all opening Transactions for the period.
- R11: In a user's first month, the change, last month's line, the projection and Last 6 months must be hidden, the summary must read "Comparisons start in November", and category rows must show their purchase count instead of a change.
- R12: With no expenses, Insights must hide the period controls and explain what will appear, with Connect a bank and Add expense.
- R13: Every chart's marks must take the palette's gradient, and palette, light/dark mode and English/Portuguese must apply to all six frames, with no text clipped at 402 × 874.

## 4. Constraints
- Spending comes from `GET /transactions` (orbit-api's `transactions.md`): `total`, `count` and `totals` for the period and the previous one, and the lines' `category` and `member` for the breakdowns.
- A projection adds the installments already due in the period (bills' `installments.next`, cards' `futureInstallments`) to the recent daily or monthly average for what is left. Week and a first month have none.
- Income is not in the API: `GET /transactions` leaves out income, transfers and checking or savings accounts. The income line needs checking-account data from orbit-api.
- "The same days" means the previous period up to the same day: Oct 1–7 against Sep 1–7, Mon–Wed against the previous Mon–Wed, Jan 1–Oct 7 against the same days of last year.
- Charts are SVG marks bound to theme tokens: 2dp lines (2.5dp for Year's spending), 24dp columns (18dp in Year) with 4dp rounded caps. Lines are smooth only in Year; Month's running total keeps its daily steps.
- Marks take the palette's light `gradients.primary` in both modes, since the dark one is a near-black background that vanishes on a dark surface: columns run it bottom to top and lines left to right, both reaching past the plot so the lightest stop never lands on a mark, and in dark mode starting past the deepest one. Columns other than the current one take it at 55% opacity; areas under a line fade the brand color from 32% to none. The archived Charts frames keep flat colors.
- The category colors still fail the colorblind check ([charts.md](charts.md)), so every colored mark has a row with an icon and a label beside it.
- Two new proposed icons, Lucide `chart-column` and `chart-spline` (ISC), for the view switch. New styles: `Insights/deltaDown`, which reuses `Charts/deltaUp`'s proposed 1dp border with the success colors, and `Insights/swatch`, `Insights/swatchWide` and `Insights/viewSwitch`, all on existing tokens.
- The period controls add `Insights/segmented`, `Insights/segment`, `Insights/segmentSelected`, `Insights/periodText` and `Insights/periodTitle`, on existing tokens and the 1dp border `PeriodStepper` already uses; the ‹ › pill reuses `Home/switcher`. The archived rail keeps its `Insights/rail*` styles, and its amounts outside October are invented.

## 6. Acceptance criteria
- [ ] R1 · manual — Given Home in Play, when Insights in the bar is activated, then Insights opens on October 2026 with Insights selected.
- [ ] R2 · manual — Given Insights in Play, when Week and then Year are activated, then the period heading reads "Oct 5 – 11" and then "2026".
- [ ] R3 · manual — Given Insights, when inspected, then the summary reads R$ 3.450,00 with "+R$ 1.910 vs. Sep 1–7".
- [ ] R4 · manual — Given Insights · Week, when inspected, then Mon to Wed have columns, Wed at full strength, and Thu to Sun are empty.
- [ ] R5 · manual — Given Insights, when inspected, then Pace shows October to day 7 against September, with a dashed projection to "R$ 4.620".
- [ ] R6 · manual — Given Insights · Year in Play, when the line icon is activated, then Insights · Year · Line opens; when the column icon is activated there, then Insights · Year opens; and in either view, activating October opens Transactions.
- [ ] R6 · manual — Given Insights · Year, when inspected, then Jul (5.32k) and Oct (3.45k) are labeled, Oct has a dashed projected rest, Nov and Dec are dashed, and the header reads "R$ 54.480 projected".
- [ ] R7 · manual — Given Insights in Play, when Restaurants is activated, then Transactions · Month opens.
- [ ] R8 · manual — Given Insights, when inspected, then Last 6 months labels Jul (5.32k) and Oct (3.45k) and the average reads R$ 4.726.
- [ ] R9, R10 · manual — Given Insights in Play, when Marina, then See all, then Carrefour are activated, then Transactions, Transactions and Transaction open.
- [ ] R11 · manual — Given the first-month frame, when inspected, then it has no change, no September line, no projection, no Last 6 months and no family members, and Groceries reads "14 purchases".
- [ ] R12 · manual — Given the empty frame in Play, when Connect a bank is activated, then Connectors opens.
- [ ] R13 · manual — Given Flamingo, Spruce, Graphite and Orchid, light and dark, in English and Portuguese, when the six frames are viewed at 402 × 874, then every chart takes the palette's gradient and no text is clipped.

## 7. Definition of Done (Verification)
- [ ] `node design/check.mjs` passes.
- [ ] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Is "Análises" the Portuguese label, or "Insights" as in English? — product owner — does not block this draft.
- Should the per-category change compare the same days of last month (as drafted, noisy early in a month) or the category's usual month? — product owner — does not block this draft.
- Should By category and the family split come from a summary endpoint instead of the app adding up a period's lines? A year holds hundreds of lines. — orbit-api — blocks implementation of Year, not this draft.
- Where does income come from: checking accounts synced through Pluggy, or income the user enters? — orbit-api — blocks implementation of the income line, not this draft.
- Is a projection of installments due plus the recent average good enough, or should it learn from the same month last year (December's gifts, January's taxes)? — product owner — does not block this draft.
- Should chart marks get their own `gradients.chart` token per palette and mode, instead of reading the light `gradients.primary` in dark mode too? — design system — does not block this draft.
- Transactions still shows the chips and stepper. Should it take the segmented control and period heading too? — product owner — does not block this draft.
- Should the app remember the Year view the user picked? — product owner — does not block this draft.
- Do budgets, once `GET /budget` exists, come back as the even-pace and budget lines of the Charts draft? — product owner — does not block this draft.
- Assumptions: today is Wed 7 October 2026; the user is Ana, with Marina as a family member, except in the first-month frame; amounts and counts match Home and Transactions.
