import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Isolated fixtures: no browser storage, real patients, network, or database writes.
function clinicalModule(storage = new Map(), db = null) {
  const exports = {};
  const context = {
    exports, structuredClone, Map, Set,
    require: name => name.includes('supabase') ? { getSupabase: () => db } : { appStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), keys: () => [...storage.keys()] } },
  };
  const source = readFileSync(new URL('../lib/clinical-records.ts', import.meta.url), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
  return exports;
}
test('draft, anamnesis, dental history and facial history survive reload', async () => {
  const storage = new Map(), first = clinicalModule(storage);
  const record = first.emptyClinicalRecord('fixture-patient', 'Paciente de teste');
  record.anamnesisDetails = { Hipertensão: 'Sim', Diabetes: 'Não' };
  record.draft = { updatedAt: '2026-10-07', service: 'Avaliação', observations: 'Teste', returnDate: '', paymentMethod: 'Pix', installments: '1', cardBrand: '', amount: '100' };
  record.anatomyHistory = [{ id: 'dental-1', date: '2026-10-07', mode: 'dental', anatomy: { selectedTeeth: [11, 21] } }, { id: 'face-1', date: '2026-10-07', mode: 'face', anatomy: { markers: [{ id: 'point-1' }] } }];
  await first.saveClinicalRecord('fixture-business', record);
  const reloaded = clinicalModule(storage), loaded = await reloaded.loadClinicalRecord('fixture-business', 'fixture-patient', 'Paciente de teste');
  assert.equal(loaded.draft.observations, 'Teste');
  assert.deepEqual(JSON.parse(JSON.stringify(loaded.anatomyHistory)), record.anatomyHistory);
  assert.equal(loaded.anamnesisDetails.Hipertensão, 'Sim');
  assert.equal((await reloaded.listClinicalRecords('other-business')).length, 0);
});
test('contracts and consent retain pending and signed status independently', async () => {
  const module = clinicalModule(), record = module.emptyClinicalRecord('fixture-patient', 'Teste');
  record.documents = [{ id: 'contract', kind: 'Contrato', title: 'Contrato', status: 'Pendente', updatedAt: '2026-10-07' }, { id: 'consent', kind: 'Consentimento', title: 'Termo', status: 'Assinado', signedAt: '2026-10-07', updatedAt: '2026-10-07' }];
  await module.saveClinicalRecord('fixture-business', record);
  const loaded = await module.loadClinicalRecord('fixture-business', 'fixture-patient', 'Teste');
  assert.equal(loaded.documents.filter(doc => doc.status !== 'Assinado').length, 1);
  assert.equal(loaded.documents.find(doc => doc.kind === 'Consentimento').signedAt, '2026-10-07');
});
test('finalized record keeps encounter and removes draft', async () => {
  const module = clinicalModule(), record = module.emptyClinicalRecord('fixture-patient', 'Teste');
  record.draft = { updatedAt: '2026-10-07' };
  await module.saveClinicalRecord('fixture-business', record);
  record.draft = undefined;
  record.encounters = [{ id: 'encounter-1', date: '2026-10-07', amount: 100 }];
  await module.saveClinicalRecord('fixture-business', record);
  const loaded = await module.loadClinicalRecord('fixture-business', 'fixture-patient', 'Teste');
  assert.equal(loaded.draft, undefined);
  assert.equal(loaded.encounters.length, 1);
  assert.equal((await module.listClinicalRecords('fixture-business')).filter(item => item.draft).length, 0);
});
test('alerts only include affirmative clinical conditions', () => {
  const module = clinicalModule(), record = module.emptyClinicalRecord('fixture-patient', 'Teste');
  record.anamnesisDetails = { Hipertensão: 'Sim', Diabetes: 'Não', 'Alergia a látex': 'Não' };
  assert.equal(module.clinicalAlerts(record).join(','), 'Hipertensão');
});
test('failed database save rejects without populating the local cache', async () => {
  const storage = new Map();
  const module = clinicalModule(storage, { from: () => ({ upsert: async () => ({ error: new Error('Fixture: denied') }) }) });
  await assert.rejects(module.saveClinicalRecord('fixture-business', module.emptyClinicalRecord('fixture-patient', 'Teste')), /denied/);
  assert.equal(storage.size, 0);
});
