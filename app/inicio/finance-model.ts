export type ReportingBasis = "cash" | "accrual";
export type FinanceKind = "income" | "expense";
export type FinanceStatus = "paid" | "pending" | "overdue" | "cancelled";
export type FinanceSource = "manual" | "sale";

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
    return `R$ ${(cents / 100_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

export const pct = (value: number) =>
  `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

export function splitInstallments(
  transactionId: string,
  totalCents: number,
  count: number,
  firstDueDate: string,
): FinanceInstallment[] {
  const safeCount = Math.max(1, Math.min(24, count));
  const base = Math.floor(totalCents / safeCount);
  const remainder = totalCents - base * safeCount;
  const first = new Date(`${firstDueDate}T12:00:00`);
  return Array.from({ length: safeCount }, (_, index) => {
    const due = new Date(first);
    due.setMonth(due.getMonth() + index);
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

export function statusOf(installment: FinanceInstallment, today = "2026-08-05"): FinanceStatus {
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
      ? 1
      : transaction.installments
          .filter((item) => appliesToRange(item.settledAt, range))
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
  const allInstallments = transactions.flatMap((transaction) =>
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

export const initialTransactions: FinanceTransaction[] = [
  mockTransaction({ id: "FIN-1042", description: "Projeto de identidade visual", kind: "income", category: "Serviços", source: "sale", customer: "Arco Studio", product: "Projeto completo", competenceDate: "2026-08-02", grossCents: 840000, discountBps: 500, taxBps: 600, directCostCents: 95000, feeBps: 299, paymentMethod: "Cartão de crédito", processor: "GetPay", brand: "Visa", installmentCount: 3, firstDueDate: "2026-08-05", paidCount: 1 }),
  mockTransaction({ id: "FIN-1041", description: "Assinaturas de software", kind: "expense", category: "Operacional", source: "manual", competenceDate: "2026-08-01", grossCents: 128000, discountBps: 0, taxBps: 0, directCostCents: 0, feeBps: 0, paymentMethod: "Boleto", installmentCount: 1, firstDueDate: "2026-08-10" }),
  mockTransaction({ id: "FIN-1040", description: "Consultoria estratégica", kind: "income", category: "Serviços", source: "sale", customer: "Lojas Fênix", product: "Consultoria", competenceDate: "2026-07-24", grossCents: 1280000, discountBps: 0, taxBps: 600, directCostCents: 180000, feeBps: 0, paymentMethod: "Pix", installmentCount: 1, firstDueDate: "2026-07-24", paidCount: 1 }),
  mockTransaction({ id: "FIN-1039", description: "Compra de embalagens", kind: "expense", category: "Materiais e insumos", source: "manual", competenceDate: "2026-07-20", grossCents: 270000, discountBps: 0, taxBps: 0, directCostCents: 0, feeBps: 0, paymentMethod: "Boleto", installmentCount: 2, firstDueDate: "2026-07-28", paidCount: 1 }),
  mockTransaction({ id: "FIN-1038", description: "Pacote de manutenção", kind: "income", category: "Serviços", source: "sale", customer: "Casa & Ambiente", product: "Manutenção", competenceDate: "2026-07-12", grossCents: 485000, discountBps: 300, taxBps: 600, directCostCents: 42000, feeBps: 149, paymentMethod: "Cartão de débito", processor: "GetPay", installmentCount: 1, firstDueDate: "2026-07-12", paidCount: 1 }),
  mockTransaction({ id: "FIN-1037", description: "Serviço de fotografia", kind: "expense", category: "Marketing", source: "manual", competenceDate: "2026-06-18", grossCents: 185000, discountBps: 0, taxBps: 0, directCostCents: 0, feeBps: 0, paymentMethod: "Transferência", installmentCount: 1, firstDueDate: "2026-06-25", paidCount: 1 }),
  mockTransaction({ id: "FIN-1036", description: "Venda corporativa", kind: "income", category: "Vendas", source: "sale", customer: "TechConnect", product: "Kit corporativo", competenceDate: "2026-06-10", grossCents: 1890000, discountBps: 800, taxBps: 600, directCostCents: 460000, feeBps: 449, paymentMethod: "Cartão de crédito", processor: "GetPay", brand: "Mastercard", installmentCount: 4, firstDueDate: "2026-06-12", paidCount: 2 }),
  mockTransaction({ id: "FIN-1035", description: "Aluguel do escritório", kind: "expense", category: "Operacional", source: "manual", competenceDate: "2026-05-05", grossCents: 350000, discountBps: 0, taxBps: 0, directCostCents: 0, feeBps: 0, paymentMethod: "Pix", installmentCount: 1, firstDueDate: "2026-05-05", paidCount: 1 }),
  mockTransaction({ id: "FIN-1034", description: "Implantação comercial", kind: "income", category: "Serviços", source: "sale", customer: "Mercado Bom Preço", competenceDate: "2026-05-03", grossCents: 1450500, discountBps: 0, taxBps: 600, directCostCents: 210000, feeBps: 0, paymentMethod: "Transferência", installmentCount: 2, firstDueDate: "2026-05-10", paidCount: 2 }),
];

export const periods = {
  month: { label: "Agosto de 2026", range: { start: "2026-08-01", end: "2026-08-31" } },
  quarter: { label: "3º trimestre de 2026", range: { start: "2026-07-01", end: "2026-09-30" } },
  year: { label: "Ano de 2026", range: { start: "2026-01-01", end: "2026-12-31" } },
} as const;
