import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';

// Callback/hook contracts from actual production AST, not UI tests. JSX becomes
// inert nodes; child components, DOM, browser, network and real cache never run.
const files = ['app/inicio/page.tsx', 'app/laboratorio/page.tsx', 'lib/operational-data.ts', 'app/inicio/InvestmentSimulator.tsx'];
const sources = Object.fromEntries(files.map(file => [file, readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')]));
export const sourceHashes = Object.fromEntries(files.map(file => [file, createHash('sha256').update(sources[file]).digest('hex')]));
const asts = Object.fromEntries(files.map(file => [file, ts.createSourceFile(file, sources[file], ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)]));
function declaration(file, name) {
  const ast = asts[file];
  const node = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name || ts.isVariableStatement(node) && node.declarationList.declarations.some(item => item.name.getText(ast) === name));
  assert.ok(node, `Production declaration ${name} exists in ${file}`);
  return node.getText(ast);
}
const operational = 'lib/operational-data.ts';
const main = 'app/inicio/page.tsx';
const agenda = 'app/laboratorio/page.tsx';
function runtime(file, name, props = {}, store = new Map(), extra = {}) {
  let slots = [], cursor = 0, effects = [], dirty = false, tree;
  const useState = initial => {
    const index = cursor++;
    if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
    return [slots[index], value => {
      const next = typeof value === 'function' ? value(slots[index]) : value;
      if (!Object.is(next, slots[index])) { slots[index] = next; dirty = true; }
    }];
  };
  const useEffect = (callback, deps) => {
    const index = cursor++, old = slots[index];
    if (!old || deps.some((value, i) => !Object.is(value, old[i]))) { slots[index] = deps; effects.push(callback); }
  };
  const jsx = (type, props, ...children) => ({ type, props: { ...props, children } });
  const context = {
    exports: {}, React: { createElement: jsx, Fragment: 'fragment' }, useState, useEffect,
    useMemo: callback => { cursor++; return callback(); },
    useRef: initial => { const [ref] = useState(() => ({ current: initial })); return ref; },
    appStorage: { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) },
    document: { addEventListener() {}, removeEventListener() {} }, // inert capabilities, no DOM
    crypto: { randomUUID }, console,
    useAccess: () => ({ allowed: () => true, manage: true }),
    useHorizontalOverflow: () => ({ previous: false, next: false }),
    modules: { 'Manutenção': { tabs: ['Equipamento'] }, Vendas: { tabs: ['Dados'] } },
    taskStages: ['Entrada', 'A fazer', 'Em andamento', 'Em revisão', 'Concluída'],
    projectStages: ['A iniciar', 'Em andamento', 'Em risco', 'Concluído'],
    showAppToast() {}, ...extra,
  };
  // Imported visual components/icons are opaque node types. Production child
  // behavior is intentionally outside this component's isolated contract.
  function bindJsx(node) {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && ts.isIdentifier(node.tagName) && /^[A-Z]/.test(node.tagName.text) && !(node.tagName.text in context)) context[node.tagName.text] = node.tagName.text;
    if (ts.isImportDeclaration(node) && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
      for (const entry of node.importClause.namedBindings.elements) if (/^[A-Z]/.test(entry.name.text) && !(entry.name.text in context)) context[entry.name.text] = entry.name.text;
    }
    ts.forEachChild(node, bindJsx);
  }
  bindJsx(asts[file]);
  let body = ['readData', 'useStoredData', 'numberValue', 'money'].map(key => declaration(operational, key)).join('\n');
  if (file.endsWith('InvestmentSimulator.tsx')) body += ['brl', 'project', 'objectives'].map(key => declaration(file, key)).join('\n');
  body += '\n' + declaration(file, name) + `\nglobalThis.subject = ${name};`;
  // Remove only default export modifier: extracted declarations have no imports.
  body = body.replace('export default function', 'function');
  const compiled = ts.transpileModule(body, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.createContext(context);
  new vm.Script(compiled, { filename: `${name}.isolated.js` }).runInContext(context);
  const render = () => {
    let passes = 0;
    do {
      dirty = false; cursor = 0; effects = [];
      tree = context.subject(props);
      for (const callback of effects) callback();
      assert.ok(++passes < 20, 'hooks settle');
    } while (dirty);
    return tree;
  };
  render();
  return { render, store, get tree() { return tree; }, nodes: () => treeNodes(tree) };
}
function treeNodes(value, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return [];
  seen.add(value);
  return [...(Object.hasOwn(value, 'type') && value.props ? [value] : []), ...Object.values(value).flatMap(item => treeNodes(item, seen))];
}
const text = node => node == null || typeof node === 'boolean' ? '' : typeof node !== 'object' ? String(node) : Array.isArray(node) ? node.map(text).join('') : text(node.props?.children);
function find(runner, predicate) { const node = runner.nodes().find(predicate); assert.ok(node, 'contract node exists'); return node; }
const button = (runner, label) => find(runner, node => node.type === 'button' && text(node).trim() === label);
function input(runner, label) {
  const group = find(runner, node => node.type === 'label' && text(node).startsWith(label));
  return treeNodes(group).find(node => node.type === 'input');
}
const change = (runner, node, value) => { node.props.onChange({ target: { value } }); runner.render(); };
const click = (runner, node) => { node.props.onClick(); runner.render(); };
const json = (store, key) => JSON.parse(store.get(key));

test('WorkflowKanban hydration and remount preserve projects, tasks, files and comments', () => {
  const project = { id: 'fict-project', name: 'Projeto fictício', title: 'Projeto fictício', detail: 'Teste', owner: 'Fictício', due: '', priority: 'Média', stage: 'A iniciar' };
  const task = { id: 'fict-task', title: 'Tarefa fictícia', detail: 'Teste', owner: 'Fictício', due: '', priority: 'Média', stage: 'Entrada', projectId: project.id, daysInStage: 0, progress: 0, comments: [{ id: 'c1', text: 'Comentário fictício' }], files: [{ id: 'f1', name: 'arquivo-ficticio.txt' }] };
  const seed = { 'gest-workflow-projects': [project], 'gest-workflow-tasks': [task] };
  const store = new Map(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)]));
  for (const view of ['Tarefas', 'Projetos', 'Tarefas']) {
    const runner = runtime(main, 'WorkflowKanban', { view }, store);
    for (const [key, value] of Object.entries(seed)) assert.deepEqual(json(store, key), value);
    assert.ok(text(runner.tree).includes('Tarefa fictícia'));
  }
});

const pricing = { kind: 'Serviço', unit: 'Sessão', name: 'Serviço fictício', directCost: 120, purchaseUnits: 4, purchaseExtras: 8, materials: 5, packaging: 2, freight: 3, monthlyRent: 120, monthlyEnergy: 30, otherFixed: 50, monthlyVolume: 20, monthlyCompensation: 1000, productiveHours: 100, executionHours: 2.5, loss: 3, tax: 4, commission: 5, paymentFee: 2, discountReserve: 1, margin: 15, includeTax: false, includeFees: true };
test('PricingView saves every field and reopens the same pricing snapshot', () => {
  const store = new Map([['gest-pricing-draft', JSON.stringify(pricing)]]);
  let runner = runtime(main, 'PricingView', {}, store);
  click(runner, button(runner, 'Salvar precificação'));
  assert.deepEqual(json(store, 'gest-pricing-draft'), pricing);
  runner = runtime(main, 'PricingView', {}, store);
  assert.equal(input(runner, 'Nome do serviço').props.value, pricing.name);
  assert.equal(input(runner, 'Horas para executar o serviço').props.value, pricing.executionHours);
  assert.equal(find(runner, node => node.props.label === 'Aluguel').props.value, pricing.monthlyRent);
  click(runner, button(runner, 'Salvar precificação'));
  find(runner, node => node.props.label === 'Aluguel').props.setValue(140); runner.render();
  assert.ok(button(runner, 'Salvar precificação'));
  click(runner, button(runner, 'Salvar precificação'));
  assert.deepEqual(json(store, 'gest-pricing-draft'), { ...pricing, monthlyRent: 140 });
});
test('PricingView adds original catalog details and deduplicates repeated saves', () => {
  const store = new Map([['gest-pricing-draft', JSON.stringify(pricing)]]);
  const runner = runtime(main, 'PricingView', {}, store);
  click(runner, button(runner, 'Adicionar à lista de serviços'));
  const row = json(store, 'gest-priced-catalog')[0];
  const fields = json(store, `gest-record-inputs-Catálogo-${row[0]}`);
  assert.equal(fields['Nome / título'], pricing.name);
  // Catalog duration uses minutes (RecordDialog example: "60 minutos").
  assert.equal(fields['Duração estimada do serviço (opcional)'], '150');
  assert.equal(fields['Quantidade / unidade'], 'Sessão');
  assert.equal(fields['Custo total'], find(runner, node => node.props.label === 'Custo base').props.value);
  assert.equal(fields['Preço de venda'], row[4]);
  assert.equal(json(store, 'gest-service-commercial-terms')[row[0]].commissionRate, 5);
  change(runner, input(runner, 'Nome do serviço'), '  SERVIÇO FICTÍCIO  ');
  click(runner, button(runner, 'Adicionar à lista de serviços'));
  const rows = json(store, 'gest-priced-catalog');
  assert.equal(rows.length, 1); assert.equal(rows[0][0], row[0]);
});
test('FullDetailView Cancel discards a draft; Save persists only the edited record', () => {
  const key = 'gest-record-details-Manutenção-fict-1';
  const store = new Map([[key, '{}'], ['gest-record-details-Manutenção-other', '{"keep":true}']]);
  const props = { view: 'Manutenção', record: ['fict-1', 'Equipamento fictício', 'Categoria', '18/10/2026', 'R$ 10,00', 'Ativo'], onBack() {} };
  let runner = runtime(main, 'FullDetailView', props, store);
  click(runner, button(runner, 'Editar equipamento'));
  change(runner, input(runner, 'Equipamento'), 'Rascunho cancelado');
  click(runner, button(runner, 'Cancelar'));
  assert.deepEqual(json(store, key), {});
  click(runner, button(runner, 'Editar equipamento'));
  assert.equal(input(runner, 'Equipamento').props.value, 'Equipamento fictício');
  change(runner, input(runner, 'Equipamento'), 'Equipamento salvo');
  click(runner, button(runner, 'Salvar alterações'));
  assert.deepEqual(json(store, key), { 'Equipamento:Equipamento': 'Equipamento salvo' });
  runner = runtime(main, 'FullDetailView', props, store);
  assert.ok(text(runner.tree).includes('Equipamento salvo'));
  assert.deepEqual(json(store, 'gest-record-details-Manutenção-other'), { keep: true });
});
test('StageSettingsDialog returns rename mapping and persisted task options', () => {
  let result;
  const runner = runtime(main, 'StageSettingsDialog', { title: 'Etapas', stages: ['Entrada', 'Em andamento', 'Concluída'], showTaskOptions: true, onClose() {}, onSave: (...args) => { result = args; } }, new Map([['gest-task-options', '{"requireOwner":false,"deadlineAlerts":true}']]));
  change(runner, find(runner, node => node.type === 'input' && node.props.value === 'Entrada'), 'Nova entrada');
  const switches = runner.nodes().filter(node => node.type === 'button' && String(node.props.className).startsWith('switch'));
  assert.equal(switches[0].props.className, 'switch');
  click(runner, switches[1]);
  find(runner, node => node.type === 'form').props.onSubmit({ preventDefault() {} });
  const clean = JSON.parse(JSON.stringify(result));
  assert.deepEqual(clean, [['Nova entrada', 'Em andamento', 'Concluída'], { requireOwner: false, deadlineAlerts: false }, { Entrada: 'Nova entrada', 'Em andamento': 'Em andamento', 'Concluída': 'Concluída' }]);
});
test('EventCardPreview callback retains responsible, location, note, tone, event type and video', () => {
  let saved;
  const props = { initialTitle: 'Evento fictício', initialDate: '2026-10-18', initialStart: '09:00', initialEnd: '10:00', onSave: value => { saved = value; } };
  const runner = runtime(agenda, 'EventCardPreview', props);
  for (const [id, value] of [['owner', 'Responsável fictício'], ['location', 'Sala fictícia']]) {
    find(runner, node => node.props.id === id).props.onValueChange(value); runner.render();
  }
  click(runner, find(runner, node => node.props['aria-label'] === 'Adicionar observação'));
  change(runner, find(runner, node => node.type === 'textarea'), 'Nota fictícia');
  click(runner, button(runner, 'Adicionar videoconferência'));
  change(runner, find(runner, node => node.type === 'input' && node.props.type === 'url'), 'https://example.invalid/sala');
  click(runner, button(runner, 'Consulta'));
  click(runner, find(runner, node => node.props['aria-label'] === 'Etiqueta green'));
  click(runner, button(runner, 'Salvar evento'));
  const expected = { responsible: 'Responsável fictício', location: 'Sala fictícia', note: 'Nota fictícia', videoUrl: 'https://example.invalid/sala', eventType: 'consulta', tone: 'green' };
  for (const [key, value] of Object.entries(expected)) assert.equal(saved[key], value);
  assert.equal(saved.date, '2026-10-18'); assert.equal(saved.startMinutes, 540); assert.equal(saved.durationSlots, 4);
  const reopened = runtime(agenda, 'EventCardPreview', { ...props, ...Object.fromEntries(Object.entries(expected).map(([key, value]) => [`initial${key[0].toUpperCase()}${key.slice(1)}`, value])) });
  click(reopened, button(reopened, 'Salvar evento'));
  for (const [key, value] of Object.entries(expected)) assert.equal(saved[key], value);
});
test('Férias uses a total budget: travelers change per-person breakdown, not the total target', () => {
  const runner = runtime('app/inicio/InvestmentSimulator.tsx', 'InvestmentSimulator');
  click(runner, find(runner, node => node.type === 'button' && text(node).startsWith('Férias')));
  change(runner, input(runner, 'Orçamento total da viagem (sem reserva)'), 1000);
  change(runner, input(runner, 'Reserva para imprevistos (%)'), 20);
  change(runner, input(runner, 'Quantidade de pessoas'), 1);
  const metrics = () => find(runner, node => node.props.className === 'investment-metrics');
  const first = treeNodes(metrics()).find(node => node.type === 'strong');
  assert.equal(text(first), 'R$ 1.200');
  assert.ok(text(metrics()).includes('1 pessoa(s) · R$ 1.200 por pessoa'));
  change(runner, input(runner, 'Quantidade de pessoas'), 4);
  assert.equal(text(treeNodes(metrics()).find(node => node.type === 'strong')), 'R$ 1.200');
  assert.ok(text(metrics()).includes('4 pessoa(s) · R$ 300 por pessoa'));
});
