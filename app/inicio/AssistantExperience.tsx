"use client";

import { useState } from "react";
import InfoHint from "./InfoHint";
import {
  ArrowUpRight,
  Bot,
  Boxes,
  CheckCircle2,
  ChevronDown,
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
  { icon: TrendingUp, tone: "green", title: "Seu faturamento cresceu 18,6% nos últimos 30 dias.", detail: "Eu comparei o resultado com o período anterior e identifiquei uma evolução acima da média.", action: "Ir para Vendas" },
  { icon: UsersRound, tone: "orange", title: "3 clientes importantes não compram há mais de 60 dias.", detail: "Eu estimei que esses clientes representaram R$ 29.450 em vendas no último semestre.", action: "Ir para Clientes" },
  { icon: Boxes, tone: "purple", title: "12 produtos estão próximos do estoque mínimo.", detail: "Minha sugestão é antecipar a reposição para evitar rupturas e perda de vendas.", action: "Ir para Estoque" },
  { icon: WalletCards, tone: "blue", title: "As contas a pagar desta semana somam R$ 8.430,20.", detail: "Eu encontrei vencimentos concentrados nos próximos três dias.", action: "Ir para Financeiro" },
];

const priorities = [
  { id: "estoque", title: "Regularizar 12 produtos em estoque baixo", detail: "Risco de rupturas nos próximos 15 dias", level: "Alta", area: "Estoque", tone: "high" },
  { id: "clientes", title: "Reativar 3 clientes inativos", detail: "Última compra há mais de 60 dias", level: "Alta", area: "Clientes", tone: "high" },
  { id: "financeiro", title: "Atenção com contas a pagar", detail: "R$ 8.430,20 vencem esta semana", level: "Média", area: "Financeiro", tone: "medium" },
  { id: "vendas", title: "Aproveitar produtos mais vendidos", detail: "Oportunidade de aumentar o ticket médio", level: "Média", area: "Vendas", tone: "medium" },
  { id: "agenda", title: "Revisar agenda desta semana", detail: "2 compromissos importantes hoje", level: "Média", area: "Agenda", tone: "medium" },
];

const opportunities = [
  { icon: Megaphone, tone: "green", title: "Campanha de reativação", text: "Eu posso preparar uma mensagem personalizada para clientes inativos.", value: "Potencial: R$ 12.450,00", action: "Criar campanha" },
  { icon: Gift, tone: "purple", title: "Promoção de kits", text: "Eu reuni produtos que vendem bem juntos e podem elevar o ticket médio.", value: "Potencial: +18%", action: "Abrir Catálogo" },
  { icon: WalletCards, tone: "orange", title: "Lembrete de cobrança", text: "Eu posso organizar lembretes para clientes com contas em aberto.", value: "Potencial: R$ 9.230,00", action: "Abrir Financeiro" },
];

export default function AssistantExperience() {
  const [selected, setSelected] = useState(priorities[0]);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [approved, setApproved] = useState<string[]>([]);

  return (
    <section className="v2-assistant-page assistant-pro-page">
      <header className="assistant-pro-header">
        <div>
          <h1>Assistente</h1>
          <p>Eu analiso os dados do seu negócio e sugiro ações, oportunidades e direcionamentos precisos.</p>
        </div>
        <button>Visão geral <ChevronDown size={15} /></button>
      </header>

      <section className="assistant-pro-metrics">
        {[
          ["Insights gerados", "18", "↑ 12,5% vs. 30 dias anteriores", Lightbulb, "blue"],
          ["Alertas críticos", "4", "↑ 33,3% vs. 30 dias anteriores", CircleAlert, "red"],
          ["Oportunidades", "9", "↑ 20,6% vs. 30 dias anteriores", Target, "green"],
          ["Ações recomendadas", "12", "Novas recomendações disponíveis", CheckCircle2, "blue"],
        ].map(([label, value, detail, Icon, tone]) => (
          <article className="v2-card" key={String(label)}>
            <div><span>{label as string}<InfoHint text={`Entenda o indicador ${String(label).toLowerCase()} e como ele é calculado.`} /></span><strong>{value as string}</strong><small className={tone as string}>{detail as string}</small></div>
            <i className={tone as string}><Icon size={25} /></i>
          </article>
        ))}
      </section>

      <section className="assistant-pro-main">
        <div className="assistant-pro-column assistant-pro-left">
          <article className="v2-card assistant-summary-card">
            <header><i><Sparkles size={17} /></i><div><h2>Resumo inteligente</h2><p>Principais sinais que encontrei para o seu negócio.</p></div></header>
            <div className="assistant-insight-list">
              {insights.map((item) => {
                const Icon = item.icon;
                return <article key={item.title}><i className={item.tone}><Icon size={20} /></i><div><strong>{item.title}</strong><p>{item.detail}</p></div><button>{item.action}</button></article>;
              })}
            </div>
          </article>
        </div>

        <div className="assistant-pro-column assistant-pro-right">
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
        </div>
        <section className="v2-card assistant-opportunities-card">
          <header><i><Megaphone size={17} /></i><div><h2>Oportunidades sugeridas</h2><p>Ideias que eu preparei para impulsionar seus resultados.</p></div></header>
          <div>{opportunities.map((item) => { const Icon = item.icon; return <article key={item.title}><i className={item.tone}><Icon size={21} /></i><div><strong>{item.title}</strong><p>{item.text}</p><b>{item.value}</b></div><button>{item.action}</button></article>; })}</div>
        </section>
      </section>
    </section>
  );
}
