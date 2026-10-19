import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const compile=source=>`data:text/javascript;base64,${Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64')}`;
const financeUrl=compile(await readFile(new URL('../app/inicio/finance-model.ts',import.meta.url),'utf8'));
const paymentUrl=compile((await readFile(new URL('../lib/clinical-payment.ts',import.meta.url),'utf8')).replace('from "../app/inicio/finance-model"',`from ${JSON.stringify(financeUrl)}`));
const payment=await import(paymentUrl),finance=await import(financeUrl);
const date='2026-10-15';
const lines=[{id:'line-1',serviceId:'service-1',name:'Serviço',quantity:1,price:1000}];
const terms={'service-1':{commissionRate:10}};
const draft=()=>({...payment.emptyClinicalPayment(date),receiptMode:'single',feePercent:5,processor:'Operadora de teste',commissions:{'line-1':{mode:'catalog',rate:0,beneficiary:'Profissional de teste',dueDate:'2026-11-15'}}});
const encounter=()=>({id:'encounter-1',date,service:'Serviço',amount:1000,paymentMethod:'Crédito',cardBrand:'Visa',installments:10,payment:payment.paymentSnapshot(draft(),lines,100000,terms)});
const record=item=>({patientId:'fixture-patient',patientName:'Paciente de teste',encounters:item?[item]:[],draft:{service:'Apenas rascunho'}});

test('paciente em 10x e clínica à vista gera uma conta a receber e uma comissão a pagar',()=>{
  const transactions=payment.clinicalTransactions(record(encounter()));
  assert.equal(transactions.length,2);
  const income=transactions.find(row=>row.kind==='income'),expense=transactions.find(row=>row.kind==='expense');
  assert.equal(income.customerInstallments,10);
  assert.equal(income.installments.length,1);
  assert.equal(income.installments[0].amountCents,100000);
  assert.equal(income.installments[0].status,'pending');
  assert.equal(income.processor,'Operadora de teste');
  assert.equal(income.brand,'Visa');
  assert.equal(expense.grossCents,10000);
  assert.equal(expense.category,'Comissões');
  assert.equal(expense.installments[0].dueDate,'2026-11-15');
  const summary=finance.summarize(transactions,{start:'2026-10-01',end:'2026-12-31'},'accrual');
  assert.equal(summary.profitCents,85000); // 1000 - 50 taxa - 100 comissão, sem duplicar custo.
  assert.equal(summary.receivableCents,100000);
  assert.equal(summary.payableCents,10000);
});
test('recebimento parcelado acompanha as dez parcelas sem parcelar a comissão',()=>{
  const item=encounter();item.payment.receiptMode='installments';
  const transactions=payment.clinicalTransactions(record(item));
  assert.equal(transactions[0].installments.length,10);
  assert.equal(transactions[1].installments.length,1);
  assert.equal(transactions[0].installments[1].dueDate,'2026-11-15');
});
test('taxa cadastrada, comissão específica e sem comissão são escolhas independentes',()=>{
  assert.equal(payment.commissionPreview(lines,100000,draft(),terms)[0].rate,10);
  const custom=draft();custom.commissions['line-1'].mode='custom';custom.commissions['line-1'].rate=7.5;
  assert.equal(payment.commissionPreview(lines,100000,custom,terms)[0].amountCents,7500);
  custom.commissions['line-1'].mode='none';
  assert.equal(payment.paymentSnapshot(custom,lines,100000,terms).commissions.length,0);
  assert.equal(payment.commissionPreview(lines,100000,draft(),{})[0].amountCents,0);
});
test('comissão é calculada sobre o valor após desconto com rateio em centavos',()=>{
  const several=[{...lines[0],price:33.33},{...lines[0],id:'line-2',price:66.67}];
  const preview=payment.commissionPreview(several,9001,draft(),terms);
  assert.equal(preview.reduce((sum,row)=>sum+row.baseCents,0),9001);
  assert.equal(preview[0].baseCents,3000);
  assert.equal(preview[1].baseCents,6001);
  assert.equal(preview[0].amountCents,300);
  assert.equal(preview[1].amountCents,600);
});
test('beneficiário é obrigatório só quando existe comissão e rascunho não lança valores',()=>{
  const config=draft();config.commissions['line-1'].beneficiary='';
  assert.match(payment.paymentValidation(payment.paymentSnapshot(config,lines,100000,terms)),/quem receberá/);
  assert.equal(payment.paymentValidation(payment.paymentSnapshot(config,lines,100000,{})),null);
  assert.deepEqual(payment.clinicalTransactions(record()),[]);
});
test('baixa, estorno e cancelamento da comissão sobrevivem à reconstrução dos lançamentos',()=>{
  const item=encounter();item.payment.commissions[0].paidAt=date;
  assert.equal(payment.clinicalTransactions(record(item))[1].installments[0].status,'paid');
  delete item.payment.commissions[0].paidAt;
  assert.equal(payment.clinicalTransactions(record(item))[1].installments[0].status,'pending');
  item.payment.commissions[0].cancelled=true;
  assert.equal(payment.clinicalTransactions(record(item))[1].installments[0].status,'cancelled');
});
test('registros antigos preservam parcelamento e baixas sem exigir novos campos',()=>{
  const item=encounter();delete item.payment;item.paidDates={1:date};
  const [row]=payment.clinicalTransactions(record(item));
  assert.equal(row.installments.length,10);
  assert.equal(row.installments[0].status,'paid');
});

const store=new Map();globalThis.__clinicalPaymentStore=store;globalThis.__clinicalPaymentRecords=[];
const utility=(await readFile(new URL('../lib/operational-data.ts',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
const operational=await import(compile(`import {periods,summarize,transactionValues,splitInstallments,cashBalance} from ${JSON.stringify(financeUrl)};import {clinicalTransactions} from ${JSON.stringify(paymentUrl)};const appStorage={getItem:key=>globalThis.__clinicalPaymentStore.get(key)??null,setItem:(key,value)=>globalThis.__clinicalPaymentStore.set(key,value)};const listClinicalRecords=async()=>globalThis.__clinicalPaymentRecords;\n${utility}`));
test('sincronização idempotente preserva lançamentos manuais e não duplica receitas nem comissões',async()=>{
  store.clear();globalThis.__clinicalPaymentRecords=[record(encounter())];
  store.set('gest-finance-transactions',JSON.stringify([{id:'manual',source:'manual'}]));
  await operational.syncClinicalFinance('fixture-business');await operational.syncClinicalFinance('fixture-business');
  assert.equal(operational.financeRows().length,3);
  assert.equal(operational.financeRows().filter(row=>row.kind==='expense').length,1);
  globalThis.__clinicalPaymentRecords=[];await operational.syncClinicalFinance('fixture-business');
  assert.deepEqual(operational.financeRows(),[{id:'manual',source:'manual'}]);
});
