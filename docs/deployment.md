# Deployment

How the Orbit design workspace is published to GitHub Pages and connected to Supabase for GitHub sign-in, cloud saving, share links and comments. The behaviour itself is specified in [workspace-auth-sharing.md](specs/workspace-auth-sharing.md) and described in the [workspace guide](../design/README.md#accounts-cloud-saving-and-review).

| What | Where |
| --- | --- |
| Published site | <https://weslley-campos.github.io/orbit-design/> |
| Deploy workflow | [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) |
| Supabase project | `https://pikdrddsjnptodpolvxa.supabase.co` (project ref `pikdrddsjnptodpolvxa`) |
| Database migrations | [`supabase/migrations/`](../supabase/migrations) (run in file-name order) |
| Browser config | [`design/cloud.config.js`](../design/cloud.config.js) (empty in the repository; filled in at deploy time) |

Sign-in is optional. Without the Supabase settings the site works browser-only, exactly as on localhost. **With them, the workspace is private**: only accounts listed as editors (step 5) can open it; everyone else sees a sign-in page, and people you share a screen with open just that screen through its link.

## 1. GitHub Pages

1. The repository must be **public** (GitHub Pages on a private repository needs a paid plan, and the published site is public either way).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**

The workflow runs on every push to `main` and on demand (**Actions → Deploy design workspace to GitHub Pages → Run workflow**). It:

1. runs `node design/check.mjs` (workspace, store and cloud-sync checks);
2. runs `node supabase/tests/service.test.mjs` (the database functions on a throwaway PostgreSQL on the runner);
3. copies `design/` and stamps script/stylesheet URLs with the commit, so browsers never mix cached modules from different deploys;
4. writes `cloud.config.js` from the repository settings in step 4 below, when they are set;
5. publishes the result to Pages.

A failing check stops the deploy; the previous version stays online.

## 2. Supabase project and database

1. Create a project at <https://supabase.com> (the free plan is enough).
2. **SQL Editor → New query**: run each migration once, in order, pasting the whole file and clicking **Run**. Each should end with *Success. No rows returned*.
   1. [`20261007120000_design_workspace_auth_sharing.sql`](https://raw.githubusercontent.com/weslley-campos/orbit-design/main/supabase/migrations/20261007120000_design_workspace_auth_sharing.sql): workspaces, shares, comments.
   2. [`20261008090000_design_editors.sql`](https://raw.githubusercontent.com/weslley-campos/orbit-design/main/supabase/migrations/20261008090000_design_editors.sql): the editor list that makes the workspace private.
   3. [`20261008120000_design_project_shares.sql`](https://raw.githubusercontent.com/weslley-campos/orbit-design/main/supabase/migrations/20261008120000_design_project_shares.sql): links to the whole project.
   - A second run of the same file fails with "already exists"; that is harmless.
   - With the Supabase CLI instead: `supabase link --project-ref pikdrddsjnptodpolvxa` then `supabase db push`.

The migration creates private tables (workspaces, backups, profiles, shares, comments) that no client can read or write directly, and the `design_*` functions the site calls. Each function checks the signed-in user or the share link on every request.

## 3. GitHub sign-in

### GitHub OAuth app

<https://github.com/settings/applications/new> (GitHub → Settings → Developer settings → OAuth Apps → New OAuth App):

| Field | Value |
| --- | --- |
| Application name | `Orbit design` (shown on GitHub's authorize screen) |
| Homepage URL | `https://weslley-campos.github.io/orbit-design/` |
| Authorization callback URL | `https://pikdrddsjnptodpolvxa.supabase.co/auth/v1/callback` |
| Enable Device Flow | unchecked |

Register it, copy the **Client ID**, then **Generate a new client secret** and copy it immediately (GitHub shows it once).

### Supabase provider

**Authentication → Sign In / Providers → GitHub**: enable it, paste the Client ID and Client secret, save.

### Supabase redirect URLs

**Authentication → URL Configuration**:

- **Site URL**: `https://weslley-campos.github.io/orbit-design/`
- **Redirect URLs**: `https://weslley-campos.github.io/orbit-design/` and `http://localhost:4173/`

The workspace always returns to exactly these addresses (with the trailing `/`); review links are restored from the browser after sign-in.

## 4. Repository settings for the deploy

**Settings → Secrets and variables → Actions**, either as *Variables* or as *Secrets*:

| Name | Value (Supabase → Project Settings → API) |
| --- | --- |
| `SUPABASE_URL` | `https://pikdrddsjnptodpolvxa.supabase.co` |
| `SUPABASE_ANON_KEY` | the `anon` / public API key |

The anon key is public by design: it ends up in the published `cloud.config.js`, and the database functions decide what each request may do.

**Never store** the `service_role` key or the GitHub client secret in the repository, in Actions settings or in `cloud.config.js`. The client secret belongs only in the Supabase GitHub provider.

Settings are read at deploy time: after adding or changing them, push or run the workflow manually.

## 5. Editors

Only editors can open the workspace, save, share and see comments on their screens. Nobody is an editor until you add them, and nobody can add themselves (the table is only writable from the Supabase dashboard).

1. Sign in on the site once with that GitHub account (it then shows *… is not an editor*).
2. In the Supabase **SQL Editor**, run (with the GitHub login):

   ```sql
   insert into public.design_editors (user_id)
   select user_id from auth.identities
   where provider = 'github' and identity_data ->> 'user_name' = 'weslley-campos';
   ```

   It should report *1 row* inserted. Alternatively, **Table Editor → design_editors → Insert row** with the user's id from **Authentication → Users**.
3. Click **Retry** or reload the site.

To list editors: `select u.raw_user_meta_data ->> 'user_name' as login, e.added_at from public.design_editors e join auth.users u on u.id = e.user_id;`
To remove one: `delete from public.design_editors where user_id = (select user_id from auth.identities where provider = 'github' and identity_data ->> 'user_name' = 'login');` Their saved workspace stays in the database; they just cannot open it.

People who only review never need to be editors: a share link shows that one screen to anyone who has it, and anyone signed in with GitHub can comment there.

### What "private" covers

The editor check protects everything stored in Supabase: your saved workspace, edits, Archived/Trash, links and comments. It also hides the canvas from non-editors on the site. It cannot hide the files of this **public repository**: the catalog (`design/catalog/`), the committed seed `design/workspace.json` and the assets are readable on GitHub and as files on the Pages site by anyone who looks for them. To keep those private too, the repository must be private and the site hosted somewhere with access control (for example GitHub Pages with private visibility on GitHub Enterprise Cloud, or Cloudflare Pages with Cloudflare Access).

## 6. Deploy and verify

1. **Actions → Deploy design workspace to GitHub Pages → Run workflow** (branch `main`). In the build log, the step *Configure sign-in from repository settings* prints `Sign-in enabled for ***`.
2. Open the site and hard-refresh. The right panel header shows **Sign in**.
3. Sign in with GitHub and add yourself as an editor (step 5). A first sign-in as editor asks **Start your cloud workspace**: upload this browser's draft or start from the committed workspace.
4. The sidebar status reads **Saved to the cloud**.
5. Select a screen, **Share → Create link**, open the link in a private window: the screen and its comments appear, and signing in there allows commenting.

## Troubleshooting

| What you see | Cause | Fix |
| --- | --- | --- |
| No Sign in button | `SUPABASE_URL` / `SUPABASE_ANON_KEY` missing, or the site was not redeployed | Step 4, then run the workflow; hard-refresh |
| Supabase page: `"Unsupported provider: provider is not enabled"` | GitHub provider off | Step 3, Supabase provider |
| GitHub page: *The redirect_uri is not associated with this application* | Wrong callback URL in the OAuth app | Use `https://pikdrddsjnptodpolvxa.supabase.co/auth/v1/callback` |
| After sign-in you land on the wrong page or `localhost:3000` | Site URL / redirect URLs not set | Step 3, redirect URLs |
| Notice: *Sign-in did not complete. Your work is unchanged.* | Sign-in cancelled or denied on GitHub | Try again |
| Notice: *Your cloud workspace could not be loaded (the database is not set up…)*, or the private page says *Your access could not be checked (the database is not set up…)* | A migration was not run | Step 2 (both files), then **Retry** |
| Private page: *… is not an editor of this workspace* | That account is not in `design_editors` | Step 5, or sign out and use an editor account |
| Notice: *…could not be loaded (offline)* | No connection to Supabase | **Retry** when online; nothing is overwritten meanwhile |
| Status: *Newer copy in the cloud* | Another device saved since these edits started | **Download local copy**, then **Load cloud copy** ([recovery](../design/README.md#recovery)) |
| Review link: *This link was revoked or no longer exists* | Link revoked, or the workspace was Reset/replaced by Import | Share the screen again |
| Review link: *This screen is not available right now* | The screen is archived or in Trash | Restore it; the link works again unless revoked |

Nothing is lost in any of these cases: edits stay in the browser (and can be exported) until the cloud acknowledges them.

## Local development

```bash
python3 design/serve.py          # http://localhost:4173
```

Browser-only by default. To test sign-in locally, put the same URL and anon key in `design/cloud.config.js` **without committing them**, and keep `http://localhost:4173/` in the Supabase redirect URLs. Drafts on localhost and on Pages are separate.

Checks:

```bash
node design/check.mjs                    # workspace, store and cloud-sync checks
node supabase/tests/service.test.mjs     # database functions on a throwaway local PostgreSQL (13+; set PG_BIN if needed)
```

## Changing the database later

Add a new file to `supabase/migrations/` (never edit one that already ran), extend `supabase/tests/service.test.mjs`, push (CI runs the tests), then run the new file in the SQL editor or with `supabase db push`. Deploy the site after the database change when the browser code depends on it.
