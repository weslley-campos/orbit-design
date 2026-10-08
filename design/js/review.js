// Review page for a share link (#/review/<token>): one screen, or the whole project (live pages only), as last saved,
// with comments per screen.
// It never loads or saves the viewer's own workspace, so reviewing cannot change anyone's saved work.
import { cloudConfigured, createCloud } from './cloud.js';
import { createThread } from './comments.js';
import { h, kids } from './dom.js';
import { normalize } from './store.js';

export const reviewToken = () => location.hash.match(/^#\/review\/([0-9a-f]{64})$/)?.[1] ?? null;

// A throwaway in-memory workspace holding only the shared screen; the page is read-only on the canvas.
export function reviewWorkspace(payload) {
  return normalize({
    version: 1,
    settings: { ...payload.settings },
    selectedPageId: 'review',
    startFrameId: null,
    pages: [{ id: 'review', name: 'Review', platform: payload.platform ?? undefined, readOnly: true, view: { x: 80, y: 80, zoom: 1 }, frames: [{ ...payload.frame, x: 0, y: 0 }] }],
    connections: [],
    overrides: payload.overrides,
  });
}

// A project link: the shared pages, read-only, with their prototype links (Play works).
export function projectWorkspace(payload) {
  const ws = normalize(structuredClone(payload.document));
  for (const page of ws.pages) page.readOnly = true;
  if (!ws.pages.some((page) => page.id === ws.selectedPageId)) ws.selectedPageId = ws.pages[0]?.id ?? null;
  return ws;
}

export function createReview(app, env, token) {
  const { t } = env;
  let cloud = null;
  let user = null;
  let payload = null;
  let error = null;
  let thread = null;
  const threads = new Map(); // project links: one thread per screen
  const isProject = () => payload?.kind === 'project';
  const reason = (failure) => {
    const key = `workspace_reason_${failure?.code}`;
    const text = t(key);
    return text === key ? failure?.message ?? t('workspace_reason_error') : text;
  };
  const signIn = async () => { const r = await cloud.signIn(); if (r.error) env.showNotice(t('workspace_sign_in_failed')); };

  async function load() {
    const { data, error: failure } = await cloud.getSharedFrame(token);
    error = failure ?? null;
    payload = data ?? null;
    thread = null;
    threads.clear();
    const settings = app.ws.settings; // keep the shared screen's language when it becomes unavailable
    const keepPage = app.ws.selectedPageId;
    app.ws = !payload ? Object.assign(env.emptyWorkspace(), { settings }) : isProject() ? projectWorkspace(payload) : reviewWorkspace(payload);
    if (isProject() && app.ws.pages.some((page) => page.id === keepPage)) app.ws.selectedPageId = keepPage;
    app.selection = payload && !isProject() ? { frameId: payload.frame.id, key: null } : null;
    for (const id of ['play', 'play-mini']) document.getElementById(id).hidden = !isProject();
    app.refresh();
    if (payload) app.canvas.fit();
  }

  function errorText() {
    if (!error) return null;
    if (error.code === 'needs_cloud') return t('workspace_review_needs_cloud');
    if (error.code === 'link_unavailable') return t('workspace_review_link_unavailable');
    if (error.code === 'screen_unavailable') return t('workspace_review_screen_unavailable');
    return t('workspace_review_failed', { reason: reason(error) });
  }

  return {
    async start() {
      if (!cloudConfigured()) { error = { code: 'needs_cloud' }; app.refresh(); return; }
      try {
        cloud = await createCloud();
      } catch (failure) {
        console.error(failure);
        error = { code: 'offline', message: String(failure) };
        app.refresh();
        return;
      }
      if (cloud.redirectError) env.showNotice(t('workspace_sign_in_failed'));
      user = cloud.user;
      cloud.onUserChange((next) => {
        if (next?.id === user?.id) return;
        user = next;
        thread = null;
        threads.clear();
        env.renderAccount();
        app.inspector.render();
      });
      env.renderAccount();
      await load();
    },
    refresh: () => load(),
    user: () => user,
    cloud: () => cloud,
    signIn,
    signOut: async () => { await cloud.signOut(); },
    sidebarView() {
      const message = errorText();
      if (!payload) {
        return kids([
          h('h2', {}, t('workspace_review')),
          h('p', { class: message ? 'ws-error' : 'ws-hint', role: message ? 'alert' : 'status' }, message ?? t('workspace_review_loading')),
          cloud && h('div', { class: 'ws-inline ws-actions' },
            h('button', { 'data-f': 'review-refresh', onclick: () => load() }, t('workspace_review_refresh')),
            h('a', { class: 'ws-link', href: location.pathname }, t('workspace_review_open_workspace'))),
        ]);
      }
      const page = app.page();
      const row = (selected, label, onclick, f) => h('li', { class: selected ? 'ws-row is-selected' : 'ws-row' },
        h('button', { class: 'ws-row-main', 'data-f': f, 'aria-current': selected ? 'true' : null, onclick }, label));
      return kids([
        h('h2', {}, t('workspace_review')),
        h('h3', {}, isProject() ? t('workspace_review_project') : app.frameName(payload.frame)),
        h('p', { class: 'ws-hint' }, t('workspace_review_shared_by', { name: payload.ownerName ?? '—' })),
        h('p', { class: 'ws-hint' }, t('workspace_comment_revision', { revision: payload.revision })),
        h('div', { class: 'ws-inline ws-actions' },
          h('button', { 'data-f': 'review-refresh', onclick: () => load() }, t('workspace_review_refresh')),
          h('a', { class: 'ws-link', href: location.pathname }, t('workspace_review_open_workspace'))),
        isProject() && [
          h('h2', {}, t('workspace_review_pages')),
          h('ul', { class: 'ws-rows' }, ...app.ws.pages.map((p) => row(p.id === page?.id, p.name, () => {
            app.ws.selectedPageId = p.id;
            app.selection = null;
            app.refresh();
            app.canvas.fit();
          }, `review-page-${p.id}`))),
          h('h2', {}, t('workspace_review_screens')),
          page && h('ul', { class: 'ws-rows' }, ...page.frames.map((frame) => row(app.selection?.frameId === frame.id,
            [h('span', { class: 'ws-glyph', 'aria-hidden': 'true' }), h('span', { class: 'ws-row-name' }, app.frameName(frame))],
            () => app.select({ frameId: frame.id, key: null }), `review-frame-${frame.id}`))),
        ],
      ]);
    },
    commentsView() {
      if (!payload) return [h('p', { class: error ? 'ws-error' : 'ws-hint' }, errorText() ?? t('workspace_review_loading'))];
      if (isProject()) {
        const frameId = app.selection?.frameId;
        const frame = frameId && app.locate(frameId)?.frame;
        if (!frame) return [h('h3', {}, t('workspace_review_project')), h('p', { class: 'ws-hint' }, t('workspace_comments_select'))];
        if (!threads.has(frameId)) {
          threads.set(frameId, createThread({
            t, reason, language: () => app.ws.settings.language,
            load: () => cloud.listComments(token, frameId),
            post: ({ body, clientId }) => cloud.postComment({ token, frameId, body, clientId, viewedRevision: payload.revision }),
            draftKey: `orbit.design.comment.review.${token}.${frameId}`,
            canPost: () => Boolean(user),
            signIn: user ? null : signIn,
          }));
        }
        return [h('h3', {}, app.frameName(frame)), threads.get(frameId).element()];
      }
      thread ??= createThread({
        t, reason, language: () => app.ws.settings.language,
        load: () => cloud.listComments(token),
        post: ({ body, clientId }) => cloud.postComment({ token, body, clientId, viewedRevision: payload.revision }),
        draftKey: `orbit.design.comment.review.${token}`,
        canPost: () => Boolean(user),
        signIn: user ? null : signIn,
      });
      return [thread.element()];
    },
    emptyText: () => errorText() ?? t('workspace_review_loading'),
  };
}
