import test, { after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

// Production functions, with explicit in-memory dependencies. No React DOM,
// browser, network, database, or real browser storage is loaded by this suite.
const token = Symbol.for('docclin.functional-regressions');
const store = new Map();
const writes = [];
const context = {
  store,
  hooks: null,
  bindings: {
    appStorage: {
      getItem: key => store.get(key) ?? null,
      setItem: (key, value) => { writes.push([key, value]); store.set(key, value); },
    },
    useState: (...args) => context.hooks.useState(...args),
    useEffect: (...args) => context.hooks.useEffect(...args),
    listClinicalRecords: () => { throw new Error('DB access is outside this isolated regression suite'); },
    clinicalTransactions: () => { throw new Error('Clinical synchronization is covered by the clinical suites'); },
  },
};
globalThis[token] = context;
after(() => { delete globalThis[token]; });
beforeEach(() => { store.clear(); writes.length = 0; context.hooks = null; });

const compile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;

async function loadIsolated(relative, bindings = {}) {
  const source = await readFile(new URL(relative, import.meta.url), 'utf8');
  const ast = ts.createSourceFile(relative, source, ts.ScriptTarget.Latest, true);
  const names = [];
  for (const item of ast.statements.filter(ts.isImportDeclaration)) {
    if (item.importClause?.isTypeOnly) continue;
    const named = item.importClause?.namedBindings;
    assert.ok(named && ts.isNamedImports(named), `Explicit dependency injection required for ${item.getText(ast)}`);
    for (const entry of named.elements.filter(entry => !entry.isTypeOnly)) {
      const name = entry.name.text;
      assert.ok(Object.hasOwn(bindings, name), `Missing isolated binding ${name} in ${relative}`);
      context.bindings[name] = bindings[name];
      names.push(name);
    }
  }
  const body = ast.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getFullText(ast)).join('\n');
  const prefix = names.length ? `const {${names.join(',')}}=globalThis[Symbol.for('docclin.functional-regressions')].bindings;\n` : '';
  return import(`data:text/javascript;base64,${Buffer.from(compile(prefix + body)).toString('base64')}`);
}

const finance = await loadIsolated('../app/inicio/finance-model.ts');
const operational = await loadIsolated('../lib/operational-data.ts', { ...context.bindings, ...finance });
const pageSource = await readFile(new URL('../app/inicio/page.tsx', import.meta.url), 'utf8');
const pageAst = ts.createSourceFile('page.tsx', pageSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const filterDeclaration = pageAst.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'moduleFilterValue');
assert.ok(filterDeclaration, 'Expose the module filter contract if it moves out of page.tsx');
const moduleFilterValue = vm.runInNewContext(`${compile(filterDeclaration.getText(pageAst))}\nmoduleFilterValue`);

const date = '2026-10-18';
const range = { start: '2026-10-01', end: '2026-10-31' };
const sale = () => ['fixture-sale', 'Venda fictícia', 'Pix', date, '250,00', 'Ativo', '0', '1', 'Cliente fictício', '0', '20,00'];
const saved = () => JSON.parse(store.get('gest-finance-transactions') ?? '[]');
const persist = rows => store.set('gest-finance-transactions', JSON.stringify(rows));
function paidSale() {
  const row = sale();
  operational.registerModuleSale(row);
  const transactions = saved();
  transactions[0].installments[0].status = 'paid';
  transactions[0].installments[0].settledAt = date;
  persist(transactions);
  return row;
}

test('renomear venda liquidada preserva parcela, baixa e resultado de caixa', () => {
  const row = paidSale();
  const before = finance.summarize(saved(), range, 'cash');
  row[1] = 'Descrição corrigida';
  operational.registerModuleSale(row);
  const after = saved();
  assert.equal(after.length, 1);
  assert.equal(after[0].description, row[1]);
  assert.equal(after[0].installments[0].status, 'paid');
  assert.equal(after[0].installments[0].settledAt, date);
  assert.equal(finance.summarize(after, range, 'cash').receivedCents, before.receivedCents);
});

for (const [label, column, value] of [['valor', 4, '300,00'], ['desconto', 6, '10'], ['data', 3, '2026-10-19'], ['parcelas', 7, '2']]) {
  test(`alterar ${label} de venda liquidada recusa sem alterar o armazenamento`, () => {
    const row = paidSale();
    const before = store.get('gest-finance-transactions');
    row[column] = value;
    assert.throws(() => operational.registerModuleSale(row), /estorn|liquidad/i);
    assert.equal(store.get('gest-finance-transactions'), before);
  });
}

test('cancelar venda mantém uma identidade e exclui receita e compromissos', () => {
  const row = sale();
  operational.registerModuleSale(row);
  row[5] = 'Cancelado';
  operational.registerModuleSale(row);
  operational.registerModuleSale(row);
  const rows = saved();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].cancelled, true);
  assert.ok(rows[0].installments.every(part => part.status === 'cancelled'));
  const summary = finance.summarize(rows, range, 'accrual');
  assert.equal(summary.grossCents, 0);
  assert.equal(summary.receivableCents, 0);
});

test('estoque respeita mínimo salvo em métricas e indicadores, sem somar produto acima do limite', () => {
  const low = ['stock-low', 'Material', 'Produto', '3', date, '10,00', 'Ativo', 'Lote fictício', '2027-01-01'];
  const high = ['stock-high', 'Material B', 'Produto', '8', date, '5,00', 'Ativo', '', ''];
  store.set('gest-stock-alert-settings', JSON.stringify({ threshold: '5' }));
  store.set('gest-stock-records', JSON.stringify([low, high]));
  assert.equal(operational.stockIsCritical(low), true);
  assert.equal(operational.stockIsCritical(high), false);
  assert.equal(operational.moduleMetric('Estoque crítico', [low, high], operational.moduleColumns('Estoque')), '1');
  assert.equal(operational.indicatorValue('Estoque · Alertas'), 1);
  store.set('gest-stock-alert-settings', JSON.stringify({ threshold: '2' }));
  assert.equal(operational.stockIsCritical(low), false);
});

test('filtro Estoque lê Status e data, sem confundir validade ou quantidade', () => {
  const row = ['stock', 'Material', 'Produto', '3', date, '10', 'Ativo', 'Lote', '2027-01-01'];
  assert.equal(moduleFilterValue(row, 'Status', 'Estoque'), 'Ativo');
  assert.equal(moduleFilterValue(row, 'Período', 'Estoque'), date);
});

for (const view of ['Vendas', 'Manutenção', 'Catálogo']) {
  test(`filtro ${view} lê Status do contrato expandido, não custo direto`, () => {
    const row = [...sale(), 'Responsável fictício'];
    assert.equal(moduleFilterValue(row, 'Status', view), 'Ativo');
    assert.equal(moduleFilterValue(row, 'Data', view), date);
    assert.equal(moduleFilterValue(row, 'Responsável', view), 'Responsável fictício');
  });
}

test('validIsoDate distingue calendário válido de datas normalizadas e formatos incompletos', () => {
  for (const value of ['2024-02-29', '2000-02-29', '2026-10-18']) assert.equal(finance.validIsoDate(value), true, value);
  for (const value of ['', '2026-02-31', '2026-02-29', '1900-02-29', '2026-04-31', '2026-13-01', '2026-2-01', '2026-01-01T00:00:00Z']) {
    assert.equal(finance.validIsoDate(value), false, value);
  }
  assert.throws(() => finance.splitInstallments('fixture', 10000, 2, '2026-02-31'), /data|vencimento/i);
});

test('parcelamento fracionário é recusado ou normalizado sem perder centavos', () => {
  let parts;
  try { parts = finance.splitInstallments('fixture', 10001, 2.5, date); }
  catch (error) { assert.match(error.message, /parcela|inteir|quantidade/i); return; }
  assert.ok(parts.length >= 1 && parts.length <= 24);
  assert.ok(parts.every(part => Number.isInteger(part.amountCents) && part.total === parts.length));
  assert.equal(parts.reduce((sum, part) => sum + part.amountCents, 0), 10001);
});

test('serviço cortesia com desconto integral conserva custo real e prejuízo por competência', () => {
  const row = { id: 'free', description: 'Serviço cortesia', kind: 'income', category: 'Serviço', source: 'manual', competenceDate: date, grossCents: 10000, discountBps: 10000, taxBps: 0, feeBps: 0, directCostCents: 2000, paymentMethod: 'Pix', installments: finance.splitInstallments('free', 0, 1, date) };
  const summary = finance.summarize([row], range, 'accrual');
  assert.equal(summary.directCostsCents, 2000);
  assert.equal(summary.receivedCents, 0);
  assert.equal(summary.profitCents, -2000);
});

// A deterministic useState/useEffect scheduler exercises the actual storage
// hook's hydration/write contract. It is not a React/DOM integration test.
function hookRunner() {
  const state = [], dependencies = [];
  let stateCursor, effectCursor, effects, dirty, result;
  context.hooks = {
    useState(initial) {
      const index = stateCursor++;
      if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
      return [state[index], update => {
        const next = typeof update === 'function' ? update(state[index]) : update;
        if (!Object.is(next, state[index])) { state[index] = next; dirty = true; }
      }];
    },
    useEffect(effect, deps) {
      const index = effectCursor++;
      if (!dependencies[index] || deps.some((value, i) => !Object.is(value, dependencies[index][i]))) {
        dependencies[index] = [...deps];
        effects.push(effect);
      }
    },
  };
  return key => {
    for (let render = 0; render < 10; render += 1) {
      stateCursor = effectCursor = 0; effects = []; dirty = false;
      result = operational.useStoredData(key, []);
      for (const effect of effects) effect();
      if (!dirty) return result;
    }
    assert.fail('Storage hook did not stabilize in ten renders');
  };
}

test('hidratação de useStoredData não grava dados da chave anterior na chave nova', () => {
  store.set('fixture-a', JSON.stringify(['A']));
  store.set('fixture-b', JSON.stringify(['B']));
  const render = hookRunner();
  assert.deepEqual(render('fixture-a')[0], ['A']);
  assert.deepEqual(render('fixture-b')[0], ['B']);
  assert.ok(writes.filter(([key]) => key === 'fixture-b').every(([, value]) => value === '["B"]'));
  assert.equal(store.get('fixture-a'), '["A"]');
});

test('alteração funcional do hook permanece ao reconstruir o consumidor', () => {
  let render = hookRunner();
  const [, setValue] = render('fixture-a');
  setValue(rows => [...rows, 'registro fictício']);
  assert.deepEqual(render('fixture-a')[0], ['registro fictício']);
  render = hookRunner();
  assert.deepEqual(render('fixture-a')[0], ['registro fictício']);
});
