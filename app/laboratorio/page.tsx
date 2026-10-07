"use client";
import { appStorage } from "../../lib/local-store";

import InfoHint from "../inicio/InfoHint";
import { ClientSelect } from "../inicio/ClientsExperience";
import { AccessProvider, useAccess } from "../inicio/AccessControl";

import {
  ArrowDown,
  ArrowUp,
  BellRing,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CloudDownload,
  Clock3,
  FileText,
  Folder,
  FolderKanban,
  Flag,
  GripVertical,
  Grid2X2,
  List,
  ListTodo,
  LogOut,
  MapPin,
  Mail,
  MessageCircle,
  MessageSquareText,
  Pencil,
  Plus,
  Printer,
  Sparkles,
  Settings,
  ShieldCheck,
  Tag,
  Repeat2,
  RotateCcw,
  Search,
  TriangleAlert,
  Trash2,
  UserRound,
  UserRoundCheck,
  UsersRound,
  Video,
  X,
  ZoomIn,
  ZoomOut,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type NotificationKind = "saved" | "deleted" | "warning";
type NotificationModule = "Calendário" | "Tarefas" | "Projetos";

function announceAppAction(message: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("gest-app-toast", { detail: message }));
}

const moduleIcons: Record<NotificationModule, LucideIcon> = {
  Calendário: CalendarDays,
  Tarefas: ListTodo,
  Projetos: FolderKanban,
};

type CenterTab = "all" | "mentions" | "system";

type CenterItem = {
  id: string;
  category: "mentions" | "system" | "activity";
  title: string;
  description: string;
  timestamp: string;
  unread?: boolean;
  status: "success" | "error" | "information";
  actions?: string[];
};

const centerItems: CenterItem[] = [
  {
    id: "backup",
    category: "system",
    title: "Backup do sistema concluído",
    description: "A cópia de segurança foi concluída e está pronta para download.",
    timestamp: "18min",
    unread: true,
    status: "success",
    actions: ["Baixar"],
  },
  {
    id: "security",
    category: "system",
    title: "Verificação de segurança concluída",
    description: "Nenhuma credencial exposta ou dependência vulnerável foi encontrada.",
    timestamp: "Dom",
    status: "success",
  },
  {
    id: "sync",
    category: "system",
    title: "Sincronização financeira falhou",
    description: "A atualização foi interrompida durante a validação dos dados.",
    timestamp: "Sáb",
    unread: true,
    status: "error",
    actions: ["Tentar novamente", "Ver detalhes"],
  },
  {
    id: "mention-client",
    category: "mentions",
    title: "Mariana mencionou você",
    description: "Pode revisar o cadastro deste cliente antes do envio?",
    timestamp: "32min",
    unread: true,
    status: "information",
  },
  {
    id: "mention-project",
    category: "mentions",
    title: "Lucas mencionou você",
    description: "O cronograma do projeto precisa da sua aprovação.",
    timestamp: "1h",
    status: "information",
  },
  {
    id: "activity",
    category: "activity",
    title: "Novo cliente cadastrado",
    description: "Ana Carolina foi adicionada à sua base de clientes.",
    timestamp: "2h",
    status: "information",
  },
];

function LabNotification({
  module,
  kind,
  message,
  duration = 4000,
  onClose,
}: {
  module: NotificationModule;
  kind: NotificationKind;
  message: string;
  duration?: number;
  onClose: () => void;
}) {
  const ModuleIcon = moduleIcons[module];
  const Icon = kind === "deleted" ? Trash2 : kind === "warning" ? TriangleAlert : ModuleIcon;

  useEffect(() => {
    const timer = globalThis.setTimeout(onClose, duration);
    return () => globalThis.clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <output className={`lab-notification is-${kind}`} role="status">
      <button type="button" onClick={onClose} aria-label="Fechar notificação">
        <X size={13} />
      </button>
      <div className="lab-notification-icon"><Icon size={22} strokeWidth={2.2} /></div>
      <div className="lab-notification-copy">
        <div><strong>{module}</strong><span>Agora</span></div>
        <p>{message}</p>
      </div>
      <i className="lab-notification-progress" style={{ animationDuration: `${duration}ms` }} />
    </output>
  );
}

export function NotificationCenterPreview({ onUnreadCountChange }: { onUnreadCountChange?: (count: number) => void } = {}) {
  const [activeTab, setActiveTab] = useState<CenterTab>("system");
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const unreadCount = centerItems.filter((item) => item.unread && !readIds.has(item.id)).length;
  const visibleItems = activeTab === "all"
    ? centerItems
    : centerItems.filter((item) => item.category === activeTab);
  const counts: Record<CenterTab, number> = {
    all: centerItems.length,
    mentions: centerItems.filter((item) => item.category === "mentions").length,
    system: centerItems.filter((item) => item.category === "system").length,
  };

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  const markRead = (id: string) => {
    setReadIds((current) => new Set(current).add(id));
  };

  return (
    <section className="lab-center" aria-label="Central de notificações">
      <header className="lab-center-head">
        <div>
          <h2>Notificações</h2>
          <p>{unreadCount} não lidas</p>
        </div>
        <button type="button" onClick={() => setReadIds(new Set(centerItems.map((item) => item.id)))} disabled={unreadCount === 0}>
          Marcar tudo como lido
        </button>
      </header>

      <div className="lab-center-tabs" role="tablist" aria-label="Categorias de notificações">
        {([
          ["all", "Todos"],
          ["mentions", "Menções"],
          ["system", "Sistema"],
        ] as Array<[CenterTab, string]>).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            className={activeTab === id ? "active" : ""}
            onClick={() => setActiveTab(id)}
          >
            {label} <span>{counts[id]}</span>
          </button>
        ))}
      </div>

      <div className="lab-center-list">
        {visibleItems.map((item) => {
          const unread = item.unread && !readIds.has(item.id);
          const StatusIcon = item.status === "success"
            ? item.id === "backup" ? CloudDownload : ShieldCheck
            : item.status === "error" ? CircleAlert : item.category === "mentions" ? MessageCircle : BellRing;
          return (
            <article key={item.id} className={`lab-center-item is-${item.status}`} onClick={() => markRead(item.id)}>
              <div className="lab-center-icon"><StatusIcon size={19} strokeWidth={2.2} /></div>
              <div className="lab-center-copy">
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.timestamp}{unread ? <i aria-label="Não lida" /> : null}</span>
                </div>
                <p>{item.description}</p>
                {item.actions ? (
                  <footer>
                    {item.actions.map((action, index) => (
                      <button key={action} type="button" className={index === 0 && item.status === "error" ? "primary" : ""} onClick={(event) => { event.stopPropagation(); markRead(item.id); }}>
                        {action}
                      </button>
                    ))}
                  </footer>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

type SelectOption = {
  id: string;
  label: string;
  color?: "green" | "yellow" | "indigo";
};

function LabSelect({ label, options, showDot = false }: { label: string; options: SelectOption[]; showDot?: boolean }) {
  const [selectedId, setSelectedId] = useState(options[0].id);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === selectedId) ?? options[0];

  return (
    <div className="lab-select-field">
      <label>{label}</label>
      <div className="lab-select">
        <button
          type="button"
          className="lab-select-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {showDot ? <i className={`lab-status-dot ${selected.color ?? "green"}`} /> : null}
          <span>{selected.label}</span>
          <ChevronDown size={18} className={open ? "open" : ""} />
        </button>
        {open ? (
          <div className="lab-select-menu" role="listbox" aria-label={label}>
            {options.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected={selectedId === option.id}
                key={option.id}
                onClick={() => { setSelectedId(option.id); setOpen(false); }}
              >
                {showDot ? <i className={`lab-status-dot ${option.color ?? "green"}`} /> : null}
                <span>{option.label}</span>
                {selectedId === option.id ? <Check size={16} /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ViewModeToggle({ iconOnly = false }: { iconOnly?: boolean }) {
  const [view, setView] = useState<"list" | "grid">("list");
  return (
    <div className={iconOnly ? "lab-view-toggle icon-only" : "lab-view-toggle"} role="group" aria-label="Visualização">
      <button type="button" className={view === "list" ? "active" : ""} aria-label="Lista" aria-pressed={view === "list"} onClick={() => setView("list")}>
        <List size={19} />
        {!iconOnly ? <span>Lista</span> : null}
      </button>
      <button type="button" className={view === "grid" ? "active" : ""} aria-label="Grade" aria-pressed={view === "grid"} onClick={() => setView("grid")}>
        <Grid2X2 size={18} />
        {!iconOnly ? <span>Grade</span> : null}
      </button>
    </div>
  );
}

function ClientCardPreview({ tone }: { tone: "peach" | "gray" | "blue" }) {
  return (
    <article className={`lab-client-card is-${tone}`}>
      <div className="lab-client-profile">
        <div className="lab-client-avatar" aria-label="Cliente sem foto: Ana Carolina">
          <span>AC</span>
          <i aria-label="Cliente ativo" />
        </div>
        <h2>Ana Carolina</h2>
        <p>ana.carolina@email.com</p>
      </div>

      <div className="lab-client-facts" aria-label="Resumo do cliente">
        <div>
          <small>Telefone</small>
          <strong>(92) 99123-4567</strong>
        </div>
        <div>
          <small>Último contato</small>
          <strong>Hoje, 14:30</strong>
        </div>
        <div>
          <small>Total vendido</small>
          <strong>R$ 18.450</strong>
        </div>
        <div>
          <small>Status</small>
          <strong className="lab-client-status"><i /> Ativo</strong>
        </div>
        <div className="lab-client-rank">
          <small>Rank</small>
          <strong><Sparkles size={15} /> Diamante · 1º</strong>
        </div>
        <div>
          <small>Retorno</small>
          <strong>18 set, 10:00</strong>
        </div>
      </div>

      <footer className="lab-client-actions">
        <button type="button" className="primary">Ver detalhes</button>
        <button type="button" aria-label="Editar cliente" title="Editar cliente"><Pencil size={18} /></button>
        <button type="button" aria-label="Organizar posição" title="Organizar posição"><GripVertical size={19} /></button>
      </footer>
    </article>
  );
}

type EventPickerId = "status" | "date" | "timeStart" | "timeEnd" | "client" | "owner" | "priority" | "reminder" | "service" | "location" | "repeat" | "coverage" | "insurer";

function EventSelect({ id, icon: Icon, label, initial = "", placeholder, options, wide = false, editable = false, openPicker, setOpenPicker, onValueChange }: {
  id: EventPickerId;
  icon: LucideIcon;
  label: string;
  initial?: string;
  placeholder: string;
  options: string[];
  wide?: boolean;
  editable?: boolean;
  openPicker: EventPickerId | null;
  setOpenPicker: (id: EventPickerId | null) => void;
  onValueChange?: (value: string) => void;
}) {
  const [selected, setSelected] = useState(initial);
  const open = openPicker === id;
  const filteredOptions = editable && selected
    ? options.filter((option) => option.toLocaleLowerCase().includes(selected.toLocaleLowerCase()))
    : options;

  return (
    <div className={`lab-event-picker ${wide ? "lab-event-wide" : ""}`}>
      {editable ? (
        <div className="lab-event-field">
          <Icon size={18} />
          <span>
            <small>{label}</small>
            <input value={selected} placeholder={placeholder} onFocus={() => setOpenPicker(id)} onChange={(event) => { setSelected(event.target.value); onValueChange?.(event.target.value); setOpenPicker(id); }} />
          </span>
          <button type="button" aria-label={`Abrir opções de ${label}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpenPicker(open ? null : id)}><ChevronDown size={16} className={open ? "open" : ""} /></button>
        </div>
      ) : (
        <button type="button" className="lab-event-field" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpenPicker(open ? null : id)}>
          <Icon size={18} />
          <span><small>{label}</small><strong className={!selected ? "placeholder" : ""}>{selected || placeholder}</strong></span>
          <ChevronDown size={16} className={open ? "open" : ""} />
        </button>
      )}
      {open ? (
        <div className="lab-event-menu" role="listbox" aria-label={label}>
          {filteredOptions.map((option) => (
            <button key={option} type="button" role="option" aria-selected={selected === option} onClick={() => { setSelected(option); onValueChange?.(option); setOpenPicker(null); }}>
              <span>{option}</span>{selected === option ? <Check size={15} /> : null}
            </button>
          ))}
          {filteredOptions.length === 0 ? <p>Usar “{selected}”</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function EventDatePicker({ openPicker, setOpenPicker }: { openPicker: EventPickerId | null; setOpenPicker: (id: EventPickerId | null) => void }) {
  const [day, setDay] = useState<number | null>(null);
  const days = Array.from({ length: 30 }, (_, index) => index + 1);
  const open = openPicker === "date";

  return (
    <div className="lab-event-picker">
      <button type="button" className="lab-event-field" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpenPicker(open ? null : "date")}>
        <CalendarClock size={18} />
        <span><small>Data</small><strong className={day ? "" : "placeholder"}>{day ? `${String(day).padStart(2, "0")} de setembro de 2026` : "Selecionar data"}</strong></span>
        <ChevronDown size={16} className={open ? "open" : ""} />
      </button>
      {open ? (
        <div className="lab-event-calendar" role="dialog" aria-label="Escolher data">
          <header><button type="button" aria-label="Mês anterior"><ChevronLeft size={16} /></button><strong>Setembro de 2026</strong><button type="button" aria-label="Próximo mês"><ChevronRight size={16} /></button></header>
          <div className="lab-calendar-week"><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span><span>D</span></div>
          <div className="lab-calendar-days"><i />{days.map((date) => <button key={date} type="button" className={day === date ? "active" : ""} onClick={() => { setDay(date); setOpenPicker(null); }}>{date}</button>)}</div>
        </div>
      ) : null}
    </div>
  );
}

function EventTimePicker({ openPicker, setOpenPicker }: { openPicker: EventPickerId | null; setOpenPicker: (id: EventPickerId | null) => void }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [currentTime, setCurrentTime] = useState("12:00");
  const menuRef = useRef<HTMLDivElement>(null);
  const times = Array.from({ length: 96 }, (_, index) => {
    const hour = Math.floor(index / 4);
    const minute = (index % 4) * 15;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  });
  const activeId = openPicker === "timeStart" || openPicker === "timeEnd" ? openPicker : null;
  const activeValue = activeId === "timeStart" ? start : end;

  useEffect(() => {
    const now = new Date();
    const roundedMinute = Math.floor(now.getMinutes() / 15) * 15;
    setCurrentTime(`${String(now.getHours()).padStart(2, "0")}:${String(roundedMinute).padStart(2, "0")}`);
  }, []);

  useEffect(() => {
    if (!activeId || !menuRef.current) return;
    const currentIndex = Math.max(0, times.indexOf(currentTime));
    menuRef.current.scrollTop = Math.max(0, currentIndex * 36 - 88);
  }, [activeId, currentTime]);

  return (
    <div className="lab-event-control lab-event-time-picker">
      <Clock3 size={18} />
      <span><small>Horário</small><span>
        <button type="button" className={start ? "" : "placeholder"} onClick={() => setOpenPicker(openPicker === "timeStart" ? null : "timeStart")}>{start || "Início"}</button>
        <em>–</em>
        <button type="button" className={end ? "" : "placeholder"} onClick={() => setOpenPicker(openPicker === "timeEnd" ? null : "timeEnd")}>{end || "Fim"}</button>
      </span></span>
      {activeId ? <div ref={menuRef} className="lab-event-menu lab-event-time-menu" role="listbox" aria-label={activeId === "timeStart" ? "Hora inicial" : "Hora final"}>{times.map((time) => <button key={time} type="button" role="option" aria-selected={activeValue === time} className={time === currentTime ? "current" : ""} onClick={() => { if (activeId === "timeStart") setStart(time); else setEnd(time); setOpenPicker(null); }}><span>{time}</span>{activeValue === time ? <Check size={15} /> : time === currentTime ? <small>Agora</small> : null}</button>)}</div> : null}
    </div>
  );
}

type EventDraft = { status: TimelineStatus; title: string; priority: "Alta" | "Média" | "Leve"; reminder: string; repeat: string; service: string; client: string; coverageKind: "Particular" | "Plano"; insurer: string; category: string; authorization: string };

function EventCardPreview({ heading = "Adicionar à agenda", initialStatus = "pending", initialTitle = "", initialPriority = "Média", initialReminder = "15 minutos antes", initialRepeat = "Não se repete", initialService = "", initialClient = "", initialCoverageKind = "Particular", initialInsurer = "", initialCategory = "", initialAuthorization = "", onClose, onCancel, onSave, onDelete }: { heading?: string; initialStatus?: TimelineStatus; initialTitle?: string; initialPriority?: "Alta" | "Média" | "Leve"; initialReminder?: string; initialRepeat?: string; initialService?: string; initialClient?: string; initialCoverageKind?: "Particular" | "Plano"; initialInsurer?: string; initialCategory?: string; initialAuthorization?: string; onClose?: () => void; onCancel?: () => void; onSave?: (draft: EventDraft) => void; onDelete?: () => void }) {
  const [eventStatus,setEventStatus]=useState<TimelineStatus>(initialStatus);
  const [eventType, setEventType] = useState<"reuniao" | "consulta" | "compromisso">("reuniao");
  const [tagColor, setTagColor] = useState<"blue" | "peach" | "green" | "violet">("blue");
  const [showNote, setShowNote] = useState(false);
  const [openPicker, setOpenPicker] = useState<EventPickerId | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [priority, setPriority] = useState<"Alta" | "Média" | "Leve">(initialPriority);
  const [reminder, setReminder] = useState(initialReminder);
  const [repeat, setRepeat] = useState(initialRepeat);
  const [service, setService] = useState(initialService);
  const [client, setClient] = useState(initialClient);
  const [coverageKind, setCoverageKind] = useState<"Particular" | "Plano">(initialCoverageKind);
  const [insurer, setInsurer] = useState(initialInsurer);
  const [category, setCategory] = useState(initialCategory);
  const [authorization, setAuthorization] = useState(initialAuthorization);
  const [clientOptions, setClientOptions] = useState<string[]>(["Ana Carolina", "Bruno Lima", "Camila Souza"]);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const rows = JSON.parse(appStorage.getItem("gest-clients") ?? "[]");
      if (Array.isArray(rows)) setClientOptions([...new Set([...rows.map((row) => row?.name).filter((name): name is string => typeof name === "string"), "Ana Carolina", "Bruno Lima", "Camila Souza"])]);
    } catch { /* Mantém as sugestões demonstrativas. */ }
  }, []);

  useEffect(() => {
    const closeOpenPicker = (event: PointerEvent) => {
      const target = event.target as Element;
      if (!target.closest(".lab-event-picker, .lab-event-time-picker")) setOpenPicker(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpenPicker(null); };
    document.addEventListener("pointerdown", closeOpenPicker, true);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOpenPicker, true);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <article className="lab-event-card" ref={cardRef}>
      <header>
        <h2>{heading}</h2>
        <button type="button" aria-label="Fechar" onClick={onClose}><X size={18} /></button>
      </header>

      <label className="lab-event-title">
        <span>Título</span>
        <input type="text" placeholder="Adicionar título" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

      <div className="lab-event-types" role="group" aria-label="Tipo do evento">
        {([[
          "reuniao", "Reunião",
        ], [
          "consulta", "Consulta",
        ], [
          "compromisso", "Compromisso",
        ]] as const).map(([id, label]) => (
          <button key={id} type="button" className={eventType === id ? "active" : ""} onClick={() => setEventType(id)}>{label}</button>
        ))}
      </div>

      <div className="lab-event-grid">
        <EventDatePicker openPicker={openPicker} setOpenPicker={setOpenPicker} />
        <EventTimePicker openPicker={openPicker} setOpenPicker={setOpenPicker} />
        <EventSelect editable id="client" icon={UserRound} label="Cliente" initial={client} placeholder="Digitar cliente" options={clientOptions} openPicker={openPicker} setOpenPicker={setOpenPicker} onValueChange={setClient} />
        <EventSelect editable id="owner" icon={UserRoundCheck} label="Responsável" placeholder="Digitar responsável" options={["Marina Costa", "Lucas Ferreira", "Paulo Lima"]} openPicker={openPicker} setOpenPicker={setOpenPicker} />
        <EventSelect id="priority" icon={Flag} label="Prioridade" initial={priority} placeholder="Selecionar prioridade" options={["Alta", "Média", "Leve"]} openPicker={openPicker} setOpenPicker={setOpenPicker} onValueChange={(value) => setPriority(value as "Alta" | "Média" | "Leve")} />
        <EventSelect id="reminder" icon={BellRing} label="Lembrete" initial={reminder} placeholder="Selecionar lembrete" options={["15 minutos antes", "30 minutos antes", "1 hora antes", "1 dia antes"]} openPicker={openPicker} setOpenPicker={setOpenPicker} onValueChange={setReminder} />
        <EventSelect editable wide id="service" icon={Sparkles} label="Serviço" initial={service} placeholder="Digitar ou selecionar serviço" options={["Clareamento dental", "Consulta de avaliação", "Limpeza", "Manutenção de aparelho"]} openPicker={openPicker} setOpenPicker={setOpenPicker} onValueChange={setService} />
        <EventSelect editable wide id="location" icon={MapPin} label="Local" placeholder="Digitar local" options={["Clínica · Sala 2", "Sala de reunião", "Atendimento externo", "Online"]} openPicker={openPicker} setOpenPicker={setOpenPicker} />
<EventSelect id="status" icon={Check} label="Status" placeholder="A confirmar" initial={eventStatus==="confirmed"?"Confirmado":eventStatus==="canceled"?"Cancelado":"A confirmar"} options={["A confirmar","Confirmado","Cancelado"]} openPicker={openPicker} setOpenPicker={setOpenPicker} onValueChange={v=>setEventStatus(v==="Confirmado"?"confirmed":v==="Cancelado"?"canceled":"pending")}/>
        <EventSelect id="coverage" icon={ShieldCheck} label="Atendimento" initial={coverageKind} placeholder="Particular ou plano" options={["Particular", "Plano"]} openPicker={openPicker} setOpenPicker={setOpenPicker} onValueChange={(value) => setCoverageKind(value as "Particular" | "Plano")} />
        {coverageKind === "Plano" ? <><EventSelect editable id="insurer" icon={ShieldCheck} label="Plano / convênio" initial={insurer} placeholder="Selecionar plano" options={["Unimed", "Bradesco Saúde", "Amil", "SulAmérica", "Outro"]} openPicker={openPicker} setOpenPicker={setOpenPicker} onValueChange={setInsurer} /><label className="lab-event-title">Categoria<input value={category} onChange={(event) => setCategory(event.target.value)} /></label><label className="lab-event-title">Autorização<input value={authorization} onChange={(event) => setAuthorization(event.target.value)} /></label></> : null}
      </div>

      <div className="lab-event-options">
        <div className="lab-event-colors">
          <span><Tag size={16} /> Etiqueta</span>
          <div role="group" aria-label="Cor da etiqueta">
            {(["blue", "peach", "green", "violet"] as const).map((color) => (
              <button key={color} type="button" className={`${color} ${tagColor === color ? "active" : ""}`} onClick={() => setTagColor(color)} aria-label={`Etiqueta ${color}`} />
            ))}
          </div>
        </div>
        <EventSelect id="repeat" icon={Repeat2} label="Repetir" initial={repeat} placeholder="Selecionar repetição" options={["Não se repete", "Diariamente", "Semanalmente", "Mensalmente"]} openPicker={openPicker} setOpenPicker={setOpenPicker} onValueChange={setRepeat} />
      </div>

      <div className="lab-event-secondary-actions">
        <button type="button" className="lab-event-video"><Video size={17} /> Adicionar videoconferência</button>
        <button type="button" className={showNote ? "active" : ""} onClick={() => setShowNote((current) => !current)} aria-label="Adicionar observação" title="Adicionar observação"><MessageSquareText size={18} /></button>
      </div>
      {showNote ? <textarea className="lab-event-note" autoFocus placeholder="Adicionar observação..." rows={3} /> : null}

      <footer>
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="button" className="primary" onClick={() => onSave?.({ status:eventStatus, title, priority, reminder, repeat, service, client, coverageKind, insurer, category, authorization })}>Salvar evento</button>
        {onDelete ? <button type="button" className="danger" onClick={onDelete}>Excluir atividade</button> : null}
      </footer>
    </article>
  );
}

function UserMenuPreview() {
  const [open, setOpen] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="lab-user-menu" ref={menuRef}>
      <button type="button" className="lab-user-trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <span className="lab-user-avatar">MC<i /></span>
        <span><strong>Marina Costa</strong><small>marina@bellagestao.com.br</small></span>
        <ChevronDown size={17} className={open ? "open" : ""} />
      </button>

      {open ? (
        <div className="lab-user-dropdown" role="menu" aria-label="Menu de Marina Costa">
          <i className="lab-user-caret" aria-hidden />
          <button type="button" role="menuitem"><UserRound size={18} /><span>Meu perfil</span></button>
          <button type="button" role="menuitem"><Settings size={18} /><span>Configurações da conta</span></button>
          <button type="button" role="menuitem"><Mail size={18} /><span>Mensagens</span><kbd>⌘ M</kbd></button>
          <hr />
          <button type="button" role="menuitem" className="danger"><LogOut size={18} /><span>Sair</span></button>
        </div>
      ) : null}
    </div>
  );
}

type TimelineFilter = "all" | "event" | "task" | "project";
type TimelineStatus = "confirmed" | "canceled" | "postponed" | "pending";
type TimelineItem = {
  id: number;
  time: string;
  title: string;
  detail: string;
  service: string;
  type: Exclude<TimelineFilter, "all">;
  state: "done" | "now" | "next";
  status: TimelineStatus;
  patientName?: string;
};

const timelineItems: TimelineItem[] = [
  { id: 1, time: "09:00", title: "Reunião comercial", detail: "Sala de reunião · Ana Martins", patientName: "Ana Martins", service: "Clareamento dental", type: "event", state: "done", status: "confirmed" },
  { id: 2, time: "11:30", title: "Retorno para Bella Modas", detail: "Ligação com Lucas Ferreira", service: "Consulta de avaliação", type: "task", state: "now", status: "postponed" },
  { id: 3, time: "14:00", title: "Revisar cronograma do Projeto Aurora", detail: "Etapa de planejamento", service: "Planejamento estratégico", type: "project", state: "next", status: "confirmed" },
  { id: 4, time: "16:30", title: "Fechamento do caixa", detail: "Conferir movimentações do dia", service: "Rotina administrativa", type: "task", state: "next", status: "canceled" },
];

const timelineItemsByDay: Record<number, TimelineItem[]> = {
  10: [
    { id: 101, time: "09:30", title: "Revisar orçamento", detail: "Financeiro · Marina Costa", service: "Análise financeira", type: "task", state: "next", status: "confirmed" },
    { id: 102, time: "15:00", title: "Apresentação para novo cliente", detail: "Online · Studio Norte", service: "Apresentação comercial", type: "event", state: "next", status: "postponed" },
  ],
  11: [
    { id: 111, time: "10:00", title: "Consulta de avaliação", detail: "Clínica · Bruno Lima", patientName: "Bruno Lima", service: "Avaliação inicial", type: "event", state: "next", status: "confirmed" },
    { id: 112, time: "14:30", title: "Atualizar proposta", detail: "Comercial · Bella Modas", service: "Proposta comercial", type: "task", state: "next", status: "canceled" },
  ],
  12: [
    { id: 121, time: "09:00", title: "Planejamento da semana", detail: "Equipe de gestão", service: "Planejamento estratégico", type: "project", state: "next", status: "confirmed" },
    { id: 122, time: "11:30", title: "Retorno de atendimento", detail: "Ligação · Camila Souza", service: "Consulta de retorno", type: "task", state: "next", status: "postponed" },
  ],
  13: timelineItems,
  14: [
    { id: 141, time: "08:30", title: "Alinhamento da equipe", detail: "Sala de reunião · Equipe comercial", service: "Reunião interna", type: "event", state: "next", status: "confirmed" },
    { id: 142, time: "10:00", title: "Confirmar agenda de amanhã", detail: "7 clientes aguardando retorno", service: "Confirmação de consultas", type: "task", state: "next", status: "postponed" },
    { id: 143, time: "15:00", title: "Revisar proposta da Clínica Vida", detail: "Projeto de expansão", service: "Planejamento comercial", type: "project", state: "next", status: "confirmed" },
  ],
  15: [
    { id: 151, time: "09:00", title: "Clareamento dental", detail: "Clínica · Ana Carolina", patientName: "Ana Carolina", service: "Clareamento dental", type: "event", state: "next", status: "confirmed" },
    { id: 152, time: "13:30", title: "Enviar contratos", detail: "Administrativo · 3 documentos", service: "Documentação", type: "task", state: "next", status: "canceled" },
  ],
  16: [
    { id: 161, time: "11:00", title: "Reunião de resultados", detail: "Diretoria · Sala principal", service: "Análise de desempenho", type: "event", state: "next", status: "confirmed" },
    { id: 162, time: "16:00", title: "Atualizar cronograma", detail: "Projeto Aurora", service: "Gestão de projeto", type: "project", state: "next", status: "postponed" },
  ],
  17: [
    { id: 171, time: "10:30", title: "Consulta de retorno", detail: "Clínica · Lucas Martins", patientName: "Lucas Martins", service: "Consulta odontológica", type: "event", state: "next", status: "confirmed" },
  ],
};

export function TimelinePreview({ onOpenAgenda, onOpenClinical, dayOffset=0, appointmentsOnly=false }: { dayOffset?:number; appointmentsOnly?:boolean; onOpenAgenda?: () => void; onOpenClinical?: (event: { id: string; patientName: string; service: string; coverage: { kind: "Particular"; insurer: string; category: string; authorization: string } }) => void } = {}) {
  const [filter, setFilter] = useState<TimelineFilter>("all");
  const [selectedOffset, setSelectedOffset] = useState(dayOffset);
  const today = new Date();
  const selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + selectedOffset);
  const [agendaItems,setAgendaItems] = useState<AgendaEvent[]>(initialAgendaEvents);
  useEffect(()=>{try{const saved=JSON.parse(appStorage.getItem("gest-agenda-events")??"null");if(Array.isArray(saved))setAgendaItems(saved);}catch{}},[]);
  const monday = new Date(today.getFullYear(),today.getMonth(),today.getDate()-((today.getDay()+6)%7));
  const selectedItems: TimelineItem[] = agendaItems.filter(event=>{const date=new Date(monday);date.setDate(monday.getDate()+event.column-2);return date.toDateString()===selectedDate.toDateString();}).map(event=>({id:event.id,time:agendaTime(event.startMinutes),title:event.title,detail:event.person,patientName:event.client,service:event.service,type:"event",state:"next",status:event.status??"pending"}));
  const filteredItems = appointmentsOnly?selectedItems.filter(item=>item.type==="event"&&item.patientName):selectedItems;
  const visibleItems = filter === "all" ? filteredItems : filteredItems.filter((item) => item.type === filter);
  const days = Array.from({ length: 7 }, (_, index) => {
    const offset = index - 3;
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    return { offset, date, weekday: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").slice(0, 3), day: date.getDate(), isToday: offset === 0 };
  });
  const selectedWeekday = selectedDate.toLocaleDateString("pt-BR", { weekday: "long" });

  return (
    <article className="lab-timeline-card">
      <header>
        <h2>{selectedOffset === 0 ? "Hoje" : `${selectedWeekday}, ${selectedDate.getDate()}`}</h2>
        <button type="button" onClick={onOpenAgenda}>Abrir agenda <CalendarDays size={17} /></button>
      </header>

      <div className="lab-timeline-filters" role="tablist" aria-label="Filtrar agenda de hoje">
        {([[
          "all", "Todos",
        ], [
          "event", "Eventos",
        ], [
          "task", "Tarefas",
        ], [
          "project", "Projetos",
        ]] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={filter === id} className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>

      <div className="lab-timeline-days" aria-label="Selecionar dia da timeline">
        {days.map(({ offset, date, weekday, day, isToday }) => (
          <button
            key={date.toISOString()}
            type="button"
            className={`${isToday ? "is-today" : ""} ${selectedOffset === offset ? "active" : ""}`}
            aria-pressed={selectedOffset === offset}
            aria-label={`${weekday}, ${day} de ${date.toLocaleDateString("pt-BR", { month: "long" })}${isToday ? ", hoje" : ""}`}
            onClick={() => setSelectedOffset(offset)}
          >
            <span>{weekday}</span>
            <strong>{day}</strong>
          </button>
        ))}
      </div>

      <div className="lab-timeline-list">
        {visibleItems.map((item) => (
          <article key={item.id} className={`is-${item.state}${appointmentsOnly && item.status === "confirmed" ? " is-confirmed-appointment" : ""}`}>
            <time>{item.time}</time>
            <i>{item.state === "done" ? <Check size={14} /> : null}</i>
            <div>
              <strong className={item.patientName ? "timeline-patient-name" : undefined}>{item.patientName || item.title}</strong>
              <span>{item.patientName ? item.title : item.detail}</span>
              <small>{item.service}</small>
            </div>
            <div className="lab-timeline-actions">
              {item.status !== "canceled" && onOpenClinical ? <button type="button" className="lab-timeline-clinical" aria-label={`Abrir atendimento de ${item.patientName}`} onClick={() => {if(!item.patientName){window.dispatchEvent(new CustomEvent("gest-app-toast",{detail:"Vincule um paciente a este evento na Agenda para abrir o atendimento."}));onOpenAgenda?.();return;}onOpenClinical({ id: String(item.id), patientName: item.patientName, service: item.service, coverage: { kind: "Particular", insurer: "", category: "", authorization: "" } });}}><HeartPulse size={15} />Atendimento</button> : null}
              <em className={`status-${item.status}`}>{item.status === "confirmed" ? "Confirmado" : item.status === "canceled" ? "Cancelado" : item.status === "pending" ? "A confirmar" : "Postergado"}</em>
            </div>
          </article>
        ))}
        {visibleItems.length === 0 ? <p className="lab-timeline-empty">Nenhuma atividade nesta categoria.</p> : null}
      </div>
    </article>
  );
}

type AgendaEvent = {
  status?: TimelineStatus;
  id: number;
  column: number;
  startMinutes: number;
  durationSlots: number;
  daySpan: number;
  tone: "blue" | "peach" | "green" | "violet" | "rose";
  title: string;
  person: string;
  initials: string;
  client: string;
  responsible: string;
  priority: "Alta" | "Média" | "Leve";
  reminder: string;
  repeat: string;
  service: string;
  coverageKind?: "Particular" | "Plano";
  insurer?: string;
  category?: string;
  authorization?: string;
};

const initialAgendaEvents: AgendaEvent[] = [
  { id: 1, column: 2, startMinutes: 540, durationSlots: 6, daySpan: 1, tone: "blue", title: "Reunião comercial", person: "Ana Martins", initials: "AM", client: "Ana Martins", responsible: "Marina Costa", priority: "Alta", reminder: "30 minutos antes", repeat: "Não se repete", service: "Clareamento dental" },
  { id: 2, column: 3, startMinutes: 660, durationSlots: 6, daySpan: 1, tone: "peach", title: "Consulta de retorno", person: "Bruno Lima", initials: "BL", client: "Bruno Lima", responsible: "Paulo Lima", priority: "Média", reminder: "1 hora antes", repeat: "Mensalmente", service: "Consulta de avaliação" },
  { id: 3, column: 4, startMinutes: 600, durationSlots: 6, daySpan: 1, tone: "green", title: "Revisão do projeto", person: "Equipe Aurora", initials: "EA", client: "Studio Aurora", responsible: "Lucas Ferreira", priority: "Alta", reminder: "15 minutos antes", repeat: "Semanalmente", service: "Planejamento estratégico" },
  { id: 4, column: 5, startMinutes: 780, durationSlots: 6, daySpan: 1, tone: "violet", title: "Apresentar proposta", person: "Bella Modas", initials: "BM", client: "Bella Modas", responsible: "Marina Costa", priority: "Leve", reminder: "1 dia antes", repeat: "Não se repete", service: "Apresentação comercial" },
  { id: 5, column: 6, startMinutes: 720, durationSlots: 6, daySpan: 1, tone: "rose", title: "Atendimento inicial", person: "Camila Souza", initials: "CS", client: "Camila Souza", responsible: "Marina Costa", priority: "Média", reminder: "30 minutos antes", repeat: "Não se repete", service: "Limpeza" },
];

const agendaMonthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const agendaDayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function agendaTime(minutes: number) {
  const safeMinutes = Math.max(0, Math.min(1440, minutes));
  return `${String(Math.floor(safeMinutes / 60)).padStart(2, "0")}:${String(safeMinutes % 60).padStart(2, "0")}`;
}

export function AgendaPreview({ onOpenClinical }: { onOpenClinical?: (event: { id: string; patientName: string; service: string; coverage: { kind: "Particular" | "Plano"; insurer: string; category: string; authorization: string } }) => void } = {}) {
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [slotHeight, setSlotHeight] = useState(24);
  const [today, setToday] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [miniMonthOffset, setMiniMonthOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState<AgendaEvent[]>(initialAgendaEvents);
  const [eventsLoaded,setEventsLoaded]=useState(false);
  useEffect(()=>{try{const saved=JSON.parse(appStorage.getItem("gest-agenda-events")??"null");if(Array.isArray(saved))setEvents(saved);}catch{}setEventsLoaded(true);},[]);
  useEffect(()=>{if(eventsLoaded)appStorage.setItem("gest-agenda-events",JSON.stringify(events));},[events,eventsLoaded]);
  const [completedEvents, setCompletedEvents] = useState<Set<number>>(() => new Set());
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [completedPriorities, setCompletedPriorities] = useState<Set<number>>(() => new Set());
  const [otherCalendarsOpen, setOtherCalendarsOpen] = useState(false);
  const [currentMinutes, setCurrentMinutes] = useState(12 * 60);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewOutcome, setReviewOutcome] = useState<"pending" | "completed" | "missed">("pending");
  const [reviewMissReason, setReviewMissReason] = useState("");
  const [reviewServices, setReviewServices] = useState<string[]>(["Clareamento dental"]);
  const [reviewCustomService, setReviewCustomService] = useState("");
  const [reviewAddingService, setReviewAddingService] = useState(false);
  const [reviewProducts, setReviewProducts] = useState("");
  const [reviewTotal, setReviewTotal] = useState("850");
  const [reviewInstallments, setReviewInstallments] = useState("1x");
  const [reviewCustomInstallments, setReviewCustomInstallments] = useState("");
  const [reviewPaymentMethod, setReviewPaymentMethod] = useState("Crédito");
  const [reviewCardBrand, setReviewCardBrand] = useState("Visa");
  const [reviewReturnAmount, setReviewReturnAmount] = useState("30");
  const [reviewReturnUnit, setReviewReturnUnit] = useState("dias");
  const boardRef = useRef<HTMLDivElement>(null);
  const miniDate = new Date(today.getFullYear(), today.getMonth() + miniMonthOffset, 1);
  const daysInMiniMonth = new Date(miniDate.getFullYear(), miniDate.getMonth() + 1, 0).getDate();
  const miniLeadingDays = (miniDate.getDay() + 6) % 7;
  const miniDays = Array.from({ length: daysInMiniMonth }, (_, index) => index + 1);
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
  const agendaWeek = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return { day: agendaDayNames[date.getDay()], date: date.getDate(), month: date.getMonth(), year: date.getFullYear(), today: date.toDateString() === today.toDateString() };
  });
  const weekLabel = `${agendaMonthNames[agendaWeek[2].month]} ${agendaWeek[2].year}`;
  const currentTop = (currentMinutes / 15) * slotHeight;
  const currentLabel = agendaTime(currentMinutes);
  const visibleDays = view === "day" ? [agendaWeek.find((day) => day.today) ?? agendaWeek[0]] : agendaWeek;
  const visibleEvents = view === "day" ? events.filter((event) => event.column === agendaWeek.findIndex((day) => day.date === visibleDays[0].date && day.month === visibleDays[0].month) + 2) : events;
  const priorityEvents = events.filter((event) => event.priority === "Alta" && !completedPriorities.has(event.id));
  const monthEventCounts = events.reduce<Record<number, number>>((counts, event) => {
    const day = 5 + event.column;
    counts[day] = (counts[day] ?? 0) + 1;
    return counts;
  }, {});

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setToday((previous) => previous.toDateString() === now.toDateString() ? previous : now);
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateCurrentTime();
    const timer = globalThis.setInterval(updateCurrentTime, 60000);
    return () => globalThis.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(appStorage.getItem("gest-agenda-event-review") || "null") as { outcome?: "completed" | "missed" } | null;
      if (saved?.outcome === "completed" || saved?.outcome === "missed") {
        setReviewOutcome(saved.outcome);
        if (saved.outcome === "completed") setCompletedEvents((current) => new Set(current).add(1));
      } else {
        setReviewOpen(true);
      }
    } catch {
      setReviewOpen(true);
    }
  }, []);

  useEffect(() => {
    if (view === "month" || weekOffset !== 0 || !boardRef.current) return;
    boardRef.current.scrollTop = Math.max(0, currentTop - 260);
  }, [currentTop, view, weekOffset]);

  const beginResize = (eventId: number, originalSlots: number, startY: number) => {
    const resize = (event: PointerEvent) => {
      const nextSlots = Math.max(1, Math.min(32, originalSlots + Math.round((event.clientY - startY) / slotHeight)));
      setEvents((current) => current.map((item) => item.id === eventId ? { ...item, durationSlots: nextSlots } : item));
    };
    const finish = () => {
      document.removeEventListener("pointermove", resize);
      document.removeEventListener("pointerup", finish);
    };
    document.addEventListener("pointermove", resize);
    document.addEventListener("pointerup", finish);
  };

  const beginDayResize = (eventId: number, originalDaySpan: number, startX: number, gridWidth: number, startColumn: number) => {
    const columnWidth = (gridWidth - 58) / 5;
    const resize = (event: PointerEvent) => {
      const maxSpan = Math.max(1, 7 - startColumn);
      const nextSpan = Math.max(1, Math.min(maxSpan, originalDaySpan + Math.round((event.clientX - startX) / columnWidth)));
      setEvents((current) => current.map((item) => item.id === eventId ? { ...item, daySpan: nextSpan } : item));
    };
    const finish = () => {
      document.removeEventListener("pointermove", resize);
      document.removeEventListener("pointerup", finish);
    };
    document.addEventListener("pointermove", resize);
    document.addEventListener("pointerup", finish);
  };

  const closeEventModal = () => {
    setEditingEvent(null);
    setCreatingEvent(false);
  };

  const saveEvent = (draft: EventDraft) => {
    if (editingEvent) {
      setEvents((current) => current.map((item) => item.id === editingEvent.id ? { ...item, status:draft.status, title: draft.title.trim() || item.title, priority: draft.priority, reminder: draft.reminder, repeat: draft.repeat, service: draft.service.trim() || item.service, client: draft.client.trim() || item.client, person: draft.client.trim() || item.person, coverageKind: draft.coverageKind, insurer: draft.insurer, category: draft.category, authorization: draft.authorization } : item));
      announceAppAction("Atividade atualizada com sucesso.");
    } else if (creatingEvent && draft.title.trim()) {
      const roundedStart = Math.floor(currentMinutes / 15) * 15;
      setEvents((current) => [...current, { status:draft.status, id: Date.now(), column: 6, startMinutes: roundedStart, durationSlots: 4, daySpan: 1, tone: "blue", title: draft.title.trim(), person: draft.client.trim() || "Novo cliente", initials: (draft.client.trim() || "NC").split(" ").map((part) => part[0]).join("").slice(0,2), client: draft.client.trim() || "Novo cliente", responsible: "Marina Costa", priority: draft.priority, reminder: draft.reminder, repeat: draft.repeat, service: draft.service.trim() || "Serviço não informado", coverageKind: draft.coverageKind, insurer: draft.insurer, category: draft.category, authorization: draft.authorization }]);
      announceAppAction("Atividade salva com sucesso.");
    }
    closeEventModal();
  };

  return (
    <section className="lab-agenda-shell">
      <aside className="lab-agenda-sidebar">
        <div className="lab-mini-calendar">
          <header>
            <strong>{agendaMonthNames[miniDate.getMonth()]}</strong>
            <span>
              <button type="button" aria-label="Mês anterior" onClick={() => { setMiniMonthOffset((current) => current - 1); setSelectedDay(1); }}><ChevronLeft size={15} /></button>
              <button type="button" aria-label="Próximo mês" onClick={() => { setMiniMonthOffset((current) => current + 1); setSelectedDay(1); }}><ChevronRight size={15} /></button>
            </span>
          </header>
          <div className="lab-mini-week"><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span><span>D</span></div>
          <div className="lab-mini-days">
            {Array.from({ length: miniLeadingDays }, (_, index) => <i key={`blank-${index}`} />)}
            {miniDays.map((day) => <button key={day} type="button" className={selectedDay === day ? "active" : ""} onClick={() => setSelectedDay(day)}>{day}</button>)}
          </div>
        </div>

        <div className="lab-priority-list">
          {priorityEvents.map((event) => (
            <article className="lab-priority-event" key={event.id}>
              <header><span>PRIORIDADE ALTA</span><i /></header>
              <strong>{event.title}</strong>
              <p>{agendaTime(event.startMinutes)} · {event.client}</p>
              <small className="lab-priority-service">{event.service}</small>
              <footer><span className="lab-priority-avatar">{event.initials}</span><button type="button" onClick={() => { setCompletedPriorities((current) => new Set(current).add(event.id)); announceAppAction("Atividade finalizada com sucesso."); }}><Check size={15} /> Concluir</button></footer>
            </article>
          ))}
          {priorityEvents.length === 0 ? <div className="lab-priority-empty"><Check size={16} /> Prioridades concluídas</div> : null}
        </div>

        <div className="lab-agenda-filter-card">
          <strong>Exibir na agenda</strong>
          <label><input type="checkbox" defaultChecked /><i className="event" /> Eventos</label>
          <label><input type="checkbox" defaultChecked /><i className="task" /> Tarefas</label>
          <label><input type="checkbox" defaultChecked /><i className="project" /> Projetos</label>
        </div>

        <div className="lab-other-calendar-wrap">
          <button type="button" className="lab-other-calendars" aria-expanded={otherCalendarsOpen} onClick={() => setOtherCalendarsOpen((current) => !current)}><CalendarDays size={17} /><span>Outros calendários</span><ChevronDown size={16} className={otherCalendarsOpen ? "open" : ""} /></button>
          {otherCalendarsOpen ? <div className="lab-other-calendar-list"><label><input type="checkbox" defaultChecked /> Pessoal</label><label><input type="checkbox" /> Equipe comercial</label></div> : null}
        </div>
      </aside>

      <div className="lab-agenda-main">
        <header className="lab-agenda-toolbar">
          <div className="lab-agenda-month">
            <button type="button" aria-label="Semana anterior" onClick={() => setWeekOffset((current) => current - 1)}><ChevronLeft size={16} /></button>
            <strong>{weekLabel}</strong>
            <button type="button" aria-label="Próxima semana" onClick={() => setWeekOffset((current) => current + 1)}><ChevronRight size={16} /></button>
          </div>
          <div className="lab-agenda-views" role="group" aria-label="Visualização da agenda">
            {([["day", "Dia"], ["week", "Semana"], ["month", "Mês"]] as const).map(([id, label]) => (
              <button key={id} type="button" className={view === id ? "active" : ""} onClick={() => setView(id)}>{label}</button>
            ))}
          </div>
          <div className="lab-agenda-toolbar-actions"><div className="lab-agenda-zoom" role="group" aria-label="Altura dos horários da agenda"><button type="button" aria-label="Diminuir altura da agenda" disabled={slotHeight <= 16} onClick={() => setSlotHeight((value) => Math.max(16, value - 4))}><ZoomOut size={17} /></button><button type="button" aria-label="Aumentar altura da agenda" disabled={slotHeight >= 40} onClick={() => setSlotHeight((value) => Math.min(40, value + 4))}><ZoomIn size={17} /></button></div><button type="button" className="lab-create-activity" onClick={() => setCreatingEvent(true)}><Plus size={17} /> Adicionar</button></div>
        </header>

        <div className={`lab-agenda-board view-${view}`} ref={boardRef}>
          {view === "month" ? (
            <div className="lab-agenda-month-grid">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => <strong key={day}>{day}</strong>)}
              {Array.from({ length: miniLeadingDays }, (_, index) => <i key={`month-blank-${index}`} />)}
              {miniDays.map((day) => {
                const eventCount = monthEventCounts[day] ?? 0;
                return (
                  <button key={day} type="button" className={day === selectedDay ? "active" : ""} onClick={() => setSelectedDay(day)} aria-label={`${day}, ${eventCount} ${eventCount === 1 ? "evento" : "eventos"}`}>
                    <span>{day}</span>
                    {eventCount > 0 ? <div className="lab-month-event-count" aria-hidden><i /><span>{eventCount} {eventCount === 1 ? "atividade" : "atividades"}</span></div> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <div className={`lab-agenda-days-head ${view === "day" ? "is-day" : ""}`}>
                <span>GMT−4</span>
                {visibleDays.map((item) => (
                  <div key={item.date} className={item.today ? "today" : ""}><small>{item.day}</small><strong>{item.date}</strong></div>
                ))}
              </div>
              <div className={`lab-agenda-time-grid ${view === "day" ? "is-day" : ""}`} style={{ "--agenda-slot-height": `${slotHeight}px` } as React.CSSProperties}>
                {Array.from({ length: 24 }, (_, index) => <time key={index} style={{ gridRow: index * 4 + 1 }}>{String(index).padStart(2, "0")}:00</time>)}
                {visibleDays.map((item, index) => <i key={`column-line-${item.year}-${item.month}-${item.date}`} className="lab-agenda-column-line" style={{ gridColumn: index + 2, gridRow: "1 / -1" }} />)}
                {weekOffset === 0 && (view === "day" || agendaWeek.some((day) => day.today)) ? <div className="lab-agenda-today-column" style={{ gridColumn: view === "day" ? 2 : agendaWeek.findIndex((day) => day.today) + 2, gridRow: "1 / -1" }} /> : null}
                {weekOffset === 0 ? <div className="lab-agenda-now-line" style={{ top: currentTop }}><span>{currentLabel}</span><i /></div> : null}
                {visibleEvents.map((event) => {
                  const eventColumn = view === "day" ? 2 : event.column;
                  const eventTime = `${agendaTime(event.startMinutes)} – ${agendaTime(event.startMinutes + event.durationSlots * 15)}`;
                  return (
                    <article key={event.id} className={`tone-${event.tone} ${event.durationSlots < 5 ? "is-compact" : ""} ${completedEvents.has(event.id) ? "is-complete" : ""}`} style={{ gridColumn: `${eventColumn} / span ${view === "day" ? 1 : event.daySpan}`, gridRow: `${Math.floor(event.startMinutes / 15) + 1} / span ${event.durationSlots}` }} onDoubleClick={() => setEditingEvent(event)}>
                      <button
                        type="button"
                        className="lab-agenda-event-check"
                        aria-label={completedEvents.has(event.id) ? `Marcar ${event.title} como pendente` : `Marcar ${event.title} como concluído`}
                        aria-pressed={completedEvents.has(event.id)}
                        onClick={(pointerEvent) => {
                          pointerEvent.stopPropagation();
                          setCompletedEvents((current) => {
                            const next = new Set(current);
                            if (next.has(event.id)) next.delete(event.id);
                            else next.add(event.id);
                            return next;
                          });
                        }}
                        onDoubleClick={(pointerEvent) => pointerEvent.stopPropagation()}
                      >
                        {completedEvents.has(event.id) ? <Check size={9} strokeWidth={2.6} /> : null}
                      </button>
                      <footer className="agenda-patient-heading"><i>{event.initials}</i><strong>{event.client || event.person}</strong></footer>
                      <span className="agenda-service-label">{event.service}</span>
                      <span><Clock3 size={12} /> {eventTime}</span>
                      <small className="agenda-event-kind">{event.title}</small>
                      <em className={`agenda-status-badge status-${event.status??"postponed"}`}>{event.status==="confirmed"?"Confirmado":event.status==="canceled"?"Cancelado":"A confirmar"}</em>
                      {onOpenClinical ? <button type="button" className="agenda-clinical-open" aria-label={`Abrir atendimento de ${event.client}`} title="Abrir atendimento" onClick={(pointerEvent) => { pointerEvent.stopPropagation(); onOpenClinical({ id: String(event.id), patientName: event.client, service: event.service, coverage: { kind: event.coverageKind ?? "Particular", insurer: event.insurer ?? "", category: event.category ?? "", authorization: event.authorization ?? "" } }); }}><HeartPulse size={16} /></button> : null}
                      <div className="lab-agenda-event-tooltip">
                        <strong>{event.title}</strong>
                        <span>Horário: {eventTime}</span>
                        <span>Cliente: {event.client}</span>
                        <span>Serviço: {event.service}</span>
                        <span>Responsável: {event.responsible}</span>
                        <span>Prioridade: {event.priority}</span>
                        <span>Lembrete: {event.reminder}</span>
                        <span>Repetição: {event.repeat}</span>
                      </div>
                      <button type="button" className="lab-agenda-resize" aria-label={`Ajustar duração de ${event.title}`} onClick={(pointerEvent) => pointerEvent.stopPropagation()} onPointerDown={(pointerEvent) => { pointerEvent.preventDefault(); pointerEvent.stopPropagation(); beginResize(event.id, event.durationSlots, pointerEvent.clientY); }} />
                      {view === "week" ? <button type="button" className="lab-agenda-resize-day" aria-label={`Estender ${event.title} para outro dia`} onClick={(pointerEvent) => pointerEvent.stopPropagation()} onPointerDown={(pointerEvent) => { pointerEvent.preventDefault(); pointerEvent.stopPropagation(); const grid = pointerEvent.currentTarget.closest(".lab-agenda-time-grid"); if (grid) beginDayResize(event.id, event.daySpan, pointerEvent.clientX, grid.getBoundingClientRect().width, event.column); }} /> : null}
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      {reviewOpen ? (
        <div className="lab-agenda-modal" role="dialog" aria-modal="true" aria-label="Confirmar atividade realizada" onClick={() => setReviewOpen(false)}>
          <form className="agenda-confirm-card" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); if (reviewOutcome === "pending" || (reviewOutcome === "missed" && !reviewMissReason)) return; if (reviewOutcome === "completed") setCompletedEvents((current) => new Set(current).add(1)); try { appStorage.setItem("gest-agenda-event-review", JSON.stringify({ outcome: reviewOutcome, missedReason: reviewOutcome === "missed" ? reviewMissReason : null, services: reviewServices, products: reviewProducts, total: reviewTotal, installments: reviewInstallments === "+ Personalizar" ? `${reviewCustomInstallments || "1"}x` : reviewInstallments, paymentMethod: reviewPaymentMethod, cardBrand: reviewCardBrand, returnAmount: reviewReturnAmount, returnUnit: reviewReturnUnit, savedAt: new Date().toISOString() })); } catch { /* The visible agenda remains usable if browser storage is unavailable. */ } announceAppAction(reviewOutcome === "completed" ? "Resultado do evento salvo com sucesso." : "Motivo do evento não realizado salvo com sucesso."); setReviewOpen(false); }}>
            <header className="agenda-confirm-head"><div><h2>O evento aconteceu?</h2><p>Registre o resultado para atualizar a agenda e os próximos retornos.</p></div><button type="button" aria-label="Fechar" onClick={() => setReviewOpen(false)}><X size={18} /></button></header>
            <section className="agenda-confirm-summary"><span><CalendarClock size={18} /></span><div><strong>Reunião comercial</strong><small>Ana Martins · Hoje, 09:00 · Clareamento dental</small></div></section>
            <div className="agenda-confirm-choice" role="group" aria-label="Resultado da atividade"><button type="button" className={reviewOutcome === "completed" ? "active" : ""} onClick={() => setReviewOutcome("completed")}><Check size={17} />Sim, aconteceu</button><button type="button" className={reviewOutcome === "missed" ? "active missed" : ""} onClick={() => setReviewOutcome("missed")}><X size={17} />Não aconteceu</button></div>
            {reviewOutcome === "completed" ? <section className="agenda-confirm-body">
              <div className="agenda-confirm-services"><header><strong>Serviços prestados:</strong></header><div>{["Clareamento dental", "Consulta de avaliação", "Limpeza", "Consulta de retorno", ...reviewServices.filter((service) => !["Clareamento dental", "Consulta de avaliação", "Limpeza", "Consulta de retorno"].includes(service))].map((service) => <button type="button" key={service} className={reviewServices.includes(service) ? "active" : ""} onClick={() => setReviewServices((current) => current.includes(service) ? current.filter((item) => item !== service) : [...current, service])}>{reviewServices.includes(service) ? <Check size={14} /> : <Plus size={14} />}{service}</button>)}<button type="button" className="agenda-confirm-add-service" onClick={() => setReviewAddingService(true)}><Plus size={14} />Adicionar serviço</button></div>{reviewAddingService ? <div className="agenda-confirm-custom-service"><input autoFocus value={reviewCustomService} onChange={(event) => setReviewCustomService(event.target.value)} placeholder="Nome do serviço" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); const service = reviewCustomService.trim(); if (service) setReviewServices((current) => current.includes(service) ? current : [...current, service]); setReviewCustomService(""); setReviewAddingService(false); } }} /><button type="button" onClick={() => { const service = reviewCustomService.trim(); if (service) setReviewServices((current) => current.includes(service) ? current : [...current, service]); setReviewCustomService(""); setReviewAddingService(false); }}>Adicionar</button></div> : null}</div>
              <div className="agenda-confirm-grid"><label><span>Produto vendido <small>(opcional)</small></span><input value={reviewProducts} onChange={(event) => setReviewProducts(event.target.value)} placeholder="Informe o produto" /></label><label>Valor total (R$)<input type="number" min="0" value={reviewTotal} onChange={(event) => setReviewTotal(event.target.value)} /></label><label>Forma de pagamento<ClientSelect compact hideLabel label="Forma de pagamento" value={reviewPaymentMethod} onChange={setReviewPaymentMethod} options={["Crédito", "Débito", "Pix", "Dinheiro", "Boleto"]} /></label><label>Parcelamento<ClientSelect compact hideLabel label="Parcelamento" value={reviewInstallments === "+ Personalizar" && reviewCustomInstallments ? `${reviewCustomInstallments}x` : reviewInstallments} onChange={(value) => { setReviewInstallments(value); if (value !== "+ Personalizar") setReviewCustomInstallments(""); }} options={[...Array.from({ length: 12 }, (_, index) => `${index + 1}x`), "+ Personalizar"]} />{reviewInstallments === "+ Personalizar" ? <input className="agenda-confirm-custom-installments" type="number" min="1" autoFocus value={reviewCustomInstallments} onChange={(event) => setReviewCustomInstallments(event.target.value)} placeholder="Quantidade de parcelas" /> : null}</label>{reviewPaymentMethod === "Crédito" ? <label>Bandeira do cartão<ClientSelect compact hideLabel label="Bandeira do cartão" value={reviewCardBrand} onChange={setReviewCardBrand} options={["Visa", "Mastercard", "Elo", "Amex", "Hipercard"]} /></label> : null}<label>Próximo retorno<span className="agenda-confirm-return"><input type="number" min="1" value={reviewReturnAmount} onChange={(event) => setReviewReturnAmount(event.target.value)} /><ClientSelect compact hideLabel label="Unidade do retorno" value={reviewReturnUnit} onChange={setReviewReturnUnit} options={["dias", "meses"]} /></span></label></div>
              <p className="agenda-confirm-help"><Clock3 size={15} />O prazo de retorno aparecerá automaticamente na lista de próximos retornos do Atendimento.</p>
            </section> : null}
            {reviewOutcome === "missed" ? <section className="agenda-confirm-missed"><div className="agenda-confirm-missed-heading"><TriangleAlert size={18} /><div><strong>Por que não aconteceu?</strong><p>Selecione o motivo para registrar o resultado.</p></div></div><div className="agenda-confirm-reasons" role="group" aria-label="Motivo da atividade não realizada">{["Cliente faltou", "Cliente desmarcou", "Foi postergado", "Foi remarcado", "Outro motivo"].map((reason) => <button type="button" key={reason} className={reviewMissReason === reason ? "active" : ""} aria-pressed={reviewMissReason === reason} onClick={() => setReviewMissReason(reason)}>{reason}</button>)}</div></section> : null}
            <footer className="agenda-confirm-actions"><button type="button" onClick={() => setReviewOpen(false)}>Decidir depois</button><button type="submit" className="primary" disabled={reviewOutcome === "pending" || (reviewOutcome === "missed" && !reviewMissReason)}>Confirmar e atualizar</button></footer>
          </form>
        </div>
      ) : null}
      {editingEvent || creatingEvent ? (
        <div className="lab-agenda-modal" role="dialog" aria-modal="true" aria-label={editingEvent ? "Editar atividade" : "Adicionar à agenda"} onClick={closeEventModal}>
          <div onClick={(event) => event.stopPropagation()}><EventCardPreview heading={editingEvent ? "Editar atividade" : "Adicionar à agenda"} initialStatus={editingEvent?.status} initialTitle={editingEvent?.title ?? ""} initialPriority={editingEvent?.priority} initialReminder={editingEvent?.reminder} initialRepeat={editingEvent?.repeat} initialService={editingEvent?.service} initialClient={editingEvent?.client} initialCoverageKind={editingEvent?.coverageKind} initialInsurer={editingEvent?.insurer} initialCategory={editingEvent?.category} initialAuthorization={editingEvent?.authorization} onClose={closeEventModal} onCancel={closeEventModal} onSave={saveEvent} onDelete={editingEvent ? () => { setEvents((current) => current.filter((item) => item.id !== editingEvent.id)); announceAppAction("Atividade excluída com sucesso."); closeEventModal(); } : undefined} /></div>
        </div>
      ) : null}
    </section>
  );
}

function SearchFieldPreview() {
  const [query, setQuery] = useState("");

  return (
    <form className="lab-search-form" role="search" onSubmit={(event) => event.preventDefault()}>
      <Search size={19} aria-hidden />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar..." aria-label="Pesquisar" />
      <button type="button" className={query ? "visible" : ""} onClick={() => setQuery("")} aria-label="Limpar pesquisa"><X size={16} /></button>
    </form>
  );
}

export function DocumentCardPreview({
  title = "Contrato de clareamento",
  fileType = "PDF",
  updated = "Atualizado hoje",
  onEdit,
  onOpen,
}: {
  title?: string;
  fileType?: string;
  updated?: string;
  onEdit?: () => void;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lab-document-preview">
      <button type="button" className="lab-document-card" onClick={() => onOpen ? onOpen() : setOpen(true)} aria-label={`Abrir ${title}`}>
        <span><Folder size={48} fill="currentColor" /></span>
        <strong>{title}</strong>
        <small>{fileType} · {updated}</small>
      </button>
      {open ? (
        <div className="lab-document-modal" role="dialog" aria-modal="true" aria-label={title} onClick={() => setOpen(false)}>
          <article onClick={(event) => event.stopPropagation()}>
            <header><div><FileText size={19} /><span><strong>{title}</strong><small>Documento em {fileType}</small></span></div><button type="button" onClick={() => setOpen(false)} aria-label="Fechar documento"><X size={18} /></button></header>
            <div className="lab-document-sheet"><span>{title.toLocaleUpperCase("pt-BR")}</span><i /><i /><i /><i /><b>Assinatura do cliente</b></div>
            <footer><button type="button" onClick={() => { setOpen(false); onEdit?.(); }}><Pencil size={16} /> Editar</button><button type="button" className="primary"><Printer size={16} /> Imprimir</button></footer>
          </article>
        </div>
      ) : null}
    </div>
  );
}

export function AiThinkingPreview() {
  const [cycle, setCycle] = useState(0);
  const [thinking, setThinking] = useState(true);

  useEffect(() => {
    setThinking(true);
    const timer = globalThis.setTimeout(() => setThinking(false), 3200);
    return () => globalThis.clearTimeout(timer);
  }, [cycle]);

  return (
    <article className={`lab-ai-thinking ${thinking ? "is-thinking" : "is-ready"}`}>
      <div className="lab-ai-wave" aria-label={thinking ? "Gest IA analisando o negócio" : "Análise concluída"}>
        <svg viewBox="0 0 900 280" role="img" aria-hidden>
          <defs>
            <linearGradient id="lab-strand-violet" x1="0" x2="1"><stop offset="0" stopColor="#9b74d3" stopOpacity="0" /><stop offset=".28" stopColor="#b48de2" stopOpacity=".42" /><stop offset=".52" stopColor="#e3bff8" stopOpacity=".78" /><stop offset=".78" stopColor="#a985dc" stopOpacity=".34" /><stop offset="1" stopColor="#8d6dc2" stopOpacity="0" /></linearGradient>
            <linearGradient id="lab-strand-cyan" x1="0" x2="1"><stop offset="0" stopColor="#64c9db" stopOpacity="0" /><stop offset=".3" stopColor="#74d8e8" stopOpacity=".38" /><stop offset=".55" stopColor="#c9f7fb" stopOpacity=".76" /><stop offset=".8" stopColor="#74d5e6" stopOpacity=".3" /><stop offset="1" stopColor="#64c9db" stopOpacity="0" /></linearGradient>
            <linearGradient id="lab-strand-peach" x1="0" x2="1"><stop offset="0" stopColor="#e9a688" stopOpacity="0" /><stop offset=".32" stopColor="#edb092" stopOpacity=".35" /><stop offset=".53" stopColor="#ffe0cb" stopOpacity=".72" /><stop offset=".78" stopColor="#e7a58b" stopOpacity=".28" /><stop offset="1" stopColor="#e9a688" stopOpacity="0" /></linearGradient>
            <filter id="lab-ai-glow" filterUnits="userSpaceOnUse" x="-150" y="-200" width="1200" height="680"><feGaussianBlur stdDeviation="13" /></filter>
            <filter id="lab-ai-core" filterUnits="userSpaceOnUse" x="-150" y="-200" width="1200" height="680"><feGaussianBlur stdDeviation="3.5" /></filter>
            <radialGradient id="lab-ai-aura"><stop stopColor="#c596ff" stopOpacity=".44" /><stop offset=".42" stopColor="#b677ff" stopOpacity=".18" /><stop offset="1" stopColor="#b677ff" stopOpacity="0" /></radialGradient>
            <radialGradient id="lab-ai-center-light"><stop stopColor="#fff4ff" stopOpacity=".7" /><stop offset=".3" stopColor="#efbcff" stopOpacity=".28" /><stop offset="1" stopColor="#dcb0ff" stopOpacity="0" /></radialGradient>
          </defs>
          <ellipse className="lab-ai-aura" cx="450" cy="138" rx="300" ry="128" fill="url(#lab-ai-aura)" />
          {[
            { name: "one", gradient: "violet", shape: "M35 140 C220 140 300 43 450 58 C615 75 700 140 865 140 C670 148 290 148 35 140Z", alternate: "M35 140 C220 140 300 237 450 222 C615 205 700 140 865 140 C670 132 290 132 35 140Z" },
            { name: "two", gradient: "cyan", shape: "M35 140 C235 142 335 215 470 228 C600 232 700 140 865 140 C650 135 280 135 35 140Z", alternate: "M35 140 C235 138 335 65 470 52 C600 48 700 140 865 140 C650 145 280 145 35 140Z" },
            { name: "three", gradient: "peach", shape: "M35 140 C240 140 300 105 415 112 C575 126 735 140 865 140 C620 162 250 157 35 140Z", alternate: "M35 140 C240 140 300 155 415 164 C575 152 735 140 865 140 C620 131 250 129 35 140Z" },
          ].map(({ name, gradient, shape, alternate }) => (
            <g key={name} className={`lab-ai-ribbon ribbon-${name}`}>
              <path d={shape} fill={`url(#lab-strand-${gradient})`} filter="url(#lab-ai-glow)"><animate attributeName="d" values={`${shape};${alternate};${shape}`} dur="10s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".42 0 .58 1;.42 0 .58 1" repeatCount="indefinite" /></path>
              <path d={shape} fill={`url(#lab-strand-${gradient})`} filter="url(#lab-ai-core)" opacity=".72"><animate attributeName="d" values={`${shape};${alternate};${shape}`} dur="10s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".42 0 .58 1;.42 0 .58 1" repeatCount="indefinite" /></path>
            </g>
          ))}
          <ellipse cx="450" cy="140" rx="235" ry="32" fill="url(#lab-ai-center-light)" filter="url(#lab-ai-core)" />
        </svg>
        <div className="lab-ai-status"><span>{thinking ? "Analisando..." : "Análise concluída"}</span></div>
      </div>
      <div className="lab-ai-results" aria-hidden={thinking}>
        <header><span><Sparkles size={17} /> Gest IA</span><button type="button" onClick={() => setCycle((current) => current + 1)}><RotateCcw size={15} /> Analisar novamente</button></header>
        <div>
          <section><small>ATENÇÃO</small><strong>7 pacientes ainda não confirmaram</strong><p>Envie os lembretes antes das 14h.</p></section>
          <section><small>OPORTUNIDADE</small><strong>Campanha sazonal em 24 dias</strong><p>Comece hoje o planejamento da campanha.</p></section>
          <section><small>POSITIVO</small><strong>Estoque dentro do esperado</strong><p>Nenhuma reposição urgente para esta semana.</p></section>
        </div>
      </div>
    </article>
  );
}

export type CardTone = "blue" | "rose" | "amber" | "violet" | "teal" | "gray";

export function InsightActionCardPreview({ tone, classification, title, description, action, onAction }: { tone: CardTone; classification: string; title: string; description: string; action: string; onAction?: () => void }) {
  return (
    <article className={`lab-insight-action-card tone-${tone}`}>
      <div className="lab-insight-action-head">
        <span>{classification}</span>
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
      <button className="lab-insight-action-button" type="button" onClick={onAction}>{action}</button>
    </article>
  );
}

export function InformativeMetricCardPreview({ tone, icon: Icon, title, value, change }: { tone: CardTone; icon: LucideIcon; title: string; value: string; change: string }) {
  const trimmedChange = change.trim();
  const negative = trimmedChange.startsWith("-");
  const trend = /^[-+]?\d+(?:[.,]\d+)?%$/.test(trimmedChange);
  const percentage = negative || trimmedChange.startsWith("+") ? trimmedChange.slice(1) : trimmedChange;
  const infoText = trend
    ? `${title}: ${value}. ${negative ? "Redução" : "Crescimento"} de ${percentage} em relação aos 30 dias anteriores.`
    : `${title}: ${value}. Informação atual: ${trimmedChange}.`;

  return (
    <article className={`lab-informative-card tone-${tone}`}>
      <header>
        <span className="lab-informative-icon"><Icon size={20} strokeWidth={1.9} /></span>
        <InfoHint text={infoText} />
      </header>
      <div className="lab-informative-copy">
        <span>{title}</span>
        <strong>{value}</strong>
        <small className={trend ? negative ? "negative" : "" : "neutral"}>
          {trend ? negative ? <ArrowDown size={13} strokeWidth={2.4} /> : <ArrowUp size={13} strokeWidth={2.4} /> : null}
          {percentage}
        </small>
      </div>
    </article>
  );
}

type LineChartMetricCardProps = {
  label?: string;
  value?: number;
  valuePrefix?: string;
  change?: number;
  points?: number[];
  className?: string;
  onAction?: () => void;
};

function smoothChartPath(values: number[], width = 310, height = 88, left = 5, top = 34) {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => ({
    x: left + (index / (values.length - 1)) * width,
    y: top + height - ((value - min) / range) * height,
  }));
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const middle = (previous.x + point.x) / 2;
    return `${path} C${middle} ${previous.y} ${middle} ${point.y} ${point.x} ${point.y}`;
  }, `M${points[0].x} ${points[0].y}`);
}

export function LineChartMetricCardPreview({
  label = "Programas",
  value = 59,
  valuePrefix = "",
  change = 10.5,
  points = [19, 24, 33, 28, 27, 29, 36, 30, 38, 29, 21, 23, 31, 35, 36, 38, 32, 40, 45, 42],
  className = "",
  onAction,
}: LineChartMetricCardProps) {
  const fillId = useId().replaceAll(":", "");
  const glowId = useId().replaceAll(":", "");
  const linePath = smoothChartPath(points);
  const areaPath = `${linePath} L315 126 L5 126 Z`;
  const positive = change >= 0;

  return (
    <article className={`lab-line-chart-card lab-analytics-card ${className}`.trim()} aria-label={`Indicador de ${label}: ${value}, variação de ${change} por cento no mês`}>
      <header>
        <button type="button" onClick={onAction} aria-label={`Abrir detalhes de ${label.toLowerCase()}`}><span>{label}</span><ChevronRight size={17} /></button>
        <div className="lab-line-chart-value">
          <strong>{valuePrefix}{value.toLocaleString("pt-BR")}</strong>
          <span className={positive ? "" : "is-negative"}>
            {positive ? <ArrowUp size={16} strokeWidth={2.2} /> : <ArrowDown size={16} strokeWidth={2.2} />}
            {Math.abs(change).toLocaleString("pt-BR")}%
          </span>
        </div>
      </header>
      <div className="lab-line-chart-plot" aria-hidden="true">
        <svg viewBox="0 0 320 128" preserveAspectRatio="none">
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#75bee9" stopOpacity=".34" />
              <stop offset="65%" stopColor="#9ed3ee" stopOpacity=".12" />
              <stop offset="100%" stopColor="#dceff8" stopOpacity="0" />
            </linearGradient>
            <filter id={glowId} x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
          </defs>
          <path fill={`url(#${fillId})`} d={areaPath} />
          <path className="lab-line-chart-glow" style={{ filter: `url(#${glowId})` }} d={linePath} />
          <path className="lab-line-chart-line" d={linePath} />
        </svg>
      </div>
    </article>
  );
}

const serviceRelevanceItems = [
  { name: "Clareamento dental", count: 119, change: 4.7, tone: "peach" },
  { name: "Consulta preventiva", count: 79, change: -6.2, tone: "amber" },
  { name: "Prótese dentária", count: 50, change: 3.8, tone: "mint" },
] as const;

type ServiceRelevanceItem = { name: string; count: number; change: number; tone: "peach" | "amber" | "mint" };

export function ServiceRelevanceCardPreview({ items = serviceRelevanceItems, overallChange = 8.4 }: { items?: readonly ServiceRelevanceItem[]; overallChange?: number }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <article className="lab-service-relevance-card lab-analytics-card">
      <header>
        <div>
          <span>Serviços realizados</span>
          <p><strong>{total.toLocaleString("pt-BR")}</strong><small><ArrowUp size={15} strokeWidth={2.3} /> {Math.abs(overallChange).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</small></p>
        </div>
        <button type="button">Detalhes</button>
      </header>

      <div className="lab-service-bubbles" aria-label="Relevância percentual por serviço">
        {items.map((item) => (
          <div className={`lab-service-bubble is-${item.tone}`} key={item.name} title={`${item.name}: ${Math.round((item.count / total) * 100)}%`}>
            <strong>{Math.round((item.count / total) * 100)}%</strong>
          </div>
        ))}
      </div>

      <div className="lab-service-legend">
        {items.map((item) => (
          <div key={item.name}>
            <i className={`is-${item.tone}`} aria-hidden="true" />
            <span>{item.name}</span>
            <strong>{item.count}</strong>
            <small className={item.change < 0 ? "is-down" : ""}>
              {item.change < 0 ? <ArrowDown size={15} /> : <ArrowUp size={15} />}
              {Math.abs(item.change).toLocaleString("pt-BR")}%
            </small>
          </div>
        ))}
      </div>
    </article>
  );
}

export function RevenueGoalGaugePreview({ current = 6300, target = 10000, change = 8.4 }: { current?: number; target?: number; change?: number }) {
  const [goal, setGoal] = useState(target);
  useEffect(() => setGoal(target), [target]);
  const percentage = Math.max(0, Math.min(100, goal > 0 ? (current / goal) * 100 : 0));
  const needleAngle = -45 + percentage * 2.7;
  const ticks = Array.from({ length: 28 }, (_, index) => -135 + index * 10);
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <article className="lab-goal-gauge-card lab-analytics-card" aria-label={`Meta de faturamento: ${percentage.toFixed(0)} por cento atingida`}>
      <header>
        <div>
          <span>Meta de faturamento</span>
          <div className="lab-goal-value">
            <strong>{Math.round(percentage)}%</strong>
            <small className={change < 0 ? "is-negative" : ""}>
              {change < 0 ? <ArrowDown size={15} strokeWidth={2.2} /> : <ArrowUp size={15} strokeWidth={2.2} />}
              {Math.abs(change).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
            </small>
          </div>
        </div>
        <button type="button" onClick={() => { const value = window.prompt("Nova meta de faturamento (R$)", String(goal)); if (value === null) return; const parsed = Number(value.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")); if (Number.isFinite(parsed) && parsed > 0) setGoal(parsed); }}>Ajustar meta</button>
      </header>

      <div className="lab-goal-gauge">
        <svg viewBox="0 0 300 260" aria-hidden="true">
          <circle className="lab-goal-track" cx="150" cy="140" r="103" pathLength="100" />
          <circle className="lab-goal-progress" cx="150" cy="140" r="103" pathLength="100" style={{ strokeDasharray: `${percentage * .75} 100` }} />
          <g className="lab-goal-ticks">
            {ticks.map((angle) => (
              <line key={angle} x1="150" y1="54" x2="150" y2={angle % 50 === 0 ? 64 : 60} transform={`rotate(${angle} 150 140)`} />
            ))}
          </g>
          <text x="90" y="151">20</text>
          <text x="201" y="151">80</text>
          <g className="lab-goal-needle" style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: "150px 140px" }}>
            <path d="M150 132 L150 148 L74 143 Q66 140 74 137 Z" />
          </g>
          <circle className="lab-goal-needle-ring" cx="150" cy="140" r="17" />
          <circle className="lab-goal-needle-center" cx="150" cy="140" r="8" />
        </svg>
        <div className="lab-goal-percentage"><strong>{Math.round(percentage)}</strong><span>/100</span></div>
      </div>

      <footer>
        <span>Realizado</span>
        <strong>{currency.format(current)} de {currency.format(goal)}</strong>
      </footer>
    </article>
  );
}

type MonthlyPerformanceItem = { month: string; value: number };

const monthlyPerformanceData: MonthlyPerformanceItem[] = [
  { month: "Jan", value: 5120 },
  { month: "Fev", value: 6840 },
  { month: "Mar", value: 3970 },
  { month: "Abr", value: 4560 },
  { month: "Mai", value: 6250 },
  { month: "Jun", value: 5780 },
  { month: "Jul", value: 6253 },
  { month: "Ago", value: 5832 },
];

export function MonthlyColumnChartPreview({
  data = monthlyPerformanceData,
  label = "Faturamento mensal",
  goodWhenDown = false,
  isCurrency = true,
  className = "",
  onAction,
  changeOverride,
}: {
  data?: readonly MonthlyPerformanceItem[];
  label?: string;
  goodWhenDown?: boolean;
  isCurrency?: boolean;
  className?: string;
  onAction?: () => void;
  changeOverride?: number;
}) {
  const values = data.map((item) => item.value);
  const maximum = Math.max(1, ...values);
  const current = data.at(-1)?.value ?? 0;
  const previous = data.at(-2)?.value ?? current;
  const difference = current - previous;
  const change = changeOverride ?? (previous === 0 ? 0 : (difference / previous) * 100);
  const favorable = goodWhenDown ? change <= 0 : change >= 0;
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <article className={`lab-column-chart-card lab-analytics-card ${className}`.trim()} aria-label={`Desempenho mensal de ${label.toLowerCase()}`}>
      <header>
        <div>
          <span>{label}</span>
          <div className="lab-column-chart-value">
            <strong>{isCurrency ? currency.format(current) : current.toLocaleString("pt-BR")}</strong>
            <small className={favorable ? "" : "is-negative"}>
              {change < 0 ? <ArrowDown size={15} strokeWidth={2.2} /> : <ArrowUp size={15} strokeWidth={2.2} />}
              {Math.abs(change).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
            </small>
          </div>
        </div>
        <button type="button" onClick={onAction} aria-label={`Abrir detalhes de ${label.toLowerCase()}`}><ChevronRight size={18} /></button>
      </header>
      <div className="lab-column-chart" role="img" aria-label="Gráfico de colunas do faturamento por mês">
        {data.map((item, index) => (
          <div className={index === data.length - 1 ? "is-current" : index === 1 ? "is-highlight" : ""} key={`${item.month}-${index}`}>
            <span title={`${item.month}: ${currency.format(item.value)}`} style={{ height: `${Math.max(12, (item.value / maximum) * 100)}%` }} />
            <small>{item.month}</small>
          </div>
        ))}
      </div>
    </article>
  );
}

const chartLibraryMonths = [
  { month: "Jan", receita: 42, despesa: 28, lucro: 14, meta: 38 },
  { month: "Fev", receita: 48, despesa: 30, lucro: 18, meta: 40 },
  { month: "Mar", receita: 45, despesa: 31, lucro: 14, meta: 42 },
  { month: "Abr", receita: 55, despesa: 32, lucro: 23, meta: 44 },
  { month: "Mai", receita: 58, despesa: 35, lucro: 23, meta: 46 },
  { month: "Jun", receita: 62, despesa: 37, lucro: 25, meta: 48 },
  { month: "Jul", receita: 68, despesa: 39, lucro: 29, meta: 50 },
  { month: "Ago", receita: 72, despesa: 41, lucro: 31, meta: 52 },
  { month: "Set", receita: 76, despesa: 43, lucro: 33, meta: 54 },
  { month: "Out", receita: 81, despesa: 45, lucro: 36, meta: 56 },
  { month: "Nov", receita: 86, despesa: 47, lucro: 39, meta: 58 },
  { month: "Dez", receita: 92, despesa: 50, lucro: 42, meta: 60 },
];

const chartLibraryMonths24 = [
  ...chartLibraryMonths.map((item) => ({ ...item, month: `${item.month}/25`, receita: Math.round(item.receita * .78), despesa: Math.round(item.despesa * .82), lucro: Math.round(item.lucro * .7), meta: Math.round(item.meta * .84) })),
  ...chartLibraryMonths.map((item) => ({ ...item, month: `${item.month}/26` })),
];

function chartLibraryDataFor(period: ChartLibraryPeriod) {
  if (period === "6 meses") return chartLibraryMonths.slice(-6);
  if (period === "24 meses") return chartLibraryMonths24;
  return chartLibraryMonths;
}

const chartLibraryCategories = [
  { name: "Serviços", value: 42, color: "#69b7e4" },
  { name: "Produtos", value: 26, color: "#79c8af" },
  { name: "Planos", value: 18, color: "#e9b775" },
  { name: "Outros", value: 14, color: "#a99add" },
];

const chartLibraryRanking = [
  { name: "Clareamento", value: 84 },
  { name: "Avaliação", value: 72 },
  { name: "Limpeza", value: 58 },
  { name: "Manutenção", value: 47 },
  { name: "Prótese", value: 35 },
];

const chartLibraryFunnel = [
  { name: "Leads", value: 420, fill: "#7bbce5" },
  { name: "Qualificados", value: 286, fill: "#76c5bd" },
  { name: "Propostas", value: 174, fill: "#e7bd79" },
  { name: "Vendas", value: 96, fill: "#a898d7" },
];

const chartLibraryWaterfall = [
  { name: "Receita", base: 0, value: 92, total: 92, tone: "positive" },
  { name: "Custos", base: 60, value: 32, total: 60, tone: "negative" },
  { name: "Despesas", base: 39, value: 21, total: 39, tone: "negative" },
  { name: "Taxas", base: 31, value: 8, total: 31, tone: "negative" },
  { name: "Lucro", base: 0, value: 31, total: 31, tone: "total" },
];

const chartLibraryHeat = [
  [22, 34, 48, 62, 55, 31],
  [28, 46, 71, 84, 68, 39],
  [18, 39, 66, 78, 61, 35],
  [31, 58, 82, 91, 73, 44],
  [25, 47, 69, 80, 64, 37],
];

const chartLibraryCohort = [
  [100, 76, 64, 58, 52, 48],
  [100, 81, 69, 61, 55],
  [100, 79, 67, 60],
  [100, 84, 72],
  [100, 86],
];

const chartLibraryPareto = [
  { name: "Clareamento", value: 36, cumulative: 36 },
  { name: "Avaliação", value: 24, cumulative: 60 },
  { name: "Limpeza", value: 18, cumulative: 78 },
  { name: "Manutenção", value: 13, cumulative: 91 },
  { name: "Outros", value: 9, cumulative: 100 },
];

function ChartLibraryTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="lab-chart-tooltip"><strong>{label}</strong>{payload.map((item) => <span key={`${item.name}-${item.value}`}><i style={{ background: item.color }} />{item.name}: <b>{item.value}</b></span>)}</div>;
}

type ChartLibraryPeriod = "6 meses" | "12 meses" | "24 meses";

function ChartModelCard({ title, children, wide = false }: { title: string; children: React.ReactNode | ((period: ChartLibraryPeriod) => React.ReactNode); wide?: boolean }) {
  const [period, setPeriod] = useState<ChartLibraryPeriod>("12 meses");
  const [open, setOpen] = useState(false);
  return (
    <article className={`lab-chart-model ${wide ? "is-wide" : ""}`}>
      <header>
        <h3>{title}</h3>
        <div className="lab-chart-period">
          <button type="button" aria-label={`Filtrar período de ${title}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}><CalendarDays size={14} /><span>{period}</span><ChevronDown size={12} className={open ? "open" : ""} /></button>
          {open ? <div role="listbox" aria-label={`Período de ${title}`}>{(["6 meses", "12 meses", "24 meses"] as ChartLibraryPeriod[]).map((option) => <button key={option} type="button" role="option" aria-selected={period === option} onClick={() => { setPeriod(option); setOpen(false); }}><span>{option}</span>{period === option ? <Check size={13} /> : null}</button>)}</div> : null}
        </div>
      </header>
      <div className="lab-chart-model-canvas">{typeof children === "function" ? children(period) : children}</div>
    </article>
  );
}

function ChartLibraryPreview() {
  const axis = { fill: "#7b8795", fontSize: 10 };
  const grid = "#e7edf2";
  return (
    <div className="lab-chart-library">
      <div className="lab-chart-library-intro">
        <div><span>BIBLIOTECA VISUAL</span><h2>Modelos oficiais de gráficos</h2><p>Todos usam o mesmo cabeçalho, filtro, escala, legenda, cores e comportamento responsivo.</p></div>
        <strong>12 modelos</strong>
      </div>
      <div className="lab-chart-library-grid">
        <ChartModelCard wide title="Evolução no tempo">
          {(period) => <ResponsiveContainer width="100%" height="100%"><LineChart data={chartLibraryDataFor(period)} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}><CartesianGrid stroke={grid} strokeDasharray="3 5" vertical={false} /><XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} interval={period === "24 meses" ? 2 : 0} /><YAxis tick={axis} axisLine={false} tickLine={false} /><Tooltip content={<ChartLibraryTooltip />} /><Legend iconType="circle" iconSize={7} /><Line type="monotone" dataKey="receita" name="Receita" stroke="#61b4e2" strokeWidth={3} dot={false} activeDot={{ r: 5 }} /><Line type="monotone" dataKey="despesa" name="Despesa" stroke="#df8b91" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="lucro" name="Lucro" stroke="#68b995" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer>}
        </ChartModelCard>

        <ChartModelCard title="Comparação por período">
          {(period) => { const data = chartLibraryDataFor(period); return <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 10, right: 4, left: -22, bottom: 0 }}><CartesianGrid stroke={grid} strokeDasharray="3 5" vertical={false} /><XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} interval={period === "24 meses" ? 3 : 0} /><YAxis tick={axis} axisLine={false} tickLine={false} /><Tooltip content={<ChartLibraryTooltip />} /><Bar dataKey="receita" name="Receita" radius={[7, 7, 3, 3]}>{data.map((item, index) => <Cell key={`${item.month}-${index}`} fill={index === data.length - 1 ? "#e8b46e" : "#73bce5"} />)}</Bar></BarChart></ResponsiveContainer>; }}
        </ChartModelCard>

        <ChartModelCard title="Ranking">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={chartLibraryRanking} layout="vertical" margin={{ top: 6, right: 18, left: 4, bottom: 0 }}><CartesianGrid stroke={grid} strokeDasharray="3 5" horizontal={false} /><XAxis type="number" tick={axis} axisLine={false} tickLine={false} /><YAxis width={76} type="category" dataKey="name" tick={axis} axisLine={false} tickLine={false} /><Tooltip content={<ChartLibraryTooltip />} /><Bar dataKey="value" name="Quantidade" fill="#76bea6" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer>
        </ChartModelCard>

        <ChartModelCard title="Composição mensal">
          {(period) => <ResponsiveContainer width="100%" height="100%"><BarChart data={chartLibraryDataFor(period)} margin={{ top: 10, right: 4, left: -22, bottom: 0 }}><CartesianGrid stroke={grid} strokeDasharray="3 5" vertical={false} /><XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} interval={period === "24 meses" ? 3 : 0} /><YAxis tick={axis} axisLine={false} tickLine={false} /><Tooltip content={<ChartLibraryTooltip />} /><Legend iconType="circle" iconSize={7} /><Bar stackId="total" dataKey="lucro" name="Lucro" fill="#6dc0a3" radius={[0, 0, 3, 3]} /><Bar stackId="total" dataKey="despesa" name="Despesas" fill="#efb4a7" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>}
        </ChartModelCard>

        <ChartModelCard wide title="Fluxo e saldo projetado">
          {(period) => <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartLibraryDataFor(period)} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}><defs><linearGradient id="lab-area-revenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#64b7e5" stopOpacity=".38" /><stop offset="1" stopColor="#64b7e5" stopOpacity=".03" /></linearGradient><linearGradient id="lab-area-expense" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e58e96" stopOpacity=".25" /><stop offset="1" stopColor="#e58e96" stopOpacity=".02" /></linearGradient></defs><CartesianGrid stroke={grid} strokeDasharray="3 5" vertical={false} /><XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} interval={period === "24 meses" ? 2 : 0} /><YAxis tick={axis} axisLine={false} tickLine={false} /><Tooltip content={<ChartLibraryTooltip />} /><Legend iconType="circle" iconSize={7} /><Area type="monotone" dataKey="receita" name="Entradas" stroke="#5daedc" strokeWidth={2.5} fill="url(#lab-area-revenue)" /><Area type="monotone" dataKey="despesa" name="Saídas" stroke="#dc838c" strokeWidth={2.3} fill="url(#lab-area-expense)" /></AreaChart></ResponsiveContainer>}
        </ChartModelCard>

        <ChartModelCard title="Participação">
          <div className="lab-chart-donut-center"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartLibraryCategories} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3} stroke="none">{chartLibraryCategories.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip content={<ChartLibraryTooltip />} /></PieChart></ResponsiveContainer><div><strong>R$ 92 mil</strong><span>Receita total</span></div></div><div className="lab-chart-inline-legend">{chartLibraryCategories.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}<b>{item.value}%</b></span>)}</div>
        </ChartModelCard>

        <ChartModelCard title="Conversão comercial">
          <ResponsiveContainer width="100%" height="100%"><FunnelChart><Tooltip content={<ChartLibraryTooltip />} /><Funnel dataKey="value" data={chartLibraryFunnel} isAnimationActive><LabelList position="right" fill="#5f6b79" stroke="none" dataKey="name" fontSize={11} /></Funnel></FunnelChart></ResponsiveContainer>
        </ChartModelCard>

        <ChartModelCard title="Formação do lucro">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={chartLibraryWaterfall} margin={{ top: 18, right: 5, left: -22, bottom: 0 }}><CartesianGrid stroke={grid} strokeDasharray="3 5" vertical={false} /><XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} /><Tooltip content={<ChartLibraryTooltip />} /><Bar dataKey="base" stackId="waterfall" fill="transparent" /><Bar dataKey="value" name="Impacto" stackId="waterfall" radius={[6, 6, 3, 3]}>{chartLibraryWaterfall.map((item) => <Cell key={item.name} fill={item.tone === "negative" ? "#e79a9f" : item.tone === "total" ? "#67b99a" : "#68b6e1"} />)}</Bar></BarChart></ResponsiveContainer>
        </ChartModelCard>

        <ChartModelCard title="Ocupação da agenda">
          <div className="lab-chart-heatmap"><div className="lab-chart-heat-hours"><span>08h</span><span>10h</span><span>12h</span><span>14h</span><span>16h</span><span>18h</span></div>{chartLibraryHeat.map((row, rowIndex) => <div className="lab-chart-heat-row" key={rowIndex}><strong>{["Seg", "Ter", "Qua", "Qui", "Sex"][rowIndex]}</strong>{row.map((value, columnIndex) => <span key={columnIndex} title={`${value}% ocupado`} style={{ "--heat": value / 100 } as React.CSSProperties}>{value}%</span>)}</div>)}</div>
        </ChartModelCard>

        <ChartModelCard title="Retenção de clientes">
          <div className="lab-chart-cohort"><div className="lab-chart-cohort-head"><span>Entrada</span>{["M0", "M1", "M2", "M3", "M4", "M5"].map((item) => <span key={item}>{item}</span>)}</div>{chartLibraryCohort.map((row, rowIndex) => <div className="lab-chart-cohort-row" key={rowIndex}><strong>{["Jan", "Fev", "Mar", "Abr", "Mai"][rowIndex]}</strong>{Array.from({ length: 6 }, (_, index) => row[index] === undefined ? <i key={index} /> : <span key={index} style={{ "--cohort": row[index] / 100 } as React.CSSProperties}>{row[index]}%</span>)}</div>)}</div>
        </ChartModelCard>

        <ChartModelCard wide title="Concentração de receita">
          <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartLibraryPareto} margin={{ top: 14, right: 5, left: -18, bottom: 0 }}><CartesianGrid stroke={grid} strokeDasharray="3 5" vertical={false} /><XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} /><YAxis yAxisId="left" tick={axis} axisLine={false} tickLine={false} /><YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} unit="%" /><Tooltip content={<ChartLibraryTooltip />} /><Legend iconType="circle" iconSize={7} /><ReferenceLine yAxisId="right" y={80} stroke="#e2a45d" strokeDasharray="5 5" /><Bar yAxisId="left" dataKey="value" name="Receita" fill="#73bce5" radius={[7, 7, 3, 3]} /><Line yAxisId="right" type="monotone" dataKey="cumulative" name="Acumulado" stroke="#e09f55" strokeWidth={3} dot={{ r: 4, fill: "#fff", strokeWidth: 2 }} /></ComposedChart></ResponsiveContainer>
        </ChartModelCard>

        <ChartModelCard title="Meta versus realizado">
          <div className="lab-chart-gauge"><svg viewBox="0 0 300 190" aria-hidden><path d="M42 150 A108 108 0 0 1 258 150" pathLength="100" /><path className="progress" d="M42 150 A108 108 0 0 1 258 150" pathLength="100" /><g style={{ transform: "rotate(34deg)", transformOrigin: "150px 150px" }}><path d="M150 145 L150 155 L64 152 Q58 150 64 148 Z" /></g><circle cx="150" cy="150" r="15" /><circle className="center" cx="150" cy="150" r="7" /></svg><div><strong>73%</strong><span>R$ 73 mil de R$ 100 mil</span></div></div>
        </ChartModelCard>
      </div>
    </div>
  );
}

function LaboratoryGate() {
  const access = useAccess();
  if (access.loading) return <main className="access-gate">Carregando acesso…</main>;
  if (!access.member || !access.manage) return <main className="access-gate"><h1>Acesso restrito</h1><p>O laboratório é exclusivo do administrador.</p><a className="lab-create-activity" href="/inicio">Voltar ao sistema</a></main>;
  return <LaboratorioContent />;
}
export default function Laboratorio() { return <AccessProvider><LaboratoryGate /></AccessProvider>; }
function LaboratorioContent() {
  const [visible, setVisible] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);

  const showAgain = () => {
    setPreviewKey((current) => current + 1);
    setVisible(true);
  };

  return (
    <main className="lab-canvas" aria-label="Laboratório de componentes">
      <div className="lab-shelf">
        <section className="lab-demo-block">
          <div className="lab-component-label">ATLAS CLÍNICO · NOVA PRÉVIA REALISTA</div>
          <a className="lab-create-activity" href="/laboratorio/anatomia">Abrir odontogramas e mapa facial</a>
        </section>
        <section className="lab-demo-block">
          <div className="lab-component-label">01 · NOTIFICAÇÃO DE SALVAMENTO</div>
          <div className="lab-demo-stage">
            {visible ? (
              <LabNotification
                key={previewKey}
                module="Calendário"
                kind="saved"
                message="Alterações salvas com sucesso"
                onClose={() => setVisible(false)}
              />
            ) : (
              <button className="lab-show-notification" type="button" onClick={showAgain}>
                Mostrar notificação
              </button>
            )}
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">02 · CENTRAL DE NOTIFICAÇÕES</div>
          <div className="lab-demo-stage lab-center-stage">
            <NotificationCenterPreview />
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">03 · LISTA SUSPENSA</div>
          <div className="lab-demo-stage lab-select-stage">
            <div className="lab-select-examples">
              <LabSelect
                label="Com status"
                showDot
                options={[
                  { id: "completed", label: "Concluído", color: "green" },
                  { id: "waiting", label: "Aguardando", color: "yellow" },
                  { id: "processing", label: "Em andamento", color: "indigo" },
                ]}
              />
              <LabSelect
                label="Sem status"
                options={[
                  { id: "all", label: "Todos os tipos" },
                  { id: "product", label: "Produto" },
                  { id: "service", label: "Serviço" },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">04 · VISUALIZAÇÃO DE LISTA E GRADE</div>
          <div className="lab-demo-stage lab-view-stage">
            <div className="lab-view-options">
              <ViewModeToggle />
              <ViewModeToggle iconOnly />
            </div>
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">05 · CARD DE CLIENTE</div>
          <div className="lab-demo-stage lab-client-stage">
            <ClientCardPreview tone="peach" />
            <ClientCardPreview tone="gray" />
            <ClientCardPreview tone="blue" />
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">06 · CRIAR EVENTO</div>
          <div className="lab-demo-stage lab-event-stage">
            <EventCardPreview />
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">07 · MENU DA CONTA</div>
          <div className="lab-demo-stage lab-user-menu-stage">
            <UserMenuPreview />
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">08 · TIMELINE DE HOJE</div>
          <div className="lab-demo-stage lab-timeline-stage">
            <TimelinePreview />
          </div>
        </section>

        <section className="lab-demo-block lab-agenda-demo">
          <div className="lab-component-label">09 · AGENDA</div>
          <div className="lab-demo-stage lab-agenda-stage">
            <AgendaPreview />
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">10 · CAIXA DE PESQUISA</div>
          <div className="lab-demo-stage lab-search-stage"><SearchFieldPreview /></div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">11 · CARD DE DOCUMENTO</div>
          <div className="lab-demo-stage lab-document-stage"><DocumentCardPreview /></div>
        </section>

        <section className="lab-demo-block lab-ai-demo">
          <div className="lab-component-label">12 · GEST IA · ANÁLISE</div>
          <div className="lab-demo-stage lab-ai-stage"><AiThinkingPreview /></div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">13 · CARD DE INSIGHT E AÇÃO</div>
          <div className="lab-demo-stage lab-insight-action-stage">
            <InsightActionCardPreview tone="blue" classification="CRÍTICO" title="Seu faturamento perdeu o ritmo" description="Você pode fechar 12% abaixo da meta. Reativar 18 clientes pode recuperar até R$ 14.600." action="Preparar campanha" />
            <InsightActionCardPreview tone="rose" classification="ATENÇÃO" title="Sete pacientes ainda não confirmaram" description="A agenda de amanhã ainda possui horários que precisam de confirmação." action="Enviar lembretes" />
            <InsightActionCardPreview tone="amber" classification="SAZONAL" title="Dia das Mães está a 24 dias" description="Antecipar a campanha pode aumentar o alcance e melhorar as conversões." action="Criar planejamento" />
            <InsightActionCardPreview tone="violet" classification="AGENDA" title="Sua tarde tem espaço disponível" description="Existem dois horários livres que podem receber novos atendimentos." action="Preencher horários" />
            <InsightActionCardPreview tone="teal" classification="POSITIVO" title="Seu estoque está saudável" description="Os itens essenciais estão dentro do nível esperado para esta semana." action="Ver estoque" />
            <InsightActionCardPreview tone="gray" classification="INFORMATIVO" title="Seu cadastro está atualizado" description="Os dados principais foram revisados e nenhuma pendência foi encontrada." action="Ver informações" />
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">14 · CARD INFORMATIVO</div>
          <div className="lab-demo-stage lab-informative-stage">
            <InformativeMetricCardPreview tone="blue" icon={UsersRound} title="Total de clientes" value="1.284" change="7% no último mês" />
            <InformativeMetricCardPreview tone="rose" icon={UserRoundCheck} title="Clientes ativos" value="968" change="5% no último mês" />
            <InformativeMetricCardPreview tone="amber" icon={CalendarDays} title="Agendamentos" value="146" change="9% no último mês" />
            <InformativeMetricCardPreview tone="violet" icon={FolderKanban} title="Projetos ativos" value="24" change="4% no último mês" />
            <InformativeMetricCardPreview tone="teal" icon={ShieldCheck} title="Taxa de retorno" value="82%" change="6% no último mês" />
            <InformativeMetricCardPreview tone="gray" icon={Check} title="Tarefas concluídas" value="312" change="8% no último mês" />
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">15 · CARD DE INDICADOR COM GRÁFICO</div>
          <div className="lab-demo-stage lab-line-chart-stage">
            <LineChartMetricCardPreview />
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">16 · RELEVÂNCIA DOS SERVIÇOS</div>
          <div className="lab-demo-stage lab-service-relevance-stage">
            <ServiceRelevanceCardPreview />
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">17 · INDICADOR DE META</div>
          <div className="lab-demo-stage lab-goal-gauge-stage">
            <RevenueGoalGaugePreview />
          </div>
        </section>

        <section className="lab-demo-block">
          <div className="lab-component-label">18 · DESEMPENHO MENSAL</div>
          <div className="lab-demo-stage lab-column-chart-stage">
            <MonthlyColumnChartPreview />
          </div>
        </section>

        <section className="lab-demo-block lab-chart-library-demo">
          <div className="lab-component-label">19 · BIBLIOTECA OFICIAL DE GRÁFICOS</div>
          <div className="lab-demo-stage lab-chart-library-stage">
            <ChartLibraryPreview />
          </div>
        </section>
      </div>
    </main>
  );
}
