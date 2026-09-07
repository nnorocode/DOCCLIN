"use client";

import { FormEvent, useMemo, useState } from "react";
import InfoHint from "./InfoHint";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  Check,
  CircleDollarSign,
  Clock3,
  Edit3,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  Settings2,
  Target,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import {
  brl,
  defaultSettings,
  initialTransactions,
  pct,
  periods,
  resolveFeeRule,
  splitInstallments,
  statusOf,
  summarize,
  transactionValues,
  type FinanceKind,
  type FinanceSettings,
  type FinanceTransaction,
  type ReportingBasis,
} from "./finance-model";

type FinanceSection = "overview" | "entries" | "closing" | "settings";
type PeriodKey = keyof typeof periods;

const sectionLabels: Array<[FinanceSection, string]> = [
  ["overview", "Visão geral"],
  ["entries", "Transações"],
  ["closing", "Fechamentos"],
  ["settings", "Regras e metas"],
];

const paymentColors: Record<string, string> = {
  Pix: "#0b5cad",
  "Cartão de crédito": "#4b86d7",
  "Cartão de débito": "#6fa8ed",
  Transferência: "#8f6bd8",
  Boleto: "#e5a22d",
};

const dateLabel = (value?: string) =>
  value ? new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`)) : "—";

const statusLabel = { paid: "Liquidado", pending: "Pendente", overdue: "Vencido", cancelled: "Cancelado" } as const;

function FinanceMetric({ label, value, detail, tone, icon: Icon }: { label: string; value: string; detail: string; tone: string; icon: typeof Banknote }) {
  return (
    <article className="v2-card finance-metric">
      <div>
        <span>{label}<InfoHint text={`Entenda o indicador ${label.toLowerCase()} e como ele é calculado.`} /></span>
        <strong>{value}</strong>
        <small className={tone}>{detail}</small>
      </div>
      <i className={tone}><Icon size={20} strokeWidth={1.8} /></i>
    </article>
  );
}

function FinanceHeader({ section, setSection, period, setPeriod, basis, setBasis }: {
  section: FinanceSection;
  setSection: (value: FinanceSection) => void;
  period: PeriodKey;
  setPeriod: (value: PeriodKey) => void;
  basis: ReportingBasis;
  setBasis: (value: ReportingBasis) => void;
}) {
  return (
    <>
      <div className="v2-intro finance-intro">
        <div>
          <h1>Financeiro</h1>
          <p>Controle resultados, compromissos e fluxo de caixa do seu negócio.</p>
        </div>
        <div className="finance-context-controls">
          <label>Período
            <select value={period} onChange={(event) => setPeriod(event.target.value as PeriodKey)}>
              {Object.entries(periods).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
            </select>
          </label>
          <div className="finance-basis" aria-label="Regime de apuração">
            <span>Regime</span>
            <div>
              <button className={basis === "cash" ? "active" : ""} onClick={() => setBasis("cash")}>Caixa</button>
              <button className={basis === "accrual" ? "active" : ""} onClick={() => setBasis("accrual")}>Competência</button>
            </div>
          </div>
        </div>
      </div>
      <nav className="v2-card finance-tabs" aria-label="Áreas do financeiro">
        {sectionLabels.map(([key, label]) => (
          <button key={key} className={section === key ? "active" : ""} onClick={() => setSection(key)}>{label}</button>
        ))}
      </nav>
    </>
  );
}

function FinanceTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="finance-chart-tooltip"><strong>{label}</strong>{payload.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}: {brl(item.value)}</span>)}</div>;
}

function Overview({ transactions, period, basis, goalCents }: { transactions: FinanceTransaction[]; period: PeriodKey; basis: ReportingBasis; goalCents: number }) {
  const summary = summarize(transactions, periods[period].range, basis);
  const monthlyData = useMemo(() => [
    ["Mai", "2026-05-01", "2026-05-31"],
    ["Jun", "2026-06-01", "2026-06-30"],
    ["Jul", "2026-07-01", "2026-07-31"],
    ["Ago", "2026-08-01", "2026-08-31"],
  ].map(([name, start, end]) => {
    const item = summarize(transactions, { start, end }, basis);
    return { name, Faturamento: item.grossCents, Despesas: item.expensesCents + item.directCostsCents + item.feesCents + item.taxesCents, Lucro: item.profitCents, Transações: item.transactionCount };
  }), [transactions, basis]);
  const costData = [
    { name: "Operacionais", value: summary.expensesCents, color: "#e7932d" },
    { name: "Custos diretos", value: summary.directCostsCents, color: "#7b62c9" },
    { name: "Taxas", value: summary.feesCents, color: "#4f8bd6" },
    { name: "Tributos", value: summary.taxesCents, color: "#e45f63" },
  ].filter((item) => item.value > 0);
  const paymentData = Object.entries(transactions.filter((item) => !item.cancelled && item.kind === "income" && item.competenceDate >= periods[period].range.start && item.competenceDate <= periods[period].range.end).reduce<Record<string, number>>((acc, item) => {
    acc[item.paymentMethod] = (acc[item.paymentMethod] ?? 0) + transactionValues(item).afterDiscountCents;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));
  const goalProgress = Math.max(0, Math.min(100, summary.profitCents / Math.max(goalCents, 1) * 100));
  const level = goalProgress >= 100 ? "Excelente" : goalProgress >= 80 ? "Ótimo" : goalProgress >= 60 ? "Bom" : goalProgress >= 40 ? "Médio" : "Baixo";
  const bridge = [
    { name: "Faturamento", value: summary.grossCents, tone: "positive" },
    { name: "Descontos", value: -summary.discountsCents, tone: "negative" },
    { name: "Custos", value: -(summary.expensesCents + summary.directCostsCents), tone: "negative" },
    { name: "Taxas", value: -summary.feesCents, tone: "negative" },
    { name: "Tributos", value: -summary.taxesCents, tone: "negative" },
    { name: "Lucro", value: summary.profitCents, tone: "result" },
  ];
  return (
    <>
      <section className="finance-metrics-grid">
        <FinanceMetric label="Faturamento bruto" value={brl(summary.grossCents)} detail={`${summary.transactionCount} transações no período`} tone="blue" icon={TrendingUp} />
        <FinanceMetric label="Receita após descontos" value={brl(summary.receivedCents)} detail={`${brl(summary.discountsCents)} em descontos`} tone="green" icon={Banknote} />
        <FinanceMetric label="Despesas e custos" value={brl(summary.expensesCents + summary.directCostsCents + summary.feesCents + summary.taxesCents)} detail={`${brl(summary.payableCents)} a pagar`} tone="orange" icon={ArrowDownRight} />
        <FinanceMetric label="Lucro gerencial" value={brl(summary.profitCents)} detail={`Margem de ${pct(summary.margin)}`} tone={summary.profitCents >= 0 ? "green" : "red"} icon={ArrowUpRight} />
        <FinanceMetric label="Contas a receber" value={brl(summary.receivableCents)} detail="Valores previstos" tone="blue" icon={WalletCards} />
        <FinanceMetric label="Valores vencidos" value={brl(summary.overdueCents)} detail="Receber e pagar" tone={summary.overdueCents ? "red" : "green"} icon={Clock3} />
      </section>
      <section className="finance-dashboard-grid">
        <article className="v2-card finance-chart-card finance-wide">
          <header><div><small>EVOLUÇÃO FINANCEIRA</small><h2>Faturamento, despesas e lucro</h2></div><span>{basis === "cash" ? "Realizado em caixa" : "Por competência"}</span></header>
          <div className="finance-chart-large"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={monthlyData} margin={{ top: 18, right: 18, left: 4, bottom: 0 }}><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#dfe8f3" /><XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis tickFormatter={(value) => brl(Number(value), true)} width={74} tickLine={false} axisLine={false} /><Tooltip content={<FinanceTooltip />} /><Legend iconType="circle" iconSize={8} /><Bar dataKey="Faturamento" fill="#6fa8ed" radius={[5, 5, 0, 0]} maxBarSize={34} /><Bar dataKey="Despesas" fill="#f2b361" radius={[5, 5, 0, 0]} maxBarSize={34} /><Line dataKey="Lucro" stroke="#0a58ad" strokeWidth={3} dot={{ r: 4, fill: "#0a58ad" }} /></ComposedChart></ResponsiveContainer></div>
        </article>
        <article className="v2-card finance-goal-card">
          <header><div><small>META DE LUCRO</small><h2>Desempenho do período</h2></div><Target size={20} /></header>
          <div className="finance-gauge" style={{ "--progress": `${goalProgress * 1.8}deg` } as React.CSSProperties}><div><strong>{pct(goalProgress)}</strong><span>{level}</span></div></div>
          <div className="finance-goal-values"><span>Realizado <b>{brl(summary.profitCents)}</b></span><span>Meta <b>{brl(goalCents)}</b></span></div>
          <div className="finance-levels"><i /><i /><i /><i /><i /></div>
          <small>Baixo　 Médio　 Bom　 Ótimo　 Excelente</small>
        </article>
        <article className="v2-card finance-chart-card finance-bridge-card">
          <header><div><small>FORMAÇÃO DO RESULTADO</small><h2>Do faturamento ao lucro</h2></div></header>
          <div className="finance-bridge">{bridge.map((item) => <div key={item.name} className={item.tone}><span>{item.name}</span><i style={{ height: `${Math.max(8, Math.abs(item.value) / Math.max(...bridge.map((entry) => Math.abs(entry.value)), 1) * 150)}px` }} /><b>{item.value < 0 ? "− " : ""}{brl(Math.abs(item.value), true)}</b></div>)}</div>
        </article>
        <article className="v2-card finance-chart-card">
          <header><div><small>COMPOSIÇÃO</small><h2>Custos do período</h2></div></header>
          <div className="finance-donut-wrap"><div className="finance-chart-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={costData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={3}>{costData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => brl(Number(value))} /></PieChart></ResponsiveContainer><strong>{brl(costData.reduce((sum, item) => sum + item.value, 0), true)}<small>Total</small></strong></div><div className="finance-legend">{costData.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}<b>{brl(item.value, true)}</b></span>)}</div></div>
        </article>
        <article className="v2-card finance-chart-card">
          <header><div><small>RECEBIMENTOS</small><h2>Formas de pagamento</h2></div></header>
          <div className="finance-donut-wrap"><div className="finance-chart-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={paymentData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={3}>{paymentData.map((item) => <Cell key={item.name} fill={paymentColors[item.name] ?? "#8da7c4"} />)}</Pie><Tooltip formatter={(value) => brl(Number(value))} /></PieChart></ResponsiveContainer><strong>{paymentData.length}<small>Meios</small></strong></div><div className="finance-legend">{paymentData.map((item) => <span key={item.name}><i style={{ background: paymentColors[item.name] ?? "#8da7c4" }} />{item.name}<b>{brl(item.value, true)}</b></span>)}</div></div>
        </article>
        <article className="v2-card finance-chart-card finance-wide">
          <header><div><small>RITMO DO NEGÓCIO</small><h2>Transações e lucro</h2></div></header>
          <div className="finance-chart-medium"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthlyData} margin={{ top: 15, right: 24, left: 4, bottom: 0 }}><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#dfe8f3" /><XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis yAxisId="money" tickFormatter={(value) => brl(Number(value), true)} width={70} tickLine={false} axisLine={false} /><YAxis yAxisId="count" orientation="right" allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip content={<FinanceTooltip />} /><Legend iconType="circle" iconSize={8} /><Area yAxisId="money" dataKey="Lucro" stroke="#0a58ad" fill="#dcecff" strokeWidth={3} /><Line yAxisId="count" dataKey="Transações" stroke="#8b5cc7" strokeWidth={3} /></LineChart></ResponsiveContainer></div>
        </article>
      </section>
    </>
  );
}

function StatusBadge({ status }: { status: ReturnType<typeof statusOf> }) {
  return <span className={`finance-status ${status}`}>● {statusLabel[status]}</span>;
}

function Entries({ transactions, onNew, onEdit, onSettle, onCancel }: { transactions: FinanceTransaction[]; onNew: () => void; onEdit: (item: FinanceTransaction) => void; onSettle: (transactionId: string, installmentId: string) => void; onCancel: (transactionId: string, installmentId: string) => void }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const filtered = transactions.filter((item) => {
    const itemStatus = item.cancelled ? "cancelled" : item.installments.every((installment) => statusOf(installment) === "paid") ? "paid" : item.installments.some((installment) => statusOf(installment) === "overdue") ? "overdue" : "pending";
    return item.description.toLowerCase().includes(query.toLowerCase()) && (kind === "all" || item.kind === kind) && (status === "all" || itemStatus === status) && (source === "all" || item.source === source);
  });
  const rows = filtered.flatMap((transaction) => transaction.installments.map((installment) => ({ transaction, installment, status: transaction.cancelled ? "cancelled" as const : statusOf(installment) })));
  return <article className="v2-card finance-table-card"><header className="finance-toolbar"><div className="v2-local-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar transação..." /></div><label>Tipo<select value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">Todos</option><option value="income">Receita</option><option value="expense">Despesa</option></select></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="paid">Liquidado</option><option value="pending">Pendente</option><option value="overdue">Vencido</option><option value="cancelled">Cancelado</option></select></label><label>Origem<select value={source} onChange={(event) => setSource(event.target.value)}><option value="all">Todas</option><option value="manual">Manual</option><option value="sale">Venda integrada</option></select></label><button className="v2-primary" onClick={onNew}><Plus size={16} />Nova transação</button></header><div className="finance-table-scroll"><table className="finance-table finance-transactions-table"><thead><tr><th>Transação</th><th>Tipo</th><th>Competência</th><th>Vencimento</th><th>Liquidação</th><th>Pagamento</th><th>Parcela</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody>{rows.map(({ transaction, installment, status: installmentStatus }) => <tr key={installment.id}><td><strong>{transaction.description}</strong><small>{transaction.id} · {transaction.source === "sale" ? "Venda integrada" : "Manual"}</small></td><td><span className={`finance-kind ${transaction.kind}`}>{transaction.kind === "income" ? "Receita" : "Despesa"}</span></td><td>{dateLabel(transaction.competenceDate)}</td><td>{dateLabel(installment.dueDate)}</td><td>{dateLabel(installment.settledAt)}</td><td>{transaction.paymentMethod}<small>{transaction.processor || "Sem operadora"}</small></td><td>{installment.number}/{installment.total}</td><td><b>{brl(installment.amountCents)}</b>{(transaction.feeOverride || transaction.taxOverride) && <small className="finance-override">Regra ajustada</small>}</td><td><StatusBadge status={installmentStatus} /></td><td><div className="finance-row-actions"><button className="finance-icon-button" onClick={() => onEdit(transaction)} aria-label={`Editar ${transaction.description}`}><Edit3 size={16} /></button>{installmentStatus !== "paid" && installmentStatus !== "cancelled" ? <><button className="finance-settle" onClick={() => onSettle(transaction.id, installment.id)}><Check size={14} />{transaction.kind === "income" ? "Receber" : "Pagar"}</button><button className="finance-icon-button" onClick={() => onCancel(transaction.id, installment.id)} title="Cancelar parcela"><X size={15} /></button></> : installmentStatus === "paid" ? <button className="finance-icon-button" onClick={() => onCancel(transaction.id, installment.id)} title="Estornar"><RotateCcw size={15} /></button> : null}</div></td></tr>)}</tbody></table></div><footer>Mostrando {rows.length} parcelas de {filtered.length} transações</footer></article>;
}

function Accounts({ transactions, kind, onSettle, onCancel }: { transactions: FinanceTransaction[]; kind: FinanceKind; onSettle: (transactionId: string, installmentId: string) => void; onCancel: (transactionId: string, installmentId: string) => void }) {
  const items = transactions.filter((item) => item.kind === kind && !item.cancelled).flatMap((transaction) => transaction.installments.map((installment) => ({ transaction, installment, status: statusOf(installment) }))).sort((a, b) => a.installment.dueDate.localeCompare(b.installment.dueDate));
  const pending = items.filter((item) => ["pending", "overdue"].includes(item.status)).reduce((sum, item) => sum + item.installment.amountCents, 0);
  const overdue = items.filter((item) => item.status === "overdue").reduce((sum, item) => sum + item.installment.amountCents, 0);
  const paid = items.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.installment.amountCents, 0);
  return <><section className="finance-account-summary"><div className="v2-card"><span>Em aberto</span><strong>{brl(pending)}</strong><small>{items.filter((item) => ["pending", "overdue"].includes(item.status)).length} parcelas</small></div><div className="v2-card"><span>Vencido</span><strong>{brl(overdue)}</strong><small>Requer atenção</small></div><div className="v2-card"><span>Liquidado</span><strong>{brl(paid)}</strong><small>No histórico exibido</small></div></section><article className="v2-card finance-table-card"><header className="finance-simple-head"><div><small>{kind === "income" ? "CONTAS A RECEBER" : "CONTAS A PAGAR"}</small><h2>Agenda de vencimentos</h2></div><button className="finance-secondary"><CalendarClock size={16} />Exportar agenda</button></header><div className="finance-table-scroll"><table className="finance-table"><thead><tr><th>Descrição</th><th>Parcela</th><th>Vencimento</th><th>Liquidação</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody>{items.map(({ transaction, installment, status }) => <tr key={installment.id}><td><strong>{transaction.description}</strong><small>{transaction.customer || transaction.category}</small></td><td>{installment.number}/{installment.total}</td><td>{dateLabel(installment.dueDate)}</td><td>{dateLabel(installment.settledAt)}</td><td><b>{brl(installment.amountCents)}</b></td><td><StatusBadge status={status} /></td><td><div className="finance-row-actions">{status !== "paid" && status !== "cancelled" ? <><button className="finance-settle" onClick={() => onSettle(transaction.id, installment.id)}><Check size={14} />{kind === "income" ? "Receber" : "Pagar"}</button><button className="finance-icon-button" onClick={() => onCancel(transaction.id, installment.id)} title="Cancelar parcela"><X size={15} /></button></> : status === "paid" ? <button className="finance-icon-button" onClick={() => onCancel(transaction.id, installment.id)} title="Estornar"><RotateCcw size={15} /></button> : null}</div></td></tr>)}</tbody></table></div></article></>;
}

function Closings({ transactions, basis, goalCents }: { transactions: FinanceTransaction[]; basis: ReportingBasis; goalCents: number }) {
  const rows = [
    ["Maio", { start: "2026-05-01", end: "2026-05-31" }],
    ["Junho", { start: "2026-06-01", end: "2026-06-30" }],
    ["Julho", { start: "2026-07-01", end: "2026-07-31" }],
    ["Agosto", { start: "2026-08-01", end: "2026-08-31" }],
  ] as const;
  const data = rows.map(([month, range]) => ({ month, ...summarize(transactions, range, basis) }));
  const year = summarize(transactions, periods.year.range, basis);
  return <><section className="finance-closing-hero v2-card"><div><small>CONSOLIDADO DE 2026</small><h2>Visão anual do resultado</h2><p>Comparativo mensal no regime de {basis === "cash" ? "caixa" : "competência"}.</p></div><div><span>Faturamento <b>{brl(year.grossCents)}</b></span><span>Lucro gerencial <b>{brl(year.profitCents)}</b></span><span>Margem <b>{pct(year.margin)}</b></span></div></section><article className="v2-card finance-table-card"><header className="finance-simple-head"><div><small>FECHAMENTOS MENSAIS</small><h2>Resultado por período</h2></div><span className="finance-note">Valores atualizados automaticamente</span></header><div className="finance-table-scroll"><table className="finance-table finance-closing-table"><thead><tr><th>Período</th><th>Transações</th><th>Faturamento</th><th>Custos totais</th><th>Lucro</th><th>Margem</th><th>Meta</th></tr></thead><tbody>{data.map((item) => { const costs = item.expensesCents + item.directCostsCents + item.feesCents + item.taxesCents; const performance = item.profitCents / goalCents * 100; return <tr key={item.month}><td><strong>{item.month} de 2026</strong></td><td>{item.transactionCount}</td><td>{brl(item.grossCents)}</td><td>{brl(costs)}</td><td><b className={item.profitCents >= 0 ? "finance-positive" : "finance-negative"}>{brl(item.profitCents)}</b></td><td>{pct(item.margin)}</td><td><div className="finance-mini-progress"><i style={{ width: `${Math.min(100, Math.max(0, performance))}%` }} /></div><small>{pct(performance)}</small></td></tr>; })}</tbody></table></div></article></>;
}

function SettingsPanel({ settings, setSettings }: { settings: FinanceSettings; setSettings: (value: FinanceSettings) => void }) {
  const [draftGoal, setDraftGoal] = useState(String(settings.monthlyGoalCents / 100));
  const [draftTax, setDraftTax] = useState(String(settings.taxBps / 100));
  const [newCategory, setNewCategory] = useState("");
  return <section className="finance-settings-grid"><article className="v2-card finance-settings-card"><header><div><small>METAS E TRIBUTOS</small><h2>Parâmetros gerenciais</h2></div><Target size={20} /></header><label>Meta mensal de lucro (R$)<input type="number" value={draftGoal} onChange={(event) => setDraftGoal(event.target.value)} onBlur={() => setSettings({ ...settings, monthlyGoalCents: Math.round(Number(draftGoal || 0) * 100) })} /></label><label>Percentual padrão de tributos (%)<input type="number" step="0.01" value={draftTax} onChange={(event) => setDraftTax(event.target.value)} onBlur={() => setSettings({ ...settings, taxBps: Math.round(Number(draftTax || 0) * 100) })} /></label><p>Os valores servem como padrão. Cada lançamento pode receber um ajuste próprio.</p></article><article className="v2-card finance-settings-card"><header><div><small>CATEGORIAS</small><h2>Classificação de custos</h2></div><Settings2 size={20} /></header><div className="finance-category-list">{settings.categories.map((category) => <span key={category}>{category}<button onClick={() => setSettings({ ...settings, categories: settings.categories.filter((item) => item !== category) })} aria-label={`Remover ${category}`}><X size={13} /></button></span>)}</div><div className="finance-add-category"><input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Nova categoria" /><button onClick={() => { if (newCategory.trim()) { setSettings({ ...settings, categories: [...settings.categories, newCategory.trim()] }); setNewCategory(""); } }}><Plus size={15} />Adicionar</button></div></article><article className="v2-card finance-settings-card finance-rules-card"><header><div><small>TAXAS DE PAGAMENTO</small><h2>Regras por operadora e parcelamento</h2></div><ReceiptText size={20} /></header><div className="finance-table-scroll"><table className="finance-table"><thead><tr><th>Forma</th><th>Operadora</th><th>Bandeira</th><th>Parcelas</th><th>Taxa</th><th></th></tr></thead><tbody>{settings.feeRules.map((rule) => <tr key={rule.id}><td><strong>{rule.method}</strong></td><td>{rule.processor || "Qualquer"}</td><td>{rule.brand || "Qualquer"}</td><td>{rule.installmentsFrom === rule.installmentsTo ? `${rule.installmentsFrom}x` : `${rule.installmentsFrom}–${rule.installmentsTo}x`}</td><td><b>{pct(rule.rateBps / 100)}</b></td><td><button className="finance-icon-button" onClick={() => setSettings({ ...settings, feeRules: settings.feeRules.filter((item) => item.id !== rule.id) })}><X size={15} /></button></td></tr>)}</tbody></table></div><button className="finance-secondary"><Plus size={15} />Nova regra</button></article></section>;
}

type FormState = { description: string; kind: FinanceKind; category: string; source: "manual" | "sale"; customer: string; product: string; competenceDate: string; dueDate: string; gross: string; discount: string; tax: string; directCost: string; fee: string; paymentMethod: string; processor: string; brand: string; installmentCount: string; feeOverride: boolean; taxOverride: boolean };
const emptyForm = (settings: FinanceSettings): FormState => ({ description: "", kind: "income", category: settings.categories[0] ?? "Outros", source: "manual", customer: "", product: "", competenceDate: "2026-08-05", dueDate: "2026-08-05", gross: "", discount: "0", tax: String(settings.taxBps / 100), directCost: "0", fee: "0", paymentMethod: "Pix", processor: "", brand: "", installmentCount: "1", feeOverride: false, taxOverride: false });

function TransactionDialog({ settings, initial, onClose, onSave }: { settings: FinanceSettings; initial?: FinanceTransaction; onClose: () => void; onSave: (value: FinanceTransaction) => void }) {
  const initialValues = initial ? transactionValues(initial) : null;
  const [form, setForm] = useState<FormState>(initial ? { description: initial.description, kind: initial.kind, category: initial.category, source: initial.source, customer: initial.customer ?? "", product: initial.product ?? "", competenceDate: initial.competenceDate, dueDate: initial.installments[0]?.dueDate ?? initial.competenceDate, gross: String(initial.grossCents / 100), discount: String(initial.discountBps / 100), tax: String(initial.taxBps / 100), directCost: String(initial.directCostCents / 100), fee: String(initial.feeBps / 100), paymentMethod: initial.paymentMethod, processor: initial.processor ?? "", brand: initial.brand ?? "", installmentCount: String(initial.installments.length), feeOverride: Boolean(initial.feeOverride), taxOverride: Boolean(initial.taxOverride) } : emptyForm(settings));
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const grossCents = Math.round(Number(form.gross || 0) * 100);
  const afterDiscount = grossCents - Math.round(grossCents * Number(form.discount || 0) / 100);
  const feeRule = resolveFeeRule(settings.feeRules, form.paymentMethod, form.processor, form.brand, Number(form.installmentCount));
  const feeBps = form.feeOverride ? Math.round(Number(form.fee || 0) * 100) : feeRule?.rateBps ?? 0;
  const taxBps = Math.round(Number(form.tax || 0) * 100);
  const preview = transactionValues({ id: "preview", description: form.description, kind: form.kind, category: form.category, source: form.source, competenceDate: form.competenceDate, grossCents, discountBps: Math.round(Number(form.discount || 0) * 100), taxBps, directCostCents: Math.round(Number(form.directCost || 0) * 100), feeBps, paymentMethod: form.paymentMethod, installments: [] });
  const submit = (event: FormEvent) => { event.preventDefault(); const id = initial?.id ?? `FIN-${String(1043 + Math.floor(Math.random() * 200)).padStart(4, "0")}`; const installments = splitInstallments(id, afterDiscount, Number(form.installmentCount), form.dueDate); onSave({ id, description: form.description || "Nova transação", kind: form.kind, category: form.category, source: form.source, customer: form.customer || undefined, product: form.product || undefined, competenceDate: form.competenceDate, grossCents, discountBps: Math.round(Number(form.discount || 0) * 100), taxBps, directCostCents: Math.round(Number(form.directCost || 0) * 100), feeBps, paymentMethod: form.paymentMethod, processor: form.processor || undefined, brand: form.brand || undefined, installments: initial ? installments.map((item, index) => initial.installments[index] ?? item) : installments, feeOverride: form.feeOverride, taxOverride: form.taxOverride }); };
  return <div className="v2-record-drawer finance-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="finance-dialog" onSubmit={submit}><header><div><small>FINANCEIRO · LANÇAMENTO</small><h2>{initial ? "Editar lançamento" : "Novo lançamento"}</h2><p>Registre uma receita ou despesa e confira os cálculos antes de salvar.</p></div><button type="button" onClick={onClose} aria-label="Fechar"><X size={19} /></button></header><div className="finance-kind-switch"><button type="button" className={form.kind === "income" ? "active income" : ""} onClick={() => update("kind", "income")}>Receita</button><button type="button" className={form.kind === "expense" ? "active expense" : ""} onClick={() => update("kind", "expense")}>Despesa</button></div><section className="finance-form-grid"><label className="span-2">Descrição<input required value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Ex.: Projeto de consultoria" /></label><label>Categoria<select value={form.category} onChange={(event) => update("category", event.target.value)}>{settings.categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Origem<select value={form.source} onChange={(event) => update("source", event.target.value as FormState["source"])}><option value="manual">Manual</option><option value="sale">Venda integrada</option></select></label><label>Cliente (opcional)<input value={form.customer} onChange={(event) => update("customer", event.target.value)} /></label><label>Produto/serviço (opcional)<input value={form.product} onChange={(event) => update("product", event.target.value)} /></label><label>Competência<input type="date" value={form.competenceDate} onChange={(event) => update("competenceDate", event.target.value)} /></label><label>Primeiro vencimento<input type="date" value={form.dueDate} onChange={(event) => update("dueDate", event.target.value)} /></label><label>Valor bruto (R$)<input required type="number" min="0" step="0.01" value={form.gross} onChange={(event) => update("gross", event.target.value)} /></label><label>Desconto (%)<input type="number" min="0" max="100" step="0.01" value={form.discount} onChange={(event) => update("discount", event.target.value)} /></label><label>Custo direto (R$)<input type="number" min="0" step="0.01" value={form.directCost} onChange={(event) => update("directCost", event.target.value)} /></label><label>Tributos (%)<input type="number" min="0" step="0.01" value={form.tax} onChange={(event) => { update("tax", event.target.value); update("taxOverride", Number(event.target.value) !== settings.taxBps / 100); }} /></label><label>Forma de pagamento<select value={form.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value)}><option>Pix</option><option>Cartão de crédito</option><option>Cartão de débito</option><option>Transferência</option><option>Boleto</option><option>Dinheiro</option></select></label><label>Operadora/adquirente<input value={form.processor} onChange={(event) => update("processor", event.target.value)} placeholder="Opcional" /></label><label>Bandeira<input value={form.brand} onChange={(event) => update("brand", event.target.value)} placeholder="Opcional" /></label><label>Parcelas<select value={form.installmentCount} onChange={(event) => update("installmentCount", event.target.value)}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}x</option>)}</select></label><label className="span-2 finance-check"><input type="checkbox" checked={form.feeOverride} onChange={(event) => { update("feeOverride", event.target.checked); update("fee", String((feeRule?.rateBps ?? 0) / 100)); }} />Substituir taxa calculada pela regra</label>{form.feeOverride && <label className="span-2">Taxa personalizada (%)<input type="number" min="0" step="0.01" value={form.fee} onChange={(event) => update("fee", event.target.value)} /></label>}</section><aside className="finance-preview"><header><strong>Prévia do lançamento</strong><span>{feeRule && !form.feeOverride ? `Regra aplicada: ${feeRule.method}` : form.feeOverride ? "Taxa personalizada" : "Sem taxa aplicável"}</span></header><div><span>Após desconto <b>{brl(preview.afterDiscountCents)}</b></span><span>Taxas <b>− {brl(preview.feeCents)}</b></span><span>Tributos <b>− {brl(preview.taxCents)}</b></span><span>Custos diretos <b>− {brl(Math.round(Number(form.directCost || 0) * 100))}</b></span><span className="result">Resultado gerencial <b>{brl(preview.resultCents)}</b></span></div><small>{form.installmentCount}x de aproximadamente {brl(Math.floor(afterDiscount / Math.max(Number(form.installmentCount), 1)))}</small>{initialValues && <small>Valor anterior: {brl(initialValues.afterDiscountCents)}</small>}</aside><footer><button type="button" onClick={onClose}>Cancelar</button><button className="v2-primary" type="submit"><Check size={16} />Salvar lançamento</button></footer></form></div>;
}

export default function FinanceExperience() {
  const [section, setSection] = useState<FinanceSection>("overview");
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [basis, setBasis] = useState<ReportingBasis>("accrual");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [settings, setSettings] = useState(defaultSettings);
  const [dialog, setDialog] = useState<FinanceTransaction | "new" | null>(null);
  const [notice, setNotice] = useState("");
  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2600); };
  const save = (transaction: FinanceTransaction) => { setTransactions((current) => current.some((item) => item.id === transaction.id) ? current.map((item) => item.id === transaction.id ? transaction : item) : [transaction, ...current]); setDialog(null); flash("Transação salva e indicadores atualizados."); };
  const updateInstallment = (transactionId: string, installmentId: string, action: "settle" | "cancel") => { setTransactions((current) => current.map((transaction) => transaction.id !== transactionId ? transaction : { ...transaction, installments: transaction.installments.map((installment) => installment.id !== installmentId ? installment : action === "settle" ? { ...installment, status: "paid" as const, settledAt: "2026-08-05" } : installment.status === "paid" ? { ...installment, status: "pending" as const, settledAt: undefined } : { ...installment, status: "cancelled" as const, settledAt: undefined }) })); flash(action === "settle" ? "Parcela liquidada com sucesso." : "Parcela atualizada."); };
  return <div className="finance-experience"><FinanceHeader section={section} setSection={setSection} period={period} setPeriod={setPeriod} basis={basis} setBasis={setBasis} />{section === "overview" && <Overview transactions={transactions} period={period} basis={basis} goalCents={settings.monthlyGoalCents * (period === "quarter" ? 3 : period === "year" ? 12 : 1)} />}{section === "entries" && <Entries transactions={transactions} onNew={() => setDialog("new")} onEdit={setDialog} onSettle={(t, i) => updateInstallment(t, i, "settle")} onCancel={(t, i) => updateInstallment(t, i, "cancel")} />}{section === "closing" && <Closings transactions={transactions} basis={basis} goalCents={settings.monthlyGoalCents} />}{section === "settings" && <SettingsPanel settings={settings} setSettings={setSettings} />}{dialog && <TransactionDialog settings={settings} initial={dialog === "new" ? undefined : dialog} onClose={() => setDialog(null)} onSave={save} />}{notice && <div className="finance-toast"><Check size={16} />{notice}</div>}</div>;
}
