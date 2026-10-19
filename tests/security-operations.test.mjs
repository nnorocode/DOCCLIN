import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,stat,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {randomBytes,createHash} from 'node:crypto';
import {requestSecurity,securityLog} from '../lib/request-security.ts';
import {encryptBackup,verifyBackup} from '../scripts/encrypted-backup.mjs';
import {deploymentPreflight} from '../scripts/security-preflight.mjs';

const request=(headers={},url='https://fixture.invalid/action')=>new Request(url,{method:'POST',headers,body:'FICTITIOUS PRIVATE PAYLOAD'});
const options={requestId:'fixture-id',trustedClientIp:'192.0.2.1',limiter:{limit:async()=>({success:true})}};
async function quiet(callback){const previous=console.warn;try{console.warn=()=>{};return await callback();}finally{console.warn=previous;}}
test('public HTTP redirects reads to HTTPS but never forwards unsafe bodies',async()=>quiet(async()=>{
  const redirect=await requestSecurity(new Request('http://fixture.invalid/page?q=1'),{requestId:'fixture'});
  assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'https://fixture.invalid/page?q=1');
  assert.equal((await requestSecurity(request({},'http://fixture.invalid/action'),options)).status,400);
}));
test('CSRF rejects foreign, opaque and contradictory origins before calling rate limiter',async()=>quiet(async()=>{
  let calls=0;const opts={...options,limiter:{limit:async()=>{calls++;return {success:true};}}};
  for(const headers of [{origin:'https://evil.invalid'},{origin:'null'},{cookie:'fixture=1'},{'sec-fetch-site':'same-site'},{origin:'https://fixture.invalid','sec-fetch-site':'cross-site'},{origin:'https://fixture.invalid.evil.invalid'}]) {
    assert.equal((await requestSecurity(request(headers),opts)).status,403);
  }
  assert.equal(calls,0);
}));
test('same-origin writes use the provider limiter with a digest rather than raw address',async()=>{
  let key;const result=await requestSecurity(request({origin:'https://fixture.invalid',cookie:'fixture=1'}),{...options,limiter:{limit:async value=>{key=value.key;return {success:true};}}});
  assert.equal(result,null);assert.match(key,/^[a-f0-9]{64}$/);assert.notEqual(key,options.trustedClientIp);
});
test('rate limit denies excess and missing/faulting provider; no fake in-memory quota',async()=>quiet(async()=>{
  const limited=await requestSecurity(request(),{...options,limiter:{limit:async()=>({success:false})}});
  assert.equal(limited.status,429);assert.equal(limited.headers.get('retry-after'),'60');
  assert.equal((await requestSecurity(request(),{requestId:'fixture'})).status,503);
  assert.equal((await requestSecurity(request(),{...options,limiter:{limit:async()=>{throw Error('PRIVATE PROVIDER DETAIL');}}})).status,503);
}));
test('local development bypasses rate dependency, never CSRF protection',async()=>quiet(async()=>{
  assert.equal(await requestSecurity(request({origin:'http://127.0.0.1:3001'},'http://127.0.0.1:3001/action'),{requestId:'fixture',development:true}),null);
  assert.equal((await requestSecurity(request({origin:'https://evil.invalid'},'http://127.0.0.1:3001/action'),{requestId:'fixture',development:true})).status,403);
}));
test('security telemetry has fixed fields and no raw request content',()=>{
  const before=console.warn;const entries=[];
  try{console.warn=value=>entries.push(value);securityLog('server_error','fixture-id',500);}finally{console.warn=before;}
  assert.deepEqual(JSON.parse(entries[0]),{type:'security',event:'server_error',requestId:'fixture-id',status:500});
});
test('deployment preflight fails without configuration and never prints credentials',()=>{
  const missing=deploymentPreflight({});assert.equal(missing.readyForRemoteValidation,false);
  for(const origin of ['http://fixture.invalid','https://localhost','https://fixture.invalid/path','https://user:secret@fixture.invalid']) {
    assert.equal(deploymentPreflight({APP_ORIGIN:origin}).readyForRemoteValidation,false);
  }
  assert.doesNotMatch(JSON.stringify(deploymentPreflight({NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_secret_PRIVATE_VALUE'})),/PRIVATE_VALUE/);
});
test('valid configuration is only readiness for remote validation, not approval',()=>{
  const result=deploymentPreflight({APP_ORIGIN:'https://fixture.invalid',NEXT_PUBLIC_SUPABASE_URL:'https://fixture.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture'});
  assert.equal(result.readyForRemoteValidation,true);assert.match(result.limits,/Does not contact services/);
});
test('AES-GCM backup is private, randomized and verifies without producing plaintext files',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'docclin-backup-fixture-')),key=randomBytes(32);
  try{
    const input=path.join(dir,'fixture.dump'),first=path.join(dir,'one.enc'),second=path.join(dir,'two.enc');
    const data=Buffer.from('FICTITIOUS DATABASE EXPORT\n'.repeat(10000));await writeFile(input,data);
    await encryptBackup(input,first,key);await encryptBackup(input,second,key);
    assert.equal((await verifyBackup(first,key)).sha256,createHash('sha256').update(data).digest('hex'));
    assert.equal((await verifyBackup(first,key)).bytes,data.length);
    assert.notDeepEqual(await readFile(first),await readFile(second));
    assert.equal((await stat(first)).mode&0o777,0o600);
    assert.equal((await readFile(first)).includes(data.subarray(0,40)),false);
    assert.deepEqual(await readFile(input),data);
  }finally{key.fill(0);await rm(dir,{recursive:true,force:true});}
});
test('backup rejects wrong keys, tampering, truncation and overwrites',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'docclin-backup-fixture-')),key=randomBytes(32);
  try{
    const input=path.join(dir,'fixture.dump'),output=path.join(dir,'out.enc');await writeFile(input,'FICTITIOUS DATA');
    await encryptBackup(input,output,key);
    await assert.rejects(verifyBackup(output,randomBytes(32)));
    await assert.rejects(encryptBackup(input,output,key));await assert.rejects(encryptBackup(input,input,key));
    const bytes=await readFile(output);bytes[35]^=1;await writeFile(output,bytes);await assert.rejects(verifyBackup(output,key));
    await writeFile(output,bytes.subarray(0,10));await assert.rejects(verifyBackup(output,key));
    assert.equal(await readFile(input,'utf8'),'FICTITIOUS DATA');
  }finally{key.fill(0);await rm(dir,{recursive:true,force:true});}
});
