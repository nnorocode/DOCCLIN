import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, randomUUID, webcrypto } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';

// Real Worker + real requestSecurity/secureResponse, only Cloudflare upstreams
// and binding are mocked. No browser, network, real server, storage or database.
const files = ['lib/security-headers.ts', 'lib/request-security.ts', 'worker/index.ts'];
const sources = Object.fromEntries(files.map(file => [file, readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')]));
export const sourceHashes = Object.fromEntries(files.map(file => [file, createHash('sha256').update(sources[file]).digest('hex')]));
const body = files.map(file => {
  const ast = ts.createSourceFile(file, sources[file], ts.ScriptTarget.Latest, true);
  return ast.statements.filter(node => !ts.isImportDeclaration(node)).map(node => node.getFullText(ast)).join('\n');
}).join('\n');
const compiled = ts.transpileModule(body, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
function fixture(options = {}) {
  const logs = [], calls = [], keys = [], incoming = [];
  const upstream = async request => {
    calls.push('handler'); incoming.push(request);
    if (options.throwHandler) throw Error('PRIVATE SECRET TOKEN AND RAW BODY');
    return new Response(options.handler500 ? 'PRIVATE SECRET TOKEN AND RAW BODY' : 'ok', { status: options.handler500 ? 500 : 200 });
  };
  const context = {
    exports: {}, Request, Response, Headers, URL, TextEncoder, Uint8Array,
    crypto: { subtle: webcrypto.subtle, randomUUID }, process: { env: { NODE_ENV: 'production' } },
    console: { warn: message => logs.push(JSON.parse(message)) },
    handler: { fetch: upstream }, DEFAULT_DEVICE_SIZES: [640], DEFAULT_IMAGE_SIZES: [64],
    handleImageOptimization: async () => {
      calls.push('image');
      if (options.throwImage) throw Error('PRIVATE IMAGE DETAIL');
      return new Response(options.image500 ? 'PRIVATE IMAGE DETAIL' : 'image', { status: options.image500 ? 500 : 200 });
    },
  };
  vm.createContext(context); new vm.Script(compiled).runInContext(context);
  const env = {};
  if (options.binding !== false) env.SECURITY_RATE_LIMITER = { limit: async ({ key }) => {
    calls.push('limit'); keys.push(key);
    if (options.limiterThrows) throw Error('PRIVATE LIMIT DETAIL');
    return { success: options.allowed !== false };
  } };
  const run = async (overrides = {}) => {
    const request = new Request(overrides.url ?? 'https://isolated.example.invalid/action', {
      method: overrides.method ?? 'POST',
      headers: { origin: 'https://isolated.example.invalid', 'CF-Connecting-IP': '192.0.2.42', ...overrides.headers },
    });
    if (overrides.cf !== false) Object.defineProperty(request, 'cf', { value: { colo: 'FICTITIOUS' } });
    return context.exports.default.fetch(request, env, { waitUntil() {}, passThroughOnException() {} });
  };
  return { run, logs, calls, keys, incoming };
}
async function generic(response, f) {
  assert.equal(response.status, 500);
  assert.match(response.headers.get('x-request-id'), /^[\da-f-]{36}$/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const result = await response.json();
  assert.equal(result.requestId, response.headers.get('x-request-id'));
  assert.equal(result.error, 'Não foi possível concluir a solicitação.');
  assert.ok(!JSON.stringify([result, f.logs]).includes('PRIVATE'));
  assert.deepEqual(Object.keys(f.logs.at(-1)).sort(), ['event', 'requestId', 'status', 'type']);
  assert.equal(f.logs.at(-1).event, 'server_error');
}
test('Worker sanitizes an upstream thrown error and logs only event/id/status', async () => {
  const f = fixture({ throwHandler: true }); await generic(await f.run(), f);
});
test('Worker sanitizes an upstream Response500 and preserves a generated request id', async () => {
  const f = fixture({ handler500: true }); await generic(await f.run(), f);
});
test('Worker sanitizes an image optimizer exception', async () => {
  const f = fixture({ throwImage: true }); await generic(await f.run({ method: 'GET', url: 'https://isolated.example.invalid/_vinext/image' }), f);
});
test('Worker sanitizes an image optimizer Response500', async () => {
  const f = fixture({ image500: true }); await generic(await f.run({ method: 'GET', url: 'https://isolated.example.invalid/_vinext/image' }), f);
});
test('CSRF stops a foreign Origin before limiter/upstream', async () => {
  const f = fixture(); const response = await f.run({ headers: { origin: 'https://foreign.example.invalid' } });
  assert.equal(response.status, 403); assert.deepEqual(f.calls, []); assert.equal(f.logs[0].event, 'csrf_blocked');
});
test('CF-Connecting-IP header alone cannot enable a request without runtime metadata', async () => {
  const f = fixture(); const response = await f.run({ cf: false });
  assert.equal(response.status, 503); assert.deepEqual(f.calls, []); assert.equal(f.logs[0].event, 'rate_limit_unavailable');
});
test('Missing limiter binding fails closed before upstream', async () => {
  const f = fixture({ binding: false }); const response = await f.run();
  assert.equal(response.status, 503); assert.deepEqual(f.calls, []);
});
test('Runtime CF IP is hashed for limiter and permitted request reaches upstream', async () => {
  const f = fixture(); const response = await f.run();
  assert.equal(response.status, 200); assert.deepEqual(f.calls, ['limit', 'handler']);
  assert.equal(f.keys[0], createHash('sha256').update('192.0.2.42').digest('hex'));
  assert.ok(!JSON.stringify(f.logs).includes('192.0.2.42'));
});
test('Rate refusal yields429+RetryAfter and no upstream request', async () => {
  const f = fixture({ allowed: false }); const response = await f.run();
  assert.equal(response.status, 429); assert.equal(response.headers.get('retry-after'), '60'); assert.deepEqual(f.calls, ['limit']);
});
test('Limiter exception yields generic503 without exposing exception or calling upstream', async () => {
  const f = fixture({ limiterThrows: true }); const response = await f.run();
  assert.equal(response.status, 503); assert.ok(!(await response.text()).includes('PRIVATE')); assert.deepEqual(f.calls, ['limit']);
});
test('HTTP remote GET redirects to HTTPS before upstream', async () => {
  const f = fixture(); const response = await f.run({ method: 'GET', url: 'http://isolated.example.invalid/path' });
  assert.equal(response.status, 308); assert.equal(response.headers.get('location'), 'https://isolated.example.invalid/path'); assert.deepEqual(f.calls, []);
});
test('HTTP remote POST refuses mutation instead of replaying a body through redirect', async () => {
  const f = fixture(); const response = await f.run({ url: 'http://isolated.example.invalid/action' });
  assert.equal(response.status, 400); assert.equal(response.headers.get('location'), null); assert.deepEqual(f.calls, []);
});
test('Client-provided CSP/nonce never reaches upstream', async () => {
  const f = fixture(); const response = await f.run({ method: 'GET', headers: { 'x-nonce': 'FORGED', 'content-security-policy': 'FORGED', 'content-security-policy-report-only': 'FORGED', 'x-request-id': 'FORGED' } });
  assert.equal(response.status, 200);
  for (const header of ['x-nonce', 'content-security-policy', 'content-security-policy-report-only']) assert.equal(f.incoming[0].headers.get(header), null);
  assert.notEqual(response.headers.get('x-request-id'), 'FORGED');
});
