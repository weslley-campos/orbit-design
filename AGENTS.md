# Orbit design repository rules

Orbit is a personal expense manager. Sharing with family members is optional. Use “family” and “family members” in copy, specs and code.

- Keep the workspace in `design/`, using its existing HTML, CSS and ES modules.
- Reuse the renderers in `design/catalog/components.js` and declare visual bindings in `design/catalog/*.decl.json`.
- Use theme tokens for colors, typography, spacing, sizes and shapes. New literals need a `proposal`; existing source references point into the Orbit application repository.
- Keep proposed text in `design/catalog/strings.proposed.json`, in English and Portuguese.
- Add proposed frames to the catalog and `design/workspace.json`, with explicit prototype connections where needed.
- Write design specs in `docs/specs` using its template.
- Run `node design/check.mjs` and verify changed frames in light/dark and English/Portuguese. Run the Kotlin synchronization checks from the Orbit checkout as documented in `design/README.md`.
- Preview with `python3 design/serve.py`. Keep the same localhost port to preserve browser drafts.
- `design/assets/core-ui` and `design/assets/feature-auth` are committed resource snapshots; refresh them using the commands in `design/README.md`.
