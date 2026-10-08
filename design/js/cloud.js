// Supabase backend: GitHub sign-in and the design_* database functions from supabase/migrations.
// Every method resolves to { data } or { error: { code, message } } so callers never deal with provider errors.
import config from '../cloud.config.js';
import { classifyError } from './cloud-errors.js';

const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/+esm';
const RETURN_KEY = 'orbit.design.auth.return';

export const cloudConfigured = () => Boolean(config.url && config.anonKey);

const userOf = (session) => {
  const u = session?.user;
  if (!u) return null;
  const meta = u.user_metadata ?? {};
  return { id: u.id, name: meta.full_name || meta.name || meta.user_name || meta.preferred_username || 'Orbit user', avatarUrl: meta.avatar_url ?? null };
};

// Reads an OAuth error from the return URL (cancelled or denied sign-in) and removes the provider parameters.
function takeRedirectError() {
  const params = new URLSearchParams(location.search);
  const error = params.get('error_description') || params.get('error');
  if (!params.has('code') && !error) return null;
  return error ? { code: 'sign_in_failed', message: error } : null;
}
// Back from the OAuth provider: put back the page (e.g. a review link) the sign-in started from, keeping ?code for
// the session exchange. Runs before the workspace decides between review and workspace mode.
export function applyAuthReturn() {
  const params = new URLSearchParams(location.search);
  if (!params.has('code') && !params.has('error') && !params.has('error_description')) return;
  let hash = '';
  try { hash = sessionStorage.getItem(RETURN_KEY) ?? ''; sessionStorage.removeItem(RETURN_KEY); } catch { /* no session storage */ }
  if (hash && !location.hash) history.replaceState(null, '', `${location.pathname}${location.search}${hash}`);
}
function dropAuthParams() {
  if (location.search) history.replaceState(null, '', `${location.pathname}${location.hash}`);
}

export async function createCloud() {
  if (!cloudConfigured()) return null;
  const redirectError = takeRedirectError();
  const { createClient } = await import(SUPABASE_JS);
  const client = createClient(config.url, config.anonKey, {
    auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true, storageKey: 'orbit.design.auth' },
  });
  const { data: { session } } = await client.auth.getSession();
  dropAuthParams();

  const call = async (name, args = {}) => {
    try {
      const { data, error } = await client.rpc(name, args);
      return error ? { error: classifyError(error) } : { data };
    } catch (error) {
      return { error: classifyError(error) };
    }
  };
  const row = (result) => (result.error ? result : { data: result.data?.[0] ?? null });
  const revisionRow = (result) => {
    const r = row(result);
    return r.error || !r.data ? r : { data: { revision: r.data.revision, generation: r.data.generation, updatedAt: r.data.updated_at } };
  };

  return {
    redirectError,
    user: userOf(session),
    onUserChange(callback) {
      client.auth.onAuthStateChange((event, next) => {
        if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'INITIAL_SESSION'].includes(event)) callback(userOf(next), event);
      });
    },
    async signIn() {
      try { sessionStorage.setItem(RETURN_KEY, location.hash); } catch { /* the return falls back to the workspace */ }
      const { error } = await client.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${location.origin}${location.pathname}` } });
      return error ? { error: { code: 'sign_in_failed', message: error.message } } : { data: true };
    },
    async signOut() {
      const { error } = await client.auth.signOut({ scope: 'local' });
      return error ? { error: classifyError(error) } : { data: true };
    },
    access: () => call('design_access'),
    async loadWorkspace() {
      const r = row(await call('design_load_workspace'));
      if (r.error || !r.data) return r;
      return { data: { document: r.data.document, revision: r.data.revision, generation: r.data.generation, updatedAt: r.data.updated_at } };
    },
    saveWorkspace: async (document, baseRevision) => revisionRow(await call('design_save_workspace', { p_document: document, p_base_revision: baseRevision })),
    replaceWorkspace: async (document, baseRevision, reason) => revisionRow(await call('design_replace_workspace', { p_document: document, p_base_revision: baseRevision, p_reason: reason })),
    listBackups: () => call('design_list_backups'),
    getBackup: (id) => call('design_get_backup', { p_id: id }),
    getProfile: async () => row(await call('design_get_profile')),
    savePreferences: (preferences) => call('design_save_preferences', { p_preferences: preferences }),
    createShare: (frameId) => call('design_create_share', { p_frame_id: frameId }),
    revokeShare: (token) => call('design_revoke_share', { p_token: token }),
    listShares: () => call('design_list_shares'),
    getSharedFrame: (token) => call('design_get_shared_frame', { p_token: token }),
    listComments: (token, frameId = null) => call('design_list_comments', { p_token: token, p_frame_id: frameId }),
    postComment: ({ token = null, frameId = null, body, clientId, viewedRevision = null }) => call('design_post_comment', {
      p_token: token, p_frame_id: frameId, p_body: body, p_client_id: clientId, p_viewed_revision: viewedRevision,
    }),
  };
}
