# Spec: Charts draft

Status: Draft

## 1. Outcome
- User: anyone tracking a monthly budget in Orbit, alone or with family members.
- Problem: Home answers "how much is left", but nothing shows how spending got there: its pace through the month, which categories drive it, how this month compares with earlier ones, and who spent what.
- Desired result: a Charts (Gráficos) tab that explains the month at a glance, with a drill-down per category.

## 2. Scope
- Included:
  - `screens/charts`, the second tab:
    - Month header and Week / Month / Year period chips.
    - A summary card: spent this month, the change against the same days of last month, daily average, biggest day and number of purchases.
    - The Pace chart: cumulative spending this month against last month and an even pace to the budget.
    - By category: a part-to-whole bar plus six ranked rows, each with its share and change against the category's average.
    - Last 6 months: columns against the budget line.
    - The family members split, and three insights.
  - `screens/charts-category`: Restaurants against its budget, its last 6 months with a tapped month's tooltip, where the money went, and recent expenses.
  - Prototype links: the Charts tab from Home and Settings, Restaurants (its row and its insight) → the category screen, and Back.
- Excluded: the Week and Year layouts, the month picker for Charts, other categories' screens, the table view, exporting, production app changes.
- Design: `screens/home` → `screens/charts` → `screens/charts-category`.

## 3. Required behavior
- R1: The Charts tab opens Charts with Charts selected. Home, Wallet and Settings stay reachable from the bar.
- R2: The summary shows the month's total with its change against the same days of last month. The change is a signed amount with an arrow, in the error color when spending is higher.
- R3: Pace plots this month's cumulative spending up to today (line, area wash, today's dot and value), last month's in gray and an even pace as a dashed line. A legend names all three, and the caption states the gap to the even pace.
- R4: By category shows the three largest categories in their category colors and the rest as Other. Every row repeats the category's icon, amount, share and change, so identity never depends on color alone. Tapping a row opens the category.
- R5: Last 6 months shows one column per month: the current month in the brand color, earlier months in gray. Only the highest and current values are labeled, and a budget line is drawn. Below the chart: the average and how many months went over budget.
- R6: The category screen shows spent against budget (over budget in the error color), its 6 months with a tapped month in the brand color and a tooltip (month, amount, purchases), places as single-hue bars relative to the largest, and recent expenses.
- R7: Palette, light/dark mode and English/Portuguese apply to both frames; axis values use "k" in English and "mil" in Portuguese, and no text is clipped at 402 × 874.

## 4. Constraints
- Charts are SVG marks bound to theme tokens: 2dp lines, 24dp columns with 4dp rounded caps, a 2dp surface gap between segments, solid hairline gridlines and a surface ring on the today dot.
- Category colors are the theme's `colors.category.primary/secondary/tertiary`, with Other in `colors.text.tertiary`. They fail the categorical colorblind check (primary and secondary are 7.1 ΔE apart under protanopia in Flamingo light, 4.7 in dark). That is why every colored mark has a labeled row, an icon or a line style beside it.
- New icons are Lucide proposals (`ic_trending_up`, `ic_trending_down`, `ic_calendar_days`). New literals are proposals: plot heights, the 2dp key and gap, and the stat alignment.

## 6. Acceptance criteria
- [x] R1 · manual — Given Home in Play, when Charts in the bar is activated, then Charts opens with Charts selected.
- [x] R2 · manual — Given Charts, when inspected, then the summary reads R$ 3.450,00 with "+R$ 1.910 vs. Sep 1–7" and an up arrow.
- [x] R3 · manual — Given Charts, when inspected, then Pace shows October to Today with R$ 3.450, September in gray, the dashed even pace and a three-item legend.
- [x] R4 · manual — Given Charts in Play, when Restaurants is activated, then the Restaurants screen opens; Back returns to Charts.
- [x] R5 · manual — Given Charts, when inspected, then July (5.32k) and October (3.45k) are the only labeled columns and "1 month over budget" is shown.
- [x] R6 · manual — Given the Restaurants screen, when inspected, then August is highlighted with "Aug · R$ 612,30 / 14 purchases" and iFood has the longest bar.
- [x] R7 · manual — Given Flamingo light and dark in English and Portuguese, when both frames are viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Should the category colors be re-stepped so the three category tokens pass a colorblind check, especially in dark mode? — design system — does not block this draft.
- What do Week and Year show: the same sections re-scaled, or a calendar heatmap for Year? — product owner — next design.
- Is the change measured against last month's same days (as drafted) or against the category's average? — product owner — does not block this draft.
- Assumptions: today is 7 October; the budget is R$ 5.000; amounts, places and counts are sample data consistent with Home.
