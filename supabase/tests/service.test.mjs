// Service-boundary integration tests: applies the migration to a throwaway local PostgreSQL 16 cluster and calls
// its functions as anonymous and signed-in users, the way the Supabase API would.
// Run: node supabase/tests/service.test.mjs   (needs PostgreSQL 13+ server binaries; set PG_BIN if they are not found)
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, chownSync, existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const migrations = join(here, '..', 'migrations');
const installed = existsSync('/usr/lib/postgresql')
  ? readdirSync('/usr/lib/postgresql').sort((a, b) => b - a).map((version) => `/usr/lib/postgresql/${version}/bin`) : [];
const bin = process.env.PG_BIN ?? [...installed, '/opt/homebrew/opt/postgresql@16/bin', '/usr/local/opt/postgresql@16/bin']
  .find((dir) => existsSync(join(dir, 'initdb')));
if (!bin) {
  console.log('service tests skipped: PostgreSQL server binaries not found (set PG_BIN)');
  process.exit(0);
}

// initdb refuses to run as root, so run the server as the postgres user then.
const asRoot = process.getuid?.() === 0;
const run = (tool, args, options = {}) => execFileSync(asRoot ? 'runuser' : join(bin, tool),
  asRoot ? ['-u', 'postgres', '--', join(bin, tool), ...args] : args, { encoding: 'utf8', ...options });

const dir = mkdtempSync(join(tmpdir(), 'orbit-design-pg-'));
if (asRoot) { chmodSync(dir, 0o755); chownSync(dir, Number(execFileSync('id', ['-u', 'postgres']).toString()), Number(execFileSync('id', ['-g', 'postgres']).toString())); }
const data = join(dir, 'data');
const port = String(55000 + Math.floor(Math.random() * 5000));
run('initdb', ['-D', data, '-U', 'postgres', '--auth=trust', '-E', 'UTF8'], { stdio: 'ignore' });
run('pg_ctl', ['-D', data, '-o', `-p ${port} -k ${dir} -c listen_addresses=''`, '-w', '-l', join(dir, 'log'), 'start'], { stdio: 'ignore' });
const stop = () => { try { run('pg_ctl', ['-D', data, '-m', 'immediate', 'stop'], { stdio: 'ignore' }); } catch { /* already stopped */ } rmSync(dir, { recursive: true, force: true }); };
process.on('exit', stop);

function psql(sql, { file } = {}) {
  const args = ['-h', dir, '-p', port, '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-q', '-At', ...(file ? ['-f', file] : ['-c', sql])];
  const result = spawnSync(join(bin, 'psql'), args, { encoding: 'utf8' });
  if (result.status !== 0) return { error: (result.stderr.match(/ERROR:\s+(.*)/)?.[1] ?? result.stderr).trim() };
  return { out: result.stdout.trim() };
}
const setup = (file) => { const r = psql(null, { file }); if (r.error) throw new Error(`${file}: ${r.error}`); };
setup(join(here, 'supabase-stub.sql'));
for (const file of readdirSync(migrations).filter((name) => name.endsWith('.sql')).sort()) setup(join(migrations, file));

const q = (value) => (value == null ? 'null' : `'${String(value).replaceAll("'", "''")}'`);
const j = (value) => `${q(JSON.stringify(value))}::jsonb`;
// Runs one statement as a user (null = anonymous) and returns its single JSON value, or { error }.
function as(user, sql) {
  const role = user ? 'authenticated' : 'anon';
  const result = psql(`set role ${role}; set "request.jwt.claim.sub" = ${q(user?.id ?? '')}; ${sql}`);
  if (result.error) return { error: result.error };
  return result.out === '' ? null : JSON.parse(result.out);
}
const rows = (user, call) => as(user, `select coalesce(jsonb_agg(t), '[]'::jsonb) from ${call} t;`);
const value = (user, call) => as(user, `select to_jsonb(${call});`);
const fails = (result, pattern, message) => assert.match(result?.error ?? `no error: ${JSON.stringify(result)}`, pattern, message);

const user = (id, meta) => {
  psql(`insert into auth.users (id, email, raw_user_meta_data) values (${q(id)}, ${q(`${meta.user_name}@example.com`)}, ${j(meta)});
    insert into auth.identities (user_id, provider, identity_data) values (${q(id)}, 'github', ${j({ ...meta, email: `${meta.user_name}@example.com` })});`);
  return { id };
};
const weslley = user('11111111-1111-4111-8111-111111111111', { full_name: 'Weslley Campos', user_name: 'weslley-campos', avatar_url: 'https://avatars.example/w.png' });
const marina = user('22222222-2222-4222-8222-222222222222', { user_name: 'marina' });
const outsider = user('33333333-3333-4333-8333-333333333333', { user_name: 'outsider' });
// Editors are added by hand in Supabase; the outsider is a signed-in GitHub user who is not one.
psql(`insert into public.design_editors (user_id) values (${q(weslley.id)}), (${q(marina.id)});`);

const frame = (id, x = 0) => ({ id, catalogId: 'screens/home', x, y: 0, width: 402, height: 874 });
const doc = (frames = [frame('home'), frame('home-2', 500), frame('sign-in', 1000)], extra = {}) => ({
  version: 1,
  settings: { palette: 'flamingo', mode: 'light', language: 'pt', device: 'ios' },
  selectedPageId: 'mobile',
  startFrameId: frames[0]?.id ?? null,
  pages: [{ id: 'mobile', name: 'Screens / Mobile', platform: 'mobile', view: { x: 0, y: 0, zoom: 1 }, frames }],
  connections: frames.length > 2 ? [{ id: 'c1', from: { frameId: 'sign-in', hotspotId: 'go' }, to: { frameId: 'home' }, trigger: 'click' }] : [],
  overrides: { tokens: { invariant: { 'spacing.medium': '21dp' } }, frames: { home: { title: { text: { pt: 'Oi' } } }, 'sign-in': { secret: { text: { en: 'private' } } } } },
  ...extra,
});
const save = (who, document, base) => value(who, `design_save_workspace(${j(document)}, ${base ?? 'null'})`);

// Access control on the boundary itself.
fails(as(null, 'select * from design_workspaces;'), /permission denied/, 'anon cannot read tables');
fails(as(weslley, 'select * from design_workspaces;'), /permission denied/, 'signed-in users cannot read tables directly');
fails(as(weslley, `select design_open_share('x');`), /permission denied/, 'private helpers are not callable');
fails(as(null, `select design_save_workspace(${j(doc())}, null);`), /permission denied/, 'anon cannot save');
fails(as(null, `select design_post_comment(null, 'home', 'hi', gen_random_uuid());`), /permission denied/, 'anon cannot comment');

// R2/R4: first save, revisions and stale writes.
let saved = rows(weslley, `design_save_workspace(${j(doc())}, null)`)[0];
assert.equal(saved.revision, 1, 'the first save creates revision 1');
fails(save(weslley, doc(), null), /stale_revision/, 'a seed upload (no base) never replaces an existing account');
for (let n = 2; n <= 8; n++) assert.equal(rows(weslley, `design_save_workspace(${j(doc())}, ${n - 1})`)[0].revision, n);
fails(save(weslley, doc(), 7), /stale_revision/, 'an edit based on revision 7 is rejected at revision 8');
assert.equal(rows(weslley, 'design_load_workspace()')[0].revision, 8, 'and the cloud copy stays at 8');

// Validation, including nested shelf data.
const withTrash = (item) => doc(undefined, { trash: [item] });
fails(save(weslley, { ...doc(), version: 2 }, 8), /version must be 1/);
fails(save(weslley, withTrash({ frame: frame('home') }), 8), /duplicate frame id home in trash/);
fails(save(weslley, withTrash({ frame: frame('gone'), connections: [{ id: 'x', from: { frameId: 'gone' }, to: {}, trigger: 'click' }] }), 8), /invalid endpoints of frame gone in trash/);
fails(save(weslley, withTrash({ frame: frame('gone'), overrides: [] }), 8), /invalid metadata/);
fails(save(weslley, { ...doc(), connections: [{ id: 'c', from: { frameId: 'home' }, to: { frameId: 'nowhere' }, trigger: 'click' }] }, 8), /not on a page/);
const v1WithoutShelves = doc([frame('marina-home')]);
assert.equal(rows(marina, `design_save_workspace(${j(v1WithoutShelves)}, null)`)[0].revision, 1, 'a version-1 document without shelf arrays is accepted');

// R3: accounts are isolated.
assert.deepEqual(rows(marina, 'design_load_workspace()').map((r) => r.revision), [1], 'Marina only sees her own workspace');
assert.equal(rows(weslley, 'design_load_workspace()')[0].revision, 8);
fails(as(null, 'select * from design_load_workspace();'), /permission denied/);

// Profile preferences sync separately from the document.
assert.deepEqual(value(weslley, `design_save_preferences(${j({ theme: 'dark', panels: { left: true, right: false } })})`), { theme: 'dark', panels: { left: true, right: false } });
const profile = rows(weslley, 'design_get_profile()')[0];
assert.equal(profile.display_name, 'Weslley Campos');
assert.deepEqual(profile.preferences.panels, { left: true, right: false });
fails(as(weslley, `select design_save_preferences(${j({ theme: 'purple' })});`), /invalid_preferences/);
fails(as(weslley, `select design_save_preferences(${j({ theme: 'dark', email: 'x' })});`), /invalid_preferences/);

// Only editors reach the workspace; others get nothing but share links.
assert.deepEqual(value(weslley, 'design_access()'), { editor: true, name: 'Weslley Campos', handle: 'weslley-campos' });
assert.deepEqual(value(outsider, 'design_access()'), { editor: false, name: 'outsider', handle: 'outsider' }, 'a first call already knows the GitHub login');
fails(as(null, 'select design_access();'), /permission denied/);
fails(as(outsider, 'select * from design_load_workspace();'), /not_editor/, 'non-editors cannot open a workspace');
fails(save(outsider, doc(), null), /not_editor/, 'or create one');
fails(as(outsider, `select design_save_preferences(${j({ theme: 'dark' })});`), /not_editor/);
fails(as(outsider, 'select * from design_list_shares();'), /not_editor/);
fails(as(outsider, `select design_list_comments(null, 'home');`), /not_editor/);
fails(as(outsider, `select design_post_comment(null, 'home', 'hi', gen_random_uuid(), null);`), /not_editor/);
fails(as(outsider, 'select design_editor_uid();'), /permission denied/, 'the helper is private');
fails(as(outsider, 'insert into design_editors (user_id) values (auth.uid());'), /permission denied/, 'nobody can make themselves an editor');

// R5: what a link holder sees.
const token = value(weslley, `design_create_share('home-2')`);
assert.match(token, /^[0-9a-f]{64}$/, 'links use 256-bit unguessable tokens');
assert.equal(value(weslley, `design_create_share('home-2')`), token, 'sharing the same screen again reuses its live link');
const shared = value(null, `design_get_shared_frame(${q(token)})`);
assert.equal(shared.frame.id, 'home-2');
assert.deepEqual(Object.keys(shared).sort(), ['frame', 'overrides', 'ownerName', 'platform', 'revision', 'settings']);
assert.deepEqual(Object.keys(shared.overrides.frames), ['home-2'], 'only that frame’s overrides are returned');
assert.ok(!JSON.stringify(shared).includes('private') && !JSON.stringify(shared).includes('sign-in'), 'no other frames, overrides or connections leak');
assert.equal(shared.settings.language, 'pt');
fails(as(null, `select design_get_shared_frame(${q('0'.repeat(64))});`), /link_unavailable/);
fails(as(marina, `select to_jsonb(design_create_share('home'));`), /frame_not_live/, 'Marina cannot share a frame of Weslley’s');
fails(as(marina, `select design_revoke_share(${q(token)});`), /not_found/, 'and cannot revoke his link');
fails(as(marina, `update design_shares set revoked_at = now();`), /permission denied/, 'or edit shares directly');

// R8/R7: comments by authenticated users only, validated and deduplicated.
const post = (who, body, clientId, viewed = null, tok = token) => value(who, `design_post_comment(${q(tok)}, null, ${q(body)}, ${q(clientId)}::uuid, ${viewed ?? 'null'})`);
fails(post(marina, '   ', 'aaaaaaaa-0000-4000-8000-000000000001'), /invalid_body/, 'blank comments fail');
fails(post(marina, 'x'.repeat(2001), 'aaaaaaaa-0000-4000-8000-000000000002'), /invalid_body/, '2,001 characters fail');
const first = post(marina, '  Looks great, but the title wraps.  ', 'aaaaaaaa-0000-4000-8000-000000000003', 3);
const retry = post(marina, '  Looks great, but the title wraps.  ', 'aaaaaaaa-0000-4000-8000-000000000003', 3);
assert.equal(retry.id, first.id, 'a retried post returns the first comment');
assert.equal(first.body, 'Looks great, but the title wraps.', 'bodies are trimmed');
assert.deepEqual(first.author, { id: marina.id, name: 'marina', handle: 'marina', avatarUrl: null }, 'the author is the signed-in user');
// Users can edit their own user_metadata through the auth API; the GitHub identity decides the shown name.
psql(`update auth.users set raw_user_meta_data = '{"full_name":"Weslley Campos","user_name":"weslley-campos"}' where id = ${q(marina.id)};`);
assert.deepEqual(post(marina, 'Renamed?', 'aaaaaaaa-0000-4000-8000-00000000000a').author, { id: marina.id, name: 'marina', handle: 'marina', avatarUrl: null }, 'a reviewer cannot pose as the owner');
assert.equal(first.revision, 3, 'the viewed revision is recorded');
assert.equal(post(marina, 'y'.repeat(2000), 'aaaaaaaa-0000-4000-8000-000000000004', 99).revision, 8, 'a viewed revision is clamped to the saved one');
fails(as(marina, `insert into design_comments (owner, generation, frame_id, author, body, revision, client_id) values (${q(weslley.id)}, gen_random_uuid(), 'home-2', ${q(weslley.id)}, 'forged', 1, gen_random_uuid());`), /permission denied/, 'authors cannot be forged');
let thread = value(null, `design_list_comments(${q(token)}, null)`);
assert.equal(thread.length, 3);
assert.ok(!JSON.stringify(thread).includes('@example.com'), 'emails are never exposed');
assert.ok(thread.every((c) => c.clientId === null && c.mine === false), 'anonymous readers see no client ids');
const viaLink = value(outsider, `design_post_comment(${q(token)}, null, 'From a reviewer without editor access', 'cccccccc-0000-4000-8000-000000000001'::uuid, null)`);
assert.equal(viaLink.author.handle, 'outsider', 'non-editors still comment through a share link');
thread = value(null, `design_list_comments(${q(token)}, null)`);
assert.equal(thread.length, 4);
assert.equal(value(weslley, `design_list_comments(null, 'home')`).length, 0, 'the other Home instance has its own (empty) thread');
assert.equal(value(weslley, `design_list_comments(null, 'home-2')`).length, 4, 'the owner sees the shared instance’s thread');
const own = value(weslley, `design_post_comment(null, 'home', 'Owner note', 'bbbbbbbb-0000-4000-8000-000000000001'::uuid, null)`);
assert.equal(own.author.name, 'Weslley Campos');
assert.equal(value(null, `design_get_shared_frame(${q(token)})`).ownerName, 'Weslley Campos (@weslley-campos)');

// R6: moving keeps comments; shelving suspends the link; restoring resumes it; revoking is permanent.
saved = rows(weslley, `design_save_workspace(${j(doc([frame('home'), frame('home-2', 900), frame('sign-in', 1400)]))}, 8)`)[0];
assert.equal(value(weslley, `design_list_comments(null, 'home-2')`).length, 4, 'comments follow a moved frame');
const shelved = doc([frame('home'), frame('sign-in', 1000)], { trash: [{ frame: frame('home-2', 900), pageId: 'mobile', pageName: 'Screens / Mobile', index: 1, platform: 'mobile', connections: [], overrides: {}, start: false, at: '2026-10-07T00:00:00Z' }] });
saved = rows(weslley, `design_save_workspace(${j(shelved)}, ${saved.revision})`)[0];
fails(as(null, `select design_get_shared_frame(${q(token)});`), /screen_unavailable/, 'a trashed screen’s link is suspended');
fails(as(null, `select design_list_comments(${q(token)}, null);`), /screen_unavailable/);
fails(post(marina, 'Still there?', 'aaaaaaaa-0000-4000-8000-000000000005'), /screen_unavailable/, 'and cannot be posted to');
assert.equal(value(weslley, `design_list_comments(null, 'home-2')`).length, 4, 'the owner keeps the comments in the shelf view');
fails(as(weslley, `select design_post_comment(null, 'home-2', 'note', gen_random_uuid(), null);`), /screen_unavailable/, 'shelved screens take no new comments');
saved = rows(weslley, `design_save_workspace(${j(doc())}, ${saved.revision})`)[0];
assert.equal(value(null, `design_get_shared_frame(${q(token)})`).frame.id, 'home-2', 'restoring the same frame resumes the link');
const revokedAt = value(weslley, `design_revoke_share(${q(token)})`);
assert.ok(revokedAt, 'revocation is acknowledged with its time');
fails(as(null, `select design_get_shared_frame(${q(token)});`), /link_unavailable/);
saved = rows(weslley, `design_save_workspace(${j(shelved)}, ${saved.revision})`)[0];
saved = rows(weslley, `design_save_workspace(${j(doc())}, ${saved.revision})`)[0];
fails(as(null, `select design_get_shared_frame(${q(token)});`), /link_unavailable/, 'a revoked link stays revoked after shelve and restore');
const second = value(weslley, `design_create_share('home-2')`);
assert.notEqual(second, token, 'sharing again creates a new link');
assert.equal(rows(weslley, 'design_list_shares()').length, 2);

// R3/R6: Reset or replacing Import starts a new generation; old links and threads cannot attach to reused IDs.
const before = rows(weslley, 'design_load_workspace()')[0];
fails(as(weslley, `select * from design_replace_workspace(${j(doc())}, ${before.revision - 1}, 'reset');`), /stale_revision/);
const replaced = rows(weslley, `design_replace_workspace(${j(doc())}, ${before.revision}, 'reset')`)[0];
assert.notEqual(replaced.generation, before.generation);
fails(as(null, `select design_get_shared_frame(${q(second)});`), /link_unavailable/, 'old links stop working');
assert.equal(value(weslley, `design_list_comments(null, 'home-2')`).length, 0, 'the reused frame ID starts with no comments');
assert.equal(rows(weslley, 'design_list_shares()').length, 0);
const backups = rows(weslley, 'design_list_backups()');
assert.equal(backups[0].reason, 'reset', 'the prior copy is kept');
assert.equal(value(weslley, `design_get_backup(${backups[0].id})`).pages[0].frames.length, 3);
assert.equal(value(marina, `design_get_backup(${backups[0].id})`), null, 'backups are private');

console.log('supabase/tests/service.test.mjs passed');
