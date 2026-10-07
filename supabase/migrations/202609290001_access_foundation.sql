-- Apply to a new Supabase project before configuring the frontend.
begin;
create schema if not exists private;
revoke all on schema private from public;
create table public.businesses (
  id uuid primary key default gen_random_uuid(), name text not null check (length(name) between 1 and 160),
  created_at timestamptz not null default now()
);
create table public.business_members (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null, email text not null,
  role text not null check (role in ('owner','admin','reception','employee')), active boolean not null default true,
  unique(business_id,user_id), unique(business_id,id)
);
create table public.module_permissions (
  business_id uuid not null, member_id uuid not null, module text not null, allowed boolean not null default false,
  primary key(member_id,module), foreign key(business_id,member_id) references public.business_members(business_id,id) on delete cascade,
  constraint known_module check (module in ('home','assistant','agenda','tasks','projects','clients','crm','support','proposals','sales','catalog','inventory','maintenance','documents','work_orders','purchases','suppliers','finance','pricing','reports','team','time_clock','investments','onboarding','store','settings'))
);
create table public.business_records (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id),
  module text not null check (module in ('home','assistant','agenda','tasks','projects','clients','crm','support','proposals','sales','catalog','inventory','maintenance','documents','work_orders','purchases','suppliers','finance','pricing','reports','team','time_clock','investments','onboarding','store','settings')),
  data jsonb not null check(jsonb_typeof(data) = 'object' and octet_length(data::text) <= 1048576),
  version integer not null default 1, created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(business_id,module,id)
);
create index records_business_module on public.business_records(business_id,module,updated_at desc);
create index members_user on public.business_members(user_id,business_id) where active;
create table public.audit_events (
  id bigint generated always as identity primary key, business_id uuid not null,
  actor_id uuid, action text not null, record_id uuid, occurred_at timestamptz not null default now()
);

create function private.member_role(business uuid) returns text
language sql stable security definer set search_path = '' as $$
  select role from public.business_members where business_id=business and user_id=auth.uid() and active
$$;
create function private.module_allowed(business uuid, requested_module text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.business_members m where m.business_id=business and m.user_id=auth.uid() and m.active
    and (m.role in ('owner','admin') or exists(select 1 from public.module_permissions p where p.member_id=m.id and p.business_id=business and p.module=requested_module and p.allowed)))
$$;
revoke all on function private.member_role(uuid), private.module_allowed(uuid,text) from public;
grant usage on schema private to authenticated;
grant execute on function private.member_role(uuid), private.module_allowed(uuid,text) to authenticated;

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.module_permissions enable row level security;
alter table public.business_records enable row level security;
alter table public.audit_events enable row level security;
revoke all on public.businesses,public.business_members,public.module_permissions,public.business_records,public.audit_events from anon;
revoke all on public.businesses,public.business_members,public.module_permissions,public.audit_events from authenticated;
grant select on public.businesses,public.business_members,public.module_permissions,public.audit_events to authenticated;
grant select,insert,update,delete on public.business_records to authenticated;
create policy business_read on public.businesses for select to authenticated using (private.member_role(id) is not null);
create policy members_read on public.business_members for select to authenticated using (user_id=auth.uid() or private.member_role(business_id) in ('owner','admin'));
create policy grants_read on public.module_permissions for select to authenticated using (private.member_role(business_id) in ('owner','admin') or exists(select 1 from public.business_members m where m.id=member_id and m.user_id=auth.uid() and m.active));
create policy audit_read on public.audit_events for select to authenticated using (private.member_role(business_id) in ('owner','admin'));
-- Restricted users cannot read financial data indirectly through administrative settings or reports.
create policy records_read on public.business_records for select to authenticated using (private.module_allowed(business_id,module) and (module not in ('settings','team','reports','home','assistant') or private.member_role(business_id) in ('owner','admin')));
create policy records_insert on public.business_records for insert to authenticated with check (created_by=auth.uid() and private.module_allowed(business_id,module) and (module not in ('settings','team','reports','home','assistant') or private.member_role(business_id) in ('owner','admin')));
create policy records_update on public.business_records for update to authenticated using (private.module_allowed(business_id,module) and (module not in ('settings','team','reports','home','assistant') or private.member_role(business_id) in ('owner','admin'))) with check (private.module_allowed(business_id,module));
create policy records_delete on public.business_records for delete to authenticated using (private.module_allowed(business_id,module) and (module not in ('settings','team','reports','home','assistant') or private.member_role(business_id) in ('owner','admin')));

create function private.record_stamp() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if TG_OP='UPDATE' then
    if new.id <> old.id or new.business_id <> old.business_id or new.module <> old.module or new.created_by <> old.created_by or new.created_at <> old.created_at then
      raise exception 'Record ownership is immutable';
    end if;
    new.version := old.version+1; new.updated_at := now();
  else new.version := 1; new.created_at := now(); new.updated_at := now(); end if;
  return new;
end $$;
create trigger record_stamp before insert or update on public.business_records for each row execute function private.record_stamp();
create function private.record_audit() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if TG_OP='DELETE' then insert into public.audit_events(business_id,actor_id,action,record_id) values(old.business_id,auth.uid(),TG_OP,old.id); return old;
  else insert into public.audit_events(business_id,actor_id,action,record_id) values(new.business_id,auth.uid(),TG_OP,new.id); return new; end if;
end $$;
create trigger record_audit after insert or update or delete on public.business_records for each row execute function private.record_audit();
revoke all on function private.record_stamp(),private.record_audit() from public;

create function public.create_owned_business(business_name text, owner_name text) returns uuid
language plpgsql security definer set search_path='' as $$
declare business uuid; actor uuid := auth.uid();
begin
  if actor is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtext(actor::text));
  if exists(select 1 from public.business_members where user_id=actor and role='owner') then raise exception 'Owned business already exists'; end if;
  insert into public.businesses(name) values(trim(business_name)) returning id into business;
  insert into public.business_members(business_id,user_id,display_name,email,role)
    select business,actor,left(trim(owner_name),160),email,'owner' from auth.users where id=actor;
  return business;
end $$;
create function public.set_member_permissions(target_member uuid, target_role text, target_active boolean, grants jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare target public.business_members; actor_role text; entry record;
begin
  select * into target from public.business_members where id=target_member for update;
  actor_role := private.member_role(target.business_id);
  if actor_role is null or actor_role not in ('owner','admin') or target.role='owner' or target.user_id=auth.uid() then raise exception 'Permission denied'; end if;
  if actor_role='admin' and (target.role='admin' or target_role='admin') then raise exception 'Only owner may manage administrators'; end if;
  if target_role not in ('admin','reception','employee') or target_active is null or jsonb_typeof(grants) <> 'object' then raise exception 'Invalid permissions'; end if;
  update public.business_members set role=target_role,active=target_active where id=target_member;
  delete from public.module_permissions where member_id=target_member;
  for entry in select key,value from jsonb_each(grants) loop
    if jsonb_typeof(entry.value) <> 'boolean' then raise exception 'Invalid permission value'; end if;
    insert into public.module_permissions(business_id,member_id,module,allowed) values(target.business_id,target_member,entry.key,entry.value='true'::jsonb);
  end loop;
  insert into public.audit_events(business_id,actor_id,action,record_id) values(target.business_id,auth.uid(),'permissions_changed',target_member);
end $$;
revoke all on function public.create_owned_business(text,text),public.set_member_permissions(uuid,text,boolean,jsonb) from public,anon;
grant execute on function public.create_owned_business(text,text),public.set_member_permissions(uuid,text,boolean,jsonb) to authenticated;

-- Attachments remain private. No public URLs, anonymous reads or HTML/SVG uploads.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('business-documents','business-documents',false,10485760,array['application/pdf','image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
create function private.attachment_allowed(object_name text) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare parts text[] := string_to_array(object_name,'/'); business uuid; record uuid;
begin
  if array_length(parts,1) <> 4 then return false; end if;
  begin business:=parts[1]::uuid; record:=parts[3]::uuid; exception when invalid_text_representation then return false; end;
  return exists(select 1 from public.business_records r where r.id=record and r.business_id=business and r.module=parts[2])
    and (parts[2] not in ('settings','team','reports','home','assistant') or private.member_role(business) in ('owner','admin'))
    and private.module_allowed(business,parts[2]);
end $$;
revoke all on function private.attachment_allowed(text) from public;
grant execute on function private.attachment_allowed(text) to authenticated;
create function public.register_invited_member(business uuid, invited_user uuid, invited_name text, invited_email text, invited_role text, inviting_user uuid) returns void
language plpgsql security definer set search_path='' as $$
declare member uuid; actor_role text; module_name text;
begin
  select role into actor_role from public.business_members where business_id=business and user_id=inviting_user and active for share;
  if actor_role is null or actor_role not in ('owner','admin') or invited_role not in ('admin','reception','employee') or (actor_role='admin' and invited_role='admin') then raise exception 'Permission denied'; end if;
  insert into public.business_members(business_id,user_id,display_name,email,role) values(business,invited_user,invited_name,invited_email,invited_role) returning id into member;
  foreach module_name in array (case when invited_role='reception' then array['home','agenda','tasks','clients','crm','support','proposals','sales','catalog','time_clock','onboarding','settings'] else array['home','agenda','tasks','time_clock','onboarding','settings'] end) loop
    insert into public.module_permissions(business_id,member_id,module,allowed) values(business,member,module_name,true);
  end loop;
  insert into public.audit_events(business_id,actor_id,action,record_id) values(business,inviting_user,'member_invited',member);
end $$;
revoke all on function public.register_invited_member(uuid,uuid,text,text,text,uuid) from public,anon,authenticated;
grant execute on function public.register_invited_member(uuid,uuid,text,text,text,uuid) to service_role;
create policy documents_read on storage.objects for select to authenticated using (bucket_id='business-documents' and private.attachment_allowed(name));
create policy documents_create on storage.objects for insert to authenticated with check (bucket_id='business-documents' and private.attachment_allowed(name));
create policy documents_delete on storage.objects for delete to authenticated using (bucket_id='business-documents' and private.attachment_allowed(name));
commit;
