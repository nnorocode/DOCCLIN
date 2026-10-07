begin;
alter table public.module_permissions drop constraint if exists known_module;
alter table public.module_permissions add constraint known_module check (module in ('home','assistant','agenda','tasks','projects','clients','clinical','crm','support','proposals','sales','catalog','inventory','maintenance','documents','work_orders','purchases','suppliers','finance','pricing','reports','team','time_clock','investments','onboarding','store','settings'));

create table public.clinical_records (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  patient_id text not null check (length(patient_id) between 1 and 160),
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 1048576 and data->>'patientId' = patient_id),
  updated_at timestamptz not null default now(),
  unique (business_id, patient_id)
);
create index clinical_records_business on public.clinical_records(business_id);
alter table public.clinical_records enable row level security;
revoke all on public.clinical_records from public, anon, authenticated;
grant select, insert, update on public.clinical_records to authenticated;
create policy clinical_read on public.clinical_records for select to authenticated using (private.module_allowed(business_id,'clinical'));
create policy clinical_create on public.clinical_records for insert to authenticated with check (private.module_allowed(business_id,'clinical'));
create policy clinical_update on public.clinical_records for update to authenticated using (private.module_allowed(business_id,'clinical')) with check (private.module_allowed(business_id,'clinical'));
create function private.clinical_stamp() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.business_id <> old.business_id or new.patient_id <> old.patient_id then raise exception 'Clinical record ownership is immutable'; end if;
  new.updated_at := now();
  insert into public.audit_events(business_id,actor_id,action,record_id) values(new.business_id,auth.uid(),'clinical_record_updated',new.id);
  return new;
end $$;
create trigger clinical_stamp before update on public.clinical_records for each row execute function private.clinical_stamp();
revoke all on function private.clinical_stamp() from public;
commit;
