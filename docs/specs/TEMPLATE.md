# Spec: [Feature name]

Status: Draft | Approved | Implemented

## 1. Outcome
- User: [Who needs this?]
- Problem: [What is difficult or missing today?]
- Desired result: [What should become possible or improve?]

## 2. Scope
- Included: [What this change delivers.]
- Excluded: [Related work explicitly outside this change.]
- Design: [Frames this change follows or updates, e.g. `screens/sign-in`. Delete when no UI changes.]

## 3. Required behavior
- R1: When [trigger], the system must [observable result].
- R2: If [relevant edge case], the system must [expected behavior].
- R3: If [failure], the system must [recovery behavior].

## 4. Constraints
[Only mandatory limits: compatibility, permissions, performance,
or existing technical decisions. Write “None” if none apply.]

## 5. Contract
[Public types and functions added or changed. Signatures only, no bodies.
If errors are mapped, one table: Cause | Domain error | User sees.
Delete this section when no public API changes.]

## 6. Acceptance criteria
- [ ] R1 · unit — Given [starting state], when [action], then [verifiable result].
- [ ] R2 · ui — Given [screen state], when [interaction], then [what is shown].
- [ ] R3 · manual — Given [failure condition], when [action], then [expected recovery].

## 7. Definition of Done (Verification)
[Adapt to this change; delete what doesn't apply.]
- [ ] Automated unit test coverage added/updated
- [ ] End-to-end / integration testing validated
- [ ] CI checks passing
- [ ] Telemetry / Logging verified
- [ ] Token check passing (rule 5)
- [ ] Each changed screen matches its design frame in every state (rule 6)

## 8. Open questions
- [Decision needed] — [Who resolves it?] — [Does it block implementation?]
- Assumptions: [Explicit assumptions, or “None”.]

---

Rules:

1. One page. More than about ten acceptance criteria means the feature should be split.
2. Every requirement has at least one criterion, and every criterion names its requirement.
3. Every criterion is one `Given …, when …, then …` with concrete values and one level:
   `unit`, `ui`, `integration` or `manual`. Each automated one becomes one Kotest
   `Given / When / Then` with the same text; use `kotlin.test` only where Kotest can't run.
4. Nothing in **Excluded** gets a requirement.
5. Token check, for UI changes. Colors, type styles, spacing, sizes and shapes come from `OrbitTheme`,
   never from literals or Material defaults; magenta on screen is a Material default leaking through.
   A literal that must stay is declared in `design/catalog/*.decl.json` with its `source` file:line.
   Re-point every `source` into a file you edited: the check only rejects lines outside the file.
   Run the commands under "Regenerate and verify" in `design/README.md`.
6. UI style, for UI changes. Compare each screen with its frame (`python3 design/serve.py`) at the
   frame's viewport, in Flamingo light and dark, English and Portuguese, and in every state the
   requirements name: empty, filled, loading, disabled, error. A missing frame is added as `proposed`.
   Fix the screen, or update the frame in the same change when the design is the stale side:
   states, `inactive` notes and `source` lines.
