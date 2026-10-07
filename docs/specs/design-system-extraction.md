# Spec: Design system extraction

Status: Draft

## 1. Outcome
- User: Weslley, maintaining Orbit's design system and migrating screens into the workspace.
- Problem: copying Yenom can introduce layouts, duplicated components and token names inconsistent with Orbit.
- Desired result: reusable, inspectable design artifacts in `design/`, derived from Orbit's current theme, resources, components and screens.

## 2. Scope
- Included: palettes/tokens/themes; reusable components/states; Splash, Sign in, Legal Terms/Privacy; English/Portuguese; platform and editable-property metadata.
- Excluded: production Kotlin changes; invented baseline tokens/icons/screens; pending auth features; Home's placeholder; [workspace interactions/editing](design-workspace.md).

## 3. Required behavior
- R1: Generate CSS tokens and inspection metadata from actual Kotlin values/resource identities: eight palettes × light/dark, derived colors/alpha, gradients, typography, spacing, sizes, shapes and elevation. Verification must detect missing/stale entries against source, not another manual copy.
- R2: Preserve semantic bindings; components consume semantic aliases. Inventory existing literals/overrides with source locations and “no token” labels. Reject unexplained literals/unresolved bindings. Preserve intrinsic artwork colors, including Google's logo. Store workspace overrides separately from generated baselines.
- R3: Each reusable `:core:ui` component, including `AnimatedOrbitLogo` and `OrbitSnackbar`, has one implementation shared by catalogs/screens. Expose existing variants/states independently without navigation/Koin/authentication, and declare supported editable properties, types and baseline bindings.
- R4: Seed Splash, Sign in, Legal / Terms and Legal / Privacy from implemented screens/resources with source references and stable hotspot IDs. Preserve Orbit hierarchy/content/assets/states/behavior over Yenom. Mark unfinished actions inactive; pending specs are not implemented screens.
- R5: Palette/mode/language selection updates every example/screen, including logos/legal content, without moving frames. Use source values unless explicitly marked as draft overrides.

## 4. Constraints
- Source of truth: the Orbit application repository's `core/ui` theme/components/resources, `feature/auth` screens/entry providers/resources and platform implementations. Resources here are committed snapshots; Kotlin source paths refer to that application checkout. Inspiration only: `/Volumes/Home/weslley/Projects/orbit-prototype/design/Yenom - All Screens.dc.html`.
- Keep `tokens.css`, inspection data, shared renderers and assets in `design/`. Document regeneration and read-only verification commands.
- Map `OrbitTheme.colors.text.primary` to `--orbit-colors-text-primary`; store exact source paths explicitly. Icons reference resources such as `CoreUiRes.drawable.ic_google`; no invented `OrbitTheme.icons` API.
- Preserve font family/weight/size/line-height/letter-spacing, gradient stops/angles, per-corner/percentage shapes and elevation. Label shadow/tonal approximations. Use PLUM/AZURE palette names despite internal Amethyst/Cobalt names.
- Reuse project fonts/logos/icons with licenses; convert vector drawables with provenance. Exempt canvas coordinates, viewport dimensions and intrinsic artwork from semantic-token validation.
- Keep source gaps such as Splash's `256.dp` visible; new Kotlin tokens require separate work. Reference snippets use actual APIs and identify overrides.
- Automated criteria become matching Kotest `Given / When / Then` cases in a `BehaviorSpec` in `:core:ui` `jvmTest`.

## 6. Acceptance criteria
- [ ] R1 · unit — Given the current Kotlin theme and resource catalog, when generated artifacts are verified, then every supported source entry is present and matches across eight palettes and both modes, including alpha, gradients, typography and shape metadata.
- [ ] R1 · unit — Given `text.disabled` removed from the generated catalog or `spacing.medium` changed from 20 to 21, when verification runs, then it fails and identifies the missing or changed entry.
- [ ] R2 · unit — Given extracted declarations with an unexplained color, font, spacing, size, shape, elevation or icon reference, when validated, then each is rejected while source-linked literals and intrinsic artwork exceptions pass.
- [ ] R3 · manual — Given the OrbitButton catalog and Sign in, when the shared renderer is edited and reloaded, then both reflect the edit without duplicate implementation and existing variants/states remain independently selectable.
- [ ] R4 · manual — Given Orbit's implemented auth screens and differing Yenom reference, when the four seeded frames are reviewed in English and Portuguese, then they preserve Orbit content/layout and show unfinished actions as inactive with source references.
- [ ] R5 · manual — Given the catalog and auth frames without overrides, when eight palettes, both modes and both languages are selected, then tokens, logos, text and legal content match source resources without moving frames.

## 7. Definition of Done (Verification)
- [ ] Automated criteria pass via `:core:ui:jvmTest`; relevant Detekt checks pass for added Kotlin tooling/tests.
- [ ] Compare seeded frames with Compose at matching viewports in Flamingo light/dark and both languages; verify supported platform differences and document rendering approximations.
- [ ] Inventory every reusable UI component, source variant/state, editable property and missing-token exception; verify catalogs/screens share implementations.
- [ ] Regeneration is repeatable, verification leaves files unchanged, and local assets load without external requests in Chrome/Safari.

## 8. Open questions
- Assumptions: migrate auth first; document Home as pending and migrate other screens on request. Platform pages reuse shared layouts.
