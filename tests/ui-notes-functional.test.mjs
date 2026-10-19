import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';

// Production callbacks/hooks, not browser/UI tests. Child components are opaque
// JSX nodes. AST instrumentation exposes only reviewOpen's setter, since the
// existing UI does not reopen a previously completed review after remount.
const files = ['app/laboratorio/page.tsx', 'app/inicio/SettingsPlans.tsx', 'lib/operational-data.ts'];
const sources = Object.fromEntries(files.map(file => [file, readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')]));
export const sourceHashes = Object.fromEntries(files.map(file => [file, createHash('sha256').update(sources[file]).digest('hex')]));
const asts = Object.fromEntries(files.map(file => [file, ts.createSourceFile(file, sources[file], ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)]));
function declaration(file, name) {
  const ast = asts[file];
  const node = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name || ts.isVariableStatement(node) && node.declarationList.declarations.some(item => item.name.getText(ast) === name));
  assert.ok(node, `${name} exists in production`); return node;
}
function nodes(value, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return [];
  seen.add(value); return [...(value.props && Object.hasOwn(value, 'type') ? [value] : []), ...Object.values(value).flatMap(item => nodes(item, seen))];
}
const text = value => value == null || typeof value === 'boolean' ? '' : typeof value !== 'object' ? String(value) : Array.isArray(value) ? value.map(text).join('') : text(value.props?.children);
function runtime(name = 'AgendaPreview', store = new Map(), props = {}) {
  const file = name === 'AgendaPreview' ? files[0] : files[1];
  let slots = [], cursor = 0, effects = [], dirty = false, tree;
  const writes = [], messages = [];
  const context = {
    exports: {}, React: { Fragment: 'fragment', createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { const next = typeof value === 'function' ? value(slots[index]) : value; if (!Object.is(next, slots[index])) { slots[index] = next; dirty = true; } }];
    },
    useRef(initial) { const [ref] = context.useState(() => ({ current: initial })); return ref; },
    useEffect(callback, deps) { const index = cursor++, old = slots[index]; if (!old || deps.some((value, i) => !Object.is(value, old[i]))) { slots[index] = deps; effects.push(callback); } },
    appStorage: { getItem: key => store.get(key) ?? null, setItem: (key, value) => { writes.push([key, value]); store.set(key, value); } },
    announceAppAction: message => messages.push(message), setInterval: () => 1, clearInterval() {},
    document: { addEventListener() {}, removeEventListener() {} },
  };
  function visualBindings(node) {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && ts.isIdentifier(node.tagName) && /^[A-Z]/.test(node.tagName.text)) context[node.tagName.text] ??= node.tagName.text;
    if (ts.isImportDeclaration(node) && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) for (const item of node.importClause.namedBindings.elements) if (/^[A-Z]/.test(item.name.text)) context[item.name.text] ??= item.name.text;
    ts.forEachChild(node, visualBindings);
  }
  visualBindings(asts[file]);
  let component = declaration(file, name);
  if (name === 'AgendaPreview') {
    // Insert instrumentation before the component's own return only. No
    // production condition, effect, validation or callback is replaced.
    const statements = component.body.statements.flatMap(item => ts.isReturnStatement(item) ? [
      ts.factory.createExpressionStatement(ts.factory.createBinaryExpression(ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('globalThis'), '__openReview'), ts.SyntaxKind.EqualsToken, ts.factory.createIdentifier('setReviewOpen'))), item,
    ] : [item]);
    component = ts.factory.updateFunctionDeclaration(component, component.modifiers, component.asteriskToken, component.name, component.typeParameters, component.parameters, component.type, ts.factory.updateBlock(component.body, statements));
  }
  let body = ts.createPrinter().printNode(ts.EmitHint.Unspecified, component, asts[file]);
  if (name === 'AgendaPreview') body = ['initialAgendaEvents', 'agendaMonthNames', 'agendaDayNames', 'agendaTime'].map(key => declaration(file, key).getText(asts[file])).join('\n') + '\n' + declaration(files[2], 'agendaRecordDate').getText(asts[files[2]]) + '\n' + body;
  body = body.replace('export default function', 'function') + `\nglobalThis.subject=${name};`;
  vm.createContext(context); new vm.Script(ts.transpileModule(body, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React } }).outputText).runInContext(context);
  const render = () => {
    let passes = 0;
    do { dirty = false; cursor = 0; effects = []; tree = context.subject(props); for (const callback of effects) callback(); assert.ok(++passes < 15, 'hooks settle'); } while (dirty);
  };
  render();
  return { store, writes, messages, render, get tree() { return tree; }, all: () => nodes(tree), openReview() { context.__openReview(true); render(); } };
}
function find(r, predicate) { const node = r.all().find(predicate); assert.ok(node, 'expected production node exists'); return node; }
const button = (r, label) => find(r, node => node.type === 'button' && text(node).trim() === label);
const click = (r, node) => { node.props.onClick(); r.render(); };
function field(r, label) {
  const group = find(r, node => node.type === 'label' && text(node).startsWith(label));
  const input = nodes(group).find(node => node.type === 'input'); assert.ok(input); return input;
}
function fill(r, label, value) { field(r, label).props.onChange({ target: { value, checked: value } }); r.render(); }
function select(r, label, value) { find(r, node => node.props.label === label).props.onChange(value); r.render(); }
function submit(r) { find(r, node => node.type === 'form' && node.props.className === 'agenda-confirm-card').props.onSubmit({ preventDefault() {} }); r.render(); }
const key = 'gest-agenda-event-review';
const payload = r => JSON.parse(r.store.get(key));
function completed() { const r = runtime(); click(r, button(r, 'Sim, aconteceu')); return r; }
function responsible(r, name = 'Responsável fictício') { fill(r, 'Responsável pelo atendimento', name); fill(r, 'Confirmo o responsável pelo atendimento', true); }

test('pending review cannot persist before selecting outcome', () => {
  const r = runtime(); submit(r); assert.equal(r.store.has(key), false);
});
for (const scenario of ['empty responsible', 'whitespace responsible', 'unconfirmed responsible', 'blank insurer', 'empty third-party name', 'whitespace third-party role']) test(`completed review rejects ${scenario}`, () => {
  const r = completed(); responsible(r);
  if (scenario === 'empty responsible') fill(r, 'Responsável pelo atendimento', '');
  if (scenario === 'whitespace responsible') { fill(r, 'Responsável pelo atendimento', '   '); fill(r, 'Confirmo o responsável pelo atendimento', true); }
  if (scenario === 'unconfirmed responsible') fill(r, 'Confirmo o responsável pelo atendimento', false);
  if (scenario === 'blank insurer') { select(r, 'Tipo de atendimento', 'Plano'); fill(r, 'Plano / convênio', '   '); }
  if (scenario.startsWith('empty third') || scenario.startsWith('whitespace third')) {
    select(r, 'Participação de terceiros', 'Sim'); fill(r, 'Nome do terceiro', scenario.startsWith('empty') ? '' : 'Terceiro fictício'); fill(r, 'Participação / função', scenario.startsWith('empty') ? 'Auxiliar' : '  ');
  }
  submit(r); assert.equal(r.store.has(key), false); assert.ok(r.messages.some(value => value.includes('Preencha e confirme')));
});
test('changing responsible invalidates the earlier confirmation', () => {
  const r = completed(); responsible(r); fill(r, 'Responsável pelo atendimento', 'Outra pessoa');
  assert.equal(field(r, 'Confirmo o responsável pelo atendimento').props.checked, false); submit(r); assert.equal(r.store.has(key), false);
});
test('hidden plan and third-party fields are excluded after Particular/Não selection', () => {
  const r = completed(); responsible(r, '  Responsável fictício  ');
  select(r, 'Tipo de atendimento', 'Plano'); fill(r, 'Plano / convênio', 'Convênio oculto'); fill(r, 'Categoria', 'Categoria oculta'); fill(r, 'Autorização', 'Autorização oculta');
  select(r, 'Participação de terceiros', 'Sim'); fill(r, 'Nome do terceiro', 'Pessoa oculta'); fill(r, 'Participação / função', 'Função oculta');
  select(r, 'Tipo de atendimento', 'Particular'); select(r, 'Participação de terceiros', 'Não'); submit(r);
  const saved = payload(r);
  assert.deepEqual(saved.coverage, { kind: 'Particular', insurer: '', category: '', authorization: '' }); assert.equal(saved.thirdParty, null);
  assert.deepEqual(saved.responsible, { name: 'Responsável fictício', confirmed: true });
  assert.ok(!JSON.stringify(saved).includes('ocult')); assert.equal(saved.outcome, 'completed');
});
test('new Plan/third-party fields persist and hydrate on a fresh component mount', () => {
  const r = completed(); responsible(r, '  Responsável fictício  '); select(r, 'Tipo de atendimento', 'Plano');
  fill(r, 'Plano / convênio', 'Convênio fictício'); fill(r, 'Categoria', 'Categoria fictícia'); fill(r, 'Autorização', 'AUTH-FICT');
  select(r, 'Participação de terceiros', 'Sim'); fill(r, 'Nome do terceiro', '  Terceiro fictício  '); fill(r, 'Participação / função', '  Auxiliar  '); submit(r);
  const saved = payload(r); assert.deepEqual(saved.thirdParty, { name: 'Terceiro fictício', role: 'Auxiliar' });
  assert.deepEqual(saved.coverage, { kind: 'Plano', insurer: 'Convênio fictício', category: 'Categoria fictícia', authorization: 'AUTH-FICT' });
  const reopened = runtime('AgendaPreview', r.store); reopened.openReview();
  assert.equal(find(reopened, node => node.props.label === 'Tipo de atendimento').props.value, 'Plano');
  assert.equal(field(reopened, 'Plano / convênio').props.value, saved.coverage.insurer); assert.equal(field(reopened, 'Categoria').props.value, saved.coverage.category); assert.equal(field(reopened, 'Autorização').props.value, saved.coverage.authorization);
  assert.equal(field(reopened, 'Responsável pelo atendimento').props.value, saved.responsible.name); assert.equal(field(reopened, 'Confirmo o responsável pelo atendimento').props.checked, true);
  assert.equal(find(reopened, node => node.props.label === 'Participação de terceiros').props.value, 'Sim'); assert.equal(field(reopened, 'Nome do terceiro').props.value, saved.thirdParty.name); assert.equal(field(reopened, 'Participação / função').props.value, saved.thirdParty.role);
});
test('Particular does not require plan or third-party fields', () => {
  const r = completed(); responsible(r); submit(r); assert.equal(payload(r).coverage.kind, 'Particular'); assert.equal(payload(r).thirdParty, null);
});
test('SettingsPlans comparison actions navigate without storage changes or changing current plan', () => {
  let navigations = 0;
  const r = runtime('SettingsPlans', new Map([['fictitious-plan', 'Standard']]), { onCompare: () => { navigations++; } });
  const actions = r.all().filter(node => node.type === 'button'); assert.equal(actions.length, 3);
  for (const action of actions) click(r, action);
  assert.equal(navigations, 3); assert.deepEqual(r.writes, []); assert.equal(r.store.get('fictitious-plan'), 'Standard');
  assert.equal(r.all().filter(node => node.type === 'article' && node.props['aria-label']?.includes('plano atual'))[0].props['aria-label'], 'Standard, plano atual');
});
