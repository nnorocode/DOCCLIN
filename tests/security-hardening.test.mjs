import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';
import {validateImage} from '../lib/file-security.ts';
import {contentSecurityPolicy,secureResponse} from '../lib/security-headers.ts';

function load(path,deps={},globals={}) {
  const exports={};
  const source=readFileSync(new URL('../'+path,import.meta.url),'utf8');
  const context={exports,structuredClone,Map,Set,URL,Event,CustomEvent,console,...globals,
    require:name=>{assert.ok(name in deps,'Unexpected import '+name);return deps[name];}};
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
  return exports;
}
function browserFixture() {
  const values=new Map();
  const storage={get length(){return values.size;},key:i=>[...values.keys()][i]??null,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  return {values,window:{localStorage:storage,dispatchEvent(){}}};
}
test('missing production auth fails closed, development demo remains explicit',()=>{
  for(const env of [{NODE_ENV:'production'},{NODE_ENV:'test'},{}]) {
    const client=load('lib/supabase/client.ts',{'@supabase/supabase-js':{createClient(){throw Error('must not connect');}}},{process:{env}});
    assert.equal(client.demoAllowed,false);assert.throws(()=>client.getSupabase(),/Configure/);
  }
  const dev=load('lib/supabase/client.ts',{'@supabase/supabase-js':{}},{process:{env:{NODE_ENV:'development'}}});
  assert.equal(dev.demoAllowed,true);assert.equal(dev.getSupabase(),null);
});
test('partial or privileged credentials never silently fall back to demo',()=>{
  for(const env of [
    {NEXT_PUBLIC_SUPABASE_URL:'https://fixture.supabase.co'},
    {NEXT_PUBLIC_SUPABASE_URL:'https://fixture.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_secret_fixture'},
    {NEXT_PUBLIC_SUPABASE_URL:'http://untrusted.invalid',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture'}
  ]) {
    const client=load('lib/supabase/client.ts',{'@supabase/supabase-js':{createClient(){throw Error('must not connect');}}},{process:{env:{...env,NODE_ENV:'development'}}});
    assert.equal(client.demoAllowed,false);assert.throws(()=>client.getSupabase());
  }
});
test('clinical demo records follow user scope without a second shared cache',async()=>{
  const fixture=browserFixture(),local=load('lib/local-store.ts',{},fixture);
  const clinical=load('lib/clinical-records.ts',{'./supabase/client':{getSupabase:()=>null},'./local-store':local},fixture);
  local.setStorageScope('demo','owner');
  const record=clinical.emptyClinicalRecord('fixture-patient','Paciente fictício');record.anamnesis='FICTÍCIO';
  await clinical.saveClinicalRecord('demo',record);
  local.setStorageScope('demo','employee');
  assert.equal((await clinical.loadClinicalRecord('demo','fixture-patient','')).anamnesis,'');
  assert.equal((await clinical.listClinicalRecords('demo')).length,0);
  local.setStorageScope('demo','owner');assert.equal((await clinical.loadClinicalRecord('demo','fixture-patient','')).anamnesis,'FICTÍCIO');
});
test('successful remote save never persists clinical JSON and legacy copies are invalidated',async()=>{
  const fixture=browserFixture(),local=load('lib/local-store.ts',{},fixture);
  fixture.values.set('gest-local:fixture-business:fixture-user:clinical-record:fixture-business:patient','LEGACY-FICTÍCIO');
  local.setStorageScope('fixture-business','fixture-user');
  assert.equal(fixture.values.size,0);
  const clinical=load('lib/clinical-records.ts',{'./supabase/client':{getSupabase:()=>({from:()=>({upsert:async()=>({error:null})})})},'./local-store':local},fixture);
  await clinical.saveClinicalRecord('fixture-business',clinical.emptyClinicalRecord('patient','Fictício'));
  assert.equal(fixture.values.size,0);
  local.appStorage.setItem('clinical-record:fixture-business:patient','FICTÍCIO');
  assert.equal(fixture.values.size,0);
  local.appStorage.setItem('gest-module-fixture','PRESERVAR');
  local.setStorageScope('signed-out','none');
  assert.ok([...fixture.values.values()].includes('PRESERVAR'));
});
test('production CSP rejects inline/event-handler scripts and preserves response nonce',()=>{
  const policy=contentSecurityPolicy('fixture-random-nonce',false);
  assert.match(policy,/script-src 'self' 'nonce-fixture-random-nonce'/);
  assert.doesNotMatch(policy,/unsafe-eval|script-src [^;]*unsafe-inline/);
  assert.match(policy,/script-src-attr 'none'/);assert.match(policy,/form-action 'self'/);
  const response=secureResponse(new Response('fixture',{headers:{'Content-Security-Policy':policy}}),new Request('https://fixture.invalid/'));
  assert.equal(response.headers.get('Content-Security-Policy'),policy);
});
test('images reject MIME forgery, corrupted content and excessive decoded dimensions',async()=>{
  await assert.rejects(validateImage(new File(['not PNG'],'image.png',{type:'image/png'})));
  const file=new File([new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0])],'fixture.png',{type:'image/png'});
  const old=globalThis.createImageBitmap;let closed=false;
  try {
    globalThis.createImageBitmap=async()=>{throw Error('bad decode');};await assert.rejects(validateImage(file),/corrompida/);
    globalThis.createImageBitmap=async()=>({width:10000,height:10000,close(){closed=true;}});
    await assert.rejects(validateImage(file),/megapixels/);assert.equal(closed,true);
    globalThis.createImageBitmap=async()=>({width:20,height:20,close(){}});await assert.doesNotReject(validateImage(file));
  } finally {if(old===undefined)delete globalThis.createImageBitmap;else globalThis.createImageBitmap=old;}
});
test('merged SQL migrations reject malformed clinical records, log creation and enforce invitation quota',async()=>{
  const db=new PGlite();
  const owner='10000000-0000-0000-0000-000000000001',other='10000000-0000-0000-0000-000000000002';
  try {
    await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
      create schema auth;create table auth.users(id uuid primary key,email text);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
      create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
      alter table storage.objects enable row level security;
      insert into auth.users values('${owner}','owner@fixture.invalid'),('${other}','other@fixture.invalid');`);
    for(const name of ['202609290001_access_foundation.sql','202609300001_clinical_records.sql','202610190001_security_hardening.sql'])await db.exec(readFileSync(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
    await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${owner}',false);`);
    const business=(await db.query("select public.create_owned_business('Fictícia','Dono fictício') id")).rows[0].id;
    for(const payload of [{},{patientId:null},{patientId:'patient'}, {patientId:'other'}]) {
      await assert.rejects(db.query('insert into public.clinical_records(business_id,patient_id,data) values($1,$2,$3)',[business,'patient',JSON.stringify(payload)]));
    }
    const clinical=load('lib/clinical-records.ts',{'./supabase/client':{getSupabase:()=>null},'./local-store':{}});
    const record=clinical.emptyClinicalRecord('patient','Paciente fictício');
    const result=await db.query('insert into public.clinical_records(business_id,patient_id,data) values($1,$2,$3) returning id',[business,'patient',JSON.stringify(record)]);
    assert.equal((await db.query("select * from public.audit_events where action='clinical_record_created'")).rows.length,1);
    await assert.rejects(db.query('update public.clinical_records set id=gen_random_uuid() where id=$1',[result.rows[0].id]));
    for(const images of [null,[{url:'https://attacker.invalid/image.png'}],[{url:'data:image/png;base64,bm90IHBuZw=='}]]) {
      await assert.rejects(db.query('update public.clinical_records set data=$1 where id=$2',[JSON.stringify({...record,images}),result.rows[0].id]));
    }
    await db.query('update public.clinical_records set data=$1 where id=$2',[JSON.stringify({...record,anamnesis:'FICTÍCIO'}),result.rows[0].id]);
    assert.equal((await db.query("select * from public.audit_events where action='clinical_record_updated'")).rows.length,1);
    for(let i=0;i<5;i++)assert.equal((await db.query('select public.consume_invitation_quota($1) allowed',[business])).rows[0].allowed,true);
    assert.equal((await db.query('select public.consume_invitation_quota($1) allowed',[business])).rows[0].allowed,false);
    await db.exec(`select set_config('request.jwt.claim.sub','${other}',false)`);
    assert.equal((await db.query('select * from public.clinical_records')).rows.length,0);
    await assert.rejects(db.query('select public.consume_invitation_quota($1)',[business]));
    await db.exec('reset role;set role anon');await assert.rejects(db.query('select * from public.clinical_records'));
  } finally {await db.close();}
});
