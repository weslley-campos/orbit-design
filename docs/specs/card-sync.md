# Spec: Card sync

Status: Draft

## 1. Outcome
- User: anyone whose credit account has additional cards, including cards used by people outside the family.
- Problem: Orbit loads every card the bank reports on an account, from whenever the bank starts, and the bank doesn't say who holds an additional card.
- Desired result: a Card sync screen that decides whether Orbit loads an account's cards, from when, and which family member uses each card.

## 2. Scope
- Included:
  - `screens/wallet-card-sync`:
    - Load / Don't load for the account;
    - a period with From and an optional Until;
    - every card the bank reports on the account (main and additional), each with the family member who uses it, or someone outside the family whose card is not loaded.
  - Prototype links: the sliders on each bank-connected bill and ⋯ on Wallet · Card → Card sync; back → Wallet · Bill.
- Excluded: per-card periods, choosing a family member for a card, production app changes.
- Design: `screens/wallet-card-sync`. Moved out of [bill.md](bill.md) when the bill screen was redrawn; the frame is unchanged except From.

## 3. Required behavior
- R1: Card sync turns loading the account on or off; turning it off keeps what is already in the history. Orbit loads purchases from the From date; without an Until date it keeps fetching new purchases.
- R2: Card sync lists every card the bank reports on the account with who uses it. Purchases on a card count for that family member, and a card used by someone outside the family can stay out of Orbit.
- R3: Palette, light/dark mode and English/Portuguese apply, and no text is clipped at 402 × 874.

## 4. Constraints
- Main and additional cards come from the bank through Pluggy with their last 4 digits. Who uses each one is set in Orbit; the bank doesn't report it.
- Reuse the Settings rows and option chips, `OrbitFilterChip` and `OrbitOutlineTextField`. No new tokens, literals or icons.

## 6. Acceptance criteria
- [x] R1 · manual — Given Card sync, when inspected, then Load is selected, From reads "Jun 1, 2026" and Until reads "No end date".
- [x] R2 · manual — Given Card sync, when inspected, then •••• 4821 is Ana's, •••• 7730 Marina's, and •••• 5512 reads "Carlos · not loaded since Aug 1".
- [x] R3 · manual — Given Flamingo light and dark in English and Portuguese, when the frame is viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Is the period set per account or per card (e.g. Carlos's additional card left out only from Aug 1)? — product owner — blocks the per-card sync screen.
- Assumptions: From is Jun 1, 2026, so the July bill is the first cycle Orbit has in full ([bill.md](bill.md)).
