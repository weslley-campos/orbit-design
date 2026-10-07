// Supabase project used for sign-in, cloud saving and screen review (docs/specs/workspace-auth-sharing.md).
// Leave both empty to keep the workspace browser-only. The anon key is meant to be public: the database
// functions in supabase/migrations check the signed-in user or the share link on every request.
export default {
  url: '',
  anonKey: '',
};
