# Spec: Settings draft

Status: Draft

## 1. Outcome
- User: anyone using Orbit, alone or with family members.
- Problem: the last navigation tab was called Profile and only led to Connectors. There was no place for the things that support the app without being expense tracking: theme, dark mode, family, connectors, preferences, security, legal pages and signing out.
- Desired result: the tab becomes Settings (Ajustes). It opens one screen that groups those features, plus sheets to pick a theme and to confirm signing out.

## 2. Scope
- Included:
  - Rename the Profile tab to Settings (`home_nav_profile` → `home_nav_settings`, "Settings" / "Ajustes"). The tab keeps its `nav-user_round` hotspot id, so saved prototype links still work.
  - `screens/settings`: an account card, then Appearance (Theme, Dark mode), Family (Family members, Invite to family), Banks and services (Connectors), Preferences (Language, Currency, Notifications), Security and data (App lock, Export expenses), About (Help, Terms of Use, Privacy Policy), then Sign out and the app version. The account card opens Profile (`docs/specs/profile.md`), which holds Password and Delete account.
  - `screens/settings-theme`: a bottom sheet with Orbit's eight palettes, each shown as its own Orbit mark.
  - `screens/settings-sign-out`: a bottom sheet that confirms signing out.
  - Prototype links: Home ⇄ Settings, Settings → Profile, Theme, Family members, Invite, Connectors and Sign out. Back on Connectors now returns to Settings.
- Excluded: the language, currency, notifications, app lock, export and help screens; leaving a family; production app changes.
- Design: `screens/home` → `screens/settings` → `screens/settings-theme`, `screens/settings-sign-out`, `screens/profile`, `screens/family-members`, `screens/invite`, `screens/connectors`.

## 3. Required behavior
- R1: The fifth navigation tab reads Settings (Ajustes). It opens Settings, which marks it selected; Home in the bar returns to Home.
- R2: The Theme row shows the current palette's name and mark and opens the Theme sheet. The sheet lists Spruce, Indigo, Plum, Orchid, Flamingo, Azure, Ember and Graphite, with the current palette selected. Apply and Close return to Settings.
- R3: Dark mode offers System, Light and Dark as a single choice, with System selected by default. It is independent of the palette.
- R4: Family members shows "2 members · 1 invite pending" and opens Family members. Invite to family opens Invite. Connectors shows "Pluggy · 2 banks" and opens Connectors, whose Back returns to Settings.
- R5: Sign out opens a confirmation sheet. Sign out returns to Sign in. Cancel returns to Settings. Delete account lives in Profile.
- R6: Language shows the language in use (English or Português (Brasil)). Palette, light/dark mode and English/Portuguese apply to all three frames, and no text is clipped at 402 × 874.

## 4. Constraints
- Reuse `OrbitCard`, `HorizontalDivider`, `OrbitFilterChip`, `OrbitButton` (Outlined, Text, Destructive), `OrbitIconButton`, `OrbitBottomSheet`, `OrbitNavigationBar`, the Family list styles and the Home section headers, with declared theme tokens.
- The palette marks are the committed `ic_logo_<palette>` resources. SVG ids are scoped per file, so several palettes' gradients can share a screen.
- New icons are Lucide proposals (`ic_palette`, `ic_moon`, `ic_languages`, `ic_banknote`, `ic_lock`, `ic_download`, `ic_file_text`, `ic_log_out`) under `design/assets/proposed`.
- New literals are proposals: the 72dp account row and the 2dp outline on the selected palette.

## 6. Acceptance criteria
- [x] R1 · manual — Given Home in Play, when the Settings tab is activated, then Settings opens with Settings selected; when Home is activated, then Home is shown.
- [x] R2 · manual — Given Settings in Flamingo, when Theme is activated, then the sheet shows eight palettes with Flamingo selected; when Apply is activated, then Settings is shown.
- [x] R3 · manual — Given Settings, when inspected, then Dark mode shows System, Light and Dark with System selected.
- [x] R4 · manual — Given Settings in Play, when Connectors is activated and then Back, then Connectors opens and Settings is shown again.
- [x] R5 · manual — Given Settings in Play, when Sign out and then Sign out in the sheet are activated, then Sign in is shown.
- [x] R6 · manual — Given Flamingo light and dark in English and Portuguese, when each frame is viewed at 402 × 874, then no text is clipped and Language reads English or Português (Brasil).

## 7. Definition of Done (Verification)
- [x] `node design/check.mjs` passes.
- [x] Prototype flow and both languages/themes visually verified.
- [ ] Gradle token/declaration checks from the Orbit checkout.

## 8. Open questions
- Should the palette and dark mode sync with the account, or stay on each device? — product owner — does not block this draft.
- Can every family member manage the family, or only the person who created it? Is there a Leave family action? — product owner — blocks the family management screen.
- Is Delete account in scope for the first release (LGPD lets users request deletion)? — product owner — does not block this draft.
- Which preferences are needed at launch: currency (only BRL?), the day the budget month starts, notifications, app lock? — product owner — does not block this draft.
- Assumptions: Settings is a tab, not a screen behind the avatar. Profile opens from the top card. Counts, version and the email are sample data.
