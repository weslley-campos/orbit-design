# Spec: Profile draft

Status: Draft

## 1. Outcome
- User: anyone with an Orbit account, alone or with family members.
- Problem: the account card at the top of Settings led nowhere. There was no place to see or change who you are in Orbit: photo, name, email, phone, the family you belong to and how you sign in.
- Desired result: a Profile (Perfil) screen opened from the account card, plus a sheet to change the profile photo.

## 2. Scope
- Included:
  - `screens/profile`:
    - Back, a large avatar with a camera button, the name, the email and "Member since".
    - Personal information: name, the name family members see, email (Verified), phone (Add a phone number).
    - Family: your family, who created it and pending invites (opens Family members).
    - Sign-in: password (moved from Settings), and Google with Connect.
    - Delete account (moved from Settings).
  - `screens/profile-photo`: a sheet over Profile with Take photo and Choose from library.
  - Settings: the account card opens Profile. Password and Delete account move to Profile, so Settings keeps app behavior and Profile keeps the account.
  - Prototype links: Settings ⇄ Profile, Profile → Photo and Family members, and the sheet's options and Close → Profile.
- Excluded: the edit screens for name, email and phone, email verification after a change, changing the password, linking Google, the delete-account flow, leaving a family, production app changes.
- Design: `screens/settings` → `screens/profile` → `screens/profile-photo`, `screens/family-members`.

## 3. Required behavior
- R1: Profile is pushed from Settings and hides the navigation bar. Back returns to Settings.
- R2: The avatar shows the photo, or the first initial when there is none. The camera button opens the photo sheet.
- R3: Each personal information row shows its label and current value and opens its edit screen. An empty phone shows "Add a phone number" in the brand color. The email shows Verified once confirmed.
- R4: "Name family members see" is the short name shown next to your expenses in shared lists, like "Transport · Today · Marina" on Home.
- R5: Your family shows its members' avatars, who created it and pending invites, and opens Family members.
- R6: Sign-in lists the password with when it last changed, and each linked provider. Google shows Connect when it is not linked.
- R7: Delete account is a text button in the error color, at the end of Profile.
- R8: Palette, light/dark mode and English/Portuguese apply to both frames, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse `OrbitCard`, `HorizontalDivider`, `OrbitIconButton` (Filled), `OrbitButton` (Text), `OrbitBottomSheet`, the Transaction detail rows, the Settings rows and the Family avatars.
- The Google mark is the committed `ic_google` resource from Sign in.
- New icons are Lucide proposals (`ic_camera`, `ic_image`, `ic_phone`, `ic_user_round`). New literals are proposals: the 88dp avatar, the 2dp surface ring on the camera button and stacked avatars, and the -12dp avatar overlap.

## 6. Acceptance criteria
- [x] R1 · manual — Given Settings in Play, when the account card is activated, then Profile opens without the navigation bar; when Back is activated, then Settings is shown.
- [x] R2 · manual — Given Profile in Play, when the camera button is activated, then the Profile photo sheet shows Take photo and Choose from library; Close returns to Profile.
- [x] R3 · manual — Given Profile, when inspected, then Email reads ana@example.com with Verified and Phone reads "Add a phone number".
- [x] R5 · manual — Given Profile in Play, when Your family is activated, then Family members opens.
- [x] R6 · manual — Given Profile, when inspected, then Password reads "Changed 2 months ago" and Google shows Connect.
- [x] R8 · manual — Given Flamingo light and dark in English and Portuguese, when both frames are viewed at 402 × 874, then no text is clipped.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Should the photo be optional, with the initial as the default, or asked for when joining a family? — product owner — does not block this draft.
- Is the short name family members see needed, or is the first name enough? — product owner — does not block this draft.
- Which sign-in providers are planned besides Google (Apple is required on iOS when Google is offered)? — product owner — blocks the sign-in section.
- What happens to a family when its creator deletes their account: is it handed to another member or deleted? — product owner — blocks the delete-account flow.
- Assumptions: Ana created the family and Marina's invite is pending; dates are sample data.
