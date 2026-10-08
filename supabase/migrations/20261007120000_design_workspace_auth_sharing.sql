-- Orbit design workspace: one private workspace per account, profile preferences, screen shares and comments.
-- Spec: docs/specs/workspace-auth-sharing.md. Every client call goes through the functions below; the tables
-- grant nothing to anon or authenticated, so ownership and link access are checked on every request.

create table if not exists public.design_workspaces (
  owner uuid primary key references auth.users (id) on delete cascade,
  document jsonb not null,
  revision integer not null default 1 check (revision > 0),
  -- A new generation (Reset, replacing Import) invalidates every older share and comment thread.
  generation uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now()
);

create table if not exists public.design_workspace_backups (
  id bigint generated always as identity primary key,
  owner uuid not null references auth.users (id) on delete cascade,
  document jsonb not null,
  revision integer not null,
  generation uuid not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index if not exists design_workspace_backups_owner on public.design_workspace_backups (owner, created_at desc);

create table if not exists public.design_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Orbit user',
  -- GitHub login: unique, so two people with the same display name stay distinguishable.
  handle text,
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.design_shares (
  token text primary key check (token ~ '^[0-9a-f]{64}$'),
  owner uuid not null references auth.users (id) on delete cascade,
  generation uuid not null,
  frame_id text not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists design_shares_owner on public.design_shares (owner, generation, frame_id);

create table if not exists public.design_comments (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users (id) on delete cascade,
  generation uuid not null,
  frame_id text not null,
  author uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000 and body = btrim(body)),
  revision integer not null,
  client_id uuid not null,
  created_at timestamptz not null default now(),
  unique (author, client_id)
);
create index if not exists design_comments_thread on public.design_comments (owner, generation, frame_id, created_at);

alter table public.design_workspaces enable row level security;
alter table public.design_workspace_backups enable row level security;
alter table public.design_profiles enable row level security;
alter table public.design_shares enable row level security;
alter table public.design_comments enable row level security;
revoke all on public.design_workspaces, public.design_workspace_backups, public.design_profiles, public.design_shares, public.design_comments
  from public, anon, authenticated;

-- Helpers ------------------------------------------------------------------------------------------------

create or replace function public.design_uid() returns uuid
language plpgsql stable set search_path = public, pg_temp as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  return uid;
end $$;

create or replace function public.design_is_number(value jsonb) returns boolean
language sql immutable as $$ select coalesce(jsonb_typeof(value) = 'number', false) $$;

create or replace function public.design_is_text(value jsonb) returns boolean
language sql immutable as $$ select coalesce(jsonb_typeof(value) = 'string' and value #>> '{}' <> '', false) $$;

create or replace function public.design_is_optional(value jsonb, kind text) returns boolean
language sql immutable as $$ select value is null or jsonb_typeof(value) in ('null', kind) $$;

-- Structural validation of a version-1 workspace document, including frames, connections and overrides nested in shelf items.
-- The browser runs the full catalog-aware validation; this guards the service boundary.
create or replace function public.design_validate_document(doc jsonb) returns void
language plpgsql immutable set search_path = public, pg_temp as $$
declare
  page jsonb;
  frame jsonb;
  item jsonb;
  conn jsonb;
  shelf text;
  ids text[] := '{}';
  live text[] := '{}';
  conn_ids text[] := '{}';
  problem text;
begin
  if jsonb_typeof(doc) is distinct from 'object' then raise exception 'invalid_document: not an object'; end if;
  if octet_length(doc::text) > 4000000 then raise exception 'invalid_document: larger than 4 MB'; end if;
  if doc -> 'version' is distinct from '1'::jsonb then raise exception 'invalid_document: version must be 1'; end if;
  if jsonb_typeof(doc -> 'settings') is distinct from 'object'
    or not design_is_text(doc -> 'settings' -> 'palette') or not design_is_text(doc -> 'settings' -> 'mode')
    or not design_is_text(doc -> 'settings' -> 'language') then
    raise exception 'invalid_document: settings need palette, mode and language';
  end if;
  if jsonb_typeof(doc -> 'pages') is distinct from 'array' then raise exception 'invalid_document: pages must be an array'; end if;
  if not design_is_optional(doc -> 'overrides', 'object') then raise exception 'invalid_document: overrides must be an object'; end if;

  for page in select * from jsonb_array_elements(doc -> 'pages') loop
    if jsonb_typeof(page) is distinct from 'object' or not design_is_text(page -> 'id') or jsonb_typeof(page -> 'frames') is distinct from 'array' then
      raise exception 'invalid_document: a page needs an id and a frames array';
    end if;
    for frame in select * from jsonb_array_elements(page -> 'frames') loop
      problem := design_frame_problem(frame);
      if problem is not null then raise exception 'invalid_document: %', problem; end if;
      if frame ->> 'id' = any (ids) then raise exception 'invalid_document: duplicate frame id %', frame ->> 'id'; end if;
      ids := ids || (frame ->> 'id');
      live := live || (frame ->> 'id');
    end loop;
  end loop;

  if not design_is_optional(doc -> 'connections', 'array') then raise exception 'invalid_document: connections must be an array'; end if;
  for conn in select * from jsonb_array_elements(coalesce(doc -> 'connections', '[]'::jsonb)) loop
    problem := design_connection_problem(conn);
    if problem is not null then raise exception 'invalid_document: %', problem; end if;
    if conn ->> 'id' = any (conn_ids) then raise exception 'invalid_document: duplicate connection id %', conn ->> 'id'; end if;
    conn_ids := conn_ids || (conn ->> 'id');
    if not (conn -> 'from' ->> 'frameId' = any (live) and conn -> 'to' ->> 'frameId' = any (live)) then
      raise exception 'invalid_document: connection % refers to a frame that is not on a page', conn ->> 'id';
    end if;
  end loop;
  if doc ? 'startFrameId' and jsonb_typeof(doc -> 'startFrameId') <> 'null' and not (doc ->> 'startFrameId' = any (live)) then
    raise exception 'invalid_document: startFrameId is not a frame';
  end if;

  foreach shelf in array array['archived', 'trash'] loop
    if not design_is_optional(doc -> shelf, 'array') then raise exception 'invalid_document: % must be an array', shelf; end if;
    for item in select * from jsonb_array_elements(coalesce(doc -> shelf, '[]'::jsonb)) loop
      if jsonb_typeof(item) is distinct from 'object' then raise exception 'invalid_document: an item in % is not an object', shelf; end if;
      problem := design_frame_problem(item -> 'frame');
      if problem is not null then raise exception 'invalid_document: % in %', problem, shelf; end if;
      if item -> 'frame' ->> 'id' = any (ids) then raise exception 'invalid_document: duplicate frame id % in %', item -> 'frame' ->> 'id', shelf; end if;
      ids := ids || (item -> 'frame' ->> 'id');
      if not (design_is_optional(item -> 'pageId', 'string') and design_is_optional(item -> 'pageName', 'string')
        and design_is_optional(item -> 'index', 'number') and design_is_optional(item -> 'platform', 'string')
        and design_is_optional(item -> 'start', 'boolean') and design_is_optional(item -> 'at', 'string')
        and design_is_optional(item -> 'overrides', 'object') and design_is_optional(item -> 'connections', 'array')) then
        raise exception 'invalid_document: frame % in % has invalid metadata', item -> 'frame' ->> 'id', shelf;
      end if;
      for conn in select * from jsonb_array_elements(coalesce(item -> 'connections', '[]'::jsonb)) loop
        problem := design_connection_problem(conn);
        if problem is not null then raise exception 'invalid_document: % of frame % in %', problem, item -> 'frame' ->> 'id', shelf; end if;
      end loop;
    end loop;
  end loop;
end $$;

create or replace function public.design_frame_problem(frame jsonb) returns text
language sql immutable as $$
  select case
    when jsonb_typeof(frame) is distinct from 'object' or not public.design_is_text(frame -> 'id') then 'a frame has no id'
    when not public.design_is_text(frame -> 'catalogId') then format('frame %s has no catalogId', frame ->> 'id')
    when not (public.design_is_number(frame -> 'x') and public.design_is_number(frame -> 'y')
      and public.design_is_number(frame -> 'width') and public.design_is_number(frame -> 'height')
      and (frame ->> 'width')::numeric > 0 and (frame ->> 'height')::numeric > 0) then format('frame %s has an invalid position or size', frame ->> 'id')
  end
$$;

create or replace function public.design_connection_problem(conn jsonb) returns text
language sql immutable as $$
  select case
    when jsonb_typeof(conn) is distinct from 'object' or not public.design_is_text(conn -> 'id') then 'a connection has no id'
    when jsonb_typeof(conn -> 'from') is distinct from 'object' or not public.design_is_text(conn -> 'from' -> 'frameId')
      or jsonb_typeof(conn -> 'to') is distinct from 'object' or not public.design_is_text(conn -> 'to' -> 'frameId')
      or not public.design_is_optional(conn -> 'from' -> 'hotspotId', 'string') then format('connection %s has invalid endpoints', conn ->> 'id')
    when conn -> 'trigger' is distinct from '"click"'::jsonb then format('connection %s has an unsupported trigger', conn ->> 'id')
  end
$$;

-- The frame (and its page platform) when it sits on a page, not in a shelf.
create or replace function public.design_live_frame(doc jsonb, frame_id text) returns jsonb
language sql immutable as $$
  select jsonb_build_object('frame', f.frame, 'platform', p.page -> 'platform')
  from jsonb_array_elements(doc -> 'pages') as p(page), jsonb_array_elements(p.page -> 'frames') as f(frame)
  where f.frame ->> 'id' = frame_id
  limit 1
$$;

-- Name, login and avatar come from the GitHub identity (provider data the user cannot edit), refreshed on each call,
-- falling back to user metadata for other providers. Emails are never copied.
create or replace function public.design_ensure_profile(uid uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare meta jsonb;
begin
  select coalesce((select i.identity_data from auth.identities i where i.user_id = u.id and i.provider = 'github' order by i.created_at desc limit 1),
    u.raw_user_meta_data, '{}'::jsonb)
    into meta from auth.users u where u.id = uid;
  if not found then return; end if;
  insert into design_profiles as p (id, display_name, handle, avatar_url)
  values (uid,
    left(coalesce(nullif(meta ->> 'full_name', ''), nullif(meta ->> 'name', ''), nullif(meta ->> 'user_name', ''), nullif(meta ->> 'preferred_username', ''), 'Orbit user'), 80),
    left(coalesce(nullif(meta ->> 'user_name', ''), nullif(meta ->> 'preferred_username', '')), 39),
    nullif(meta ->> 'avatar_url', ''))
  on conflict (id) do update set display_name = excluded.display_name, handle = excluded.handle, avatar_url = excluded.avatar_url;
end $$;

-- A share that can be read now: not revoked, same generation and its frame on a page of the latest saved document.
create or replace function public.design_open_share(p_token text, out share public.design_shares, out ws public.design_workspaces, out live jsonb)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  select * into share from design_shares s where s.token = p_token;
  if not found or share.revoked_at is not null then raise exception 'link_unavailable' using errcode = 'P0002'; end if;
  select * into ws from design_workspaces w where w.owner = share.owner;
  if not found or ws.generation <> share.generation then raise exception 'link_unavailable' using errcode = 'P0002'; end if;
  live := design_live_frame(ws.document, share.frame_id);
  if live is null then raise exception 'screen_unavailable' using errcode = 'P0002'; end if;
end $$;

-- Workspace -----------------------------------------------------------------------------------------------

create or replace function public.design_load_workspace()
returns table (document jsonb, revision integer, generation uuid, updated_at timestamptz)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  return query select w.document, w.revision, w.generation, w.updated_at from design_workspaces w where w.owner = design_uid();
end $$;

-- Saves an edit. p_base_revision is the revision the edit was made on (null only for the very first save).
create or replace function public.design_save_workspace(p_document jsonb, p_base_revision integer)
returns table (revision integer, generation uuid, updated_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := design_uid();
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

-- Reset or replacing Import: keeps the previous copy as a backup and starts a new review generation.
create or replace function public.design_replace_workspace(p_document jsonb, p_base_revision integer, p_reason text)
returns table (revision integer, generation uuid, updated_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := design_uid();
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
  select b.id, b.revision, b.reason, b.created_at from design_workspace_backups b where b.owner = design_uid() order by b.created_at desc, b.id desc
$$;

create or replace function public.design_get_backup(p_id bigint) returns jsonb
language sql stable security definer set search_path = public, pg_temp as $$
  select b.document from design_workspace_backups b where b.owner = design_uid() and b.id = p_id
$$;

-- Profile -------------------------------------------------------------------------------------------------

create or replace function public.design_get_profile()
returns table (display_name text, handle text, avatar_url text, preferences jsonb)
language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := design_uid();
begin
  perform design_ensure_profile(uid);
  return query select p.display_name, p.handle, p.avatar_url, p.preferences from design_profiles p where p.id = uid;
end $$;

-- Preferences: { theme: system | light | dark, panels: { left: boolean, right: boolean } }.
create or replace function public.design_save_preferences(p_preferences jsonb) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := design_uid();
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

-- Shares --------------------------------------------------------------------------------------------------

create or replace function public.design_create_share(p_frame_id text) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := design_uid();
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

-- Returns the revocation time once stored; revocation is permanent.
create or replace function public.design_revoke_share(p_token text) returns timestamptz
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := design_uid();
  revoked timestamptz;
begin
  update design_shares s set revoked_at = coalesce(s.revoked_at, now())
    where s.token = p_token and s.owner = uid returning s.revoked_at into revoked;
  if revoked is null then raise exception 'not_found' using errcode = 'P0002'; end if;
  return revoked;
end $$;

-- The owner's links for the current generation, including revoked ones.
create or replace function public.design_list_shares()
returns table (token text, frame_id text, created_at timestamptz, revoked_at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  select s.token, s.frame_id, s.created_at, s.revoked_at
  from design_shares s join design_workspaces w on w.owner = s.owner and w.generation = s.generation
  where s.owner = design_uid()
  order by s.created_at desc
$$;

-- What a link holder may see: the frame, its render settings and the overrides it needs. No connections or other frames.
create or replace function public.design_get_shared_frame(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  opened record;
  doc jsonb;
begin
  select * into opened from design_open_share(p_token);
  doc := (opened.ws).document;
  return jsonb_build_object(
    'frame', opened.live -> 'frame',
    'platform', opened.live -> 'platform',
    'settings', jsonb_build_object(
      'palette', doc -> 'settings' -> 'palette', 'mode', doc -> 'settings' -> 'mode',
      'language', doc -> 'settings' -> 'language', 'device', coalesce(doc -> 'settings' -> 'device', '"ios"')),
    'overrides', jsonb_build_object(
      'tokens', coalesce(doc -> 'overrides' -> 'tokens', '{}'::jsonb),
      'frames', jsonb_build_object((opened.share).frame_id, coalesce(doc -> 'overrides' -> 'frames' -> (opened.share).frame_id, '{}'::jsonb))),
    'revision', (opened.ws).revision,
    'ownerName', (select p.display_name || coalesce(' (@' || p.handle || ')', '') from design_profiles p where p.id = (opened.share).owner));
end $$;

-- Comments ------------------------------------------------------------------------------------------------

create or replace function public.design_comment_json(c public.design_comments, viewer uuid) returns jsonb
language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'id', c.id, 'frameId', c.frame_id, 'body', c.body, 'createdAt', c.created_at, 'revision', c.revision,
    'clientId', case when c.author = viewer then c.client_id end,
    'author', jsonb_build_object('id', c.author, 'name', coalesce(p.display_name, 'Orbit user'), 'handle', p.handle, 'avatarUrl', p.avatar_url),
    'mine', c.author is not distinct from viewer)
  from (select 1) one left join design_profiles p on p.id = c.author
$$;

-- With a token: the shared screen's thread (the link must be readable). Without: the owner's thread for one of
-- their frames in the current generation, live or shelved.
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
    owner_id := design_uid();
    select w.generation into gen from design_workspaces w where w.owner = owner_id;
    target := p_frame_id;
  end if;
  return coalesce((select jsonb_agg(design_comment_json(c, viewer) order by c.created_at, c.id)
    from design_comments c where c.owner = owner_id and c.generation = gen and c.frame_id = target), '[]'::jsonb);
end $$;

-- Posts as the signed-in user. A retry with the same client id returns the first comment instead of a duplicate.
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

-- Grants ----------------------------------------------------------------------------------------------------

-- Only the functions below are callable by clients; helpers such as design_open_share stay private.
do $$
declare fn regprocedure;
begin
  for fn in select p.oid::regprocedure from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname like 'design\_%' loop
    execute format('revoke all on function %s from public, anon, authenticated', fn);
  end loop;
end $$;
grant execute on function
  public.design_load_workspace(), public.design_save_workspace(jsonb, integer), public.design_replace_workspace(jsonb, integer, text),
  public.design_list_backups(), public.design_get_backup(bigint), public.design_get_profile(), public.design_save_preferences(jsonb),
  public.design_create_share(text), public.design_revoke_share(text), public.design_list_shares(),
  public.design_post_comment(text, text, text, uuid, integer)
  to authenticated;
grant execute on function public.design_get_shared_frame(text), public.design_list_comments(text, text) to anon, authenticated;
