export type ReportingBasis = "cash" | "accrual";
export type FinanceKind = "income" | "expense";
export type FinanceStatus = "paid" | "pending" | "overdue" | "cancelled";
export type FinanceSource = "manual" | "sale" | "clinical";

export type FinanceInstallment = {
  id: string;
  transactionId: string;
  number: number;
  total: number;
  amountCents: number;
  dueDate: string;
  settledAt?: string;
  status: FinanceStatus;
};

export type FinanceTransaction = {
  clinicalEncounterId?: string;
  clinicalPatientId?: string;
  clinicalCommissionId?: string;
  commissionRate?: number;
  customerInstallments?: number;
  id: string;
  description: string;
  kind: FinanceKind;
  category: string;
  source: FinanceSource;
  customer?: string;
  product?: string;
  competenceDate: string;
  grossCents: number;
  discountBps: number;
  taxBps: number;
  directCostCents: number;
  feeBps: number;
  paymentMethod: string;
  processor?: string;
  brand?: string;
  installments: FinanceInstallment[];
  cancelled?: boolean;
  feeOverride?: boolean;
  taxOverride?: boolean;
};

export type FinanceFeeRule = {
  id: string;
  method: string;
  processor: string;
  brand: string;
  installmentsFrom: number;
  installmentsTo: number;
  rateBps: number;
};

export type FinanceSettings = {
  taxBps: number;
  monthlyGoalCents: number;
  categories: string[];
  feeRules: FinanceFeeRule[];
};

export type DateRange = { start: string; end: string };

export const brl = (cents: number, compact = false) => {
  if (compact && Math.abs(cents) >= 100_000_000)
    return `R$ ${(cents / 100_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (compact && Math.abs(cents) >= 100_000)
    return `R$ ${(cents / 100_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mil`;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

export const pct = (value: number) =>
  `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

export function validIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}

export function splitInstallments(
  transactionId: string,
  totalCents: number,
  count: number,
  firstDueDate: string,
): FinanceInstallment[] {
  if (!validIsoDate(firstDueDate)) throw new Error("Informe uma data de vencimento válida.");
  const safeCount = Math.max(1, Math.min(24, Math.trunc(Number.isFinite(count) ? count : 1)));
  const base = Math.floor(totalCents / safeCount);
  const remainder = totalCents - base * safeCount;
  const first = new Date(`${firstDueDate}T12:00:00Z`);
  return Array.from({ length: safeCount }, (_, index) => {
    const due = new Date(first);
    const originalDay=due.getUTCDate();
    due.setUTCDate(1);
    due.setUTCMonth(due.getUTCMonth() + index);
    due.setUTCDate(Math.min(originalDay,new Date(Date.UTC(due.getUTCFullYear(),due.getUTCMonth()+1,0)).getUTCDate()));
    return {
      id: `${transactionId}-${index + 1}`,
      transactionId,
      number: index + 1,
      total: safeCount,
      amountCents: base + (index === safeCount - 1 ? remainder : 0),
      dueDate: due.toISOString().slice(0, 10),
      status: "pending" as const,
    };
  });
}

export function transactionValues(transaction: FinanceTransaction) {
  const discountCents = Math.round(transaction.grossCents * transaction.discountBps / 10_000);
  const afterDiscountCents = transaction.grossCents - discountCents;
  const feeCents = Math.round(afterDiscountCents * transaction.feeBps / 10_000);
  const taxCents = Math.round(afterDiscountCents * transaction.taxBps / 10_000);
  const resultCents = transaction.kind === "income"
    ? afterDiscountCents - feeCents - taxCents - transaction.directCostCents
    : -afterDiscountCents;
  return { discountCents, afterDiscountCents, feeCents, taxCents, resultCents };
}

export function cashBalance(transactions: FinanceTransaction[], openingCents=0) {
  return transactions.filter(row=>!row.cancelled).reduce((balance,row)=>{
    const values=transactionValues(row);
    const settled=row.installments.filter(part=>part.status!=="cancelled" && Boolean(part.settledAt)).reduce((sum,part)=>sum+part.amountCents,0);
    const fees=row.kind==="income" ? Math.round(values.feeCents*settled/Math.max(values.afterDiscountCents,1)) : 0;
    return balance+(row.kind==="income" ? settled-fees : -settled);
  },openingCents);
}

export function statusOf(installment: FinanceInstallment, today = new Date().toLocaleDateString("en-CA")): FinanceStatus {
  if (installment.status === "cancelled") return "cancelled";
  if (installment.settledAt || installment.status === "paid") return "paid";
  return installment.dueDate < today ? "overdue" : "pending";
}

export function appliesToRange(date: string | undefined, range: DateRange) {
  return Boolean(date && date >= range.start && date <= range.end);
}

export function resolveFeeRule(
  rules: FinanceFeeRule[],
  method: string,
  processor: string,
  brand: string,
  installments: number,
) {
  const matches = rules.filter((rule) =>
    rule.method === method &&
    installments >= rule.installmentsFrom &&
    installments <= rule.installmentsTo &&
    (!rule.processor || rule.processor === processor) &&
    (!rule.brand || rule.brand === brand),
  );
  return matches.sort((a, b) =>
    Number(Boolean(b.processor)) + Number(Boolean(b.brand)) -
    Number(Boolean(a.processor)) - Number(Boolean(a.brand)),
  )[0];
}

export function summarize(
  transactions: FinanceTransaction[],
  range: DateRange,
  basis: ReportingBasis,
) {
  let grossCents = 0;
  let receivedCents = 0;
  let expensesCents = 0;
  let directCostsCents = 0;
  let feesCents = 0;
  let taxesCents = 0;
  let discountsCents = 0;
  let transactionCount = 0;
  const inRange = transactions.filter((transaction) => {
    if (transaction.cancelled) return false;
    if (basis === "accrual") return appliesToRange(transaction.competenceDate, range);
    return transaction.installments.some((item) => appliesToRange(item.settledAt, range));
  });

  for (const transaction of inRange) {
    const values = transactionValues(transaction);
    const ratio = basis === "accrual"
      ? (values.afterDiscountCents === 0 ? (transaction.installments.some(item=>item.status!=="cancelled") ? 1 : 0) : transaction.installments.filter(item=>item.status!=="cancelled").reduce((sum,item)=>sum+item.amountCents,0) / values.afterDiscountCents)
      : transaction.installments
          .filter((item) => item.status!=="cancelled" && appliesToRange(item.settledAt, range))
          .reduce((sum, item) => sum + item.amountCents, 0) /
        Math.max(values.afterDiscountCents, 1);
    transactionCount += 1;
    if (transaction.kind === "income") {
      grossCents += Math.round(transaction.grossCents * ratio);
      receivedCents += Math.round(values.afterDiscountCents * ratio);
      directCostsCents += Math.round(transaction.directCostCents * ratio);
      feesCents += Math.round(values.feeCents * ratio);
      taxesCents += Math.round(values.taxCents * ratio);
      discountsCents += Math.round(values.discountCents * ratio);
    } else {
      expensesCents += Math.round(values.afterDiscountCents * ratio);
    }
  }

  const profitCents = receivedCents - expensesCents - directCostsCents - feesCents - taxesCents;
  const margin = grossCents ? (profitCents / grossCents) * 100 : 0;
  const allInstallments = transactions.filter(transaction=>!transaction.cancelled).flatMap((transaction) =>
    transaction.installments.map((installment) => ({ transaction, installment })),
  );
  const receivableCents = allInstallments
    .filter(({ transaction, installment }) => transaction.kind === "income" && ["pending", "overdue"].includes(statusOf(installment)))
    .reduce((sum, { installment }) => sum + installment.amountCents, 0);
  const payableCents = allInstallments
    .filter(({ transaction, installment }) => transaction.kind === "expense" && ["pending", "overdue"].includes(statusOf(installment)))
    .reduce((sum, { installment }) => sum + installment.amountCents, 0);
  const overdueCents = allInstallments
    .filter(({ installment }) => statusOf(installment) === "overdue")
    .reduce((sum, { installment }) => sum + installment.amountCents, 0);

  return {
    grossCents,
    receivedCents,
    expensesCents,
    directCostsCents,
    feesCents,
    taxesCents,
    discountsCents,
    profitCents,
    margin,
    transactionCount,
    receivableCents,
    payableCents,
    overdueCents,
  };
}

export const defaultSettings: FinanceSettings = {
  taxBps: 600,
  monthlyGoalCents: 3_500_000,
  categories: ["Vendas", "Serviços", "Materiais e insumos", "Serviços terceirizados", "Operacional", "Marketing"],
  feeRules: [
    { id: "fee-1", method: "Pix", processor: "", brand: "", installmentsFrom: 1, installmentsTo: 1, rateBps: 0 },
    { id: "fee-2", method: "Cartão de débito", processor: "GetPay", brand: "", installmentsFrom: 1, installmentsTo: 1, rateBps: 149 },
    { id: "fee-3", method: "Cartão de crédito", processor: "GetPay", brand: "Visa", installmentsFrom: 1, installmentsTo: 1, rateBps: 299 },
    { id: "fee-4", method: "Cartão de crédito", processor: "GetPay", brand: "", installmentsFrom: 2, installmentsTo: 6, rateBps: 449 },
    { id: "fee-5", method: "Cartão de crédito", processor: "", brand: "", installmentsFrom: 1, installmentsTo: 12, rateBps: 520 },
  ],
};

function mockTransaction(input: Omit<FinanceTransaction, "installments"> & { installmentCount: number; firstDueDate: string; paidCount?: number }): FinanceTransaction {
  const values = transactionValues({ ...input, installments: [] });
  const installments = splitInstallments(input.id, values.afterDiscountCents, input.installmentCount, input.firstDueDate)
    .map((item, index) => index < (input.paidCount ?? 0)
      ? { ...item, status: "paid" as const, settledAt: item.dueDate }
      : item);
  const { installmentCount: _count, firstDueDate: _due, paidCount: _paid, ...transaction } = input;
  return { ...transaction, installments };
}

export const initialTransactions: FinanceTransaction[] = [];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const quarterStart = Math.floor(currentMonth / 3) * 3;
const dateKey = (year: number, month: number, day: number) => {
  const date = new Date(year, month, day);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const periods = {
  month: {
    label: new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(currentDate),
    range: { start: dateKey(currentYear, currentMonth, 1), end: dateKey(currentYear, currentMonth + 1, 0) },
  },
  quarter: {
    label: `${Math.floor(currentMonth / 3) + 1}º trimestre de ${currentYear}`,
    range: { start: dateKey(currentYear, quarterStart, 1), end: dateKey(currentYear, quarterStart + 3, 0) },
  },
  year: {
    label: `Ano de ${currentYear}`,
    range: { start: dateKey(currentYear, 0, 1), end: dateKey(currentYear, 11, 31) },
  },
} as const;
