# Spec: Workspace authentication, saving and screen review

Status: Draft

Baseline: fetched `origin/main` and published preview at `19a2b7bd0cd2`, verified on 2026-10-07. [Current behavior](../../design/README.md), [storage](../../design/js/store.js), [application](../../design/js/app.js) and [layout](../../design/index.html) are the implementation references.

## 1. Outcome

- User: the owner organizing Orbit designs and people reviewing shared screens.
- Problem: workspace edits, shelves and preferences stay in one browser/origin; authentication, remote saving and attributed comments are absent.
- Desired result: sign in at [Orbit design](https://weslley-campos.github.io/orbit-design/), restore personal changes across devices and share screens for attributed feedback.

## 2. Scope

- Included: one workspace per account, authentication, cloud saving of existing state/preferences, guest-draft adoption, selected-screen sharing and attributed comments.
- Excluded: production Orbit authentication/family permissions, multiple workspaces, collaborative editing, replies, notifications and revision history. Move mode, shelf viewing/restoration and connector gestures already exist and retain their behavior.
- Design: account actions in the left sidebar/main menu, its existing save status, Share alongside the selected screen's actions, and comments in the right panel. Preserve the floating view controls and collapsed-panel access; add sign-in, draft-choice and sharing dialogs.

## 3. Required behavior

- R1: Offer sign-in while preserving guest editing. Restore valid sessions and show account identity/sign-out. Failed/cancelled authentication preserves work. Signing in from review returns to that screen and comment draft without replacing the user's personal workspace.
- R2: Automatically save/restore the full document and preferences in section 5. Include Move/Inspect edits, completed prototype links, archive/trash, page deletion and restoration, retaining existing fallback-page and deferred-connection behavior. Workspace theme and frame light/dark mode remain independent. Never upload the synthetic shelf-view layout over the stored frame coordinates.
- R3: Without cloud data, offer adopting this origin's guest draft/preferences or starting from the seed; otherwise load the account copy and preserve guest drafts for export/import. Isolate account caches and pending operations on sign-out/switching. Valid Import and confirmed Reset update the account document; explain that replacement includes both shelves, and retain a recoverable prior copy. Reject invalid imports unchanged.
- R4: Extend sidebar status to distinguish browser-only, saving, cloud-saved, offline/pending and failed states; cloud success requires server acknowledgement. Preserve unsynced data for retry/export after failures or session expiry. Reject stale-revision writes without replacing cloud data; offer local download/cloud reload. A load failure must not upload the seed over an existing account.
- R5: Share is available for a live selected frame once edits are cloud-saved. Disclose link-holder viewing and signed-in commenting; allow copy/revoke. On load/refresh, expose the latest saved frame, necessary render settings/overrides and its comments only. Review navigation must not save into either user's workspace; editing, shelf actions, connections and private prototype destinations are unavailable.
- R6: Enforce ownership/link access on every service request. Cloud-saved Archive, Trash and page deletion suspend shared reads/posts; restoring the same frame resumes an unrevoked link. Confirm revocation only after service acknowledgement; it never reverses on restore. Owners retain comments in shelf views. Reset or replacement Import changes the review generation, invalidating old links and preventing reused frame IDs from inheriting comments.
- R7: Key comments by workspace, review generation and stable frame-instance ID. Show the authenticated author's display name, optional avatar, timestamp and text; the service assigns author ID/time and records the viewed revision. Never substitute the link owner or expose emails. Comments follow moves, shelving and restoration; two instances of one catalog entry have separate discussions.
- R8: Owners and authenticated reviewers can post to live screens using 1–2,000 trimmed plain-text characters. Guests must sign in. Show empty/loading/submitting/error states; retain failed drafts and deduplicate retries. Expired sessions, suspended targets and revoked links cannot post successfully.

## 4. Constraints

- Reuse HTML/CSS/ES modules, renderers, `app.save`, validation and version-1 normalization. Theme/panel changes and Reset currently bypass `app.save`; they must participate in account persistence. Validate nested shelf connections/overrides at the service boundary, not just their container types.
- Preserve the [Pages deployment](../../.github/workflows/pages.yml) and commit-stamped assets. An external auth/data service extends the original [local-only spec](design-workspace.md). Keep secrets/private records out of public assets; catalog/seed remain public and account documents private by default. Service permissions, not the existing shelf read-only flag, authorize review access.
- Use unguessable, revocable links that reload under `/orbit-design/`, e.g. URL fragments. Guest drafts on localhost and Pages remain separate; moving an unsynced draft between origins requires existing Export/Import.
- Use tokens, keyboard access, focus and accessible status/error announcements. Register proposed frames/declarations and English/Portuguese copy in `design/catalog/strings.proposed.json` during implementation.

## 5. Contract

Provider-neutral persistence boundary; service API signatures follow provider selection.

| Data | Required contents |
| --- | --- |
| Existing workspace v1 | `version`, `settings` (palette, frame mode, language, device), `selectedPageId`, `startFrameId`, pages/order/views/platforms/frames, connections and overrides. |
| Existing `archived` / `trash` | Preserve each item's `frame`, `pageId`, `pageName`, `index`, `platform`, `connections`, `overrides`, `start` and `at`; missing arrays normalize to empty without a version bump. |
| Profile preferences | Sync `orbit.design.theme` (System/Light/Dark) and `orbit.design.panels` (left/right visibility) separately from the workspace JSON. |
| Service records | Owner/workspace identity, save revision, review generation, shares and comments stay outside exported `workspace.json`; Export/Import retains its existing document format. |

Interaction mode, selection, unfinished connectors, toast/Undo state, expanded shelves and synthetic shelf views remain transient.

## 6. Acceptance criteria

- [ ] R1, R2 · integration — Given saved Home at (200, 0), Portuguese/light frames, dark workspace chrome and hidden inspector, when Weslley signs in elsewhere, then identity, document and independent preferences match.
- [ ] R2 · integration — Given an archived start frame with overrides and a connection to a trashed frame, when both are synced and restored on another browser, then IDs, shelf metadata and existing restoration behavior survive unchanged.
- [ ] R3 · integration — Given an old version-1 guest draft without shelf arrays, when adopted into a new account, then shelves normalize to empty and the original draft remains recoverable.
- [ ] R3 · integration — Given guest/Weslley/Marina drafts and a pending Weslley save, when he signs out and Marina signs in, then only Marina's account data loads and receives subsequent saves.
- [ ] R3, R6 · integration — Given a shared/commented frame, when confirmed Reset or valid replacement Import reuses its ID, then the account receives the replacement but old links/comments cannot attach to it.
- [ ] R4 · integration — Given offline edits based on revision 7 and cloud revision 8, when reconnection retries the save, then cloud data stays at 8, local work remains downloadable and status cannot report cloud success.
- [ ] R5 · manual — Given shared Home and unshared account overrides, when a guest opens and pans its link, then only Home/comments are returned and neither user's saved workspace changes.
- [ ] R6 · integration — Given a shared Home frame, when it is shelved/restored and later revoked/restored, then access resumes only for the unrevoked link and comments remain available to the owner.
- [ ] R1, R7 · integration — Given two Home instances and a draft on the second's link, when Marina signs in/posts and the owner moves that frame, then only that instance retains Marina's authenticated identity, timestamp and viewed revision.
- [ ] R8 · integration — Given blank, 2,001-character and valid plain-text drafts, when submission and failed-response retry are exercised, then invalid posts fail and the valid draft persists until exactly one comment is acknowledged.

## 7. Definition of Done (Verification)

- [ ] Criteria pass, plus cancelled sign-in, malformed shelf data, expired sessions, forged authors and reviewer mutation attempts. Retain the existing Node shelf/restoration checks and add service-boundary integration coverage.
- [ ] Verify proposed states, keyboard controls, collapsed panels and Flamingo light/dark in English/Portuguese at the existing preview port 4173. Verify share/auth return URLs on Pages.
- [ ] `node design/check.mjs` and Kotlin synchronization checks in `design/README.md` pass; document setup, recovery, preferences and share lifecycle there.

## 8. Open questions

- Decided: Supabase (PostgreSQL functions with row-level security) for persistence, shares and comments, with GitHub sign-in. Setup is in [design/README.md](../../design/README.md#accounts-cloud-saving-and-review).
- Assumptions: one workspace/account; links show one live screen's latest saved state; link holders view, authenticated users comment; comments target whole screens. Shelving temporarily suspends sharing. Orbit family membership grants no workspace access.
