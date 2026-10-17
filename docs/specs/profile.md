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
  - `screens/profile-photo-set`: the same sheet once a photo is set, with Remove photo in the error color.
  - `screens/profile-phone`: a sheet with the phone number, opened from the phone row.
  - `screens/profile-google`: Profile for an account that signs in with Google only.
  - `screens/profile-password` and `screens/profile-password-add`: sheets to change the password or add one.
  - Settings: the account card opens Profile. Password and Delete account move to Profile, so Settings keeps app behavior and Profile keeps the account.
  - Prototype links: Settings ⇄ Profile, Profile → Photo and Family members, and the sheet's options and Close → Profile.
- Excluded: the edit screen for email, email verification after a change, linking Google, the delete-account flow, leaving a family, production app changes.
- Design: `screens/settings` → `screens/profile` → `screens/profile-photo`, `screens/profile-name`, `screens/profile-phone`, `screens/profile-password`, `screens/family-members`; `screens/profile-google` → `screens/profile-password-add`.

## 3. Required behavior
- R1: Profile is pushed from Settings and hides the navigation bar. Back returns to Settings.
- R2: The avatar shows the photo, or the first initial when there is none. The camera button opens the photo sheet. Take photo opens the camera and Choose from library the system photo picker; the chosen photo uploads to orbit-api and the sheet closes. Remove photo shows only once a photo is set and goes back to the initial. Desktop and web have no camera, so they hide Take photo.
- R3: Each personal information row shows its label and current value. Rows that can be edited open their edit sheet and end in a chevron. The email is the account's sign-in address, so its row shows Verified once confirmed and has no chevron and no action. An empty phone shows "Add a phone number" in the brand color.
- R4: "Name family members see" is the short name shown next to your expenses in shared lists, like "Transport · Today · Marina" on Home.
- R5: Your family shows its members' avatars, who created it and pending invites, and opens Family members.
- R6: Sign-in follows how the account signs in. With an email and password, Password reads "Change the password you sign in with" and opens the password sheet, and Google shows Connect. With Google only, Password reads "Not set" with Add, and Google reads Connected with no action. Firebase does not say when a password last changed, so no date is shown.
- R7: Delete account is a text button in the error color, at the end of Profile.
- R8: Palette, light/dark mode and English/Portuguese apply to both frames, and no text is clipped at 402 × 874.
- R9: Either name row opens the Name sheet with Name and Name family members see filled in, Save and Cancel. Save keeps both and returns to Profile; Cancel returns without saving.
- R10: The password sheet asks for the current password and a new one of at least 8 characters, each with Show password. The add sheet asks only for the new one and says which email it signs in with. Save and Cancel return to Profile.
- R11: The phone row opens the Phone number sheet: one field with the country code, Save and Cancel. Saving it empty removes the number, and the row goes back to "Add a phone number".

## 4. Constraints
- Reuse `OrbitCard`, `HorizontalDivider`, `OrbitIconButton` (Filled), `OrbitButton` (Text), `OrbitBottomSheet`, the Transaction detail rows, the Settings rows and the Family avatars.
- The Google mark is the committed `ic_google` resource from Sign in.
- New icons are Lucide proposals (`ic_camera`, `ic_image`, `ic_phone`, `ic_user_round`). New literals are proposals: the 88dp avatar, the 2dp surface ring on the camera button and stacked avatars, and the -12dp avatar overlap.

## 6. Acceptance criteria
- [x] R1 · manual — Given Settings in Play, when the account card is activated, then Profile opens without the navigation bar; when Back is activated, then Settings is shown.
- [x] R2 · manual — Given Profile in Play, when the camera button is activated, then the Profile photo sheet shows Take photo and Choose from library; Close returns to Profile.
- [x] R3 · manual — Given Profile, when inspected, then Email reads ana@example.com with Verified and Phone reads "Add a phone number".
- [x] R5 · manual — Given Profile in Play, when Your family is activated, then Family members opens.
- [ ] R6 · manual — Given Profile and Profile · Google sign-in, when inspected, then the first reads "Change the password you sign in with" with Connect, and the second reads "Not set" with Add and Google Connected.
- [x] R8 · manual — Given Flamingo light and dark in English and Portuguese, when both frames are viewed at 402 × 874, then no text is clipped.
- [ ] R2 · manual — Given Profile · Photo · Remove, when inspected, then it lists Take photo, Choose from library and Remove photo in the error color, and each returns to Profile in Play.
- [ ] R9 · manual — Given Profile in Play, when Name is activated, then the Name sheet shows Ana Souza and Ana; Save and Cancel return to Profile.
- [ ] R10 · manual — Given Profile in Play, when Password is activated, then the password sheet shows Current password and New password; given Profile · Google sign-in, when Add is activated, then the add sheet shows New password for ana@example.com; Save and Cancel return to the Profile they came from.
- [ ] R11 · manual — Given Profile in Play, when Phone is activated, then the Phone number sheet shows the field with "Include the country code, like +55."; Save and Cancel return to Profile.

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Should the photo be optional, with the initial as the default, or asked for when joining a family? — product owner — does not block this draft.
- Is the short name family members see needed, or is the first name enough? — product owner — does not block this draft.
- Which sign-in providers are planned besides Google (Apple is required on iOS when Google is offered)? — product owner — blocks linking providers.
- What happens to a family when its creator deletes their account: is it handed to another member or deleted? — product owner — blocks the delete-account flow.
- Assumptions: Ana created the family and Marina's invite is pending; dates are sample data.
