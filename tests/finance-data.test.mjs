import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source=await readFile(new URL("../app/inicio/finance-model.ts",import.meta.url),"utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const model=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const range={start:"2026-10-01",end:"2026-10-31"};
function transaction(overrides={}) {
  return {id:"test",description:"Serviço",kind:"income",category:"Serviço",source:"manual",competenceDate:"2026-10-14",grossCents:100000,discountBps:1000,taxBps:500,directCostCents:20000,feeBps:200,paymentMethod:"Pix",installments:model.splitInstallments("test",90000,3,"2026-10-14"),...overrides};
}
test("base vazia não produz faturamento nem lucro fictício",()=>{const value=model.summarize([],range,"accrual");for(const item of Object.values(value))assert.equal(item,0);assert.deepEqual(model.initialTransactions,[]);});
test("resultado deriva de desconto, custos, taxas e tributos",()=>{const value=model.summarize([transaction()],range,"accrual");assert.equal(value.grossCents,100000);assert.equal(value.receivedCents,90000);assert.equal(value.feesCents,1800);assert.equal(value.taxesCents,4500);assert.equal(value.profitCents,63700);assert.equal(value.receivableCents,90000);});
test("caixa usa liquidações, competência usa a data do lançamento",()=>{const row=transaction();assert.equal(model.summarize([row],range,"cash").grossCents,0);row.installments[0].status="paid";row.installments[0].settledAt="2026-10-14";assert.equal(model.summarize([row],range,"cash").receivedCents,30000);assert.equal(model.summarize([row],range,"accrual").receivedCents,90000);});
test("parcelamento preserva os centavos",()=>{const parts=model.splitInstallments("test",10001,3,"2026-10-14");assert.equal(parts.reduce((sum,part)=>sum+part.amountCents,0),10001);assert.deepEqual(parts.map(part=>part.amountCents),[3333,3333,3335]);});
test("cancelamentos não entram nos compromissos",()=>{const row=transaction({cancelled:true});const value=model.summarize([row],range,"accrual");assert.equal(value.receivableCents,0);assert.equal(value.grossCents,0);});
test("parcela cancelada reduz o resultado e o compromisso",()=>{const row=transaction();row.installments[2].status="cancelled";const value=model.summarize([row],range,"accrual");assert.equal(value.receivableCents,60000);assert.equal(value.grossCents,66667);});
test("vencimento no fim do mês não pula fevereiro",()=>{const parts=model.splitInstallments("test",10000,2,"2026-01-31");assert.equal(parts[1].dueDate,"2026-02-28");});

const utility=await readFile(new URL("../lib/operational-data.ts",import.meta.url),"utf8");
const store=new Map();
const utilitySource=utility.replace(/^import .*;\n/gm,"");
const modelUrl=`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const utilityCompiled=ts.transpileModule(`import { periods, summarize, transactionValues, splitInstallments, cashBalance } from ${JSON.stringify(modelUrl)};\nconst appStorage={getItem:key=>globalThis.__financeTestStore.get(key)??null,setItem:(key,value)=>globalThis.__financeTestStore.set(key,value)};const listClinicalRecords=async()=>[];\n${utilitySource}`,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
globalThis.__financeTestStore=store;
const analytics=await import(`data:text/javascript;base64,${Buffer.from(utilityCompiled).toString("base64")}`);
test("Relatórios usa a mesma fonte de lançamentos",()=>{const row=transaction();row.competenceDate=model.periods.month.range.start;store.set("gest-finance-transactions",JSON.stringify([row]));assert.equal(analytics.indicatorValue("Financeiro · Lucro"),637);assert.equal(analytics.indicatorValue("Vendas · Faturamento"),1000);store.clear();assert.equal(analytics.indicatorValue("Financeiro · Lucro"),0);});
test("cadastro de venda alimenta financeiro sem duplicar",()=>{const row=["123","Venda","Pix",model.periods.month.range.start,"R$ 250,00","Ativo"];analytics.registerModuleSale(row);analytics.registerModuleSale(row);assert.equal(analytics.financeRows().length,1);assert.equal(analytics.financeRows()[0].grossCents,25000);store.clear();});
test("estoque considera quantidade multiplicada pelo preço",()=>{const rows=[["1","Material","Produto","4","2026-10-14","R$ 25,00","Ativo"]];assert.equal(analytics.moduleMetric("Valor do estoque",rows,analytics.moduleColumns("Estoque")),analytics.money(100));});
test("saldo usa abertura e dinheiro liquidado, sem confundir custo estimado com saída",()=>{const row=transaction();row.installments[0].settledAt="2026-10-14";assert.equal(model.cashBalance([row],10000),39400);});
