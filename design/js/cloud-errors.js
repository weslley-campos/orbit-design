// Maps Supabase/PostgREST errors and the design_* functions' messages to the codes the workspace reacts to.
const KNOWN = new Set([
  'not_authenticated', 'stale_revision', 'invalid_document', 'invalid_preferences', 'invalid_reason', 'frame_not_live',
  'link_unavailable', 'screen_unavailable', 'invalid_body', 'invalid_client_id', 'not_found',
]);

export function classifyError(error) {
  if (!error) return null;
  const message = String(error.message ?? error);
  const code = message.split(':')[0].trim();
  if (KNOWN.has(code)) {
    const revision = code === 'stale_revision' && /^\d+$/.test(error.details ?? '') ? Number(error.details) : null;
    return { code, message, revision };
  }
  if (/^PGRST30/.test(error.code ?? '') || /jwt/i.test(message)) return { code: 'session_expired', message };
  if (error.code === '42501') return { code: 'not_authenticated', message };
  if (!error.code && /fetch|network|load failed|offline/i.test(message)) return { code: 'offline', message };
  return { code: 'error', message };
}
