"use client";
import { chartTooltipStyle } from "./chart-presentation";
import { appStorage } from "../../lib/local-store";
import { setExactDragPreview } from "./drag-preview";
import { listClinicalRecords, saveClinicalRecord, type ClinicalRecord } from "../../lib/clinical-records";
import { useAccess } from "./AccessControl";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import InfoHint from "./InfoHint";
import { ChartModeSelect, FlexibleChart, type ChartMode, type ChartSeries } from "./ChartModeSelect";
import { ClientSelect } from "./ClientsExperience";
import {
  InformativeMetricCardPreview,
  LineChartMetricCardPreview,
  MonthlyColumnChartPreview,
  RevenueGoalGaugePreview,
  type CardTone,
} from "../laboratorio/page";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Edit3,
  Eye,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  Settings2,
  Target,
  TrendingUp,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

type FinanceSection = "overview" | "entries" | "receivable" | "payable" | "cashflow" | "dre" | "banks" | "collections" | "commissions" | "closing" | "settings";
type PeriodKey = keyof typeof periods;

const sectionLabels: Array<[FinanceSection, string]> = [
  ["overview", "Visão geral"],
  ["entries", "Transações"],
  ["receivable", "A receber"],
  ["payable", "A pagar"],
  ["cashflow", "Fluxo de caixa"],
  ["dre", "DRE gerencial"],
  ["banks", "Bancos"],
  ["collections", "Cobranças"],
  ["commissions", "Comissões"],
  ["closing", "Fechamentos"],
  ["settings", "Regras e metas"],
];
const financeSectionIcons = [Eye, ReceiptText, WalletCards, CircleDollarSign, TrendingUp, Target, Banknote, Clock3, UsersRound, CalendarClock, Settings2];
const defaultOverviewMetrics = ["Saldo disponível", "Faturamento bruto", "Receita recebida", "Custos totais", "Lucro líquido", "Contas a receber", "Contas a pagar", "Saldo projetado"];
const extraOverviewMetrics = ["Margem líquida", "Custos diretos", "Taxas", "Tributos", "Valores vencidos", "Transações"];

const dateLabel = (value?: string) =>
  value ? new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`)) : "—";

const statusLabel = { paid: "Liquidado", pending: "Pendente", overdue: "Vencido", cancelled: "Cancelado" } as const;

function FinanceMetric({ label, value, detail, tone, icon: Icon, period, onPeriod, periodOptions }: { label: string; value: string; detail: string; tone: string; icon: typeof Banknote; period?: string; onPeriod?: (value: string) => void; periodOptions?: string[] }) {
  const cardTone: CardTone = tone === "red" ? "rose" : tone === "orange" ? "amber" : tone === "green" ? "teal" : "blue";
  return <div className="finance-kpi-cell"><InformativeMetricCardPreview tone={cardTone} icon={Icon} title={label} value={value} change={detail} />{period && onPeriod && periodOptions ? <ClientSelect compact hideLabel label={`Período de ${label}`} value={period} onChange={onPeriod} options={periodOptions} /> : null}</div>;
}

function FinanceHeader({ section, setSection, period, setPeriod, basis, setBasis, selectedMetrics, onAddMetric }: {
  section: FinanceSection;
  setSection: (value: FinanceSection) => void;
  period: PeriodKey;
  setPeriod: (value: PeriodKey) => void;
  basis: ReportingBasis;
  setBasis: (value: ReportingBasis) => void;
  selectedMetrics: string[];
  onAddMetric: (value: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const moveTabs = (direction: number) => navRef.current?.scrollBy({ left: direction * Math.max(240, navRef.current.clientWidth * .72), behavior: "smooth" });
  return (
    <>
      <div className="v2-intro client-compact-intro finance-intro has-action">
        <h1>Financeiro<InfoHint text="Controle resultados, compromissos e fluxo de caixa do seu negócio." /></h1>
        {section === "overview" ? <div className="finance-top-actions"><div className="finance-add-indicator"><button type="button" className="lab-create-activity" aria-label="Novo indicador" aria-expanded={pickerOpen} onClick={() => setPickerOpen((value) => !value)}><Plus size={17} />Novo indicador</button>{pickerOpen ? <div className="finance-indicator-menu">{[...defaultOverviewMetrics, ...extraOverviewMetrics].filter((name) => !selectedMetrics.includes(name)).map((name) => <button type="button" key={name} onClick={() => { onAddMetric(name); setPickerOpen(false); }}>{name}</button>)}</div> : null}</div><div className="finance-context-controls finance-overview-filters">
          <ClientSelect compact hideLabel label="Período" value={periods[period].label} onChange={(label) => { const match = Object.entries(periods).find(([, item]) => item.label === label); if (match) setPeriod(match[0] as PeriodKey); }} options={Object.values(periods).map((item) => item.label)} />
          <div className="finance-basis" aria-label="Regime de apuração">
            <div>
              <button className={basis === "cash" ? "active" : ""} title="Considera a data em que o dinheiro entra ou sai" onClick={() => setBasis("cash")}>Caixa</button>
              <button className={basis === "accrual" ? "active" : ""} title="Considera a data em que a receita ou despesa foi gerada" onClick={() => setBasis("accrual")}>Competência</button>
            </div>
          </div>
        </div></div> : null}
      </div>
      <div className="gest-horizontal-nav">
        <button type="button" className="gest-horizontal-nav-arrow previous" onClick={() => moveTabs(-1)} aria-label="Ver áreas anteriores do financeiro"><ChevronLeft size={17} /></button>
        <nav ref={navRef} className="v2-settings-tabs settings-modern-tabs finance-tabs" aria-label="Áreas do financeiro">
          {sectionLabels.map(([key, label], index) => {
            const Icon = financeSectionIcons[index];
            return <button key={key} className={section === key ? "active" : ""} onClick={() => setSection(key)}><Icon size={15} />{label}</button>;
          })}
        </nav>
        <button type="button" className="gest-horizontal-nav-arrow next" onClick={() => moveTabs(1)} aria-label="Ver próximas áreas do financeiro"><ChevronRight size={17} /></button>
      </div>
    </>
  );
}

function Overview({ transactions, period, basis, goalCents, selectedMetrics, onSetMetrics, onOpenTransactions, onOpenClosings }: { transactions: FinanceTransaction[]; period: PeriodKey; basis: ReportingBasis; goalCents: number; selectedMetrics: string[]; onSetMetrics: (value: string[]) => void; onOpenTransactions: () => void; onOpenClosings: () => void }) {
  const summary = summarize(transactions, periods[period].range, basis);
  const [draggedMetric, setDraggedMetric] = useState<string | null>(null);
  const [addedCharts, setAddedCharts] = useState<string[]>([]);
  const [chartPickerOpen, setChartPickerOpen] = useState(false);
  const [draggedChart, setDraggedChart] = useState<string | null>(null);
  const [hiddenCharts, setHiddenCharts] = useState<string[]>([]);
  const defaultChartLabels: Record<string, string> = { main: "Faturamento, despesas e lucro", result: "Resultado mensal", cash: "Meta de faturamento", expenses: "Composição dos custos", costs: "Fluxo de caixa projetado", due: "Próximos vencimentos", sources: "Receita por origem" };
  const [chartOrder, setChartOrder] = useState<string[]>(["main", "result", "cash", "expenses", "costs", "due", "sources"]);
  const [chartModes, setChartModes] = useState<Record<string, ChartMode>>({});
  useEffect(() => { try { const order = JSON.parse(appStorage.getItem("gest-finance-chart-order") || "null"); const modes = JSON.parse(appStorage.getItem("gest-finance-chart-modes") || "{}"); if (Array.isArray(order)) setChartOrder(order); if (modes && typeof modes === "object") setChartModes(modes); } catch { /* Use defaults. */ } }, []);
  const saveChartMode = (key: string, mode: ChartMode) => { const next = { ...chartModes, [key]: mode }; setChartModes(next); appStorage.setItem("gest-finance-chart-modes", JSON.stringify(next)); };
  const chartPosition = (key: string) => chartOrder.includes(key) ? chartOrder.indexOf(key) : chartOrder.length + addedCharts.indexOf(key);
  const startChartDrag = (event: React.DragEvent<HTMLElement>, key: string) => { setDraggedChart(key); setExactDragPreview(event); };
  const moveChart = (key: string) => { if (!draggedChart || draggedChart === key) return; const all = [...new Set([...chartOrder, ...addedCharts])]; const from = all.indexOf(draggedChart); const to = all.indexOf(key); if (from < 0 || to < 0) return; all.splice(to, 0, ...all.splice(from, 1)); setChartOrder(all); appStorage.setItem("gest-finance-chart-order", JSON.stringify(all)); setDraggedChart(null); };
  useEffect(() => { try { const value = JSON.parse(appStorage.getItem("gest-finance-extra-charts") || "[]"); if (Array.isArray(value)) setAddedCharts(value); } catch { /* Use defaults. */ } }, []);
  useEffect(() => { try { const value = JSON.parse(appStorage.getItem("gest-finance-hidden-charts") || "[]"); if (Array.isArray(value)) setHiddenCharts(value.filter((key): key is string => typeof key === "string")); } catch { /* Use defaults. */ } }, []);
  const saveCharts = (value: string[]) => { setAddedCharts(value); appStorage.setItem("gest-finance-extra-charts", JSON.stringify(value)); };
  const saveHiddenCharts = (value: string[]) => { setHiddenCharts(value); appStorage.setItem("gest-finance-hidden-charts", JSON.stringify(value)); };
  const removeDraggedChart = () => { if (!draggedChart) return; if (addedCharts.includes(draggedChart)) saveCharts(addedCharts.filter((key) => key !== draggedChart)); else saveHiddenCharts([...hiddenCharts, draggedChart]); setDraggedChart(null); window.dispatchEvent(new CustomEvent("gest-app-toast", { detail: "Gráfico removido." })); };
  const [chartPeriods, setChartPeriods] = useState<Record<string, number>>({ main: 12, result: 12, cash: 12, expenses: 12, costs: 12, due: 6, sources: 12 });
  const [costCategory, setCostCategory] = useState("Filtrar custo");
  const monthlyData = useMemo(() => [
    ["Set", "2024-09-01", "2024-09-30"], ["Out", "2024-10-01", "2024-10-31"], ["Nov", "2024-11-01", "2024-11-30"], ["Dez", "2024-12-01", "2024-12-31"],
    ["Jan", "2025-01-01", "2025-01-31"], ["Fev", "2025-02-01", "2025-02-28"], ["Mar", "2025-03-01", "2025-03-31"], ["Abr", "2025-04-01", "2025-04-30"],
    ["Mai", "2025-05-01", "2025-05-31"], ["Jun", "2025-06-01", "2025-06-30"], ["Jul", "2025-07-01", "2025-07-31"], ["Ago", "2025-08-01", "2025-08-31"],
    ["Set", "2025-09-01", "2025-09-30"], ["Out", "2025-10-01", "2025-10-31"], ["Nov", "2025-11-01", "2025-11-30"], ["Dez", "2025-12-01", "2025-12-31"],
    ["Jan", "2026-01-01", "2026-01-31"], ["Fev", "2026-02-01", "2026-02-28"], ["Mar", "2026-03-01", "2026-03-31"], ["Abr", "2026-04-01", "2026-04-30"],
    ["Mai", "2026-05-01", "2026-05-31"], ["Jun", "2026-06-01", "2026-06-30"], ["Jul", "2026-07-01", "2026-07-31"], ["Ago", "2026-08-01", "2026-08-31"],
  ].map(([name, start, end], index) => {
    const item = summarize(transactions, { start, end }, basis);
    const historicalGross = [408000, 432000, 469000, 491000, 475000, 498000, 512000, 538000, 551000, 568000, 591000, 607000, 526000, 583000, 612000, 648000, 691000, 674000, 729000, 761000, 795000, 812000, 864000, 840000];
    const historicalExpenses = [201000, 208000, 219000, 226000, 221000, 229000, 234000, 241000, 248000, 252000, 261000, 269000, 238000, 251000, 267000, 279000, 292000, 301000, 318000, 329000, 341000, 352000, 371000, 336740];
    const gross = item.grossCents || historicalGross[index];
    const expenses = item.expensesCents + item.directCostsCents + item.feesCents + item.taxesCents || historicalExpenses[index];
    return { name, Faturamento: gross, Despesas: expenses, Lucro: item.profitCents || gross - expenses, Transações: item.transactionCount || Math.max(1, Math.round(gross / 210000)) };
  }), [transactions, basis]);
  const chartData = (key: string) => monthlyData.slice(-(chartPeriods[key] ?? 12));
  const setChartPeriod = (key: string) => (value: string) => setChartPeriods((current) => ({ ...current, [key]: Number(value.match(/\d+/)?.[0] ?? 12) }));
  const costCategories = ["Filtrar custo", ...Array.from(new Set(transactions.filter((item) => item.kind === "expense").map((item) => item.category))), "Custos diretos", "Taxas", "Tributos"];
  const selectedCost = costCategory === "Custos diretos" ? summary.directCostsCents : costCategory === "Taxas" ? summary.feesCents : costCategory === "Tributos" ? summary.taxesCents : transactions.filter((item) => item.kind === "expense" && item.category === costCategory).reduce((total, item) => total + item.grossCents, 0);
  const resultPoints = chartData("result");
  const resultCurrent = resultPoints.at(-1)?.Lucro ?? 0;
  const resultPrevious = resultPoints.at(-2)?.Lucro ?? resultCurrent;
  const resultChange = resultPrevious ? ((resultCurrent - resultPrevious) / Math.abs(resultPrevious)) * 100 : 0;
  const totalCosts = summary.expensesCents + summary.directCostsCents + summary.feesCents + summary.taxesCents;
  const availableBalance = Math.max(0, summary.receivedCents - totalCosts);
  const projectedBalance = availableBalance + summary.receivableCents - summary.payableCents;
  const metricItems = [
    ["Saldo disponível", brl(availableBalance), "caixa atual", "blue", Banknote],
    ["Faturamento bruto", brl(summary.grossCents), `${summary.transactionCount} transações`, "blue", TrendingUp],
    ["Receita recebida", brl(summary.receivedCents), "entradas liquidadas", "green", ArrowDownRight],
    ["Custos totais", brl(totalCosts), "saídas da operação", "orange", ReceiptText],
    ["Lucro líquido", brl(summary.profitCents), `Margem de ${pct(summary.margin)}`, summary.profitCents >= 0 ? "green" : "red", ArrowUpRight],
    ["Contas a receber", brl(summary.receivableCents), "valores previstos", "blue", WalletCards],
    ["Contas a pagar", brl(summary.payableCents), "compromissos futuros", "orange", CircleDollarSign],
    ["Saldo projetado", brl(projectedBalance), summary.overdueCents ? `${brl(summary.overdueCents)} vencidos` : "sem valores vencidos", projectedBalance >= 0 ? "green" : "red", Target],
    ["Margem líquida", pct(summary.margin), "lucro sobre faturamento", "green", Target],
    ["Custos diretos", brl(summary.directCostsCents), "produção e serviços", "orange", ReceiptText],
    ["Taxas", brl(summary.feesCents), "taxas financeiras", "orange", CircleDollarSign],
    ["Tributos", brl(summary.taxesCents), "impostos apurados", "orange", Banknote],
    ["Valores vencidos", brl(summary.overdueCents), "contas em atraso", "red", Clock3],
    ["Transações", String(summary.transactionCount), "no período", "blue", ReceiptText],
  ] as const;
  const costPie = [
    { name: "Operação", value: summary.expensesCents, color: "#6eb8e2" },
    { name: "Diretos", value: summary.directCostsCents, color: "#73c1a5" },
    { name: "Taxas", value: summary.feesCents, color: "#e7b06b" },
    { name: "Tributos", value: summary.taxesCents, color: "#a895d8" },
  ];
  const dueData = [
    { name: "Hoje", receber: summary.receivableCents * .08, pagar: summary.payableCents * .12 },
    { name: "7 dias", receber: summary.receivableCents * .24, pagar: summary.payableCents * .28 },
    { name: "15 dias", receber: summary.receivableCents * .31, pagar: summary.payableCents * .27 },
    { name: "30 dias", receber: summary.receivableCents * .37, pagar: summary.payableCents * .33 },
  ];
  const sources = [
    { name: "Serviços", value: summary.grossCents * .48 },
    { name: "Produtos", value: summary.grossCents * .27 },
    { name: "Planos", value: summary.grossCents * .16 },
    { name: "Outros", value: summary.grossCents * .09 },
  ];
  const tooltipFormatter = (value: unknown) => brl(Number(Array.isArray(value) ? value[0] : value ?? 0));
  const ChartFilter = ({ chart }: { chart: string }) => {
    const points = chartData(chart);
    const metric = (point: (typeof monthlyData)[number]) => chart === "expenses" ? point.Despesas : chart === "costs" ? point.Faturamento - point.Despesas : point.Faturamento;
    const current = points.at(-1);
    const previous = points.at(-2);
    const dueNow = dueData[0].receber + dueData[0].pagar;
    const dueNext = dueData[1].receber + dueData[1].pagar;
    const change = chart === "due" ? (dueNow ? ((dueNext - dueNow) / dueNow) * 100 : 0) : current && previous && metric(previous) ? ((metric(current) - metric(previous)) / Math.abs(metric(previous))) * 100 : null;
    const favorable = chart === "expenses" ? (change ?? 0) <= 0 : (change ?? 0) >= 0;
    return <>{chart !== "result" && change !== null ? <span className={`finance-chart-trend ${favorable ? "positive" : "negative"}`} title={chart === "due" ? "Variação entre hoje e os próximos 7 dias" : "Variação em relação ao mês anterior"}>{change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}{Math.abs(change).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</span> : null}<ChartModeSelect value={chartModes[chart] || "Padrão"} onChange={(mode) => saveChartMode(chart, mode)} /><div className="finance-mini-chart-filter"><CalendarClock size={13} /><ClientSelect compact hideLabel label="Período" value={`${chartPeriods[chart] ?? 12} meses`} onChange={setChartPeriod(chart)} options={["6 meses", "12 meses", "24 meses"]} /></div></>;
  };
  const alternate = (key: string, data: Record<string, string | number>[], series: ChartSeries[], currency = true) => chartModes[key] && chartModes[key] !== "Padrão" ? <div className="finance-alternative-plot"><FlexibleChart mode={chartModes[key]} data={data} series={series} currency={currency} /></div> : null;
  return (
    <>
      <section className="finance-metrics-grid client-metrics client-overview-metrics">
        {selectedMetrics.map((name) => { const metric = metricItems.find((item) => item[0] === name); if (!metric) return null; return <div className="finance-metric-draggable" key={name} draggable onDragStart={(event) => { setDraggedMetric(name); setExactDragPreview(event); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (!draggedMetric || draggedMetric === name) return; const next = [...selectedMetrics]; next.splice(next.indexOf(name), 0, ...next.splice(next.indexOf(draggedMetric), 1)); onSetMetrics(next); setDraggedMetric(null); }} onDragEnd={() => setDraggedMetric(null)}><FinanceMetric label={metric[0]} value={metric[1]} detail={metric[2]} tone={metric[3]} icon={metric[4]} /></div>; })}
      </section>
      {draggedMetric ? <div className="gest-widget-trash" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onSetMetrics(selectedMetrics.filter((name) => name !== draggedMetric)); setDraggedMetric(null); window.dispatchEvent(new CustomEvent("gest-app-toast", { detail: "Indicador removido." })); }}><X size={19} />Solte para remover</div> : null}
      <section className="finance-cost-breakdown">
        <h2>Detalhamento de custos</h2>
        <ClientSelect compact hideLabel label="Categoria de custo" value={costCategory} onChange={setCostCategory} options={costCategories} />
        <div className="finance-cost-pills">{costCategory === "Filtrar custo" ? <><span>Operação <b>{brl(summary.expensesCents)}</b></span><span>Diretos <b>{brl(summary.directCostsCents)}</b></span><span>Taxas <b>{brl(summary.feesCents)}</b></span><span>Tributos <b>{brl(summary.taxesCents)}</b></span></> : <span>{costCategory} <b>{brl(selectedCost)}</b></span>}</div>
      </section>
      <section className={`finance-chart-library-grid ${hiddenCharts.map((key) => `chart-hidden-${key}`).join(" ")}`}>
        <article className="finance-chart-model finance-chart-main" data-chart-key={"main"} draggable style={{ order: chartPosition("main") }} onDragStart={(event) => startChartDrag(event, "main")} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); moveChart("main"); }} onDragEnd={() => setDraggedChart(null)}><header><h2>Faturamento, despesas e lucro</h2><ChartFilter chart="main" /></header>{alternate("main", chartData("main").map(p=>({name:p.name,Faturamento:p.Faturamento/100,Despesas:p.Despesas/100,Lucro:p.Lucro/100})), [{key:"Faturamento",name:"Faturamento",color:"#62b3e0"},{key:"Despesas",name:"Despesas",color:"#df858f"},{key:"Lucro",name:"Lucro",color:"#67b996"}])}<div><ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData("main")} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}><CartesianGrid stroke="#e3e9ee" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#7c8895", fontSize: 12 }} /><YAxis width={66} tickLine={false} axisLine={false} tick={{ fill: "#8793a0", fontSize: 12 }} tickFormatter={(value) => `${Math.round(Number(value) / 100000)} mil`} /><Tooltip formatter={tooltipFormatter} contentStyle={chartTooltipStyle} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} /><Line type="linear" dataKey="Faturamento" stroke="#62b3e0" strokeWidth={3} dot={{ r: 2.5 }} /><Line type="linear" dataKey="Despesas" stroke="#df858f" strokeWidth={2.4} dot={{ r: 2.5 }} /><Line type="linear" dataKey="Lucro" stroke="#67b996" strokeWidth={2.4} dot={{ r: 2.5 }} /></ComposedChart></ResponsiveContainer></div></article>

        <article className="finance-chart-model" data-chart-key={"result"} draggable style={{ order: chartPosition("result") }} onDragStart={(event) => startChartDrag(event, "result")} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); moveChart("result"); }} onDragEnd={() => setDraggedChart(null)}><header><h2>Resultado mensal</h2><span className={`finance-chart-trend ${resultChange >= 0 ? "positive" : "negative"}`} title="Variação em relação ao mês anterior">{resultChange >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}{Math.abs(resultChange).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</span><ChartFilter chart="result" /></header>{alternate("result", resultPoints.map(p=>({name:p.name,Despesas:p.Despesas/100,Lucro:p.Lucro/100})), [{key:"Despesas",name:"Despesas",color:"#62b3e0"},{key:"Lucro",name:"Lucro",color:"#df858f"}])}<div><ResponsiveContainer width="100%" height="100%"><BarChart data={resultPoints} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}><CartesianGrid stroke="#e3e9ee" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#7c8895", fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#8793a0", fontSize: 10 }} tickFormatter={(value) => `${Math.round(Number(value) / 100000)} mil`} /><Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} /><Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 10 }} /><Bar dataKey="Despesas" stackId="resultado" fill="#efb0a7" radius={[0, 0, 3, 3]} /><Bar dataKey="Lucro" stackId="resultado" fill="#71c0a5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></article>

        <article className="finance-chart-model" data-chart-key={"cash"} draggable style={{ order: chartPosition("cash") }} onDragStart={(event) => startChartDrag(event, "cash")} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); moveChart("cash"); }} onDragEnd={() => setDraggedChart(null)}><header><h2>Meta de faturamento</h2><ChartFilter chart="cash" /></header>{alternate("cash", chartData("cash").map(p=>({name:p.name,Faturamento:p.Faturamento/100})), [{key:"Faturamento",name:"Faturamento",color:"#62b3e0"}])}<div className="finance-chart-gauge-wrap"><RevenueGoalGaugePreview current={summary.grossCents / 100} target={goalCents / 100} change={summary.margin} /></div></article>

        <article className="finance-chart-model" data-chart-key={"expenses"} draggable style={{ order: chartPosition("expenses") }} onDragStart={(event) => startChartDrag(event, "expenses")} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); moveChart("expenses"); }} onDragEnd={() => setDraggedChart(null)}><header><h2>Composição dos custos</h2><ChartFilter chart="expenses" /></header>{alternate("expenses", [{name:"Atual",Operação:summary.expensesCents/100,Diretos:summary.directCostsCents/100,Taxas:summary.feesCents/100,Tributos:summary.taxesCents/100}], [{key:"Operação",name:"Operação",color:"#62b3e0"},{key:"Diretos",name:"Diretos",color:"#df858f"},{key:"Taxas",name:"Taxas",color:"#67b996"},{key:"Tributos",name:"Tributos",color:"#e5b266"}])}<div className="finance-pie-layout"><ResponsiveContainer width="58%" height="100%"><PieChart><Pie data={costPie} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} paddingAngle={3} stroke="none">{costPie.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} /></PieChart></ResponsiveContainer><div>{costPie.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}<b>{brl(item.value)}</b></span>)}</div></div></article>

        <article className="finance-chart-model" data-chart-key={"costs"} draggable style={{ order: chartPosition("costs") }} onDragStart={(event) => startChartDrag(event, "costs")} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); moveChart("costs"); }} onDragEnd={() => setDraggedChart(null)}><header><h2>Fluxo de caixa projetado</h2><ChartFilter chart="costs" /></header>{alternate("costs", chartData("costs").map(p=>({name:p.name,Entradas:p.Faturamento/100,Saídas:p.Despesas/100})), [{key:"Entradas",name:"Entradas",color:"#62b3e0"},{key:"Saídas",name:"Saídas",color:"#df858f"}])}<div><ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData("costs")} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}><CartesianGrid stroke="#e3e9ee" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#7c8895", fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#8793a0", fontSize: 10 }} tickFormatter={(value) => `${Math.round(Number(value) / 100000)} mil`} /><Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} /><Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 10 }} /><Line type="linear" dataKey="Faturamento" name="Entradas" stroke="#62b3e0" strokeWidth={3} dot={{ r: 2.5 }} /><Line type="linear" dataKey="Despesas" name="Saídas" stroke="#df858f" strokeWidth={2.4} dot={{ r: 2.5 }} /></ComposedChart></ResponsiveContainer></div></article>

        <article className="finance-chart-model" data-chart-key={"due"} draggable style={{ order: chartPosition("due") }} onDragStart={(event) => startChartDrag(event, "due")} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); moveChart("due"); }} onDragEnd={() => setDraggedChart(null)}><header><h2>Próximos vencimentos</h2><ChartFilter chart="due" /></header>{alternate("due", dueData.map(p=>({name:p.name,receber:p.receber/100,pagar:p.pagar/100})), [{key:"receber",name:"receber",color:"#62b3e0"},{key:"pagar",name:"pagar",color:"#df858f"}])}<div><ResponsiveContainer width="100%" height="100%"><BarChart data={dueData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}><CartesianGrid stroke="#e3e9ee" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#7c8895", fontSize: 9 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#8793a0", fontSize: 9 }} tickFormatter={(value) => `${Math.round(Number(value) / 100000)} mil`} /><Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} /><Legend iconType="circle" iconSize={7} /><Bar dataKey="receber" name="A receber" fill="#70bea3" radius={[6, 6, 0, 0]} /><Bar dataKey="pagar" name="A pagar" fill="#e5a171" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></article>

        <article className="finance-chart-model" data-chart-key={"sources"} draggable style={{ order: chartPosition("sources") }} onDragStart={(event) => startChartDrag(event, "sources")} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); moveChart("sources"); }} onDragEnd={() => setDraggedChart(null)}><header><h2>Receita por origem</h2><ChartFilter chart="sources" /></header>{alternate("sources", sources.map(p=>({name:p.name,value:p.value/100})), [{key:"value",name:"value",color:"#62b3e0"}])}<div><ResponsiveContainer width="100%" height="100%"><BarChart data={sources} layout="vertical" margin={{ top: 8, right: 20, left: 4, bottom: 0 }}><CartesianGrid stroke="#e3e9ee" strokeDasharray="3 5" horizontal={false} /><XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#8793a0", fontSize: 9 }} tickFormatter={(value) => `${Math.round(Number(value) / 100000)} mil`} /><YAxis width={58} type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#75818e", fontSize: 9 }} /><Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} /><Bar dataKey="value" name="Receita" fill="#75bde4" radius={[0, 7, 7, 0]} /></BarChart></ResponsiveContainer></div></article>
        {addedCharts.map((name) => {
          const metric = name === "Despesas mensais" ? "Despesas" : name === "Lucro mensal" ? "Lucro" : "Faturamento";
          const isPercent = name === "Margem mensal";
          const isCount = name === "Volume de transações";
          const data = chartData(name).map((item) => ({ name: item.name, value: isPercent ? item.Faturamento ? item.Lucro / item.Faturamento * 100 : 0 : isCount ? item.Transações : item[metric] }));
          const previous = data.at(-2)?.value ?? 0;
          const current = data.at(-1)?.value ?? 0;
          const change = previous ? ((current - previous) / Math.abs(previous)) * 100 : 0;
          const favorable = name === "Despesas mensais" ? change <= 0 : change >= 0;
          return <article className="finance-chart-model" key={name} data-chart-key={name} draggable style={{ order: chartPosition(name) }} onDragStart={(event) => startChartDrag(event, name)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); moveChart(name); }} onDragEnd={() => setDraggedChart(null)}>
            <header><h2>{name}</h2><span className={`finance-chart-trend ${favorable ? "positive" : "negative"}`} title="Variação em relação ao mês anterior">{change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}{Math.abs(change).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</span><ChartModeSelect value={chartModes[name] || "Padrão"} onChange={(mode) => saveChartMode(name, mode)} /><div className="finance-mini-chart-filter"><CalendarClock size={13} /><ClientSelect compact hideLabel label="Período" value={`${chartPeriods[name] ?? 12} meses`} onChange={setChartPeriod(name)} options={["6 meses", "12 meses", "24 meses"]} /></div></header>
            {alternate(name, data.map((point) => ({ name:point.name, value:isPercent || isCount ? point.value : point.value/100 })), [{key:"value",name,color:"#62b3e0"}], !isPercent && !isCount)}
            <div><ResponsiveContainer width="100%" height="100%"><ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><CartesianGrid stroke="#e3e9ee" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#7c8895", fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#8793a0", fontSize: 10 }} tickFormatter={(value) => isPercent ? `${Math.round(Number(value))}%` : isCount ? String(value) : `${Math.round(Number(value) / 100000)} mil`} /><Tooltip contentStyle={chartTooltipStyle} formatter={(value) => isPercent ? `${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : isCount ? Number(value).toLocaleString("pt-BR") : brl(Number(value))} /><Line type="linear" dataKey="value" name={name} stroke="#62b3e0" strokeWidth={3} dot={{ r: 2.5 }} /></ComposedChart></ResponsiveContainer></div>
          </article>;
        })}
        <div className="finance-add-chart" style={{ order: 1000 }}><button type="button" className="gest-widget-add" onClick={() => setChartPickerOpen((value) => !value)} aria-expanded={chartPickerOpen}><Plus size={18} />Inserir indicador</button>{chartPickerOpen ? <div className="finance-indicator-menu">{hiddenCharts.map((key) => <button type="button" key={key} onClick={() => { saveHiddenCharts(hiddenCharts.filter((item) => item !== key)); setChartPickerOpen(false); }}>{defaultChartLabels[key] ?? key}</button>)}{["Faturamento mensal", "Despesas mensais", "Lucro mensal", "Margem mensal", "Volume de transações"].filter((name) => !addedCharts.includes(name)).map((name) => <button type="button" key={name} onClick={() => { saveCharts([...addedCharts, name]); setChartPickerOpen(false); }}>{name}</button>)}</div> : null}</div>
      </section>
      {draggedChart ? <div className="gest-widget-trash" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); removeDraggedChart(); }}><X size={19} />Solte para remover</div> : null}
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
  const [page, setPage] = useState(1);
  const filtered = transactions.filter((item) => {
    const itemStatus = item.cancelled ? "cancelled" : item.installments.every((installment) => statusOf(installment) === "paid") ? "paid" : item.installments.some((installment) => statusOf(installment) === "overdue") ? "overdue" : "pending";
    return item.description.toLowerCase().includes(query.toLowerCase()) && (kind === "all" || item.kind === kind) && (status === "all" || itemStatus === status) && (source === "all" || item.source === source);
  });
  const allRows = filtered.flatMap((transaction) => transaction.installments.map((installment) => ({ transaction, installment, status: transaction.cancelled ? "cancelled" as const : statusOf(installment) })));
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(allRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = allRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return <article className="v2-card v2-client-table v2-ranked-client-table finance-table-card finance-modern-table"><header className="finance-toolbar"><div className="lab-search-form client-local-search"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar transação..." /><button type="button" className={query ? "visible" : ""} onClick={() => { setQuery(""); setPage(1); }} aria-label="Limpar busca"><X size={16} /></button></div><ClientSelect label="Tipo" value={kind === "all" ? "Todos" : kind === "income" ? "Receita" : "Despesa"} onChange={(value) => { setKind(value === "Todos" ? "all" : value === "Receita" ? "income" : "expense"); setPage(1); }} options={["Todos", "Receita", "Despesa"]} /><ClientSelect label="Status" value={status === "all" ? "Todos" : statusLabel[status as keyof typeof statusLabel]} onChange={(value) => { setStatus(value === "Todos" ? "all" : Object.entries(statusLabel).find(([, label]) => label === value)?.[0] ?? "all"); setPage(1); }} options={["Todos", ...Object.values(statusLabel)]} showDot /><ClientSelect label="Origem" value={source === "all" ? "Todas" : source === "manual" ? "Manual" : source === "clinical" ? "Atendimento clínico" : "Venda integrada"} onChange={(value) => { setSource(value === "Todas" ? "all" : value === "Manual" ? "manual" : value === "Atendimento clínico" ? "clinical" : "sale"); setPage(1); }} options={["Todas", "Manual", "Venda integrada", "Atendimento clínico"]} /><button className="lab-create-activity" onClick={onNew}><Plus size={16} />Nova transação</button></header><div className="finance-table-scroll"><table className="finance-table finance-transactions-table"><thead><tr><th>Transação</th><th>Tipo</th><th>Competência</th><th>Vencimento</th><th>Liquidação</th><th>Pagamento</th><th>Parcela</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody>{rows.map(({ transaction, installment, status: installmentStatus }) => <tr key={installment.id}><td><strong>{transaction.description}</strong><small>{transaction.id} · {transaction.source === "sale" ? "Venda integrada" : transaction.source === "clinical" ? "Atendimento clínico" : "Manual"}</small></td><td><span className={`finance-kind ${transaction.kind}`}>{transaction.kind === "income" ? "Receita" : "Despesa"}</span></td><td>{dateLabel(transaction.competenceDate)}</td><td>{dateLabel(installment.dueDate)}</td><td>{dateLabel(installment.settledAt)}</td><td>{transaction.paymentMethod}<small>{transaction.processor || "Sem operadora"}</small></td><td>{installment.number}/{installment.total}</td><td><b>{brl(installment.amountCents)}</b>{(transaction.feeOverride || transaction.taxOverride) && <small className="finance-override">Regra ajustada</small>}</td><td><StatusBadge status={installmentStatus} /></td><td><div className="finance-row-actions"><button className="finance-icon-button" disabled={transaction.source === "clinical"} title={transaction.source === "clinical" ? "Edite no prontuário" : "Editar transação"} onClick={() => onEdit(transaction)} aria-label={`Editar ${transaction.description}`}><Edit3 size={16} /></button>{installmentStatus !== "paid" && installmentStatus !== "cancelled" ? <><button className="finance-settle" onClick={() => onSettle(transaction.id, installment.id)}><Check size={14} />{transaction.kind === "income" ? "Receber" : "Pagar"}</button><button className="finance-icon-button" onClick={() => onCancel(transaction.id, installment.id)} title="Cancelar parcela"><X size={15} /></button></> : installmentStatus === "paid" ? <button className="finance-icon-button" onClick={() => onCancel(transaction.id, installment.id)} title="Estornar"><RotateCcw size={15} /></button> : null}</div></td></tr>)}</tbody></table></div><footer className="finance-list-footer"><span>Mostrando {rows.length} de {allRows.length} parcelas</span><div><button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Anterior</button><b>{currentPage} de {pageCount}</b><button type="button" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Próxima</button></div></footer></article>;
}

function Accounts({ transactions, kind, onSettle, onCancel }: { transactions: FinanceTransaction[]; kind: FinanceKind; onSettle: (transactionId: string, installmentId: string) => void; onCancel: (transactionId: string, installmentId: string) => void }) {
  const items = transactions.filter((item) => item.kind === kind && !item.cancelled).flatMap((transaction) => transaction.installments.map((installment) => ({ transaction, installment, status: statusOf(installment) }))).sort((a, b) => a.installment.dueDate.localeCompare(b.installment.dueDate));
  const pending = items.filter((item) => ["pending", "overdue"].includes(item.status)).reduce((sum, item) => sum + item.installment.amountCents, 0);
  const overdue = items.filter((item) => item.status === "overdue").reduce((sum, item) => sum + item.installment.amountCents, 0);
  const paid = items.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.installment.amountCents, 0);
  return <><section className="finance-metrics-grid client-metrics client-overview-metrics finance-account-summary"><FinanceMetric label="Em aberto" value={brl(pending)} detail={`${items.filter((item) => ["pending", "overdue"].includes(item.status)).length} parcelas`} tone="blue" icon={Clock3} /><FinanceMetric label="Vencido" value={brl(overdue)} detail="Requer atenção" tone="red" icon={CalendarClock} /><FinanceMetric label="Liquidado" value={brl(paid)} detail="No histórico exibido" tone="green" icon={Check} /></section><article className="v2-card finance-table-card"><header className="finance-simple-head"><div><small>{kind === "income" ? "CONTAS A RECEBER" : "CONTAS A PAGAR"}</small><h2>Agenda de vencimentos</h2></div><button className="finance-secondary" onClick={() => { const rows = items.map(({ transaction, installment, status }) => [transaction.description, installment.number, installment.total, installment.dueDate, (installment.amountCents / 100).toFixed(2), status].join(";")); const blob = new Blob([["Descrição;Parcela;Total;Vencimento;Valor;Status", ...rows].join("\n")], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `agenda-${kind === "income" ? "receber" : "pagar"}.csv`; link.click(); URL.revokeObjectURL(url); }}><CalendarClock size={16} />Exportar agenda</button></header><div className="finance-table-scroll"><table className="finance-table"><thead><tr><th>Descrição</th><th>Parcela</th><th>Vencimento</th><th>Liquidação</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody>{items.map(({ transaction, installment, status }) => <tr key={installment.id}><td><strong>{transaction.description}</strong><small>{transaction.customer || transaction.category}</small></td><td>{installment.number}/{installment.total}</td><td>{dateLabel(installment.dueDate)}</td><td>{dateLabel(installment.settledAt)}</td><td><b>{brl(installment.amountCents)}</b></td><td><StatusBadge status={status} /></td><td><div className="finance-row-actions">{status !== "paid" && status !== "cancelled" ? <><button className="finance-settle" onClick={() => onSettle(transaction.id, installment.id)}><Check size={14} />{kind === "income" ? "Receber" : "Pagar"}</button><button className="finance-icon-button" onClick={() => onCancel(transaction.id, installment.id)} title="Cancelar parcela"><X size={15} /></button></> : status === "paid" ? <button className="finance-icon-button" onClick={() => onCancel(transaction.id, installment.id)} title="Estornar"><RotateCcw size={15} /></button> : null}</div></td></tr>)}</tbody></table></div></article></>;
}

const financeAreaContent: Record<"cashflow" | "dre" | "banks" | "collections" | "commissions", { title: string; metrics: Array<[string, string, string, string]>; rows: Array<[string, string, string]> }> = {
  cashflow: { title: "Fluxo de caixa", metrics: [["Saldo inicial", "R$ 42.800", "abertura do período", "blue"], ["Entradas previstas", "R$ 68.400", "próximos 30 dias", "green"], ["Saídas previstas", "R$ 39.720", "próximos 30 dias", "orange"], ["Saldo projetado", "R$ 71.480", "cenário realista", "green"]], rows: [["Operacional", "R$ 52.300", "Realizado"], ["Investimentos", "R$ 8.400", "Projetado"], ["Financiamentos", "R$ 4.200", "Projetado"]] },
  dre: { title: "DRE gerencial", metrics: [["Receita líquida", "R$ 73.100", "+12,4%", "blue"], ["Lucro bruto", "R$ 48.620", "66,5% de margem", "green"], ["Resultado operacional", "R$ 39.840", "54,5% de margem", "green"], ["Ponto de equilíbrio", "R$ 41.600", "meta superada", "violet"]], rows: [["Receita bruta", "R$ 84.000", "100%"], ["Custos e despesas", "R$ 44.160", "52,6%"], ["Lucro líquido", "R$ 39.840", "47,4%"]] },
  banks: { title: "Bancos e conciliação", metrics: [["Saldo bancário", "R$ 54.280", "3 contas", "blue"], ["Conciliadas", "148", "94% do período", "green"], ["Pendentes", "9", "requer conferência", "orange"], ["Divergência", "R$ 420", "2 movimentos", "red"]], rows: [["Banco Principal", "R$ 38.420", "Conciliado"], ["Conta Digital", "R$ 12.860", "3 pendências"], ["Caixa físico", "R$ 3.000", "Fechado"]] },
  collections: { title: "Cobranças", metrics: [["Cobranças enviadas", "86", "no período", "blue"], ["Pagas", "71", "82,6%", "green"], ["Vencidas", "8", "R$ 6.240", "red"], ["Tempo médio", "3,2 dias", "até o pagamento", "violet"]], rows: [["WhatsApp", "48 envios", "88% pagos"], ["Pix", "26 cobranças", "92% pagos"], ["Boleto", "12 cobranças", "67% pagos"]] },
  commissions: { title: "Comissões", metrics: [["Gerada", "R$ 8.460", "mês atual", "blue"], ["Paga", "R$ 6.220", "73,5%", "green"], ["Pendente", "R$ 2.240", "4 profissionais", "orange"], ["Média", "8,4%", "sobre receita", "violet"]], rows: [["Marina", "R$ 3.280", "Pago"], ["João", "R$ 2.940", "Pago"], ["Carlos", "R$ 2.240", "Pendente"]] },
};

function FinanceAreaPanel({ area }: { area: keyof typeof financeAreaContent }) {
  const config = financeAreaContent[area];
  const [period, setPeriod] = useState("12 meses");
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const currentYear = [42, 48, 45, 55, 58, 62, 68, 72, 76, 81, 86, 92];
  const fullHistory = [...currentYear.map((value) => Math.round(value * .77)), ...currentYear];
  const count = Number(period.match(/\d+/)?.[0] ?? 12);
  const chart = fullHistory.slice(-count).map((value, index) => ({ name: `${monthNames[(24 - count + index) % 12]} ${24 - count + index < 12 ? "25" : "26"}`, value: value * 1000 }));
  return <><section className="finance-metrics-grid client-metrics client-overview-metrics finance-area-metrics">{config.metrics.map(([label, value, detail, tone]) => <FinanceMetric key={label} label={label} value={value} detail={detail} tone={tone} icon={label.includes("Saldo") ? Banknote : label.includes("Pendente") || label.includes("Vencid") ? Clock3 : TrendingUp} />)}</section><section className="finance-area-grid"><article className="finance-chart-model"><header><h2>{config.title}</h2><div className="finance-mini-chart-filter"><CalendarClock size={13} /><ClientSelect compact hideLabel label="Período" value={period} onChange={setPeriod} options={["6 meses", "12 meses", "24 meses"]} /></div></header><div><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart}><CartesianGrid stroke="#e3e9ee" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#7c8895" }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#8793a0" }} tickFormatter={(value) => `${Math.round(Number(value) / 1000)} mil`} /><Tooltip contentStyle={chartTooltipStyle} formatter={(value) => brl(Number(value) * 100)} /><Area type="monotone" dataKey="value" stroke="#63b3e0" strokeWidth={3} fill="#ddecf6" /></AreaChart></ResponsiveContainer></div></article><article className="v2-card finance-area-list"><header><h2>Detalhamento</h2><button type="button" className="finance-secondary" onClick={() => { const csv = [["Item", "Valor", "Status"], ...config.rows].map((row) => row.join(";")).join("\n"); const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${area}-detalhamento.csv`; link.click(); URL.revokeObjectURL(url); }}>Exportar</button></header>{config.rows.map(([label, value, status]) => <div key={label}><span><strong>{label}</strong><small>{status}</small></span><b>{value}</b></div>)}</article></section></>;
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
  const [form, setForm] = useState<FormState>(initial ? { description: initial.description, kind: initial.kind, category: initial.category, source: initial.source === "clinical" ? "manual" : initial.source, customer: initial.customer ?? "", product: initial.product ?? "", competenceDate: initial.competenceDate, dueDate: initial.installments[0]?.dueDate ?? initial.competenceDate, gross: String(initial.grossCents / 100), discount: String(initial.discountBps / 100), tax: String(initial.taxBps / 100), directCost: String(initial.directCostCents / 100), fee: String(initial.feeBps / 100), paymentMethod: initial.paymentMethod, processor: initial.processor ?? "", brand: initial.brand ?? "", installmentCount: String(initial.installments.length), feeOverride: Boolean(initial.feeOverride), taxOverride: Boolean(initial.taxOverride) } : emptyForm(settings));
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const grossCents = Math.round(Number(form.gross || 0) * 100);
  const afterDiscount = grossCents - Math.round(grossCents * Number(form.discount || 0) / 100);
  const feeRule = resolveFeeRule(settings.feeRules, form.paymentMethod, form.processor, form.brand, Number(form.installmentCount));
  const feeBps = form.feeOverride ? Math.round(Number(form.fee || 0) * 100) : feeRule?.rateBps ?? 0;
  const taxBps = Math.round(Number(form.tax || 0) * 100);
  const preview = transactionValues({ id: "preview", description: form.description, kind: form.kind, category: form.category, source: form.source, competenceDate: form.competenceDate, grossCents, discountBps: Math.round(Number(form.discount || 0) * 100), taxBps, directCostCents: Math.round(Number(form.directCost || 0) * 100), feeBps, paymentMethod: form.paymentMethod, installments: [] });
  const submit = (event: FormEvent) => { event.preventDefault(); const id = initial?.id ?? `FIN-${String(1043 + Math.floor(Math.random() * 200)).padStart(4, "0")}`; const installments = splitInstallments(id, afterDiscount, Number(form.installmentCount), form.dueDate); onSave({ id, description: form.description || "Nova transação", kind: form.kind, category: form.category, source: form.source, customer: form.customer || undefined, product: form.product || undefined, competenceDate: form.competenceDate, grossCents, discountBps: Math.round(Number(form.discount || 0) * 100), taxBps, directCostCents: Math.round(Number(form.directCost || 0) * 100), feeBps, paymentMethod: form.paymentMethod, processor: form.processor || undefined, brand: form.brand || undefined, installments: initial ? installments.map((item, index) => initial.installments[index] ?? item) : installments, feeOverride: form.feeOverride, taxOverride: form.taxOverride }); };
  return <div className="v2-record-drawer finance-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="finance-dialog" onSubmit={submit}><header><div><small>FINANCEIRO · LANÇAMENTO</small><h2>{initial ? "Editar lançamento" : "Novo lançamento"}</h2><p>Registre uma receita ou despesa e confira os cálculos antes de salvar.</p></div><button type="button" onClick={onClose} aria-label="Fechar"><X size={19} /></button></header><div className="finance-kind-switch"><button type="button" className={form.kind === "income" ? "active income" : ""} onClick={() => update("kind", "income")}>Receita</button><button type="button" className={form.kind === "expense" ? "active expense" : ""} onClick={() => update("kind", "expense")}>Despesa</button></div><section className="finance-form-grid"><label className="span-2">Descrição<input required value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Ex.: Projeto de consultoria" /></label><ClientSelect compact label="Categoria" value={form.category} onChange={(value) => update("category", value)} options={settings.categories} /><ClientSelect compact label="Origem" value={form.source === "manual" ? "Manual" : "Venda integrada"} onChange={(value) => update("source", value === "Manual" ? "manual" : "sale")} options={["Manual", "Venda integrada"]} /><label>Cliente (opcional)<input value={form.customer} onChange={(event) => update("customer", event.target.value)} /></label><label>Produto/serviço (opcional)<input value={form.product} onChange={(event) => update("product", event.target.value)} /></label><label>Competência<input type="date" value={form.competenceDate} onChange={(event) => update("competenceDate", event.target.value)} /></label><label>Primeiro vencimento<input type="date" value={form.dueDate} onChange={(event) => update("dueDate", event.target.value)} /></label><label>Valor bruto (R$)<input required type="number" min="0" step="0.01" value={form.gross} onChange={(event) => update("gross", event.target.value)} /></label><label>Desconto (%)<input type="number" min="0" max="100" step="0.01" value={form.discount} onChange={(event) => update("discount", event.target.value)} /></label><label>Custo direto (R$)<input type="number" min="0" step="0.01" value={form.directCost} onChange={(event) => update("directCost", event.target.value)} /></label><label>Tributos (%)<input type="number" min="0" step="0.01" value={form.tax} onChange={(event) => { update("tax", event.target.value); update("taxOverride", Number(event.target.value) !== settings.taxBps / 100); }} /></label><ClientSelect compact label="Forma de pagamento" value={form.paymentMethod} onChange={(value) => update("paymentMethod", value)} options={["Pix", "Cartão de crédito", "Cartão de débito", "Transferência", "Boleto", "Dinheiro"]} /><label>Operadora/adquirente<input value={form.processor} onChange={(event) => update("processor", event.target.value)} placeholder="Opcional" /></label><label>Bandeira<input value={form.brand} onChange={(event) => update("brand", event.target.value)} placeholder="Opcional" /></label><ClientSelect compact label="Parcelas" value={`${form.installmentCount}x`} onChange={(value) => update("installmentCount", value.replace("x", ""))} options={Array.from({ length: 12 }, (_, index) => `${index + 1}x`)} /><label className="span-2 finance-check"><input type="checkbox" checked={form.feeOverride} onChange={(event) => { update("feeOverride", event.target.checked); update("fee", String((feeRule?.rateBps ?? 0) / 100)); }} />Substituir taxa calculada pela regra</label>{form.feeOverride && <label className="span-2">Taxa personalizada (%)<input type="number" min="0" step="0.01" value={form.fee} onChange={(event) => update("fee", event.target.value)} /></label>}</section><aside className="finance-preview"><header><strong>Prévia do lançamento</strong><span>{feeRule && !form.feeOverride ? `Regra aplicada: ${feeRule.method}` : form.feeOverride ? "Taxa personalizada" : "Sem taxa aplicável"}</span></header><div><span>Após desconto <b>{brl(preview.afterDiscountCents)}</b></span><span>Taxas <b>− {brl(preview.feeCents)}</b></span><span>Tributos <b>− {brl(preview.taxCents)}</b></span><span>Custos diretos <b>− {brl(Math.round(Number(form.directCost || 0) * 100))}</b></span><span className="result">Resultado gerencial <b>{brl(preview.resultCents)}</b></span></div><small>{form.installmentCount}x de aproximadamente {brl(Math.floor(afterDiscount / Math.max(Number(form.installmentCount), 1)))}</small>{initialValues && <small>Valor anterior: {brl(initialValues.afterDiscountCents)}</small>}</aside><footer><button type="button" onClick={onClose}>Cancelar</button><button className="v2-primary" type="submit"><Check size={16} />Salvar lançamento</button></footer></form></div>;
}

export default function FinanceExperience() {
  const access = useAccess();
  const [section, setSection] = useState<FinanceSection>("overview");
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [basis, setBasis] = useState<ReportingBasis>("accrual");
  const [transactions, setTransactions] = useState(initialTransactions);
  useEffect(() => {
    if (!access.member || !access.allowed("Prontuário")) return;
    let active = true;
    void listClinicalRecords(access.member.businessId).then((records) => {
      if (!active) return;
      const linked = records.flatMap((record) => (record.encounters ?? []).filter((item) => item.amount > 0).map((item): FinanceTransaction => {
        const id = `CLIN-${item.id}`;
        const cents = Math.round(item.amount * 100);
        const parts = splitInstallments(id, cents, Math.max(1, item.installments || 1), item.date);
        return { id, description: item.service, kind: "income", category: "Atendimento clínico", source: "clinical", customer: record.patientName, product: item.service, competenceDate: item.date, grossCents: cents, discountBps: 0, taxBps: 0, directCostCents: Math.round((item.order?.cost??0)*100), feeBps: Math.round((item.order?.fee??0)*100), paymentMethod: item.paymentMethod || "A definir", brand: item.cardBrand || undefined, installments: parts.map((part) => ({ ...part, status: item.paidDates?.[part.number] ? "paid" : item.cancelledInstallments?.includes(part.number) ? "cancelled" : "pending", settledAt: item.paidDates?.[part.number] })) };
      }));
      setTransactions((current) => [...current.filter((item) => !item.id.startsWith("CLIN-")), ...linked]);
    }).catch((cause) => { if (active) window.dispatchEvent(new CustomEvent("gest-app-toast", { detail: cause instanceof Error ? cause.message : "Não foi possível sincronizar os atendimentos." })); });
    return () => { active = false; };
  }, [access.member?.businessId]);
  const [settings, setSettings] = useState(defaultSettings);
  const [dialog, setDialog] = useState<FinanceTransaction | "new" | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState(defaultOverviewMetrics);
  useEffect(() => { try { const saved = JSON.parse(appStorage.getItem("gest-finance-metrics") || "null"); if (Array.isArray(saved)) setSelectedMetrics(saved.filter((name): name is string => typeof name === "string")); } catch { /* Keep defaults. */ } }, []);
  const saveMetrics = (value: string[]) => { setSelectedMetrics(value); appStorage.setItem("gest-finance-metrics", JSON.stringify(value)); };
  const flash = (message: string) => window.dispatchEvent(new CustomEvent("gest-app-toast", { detail: message }));
  const save = (transaction: FinanceTransaction) => { if (transaction.source === "clinical") { flash("Edite o atendimento no prontuário."); setDialog(null); return; } setTransactions((current) => current.some((item) => item.id === transaction.id) ? current.map((item) => item.id === transaction.id ? transaction : item) : [transaction, ...current]); setDialog(null); flash("Transação salva e indicadores atualizados."); };
  const updateInstallment = async (transactionId: string, installmentId: string, action: "settle" | "cancel") => {
    if (transactionId.startsWith("CLIN-")) {
      if (!access.member || !access.allowed("Prontuário")) { flash("Sem acesso ao prontuário."); return; }
      try {
        const records = await listClinicalRecords(access.member.businessId);
        const record = records.find((row) => row.encounters?.some((item) => `CLIN-${item.id}` === transactionId));
        if (!record) throw new Error("Atendimento não encontrado.");
        const encounter = record.encounters.find((item) => `CLIN-${item.id}` === transactionId)!;
        const number = Number(installmentId.split("-").at(-1)) || 1;
        const wasPaid = Boolean(encounter.paidDates?.[number]);
        const paidDates = { ...(encounter.paidDates ?? {}) };
        const cancelledInstallments = (encounter.cancelledInstallments ?? []).filter((value) => value !== number);
        if (action === "settle") paidDates[number] = new Date().toISOString().slice(0, 10);
        else if (wasPaid) delete paidDates[number];
        else cancelledInstallments.push(number);
        await saveClinicalRecord(access.member.businessId, { ...record, encounters: record.encounters.map((item) => item.id === encounter.id ? { ...item, paidDates, cancelledInstallments } : item) });
      } catch (cause) { flash(cause instanceof Error ? cause.message : "Falha ao salvar pagamento clínico."); return; }
    }
    setTransactions((current) => current.map((transaction) => transaction.id !== transactionId ? transaction : { ...transaction, installments: transaction.installments.map((installment) => installment.id !== installmentId ? installment : action === "settle" ? { ...installment, status: "paid" as const, settledAt: new Date().toISOString().slice(0, 10) } : installment.status === "paid" ? { ...installment, status: "pending" as const, settledAt: undefined } : { ...installment, status: "cancelled" as const, settledAt: undefined }) }));
    flash(action === "settle" ? "Parcela liquidada com sucesso." : "Parcela atualizada.");
  };
  return <div className="finance-experience"><FinanceHeader section={section} setSection={setSection} period={period} setPeriod={setPeriod} basis={basis} setBasis={setBasis} selectedMetrics={selectedMetrics} onAddMetric={(name) => saveMetrics([...selectedMetrics, name])} />{section === "overview" && <Overview transactions={transactions} period={period} basis={basis} selectedMetrics={selectedMetrics} onSetMetrics={saveMetrics} goalCents={settings.monthlyGoalCents * (period === "quarter" ? 3 : period === "year" ? 12 : 1)} onOpenTransactions={() => setSection("entries")} onOpenClosings={() => setSection("closing")} />}{section === "entries" && <Entries transactions={transactions} onNew={() => setDialog("new")} onEdit={setDialog} onSettle={(t, i) => updateInstallment(t, i, "settle")} onCancel={(t, i) => updateInstallment(t, i, "cancel")} />}{section === "receivable" && <Accounts transactions={transactions} kind="income" onSettle={(t, i) => updateInstallment(t, i, "settle")} onCancel={(t, i) => updateInstallment(t, i, "cancel")} />}{section === "payable" && <Accounts transactions={transactions} kind="expense" onSettle={(t, i) => updateInstallment(t, i, "settle")} onCancel={(t, i) => updateInstallment(t, i, "cancel")} />}{(["cashflow", "dre", "banks", "collections", "commissions"] as FinanceSection[]).includes(section) && <FinanceAreaPanel area={section as keyof typeof financeAreaContent} />}{section === "closing" && <Closings transactions={transactions} basis={basis} goalCents={settings.monthlyGoalCents} />}{section === "settings" && <SettingsPanel settings={settings} setSettings={setSettings} />}{dialog && <TransactionDialog settings={settings} initial={dialog === "new" ? undefined : dialog} onClose={() => setDialog(null)} onSave={save} />}</div>;
}
