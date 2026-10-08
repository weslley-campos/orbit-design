// Sign-in, cloud saving, sharing and comments for the owner's workspace (docs/specs/workspace-auth-sharing.md).
// Without design/cloud.config.js values everything stays browser-only, exactly as before.
import { cloudConfigured, createCloud } from './cloud.js';
import { createThread } from './comments.js';
import { h, kids, openMenu } from './dom.js';
import { icon } from './icons.js';
import { normalize, saveDraft, validateWorkspace } from './store.js';
import { createPreferenceSync, createSync } from './sync.js';

export const reviewUrl = (token) => `${location.origin}${location.pathname}#/review/${token}`;

export function createAccount(app, env) {
  const { t, storage, context } = env;
  const statusEl = document.getElementById('save-status');
  const accountEl = document.getElementById('account');
  let cloud = null;
  let user = null;
  let active = false; // the open workspace is the account's cloud copy
  let guestSaved = true;
  let sync = null;
  let prefs = null;
  const threads = new Map();

  const reason = (error) => {
    const key = `workspace_reason_${error?.code}`;
    const text = t(key);
    return text === key ? error?.message ?? t('workspace_reason_error') : text;
  };

  function renderStatus() {
    const s = active ? sync.status() : user && sync && ['loading', 'blocked'].includes(sync.status()) ? sync.status() : null;
    const key = s ? { idle: 'saved', loading: 'loading', saving: 'saving', saved: 'saved', pending: 'pending', failed: 'failed', conflict: 'conflict', blocked: 'blocked' }[s]
      : guestSaved ? 'local' : 'local_failed';
    statusEl.textContent = t(`workspace_status_${key}`);
    statusEl.title = key === 'local_failed' ? t('workspace_status_local_failed_hint') : statusEl.textContent;
    statusEl.classList.toggle('is-failed', ['local_failed', 'failed', 'conflict', 'blocked'].includes(key));
    statusEl.classList.toggle('is-pending', key === 'pending' || key === 'saving' || key === 'loading');
    app.onCloudStatus?.();
  }

  function renderAccount() {
    accountEl.hidden = !cloud;
    if (!cloud) return;
    if (!user) {
      accountEl.replaceChildren(h('button', { class: 'ws-signin', 'data-f': 'sign-in', title: t('workspace_sign_in'), 'aria-label': t('workspace_sign_in'), onclick: signIn }, t('workspace_sign_in_short')));
      return;
    }
    const label = t('workspace_signed_in_as', { name: user.name });
    accountEl.replaceChildren(h('button', {
      class: 'ws-account-button', 'data-f': 'account', 'aria-label': label, title: label, 'aria-haspopup': 'menu',
      onclick: (e) => openMenu(e.currentTarget, accountMenu()),
    }, user.avatarUrl ? h('img', { class: 'ws-avatar', src: user.avatarUrl, alt: '', width: 26, height: 26, referrerPolicy: 'no-referrer' })
      : h('span', { class: 'ws-avatar', 'aria-hidden': 'true' }, user.name[0]?.toUpperCase() ?? '?'), icon('chevron', 14)));
  }

  function accountMenu() {
    if (!user) return [];
    const s = active ? sync.status() : null;
    return kids([
      { heading: user.name },
      active && ['failed', 'pending'].includes(s) ? { label: t('workspace_retry'), run: () => sync.retry() } : null,
      active && ['failed', 'pending', 'conflict'].includes(s) ? { label: t('workspace_download_local'), run: downloadLocal } : null,
      active && s === 'conflict' ? { label: t('workspace_reload_cloud'), run: reloadCloud } : null,
      active ? { label: t('workspace_download_backup'), run: downloadBackup } : null,
      { label: t('workspace_sign_out'), run: signOut },
    ]);
  }

  async function signIn() {
    const { error } = await cloud.signIn();
    if (error) env.showNotice(t('workspace_sign_in_failed'));
  }
  async function signOut() {
    await cloud.signOut();
    await switchUser(null);
  }

  const downloadLocal = () => env.download('workspace-local.json', `${JSON.stringify(sync.localCopy() ?? app.ws, null, 2)}\n`);
  async function reloadCloud() {
    env.clearNotice();
    threads.clear();
    handleStart(await sync.reload());
  }
  async function downloadBackup() {
    const { data, error } = await cloud.listBackups();
    if (error) return env.showNotice(t('workspace_replace_failed', { reason: reason(error) }));
    if (!data?.length) return env.showToast(t('workspace_no_backup'));
    const backup = await cloud.getBackup(data[0].id);
    if (backup.error) return env.showNotice(t('workspace_replace_failed', { reason: reason(backup.error) }));
    env.download(`workspace-backup-r${data[0].revision}.json`, `${JSON.stringify(backup.data, null, 2)}\n`);
  }

  function onSyncStatus(status, detail) {
    renderStatus();
    if (!active) return;
    if (status === 'conflict') {
      env.showNotice(t('workspace_conflict_message', { revision: detail?.cloudRevision ?? '?' }), [], [
        { label: t('workspace_download_local'), run: downloadLocal },
        { label: t('workspace_reload_cloud'), run: reloadCloud },
      ]);
    } else if (status === 'failed' && ['session_expired', 'not_authenticated'].includes(detail?.code)) {
      env.showNotice(t('workspace_session_expired'), [], [{ label: t('workspace_sign_in'), run: signIn }, { label: t('workspace_download_local'), run: downloadLocal }]);
    } else if (status === 'failed') {
      env.showNotice(t('workspace_failed_message', { reason: reason(detail) }), [], [
        { label: t('workspace_retry'), run: () => { env.clearNotice(); sync.retry(); } },
        { label: t('workspace_download_local'), run: downloadLocal },
      ]);
    }
  }

  // Opens a document as the account workspace (never saves it by itself).
  function open(document) {
    const errors = validateWorkspace(document, context);
    if (errors.length) {
      active = false;
      env.showNotice(t('workspace_failed_message', { reason: reason({ code: 'invalid_document' }) }), errors);
      renderStatus();
      return false;
    }
    app.ws = normalize(structuredClone(document));
    app.selection = null;
    app.shelfView = null;
    threads.clear();
    active = true;
    app.refresh();
    renderStatus();
    return true;
  }

  function handleStart(result) {
    if (result.stale) return;
    if (result.blocked) {
      active = false;
      env.showNotice(t('workspace_blocked_message', { reason: reason(result.error) }), [], [{ label: t('workspace_retry'), run: () => { env.clearNotice(); switchUser(user, true); } }]);
      renderStatus();
    } else if (result.choose) {
      chooseFirstCopy();
    } else if (result.document && open(result.document) && result.conflict) {
      onSyncStatus('conflict', { cloudRevision: result.conflict.revision });
    }
  }

  function chooseFirstCopy() {
    const guest = env.loadGuest();
    const choice = (label, hint, run) => h('button', { class: 'ws-choice', onclick: () => { dialog.close(); run(); } }, h('strong', {}, label), h('span', {}, hint));
    const dialog = h('dialog', { class: 'ws-dialog', 'aria-labelledby': 'choice-title' },
      h('h2', { id: 'choice-title' }, t('workspace_choice_title')),
      h('p', {}, t('workspace_choice_body')),
      choice(t('workspace_choice_adopt'), t('workspace_choice_adopt_hint'), () => adopt(guest)),
      choice(t('workspace_choice_seed'), t('workspace_choice_seed_hint'), () => adopt(normalize(structuredClone(env.seed)))),
      h('button', { class: 'ws-link', onclick: () => { dialog.close(); signOut(); } }, t('workspace_sign_out')));
    // A choice is required: Esc does not leave the account half set up.
    dialog.addEventListener('cancel', (e) => e.preventDefault());
    dialog.addEventListener('close', () => dialog.remove());
    document.body.append(dialog);
    dialog.showModal();
  }

  async function adopt(document) {
    if (!open(document)) return;
    await sync.adopt(app.ws);
  }

  async function startPreferences() {
    const { preferences } = await prefs.start(env.preferences());
    if (preferences) env.applyPreferences(preferences);
  }

  // Signs into (or out of) an account. Caches and pending saves belong to one user only.
  async function switchUser(next, force = false) {
    if (!force && next?.id === user?.id) return;
    const hadPending = active && sync?.pending();
    sync?.stop();
    prefs?.stop();
    active = false;
    threads.clear();
    if (user && !next && hadPending) env.showNotice(t('workspace_session_expired'), [], [{ label: t('workspace_sign_in'), run: signIn }]);
    user = next;
    renderAccount();
    renderStatus();
    // The workspace stays hidden until the service confirms this account is an editor.
    if (!user) { env.lock({ kind: 'signed-out', signIn }); return; }
    env.lock({ kind: 'checking' });
    const access = await cloud.access();
    if (user?.id !== next.id) return;
    if (access.error) { env.lock({ kind: 'error', error: access.error, retry: () => switchUser(next, true), signOut }); return; }
    if (!access.data.editor) { env.lock({ kind: 'denied', name: access.data.name ?? user.name, handle: access.data.handle ?? '?', signOut }); return; }
    // Never leave one account's document open (and saved as the guest draft) while another loads.
    env.unlock();
    sync = createSync({ backend: cloud, storage, onStatus: onSyncStatus });
    prefs = createPreferenceSync({ backend: cloud });
    handleStart(await sync.start(user));
    startPreferences();
  }

  return {
    async start() {
      renderStatus();
      if (!cloudConfigured()) { renderAccount(); return; }
      try {
        cloud = await createCloud();
      } catch (error) {
        console.error(error);
        env.showNotice(t('workspace_cloud_unavailable'));
        env.lock({ kind: 'error', error: { code: 'offline' }, retry: () => location.reload() });
        return;
      }
      renderAccount();
      if (cloud.redirectError) env.showNotice(t('workspace_sign_in_failed'));
      cloud.onUserChange((next) => switchUser(next));
      if (cloud.user) await switchUser(cloud.user);
      else env.lock({ kind: 'signed-out', signIn });
    },
    cloud: () => cloud,
    user: () => user,
    active: () => active,
    t,
    reason,
    signIn,
    save() {
      if (active) sync.edit(app.ws);
      else guestSaved = saveDraft(storage, app.ws);
      renderStatus();
    },
    // Reset or replacing Import of the account copy. Resolves to null for the browser-only workspace.
    async replace(document, why) {
      if (!active) return null;
      if (sync.pending() || sync.status() !== 'saved') { env.showNotice(t('workspace_replace_unsynced')); return false; }
      if (!confirm(t(why === 'reset' ? 'workspace_replace_reset' : 'workspace_replace_import'))) return false;
      const { error } = await sync.replace(document, why);
      if (error) { env.showNotice(t('workspace_replace_failed', { reason: reason(error) })); return false; }
      open(document);
      env.showToast(t('workspace_replaced'));
      return true;
    },
    preferencesChanged(preferences) { if (active) prefs.save(preferences); },
    menuItems() {
      if (!cloud) return [];
      return user ? [] : [{ heading: t('workspace_account') }, { label: t('workspace_sign_in'), run: signIn }];
    },
    // The Share action for a screen, or for the whole project when frameId is null; null when it is not possible.
    shareAction(frameId) {
      if (!active || (frameId != null && !app.locate(frameId))) return null;
      const ready = sync.status() === 'saved' && !sync.pending();
      const label = frameId == null ? t('workspace_share_project_hint') : t('workspace_share');
      return { label: ready ? label : t('workspace_share_needs_save'), disabled: !ready, run: () => openShare(frameId) };
    },
    commentsView,
    statusText: () => statusEl.textContent,
  };

  function commentsView() {
    if (!cloud) return [];
    if (!user) return [h('p', { class: 'ws-hint' }, t('workspace_comments_guest')), h('button', { class: 'ws-primary', onclick: signIn }, t('workspace_sign_in'))];
    if (!active) return [h('p', { class: 'ws-hint' }, t(`workspace_status_${sync?.status() === 'blocked' ? 'blocked' : 'loading'}`))];
    const frameId = app.selection?.frameId;
    if (!frameId) return [h('p', { class: 'ws-hint' }, t('workspace_comments_select'))];
    const shelved = !app.locate(frameId);
    const key = `${frameId}:${shelved}`;
    if (!threads.has(key)) {
      threads.set(key, createThread({
        t, reason, language: () => app.ws.settings.language,
        load: () => cloud.listComments(null, frameId),
        post: ({ body, clientId }) => cloud.postComment({ frameId, body, clientId, viewedRevision: sync.revision() }),
        draftKey: `orbit.design.comment.${user.id}.${frameId}`,
        canPost: () => Boolean(app.locate(frameId)),
        emptyNote: shelved ? t('workspace_comments_shelved') : null,
      }));
    }
    return [threads.get(key).element()];
  }

  function openShare(frameId) {
    const project = frameId == null;
    const loc = project ? null : app.locate(frameId);
    if (!project && !loc) return;
    const name = project ? null : app.frameName(loc.frame);
    const body = h('div', { class: 'ws-share-body', 'aria-live': 'polite' });
    const footer = h('div', { class: 'ws-share-footer' });
    const close = () => dialog.close();
    const access = (glyph, who, can) => h('li', {}, h('span', { class: 'ws-share-icon' }, icon(glyph, 16)), h('span', {}, who), h('span', { class: 'ws-pill' }, can));
    const dialog = h('dialog', { class: 'ws-dialog ws-share', 'aria-labelledby': 'share-title' },
      h('header', { class: 'ws-share-head' },
        h('div', {},
          h('h2', { id: 'share-title' }, project ? t('workspace_share_project_title') : t('workspace_share_title', { name })),
          h('p', {}, t(project ? 'workspace_share_project_scope' : 'workspace_share_screen_scope'))),
        h('button', { class: 'ws-icon', 'aria-label': t('workspace_close'), title: t('workspace_close'), 'data-f': 'share-x', onclick: close }, icon('close', 18))),
      body,
      h('section', { class: 'ws-share-access', 'aria-labelledby': 'share-access' },
        h('h3', { id: 'share-access' }, t('workspace_share_access_title')),
        h('ul', {},
          access('language', t('workspace_share_anyone'), t('workspace_share_can_view')),
          access('comment', t('workspace_share_github'), t('workspace_share_can_comment')),
          access('edit', t('workspace_share_editors'), t('workspace_share_can_edit')))),
      footer);
    dialog.addEventListener('close', () => dialog.remove());
    const done = () => h('button', { class: 'ws-primary', 'data-f': 'share-close', onclick: close }, t('workspace_done'));
    const fail = (error) => body.append(h('p', { class: 'ws-error', role: 'alert' }, t('workspace_share_failed', { reason: reason(error) })));

    function showCreate(message = t('workspace_share_none')) {
      body.replaceChildren(h('div', { class: 'ws-share-empty' },
        h('p', { role: 'status' }, message),
        h('button', {
          class: 'ws-primary', 'data-f': 'share-create',
          onclick: async (e) => {
            e.currentTarget.disabled = true;
            const { data, error } = await cloud.createShare(frameId);
            if (error) { e.currentTarget.disabled = false; return fail(error); }
            showLink(data);
          },
        }, icon('link', 16), t('workspace_share_create'))));
      footer.replaceChildren(h('span'), done());
    }

    function showLink(token) {
      const url = reviewUrl(token);
      const input = h('input', { type: 'text', readOnly: true, value: url, 'data-f': 'share-url', 'aria-label': t(project ? 'workspace_share_link_project' : 'workspace_share_link'), onfocus: (e) => e.target.select() });
      let reset = 0;
      const copy = h('button', {
        class: 'ws-primary ws-copy', 'data-f': 'share-copy',
        onclick: async () => {
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            input.select();
            document.execCommand?.('copy');
          }
          copy.replaceChildren(icon('check', 16), t('workspace_share_copied_short'));
          copy.classList.add('is-done');
          clearTimeout(reset);
          reset = setTimeout(() => { copy.replaceChildren(icon('link', 16), t('workspace_share_copy')); copy.classList.remove('is-done'); }, 2000);
        },
      }, icon('link', 16), t('workspace_share_copy'));
      body.replaceChildren(
        h('label', { class: 'ws-share-label', for: 'share-url' }, t(project ? 'workspace_share_link_project' : 'workspace_share_link')),
        h('div', { class: 'ws-copy-field' }, Object.assign(input, { id: 'share-url' }), copy));
      footer.replaceChildren(
        h('button', {
          class: 'ws-text-danger', 'data-f': 'share-revoke',
          onclick: async (e) => {
            if (!confirm(t('workspace_share_revoke_confirm'))) return;
            e.currentTarget.disabled = true;
            const { error } = await cloud.revokeShare(token);
            // Only an acknowledged revocation is reported as done.
            if (error) { e.currentTarget.disabled = false; return fail(error); }
            showCreate(t('workspace_share_revoked'));
          },
        }, t('workspace_share_revoke')),
        done());
      copy.focus();
    }

    body.append(h('p', { class: 'ws-hint' }, t('workspace_loading')));
    footer.append(h('span'), done());
    document.body.append(dialog);
    dialog.showModal();
    cloud.listShares().then(({ data, error }) => {
      if (error) { showCreate(); fail(error); return; }
      const live = data.find((share) => (share.frame_id ?? null) === (frameId ?? null) && !share.revoked_at);
      if (live) showLink(live.token);
      else showCreate();
    });
  }
}
