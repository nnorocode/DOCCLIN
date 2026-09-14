"use client";

import { type ReactNode, useEffect, useState } from "react";
import AgendaExperience from "./AgendaExperience";
import AssistantExperience from "./AssistantExperience";
import ClientsExperience from "./ClientsExperience";
import FinanceExperience from "./FinanceExperience";
import InfoHint from "./InfoHint";
import { Area, CartesianGrid, Legend, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CalendarClock,
  Calculator,
  Candy,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  ClipboardList,
  Crown,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Grid2X2,
  Heart,
  Home,
  LineChart,
  LogOut,
  Medal,
  Menu,
  MessageCircle,
  Moon,
  Package,
  PackageCheck,
  Paperclip,
  Palette,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Shirt,
  Sparkles,
  Siren,
  Sun,
  Target,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  UsersRound,
  TrendingUp,
  WalletCards,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

type View =
  | "Início"
  | "Agenda"
  | "Tarefas"
  | "Projetos"
  | "Clientes"
  | "Detalhe"
  | "Atendimento"
  | "Configurações"
  | "Propostas"
  | "Vendas"
  | "Catálogo"
  | "Ordens de Serviço"
  | "Compras"
  | "Fornecedores"
  | "Financeiro"
  | "Documentos"
  | "Estoque"
  | "CRM"
  | "Assistente"
  | "Manutenção"
  | "Relatórios"
  | "Equipe"
  | "Precificação"
  | "Loja";

type NavigationGroup = {
  label: string;
  icon: LucideIcon;
  items: Array<[View, LucideIcon]>;
};

const navigationGroups: NavigationGroup[] = [
  {
    label: "Minha rotina",
    icon: CalendarDays,
    items: [["Agenda", CalendarDays], ["Tarefas", CheckCircle2], ["Projetos", BriefcaseBusiness]],
  },
  {
    label: "Relacionamento",
    icon: Users,
    items: [["Clientes", Users], ["CRM", Target], ["Atendimento", ClipboardList]],
  },
  {
    label: "Comercial",
    icon: ShoppingCart,
    items: [["Propostas", FileText], ["Vendas", ShoppingCart], ["Catálogo", Grid2X2]],
  },
  {
    label: "Operação",
    icon: Package,
    items: [["Estoque", Package], ["Manutenção", Wrench], ["Documentos", FileText], ["Ordens de Serviço", Wrench], ["Compras", ShoppingBag], ["Fornecedores", BriefcaseBusiness]],
  },
  {
    label: "Gestão",
    icon: LineChart,
    items: [["Financeiro", CircleDollarSign], ["Precificação", Calculator], ["Relatórios", LineChart], ["Equipe", UsersRound]],
  },
];
function MessageIcon(props: React.ComponentProps<LucideIcon>) {
  return <ClipboardList {...props} />;
}

const clients = [
  [
    "#CL-1248",
    "AC",
    "Ana Carolina Souza",
    "ana.souza@email.com.br",
    "Pessoa Física",
    "23/05/2025",
    "Há 2 dias",
    "R$ 18.750,00",
    "Ativo",
  ],
  [
    "#CL-1247",
    "MP",
    "Marcos Pereira",
    "marcos.pereira@email.com.br",
    "Pessoa Física",
    "21/05/2025",
    "Há 4 dias",
    "R$ 7.250,00",
    "Ativo",
  ],
  [
    "#CL-1246",
    "LF",
    "Lojas Fênix Ltda.",
    "contato@lojasfenix.com.br",
    "Pessoa Jurídica",
    "16/05/2025",
    "Há 9 dias",
    "R$ 56.430,00",
    "Ativo",
  ],
  [
    "#CL-1245",
    "JB",
    "Juliana Batista",
    "juliana.batista@email.com.br",
    "Pessoa Física",
    "14/05/2025",
    "Há 11 dias",
    "R$ 3.980,00",
    "Inativo",
  ],
  [
    "#CL-1244",
    "TC",
    "TechConnect Soluções Ltda.",
    "comercial@techconnect.com.br",
    "Pessoa Jurídica",
    "12/05/2025",
    "Há 13 dias",
    "R$ 89.300,00",
    "Ativo",
  ],
  [
    "#CL-1243",
    "RP",
    "Roberto Pinheiro",
    "roberto.pinheiro@email.com.br",
    "Pessoa Física",
    "08/05/2025",
    "Há 17 dias",
    "R$ 2.150,00",
    "Inativo",
  ],
  [
    "#CL-1242",
    "CA",
    "Casa & Ambiente Ltda.",
    "vendas@casaeambiente.com.br",
    "Pessoa Jurídica",
    "05/05/2025",
    "Há 20 dias",
    "R$ 34.620,00",
    "Ativo",
  ],
  [
    "#CL-1241",
    "FS",
    "Fernanda Silva",
    "fernanda.silva@email.com.br",
    "Pessoa Física",
    "01/05/2025",
    "Há 24 dias",
    "R$ 1.480,00",
    "Inativo",
  ],
];

const moneyToNumber = (value: string) =>
  Number(value.replace(/[^\d,]/g, "").replace(",", "."));

const visibleClientRankOrder = [
  "#CL-1244",
  "#CL-1246",
  "#CL-1248",
  "#CL-1247",
  "#CL-1245",
  "#CL-1243",
];

const clientRankings = visibleClientRankOrder.map((id, index) => ({
  id,
  position: index + 1,
}));

function getClientRanking(id: string) {
  const ranking = clientRankings.find((item) => item.id === id)?.position ?? 0;
  const tier =
    ranking === 1
      ? "diamond"
      : ranking <= 3
        ? "gold"
        : ranking <= 5
          ? "silver"
          : "bronze";
  const label =
    tier === "diamond"
      ? "Diamante"
      : tier === "gold"
        ? "Ouro"
        : tier === "silver"
          ? "Prata"
          : "Bronze";

  return { ranking, tier, label };
}

function Sidebar({
  active,
  setActive,
  dark,
  setDark,
}: {
  active: View;
  setActive: (view: View) => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
}) {
  const activeGroup = navigationGroups.find((group) =>
    group.items.some(([view]) => view === active || (active === "Detalhe" && view === "Clientes")),
  )?.label;
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup ?? "Minha rotina");

  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup]);

  return (
    <aside className="v2-sidebar gest-sidebar-new">
      <div className="v2-brand">
        <b>gest.</b>
      </div>
      <strong className="gest-company-name">Bella Gestão</strong>
      <nav className="gest-nav-groups">
        <button
          className={active === "Início" ? "active gest-main-nav" : "gest-main-nav"}
          onClick={() => setActive("Início")}
        >
          <Home size={20} />
          <span>Início</span>
        </button>
        <button
          className={active === "Assistente" ? "active gest-main-nav gest-assistant-nav" : "gest-main-nav gest-assistant-nav"}
          onClick={() => setActive("Assistente")}
        >
          <Sparkles size={20} />
          <span>Assistente</span>
        </button>
        {navigationGroups.map((group) => {
          const GroupIcon = group.icon;
          const expanded = openGroup === group.label;
          const containsActive = group.items.some(([view]) => view === active || (active === "Detalhe" && view === "Clientes"));
          return (
            <div className="gest-nav-group" key={group.label}>
              <button
                className={containsActive ? "gest-group-trigger current" : "gest-group-trigger"}
                onClick={() => setOpenGroup(expanded ? null : group.label)}
                aria-expanded={expanded}
              >
                <GroupIcon size={20} />
                <span>{group.label}</span>
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expanded && (
                <div className="gest-group-children">
                  {group.items.map(([label, Icon]) => (
                    <button
                      key={label}
                      className={active === label || (active === "Detalhe" && label === "Clientes") ? "active" : ""}
                      onClick={() => setActive(label)}
                    >
                      <Icon size={17} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="gest-sidebar-bottom">
        <button
          className={active === "Configurações" ? "active" : ""}
          onClick={() => setActive("Configurações")}
        >
          <Settings size={19} />
          <span>Configurações</span>
        </button>
      </div>
      <div className="v2-theme gest-theme-toggle">
        <Sun size={19} />
        <button
          className={dark ? "switch on" : "switch"}
          onClick={() => setDark(!dark)}
          aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
          aria-pressed={dark}
        >
          <i />
        </button>
        <Moon size={19} />
      </div>
    </aside>
  );
}

function Topbar({
  notificationOpen,
  setNotificationOpen,
  onCreate,
}: {
  notificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;
  onCreate: () => void;
}) {
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="v2-topbar">
      <div className="v2-search">
        <Search size={20} />
        <span>Buscar clientes, pedidos, produtos...</span>
        <kbd>⌘ K</kbd>
      </div>
      <div className="v2-user">
        <button className="gest-create-button" onClick={onCreate}><Plus size={17} /> Criar</button>
        <button
          className="v2-bell"
          onClick={() => setNotificationOpen(!notificationOpen)}
        >
          <Bell size={22} />
          <b>3</b>
        </button>
        <button className="gest-account-trigger" type="button" aria-haspopup="menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((open) => !open)}>
          <span className="v2-avatar">MO<i /></span>
          <span>
            <strong>Mariana Oliveira</strong>
            <small>mariana@bellagestao.com.br</small>
          </span>
          <ChevronDown size={18} className={accountOpen ? "open" : ""} />
        </button>
        {accountOpen && (
          <div className="gest-account-menu" role="menu" aria-label="Menu de Mariana Oliveira">
            <button type="button" role="menuitem"><UserRound size={18} /><span>Meu perfil</span></button>
            <button type="button" role="menuitem"><Settings size={18} /><span>Configurações da conta</span></button>
            <button type="button" role="menuitem"><MessageCircle size={18} /><span>Mensagens</span></button>
            <hr />
            <button type="button" role="menuitem" className="danger"><LogOut size={18} /><span>Sair</span></button>
          </div>
        )}
      </div>
      {notificationOpen && (
        <div className="v2-notifications">
          <header>
            <b>Notificações</b>
            <button>Ver todas</button>
          </header>
          {[
            ["Estoque", "23 itens com estoque abaixo do mínimo.", "orange"],
            ["Financeiro", "3 contas a pagar vencem hoje.", "blue"],
            [
              "Vendas",
              "Novo pedido #VND-1278 no valor de R$ 3.250,00.",
              "green",
            ],
            ["CRM", "Lucas Lima abriu um novo atendimento.", "purple"],
            ["Documentos", "2 contratos aguardando assinatura.", "blue"],
          ].map(([tag, text, tone]) => (
            <article key={tag}>
              <i className={tone}>!</i>
              <div>
                <span>{tag}</span>
                <p>{text}</p>
              </div>
            </article>
          ))}
          <footer>Ver todas as notificações</footer>
        </div>
      )}
    </header>
  );
}

// Ícones padronizados, pequenos e discretos, como nas referências visuais.
function Metric({
  label,
  value,
  detail,
  tone = "blue",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: string;
}) {
  const normalized = label.toLocaleLowerCase("pt-BR");
  const Icon: LucideIcon = normalized.includes("clientes ativos")
    ? UserCheck
    : normalized.includes("clientes inativos")
      ? UserRound
      : normalized.includes("cliente")
        ? Users
        : normalized.includes("responsável") || normalized.includes("membro") || normalized.includes("equipe")
          ? UsersRound
          : normalized.includes("estoque") || normalized.includes("produto") || normalized.includes("item")
            ? Package
            : normalized.includes("receita") || normalized.includes("faturamento") || normalized.includes("total vendido")
              ? TrendingUp
              : normalized.includes("lucro") || normalized.includes("margem")
                ? ArrowUpRight
                : normalized.includes("despesa") || normalized.includes("contas a pagar")
                  ? ArrowDownRight
                  : normalized.includes("contas a receber") || normalized.includes("saldo") || normalized.includes("crédito") || normalized.includes("disponível")
                    ? WalletCards
                    : normalized.includes("oportunidade")
                      ? Target
                      : normalized.includes("negócio") || normalized.includes("vendas abertas") || normalized.includes("plano")
                        ? BriefcaseBusiness
                      : normalized.includes("status")
                        ? CheckCircle2
                        : normalized.includes("atualização") || normalized.includes("vencimento") || normalized.includes("vencid")
                          ? Clock3
                          : normalized.includes("documento") || normalized.includes("arquivo") || normalized.includes("upload")
                            ? FileText
                            : CircleDollarSign;
  return (
    <article className="v2-card v2-metric">
      <div>
        <span>{label}<InfoHint text={`Entenda o indicador ${label.toLowerCase()} e como ele é calculado.`} /></span>
        <strong>{value}</strong>
        {detail && <small className={tone}>↑ {detail}</small>}
      </div>
      <i className={tone}>
        <Icon size={20} strokeWidth={1.75} />
      </i>
    </article>
  );
}
function PageIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="v2-intro">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
function ActionLink({ children }: { children: React.ReactNode }) {
  return (
    <button className="v2-action-link">
      {children} <span>→</span>
    </button>
  );
}

// Bloco reutilizável para manter a indicação profissional no rodapé das áreas.
function ProfessionalRecommendation({ area }: { area: string }) {
  const suggestions: Record<string, [string, string]> = {
    Agenda: [
      "Consultor de produtividade",
      "Organize confirmações, horários e rotinas.",
    ],
    Financeiro: [
      "Contador parceiro",
      "Apoio para tributos, fluxo de caixa e decisões.",
    ],
    Clientes: [
      "Consultor comercial",
      "Estratégias de relacionamento e retenção.",
    ],
    Configurações: [
      "Especialista em implantação",
      "Ajuste processos e permissões com segurança.",
    ],
  };
  const [name, detail] = suggestions[area] ?? [
    "Especialista Gest",
    "Apoio prático para esta área da operação.",
  ];
  return (
    <article className="v2-professional">
      <div>
        <span>INDICAÇÃO PARA ESTA ÁREA</span>
        <strong>{name}</strong>
        <small>{detail}</small>
      </div>
      <button>Ver contato</button>
    </article>
  );
}

function PrioritiesPanel() {
  return (
    <section className="v2-priorities v2-card v2-ai-priorities">
      <header>
        <div className="v2-ai-priority-heading">
          <i><Bot size={18} /></i>
          <div>
            <span>ASSISTENTE GEST · ANÁLISE DE HOJE</span>
            <h2>Mariana, encontrei 3 ações que merecem sua atenção.</h2>
            <p>Organizei por impacto e urgência. Posso ajudar você a executar cada uma.</p>
          </div>
        </div>
        <button>Conversar com a IA</button>
      </header>
      <div className="v2-ai-priority-grid">
        {[
          ["AGENDA", "Preencher 4 horários livres de quinta", "R$ 480 a mais", "Sua quinta tem espaço para novos atendimentos."],
          ["CRM", "Responder 3 leads sem retorno", "R$ 3.200 em pipeline", "Esses contatos estão há mais de 48h sem resposta."],
          [
            "FINANCEIRO",
            "Cobrar parcela vencida da Vitta Clinic",
            "R$ 8.800 a receber",
            "O vencimento passou há 3 dias e ainda não houve baixa.",
          ],
        ].map(([area, action, value, reason], index) => (
          <article key={area}>
            <div><span>{index + 1}</span><small>{area}</small></div>
            <strong>{action}</strong>
            <p>{reason}</p>
            <span>Impacto estimado <b>{value}</b></span>
            <button>Preparar com a IA <span>→</span></button>
          </article>
        ))}
      </div>
    </section>
  );
}

type TodayFilter = "all" | "evento" | "tarefa" | "projeto";

const todayTimelineItems = [
  { id: "meeting", time: "09:00", title: "Reunião comercial", detail: "Sala de reunião · Ana Martins", type: "evento" as TodayFilter, done: true },
  { id: "follow-up", time: "11:30", title: "Retorno para Bella Modas", detail: "Ligação · Lucas Ferreira", type: "tarefa" as TodayFilter, current: true },
  { id: "service", time: "14:00", title: "Ordem de serviço #1024", detail: "Atelier · Marina Costa", type: "projeto" as TodayFilter },
  { id: "visit", time: "16:30", title: "Visita técnica", detail: "Loja Centro · Paulo Lima", type: "evento" as TodayFilter },
];

function TodayTimeline({ setActive }: { setActive: (view: View) => void }) {
  const [filter, setFilter] = useState<TodayFilter>("all");
  const [completed, setCompleted] = useState(() => new Set(todayTimelineItems.filter((item) => item.done).map((item) => item.id)));
  const filters: Array<[TodayFilter, string]> = [["all", "Todos"], ["evento", "Eventos"], ["tarefa", "Tarefas"], ["projeto", "Projetos"]];
  const activeIndex = filters.findIndex(([value]) => value === filter);
  const visibleItems = todayTimelineItems.filter((item) => filter === "all" || item.type === filter);

  const toggleCompleted = (id: string) => {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="shelf-timeline" aria-label="Resumo da agenda de hoje">
      <header>
        <h2>Hoje</h2>
        <button type="button" onClick={() => setActive("Agenda")}>Abrir agenda <ChevronRight size={17} /></button>
      </header>
      <nav className="shelf-timeline-filters" aria-label="Filtrar atividades de hoje">
        <span className="shelf-timeline-filter-glass" style={{ transform: `translateX(${activeIndex * 100}%) translateX(${activeIndex * 6}px)` }} aria-hidden="true" />
        {filters.map(([value, label]) => (
          <button key={value} type="button" className={filter === value ? "is-active" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
        ))}
      </nav>
      <div className="shelf-timeline-list" role="list">
        {visibleItems.map((item) => {
          const isDone = completed.has(item.id);
          return (
            <article className={`${isDone ? "is-done" : ""}${item.current ? " is-current" : ""}`} key={item.id} role="listitem">
              <time>{item.time}</time>
              <button type="button" className="shelf-timeline-marker" aria-label={isDone ? `Marcar ${item.title} como pendente` : `Marcar ${item.title} como concluída`} onClick={() => toggleCompleted(item.id)}>
                {isDone ? <CheckCircle2 size={15} /> : item.current ? <span /> : null}
              </button>
              <button type="button" className="shelf-timeline-content" onClick={() => setActive("Agenda")}>
                {item.current && <small>Agora</small>}
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HomeView({ setActive }: { setActive: (view: View) => void }) {
  const [question, setQuestion] = useState("");
  const recommendations: Array<[string, string, string, View, string]> = [
    ["Seu faturamento perdeu ritmo", "Você pode fechar 12% abaixo da meta. Reativar 18 clientes pode recuperar até R$ 14.600.", "Preparar campanha", "CRM", "critical"],
    ["Dia das Mães está a 24 dias", "Comece a campanha esta semana para aproveitar o período.", "Criar planejamento", "Agenda", "seasonal"],
    ["7 pacientes ainda não confirmaram amanhã", "R$ 2.850 da agenda depende dessas confirmações.", "Enviar lembretes", "Agenda", "agenda"],
    ["Seu estoque está saudável", "Você tem cobertura para os próximos 18 dias. Nenhuma compra urgente.", "Ver estoque", "Estoque", "positive"],
  ];
  return (
    <section className="gest-ai-home">
      <small className="gest-home-date">QUINTA-FEIRA, 13 DE AGOSTO</small>
      <section className="gest-ai-command">
        <header>
          <span className="gest-ai-label"><Sparkles size={15} /> Gest IA</span>
          <h1>Bom dia, Marina.</h1>
          <p>Analisei seu negócio e encontrei 4 pontos que merecem atenção.</p>
        </header>
        <h2>O que eu faria agora</h2>
        <div className="gest-ai-recommendations">
          {recommendations.map(([title, detail, action, view, tone], index) => (
            <article className={tone} key={title}>
              <small>{index === 0 ? "Crítico" : index === 1 ? "Sazonal" : index === 2 ? "Agenda" : "Positivo"}</small>
              <strong>{title}</strong>
              <p>{detail}</p>
              <button onClick={() => setActive(view)}>{action}</button>
            </article>
          ))}
        </div>
        <button className="gest-all-insights" onClick={() => setActive("Assistente")}>Ver todos os insights <span>→</span></button>
        <form className="gest-ai-question" onSubmit={(event) => { event.preventDefault(); if (question.trim()) setActive("Assistente"); }}>
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Pergunte qualquer coisa sobre o seu negócio..." />
          <button type="submit" aria-label="Enviar pergunta">→</button>
        </form>
      </section>

      <div className="gest-today-grid">
        <TodayTimeline setActive={setActive} />
        <section className="gest-pending-panel">
          <h2>Pendências do dia</h2>
          {[
            ["5 retornos comerciais", "Acompanhar e responder", "5", "Clientes"],
            ["3 contas vencidas", "Ações necessárias", "3", "Financeiro"],
            ["2 serviços atrasados", "Prioridade de atendimento", "2", "Ordens de Serviço"],
            ["1 proposta aguardando resposta", "Enviar lembrete", "1", "Propostas"],
          ].map(([title, detail, count, view], index) => (
            <button key={title} onClick={() => setActive(view as View)} className={index === 2 ? "urgent" : ""}>
              <span><strong>{title}</strong><small>{detail}</small></span><b>{count}</b><i>›</i>
            </button>
          ))}
        </section>
      </div>

      <div className="gest-home-summary">
        <section>
          <h2>Negócio agora</h2>
          <div>{[
            ["Receita hoje", "R$ 82.450", CircleDollarSign, "Financeiro"],
            ["Resultado hoje", "R$ 31.280", WalletCards, "Financeiro"],
            ["Vendas este mês", "68% da meta", ShoppingCart, "Vendas"],
            ["Ticket médio", "R$ 245", TrendingUp, "Relatórios"],
          ].map(([label, value, Icon, view]) => {
            const SummaryIcon = Icon as LucideIcon;
            return <button className="gest-summary-link" key={label as string} onClick={() => setActive(view as View)}><i><SummaryIcon size={17} /></i><span><small>{label as string}</small><strong>{value as string}</strong></span><ChevronRight size={15} /></button>;
          })}</div>
        </section>
        <section>
          <header><h2>Movimento recente</h2><button onClick={() => setActive("Relatórios")}>Ver visão completa →</button></header>
          <div>{[["Venda concluída", "Bella Modas · Há 1h"], ["Pagamento recebido", "R$ 3.250 · Há 3h"], ["Novo cliente", "Studio Aurora · Há 5h"]].map(([label, detail]) => <article key={label}><strong>{label}</strong><small>{detail}</small></article>)}</div>
        </section>
      </div>
    </section>
  );
}

/** Gráfico com visualização permanente opcional e tooltip ao passar o mouse. */
function Chart({
  title = "receita",
  period = "30 dias",
}: {
  title?: string;
  period?: string;
}) {
  const [showValues, setShowValues] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  // Cada período muda os rótulos para o usuário reconhecer a escala analisada.
  const scales = {
    "30 dias": {
      values: [
        "R$ 300 mil",
        "R$ 240 mil",
        "R$ 180 mil",
        "R$ 120 mil",
        "R$ 60 mil",
      ],
      labels: [
        "27 abr",
        "02 mai",
        "07 mai",
        "12 mai",
        "17 mai",
        "22 mai",
        "26 mai",
      ],
    },
    "3 meses": {
      values: [
        "R$ 750 mil",
        "R$ 600 mil",
        "R$ 450 mil",
        "R$ 300 mil",
        "R$ 150 mil",
      ],
      labels: ["Mar", "Abr", "Mai"],
    },
    "6 meses": {
      values: [
        "R$ 1,5 mi",
        "R$ 1,2 mi",
        "R$ 900 mil",
        "R$ 600 mil",
        "R$ 300 mil",
      ],
      labels: ["Dez", "Jan", "Fev", "Mar", "Abr", "Mai"],
    },
    "12 meses": {
      values: ["R$ 3 mi", "R$ 2,4 mi", "R$ 1,8 mi", "R$ 1,2 mi", "R$ 600 mil"],
      // Um rótulo e um ponto por mês: não omite meses nem cria picos extras.
      labels: ["Jun/24", "Jul", "Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr", "Mai/25"],
    },
  } as const;
  const scale = scales[period as keyof typeof scales] ?? scales["30 dias"];
  // Séries distintas evitam que Receita e Manutenção pareçam o mesmo dado.
  // Nas visões mensais há exatamente um ponto por mês, sem picos artificiais.
  const datasets = title.includes("custo")
    ? { "30 dias": [35, 58, 47, 70, 61, 76, 42, 48, 39, 65, 72, 54], "3 meses": [48, 67, 54], "6 meses": [36, 52, 46, 73, 58, 64], "12 meses": [42, 49, 55, 50, 67, 62, 58, 71, 64, 60, 74, 69] }
    : { "30 dias": [46, 78, 62, 74, 109, 124, 98, 112, 151, 129, 180, 162, 189, 80, 93, 74, 122, 137, 149, 173, 161, 198, 180, 205, 140], "3 meses": [142, 198, 174], "6 meses": [96, 128, 154, 132, 184, 210], "12 meses": [82, 104, 126, 119, 147, 170, 154, 182, 201, 175, 220, 208] };
  const source = datasets[period as keyof typeof datasets] ?? datasets["30 dias"];
  const max = Math.max(...source);
  const min = Math.min(...source);
  const points = source.map((value, index) => {
    // Reserva margem para os valores do eixo à esquerda e usa todo o restante
    // do card para a série, também no gráfico de Manutenção.
    const x = 104 + (796 / Math.max(source.length - 1, 1)) * index;
    const y = 205 - ((value - min) / Math.max(max - min, 1)) * 155;
    return [x, y, value] as const;
  });
  const linePath = points.map(([x, y], index) => `${index ? "L" : "M"}${x} ${y}`).join(" ");
  const areaPath = `${linePath} L900 216 L104 216 Z`;
  return (
    <div className="v2-chart-wrap">
      <button
        className="v2-chart-eye"
        onClick={() => setShowValues(!showValues)}
        aria-label={
          showValues
            ? "Ocultar valores do gráfico"
            : "Mostrar valores do gráfico"
        }
      >
        {showValues ? <Eye size={17} /> : <EyeOff size={17} />}
      </button>
      <svg
        className="v2-chart"
        viewBox="0 0 940 260"
        role="img"
        aria-label={`Evolução de ${title}`}
      >
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#2563c8" stopOpacity=".18" />
            <stop offset="1" stopColor="#2563c8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[40, 84, 128, 172, 216].map((y, index) => (
          <g key={String(y)}>
            <line x1="84" x2="920" y1={y} y2={y} />
            <text className="v2-chart-axis" x="2" y={y + 4}>
              {scale.values[index]}
            </text>
          </g>
        ))}
        <path
          d={areaPath}
          fill="url(#area)"
        />
        <path
          className="v2-chart-line"
          d={linePath}
        />
        {points.map(([x, y, value], index) => (
          <g
            key={x}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            {(showValues || hovered === index) && (
              <text
                className="v2-chart-label"
                x={x}
                y={y - 12}
                textAnchor="middle"
              >
                {title.includes("custo") ? `R$ ${value * 28}` : `R$ ${value} mil`}
              </text>
            )}
            <circle cx={x} cy={y} r="4" />
          </g>
        ))}
        {scale.labels.map((label, index) => {
          const x = 104 + (796 / Math.max(scale.labels.length - 1, 1)) * index;
          return (
            <text
              key={label}
              className="v2-chart-axis"
              x={x}
              y="248"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
function SimpleList({
  title,
  rows,
  onView,
}: {
  title: string;
  rows: string[][];
  onView?: () => void;
}) {
  return (
    <article className="v2-card v2-list">
      <header>
        <h3>{title}</h3>
        <button onClick={onView}>Ver todas</button>
      </header>
      {rows.map((row, i) => (
        <div className="v2-list-row" key={row[0]}>
          <i className={i === 1 ? "green" : i === 2 ? "blue" : ""} />
          <div>
            <strong>{row[0]}</strong>
            <small>{row[1]}</small>
          </div>
          {row[2] && <b>{row[2]}</b>}
        </div>
      ))}
    </article>
  );
}
function CampaignList({ onView }: { onView?: () => void }) {
  const rows = [
    [Heart, "12 de junho", "Dia dos Namorados · 17 dias", "pink"],
    [Shirt, "10 de agosto", "Dia dos Pais · 76 dias", "blue"],
    [ShoppingBag, "15 de setembro", "Dia do Cliente · 112 dias", "purple"],
    [Candy, "31 de outubro", "Halloween · 158 dias", "orange"],
  ] as const;
  return (
    <article className="v2-card v2-list v2-campaign-list">
      <header>
        <h3>Datas e campanhas</h3>
        <button onClick={onView}>Ver todas</button>
      </header>
      {rows.map(([Icon, date, detail, tone]) => (
        <div className="v2-list-row" key={date}>
          <i className={tone}>
            <Icon size={15} />
          </i>
          <div>
            <strong>{date}</strong>
            <small>{detail}</small>
          </div>
        </div>
      ))}
    </article>
  );
}
function AccountActions() {
  return (
    <article className="v2-card v2-list v2-account-actions">
      <header>
        <h3>Ações da conta</h3>
        <button>Ver todas</button>
      </header>
      <div className="v2-list-row">
        <i className="blue">
          <UserRound size={16} />
        </i>
        <div>
          <strong>Trocar usuário</strong>
          <small>Acesse sua conta com outro usuário.</small>
        </div>
      </div>
      <div className="v2-list-row">
        <i className="red">
          <LogOut size={16} />
        </i>
        <div>
          <strong>Sair da conta</strong>
          <small>Encerre sua sessão com segurança.</small>
        </div>
      </div>
    </article>
  );
}

function AgendaView() {
  const [detail, setDetail] = useState(true);
  const activities = [
    {
      day: 0,
      hour: 1,
      kind: "blue",
      title: "Reunião comercial",
      time: "09:00 – 10:00",
      meta: "Sala 2 · João Silva",
    },
    {
      day: 1,
      hour: 3,
      kind: "green",
      title: "Visita técnica",
      time: "11:00 – 12:00",
      meta: "Instalação Alfa · Carlos Lima",
    },
    {
      day: 2,
      hour: 2,
      kind: "purple",
      title: "Proposta comercial",
      time: "10:00 – 11:30",
      meta: "Online · Mariana Oliveira",
    },
    {
      day: 3,
      hour: 1,
      kind: "orange",
      title: "Ligação de follow-up",
      time: "09:30 – 10:30",
      meta: "Telefone · João Silva",
    },
    {
      day: 4,
      hour: 6,
      kind: "blue",
      title: "Reunião de equipe",
      time: "14:00 – 15:30",
      meta: "Sala 1 · Mariana Oliveira",
    },
    {
      day: 1,
      hour: 7,
      kind: "red",
      title: "Entrega de equipamentos",
      time: "15:00 – 16:30",
      meta: "Cliente Beta · Rafael Souza",
    },
    {
      day: 2,
      hour: 9,
      kind: "green",
      title: "Visita comercial",
      time: "16:30 – 17:30",
      meta: "Cliente Gama · Carlos Lima",
    },
    {
      day: 5,
      hour: 9,
      kind: "purple",
      title: "Treinamento",
      time: "17:00 – 18:00",
      meta: "Online · Juliana Mendes",
    },
  ];
  return (
    <>
      <PageIntro
        title="Agenda"
        subtitle="Acompanhe seus compromissos, reuniões e atividades da semana."
      />
      <div className="v2-agenda-tools">
        <div className="v2-segment">
          <button className="selected">Semanal</button>
          <button>Mensal</button>
          <button>Anual</button>
        </div>
        <button>Hoje</button>
        <button>‹</button>
        <button>›</button>
        <span />
        <button className="v2-primary">
          <Plus size={18} /> Nova atividade
        </button>
      </div>
      <div className="v2-agenda-layout">
        <aside>
          <MiniMonth />
          <article className="v2-card v2-filter">
            <h3>Filtros rápidos</h3>
            {[
              ["▣", "Todas as atividades", "18"],
              ["♧", "Reuniões", "6"],
              ["⌖", "Visitas", "5"],
              ["⌕", "Ligações", "3"],
              ["▤", "Entregas/Serviços", "4"],
            ].map((r, i) => (
              <button className={i === 0 ? "selected" : ""} key={r[1]}>
                <i>{r[0]}</i>
                {r[1]}
                <b>{r[2]}</b>
              </button>
            ))}
          </article>
          <SimpleList
            title="Próximas atividades"
            rows={[
              ["Reunião comercial", "Hoje, 09:00 · Sala 2"],
              ["Visita técnica", "Hoje, 14:00 · Instalação Alfa"],
              ["Proposta comercial", "Amanhã, 10:00 · Online"],
            ]}
          />
        </aside>
        <section className="v2-calendar v2-card">
          <header>
            <h2>26 de maio – 1º de junho de 2025</h2>
          </header>
          <div className="v2-calendar-grid">
            <div className="v2-times">
              {[
                "",
                "08:00",
                "09:00",
                "10:00",
                "11:00",
                "12:00",
                "13:00",
                "14:00",
                "15:00",
                "16:00",
                "17:00",
              ].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            {[
              "Seg 26",
              "Ter 27",
              "Qua 28",
              "Qui 29",
              "Sex 30",
              "Sáb 31",
              "Dom 1",
            ].map((day, di) => (
              <div className="v2-day" key={day}>
                <b className={di === 0 ? "today" : ""}>{day}</b>
                {Array.from({ length: 10 }, (_, h) => (
                  <div className="v2-hour" key={h}>
                    {activities
                      .filter((a) => a.day === di && a.hour === h)
                      .map((a) => (
                        <button
                          className={`v2-event ${a.kind}`}
                          key={a.title}
                          onClick={() => setDetail(true)}
                        >
                          <small>{a.time}</small>
                          <strong>{a.title}</strong>
                          <span>{a.meta}</span>
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
        {detail && (
          <aside className="v2-activity-detail v2-card">
            <button className="close" onClick={() => setDetail(false)}>
              <X />
            </button>
            <h3>Detalhes da atividade</h3>
            <em>Reunião</em>
            <h2>Reunião comercial</h2>
            <dl>
              <dt>▣ Data e hora</dt>
              <dd>
                26/05/2025 (Segunda-feira)
                <br />
                09:00 – 10:00
              </dd>
              <dt>⌖ Local</dt>
              <dd>Sala 2</dd>
              <dt>♧ Responsável</dt>
              <dd>
                João Silva
                <br />
                <small>Consultor de Vendas</small>
              </dd>
              <dt>▣ Venda relacionada</dt>
              <dd className="link">
                Venda #VND-1278
                <br />
                <small>Cliente Alfa Ltda.</small>
              </dd>
              <dt>Descrição</dt>
              <dd>
                Apresentação de proposta comercial e alinhamento de próximos
                passos.
              </dd>
            </dl>
            <footer>
              <button>
                <Edit3 size={17} /> Editar
              </button>
              <button className="danger">
                <Trash2 size={17} /> Excluir
              </button>
            </footer>
          </aside>
        )}
      </div>
    </>
  );
}
function MiniMonth() {
  return (
    <article className="v2-card v2-mini-month">
      <header>
        <b>Maio 2025</b>
        <span>‹　›</span>
      </header>
      <div>
        {[
          "D",
          "S",
          "T",
          "Q",
          "Q",
          "S",
          "S",
          "27",
          "28",
          "29",
          "30",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
          "12",
          "13",
          "14",
          "15",
          "16",
          "17",
          "18",
          "19",
          "20",
          "21",
          "22",
          "23",
          "24",
          "25",
          "26",
          "27",
          "28",
          "29",
          "30",
          "31",
        ].map((d, i) => (
          <span className={d === "26" ? "chosen" : ""} key={i}>
            {d}
          </span>
        ))}
      </div>
    </article>
  );
}

function ClientsView({ setActive }: { setActive: (view: View) => void }) {
  return (
    <>
      <div className="v2-intro client-compact-intro">
        <h1>Clientes <InfoHint text="Gerencie e acompanhe seus clientes e seu relacionamento." /></h1>
      </div>
      <section className="v2-metrics client-metrics client-overview-metrics">
        <Metric
          label="Total de clientes"
          value="1.248"
          detail="7,2% vs. 30 dias anteriores"
          tone="blue"
        />
        <Metric
          label="Clientes ativos"
          value="1.047"
          detail="6,8% vs. 30 dias anteriores"
          tone="green"
        />
        <Metric
          label="Clientes inativos"
          value="201"
          detail="4,1% vs. 30 dias anteriores"
          tone="orange"
        />
        <Metric
          label="Ticket médio"
          value="R$ 3.842,60"
          detail="9,5% vs. 30 dias anteriores"
          tone="green"
        />
      </section>
      <article className="v2-card v2-client-table">
        <header>
          <div className="v2-local-search">
            <Search size={19} />
            <span>Buscar clientes por nome, e-mail ou telefone...</span>
          </div>
          <label>
            Status
            <select>
              <option>Todos</option>
            </select>
          </label>
          <label>
            Tipo
            <select>
              <option>Todos</option>
            </select>
          </label>
          <button className="v2-primary">
            <Plus size={19} /> Cadastrar cliente
          </button>
        </header>
        <table>
          <thead>
            <tr>
              {[
                "ID",
                "Cliente",
                "Tipo",
                "Último contato",
                "Total vendido",
                "Status",
                "Ações",
              ].map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>
                  <i className="initials">{row[1]}</i>
                  <div>
                    <strong>{row[2]}</strong>
                    <small>{row[3]}</small>
                  </div>
                </td>
                <td>
                  <span
                    className={
                      row[4] === "Pessoa Jurídica" ? "type legal" : "type"
                    }
                  >
                    {row[4]}
                  </span>
                </td>
                <td>
                  <strong>{row[5]}</strong>
                  <small>{row[6]}</small>
                </td>
                <td>{row[7]}</td>
                <td>
                  <span
                    className={
                      row[8] === "Ativo" ? "status active" : "status inactive"
                    }
                  >
                    ●　{row[8]}
                  </span>
                </td>
                <td>
                  <button onClick={() => setActive("Detalhe")}>
                    Ver detalhes
                  </button>
                  <Edit3 size={17} />
                  <Menu size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <footer>
          Mostrando 1 a 8 de 1.248 clientes{" "}
          <div className="pagination">
            <button>‹</button>
            <b>1</b>
            <button>2</button>
            <button>3</button>
            <span>…</span>
            <button>156</button>
            <button>›</button>
          </div>
        </footer>
      </article>
    </>
  );
}

function DetailView({ setActive }: { setActive: (view: View) => void }) {
  return (
    <>
      <button className="v2-back" onClick={() => setActive("Clientes")}>
        ←　Voltar
      </button>
      <div className="v2-detail-head">
        <div>
          <h1>Flor do Campo Comércio de Flores Ltda.</h1>
          <p>CNPJ 27.456.789/0001-33</p>
        </div>
        <div>
          <button>
            <Edit3 size={17} /> Editar
          </button>
          <button className="danger">
            <Trash2 size={17} /> Excluir
          </button>
        </div>
      </div>
      <nav className="v2-tabs">
        {[
          "Dados",
          "Histórico",
          "Vendas",
          "Financeiro",
          "Documentos",
          "Observações",
        ].map((x) => (
          <button className={x === "Financeiro" ? "active" : ""} key={x}>
            {x}
          </button>
        ))}
      </nav>
      <section className="v2-metrics detail-metrics">
        <Metric
          label="Saldo em aberto"
          value="R$ 8.430,20"
          detail="3 faturas vencidas"
          tone="orange"
        />
        <Metric
          label="Limite de crédito"
          value="R$ 15.000,00"
          detail="Utilizado: 56%"
        />
        <Metric
          label="Disponível para uso"
          value="R$ 6.600,00"
          detail=""
          tone="green"
        />
        <Metric
          label="Total faturado (12 meses)"
          value="R$ 86.240,50"
          detail="18,6% vs. 12 meses anteriores"
          tone="green"
        />
      </section>
      <div className="v2-finance-grid">
        <div>
          <TableCard
            title="Faturas em aberto　③"
            headers={[
              "Nº da fatura",
              "Emissão",
              "Vencimento",
              "Valor",
              "Status",
            ]}
            rows={[
              [
                "FAT-2025-00548",
                "15/05/2025",
                "25/05/2025",
                "R$ 3.250,00",
                "Vencida",
              ],
              [
                "FAT-2025-00535",
                "30/04/2025",
                "10/05/2025",
                "R$ 2.980,20",
                "Vencida",
              ],
              [
                "FAT-2025-00522",
                "15/04/2025",
                "01/05/2025",
                "R$ 2.200,00",
                "Vencida",
              ],
              [
                "FAT-2025-00510",
                "31/03/2025",
                "10/04/2025",
                "R$ 1.850,00",
                "A vencer",
              ],
              [
                "FAT-2025-00495",
                "15/03/2025",
                "25/03/2025",
                "R$ 1.700,00",
                "A vencer",
              ],
            ]}
          />
          <TableCard
            title="Histórico de pagamentos"
            headers={["Data", "Documento", "Forma de pagamento", "Valor"]}
            rows={[
              ["05/05/2025", "REC-2025-00421", "PIX", "R$ 1.950,00"],
              [
                "22/04/2025",
                "REC-2025-00387",
                "Boleto Bancário",
                "R$ 2.200,00",
              ],
              ["10/04/2025", "REC-2025-00355", "PIX", "R$ 1.700,00"],
              [
                "25/03/2025",
                "REC-2025-00312",
                "Cartão de Crédito",
                "R$ 2.450,00",
              ],
              ["10/03/2025", "REC-2025-00278", "PIX", "R$ 1.650,00"],
            ]}
          />
          <article className="v2-card v2-balance">
            <h3>Evolução do saldo em aberto <InfoHint text="Mostra como o valor ainda pendente varia ao longo do período." /></h3>
            <Chart />
          </article>
        </div>
        <aside>
          <article className="v2-card v2-credit">
            <h3>Resumo de crédito</h3>
            <p>
              Limite de crédito <b>R$ 15.000,00</b>
            </p>
            <p>
              Total utilizado <b>R$ 8.400,00</b>
            </p>
            <p>
              Disponível para uso <b className="green-text">R$ 6.600,00</b>
            </p>
            <p>
              % utilizado <b>56%</b>
            </p>
            <div className="progress">
              <i />
            </div>
            <ActionLink>Solicitar alteração de limite</ActionLink>
          </article>
          <article className="v2-card v2-credit">
            <h3>Informações de cobrança</h3>
            <p>
              Dia de vencimento <b>10</b>
            </p>
            <p>
              Condição de pagamento <b>10 dias</b>
            </p>
            <p>
              Meio de envio <b>E-mail</b>
            </p>
            <p>
              E-mail para cobrança <b>financeiro@flordocampo.com.br</b>
            </p>
            <ActionLink>Editar informações de cobrança</ActionLink>
          </article>
          <SimpleList
            title="Ações rápidas"
            rows={[
              [
                "Enviar lembrete de pagamento",
                "Enviar e-mail de cobrança ao cliente",
              ],
              ["Registrar novo pagamento", "Vincular pagamento recebido"],
            ]}
          />
        </aside>
      </div>
    </>
  );
}
function TableCard({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <article className="v2-card v2-data-card">
      <header>
        <h3>{title}</h3>
        <button>Ver todas　→</button>
      </header>
      <table>
        <thead>
          <tr>
            {headers.map((x) => (
              <th key={x}>{x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>
                  {j === row.length - 1 &&
                  (cell === "Vencida" || cell === "A vencer") ? (
                    <span
                      className={
                        cell === "Vencida" ? "status inactive" : "status warn"
                      }
                    >
                      {cell}
                    </span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

function SettingsView({
  dark,
  setDark,
  sidebarColor,
  setSidebarColor,
}: {
  dark: boolean;
  setDark: (value: boolean) => void;
  sidebarColor: string;
  setSidebarColor: (value: string) => void;
}) {
  const [tab, setTab] = useState("Negócio");
  const stats = [
    [Crown, "Plano atual", "Standard", "Teste grátis de 30 dias", "orange"],
    [
      CalendarClock,
      "Dias restantes do teste",
      "23 dias",
      "Expira em 18/06/2025",
      "green",
    ],
    [Users, "Usuários utilizados", "3 / 10", "30% de utilização", "blue"],
    [
      UserRound,
      "Clientes utilizados",
      "1.248 / 5.000",
      "25% de utilização",
      "green",
    ],
    [
      Package,
      "Produtos/serviços utilizados",
      "230 / 2.000",
      "12% de utilização",
      "purple",
    ],
    [
      CircleDollarSign,
      "Vendas mensais utilizadas",
      "R$ 24.680,50",
      "24,68% de utilização",
      "orange",
    ],
  ] as const;
  const tabs = [
    [BriefcaseBusiness, "Negócio"],
    [Palette, "Aparência"],
    [UserRound, "Conta"],
    [Crown, "Plano"],
    [CheckCircle2, "Segurança"],
    [Settings, "Integrações"],
  ] as const;
  return (
    <>
      <PageIntro
        title="Configurações"
        subtitle="Gerencie as informações do seu negócio, conta e preferências da plataforma."
      />
      <section className="v2-settings-stats">
        {stats.map(([Icon, label, value, detail, tone]) => (
          <article className="v2-card" key={label}>
            <i className={tone}>
              <Icon size={17} />
            </i>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </article>
        ))}
      </section>
      <nav className="v2-settings-tabs">
        {tabs.map(([Icon, label]) => (
          <button
            key={label}
            className={tab === label ? "active" : ""}
            onClick={() => setTab(label)}
          >
            <Icon size={14} />　{label}
          </button>
        ))}
      </nav>
      {tab === "Aparência" ? (
        <section className="gest-appearance-settings v2-card">
          <header>
            <div>
              <h2>Aparência do aplicativo</h2>
              <p>Personalize a cor da navegação e escolha entre modo claro e escuro.</p>
            </div>
            <Palette size={24} />
          </header>
          <div className="gest-appearance-grid">
            <div>
              <h3>Cor da barra lateral</h3>
              <p>A alteração fica salva neste dispositivo.</p>
              <div className="gest-color-options">
                {[
                  ["#071a38", "Azul padrão"],
                  ["#7a274e", "Rosa ameixa"],
                  ["#7b3f61", "Rosa suave"],
                  ["#49306b", "Violeta"],
                  ["#174a4a", "Verde petróleo"],
                  ["#252a34", "Grafite"],
                ].map(([color, label]) => (
                  <button
                    key={color}
                    className={sidebarColor === color ? "selected" : ""}
                    onClick={() => setSidebarColor(color)}
                    aria-label={`Usar cor ${label}`}
                    title={label}
                    style={{ backgroundColor: color }}
                  >
                    {sidebarColor === color && <CheckCircle2 size={18} />}
                  </button>
                ))}
                <label className="gest-custom-color">
                  <input
                    type="color"
                    value={sidebarColor}
                    onChange={(event) => setSidebarColor(event.target.value)}
                  />
                  Cor personalizada
                </label>
              </div>
            </div>
            <div>
              <h3>Tema da interface</h3>
              <p>Altere o contraste de toda a área de trabalho.</p>
              <button className="gest-theme-setting" onClick={() => setDark(!dark)}>
                <span>{dark ? <Moon size={20} /> : <Sun size={20} />}<b>{dark ? "Modo escuro" : "Modo claro"}</b></span>
                <i className={dark ? "switch on" : "switch"}><em /></i>
              </button>
            </div>
          </div>
          <aside className="gest-color-preview" style={{ backgroundColor: sidebarColor }}>
            <b>gest.</b><span>Prévia da barra lateral</span>
          </aside>
        </section>
      ) : (
      <div className="v2-settings-layout">
        <article className="v2-card v2-business-form">
          <h2>Informações do negócio</h2>
          <p>
            Atualize os dados principais da sua empresa. Essas informações serão
            utilizadas em documentos, propostas e comunicados.
          </p>
          <div className="v2-form-grid">
            <label>
              Nome do negócio
              <input defaultValue="Demonstração Serviços Automotivos Ltda." />
            </label>
            <label className="logo-field">
              Logo do negócio
              <div>
                <i>
                  <Wrench size={18} />
                </i>
                <b>Demonstração</b>
                <small>Serviços Automotivos</small>
                <button>Alterar logo</button>
              </div>
            </label>
            <label>
              E-mail
              <input defaultValue="contato@demonstracaoservicos.com.br" />
            </label>
            <label>
              Endereço
              <input defaultValue="Rua das Oficinas, 500" />
            </label>
            <label>
              CPF/CNPJ
              <input defaultValue="29.123.456/0001-78" />
            </label>
            <label>
              {" "}
              Bairro
              <input defaultValue="Vila Operária" />
            </label>
            <label>
              Telefone
              <input defaultValue="🇧🇷　+55 (11) 98765-4321" />
            </label>
            <label>
              CEP
              <input defaultValue="03177-000" />
            </label>
            <label>
              Cidade
              <input defaultValue="São Paulo" />
            </label>
            <label>
              Estado
              <select>
                <option>SP</option>
              </select>
            </label>
          </div>
          <footer>
            <button className="v2-primary">Salvar alterações</button>
            <button>Cancelar</button>
          </footer>
        </article>
        <aside>
          <article className="v2-card v2-plan-card">
            <small>Teste grátis</small>
            <h2>
              <Crown size={18} /> Standard
            </h2>
            <p>Ideal para empresas em crescimento.</p>
            {[
              "Até 10 usuários",
              "Até 5.000 clientes",
              "Até 2.000 produtos/serviços",
              "Relatórios avançados",
              "Suporte por e-mail",
            ].map((x) => (
              <span key={x}>✓　{x}</span>
            ))}
            <button>Upgrade de plano</button>
          </article>
          <AccountActions />
        </aside>
      </div>
      )}
    </>
  );
}

/** Diretório padrão para os módulos operacionais. Cada área tem filtros, ordenação, cadastro e detalhe por abas. */
const modules: Record<
  string,
  {
    subtitle: string;
    label: string;
    metrics: [string, string, string, string][];
    filters: string[];
    tabs: string[];
    rows: string[][];
  }
> = {
  Vendas: {
    subtitle: "Controle pedidos, pagamentos, comprovantes e recebimentos.",
    label: "Nova venda",
    metrics: [
      ["Total vendido", "R$ 82.450", "no mês", "blue"],
      ["Vendas abertas", "18", "em andamento", "orange"],
      ["Pendentes", "R$ 21.200", "a receber", "orange"],
      ["Canceladas", "3", "este mês", "red"],
    ],
    filters: ["Status", "Pagamento", "Período"],
    tabs: [
      "Dados",
      "Itens",
      "Pagamento",
      "Comprovantes",
      "Recibo / PDF",
      "Histórico",
    ],
    rows: [
      ["1268", "Arco Studio", "Cartão", "14 jul 2026", "R$ 8.400", "Proposta"],
      [
        "1264",
        "Vitta Clinic",
        "Boleto",
        "15 jul 2026",
        "R$ 12.800",
        "Pendente",
      ],
      ["1258", "Bella Café", "Pix", "16 jul 2026", "R$ 4.850", "Paga"],
      ["1248", "PrimePet Store", "Pix", "10 jul 2026", "R$ 2.150", "Paga"],
    ],
  },
  Catálogo: {
    subtitle:
      "Organize produtos e serviços, preços, categorias e disponibilidade.",
    label: "Novo item",
    metrics: [
      ["Itens cadastrados", "230", "produtos e serviços", "blue"],
      ["Ativos", "215", "disponíveis para venda", "green"],
      ["Estoque baixo", "12", "precisam de reposição", "orange"],
      ["Valor do catálogo", "R$ 96.300", "valor estimado", "blue"],
    ],
    filters: ["Tipo", "Status"],
    tabs: ["Dados", "Preço", "Estoque", "Histórico", "Categorias"],
    rows: [
      [
        "230",
        "Consultoria estratégica",
        "Serviço",
        "16 jul 2026",
        "R$ 1.800",
        "Ativo",
      ],
      ["229", "Shampoo premium", "Produto", "14 jul 2026", "R$ 89", "Ativo"],
      [
        "228",
        "Manutenção preventiva",
        "Serviço",
        "10 jul 2026",
        "R$ 420",
        "Ativo",
      ],
      [
        "227",
        "Kit de boas-vindas",
        "Produto",
        "08 jul 2026",
        "R$ 150",
        "Inativo",
      ],
    ],
  },
  Financeiro: {
    subtitle:
      "Acompanhe receitas, despesas, contas e o fluxo de caixa do negócio.",
    label: "Novo lançamento",
    metrics: [
      ["Receita do mês", "R$ 82.450", "18,6% vs. mês anterior", "green"],
      ["Despesas", "R$ 31.200", "neste mês", "orange"],
      ["Lucro estimado", "R$ 51.250", "margem de 62%", "green"],
      ["Contas a pagar", "R$ 18.920", "8 vencimentos próximos", "orange"],
    ],
    filters: ["Tipo", "Status", "Vencimento"],
    tabs: ["Dados", "Parcelas", "Pagamentos", "Comprovantes", "Histórico"],
    rows: [
      [
        "FIN-0928",
        "Receita venda #1268",
        "Receita",
        "16 jul 2026",
        "R$ 8.400",
        "Recebido",
      ],
      [
        "FIN-0927",
        "Fornecedor de produtos",
        "Despesa",
        "17 jul 2026",
        "R$ 2.700",
        "Pendente",
      ],
      [
        "FIN-0926",
        "Receita venda #1264",
        "Receita",
        "15 jul 2026",
        "R$ 12.800",
        "A receber",
      ],
      ["FIN-0925", "Aluguel", "Despesa", "10 jul 2026", "R$ 3.500", "Pago"],
    ],
  },
  Documentos: {
    subtitle:
      "Centralize contratos, arquivos de clientes, vendas e documentos internos.",
    label: "Upload",
    metrics: [
      ["Total de arquivos", "128", "no sistema", "blue"],
      ["Vinculados a clientes", "74", "clientes e vendas", "green"],
      ["Arquivos da empresa", "38", "sem cliente", "blue"],
      ["Uploads recentes", "12", "nos últimos 7 dias", "green"],
    ],
    filters: ["Categoria", "Tipo", "Vínculo"],
    tabs: ["Dados", "Vínculos", "Histórico"],
    rows: [
      [
        "4",
        "Contrato_fornecedor.pdf",
        "Empresa",
        "14 jul 2026",
        "PDF",
        "Ativo",
      ],
      ["3", "Recibo_1258.pdf", "Venda", "16 jul 2026", "PDF", "Ativo"],
      ["2", "Comprovante_pix.png", "Venda", "16 jul 2026", "Imagem", "Ativo"],
      ["1", "Contrato_Base.pdf", "Cliente", "17 jul 2026", "PDF", "Ativo"],
      ["5", "Contrato_servico_Bella_Modas.pdf", "Serviço", "18 jul 2026", "PDF", "Ativo"],
      ["6", "Contrato_produto_Vitta.pdf", "Produto", "19 jul 2026", "PDF", "Ativo"],
    ],
  },
  Estoque: {
    subtitle: "Monitore quantidades, entradas, saídas, alertas e responsáveis.",
    label: "Registrar movimentação",
    metrics: [
      ["Produtos em estoque", "218", "itens cadastrados", "blue"],
      ["Estoque crítico", "12", "abaixo do mínimo", "orange"],
      ["Valor em estoque", "R$ 41.800", "valor atual", "blue"],
      ["Entradas no mês", "56", "movimentações", "green"],
    ],
    filters: ["Status", "Categoria", "Responsável"],
    tabs: ["Dados", "Entradas", "Saídas", "Movimentações", "Alertas"],
    rows: [
      [
        "230",
        "Shampoo premium",
        "Produto",
        "18 unidades",
        "16 jul 2026",
        "R$ 89,00",
        "Crítico",
      ],
      [
        "229",
        "Kit de boas-vindas",
        "Produto",
        "42 unidades",
        "15 jul 2026",
        "R$ 150,00",
        "Normal",
      ],
      [
        "228",
        "Peça filtro A",
        "Produto",
        "7 unidades",
        "14 jul 2026",
        "R$ 245,00",
        "Normal",
      ],
      [
        "227",
        "Luva técnica",
        "Produto",
        "0 unidades",
        "12 jul 2026",
        "R$ 32,00",
        "Sem estoque",
      ],
    ],
  },
  CRM: {
    subtitle:
      "Acompanhe comunicações, respostas, resultados e oportunidades comerciais.",
    label: "Nova comunicação",
    metrics: [
      ["Leads ativos", "36", "em acompanhamento", "blue"],
      ["Sem resposta", "8", "precisam de retorno", "orange"],
      ["Conversão", "24%", "nos últimos 30 dias", "green"],
      ["Lucro gerado", "R$ 18.900", "pelo CRM", "green"],
    ],
    filters: ["Canal", "Etapa", "Responsável"],
    tabs: ["Comunicação", "Resposta", "Resultado", "Histórico"],
    rows: [
      [
        "CRM-308",
        "Vitta Clinic",
        "WhatsApp",
        "Hoje, 09:30",
        "Marina",
        "Aguardando",
      ],
      ["CRM-307", "Bella Café", "E-mail", "Ontem, 16:20", "João", "Respondido"],
      [
        "CRM-306",
        "Arco Studio",
        "WhatsApp",
        "14 jul 2026",
        "Carlos",
        "Venda gerada",
      ],
      [
        "CRM-305",
        "PrimePet Store",
        "Outro",
        "12 jul 2026",
        "Marina",
        "Sem resposta",
      ],
    ],
  },
  Assistente: {
    subtitle:
      "Insights automáticos para riscos, oportunidades e próximas ações.",
    label: "Atualizar análise",
    metrics: [
      ["Insights ativos", "12", "recomendações atuais", "blue"],
      ["Oportunidades", "5", "potenciais identificados", "green"],
      ["Riscos", "3", "precisam de atenção", "orange"],
      ["Impacto estimado", "R$ 12.400", "em oportunidades", "green"],
    ],
    filters: ["Área", "Impacto", "Status"],
    tabs: ["Insight", "Evidências", "Ações", "Histórico"],
    rows: [
      [
        "FB-12",
        "Clientes inativos cresceram 12%",
        "Clientes",
        "Hoje",
        "R$ 3.200",
        "Prioridade",
      ],
      [
        "FB-11",
        "Estoque abaixo do mínimo",
        "Estoque",
        "Hoje",
        "R$ 4.800",
        "Atenção",
      ],
      [
        "FB-10",
        "Receita subiu 18,6%",
        "Financeiro",
        "Ontem",
        "R$ 8.600",
        "Positivo",
      ],
      ["FB-09", "Follow-ups pendentes", "CRM", "Ontem", "R$ 2.100", "Atenção"],
    ],
  },
  Manutenção: {
    subtitle:
      "Gerencie equipamentos, custos, manutenções programadas e alertas.",
    label: "Novo equipamento",
    metrics: [
      ["Equipamentos", "42", "cadastrados", "blue"],
      ["Próximas manutenções", "6", "nos próximos 30 dias", "orange"],
      ["Custo no mês", "R$ 5.820", "despesa de manutenção", "orange"],
      ["Em dia", "36", "equipamentos revisados", "green"],
    ],
    filters: ["Status", "Categoria", "Responsável"],
    tabs: ["Equipamento", "Manutenção", "Histórico", "Alertas"],
    rows: [
      [
        "MAN-042",
        "Impressora industrial",
        "Produção",
        "18 jul 2026",
        "R$ 780",
        "Agendada",
      ],
      [
        "MAN-041",
        "Ar-condicionado",
        "Infraestrutura",
        "20 jul 2026",
        "R$ 1.200",
        "Pendente",
      ],
      [
        "MAN-040",
        "Computador caixa",
        "Tecnologia",
        "10 jul 2026",
        "R$ 420",
        "Concluída",
      ],
      [
        "MAN-039",
        "Veículo de entrega",
        "Logística",
        "05 jul 2026",
        "R$ 2.600",
        "Atrasada",
      ],
    ],
  },
  Equipe: {
    subtitle: "Organize membros, cargos, permissões e acessos ao sistema.",
    label: "Adicionar membro",
    metrics: [
      ["Usuários utilizados", "3 / 10", "30% do plano", "blue"],
      ["Administradores", "1", "com acesso total", "blue"],
      ["Membros ativos", "3", "na equipe", "green"],
      ["Convites pendentes", "1", "aguardando aceite", "orange"],
    ],
    filters: ["Cargo", "Status", "Acesso"],
    tabs: ["Dados", "Permissões", "Cargos", "Acessos"],
    rows: [
      ["EQ-003", "Mariana Oliveira", "Gestora", "Hoje", "Total", "Ativo"],
      [
        "EQ-002",
        "João Silva",
        "Consultor de Vendas",
        "Ontem",
        "Comercial",
        "Ativo",
      ],
      ["EQ-001", "Carlos Lima", "Técnico", "14 jul 2026", "Operação", "Ativo"],
    ],
  },
  "Precificação": {
    subtitle: "Calcule preços sustentáveis para produtos e serviços.",
    label: "Nova precificação",
    metrics: [
      ["Itens precificados", "86", "produtos e serviços", "blue"],
      ["Margem média", "41%", "carteira atual", "green"],
      ["A revisar", "7", "custos desatualizados", "orange"],
      ["Última atualização", "Hoje", "às 09:20", "blue"],
    ],
    filters: ["Tipo", "Status"],
    tabs: ["Custos", "Impostos", "Margem", "Preço sugerido", "Histórico"],
    rows: [["PRC-086", "Consultoria estratégica", "Serviço", "Hoje, 09:20", "R$ 1.800", "Calculado"]],
  },
};

Object.assign(modules, {
  Tarefas: {
    subtitle: "Organize pendências, responsáveis e prazos da equipe.",
    label: "Nova tarefa",
    metrics: [["Tarefas abertas", "18", "5 para hoje", "blue"], ["Atrasadas", "3", "precisam de atenção", "orange"], ["Concluídas", "42", "neste mês", "green"], ["Responsáveis", "6", "com tarefas ativas", "blue"]],
    filters: ["Status", "Prioridade", "Responsável"],
    tabs: ["Dados", "Checklist", "Comentários", "Histórico"],
    rows: [["TR-018", "Enviar proposta comercial", "Comercial", "Hoje, 14:00", "Marina", "Em andamento"], ["TR-017", "Validar orçamento", "Financeiro", "Hoje, 16:00", "João", "Pendente"], ["TR-016", "Repor materiais", "Operação", "Amanhã", "Carlos", "Pendente"]],
  },
  Projetos: {
    subtitle: "Acompanhe entregas, etapas e trabalho em equipe.",
    label: "Novo projeto",
    metrics: [["Projetos ativos", "8", "em andamento", "blue"], ["No prazo", "6", "75% da carteira", "green"], ["Em atenção", "2", "com risco de atraso", "orange"], ["Entregas", "12", "neste mês", "blue"]],
    filters: ["Status", "Responsável"], tabs: ["Visão geral", "Tarefas", "Equipe", "Arquivos", "Histórico"],
    rows: [["PR-008", "Implantação Bella Modas", "Cliente", "18 ago 2026", "72% concluído", "Em andamento"], ["PR-007", "Expansão unidade Centro", "Interno", "25 ago 2026", "48% concluído", "Atenção"]],
  },
  Atendimento: {
    subtitle: "Centralize solicitações e acompanhe cada resolução.", label: "Novo atendimento",
    metrics: [["Abertos", "14", "aguardando solução", "blue"], ["Urgentes", "2", "prioridade alta", "orange"], ["Resolvidos", "86", "neste mês", "green"], ["Tempo médio", "2h 18m", "até a resolução", "blue"]],
    filters: ["Status", "Canal", "Responsável"], tabs: ["Atendimento", "Cliente", "Interações", "Histórico"],
    rows: [["AT-214", "Dúvida sobre cobrança", "WhatsApp", "Hoje, 09:12", "Marina", "Em atendimento"], ["AT-213", "Alteração de serviço", "E-mail", "Ontem, 16:40", "João", "Pendente"]],
  },
  Propostas: {
    subtitle: "Crie, acompanhe e converta propostas em vendas.", label: "Nova proposta",
    metrics: [["Em aberto", "12", "R$ 78.300", "blue"], ["Aguardando resposta", "5", "precisam de retorno", "orange"], ["Aprovadas", "18", "neste mês", "green"], ["Conversão", "38%", "últimos 30 dias", "green"]],
    filters: ["Status", "Validade", "Responsável"], tabs: ["Dados", "Itens", "Condições", "Documento", "Histórico"],
    rows: [["PROP-128", "Bella Modas", "Serviços", "Hoje", "R$ 8.400", "Enviada"], ["PROP-127", "Vitta Clinic", "Produtos e serviços", "Ontem", "R$ 12.800", "Aguardando"]],
  },
  "Ordens de Serviço": {
    subtitle: "Controle execução, equipe, materiais e prazos dos serviços.", label: "Nova ordem de serviço",
    metrics: [["Em execução", "9", "serviços ativos", "blue"], ["Atrasadas", "2", "requerem ação", "orange"], ["Concluídas", "34", "neste mês", "green"], ["Aguardando peças", "3", "ordens pausadas", "orange"]],
    filters: ["Status", "Responsável", "Prazo"], tabs: ["Serviço", "Cliente", "Equipe", "Materiais", "Histórico"],
    rows: [["OS-1024", "Instalação de balcão", "Instalação", "Hoje, 14:00", "João Paulo", "Em execução"], ["OS-1021", "Manutenção preventiva", "Manutenção", "Ontem", "Carlos", "Atrasada"]],
  },
  Compras: {
    subtitle: "Planeje compras, aprovações e recebimentos.", label: "Novo pedido de compra",
    metrics: [["Pedidos abertos", "7", "em andamento", "blue"], ["Aprovação", "2", "aguardando decisão", "orange"], ["A receber", "4", "entregas previstas", "blue"], ["Comprado no mês", "R$ 18.920", "total aprovado", "green"]],
    filters: ["Status", "Fornecedor", "Entrega"], tabs: ["Pedido", "Itens", "Fornecedor", "Recebimento", "Histórico"],
    rows: [["PC-087", "Reposição de materiais", "Tech Solutions", "18 ago 2026", "R$ 4.280", "Aprovado"], ["PC-086", "Produtos de limpeza", "Casa Norte", "20 ago 2026", "R$ 890", "Pendente"]],
  },
  Fornecedores: {
    subtitle: "Gerencie parceiros, condições e histórico de compras.", label: "Novo fornecedor",
    metrics: [["Fornecedores ativos", "38", "cadastrados", "blue"], ["Compras no mês", "R$ 18.920", "valor acumulado", "green"], ["Com pendências", "3", "documentos ou entregas", "orange"], ["Categorias", "12", "grupos de fornecimento", "blue"]],
    filters: ["Categoria", "Status"], tabs: ["Dados", "Compras", "Financeiro", "Documentos", "Histórico"],
    rows: [["FOR-038", "Tech Solutions", "Equipamentos", "12 ago 2026", "R$ 24.300", "Ativo"], ["FOR-037", "Casa Norte", "Suprimentos", "10 ago 2026", "R$ 8.950", "Ativo"]],
  },
});
// Clientes usa a mesma navegação detalhada dos demais módulos, mantendo os dados em subabas próprias.
modules["Clientes"] = {
  subtitle: "Gerencie e acompanhe seus clientes e seu relacionamento.",
  label: "Cadastrar cliente",
  metrics: [],
  filters: ["Status", "Tipo"],
  tabs: [
    "Dados",
    "Histórico",
    "Vendas",
    "Financeiro",
    "Documentos",
    "Observações",
  ],
  rows: clients,
};

/** Conteúdo específico do cliente: cada aba usa o formato adequado ao tipo de informação. */
function ClientDetailContent({ tab, record }: { tab: string; record: string[] }) {
  const [observation, setObservation] = useState("Cliente com potencial para novos serviços no próximo trimestre.");
  const [clientPhoto, setClientPhoto] = useState<string | null>(null);
  const email = `${record[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".")}@email.com.br`;
  const history = [
    ["23/05/2025 · 14:20", "Venda realizada", "Pedido #VND-1278 concluído no valor de R$ 3.250,00."],
    ["21/05/2025 · 10:15", "Follow-up registrado", "Mariana Oliveira entrou em contato por WhatsApp."],
    ["16/05/2025 · 09:40", "Documento enviado", "Contrato de prestação de serviço anexado."],
    ["12/05/2025 · 16:00", "Pagamento recebido", "Pagamento via Pix confirmado."],
    ["10/05/2025 · 11:30", "Cadastro atualizado", "Telefone e origem do cliente revisados."],
  ];
  const sales = [
    ["#VND-1278", "23/05/2025", "R$ 3.250,00", "Concluída"],
    ["#VND-1264", "15/05/2025", "R$ 12.800,00", "Pendente"],
    ["#SRV-2311", "08/05/2025", "R$ 2.700,00", "Em andamento"],
  ];
  const documents = [
    ["Contrato_assinado.pdf", "Contrato", "23/05/2025"],
    ["Comprovante_pix.pdf", "Comprovante", "12/05/2025"],
    ["Proposta_comercial.pdf", "Proposta", "08/05/2025"],
  ];
  if (tab === "Dados") return (
    <DetailPanel eyebrow="CLIENTES · DADOS" title="Dados do cadastro" description="Informações de contato, identificação e origem deste cliente.">
      <section className="v2-client-photo-editor">
        <div className="v2-client-photo-preview">
          {clientPhoto ? <img src={clientPhoto} alt={`Foto de ${record[1]}`} /> : <UserRound size={34} strokeWidth={1.6} />}
        </div>
        <div>
          <strong>Foto do cliente</strong>
          <small>Use uma foto ou mantenha o ícone padrão.</small>
        </div>
        <label>
          <Edit3 size={15} /> Editar foto
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setClientPhoto(URL.createObjectURL(file));
            }}
          />
        </label>
      </section>
      <div className="v2-detail-fields">{[["ID", record[0]], ["Nome", record[1]], ["CPF/CNPJ", record[2].includes("Jurídica") ? "27.456.789/0001-33" : "123.456.789-10"], ["E-mail", email], ["Telefone / WhatsApp", "(92) 98422-1200"], ["Endereço", "Rua das Palmeiras, 250 · Centro"], ["Origem", "Instagram · campanha de maio"], ["Último contato", record[3]]].map(([label, value]) => <DetailField key={label} label={label} value={value} />)}</div>
    </DetailPanel>
  );
  // O histórico é uma linha do tempo: evento à esquerda e data/hora sempre alinhadas à direita.
  if (tab === "Histórico") return <DetailPanel eyebrow="CLIENTES · HISTÓRICO" title="Histórico de relacionamento" description="Eventos, movimentações e alterações registradas para este cliente."><div className="v2-detail-list v2-history-list">{history.map(([date, title, description], index) => <article key={date}><i className={`history-dot dot-${index}`} /><div><strong>{title}</strong><small>{description}</small></div><time>{date}</time></article>)}</div></DetailPanel>;
  if (tab === "Vendas") return <DetailPanel eyebrow="CLIENTES · VENDAS" title="Vendas, pedidos e serviços" description="Operações relacionadas a este cliente." action="Registrar nova venda"><div className="v2-detail-list v2-history-list v2-timeline-list">{sales.map(([id, date, value, status], index) => <article key={id}><i className={`history-dot dot-${index}`} /><div><strong>Venda {id}</strong><small>{value} · {status}</small></div><time>{date}</time></article>)}</div></DetailPanel>;
  if (tab === "Financeiro") return <DetailPanel eyebrow="CLIENTES · FINANCEIRO" title="Resumo financeiro" description="Pagamentos, pendências e contas a receber deste cliente." action="Registrar pagamento"><section className="v2-client-financial-summary"><DetailField label="Valores pagos" value="R$ 24.850,00" /><DetailField label="Valores pendentes" value="R$ 12.800,00" /><DetailField label="Contas a receber" value="R$ 8.400,00" /></section><div className="v2-detail-list v2-history-list v2-timeline-list"><article><i className="history-dot dot-3" /><div><strong>Pagamento recebido</strong><small>Pix · Venda #VND-1278 · R$ 3.250,00</small></div><time>23/05/2025</time></article><article><i className="history-dot dot-1" /><div><strong>Conta a receber</strong><small>Boleto · Venda #VND-1264 · R$ 12.800,00</small></div><time>15/05/2025</time></article></div></DetailPanel>;
  if (tab === "Documentos") return <DetailPanel eyebrow="CLIENTES · DOCUMENTOS" title="Documentos do cliente" description="Arquivos enviados e vinculados a este cadastro."><div className="v2-detail-list v2-history-list v2-timeline-list">{documents.map(([name, type, date], index) => <article key={name}><i className={`history-dot dot-${index}`} /><div><strong>{name}</strong><small>{type} · enviado em {date}</small></div><time>{date}</time></article>)}</div></DetailPanel>;
  return <DetailPanel eyebrow="CLIENTES · OBSERVAÇÕES" title="Observações" description="Notas internas sobre este cliente."><textarea className="v2-client-observation" value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Escreva uma observação sobre o cliente..." /><footer className="v2-client-observation-actions"><button className="v2-primary">Salvar observação</button></footer></DetailPanel>;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return <article><span>{label}</span><strong>{value}</strong></article>;
}

function DetailPanel({ eyebrow, title, description, action, children }: { eyebrow: string; title: string; description: string; action?: string; children: ReactNode }) {
  return <article className="v2-card v2-full-detail-content v2-client-detail-specific"><header><div><small>{eyebrow}</small><h2>{title}</h2><p>{description}</p></div>{action && <button className="v2-primary"><Plus size={16} />{action}</button>}</header>{children}</article>;
}

/** Página de detalhe compartilhada: mantém o fluxo de página inteira usado em Clientes. */
function FullDetailView({
  view,
  record,
  onBack,
}: {
  view: string;
  record: string[];
  onBack: () => void;
}) {
  const config = modules[view] ?? modules["Vendas"];
  const [tab, setTab] = useState(config.tabs[0]);
  const contents: Record<
    string,
    { title: string; description: string; items: [string, string][] }
  > = {
    Dados: {
      title: "Dados do cadastro",
      description: "Informações principais e identificação deste registro.",
      items: [
        ["ID", record[0]],
        ["Nome", record[1]],
        ["Categoria / tipo", record[2]],
        ["Status", record[5]],
      ],
    },
    Histórico: {
      title: "Histórico",
      description:
        "Alterações, movimentações e responsáveis relacionados a este cadastro.",
      items: [
        ["Criado em", "10/07/2026 às 09:20"],
        ["Última atualização", record[3]],
        ["Responsável", "Mariana Oliveira"],
        ["Alteração recente", "Dados revisados pela equipe"],
      ],
    },
    Vendas: {
      title: "Vendas relacionadas",
      description: "Pedidos e serviços vinculados a este registro.",
      items: [
        ["Venda #VND-1278", "R$ 3.250,00 · Concluída"],
        ["Venda #VND-1264", "R$ 12.800,00 · Pendente"],
        ["Total vinculado", record[4]],
        ["Último pedido", record[3]],
      ],
    },
    Financeiro: {
      title: "Financeiro",
      description: "Valores, pagamentos e lançamentos vinculados.",
      items: [
        ["Valor atual", record[4]],
        ["Status financeiro", record[5]],
        ["Forma de pagamento", "Pix"],
        ["Última movimentação", record[3]],
      ],
    },
    Parcelas: {
      title: "Parcelas e vencimentos",
      description:
        "Cronograma de parcelas, vencimentos e situação de cada cobrança.",
      items: [
        ["Parcela atual", "1 de 3"],
        ["Vencimento", record[3]],
        ["Valor da parcela", record[4]],
        ["Situação", record[5]],
      ],
    },
    Documentos: {
      title: "Documentos",
      description: "Arquivos e comprovantes associados ao cadastro.",
      items: [
        ["Contrato principal", "Contrato_assinado.pdf"],
        ["Comprovante", "Recibo_2026.pdf"],
        ["Último upload", record[3]],
        ["Responsável", "Mariana Oliveira"],
      ],
    },
    Vínculos: {
      title: "Vínculos do documento",
      description:
        "Relações deste arquivo com cliente, venda, serviço e registros internos.",
      items: [
        [
          "Cliente vinculado",
          record[2] === "Cliente" ? "Cliente cadastrado" : "Não vinculado",
        ],
        [
          "Venda / serviço",
          record[2] === "Venda" ? "Venda relacionada" : "Não se aplica",
        ],
        ["Categoria", record[2]],
        ["Tipo de arquivo", record[4]],
      ],
    },
    Observações: {
      title: "Observações",
      description: "Notas internas e contexto relevante para a equipe.",
      items: [
        ["Observação atual", "Cadastro acompanhado pela equipe comercial."],
        ["Próximo contato", "Em até 7 dias"],
        ["Responsável", "Mariana Oliveira"],
        ["Visibilidade", "Interna"],
      ],
    },
    Itens: {
      title: "Itens",
      description: "Produtos e serviços incluídos nesta operação.",
      items: [
        ["Item principal", record[1]],
        ["Quantidade", "1 unidade"],
        ["Valor", record[4]],
        ["Atualização", record[3]],
      ],
    },
    Pagamento: {
      title: "Pagamento",
      description: "Dados de cobrança e recebimento desta operação.",
      items: [
        ["Valor", record[4]],
        ["Status", record[5]],
        ["Forma", "Pix"],
        ["Vencimento", record[3]],
      ],
    },
    Comprovantes: {
      title: "Comprovantes",
      description: "Comprovantes e anexos da operação.",
      items: [
        ["Comprovante principal", "Comprovante_pix.pdf"],
        ["Status", "Disponível"],
        ["Data", record[3]],
        ["Responsável", "Mariana Oliveira"],
      ],
    },
    "Recibo / PDF": {
      title: "Recibo / PDF",
      description: "Documentos gerados para compartilhar ou imprimir.",
      items: [
        ["Recibo", "REC-2026-01258"],
        ["Documento", "Pedido_1258.pdf"],
        ["Emissão", record[3]],
        ["Situação", "Pronto para download"],
      ],
    },
    Preço: {
      title: "Preço",
      description: "Valores, margem e condições comerciais.",
      items: [
        ["Preço atual", record[4]],
        ["Tabela", "Preço padrão"],
        ["Margem estimada", "42%"],
        ["Atualização", record[3]],
      ],
    },
    Estoque: {
      title: "Estoque",
      description: "Quantidade, mínimo e disponibilidade.",
      items: [
        ["Quantidade atual", record[2]],
        ["Status", record[5]],
        ["Responsável", "Carlos Lima"],
        ["Última movimentação", record[3]],
      ],
    },
    Categorias: {
      title: "Categorias",
      description: "Classificação e agrupamentos deste item.",
      items: [
        ["Categoria", record[2]],
        ["Subcategoria", "Geral"],
        ["Visibilidade", "Ativa"],
        ["Atualização", record[3]],
      ],
    },
    Entradas: {
      title: "Entradas",
      description: "Entradas registradas para este item.",
      items: [
        ["Última entrada", record[3]],
        ["Quantidade", "20 unidades"],
        ["Responsável", "Carlos Lima"],
        ["Documento", "ENT-2026-019"],
      ],
    },
    Saídas: {
      title: "Saídas",
      description: "Saídas e reservas realizadas.",
      items: [
        ["Última saída", record[3]],
        ["Quantidade", "4 unidades"],
        ["Motivo", "Venda / serviço"],
        ["Responsável", "Mariana Oliveira"],
      ],
    },
    Movimentações: {
      title: "Movimentações",
      description: "Histórico de entradas, saídas e ajustes.",
      items: [
        ["Movimentação recente", "Saída para venda"],
        ["Data", record[3]],
        ["Responsável", "Carlos Lima"],
        ["Saldo", record[2]],
      ],
    },
    Alertas: {
      title: "Alertas",
      description: "Alertas operacionais e recomendações.",
      items: [
        ["Status", record[5]],
        ["Alerta atual", "Revisar antes do próximo período"],
        ["Prioridade", "Média"],
        ["Responsável", "Mariana Oliveira"],
      ],
    },
    Comunicação: {
      title: "Comunicação",
      description: "Dados do contato feito com cliente ou lead.",
      items: [
        ["Canal", record[2]],
        ["Cliente", record[1]],
        ["Data / hora", record[3]],
        ["Responsável", record[4]],
      ],
    },
    Resposta: {
      title: "Resposta",
      description: "Retorno registrado pelo cliente.",
      items: [
        ["Situação", record[5]],
        ["Última resposta", record[3]],
        ["Canal", record[2]],
        ["Responsável", record[4]],
      ],
    },
    Resultado: {
      title: "Resultado",
      description: "Impacto comercial e resultado desta comunicação.",
      items: [
        ["Resultado", record[5]],
        ["Valor gerado", record[4]],
        ["Próxima ação", "Agendar follow-up"],
        ["Responsável", record[4]],
      ],
    },
    Insight: {
      title: "Análise automática",
      description: "Análise criada pelo Assistente Gest para apoiar decisões.",
      items: [
        ["Insight", record[1]],
        ["Área", record[2]],
        ["Impacto", record[4]],
        ["Status", record[5]],
      ],
    },
    Evidências: {
      title: "Evidências",
      description: "Dados utilizados para gerar esta recomendação.",
      items: [
        ["Base analisada", "Últimos 90 dias"],
        ["Última atualização", record[3]],
        ["Confiabilidade", "Alta"],
        ["Área", record[2]],
      ],
    },
    Ações: {
      title: "Ações recomendadas",
      description: "Próximas ações sugeridas para este insight.",
      items: [
        ["Ação sugerida", "Criar campanha de reativação"],
        ["Impacto estimado", record[4]],
        ["Prioridade", record[5]],
        ["Responsável", "Mariana Oliveira"],
      ],
    },
    Equipamento: {
      title: "Equipamento",
      description: "Dados e identificação do equipamento.",
      items: [
        ["Equipamento", record[1]],
        ["Categoria", record[2]],
        ["Status", record[5]],
        ["Responsável", "Carlos Lima"],
      ],
    },
    Manutenção: {
      title: "Manutenção",
      description: "Agendamentos, custos e atividades de manutenção.",
      items: [
        ["Próxima manutenção", record[3]],
        ["Custo", record[4]],
        ["Status", record[5]],
        ["Responsável", "Carlos Lima"],
      ],
    },
    Permissões: {
      title: "Permissões",
      description: "Permissões concedidas a este membro.",
      items: [
        ["Perfil", record[2]],
        ["Acesso comercial", "Permitido"],
        ["Acesso financeiro", "Limitado"],
        ["Última revisão", record[3]],
      ],
    },
    Cargos: {
      title: "Cargo",
      description: "Cargo e responsabilidades do membro.",
      items: [
        ["Cargo", record[2]],
        ["Área", "Operação"],
        ["Status", record[5]],
        ["Gestor", "Mariana Oliveira"],
      ],
    },
    Acessos: {
      title: "Acessos",
      description: "Registro de acessos e dispositivos.",
      items: [
        ["Último acesso", record[3]],
        ["Dispositivo", "Navegador web"],
        ["Status", record[5]],
        ["Autenticação", "Ativa"],
      ],
    },
  };
  const content = contents[tab] ?? contents["Dados"];
  const clientRank = view === "Clientes" ? getClientRanking(record[0]) : null;
  // Mantém todas as subabas completas, sem repetir o mesmo conteúdo entre módulos.
  const detailedItems = [
    ...content.items,
    ["Responsável pelo registro", "Mariana Oliveira"],
    ["Última sincronização", "Hoje, 09:20"],
  ].slice(0, 6);
  return (
    <>
      <button className="v2-back" onClick={onBack}>
        ←　Voltar
      </button>
      <div className="v2-detail-head">
        <div>
          <h1>
            {record[1]}
            {clientRank && (
              <span
                className={`client-rank-seal ${clientRank.tier}`}
                title={`Ranking #${clientRank.ranking} · ${clientRank.label}`}
                aria-label={`Ranking número ${clientRank.ranking}`}
              >
                <Medal size={15} aria-hidden="true" />
                <strong>#{clientRank.ranking}</strong>
              </span>
            )}
          </h1>
          <p>
            {view} · ID {record[0]}
          </p>
        </div>
        <div>
          <button className="danger">
            <Trash2 size={17} />
            Excluir
          </button>
        </div>
      </div>
      <nav className="v2-tabs v2-full-tabs">
        {config.tabs.map((item) => (
          <button
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <section className="v2-metrics detail-metrics">
        <Metric
          label="Status atual"
          value={record[5]}
          detail="registro atualizado"
          tone={
            /Ativo|Paga|Pago|Recebido|Concluída|Normal/.test(record[5])
              ? "green"
              : "orange"
          }
        />
        <Metric
          label="Valor / referência"
          value={record[4]}
          detail="informação vinculada"
        />
        <Metric
          label="Última atualização"
          value={record[3]}
          detail="dados registrados"
        />
        <Metric
          label="Responsável"
          value="Mariana"
          detail="equipe Gest"
          tone="green"
        />
      </section>
      {/* Clientes possui uma ficha própria: cada aba usa o formato mais útil para sua informação. */}
      {view === "Clientes" ? (
        <ClientDetailContent tab={tab} record={record} />
      ) : (
      <article className="v2-card v2-full-detail-content">
        <header>
          <div>
            <small>
              {view.toUpperCase()} · {tab.toUpperCase()}
            </small>
            <h2>{content.title}</h2>
            <p>{content.description}</p>
          </div>
          <button className="v2-primary">
            <Edit3 size={16} />
            Editar {tab.toLowerCase()}
          </button>
        </header>
        <div>
          {detailedItems.map((item) => (
            <article key={item[0]}>
              <span>{item[0]}</span>
              <strong>{item[1]}</strong>
            </article>
          ))}
        </div>
      </article>
      )}
    </>
  );
}

function FullModuleView({ view }: { view: View }) {
  const config = modules[view] ?? modules["Vendas"];
  const [selected, setSelected] = useState<string[] | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Mais recentes");
  const [chartPeriod, setChartPeriod] = useState("30 dias");
  if (selected)
    return (
      <FullDetailView
        view={view}
        record={selected}
        onBack={() => setSelected(null)}
      />
    );
  const rows = [...config.rows]
    .filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) =>
      sort === "A–Z"
        ? a[1].localeCompare(b[1])
        : sort === "Z–A"
          ? b[1].localeCompare(a[1])
          : 0,
    );
  return (
    <>
      <PageIntro title={view} subtitle={config.subtitle} />
      <section className="v2-metrics client-metrics">
        {config.metrics.map((metric) => (
          <Metric
            key={metric[0]}
            label={metric[0]}
            value={metric[1]}
            detail={metric[2]}
            tone={metric[3]}
          />
        ))}
      </section>
      <article className={`v2-card v2-client-table v2-module-table${view === "Equipe" ? " v2-team-table" : ""}`}>
        <header>
          <div className="v2-local-search">
            <Search size={19} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Buscar em ${view.toLowerCase()}...`}
            />
          </div>
          {config.filters.map((filter) => (
            <label key={filter}>
              {filter}
              <select>
                <option>Todos</option>
              </select>
            </label>
          ))}
          <label>
            Ordenar por
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option>Mais recentes</option>
              <option>A–Z</option>
              <option>Z–A</option>
            </select>
          </label>
          <button className="v2-primary">
            <Plus size={17} />
            {config.label}
          </button>
        </header>
        <table>
          <thead>
            <tr>
              {[
                "ID",
                "Registro",
                view === "Equipe"
                  ? "Cargo"
                  : view === "Estoque"
                    ? "Quantidade"
                    : view === "Manutenção" || view === "Catálogo"
                      ? "Categoria"
                      : view === "Vendas"
                        ? "Pagamento"
                        : view === "CRM"
                          ? "Origem"
                          : view === "Assistente"
                            ? "Área"
                            : "Tipo",
                "Atualização",
                "Valor / referência",
                "Status",
                "Ações",
              ].map((item) => (
                <th key={item}>{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>
                  <strong>{row[1]}</strong>
                </td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
                <td>{row[4]}</td>
                <td>
                  <span
                    className={
                      /Ativo|Paga|Pago|Recebido|Concluída|Normal|Respondido|Positivo/.test(
                        row[5],
                      )
                        ? "status active"
                        : /Crítico|Atrasada|Sem estoque|Prioridade/.test(row[5])
                          ? "status inactive"
                          : "status warn"
                    }
                  >
                    {row[5]}
                  </span>
                </td>
                <td>
                  <button onClick={() => setSelected(row)}>Ver detalhes</button>
                  <Edit3 size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <footer>
          Mostrando {rows.length} registros{" "}
          <div className="pagination">
            <button>‹</button>
            <b>1</b>
            <button>2</button>
            <button>›</button>
          </div>
        </footer>
      </article>
      {view === "Manutenção" && (
        <article className="v2-card v2-module-chart maintenance-chart-below">
          <header><div><h2>Custo de manutenção</h2><p>Despesas de manutenção por período.</p></div><div className="v2-segment">{["30 dias", "3 meses", "6 meses", "12 meses"].map((item) => <button key={item} className={chartPeriod === item ? "selected" : ""} onClick={() => setChartPeriod(item)}>{item}</button>)}</div></header>
          <Chart title="custo de manutenção" period={chartPeriod} />
        </article>
      )}
    </>
  );
}

function ModuleDirectory({ view }: { view: View }) {
  const config = modules[view] ?? modules["Vendas"];
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Mais recentes");
  const [selected, setSelected] = useState<string[] | null>(null);
  const [dialog, setDialog] = useState<"new" | "edit" | null>(null);
  const [tab, setTab] = useState(config.tabs[0]);
  const rows = [...config.rows]
    .filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) =>
      sort === "A–Z"
        ? a[1].localeCompare(b[1])
        : sort === "Z–A"
          ? b[1].localeCompare(a[1])
          : sort === "Maior valor"
            ? b[4].localeCompare(a[4])
            : 0,
    );
  return (
    <>
      <PageIntro title={view} subtitle={config.subtitle} />
      <section className="v2-metrics client-metrics">
        {config.metrics.map((metric) => (
          <Metric
            key={metric[0]}
            label={metric[0]}
            value={metric[1]}
            detail={metric[2]}
            tone={metric[3]}
          />
        ))}
      </section>
      {view === "Manutenção" && (
        <article className="v2-card v2-module-chart">
          <header>
            <div>
              <h2>Custo de manutenção</h2>
              <p>Despesas de manutenção no período selecionado.</p>
            </div>
            <select>
              <option>Últimos 6 meses</option>
            </select>
          </header>
          <Chart title="custo de manutenção" />
        </article>
      )}
      <article className={`v2-card v2-client-table v2-module-table${view === "Equipe" ? " v2-team-table" : ""}`}>
        <header>
          <div className="v2-local-search">
            <Search size={19} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Buscar em ${view.toLowerCase()}...`}
            />
          </div>
          {config.filters.map((filter) => (
            <label key={filter}>
              {filter}
              <select>
                <option>Todos</option>
              </select>
            </label>
          ))}
          <label>
            Ordenar por
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>Mais recentes</option>
              <option>Mais antigos</option>
              <option>A–Z</option>
              <option>Z–A</option>
              <option>Maior valor</option>
              <option>Menor valor</option>
            </select>
          </label>
          <button className="v2-primary" onClick={() => setDialog("new")}>
            <Plus size={17} />
            {config.label}
          </button>
        </header>
        <table>
          <thead>
            <tr>
              {[
                "ID",
                "Registro",
                "Categoria / tipo",
                "Atualização",
                "Valor / referência",
                "Status",
                "Ações",
              ].map((item) => (
                <th key={item}>{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>
                  <strong>{row[1]}</strong>
                </td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
                <td>{row[4]}</td>
                <td>
                  <span
                    className={
                      /Ativo|Paga|Pago|Recebido|Concluída|Normal|Respondido|Positivo/.test(
                        row[5],
                      )
                        ? "status active"
                        : /Crítico|Atrasada|Sem estoque|Prioridade/.test(row[5])
                          ? "status inactive"
                          : "status warn"
                    }
                  >
                    {row[5]}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => {
                      setSelected(row);
                      setTab(config.tabs[0]);
                    }}
                  >
                    Ver detalhes
                  </button>
                  <button
                    className="v2-icon-button"
                    onClick={() => {
                      setSelected(row);
                      setDialog("edit");
                    }}
                    aria-label="Editar registro"
                  >
                    <Edit3 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <footer>
          Mostrando {rows.length} registros{" "}
          <div className="pagination">
            <button>‹</button>
            <b>1</b>
            <button>2</button>
            <button>›</button>
          </div>
        </footer>
      </article>
      {selected && (
        <aside className="v2-record-drawer">
          <div className="v2-drawer-card">
            <button className="close" onClick={() => setSelected(null)}>
              <X />
            </button>
            <small>
              {view.toUpperCase()} · {selected[0]}
            </small>
            <h2>{selected[1]}</h2>
            <nav className="v2-tabs">
              {config.tabs.map((item) => (
                <button
                  key={item}
                  className={tab === item ? "active" : ""}
                  onClick={() => setTab(item)}
                >
                  {item}
                </button>
              ))}
            </nav>
            <section className="v2-record-content">
              <h3>{tab}</h3>
              <p>
                {tab === "Histórico"
                  ? "Registro de alterações, responsáveis e datas desta operação."
                  : tab === "Alertas"
                    ? "Alertas ativos e orientações relacionadas a este registro."
                    : `Informações completas de ${tab.toLowerCase()} para este cadastro.`}
              </p>
              <dl>
                <dt>Status</dt>
                <dd>{selected[5]}</dd>
                <dt>Última atualização</dt>
                <dd>{selected[3]}</dd>
                <dt>Responsável</dt>
                <dd>Mariana Oliveira</dd>
                <dt>Observações</dt>
                <dd>Dados demonstrativos prontos para edição.</dd>
              </dl>
            </section>
            <footer>
              <button onClick={() => setDialog("edit")}>
                <Edit3 size={16} />
                Editar
              </button>
              <button className="danger">
                <Trash2 size={16} />
                Excluir
              </button>
            </footer>
          </div>
        </aside>
      )}
      {dialog && (
        <RecordDialog
          title={
            dialog === "new"
              ? config.label
              : `Editar ${selected?.[1] ?? "registro"}`
          }
          onClose={() => setDialog(null)}
          onSave={() => setDialog(null)}
          fields={[
            "Nome / título",
            "Categoria",
            "Responsável",
            "Data",
            "Valor",
            "Descrição",
          ]}
        />
      )}
    </>
  );
}

function RecordDialog({
  title,
  onClose,
  onSave,
  fields,
}: {
  title: string;
  onClose: () => void;
  onSave: (values: Record<string, string>) => void;
  fields: string[];
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <aside className="v2-record-drawer">
      <form
        className="v2-dialog"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(values);
        }}
      >
        <button type="button" className="close" onClick={onClose}>
          <X />
        </button>
        <small>CADASTRO</small>
        <h2>{title}</h2>
        <div>
          {fields.map((field, index) => (
            <label key={field}>
              {field}
              {field === "Descrição" ? (
                <textarea required placeholder={`Informe ${field.toLowerCase()}`} value={values[field] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} />
              ) : (
                <input required placeholder={field} value={values[field] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} />
              )}
            </label>
          ))}
        </div>
        <footer>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="v2-primary" type="submit">
            Salvar alterações
          </button>
        </footer>
      </form>
    </aside>
  );
}

function ReportsView() {
  const [type, setType] = useState("Vendas");
  const [indicator, setIndicator] = useState("Faturamento");
  const [crosses, setCrosses] = useState<string[]>([]);
  const options: Record<string, string[]> = {
    Vendas: ["Quantidade", "Lucro", "Faturamento"],
    Clientes: ["Quantidade", "Faixa etária", "Sexo"],
    Estoque: ["Quantidade", "Valor do estoque"],
    Manutenção: ["Quantidade", "Custo"],
    Financeiro: ["Receita", "Lucro", "Despesa"],
    Catálogo: ["Quantidade"],
    Agenda: ["Quantidade de atividades"],
    CRM: ["Quantidade por etapa"],
  };
  const crossing = [
    "Financeiro · Receita",
    "Financeiro · Despesa",
    "Clientes · Quantidade",
    "CRM · Qtd. por etapa",
    "Agenda · Qtd. atividades",
    "Manutenção · Custo",
  ];
  const toggle = (item: string) =>
    setCrosses((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item],
    );
  return (
    <>
      <PageIntro
        title="Relatórios"
        subtitle="Analise dados do negócio e compare indicadores em um único lugar."
      />
      <article className="v2-card v2-reports">
        <header>
          <div>
            <small>RELATÓRIOS</small>
            <h2>Visão consolidada</h2>
          </div>
          <button className="v2-primary">
            <FileText size={16} />
            Exportar PDF
          </button>
        </header>
        <div className="v2-report-filters">
          <label>
            Período
            <select>
              <option>Últimos 30 dias</option>
              <option>3 meses</option>
              <option>6 meses</option>
              <option>12 meses</option>
            </select>
          </label>
          <label>
            Tipo
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setIndicator(options[e.target.value][0]);
              }}
            >
              {Object.keys(options).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Indicador
            <select
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
            >
              {options[type].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="v2-cross">
          <span>Cruzar com</span>
          {crossing.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={crosses.includes(item)}
                onChange={() => toggle(item)}
              />
              {item}
            </label>
          ))}
        </div>
        <article className="v2-card v2-report-chart">
          <header>
            <div>
              <small>
                {type.toUpperCase()} · {indicator.toUpperCase()}
              </small>
              <h2>{indicator === "Quantidade" ? "1.248" : "R$ 73 mil"}</h2>
            </div>
            <span>
              {[`${type} · ${indicator}`, ...crosses].map((item, index) => (
                <i className={`legend-${index}`} key={item}>
                  ● {item}
                </i>
              ))}
            </span>
          </header>
          <ComparisonChart labels={[`${type} · ${indicator}`, ...crosses]} />
        </article>
      </article>
    </>
  );
}

/** Linhas comparáveis para os relatórios. O olho mostra valores sem poluir o gráfico. */
function ComparisonChart({ labels }: { labels: string[] }) {
  const data = [
    { name: "Mar", Lucro: 46200, Transações: 38 },
    { name: "Abr", Lucro: 54800, Transações: 44 },
    { name: "Mai", Lucro: 51200, Transações: 41 },
    { name: "Jun", Lucro: 63800, Transações: 49 },
    { name: "Jul", Lucro: 58600, Transações: 46 },
    { name: "Ago", Lucro: 73100, Transações: 55 },
  ];
  return <div className="report-finance-chart">
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 16, right: 24, left: 4, bottom: 2 }}>
        <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#dfe8f3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis yAxisId="money" width={72} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${Math.round(Number(value) / 1000)} mil`} />
        <YAxis yAxisId="count" orientation="right" width={32} allowDecimals={false} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value, name) => name === "Lucro" ? Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : `${value} transações`} />
        <Legend iconType="circle" iconSize={8} formatter={(value) => value === "Lucro" ? labels[0] : "Transações"} />
        <Area yAxisId="money" type="monotone" dataKey="Lucro" stroke="#0a58ad" fill="#dcecff" strokeWidth={3} />
        <Line yAxisId="count" type="monotone" dataKey="Transações" stroke="#8b5cc7" strokeWidth={3} dot={{ r: 4, fill: "#8b5cc7" }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  </div>;
}

function ClientDetailPage({
  onBack,
  record,
}: {
  onBack: () => void;
  record?: string[];
}) {
  const client = clients[0];
  return (
    <FullDetailView
      view="Clientes"
      record={
        record ?? [
          client[0],
          client[2],
          client[4],
          client[5],
          client[7],
          client[8],
        ]
      }
      onBack={onBack}
    />
  );
}

/** Documentos em cartões para facilitar a leitura visual do conteúdo e seus vínculos. */
function DocumentCards({
  rows,
  query,
  sort,
  onQuery,
  onSort,
  onView,
  onEdit,
  onNew,
}: {
  rows: string[][];
  query: string;
  sort: string;
  onQuery: (value: string) => void;
  onSort: (value: string) => void;
  onView: (row: string[]) => void;
  onEdit: (row: string[]) => void;
  onNew: () => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    try {
      setOrder(JSON.parse(window.localStorage.getItem("gest-document-order") || "[]"));
    } catch {
      setOrder([]);
    }
  }, []);

  const orderedRows = [...rows].sort((a, b) => {
    const aIndex = order.indexOf(a[0]);
    const bIndex = order.indexOf(b[0]);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const moveDocument = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const ids = orderedRows.map((row) => row[0]);
    const next = ids.filter((id) => id !== draggedId);
    next.splice(next.indexOf(targetId), 0, draggedId);
    setOrder(next);
    window.localStorage.setItem("gest-document-order", JSON.stringify(next));
    setDraggedId(null);
  };

  const descriptionFor = (row: string[]) =>
    row[2] === "Serviço" ? "Contrato de prestação de serviço vinculado ao cliente e à operação." :
      row[2] === "Produto" ? "Contrato comercial de fornecimento ou venda de produto." :
        row[1].toLowerCase().includes("recibo") ? "Recibo financeiro vinculado à venda e ao atendimento realizado." :
          row[1].toLowerCase().includes("comprovante") ? "Comprovante de pagamento vinculado ao registro financeiro." :
            "Documento organizado e pronto para consulta.";

  return (
    <article className="v2-card shelf-document-directory">
      <header className="shelf-document-toolbar">
        <div className="v2-local-search">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Buscar em documentos..."
          />
        </div>
        <label>
          Categoria
          <select>
            <option>Todos</option>
          </select>
        </label>
        <label>
          Tipo
          <select>
            <option>Todos</option>
          </select>
        </label>
        <label>
          Vínculo
          <select>
            <option>Todos</option>
          </select>
        </label>
        <label>
          Ordenar por
          <select value={sort} onChange={(event) => onSort(event.target.value)}>
            <option>Mais recentes</option>
            <option>Mais antigos</option>
            <option>A–Z</option>
            <option>Z–A</option>
          </select>
        </label>
        <button className="v2-primary" onClick={onNew}>
          <Plus size={17} />
          Upload
        </button>
      </header>
      <div className="shelf-document-grid" aria-label="Documentos organizáveis">
        {orderedRows.map((row, index) => (
          <article
            className={`shelf-document-folder tone-${index % 4}`}
            key={row[0]}
            draggable
            onDragStart={() => setDraggedId(row[0])}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => moveDocument(row[0])}
          >
            <span className="shelf-document-tab" aria-hidden="true" />
            <div className="shelf-document-sheet">
              <div className="shelf-document-heading">
                <i><FileText size={20} /></i>
                <div><small>{row[2]}</small><h3>{row[1].replace(/_/g, " ").replace(/\.[^.]+$/, "")}</h3></div>
              </div>
              <p>{descriptionFor(row)}</p>
              <div className="shelf-document-meta">
                <span>Atualizado em <b>{row[3]}</b></span>
                <span>{row[4]} · {row[5]}</span>
              </div>
              <footer>
                <button className="shelf-document-details" onClick={() => onView(row)}>Ver detalhes <ArrowUpRight size={14} /></button>
                <button className="shelf-document-icon" onClick={() => onEdit(row)} aria-label="Editar"><Edit3 size={16} /></button>
                <button className="shelf-document-icon shelf-document-drag" aria-label="Arrastar para reordenar"><Menu size={17} /></button>
              </footer>
            </div>
          </article>
        ))}
      </div>
    </article>
  );
}

const crmStages = ["Captação", "Primeiro contato", "Necessidade", "Proposta", "Agendamento", "Atendimento", "Convertido"];
const crmSeed = [
  { id: "CRM-308", name: "Vitta Clinic", initials: "VC", source: "WhatsApp", objective: "Consulta corporativa", value: "R$ 12.800", stage: "Primeiro contato", priority: "Alta", progress: 20, comments: 4, files: 2, owner: "Marina" },
  { id: "CRM-307", name: "Bella Café", initials: "BC", source: "Instagram", objective: "Pacote mensal", value: "R$ 4.850", stage: "Necessidade", priority: "Média", progress: 45, comments: 6, files: 1, owner: "João" },
  { id: "CRM-306", name: "Arco Studio", initials: "AS", source: "Indicação", objective: "Consultoria", value: "R$ 8.400", stage: "Proposta", priority: "Normal", progress: 65, comments: 3, files: 4, owner: "Ana" },
  { id: "CRM-305", name: "PrimePet Store", initials: "PS", source: "Google", objective: "Atendimento técnico", value: "R$ 2.150", stage: "Agendamento", priority: "Média", progress: 78, comments: 5, files: 2, owner: "Carlos" },
];

function CrmKanban({ onDetails }: { onDetails: (record: string[]) => void }) {
  const [leads, setLeads] = useState(crmSeed);
  const [dragged, setDragged] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<string | null>(null);
  return <>
    <PageIntro title="CRM" subtitle="Acompanhe cada oportunidade da captação até a conversão." />
    <section className="v2-metrics client-metrics">
      {modules.CRM.metrics.map((metric) => <Metric key={metric[0]} label={metric[0]} value={metric[1]} detail={metric[2]} tone={metric[3]} />)}
    </section>
    <section className="shelf-kanban shelf-kanban-crm" aria-label="Funil comercial em Kanban">
      {crmStages.map((stage) => {
        const stageLeads = leads.filter((lead) => lead.stage === stage);
        return <article className={dropStage === stage ? "is-over" : ""} key={stage} onDragOver={(event) => { event.preventDefault(); setDropStage(stage); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropStage(null); }} onDrop={() => { if (dragged) setLeads((current) => current.map((lead) => lead.id === dragged ? { ...lead, stage } : lead)); setDragged(null); setDropStage(null); }}>
          <header><span className="shelf-kanban-dot" aria-hidden="true" /><strong>{stage}</strong><b>{stageLeads.length}</b></header>
          <div className="shelf-kanban-stack">{stageLeads.map((lead) => <button className={`shelf-kanban-card tone-${lead.priority.toLowerCase()}`} key={lead.id} draggable onDragStart={() => setDragged(lead.id)} onDragEnd={() => { setDragged(null); setDropStage(null); }} onClick={() => onDetails([lead.id, lead.name, lead.source, "Hoje", lead.value, stage])}>
            <span className="shelf-kanban-band">{lead.priority === "Alta" ? <Siren size={13} /> : lead.priority === "Média" ? <Clock3 size={13} /> : <CheckCircle2 size={13} />}{lead.priority === "Alta" ? "Retorno urgente" : lead.priority === "Média" ? "Atenção moderada" : "Tudo em dia"}</span>
            <span className="shelf-kanban-body">
              <small>{lead.source}</small><strong>{lead.name}</strong><span>{lead.objective} · {lead.value}</span>
              <span className="shelf-kanban-progress-label"><span>Progresso</span><b>{lead.progress}%</b></span>
              <span className="shelf-kanban-progress"><i style={{ width: `${lead.progress}%` }} /></span>
              <span className="shelf-kanban-meta"><span><i><MessageCircle size={12} />{lead.comments}</i><i><Paperclip size={12} />{lead.files}</i></span><span className="shelf-kanban-person"><em>{lead.owner.slice(0, 2).toUpperCase()}</em>{lead.owner}</span></span>
            </span>
          </button>)}</div>
        </article>;
      })}
    </section>
    <p className="crm-kanban-help">Arraste os cards entre as etapas. Clique para ver os detalhes do contato.</p>
  </>;
}

type WorkflowCard = { id: string; title: string; detail: string; owner: string; due: string; priority: string; stage: string; progress?: number };
const taskStages = ["Entrada", "A fazer", "Em andamento", "Em revisão", "Concluída"];
const projectStages = ["Planejamento", "A iniciar", "Em andamento", "Em risco", "Concluído"];
const taskCards: WorkflowCard[] = [
  { id: "TR-018", title: "Enviar proposta comercial", detail: "Bella Modas", owner: "Marina", due: "Hoje, 14:00", priority: "Alta", stage: "A fazer" },
  { id: "TR-017", title: "Validar orçamento", detail: "Revisar custos e margem", owner: "João", due: "Hoje, 16:00", priority: "Média", stage: "Em andamento" },
  { id: "TR-016", title: "Repor materiais", detail: "Estoque da unidade Centro", owner: "Carlos", due: "Amanhã", priority: "Média", stage: "Entrada" },
  { id: "TR-015", title: "Aprovar campanha", detail: "Dia das Mães", owner: "Marina", due: "Hoje", priority: "Alta", stage: "Em revisão" },
];
const projectCards: WorkflowCard[] = [
  { id: "PR-008", title: "Implantação Bella Modas", detail: "Cliente · 18 ago", owner: "Marina", due: "18 ago 2026", priority: "Normal", stage: "Em andamento", progress: 72 },
  { id: "PR-007", title: "Expansão unidade Centro", detail: "Operação interna", owner: "Carlos", due: "25 ago 2026", priority: "Alta", stage: "Em risco", progress: 48 },
  { id: "PR-006", title: "Novo canal de vendas", detail: "Comercial", owner: "João", due: "02 set 2026", priority: "Normal", stage: "Planejamento", progress: 15 },
  { id: "PR-005", title: "Revisão do catálogo", detail: "Produtos e serviços", owner: "Ana", due: "29 ago 2026", priority: "Média", stage: "A iniciar", progress: 0 },
];

function WorkflowKanban({ view }: { view: "Tarefas" | "Projetos" }) {
  const stages = view === "Tarefas" ? taskStages : projectStages;
  const [cards, setCards] = useState<WorkflowCard[]>(view === "Tarefas" ? taskCards : projectCards);
  const [dragged, setDragged] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<string | null>(null);
  useEffect(() => {
    setCards(view === "Tarefas" ? taskCards : projectCards);
    setDragged(null);
    setDropStage(null);
  }, [view]);
  return <>
    <PageIntro title={view} subtitle={view === "Tarefas" ? "Organize prioridades e acompanhe cada tarefa até a conclusão." : "Acompanhe projetos por etapa, prazo, responsável e progresso."} />
    <section className="workflow-toolbar v2-card"><div><strong>{cards.length} {view.toLowerCase()}</strong><span>Arraste os cards para atualizar a etapa.</span></div><button className="v2-primary"><Plus size={16} />{view === "Tarefas" ? "Nova tarefa" : "Novo projeto"}</button></section>
    <section className="shelf-kanban shelf-kanban-workflow">
      {stages.map((stage, index) => {
        const stageCards = cards.filter((card) => card.stage === stage);
        return <article className={dropStage === stage ? "is-over" : ""} key={stage} onDragOver={(event) => { event.preventDefault(); setDropStage(stage); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropStage(null); }} onDrop={() => { if (dragged) setCards((current) => current.map((card) => card.id === dragged ? { ...card, stage } : card)); setDragged(null); setDropStage(null); }}>
          <header><span className="shelf-kanban-dot" aria-hidden="true" /><strong>{stage}</strong><b>{stageCards.length}</b></header>
          <div className="shelf-kanban-stack">{stageCards.map((card, cardIndex) => {
            const progress = typeof card.progress === "number" ? card.progress : Math.min(90, 18 + index * 20);
            return <button className={`shelf-kanban-card tone-${card.priority.toLowerCase()}`} key={card.id} draggable onDragStart={() => setDragged(card.id)} onDragEnd={() => { setDragged(null); setDropStage(null); }}>
            <span className="shelf-kanban-band">{card.priority === "Alta" ? <Siren size={13} /> : card.priority === "Média" ? <Clock3 size={13} /> : <CheckCircle2 size={13} />}{card.priority === "Alta" ? "Prioridade alta" : card.priority === "Média" ? "Atenção moderada" : "Tudo em dia"}</span>
            <span className="shelf-kanban-body">
              <small>{card.id}</small><strong>{card.title}</strong><span>{card.detail}</span>
              <span className="shelf-kanban-progress-label"><span>Progresso</span><b>{progress}%</b></span>
              <span className="shelf-kanban-progress"><i style={{ width: `${progress}%` }} /></span>
              <span className="shelf-kanban-meta"><span><i><MessageCircle size={12} />{cardIndex + 2}</i><i><Paperclip size={12} />{cardIndex + 1}</i></span><span className="shelf-kanban-person"><em>{card.owner.slice(0, 2).toUpperCase()}</em>{card.owner}<time>{card.due}</time></span></span>
            </span>
          </button>; })}</div>
        </article>;
      })}
    </section>
  </>;
}

function PricingView() {
  const [kind, setKind] = useState("Produto");
  const [directCost, setDirectCost] = useState(120);
  const [materials, setMaterials] = useState(18);
  const [packaging, setPackaging] = useState(6);
  const [freight, setFreight] = useState(4);
  const [monthlyRent, setMonthlyRent] = useState(3500);
  const [monthlyEnergy, setMonthlyEnergy] = useState(850);
  const [otherFixed, setOtherFixed] = useState(1650);
  const [monthlyVolume, setMonthlyVolume] = useState(120);
  const [monthlyCompensation, setMonthlyCompensation] = useState(6500);
  const [productiveHours, setProductiveHours] = useState(120);
  const [executionHours, setExecutionHours] = useState(2);
  const [loss, setLoss] = useState(3);
  const [tax, setTax] = useState(8);
  const [commission, setCommission] = useState(5);
  const [margin, setMargin] = useState(35);
  const [includeTax, setIncludeTax] = useState(true);
  const [includeFees, setIncludeFees] = useState(true);
  const fixedMonthly = monthlyRent + monthlyEnergy + otherFixed;
  const fixedUnit = fixedMonthly / Math.max(1, monthlyVolume);
  const hourlyRate = (monthlyCompensation + fixedMonthly) / Math.max(1, productiveHours);
  const directBase = kind === "Produto" ? directCost + materials + packaging + freight : hourlyRate * executionHours + materials;
  const lossCost = directBase * loss / 100;
  const base = directBase + lossCost + fixedUnit;
  const variableRate = (includeTax ? tax : 0) + (includeFees ? commission : 0);
  const divisor = Math.max(.05, 1 - (variableRate + margin) / 100);
  const price = base / divisor;
  const Field = ({ label, help, value, setValue }: { label: string; help: string; value: number; setValue: (value: number) => void }) => <label><span>{label}<InfoHint text={help} /></span><div className="pricing-input"><span>R$</span><input type="number" min="0" step="0.01" value={value} onChange={(event) => setValue(Number(event.target.value))} /></div></label>;
  return <>
    <PageIntro title="Precificação" subtitle="Forme preços sustentáveis considerando custos diretos, estrutura, tributos, taxas e margem." />
    <article className="v2-card pricing-workspace">
      <header><div><small>FORMAÇÃO ECONÔMICA DO PREÇO</small><h2>Precificar {kind.toLowerCase()}</h2><p>Preencha os custos da operação. O cálculo é atualizado automaticamente.</p></div><div className="v2-segment"><button className={kind === "Produto" ? "selected" : ""} onClick={() => setKind("Produto")}>Produto</button><button className={kind === "Serviço" ? "selected" : ""} onClick={() => setKind("Serviço")}>Serviço</button></div></header>
      <div className="pricing-grid">
        <section className="pricing-form">
          <div className="pricing-section pricing-identification"><h3>Identificação</h3><label><span>Nome do {kind.toLowerCase()}<InfoHint text="Nome usado no catálogo, propostas e vendas." /></span><input placeholder={`Ex.: ${kind === "Produto" ? "Shampoo premium" : "Consultoria estratégica"}`} /></label><label><span>Unidade de venda<InfoHint text="Como o item é vendido: unidade, hora, sessão, diária ou pacote." /></span><select><option>{kind === "Produto" ? "Unidade" : "Hora"}</option><option>Sessão</option><option>Pacote</option><option>Diária</option></select></label></div>
          <div className="pricing-section"><h3>{kind === "Produto" ? "Custos diretos do produto" : "Tempo e custos diretos do serviço"}</h3>{kind === "Produto" ? <><Field label="Compra ou produção" help="Custo líquido para adquirir ou produzir uma unidade." value={directCost} setValue={setDirectCost} /><Field label="Matéria-prima e insumos" help="Soma dos materiais consumidos em uma unidade." value={materials} setValue={setMaterials} /><Field label="Embalagem" help="Embalagem primária, etiquetas e materiais de apresentação." value={packaging} setValue={setPackaging} /><Field label="Frete por unidade" help="Frete total dividido pela quantidade recebida." value={freight} setValue={setFreight} /></> : <><Field label="Pró-labore ou remuneração mensal" help="Remuneração mensal de quem executa o serviço, incluindo encargos." value={monthlyCompensation} setValue={setMonthlyCompensation} /><label><span>Horas produtivas por mês<InfoHint text="Horas realmente vendáveis. Exclua pausas, administração, reuniões e ociosidade." /></span><input type="number" min="1" value={productiveHours} onChange={(event) => setProductiveHours(Number(event.target.value))} /></label><label><span>Horas para executar o serviço<InfoHint text="Tempo total médio dedicado a uma entrega, incluindo preparação e finalização." /></span><input type="number" min="0" step="0.25" value={executionHours} onChange={(event) => setExecutionHours(Number(event.target.value))} /></label><Field label="Materiais e terceiros" help="Materiais consumidos e serviços terceirizados em cada entrega." value={materials} setValue={setMaterials} /><article className="pricing-derived"><span>Valor econômico da hora<InfoHint text="Remuneração mais estrutura mensal divididas pelas horas produtivas." /></span><strong>{hourlyRate.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></article></>}
          </div>
          <div className="pricing-section"><h3>Estrutura e rateio mensal</h3><Field label="Aluguel" help="Aluguel, condomínio e IPTU mensais do espaço utilizado." value={monthlyRent} setValue={setMonthlyRent} /><Field label="Energia, água e internet" help="Média mensal das contas de consumo da operação." value={monthlyEnergy} setValue={setMonthlyEnergy} /><Field label="Folha, sistemas e outros fixos" help="Custos que existem mesmo sem venda: equipe, sistemas, contador, seguros e manutenção." value={otherFixed} setValue={setOtherFixed} /><label><span>Volume vendido por mês<InfoHint text="Quantidade média de unidades ou serviços vendidos, usada para ratear os custos fixos." /></span><input type="number" min="1" value={monthlyVolume} onChange={(event) => setMonthlyVolume(Number(event.target.value))} /></label></div>
          <div className="pricing-section"><h3>Perdas, tributos e margem</h3><label><span>Perdas e desperdícios (%)<InfoHint text="Percentual médio de perdas, retrabalho, validade, quebra ou ociosidade." /></span><input type="number" min="0" step="0.1" value={loss} onChange={(event) => setLoss(Number(event.target.value))} /></label><label><span>Margem desejada (%)<InfoHint text="Lucro desejado sobre o preço final, após custos, tributos e taxas." /></span><input type="number" min="0" max="90" step="0.1" value={margin} onChange={(event) => setMargin(Number(event.target.value))} /></label><label className="pricing-toggle"><span><b>Incluir impostos</b><small>Simples, ISS, ICMS ou outro tributo efetivo.</small></span><button type="button" className={includeTax ? "switch on" : "switch"} onClick={() => setIncludeTax(!includeTax)}><i /></button></label>{includeTax && <label><span>Alíquota efetiva (%)<InfoHint text="Percentual real de tributos incidentes sobre esta venda, conforme seu regime tributário." /></span><input type="number" min="0" step="0.1" value={tax} onChange={(event) => setTax(Number(event.target.value))} /></label>}<label className="pricing-toggle"><span><b>Incluir taxas e comissão</b><small>Cartão, marketplace, comissão comercial e meios de pagamento.</small></span><button type="button" className={includeFees ? "switch on" : "switch"} onClick={() => setIncludeFees(!includeFees)}><i /></button></label>{includeFees && <label><span>Taxas e comissão (%)<InfoHint text="Soma percentual das taxas de venda e comissões aplicáveis." /></span><input type="number" min="0" step="0.1" value={commission} onChange={(event) => setCommission(Number(event.target.value))} /></label>}</div>
        </section>
        <aside><i><Calculator size={24} /></i><small>PREÇO SUGERIDO</small><strong>{price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong><p>Preço mínimo calculado para cobrir a estrutura e alcançar a margem informada.</p><dl><div><dt>Custo direto</dt><dd>{directBase.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></div><div><dt>Rateio fixo unitário</dt><dd>{fixedUnit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></div><div><dt>Perdas</dt><dd>{lossCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></div><div><dt>Tributos e taxas</dt><dd>{variableRate}%</dd></div><div><dt>Margem-alvo</dt><dd>{margin}%</dd></div></dl><button className="v2-primary">Salvar precificação</button></aside>
      </div>
    </article>
  </>;
}

/** Lista operacional comum: usa etiquetas visuais e painel lateral para criar e editar. */
function EnhancedModuleView({ view }: { view: View }) {
  const config = modules[view] ?? modules["Vendas"];
  const [selected, setSelected] = useState<string[] | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Mais recentes");
  const [form, setForm] = useState<"new" | "edit" | null>(null);
  const [records, setRecords] = useState<string[][]>(config.rows);
  const [chartPeriod, setChartPeriod] = useState("30 dias");
  useEffect(() => {
    setRecords(config.rows);
    setSelected(null);
    setForm(null);
  }, [view, config.rows]);
  if (view === "Tarefas" || view === "Projetos") return <WorkflowKanban view={view} />;
  if (selected && !form)
    return (
      <FullDetailView
        view={view}
        record={selected}
        onBack={() => setSelected(null)}
      />
    );
  const rows = [...records]
    .filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) =>
      sort === "A–Z"
        ? a[1].localeCompare(b[1])
        : sort === "Z–A"
          ? b[1].localeCompare(a[1])
          : 0,
    );
  const statusTone = (value: string) =>
    /Ativo|Paga|Pago|Recebido|Concluída|Normal|Respondido|Positivo/.test(value)
      ? "active"
      : /Crítico|Atrasada|Sem estoque|Prioridade/.test(value)
        ? "inactive"
        : "warn";
  if (view === "CRM") return <CrmKanban onDetails={setSelected} />;
  if (view === "Precificação") return <PricingView />;
  if (view === "Documentos")
    return (
      <>
        <PageIntro title={view} subtitle={config.subtitle} />
        <section className="v2-metrics client-metrics">
          {config.metrics.map((metric) => (
            <Metric
              key={metric[0]}
              label={metric[0]}
              value={metric[1]}
              detail={metric[2]}
              tone={metric[3]}
            />
          ))}
        </section>
        <DocumentCards
          rows={rows}
          query={query}
          sort={sort}
          onQuery={setQuery}
          onSort={setSort}
          onView={setSelected}
          onEdit={(row) => {
            setSelected(row);
            setForm("edit");
          }}
          onNew={() => setForm("new")}
        />
        {form && (
          <RecordDialog
            title={
              form === "new"
                ? config.label
                : `Editar ${selected?.[1] ?? "documento"}`
            }
            onClose={() => {
              setForm(null);
              setSelected(null);
            }}
            onSave={() => {
              setForm(null);
              setSelected(null);
            }}
            fields={[
              "Arquivo",
              "Nome",
              "Tipo",
              "Cliente",
              "Venda / serviço",
              "Descrição",
            ]}
          />
        )}
      </>
    );
  return (
    <>
      <PageIntro title={view} subtitle={config.subtitle} />
      <section className="v2-metrics client-metrics">
        {config.metrics.map((metric) => (
          <Metric
            key={metric[0]}
            label={metric[0]}
            value={metric[1]}
            detail={metric[2]}
            tone={metric[3]}
          />
        ))}
      </section>
      <article className={`v2-card v2-client-table v2-module-table${view === "Equipe" ? " v2-team-table" : ""}`}>
        <header>
          <div className="v2-local-search">
            <Search size={19} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Buscar em ${view.toLowerCase()}...`}
            />
          </div>
          {config.filters.map((filter) => (
            <label key={filter}>
              {filter}
              <select>
                <option>Todos</option>
              </select>
            </label>
          ))}
          <label>
            Ordenar por
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option>Mais recentes</option>
              <option>Mais antigos</option>
              <option>A–Z</option>
              <option>Z–A</option>
              <option>Maior valor</option>
              <option>Menor valor</option>
            </select>
          </label>
          <button className="v2-primary" onClick={() => setForm("new")}>
            {view === "Catálogo" ? <Calculator size={17} /> : <Plus size={17} />}
            {config.label}
          </button>
        </header>
        <table>
          <thead>
            <tr>
              {(view === "Vendas" ? ["ID", "Registro", "Pagamento", "Valor de referência", "Valor final", "Desconto", "Parcelamento / taxas", "Status", "Ações"] : view === "Estoque" ? ["ID", "Produto / serviço", "Tipo", "Quantidade", "Atualização", "Preço unitário", "Status", "Ações"] : view === "Manutenção" ? ["ID", "Equipamento", "Categoria", "Data da manutenção", "Preço", "Status", "Ações"] : [
                "ID", "Registro",
                view === "Equipe"
                  ? "Cargo"
                  : view === "Estoque"
                      ? "Quantidade"
                      : view === "Manutenção" || view === "Catálogo"
                        ? "Categoria"
                        : view === "CRM"
                          ? "Origem"
                          : "Tipo",
                "Atualização",
                "Valor / referência",
                "Status",
                "Ações",
              ]).map((item) => (
                <th key={item}>{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => view === "Vendas" ? (
              <tr key={row[0]}>
                <td>{row[0]}</td><td><strong>{row[1]}</strong></td><td>{row[2]}</td>
                <td>{["R$ 9.200", "R$ 13.500", "R$ 5.100", "R$ 2.300"][index] ?? row[4]}</td>
                <td><strong>{row[4]}</strong></td>
                <td><span className="sales-discount">{["R$ 800 · 8,7%", "R$ 700 · 5,2%", "R$ 250 · 4,9%", "R$ 150 · 6,5%"][index] ?? "R$ 0 · 0%"}</span></td>
                <td>{row[2] === "Cartão" ? "3x · taxa R$ 214" : row[2] === "Boleto" ? "2 parcelas · taxa R$ 48" : "À vista · sem taxa"}</td>
                <td><span className={`status ${statusTone(row[5])}`}>●　{row[5]}</span></td>
                <td><button onClick={() => setSelected(row)}>Ver detalhes</button><button className="v2-icon-button" onClick={() => { setSelected(row); setForm("edit"); }} aria-label="Editar"><Edit3 size={16} /></button></td>
              </tr>
            ) : view === "Estoque" ? (
              <tr key={row[0]}>
                <td>{row[0]}</td><td><strong>{row[1]}</strong></td><td><span className="type">{row[2]}</span></td><td><strong>{row[3]}</strong></td><td>{row[4]}</td><td><strong>{row[5]}</strong></td><td><span className={`status ${statusTone(row[6])}`}>●　{row[6]}</span></td><td><button onClick={() => setSelected([row[0], row[1], row[2], row[4], row[5], row[6]])}>Ver detalhes</button><button className="v2-icon-button" onClick={() => { setSelected([row[0], row[1], row[2], row[4], row[5], row[6]]); setForm("edit"); }} aria-label="Editar"><Edit3 size={16} /></button></td>
              </tr>
            ) : (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>
                  <strong>{row[1]}</strong>
                </td>
                <td>
                  <span
                    className={
                      row[2].includes("Jurídica") ? "type legal" : "type"
                    }
                  >
                    {row[2]}
                  </span>
                </td>
                <td>{row[3]}</td>
                <td>{row[4]}</td>
                <td>
                  <span className={`status ${statusTone(row[5])}`}>
                    ●　{row[5]}
                  </span>
                </td>
                <td>
                  <button onClick={() => setSelected(row)}>Ver detalhes</button>
                  <button
                    className="v2-icon-button"
                    onClick={() => {
                      setSelected(row);
                      setForm("edit");
                    }}
                    aria-label="Editar"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button className="v2-icon-button" aria-label="Reordenar">
                    <Menu size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <footer>
          Mostrando {rows.length} registros{" "}
          <div className="pagination">
            <button>‹</button>
            <b>1</b>
            <button>2</button>
            <button>›</button>
          </div>
        </footer>
      </article>
      {view === "Manutenção" && (
        <article className="v2-card v2-module-chart maintenance-chart-below">
          <header><div><h2>Custo de manutenção</h2><p>Despesas de manutenção por período.</p></div><div className="v2-segment">{["30 dias", "3 meses", "6 meses", "12 meses"].map((item) => <button key={item} className={chartPeriod === item ? "selected" : ""} onClick={() => setChartPeriod(item)}>{item}</button>)}</div></header>
          <Chart title="custo de manutenção" period={chartPeriod} />
        </article>
      )}
      {form && (
        <RecordDialog
          title={
            form === "new"
              ? config.label
              : `Editar ${selected?.[1] ?? "registro"}`
          }
          onClose={() => {
            setForm(null);
            if (selected) setSelected(null);
          }}
          onSave={(values) => {
            const next: string[] = [
              form === "edit" && selected ? selected[0] : String(Date.now()).slice(-5),
              values["Nome / título"] || selected?.[1] || "Novo registro",
              values["Tipo"] || values["Categoria"] || selected?.[2] || "Geral",
              "Agora",
              values["Preço de venda"] || values["Valor"] || selected?.[4] || "R$ 0,00",
              "Ativo",
            ];
            setRecords((current) => form === "edit" && selected ? current.map((row) => row[0] === selected[0] ? next : row) : [next, ...current]);
            setForm(null);
            setSelected(null);
          }}
          fields={view === "Catálogo" ? ["Nome / título", "Tipo", "Categoria", "SKU / código", "Custo total", "Preço de venda", "Margem estimada", "Quantidade / unidade", "Impostos e taxas", "Descrição"] : ["Nome / título", "Tipo", "Responsável", "Data", "Valor", "Descrição"]}
        />
      )}
    </>
  );
}
// Loja da Noro/Gest: por enquanto mostra apenas os planos, mantendo a mesma linguagem visual da V2.
function StoreView() {
  const plans: Array<{
    name: string;
    tone: string;
    badge: string;
    price: string;
    description: string;
    features: string[];
    cta: string;
    icon: LucideIcon;
    current?: boolean;
    featured?: boolean;
  }> = [
    {
      name: "Standard",
      tone: "standard",
      badge: "Plano atual",
      price: "R$ 79/mês",
      description: "Base completa para organizar clientes, vendas, estoque e rotina.",
      features: [
        "Até 2 usuários",
        "500 clientes",
        "500 produtos/serviços",
        "1.000 vendas por mês",
      ],
      cta: "Plano atual",
      icon: Crown,
      current: true,
    },
    {
      name: "Plus",
      tone: "plus",
      badge: "Upgrade",
      price: "R$ 149/mês",
      description: "Mais capacidade para equipes em crescimento e operação diária.",
      features: [
        "Até 5 usuários",
        "2.000 clientes",
        "2.000 produtos/serviços",
        "Relatórios ampliados",
      ],
      cta: "Ver Plus",
      icon: PackageCheck,
      featured: true,
    },
    {
      name: "Pro",
      tone: "pro",
      badge: "Avançado",
      price: "R$ 249/mês",
      description: "Plano para gestão mais robusta, com automações e integrações.",
      features: [
        "Até 10 usuários",
        "Clientes e catálogo ampliados",
        "Automações operacionais",
        "Integrações externas",
      ],
      cta: "Ver Pro",
      icon: BriefcaseBusiness,
    },
    {
      name: "Consultoria",
      tone: "consulting",
      badge: "Personalizado",
      price: "Sob consulta",
      description: "Acompanhamento para desenhar processos, telas e implantação.",
      features: [
        "Diagnóstico do negócio",
        "Fluxos sob medida",
        "Treinamento da equipe",
        "Acompanhamento estratégico",
      ],
      cta: "Falar com consultor",
      icon: ShoppingBag,
    },
  ];

  return (
    <>
      <PageIntro
        title="Loja"
        subtitle="Compare planos e produtos da nossa empresa. Por enquanto, veja as opções de plano do Gest."
      />
      <section className="v2-store-grid">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <article
              className={`v2-card v2-store-plan ${plan.tone}${plan.featured ? " featured" : ""}${
                plan.current ? " current" : ""
              }`}
              key={plan.name}
            >
              <header>
                <i>
                  <Icon size={20} strokeWidth={1.8} />
                </i>
                <span>{plan.badge}</span>
              </header>
              <div>
                <h2>{plan.name}</h2>
                <strong>{plan.price}</strong>
                <p>{plan.description}</p>
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <CheckCircle2 size={16} strokeWidth={1.9} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="v2-store-cta" disabled={plan.current}>
                {plan.cta}
              </button>
            </article>
          );
        })}
      </section>
    </>
  );
}

function Placeholder({ view }: { view: View }) {
  return view === "Relatórios" ? (
    <ReportsView />
  ) : (
    <EnhancedModuleView view={view} />
  );
}

export default function Inicio() {
  const [active, setActive] = useState<View>("Início");
  const [dark, setDark] = useState(false);
  const [sidebarColor, setSidebarColor] = useState("#071a38");
  const [notifications, setNotifications] = useState(false);
  const [selectedClientRecord, setSelectedClientRecord] = useState<string[] | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("gest-theme");
    const savedSidebar = window.localStorage.getItem("gest-sidebar-color");
    if (savedTheme === "dark") setDark(true);
    if (savedSidebar) setSidebarColor(savedSidebar);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("gest-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    window.localStorage.setItem("gest-sidebar-color", sidebarColor);
  }, [sidebarColor]);

  let page =
    active === "Início" ? (
      <HomeView setActive={setActive} />
    ) : active === "Agenda" ? (
      <AgendaExperience />
    ) : active === "Clientes" ? (
      <ClientsExperience
        onDetails={(record) => {
          setSelectedClientRecord(record);
          setActive("Detalhe");
        }}
      />
    ) : active === "Detalhe" ? (
      <ClientDetailPage
        record={selectedClientRecord ?? undefined}
        onBack={() => setActive("Clientes")}
      />
    ) : active === "Configurações" ? (
      <SettingsView dark={dark} setDark={setDark} sidebarColor={sidebarColor} setSidebarColor={setSidebarColor} />
    ) : active === "Assistente" ? (
      <AssistantExperience />
    ) : active === "Financeiro" ? (
      <FinanceExperience />
    ) : active === "Loja" ? (
      <StoreView />
    ) : (
      <Placeholder view={active} />
    );
  const recommendationArea = active === "Detalhe" ? "Clientes" : active;
  return (
    <main className={dark ? "gest-v2 dark gest-redesign" : "gest-v2 gest-redesign"} style={{ "--sidebar-color": sidebarColor, "--gest-accent": sidebarColor } as React.CSSProperties}>
      <Sidebar
        active={active}
        setActive={setActive}
        dark={dark}
        setDark={setDark}
      />
      <section className="v2-content">
        <Topbar
          notificationOpen={notifications}
          setNotificationOpen={setNotifications}
          onCreate={() => {
            if (active === "Clientes") {
              window.dispatchEvent(new Event("gest:create-client"));
              return;
            }
            setActive("Agenda");
          }}
        />
        <main className="v2-page">
          {page}
          {active !== "Loja" && active !== "Início" && (
            <ProfessionalRecommendation area={recommendationArea} />
          )}
        </main>
      </section>
    </main>
  );
}
