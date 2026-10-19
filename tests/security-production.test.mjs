import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

test('built Worker uses its own matching CSP nonce, never caller headers, without network',async()=>{
  const {default:worker}=await import('../dist/server/index.js');
  const nonces=[];
  for(let i=0;i<2;i++) {
    const response=await worker.fetch(new Request('https://security-test.invalid/entrar',{headers:{accept:'text/html','Content-Security-Policy':"script-src 'nonce-attacker'",'Content-Security-Policy-Report-Only':"script-src 'nonce-attacker'",'x-nonce':'attacker'}}),
      {ASSETS:{fetch:async()=>new Response('Fixture asset absent',{status:404})}},
      {waitUntil(){},passThroughOnException(){}});
    assert.equal(response.status,200);
    const policy=response.headers.get('Content-Security-Policy');
    assert.doesNotMatch(policy,/attacker|unsafe-eval/);
    const nonce=policy.match(/'nonce-([^']+)'/)?.[1];assert.ok(nonce);nonces.push(nonce);
    assert.match(response.headers.get('cache-control'),/no-store/);
    const html=await response.text(),scripts=[...html.matchAll(/<script\b([^>]*)>/g)];
    assert.ok(scripts.length>0);
    for(const script of scripts)assert.equal(script[1].match(/nonce="([^"]+)"/)?.[1],nonce);
  }
  assert.notEqual(nonces[0],nonces[1]);
});
test('installed braces patch bounds nested patterns and keeps ordinary globs',()=>{
  const require=createRequire(import.meta.url);
  const micromatch=require.resolve('micromatch',{paths:[require.resolve('eslint-config-next')]});
  const braces=createRequire(micromatch)('braces');
  for(const [left,right] of [['{','}'],['(',')']]) {
    assert.throws(()=>braces(left.repeat(1000)+'a'+right.repeat(1000)),error=>error instanceof SyntaxError && /nesting.*safe limit/.test(error.message));
  }
  assert.deepEqual(braces('{a,b}'),['(a|b)']);
});
