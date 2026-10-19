# Spec: Edit card

Status: Draft

## 1. Outcome
- User: anyone whose cards come from the bank through Open Finance.
- Problem: an imported card keeps the bank's raw name (e.g. "MASTERCARD BLACK PTS") and a card Orbit draws, so cards in Wallet are hard to tell apart. Edit cards only reorders and removes them.
- Desired result: an Edit card screen where the user renames a card and chooses its image or a color, or lets the image follow the name, and saves them to orbit-api.

## 2. Scope
- Included:
  - `screens/wallet-card-edit`: the card preview, the name with the bank's name below it, Match the name, the images (Azul Itaú, Amazon, Diners Club, Amex Green, the drawn Orbit card and Color) and Save.
  - `screens/wallet-card-edit-imported`: the same card as the bank sends it, with no matching image and Save off.
  - `screens/wallet-card-edit-chosen`: a color the user chose (Azure), with Match the name off.
  - `screens/wallet-card-edit-color`: the Card color sheet, with nine colors.
  - `screens/wallet-card-edit-saving`: Save with a spinner while orbit-api saves.
  - `screens/wallet-card-edit-failed`: the save failed; the changes stay, with an Error snackbar.
  - Prototype links: Edit on Wallet · Card → Edit card (it used to open Edit cards); back → Wallet · Card; Save (Edit card, Chosen color, Couldn't save) → Wallet · Card; the name field (From the bank) → Edit card; Color (Edit card, Chosen color) → Card color; Azure → Chosen color; close → Edit card; Match the name and Azul Itaú (Chosen color) → Edit card.
- Excluded: uploading a photo of the card, a color of the user's own (hex or a color wheel), editing the number, limit, network or dates, editing manual cards, reordering and removing (Edit cards, [wallet.md](wallet.md)), production app and orbit-api changes (the contract below is a proposal).
- Design: `screens/wallet-card` → `screens/wallet-card-edit`, `screens/wallet-card-edit-imported`, `screens/wallet-card-edit-chosen`, `screens/wallet-card-edit-color`, `screens/wallet-card-edit-saving`, `screens/wallet-card-edit-failed`.

## 3. Required behavior
- R1: Edit on a card opens Edit card, which says the bank keeps the number, limit and dates up to date. Back returns to the card and drops changes that weren't saved.
- R2: The name starts as the bank's name, with "The name your bank sends." below it; a different name shows "At the bank: <bank name>". An empty name uses the bank's name, shown as the placeholder. A later sync never replaces a name the user set.
- R3: With Match the name on (the default), the image follows the name as it is typed: the design that matches it, or else a card Orbit draws with the name. A note says which.
- R4: Choosing an image or a color selects it and turns Match the name off, so renaming keeps it; the note says "You chose the image, so renaming won't change it." or "You chose a color, so renaming won't change it." Turning Match the name back on matches the current name again.
- R5: Color opens Card color, for a card with no image or a user who'd rather have a color: nine fixed colors, the eight palettes' primaries (Spruce to Graphite) and Black, the same in every palette and mode. Tapping a color draws the card in it, shows it on the Color tile and closes the sheet; close leaves the card as it was. Until a color is picked, the Color tile shows the palette icon.
- R6: Save is off until the name, the image or color, or Match the name differs from what is saved. Save sends them to orbit-api; while it saves, Save shows a spinner and ignores taps. Once saved, Edit card closes to Wallet · Card, which shows the new name and image or color.
- R7: If the save fails, Edit card stays with the changes, Save turns back on, and an Error snackbar says "Couldn't save the card" and "Check your connection and tap Save again."
- R8: Palette, light/dark mode and English/Portuguese apply to all six frames, and no text is clipped at 402 × 874.

## 4. Constraints
- The bank's name, number, limit and dates come from Pluggy. orbit-api stores the user's name, image or color and Match the name beside them, and never sends them to Pluggy or the bank.
- Reuse the screen header, `OrbitOutlineTextField`, the Sign in checkbox row, the Settings palette tiles and names, the card art, the Add card preview (now `generatedCard`), the bottom sheet, `OrbitButton` (disabled and loading) and the Error `OrbitSnackbar`.
- Card text stays white (`colors.text.onInk`); each card color keeps it at 5:1 contrast or more.
- New literals are proposals: the nine card colors, the 2dp selected-image ring and its 2dp offset, the 180dp preview (the Add card preview stays 220dp) so Save fits, and the snackbar's 88dp offset above Save. No new icons (`ic_check` and the proposed `ic_palette` exist).

## 5. Contract
Proposed for orbit-api; the app's types follow its existing card repository.

```
PATCH /cards/{cardId}
{ "name": "Azul Itaú", "image": "color", "color": "azure", "matchName": false }
→ 200 { "id", "name", "bankName", "image", "color", "matchName", … }
```

- `name`: `null` uses `bankName`. `image`: an image id from the image list, `orbit` for the drawn card, or `color`. `color`: one of `spruce`, `indigo`, `plum`, `orchid`, `flamingo`, `azure`, `ember`, `graphite`, `black` when `image` is `color`, else `null`; stored by id so the shades can change later. With `matchName` on, the app sends the image it matched.

| Cause | Domain error | User sees |
| --- | --- | --- |
| No connection or timeout | Network | Error snackbar (R7) |
| orbit-api error (5xx) | Server | Error snackbar (R7) |

## 6. Acceptance criteria
- [x] R1 · manual — Given Wallet · Card in Play, when Edit is activated, then Edit card shows Azul Itaú, and Back returns to Wallet · Card.
- [x] R2 · manual — Given Edit card · From the bank, when inspected, then the name reads "MASTERCARD BLACK PTS" with "The name your bank sends."; in Edit card it reads "Azul Itaú" with "At the bank: MASTERCARD BLACK PTS".
- [x] R3 · manual — Given Edit card · From the bank in Play, when the name field is activated, then Edit card shows the Azul Itaú image selected and "Azul Itaú matches the name."
- [x] R4 · manual — Given Card color in Play, when Azure is activated, then Chosen color shows the card in Azure with Color selected, Match the name off and "You chose a color, so renaming won't change it."; Match the name returns to Edit card.
- [x] R5 · manual — Given Edit card in Play, when Color is activated, then Card color shows Spruce, Indigo, Plum, Orchid, Flamingo, Azure, Ember, Graphite and Black, and close returns to Edit card.
- [x] R6 · manual — Given Edit card · From the bank, when inspected, then Save is off; Edit card · Saving shows Save with a spinner; and in Edit card, Save leads to Wallet · Card.
- [x] R7 · manual — Given Edit card · Couldn't save, when inspected, then the name and image are kept, Save is on and the Error snackbar reads "Couldn't save the card".
- [x] R8 · manual — Given Flamingo light and dark in English and Portuguese, when each frame is viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype links and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Where do the images come from in the app: Pluggy's connector image, issuer templates Orbit hosts, or both? — product owner — blocks matching in the app.
- How does a name match an image: issuer and product words ("Azul", "Itaú"), or a list of aliases per image? — product owner and developer — blocks implementation.
- Should the user be able to pick any color (hex or a color wheel)? Left out so the white card text stays readable. — product owner — does not block.
- Should Back with unsaved changes ask before dropping them? Today it drops them, like the Profile sheets. — product owner — does not block.
- Should the user be able to upload a photo of the card? Left out because a photo can show the full number. — product owner — does not block.
- Should Edit card also edit a manual card's last 4 digits, limit, network and dates? — product owner — does not block.
- Assumptions: the bank sends "MASTERCARD BLACK PTS" for Azul Itaú •••• 4821; the images are the Wallet sample art ([wallet.md](wallet.md)); orbit-api already lists cards, so it can store these fields beside them.
