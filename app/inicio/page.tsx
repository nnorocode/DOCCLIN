"use client";
import EmptyTableBody from "./EmptyTableBody";
import "./ui-consistency.css";
import "./workflow-refinement.css";
import "./module-design-system.css";
import { useHorizontalOverflow } from "./useHorizontalOverflow";
import DataChartContainer from "./DataChartContainer";
import { chartTooltipStyle } from "./chart-presentation";
import { appStorage } from "../../lib/local-store";
import { useStoredData, useDataRevision, moduleKey, moduleColumns, readData, moduleMetric, numberValue, money, syncClinicalFinance, registerModuleSale, indicatorValue, indicatorBreakdown, indicatorSeries, revenueSources, serviceCounts, monthRanges } from "../../lib/operational-data";
import { catalogDefaults } from "../../lib/catalog-defaults";
import GuidedTour from "./GuidedTour";
import SettingsPlans from "./SettingsPlans";
import { applyDocumentTheme } from "./theme-scope";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import AgendaExperience from "./AgendaExperience";
import ClinicalWorkspace from "./ClinicalWorkspace";
import { ClinicalLetterhead, emptyLetterhead } from "./ClinicalLetterhead";
import ClinicalAttendancePicker from "./ClinicalAttendancePicker";
import ClinicalDrafts from "./ClinicalDrafts";
import MessageAttachments, { type ChatAttachment } from "./MessageAttachments";
import MessageAutomationSettings from "./MessageAutomationSettings";
import ClinicalImages from "./ClinicalImages";
import PendingConfirmations from "./PendingConfirmations";
import ScrollableTabBar from "./ScrollableTabBar";
import PatientHistory from "./PatientHistory";
import { loadClinicalRecord, saveClinicalRecord, type ClinicalRecord } from "../../lib/clinical-records";
import { useInactivity } from "./InactivityFilter";
import { ContactJourney, CrmContactFollowups, readJourneys, journeyStatuses } from "./ContactJourney";
import AssistantExperience from "./AssistantExperience";
import ClientsExperience, { ClientForm, type Client, ClientSelect, StandardModuleTop } from "./ClientsExperience";
import FinanceExperience from "./FinanceExperience";
import TimeClockExperience, { readClockState, type ClockState } from "./TimeClockExperience";
import PurchaseMarketWatch from "./PurchaseMarketWatch";
import InvestmentSimulator from "./InvestmentSimulator";
import InfoHint from "./InfoHint";
import { AccessProvider, AccessSettings, useAccess } from "./AccessControl";
import { appModules, roleLabels } from "../../lib/access-control";
import { validateAttachment, safeAttachmentUrl } from "../../lib/file-security";
import { ChartModeSelect, FlexibleChart, type ChartMode } from "./ChartModeSelect";
import { setExactDragPreview } from "./drag-preview";
import { AiThinkingPreview, DocumentCardPreview, InformativeMetricCardPreview, InsightActionCardPreview, LineChartMetricCardPreview, MonthlyColumnChartPreview, NotificationCenterPreview, RevenueGoalGaugePreview, TimelinePreview, type CardTone } from "../laboratorio/page";
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart,  Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
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
  Database,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  BookOpen,
  Grid2X2,
  GripVertical,
  Heart,
  Home,
  LineChart,
  List,
  LogOut,
  HelpCircle,
  Mail,
  Medal,
  Menu,
  MessageCircle,
  Moon,
  Package,
  PackageCheck,
  Paperclip,
  Palette,
  Plus,
  Printer,
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
  ZoomIn,
  ZoomOut,
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
  | "Prontuário"
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
  | "Colaboradores"
  | "Ponto"
  | "Precificação"
  | "Investimentos"
  | "Primeiros passos"
  | "Loja";

function showAppToast(message: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("gest-app-toast", { detail: message }));
}

type NavigationGroup = {
  label: string;
  icon: LucideIcon;
  items: Array<[View, LucideIcon]>;
};

const navigationGroups: NavigationGroup[] = [
  {
    label: "Minha rotina",
    icon: CalendarDays,
    items: [["Agenda", CalendarDays], ["Tarefas", CheckCircle2]],
  },
  {
    label: "Atendimento",
    icon: Users,
    items: [["Prontuário", Heart], ["Clientes", Users], ["Atendimento", MessageCircle], ["CRM", Target]],
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
    items: [["Financeiro", CircleDollarSign], ["Precificação", Calculator], ["Relatórios", LineChart]],
  },
  {
    label: "Equipe",
    icon: UsersRound,
    items: [["Ponto", Clock3], ["Equipe", UserRound]],
  },
];
function MessageIcon(props: React.ComponentProps<LucideIcon>) {
  return <ClipboardList {...props} />;
}


const clients: string[][] = [];

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
  collapsed,
  setCollapsed,
}: {
  active: View;
  setActive: (view: View) => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) {
  const activeGroup = navigationGroups.find((group) =>
    group.items.some(([view]) => view === active || (active === "Detalhe" && view === "Clientes")),
  )?.label;
  const access = useAccess();
  const sidebarRef = useRef<HTMLElement | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup ?? "Minha rotina");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = (view: View) => { setActive(view); setMobileOpen(false); if (collapsed) setOpenGroup(null); };

  useEffect(() => {
    if (activeGroup && !collapsed) setOpenGroup(activeGroup);
  }, [activeGroup, collapsed]);
  useEffect(() => { if (collapsed) setOpenGroup(null); }, [collapsed]);
  useEffect(() => {
    if (!collapsed || !openGroup) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!sidebarRef.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [collapsed, openGroup]);

  return (
    <aside ref={sidebarRef} className={`${mobileOpen ? "v2-sidebar gest-sidebar-new mobile-open" : "v2-sidebar gest-sidebar-new"}${collapsed ? " is-collapsed" : ""}`}>
      <div className="v2-brand">
        <svg className="gest-brand-filter" aria-hidden="true" focusable="false">
          <filter id="gest-doclin-on-dark" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0 0 0 0 1  -0.35 0 0 0 1  -0.75 0 0 0 1  0 0 0 1 0" />
          </filter>
        </svg>
        <span className="gest-brand-mark"><img src="/brand/doclin-transparent.png" alt="DOCLIN" /></span>
        <span className="gest-brand-compact" role="img" aria-label="DOCLIN">
          <img src="/brand/doclin-doc.png" alt="" aria-hidden="true" />
          <img src="/brand/doclin-clin.png" alt="" aria-hidden="true" />
        </span>
        <button type="button" className="gest-sidebar-collapse" aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"} title={collapsed ? "Expandir menu" : "Recolher menu"} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</button>
        <button type="button" className="gest-mobile-menu" aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((current) => !current)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      <strong className="gest-company-name">Gestão Clean</strong>
      <nav className="gest-nav-groups">
        {access.allowed("Início") && <button
          className={active === "Início" ? "active gest-main-nav" : "gest-main-nav"}
          aria-label="Início"
          onClick={() => navigate("Início")}
        >
          <Home size={20} />
          <span>Início</span>
        </button>}
        {access.allowed("Assistente") && <button
          className={active === "Assistente" ? "active gest-main-nav gest-assistant-nav" : "gest-main-nav gest-assistant-nav"}
          aria-label="Assistente"
          onClick={() => navigate("Assistente")}
        >
          <Sparkles size={20} />
          <span>Assistente</span>
        </button>}
        {navigationGroups.filter((group) => group.items.some(([view]) => access.allowed(view))).map((group) => {
          const GroupIcon = group.icon;
          const expanded = openGroup === group.label;
          const containsActive = group.items.some(([view]) => view === active || (active === "Detalhe" && view === "Clientes"));
          return (
            <div className="gest-nav-group" key={group.label}>
              <button
                className={containsActive ? "gest-group-trigger current" : "gest-group-trigger"}
                onClick={() => setOpenGroup(expanded ? null : group.label)}
                title={collapsed ? group.label : undefined}
                aria-label={group.label}
                aria-expanded={expanded}
              >
                <GroupIcon size={20} />
                <span>{group.label}</span>
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expanded && (
                <div className="gest-group-children">
                  {group.items.filter(([label]) => access.allowed(label)).map(([label, Icon]) => (
                    <button
                      key={label}
                      data-view={label}
                      className={active === label || (active === "Detalhe" && label === "Clientes") ? "active" : ""}
                      onClick={() => navigate(label)}
                    >
                      <Icon size={17} />
                      <span>{label === "Prontuário" ? "Consultas" : label === "Clientes" ? "Pacientes" : label === "Atendimento" ? "Mensagens" : label === "Equipe" ? "Colaboradores" : label}</span>
                      {(label === "Ponto" || label === "Compras") && <em className="gest-nav-new">New</em>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {access.allowed("Investimentos") && <button aria-label="Investimentos" className={active === "Investimentos" ? "active gest-main-nav" : "gest-main-nav"} onClick={() => navigate("Investimentos")}><TrendingUp size={20} /><span>Investimentos</span></button>}
      </nav>
      <div className="gest-sidebar-bottom">
        {access.allowed("Primeiros passos") && <button aria-label="Primeiros passos" className={active === "Primeiros passos" ? "active" : ""} onClick={() => navigate("Primeiros passos")}><BookOpen size={19} /><span>Primeiros passos</span></button>}
        {access.allowed("Configurações") && <button
          aria-label="Configurações"
          className={active === "Configurações" ? "active" : ""}
          onClick={() => navigate("Configurações")}
        >
          <Settings size={19} />
          <span>Configurações</span>
        </button>}
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
  active,
  notificationOpen,
  setNotificationOpen,
  onNavigate,
  onTutorial,
}: {
  active: View;
  notificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;
  onNavigate: (view: View, settingsTab?: string) => void;
  onTutorial: () => void;
}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const access = useAccess();
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const handleUnreadCount = useCallback((count: number) => setUnreadNotifications(count), []);

  useEffect(() => {
    const closeFloatingPanels = (event: PointerEvent) => {
      const target = event.target as Element;
      if (notificationOpen && !target.closest(".v2-bell, .gest-notification-popover")) setNotificationOpen(false);
      if (accountOpen && !target.closest(".gest-account-trigger, .gest-account-menu")) setAccountOpen(false);
      if (helpOpen && !target.closest(".gest-help-trigger, .gest-help-menu")) setHelpOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setNotificationOpen(false);
      setAccountOpen(false);
      setHelpOpen(false);
    };
    document.addEventListener("pointerdown", closeFloatingPanels);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFloatingPanels);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen, helpOpen, notificationOpen, setNotificationOpen]);

  return (
    <header className="v2-topbar">
      <form className="lab-search-form gest-topbar-search" role="search" onSubmit={(event) => event.preventDefault()}>
        <Search size={20} />
        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Pesquisar..." aria-label="Pesquisar no Gest" />
        <button type="button" className={searchQuery ? "visible" : ""} onClick={() => setSearchQuery("")} aria-label="Limpar pesquisa"><X size={16} /></button>
      </form>
      <div className="v2-user">
        <div className="gest-help-wrap">
          <button type="button" className="v2-bell gest-help-trigger" aria-label="Ajuda e suporte" aria-expanded={helpOpen} onClick={() => { setAccountOpen(false); setNotificationOpen(false); setHelpOpen((open) => !open); }}><HelpCircle size={19} /></button>
          {helpOpen ? <div className="gest-help-menu" role="menu" aria-label="Ajuda e suporte">
            <button type="button" role="menuitem" onClick={() => { setHelpOpen(false); onTutorial(); }}><BookOpen size={17} /><span><b>Tutorial</b><small>Aprenda a usar esta página</small></span><ChevronRight size={15} /></button>
            <a role="menuitem" href={`mailto:suporte@gest.app?subject=${encodeURIComponent(`Suporte GEST - ${active}`)}`}><Mail size={17} /><span><b>Suporte</b><small>Enviar e-mail para a equipe</small></span></a>
          </div> : null}
        </div>
        <button
          className="v2-bell"
          onClick={() => { setAccountOpen(false); setHelpOpen(false); setNotificationOpen(!notificationOpen); }}
          aria-label="Abrir notificações"
          aria-expanded={notificationOpen}
        >
          <Bell size={22} />
          {access.manage && unreadNotifications > 0 ? <b>{unreadNotifications}</b> : null}
        </button>
        <button className="gest-account-trigger" type="button" aria-haspopup="menu" aria-expanded={accountOpen} onClick={() => { setNotificationOpen(false); setHelpOpen(false); setAccountOpen((open) => !open); }}>
          <span className="v2-avatar">{access.member?.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}<i /></span>
          <span>
            <strong>{access.member?.name}</strong>
            <small>{access.member?.email}</small>
          </span>
          <ChevronDown size={18} className={accountOpen ? "open" : ""} />
        </button>
        {accountOpen && (
          <div className="gest-account-menu" role="menu" aria-label="Menu da conta">
            <button type="button" role="menuitem" onClick={() => { onNavigate("Configurações", "Conta"); setAccountOpen(false); }}><UserRound size={18} /><span>Meu perfil</span></button>
            <button type="button" role="menuitem" onClick={() => { onNavigate("Configurações", "Conta"); setAccountOpen(false); }}><Settings size={18} /><span>Configurações da conta</span></button>
            {access.allowed("Atendimento") && <button type="button" role="menuitem" onClick={() => { onNavigate("Atendimento"); setAccountOpen(false); }}><MessageCircle size={18} /><span>Mensagens</span></button>}
            <hr />
            <button type="button" role="menuitem" className="danger" onClick={() => void access.signOut()}><LogOut size={18} /><span>Sair</span></button>
          </div>
        )}
      </div>
      <div className={notificationOpen ? "gest-notification-popover is-open" : "gest-notification-popover"} aria-hidden={!notificationOpen}>
        {access.manage ? <NotificationCenterPreview items={[]} onUnreadCountChange={handleUnreadCount} /> : <p>Nenhuma notificação disponível para este perfil.</p>}
      </div>
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
  const Icon: LucideIcon = normalized.includes("a responder")
    ? MessageCircle
    : normalized.includes("em atendimento")
      ? ClipboardList
      : normalized.includes("intensificar")
        ? Siren
        : normalized.includes("sem agendamento")
          ? CalendarDays
          : normalized.includes("faltaram")
            ? X
            : normalized.includes("remarcação")
              ? CalendarClock
              : normalized.includes("retornos no prazo")
                ? Clock3
                : normalized.includes("clientes ativos")
                  ? UserCheck
    : normalized.includes("clientes inativos")
      ? UserRound
      : normalized.includes("lead") || normalized.includes("oportunidade")
        ? Target
        : normalized.includes("conversão")
          ? TrendingUp
        : normalized.includes("sem resposta") || normalized.includes("aguardando resposta")
          ? MessageCircle
          : normalized.includes("planejad")
            ? ClipboardList
            : normalized.includes("no prazo")
              ? Clock3
          : normalized.includes("aberto") || normalized.includes("pendente")
            ? ClipboardList
            : normalized.includes("urgente") || normalized.includes("crítico") || normalized.includes("atrasad") || normalized.includes("em atraso")
              ? Siren
              : normalized.includes("resolvid") || normalized.includes("conclu") || normalized.includes("em dia")
                ? CheckCircle2
                : normalized.includes("tempo médio") || normalized.includes("próxim")
                  ? Clock3
                  : normalized.includes("venda")
                    ? ShoppingCart
                    : normalized.includes("equipamento") || normalized.includes("manutenção")
                      ? Wrench
                      : normalized.includes("entrada")
                        ? PackageCheck
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
                    : normalized.includes("negócio") || normalized.includes("plano")
                        ? BriefcaseBusiness
                      : normalized.includes("status")
                        ? CheckCircle2
                        : normalized.includes("atualização") || normalized.includes("vencimento") || normalized.includes("vencid")
                          ? Clock3
                          : normalized.includes("documento") || normalized.includes("arquivo") || normalized.includes("upload")
                            ? FileText
                            : CircleDollarSign;
  const cardTone: CardTone = tone === "red" ? "rose" : tone === "orange" ? "amber" : tone === "green" ? "teal" : tone === "gray" ? "gray" : tone === "violet" ? "violet" : "blue";
  return <InformativeMetricCardPreview tone={cardTone} icon={Icon} title={label} value={value} change={detail || "0%"} />;
}
function PageIntro({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className={`v2-intro client-compact-intro${action ? " has-action" : ""}`}>
      <h1>
        {title}
        <InfoHint text={subtitle} />
      </h1>
      {action ? <div className="module-title-action">{action}</div> : null}
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
  const [contactsOpen, setContactsOpen] = useState(false);
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
  const [name] = suggestions[area] ?? [
    "Especialista Gest",
    "Apoio prático para esta área da operação.",
  ];
  useEffect(() => setContactsOpen(false), [area]);
  const contacts = [
    { initials: "MC", name: "Marina Costa", role: name, availability: "Disponível hoje" },
    { initials: "LA", name: "Lucas Almeida", role: "Consultor parceiro", availability: "Resposta em até 1h" },
    { initials: "AS", name: "Ana Souza", role: "Especialista verificada", availability: "Disponível amanhã" },
  ];
  return (
    <article className={`v2-professional professional-recommendation${contactsOpen ? " is-open" : ""}`}>
      <div className="professional-summary">
        <span>INDICAÇÃO PARA ESTA ÁREA</span>
      </div>
      <button className="professional-toggle" type="button" aria-expanded={contactsOpen} onClick={() => setContactsOpen((open) => !open)}>
        Ver contatos
        <ChevronDown size={16} aria-hidden />
      </button>
      {contactsOpen ? (
        <div className="professional-contact-grid">
          {contacts.map((contact) => (
            <article className="professional-contact-card" key={contact.name}>
              <i>{contact.initials}</i>
              <div>
                <strong>{contact.name}</strong>
                <span>{contact.role}</span>
                <small>{contact.availability}</small>
              </div>
              <ChevronRight size={16} aria-hidden />
            </article>
          ))}
        </div>
      ) : null}
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

const todayTimelineItems: Array<{id:string;time:string;title:string;detail:string;done:boolean;current?:boolean;type:string}> = [];

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

function HomeView({ setActive, onOpenClinical }: { setActive: (view: View) => void; onOpenClinical: (event: { id: string; patientName: string; service: string; coverage: { kind: "Particular" | "Plano"; insurer: string; category: string; authorization: string } }) => void }) {
  useDataRevision();
  const [insightsReady, setInsightsReady] = useState(false);
  const finishInsights = useCallback(() => setInsightsReady(true), []);
  const homeNow = new Date();
  const homeGreeting = homeNow.getHours() < 12 ? "Bom dia" : homeNow.getHours() < 18 ? "Boa tarde" : "Boa noite";
  const homeDate = homeNow.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toLocaleUpperCase("pt-BR");
  const [question, setQuestion] = useState("");
  const [widgetPickerOpen, setWidgetPickerOpen] = useState(false);
  const defaultHomeWidgets = ["Faturamento do período", "Lucro líquido", "Saldo de caixa", "Contas a receber", "Contas a pagar", "Meta de faturamento", "Despesas do período", "Receita recebida", "Vendas realizadas", "Ticket médio"];
  const [homeWidgets, setHomeWidgets] = useState<string[]>(defaultHomeWidgets);
  const [widgetTypes, setWidgetTypes] = useState<Record<string, string>>({});
  const [widgetSizes, setWidgetSizes] = useState<Record<string, { cols: number; rows: number }>>({});
  const [widgetMenu, setWidgetMenu] = useState<string | null>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!(event.target as HTMLElement).closest(".gest-widget-type-control")) setWidgetMenu(null); if (!(event.target as HTMLElement).closest(".gest-widget-picker")) setWidgetPickerOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const touchDrag = useRef<{ name: string; x: number; y: number; timer: ReturnType<typeof setTimeout> | null; ready: boolean } | null>(null);
  const resizeRef = useRef<{ name: string; edge: "left" | "right" | "bottom"; x: number; y: number; cols: number; rows: number; stepX: number; stepY: number; maxCols: number } | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(appStorage.getItem("gest-home-widget-order") || "null");
      const previous = JSON.parse(appStorage.getItem("gest-home-widgets") || "[]");
      setHomeWidgets(Array.isArray(saved) ? saved.filter((name): name is string => typeof name === "string") : [...defaultHomeWidgets, ...(Array.isArray(previous) ? previous.filter((name: string) => !defaultHomeWidgets.includes(name)) : [])]);
      const types = JSON.parse(appStorage.getItem("gest-home-widget-types") || "{}");
      const sizes = JSON.parse(appStorage.getItem("gest-home-widget-sizes") || "{}");
      setWidgetTypes(types && typeof types === "object" && !Array.isArray(types) ? Object.fromEntries(Object.entries(types).filter((entry): entry is [string,string] => typeof entry[1] === "string")) : {});
      setWidgetSizes(sizes && typeof sizes === "object" && !Array.isArray(sizes) ? Object.fromEntries(Object.entries(sizes).filter(([, value]) => { const size = value as { cols?: number; rows?: number } | null; return size && Number.isFinite(size.cols) && Number.isFinite(size.rows) && size.cols! > 0 && size.rows! > 0 && size.cols! <= 32 && size.rows! <= 32; })) as Record<string, { cols: number; rows: number }> : {});
    } catch { setHomeWidgets(defaultHomeWidgets); }
  }, []);
  const saveHomeWidgets = (next: string[]) => { setHomeWidgets(next); appStorage.setItem("gest-home-widget-order", JSON.stringify(next)); };
  const setWidgetType = (name: string, type: string) => { const next = { ...widgetTypes, [name]: type }; setWidgetTypes(next); appStorage.setItem("gest-home-widget-types", JSON.stringify(next)); setWidgetMenu(null); };
  const updateWidgetSize = (name: string, size: { cols: number; rows: number }, persist = false) => { const next = { ...widgetSizes, [name]: size }; setWidgetSizes(next); if (persist) appStorage.setItem("gest-home-widget-sizes", JSON.stringify(next)); };
  const resizeWidget = (name: string, x: number, y: number) => { const drag = resizeRef.current; if (!drag || drag.name !== name) return; const horizontal = drag.edge === "left" ? drag.x - x : x - drag.x; updateWidgetSize(name, { cols: drag.edge === "bottom" ? drag.cols : Math.max(1, Math.min(drag.maxCols, drag.cols + Math.round(horizontal / drag.stepX))), rows: drag.edge === "bottom" ? Math.max(1, Math.min(5, drag.rows + Math.round((y - drag.y) / drag.stepY))) : drag.rows }, true); };
  useEffect(() => {
    const move = (event: PointerEvent) => { const drag = resizeRef.current; if (drag) resizeWidget(drag.name, event.clientX, event.clientY); };
    const end = () => { resizeRef.current = null; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end); };
  });
  const reorderWidget = (fromName: string, toName: string) => {
    if (fromName === toName) return;
    const next = [...homeWidgets];
    const from = next.indexOf(fromName);
    const to = next.indexOf(toName);
    if (from < 0 || to < 0) return;
    next.splice(to, 0, ...next.splice(from, 1));
    saveHomeWidgets(next);
  };
  const widgetCatalogBase = [
    { name: "Faturamento do período", type: "line", value: 82450, change: 10.5, tone: "blue" as CardTone, icon: TrendingUp, view: "Financeiro" as View },
    { name: "Saldo de caixa", type: "metric", value: "R$ 124.800", change: "+6,1%", tone: "blue" as CardTone, icon: WalletCards, view: "Financeiro" as View },
    { name: "Contas a receber", type: "metric", value: "R$ 48.300", change: "+5,4%", tone: "violet" as CardTone, icon: ArrowDownRight, view: "Financeiro" as View },
    { name: "Contas a pagar", type: "metric", value: "R$ 21.600", change: "−2,8%", tone: "amber" as CardTone, icon: ArrowUpRight, view: "Financeiro" as View },
    { name: "Meta de faturamento", type: "gauge", value: 68000, change: 8.4, tone: "teal" as CardTone, icon: Target, view: "Financeiro" as View },
    { name: "Despesas do período", type: "columns", value: 31280, change: -3.6, tone: "amber" as CardTone, icon: CircleDollarSign, view: "Financeiro" as View },
    { name: "Vendas realizadas", type: "metric", value: "124", change: "+9,7%", tone: "teal" as CardTone, icon: ShoppingCart, view: "Vendas" as View },
    { name: "Clientes ativos", type: "line", value: 1284, change: 7.1, tone: "blue" as CardTone, icon: UsersRound, view: "Clientes" as View },
    { name: "Vendas no mês", type: "line", value: 86, change: 9.7, tone: "teal" as CardTone, icon: ShoppingCart, view: "Vendas" as View },
    { name: "Custos do mês", type: "columns", value: 28420, change: -4.8, tone: "amber" as CardTone, icon: CircleDollarSign, view: "Financeiro" as View },
    { name: "Agenda de hoje", type: "line", value: 18, change: 12.5, tone: "violet" as CardTone, icon: CalendarDays, view: "Agenda" as View },
    { name: "Estoque em alerta", type: "line", value: 3, change: -2.1, tone: "rose" as CardTone, icon: Package, view: "Estoque" as View },
    { name: "Receita recebida", type: "line", value: 68900, change: 8.2, tone: "blue" as CardTone, icon: TrendingUp, view: "Financeiro" as View },
    { name: "Lucro líquido", type: "line", value: 37620, change: 12.4, tone: "teal" as CardTone, icon: TrendingUp, view: "Financeiro" as View },
    { name: "Contas vencidas", type: "line", value: 3240, change: -4.1, tone: "rose" as CardTone, icon: Clock3, view: "Financeiro" as View },
    { name: "Manutenções no mês", type: "line", value: 42, change: 6.3, tone: "violet" as CardTone, icon: Wrench, view: "Manutenção" as View },
    { name: "Novos contatos", type: "line", value: 37, change: 11.2, tone: "amber" as CardTone, icon: UserCheck, view: "Atendimento" as View },
    { name: "Ticket médio", type: "metric", value: "R$ 665", change: "+4,3%", tone: "teal" as CardTone, icon: ShoppingBag, view: "Relatórios" as View },
    { name: "Tarefas concluídas", type: "line", value: 24, change: 8.0, tone: "blue" as CardTone, icon: CheckCircle2, view: "Tarefas" as View },
  ];
  const widgetCatalog = widgetCatalogBase.map(item => { const values = indicatorSeries(item.name); const previous = values.at(-2) ?? 0; const current = indicatorValue(item.name); return {...item, value: current, change: previous ? (current-previous)/Math.abs(previous)*100 : 0}; });
  const homeIndicatorHasRecords = (name: string) => {
    if (indicatorValue(name) !== 0 || indicatorSeries(name).some(value => value !== 0)) return true;
    const sources: Array<[RegExp, string]> = [
      [/clientes/i, "gest-clients"], [/agenda/i, "gest-agenda-events"],
      [/estoque/i, "gest-stock-records"], [/manutenções/i, moduleKey("Manutenção")],
      [/novos contatos/i, "gest-support-contacts"], [/tarefas/i, "gest-workflow-tasks"],
    ];
    const source = sources.find(([pattern]) => pattern.test(name));
    if (source) return readData<unknown[]>(source[1], []).length > 0;
    if (/meta/i.test(name)) return false;
    if (/saldo/i.test(name) && readData<unknown[]>("gest-banks", []).length > 0) return true;
    return readData<unknown[]>("gest-finance-transactions", []).length > 0;
  };
  const homeHasIndicatorData = homeWidgets.some(homeIndicatorHasRecords);
  const visibleHomeWidgets = homeHasIndicatorData ? homeWidgets : homeWidgets.slice(0, 4);
  const WidgetControls = ({ name, defaultRows }: { name: string; defaultRows: number }) => <><div className="gest-widget-type-control"><button type="button" aria-label={`Escolher visualização de ${name}`} aria-expanded={widgetMenu === name} onClick={() => setWidgetMenu(widgetMenu === name ? null : name)}><LineChart size={15} /></button><InfoHint text={`Altere apenas o formato de ${name}. O valor e a variação permanecem os mesmos.`} />{widgetMenu === name ? <div className="gest-widget-type-menu">{[["columns", "Colunas"], ["line", "Linha"], ["donut", "Rosca"], ["metric", "Card"]].map(([type, label]) => <button type="button" key={type} onClick={() => setWidgetType(name, type)}>{label}</button>)}</div> : null}</div>{(["left", "right", "bottom"] as const).map((edge) => <span key={edge} className={`gest-widget-edge edge-${edge}`} role="separator" aria-label={`Redimensionar ${name} pela borda ${edge}`} onPointerDown={(event) => { event.stopPropagation(); event.preventDefault(); const grid = event.currentTarget.closest<HTMLElement>(".gest-dashboard-grid"); const styles = grid ? getComputedStyle(grid) : null; const maxCols = styles?.gridTemplateColumns.split(" ").length || 6; resizeRef.current = { name, edge, x: event.clientX, y: event.clientY, cols: widgetSizes[name]?.cols || 2, rows: widgetSizes[name]?.rows || defaultRows, stepX: ((grid?.clientWidth || 900) + 14) / maxCols, stepY: (parseFloat(styles?.gridAutoRows || "125") || 125) + (parseFloat(styles?.rowGap || "14") || 14), maxCols }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { if (resizeRef.current?.name === name && resizeRef.current.edge === edge) resizeWidget(name, event.clientX, event.clientY); }} onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); resizeRef.current = null; }} onPointerCancel={() => { resizeRef.current = null; }} />)}</>;
  const renderHomeWidget = (name: string, index: number) => {
    const item = widgetCatalog.find((widget) => widget.name === name);
    if (!item) return null;
    const type = widgetTypes[name] || item.type;
    const numericValue = item.value;
    const change = item.change;
    const isMoney = /faturamento|saldo|contas|despesa|receita|lucro|custo|ticket/i.test(name);
    const isEmptyIndicator = !homeIndicatorHasRecords(name);
    const defaultRows = isEmptyIndicator || type === "metric" ? 1 : 2;
    const size = widgetSizes[name] || { cols: 2, rows: defaultRows };
    const dragProps = {
      "data-widget-name": name,
      "data-widget-rows": size.rows,
      "data-widget-cols": size.cols,
      style: { gridColumn: `span ${size.cols}`, gridRow: `span ${size.rows}` },
      draggable: true,
      onDragStart: (event: React.DragEvent) => { if (resizeRef.current || (event.target as HTMLElement).closest(".gest-widget-edge")) { event.preventDefault(); return; } setDraggedWidget(name); event.dataTransfer.setDragImage(event.currentTarget, Math.min(100, event.currentTarget.clientWidth / 2), 25); },
      onDragOver: (event: React.DragEvent) => event.preventDefault(),
      onDrop: (event: React.DragEvent) => {
        event.preventDefault();
        if (!draggedWidget) return;
        reorderWidget(draggedWidget, name);
        setDraggedWidget(null);
      },
      onDragEnd: () => setDraggedWidget(null),
      onTouchStart: (event: React.TouchEvent) => {
        if ((event.target as HTMLElement).closest("button")) return;
        const touch = event.touches[0];
        const item = { name, x: touch.clientX, y: touch.clientY, timer: null as ReturnType<typeof setTimeout> | null, ready: false };
        item.timer = setTimeout(() => { item.ready = true; setDraggedWidget(name); }, 320);
        touchDrag.current = item;
      },
      onTouchMove: (event: React.TouchEvent) => {
        const item = touchDrag.current;
        if (!item) return;
        const touch = event.touches[0];
        if (item.ready) { event.preventDefault(); return; }
        if (Math.hypot(touch.clientX - item.x, touch.clientY - item.y) > 9) { if (item.timer) clearTimeout(item.timer); touchDrag.current = null; }
      },
      onTouchEnd: (event: React.TouchEvent) => {
        const item = touchDrag.current;
        if (!item) return;
        if (item.timer) clearTimeout(item.timer);
        const touch = event.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
        if (item.ready && target?.closest(".gest-widget-trash")) saveHomeWidgets(homeWidgets.filter((entry) => entry !== item.name));
        else if (item.ready) { const slot = target?.closest<HTMLElement>("[data-widget-name]"); if (slot?.dataset.widgetName) reorderWidget(item.name, slot.dataset.widgetName); }
        touchDrag.current = null;
        setDraggedWidget(null);
      },
    };
    if (isEmptyIndicator) return <div className="gest-custom-widget-slot widget-empty" key={name} {...dragProps}><article className="home-empty-indicator"><header><h3>{name}</h3></header><div role="status">Sem registro no momento</div></article><WidgetControls name={name} defaultRows={1}/></div>;
    if (type === "gauge") return <div className={`gest-custom-widget-slot widget-chart ${draggedWidget === name ? "is-dragging" : ""}`} key={name} {...dragProps}><RevenueGoalGaugePreview current={indicatorValue("Faturamento")} target={indicatorValue("Meta")} change={0} /><WidgetControls name={name} defaultRows={defaultRows} /></div>;
    if (type === "line") {
      return <div className={`gest-custom-widget-slot widget-chart ${draggedWidget === name ? "is-dragging" : ""}`} key={name} {...dragProps}><LineChartMetricCardPreview points={indicatorSeries(name)} label={name} value={numericValue} valuePrefix={isMoney ? "R$ " : ""} change={change} onAction={() => setActive(item.view)} /><WidgetControls name={name} defaultRows={defaultRows} /></div>;
    }
    if (type === "columns") {
      const data = monthRanges().map((range,index) => ({month:range.name,value:indicatorSeries(name)[index]}));
      return <div className={`gest-custom-widget-slot widget-chart ${draggedWidget === name ? "is-dragging" : ""}`} key={name} {...dragProps}><MonthlyColumnChartPreview label={name} data={data} changeOverride={change} isCurrency={isMoney} goodWhenDown={name.includes("Custos") || name.includes("Despesas")} onAction={() => setActive(item.view)} /><WidgetControls name={name} defaultRows={defaultRows} /></div>;
    }
    if (type === "donut") { const previous = numericValue / (1 + change / 100); const total = numericValue + previous; const share = total > 0 && Number.isFinite(total) ? Math.max(5, Math.min(95, numericValue / total * 100)) : 0; return <div className={`gest-custom-widget-slot widget-chart ${draggedWidget === name ? "is-dragging" : ""}`} key={name} {...dragProps}><article className="lab-analytics-card gest-widget-donut"><header>{name}</header><div className="gest-widget-donut-body"><i style={{ background: `conic-gradient(#69b8df 0 ${share}%,#dfebf4 ${share}% 100%)` }} /><span><strong>{isMoney ? `R$ ${numericValue.toLocaleString("pt-BR")}` : numericValue.toLocaleString("pt-BR")}</strong><small className="gest-widget-donut-change">{change >= 0 ? "+" : "−"}{Math.abs(change).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% · mês anterior</small></span></div></article><WidgetControls name={name} defaultRows={defaultRows} /></div>; }
    return <div className={`gest-custom-widget-slot widget-metric ${draggedWidget === name ? "is-dragging" : ""}`} key={name} {...dragProps}><InformativeMetricCardPreview title={name} value={isMoney ? `R$ ${numericValue.toLocaleString("pt-BR")}` : numericValue.toLocaleString("pt-BR")} change={typeof item.change === "number" ? `${item.change >= 0 ? "+" : ""}${item.change.toLocaleString("pt-BR")}%` : String(item.change).replace("−", "-")} tone={item.tone} icon={item.icon} /><WidgetControls name={name} defaultRows={defaultRows} /></div>;
  };
  const [openedInsight,setOpenedInsight]=useState<{title:string;detail:string;action:string;view:View}|null>(null);
  const recommendations: Array<[string, string, string, View, CardTone, string]> = [
    ["Planeje os próximos 30 dias", "Confira feriados e datas relevantes para seu público. Antecipe equipe, estoque e comunicação, sem campanhas automáticas.", "Revisar agenda", "Agenda", "blue", "Planejamento"],
    ["Conheça sua margem", "Revise custos, taxas e tributos antes de definir preços ou descontos. Faturamento não é lucro.", "Revisar preços", "Precificação", "teal", "Gestão"],
    ["Cuide do relacionamento", "Revise os retornos combinados e respeite as preferências de contato dos clientes.", "Consultar clientes", "Clientes", "amber", "Relacionamento"],
    ["Organize seu caixa", "Confira vencimentos e recebimentos previstos. Separe os compromissos da clínica do dinheiro disponível antes de assumir novos gastos.", "Conferir financeiro", "Financeiro", "violet", "Financeiro"],
  ];
  return (
    <section className="gest-ai-home">
      <div className="gest-home-heading">
        <h1 className="gest-home-greeting">{homeGreeting}, Mariana.</h1>
        <small className="gest-home-heading-date">{homeDate}</small>
      </div>
      <section className="gest-ai-command">
        <div className="gest-insights-heading">
          <h2>O que eu faria agora <InfoHint fitViewport text="Esta base editorial prioriza planejamento, sustentabilidade financeira e relacionamento. Funciona mesmo sem cadastros e não inventa indicadores, estudos ou resultados. As orientações são gerais: confira a aplicabilidade ao seu negócio. Datas locais e fontes externas precisam de validação antes de serem apresentadas como informações atuais. A personalização automática e a curadoria de estudos ainda não estão conectadas." /></h2>
          <button className="gest-all-insights" onClick={() => setActive("Assistente")}>Ver todos os insights <span>→</span></button>
        </div>
        <div className="home-ai-analysis" data-ready={insightsReady}>
          {!insightsReady ? <div className="home-ai-thinking-layer" aria-live="polite"><AiThinkingPreview onReady={finishInsights} statusText="Preparando orientações..." /></div> : <>
          <div className="gest-ai-recommendations home-insight-grid">
            {recommendations.map(([title, detail, action, view, tone, classification]) => (
              <InsightActionCardPreview
                key={title}
                tone={tone}
                classification={classification}
                title={title}
                description={title==="Planeje os próximos 30 dias"?"Confira feriados e datas relevantes para seu público.":title==="Conheça sua margem"?"Revise custos e taxas antes de definir seus preços.":title==="Cuide do relacionamento"?"Confira os retornos e as preferências de contato.":"Confira vencimentos e recebimentos previstos."}
                action={action}
                onAction={() => setOpenedInsight({title,detail,action,view})}
              />
            ))}
          </div></>}
        </div>
        {openedInsight&&<div className="client-document-overlay" onMouseDown={event=>{if(event.target===event.currentTarget)setOpenedInsight(null);}} onKeyDown={event=>{if(event.key==="Escape")setOpenedInsight(null);}}><section className="client-record-panel home-insight-detail" role="dialog" aria-modal="true" aria-label={openedInsight.title}><header><h2>{openedInsight.title}</h2><button type="button" className="lab-create-activity" autoFocus aria-label="Fechar insight" onClick={()=>setOpenedInsight(null)}><X size={16}/></button></header><p>{openedInsight.detail}</p><footer className="client-record-footer"><button className="lab-create-activity" onClick={()=>{setActive(openedInsight.view);setOpenedInsight(null);}}>{openedInsight.action}</button></footer></section></div>}
        <form className="lab-search-form gest-ai-question" onSubmit={(event) => { event.preventDefault(); if (question.trim()) setActive("Assistente"); }}>
          <span className="gest-ai-question-brand"><Sparkles size={13} /> Gest IA</span>
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Pergunte qualquer coisa ao Gest IA sobre o seu negócio..." />
          <button className="visible" type="submit" aria-label="Enviar pergunta">→</button>
        </form>
      </section>

      <div className="gest-today-grid">
        <TimelinePreview onOpenAgenda={() => setActive("Agenda")} onOpenClinical={onOpenClinical} />
        <section className="gest-pending-panel">
          <h2>Pendências do dia</h2>
          <PendingConfirmations onOpen={()=>setActive("Agenda")}/>
          {[
            ["Contatos a responder", "Relacionamento", String(indicatorValue("Atendimento · A responder")), "Atendimento"],
            ["Valores vencidos", "Confira os lançamentos", String(readData<import("./finance-model").FinanceTransaction[]>("gest-finance-transactions", []).flatMap(row=>row.installments).filter(part=>!part.settledAt && part.status!=="cancelled" && part.dueDate<new Date().toLocaleDateString("en-CA")).length), "Financeiro"],
            ["Ordens pendentes", "Operação", String(readData<string[][]>(moduleKey("Ordens de Serviço"), []).filter(row=>row[5]!=="Concluída").length), "Ordens de Serviço"],
            ["Propostas pendentes", "Comercial", String(readData<string[][]>(moduleKey("Propostas"), []).filter(row=>row[5]!=="Aprovada").length), "Propostas"],
          ].map(([title, detail, count, view], index) => (
            <button key={title} onClick={() => setActive(view as View)} className={index === 2 ? "urgent" : ""}>
              <span><strong>{title}</strong><small>{detail}</small></span><b>{count}</b><i>›</i>
            </button>
          ))}
        </section>
      </div>

      <section className="gest-home-analytics">
        <header>
          <h2>Dados do meu negócio</h2>
          <button type="button" onClick={() => setActive("Relatórios")}>Ver visão completa →</button>
        </header>
        <div className="gest-custom-widgets gest-dashboard-grid" aria-label="Indicadores do negócio">
          {visibleHomeWidgets.map(renderHomeWidget)}
          <div className="gest-widget-picker">
            <button type="button" className="gest-widget-add" aria-label="Adicionar indicador à tela inicial" aria-expanded={widgetPickerOpen} onClick={() => setWidgetPickerOpen((value) => !value)}><Plus size={24} /><span>Indicador</span></button>
            {widgetPickerOpen ? <div className="gest-widget-menu">{widgetCatalog.filter(({ name }) => !(homeHasIndicatorData ? homeWidgets : visibleHomeWidgets).includes(name)).map(({ name, type }) => <button type="button" key={name} onClick={() => { saveHomeWidgets(homeHasIndicatorData ? [...homeWidgets, name] : [name, ...homeWidgets.filter(item => item !== name)]); setWidgetPickerOpen(false); }}><i>{type === "line" ? <LineChart size={15} /> : <Grid2X2 size={15} />}</i>{name}</button>)}</div> : null}
          </div>
        </div>
        {draggedWidget ? <div className="gest-widget-trash" role="button" aria-label={`Solte aqui para remover ${draggedWidget}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); saveHomeWidgets(homeWidgets.filter((entry) => entry !== draggedWidget)); setDraggedWidget(null); showAppToast("Indicador removido."); }}><Trash2 size={20} />Solte para remover</div> : null}
      </section>
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
  const source = indicatorSeries(title).slice(-Number(period.match(/\d+/)?.[0] || 12));
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
          <EmptyTableBody>
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
          </EmptyTableBody>
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
      <section className="v2-metrics detail-metrics client-overview-metrics">
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
        <EmptyTableBody>
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
        </EmptyTableBody>
      </table>
    </article>
  );
}

function SettingsView({
  dark,
  setDark,
  sidebarColor,
  setSidebarColor,
  appScale,
  setAppScale,
  initialTab = "Negócio",
  onPlans,
}: {
  dark: boolean;
  setDark: (value: boolean) => void;
  sidebarColor: string;
  setSidebarColor: (value: string) => void;
  appScale: number;
  setAppScale: (value: number) => void;
  initialTab?: string;
  onPlans?: () => void;
}) {
  const initialBusiness = {
  // A identificação da empresa é preenchida nas configurações.
    name: "",
    email: "",
    address: "",
    document: "",
    neighborhood: "",
    phone: "",
    cep: "",
    city: "",
    state: "",
  };
  const [settingsTabValue, setTab] = useState(initialTab);
  const [clinicalLetterhead,setClinicalLetterhead]=useState(emptyLetterhead);
  const access = useAccess();
  const tab = access.manage || ["Conta", "Aparência"].includes(settingsTabValue) ? settingsTabValue : "Conta";
  useEffect(() => setTab(initialTab), [initialTab]);
  const [notice, setNotice] = useState("");
  const [business, setBusiness] = useState(initialBusiness);
  const [savedBusiness, setSavedBusiness] = useState(initialBusiness);
  const [logoName, setLogoName] = useState("Demonstração Serviços Automotivos");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [resetConfirmOpen,setResetConfirmOpen] = useState(false);
  const [salesIntegration, setSalesIntegration] = useStoredData("gest-sales-integration", true);
  const [emailSummary, setEmailSummary] = useStoredData("gest-email-summary", true);
  const [calendarIntegration, setCalendarIntegration] = useState(false);
  const stats = [
    [Crown, "Plano atual", "Standard", "23 dias de teste", "amber"],
    [Users, "Usuários", "3 de 10", "30% da capacidade", "blue"],
    [UserRound, "Clientes", "1.248", "25% da capacidade", "teal"],
    [Package, "Catálogo", "230 itens", "12% da capacidade", "violet"],
  ] as const;
  const tabs = [
    [BriefcaseBusiness, "Negócio"],
    [FileText, "Documentos clínicos"],
    [MessageCircle, "Automações"],
    [Palette, "Aparência"],
    [UserRound, "Conta"],
    [Users, "Usuários e acessos"],
    [Crown, "Plano"],
    [CheckCircle2, "Segurança"],
    [Settings, "Integrações"],
    [Database, "Dados"],
  ] as const;
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };
  useEffect(() => {
    const storedBusiness = appStorage.getItem("gest-business-settings");
    if (!storedBusiness) return;
    try {
      const stored = JSON.parse(storedBusiness);
      const parsedBusiness = { ...initialBusiness, ...Object.fromEntries(Object.entries(stored ?? {}).filter(([key, value]) => key in initialBusiness && typeof value === "string")) };
      setBusiness(parsedBusiness);
      setSavedBusiness(parsedBusiness);
    } catch {
      appStorage.removeItem("gest-business-settings");
    }
  }, []);
  const updateBusiness = (field: keyof typeof business, value: string) => {
    setBusiness((current) => ({ ...current, [field]: value }));
  };
  const saveBusiness = () => {
    appStorage.setItem("gest-business-settings", JSON.stringify(business));
    setSavedBusiness(business);
    notify("Alterações salvas com sucesso.");
  };
  const cancelBusinessChanges = () => {
    setBusiness(savedBusiness);
    notify("Alterações restauradas.");
  };
  const resetLocalGestData = () => {
    if (!window.confirm("Limpar os dados personalizados e as preferências do GEST salvos neste navegador?")) return;
    setResetConfirmOpen(true);
  };
  const Toggle = ({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) => (
    <button type="button" className="settings-toggle" onClick={() => onChange(!checked)}>
      <span><b>{label}</b><small>{detail}</small></span>
      <i className={checked ? "switch on" : "switch"}><em /></i>
    </button>
  );
  return (
    <section className="settings-modern">
      {resetConfirmOpen ? <RecordDialog title="Confirmar limpeza dos dados locais" submitLabel="Limpar dados locais" fields={["Digite ZERAR para confirmar"]} onClose={()=>setResetConfirmOpen(false)} onSave={values=>{if(values["Digite ZERAR para confirmar"]!=="ZERAR")return;appStorage.clearNamespace();window.location.reload();}} /> : null}
      <StandardModuleTop
        title="Configurações"
        help="Gerencie as informações do negócio, sua conta e as preferências da plataforma."
      >
        {(access.manage ? stats : []).map(([Icon, label, value, detail, tone]) => (
          <InformativeMetricCardPreview key={label} title={label} value={value} change={detail} tone={tone} icon={Icon} />
        ))}
      </StandardModuleTop>
      <ScrollableTabBar className="v2-settings-tabs settings-modern-tabs" label="Seções de configurações">
        {tabs.filter(([, label]) => access.manage || ["Conta", "Aparência"].includes(label)).map(([Icon, label]) => (
          <button
            key={label}
            className={tab === label ? "active" : ""}
            onClick={() => setTab(label)}
          >
            <Icon size={15} />{label}
          </button>
        ))}
      </ScrollableTabBar>
      {tab === "Automações" ? <MessageAutomationSettings/> : tab === "Documentos clínicos" && access.manage ? <ClinicalLetterhead businessId={access.member?.businessId??"demo"} value={clinicalLetterhead} onChange={setClinicalLetterhead}/> : tab === "Usuários e acessos" && access.manage ? <AccessSettings /> : tab === "Aparência" ? (
        <section className="gest-appearance-settings settings-section-card v2-card">
          <header className="settings-section-head">
            <div><small>PERSONALIZAÇÃO</small><h2><Settings size={18} />Aparência do aplicativo</h2></div>
            <Palette size={21} />
          </header>
          <p>Personalize a cor da navegação e escolha entre modo claro e escuro.</p>
          <div className="gest-appearance-grid">
            <div className="settings-appearance-group">
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
            <div className="settings-appearance-group gest-scale-setting">
              <h3>Tamanho da interface</h3>
              <p>Aumente ou diminua todo o aplicativo.</p>
              <div className="gest-scale-control" role="group" aria-label="Tamanho da interface">
                <button type="button" onClick={() => setAppScale(Math.max(75, appScale - 5))} disabled={appScale <= 75} aria-label="Diminuir tamanho da interface"><ZoomOut size={19} /></button>
                <span><b>{appScale}%</b><small>Tamanho atual</small></span>
                <button type="button" onClick={() => setAppScale(Math.min(125, appScale + 5))} disabled={appScale >= 125} aria-label="Aumentar tamanho da interface"><ZoomIn size={19} /></button>
              </div>
            </div>
            <div className="settings-appearance-group">
              <h3>Tema da interface</h3>
              <p>Altere o contraste de toda a área de trabalho.</p>
              <button className="gest-theme-setting" onClick={() => { setDark(!dark); notify(`Modo ${dark ? "claro" : "escuro"} ativado.`); }}>
                <span>{dark ? <Moon size={20} /> : <Sun size={20} />}<b>{dark ? "Modo escuro" : "Modo claro"}</b></span>
                <i className={dark ? "switch on" : "switch"}><em /></i>
              </button>
            </div>
          </div>
          <aside className="gest-color-preview" style={{ backgroundColor: sidebarColor }}>
            <b>gest.</b><span>Prévia da barra lateral</span>
          </aside>
        </section>
      ) : tab === "Negócio" ? (
        <article className="v2-card v2-business-form settings-section-card">
          <header className="settings-section-head"><div><small>CADASTRO DO NEGÓCIO</small><h2><Settings size={18} />Informações do negócio</h2></div><BriefcaseBusiness size={21} /></header>
          <p>
            Atualize os dados principais da sua empresa. Essas informações serão
            utilizadas em documentos, propostas e comunicados.
          </p>
          <div className="settings-business-grid">
            <label className="settings-form-field">
              <BriefcaseBusiness size={18} />
              <span><small>Nome do negócio</small><input value={business.name} onChange={(event) => updateBusiness("name", event.target.value)} /></span>
            </label>
            <div className="settings-form-field settings-logo-field">
              <Wrench size={18} />
              <span><small>Logo do negócio</small><strong>{logoName}</strong></span>
              <input
                ref={logoInputRef}
                className="settings-logo-input"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setLogoName(file.name);
                  notify("Nova logo selecionada.");
                }}
              />
              <button type="button" onClick={() => logoInputRef.current?.click()}>Alterar logo</button>
            </div>
            <label className="settings-form-field">
              <MessageCircle size={18} />
              <span><small>E-mail</small><input type="email" value={business.email} onChange={(event) => updateBusiness("email", event.target.value)} /></span>
            </label>
            <label className="settings-form-field">
              <Home size={18} />
              <span><small>Endereço</small><input value={business.address} onChange={(event) => updateBusiness("address", event.target.value)} /></span>
            </label>
            <label className="settings-form-field">
              <FileText size={18} />
              <span><small>CPF/CNPJ</small><input value={business.document} onChange={(event) => updateBusiness("document", event.target.value)} /></span>
            </label>
            <label className="settings-form-field">
              <Home size={18} />
              <span><small>Bairro</small><input value={business.neighborhood} onChange={(event) => updateBusiness("neighborhood", event.target.value)} /></span>
            </label>
            <label className="settings-form-field">
              <UserRound size={18} />
              <span><small>Telefone</small><input value={business.phone} onChange={(event) => updateBusiness("phone", event.target.value)} /></span>
            </label>
            <label className="settings-form-field">
              <Home size={18} />
              <span><small>CEP</small><input value={business.cep} onChange={(event) => updateBusiness("cep", event.target.value)} /></span>
            </label>
            <label className="settings-form-field">
              <Home size={18} />
              <span><small>Cidade</small><input value={business.city} onChange={(event) => updateBusiness("city", event.target.value)} /></span>
            </label>
            <div className="settings-form-field settings-select-field">
              <Settings size={18} />
              <ClientSelect compact label="Estado" value={business.state} onChange={(value) => updateBusiness("state", value)} options={["SP", "RJ", "MG", "AM"]} />
            </div>
          </div>
          <footer className="settings-form-actions">
            <button type="button" onClick={cancelBusinessChanges}>Cancelar</button>
            <button type="button" className="primary" onClick={saveBusiness}><CheckCircle2 size={15} />Salvar alterações</button>
          </footer>
          {notice && <div className="settings-save-confirmation" role="status"><CheckCircle2 size={15} />{notice}</div>}
        </article>
      ) : tab === "Conta" ? (
        <section className="settings-content-grid">
          <article className="v2-card settings-section-card settings-profile-card"><header className="settings-section-head"><div><small>CONTA PRINCIPAL</small><h2><Settings size={18} />Perfil e notificações</h2></div><UserRound size={21} /></header><div className="settings-profile-summary"><i>{access.member?.name.split(" ").slice(0,2).map((part) => part[0]).join("")}</i><span><b>{access.member?.name}</b><small>{access.member?.email}</small></span><button type="button" onClick={() => notify("Os dados abaixo correspondem ao seu perfil de acesso.")}>Editar perfil</button></div><div className="settings-form-grid"><label>Nome completo<input defaultValue={access.member?.name} /></label><label>E-mail de acesso<input defaultValue={access.member?.email} /></label></div><Toggle label="Resumo por e-mail" detail="Receba um resumo semanal com os principais indicadores." checked={emailSummary} onChange={setEmailSummary} /><footer><button className="v2-primary" onClick={() => notify("A gravação do perfil deve ser conectada ao Supabase antes do uso real.")}><CheckCircle2 size={15} />Salvar conta</button></footer></article>
          <article className="v2-card settings-section-card settings-side-card"><small>ACESSOS</small><h2><Settings size={18} />Sessão atual</h2><p>Você está usando este dispositivo agora.</p><span className="settings-status">● Sessão neste dispositivo</span><button type="button" onClick={() => notify("Use Sair no menu da conta para encerrar a sessão deste dispositivo.")}>Gerenciar sessões</button></article>
        </section>
      ) : tab === "Plano" ? (
        <SettingsPlans onCompare={onPlans} />
      ) : tab === "Segurança" ? (
        <section className="settings-content-grid"><article className="v2-card settings-section-card"><header className="settings-section-head"><div><small>PROTEÇÃO DA CONTA</small><h2><Settings size={18} />Segurança e acesso</h2></div><CheckCircle2 size={21} /></header><p>A autenticação em duas etapas exige configuração e validação pelo provedor de acesso. Não está ativada nesta versão.</p><a className="lab-create-activity" href="/entrar">Gerenciar acesso e recuperação de senha</a></article><article className="v2-card settings-section-card settings-side-card"><small>AMBIENTE</small><h2>{access.mode === "demo" ? "Demonstração local" : "Autenticação Supabase"}</h2><p>{access.mode === "demo" ? "Não utilize informações reais de clientes neste ambiente. Os perfis locais servem para testar os acessos." : "As permissões são carregadas do empreendimento vinculado à sua conta."}</p></article></section>
      ) : tab === "Dados" ? (
        <section className="settings-content-grid">
          <article className="v2-card settings-section-card settings-data-reset-card"><header className="settings-section-head"><div><small>PREPARAÇÃO PARA NOVO CLIENTE</small><h2><Settings size={18} />Limpar dados salvos neste navegador</h2></div><Database size={21} /></header><p>Remove configurações do negócio, organização de documentos, indicadores personalizados e outras preferências locais do GEST neste navegador. A ação exige confirmação digitada.</p><button type="button" className="settings-reset-button" onClick={resetLocalGestData}><Trash2 size={16} />Limpar dados locais</button><small className="settings-reset-note">Esta prévia guarda dados apenas no navegador. Informações demonstrativas incorporadas às telas voltam ao recarregar; a limpeza completa da base de um cliente será configurada quando houver armazenamento real.</small></article>
          <article className="v2-card settings-section-card settings-side-card"><small>ESCOPO ATUAL</small><h2><Settings size={18} />Dados locais da prévia</h2><p>A limpeza afeta somente chaves do GEST neste navegador e não altera outros sites.</p></article>
        </section>
      ) : (
        <section className="settings-content-grid"><article className="v2-card settings-section-card"><header className="settings-section-head"><div><small>CONEXÕES</small><h2><Settings size={18} />Integrações do Gest</h2></div><Settings size={21} /></header><Toggle label="Vendas integradas" detail="Envie vendas concluídas automaticamente ao Financeiro." checked={salesIntegration} onChange={setSalesIntegration} /><Toggle label="Agenda externa" detail="Sincronize a agenda do Gest com seu calendário." checked={calendarIntegration} onChange={setCalendarIntegration} /></article><article className="v2-card settings-section-card settings-side-card"><small>INTEGRAÇÕES ATIVAS</small><h2>{salesIntegration ? "1 conexão ativa" : "Nenhuma conexão ativa"}</h2><p>Você pode ativar ou desativar integrações a qualquer momento.</p><button type="button" onClick={() => notify("Integrações atualizadas.")}>Salvar integrações</button></article></section>
      )}
    </section>
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
      ["Total vendido", "R$ 82.450", "no mês", "green"],
      ["Vendas abertas", "18", "em andamento", "blue"],
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
    rows: [],
  },
  Catálogo: {
    subtitle:
      "Organize produtos e serviços, preços, categorias e disponibilidade.",
    label: "Novo item",
    metrics: [
      ["Itens cadastrados", "230", "produtos e serviços", "gray"],
      ["Ativos", "215", "disponíveis para venda", "green"],
      ["Estoque baixo", "12", "precisam de reposição", "orange"],
      ["Valor do catálogo", "R$ 96.300", "valor estimado", "blue"],
    ],
    filters: ["Tipo", "Status"],
    tabs: ["Dados", "Preço", "Estoque", "Histórico", "Categorias"],
    rows: [],
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
    rows: [],
  },
  Documentos: {
    subtitle:
      "Centralize contratos, arquivos de clientes, vendas e documentos internos.",
    label: "Upload",
    metrics: [
      ["Total de arquivos", "128", "no sistema", "gray"],
      ["Vinculados a clientes", "74", "clientes e vendas", "blue"],
      ["Arquivos da empresa", "38", "sem cliente", "gray"],
      ["Uploads recentes", "12", "nos últimos 7 dias", "blue"],
    ],
    filters: ["Categoria", "Tipo", "Vínculo"],
    tabs: ["Dados", "Vínculos", "Histórico"],
    rows: [],
  },
  Estoque: {
    subtitle: "Monitore quantidades, entradas, saídas, alertas e responsáveis.",
    label: "Adicionar produto",
    metrics: [
      ["Produtos em estoque", "218", "itens cadastrados", "gray"],
      ["Estoque crítico", "12", "abaixo do mínimo", "red"],
      ["Valor em estoque", "R$ 41.800", "valor atual", "blue"],
      ["Entradas no mês", "56", "movimentações", "green"],
    ],
    filters: ["Status", "Categoria", "Responsável"],
    tabs: ["Dados", "Entradas", "Saídas", "Movimentações", "Alertas"],
    rows: [],
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
    rows: [],
  },
  Assistente: {
    subtitle:
      "Insights automáticos para riscos, oportunidades e próximas ações.",
    label: "Atualizar análise",
    metrics: [
      ["Insights ativos", "12", "recomendações atuais", "blue"],
      ["Oportunidades", "5", "potenciais identificados", "green"],
      ["Riscos", "3", "precisam de atenção", "red"],
      ["Impacto estimado", "R$ 12.400", "em oportunidades", "green"],
    ],
    filters: ["Área", "Impacto", "Status"],
    tabs: ["Insight", "Evidências", "Ações", "Histórico"],
    rows: [],
  },
  Manutenção: {
    subtitle:
      "Gerencie equipamentos, custos, manutenções programadas e alertas.",
    label: "Novo equipamento",
    metrics: [
      ["Equipamentos", "42", "cadastrados", "gray"],
      ["Próximas manutenções", "6", "nos próximos 30 dias", "orange"],
      ["Custo no mês", "R$ 5.820", "despesa de manutenção", "orange"],
      ["Em dia", "36", "equipamentos revisados", "green"],
    ],
    filters: ["Status", "Categoria", "Responsável"],
    tabs: ["Equipamento", "Manutenção", "Histórico", "Alertas"],
    rows: [],
  },
  Equipe: {
    subtitle: "Organize membros, cargos, permissões e acessos ao sistema.",
    label: "Adicionar membro",
    metrics: [
      ["Usuários utilizados", "3 / 10", "30% do plano", "gray"],
      ["Administradores", "1", "com acesso total", "gray"],
      ["Membros ativos", "3", "na equipe", "green"],
      ["Convites pendentes", "1", "aguardando aceite", "orange"],
    ],
    filters: ["Cargo", "Status", "Acesso"],
    tabs: ["Dados", "Permissões", "Cargos", "Acessos"],
    rows: [],
  },
  "Precificação": {
    subtitle: "Calcule preços sustentáveis para produtos e serviços.",
    label: "Nova precificação",
    metrics: [
      ["Itens precificados", "86", "produtos e serviços", "gray"],
      ["Margem média", "41%", "carteira atual", "green"],
      ["A revisar", "7", "custos desatualizados", "orange"],
      ["Última atualização", "Hoje", "às 09:20", "gray"],
    ],
    filters: ["Tipo", "Status"],
    tabs: ["Custos", "Impostos", "Margem", "Preço sugerido", "Histórico"],
    rows: [],
  },
};

Object.assign(modules, {
  Tarefas: {
    subtitle: "Organize pendências, responsáveis e prazos da equipe.",
    label: "Nova tarefa",
    metrics: [["Tarefas abertas", "18", "5 para hoje", "blue"], ["Atrasadas", "3", "precisam de atenção", "red"], ["Concluídas", "42", "neste mês", "green"], ["Responsáveis", "6", "com tarefas ativas", "gray"]],
    filters: ["Status", "Prioridade", "Responsável"],
    tabs: ["Dados", "Checklist", "Comentários", "Histórico"],
    rows: [["TR-018", "Enviar proposta comercial", "Comercial", "Hoje, 14:00", "Marina", "Em andamento"], ["TR-017", "Validar orçamento", "Financeiro", "Hoje, 16:00", "João", "Pendente"], ["TR-016", "Repor materiais", "Operação", "Amanhã", "Carlos", "Pendente"]],
  },
  Projetos: {
    subtitle: "Acompanhe entregas, etapas e trabalho em equipe.",
    label: "Novo projeto",
    metrics: [["Projetos ativos", "8", "em andamento", "blue"], ["No prazo", "6", "75% da carteira", "green"], ["Em atenção", "2", "com risco de atraso", "orange"], ["Entregas", "12", "neste mês", "gray"]],
    filters: ["Status", "Responsável"], tabs: ["Visão geral", "Tarefas", "Equipe", "Arquivos", "Histórico"],
    rows: [["PR-008", "Implantação Bella Modas", "Cliente", "18 ago 2026", "72% concluído", "Em andamento"], ["PR-007", "Expansão unidade Centro", "Interno", "25 ago 2026", "48% concluído", "Atenção"]],
  },
  Atendimento: {
    subtitle: "Centralize solicitações e acompanhe cada resolução.", label: "Novo atendimento",
    metrics: [["Abertos", "14", "aguardando solução", "blue"], ["Urgentes", "2", "prioridade alta", "red"], ["Resolvidos", "86", "neste mês", "green"], ["Tempo médio", "2h 18m", "até a resolução", "gray"]],
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
    metrics: [["Em execução", "9", "serviços ativos", "blue"], ["Atrasadas", "2", "requerem ação", "red"], ["Concluídas", "34", "neste mês", "green"], ["Aguardando peças", "3", "ordens pausadas", "orange"]],
    filters: ["Status", "Responsável", "Prazo"], tabs: ["Serviço", "Cliente", "Equipe", "Materiais", "Histórico"],
    rows: [["OS-1024", "Instalação de balcão", "Instalação", "Hoje, 14:00", "João Paulo", "Em execução"], ["OS-1021", "Manutenção preventiva", "Manutenção", "Ontem", "Carlos", "Atrasada"]],
  },
  Compras: {
    subtitle: "Acompanhe preços, identifique boas oportunidades e escolha quando comprar.", label: "Acompanhar produto",
    metrics: [["Produtos em avaliação", "0", "itens acompanhados", "blue"], ["Bom momento de compra", "0", "com sinal verde", "green"], ["Compras do mês", "R$ 18.920", "valor demonstrativo", "violet"], ["Economia estimada", "R$ 0", "0% abaixo da referência", "green"]],
    filters: ["Status", "Fornecedor", "Entrega"], tabs: ["Pedido", "Itens", "Fornecedor", "Recebimento", "Histórico"],
    rows: [["PC-087", "Reposição de materiais", "Tech Solutions", "18 ago 2026", "R$ 4.280", "Aprovado"], ["PC-086", "Produtos de limpeza", "Casa Norte", "20 ago 2026", "R$ 890", "Pendente"]],
  },
  Fornecedores: {
    subtitle: "Gerencie parceiros, condições e histórico de compras.", label: "Novo fornecedor",
    metrics: [["Fornecedores ativos", "38", "cadastrados", "green"], ["Compras no mês", "R$ 18.920", "valor acumulado", "blue"], ["Com pendências", "3", "documentos ou entregas", "orange"], ["Categorias", "12", "grupos de fornecimento", "gray"]],
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
    "Documentos",
    "Observações",
  ],
  rows: clients,
};

type ClientAttachment = { name: string; type: string; date: string; url?: string };
const sampleClientAttachments: ClientAttachment[] = [];

/** Conteúdo específico do cliente: cada aba usa o formato adequado ao tipo de informação. */
function ClientDetailContent({ tab, record, onEditPhoto, documentStorageKey = `gest-client-documents-${record[0]}`, initialDocuments = sampleClientAttachments }: { tab: string; record: string[]; onEditPhoto?:()=>void; documentStorageKey?: string; initialDocuments?: ClientAttachment[] }) {
  const [observation, setObservation] = useState("");
  const [clientPhoto, setClientPhoto] = useState<string | null>(null);
  const [clientDocuments, setClientDocuments] = useState<ClientAttachment[]>(initialDocuments);
  const [documentPreview, setDocumentPreview] = useState<ClientAttachment | null>(null);
  const [pendingDocumentDeletion, setPendingDocumentDeletion] = useState<number | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  useEffect(() => { try { setObservation(appStorage.getItem(`gest-client-observation-${record[0]}`) ?? ""); } catch { /* Keep the note visible. */ } }, [record[0]]);
  useEffect(() => { try { const stored = JSON.parse(appStorage.getItem(documentStorageKey) || "null"); setClientDocuments(Array.isArray(stored) ? stored.filter((item): item is ClientAttachment => item && typeof item.name === "string" && typeof item.type === "string" && typeof item.date === "string") : initialDocuments); } catch { setClientDocuments(initialDocuments); } }, [documentStorageKey]);
  const saveDocuments = (next: ClientAttachment[]) => {
    setClientDocuments(next);
    try { appStorage.setItem(documentStorageKey, JSON.stringify(next)); } catch { /* Keep attachments available for this visit. */ }
  };
  const printDocument = async (document: ClientAttachment) => {
    const frame = window.document.createElement("iframe");
    frame.title = `Imprimir ${document.name}`;
    frame.setAttribute("sandbox", "allow-same-origin allow-modals");
    frame.style.cssText = "position:fixed;left:-10000px;width:800px;height:1000px;border:0";
    frame.onload = () => { frame.contentWindow?.focus(); frame.contentWindow?.print(); };
    let printUrl: string | undefined;
    if (safeAttachmentUrl(document.url)) {
      try {
        printUrl = URL.createObjectURL(await (await fetch(document.url)).blob());
        frame.src = printUrl;
      } catch { setDocumentPreview(document); return; }
    }
    else {
      const escapeText = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
      frame.srcdoc = `<html><head><title>${escapeText(document.name)}</title><style>body{font:16px Arial;padding:32px;color:#17243e}h1{font-size:22px}</style></head><body><h1>${escapeText(document.name)}</h1><p>${escapeText(document.type)} · ${escapeText(document.date)}</p><p>Arquivo de exemplo. Anexe o documento original para imprimir seu conteúdo.</p></body></html>`;
    }
    window.document.body.appendChild(frame);
    window.setTimeout(() => { frame.remove(); if (printUrl) URL.revokeObjectURL(printUrl); }, 60_000);
  };
  const directoryPatient=readData<Client[]>("gest-clients",[]).find(row=>row.id===(record[7]??record[0])) ?? readData<Client[]>("gest-clients",[]).find(row=>row.name===record[1]);
  const email = directoryPatient?.email || "Não informado";
  const visiblePhoto=directoryPatient?.photo || clientPhoto;
  const birthDate = record[6] ? (/^\d{4}-\d{2}-\d{2}$/.test(record[6]) ? new Date(`${record[6]}T12:00:00`).toLocaleDateString("pt-BR") : record[6]) : "Não informada";
  const history = readData<import("./finance-model").FinanceTransaction[]>("gest-finance-transactions", []).filter(item=>item.customer===record[1]).map(item=>({date:item.competenceDate,service:item.description,reference:item.id,payment:item.paymentMethod,installments:item.installments.length+"x",amount:(item.grossCents/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}),status:item.installments.every(part=>part.status==="paid") ? "Pago" : "Pendente"}));
  const attachClientDocument = async (file?: File) => {
    if (!file) return;
    try { await validateAttachment(file); setAttachmentError(""); } catch (cause) { setAttachmentError(cause instanceof Error ? cause.message : "Arquivo inválido."); return; }
    const add = (url?: string) => {
      const next = [{ name: file.name, type: file.type || "Arquivo", date: new Date().toLocaleDateString("pt-BR"), ...(url ? { url } : {}) }, ...clientDocuments];
      saveDocuments(next);
    };
    const reader = new FileReader(); reader.onload = () => add(typeof reader.result === "string" ? reader.result : undefined); reader.readAsDataURL(file);
  };
  if (tab === "Dados") return (
    <DetailPanel title="Dados do paciente">
      <section className="client-record-photo">
        <div className="client-record-avatar">
          {visiblePhoto ? <img src={visiblePhoto} alt={`Foto de ${record[1]}`} /> : record[1].trim().split(/\s+/).slice(0,2).map(part=>part[0]).join("").toUpperCase()}
        </div>
        <div>
          <strong>{record[1]}</strong><span>Dados cadastrais</span>
        </div>
        {onEditPhoto ? <button type="button" className="lab-create-activity" onClick={onEditPhoto}><Edit3 size={15}/>Editar foto</button> : <label className="lab-create-activity">
          <Edit3 size={15} /> Editar foto
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setClientPhoto(URL.createObjectURL(file));
            }}
          />
        </label>}
      </section>
      <dl className="client-record-fields">{[["Nº", record[0]], ["Nome", record[1]], ["Tipo",record[2]], ["Status",record[5]], ["Total vendido",record[4]], ["CPF/CNPJ", directoryPatient?.taxId || "Não informado"], ["E-mail", email], ["Telefone / WhatsApp", directoryPatient?.phone || "Não informado"], ["Data de nascimento", birthDate], ["Endereço", [directoryPatient?.address,directoryPatient?.city].filter(Boolean).join(" · ") || "Não informado"], ["Origem", directoryPatient?.source || "Não informado"], ["Último contato", record[3] || "Não informado"]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </DetailPanel>
  );
  if (tab === "Histórico") return (
    <DetailPanel title="Histórico">
      <div className="client-record-table-scroll">
        <table className="client-record-table"><thead><tr><th scope="col">Nº</th><th scope="col">Serviço / item</th><th scope="col">Data</th><th scope="col">Valor</th><th scope="col">Pagamento</th><th scope="col">Parcelas</th><th scope="col">Situação</th></tr></thead>
          <EmptyTableBody>{history.map((item, index) => <tr key={item.date}><td>{index + 1}</td><td><span>{item.service}</span><small>{item.reference}</small></td><td>{item.date}</td><td>{item.amount}</td><td>{item.payment}</td><td>{item.installments}</td><td><span className={`client-record-status${item.status === "Pendente" ? " is-pending" : ""}`}>{item.status}</span></td></tr>)}</EmptyTableBody>
        </table>
      </div>
    </DetailPanel>
  );
  if (tab === "Documentos") return <>
    <DetailPanel title="Documentos" actions={<label className="lab-create-activity client-record-upload"><Plus size={15} />Anexar documento<input aria-label="Anexar documento" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={(event) => { void attachClientDocument(event.target.files?.[0]); event.target.value = ""; }} /></label>}>
      <div className="client-record-table-scroll">
        <table className="client-record-table client-record-documents"><thead><tr><th scope="col">Nº</th><th scope="col">Documento</th><th scope="col">Tipo</th><th scope="col">Data</th><th scope="col">Ações</th></tr></thead>
          <EmptyTableBody>{clientDocuments.map((document, index) => <tr key={`${document.name}-${index}`}><td>{index + 1}</td><td><span className="client-record-file"><FileText size={17} />{document.name}</span></td><td>{document.type || "Arquivo"}</td><td>{document.date}</td><td><div className="client-record-document-actions"><button type="button" className="lab-create-activity" onClick={() => setDocumentPreview(document)}>Abrir</button><button type="button" className="lab-create-activity" aria-label={`Imprimir ${document.name}`} onClick={() => printDocument(document)}><Printer size={15} />Imprimir</button><button type="button" className="lab-create-activity" aria-label={`Apagar ${document.name}`} onClick={() => setPendingDocumentDeletion(index)}><Trash2 size={15} />Apagar</button></div></td></tr>)}</EmptyTableBody>
        </table>
      </div>
      {attachmentError ? <p role="alert">{attachmentError}</p> : null}
      {clientDocuments.length === 0 ? <p className="client-record-empty">Nenhum documento anexado.</p> : null}
    </DetailPanel>
    {documentPreview ? <div className="client-document-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDocumentPreview(null); }}><section className="client-document-preview" role="dialog" aria-modal="true" aria-label={`Prévia de ${documentPreview.name}`}><header><h2>{documentPreview.name}</h2><button type="button" className="lab-create-activity" onClick={() => setDocumentPreview(null)}>Voltar</button></header>{safeAttachmentUrl(documentPreview.url) ? <iframe sandbox="allow-same-origin allow-modals" title={`Prévia de ${documentPreview.name}`} src={documentPreview.url} /> : <div><FileText size={38} /><strong>Arquivo de exemplo</strong><p>Este item ilustra um anexo do cliente. Envie o arquivo real para abrir o conteúdo nesta prévia.</p></div>}</section></div> : null}
    {pendingDocumentDeletion !== null ? <div className="client-document-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDocumentDeletion(null); }}><section className="client-record-panel client-document-delete-dialog" role="dialog" aria-modal="true" aria-label="Apagar documento"><header><h2>Apagar documento?</h2></header><p>{clientDocuments[pendingDocumentDeletion]?.name}</p><footer className="client-record-footer"><button type="button" className="lab-create-activity" onClick={() => setPendingDocumentDeletion(null)}>Cancelar</button><button type="button" className="lab-create-activity" onClick={() => { saveDocuments(clientDocuments.filter((_, index) => index !== pendingDocumentDeletion)); setPendingDocumentDeletion(null); }}>Apagar documento</button></footer></section></div> : null}
  </>;
  return <DetailPanel title="Observações"><textarea className="client-record-note" aria-label="Observações do cliente" value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Escreva uma observação sobre este cliente..." /><footer className="client-record-footer"><button type="button" className="lab-create-activity" onClick={() => { try { appStorage.setItem(`gest-client-observation-${record[0]}`, observation); } catch { /* Keep the current note visible for this visit. */ } }}><CheckCircle2 size={15} />Salvar observação</button></footer></DetailPanel>;
}

function DetailPanel({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return <section className="client-record-panel"><header><h2>{title}</h2>{actions}</header>{children}</section>;
}

/** Página de detalhe compartilhada: mantém o fluxo de página inteira usado em Clientes. */
function FullDetailView({
  view,
  record,
  onBack,
  onOpenClinical,
}: {
  view: string;
  record: string[];
  onBack: () => void;
  onOpenClinical?: (record: string[]) => void;
}) {
  const access = useAccess();
  const config = modules[view] ?? modules["Vendas"];
  const [tab, setTab] = useState(config.tabs[0]);
  const [editOpen, setEditOpen] = useState(false);
  const [detailDraft, setDetailDraft] = useState<Record<string,string>>({});
  const [editedValues, setEditedValues] = useStoredData<Record<string,string>>(`gest-record-details-${view}-${record[0]}`, {});
  const contents: Record<
    string,
    { title: string; description: string; items: [string, string][] }
  > = {
    Dados: {
      title: "Dados do cadastro",
      description: "Informações principais e identificação deste registro.",
      items: [
        ["Nº", record[0]],
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
        ["Criado em", "Não informado"],
        ["Última atualização", record[3]],
        ["Responsável", "Não informado"],
        ["Alteração recente", "Não informado"],
      ],
    },
    Vendas: {
      title: "Vendas relacionadas",
      description: "Pedidos e serviços vinculados a este registro.",
      items: [
        ["Venda #VND-1278", "Não informado"],
        ["Venda #VND-1264", "Não informado"],
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
        ["Forma de pagamento", "Não informado"],
        ["Última movimentação", record[3]],
      ],
    },
    Parcelas: {
      title: "Parcelas e vencimentos",
      description:
        "Cronograma de parcelas, vencimentos e situação de cada cobrança.",
      items: [
        ["Parcela atual", "Não informado"],
        ["Vencimento", record[3]],
        ["Valor da parcela", record[4]],
        ["Situação", record[5]],
      ],
    },
    Documentos: {
      title: "Documentos",
      description: "Arquivos e comprovantes associados ao cadastro.",
      items: [
        ["Contrato principal", "Não informado"],
        ["Comprovante", "Não informado"],
        ["Último upload", record[3]],
        ["Responsável", "Não informado"],
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
        ["Observação atual", "Não informado"],
        ["Próximo contato", "Não informado"],
        ["Responsável", "Não informado"],
        ["Visibilidade", "Não informado"],
      ],
    },
    Itens: {
      title: "Itens",
      description: "Produtos e serviços incluídos nesta operação.",
      items: [
        ["Item principal", record[1]],
        ["Quantidade", "Não informado"],
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
        ["Forma", "Não informado"],
        ["Vencimento", record[3]],
      ],
    },
    Comprovantes: {
      title: "Comprovantes",
      description: "Comprovantes e anexos da operação.",
      items: [
        ["Comprovante principal", "Não informado"],
        ["Status", "Não informado"],
        ["Data", record[3]],
        ["Responsável", "Não informado"],
      ],
    },
    "Recibo / PDF": {
      title: "Recibo / PDF",
      description: "Documentos gerados para compartilhar ou imprimir.",
      items: [
        ["Recibo", "Não informado"],
        ["Documento", "Não informado"],
        ["Emissão", record[3]],
        ["Situação", "Não informado"],
      ],
    },
    Preço: {
      title: "Preço",
      description: "Valores, margem e condições comerciais.",
      items: [
        ["Preço atual", record[4]],
        ["Tabela", "Não informado"],
        ["Margem estimada", "Não informado"],
        ["Atualização", record[3]],
      ],
    },
    Estoque: {
      title: "Estoque",
      description: "Quantidade, mínimo e disponibilidade.",
      items: [
        ["Quantidade atual", record[2]],
        ["Status", record[5]],
        ["Responsável", "Não informado"],
        ["Última movimentação", record[3]],
      ],
    },
    Categorias: {
      title: "Categorias",
      description: "Classificação e agrupamentos deste item.",
      items: [
        ["Categoria", record[2]],
        ["Subcategoria", "Não informado"],
        ["Visibilidade", "Não informado"],
        ["Atualização", record[3]],
      ],
    },
    Entradas: {
      title: "Entradas",
      description: "Entradas registradas para este item.",
      items: [
        ["Última entrada", record[3]],
        ["Quantidade", "Não informado"],
        ["Responsável", "Não informado"],
        ["Documento", "Não informado"],
      ],
    },
    Saídas: {
      title: "Saídas",
      description: "Saídas e reservas realizadas.",
      items: [
        ["Última saída", record[3]],
        ["Quantidade", "Não informado"],
        ["Motivo", "Não informado"],
        ["Responsável", "Não informado"],
      ],
    },
    Movimentações: {
      title: "Movimentações",
      description: "Histórico de entradas, saídas e ajustes.",
      items: [
        ["Movimentação recente", "Não informado"],
        ["Data", record[3]],
        ["Responsável", "Não informado"],
        ["Saldo", record[2]],
      ],
    },
    Alertas: {
      title: "Alertas",
      description: "Alertas operacionais e recomendações.",
      items: [
        ["Status", record[5]],
        ["Alerta atual", "Não informado"],
        ["Prioridade", "Não informado"],
        ["Responsável", "Não informado"],
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
        ["Próxima ação", "Não informado"],
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
        ["Base analisada", "Não informado"],
        ["Última atualização", record[3]],
        ["Confiabilidade", "Não informado"],
        ["Área", record[2]],
      ],
    },
    Ações: {
      title: "Ações recomendadas",
      description: "Próximas ações sugeridas para este insight.",
      items: [
        ["Ação sugerida", "Não informado"],
        ["Impacto estimado", record[4]],
        ["Prioridade", record[5]],
        ["Responsável", "Não informado"],
      ],
    },
    Equipamento: {
      title: "Equipamento",
      description: "Dados e identificação do equipamento.",
      items: [
        ["Equipamento", record[1]],
        ["Categoria", record[2]],
        ["Status", record[5]],
        ["Responsável", "Não informado"],
      ],
    },
    Manutenção: {
      title: "Manutenção",
      description: "Agendamentos, custos e atividades de manutenção.",
      items: [
        ["Próxima manutenção", record[3]],
        ["Custo", record[4]],
        ["Status", record[5]],
        ["Responsável", "Não informado"],
      ],
    },
    Permissões: {
      title: "Permissões",
      description: "Permissões concedidas a este membro.",
      items: [
        ["Perfil", record[2]],
        ["Acesso comercial", "Não informado"],
        ["Acesso financeiro", "Não informado"],
        ["Última revisão", record[3]],
      ],
    },
    Cargos: {
      title: "Cargo",
      description: "Cargo e responsabilidades do membro.",
      items: [
        ["Cargo", record[2]],
        ["Área", "Não informado"],
        ["Status", record[5]],
        ["Gestor", "Não informado"],
      ],
    },
    Acessos: {
      title: "Acessos",
      description: "Registro de acessos e dispositivos.",
      items: [
        ["Último acesso", record[3]],
        ["Dispositivo", "Não informado"],
        ["Status", record[5]],
        ["Autenticação", "Não informado"],
      ],
    },
  };
  const originalInputs = readData<Record<string,string>>(`gest-record-inputs-${view}-${record[0]}`, {});
  const lead = view === "CRM" ? readData<Array<{id:string;owner:string}>>("gest-crm-leads", []).find(item=>item.id===record[0]) : undefined;
  const responsible = originalInputs.Responsável || lead?.owner || "Não informado";
  const content = contents[tab] ?? contents["Dados"];
  const clientRank = view === "Clientes" ? getClientRanking(record[0]) : null;
  // Mantém todas as subabas completas, sem repetir o mesmo conteúdo entre módulos.
  const detailedItems = [
    ...content.items,
    ["Responsável pelo registro", "Não informado"],
    ["Última atualização", record[3]],
  ].slice(0, 6).map(([label, value]) => [label, editedValues[`${tab}:${label}`] ?? (/responsável/i.test(label) ? responsible : originalInputs[label] ?? value)] as [string, string]);
  return (
    <section className="module-detail-page">
      <div className="v2-detail-head">
        <div className="detail-heading-copy">
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
          {view === "Clientes" && onOpenClinical && access.allowed("Prontuário") ? <button type="button" className="lab-create-activity" onClick={() => onOpenClinical(record)}><Heart size={16} />Abrir prontuário</button> : null}
          <button className="danger">
            <Trash2 size={17} />
            Excluir
          </button>
          <button type="button" className="lab-create-activity detail-back-button" onClick={onBack}>
            <ChevronLeft size={16} /> Voltar
          </button>
        </div>
      </div>
      <section className="v2-metrics detail-metrics client-overview-metrics">
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
          value={responsible}
          detail="Responsável cadastrado"
          tone="green"
        />
      </section>
      <nav className="detail-category-tabs" aria-label={`Seções de ${view}`} style={{ gridTemplateColumns: `repeat(${config.tabs.length}, minmax(0, 1fr))` }}>
          {config.tabs.map((item) => (
            <button type="button" key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>
          ))}
      </nav>
      {/* Clientes possui uma ficha própria: cada aba usa o formato mais útil para sua informação. */}
      {view === "Clientes" ? (
        <ClientDetailContent tab={tab} record={record} />
      ) : ["Documentos", "Documento", "Comprovantes", "Recibo / PDF"].includes(tab) ? (
        <ClientDetailContent key={`${view}-${record[0]}-${tab}`} tab="Documentos" record={record} documentStorageKey={`gest-record-documents-${view}-${record[0]}-${tab}`} initialDocuments={content.items.filter(([, value]) => /\.(pdf|png|jpe?g|docx?|xlsx?)$/i.test(value)).map(([type, name]) => ({ name, type, date: record[3] }))} />
      ) : (
      <DetailPanel title={content.title} actions={
          <button type="button" className="lab-create-activity" onClick={() => { setDetailDraft({...editedValues}); setEditOpen(true); }}>
            <Edit3 size={16} />
            Editar {tab.toLowerCase()}
          </button>
      }>
        <dl className="client-record-fields">
          {detailedItems.map((item) => (
            <div key={item[0]}><dt>{item[0]}</dt><dd>{item[1]}</dd></div>
          ))}
        </dl>
      </DetailPanel>
      )}
      {editOpen ? <div className="v2-record-drawer" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditOpen(false); }}>
        <section className="v2-dialog detail-edit-dialog" role="dialog" aria-modal="true" aria-label={`Editar ${tab.toLowerCase()}`}>
          <header><div><small>{view.toUpperCase()}</small><h2>Editar {tab.toLowerCase()}</h2><p>Atualize os dados deste registro.</p></div><button type="button" className="v2-icon-button" onClick={() => setEditOpen(false)} aria-label="Fechar"><X size={17} /></button></header>
          <div>{detailedItems.map(([label, value]) => <label key={label}><span>{label}</span><input value={detailDraft[`${tab}:${label}`] ?? value} onChange={(event) => setDetailDraft((current) => ({ ...current, [`${tab}:${label}`]: event.target.value }))} /></label>)}</div>
          <footer><button type="button" onClick={() => setEditOpen(false)}>Cancelar</button><button type="button" className="v2-primary" onClick={() => { setEditedValues(detailDraft); setEditOpen(false); }}><CheckCircle2 size={15} />Salvar alterações</button></footer>
        </section>
      </div> : null}
    </section>
  );
}

function FullModuleView({ view }: { view: View }) {
  const config = modules[view] ?? modules["Vendas"];
  const [selected, setSelected] = useState<string[] | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Mais recentes");
  const [chartPeriod, setChartPeriod] = useState("30 dias");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const records = readData<string[][]>(moduleKey(view), []);
  if (selected)
    return (
      <FullDetailView
        view={view}
        record={selected}
        onBack={() => setSelected(null)}
      />
    );
  const rows = [...records]
    .filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase()))
    .filter((row) => config.filters.every((filter) => !filterValues[filter] || filterValues[filter] === "Todos" || moduleFilterValue(row, filter, view) === filterValues[filter]))
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
      <section className="v2-metrics client-metrics client-overview-metrics">
        {config.metrics.map((metric) => (
          <Metric
            key={metric[0]}
            label={metric[0]}
            value={moduleMetric(metric[0], readData<string[][]>(moduleKey(view), []), moduleColumns(view))}
            detail="Registros cadastrados"
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
              <select
                value={filterValues[filter] ?? "Todos"}
                onChange={(event) =>
                  setFilterValues((current) => ({
                    ...current,
                    [filter]: event.target.value,
                  }))
                }
              >
                {["Todos", ...Array.from(new Set(records.map((row) => moduleFilterValue(row, filter, view)).filter(Boolean)))].map((option) => (
                  <option key={option}>{option}</option>
                ))}
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
          <EmptyTableBody>
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
          </EmptyTableBody>
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
        <article className="v2-card v2-module-chart maintenance-chart-below maintenance-chart-modern">
          <header><div><small>EVOLUÇÃO DE CUSTOS</small><h2>Custo de manutenção</h2><p>Despesas de manutenção por período.</p></div><ClientSelect compact hideLabel label="Período do gráfico" value={chartPeriod} onChange={setChartPeriod} options={["30 dias", "3 meses", "6 meses", "12 meses"]} /></header>
          <ComparisonChart labels={["Manutenção · Custo"]} period={chartPeriod} maintenanceBreakdown />
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
      <section className="v2-metrics client-metrics client-overview-metrics">
        {config.metrics.map((metric) => (
          <Metric
            key={metric[0]}
            label={metric[0]}
            value={moduleMetric(metric[0], readData<string[][]>(moduleKey(view), []), moduleColumns(view))}
            detail="Registros cadastrados"
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
          <EmptyTableBody>
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
          </EmptyTableBody>
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
  initialValues,
  submitLabel = "Salvar alterações",
}: {
  title: string;
  onClose: () => void;
  onSave: (values: Record<string, string>) => void;
  fields: string[];
  initialValues?: Record<string, string>;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(initialValues ?? Object.fromEntries(fields.filter(field=>["Data","Desconto (%)","Taxa (%)","Custo direto","Parcelas","Status"].includes(field)).map(field=>[field,field==="Data"?new Date().toLocaleDateString("en-CA"):field==="Parcelas"?"1":field==="Status"?"Ativo":"0"])));
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
          {fields.filter((field) => field !== "Duração estimada do serviço (opcional)" || /servi/i.test(values.Tipo ?? "")).map((field) => (
            <label key={field}>
              {field}
              {field === "Descrição" ? (
                <textarea required placeholder={`Informe ${field.toLowerCase()}`} value={values[field] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} />
              ) : (
                <input type={field === "Validade" || field === "Data" ? "date" : "text"} required={!field.includes("opcional") && !["Lote", "Validade"].includes(field)} placeholder={field.includes("Duração") ? "Ex.: 60 minutos" : field} value={values[field] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} />
              )}
            </label>
          ))}
        </div>
        <footer>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="v2-primary" type="submit">
            {submitLabel}
          </button>
        </footer>
      </form>
    </aside>
  );
}

function ModuleSettingsDialog({ view, onClose }: { view: "Estoque" | "Manutenção"; onClose: () => void }) {
  const storageKey = view === "Estoque" ? "gest-stock-alert-settings" : "gest-maintenance-alert-settings";
  const [values, setValues] = useState<Record<string, string>>(() => {
    const defaults = view === "Estoque"
      ? { threshold: "10", warning: "5", frequency: "Diariamente" }
      : { threshold: "30", warning: "7", frequency: "Diariamente" };
    if (typeof window === "undefined") return defaults;
    try { return { ...defaults, ...JSON.parse(appStorage.getItem(storageKey) || "{}") }; } catch { return defaults; }
  });
  const fields = view === "Estoque"
    ? [["threshold", "Estoque mínimo", "Quantidade que passa a ser considerada crítica"], ["warning", "Avisar com antecedência", "Unidades antes de atingir o mínimo"], ["frequency", "Frequência da verificação", "Ex.: diariamente ou semanalmente"]]
    : [["threshold", "Antecedência principal (dias)", "Ex.: 30 dias antes da manutenção"], ["warning", "Reforçar alerta (dias)", "Segundo aviso antes do vencimento"], ["frequency", "Frequência da verificação", "Ex.: diariamente ou semanalmente"]];
  return <aside className="v2-record-drawer module-settings-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <form className="v2-dialog module-settings-dialog" onSubmit={(event) => { event.preventDefault(); appStorage.setItem(storageKey, JSON.stringify(values)); onClose(); }}>
      <button type="button" className="close" onClick={onClose}><X /></button>
      <small>CONFIGURAÇÃO RÁPIDA</small>
      <h2>Alertas de {view.toLowerCase()}</h2>
      <p>Defina quando o GEST deve destacar informações que precisam de atenção.</p>
      <div>{fields.map(([key, label, help]) => <label key={key}><span>{label}<small>{help}</small></span><input type={key === "frequency" ? "text" : "number"} min={key === "frequency" ? undefined : "0"} value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} required /></label>)}</div>
      <footer><button type="button" onClick={onClose}>Cancelar</button><button className="v2-primary" type="submit">Salvar configuração</button></footer>
    </form>
  </aside>;
}

function reportDisplayLabel(label: string, category: string) {
  const [source, metric] = label.split(" · ");
  if (!metric) return label;
  if (metric === "Quantidade" && source !== category) {
    const names: Record<string, string> = { Clientes: "Quantidade de clientes", Vendas: "Quantidade de vendas", Estoque: "Quantidade em estoque", Manutenção: "Quantidade de manutenções" };
    return names[source] ?? metric;
  }
  return metric;
}

function ReportsView() {
  useDataRevision();
  const [period, setPeriod] = useStoredData("gest-report-period", "6 meses");
  const [primaryMode, setPrimaryMode] = useStoredData<ChartMode>("gest-report-primary-mode", "Padrão");
  const [category, setCategory] = useStoredData("gest-report-category", "Visão executiva");
  const [slots, setSlots] = useStoredData("gest-report-comparison", ["Financeiro · Receita", "Clientes · Quantidade", "Financeiro · Despesa"]);
  const [customCards, setCustomCards] = useStoredData<Record<string,string[]>>("gest-report-cards", {});
  const [hiddenCharts, setHiddenCharts] = useStoredData<string[]>("gest-report-hidden-charts", []);
  const [chartOrder, setChartOrder] = useStoredData("gest-report-chart-order", ["principal", "colunas", "servicos", "origem", "agenda"]);
  const [draggedChart, setDraggedChart] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [insertMenu, setInsertMenu] = useState<"cards" | "charts" | null>(null);
  const options: Record<string, string[]> = {
    Vendas: ["Quantidade", "Lucro", "Faturamento"],
    Clientes: ["Quantidade", "Faixa etária", "Sexo"],
    Estoque: ["Quantidade", "Valor do estoque"],
    Manutenção: ["Quantidade", "Custo"],
    Financeiro: ["Receita", "Lucro", "Despesa"],
    Catálogo: ["Quantidade"],
    Agenda: ["Quantidade de atividades"],
    CRM: ["Quantidade por etapa"],
    Compras: ["Produtos em avaliação", "Bom preço", "Economia estimada"],
    Atendimento: ["Conversas", "A responder", "Retornos"],
    Equipe: ["Pessoas", "Horas trabalhadas", "Atrasos"],
  };
  const indicatorOptions = Object.entries(options).flatMap(([group, indicators]) => indicators.map((item) => `${group} · ${item}`));
  const categories = ["Visão executiva", "Financeiro", "Vendas", "Clientes", "CRM e marketing", "Agenda", "Serviços e OS", "Estoque", "Compras", "Atendimento", "Equipe"];
  const categoryIcons: Record<string, LucideIcon> = {
    "Visão executiva": LineChart, Financeiro: CircleDollarSign, Vendas: ShoppingCart, Clientes: UsersRound,
    "CRM e marketing": Target, Agenda: CalendarDays, "Serviços e OS": Wrench, Estoque: Package,
    Compras: PackageCheck, Atendimento: MessageCircle, Equipe: UserCheck, Personalizados: Settings,
  };
  const categoryDefaults: Record<string, string[]> = {
    "Visão executiva": ["Financeiro · Receita", "Clientes · Quantidade", "Financeiro · Despesa"],
    Financeiro: ["Financeiro · Receita", "Financeiro · Lucro", "Financeiro · Despesa"],
    Vendas: ["Vendas · Faturamento", "Vendas · Quantidade", "Vendas · Lucro"],
    Clientes: ["Clientes · Quantidade", "Clientes · Faixa etária", "Clientes · Sexo"],
    "CRM e marketing": ["CRM · Quantidade por etapa", "Clientes · Quantidade", "Vendas · Quantidade"],
    Agenda: ["Agenda · Quantidade de atividades", "Clientes · Quantidade", "Vendas · Quantidade"],
    "Serviços e OS": ["Vendas · Quantidade", "Manutenção · Quantidade", "Manutenção · Custo"],
    Estoque: ["Estoque · Quantidade", "Estoque · Valor do estoque", "Vendas · Quantidade"],
    Compras: ["Compras · Produtos em avaliação", "Compras · Bom preço", "Compras · Economia estimada"],
    Atendimento: ["Atendimento · Conversas", "Atendimento · A responder", "Atendimento · Retornos"],
    Equipe: ["Equipe · Pessoas", "Equipe · Horas trabalhadas", "Equipe · Atrasos"],
    Personalizados: ["Financeiro · Receita", "Clientes · Quantidade", "Agenda · Quantidade de atividades"],
  };
  const categoryCards: Record<string, string[]> = {
    "Visão executiva": ["Vendas · Faturamento", "Financeiro · Lucro", "Clientes · Quantidade", "Agenda · Quantidade de atividades"],
    Financeiro: ["Financeiro · Receita", "Financeiro · Lucro", "Financeiro · Despesa", "Vendas · Faturamento"],
    Vendas: ["Vendas · Faturamento", "Vendas · Quantidade", "Vendas · Lucro", "Clientes · Quantidade"],
    Clientes: ["Clientes · Quantidade", "Clientes · Faixa etária", "Clientes · Sexo", "Agenda · Quantidade de atividades"],
    "CRM e marketing": ["CRM · Quantidade por etapa", "Clientes · Quantidade", "Vendas · Quantidade", "Atendimento · Conversas"],
    Agenda: ["Agenda · Quantidade de atividades", "Atendimento · Retornos", "Clientes · Quantidade", "Vendas · Quantidade"],
    "Serviços e OS": ["Vendas · Quantidade", "Manutenção · Quantidade", "Manutenção · Custo", "Vendas · Faturamento"],
    Estoque: ["Estoque · Quantidade", "Estoque · Valor do estoque", "Vendas · Quantidade", "Compras · Bom preço"],
    Compras: ["Compras · Produtos em avaliação", "Compras · Bom preço", "Compras · Economia estimada", "Estoque · Quantidade"],
    Atendimento: ["Atendimento · Conversas", "Atendimento · A responder", "Atendimento · Retornos", "CRM · Quantidade por etapa"],
    Equipe: ["Equipe · Pessoas", "Equipe · Horas trabalhadas", "Equipe · Atrasos", "Agenda · Quantidade de atividades"],
    Personalizados: ["Financeiro · Receita", "Clientes · Quantidade", "Agenda · Quantidade de atividades", "Vendas · Quantidade"],
  };
  const cards = customCards[category] ?? categoryCards[category];
  const chartLabels: Record<string, string> = { principal: "Comparativo de indicadores", colunas: "Receita, despesas e lucro", servicos: "Quantidade por serviço", origem: "Origem da receita", agenda: "Agenda, clientes e CRM", ...Object.fromEntries(chartOrder.filter((key) => key.startsWith("extra:")).map((key) => [key, key.slice(6)])) };
  const moveChart = (target: string) => { if (!draggedChart || draggedChart === target) return; const next = [...chartOrder]; next.splice(next.indexOf(target), 0, ...next.splice(next.indexOf(draggedChart), 1)); setChartOrder(next); setDraggedChart(null); };
  const primaryLabel = slots[0];
  const primaryValues = reportValues(primaryLabel);
  const visibleCount = period === "Últimos 30 dias" ? 1 : period === "3 meses" ? 3 : period === "6 meses" ? 6 : 12;
  const currentValue = primaryValues.slice(-visibleCount).reduce((sum,value)=>sum+value,0);
  const isCurrency = reportIsCurrency(primaryLabel);
  return (
    <>
      <StandardModuleTop
        title="Relatórios"
        help="Analise dados do negócio e compare indicadores em um único lugar."
        action={<div className="reports-top-actions"><button className="lab-create-activity is-secondary" onClick={() => setInsertMenu(insertMenu === "cards" ? null : "cards")}><Plus size={16} />Inserir indicador</button><button className="lab-create-activity" onClick={() => window.print()}><FileText size={16} />Exportar PDF</button><button type="button" className="module-settings-trigger" aria-label="Personalizar relatórios" title="Personalizar relatórios" onClick={() => { setCategory("Personalizados"); setSlots(categoryDefaults.Personalizados); }}><Settings size={17}/></button></div>}
        beforeCards={<ScrollableTabBar className="v2-settings-tabs settings-modern-tabs reports-category-tabs" label="Categorias de relatórios">{categories.map((item) => { const Icon = categoryIcons[item]; return <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => { setCategory(item); if (categoryDefaults[item]) setSlots(categoryDefaults[item]); }}><Icon size={15} />{item}</button>; })}</ScrollableTabBar>}
      >
        {cards.map((label, index) => { const values = reportValues(label); const value = values.at(-1) ?? 0; const previous = values.at(-2) ?? value; const change = previous ? (value - previous) / Math.abs(previous) * 100 : 0; return <div className="reports-summary-card" key={label} draggable onDragStart={(event) => { setDraggedCard(label); setExactDragPreview(event); }} onDragEnd={() => setDraggedCard(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (!draggedCard || draggedCard === label) return; const next = [...cards]; next.splice(next.indexOf(label), 0, ...next.splice(next.indexOf(draggedCard), 1)); setCustomCards({ ...customCards, [category]: next }); setDraggedCard(null); }}><Metric label={reportDisplayLabel(label, category)} value={reportIsCurrency(label) ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) : value.toLocaleString("pt-BR")} detail={`${change >= 0 ? "+" : ""}${change.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`} tone={["blue", "green", "violet", "orange"][index % 4]} /></div>; })}
      </StandardModuleTop>
      {draggedCard ? <div className="gest-widget-trash reports-card-trash" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); setCustomCards({ ...customCards, [category]: cards.filter((item) => item !== draggedCard) }); setDraggedCard(null); showAppToast("Indicador removido."); }}><Trash2 size={18} />Solte para remover o indicador</div> : null}
      {insertMenu === "cards" ? <div className="reports-insert-menu" aria-label="Inserir indicador">{indicatorOptions.filter((item) => !cards.includes(item)).map((item) => <button type="button" key={item} onClick={() => { setCustomCards({ ...customCards, [category]: [...cards, item] }); setInsertMenu(null); }}>{item}</button>)}</div> : null}
      <article className="v2-reports reports-modern reports-unwrapped">
        <header className="reports-filter-row">
          <ClientSelect compact hideLabel label="Período" value={period} onChange={setPeriod} options={["Últimos 30 dias", "3 meses", "6 meses", "12 meses"]} />
          {slots.map((slot, index) => <ClientSelect compact hideLabel key={index} label={`Indicador ${index + 1}`} value={slot} onChange={(value) => setSlots((current) => current.map((item, slotIndex) => slotIndex === index ? value : item))} options={indicatorOptions} />)}
        </header>
        {!hiddenCharts.includes("principal") ? <article className="v2-card v2-report-chart" draggable onDragStart={() => setDraggedChart("principal")} onDragEnd={() => setDraggedChart(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => moveChart("principal")}>
          <header>
            <div>
              <div className="report-primary-heading"><h2>{reportDisplayLabel(primaryLabel, category)}</h2><ReportTrend label={primaryLabel} /></div>
              <strong className="report-primary-value">{isCurrency ? currentValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) : currentValue.toLocaleString("pt-BR")}</strong>
            </div>
            <span>
              {slots.map((item, index) => (
                <i className={`legend-${index}`} key={`${item}-${index}`}>
                  ● {reportDisplayLabel(item, "Personalizados")}
                </i>
              ))}
            </span>
          </header>
          <div className="report-primary-mode"><ChartModeSelect value={primaryMode} onChange={setPrimaryMode} /></div>
          <ComparisonChart labels={slots} period={period} visual={primaryMode} />
        </article> : null}
        <section className="reports-secondary-grid">
          {chartOrder.filter((key) => key !== "principal" && !hiddenCharts.includes(key)).map((key, index) => <div className="reports-draggable-chart" key={key} draggable onDragStart={() => setDraggedChart(key)} onDragEnd={() => setDraggedChart(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => moveChart(key)}>{key.startsWith("extra:") ? <ReportColumnChart title={reportDisplayLabel(key.slice(6), category)} labels={[key.slice(6)]} period={period} /> : category === "Visão executiva" ? (key === "colunas" ? <ReportColumnChart title="Receita, despesas e lucro" labels={["Financeiro · Receita", "Financeiro · Despesa", "Vendas · Lucro"]} period={period} /> : key === "servicos" ? <ReportRankingChart title="Quantidade por serviço" /> : key === "origem" ? <ReportDonutChart title="Origem da receita" /> : <ReportColumnChart title="Agenda, clientes e CRM" labels={["Agenda · Quantidade de atividades", "Clientes · Quantidade", "CRM · Quantidade por etapa"]} period={period} />) : <ReportColumnChart title={reportDisplayLabel(slots[index % slots.length] ?? "Indicadores", category)} labels={[slots[index % slots.length]].filter(Boolean)} period={period} />}</div>)}
        </section>
        {draggedChart ? <div className="gest-widget-trash" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); setHiddenCharts([...hiddenCharts, draggedChart]); setDraggedChart(null); }}><X size={18} />Solte para remover o gráfico</div> : null}
        <div className="reports-chart-actions"><button type="button" className="lab-create-activity is-secondary" onClick={() => setInsertMenu(insertMenu === "charts" ? null : "charts")}><Plus size={15} />Inserir indicador</button>{insertMenu === "charts" ? <div className="reports-insert-menu">{Object.entries(chartLabels).filter(([key]) => hiddenCharts.includes(key)).map(([key, label]) => <button type="button" key={key} onClick={() => { setHiddenCharts(hiddenCharts.filter((item) => item !== key)); setInsertMenu(null); }}>Restaurar: {label}</button>)}{indicatorOptions.filter((label) => !chartOrder.includes(`extra:${label}`)).map((label) => <button type="button" key={label} onClick={() => { setChartOrder([...chartOrder, `extra:${label}`]); setInsertMenu(null); }}>Novo: {label}</button>)}</div> : null}</div>
      </article>
    </>
  );
}

/** Linhas comparáveis para os relatórios. O olho mostra valores sem poluir o gráfico. */
const reportMonths = monthRanges().map(range => range.name);

function reportIsCurrency(label: string) {
  return /(faturamento|lucro|receita|despesa|custo|valor|economia)/i.test(label);
}

function reportValues(label: string) { return indicatorSeries(label); }

function ReportTrend({ label }: { label: string }) {
  const values = reportValues(label);
  const previous = values.at(-2) ?? 0;
  const change = previous ? ((values.at(-1)! - previous) / Math.abs(previous)) * 100 : 0;
  return <span className={`finance-chart-trend ${change >= 0 ? "positive" : "negative"}`} title={`${label}: variação em relação ao mês anterior`}>{change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}{Math.abs(change).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</span>;
}

function ComparisonChart({ labels, period, maintenanceBreakdown = false, visual = "Padrão" }: { labels: string[]; period: string; maintenanceBreakdown?: boolean; visual?: ChartMode }) {
  const visibleCount = period === "Últimos 30 dias" ? 1 : period === "3 meses" ? 3 : period === "6 meses" ? 6 : 12;
  const visibleMonths = reportMonths.slice(-visibleCount);
  const series = labels.map((label, index) => ({ label, key: `series${index}`, values: reportValues(label).slice(-visibleCount), currency: reportIsCurrency(label) }));
  const maintenanceChart = maintenanceBreakdown;
  const hasCurrency = series.some((item) => item.currency);
  const hasQuantity = maintenanceChart || series.some((item) => !item.currency);
  const maintenanceCounts = reportValues("Manutenção · Quantidade").slice(-visibleCount);
  const data = visibleMonths.map((name, monthIndex) => Object.fromEntries([["name", name], ...series.map((item) => [item.key, item.values[monthIndex]]), ...(maintenanceChart ? [["maintenanceCount", maintenanceCounts[monthIndex]]] : [])]));
  const colors = ["#62b3e0", "#df858f", "#67b996", "#e5b266", "#a88acb", "#4f8bd6", "#667085"];
  const animationKey = `${period}-${labels.join("-")}`;
  if (visual !== "Padrão") return <div className="report-finance-chart report-line-modern"><FlexibleChart mode={visual} data={data as Record<string, string | number>[]} series={series.map((item, index) => ({ key:item.key, name:item.label, color:colors[index % colors.length], currency:item.currency }))} currency={hasCurrency && !hasQuantity} /></div>;
  return <div className="report-finance-chart report-line-modern">
    <DataChartContainer width="100%" height="100%">
      <ComposedChart key={animationKey} data={data} margin={{ top: 20, right: 24, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="2 7" vertical={false} stroke="#dbe5ef" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#738295", fontSize: 11 }} />
        <YAxis yAxisId="currency" hide={!hasCurrency} width={72} tickLine={false} axisLine={false} tick={{ fill: "#8491a0", fontSize: 10 }} tickFormatter={(value) => Number(value) >= 1000 ? `${(Number(value) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mil` : String(value)} />
        <YAxis yAxisId="quantity" hide={!hasQuantity} orientation="right" width={44} tickLine={false} axisLine={false} tick={{ fill: "#8b5cc7", fontSize: 10 }} />
        <Tooltip cursor={{ stroke: "#aac5df", strokeDasharray: "4 4" }} contentStyle={chartTooltipStyle} formatter={(value, name) => { const item = series.find((entry) => entry.key === name); return [item?.currency ? Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : Number(value).toLocaleString("pt-BR"), item?.label ?? name]; }} />
        <Legend iconType="circle" iconSize={8} formatter={(value) => series.find((item) => item.key === value)?.label ?? (value === "maintenanceCount" ? "Quantidade de manutenções" : value)} />
        {series.map((item, index) => <Line key={item.key} yAxisId={item.currency ? "currency" : "quantity"} type="linear" dataKey={item.key} stroke={colors[index % colors.length]} strokeWidth={index === 0 ? 3 : 2.4} dot={visibleCount === 1 ? { r: 4 } : { r: 2.5 }} activeDot={{ r: 5 }} isAnimationActive animationBegin={index * 90} animationDuration={850} animationEasing="ease-out" />)}
        {maintenanceChart ? <Bar yAxisId="quantity" dataKey="maintenanceCount" name="Quantidade de manutenções" fill="#e5b266" fillOpacity={0.76} radius={[5, 5, 0, 0]} maxBarSize={28} /> : null}
      </ComposedChart>
    </DataChartContainer>
  </div>;
}

function ReportColumnChart({ title, labels, period }: { title: string; labels: string[]; period: string }) {
  const [visual, setVisual] = useState<ChartMode>("Padrão");
  const visibleCount = period === "Últimos 30 dias" ? 1 : period === "3 meses" ? 3 : period === "6 meses" ? 6 : 12;
  const breakdown = labels.length === 1 ? indicatorBreakdown(labels[0]) : null;
  const data = breakdown ? breakdown.map(item=>({name:item.name,series0:item.value})) : reportMonths.slice(-visibleCount).map((name, monthIndex) => Object.fromEntries([["name", name], ...labels.map((label, index) => [`series${index}`, reportValues(label).slice(-visibleCount)[monthIndex]])]));
  const colors = ["#72bce5", "#e7a29b", "#70bea2"];
  return <article className="v2-card v2-report-chart report-model-card"><header><h2>{title}</h2><ReportTrend label={labels[0]} /><ChartModeSelect value={visual} onChange={setVisual} /></header>{visual === "Padrão" ? <div className="report-finance-chart"><DataChartContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 12, right: 6, left: -14, bottom: 0 }}><CartesianGrid stroke="#e1e8ee" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#788695", fontSize: 9 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#8793a0", fontSize: 9 }} tickFormatter={(value) => Number(value) >= 1000 ? `${(Number(value) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mil` : String(value)} /><Tooltip contentStyle={chartTooltipStyle} formatter={(value, name) => { const label = labels[Number(String(name).replace("series", ""))] ?? String(name); return [Number(value).toLocaleString("pt-BR", reportIsCurrency(label) ? { style: "currency", currency: "BRL" } : {}), label]; }} /><Legend iconType="circle" iconSize={7} formatter={(value) => labels[Number(String(value).replace("series", ""))]} />{labels.map((label, index) => <Bar key={label} dataKey={`series${index}`} fill={colors[index]} radius={[6, 6, 2, 2]} />)}</BarChart></DataChartContainer></div> : <div className="report-finance-chart"><FlexibleChart mode={visual} data={data as Record<string,string|number>[]} series={labels.map((label,index)=>({key:`series${index}`,name:label,color:colors[index % colors.length],currency:reportIsCurrency(label)}))} currency={labels.every(reportIsCurrency)} /></div>}</article>;
}

function ReportRankingChart({ title }: { title: string }) {
  const [visual, setVisual] = useState<ChartMode>("Padrão");
  const data = serviceCounts();
  return <article className="v2-card v2-report-chart report-model-card"><header><h2>{title}</h2><ReportTrend label="Vendas · Quantidade" /><ChartModeSelect value={visual} onChange={setVisual} /></header>{visual === "Padrão" ? <div className="report-finance-chart"><DataChartContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ top: 12, right: 20, left: 8, bottom: 0 }}><CartesianGrid stroke="#e1e8ee" strokeDasharray="3 5" horizontal={false} /><XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#8793a0", fontSize: 9 }} /><YAxis width={72} type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#788695", fontSize: 9 }} /><Tooltip contentStyle={chartTooltipStyle} /><Bar dataKey="value" name="Quantidade" fill="#73bea5" radius={[0, 7, 7, 0]} /></BarChart></DataChartContainer></div> : <div className="report-finance-chart"><FlexibleChart mode={visual} data={data} series={[{key:"value",name:"Quantidade",color:"#73bea5"}]} /></div>}</article>;
}

function ReportDonutChart({ title }: { title: string }) {
  const [visual, setVisual] = useState<ChartMode>("Padrão");
  const amounts = revenueSources(); const total = amounts.reduce((sum,item)=>sum+item.value,0); const data = amounts.map(item=>({...item,value: total ? Math.round(item.value/total*10000)/100 : 0}));
  return <article className="v2-card v2-report-chart report-model-card"><header><h2>{title}</h2><ReportTrend label="Financeiro · Receita" /><ChartModeSelect value={visual} onChange={setVisual} /></header>{visual === "Padrão" ? <div className="reports-donut-layout"><div><DataChartContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={85} paddingAngle={3} stroke="none">{data.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={chartTooltipStyle} formatter={(value) => `${Number(value).toLocaleString("pt-BR")}%`} /></PieChart></DataChartContainer><strong>{reportValues("Financeiro · Receita").at(-1)!.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}<small>Receita total</small></strong></div><aside>{data.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}<b>{item.value}%</b></span>)}</aside></div> : <div className="report-finance-chart"><FlexibleChart mode={visual} data={[{name:"Origem",...Object.fromEntries(data.map(item=>[item.name,item.value]))}]} series={data.map(item=>({key:item.name,name:item.name,color:item.color}))} /></div>}</article>;
}

function ClientDetailPage({ onBack, record, onMessage }: {
  onBack: () => void; record?: string[]; onOpenClinical?: (record: string[]) => void; onMessage: () => void;
}) {
  const access = useAccess();
  const [current, setCurrent] = useState(record);
  const [editing, setEditing] = useState<Client | null>(null);
  const [failure, setFailure] = useState("");
  const id = current?.[7] ?? current?.[0] ?? "";
  const name = current?.[1] ?? "Paciente";
  const openEdit = () => {
    const client = readData<Client[]>("gest-clients", []).find(item => item.id === id);
    if (client) setEditing(client);
    else setFailure("Cadastro não encontrado. Volte à lista de pacientes e tente novamente.");
  };
  const savePatient = async (client: Client) => {
    try {
      const clinical = await loadClinicalRecord(access.member?.businessId ?? "demo", id, name);
      await saveClinicalRecord(access.member?.businessId ?? "demo", { ...clinical, patientName: client.name });
      const rows = readData<Client[]>("gest-clients", []);
      appStorage.setItem("gest-clients", JSON.stringify(rows.map(item => item.id === client.id ? client : item)));
      setCurrent(previous => previous ? [previous[0], client.name, client.type, client.contact, client.total, client.status, client.birthday ?? "", client.id] : previous);
      setEditing(null);
      showAppToast("Cadastro do paciente atualizado.");
    } catch { setFailure("Não foi possível salvar o cadastro. As alterações continuam abertas."); }
  };
  if (!current) return <section className="client-record-panel"><p>Selecione um paciente.</p><button className="lab-create-activity" onClick={onBack}>Voltar</button></section>;
  if (!access.allowed("Prontuário")) return <section className="client-record-panel"><p>Solicite permissão para acessar a Ficha clínica.</p><button className="lab-create-activity" onClick={onBack}>Voltar</button></section>;
  return <>
    {failure && <p className="clinical-error" role="alert">{failure}</p>}
    <ClinicalWorkspace key={id + ":" + name} patientId={id} patientName={name} onBack={onBack} onMessage={onMessage} documentModels={readData<string[][]>("gest-document-records", [])}
      filePanels={{
        onEdit: openEdit,
        render: (section, clinical) => section === "Dados"
          ? <><ClientDetailContent tab="Dados" record={current.map((value,index)=>index===4?money(clinical.encounters.filter(item=>item.paymentStatus!=="cancelled").reduce((sum,item)=>sum+item.amount,0)):value)} onEditPhoto={openEdit} initialDocuments={[]} /><ClientDetailContent tab="Observações" record={current} initialDocuments={[]} /></>
          : section === "Histórico" ? <PatientHistory record={clinical} /> : null,
        attachments: <ClientDetailContent tab="Documentos" record={current} initialDocuments={[]} />,
      }} />
    {editing && <ClientForm client={editing} onClose={() => setEditing(null)} onSave={client => void savePatient(client)} />}
  </>;
}

/** Documentos em cartões para facilitar a leitura visual do conteúdo e seus vínculos. */
function DocumentCards({
  rows,
  query,
  sort,
  onQuery,
  onSort,
  onEdit,
  onNew,
}: {
  rows: string[][];
  query: string;
  sort: string;
  onQuery: (value: string) => void;
  onSort: (value: string) => void;
  onEdit: (row: string[]) => void;
  onNew: () => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [category, setCategory] = useState("Todos");
  const [type, setType] = useState("Todos");
  const [link, setLink] = useState("Todos");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [previewRow, setPreviewRow] = useState<string[] | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewWidth, setPreviewWidth] = useState(42);
  const previewResize = useRef<{ x: number; width: number; container: number } | null>(null);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = previewResize.current;
      if (drag) setPreviewWidth(Math.max(28, Math.min(65, drag.width + (drag.x - event.clientX) / drag.container * 100)));
    };
    const end = () => { previewResize.current = null; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end); };
  }, []);

  useEffect(() => {
    try {
      setOrder(JSON.parse(appStorage.getItem("gest-document-order") || "[]"));
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
    appStorage.setItem("gest-document-order", JSON.stringify(next));
    setDraggedId(null);
  };

  const visibleRows = orderedRows.filter((row) =>
    (category === "Todos" || row[2] === category) &&
    (type === "Todos" || row[4] === type) &&
    (link === "Todos" || row[2] === link),
  );
  const categories = ["Todos", ...Array.from(new Set(rows.map((row) => row[2]).filter(Boolean)))];
  const types = ["Todos", ...Array.from(new Set(rows.map((row) => row[4]).filter(Boolean)))];

  return (
    <article className="v2-card v2-client-table v2-ranked-client-table v2-module-table document-modern-directory">
      <header>
        <div className="lab-search-form client-local-search">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Buscar em documentos..."
          />
          <button type="button" className={query ? "visible" : ""} onClick={() => onQuery("")} aria-label="Limpar busca"><X size={16} /></button>
        </div>
        <ClientSelect label="Categoria" value={category} onChange={setCategory} options={categories} />
        <ClientSelect label="Tipo" value={type} onChange={setType} options={types} />
        <ClientSelect label="Vínculo" value={link} onChange={setLink} options={categories} />
        <ClientSelect label="Ordenar por" value={sort} onChange={onSort} options={["Mais recentes", "Mais antigos", "A–Z", "Z–A"]} />
        <button className="lab-create-activity" onClick={onNew}>
          <Plus size={17} />
          Novo documento
        </button>
        <div className="client-view-toggle module-view-toggle" role="group" aria-label="Visualização de documentos">
          <button type="button" className={viewMode === "list" ? "active" : ""} aria-label="Visualizar em lista" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}><List size={17} /></button>
          <button type="button" className={viewMode === "grid" ? "active" : ""} aria-label="Visualizar em grade" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}><Grid2X2 size={16} /></button>
        </div>
      </header>
      <div className={previewRow ? "document-browser has-preview" : "document-browser"} style={{ "--document-preview-width": `${previewWidth}%` } as React.CSSProperties}>
      <div className="document-results">
      {viewMode === "grid" && visibleRows.length === 0 ? <div className="gest-empty-list-panel" role="status">Sem registro</div> : null}
      {viewMode === "grid" ? <div className="document-lab-grid" aria-label="Documentos organizáveis">
        {visibleRows.map((row) => (
          <div
            className="document-lab-item"
            key={row[0]}
            draggable
            onDragStart={() => setDraggedId(row[0])}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => moveDocument(row[0])}
          >
            <DocumentCardPreview
              title={row[1].replace(/_/g, " ").replace(/\.[^.]+$/, "")}
              fileType={row[4]}
              updated={`Atualizado em ${row[3]}`}
              onEdit={() => onEdit(row)}
              onOpen={() => { setPreviewRow(row); setPreviewZoom(1); }}
            />
          </div>
        ))}
      </div> : (
        <table className="document-modern-list">
          <thead><tr><th>Documento</th><th>Vínculo</th><th>Atualização</th><th>Tipo</th><th>Status</th><th>Ações</th></tr></thead>
          <EmptyTableBody>
            {visibleRows.map((row) => (
              <tr key={row[0]} className={previewRow?.[0] === row[0] ? "selected" : ""} onClick={() => { setPreviewRow(row); setPreviewZoom(1); }}>
                <td><strong>{row[1].replace(/_/g, " ")}</strong></td>
                <td><span className="type">{row[2]}</span></td>
                <td>{row[3]}</td>
                <td>{row[4]}</td>
                <td><span className="status active"><i />{row[5]}</span></td>
                <td><button type="button" className="v2-icon-button" onClick={(event) => { event.stopPropagation(); onEdit(row); }} aria-label={`Editar ${row[1]}`}><Edit3 size={16} /></button></td>
              </tr>
            ))}
          </EmptyTableBody>
        </table>
      )}
      </div>
      {previewRow ? <aside className="document-side-preview" aria-label={`Pré-visualização de ${previewRow[1]}`}>
        <div className="document-side-resize" role="separator" tabIndex={0} aria-label="Redimensionar pré-visualização" aria-orientation="vertical" aria-valuemin={28} aria-valuemax={65} aria-valuenow={Math.round(previewWidth)} onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); const container = event.currentTarget.closest<HTMLElement>(".document-browser"); previewResize.current = { x: event.clientX, width: previewWidth, container: container?.clientWidth || 1 }; event.currentTarget.setPointerCapture(event.pointerId); }} onKeyDown={(event) => { if (event.key === "ArrowLeft") setPreviewWidth((width) => Math.min(65, width + 4)); if (event.key === "ArrowRight") setPreviewWidth((width) => Math.max(28, width - 4)); }} />
        <header><div><FileText size={19} /><span><strong>{previewRow[1].replace(/_/g, " ")}</strong><small>{previewRow[4]} · Atualizado em {previewRow[3]}</small></span></div><div className="document-preview-actions"><button type="button" onClick={() => setPreviewZoom((value) => Math.max(.8, value - .2))} aria-label="Diminuir zoom"><ZoomOut size={17} /></button><b>{Math.round(previewZoom * 100)}%</b><button type="button" onClick={() => setPreviewZoom((value) => Math.min(2, value + .2))} aria-label="Aumentar zoom"><ZoomIn size={17} /></button><button type="button" onClick={() => setPreviewRow(null)} aria-label="Fechar pré-visualização"><X size={18} /></button></div></header>
        <div className="document-side-canvas"><div className="document-side-sheet" style={{ transform: `scale(${previewZoom})` }}><span>{previewRow[1].replace(/_/g, " ").replace(/\.[^.]+$/, "").toLocaleUpperCase("pt-BR")}</span><p style={{whiteSpace:"pre-wrap"}}>{previewRow[6] || "Sem descrição cadastrada."}</p>{previewRow[7] ? <p>Cliente: {previewRow[7]}</p> : null}{previewRow[8] ? <p>Venda / serviço: {previewRow[8]}</p> : null}{previewRow[9] ? <p>Arquivo: {previewRow[9]}</p> : null}</div></div>
        <footer><button type="button" onClick={() => onEdit(previewRow)}><Edit3 size={15} />Editar</button><button type="button" className="primary" onClick={() => window.print()}><Printer size={15} />Imprimir</button></footer>
      </aside> : null}
      </div>
    </article>
  );
}

const crmStages = ["Captação", "Primeiro contato", "Necessidade", "Proposta", "Agendamento", "Atendimento", "Convertido"];
const crmSeed = [] as Array<{ id: string; name: string; stage: string; value: string; owner: string; source: string; initials: string; priority: string; objective: string; progress: number; comments: number; files: number; createdAt?:string }>;

function StageSettingsDialog({ title, stages, onClose, onSave, showTaskOptions = false }: { title: string; stages: string[]; onClose: () => void; onSave: (stages: string[], options: {requireOwner:boolean;deadlineAlerts:boolean}, renamed: Record<string,string>) => void; showTaskOptions?: boolean }) {
  const [draft, setDraft] = useState(stages);
  const [origins, setOrigins] = useState(stages);
  const [newStage, setNewStage] = useState("");
  const [requireOwner, setRequireOwner] = useState(() => readData("gest-task-options",{requireOwner:true}).requireOwner);
  const [deadlineAlerts, setDeadlineAlerts] = useState(() => readData("gest-task-options",{deadlineAlerts:true}).deadlineAlerts);
  return <div className="lab-agenda-modal" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}><form className="workflow-settings-dialog" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); const clean=draft.map(value=>value.trim()); if (clean.length && clean.every(Boolean) && new Set(clean).size===clean.length) onSave(clean, {requireOwner,deadlineAlerts}, Object.fromEntries(origins.map((old,index)=>[old,clean[index]]).filter(([old])=>Boolean(old)))); }}>
    <header><div><small>CONFIGURAÇÃO</small><h2>{title}</h2><p>Organize as etapas usadas no quadro.</p></div><button type="button" aria-label="Fechar" onClick={onClose}><X size={18} /></button></header>
    <section><strong>Etapas do fluxo</strong><div className="workflow-stage-list">{draft.map((stage, index) => <label key={`${stage}-${index}`}><span>{index + 1}</span><input value={stage} onChange={(event) => setDraft((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /><button type="button" aria-label={`Remover ${stage}`} disabled={draft.length <= 2} onClick={() => { setDraft((current) => current.filter((_, itemIndex) => itemIndex !== index)); setOrigins(current=>current.filter((_, itemIndex)=>itemIndex!==index)); }}><X size={15} /></button></label>)}</div><div className="workflow-stage-add"><input value={newStage} onChange={(event) => setNewStage(event.target.value)} placeholder="Nova etapa" /><button type="button" onClick={() => { const value = newStage.trim(); if (!value || draft.includes(value)) return; setDraft((current) => [...current, value]); setOrigins(current=>[...current, ""]); setNewStage(""); }}><Plus size={15} />Adicionar</button></div></section>
    {showTaskOptions ? <section className="workflow-extra-options"><strong>Parâmetros das tarefas</strong><label><span><b>Responsável obrigatório</b><small>Solicita um responsável ao criar a tarefa.</small></span><button type="button" className={requireOwner ? "switch on" : "switch"} onClick={() => setRequireOwner((value) => !value)}><i /></button></label><label><span><b>Alertas de prazo</b><small>Destaca tarefas próximas do vencimento.</small></span><button type="button" className={deadlineAlerts ? "switch on" : "switch"} onClick={() => setDeadlineAlerts((value) => !value)}><i /></button></label></section> : null}
    <footer><button type="button" onClick={onClose}>Cancelar</button><button type="submit" className="primary">Salvar configuração</button></footer>
  </form></div>;
}

function CrmKanban({ onDetails }: { onDetails: (record: string[]) => void }) {
  const [leads, setLeads] = useStoredData("gest-crm-leads", crmSeed);
  const [stages, setStages] = useStoredData("gest-crm-stages", crmStages);
  const [dragged, setDragged] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<string | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [newLeadStage, setNewLeadStage] = useState(crmStages[0]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const kanbanRef = useRef<HTMLElement>(null);
  const kanbanOverflow = useHorizontalOverflow(kanbanRef);
  const [scrollPosition, setScrollPosition] = useState(0);
  return <>
    <StandardModuleTop title="CRM" help="Acompanhe cada oportunidade da captação até a conversão." action={<div className="workflow-top-actions"><button type="button" className="lab-create-activity" onClick={() => { setNewLeadStage(stages[0]); setNewLeadOpen(true); }}><Plus size={16} />Novo lead</button><button type="button" className="module-settings-trigger" aria-label="Configurar etapas do CRM" onClick={() => setSettingsOpen(true)}><Settings size={17} /></button></div>}>
      {modules.CRM.metrics.map((metric) => <Metric key={metric[0]} label={metric[0]} value={/pipeline|valor/i.test(metric[0]) ? money(leads.filter(row=>row.stage!=="Convertido").reduce((sum,row)=>sum+numberValue(row.value),0)) : /conversão/i.test(metric[0]) ? (leads.length ? Math.round(leads.filter(row=>row.stage==="Convertido").length/leads.length*100):0)+"%" : String(leads.length)} detail="Registros cadastrados" tone={metric[3]} />)}
    </StandardModuleTop>
    <CrmContactFollowups/>
    <div className="crm-kanban-shell"><section ref={kanbanRef} onScroll={(event) => { const element = event.currentTarget; const max = element.scrollWidth - element.clientWidth; setScrollPosition(max > 0 ? element.scrollLeft / max * 100 : 0); }} style={{ "--kanban-columns": stages.length } as React.CSSProperties} className="shelf-kanban shelf-kanban-crm" aria-label="Funil comercial em Kanban">
      {stages.map((stage, stageIndex) => {
        const stageLeads = leads.filter((lead) => lead.stage === stage);
        return <article className={`stage-${stageIndex + 1}${dropStage === stage ? " is-over" : ""}`} key={stage} onDragOver={(event) => { event.preventDefault(); setDropStage(stage); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropStage(null); }} onDrop={() => { if (dragged) setLeads((current) => current.map((lead) => lead.id === dragged ? { ...lead, stage } : lead)); setDragged(null); setDropStage(null); }}>
          <header><span className="shelf-kanban-dot" aria-hidden="true" /><strong>{stage}</strong><b>{stageLeads.length}</b></header>
          <div className="shelf-kanban-stack">{stageLeads.map((lead) => <button className={`shelf-kanban-card tone-${lead.priority.toLowerCase()}`} key={lead.id} draggable onDragStart={() => setDragged(lead.id)} onDragEnd={() => { setDragged(null); setDropStage(null); }} onClick={() => onDetails([lead.id, lead.name, lead.source, "Hoje", lead.value, stage])}>
            <span className="shelf-kanban-band">{lead.priority === "Alta" ? <Siren size={13} /> : lead.priority === "Média" ? <Clock3 size={13} /> : <CheckCircle2 size={13} />}{lead.priority === "Alta" ? "Retorno urgente" : lead.priority === "Média" ? "Atenção moderada" : "Tudo em dia"}</span>
            <span className="shelf-kanban-body">
              <small>{lead.source}</small><strong>{lead.name}</strong><span>{lead.objective} · {lead.value}</span>
              <span className="shelf-kanban-progress-label"><span>Progresso</span><b>{lead.progress}%</b></span>
              <span className="shelf-kanban-progress"><i style={{ width: `${lead.progress}%` }} /></span>
              <span className="shelf-kanban-meta"><span><i><MessageCircle size={12} />{lead.comments}</i><i><Paperclip size={12} />{lead.files}</i></span><span className="shelf-kanban-person"><em>{lead.owner.slice(0, 2).toUpperCase()}</em><span>{lead.owner}</span></span></span>
            </span>
          </button>)}<button type="button" className="workflow-quick-add crm-stage-quick-add" onClick={() => { setNewLeadStage(stage); setNewLeadOpen(true); }}><Plus size={15} />Adicionar novo lead</button></div>
        </article>;
      })}
    </section><div hidden={!kanbanOverflow.previous && !kanbanOverflow.next} className="workflow-scroll-control crm-scroll-control"><input type="range" min="0" max="100" step="1" value={scrollPosition} aria-label="Rolar as etapas do CRM para os lados" onChange={(event) => { const value = Number(event.target.value); const element = kanbanRef.current; if (element) element.scrollLeft = (element.scrollWidth - element.clientWidth) * value / 100; setScrollPosition(value); }} /></div></div>
    <p className="crm-kanban-help">Arraste os cards entre as etapas. Clique para ver os detalhes do contato.</p>
    {newLeadOpen ? <RecordDialog title="Novo lead" fields={["Nome / título", "Origem", "Objetivo", "Valor", "Responsável"]} onClose={() => setNewLeadOpen(false)} onSave={(values) => {
      const name = values["Nome / título"] || "Novo lead";
      setLeads((current) => [{ id: `CRM-${String(309 + current.length).padStart(3, "0")}`, name, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), source: values["Origem"] || "Manual", objective: values["Objetivo"] || "Nova oportunidade", value: values["Valor"] || "R$ 0,00", stage: newLeadStage, priority: "Normal", createdAt: new Date().toISOString(), progress: 0, comments: 0, files: 0, owner: values["Responsável"] || "Mariana" }, ...current]);
      setNewLeadOpen(false);
    }} /> : null}
    {settingsOpen ? <StageSettingsDialog title="Etapas do CRM" stages={stages} onClose={() => setSettingsOpen(false)} onSave={(next,_options,renamed) => { setStages(next); setLeads((current) => current.map((lead) => ({...lead,stage:renamed[lead.stage] || (next.includes(lead.stage) ? lead.stage : next[0])}))); setSettingsOpen(false); }} /> : null}
  </>;
}

type WorkflowProject = { id: string; name: string; detail: string; owner: string; due: string; priority: string };
type WorkflowCard = {
  id: string;
  title: string;
  detail: string;
  owner: string;
  due: string;
  priority: string;
  stage: string;
  progress?: number;
  projectId?: string;
  daysInStage: number;
  comments: string[];
  files: Array<string | ChatAttachment>;
  createdAt?:string;
};
const taskStages = ["Entrada", "A fazer", "Em andamento", "Em revisão", "Concluída"];
const projectStages = ["Planejamento", "A iniciar", "Em andamento", "Em risco", "Concluído"];
const workflowProjects: WorkflowProject[] = [];
const taskCards: WorkflowCard[] = [];

function WorkflowComposer({ view, projects = [], defaultProjectId = "", initialStage, initialCard, requireOwner = true, onClose, onSave }: { requireOwner?: boolean; view: "Tarefas" | "Projetos"; projects?: WorkflowProject[]; defaultProjectId?: string; initialStage?: string; initialCard?: WorkflowCard; onClose: () => void; onSave: (card: WorkflowCard) => void }) {
  const singular = view === "Tarefas" ? "tarefa" : "projeto";
  const firstStage = initialCard?.stage || initialStage || (view === "Tarefas" ? taskStages[0] : projectStages[0]);
  const [title, setTitle] = useState(initialCard?.title ?? "");
  const [detail, setDetail] = useState(initialCard?.detail ?? "");
  const [owner, setOwner] = useState(initialCard?.owner ?? "");
  const [due, setDue] = useState(initialCard?.due && /^\d{4}-\d{2}-\d{2}$/.test(initialCard.due) ? initialCard.due : "");
  const [priority, setPriority] = useState(initialCard?.priority ?? "Média");
  const [projectId, setProjectId] = useState(initialCard?.projectId ?? defaultProjectId);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || (requireOwner && !owner.trim())) return;
    const prefix = view === "Tarefas" ? "TR" : "PR";
    onSave({
      id: initialCard?.id ?? `${prefix}-${crypto.randomUUID()}`,
      createdAt: initialCard?.createdAt ?? new Date().toISOString(),
      title: title.trim(),
      detail: detail.trim() || `Novo ${singular}`,
      owner: owner.trim() || "Sem responsável",
      due: due || initialCard?.due || "Sem prazo",
      priority,
      stage: firstStage,
      progress: initialCard?.progress ?? 0,
      projectId: view === "Tarefas" ? projectId : undefined,
      daysInStage: initialCard?.daysInStage ?? 0,
      comments: initialCard?.comments ?? [],
      files: initialCard?.files ?? [],
    });
  };

  return (
    <form className="lab-event-card workflow-composer" onSubmit={submit}>
      <header>
        <h2>{initialCard ? "Editar" : "Adicionar"} {singular}</h2>
        <button type="button" aria-label="Fechar" onClick={onClose}><X size={18} /></button>
      </header>
      <label className="lab-event-title">
        <span>Título</span>
        <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`Adicionar título da ${singular}`} required />
      </label>
      <div className="workflow-composer-grid">
        <label className="workflow-composer-field">
          <CalendarDays size={18} />
          <span><small>Prazo</small><input type="date" value={due} onChange={(event) => setDue(event.target.value)} /></span>
        </label>
        <label className="workflow-composer-field">
          <UserRound size={18} />
          <span><small>Responsável</small><input required={requireOwner} value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Digitar responsável" /></span>
        </label>
        <div className="workflow-composer-field workflow-composer-select">
          <Siren size={18} />
          <ClientSelect compact label="Prioridade" value={priority} onChange={setPriority} options={["Alta", "Média", "Normal"]} />
        </div>
        {view === "Tarefas" ? (
          <div className="workflow-composer-field workflow-composer-select">
            <BriefcaseBusiness size={18} />
            <ClientSelect compact label="Projeto" value={projects.find((project) => project.id === projectId)?.name ?? "Tarefa sem projeto"} onChange={(value) => setProjectId(projects.find((project) => project.name === value)?.id ?? "")} options={["Tarefa sem projeto", ...projects.map((project) => project.name)]} />
          </div>
        ) : null}
        <div className="workflow-composer-field is-readonly">
          <ClipboardList size={18} />
          <span><small>Etapa inicial</small><strong>{firstStage}</strong></span>
        </div>
      </div>
      <label className="workflow-composer-description">
        <span>Descrição</span>
        <textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder={`Adicionar detalhes do ${singular}`} rows={3} />
      </label>
      <footer>
        <button type="button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary">Salvar {singular}</button>
      </footer>
    </form>
  );
}

function WorkflowKanban({ view }: { view: "Tarefas" | "Projetos" }) {
  const access = useAccess();
  const [taskOptions, setTaskOptions] = useStoredData("gest-task-options", {requireOwner:true, deadlineAlerts:true});
  const [stages, setStages] = useStoredData("gest-task-stages", taskStages);
  const [cards, setCards] = useStoredData<WorkflowCard[]>("gest-workflow-tasks", []);
  const [projects, setProjects] = useStoredData<WorkflowProject[]>("gest-workflow-projects", []);
  const [projectFilter, setProjectFilter] = useState("all");
  const [dragged, setDragged] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState<"task" | "project" | null>(null);
  const [editingTask, setEditingTask] = useState<WorkflowCard | null>(null);
  const [composerStage, setComposerStage] = useState(taskStages[0]);
  const [cardDialog, setCardDialog] = useState<{ cardId: string; tab: "comments" | "files" } | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const kanbanRef = useRef<HTMLElement>(null);
  const kanbanOverflow = useHorizontalOverflow(kanbanRef);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    setProjectFilter("all");
    setDragged(null);
    setDropStage(null);
    setComposerOpen(null);
    setEditingTask(null);
  }, [view]);
  const visibleCards = cards.filter((card) => projectFilter === "all" ? true : projectFilter === "none" ? !card.projectId : card.projectId === projectFilter);
  const selectedProject = projects.find((project) => project.id === projectFilter);
  const activeDialogCard = cards.find((card) => card.id === cardDialog?.cardId);
  const completedCount = visibleCards.filter((card) => card.stage.toLocaleLowerCase("pt-BR").includes("conclu")).length;
  const overdueCount = visibleCards.filter(card=>card.stage!=="Concluída" && /^\d{4}-\d{2}-\d{2}$/.test(card.due) && card.due<new Date().toLocaleDateString("en-CA")).length;
  const plannedCount = visibleCards.length - completedCount;
  const onTimeCount = Math.max(0, plannedCount - overdueCount);
  const labels = ["Planejadas", "No prazo", "Concluídas", "Em atraso"];
  const stageTone = (stage: string) => {
    if (stage.toLocaleLowerCase("pt-BR").includes("conclu")) return "complete";
    if (stage === "Em risco") return "danger";
    if (stage.toLocaleLowerCase("pt-BR").includes("revisão")) return "review";
    if (stage.toLocaleLowerCase("pt-BR").includes("andamento")) return "active";
    if (stage === "A fazer" || stage === "A iniciar") return "queued";
    return "planned";
  };
  return <>
    <StandardModuleTop
      title="Tarefas"
      help="Organize tarefas avulsas ou filtre as atividades vinculadas a cada projeto."
      action={<div className="workflow-top-actions"><button type="button" className="lab-create-activity is-secondary" disabled={!access.allowed("Projetos")} onClick={() => { if (access.allowed("Projetos")) setComposerOpen("project"); }}><BriefcaseBusiness size={16} /> Adicionar projeto</button><button type="button" className="lab-create-activity" onClick={() => { setComposerStage(stages[0]); setComposerOpen("task"); }}><Plus size={17} /> Adicionar tarefa</button><button type="button" className="module-settings-trigger" aria-label="Configurar etapas das tarefas" onClick={() => setSettingsOpen(true)}><Settings size={17} /></button></div>}
    >
      <Metric label={labels[0]} value={String(plannedCount)} detail="+8,0%" tone="blue" />
      <Metric label={labels[1]} value={String(onTimeCount)} detail="+5,2%" tone="orange" />
      <Metric label={labels[2]} value={String(completedCount)} detail="+11,4%" tone="green" />
      <Metric label={labels[3]} value={String(overdueCount)} detail={overdueCount ? "-2,1%" : "0%"} tone="red" />
    </StandardModuleTop>
    <section className="workflow-project-filter" aria-label="Filtro de projeto">
      <span className="workflow-project-prompt">Selecione o seu projeto</span>
      <ClientSelect compact hideLabel label="Projeto" value={selectedProject?.name || (projectFilter === "none" ? "Sem projeto" : "Todos os projetos")} onChange={(value) => { if (value === "Todos os projetos") setProjectFilter("all"); else if (value === "Sem projeto") setProjectFilter("none"); else setProjectFilter(projects.find((project) => project.name === value)?.id ?? "all"); }} options={["Todos os projetos", "Sem projeto", ...projects.map((project) => project.name)]} />
    </section>
    <div className="workflow-kanban-shell">
    <section ref={kanbanRef} style={{ "--kanban-columns": stages.length } as React.CSSProperties} className="shelf-kanban shelf-kanban-workflow" onScroll={(event) => { const element = event.currentTarget; const max = element.scrollWidth - element.clientWidth; setScrollPosition(max > 0 ? element.scrollLeft / max * 100 : 0); }}>
      {stages.map((stage, index) => {
        const stageCards = visibleCards.filter((card) => card.stage === stage);
        return <article className={`${dropStage === stage ? "is-over " : ""}stage-${stageTone(stage)}`} key={stage} onDragOver={(event) => { event.preventDefault(); setDropStage(stage); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropStage(null); }} onDrop={() => { if (dragged) { setCards((current) => current.map((card) => card.id === dragged ? { ...card, stage, daysInStage: 0 } : card)); showAppToast(/conclu/i.test(stage) ? "Tarefa concluída." : "Etapa da tarefa atualizada."); } setDragged(null); setDropStage(null); }}>
          <header><span className="shelf-kanban-dot" aria-hidden="true" /><strong>{stage}</strong><b>{stageCards.length}</b></header>
          <div className="shelf-kanban-stack">{stageCards.map((card, cardIndex) => {
            const progress = typeof card.progress === "number" ? card.progress : Math.min(90, 18 + index * 20);
            const project = projects.find((item) => item.id === card.projectId);
            return <article className={`shelf-kanban-card tone-${card.priority.toLowerCase()}`} key={card.id} draggable onDoubleClick={(event) => { if ((event.target as HTMLElement).closest("button")) return; setEditingTask(card); }} onDragStart={() => setDragged(card.id)} onDragEnd={() => { setDragged(null); setDropStage(null); }}>
            <span className="shelf-kanban-band">{card.priority === "Alta" ? <Siren size={13} /> : card.priority === "Média" ? <Clock3 size={13} /> : <CheckCircle2 size={13} />}{card.priority === "Alta" ? "Prioridade alta" : card.priority === "Média" ? "Atenção moderada" : "Tudo em dia"}</span>
            <span className="shelf-kanban-body">
              <span className="workflow-card-heading"><strong>{card.title}</strong><i title={`${card.daysInStage} ${card.daysInStage === 1 ? "dia" : "dias"} neste status`}>{card.daysInStage}</i></span><span>{card.detail}</span>
              {project ? <small className="workflow-card-project"><BriefcaseBusiness size={11} />{project.name}</small> : null}
              <span className="shelf-kanban-progress-label"><span>Progresso</span><b>{progress}%</b></span>
              <span className="shelf-kanban-progress"><i style={{ width: `${progress}%` }} /></span>
              <span className="shelf-kanban-meta"><span><button type="button" onClick={() => setCardDialog({ cardId: card.id, tab: "comments" })} aria-label={`Comentários de ${card.title}`}><MessageCircle size={12} />{card.comments.length}</button><button type="button" onClick={() => setCardDialog({ cardId: card.id, tab: "files" })} aria-label={`Anexos de ${card.title}`}><Paperclip size={12} />{card.files.length}</button></span><span className="shelf-kanban-person"><em>{card.owner.slice(0, 2).toUpperCase()}</em>{card.owner}<time>{taskOptions.deadlineAlerts && /^\d{4}-\d{2}-\d{2}$/.test(card.due) && card.due<=new Date(Date.now()+3*86400000).toLocaleDateString("en-CA") && !/conclu/i.test(card.stage) ? <Siren size={12} aria-label="Atenção ao prazo da tarefa" /> : null}{card.due}</time></span></span>
            </span>
          </article>; })}<button type="button" className="workflow-quick-add" onClick={() => { setComposerStage(stage); setComposerOpen("task"); }}><Plus size={15} />Adicionar tarefa</button></div>
        </article>;
      })}
    </section>
    <div hidden={!kanbanOverflow.previous && !kanbanOverflow.next} className="workflow-scroll-control"><input type="range" min="0" max="100" step="1" value={scrollPosition} aria-label="Rolar o Kanban para os lados" onChange={(event) => { const value = Number(event.target.value); const element = kanbanRef.current; if (element) element.scrollLeft = (element.scrollWidth - element.clientWidth) * value / 100; setScrollPosition(value); }} /></div>
    </div>
    {composerOpen ? (
      <div className="lab-agenda-modal" role="dialog" aria-modal="true" aria-label={`Adicionar ${composerOpen === "task" ? "tarefa" : "projeto"}`} onClick={() => setComposerOpen(null)}>
        <div onClick={(event) => event.stopPropagation()}>
          <WorkflowComposer requireOwner={taskOptions.requireOwner} view={composerOpen === "task" ? "Tarefas" : "Projetos"} projects={projects} defaultProjectId={projectFilter !== "all" && projectFilter !== "none" ? projectFilter : ""} initialStage={composerOpen === "task" ? composerStage : undefined} onClose={() => setComposerOpen(null)} onSave={(card) => { if (composerOpen === "task") { setCards((current) => [card, ...current]); showAppToast("Tarefa criada com sucesso."); } else { const project = { id: card.id, name: card.title, detail: card.detail, owner: card.owner, due: card.due, priority: card.priority }; setProjects((current) => [project, ...current]); setProjectFilter(project.id); showAppToast("Projeto criado com sucesso."); } setComposerOpen(null); }} />
        </div>
      </div>
    ) : null}
    {editingTask ? <div className="lab-agenda-modal" role="dialog" aria-modal="true" aria-label={`Editar ${editingTask.title}`} onClick={() => setEditingTask(null)}><div onClick={(event) => event.stopPropagation()}><WorkflowComposer requireOwner={taskOptions.requireOwner} key={editingTask.id} view="Tarefas" projects={projects} initialCard={editingTask} onClose={() => setEditingTask(null)} onSave={(card) => { setCards((current) => current.map((item) => item.id === card.id ? card : item)); setEditingTask(null); showAppToast("Tarefa atualizada com sucesso."); }} /></div></div> : null}
    {settingsOpen ? <StageSettingsDialog title="Configurar tarefas" stages={stages} showTaskOptions onClose={() => setSettingsOpen(false)} onSave={(next,options,renamed) => { setTaskOptions(options); setStages(next); setCards((current) => current.map((card) => ({...card,stage:renamed[card.stage] || (next.includes(card.stage) ? card.stage : next[0])}))); setComposerStage(next[0]); setSettingsOpen(false); showAppToast("Etapas das tarefas atualizadas."); }} /> : null}
    {cardDialog && activeDialogCard ? (
      <div className="lab-agenda-modal" role="dialog" aria-modal="true" aria-label={`Detalhes de ${activeDialogCard.title}`} onClick={() => setCardDialog(null)}>
        <section className="workflow-card-dialog" onClick={(event) => event.stopPropagation()}>
          <header><div><small>ATIVIDADE</small><h2>{activeDialogCard.title}</h2></div><button type="button" aria-label="Fechar" onClick={() => setCardDialog(null)}><X size={18} /></button></header>
          <nav><button type="button" className={cardDialog.tab === "comments" ? "active" : ""} onClick={() => setCardDialog({ ...cardDialog, tab: "comments" })}><MessageCircle size={15} />Comentários <b>{activeDialogCard.comments.length}</b></button><button type="button" className={cardDialog.tab === "files" ? "active" : ""} onClick={() => setCardDialog({ ...cardDialog, tab: "files" })}><Paperclip size={15} />Anexos <b>{activeDialogCard.files.length}</b></button></nav>
          {cardDialog.tab === "comments" ? <div className="workflow-comments-panel"><div>{activeDialogCard.comments.length ? activeDialogCard.comments.map((comment, index) => <p key={`${comment}-${index}`}><i>{activeDialogCard.owner.slice(0, 2).toUpperCase()}</i><span><b>{activeDialogCard.owner}</b>{comment}</span></p>) : <small>Nenhum comentário ainda.</small>}</div><form onSubmit={(event) => { event.preventDefault(); if (!commentDraft.trim()) return; setCards((current) => current.map((card) => card.id === activeDialogCard.id ? { ...card, comments: [...card.comments, commentDraft.trim()] } : card)); setCommentDraft(""); }}><input value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Escrever um comentário" /><button type="submit">Adicionar</button></form></div> : <div className="workflow-files-panel"><div>{activeDialogCard.files.length ? activeDialogCard.files.map((file,index) => <span key={index}><FileText size={15} />{typeof file === "string" ? file : safeAttachmentUrl(file.url) ? <a href={file.url} download={file.name}>{file.name}</a> : file.name}</span>) : <small>Nenhum anexo ainda.</small>}</div><label><Paperclip size={15} />Adicionar anexo<input type="file" onChange={async (event) => { const input=event.currentTarget; const file = input.files?.[0]; if (!file) return; try { await validateAttachment(file); const reader=new FileReader(); reader.onload=()=>{ const url=String(reader.result); if(!safeAttachmentUrl(url))return; setCards(current=>current.map(card=>card.id===activeDialogCard.id ? {...card,files:[...card.files,{name:file.name,url}]} : card)); }; reader.onerror=()=>showAppToast("Não foi possível ler o anexo."); reader.readAsDataURL(file); } catch(error) {showAppToast(error instanceof Error?error.message:"Arquivo inválido.");} input.value=""; }} /></label></div>}
        </section>
      </div>
    ) : null}
  </>;
}

function PricingView() {
  const [initialPricing] = useState(() => readData<Record<string, string | number | boolean>>("gest-pricing-draft", {}));
  const [kind, setKind] = useState(String(initialPricing.kind ?? "Produto"));
  const [unit, setUnit] = useState(String(initialPricing.unit ?? "Unidade"));
  const [name, setName] = useState(String(initialPricing.name ?? ""));
  const [saved, setSaved] = useState(false);
  const [catalogFeedback, setCatalogFeedback] = useState("");
  const [directCost, setDirectCost] = useState(Number(initialPricing.directCost ?? 0));
  const [purchaseUnits, setPurchaseUnits] = useState(Number(initialPricing.purchaseUnits ?? 1));
  const [purchaseExtras, setPurchaseExtras] = useState(Number(initialPricing.purchaseExtras ?? 0));
  const [materials, setMaterials] = useState(Number(initialPricing.materials ?? 0));
  const [packaging, setPackaging] = useState(Number(initialPricing.packaging ?? 0));
  const [freight, setFreight] = useState(Number(initialPricing.freight ?? 0));
  const [monthlyRent, setMonthlyRent] = useState(Number(initialPricing.monthlyRent ?? 0));
  const [monthlyEnergy, setMonthlyEnergy] = useState(Number(initialPricing.monthlyEnergy ?? 0));
  const [otherFixed, setOtherFixed] = useState(Number(initialPricing.otherFixed ?? 0));
  const [monthlyVolume, setMonthlyVolume] = useState(Number(initialPricing.monthlyVolume ?? 1));
  const [monthlyCompensation, setMonthlyCompensation] = useState(Number(initialPricing.monthlyCompensation ?? 0));
  const [productiveHours, setProductiveHours] = useState(Number(initialPricing.productiveHours ?? 1));
  const [executionHours, setExecutionHours] = useState(Number(initialPricing.executionHours ?? 2));
  const [loss, setLoss] = useState(Number(initialPricing.loss ?? 0));
  const [tax, setTax] = useState(Number(initialPricing.tax ?? 0));
  const [commission, setCommission] = useState(Number(initialPricing.commission ?? 0));
  const [paymentFee, setPaymentFee] = useState(Number(initialPricing.paymentFee ?? 0));
  const [discountReserve, setDiscountReserve] = useState(Number(initialPricing.discountReserve ?? 0));
  const [margin, setMargin] = useState(Number(initialPricing.margin ?? 0));
  const [includeTax, setIncludeTax] = useState(typeof initialPricing.includeTax === "boolean" ? initialPricing.includeTax : true);
  const [includeFees, setIncludeFees] = useState(typeof initialPricing.includeFees === "boolean" ? initialPricing.includeFees : true);
  const pricingSnapshot = {kind, unit, name, directCost, purchaseUnits, purchaseExtras, materials, packaging, freight, monthlyRent, monthlyEnergy, otherFixed, monthlyVolume, monthlyCompensation, productiveHours, executionHours, loss, tax, commission, paymentFee, discountReserve, margin, includeTax, includeFees};
  useEffect(() => { setSaved(false); }, [kind, unit, name, directCost, purchaseUnits, purchaseExtras, materials, packaging, freight, monthlyRent, monthlyEnergy, otherFixed, monthlyVolume, monthlyCompensation, productiveHours, executionHours, loss, tax, commission, paymentFee, discountReserve, margin, includeTax, includeFees]);
  const savePricing = () => { appStorage.setItem("gest-pricing-draft", JSON.stringify(pricingSnapshot)); setSaved(true); };
  const fixedMonthly = monthlyRent + monthlyEnergy + otherFixed;
  const fixedUnit = fixedMonthly / Math.max(1, monthlyVolume);
  const hourlyRate = (monthlyCompensation + fixedMonthly) / Math.max(1, productiveHours);
  const purchaseUnitCost = (directCost + purchaseExtras) / Math.max(1, purchaseUnits);
  const directBase = kind === "Produto" ? purchaseUnitCost + materials + packaging + freight : hourlyRate * executionHours + materials;
  const lossCost = directBase * loss / 100;
  const base = directBase + lossCost + fixedUnit;
  const variableRate = (includeTax ? tax : 0) + (includeFees ? commission + paymentFee : 0);
  const commercialRate = variableRate + discountReserve + margin;
  const divisor = Math.max(.05, 1 - commercialRate / 100);
  const price = base / divisor;
  const addToCatalog = () => {
    if (!name.trim()) { setCatalogFeedback("Informe o nome antes de adicionar ao catálogo."); return; }
    const existing = readData<string[][]>("gest-priced-catalog", []).find(row=>row[1].toLocaleLowerCase("pt-BR")===name.trim().toLocaleLowerCase("pt-BR") && row[2]===kind);
    const row = [existing?.[0] ?? crypto.randomUUID(), name.trim(), kind, new Date().toLocaleDateString("pt-BR"), price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Ativo"];
    try {
      const current = JSON.parse(appStorage.getItem("gest-priced-catalog") || "[]");
      appStorage.setItem("gest-priced-catalog", JSON.stringify([row, ...(Array.isArray(current) ? current.filter(item=>Array.isArray(item) && item[0]!==row[0]) : [])]));
      const fields = {"Nome / título":name.trim(),Tipo:kind,"Preço de venda":money(price),"Custo total":money(base),"Duração estimada do serviço (opcional)":kind === "Serviço" ? String(executionHours * 60) : "","Margem estimada":`${margin}%`,"Quantidade / unidade":unit,"Impostos e taxas":`${variableRate}%`,"Descrição":"Precificação cadastrada"};
      appStorage.setItem(`gest-record-inputs-Catálogo-${row[0]}`,JSON.stringify(fields));
      appStorage.setItem("gest-pricing-draft",JSON.stringify(pricingSnapshot));
      const commercialTerms=readData<Record<string,{commissionRate:number}>>("gest-service-commercial-terms",{});
      appStorage.setItem("gest-service-commercial-terms",JSON.stringify({...commercialTerms,[row[0]]:{commissionRate:includeFees?Math.min(100,Math.max(0,commission)):0}}));
      setCatalogFeedback(`${kind} adicionado ao Catálogo.`);
    } catch { setCatalogFeedback("Não foi possível salvar neste navegador."); }
  };
  const Field = ({ label, help, value, setValue }: { label: string; help: string; value: number; setValue: (value: number) => void }) => <label><span>{label}<InfoHint text={help} /></span><div className="pricing-input"><span>R$</span><input type="number" min="0" step="0.01" value={value} onChange={(event) => setValue(Number(event.target.value))} /></div></label>;
  return <>
    <StandardModuleTop
      title="Precificação"
      help="Forme preços sustentáveis considerando custos diretos, estrutura, tributos, taxas e margem."
      action={<div className="v2-segment pricing-kind-switch"><button className={kind === "Produto" ? "selected" : ""} onClick={() => { setKind("Produto"); setUnit("Unidade"); }}>Produto</button><button className={kind === "Serviço" ? "selected" : ""} onClick={() => { setKind("Serviço"); setUnit("Hora"); }}>Serviço</button></div>}
    >
      <Metric label="Custo base" value={base.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} detail="estrutura incluída" tone="blue" />
      <Metric label="Preço sugerido" value={price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} detail="cálculo atualizado" tone="green" />
      <Metric label="Margem de lucro" value={`${margin}%`} detail="sobre o preço final" tone="violet" />
      <Metric label="Tributos e taxas" value={`${variableRate}%`} detail="incidência total" tone="orange" />
    </StandardModuleTop>
    <article className="v2-card pricing-workspace">
      <header><div><h2>Precificação do {kind.toLowerCase()}</h2><p>Preencha os custos da operação. O cálculo é atualizado automaticamente.</p></div></header>
      <div className="pricing-grid">
        <section className="pricing-form">
          <div className="pricing-section pricing-identification"><h3>Identificação</h3><label><span>Nome do {kind.toLowerCase()}<InfoHint text="Nome usado no catálogo, propostas e vendas." /></span><input value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} placeholder={`Ex.: ${kind === "Produto" ? "Shampoo premium" : "Consultoria estratégica"}`} /></label><ClientSelect compact label="Unidade de venda" value={unit} onChange={(value) => { setUnit(value); setSaved(false); }} options={kind === "Produto" ? ["Unidade", "Pacote", "Kit"] : ["Hora", "Sessão", "Pacote", "Diária"]} /></div>
          <div className="pricing-section"><h3>{kind === "Produto" ? "Compra e custo por unidade" : "Tempo e custos diretos do serviço"}</h3>{kind === "Produto" ? <><Field label="Valor total da compra" help="Quanto foi pago pelo lote inteiro, antes dos custos adicionais." value={directCost} setValue={setDirectCost} /><label><span>Unidades recebidas na compra<InfoHint text="Quantidade de unidades contidas nesse lote." /></span><input type="number" min="1" step="1" value={purchaseUnits} onChange={(event) => setPurchaseUnits(Math.max(1, Number(event.target.value) || 1))} /></label><Field label="Adicionais da compra" help="Frete do lote, seguro ou outras despesas totais que devem ser divididas entre as unidades." value={purchaseExtras} setValue={setPurchaseExtras} /><article className="pricing-derived"><span>Custo por unidade adquirida<InfoHint text="Valor total pago mais adicionais, dividido pela quantidade recebida." /></span><strong>{purchaseUnitCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong><small>(compra + adicionais) ÷ unidades</small></article><Field label="Insumos por unidade" help="Materiais adicionais usados em cada unidade vendida." value={materials} setValue={setMaterials} /><Field label="Embalagem por unidade" help="Embalagem e etiquetas usadas em cada unidade vendida." value={packaging} setValue={setPackaging} /><Field label="Frete adicional por unidade" help="Use apenas se houver frete por unidade além do custo lançado no lote." value={freight} setValue={setFreight} /></> : <><Field label="Pró-labore ou remuneração mensal" help="Remuneração mensal de quem executa o serviço, incluindo encargos." value={monthlyCompensation} setValue={setMonthlyCompensation} /><label><span>Horas produtivas por mês<InfoHint text="Horas realmente vendáveis. Exclua pausas, administração, reuniões e ociosidade." /></span><input type="number" min="1" value={productiveHours} onChange={(event) => setProductiveHours(Number(event.target.value))} /></label><label><span>Horas para executar o serviço<InfoHint text="Tempo total médio dedicado a uma entrega, incluindo preparação e finalização." /></span><input type="number" min="0" step="0.25" value={executionHours} onChange={(event) => setExecutionHours(Number(event.target.value))} /></label><Field label="Materiais e terceiros" help="Materiais consumidos e serviços terceirizados em cada entrega." value={materials} setValue={setMaterials} /><article className="pricing-derived"><span>Valor econômico da hora<InfoHint text="Remuneração mais estrutura mensal divididas pelas horas produtivas." /></span><strong>{hourlyRate.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></article></>}
          </div>
          <div className="pricing-section"><h3>Estrutura e rateio mensal</h3><Field label="Aluguel" help="Aluguel, condomínio e IPTU mensais do espaço utilizado." value={monthlyRent} setValue={setMonthlyRent} /><Field label="Energia, água e internet" help="Média mensal das contas de consumo da operação." value={monthlyEnergy} setValue={setMonthlyEnergy} /><Field label="Folha, sistemas e outros fixos" help="Custos que existem mesmo sem venda: equipe, sistemas, contador, seguros e manutenção." value={otherFixed} setValue={setOtherFixed} /><label><span>Volume vendido por mês<InfoHint text="Quantidade média de unidades ou serviços vendidos, usada para ratear os custos fixos." /></span><input type="number" min="1" value={monthlyVolume} onChange={(event) => setMonthlyVolume(Number(event.target.value))} /></label></div>
          <div className="pricing-section"><h3>Perdas e impostos</h3><label><span>Perdas e desperdícios (%)<InfoHint text="Percentual médio de perdas, retrabalho, validade, quebra ou ociosidade." /></span><input type="number" min="0" step="0.1" value={loss} onChange={(event) => setLoss(Number(event.target.value))} /></label><label className="pricing-toggle"><span><b>Incluir impostos</b><small>Simples, ISS, ICMS ou outro tributo efetivo.</small></span><button type="button" className={includeTax ? "switch on" : "switch"} onClick={() => setIncludeTax(!includeTax)}><i /></button></label>{includeTax && <label><span>Alíquota efetiva (%)<InfoHint text="Percentual real de tributos incidentes sobre esta venda, conforme seu regime tributário." /></span><input type="number" min="0" step="0.1" value={tax} onChange={(event) => setTax(Number(event.target.value))} /></label>}</div>
          <div className="pricing-section"><h3>Venda, desconto e lucro</h3><label className="pricing-toggle"><span><b>Incluir taxas de venda</b><small>Maquininha, marketplace e comissão comercial.</small></span><button type="button" className={includeFees ? "switch on" : "switch"} onClick={() => setIncludeFees(!includeFees)}><i /></button></label>{includeFees ? <><label><span>Taxa da maquininha (%)<InfoHint text="Custo percentual do cartão ou do meio de pagamento usado na venda." /></span><input type="number" min="0" step="0.1" value={paymentFee} onChange={(event) => setPaymentFee(Number(event.target.value))} /></label><label><span>Comissão de venda (%)<InfoHint text="Percentual destinado ao vendedor, parceiro ou marketplace." /></span><input type="number" min="0" step="0.1" value={commission} onChange={(event) => setCommission(Number(event.target.value))} /></label></> : null}<label><span>Margem para desconto (%)<InfoHint text="Reserva no preço para conceder desconto sem consumir a margem de lucro planejada." /></span><input type="number" min="0" step="0.1" value={discountReserve} onChange={(event) => setDiscountReserve(Number(event.target.value))} /></label><label><span>Margem de lucro desejada (%)<InfoHint text="Lucro desejado sobre o preço final, depois dos custos, impostos, taxas e desconto previsto." /></span><input type="number" min="0" max="90" step="0.1" value={margin} onChange={(event) => setMargin(Number(event.target.value))} /></label></div>
        </section>
        <aside><i><Calculator size={24} /></i><small>PREÇO SUGERIDO</small><strong>{price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong><p>Preço mínimo calculado para cobrir a estrutura e preservar as margens informadas.</p><dl><div><dt>Custo direto</dt><dd>{directBase.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></div><div><dt>Rateio fixo unitário</dt><dd>{fixedUnit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></div><div><dt>Perdas</dt><dd>{lossCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></div><div><dt>Tributos e taxas</dt><dd>{variableRate}%</dd></div><div><dt>Desconto reservado</dt><dd>{discountReserve}%</dd></div><div><dt>Margem de lucro</dt><dd>{margin}%</dd></div></dl><button className="v2-primary" onClick={savePricing}>{saved ? <><CheckCircle2 size={15} />Precificação salva</> : "Salvar precificação"}</button><button type="button" className="v2-primary" onClick={addToCatalog}><Plus size={15} />Adicionar à lista de {kind === "Produto" ? "produtos" : "serviços"}</button>{catalogFeedback ? <small role="status">{catalogFeedback}</small> : null}</aside>
      </div>
    </article>
  </>;
}

function moduleFilterValue(row: string[], filter: string, view?: string) {
  const key = filter.toLocaleLowerCase("pt-BR");
  const stock = view === "Estoque" || (!view && row.length === 9);
  if (key.includes("status") || key.includes("etapa")) return row[stock ? 6 : 5] ?? "";
  if (key.includes("responsável")) return row[11] ?? "Não informado";
  if (key.includes("período") || key.includes("data") || key.includes("prazo") || key.includes("validade")) return row[stock ? 4 : 3] ?? "";
  return row[2] ?? "";
}

const supportStages = ["Novos", "Responder hoje", "Em atendimento", "Aguardando cliente", "Intensificar", "Resolvidos", "Aguardando equipe", "Retorno agendado", "Sem resposta"];
type SupportContact = { number: number; person: string; phone: string; subject: string; channel: string; updated: string; owner: string; stage: string; priority: string; returnDate: string; clientId?: string; createdAt?:string };
const supportSeed: SupportContact[] = [];

type AnnualCampaign = { id: string; title: string; dateKey: string; dateLabel: string; enabled: boolean; offset: string; audience: string; customAudience: string; message: string };
const campaignOffsets = ["No dia", "1 dia antes", "3 dias antes", "7 dias antes"];
function nthWeekday(year: number, month: number, weekday: number, occurrence: number) {
  const first = new Date(year, month, 1, 12);
  return new Date(year, month, 1 + ((7 + weekday - first.getDay()) % 7) + 7 * (occurrence - 1), 12);
}
function easterSunday(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), month = Math.floor((h + l - 7 * m + 114) / 31) - 1, day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day, 12);
}
function buildAnnualCampaigns(): AnnualCampaign[] {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const fixed = [
    ["new-year", "Ano Novo", 0, 1, "Que o novo ano traga muitas conquistas! Conte conosco."],
    ["womens-day", "Dia Internacional da Mulher", 2, 8, "Hoje celebramos sua força e suas conquistas. Feliz Dia da Mulher!"],
    ["consumer-day", "Dia do Consumidor", 2, 15, "Obrigado por fazer parte da nossa história. Feliz Dia do Consumidor!"],
    ["lovers-day", "Dia dos Namorados", 5, 12, "Desejamos um dia cheio de carinho e bons momentos. Feliz Dia dos Namorados!"],
    ["client-day", "Dia do Cliente", 8, 15, "Obrigado pela confiança. É muito bom ter você com a gente!"],
    ["christmas", "Natal", 11, 25, "Desejamos a você e à sua família um Natal de paz e alegria!"],
  ] as const;
  const dates: Array<[string, string, Date, string]> = fixed.map(([id, title, month, day, message]) => {
    let date = new Date(now.getFullYear(), month, day, 12);
    if (date < now) date = new Date(now.getFullYear() + 1, month, day, 12);
    return [id, title, date, message];
  });
  for (const year of [now.getFullYear(), now.getFullYear() + 1]) {
    const mothers = nthWeekday(year, 4, 0, 2), fathers = nthWeekday(year, 7, 0, 2), blackFriday = nthWeekday(year, 10, 5, 4), easter = easterSunday(year);
    const carnaval = new Date(easter); carnaval.setDate(carnaval.getDate() - 47);
    const pascoa = new Date(easter);
    for (const [id, title, date, message] of [
      ["mothers-day", "Dia das Mães", mothers, "Neste Dia das Mães, desejamos muito carinho e momentos especiais!"],
      ["fathers-day", "Dia dos Pais", fathers, "Desejamos um Dia dos Pais cheio de bons momentos!"],
      ["black-friday", "Black Friday", blackFriday, "Tem novidades e condições especiais para você. Confira!"],
      ["carnival", "Carnaval", carnaval, "Desejamos um ótimo feriado e momentos de descanso!"],
      ["easter", "Páscoa", pascoa, "Desejamos uma Páscoa de renovação e bons momentos!"],
    ] as Array<[string,string,Date,string]>) if (date >= now) dates.push([id,title,date,message]);
  }
  dates.push(["birthday", "Aniversário do cliente", new Date(9999, 0, 1, 12), "Oi, {nome}! Feliz aniversário! Desejamos um novo ciclo cheio de saúde e alegrias. Será um prazer celebrar com você!"]);
  return dates.sort((a,b) => a[2].getTime() - b[2].getTime()).map(([id,title,date,message]) => {
    const dateKey = id === "birthday" ? "birthday" : `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    return { id, title, dateKey, dateLabel: id === "birthday" ? "Na data de nascimento cadastrada" : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }), enabled: id === "birthday", offset: id === "birthday" ? "No dia" : "3 dias antes", audience: id === "birthday" ? "Aniversariantes" : "Todos os clientes ativos", customAudience: "", message };
  });
}

function SupportAutomaticCampaigns({ campaigns, onChange }: { campaigns: AnnualCampaign[]; onChange: (campaigns: AnnualCampaign[]) => void }) {
  const update = (id: string, patch: Partial<AnnualCampaign>) => onChange(campaigns.map((campaign) => campaign.id === id ? { ...campaign, ...patch } : campaign));
  return <section className="support-campaigns"><header><div><small>DATAS COMEMORATIVAS</small><h3>Aniversários e campanhas sazonais</h3><p>Edite os textos sugeridos e escolha quando e para quem preparar cada mensagem.</p></div><CalendarClock size={22} /></header><aside>Configuração demonstrativa: as mensagens não são enviadas sem uma integração de comunicação.</aside><div className="support-campaign-grid">{campaigns.map((campaign) => <details className="support-campaign-card" key={campaign.id}><summary><span><strong>{campaign.title}</strong><small>{campaign.dateLabel}</small></span><i className={campaign.enabled ? "on" : ""}>{campaign.enabled ? "Ativa" : "Pausada"}</i></summary><div className="support-campaign-fields"><label className="support-campaign-enable"><input type="checkbox" checked={campaign.enabled} onChange={(event) => update(campaign.id, { enabled: event.target.checked })} />Preparar mensagem automaticamente</label><label><span>Quando preparar</span><select value={campaign.offset} onChange={(event) => update(campaign.id, { offset: event.target.value })}>{campaignOffsets.map((offset) => <option key={offset}>{offset}</option>)}</select></label><label><span>Enviar para</span><select value={campaign.audience} onChange={(event) => update(campaign.id, { audience: event.target.value })}>{(campaign.id === "birthday" ? ["Aniversariantes", "Todos os clientes ativos", "Lista personalizada"] : ["Todos os clientes ativos", "Clientes com aniversário próximo", "Lista personalizada"]).map((audience) => <option key={audience}>{audience}</option>)}</select></label>{campaign.audience === "Lista personalizada" ? <label><span>Clientes escolhidos</span><input value={campaign.customAudience} onChange={(event) => update(campaign.id, { customAudience: event.target.value })} placeholder="Digite nomes separados por vírgula" /></label> : null}<label className="support-campaign-message"><span>Mensagem sugerida · use {"{nome}"} para personalizar</span><textarea value={campaign.message} onChange={(event) => update(campaign.id, { message: event.target.value })} rows={3} /></label><p className="support-campaign-preview">Prévia: {campaign.message.replaceAll("{nome}", "Ana")}</p></div></details>)}</div></section>;
}

function SupportView() {
  const [templateEditor,setTemplateEditor] = useState<number | "new" | null>(null);
  const [items, setItems] = useStoredData<SupportContact[]>("gest-support-contacts", []);
  const [clientDirectory, setClientDirectory] = useState<Array<{ id: string; name: string; email: string; type: string; contact: string; total: string; status: string; birthday?: string }>>([]);
  const [mode, setMode] = useState<"kanban" | "list">("list");
  const [channel, setChannel] = useState("Todos os canais");
  const [owner, setOwner] = useState("Todos");
  const [creating, setCreating] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [workspaceTab, setWorkspaceTab] = useState<"conversations" | "assistant" | "templates">("conversations");
  const [draft, setDraft] = useState("");
  const [chatFontSize, setChatFontSize] = useState(14);
  const [conversationSearch, setConversationSearch] = useState("");
  const [journeyFilter, setJourneyFilter] = useState("Todos");
  const [contactJourneys,setContactJourneys]=useState<ReturnType<typeof readJourneys>>({});
  useEffect(()=>setContactJourneys(readJourneys()),[]);
  const [clientHistoryOpen, setClientHistoryOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<AnnualCampaign[]>(buildAnnualCampaigns);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);
  const [templates, setTemplates] = useStoredData<Array<[string, string]>>("gest-support-templates", [["Boas-vindas", "Olá! Seja bem-vindo à Bella Gestão. Como podemos ajudar?"], ["Confirmação", "Seu atendimento está confirmado. Se precisar alterar, responda esta mensagem."], ["Cobrança", "Olá! Enviamos os dados da sua cobrança. Posso ajudar com alguma dúvida?"], ["Encerramento", "Seu atendimento foi concluído. Ficamos à disposição sempre que precisar."]]);
  const inactivity = useInactivity(true);
  const [automaticRules, setAutomaticRules] = useState<Record<string, boolean>>({ greeting: true, away: true, confirmation: false });
  const [messages, setMessages] = useStoredData<Record<number, Array<{ from: "client" | "team" | "ai"; text: string; time: string; attachment?: ChatAttachment }>>>("gest-support-messages", {});
  useEffect(() => {
    try {
      const incoming = JSON.parse(appStorage.getItem("clinical-message-draft") ?? "null");
      if (!incoming || typeof incoming.patientName !== "string" || typeof incoming.text !== "string") return;
      const storedContacts = readData<SupportContact[]>("gest-support-contacts",[]);
      const existing = storedContacts.find(item => item.clientId === incoming.patientId || item.person.trim().toLocaleLowerCase("pt-BR") === incoming.patientName.trim().toLocaleLowerCase("pt-BR"));
      const number = existing?.number ?? Math.max(0, ...storedContacts.map(item => item.number)) + 1;
      if (!existing) {
        const clients = readData<Array<{id:string;phone?:string}>>("gest-clients", []);
        const patient = Array.isArray(clients) ? clients.find(item => item.id === incoming.patientId) : null;
        setItems(current => [...current,{number,person:incoming.patientName,clientId:incoming.patientId,phone:patient?.phone ?? "",createdAt:new Date().toISOString(),subject:"Documento do atendimento",channel:"WhatsApp",updated:"Hoje, agora",owner:"Equipe",stage:"Em atendimento",priority:"Normal",returnDate:""}]);
      }
      setSelectedNumber(number);
      setDraft(incoming.text);
      setMode("list");
      setWorkspaceTab("conversations");
      appStorage.removeItem("clinical-message-draft");
    } catch { window.dispatchEvent(new CustomEvent("gest-app-toast",{detail:"Não foi possível preparar a mensagem. Volte ao documento e tente novamente."})); }
  }, []);
  const matchesJourney = (item: (typeof items)[number], filter: string) => filter === "Todos"
    || contactJourneys[item.person.trim().toLocaleLowerCase("pt-BR")]?.status === filter
    || (filter === "Sem agendamento" && [1, 5].includes(item.number))
    || (filter === "Agendaram e faltaram" && item.number === 2)
    || (filter === "Sem remarcação" && item.number === 4)
    || (filter === "Retornos no prazo" && [3, 6].includes(item.number));
  const journeyBase = items.filter((item) => (channel === "Todos os canais" || item.channel === channel) && (owner === "Todos" || item.owner === owner));
  const journeyOptions = ["Todos", "Sem agendamento", "Agendaram e faltaram", "Sem remarcação", "Retornos no prazo", ...journeyStatuses].map((label) => [label, label === "Todos" ? "" : String(journeyBase.filter((item) => matchesJourney(item, label)).length)]);
  const visible = journeyBase.filter((item) => matchesJourney(item, journeyFilter) && inactivity.matches(item.person,item.updated));
  const selected = items.find((item) => item.number === selectedNumber) ?? visible[0] ?? items[0];
  const linkedId = selected?.clientId?.replace(/^#CL-/, "");
  const normalizedContact = selected?.person.trim().toLocaleLowerCase("pt-BR");
  const savedClient = clientDirectory.find((client) => client.name.trim().toLocaleLowerCase("pt-BR") === normalizedContact) ?? clientDirectory.find((client) => client.id === linkedId);
  const fallbackClient = selected?.clientId ? clients.find((client) => client[0] === selected.clientId) : undefined;
  const linkedClient = savedClient ? [selected?.clientId ?? savedClient.id, "", savedClient.name, savedClient.email, savedClient.type, savedClient.contact, "", savedClient.total, savedClient.status, savedClient.birthday ?? ""] : fallbackClient;
  useEffect(() => { try { const saved = JSON.parse(appStorage.getItem("gest-clients") || "[]"); if (Array.isArray(saved)) setClientDirectory(saved); } catch { /* The sample contact links remain available. */ } }, []);
  useEffect(() => { const fresh = buildAnnualCampaigns(); try { const saved = JSON.parse(appStorage.getItem("gest-automatic-campaigns") || "[]") as AnnualCampaign[]; setCampaigns(fresh.map((item) => ({ ...item, ...(saved.find((row) => row.id === item.id) ?? {}), dateKey: item.dateKey, dateLabel: item.dateLabel, title: item.title }))); } catch { setCampaigns(fresh); } finally { setCampaignsLoaded(true); } }, []);
  useEffect(() => { if (campaignsLoaded) { try { appStorage.setItem("gest-automatic-campaigns", JSON.stringify(campaigns)); } catch { /* Current settings remain available during this visit. */ } } }, [campaigns, campaignsLoaded]);
  useEffect(() => {
    const clientName = document.querySelector<HTMLElement>(".support-chat > header > span > strong");
    if (!clientName || !linkedClient || workspaceTab !== "conversations" || mode !== "list") return;
    clientName.setAttribute("role", "button"); clientName.setAttribute("tabindex", "0"); clientName.setAttribute("aria-label", `Abrir histórico de ${linkedClient[2]}`); clientName.setAttribute("title", "Abrir o histórico deste cliente"); clientName.style.cursor = "pointer";
    const open = () => setClientHistoryOpen(true);
    const keydown = (event: KeyboardEvent) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } };
    clientName.addEventListener("click", open); clientName.addEventListener("keydown", keydown);
    return () => { clientName.removeEventListener("click", open); clientName.removeEventListener("keydown", keydown); clientName.removeAttribute("role"); clientName.removeAttribute("tabindex"); clientName.removeAttribute("aria-label"); clientName.removeAttribute("title"); clientName.style.cursor = ""; };
  }, [selectedNumber, linkedClient, workspaceTab, mode]);
  const sendMessage = () => {
    if (!draft.trim() || !selected) return;
    setMessages((current) => ({ ...current, [selected.number]: [...(current[selected.number] ?? []), { from: "team", text: draft.trim(), time: "Agora" }] }));
    const contacts=readData<Record<string,string>>("gest-contact-last-interaction",{}); contacts[selected.person.trim().toLocaleLowerCase("pt-BR")]=new Date().toISOString(); appStorage.setItem("gest-contact-last-interaction",JSON.stringify(contacts));
    setDraft("");
  };
  useEffect(() => {
    const history = document.querySelector<HTMLDivElement>(".support-chat-history");
    if (history) history.scrollTo({ top: history.scrollHeight, behavior: "smooth" });
  }, [messages, selectedNumber]);
  useEffect(() => {
    if (mode !== "kanban") return;
    const board = document.querySelector<HTMLElement>(".shelf-kanban-support");
    if (!board) return;
    const cards = Array.from(board.querySelectorAll<HTMLElement>(".support-kanban-card"));
    const columns = Array.from(board.querySelectorAll<HTMLElement>(":scope > article"));
    const cleanups: Array<() => void> = [];
    cards.forEach((card) => {
      card.draggable = true;
      const start = (event: DragEvent) => {
        const number = card.querySelector("small")?.textContent?.match(/\d+/)?.[0];
        if (number && event.dataTransfer) { event.dataTransfer.setData("text/plain", number); event.dataTransfer.effectAllowed = "move"; }
        card.classList.add("is-dragging");
      };
      const end = () => card.classList.remove("is-dragging");
      card.addEventListener("dragstart", start); card.addEventListener("dragend", end);
      cleanups.push(() => { card.removeEventListener("dragstart", start); card.removeEventListener("dragend", end); });
    });
    columns.forEach((column) => {
      const over = (event: DragEvent) => { event.preventDefault(); column.classList.add("is-over"); };
      const leave = () => column.classList.remove("is-over");
      const drop = (event: DragEvent) => {
        event.preventDefault(); leave();
        const number = Number(event.dataTransfer?.getData("text/plain"));
        const stage = column.querySelector("header strong")?.textContent;
        if (number && stage) setItems((current) => current.map((item) => item.number === number ? { ...item, stage } : item));
      };
      column.addEventListener("dragover", over); column.addEventListener("dragleave", leave); column.addEventListener("drop", drop);
      cleanups.push(() => { column.removeEventListener("dragover", over); column.removeEventListener("dragleave", leave); column.removeEventListener("drop", drop); });
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [mode, items, channel, owner, journeyFilter]);
  return <>
    <StandardModuleTop title="Mensagens" help="Centralize as conversas do WhatsApp, organize prioridades e acompanhe cada cliente." action={<button className="lab-create-activity support-create-button" onClick={() => setCreating(true)}><Plus size={17} />Nova conversa</button>}>
      <Metric label="A responder" value={String(items.filter((item) => item.stage === "Responder hoje").length)} detail="para hoje" tone="blue" />
      <Metric label="Em atendimento" value={String(items.filter((item) => item.stage === "Em atendimento").length)} detail="em acompanhamento" tone="violet" />
      <Metric label="Intensificar" value={String(items.filter((item) => item.stage === "Intensificar").length)} detail="prioridade" tone="red" />
      <Metric label="Resolvidos" value={String(items.filter((item) => item.stage === "Resolvidos").length)} detail="no período" tone="green" />
    </StandardModuleTop>
    <section className="support-toolbar"><div className="support-filter-box">{inactivity.controls}<ClientSelect compact hideLabel label="Canal" value={channel} onChange={setChannel} options={["Todos os canais", ...Array.from(new Set(items.map((item) => item.channel)))]} /><ClientSelect compact hideLabel label="Responsáveis" value={owner} onChange={setOwner} options={["Todos", ...Array.from(new Set(items.map((item) => item.owner)))]} /></div><div className="support-journey-box"><nav className="support-journey-filters" aria-label="Filtros de jornada">{journeyOptions.map(([label, count]) => <button type="button" key={label} className={journeyFilter === label ? "active" : ""} onClick={() => setJourneyFilter(label)}>{label}{count ? <b>{count}</b> : null}</button>)}</nav></div><div className="client-view-toggle support-view-toggle" role="group" aria-label="Visualização dos atendimentos"><button type="button" className={mode === "kanban" ? "active" : ""} aria-label="Visualizar em Kanban" aria-pressed={mode === "kanban"} onClick={() => setMode("kanban")}><Grid2X2 size={16} /></button><button type="button" className={mode === "list" ? "active" : ""} aria-label="Visualizar em lista" aria-pressed={mode === "list"} onClick={() => setMode("list")}><List size={17} /></button></div></section>
    {mode === "kanban" ? <section className="shelf-kanban shelf-kanban-support" aria-label="Atendimentos em Kanban">{supportStages.map((stage, stageIndex) => <article className={`stage-${["planned", "queued", "active", "review", "danger", "complete"][stageIndex]}`} key={stage}><header><span className="shelf-kanban-dot" aria-hidden="true" /><strong>{stage}</strong><b>{visible.filter((item) => item.stage === stage).length}</b></header><div className="shelf-kanban-stack">{visible.filter((item) => item.stage === stage).map((item) => <article role="button" tabIndex={0} className={`shelf-kanban-card support-kanban-card tone-${item.priority.toLowerCase()}`} key={item.number} onClick={() => { setSelectedNumber(item.number); setWorkspaceTab("conversations"); setMode("list"); }} onKeyDown={(event) => { if (event.key === "Enter") { setSelectedNumber(item.number); setWorkspaceTab("conversations"); setMode("list"); } }}><span className="shelf-kanban-band">{item.priority === "Alta" ? <Siren size={13} /> : <MessageCircle size={13} />}{item.priority === "Alta" ? "Resposta prioritária" : item.channel}</span><span className="shelf-kanban-body"><small>ATENDIMENTO {item.number}</small><strong>{item.person}</strong><span>{item.subject}</span><span className="support-kanban-owner"><em>{item.person.split(" ").map((part) => part[0]).join("").slice(0, 2)}</em><span><b>{item.owner}</b><time>{item.updated}</time></span></span><span onClick={(event) => event.stopPropagation()}><ClientSelect compact hideLabel label="Etapa" value={item.stage} onChange={(value) => setItems((current) => current.map((entry) => entry.number === item.number ? { ...entry, stage: value } : entry))} options={supportStages} /></span></span></article>)}</div></article>)}</section> : <section className="support-whatsapp"><nav className="support-workspace-tabs" aria-label="Ferramentas do atendimento"><button type="button" className={workspaceTab === "conversations" ? "active" : ""} onClick={() => setWorkspaceTab("conversations")}><MessageCircle size={15} />Conversas</button><button type="button" className={workspaceTab === "assistant" ? "active" : ""} onClick={() => setWorkspaceTab("assistant")}><Bot size={15} />Atendente virtual</button><button type="button" className={workspaceTab === "templates" ? "active" : ""} onClick={() => setWorkspaceTab("templates")}><Sparkles size={15} />Mensagens automáticas</button></nav>{workspaceTab === "conversations" ? <div className="support-inbox-shell"><aside className="support-contact-list"><header><div className="lab-search-form client-local-search"><Search size={17} /><input value={conversationSearch} onChange={(event) => setConversationSearch(event.target.value)} placeholder="Buscar conversa..." /></div><span>{visible.length} conversas</span></header><div>{visible.filter((item) => `${item.person} ${item.subject}`.toLowerCase().includes(conversationSearch.toLowerCase())).map((item) => <button type="button" className={selected?.number === item.number ? "active" : ""} key={item.number} onClick={() => setSelectedNumber(item.number)}><i>{item.person.split(" ").map((part) => part[0]).join("").slice(0, 2)}</i><span><strong>{item.person}</strong><small>{item.subject}</small><em className={`support-stage-${item.stage.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")}`}>{item.stage}</em></span><time>{item.updated.replace("Hoje, ", "")}</time></button>)}</div></aside>{selected ? <article className="support-chat" style={{ "--chat-font-size": `${chatFontSize}px` } as React.CSSProperties}><header><i>{selected.person.split(" ").map((part) => part[0]).join("").slice(0, 2)}</i><span><strong>{selected.person}</strong><small>{selected.phone} · Demonstração local</small></span><ClientSelect compact hideLabel label="Etapa do atendimento" value={selected.stage} onChange={(value) => setItems((current) => current.map((entry) => entry.number === selected.number ? { ...entry, stage: value } : entry))} options={supportStages} /><div className="support-font-controls" role="group" aria-label="Tamanho da fonte da conversa"><button type="button" aria-label="Diminuir fonte" onClick={() => setChatFontSize((size) => Math.max(12, size - 1))}>A−</button><button type="button" aria-label="Aumentar fonte" onClick={() => setChatFontSize((size) => Math.min(22, size + 1))}>A+</button></div></header><ContactJourney name={selected.person} onChange={()=>setContactJourneys(readJourneys())}/><div className="support-chat-history"><small>HOJE</small>{(messages[selected.number] ?? [{ from: "client" as const, text: selected.subject, time: selected.updated.replace("Hoje, ", "") }]).map((message, index) => <div className={message.from} key={`${message.time}-${index}`}><span>{message.from === "ai" ? <b><Bot size={13} />Atendente virtual</b> : null}{message.text}{"attachment" in message && message.attachment ? <a href={message.attachment.url || `data:text/plain;charset=utf-8,${encodeURIComponent(message.attachment.content??"")}`} download={message.attachment.name} className="chat-attachment-link">Abrir / salvar anexo</a> : null}<time>{message.time}</time></span></div>)}</div><footer><MessageAttachments onAttach={file=>setMessages(current=>({...current,[selected.number]:[...(current[selected.number]??[]),{from:"team",text:`📎 ${file.name}`,time:"Agora",attachment:file}]}))}/><textarea className="support-message-draft" rows={draft.includes("\n")?4:1} aria-label="Mensagem preparada" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Digite uma mensagem (simulação local)..." /><button type="button" className="support-send" onClick={sendMessage} aria-label="Enviar mensagem"><ArrowUpRight size={18} /></button></footer></article> : null}</div> : workspaceTab === "assistant" ? <section className="support-automation-panel"><header><i><Bot size={22} /></i><div><small>ATENDENTE VIRTUAL</small><h2>Automação do WhatsApp</h2><p>Configure como a atendente recebe, direciona e responde os contatos da clínica.</p></div><button type="button" className="lab-create-activity" onClick={() => { setMode("list"); setWorkspaceTab("conversations"); setSelectedNumber(1); window.alert("Conversa de teste aberta. As mensagens desta prévia permanecem apenas neste navegador."); }}>Testar conversa</button></header><div className="support-rule-grid">{[["greeting", "Saudação inicial", "Responde automaticamente quando a conversa começa."], ["away", "Fora do horário", "Informa o horário de atendimento e registra a solicitação."]].map(([key, title, detail]) => <article key={key}><span><strong>{title}</strong><small>{detail}</small></span><button type="button" className={automaticRules[key] ? "switch on" : "switch"} onClick={() => setAutomaticRules((current) => ({ ...current, [key]: !current[key] }))} aria-pressed={automaticRules[key]}><i /></button></article>)}</div></section> : <section className="support-automation-panel support-templates"><header><i><Sparkles size={22} /></i><div><small>MENSAGENS AUTOMÁTICAS</small><h2>Respostas pré-programadas</h2><p>Textos prontos para agilizar conversas frequentes no WhatsApp.</p></div><button type="button" className="lab-create-activity" onClick={() => { setTemplateEditor("new"); }}><Plus size={15} />Nova mensagem</button></header><MessageAutomationSettings/><div className="support-template-list">{templates.map(([title, text], index) => <article key={title}><span><strong>{title}</strong><p>{text}</p></span><button type="button" onClick={() => { setTemplateEditor(index); }}>Editar</button></article>)}</div></section>}</section>}
    {mode === "list" && workspaceTab === "templates" ? <SupportAutomaticCampaigns campaigns={campaigns} onChange={setCampaigns} /> : null}
    {clientHistoryOpen && linkedClient ? <div className="support-client-history-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setClientHistoryOpen(false); }}><section className="support-client-history" role="dialog" aria-modal="true" aria-label={`Histórico de ${linkedClient[2]}`}><header><button type="button" className="lab-create-activity" onClick={() => setClientHistoryOpen(false)}><ChevronLeft size={16} />Voltar à conversa</button><div><small>HISTÓRICO DO CLIENTE</small><h2>{linkedClient[2]}</h2><p>{linkedClient[0]} · {linkedClient[4]} · {linkedClient[3]}</p></div></header><div className="support-client-history-summary"><article><small>Data de nascimento</small><strong>{linkedClient[9] ? new Date(`${linkedClient[9]}T12:00:00`).toLocaleDateString("pt-BR") : "Não informada"}</strong></article><article><small>Total comprado</small><strong>{linkedClient[7]}</strong></article><article><small>Status</small><strong>{linkedClient[8]}</strong></article></div><h3>Atendimentos e pagamentos</h3><div className="support-client-history-list">{[["23/05/2025 · 14:20", "Serviço realizado · Avaliação e limpeza", "R$ 3.250,00 · Crédito Visa · 2 parcelas · Concluída"], ["21/05/2025 · 10:15", "Atendimento · Procedimento estético", "R$ 12.800,00 · Pix à vista · Pendente"], ["12/05/2025 · 16:00", "Pagamento recebido", "R$ 3.250,00 · Pix · Venda #VND-1278"]].map(([date, title, detail]) => <article key={date}><i /><div><strong>{title}</strong><small>{detail}</small></div><time>{date}</time></article>)}</div><footer><button type="button" className="lab-create-activity" onClick={() => setClientHistoryOpen(false)}>Voltar à conversa</button></footer></section></div> : null}
    {templateEditor !== null ? <RecordDialog title={templateEditor === "new" ? "Nova mensagem pronta" : "Editar mensagem pronta"} fields={["Nome", "Descrição"]} initialValues={typeof templateEditor === "number" ? {Nome:templates[templateEditor][0],Descrição:templates[templateEditor][1]} : undefined} onClose={()=>setTemplateEditor(null)} onSave={values=>{if(!values.Nome?.trim() || !values.Descrição?.trim())return; const next:[string,string]=[values.Nome.trim(),values.Descrição.trim()];setTemplates(current=>templateEditor === "new" ? [...current,next] : current.map((row,index)=>index===templateEditor?next:row));setTemplateEditor(null);}} /> : null}
    {creating ? <RecordDialog title="Novo atendimento" onClose={() => setCreating(false)} onSave={(values) => { setItems((current) => [{ createdAt: new Date().toISOString(), number: Math.max(0,...current.map(row=>row.number))+1, person: values.Pessoa || "Novo contato", phone: values.WhatsApp || "WhatsApp não informado", subject: values.Registro || "Novo atendimento", channel: "WhatsApp", updated: "Agora", owner: values.Responsável || "Sem responsável", stage: "Novos", priority: "Normal", returnDate: values["Data prevista para retorno"] || "A definir" }, ...current]); setCreating(false); }} fields={["Pessoa", "WhatsApp", "Registro", "Responsável", "Data prevista para retorno", "Descrição"]} /> : null}
  </>;
}

/** Lista operacional comum: usa etiquetas visuais e painel lateral para criar e editar. */
function EnhancedModuleView({ view }: { view: View }) {
  const config = modules[view] ?? modules["Vendas"];
  const [selected, setSelected] = useState<string[] | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Mais recentes");
  const [form, setForm] = useState<"new" | "edit" | null>(null);
  const [records, setRecords] = useStoredData<string[][]>(moduleKey(view), []);
  const [chartPeriod, setChartPeriod] = useState("30 dias");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [purchaseMetrics, setPurchaseMetrics] = useState<Array<[string,string,string,string]>>([]);
  useEffect(() => {
    let savedCatalog: string[][] = [];
    let savedStock: string[][] = [];
    if (view === "Catálogo") {
      for (const key of ["gest-catalog-records", "gest-priced-catalog"]) {
        try { const saved = JSON.parse(appStorage.getItem(key) || "[]"); if (Array.isArray(saved)) savedCatalog.push(...saved.filter((row): row is string[] => Array.isArray(row) && row.every((cell) => typeof cell === "string"))); } catch { /* Keep the default catalog. */ }
      }
    }
    if (view === "Estoque") {
      try { const saved = JSON.parse(appStorage.getItem("gest-stock-records") || "[]"); if (Array.isArray(saved)) savedStock = saved.filter((row): row is string[] => Array.isArray(row) && row.every((cell) => typeof cell === "string")); } catch { /* Mantém os produtos demonstrativos. */ }
    }
    let savedDocuments: string[][] | null = null;
    if (view === "Documentos") { try { savedDocuments = JSON.parse(appStorage.getItem("gest-document-records") ?? "null"); } catch { /* Mantém demonstração. */ } }
    setRecords(view === "Documentos" ? savedDocuments ?? [] : view === "Estoque" ? savedStock : view === "Catálogo" ? [...new Map(savedCatalog.map(row => [row[0], row])).values()] : readData<string[][]>(moduleKey(view), []));
    setSelected(null);
    setForm(null);
    setFilterValues({});
    setViewMode("list");
    setCurrentPage(1);
  }, [view, config.rows]);
  useEffect(() => {
    setCurrentPage(1);
  }, [query, sort, filterValues, pageSize]);
  const reorderRecord = (row: string[]) => setRecords((current) => {
    const index = current.findIndex((item) => item[0] === row[0]);
    if (index < 0 || current.length < 2) return current;
    const next = [...current];
    const target = index === 0 ? current.length - 1 : index - 1;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  if (view === "Tarefas" || view === "Projetos") return <WorkflowKanban view={view} />;
  if (view === "Atendimento") return <SupportView />;
  if (view === "Compras") return <>
    <PageIntro title={view} subtitle={config.subtitle} />
    <section className="v2-metrics client-metrics client-overview-metrics" aria-label="Indicadores de compras">
      {purchaseMetrics.map((metric) => <Metric key={metric[0]} label={metric[0]} value={metric[1]} detail={metric[2]} tone={metric[3]} />)}
    </section>
    <PurchaseMarketWatch onMetricsChange={setPurchaseMetrics} />
  </>;
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
    .filter((row) => config.filters.every((filter) => !filterValues[filter] || filterValues[filter] === "Todos" || moduleFilterValue(row, filter, view) === filterValues[filter]))
    .sort((a, b) =>
      sort === "A–Z"
        ? a[1].localeCompare(b[1])
        : sort === "Z–A"
          ? b[1].localeCompare(a[1])
          : sort === "Menor valor" ? numberValue(a[4]) - numberValue(b[4]) : sort === "Maior valor" ? numberValue(b[4]) - numberValue(a[4]) : (() => {
            const parseDate=(value:string)=>{ const br=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);return Date.parse(br ? `${br[3]}-${br[2]}-${br[1]}` : value) || 0; };
            return (parseDate(a[3]) - parseDate(b[3])) * (sort === "Mais antigos" ? 1 : -1);
          })(),
    );
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const maintenanceValues = reportValues("Manutenção · Custo");
  const maintenanceChange = maintenanceValues.at(-2) ? ((maintenanceValues.at(-1)! - maintenanceValues.at(-2)!) / maintenanceValues.at(-2)!) * 100 : 0;
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
        <section className="v2-metrics client-metrics client-overview-metrics">
          {config.metrics.map((metric) => (
            <Metric
              key={metric[0]}
              label={metric[0]}
              value={moduleMetric(metric[0], readData<string[][]>(moduleKey(view), []), moduleColumns(view))}
              detail="Registros cadastrados"
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
            initialValues={selected ? { Nome: selected[1], Tipo: selected[4], Descrição: selected[6] ?? "", Cliente:selected[7] ?? "", "Venda / serviço":selected[8] ?? "", Arquivo:selected[9] ?? "" } : undefined}
            onSave={(values) => {
              const next = [selected?.[0] ?? crypto.randomUUID(), values.Nome || selected?.[1] || "Novo documento", selected?.[2] ?? "Cliente", new Date().toLocaleDateString("pt-BR"), values.Tipo || selected?.[4] || "Texto", "Ativo", values.Descrição ?? "", values.Cliente ?? "", values["Venda / serviço"] ?? "", values.Arquivo ?? ""];
              const updated = form === "edit" && selected ? records.map((row) => row[0] === selected[0] ? next : row) : [next, ...records];
              setRecords(updated); appStorage.setItem("gest-document-records", JSON.stringify(updated));
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
      <PageIntro title={view} subtitle={config.subtitle} action={(view === "Estoque" || view === "Manutenção") ? <button type="button" className="module-settings-trigger" onClick={() => setSettingsOpen(true)} aria-label={`Configurar alertas de ${view.toLowerCase()}`} title={`Configurar alertas de ${view.toLowerCase()}`}><Settings size={17} /></button> : undefined} />
      <section className="v2-metrics client-metrics client-overview-metrics">
        {config.metrics.map((metric) => (
          <Metric
            key={metric[0]}
            label={metric[0]}
            value={moduleMetric(metric[0], readData<string[][]>(moduleKey(view), []), moduleColumns(view))}
            detail="Registros cadastrados"
            tone={metric[3]}
          />
        ))}
      </section>
      <article className={`v2-card v2-client-table v2-ranked-client-table v2-module-table${view === "Equipe" ? " v2-team-table" : ""}`}>
        <header>
          <div className="lab-search-form client-local-search">
            <Search size={19} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Buscar em ${view.toLowerCase()}...`}
            />
            <button type="button" className={query ? "visible" : ""} onClick={() => setQuery("")} aria-label="Limpar busca"><X size={16} /></button>
          </div>
          {config.filters.map((filter) => (
            <ClientSelect
              key={filter}
              label={filter}
              value={filterValues[filter] ?? "Todos"}
              onChange={(value) => setFilterValues((current) => ({ ...current, [filter]: value }))}
              showDot={filter.toLocaleLowerCase("pt-BR").includes("status")}
              options={["Todos", ...Array.from(new Set(records.map((row) => moduleFilterValue(row, filter, view)).filter(Boolean)))]}
            />
          ))}
          <ClientSelect label="Ordenar por" value={sort} onChange={setSort} options={["Mais recentes", "Mais antigos", "A–Z", "Z–A", "Maior valor", "Menor valor"]} />
          <button className="lab-create-activity" onClick={() => setForm("new")}>
            <Plus size={17} />
            {config.label}
          </button>
          <div className="client-view-toggle module-view-toggle" role="group" aria-label={`Visualização de ${view.toLowerCase()}`}>
            <button type="button" className={viewMode === "list" ? "active" : ""} aria-label="Visualizar em lista" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}><List size={17} /></button>
            <button type="button" className={viewMode === "grid" ? "active" : ""} aria-label="Visualizar em grade" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}><Grid2X2 size={16} /></button>
          </div>
        </header>
        {viewMode === "list" ? <table>
          <thead>
            <tr>
              {(view === "Vendas" ? ["Nº", "Registro", "Pagamento", "Valor de referência", "Valor final", "Desconto", "Parcelamento / taxas", "Status", "Ações"] : view === "Estoque" ? ["Nº", "Produto / serviço", "Tipo", "Quantidade", "Lote", "Validade", "Atualização", "Preço unitário", "Status", "Ações"] : view === "Manutenção" ? ["Nº", "Equipamento", "Categoria", "Data da manutenção", "Preço", "Status", "Ações"] : [
                "Nº", "Registro",
                view === "Equipe"
                  ? "Cargo"
                  : view === "Catálogo" ? "Categoria" : "Tipo",
                "Atualização",
                "Valor / referência",
                "Status",
                "Ações",
              ]).map((item) => (
                <th key={item}>{item}</th>
              ))}
            </tr>
          </thead>
          <EmptyTableBody>
            {pageRows.map((row, index) => view === "Vendas" ? (
              <tr key={row[0]}>
                <td>{(currentPage - 1) * pageSize + index + 1}</td><td><strong>{row[1]}</strong></td><td>{row[2]}</td>
                <td>{row[4]}</td>
                <td><strong>{money(numberValue(row[4])*(1-numberValue(row[6])/100))}</strong></td>
                <td><span className="sales-discount">{numberValue(row[6])}%</span></td>
                <td>{row[7] ? row[7]+"x" : "—"}</td>
                <td><span className={`status ${statusTone(row[5])}`}>●　{row[5]}</span></td>
                <td><button onClick={() => setSelected(row)}>Ver detalhes</button><button className="v2-icon-button" onClick={() => { setSelected(row); setForm("edit"); }} aria-label="Editar"><Edit3 size={16} /></button></td>
              </tr>
            ) : view === "Estoque" ? (
              <tr key={row[0]}>
                <td>{(currentPage - 1) * pageSize + index + 1}</td><td>{row[1]}</td><td><span className="type">{row[2]}</span></td><td>{row[3]}</td><td>{row[7] || "—"}</td><td>{row[8] ? new Date(`${row[8]}T12:00:00`).toLocaleDateString("pt-BR") : "—"}</td><td>{row[4]}</td><td>{row[5]}</td><td><span className={`status ${statusTone(row[6])}`}>●　{row[6]}</span></td><td><button onClick={() => setSelected([row[0], row[1], row[2], row[4], row[5], row[6]])}>Ver detalhes</button><button className="v2-icon-button" onClick={() => { setSelected(row); setForm("edit"); }} aria-label="Editar"><Edit3 size={16} /></button></td>
              </tr>
            ) : (
              <tr key={row[0]}>
                <td>{(currentPage - 1) * pageSize + index + 1}</td>
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
                  <button className="v2-icon-button" aria-label="Reordenar" onClick={(event) => { event.stopPropagation(); reorderRecord(row); }}>
                    <Menu size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </EmptyTableBody>
        </table> : (
          <section className="client-card-grid" aria-label={`${view} em grade`}>
            {pageRows.map((row, index) => {
              const recordStatus = moduleFilterValue(row, "Status", view);
              const recordTone = statusTone(recordStatus);
              const cardTone = (["peach", "gray", "blue"] as const)[index % 3];
              return (
                <article className={`client-grid-card is-${cardTone}`} key={row[0]}>
                  <div className="client-grid-profile">
                    <div className="client-grid-avatar">
                      <span>{row[1].slice(0, 2).toUpperCase()}</span>
                      <i className={recordTone} aria-hidden />
                    </div>
                    <h2>{row[1]}</h2>
                    <p>Registro {(currentPage - 1) * pageSize + index + 1}</p>
                  </div>
                  <div className="client-grid-facts">
                    <div><small>Tipo</small><strong>{row[2] || "—"}</strong></div>
                    <div><small>Atualização</small><strong>{row[3] || "—"}</strong></div>
                    <div><small>Referência</small><strong>{row[4] || "—"}</strong></div>
                    <div><small>Status</small><strong className={`client-grid-status is-${recordTone}`}><i /> {recordStatus || "—"}</strong></div>
                    <div><small>Número</small><strong>{(currentPage - 1) * pageSize + index + 1}</strong></div>
                    <div><small>Área</small><strong>{view}</strong></div>
                  </div>
                  <footer>
                    <button type="button" className="primary" onClick={() => setSelected(row)}>Ver detalhes</button>
                    <button type="button" aria-label="Editar" onClick={() => { setSelected(row); setForm("edit"); }}><Edit3 size={17} /></button>
                    <button type="button" aria-label="Organizar posição" onClick={() => reorderRecord(row)}><GripVertical size={18} /></button>
                  </footer>
                </article>
              );
            })}
          </section>
        )}
        <footer>
          <ClientSelect compact label="Mostrar por página" value={String(pageSize)} onChange={(value) => setPageSize(Number(value))} options={["5", "10", "25", "50"]} />
          Mostrando {pageRows.length} de {rows.length} registros{" "}
          <div className="pagination">
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>‹</button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) =>
              <button
                type="button"
                key={page}
                className={page === currentPage ? "active" : ""}
                aria-current={page === currentPage ? "page" : undefined}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>,
            )}
            <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>›</button>
          </div>
        </footer>
      </article>
      {view === "Manutenção" && (
        <article className="v2-card v2-module-chart maintenance-chart-below maintenance-chart-modern finance-chart-model">
          <header><h2>Custo e quantidade de manutenções</h2><span className={`finance-chart-trend ${maintenanceChange <= 0 ? "positive" : "negative"}`}>{maintenanceChange <= 0 ? <ArrowDown size={14} /> : <ArrowUp size={14} />}{Math.abs(maintenanceChange).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</span><ClientSelect compact hideLabel label="Período do gráfico" value={chartPeriod} onChange={setChartPeriod} options={["30 dias", "3 meses", "6 meses", "12 meses"]} /></header>
          <ComparisonChart labels={["Manutenção · Custo"]} period={chartPeriod} maintenanceBreakdown />
        </article>
      )}
      {settingsOpen && (view === "Estoque" || view === "Manutenção") ? <ModuleSettingsDialog view={view} onClose={() => setSettingsOpen(false)} /> : null}
      {form && (
        <RecordDialog
          key={`${view}-${form}-${selected?.[0] ?? "new"}`}
          title={
            form === "new"
              ? config.label
              : `Editar ${selected?.[1] ?? "registro"}`
          }
          onClose={() => {
            setForm(null);
            if (selected) setSelected(null);
          }}
          initialValues={view === "Estoque" && form === "edit" && selected ? { "Nome do produto": selected[1], "Tipo": selected[2], "Quantidade": selected[3], "Lote": selected[7], "Validade": selected[8], "Preço unitário": selected[5], "Status": selected[6] } : selected ? readData<Record<string,string>>(`gest-record-inputs-${view}-${selected[0]}`, {"Nome / título":selected[1],"Tipo":selected[2],"Forma de pagamento":selected[2],"Data":selected[3]?.slice(0,10),"Valor":selected[4],"Preço de venda":selected[4],"Status":selected[5]}) : undefined}
          onSave={(values) => {
            if (view === "Estoque") {
              const next = [form === "edit" && selected ? selected[0] : crypto.randomUUID(), values["Nome do produto"] || selected?.[1] || "Novo produto", values["Tipo"] || selected?.[2] || "Produto", values["Quantidade"] || selected?.[3] || "0 unidades", new Date().toISOString(), values["Preço unitário"] || selected?.[5] || "R$ 0,00", values["Status"] || selected?.[6] || "Ativo", values["Lote"] || selected?.[7] || "", values["Validade"] || selected?.[8] || ""];
              setRecords((current) => { const updated = form === "edit" && selected ? current.map((row) => row[0] === selected[0] ? next : row) : [next, ...current]; appStorage.setItem("gest-stock-records", JSON.stringify(updated.filter((row) => !config.rows.some((sample) => sample[0] === row[0])))); return updated; });
              setForm(null);
              setSelected(null);
              return;
            }
            const next: string[] = [
              form === "edit" && selected ? selected[0] : crypto.randomUUID(),
              values["Nome / título"] || selected?.[1] || "Novo registro",
              values["Forma de pagamento"] || values["Tipo"] || values["Categoria"] || selected?.[2] || "Geral",
              values["Data"] || new Date().toISOString(),
              values["Preço de venda"] || values["Valor"] || selected?.[4] || "R$ 0,00",
              values["Status"] || selected?.[5] || "Ativo",
              values["Desconto (%)"] || selected?.[6] || "0",
              values["Parcelas"] || selected?.[7] || "1",
              values["Cliente"] || selected?.[8] || "",
              values["Taxa (%)"] || selected?.[9] || "0",
              values["Custo direto"] || selected?.[10] || "0",
            ];
            next[11] = values.Responsável ?? selected?.[11] ?? "";
            if (view === "Vendas") { try { registerModuleSale(next); } catch(error) { showAppToast(error instanceof Error ? error.message : "Não foi possível atualizar a venda."); return; } }
            appStorage.setItem(`gest-record-inputs-${view}-${next[0]}`,JSON.stringify(values));
            setRecords((current) => {
              const updated = form === "edit" && selected ? current.map((row) => row[0] === selected[0] ? next : row) : [next, ...current];
              if (view === "Catálogo") {
                try {
                  const priced = JSON.parse(appStorage.getItem("gest-priced-catalog") || "[]");
                  const pricedIds = new Set((Array.isArray(priced) ? priced : []).filter(Array.isArray).map((row: string[]) => row[0]));
                  if(pricedIds.has(next[0])) appStorage.setItem("gest-priced-catalog",JSON.stringify(priced.map((row:string[])=>row[0]===next[0]?next:row)));
                  appStorage.setItem("gest-catalog-records", JSON.stringify(updated));
                } catch { /* O cadastro continua visível nesta sessão. */ }
              }
              return updated;
            });
            setForm(null);
            setSelected(null);
          }}
          fields={view === "Estoque" ? ["Nome do produto", "Tipo", "Quantidade", "Lote", "Validade", "Preço unitário", "Status"] : view === "Catálogo" ? ["Nome / título", "Tipo", "Categoria", "Duração estimada do serviço (opcional)", "SKU / código", "Custo total", "Preço de venda", "Margem estimada", "Quantidade / unidade", "Impostos e taxas", "Descrição"] : view === "Vendas" ? ["Nome / título", "Cliente", "Forma de pagamento", "Data", "Valor", "Desconto (%)", "Parcelas", "Taxa (%)", "Custo direto", "Status"] : ["Nome / título", "Tipo", "Responsável", "Data", "Valor", "Descrição"]}
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

function TeamAttendanceView({ onOpenClock }: { onOpenClock: () => void }) {
  const [clock, setClock] = useState<ClockState>(readClockState);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [shiftFilter, setShiftFilter] = useState("Todas as jornadas");
  const [sort, setSort] = useState("A–Z");
  useEffect(() => { setClock(readClockState()); }, []);
  const entries = (id: string) => clock.records.filter((record) => record.workerId === id && record.type === "entrada");
  const days = (id: string) => new Set(entries(id).map((record) => new Date(record.at).toLocaleDateString("pt-BR"))).size;
  const late = (id: string, start: string) => new Set(entries(id).filter((record) => new Date(record.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false }) > start).map((record) => new Date(record.at).toLocaleDateString("pt-BR"))).size;
  const workedHours = (id: string) => {
    const records = clock.records.filter((record) => record.workerId === id).sort((a, b) => a.at.localeCompare(b.at));
    let total = 0;
    records.forEach((record, index) => { if (record.type === "entrada" && records[index + 1]?.type === "saída") total += new Date(records[index + 1].at).getTime() - new Date(record.at).getTime(); });
    return `${Math.max(0, total / 3600000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}h`;
  };
  const people = clock.workers.map(worker => ({ ...worker, birth:"Não informado", admission:"Não informado", role:"Não informado", worked:workedHours(worker.id),workedDays:days(worker.id),lateDays:late(worker.id,worker.start),status:late(worker.id,worker.start)?"Acompanhar":"Em dia" }));
  const visiblePeople = people.filter((person) => `${person.name} ${person.role}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))).filter((person) => statusFilter === "Todos" || person.status === statusFilter).filter((person) => shiftFilter === "Todas as jornadas" || `${person.start}–${person.end}` === shiftFilter).sort((a, b) => sort === "Z–A" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));
  const presentToday = clock.workers.filter((worker) => entries(worker.id).some((entry) => new Date(entry.at).toLocaleDateString("pt-BR") === new Date().toLocaleDateString("pt-BR"))).length;
  return <section className="clock-page"><StandardModuleTop title="Equipe" help="Resumo de presença e atrasos. Cadastros, horários e marcação ficam em Ponto." action={<button type="button" className="lab-create-activity" onClick={onOpenClock}><Clock3 size={16} />Configurar ponto</button>}>
    <InformativeMetricCardPreview tone="blue" icon={UsersRound} title="Pessoas na equipe" value={String(clock.workers.length)} change="Pessoas cadastradas" />
    <InformativeMetricCardPreview tone="teal" icon={CalendarDays} title="Dias registrados" value={String(clock.workers.reduce((sum, worker) => sum + days(worker.id), 0))} change="Total da equipe" />
    <InformativeMetricCardPreview tone="amber" icon={Clock3} title="Dias com atraso" value={String(clock.workers.reduce((sum, worker) => sum + late(worker.id, worker.start), 0))} change="Total da equipe" />
    <InformativeMetricCardPreview tone="violet" icon={UserCheck} title="Presenças hoje" value={String(presentToday)} change="Entradas registradas" />
  </StandardModuleTop>
  <article className="v2-card v2-client-table v2-ranked-client-table v2-module-table team-summary-table">
    <header className="team-summary-controls">
      <div className="lab-search-form client-local-search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar na equipe..." /><button type="button" className={query ? "visible" : ""} onClick={() => setQuery("")} aria-label="Limpar busca"><X size={16} /></button></div>
      <ClientSelect label="Status" value={statusFilter} onChange={setStatusFilter} showDot options={["Todos", "Em dia", "Acompanhar"]} />
      <ClientSelect label="Jornada" value={shiftFilter} onChange={setShiftFilter} options={["Todas as jornadas", ...Array.from(new Set(clock.workers.map((worker) => `${worker.start}–${worker.end}`)))]} />
      <ClientSelect label="Ordenar por" value={sort} onChange={setSort} options={["A–Z", "Z–A"]} />
      <div className="client-view-toggle module-view-toggle" role="group" aria-label="Visualização do resumo por pessoa"><button type="button" className={viewMode === "list" ? "active" : ""} aria-label="Visualizar em lista" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}><List size={17} /></button><button type="button" className={viewMode === "grid" ? "active" : ""} aria-label="Visualizar em cards" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}><Grid2X2 size={16} /></button></div>
    </header>
    {viewMode === "list" ? <div className="team-table-scroll"><table><thead><tr><th>Linha</th><th>Pessoa</th><th>Cargo</th><th>Ingresso</th><th>Jornada</th><th>Horas trabalhadas</th><th>Dias trabalhados</th><th>Atrasos</th><th>Status</th></tr></thead><EmptyTableBody>{visiblePeople.map((person, index) => <tr key={person.id}><td className="team-row-number">{index + 1}</td><td><strong>{person.name}</strong></td><td><span className="type">{person.role}</span></td><td>{person.admission}</td><td>{person.start}–{person.end}</td><td>{person.worked}</td><td>{person.workedDays}</td><td>{person.lateDays}</td><td><span className={`status ${person.lateDays ? "warn" : "active"}`}>●　{person.status}</span></td></tr>)}</EmptyTableBody></table></div> : <section className="client-card-grid team-card-grid" aria-label="Resumo por pessoa em cards">{visiblePeople.map((person, index) => <article className={`client-grid-card is-${(["peach", "gray", "blue"] as const)[index % 3]}`} key={person.id}><div className="client-grid-profile"><div className="client-grid-avatar"><span>{person.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><i className={person.lateDays ? "warn" : "active"} /></div><h2>{person.name}</h2><p>{person.role}</p></div><div className="client-grid-facts"><div><small>Nascimento</small><strong>{person.birth}</strong></div><div><small>Ingresso</small><strong>{person.admission}</strong></div><div><small>Jornada</small><strong>{person.start}–{person.end}</strong></div><div><small>Horas trabalhadas</small><strong>{person.worked}</strong></div><div><small>Dias trabalhados</small><strong>{person.workedDays}</strong></div><div><small>Atrasos</small><strong>{person.lateDays}</strong></div><div><small>Status</small><strong className={`client-grid-status is-${person.lateDays ? "warn" : "active"}`}><i />{person.status}</strong></div></div></article>)}</section>}
  </article></section>;
}

function FirstStepsView({ onNavigate }: { onNavigate: (view: View) => void }) {
  const steps: Array<{ title: string; detail: string; view: View; icon: LucideIcon }> = [
    { title: "Cadastre seus serviços", detail: "Defina preços, duração e responsáveis para agilizar a Agenda.", view: "Catálogo", icon: BriefcaseBusiness },
    { title: "Cadastre seus produtos", detail: "Organize o catálogo usado em vendas, atendimentos e propostas.", view: "Catálogo", icon: ShoppingBag },
    { title: "Configure o estoque", detail: "Informe quantidades e limites críticos para receber alertas.", view: "Estoque", icon: Package },
    { title: "Organize clientes", detail: "Centralize os dados que alimentam Agenda, CRM e Atendimento.", view: "Clientes", icon: Users },
    { title: "Revise o financeiro", detail: "Ajuste categorias e confira como vendas e atendimentos chegam ao caixa.", view: "Financeiro", icon: WalletCards },
    { title: "Comece a operar", detail: "Com os cadastros prontos, agende a primeira atividade.", view: "Agenda", icon: CalendarDays },
  ];
  return <section className="first-steps-page">
    <header className="v2-intro client-compact-intro"><div><h1>Primeiros passos</h1></div></header>
    <article className="first-steps-hero"><span><BookOpen size={24} /></span><div><small>TUTORIAL GERAL</small><h2>Prepare seu negócio em 6 passos</h2></div><strong>Escolha uma etapa</strong></article>
    <section className="first-steps-grid">{steps.map((step, index) => { const Icon = step.icon; return <button type="button" key={step.title} onClick={() => onNavigate(step.view)}><em>{String(index + 1).padStart(2, "0")}</em><i><Icon size={20} /></i><span><strong>{step.title}</strong><small>{step.detail}</small></span><ArrowUpRight size={17} /></button>; })}</section>
  </section>;
}

function GuidedTutorial({ view, onClose }: { view: View; onClose: () => void }) {
  const guides: Partial<Record<View, string[]>> = {
    "Catálogo": ["Cadastre primeiro o nome, o tipo e a categoria.", "Preencha preço, duração ou disponibilidade.", "Salve para usar o item na Agenda, nas vendas e nos atendimentos."],
    "Estoque": ["Cadastre cada produto e sua unidade.", "Informe o saldo atual e o limite de estoque crítico.", "Use as movimentações para manter as quantidades atualizadas."],
    "Clientes": ["Cadastre os dados principais do cliente.", "Inclua contato, preferências e observações úteis.", "Abra os detalhes para acompanhar histórico e relacionamento."],
    "Financeiro": ["Revise as categorias financeiras.", "Registre ou confira entradas e saídas.", "Use os indicadores e gráficos para acompanhar o caixa."],
    "Agenda": ["Clique em Adicionar para criar o primeiro evento.", "Escolha cliente, serviço, data e responsável.", "Depois do horário, confirme o resultado para alimentar o sistema."],
  };
  const items = guides[view] ?? [`Conheça os controles principais de ${view}.`, "Preencha os dados essenciais.", "Salve e revise o resultado antes de continuar."];
  const [step, setStep] = useState(0);
  return <div className="guided-tutorial-backdrop" role="dialog" aria-modal="true" aria-label={`Tutorial de ${view}`}><article className="guided-tutorial-card"><header><span><BookOpen size={18} /></span><div><small>PRIMEIROS PASSOS · {step + 1} DE {items.length}</small><h2>Como começar em {view}</h2></div><button type="button" aria-label="Fechar tutorial" onClick={onClose}><X size={17} /></button></header><div className="guided-tutorial-progress"><i style={{ width: `${(step + 1) / items.length * 100}%` }} /></div><section><strong>{items[step]}</strong><p>Siga esta orientação na tela aberta. Você pode avançar e voltar quando quiser.</p></section><footer><button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>Voltar</button>{step < items.length - 1 ? <button type="button" className="primary" onClick={() => setStep((value) => value + 1)}>Próximo</button> : <button type="button" className="primary" onClick={onClose}>Concluir tutorial</button>}</footer></article></div>;
}

function InicioApp() {
  const access = useAccess();
  const [active, setActiveState] = useState<View>("Início");
  const setActive = (view: View) => { if (access.allowed(view)) setActiveState(view); };
  useEffect(() => {
    if (!access.member || !access.allowed("Prontuário") || !access.allowed("Financeiro")) return;
    let active=true;
    const update=()=>{if(active) void syncClinicalFinance(access.member!.businessId).catch(()=>showAppToast("Não foi possível atualizar os lançamentos clínicos."));};
    update(); window.addEventListener("gest-clinical-record-saved",update);
    return ()=>{active=false;window.removeEventListener("gest-clinical-record-saved",update);};
  },[access.member?.businessId]);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => { const warn = () => setStorageWarning(true); window.addEventListener("gest-storage-warning", warn); return () => window.removeEventListener("gest-storage-warning", warn); }, []);
  const [dark, setDark] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarColor, setSidebarColor] = useState("#071a38");
  const [appScale, setAppScale] = useState(100);
  const [notifications, setNotifications] = useState(false);
  const [selectedClientRecord, setSelectedClientRecord] = useState<string[] | null>(null);
  const [clinicalContext, setClinicalContext] = useState<{ patientId: string; patientName: string; appointment?: { id: string; service: string; coverage: { kind: "Particular" | "Plano"; insurer: string; category: string; authorization: string } }; origin: "Agenda" | "Detalhe" | "Início" } | null>(null);
  const [guidedTutorial, setGuidedTutorial] = useState<View | null>(null);
  const [settingsTab, setSettingsTab] = useState("Negócio");
  const [appToast, setAppToast] = useState("");
  const [toastToken, setToastToken] = useState(0);

  useEffect(() => {
    const savedTheme = appStorage.getItem("gest-theme");
    const savedSidebar = appStorage.getItem("gest-sidebar-color");
    const savedScale = Number(appStorage.getItem("gest-app-scale"));
    const scaleBaseline = appStorage.getItem("gest-app-scale-baseline");
    setSidebarCollapsed(appStorage.getItem("gest-sidebar-collapsed") === "true");
    if (savedTheme === "dark") setDark(true);
    if (savedSidebar) setSidebarColor(savedSidebar);
    if (scaleBaseline === "standard-120-v3" && savedScale >= 75 && savedScale <= 125) {
      setAppScale(savedScale);
    } else if (scaleBaseline === "standard-115-v2" && savedScale >= 90 && savedScale <= 130) {
      const migratedScale = Math.round(savedScale / 1.2);
      setAppScale(migratedScale);
      appStorage.setItem("gest-app-scale", String(migratedScale));
      appStorage.setItem("gest-app-scale-baseline", "standard-120-v3");
    } else {
      setAppScale(100);
      appStorage.setItem("gest-app-scale", "100");
      appStorage.setItem("gest-app-scale-baseline", "standard-120-v3");
    }
    setPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (preferencesLoaded) appStorage.setItem("gest-theme", dark ? "dark" : "light");
  }, [dark, preferencesLoaded]);

  useEffect(() => applyDocumentTheme(document.documentElement, dark), [dark]);

  useEffect(() => {
    if (preferencesLoaded) appStorage.setItem("gest-sidebar-color", sidebarColor);
  }, [sidebarColor, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) appStorage.setItem("gest-app-scale", String(appScale));
  }, [appScale, preferencesLoaded]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [active]);

  useEffect(() => {
    let timer = 0;
    const handleToast = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      if (typeof message !== "string" || !message) return;
      setAppToast(message);
      setToastToken((value) => value + 1);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setAppToast(""), 2800);
    };
    window.addEventListener("gest-app-toast", handleToast);
    window.addEventListener("gest-app-notification", handleToast);
    return () => { window.clearTimeout(timer); window.removeEventListener("gest-app-toast", handleToast); window.removeEventListener("gest-app-notification", handleToast); };
  }, []);

  let page =
    active === "Início" ? (
      access.allowed("Financeiro") ? <HomeView setActive={setActive} onOpenClinical={(event) => {
        if (!access.allowed("Prontuário")) { showAppToast("Solicite acesso ao prontuário."); return; }
        let patientId = `agenda:${event.patientName.toLocaleLowerCase("pt-BR")}`;
        try { const rows = JSON.parse(appStorage.getItem("gest-clients") ?? "[]"); const match = Array.isArray(rows) ? rows.find((row) => row.name?.toLocaleLowerCase("pt-BR") === event.patientName.toLocaleLowerCase("pt-BR")) : null; if (match?.id) patientId = match.id; } catch { /* Abre o prontuário mesmo sem cadastro local. */ }
        setClinicalContext({ patientId, patientName: event.patientName, appointment: { id: event.id, service: event.service, coverage: event.coverage }, origin: "Início" }); setActive("Prontuário");
      }} /> : <section className="client-record-panel"><header><h2>Minha rotina</h2></header><p>{roleLabels[access.member!.role]} · acesse as áreas liberadas para você.</p><div className="access-module-grid">{appModules.filter(([, label]) => label !== "Início" && access.allowed(label)).map(([id, label]) => <button key={id} className="lab-create-activity" onClick={() => setActive(label as View)}>{label}</button>)}</div></section>
    ) : active === "Agenda" ? (
      <AgendaExperience onOpenClinical={(event) => {
        if (!access.allowed("Prontuário")) { showAppToast("Solicite acesso ao prontuário."); return; }
        let patientId = `agenda:${event.patientName.toLocaleLowerCase("pt-BR")}`;
        try { const rows = JSON.parse(appStorage.getItem("gest-clients") ?? "[]"); const match = Array.isArray(rows) ? rows.find((row) => row.name?.toLocaleLowerCase("pt-BR") === event.patientName.toLocaleLowerCase("pt-BR")) : null; if (match?.id) patientId = match.id; } catch { /* Agenda continua disponível. */ }
        setClinicalContext({ patientId, patientName: event.patientName, appointment: { id: event.id, service: event.service, coverage: event.coverage }, origin: "Agenda" }); setActive("Prontuário");
      }} />
    ) : active === "Clientes" ? (
      <ClientsExperience onAnamnesis={(id,name)=>{setClinicalContext({patientId:id,patientName:name,origin:"Detalhe"});setActive("Prontuário");}}
        onDetails={(record) => {
          setSelectedClientRecord(record);
          setActive("Detalhe");
        }}
      />
    ) : active === "Detalhe" ? (
      <ClientDetailPage
        onMessage={()=>setActive("Atendimento")}
        record={selectedClientRecord ?? undefined}
        onBack={() => setActive("Clientes")}
        onOpenClinical={(record) => { setClinicalContext({ patientId: record[7] ?? record[0], patientName: record[1], origin: "Detalhe" }); setActive("Prontuário"); }}
      />
    ) : active === "Prontuário" ? (
      clinicalContext ? null : <ClinicalAttendancePicker onResume={record=>{setClinicalContext({patientId:record.patientId,patientName:record.patientName,appointment:record.draft?.appointmentId?{id:record.draft.appointmentId,service:record.draft.service,coverage:record.coverage}:undefined,origin:"Início"});setActive("Prontuário");}} onOpenAgenda={()=>setActive("Agenda")} onOpen={event=>{const patient=modules.Clientes.rows.find(row=>row[1]===event.patientName);setClinicalContext({patientId:patient?.[7]??patient?.[0]??event.patientName,patientName:event.patientName,appointment:event,origin:"Início"});}}/>
    ) : active === "Configurações" ? (
      <SettingsView onPlans={() => setActive("Loja")} dark={dark} setDark={setDark} sidebarColor={sidebarColor} setSidebarColor={setSidebarColor} appScale={appScale} setAppScale={setAppScale} initialTab={settingsTab} />
    ) : active === "Assistente" ? (
      <AssistantExperience onNavigate={(view) => setActive(view as View)} />
    ) : active === "Financeiro" ? (
      <FinanceExperience />
    ) : active === "Investimentos" ? (
      <InvestmentSimulator />
    ) : active === "Primeiros passos" ? (
      <FirstStepsView onNavigate={(view) => { setActive(view); setGuidedTutorial(appStorage.getItem(`gest-guide-hidden-${view}`) === "true" ? null : view); }} />
    ) : active === "Ponto" ? (
      <TimeClockExperience />
    ) : active === "Equipe" ? (
      <TeamAttendanceView onOpenClock={() => setActive("Ponto")} />
    ) : active === "Loja" ? (
      <StoreView />
    ) : (
      <Placeholder view={active} />
    );
  const recommendationArea = active === "Detalhe" ? "Clientes" : active;
  if (!access.allowed(active)) page = <section className="client-record-panel"><h2>Acesso restrito</h2><p>Solicite acesso ao administrador do seu empreendimento.</p></section>;
  return (
    <main className={`${dark ? "gest-v2 dark gest-redesign" : "gest-v2 gest-redesign"}${sidebarCollapsed ? " sidebar-collapsed" : ""}`} style={{ "--sidebar-color": sidebarColor, "--gest-accent": sidebarColor, "--gest-app-scale": appScale * 1.2 / 100 } as React.CSSProperties}>
      <Sidebar
        active={active}
        setActive={setActive}
        dark={dark}
        setDark={setDark}
        collapsed={sidebarCollapsed}
        setCollapsed={(value) => { setSidebarCollapsed(value); appStorage.setItem("gest-sidebar-collapsed", String(value)); }}
      />
      <section className={active === "Início" ? "v2-content home-compact-header" : "v2-content"}>
        <Topbar
          active={active}
          notificationOpen={notifications}
          setNotificationOpen={setNotifications}
          onNavigate={(view, tab) => { if (tab) setSettingsTab(tab); setActive(view); }}
          onTutorial={() => setGuidedTutorial(active)}
        />
        <main className="v2-page gest-compact-page">
          {storageWarning ? <p className="access-demo-banner" role="alert">O armazenamento do navegador está indisponível ou cheio. As alterações recentes ficam apenas nesta sessão; não feche a página antes de copiar o que precisa.</p> : null}
          {access.mode === "demo" && access.member?.role !== "owner" ? <div className="access-demo-banner">Prévia de acesso: {access.member?.name}<button className="lab-create-activity" onClick={() => access.preview("owner")}>Voltar ao dono</button></div> : null}
          {page}
          {active === "Agenda" && <ClinicalDrafts onResume={record=>{setClinicalContext({patientId:record.patientId,patientName:record.patientName,appointment:record.draft?.appointmentId?{id:record.draft.appointmentId,service:record.draft.service,coverage:record.coverage}:undefined,origin:"Agenda"});setActive("Prontuário");}}/>}
          {clinicalContext && access.allowed("Prontuário") ? <div hidden={active !== "Prontuário"}><ClinicalWorkspace onMessage={() => setActive("Atendimento")} documentModels={readData<string[][]>("gest-document-records", [])} key={`${clinicalContext.patientId}:${clinicalContext.appointment?.id ?? "client"}`} patientId={clinicalContext.patientId} patientName={clinicalContext.patientName} appointment={clinicalContext.appointment} onBack={() => {setClinicalContext(null);setActive("Prontuário");}} /></div> : null}
          {appToast ? <div key={toastToken} className={`gest-app-toast ${/remov|exclu|apag/i.test(appToast) ? "is-delete" : /erro|não foi possível|falha/i.test(appToast) ? "is-error" : ""}`} role="status">{/remov|exclu|apag/i.test(appToast) ? <Trash2 size={17} /> : <CheckCircle2 size={17} />}{appToast}</div> : null}
          {access.manage && access.allowed(active) && !(["Loja", "Início", "Tarefas", "Projetos", "Propostas", "Catálogo"] as View[]).includes(active) && (
            <ProfessionalRecommendation area={recommendationArea} />
          )}
          {guidedTutorial && active === guidedTutorial ? <GuidedTour view={guidedTutorial} onClose={() => setGuidedTutorial(null)} /> : null}
        </main>
      </section>
    </main>
  );
}

function AccessGate() {
  const access = useAccess();
  if (access.loading) return <main className="access-gate" role="status">Carregando seu acesso…</main>;
  if (!access.member) return <main className="access-gate"><h1>Acesso ao empreendimento</h1><p>{access.error || "Entre com sua conta para continuar."}</p><a className="lab-create-activity" href="/entrar">Entrar</a></main>;
  return <InicioApp key={`${access.member.businessId}:${access.member.userId ?? access.member.id}`} />;
}
export default function Inicio() { return <AccessProvider><AccessGate /></AccessProvider>; }
