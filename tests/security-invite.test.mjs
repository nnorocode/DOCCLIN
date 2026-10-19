import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the production Deno handler; all Supabase clients are explicit mocks.
// No network, database, browser, emails or real credentials are used.
const source = readFileSync(new URL('../supabase/functions/invite-member/index.ts', import.meta.url), 'utf8');
export const inviteSourceHash = createHash('sha256').update(source).digest('hex');
const ast = ts.createSourceFile('invite-member.ts', source, ts.ScriptTarget.Latest, true);
const body = ast.statements.filter(node => !ts.isImportDeclaration(node)).map(node => node.getFullText(ast)).join('\n');
const compiled = ts.transpileModule(body, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
const origin = 'https://isolated.example.invalid';
const draft = { business_id: '11111111-1111-4111-8111-111111111111', email: 'fictitious@example.invalid', name: 'Fictitious person', role: 'employee' };

function fixture(options = {}) {
  let handler;
  const calls = [], filters = [];
  const caller = {
    auth: { getUser: async () => {
      calls.push('getUser');
      if (options.throwAuth) throw new Error('PRIVATE AUTH DETAIL');
      return { data: { user: options.invalidJwt ? null : { id: 'fictitious-user' } }, error: null };
    } },
    from(table) {
      assert.equal(table, 'business_members');
      const query = { select: () => query, eq: (key, value) => { filters.push([key, value]); return query; }, single: async () => ({ data: options.foreignBusiness ? null : { role: options.role ?? 'owner' }, error: null }) };
      return query;
    },
    async rpc(name, args) {
      assert.equal(name, 'consume_invitation_quota');
      assert.equal(args.business, draft.business_id);
      calls.push('quota');
      return { data: options.quota ?? true, error: options.quotaError ? { message: 'PRIVATE QUOTA DETAIL' } : null };
    },
  };
  const service = {
    auth: { admin: { async inviteUserByEmail(email, config) {
      calls.push('invite');
      assert.equal(email, draft.email);
      assert.equal(config.redirectTo, `${origin}/entrar`);
      if (options.throwInvite) throw new Error('PRIVATE PROVIDER DETAIL');
      return { data: { user: options.inviteError ? null : { id: 'fictitious-invited' } }, error: options.inviteError ? { message: 'PRIVATE INVITE DETAIL' } : null };
    } } },
    async rpc(name, args) {
      assert.equal(name, 'register_invited_member'); calls.push('register');
      assert.equal(args.business, draft.business_id);
      assert.equal(args.inviting_user, 'fictitious-user');
      return { error: options.saveError ? { message: 'PRIVATE DB DETAIL' } : null };
    },
  };
  const context = {
    Response, TextDecoder,
    createClient: (_url, key) => {
      if (key === 'fictitious-service-key') { calls.push('service'); assert.ok(calls.includes('quota')); return service; }
      calls.push('caller'); return caller;
    },
    Deno: {
      env: { get: key => ({ APP_ORIGIN: origin, SUPABASE_URL: 'https://offline.example.invalid', SUPABASE_ANON_KEY: 'fictitious-public-key', SUPABASE_SERVICE_ROLE_KEY: 'fictitious-service-key' })[key] },
      serve: fn => { handler = fn; },
    },
  };
  vm.createContext(context); new vm.Script(compiled).runInContext(context);
  const run = async (requestOptions = {}) => {
    const headers = { origin, authorization: 'Bearer fictitious', 'content-type': 'application/json', ...requestOptions.headers };
    if (requestOptions.anonymous) delete headers.authorization;
    const request = new Request(`${origin}/invite-member`, { method: 'POST', headers, body: requestOptions.raw ?? JSON.stringify(requestOptions.body ?? draft), duplex: 'half' });
    const response = await handler(request);
    const result = await response.json();
    assert.ok(!JSON.stringify(result).includes('PRIVATE'), 'internal errors are not returned');
    return { response, result };
  };
  return { run, calls, filters };
}

for (const scenario of [
  { name: 'anonymous', request: { anonymous: true }, status: 401 },
  { name: 'invalid JWT', config: { invalidJwt: true }, status: 401 },
  { name: 'employee', config: { role: 'employee' }, status: 403 },
  { name: 'foreign business', config: { foreignBusiness: true }, status: 403 },
  { name: 'admin inviting admin', config: { role: 'admin' }, request: { body: { ...draft, role: 'admin' } }, status: 403 },
  { name: 'owner role requested', request: { body: { ...draft, role: 'owner' } }, status: 400 },
]) test(`invite rejects ${scenario.name} before privileged client`, async () => {
  const f = fixture(scenario.config);
  const { response } = await f.run(scenario.request);
  assert.equal(response.status, scenario.status);
  assert.ok(!f.calls.includes('service')); assert.ok(!f.calls.includes('quota'));
});

for (const raw of ['null', '[]', '{broken']) test(`invite rejects malformed body ${raw}`, async () => {
  const f = fixture(); const { response } = await f.run({ raw });
  assert.equal(response.status, 400); assert.ok(!f.calls.includes('quota')); assert.ok(!f.calls.includes('service'));
});
test('invite rejects declared oversized body before parsing', async () => {
  const f = fixture(); const { response } = await f.run({ headers: { 'content-length': '16385' } });
  assert.equal(response.status, 413); assert.ok(!f.calls.includes('service'));
});
test('invite rejects oversized streamed body even without content-length', async () => {
  const f = fixture(); const { response } = await f.run({ raw: ' '.repeat(16385) });
  assert.equal(response.status, 413); assert.ok(!f.calls.includes('quota')); assert.ok(!f.calls.includes('service'));
});
test('invite counts bytes across multiple chunks and cancels a body larger than the declared length', async () => {
  let cancelled = false;
  const bytes = new TextEncoder().encode('á'.repeat(5000));
  const raw = new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.enqueue(bytes); }, cancel() { cancelled = true; } });
  const f = fixture(); const { response } = await f.run({ raw, headers: { 'content-length': '1' } });
  assert.equal(response.status, 413); assert.equal(cancelled, true); assert.ok(!f.calls.includes('service'));
});
test('invite fails closed when quota RPC errors', async () => {
  const f = fixture({ quotaError: true }); const { response } = await f.run();
  assert.equal(response.status, 503); assert.ok(!f.calls.includes('service'));
});
test('invite quota refusal returns 429 and retry header without sending an invitation', async () => {
  const f = fixture({ quota: false }); const { response } = await f.run();
  assert.equal(response.status, 429); assert.equal(response.headers.get('retry-after'), '600'); assert.ok(!f.calls.includes('service'));
});
test('invite success validates tenant and actor, consumes quota, then invites and registers', async () => {
  const f = fixture(); const { response, result } = await f.run();
  assert.equal(response.status, 200); assert.deepEqual(result, { ok: true });
  assert.deepEqual(f.filters, [['business_id', draft.business_id], ['user_id', 'fictitious-user'], ['active', true]]);
  assert.deepEqual(f.calls, ['caller', 'getUser', 'quota', 'service', 'invite', 'register']);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
});
for (const [option, expected] of [['inviteError', 400], ['saveError', 500], ['throwInvite', 500], ['throwAuth', 500]]) test(`invite ${option} returns a generic error`, async () => {
  const f = fixture({ [option]: true }); const { response, result } = await f.run();
  assert.equal(response.status, expected); assert.equal(typeof result.error, 'string'); assert.deepEqual(Object.keys(result), ['error']);
});
test('invite rejects a foreign Origin before loading any client', async () => {
  const f = fixture(); const { response } = await f.run({ headers: { origin: 'https://foreign.example.invalid' } });
  assert.equal(response.status, 403); assert.deepEqual(f.calls, []); assert.equal(response.headers.get('access-control-allow-origin'), null);
});
