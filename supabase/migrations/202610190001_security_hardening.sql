begin;

-- Reject SQL NULL explicitly. NOT VALID preserves pre-existing data for review;
-- PostgreSQL still checks every new INSERT/UPDATE against this constraint.
create function private.clinical_payload_valid(payload jsonb, patient text) returns boolean
language plpgsql immutable set search_path='' as $$
declare image jsonb; encoded text; bytes bytea; mime text;
begin
  if (jsonb_typeof(payload)='object'
      and jsonb_typeof(payload->'patientId')='string'
      and payload->>'patientId'=patient
      and jsonb_typeof(payload->'patientName')='string'
      and jsonb_typeof(payload->'encounters')='array'
      and jsonb_typeof(payload->'documents')='array'
      and jsonb_typeof(payload->'steps')='array'
      and jsonb_typeof(payload->'allergies')='array'
      and jsonb_typeof(payload->'conditions')='array'
      and jsonb_typeof(payload->'medicines')='array'
      and jsonb_typeof(payload->'coverage')='object') is not true then return false; end if;
  if payload ? 'images' then
    if jsonb_typeof(payload->'images') is distinct from 'array' then return false; end if;
    for image in select value from jsonb_array_elements(payload->'images') loop
      if (jsonb_typeof(image)='object' and jsonb_typeof(image->'url')='string'
          and image->>'url' ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$') is not true then return false; end if;
      mime := split_part(split_part(image->>'url',';',1),':',2);
      encoded := split_part(image->>'url',',',2);
      bytes := decode(encoded,'base64');
      if octet_length(bytes)=0 or octet_length(bytes)>2097152 then return false; end if;
      if mime='image/png' and substring(bytes from 1 for 8)<>decode('89504e470d0a1a0a','hex') then return false; end if;
      if mime='image/jpeg' and substring(bytes from 1 for 3)<>decode('ffd8ff','hex') then return false; end if;
      if mime='image/webp' and (substring(bytes from 1 for 4)<>decode('52494646','hex') or substring(bytes from 9 for 4)<>decode('57454250','hex')) then return false; end if;
    end loop;
  end if;
  return true;
exception when others then return false;
end $$;
revoke all on function private.clinical_payload_valid(jsonb,text) from public;
grant execute on function private.clinical_payload_valid(jsonb,text) to authenticated;
alter table public.clinical_records add constraint clinical_payload_valid
  check (private.clinical_payload_valid(data,patient_id) is true) not valid;

create or replace function private.clinical_stamp() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if TG_OP='UPDATE' and (new.id<>old.id or new.business_id<>old.business_id or new.patient_id<>old.patient_id) then
    raise exception 'Clinical record ownership is immutable';
  end if;
  new.updated_at:=now();
  insert into public.audit_events(business_id,actor_id,action,record_id)
    values(new.business_id,auth.uid(),case when TG_OP='INSERT' then 'clinical_record_created' else 'clinical_record_updated' end,new.id);
  return new;
end $$;
drop trigger clinical_stamp on public.clinical_records;
create trigger clinical_stamp before insert or update on public.clinical_records
  for each row execute function private.clinical_stamp();

-- Persistent, atomic quotas per actor and business; no per-instance memory limit.
create table private.invitation_attempts (
  business_id uuid not null references public.businesses(id),
  actor_id uuid not null references auth.users(id),
  attempted_at timestamptz not null default now()
);
create index invitation_attempts_window on private.invitation_attempts(business_id,actor_id,attempted_at);
revoke all on private.invitation_attempts from public,anon,authenticated;
create function public.consume_invitation_quota(business uuid) returns boolean
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); actor_role text;
begin
  actor_role:=private.member_role(business);
  if actor is null or actor_role is null or actor_role not in ('owner','admin') then raise exception 'Permission denied'; end if;
  perform pg_advisory_xact_lock(hashtext(business::text || ':' || actor::text));
  delete from private.invitation_attempts where business_id=business and actor_id=actor and attempted_at < now()-interval '1 day';
  if (select count(*) from private.invitation_attempts where business_id=business and actor_id=actor and attempted_at > now()-interval '10 minutes')>=5
     or (select count(*) from private.invitation_attempts where business_id=business and actor_id=actor)>=20 then return false; end if;
  insert into private.invitation_attempts(business_id,actor_id) values(business,actor);
  return true;
end $$;
revoke all on function public.consume_invitation_quota(uuid) from public,anon;
grant execute on function public.consume_invitation_quota(uuid) to authenticated;
commit;
