import { h, kids } from './dom.js';
import { icon } from './icons.js';

export const MAX_COMMENT = 2000;
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)));

// A comment thread for one screen. `load()` and `post({ body, clientId })` resolve to { data } or { error: { code } }.
// The draft and its client id live in sessionStorage under draftKey, so a failed post or a sign-in round trip keeps
// the text, and a retry reuses the id so the service stores the comment once.
export function createThread({ t, reason, load, post, draftKey, canPost, signIn, language, emptyNote = null }) {
  let comments = [];
  let state = 'loading';
  let error = null;
  let submitting = false;
  let postError = null;
  let draft = { body: '', clientId: newId() };
  try { draft = { ...draft, ...JSON.parse(sessionStorage.getItem(draftKey)) }; } catch { /* no saved draft */ }
  const keep = () => { try { if (draft.body) sessionStorage.setItem(draftKey, JSON.stringify(draft)); else sessionStorage.removeItem(draftKey); } catch { /* best effort */ } };

  const root = h('section', { class: 'ws-thread', 'aria-label': t('workspace_comments') });
  const list = h('ol', { class: 'ws-comments', 'aria-live': 'polite' });
  const live = h('p', { class: 'ws-sr', role: 'status' });
  const when = (iso) => {
    try { return new Intl.DateTimeFormat(language(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)); } catch { return iso; }
  };
  const avatar = (author) => (author.avatarUrl
    ? h('img', { class: 'ws-avatar', src: author.avatarUrl, alt: '', width: 28, height: 28, referrerPolicy: 'no-referrer' })
    : h('span', { class: 'ws-avatar', 'aria-hidden': 'true' }, (author.name || '?').trim()[0]?.toUpperCase() ?? '?'));

  function renderList() {
    if (state === 'loading') return list.replaceChildren(h('li', { class: 'ws-hint' }, t('workspace_loading')));
    if (state === 'error') return list.replaceChildren(h('li', { class: 'ws-error', role: 'alert' }, t('workspace_comments_error', { reason: reason(error) })));
    if (!comments.length) return list.replaceChildren(h('li', { class: 'ws-hint' }, emptyNote ?? t('workspace_comments_empty')));
    list.replaceChildren(...comments.map((c) => h('li', { class: 'ws-comment' },
      avatar(c.author),
      h('div', { class: 'ws-comment-main' },
        h('div', { class: 'ws-comment-meta' },
          h('strong', {}, c.mine ? `${c.author.name} (${t('workspace_comment_you')})` : c.author.name),
          c.author.handle ? h('span', {}, `@${c.author.handle}`) : null,
          h('time', { dateTime: c.createdAt }, when(c.createdAt)),
          h('span', {}, t('workspace_comment_revision', { revision: c.revision }))),
        // Plain text only: the body is a text node, never markup.
        h('p', { class: 'ws-comment-body' }, c.body)))));
  }

  const textarea = h('textarea', {
    class: 'ws-comment-input', rows: 3, 'data-f': `comment-${draftKey}`, 'aria-label': t('workspace_comment_label'), placeholder: t('workspace_comment_label'),
    value: draft.body,
    oninput: (e) => { draft.body = e.target.value; postError = null; keep(); renderComposer(); },
    onkeydown: (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); } },
  });
  const counter = h('span', { class: 'ws-count-text' });
  const button = h('button', { class: 'ws-primary', 'data-f': `comment-post-${draftKey}`, onclick: () => (!canPost() && signIn ? signIn() : submit()) });
  const message = h('p', { class: 'ws-error', role: 'alert' });
  const hint = h('p', { class: 'ws-hint' }, t('workspace_comment_sign_in'));
  const composer = h('div', { class: 'ws-composer' }, hint, textarea, h('div', { class: 'ws-composer-row' }, counter, button), message);

  function renderComposer() {
    const length = draft.body.trim().length;
    counter.textContent = t('workspace_comment_count', { count: draft.body.trim().length });
    counter.classList.toggle('is-over', length > MAX_COMMENT);
    // Guests can write first: the draft survives the sign-in round trip and is posted afterwards.
    const guest = !canPost() && signIn;
    button.textContent = guest ? t('workspace_sign_in') : submitting ? t('workspace_comment_posting') : t('workspace_comment_post');
    button.disabled = !guest && (submitting || length < 1 || length > MAX_COMMENT);
    hint.hidden = !guest;
    textarea.disabled = submitting;
    message.textContent = postError ? t('workspace_comment_failed', { reason: reason(postError) }) : length > MAX_COMMENT ? t('workspace_comment_too_long') : '';
  }

  async function submit() {
    const body = draft.body.trim();
    if (submitting || body.length < 1 || body.length > MAX_COMMENT) return;
    submitting = true;
    postError = null;
    renderComposer();
    const { data, error: failure } = await post({ body, clientId: draft.clientId });
    submitting = false;
    if (failure) {
      postError = failure;
    } else {
      if (!comments.some((c) => c.id === data.id)) comments.push(data);
      state = 'ready';
      draft = { body: '', clientId: newId() };
      textarea.value = '';
      keep();
      live.textContent = t('workspace_comments');
      renderList();
    }
    renderComposer();
    if (!failure) textarea.focus();
  }

  async function refresh() {
    state = comments.length ? state : 'loading';
    renderList();
    const { data, error: failure } = await load();
    if (failure) { state = 'error'; error = failure; } else { state = 'ready'; comments = data ?? []; }
    renderList();
  }

  function render() {
    const footer = canPost() || signIn ? composer : null;
    root.replaceChildren(...kids([
      h('div', { class: 'ws-thread-head' }, h('h4', {}, t('workspace_comments')),
        h('button', { class: 'ws-icon', 'aria-label': t('workspace_comments_refresh'), title: t('workspace_comments_refresh'), onclick: refresh }, icon('restore', 16))),
      list, live, footer,
    ]));
    renderList();
    renderComposer();
    return root;
  }

  refresh();
  return { element: () => render(), refresh };
}
