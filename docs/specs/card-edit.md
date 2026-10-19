# Spec: Edit card

Status: Draft

## 1. Outcome
- User: anyone whose cards come from the bank through Open Finance.
- Problem: an imported card keeps the bank's raw name (e.g. "MASTERCARD BLACK PTS") and a card Orbit draws, so cards in Wallet are hard to tell apart. Edit cards only reorders and removes them.
- Desired result: an Edit card screen where the user renames a card and chooses its image, or lets the image follow the name.

## 2. Scope
- Included:
  - `screens/wallet-card-edit`: the card preview, the name with the bank's name below it, Match the name, and the images (Azul Itaú, Amazon, Diners Club, Amex Green, and the drawn Orbit and Dark cards).
  - `screens/wallet-card-edit-imported`: the same card as the bank sends it, with no matching image.
  - `screens/wallet-card-edit-chosen`: an image the user chose, with Match the name off.
  - Prototype links: Edit on Wallet · Card → Edit card (it used to open Edit cards); back → Wallet · Card; the name field (From the bank) → Edit card; Dark → Chosen image; Match the name and Azul Itaú (Chosen image) → Edit card.
- Excluded: uploading a photo of the card, editing the number, limit, network or dates, editing manual cards, reordering and removing (Edit cards, [wallet.md](wallet.md)), production app changes.
- Design: `screens/wallet-card` → `screens/wallet-card-edit`, `screens/wallet-card-edit-imported`, `screens/wallet-card-edit-chosen`.

## 3. Required behavior
- R1: Edit on a card opens Edit card, which says the bank keeps the number, limit and dates up to date. Changes apply on leaving, like Card sync; Back returns to the card.
- R2: The name starts as the bank's name, with "The name your bank sends." below it; a different name shows "At the bank: <bank name>". An empty name uses the bank's name, shown as the placeholder. A later sync never replaces a name the user set.
- R3: With Match the name on (the default), the image follows the name as it is typed: the design that matches it, or else a card Orbit draws with the name. A note says which.
- R4: Choosing an image selects it and turns Match the name off, so renaming keeps it. Turning Match the name back on matches the current name again.
- R5: Palette, light/dark mode and English/Portuguese apply to all three frames, and no text is clipped at 402 × 874.

## 4. Constraints
- The bank's name, number, limit and dates come from Pluggy. Orbit stores the user's name and image beside them and never sends them back.
- Reuse the screen header, `OrbitOutlineTextField`, the Sign in checkbox row, the Settings palette tiles, the card art and the Add card preview (now `generatedCard`).
- New literals are proposals: the 2dp selected-image ring and its 2dp offset. The 220dp preview is the Add card preview's width. No new icons (`ic_check` exists).

## 6. Acceptance criteria
- [x] R1 · manual — Given Wallet · Card in Play, when Edit is activated, then Edit card shows Azul Itaú, and Back returns to Wallet · Card.
- [x] R2 · manual — Given Edit card · From the bank, when inspected, then the name reads "MASTERCARD BLACK PTS" with "The name your bank sends."; in Edit card it reads "Azul Itaú" with "At the bank: MASTERCARD BLACK PTS".
- [x] R3 · manual — Given Edit card · From the bank in Play, when the name field is activated, then Edit card shows the Azul Itaú image selected and "Azul Itaú matches the name."
- [x] R4 · manual — Given Edit card in Play, when Dark is activated, then Dark is selected, Match the name is off and the note reads "You chose the image, so renaming won't change it."; Match the name returns to Edit card.
- [x] R5 · manual — Given Flamingo light and dark in English and Portuguese, when each frame is viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Where do the images come from in the app: Pluggy's connector image, issuer templates Orbit hosts, or both? — product owner — blocks matching in the app.
- How does a name match an image: issuer and product words ("Azul", "Itaú"), or a list of aliases per image? — product owner and developer — blocks implementation.
- Should the user be able to upload a photo of the card? Left out because a photo can show the full number. — product owner — does not block.
- Should Edit card also edit a manual card's last 4 digits, limit, network and dates? — product owner — does not block.
- In dark mode the Orbit gradient is dark too, so Orbit and Dark look close. Should Dark become another drawn style? — designer — does not block.
- Assumptions: the bank sends "MASTERCARD BLACK PTS" for Azul Itaú •••• 4821; the images are the Wallet sample art ([wallet.md](wallet.md)).
