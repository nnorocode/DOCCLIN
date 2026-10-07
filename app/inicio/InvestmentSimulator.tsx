"use client";
import { chartTooltipStyle } from "./chart-presentation";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Baby, BriefcaseBusiness, Calculator, CheckCircle2, ChevronDown, GraduationCap, Info, Plane, Target, TrendingUp, WalletCards } from "lucide-react";
import { ClientSelect } from "./ClientsExperience";
import InfoHint from "./InfoHint";

const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
type Scenario = { initial: number; monthly: number; annualRate: number; months: number; target: number };
const project = ({ initial, monthly, annualRate, months }: Scenario) => {
  const rate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  let equity = initial, contributed = initial;
  return Array.from({ length: months + 1 }, (_, month) => {
    if (month) { equity = equity * (1 + rate) + monthly; contributed += monthly; }
    return { month, label: month % 12 === 0 ? `${month / 12}a` : `${month}m`, Patrimônio: Math.round(equity), Aportes: Math.round(contributed) };
  });
};
const objectives = [
  { id: "Férias", detail: "Planeje uma pausa sem comprometer o caixa.", icon: Plane },
  { id: "Licença-maternidade", detail: "Crie uma reserva para manter seu pró-labore.", icon: Baby },
  { id: "Expansão do negócio", detail: "Prepare capital para estrutura e crescimento.", icon: BriefcaseBusiness },
  { id: "Curso ou formação", detail: "Organize o investimento profissional.", icon: GraduationCap },
];

function ProjectionChart({ data, title, subtitle, gain }: { data: ReturnType<typeof project>; title: string; subtitle?: string; gain?: number }) {
  return <article className="v2-card investment-chart"><header><div><small>PROJEÇÃO</small><h2>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div><span className="investment-chart-total"><strong>{brl(data.at(-1)?.Patrimônio ?? 0)}</strong>{typeof gain === "number" ? <small>+ {brl(gain)} em rendimentos</small> : null}</span></header><div><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 12, right: 15, left: 8, bottom: 0 }}><defs><linearGradient id="investmentEquity" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#62b3e0" stopOpacity=".38" /><stop offset="100%" stopColor="#62b3e0" stopOpacity=".03" /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e1e9f1" strokeDasharray="3 5" /><XAxis dataKey="label" interval={Math.max(0, Math.floor(data.length / 8))} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#75889a" }} /><YAxis width={64} tickFormatter={(value) => `${Math.round(Number(value) / 1000)} mil`} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#75889a" }} /><Tooltip contentStyle={chartTooltipStyle} formatter={(value) => brl(Number(value))} /><Legend /><Area dataKey="Patrimônio" type="monotone" stroke="#4d9fd0" strokeWidth={3} fill="url(#investmentEquity)" /><Area dataKey="Aportes" type="monotone" stroke="#87ad9d" strokeWidth={2} fill="transparent" /></AreaChart></ResponsiveContainer></div></article>;
}

export default function InvestmentSimulator() {
  const [mode, setMode] = useState<"goal" | "manual">("goal");
  const [objective, setObjective] = useState("Licença-maternidade");
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(1500);
  const [annualRate, setAnnualRate] = useState(10.5);
  const [months, setMonths] = useState(12);
  const [target, setTarget] = useState(36000);
  const [leaveMonths, setLeaveMonths] = useState(6);
  const [proLabore, setProLabore] = useState(6000);
  const [travelers, setTravelers] = useState(2);
  const [travelReserve, setTravelReserve] = useState(15);
  const [expansionPurpose, setExpansionPurpose] = useState("Nova unidade");
  const [workingCapital, setWorkingCapital] = useState(20);
  const [courseName, setCourseName] = useState("");
  const [courseExtras, setCourseExtras] = useState(0);
  const [kind, setKind] = useState("Renda fixa");
  const [analysisExpanded, setAnalysisExpanded] = useState(false);
  const effectiveTarget = mode === "goal" && objective === "Licença-maternidade" ? leaveMonths * proLabore : target;
  const data = useMemo(() => project({ initial, monthly, annualRate, months, target: effectiveTarget }), [annualRate, effectiveTarget, initial, monthly, months]);
  const finalValue = data.at(-1)?.Patrimônio ?? 0;
  const rate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  const requiredMonthly = Math.max(0, (effectiveTarget - initial * Math.pow(1 + rate, months)) * rate / Math.max(Math.pow(1 + rate, months) - 1, .00001));
  const feasible = finalValue >= effectiveTarget;
  const contributedValue = initial + monthly * months;
  const investmentGain = Math.max(0, finalValue - contributedValue);
  const gainShare = finalValue > 0 ? investmentGain / finalValue * 100 : 0;
  const monthlyRate = rate * 100;
  const monthsNeeded = useMemo(() => {
    let value = initial;
    let count = 0;
    while (value < effectiveTarget && count < 600) { value = value * (1 + rate) + monthly; count += 1; }
    return count;
  }, [effectiveTarget, initial, monthly, rate]);
  const additionalMonths = Math.max(0, monthsNeeded - months);
  const planRatio = effectiveTarget ? finalValue / effectiveTarget : 0;
  const planPercentage = Math.min(100, Math.max(0, planRatio * 100));
  const analysisTone = planRatio >= 1 ? "good" : planRatio >= .85 ? "attention" : "risk";
  const fixedIncomeReference = 10.5;
  const rateAssessment = annualRate > fixedIncomeReference + 3
    ? `A rentabilidade informada está acima da referência simples de renda fixa usada nesta simulação (${fixedIncomeReference}% a.a.). Revise o risco e evite contar com esse retorno como garantido.`
    : annualRate < fixedIncomeReference - 3
      ? `A rentabilidade informada está abaixo da referência simples de renda fixa usada nesta simulação (${fixedIncomeReference}% a.a.). Vale comparar alternativas conservadoras antes de decidir.`
      : `A rentabilidade informada está próxima da referência simples de renda fixa usada nesta simulação (${fixedIncomeReference}% a.a.). Ainda assim, taxas, impostos e oscilações podem alterar o resultado.`;

  const commonFields = <><label><span>Em quanto tempo (meses)</span><input type="number" min="1" max="600" value={months} onChange={(event) => setMonths(Math.max(1, Number(event.target.value)))} /></label><label><span>Quanto dinheiro você já tem?</span><input type="number" min="0" value={initial} onChange={(event) => setInitial(Number(event.target.value))} /></label><label><span>Quanto você pode guardar por mês?</span><input type="number" min="0" value={monthly} onChange={(event) => setMonthly(Number(event.target.value))} /></label><label><span>Rentabilidade estimada ao ano (%)</span><input type="number" min="0" step="0.1" value={annualRate} onChange={(event) => setAnnualRate(Number(event.target.value))} /></label></>;
  const objectiveFields = objective === "Férias" ? <><label><span>Quantidade de pessoas</span><input type="number" min="1" value={travelers} onChange={(event) => setTravelers(Math.max(1, Number(event.target.value)))} /></label><label><span>Reserva para imprevistos (%)</span><input type="number" min="0" value={travelReserve} onChange={(event) => setTravelReserve(Math.max(0, Number(event.target.value)))} /></label></> : objective === "Expansão do negócio" ? <><label><span>Tipo de expansão</span><input value={expansionPurpose} onChange={(event) => setExpansionPurpose(event.target.value)} placeholder="Ex.: nova unidade ou equipamento" /></label><label><span>Capital de giro reservado (%)</span><input type="number" min="0" value={workingCapital} onChange={(event) => setWorkingCapital(Math.max(0, Number(event.target.value)))} /></label></> : objective === "Curso ou formação" ? <><label><span>Curso ou formação</span><input value={courseName} onChange={(event) => setCourseName(event.target.value)} placeholder="Ex.: especialização profissional" /></label><label><span>Materiais, viagem e taxas</span><input type="number" min="0" value={courseExtras} onChange={(event) => setCourseExtras(Math.max(0, Number(event.target.value)))} /></label></> : null;
  const metrics = <section className="investment-metrics"><article><i><WalletCards size={18} /></i><span>Meta desejada<strong>{brl(effectiveTarget)}</strong><small>{objective}</small></span></article><article><i><TrendingUp size={18} /></i><span>Valor projetado<strong>{brl(finalValue)}</strong><small>em {months} meses</small></span></article><article><i><Target size={18} /></i><span>Valor mensal indicado<strong>{brl(requiredMonthly)}/mês</strong><small>para cumprir a meta</small></span></article></section>;

  return <section className="investment-page">
    <header className="v2-intro client-compact-intro"><h1>Investimentos <InfoHint text="Planeje objetivos e compare cenários de investimento para o seu negócio." /></h1></header>
    <nav className="investment-mode-tabs" aria-label="Tipo de simulação"><button type="button" className={mode === "goal" ? "active" : ""} onClick={() => setMode("goal")}><Target size={19} /><strong>Plano por objetivo</strong><span className="investment-tab-info" title="O Gest avalia se o plano é viável." aria-label="O Gest avalia se o plano é viável"><Info size={15} /></span></button><button type="button" className={mode === "manual" ? "active" : ""} onClick={() => setMode("manual")}><Calculator size={19} /><strong>Projeção de investimento completa</strong><span className="investment-tab-info" title="Você controla todas as premissas da projeção." aria-label="Você controla todas as premissas da projeção"><Info size={15} /></span></button></nav>
    {mode === "goal" ? <>
      <section className="investment-objective-picker"><header><h2><span className="investment-step-number">1.</span>Escolha o objetivo</h2></header><div>{objectives.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} className={objective === item.id ? "active" : ""} onClick={() => setObjective(item.id)}><i><Icon size={21} /></i><strong>{item.id}</strong><span className="investment-objective-info" title={item.detail} aria-label={item.detail}><Info size={15} /></span>{objective === item.id ? <CheckCircle2 className="investment-objective-check" size={17} /> : null}</button>; })}</div></section>
      <section className="investment-goal-workspace"><aside className="v2-card investment-form"><header><span className="investment-step-number">2.</span><div><h2>Monte seu plano</h2></div></header>{objective === "Licença-maternidade" ? <><label><span>Tempo de licença desejável (meses)</span><input type="number" min="1" value={leaveMonths} onChange={(event) => setLeaveMonths(Math.max(1, Number(event.target.value)))} /></label><label><span>Pró-labore desejado por mês</span><input type="number" min="0" value={proLabore} onChange={(event) => setProLabore(Number(event.target.value))} /></label><div className="investment-target-summary"><span>Meta desejada</span><strong>{brl(effectiveTarget)}</strong></div></> : <><label><span>Meta desejada</span><input type="number" min="0" value={target} onChange={(event) => setTarget(Number(event.target.value))} /></label>{objectiveFields}</>}{commonFields}</aside><div className="investment-results">{metrics}<ProjectionChart data={data} title={`${brl(initial)} iniciais + ${brl(monthly)}/mês · ${annualRate}% a.a.`} gain={investmentGain} /></div></section>
      <article className={`investment-feasibility is-analysis is-${analysisTone}`}><span className="investment-step-number">3.</span><div><small>ANÁLISE DO PLANO</small><h2>{feasible ? "Seu objetivo é viável" : analysisTone === "attention" ? "Seu plano está próximo da meta" : "Seu plano precisa de um ajuste"}</h2><p>{feasible ? `A projeção cobre a meta em ${months} meses.` : `Faltam aproximadamente ${brl(Math.max(0, effectiveTarget - finalValue))} para a meta no prazo escolhido.`}</p><div className="investment-analysis-steps"><article><b>1</b><span><strong>{feasible ? "Mantenha o plano" : "Ajuste o valor mensal"}</strong><small>{feasible ? `Guarde ${brl(monthly)} por mês durante ${months} meses.` : `Para manter ${months} meses, guarde cerca de ${brl(requiredMonthly)} por mês.`}</small></span></article><article><b>2</b><span><strong>{feasible ? "Revise periodicamente" : "Ou comece antes"}</strong><small>{feasible ? "Confira a evolução a cada mês e ajuste se sua renda mudar." : additionalMonths > 0 && monthsNeeded < 600 ? `Se mantiver ${brl(monthly)} por mês, comece ${additionalMonths} meses antes: o total será ${monthsNeeded} meses.` : "Aumente o prazo ou reduza a meta para tornar o plano possível."}</small></span></article></div>{analysisExpanded ? <div className="investment-analysis-details"><p><strong>Rentabilidade usada:</strong> {monthlyRate.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% ao mês ({annualRate}% ao ano). Rendimentos projetados: {brl(investmentGain)}, ou {gainShare.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% do valor final.</p><p><strong>Referência:</strong> {rateAssessment}</p><div className="investment-options"><strong>Para comparar condições e riscos:</strong><span><b>CDB</b><b>LCI</b><b>LCA</b><b>Tesouro Direto</b><b>Tesouro Selic</b></span></div><small>Simulação ilustrativa, sem cotações ao vivo ou garantia de retorno. Consulte um profissional financeiro credenciado antes de decidir.</small></div> : null}</div><div className="investment-plan-progress"><span className="investment-plan-donut" style={{ background: `conic-gradient(#73b995 0 ${planPercentage}%,#e7a2a7 ${planPercentage}% 100%)` }}><strong>{planPercentage.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%</strong></span><InfoHint text={`${planPercentage.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}% da meta está coberta pela projeção. A parte vermelha representa o valor que ainda ficará em aberto.`} /></div><button type="button" className={analysisExpanded ? "expanded" : ""} aria-label={analysisExpanded ? "Ocultar detalhes da análise" : "Ver mais detalhes da análise"} onClick={() => setAnalysisExpanded((current) => !current)}><ChevronDown size={18} /></button></article>
    </> : <section className="investment-workspace"><aside className="v2-card investment-form"><header><Calculator size={19} /><div><h2>Dados da projeção</h2><p>Ajuste todas as premissas do cenário.</p></div></header><label><span>Tipo de investimento</span><ClientSelect compact hideLabel label="Tipo de investimento" value={kind} onChange={setKind} options={["Renda fixa", "Renda variável"]} /></label><label><span>Nome do objetivo</span><input value={objective} onChange={(event) => setObjective(event.target.value)} /></label><label><span>Valor desejado</span><input type="number" min="0" value={target} onChange={(event) => setTarget(Number(event.target.value))} /></label>{commonFields}</aside><div className="investment-results">{metrics}<ProjectionChart data={data} title="Evolução patrimonial" subtitle={`${objective} · ${kind} · projeção sem garantia.`} /></div></section>}
  </section>;
}
