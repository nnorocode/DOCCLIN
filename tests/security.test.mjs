import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { canAccess, canManageAccess, defaultPermissions, validatePermissions } from '../lib/access-control.ts';
import { appStorage, setStorageScope } from '../lib/local-store.ts';
import { validateAttachment, safeAttachmentUrl } from '../lib/file-security.ts';
import { secureResponse } from '../lib/security-headers.ts';

test('HTTP protection headers preserve body and do not force HSTS on local HTTP', async () => {
  const local=secureResponse(new Response('OK'),new Request('http://127.0.0.1:3000/'));
  assert.equal(await local.text(),'OK'); assert.equal(local.headers.get('x-content-type-options'),'nosniff');
  assert.equal(local.headers.get('strict-transport-security'),null);
  const deployed=secureResponse(new Response('OK'),new Request('https://example.com/'));
  assert.ok(deployed.headers.get('strict-transport-security'));
  assert.match(deployed.headers.get('content-security-policy'),/object-src 'none'/);
});

test('roles fail closed and staff cannot access financial modules', () => {
  const member = { role:'reception',active:true,permissions:defaultPermissions('reception') };
  assert.equal(canAccess(member,'Agenda'),true);
  for (const view of ['Financeiro','Precificação','Relatórios','Investimentos','Unknown']) assert.equal(canAccess(member,view),false);
  assert.equal(canAccess({...member,active:false},'Agenda'),false);
  assert.equal(canAccess(null,'Agenda'),false);
  assert.equal(canManageAccess(member),false);
  assert.equal(validatePermissions({finance:'true',agenda:true}).finance,false);
  assert.equal(validatePermissions({finance:'true',agenda:true}).agenda,true);
});
test('cache isolation across users and businesses, including reset', () => {
  setStorageScope('business-a','user-a'); appStorage.setItem('gest-test','private-a');
  setStorageScope('business-a','user-b'); assert.equal(appStorage.getItem('gest-test'),null); appStorage.setItem('gest-test','private-b');
  setStorageScope('business-b','user-a'); assert.equal(appStorage.getItem('gest-test'),null);
  setStorageScope('business-a','user-b'); appStorage.clearNamespace(); assert.equal(appStorage.getItem('gest-test'),null);
  setStorageScope('business-a','user-a'); assert.equal(appStorage.getItem('gest-test'),'private-a');
});
test('attachments reject executable formats and forged MIME types', async () => {
  await assert.rejects(validateAttachment(new File(['<script>alert(1)</script>'],'report.html',{type:'text/html'})));
  await assert.rejects(validateAttachment(new File(['<svg onload="alert(1)"/>'],'photo.svg',{type:'image/svg+xml'})));
  await assert.rejects(validateAttachment(new File(['<script>bad</script>'],'report.pdf',{type:'application/pdf'})));
  await assert.doesNotReject(validateAttachment(new File(['%PDF-1.7\n'],'report.pdf',{type:'application/pdf'})));
  assert.equal(safeAttachmentUrl('javascript:alert(1)'),false);
  assert.equal(safeAttachmentUrl('data:text/html;base64,PHNjcmlwdD4='),false);
  assert.equal(safeAttachmentUrl('https://attacker.example/'),false);
  assert.equal(safeAttachmentUrl('data:application/pdf;base64,JVBERi0xLjc='),true);
});
test('a full browser cache keeps the newest change in session and warns the user', () => {
  const previous=globalThis.window;
  let warned=0;
  globalThis.window={localStorage:{getItem:()=> 'older-value',setItem:()=>{throw new Error('quota');}},dispatchEvent:event=>{if(event.type === "gest-storage-warning") warned++;}};
  try { setStorageScope('quota-test','user'); appStorage.setItem('gest-document','newer-value'); assert.equal(appStorage.getItem('gest-document'),'newer-value'); assert.equal(warned,1); }
  finally { if(previous===undefined) delete globalThis.window; else globalThis.window=previous; }
});

test('PostgreSQL migration enforces tenant isolation, role restrictions and optimistic concurrency', async () => {
  const db = new PGlite();
  const owner='10000000-0000-0000-0000-000000000001';
  const staff='10000000-0000-0000-0000-000000000002';
  const other='10000000-0000-0000-0000-000000000003';
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key,email text);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
      create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
      alter table storage.objects enable row level security; grant usage on schema storage to authenticated;
      grant select,insert,delete on storage.objects to authenticated;
      insert into auth.users values('${owner}','owner@exemplo.com'),('${staff}','staff@exemplo.com'),('${other}','other@exemplo.com');`);
    await db.exec(await readFile(new URL('../supabase/migrations/202609290001_access_foundation.sql',import.meta.url),'utf8'));
    const asUser=async id=>{ await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`); };
    await asUser(owner);
    const a=(await db.query("select public.create_owned_business('Empresa A','Owner') as id")).rows[0].id;
    await asUser(other);
    const b=(await db.query("select public.create_owned_business('Empresa B','Other') as id")).rows[0].id;
    await db.exec(`reset role; insert into public.business_members(business_id,user_id,display_name,email,role) values('${a}','${staff}','Staff','staff@exemplo.com','employee');
      insert into public.module_permissions(business_id,member_id,module,allowed) select '${a}',id,'agenda',true from public.business_members where user_id='${staff}';`);
    await asUser(owner);
    const record=(await db.query(`insert into public.business_records(business_id,module,data) values('${a}','agenda','{"name":"meeting"}') returning id,version`)).rows[0];
    const financial=(await db.query(`insert into public.business_records(business_id,module,data) values('${a}','finance','{"amount":100}') returning id`)).rows[0];
    await asUser(other);
    assert.equal((await db.query(`select * from public.business_records where business_id='${a}'`)).rows.length,0);
    await assert.rejects(db.query(`insert into public.business_records(business_id,module,data) values('${a}','agenda','{}')`));
    await asUser(staff);
    assert.equal((await db.query(`select * from public.business_records where id='${record.id}'`)).rows.length,1);
    assert.equal((await db.query(`select * from public.business_records where id='${financial.id}'`)).rows.length,0);
    await assert.rejects(db.query(`insert into public.business_records(business_id,module,data) values('${a}','finance','{}')`));
    const membership=(await db.query(`select id from public.business_members where user_id='${staff}'`)).rows[0].id;
    await assert.rejects(db.query(`select public.set_member_permissions('${membership}','admin',true,'{}')`));
    await assert.rejects(db.query(`update public.business_members set role='admin' where id='${membership}'`));
    await assert.rejects(db.query(`update public.business_records set business_id='${b}' where id='${record.id}'`));
    const updated=(await db.query(`update public.business_records set data='{"name":"updated"}' where id='${record.id}' and version=1 returning version`)).rows;
    assert.equal(updated[0].version,2);
    assert.equal((await db.query(`update public.business_records set data='{}' where id='${record.id}' and version=1 returning id`)).rows.length,0);
    await db.exec(`insert into storage.objects(bucket_id,name) values('business-documents','${a}/agenda/${record.id}/file.pdf');`);
    await assert.rejects(db.query(`insert into storage.objects(bucket_id,name) values('business-documents','${a}/finance/${financial.id}/file.pdf')`));
    await asUser(other);
    assert.equal((await db.query(`select * from storage.objects`)).rows.length,0);
    await db.exec('reset role; set role anon;');
    await assert.rejects(db.query('select * from public.business_records'));
    await db.exec('reset role;');
    assert.ok((await db.query('select * from public.audit_events')).rows.length>=3);
  } finally { await db.close(); }
});
