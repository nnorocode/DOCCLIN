"use client";

import { useState } from "react";
import { ClientSelect, StandardModuleTop } from "./ClientsExperience";
import { InformativeMetricCardPreview, InsightActionCardPreview, type CardTone } from "../laboratorio/page";
import {
  ArrowUpRight,
  Bot,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CircleAlert,
  Gift,
  Lightbulb,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";

const insights = [
  { icon: TrendingUp, tone: "green", title: "Seu faturamento cresceu 18,6% nos últimos 30 dias.", detail: "Eu comparei o resultado com o período anterior e identifiquei uma evolução acima da média.", action: "Ir para Vendas", view: "Vendas" },
  { icon: UsersRound, tone: "orange", title: "3 clientes importantes não compram há mais de 60 dias.", detail: "Eu estimei que esses clientes representaram R$ 29.450 em vendas no último semestre.", action: "Ir para Clientes", view: "Clientes" },
  { icon: Boxes, tone: "purple", title: "12 produtos estão próximos do estoque mínimo.", detail: "Minha sugestão é antecipar a reposição para evitar rupturas e perda de vendas.", action: "Ir para Estoque", view: "Estoque" },
  { icon: WalletCards, tone: "blue", title: "As contas a pagar desta semana somam R$ 8.430,20.", detail: "Eu encontrei vencimentos concentrados nos próximos três dias.", action: "Ir para Financeiro", view: "Financeiro" },
];

const priorities = [
  { id: "estoque", title: "Regularizar 12 produtos em estoque baixo", detail: "Risco de rupturas nos próximos 15 dias", level: "Alta", area: "Estoque", tone: "high" },
  { id: "clientes", title: "Reativar 3 clientes inativos", detail: "Última compra há mais de 60 dias", level: "Alta", area: "Clientes", tone: "high" },
  { id: "financeiro", title: "Atenção com contas a pagar", detail: "R$ 8.430,20 vencem esta semana", level: "Média", area: "Financeiro", tone: "medium" },
  { id: "vendas", title: "Aproveitar produtos mais vendidos", detail: "Oportunidade de aumentar o ticket médio", level: "Média", area: "Vendas", tone: "medium" },
  { id: "agenda", title: "Revisar agenda desta semana", detail: "2 compromissos importantes hoje", level: "Média", area: "Agenda", tone: "medium" },
];

function easterSunday(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function nthWeekday(year: number, month: number, weekday: number, nth: number) {
  const first = new Date(year, month, 1);
  return new Date(year, month, 1 + ((weekday - first.getDay() + 7) % 7) + (nth - 1) * 7);
}

function commercialDates(year: number, month: number) {
  const fixed: Array<[number, number, string, string]> = [
    [3, 15, "Dia do Consumidor", "Prepare ofertas e comunicação para clientes."],
    [6, 12, "Dia dos Namorados", "Planeje kits e campanhas com antecedência."],
    [9, 15, "Dia do Cliente", "Organize ações de relacionamento e fidelização."],
    [10, 12, "Dia das Crianças", "Revise produtos, serviços e estoque temático."],
    [12, 25, "Natal", "Planeje compras, kits e comunicação com clientes."],
  ];
  const events = fixed.filter(([eventMonth]) => eventMonth === month + 1).map(([eventMonth, day, title, detail]) => ({ date: new Date(year, eventMonth - 1, day), title, detail }));
  if (month === 4) events.push({ date: nthWeekday(year, 4, 0, 2), title: "Dia das Mães", detail: "Uma das datas mais fortes do varejo; prepare campanha e estoque." });
  if (month === 7) events.push({ date: nthWeekday(year, 7, 0, 2), title: "Dia dos Pais", detail: "Planeje ofertas, kits e divulgação para a data." });
  if (month === 10) {
    const firstFriday = nthWeekday(year, 10, 5, 1);
    const blackFriday = new Date(year, 10, firstFriday.getDate() + 21);
    events.push({ date: blackFriday, title: "Black Friday", detail: "Revise preços, margens, estoque e calendário de divulgação." });
    events.push({ date: new Date(year, 10, blackFriday.getDate() + 3), title: "Cyber Monday", detail: "Estenda a campanha para canais digitais e ofertas remanescentes." });
  }
  const easter = easterSunday(year);
  if (easter.getMonth() === month) events.push({ date: easter, title: "Páscoa", detail: "Considere kits, produtos sazonais e compras antecipadas." });
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

const opportunities = [
  { icon: Megaphone, tone: "green", title: "Campanha de reativação", text: "Eu posso preparar uma mensagem personalizada para clientes inativos.", value: "Potencial: R$ 12.450,00", action: "Criar campanha", view: "Clientes" },
  { icon: Gift, tone: "purple", title: "Promoção de kits", text: "Eu reuni produtos que vendem bem juntos e podem elevar o ticket médio.", value: "Potencial: +18%", action: "Abrir Catálogo", view: "Catálogo" },
  { icon: WalletCards, tone: "orange", title: "Lembrete de cobrança", text: "Eu posso organizar lembretes para clientes com contas em aberto.", value: "Potencial: R$ 9.230,00", action: "Abrir Financeiro", view: "Financeiro" },
];

const managerQuestions = [
  ["Por que o lucro caiu?", "Compare receita, custos e margem com o período anterior.", "Financeiro"],
  ["Quais clientes estão deixando de comprar?", "Encontre clientes com queda de frequência e valor.", "Clientes"],
  ["Qual serviço dá mais lucro?", "Veja margem, volume e tempo consumido por serviço.", "Relatórios"],
  ["Quais horários estão ficando vazios?", "Identifique dias e faixas com baixa ocupação.", "Agenda"],
  ["Quanto terá de caixa em 30 dias?", "Projete entradas, saídas e compromissos já registrados.", "Financeiro"],
] as const;

export default function AssistantExperience({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [selected, setSelected] = useState(priorities[0]);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [approved, setApproved] = useState<string[]>([]);
  const [scope, setScope] = useState("Visão geral");
  const [calendarStart, setCalendarStart] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); });
  const calendarMonths = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(calendarStart.getFullYear(), calendarStart.getMonth() + index, 1);
    return { date, events: commercialDates(date.getFullYear(), date.getMonth()) };
  });
  const shiftCalendar = (months: number) => setCalendarStart((current) => new Date(current.getFullYear(), current.getMonth() + months, 1));

  return (
    <section className={`v2-assistant-page assistant-pro-page ${scope === "Visão geral" ? "" : "assistant-scope-focused"}`}>
      <StandardModuleTop
        title="Assistente"
        help="Eu analiso os dados do seu negócio e sugiro ações, oportunidades e direcionamentos precisos."
        action={<ClientSelect compact hideLabel label="Visão" value={scope} onChange={setScope} options={["Visão geral", "Prioridades", "Oportunidades"]} />}
      >
        {[
          ["Insights gerados", "18", "+12,5%", Lightbulb, "blue"],
          ["Alertas críticos", "4", "+33,3%", CircleAlert, "rose"],
          ["Oportunidades", "9", "+20,6%", Target, "teal"],
          ["Ações recomendadas", "12", "Novas recomendações", CheckCircle2, "violet"],
        ].map(([label, value, detail, Icon, tone]) => (
          <InformativeMetricCardPreview key={String(label)} title={label as string} value={value as string} change={detail as string} icon={Icon as typeof Lightbulb} tone={tone as CardTone} />
        ))}
      </StandardModuleTop>

      <section className="assistant-pro-main">
        {(scope === "Visão geral") && <div className="assistant-pro-column assistant-pro-left">
          <article className="v2-card assistant-summary-card">
            <header><i><Sparkles size={17} /></i><div><h2>Resumo inteligente</h2><p>Principais sinais que encontrei para o seu negócio.</p></div></header>
            <div className="assistant-insight-list assistant-modern-insights">
              {insights.map((item) => <InsightActionCardPreview key={item.title} tone={item.tone === "green" ? "teal" : item.tone === "orange" ? "amber" : item.tone === "purple" ? "violet" : "blue"} classification="INSIGHT" title={item.title} description={item.detail} action={item.action} onAction={() => onNavigate?.(item.view)} />)}
            </div>
          </article>
        </div>}

        {(scope === "Visão geral" || scope === "Prioridades") && <div className="assistant-pro-column assistant-pro-right">
          <article className="v2-card assistant-priority-card">
            <header><i><Target size={17} /></i><div><h2>Prioridades do assistente</h2><p>Eu ordenei as ações por criticidade e impacto.</p></div></header>
            <div className="assistant-priority-list">
              {priorities.map((item, index) => <article className={selected.id === item.id ? "selected" : ""} key={item.id}><b>{index + 1}</b><div><strong>{item.title}</strong><small>{item.detail}</small></div><span className={item.tone}>{item.level}</span><em>{item.area}</em><button onClick={() => { setSelected(item); setConversationOpen(true); }}>Conversar</button></article>)}
            </div>
          </article>
          {conversationOpen && <aside className="v2-card assistant-conversation-card">
            <header>
              <div className="assistant-ai-brand"><i><Bot size={21} /></i><div><span>CONVERSA COM A GEST IA</span><h2>{selected.title}</h2></div></div>
              <div className="assistant-ai-status"><ShieldCheck size={14} />Você confirma antes de qualquer ação.</div>
              <button className="close" onClick={() => setConversationOpen(false)} aria-label="Fechar conversa"><X size={17} /></button>
            </header>
            <div className="assistant-conversation-body">
              <div className="assistant-ai-message"><i><Bot size={16} /></i><div><b>Gest IA <span>agora</span></b><p>Eu identifiquei que <strong>{selected.detail.toLowerCase()}</strong>. Minha sugestão é começar por esta ação porque ela combina urgência com impacto direto no negócio. Posso preparar os próximos passos e organizar tudo na área correta. Nada será executado sem a sua confirmação.</p></div></div>
              <button className={`assistant-user-message ${approved.includes(selected.id) ? "approved" : ""}`} onClick={() => setApproved((items) => items.includes(selected.id) ? items : [...items, selected.id])}>{approved.includes(selected.id) ? <><CheckCircle2 size={15} />Ação preparada</> : <>Preparar esta ação <ArrowUpRight size={15} /></>}</button>
              {approved.includes(selected.id) && <div className="assistant-ai-message assistant-ai-confirmation"><i><Bot size={16} /></i><div><b>Gest IA <span>agora</span></b><p>Perfeito. Eu preparei esta ação para sua revisão. Você ainda poderá confirmar ou cancelar antes de qualquer alteração.</p></div></div>}
            </div>
          </aside>}
        </div>}
        {(scope === "Visão geral" || scope === "Prioridades") && <article className="v2-card assistant-calendar-card">
          <header><i><CalendarDays size={17} /></i><div><h2>Planejamento dos próximos meses</h2><p>Veja o mês atual e antecipe as próximas datas importantes.</p></div><div className="assistant-calendar-controls"><button type="button" onClick={() => shiftCalendar(-1)} aria-label="Voltar um mês"><ChevronLeft size={16} /></button><button type="button" className="assistant-calendar-today" onClick={() => { const now = new Date(); setCalendarStart(new Date(now.getFullYear(), now.getMonth(), 1)); }}>Hoje</button><button type="button" onClick={() => shiftCalendar(1)} aria-label="Avançar um mês"><ChevronRight size={16} /></button></div></header>
          <div className="assistant-calendar-months">{calendarMonths.map(({ date: monthDate, events }, monthIndex) => {
            const now = new Date();
            const isCurrent = monthDate.getFullYear() === now.getFullYear() && monthDate.getMonth() === now.getMonth();
            return <section className={isCurrent ? "is-current" : ""} key={monthDate.toISOString()}><header><span><strong>{monthDate.toLocaleDateString("pt-BR", { month: "long" })}</strong><small>{monthDate.getFullYear()}</small></span>{isCurrent ? <em>Mês atual</em> : monthIndex === 1 ? <em>Próximo</em> : null}</header><div>{events.length ? events.map(({ date, title, detail }) => { const days = Math.ceil((date.getTime() - new Date(new Date().toDateString()).getTime()) / 86400000); return <article key={`${date.toISOString()}-${title}`}><time>{date.toLocaleDateString("pt-BR", { day: "2-digit" })}</time><span><strong>{title}</strong><small>{detail}</small></span><em>{days >= 0 ? (days === 0 ? "Hoje" : `${days} dias`) : "Encerrada"}</em></article>; }) : <p>Sem data comercial prioritária. Use o mês para preparar a próxima campanha.</p>}</div></section>;
          })}</div>
          <small className="assistant-calendar-tip">As datas futuras aparecem juntas para facilitar o planejamento de campanha, estoque e comunicação.</small>
        </article>}
        {(scope === "Visão geral" || scope === "Oportunidades") && <section className="v2-card assistant-opportunities-card">
          <header><i><Megaphone size={17} /></i><div><h2>Oportunidades sugeridas</h2><p>Ideias que eu preparei para impulsionar seus resultados.</p></div></header>
          <div>{opportunities.map((item) => { const Icon = item.icon; return <article key={item.title}><i className={item.tone}><Icon size={21} /></i><div><strong>{item.title}</strong><p>{item.text}</p><b>{item.value}</b></div><button onClick={() => onNavigate?.(item.view)}>{item.action}</button></article>; })}</div>
        </section>}
        {scope === "Visão geral" && <section className="v2-card assistant-proactive-questions"><header><i><Lightbulb size={17} /></i><div><h2>Perguntas que o assistente acompanha</h2><p>Leituras atualizadas diariamente para antecipar decisões do negócio.</p></div></header><div>{managerQuestions.map(([title, detail, view]) => <button type="button" key={title} onClick={() => onNavigate?.(view)}><span><strong>{title}</strong><small>{detail}</small></span><ArrowUpRight size={16} /></button>)}</div></section>}
      </section>
    </section>
  );
}
