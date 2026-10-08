-- Editors: only accounts listed in design_editors can open, save, share and comment on their own workspace.
-- Anyone else (signed in or not) only reaches screens through a share link, as before.
-- Add an editor in the SQL editor (or the Table Editor), e.g. by GitHub login:
--   insert into public.design_editors (user_id)
--   select user_id from auth.identities where provider = 'github' and identity_data ->> 'user_name' = 'weslley-campos';

create table if not exists public.design_editors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.design_editors enable row level security;
revoke all on public.design_editors from public, anon, authenticated;

create or replace function public.design_editor_uid() returns uuid
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare uid uuid := design_uid();
begin
  if not exists (select 1 from design_editors e where e.user_id = uid) then
    raise exception 'not_editor' using errcode = 'P0001';
  end if;
  return uid;
end $$;

-- What the signed-in account may do; the workspace asks this before showing anything.
create or replace function public.design_access() returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := design_uid();
begin
  perform design_ensure_profile(uid);
  return jsonb_build_object(
    'editor', exists (select 1 from design_editors e where e.user_id = uid),
    'name', (select p.display_name from design_profiles p where p.id = uid),
    'handle', (select p.handle from design_profiles p where p.id = uid));
end $$;

-- The owner-side functions now require an editor.
create or replace function public.design_load_workspace()
returns table (document jsonb, revision integer, generation uuid, updated_at timestamptz)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  return query select w.document, w.revision, w.generation, w.updated_at from design_workspaces w where w.owner = design_editor_uid();
end $$;

create or replace function public.design_save_workspace(p_document jsonb, p_base_revision integer)
returns table (revision integer, generation uuid, updated_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := design_editor_uid();
  existing design_workspaces;
begin
  perform design_validate_document(p_document);
  select * into existing from design_workspaces w where w.owner = uid for update;
  if not found then
    if p_base_revision is not null then raise exception 'stale_revision' using errcode = 'P0001', detail = 'none'; end if;
    perform design_ensure_profile(uid);
    return query insert into design_workspaces as w (owner, document) values (uid, p_document) returning w.revision, w.generation, w.updated_at;
    return;
  end if;
  if p_base_revision is distinct from existing.revision then
    raise exception 'stale_revision' using errcode = 'P0001', detail = existing.revision::text;
  end if;
  return query update design_workspaces w set document = p_document, revision = w.revision + 1, updated_at = now()
    where w.owner = uid returning w.revision, w.generation, w.updated_at;
end $$;

create or replace function public.design_replace_workspace(p_document jsonb, p_base_revision integer, p_reason text)
returns table (revision integer, generation uuid, updated_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := design_editor_uid();
  existing design_workspaces;
begin
  perform design_validate_document(p_document);
  if p_reason not in ('reset', 'import') then raise exception 'invalid_reason'; end if;
  select * into existing from design_workspaces w where w.owner = uid for update;
  if not found then raise exception 'stale_revision' using errcode = 'P0001', detail = 'none'; end if;
  if p_base_revision is distinct from existing.revision then
    raise exception 'stale_revision' using errcode = 'P0001', detail = existing.revision::text;
  end if;
  insert into design_workspace_backups (owner, document, revision, generation, reason)
    values (uid, existing.document, existing.revision, existing.generation, p_reason);
  delete from design_workspace_backups b where b.owner = uid and b.id not in (
    select b2.id from design_workspace_backups b2 where b2.owner = uid order by b2.created_at desc, b2.id desc limit 20);
  return query update design_workspaces w
    set document = p_document, revision = w.revision + 1, generation = gen_random_uuid(), updated_at = now()
    where w.owner = uid returning w.revision, w.generation, w.updated_at;
end $$;

create or replace function public.design_list_backups()
returns table (id bigint, revision integer, reason text, created_at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  select b.id, b.revision, b.reason, b.created_at from design_workspace_backups b where b.owner = design_editor_uid() order by b.created_at desc, b.id desc
$$;

create or replace function public.design_get_backup(p_id bigint) returns jsonb
language sql stable security definer set search_path = public, pg_temp as $$
  select b.document from design_workspace_backups b where b.owner = design_editor_uid() and b.id = p_id
$$;

create or replace function public.design_save_preferences(p_preferences jsonb) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := design_editor_uid();
begin
  if jsonb_typeof(p_preferences) is distinct from 'object'
    or (p_preferences - 'theme' - 'panels') <> '{}'::jsonb
    or not (p_preferences -> 'theme' is null or p_preferences -> 'theme' in ('"system"', '"light"', '"dark"'))
    or not (p_preferences -> 'panels' is null or (jsonb_typeof(p_preferences -> 'panels') = 'object'
      and ((p_preferences -> 'panels') - 'left' - 'right') = '{}'::jsonb
      and design_is_optional(p_preferences -> 'panels' -> 'left', 'boolean')
      and design_is_optional(p_preferences -> 'panels' -> 'right', 'boolean'))) then
    raise exception 'invalid_preferences';
  end if;
  perform design_ensure_profile(uid);
  update design_profiles p set preferences = p_preferences, updated_at = now() where p.id = uid;
  return p_preferences;
end $$;

create or replace function public.design_create_share(p_frame_id text) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := design_editor_uid();
  ws design_workspaces;
  existing text;
  new_token text;
begin
  select * into ws from design_workspaces w where w.owner = uid;
  if not found or design_live_frame(ws.document, p_frame_id) is null then raise exception 'frame_not_live'; end if;
  select s.token into existing from design_shares s
    where s.owner = uid and s.generation = ws.generation and s.frame_id = p_frame_id and s.revoked_at is null
    order by s.created_at desc limit 1;
  if existing is not null then return existing; end if;
  new_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into design_shares (token, owner, generation, frame_id) values (new_token, uid, ws.generation, p_frame_id);
  return new_token;
end $$;

create or replace function public.design_revoke_share(p_token text) returns timestamptz
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := design_editor_uid();
  revoked timestamptz;
begin
  update design_shares s set revoked_at = coalesce(s.revoked_at, now())
    where s.token = p_token and s.owner = uid returning s.revoked_at into revoked;
  if revoked is null then raise exception 'not_found' using errcode = 'P0002'; end if;
  return revoked;
end $$;

create or replace function public.design_list_shares()
returns table (token text, frame_id text, created_at timestamptz, revoked_at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  select s.token, s.frame_id, s.created_at, s.revoked_at
  from design_shares s join design_workspaces w on w.owner = s.owner and w.generation = s.generation
  where s.owner = design_editor_uid()
  order by s.created_at desc
$$;

create or replace function public.design_list_comments(p_token text, p_frame_id text default null) returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  viewer uuid := auth.uid();
  owner_id uuid;
  gen uuid;
  target text;
  opened record;
begin
  if p_token is not null then
    select * into opened from design_open_share(p_token);
    owner_id := (opened.share).owner; gen := (opened.share).generation; target := (opened.share).frame_id;
  else
    owner_id := design_editor_uid();
    select w.generation into gen from design_workspaces w where w.owner = owner_id;
    target := p_frame_id;
  end if;
  return coalesce((select jsonb_agg(design_comment_json(c, viewer) order by c.created_at, c.id)
    from design_comments c where c.owner = owner_id and c.generation = gen and c.frame_id = target), '[]'::jsonb);
end $$;

create or replace function public.design_post_comment(p_token text, p_frame_id text, p_body text, p_client_id uuid, p_viewed_revision integer default null)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := design_uid();
  body text := btrim(coalesce(p_body, ''));
  owner_id uuid;
  gen uuid;
  target text;
  current_revision integer;
  ws design_workspaces;
  opened record;
  saved design_comments;
begin
  if char_length(body) < 1 or char_length(body) > 2000 then raise exception 'invalid_body' using errcode = '22023'; end if;
  if p_client_id is null then raise exception 'invalid_client_id' using errcode = '22023'; end if;
  select * into saved from design_comments c where c.author = uid and c.client_id = p_client_id;
  if found then return design_comment_json(saved, uid); end if;
  if p_token is not null then
    select * into opened from design_open_share(p_token);
    owner_id := (opened.share).owner; gen := (opened.share).generation; target := (opened.share).frame_id;
    current_revision := (opened.ws).revision;
  else
    perform design_editor_uid();
    select * into ws from design_workspaces w where w.owner = uid;
    if not found or design_live_frame(ws.document, p_frame_id) is null then raise exception 'screen_unavailable' using errcode = 'P0002'; end if;
    owner_id := uid; gen := ws.generation; target := p_frame_id; current_revision := ws.revision;
  end if;
  perform design_ensure_profile(uid);
  insert into design_comments (owner, generation, frame_id, author, body, revision, client_id)
    values (owner_id, gen, target, uid, body, least(greatest(coalesce(p_viewed_revision, current_revision), 1), current_revision), p_client_id)
    on conflict (author, client_id) do nothing;
  select * into saved from design_comments c where c.author = uid and c.client_id = p_client_id;
  return design_comment_json(saved, uid);
end $$;

revoke all on function public.design_editor_uid(), public.design_access() from public, anon, authenticated;
grant execute on function public.design_access() to authenticated;
