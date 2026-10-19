import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { appStorage } from "./local-store";
import { periods, summarize, transactionValues, splitInstallments, cashBalance, type FinanceTransaction } from "../app/inicio/finance-model";
import { listClinicalRecords } from "./clinical-records";
import { clinicalTransactions } from "./clinical-payment";

export function readData<T>(key: string, fallback: T): T {
  try { const value = appStorage.getItem(key); return value === null ? fallback : JSON.parse(value) as T; } catch { return fallback; }
}

/** A mesma base persistida alimenta os cadastros e os indicadores. */
export function useStoredData<T>(key: string, empty: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(empty);
  const [loadedKey, setLoadedKey] = useState("");
  useEffect(() => { setValue(readData(key, empty)); setLoadedKey(key); }, [key]);
  useEffect(() => { if (loadedKey === key) appStorage.setItem(key, JSON.stringify(value)); }, [key, loadedKey, value]);
  return [loadedKey === key ? value : empty, setValue];
}

export function useDataRevision() {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const update = () => setRevision(value => value + 1);
    window.addEventListener("gest-data-changed", update);
    window.addEventListener("storage", update);
    window.addEventListener("gest-clinical-record-saved", update);
    update();
    return () => { window.removeEventListener("gest-data-changed", update); window.removeEventListener("storage", update); window.removeEventListener("gest-clinical-record-saved", update); };
  }, []);
  return revision;
}

export const moduleKey = (name: string) => ({ Estoque: "gest-stock-records", Catálogo: "gest-catalog-records", Documentos: "gest-document-records" }[name] ?? `gest-module-${name}`);
export const moduleColumns = (name:string) => name==="Estoque" ? ["Código","Nome","Tipo","Quantidade","Data","Preço","Status"] : ["Código","Nome","Tipo","Data","Valor","Status"];
export const numberValue = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const text = String(value ?? "").replace(/[^\d,.-]/g, "");
  return Number(text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text) || 0;
};
export const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export function agendaRecordDate(row:{date?:string;column:number}, now=new Date()) {
  if(row.date) return row.date;
  const date=new Date(now.getFullYear(),now.getMonth(),now.getDate()-((now.getDay()+6)%7)+row.column-2);
  return date.toLocaleDateString("en-CA");
}
export function monthRanges(count = 12, now = new Date()) {
  const key = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  return Array.from({ length: count }, (_, index) => {
    const start = new Date(now.getFullYear(), now.getMonth() - count + index + 1, 1);
    const end = new Date(start.getFullYear(), start.getMonth()+1, 0);
    return { name: start.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(/\s+de\s+/g, " "), start: key(start), end: key(end) };
  });
}

export function financeRows(): FinanceTransaction[] { return readData<FinanceTransaction[]>("gest-finance-transactions", []); }
export function availableCash(rows=financeRows(),until=new Date().toLocaleDateString("en-CA")) {
  const datedRows=rows.map(row=>({...row,installments:row.installments.filter(part=>!part.settledAt || part.settledAt<=until)}));
  const banks=readData<Array<{opening:number;createdAt?:string}>>("gest-banks",[]).filter(row=>(row.createdAt?.slice(0,10)??periods.month.range.start)<=until);
  return cashBalance(datedRows,banks.reduce((sum,row)=>sum+Math.round(row.opening*100),0));
}
export async function syncClinicalFinance(businessId: string) {
  const records=await listClinicalRecords(businessId);
  const linked=records.flatMap(clinicalTransactions);
  appStorage.setItem("gest-finance-transactions",JSON.stringify([...financeRows().filter(row=>row.source!=="clinical"),...linked]));
}
export function registerModuleSale(row:string[]) {
  const id=`SALE-${row[0]}`, cents=Math.round(numberValue(row[4])*100);
  const date=/^\d{4}-\d{2}-\d{2}/.test(row[3])?row[3].slice(0,10):new Date().toLocaleDateString("en-CA");
  const discountBps=Math.round(Math.min(100,Math.max(0,numberValue(row[6])))*100);
  const previous = financeRows().find(item => item.id === id);
  const transaction:FinanceTransaction={...previous,id,description:row[1],kind:"income",category:"Vendas",source:"sale",product:row[1],customer:row[8]||undefined,competenceDate:date,grossCents:cents,discountBps,taxBps:0,directCostCents:Math.round(numberValue(row[10])*100),feeBps:Math.round(numberValue(row[9])*100),paymentMethod:row[2]||"A definir",installments:splitInstallments(id,cents-Math.round(cents*discountBps/10000),Math.max(1,numberValue(row[7])),date)};
  transaction.cancelled = /^cancelad[oa]$/i.test(row[5] ?? "");
  const sameSchedule = previous?.installments.length === transaction.installments.length && transaction.installments.every((part,index) => {
    const old = previous?.installments[index]; return old?.amountCents === part.amountCents && old?.dueDate === part.dueDate;
  });
  if (sameSchedule && previous) transaction.installments = previous.installments.map(part => ({...part}));
  else if (previous?.installments.some(part => part.status === "paid" || part.settledAt)) throw new Error("Estorne as parcelas liquidadas antes de alterar valor, desconto, data ou parcelamento da venda.");
  if(previous?.cancelled && !transaction.cancelled) transaction.installments = transaction.installments.map(part=>({...part,status:part.settledAt?"paid":"pending"}));
  if (transaction.cancelled) transaction.installments = transaction.installments.map(part => ({...part,status:"cancelled"}));
  appStorage.setItem("gest-finance-transactions",JSON.stringify([...financeRows().filter(item=>item.id!==id),transaction]));
}
type InputRow = Record<string, unknown>;
const inputs = (key: string) => readData<InputRow[]>(key, []);
const dated = (rows: InputRow[], start: string, end: string) => rows.filter(row => {
  const date = String(row.createdAt ?? row.date ?? row.updatedAt ?? "").slice(0,10);
  return date >= start && date <= end;
});
export function stockIsCritical(row: string[]) {
  const settings = readData<{threshold?:string|number}>("gest-stock-alert-settings", {});
  const minimum = Math.max(0, numberValue(settings.threshold));
  return numberValue(row[3]) <= minimum || /crítico|sem estoque/i.test(row[6] ?? "");
}
export function indicatorValue(label: string, range = periods.month.range): number {
  const key = label.toLocaleLowerCase("pt-BR");
  const transactions = financeRows();
  const summary = summarize(transactions, range, "accrual");
  const cash = summarize(transactions, range, "cash");
  if (/faturamento/.test(key)) return summary.grossCents/100;
  if (/lucro/.test(key)) return summary.profitCents/100;
  if (/margem/.test(key)) return summary.margin;
  if (/despesa|custos do|custos totais/.test(key)) return (summary.expensesCents+summary.directCostsCents+summary.feesCents+summary.taxesCents)/100;
  if (/receita/.test(key)) return cash.receivedCents/100;
  if (/saldo/.test(key)) return availableCash(transactions,range.end)/100;
  if (/contas a receber/.test(key)) return summary.receivableCents/100;
  if (/contas a pagar/.test(key)) return summary.payableCents/100;
  if (/vencid/.test(key)) return summary.overdueCents/100;
  if (/ticket/.test(key)) return summary.transactionCount ? summary.grossCents/100/summary.transactionCount : 0;
  if (/meta/.test(key)) return numberValue(readData<{monthlyGoalCents?:number}>("gest-finance-settings", {}).monthlyGoalCents)/100;
  if (/vendas/.test(key)) return transactions.filter(row => row.kind === "income" && !row.cancelled && row.competenceDate >= range.start && row.competenceDate <= range.end).length;
  if (/clientes/.test(key)) {
    const rows = inputs("gest-clients");
    if (/ativos/.test(key)) return rows.filter(row=>row.status === (/inativos/.test(key)?"Inativo":"Ativo")).length;
    if (/faixa etária|sexo/.test(key)) return rows.filter(row=>/sexo/.test(key) ? Boolean(row.sex) : Boolean(row.birthday)).length;
    return rows.filter(row=>{ const created=String(row.createdAt ?? "").slice(0,10); return created ? created<=range.end : range.end>=periods.month.range.start; }).length;
  }
  if (/agenda/.test(key)) return inputs("gest-agenda-events").filter(row=>{const date=agendaRecordDate({date:typeof row.date==="string"?row.date:undefined,column:numberValue(row.column)});return row.status!=="canceled" && date>=range.start && date<=range.end;}).length;
  if (/crm/.test(key)) return dated(inputs("gest-crm-leads"), range.start, range.end).length;
  if (/atendimento|novos contatos/.test(key)) return dated(inputs("gest-support-contacts"),range.start,range.end).filter(row => !/a responder/.test(key) || row.stage === "Responder hoje").length;
  if (/estoque/.test(key)) {
    const rows = readData<string[][]>("gest-stock-records", []).filter(row=>/^\d{4}-\d{2}-\d{2}/.test(row[4]) ? row[4].slice(0,10)<=range.end : range.end>=periods.month.range.start);
    if (/alerta/.test(key)) return rows.filter(stockIsCritical).length;
    return rows.reduce((total,row) => total + numberValue(row[3]) * (/valor/.test(key) ? numberValue(row[5]) : 1), 0);
  }
  if (/manutenção/.test(key)) {
    const rows = readData<string[][]>(moduleKey("Manutenção"), []).filter(row=>row[3]?.slice(0,10)>=range.start && row[3]?.slice(0,10)<=range.end);
    return /custo/.test(key) ? rows.reduce((total,row) => total+numberValue(row[4]),0) : rows.length;
  }
  if (/tarefas/.test(key)) return dated(inputs("gest-workflow-tasks"),range.start,range.end).filter(row => !/concluíd/.test(key) || row.stage === "Concluída").length;
  if (/compras/.test(key)) {
    const quotes=dated(inputs("gest-purchase-quotes"),range.start,range.end);
    const products=[...new Set(quotes.map(row=>String(row.name)))];
    if (/produtos em avaliação/.test(key)) return products.length;
    if (/bom preço/.test(key)) return products.filter(name=>{const history=quotes.filter(row=>row.name===name).sort((a,b)=>String(a.date).localeCompare(String(b.date)));return history.length>1 && numberValue(history.at(-1)?.price)===Math.min(...history.map(row=>numberValue(row.price)));}).length;
    if (/economia/.test(key)) return products.reduce((sum,name)=>{const history=quotes.filter(row=>row.name===name).sort((a,b)=>String(a.date).localeCompare(String(b.date)));return sum+(history.length>1?Math.max(0,numberValue(history.at(-2)?.price)-numberValue(history.at(-1)?.price)):0);},0);
  }
  if (/catálogo/.test(key)) return readData<string[][]>("gest-catalog-records",[]).length;
  if (/equipe/.test(key)) {
    const clock=readData<{workers:unknown[];records:Array<{workerId:string;at:string;type:string}>}>("gest-time-clock",{workers:[],records:[]});
    if (/pessoas/.test(key)) return range.end>=periods.month.range.start ? clock.workers.length : 0;
    if (/horas/.test(key)) { let hours=0; const entries=new Map<string,number>(); for(const row of [...clock.records].sort((a,b)=>a.at.localeCompare(b.at))){const at=Date.parse(row.at);if(row.type==="entrada") entries.set(row.workerId,at);else if(entries.has(row.workerId)){if(row.at.slice(0,10)>=range.start && row.at.slice(0,10)<=range.end)hours+=(at-entries.get(row.workerId)!)/3600000;entries.delete(row.workerId);}}return Math.round(hours*100)/100; }
    if (/atrasos/.test(key)) {
      const workers=clock.workers as Array<{id:string;start:string}>;
      return new Set(clock.records.filter(row=>row.type==="entrada" && row.at.slice(0,10)>=range.start && row.at.slice(0,10)<=range.end && new Date(row.at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",hour12:false})>(workers.find(worker=>worker.id===row.workerId)?.start??"23:59")).map(row=>row.workerId+":"+row.at.slice(0,10))).size;
    }
    return 0;
  }
  return 0;
}
export function indicatorSeries(label: string) { return monthRanges().map(range => indicatorValue(label, range)); }
export function indicatorBreakdown(label:string):Array<{name:string;value:number}>|null {
  const key=label.toLocaleLowerCase("pt-BR");
  if(/clientes.*faixa etária/.test(key)) {
    const ranges=[{name:"Até 17",min:0,max:17},{name:"18 a 29",min:18,max:29},{name:"30 a 44",min:30,max:44},{name:"45 a 59",min:45,max:59},{name:"60 ou mais",min:60,max:200}];
    const now=new Date(); const ages=inputs("gest-clients").filter(row=>typeof row.birthday==="string" && /^\d{4}-\d{2}-\d{2}$/.test(row.birthday)).map(row=>{const birth=new Date(String(row.birthday)+"T12:00:00");return now.getFullYear()-birth.getFullYear()-Number(now.getMonth()<birth.getMonth() || now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate());});
    return ranges.map(range=>({name:range.name,value:ages.filter(age=>age>=range.min&&age<=range.max).length}));
  }
  if(/clientes.*sexo/.test(key) || /crm.*etapa/.test(key)) {
    const rows=inputs(/crm/.test(key)?"gest-crm-leads":"gest-clients"),field=/crm/.test(key)?"stage":"sex";
    const names=[...new Set(rows.map(row=>String(row[field]||"Não informado")))];
    return names.map(name=>({name,value:rows.filter(row=>String(row[field]||"Não informado")===name).length}));
  }
  return null;
}
export function revenueSources() {
  const rows = financeRows().filter(row => row.kind === "income" && !row.cancelled && row.competenceDate >= periods.month.range.start && row.competenceDate <= periods.month.range.end);
  const groups = new Map<string,number>();
  for (const row of rows) groups.set(row.category, (groups.get(row.category) ?? 0) + transactionValues(row).afterDiscountCents/100);
  return [...groups].map(([name,value],index) => ({name,value,color:["#70bce5","#73c0a5","#e8b16d","#a895d8"][index%4]}));
}
export function serviceCounts() {
  const groups = new Map<string,number>();
  for (const row of financeRows().filter(row => row.kind === "income" && !row.cancelled)) groups.set(row.product || row.category, (groups.get(row.product || row.category) ?? 0)+1);
  return [...groups].map(([name,value]) => ({name,value}));
}
export function moduleMetric(label: string, rows: string[][], columns: string[]) {
  const key = label.toLocaleLowerCase("pt-BR");
  const statusIndex = columns.findIndex(column => /status|situação/i.test(column));
  if (/valor|receita|custo|faturamento|total vendido/.test(key)) {
    const valueIndex = columns.findIndex(column => /valor|preço|custo/i.test(column));
    const quantityIndex=columns.indexOf("Quantidade");
    return money(valueIndex < 0 ? 0 : rows.reduce((total,row) => total+numberValue(row[valueIndex])*(quantityIndex>=0?numberValue(row[quantityIndex]):1),0));
  }
  if (/ticket|margem|economia|crescimento|categoria/.test(key)) return "—";
  if (/crític/.test(key) && columns.includes("Quantidade")) return String(rows.filter(stockIsCritical).length);
  if (/conversão/.test(key)) return `${rows.length ? Math.round(rows.filter(row=>/aprovad|convertid/i.test(row[statusIndex] ?? "")).length / rows.length * 100) : 0}%`;
  if (/aprovad/.test(key)) return String(rows.filter(row=>/aprovad/i.test(row[statusIndex] ?? "")).length);
  if (/aguardando resposta/.test(key)) return String(rows.filter(row=>/aguardando|enviad/i.test(row[statusIndex] ?? "")).length);
  const matching = /inativ|ativ|conclu|penden|atras|crític|assinad|abert/.exec(key)?.[0];
  return String(matching && statusIndex >= 0 ? rows.filter(row => {const status=row[statusIndex]?.toLocaleLowerCase("pt-BR") ?? "";return matching==="ativ" ? status==="ativo" : status.includes(matching);}).length : rows.length);
}
