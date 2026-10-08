-- Project links: a share without a frame shows every page and screen of the latest saved workspace
-- (not Archived or Trash), with their prototype connections and comments. Screen links are unchanged.

alter table public.design_shares alter column frame_id drop not null;

-- A readable share. For a screen link the screen must be on a page; a project link only needs the workspace.
create or replace function public.design_open_share(p_token text, out share public.design_shares, out ws public.design_workspaces, out live jsonb)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  select * into share from design_shares s where s.token = p_token;
  if not found or share.revoked_at is not null then raise exception 'link_unavailable' using errcode = 'P0002'; end if;
  select * into ws from design_workspaces w where w.owner = share.owner;
  if not found or ws.generation <> share.generation then raise exception 'link_unavailable' using errcode = 'P0002'; end if;
  if share.frame_id is not null then
    live := design_live_frame(ws.document, share.frame_id);
    if live is null then raise exception 'screen_unavailable' using errcode = 'P0002'; end if;
  end if;
end $$;

-- The screen a link's comments go to: the link's own screen, or (project link) the requested one if it is on a page.
create function public.design_share_target(p_share public.design_shares, p_doc jsonb, p_frame_id text) returns text
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if p_share.frame_id is not null then return p_share.frame_id; end if;
  if p_frame_id is null or design_live_frame(p_doc, p_frame_id) is null then raise exception 'screen_unavailable' using errcode = 'P0002'; end if;
  return p_frame_id;
end $$;

create or replace function public.design_get_shared_frame(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  opened record;
  doc jsonb;
  settings jsonb;
  owner_name text;
begin
  select * into opened from design_open_share(p_token);
  doc := (opened.ws).document;
  settings := jsonb_build_object(
    'palette', doc -> 'settings' -> 'palette', 'mode', doc -> 'settings' -> 'mode',
    'language', doc -> 'settings' -> 'language', 'device', coalesce(doc -> 'settings' -> 'device', '"ios"'));
  select p.display_name || coalesce(' (@' || p.handle || ')', '') into owner_name from design_profiles p where p.id = (opened.share).owner;
  if (opened.share).frame_id is null then
    -- The live pages only: Archived and Trash, and overrides of shelved frames, stay private.
    return jsonb_build_object(
      'kind', 'project',
      'document', jsonb_build_object(
        'version', 1,
        'settings', settings,
        'selectedPageId', doc -> 'selectedPageId',
        'startFrameId', doc -> 'startFrameId',
        'pages', doc -> 'pages',
        'connections', coalesce(doc -> 'connections', '[]'::jsonb),
        'overrides', jsonb_build_object(
          'tokens', coalesce(doc -> 'overrides' -> 'tokens', '{}'::jsonb),
          'frames', coalesce((select jsonb_object_agg(f.key, f.value) from jsonb_each(coalesce(doc -> 'overrides' -> 'frames', '{}'::jsonb)) f
            where design_live_frame(doc, f.key) is not null), '{}'::jsonb))),
      'revision', (opened.ws).revision,
      'ownerName', owner_name);
  end if;
  return jsonb_build_object(
    'kind', 'screen',
    'frame', opened.live -> 'frame',
    'platform', opened.live -> 'platform',
    'settings', settings,
    'overrides', jsonb_build_object(
      'tokens', coalesce(doc -> 'overrides' -> 'tokens', '{}'::jsonb),
      'frames', jsonb_build_object((opened.share).frame_id, coalesce(doc -> 'overrides' -> 'frames' -> (opened.share).frame_id, '{}'::jsonb))),
    'revision', (opened.ws).revision,
    'ownerName', owner_name);
end $$;

-- p_frame_id null shares the whole project; an open link for the same target is reused.
create or replace function public.design_create_share(p_frame_id text) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := design_editor_uid();
  ws design_workspaces;
  existing text;
  new_token text;
begin
  select * into ws from design_workspaces w where w.owner = uid;
  if not found or (p_frame_id is not null and design_live_frame(ws.document, p_frame_id) is null) then raise exception 'frame_not_live'; end if;
  select s.token into existing from design_shares s
    where s.owner = uid and s.generation = ws.generation and s.frame_id is not distinct from p_frame_id and s.revoked_at is null
    order by s.created_at desc limit 1;
  if existing is not null then return existing; end if;
  new_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into design_shares (token, owner, generation, frame_id) values (new_token, uid, ws.generation, p_frame_id);
  return new_token;
end $$;

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
    owner_id := (opened.share).owner; gen := (opened.share).generation;
    target := design_share_target(opened.share, (opened.ws).document, p_frame_id);
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
    owner_id := (opened.share).owner; gen := (opened.share).generation;
    target := design_share_target(opened.share, (opened.ws).document, p_frame_id);
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

revoke all on function public.design_share_target(public.design_shares, jsonb, text) from public, anon, authenticated;
