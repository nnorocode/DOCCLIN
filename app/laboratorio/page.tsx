"use client";

import {
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
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type NotificationKind = "saved" | "deleted" | "warning";
type NotificationModule = "Calendário" | "Tarefas" | "Projetos";

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
    unread: true,
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

function NotificationCenterPreview() {
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

type EventPickerId = "date" | "timeStart" | "timeEnd" | "client" | "owner" | "priority" | "reminder" | "service" | "location" | "repeat";

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

type EventDraft = { title: string; priority: "Alta" | "Média" | "Leve"; reminder: string; repeat: string; service: string };

function EventCardPreview({ heading = "Adicionar à agenda", initialTitle = "", initialPriority = "Média", initialReminder = "15 minutos antes", initialRepeat = "Não se repete", initialService = "", onClose, onCancel, onSave, onDelete }: { heading?: string; initialTitle?: string; initialPriority?: "Alta" | "Média" | "Leve"; initialReminder?: string; initialRepeat?: string; initialService?: string; onClose?: () => void; onCancel?: () => void; onSave?: (draft: EventDraft) => void; onDelete?: () => void }) {
  const [eventType, setEventType] = useState<"reuniao" | "consulta" | "compromisso">("reuniao");
  const [tagColor, setTagColor] = useState<"blue" | "peach" | "green" | "violet">("blue");
  const [showNote, setShowNote] = useState(false);
  const [openPicker, setOpenPicker] = useState<EventPickerId | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [priority, setPriority] = useState<"Alta" | "Média" | "Leve">(initialPriority);
  const [reminder, setReminder] = useState(initialReminder);
  const [repeat, setRepeat] = useState(initialRepeat);
  const [service, setService] = useState(initialService);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeOpenPicker = (event: PointerEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) setOpenPicker(null);
    };
    document.addEventListener("pointerdown", closeOpenPicker);
    return () => document.removeEventListener("pointerdown", closeOpenPicker);
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
        <EventSelect editable id="client" icon={UserRound} label="Cliente" placeholder="Digitar cliente" options={["Ana Carolina", "Bruno Lima", "Camila Souza"]} openPicker={openPicker} setOpenPicker={setOpenPicker} />
        <EventSelect editable id="owner" icon={UserRoundCheck} label="Responsável" placeholder="Digitar responsável" options={["Marina Costa", "Lucas Ferreira", "Paulo Lima"]} openPicker={openPicker} setOpenPicker={setOpenPicker} />
        <EventSelect id="priority" icon={Flag} label="Prioridade" initial={priority} placeholder="Selecionar prioridade" options={["Alta", "Média", "Leve"]} openPicker={openPicker} setOpenPicker={setOpenPicker} onValueChange={(value) => setPriority(value as "Alta" | "Média" | "Leve")} />
        <EventSelect id="reminder" icon={BellRing} label="Lembrete" initial={reminder} placeholder="Selecionar lembrete" options={["15 minutos antes", "30 minutos antes", "1 hora antes", "1 dia antes"]} openPicker={openPicker} setOpenPicker={setOpenPicker} onValueChange={setReminder} />
        <EventSelect editable wide id="service" icon={Sparkles} label="Serviço" initial={service} placeholder="Digitar ou selecionar serviço" options={["Clareamento dental", "Consulta de avaliação", "Limpeza", "Manutenção de aparelho"]} openPicker={openPicker} setOpenPicker={setOpenPicker} onValueChange={setService} />
        <EventSelect editable wide id="location" icon={MapPin} label="Local" placeholder="Digitar local" options={["Clínica · Sala 2", "Sala de reunião", "Atendimento externo", "Online"]} openPicker={openPicker} setOpenPicker={setOpenPicker} />
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
        <button type="button" className="primary" onClick={() => onSave?.({ title, priority, reminder, repeat, service })}>Salvar evento</button>
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

const timelineItems = [
  { id: 1, time: "09:00", title: "Reunião comercial", detail: "Sala de reunião · Ana Martins", service: "Clareamento dental", type: "event" as const, state: "done" as const },
  { id: 2, time: "11:30", title: "Retorno para Bella Modas", detail: "Ligação com Lucas Ferreira", service: "Consulta de avaliação", type: "task" as const, state: "now" as const },
  { id: 3, time: "14:00", title: "Revisar cronograma do Projeto Aurora", detail: "Etapa de planejamento", service: "Planejamento estratégico", type: "project" as const, state: "next" as const },
  { id: 4, time: "16:30", title: "Fechamento do caixa", detail: "Conferir movimentações do dia", service: "Rotina administrativa", type: "task" as const, state: "next" as const },
];

const timelineItemsByDay: Record<number, typeof timelineItems> = {
  10: [
    { id: 101, time: "09:30", title: "Revisar orçamento", detail: "Financeiro · Marina Costa", service: "Análise financeira", type: "task", state: "next" },
    { id: 102, time: "15:00", title: "Apresentação para novo cliente", detail: "Online · Studio Norte", service: "Apresentação comercial", type: "event", state: "next" },
  ],
  11: [
    { id: 111, time: "10:00", title: "Consulta de avaliação", detail: "Clínica · Bruno Lima", service: "Avaliação inicial", type: "event", state: "next" },
    { id: 112, time: "14:30", title: "Atualizar proposta", detail: "Comercial · Bella Modas", service: "Proposta comercial", type: "task", state: "next" },
  ],
  12: [
    { id: 121, time: "09:00", title: "Planejamento da semana", detail: "Equipe de gestão", service: "Planejamento estratégico", type: "project", state: "next" },
    { id: 122, time: "11:30", title: "Retorno de atendimento", detail: "Ligação · Camila Souza", service: "Consulta de retorno", type: "task", state: "next" },
  ],
  13: timelineItems,
  14: [
    { id: 141, time: "08:30", title: "Alinhamento da equipe", detail: "Sala de reunião · Equipe comercial", service: "Reunião interna", type: "event", state: "next" },
    { id: 142, time: "10:00", title: "Confirmar agenda de amanhã", detail: "7 clientes aguardando retorno", service: "Confirmação de consultas", type: "task", state: "next" },
    { id: 143, time: "15:00", title: "Revisar proposta da Clínica Vida", detail: "Projeto de expansão", service: "Planejamento comercial", type: "project", state: "next" },
  ],
  15: [
    { id: 151, time: "09:00", title: "Clareamento dental", detail: "Clínica · Ana Carolina", service: "Clareamento dental", type: "event", state: "next" },
    { id: 152, time: "13:30", title: "Enviar contratos", detail: "Administrativo · 3 documentos", service: "Documentação", type: "task", state: "next" },
  ],
  16: [
    { id: 161, time: "11:00", title: "Reunião de resultados", detail: "Diretoria · Sala principal", service: "Análise de desempenho", type: "event", state: "next" },
    { id: 162, time: "16:00", title: "Atualizar cronograma", detail: "Projeto Aurora", service: "Gestão de projeto", type: "project", state: "next" },
  ],
  17: [
    { id: 171, time: "10:30", title: "Consulta de retorno", detail: "Clínica · Lucas Martins", service: "Consulta odontológica", type: "event", state: "next" },
  ],
};

function TimelinePreview() {
  const [filter, setFilter] = useState<TimelineFilter>("all");
  const [selectedDay, setSelectedDay] = useState(13);
  const selectedItems = timelineItemsByDay[selectedDay] ?? [];
  const visibleItems = filter === "all" ? selectedItems : selectedItems.filter((item) => item.type === filter);
  const weekdayNames = ["Ter", "Qua", "Qui", "Sex", "Sáb", "Dom", "Seg"];
  const weekdayNamesFull = ["Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo", "Segunda"];
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = Math.min(30, Math.max(1, selectedDay - 3 + index));
    return { weekday: weekdayNames[(day - 1) % 7], day, today: day === 13 };
  });
  const selectedWeekday = weekdayNamesFull[(selectedDay - 1) % 7];

  return (
    <article className="lab-timeline-card">
      <header>
        <h2>{selectedDay === 13 ? "Hoje" : `${selectedWeekday}, ${selectedDay}`}</h2>
        <button type="button">Abrir agenda <CalendarDays size={17} /></button>
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
        {days.map(({ weekday, day, today }) => (
          <button
            key={day}
            type="button"
            className={`${today ? "is-today" : ""} ${selectedDay === day ? "active" : ""}`}
            aria-pressed={selectedDay === day}
            aria-label={`${weekday}, ${day} de setembro${today ? ", hoje" : ""}`}
            onClick={() => setSelectedDay(day)}
          >
            <span>{weekday}</span>
            <strong>{day}</strong>
          </button>
        ))}
      </div>

      <div className="lab-timeline-list">
        {visibleItems.map((item) => (
          <article key={item.id} className={`is-${item.state}`}>
            <time>{item.time}</time>
            <i>{item.state === "done" ? <Check size={14} /> : null}</i>
            <div>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
              <small>{item.service}</small>
            </div>
            {item.state === "now" ? <em>Agora</em> : null}
          </article>
        ))}
        {visibleItems.length === 0 ? <p className="lab-timeline-empty">Nenhuma atividade nesta categoria.</p> : null}
      </div>
    </article>
  );
}

type AgendaEvent = {
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

export function AgendaPreview() {
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [selectedDay, setSelectedDay] = useState(11);
  const [miniMonthOffset, setMiniMonthOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState<AgendaEvent[]>(initialAgendaEvents);
  const [completedEvents, setCompletedEvents] = useState<Set<number>>(() => new Set());
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [completedPriorities, setCompletedPriorities] = useState<Set<number>>(() => new Set());
  const [otherCalendarsOpen, setOtherCalendarsOpen] = useState(false);
  const [currentMinutes, setCurrentMinutes] = useState(12 * 60);
  const boardRef = useRef<HTMLDivElement>(null);
  const miniDate = new Date(2026, 8 + miniMonthOffset, 1);
  const daysInMiniMonth = new Date(miniDate.getFullYear(), miniDate.getMonth() + 1, 0).getDate();
  const miniLeadingDays = (miniDate.getDay() + 6) % 7;
  const miniDays = Array.from({ length: daysInMiniMonth }, (_, index) => index + 1);
  const weekStart = new Date(2026, 8, 7 + weekOffset * 7);
  const agendaWeek = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return { day: agendaDayNames[date.getDay()], date: date.getDate(), month: date.getMonth(), year: date.getFullYear(), today: date.getFullYear() === 2026 && date.getMonth() === 8 && date.getDate() === 11 };
  });
  const weekLabel = `${agendaMonthNames[agendaWeek[2].month]} ${agendaWeek[2].year}`;
  const currentTop = (currentMinutes / (24 * 60)) * 1536;
  const currentLabel = agendaTime(currentMinutes);
  const visibleDays = view === "day" ? [agendaWeek[4]] : agendaWeek;
  const visibleEvents = view === "day" ? events.filter((event) => event.column === 6) : events;
  const priorityEvents = events.filter((event) => event.priority === "Alta" && !completedPriorities.has(event.id));
  const monthEventCounts = events.reduce<Record<number, number>>((counts, event) => {
    const day = 5 + event.column;
    counts[day] = (counts[day] ?? 0) + 1;
    return counts;
  }, {});

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateCurrentTime();
    const timer = globalThis.setInterval(updateCurrentTime, 60000);
    return () => globalThis.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (view === "month" || weekOffset !== 0 || !boardRef.current) return;
    boardRef.current.scrollTop = Math.max(0, currentTop - 260);
  }, [currentTop, view, weekOffset]);

  const beginResize = (eventId: number, originalSlots: number, startY: number) => {
    const resize = (event: PointerEvent) => {
      const nextSlots = Math.max(1, Math.min(32, originalSlots + Math.round((event.clientY - startY) / 16)));
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
      setEvents((current) => current.map((item) => item.id === editingEvent.id ? { ...item, title: draft.title.trim() || item.title, priority: draft.priority, reminder: draft.reminder, repeat: draft.repeat, service: draft.service.trim() || item.service } : item));
    } else if (creatingEvent && draft.title.trim()) {
      const roundedStart = Math.floor(currentMinutes / 15) * 15;
      setEvents((current) => [...current, { id: Date.now(), column: 6, startMinutes: roundedStart, durationSlots: 4, daySpan: 1, tone: "blue", title: draft.title.trim(), person: "Novo cliente", initials: "NC", client: "Novo cliente", responsible: "Marina Costa", priority: draft.priority, reminder: draft.reminder, repeat: draft.repeat, service: draft.service.trim() || "Serviço não informado" }]);
    }
    closeEventModal();
  };

  return (
    <section className="lab-agenda-shell">
      <aside className="lab-agenda-sidebar">
        <div className="lab-mini-calendar">
          <header>
            <strong>{agendaMonthNames[miniDate.getMonth()]} {miniDate.getFullYear()}</strong>
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
              <footer><span className="lab-priority-avatar">{event.initials}</span><button type="button" onClick={() => setCompletedPriorities((current) => new Set(current).add(event.id))}><Check size={15} /> Concluir</button></footer>
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
          <button type="button" className="lab-create-activity" onClick={() => setCreatingEvent(true)}><Plus size={17} /> Adicionar</button>
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
              <div className={`lab-agenda-time-grid ${view === "day" ? "is-day" : ""}`}>
                {Array.from({ length: 24 }, (_, index) => <time key={index} style={{ gridRow: index * 4 + 1 }}>{String(index).padStart(2, "0")}:00</time>)}
                {visibleDays.map((item, index) => <i key={`column-line-${item.year}-${item.month}-${item.date}`} className="lab-agenda-column-line" style={{ gridColumn: index + 2, gridRow: "1 / -1" }} />)}
                {weekOffset === 0 ? <div className="lab-agenda-today-column" style={{ gridColumn: view === "day" ? 2 : 6, gridRow: "1 / -1" }} /> : null}
                {weekOffset === 0 ? <div className="lab-agenda-now-line" style={{ top: currentTop }}><span>{currentLabel}</span><i /></div> : null}
                {visibleEvents.map((event) => {
                  const eventColumn = view === "day" ? 2 : event.column;
                  const eventTime = `${agendaTime(event.startMinutes)} – ${agendaTime(event.startMinutes + event.durationSlots * 15)}`;
                  return (
                    <article key={event.id} className={`tone-${event.tone} ${event.durationSlots < 6 ? "is-compact" : ""} ${completedEvents.has(event.id) ? "is-complete" : ""}`} style={{ gridColumn: `${eventColumn} / span ${view === "day" ? 1 : event.daySpan}`, gridRow: `${Math.floor(event.startMinutes / 15) + 1} / span ${event.durationSlots}` }} onDoubleClick={() => setEditingEvent(event)}>
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
                      <strong>{event.title}</strong>
                      <span><Clock3 size={12} /> {eventTime}</span>
                      <footer><i>{event.initials}</i><small>{event.person}<em>{event.service}</em></small></footer>
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
      {editingEvent || creatingEvent ? (
        <div className="lab-agenda-modal" role="dialog" aria-modal="true" aria-label={editingEvent ? "Editar atividade" : "Adicionar à agenda"} onClick={closeEventModal}>
          <div onClick={(event) => event.stopPropagation()}><EventCardPreview heading={editingEvent ? "Editar atividade" : "Adicionar à agenda"} initialTitle={editingEvent?.title ?? ""} initialPriority={editingEvent?.priority} initialReminder={editingEvent?.reminder} initialRepeat={editingEvent?.repeat} initialService={editingEvent?.service} onClose={closeEventModal} onCancel={closeEventModal} onSave={saveEvent} onDelete={editingEvent ? () => { setEvents((current) => current.filter((item) => item.id !== editingEvent.id)); closeEventModal(); } : undefined} /></div>
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

function DocumentCardPreview() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lab-document-preview">
      <button type="button" className="lab-document-card" onClick={() => setOpen(true)} aria-label="Abrir Contrato de clareamento dental">
        <span><Folder size={48} fill="currentColor" /></span>
        <strong>Contrato de clareamento</strong>
        <small>PDF · Atualizado hoje</small>
      </button>
      {open ? (
        <div className="lab-document-modal" role="dialog" aria-modal="true" aria-label="Contrato de clareamento dental" onClick={() => setOpen(false)}>
          <article onClick={(event) => event.stopPropagation()}>
            <header><div><FileText size={19} /><span><strong>Contrato de clareamento</strong><small>Documento em PDF</small></span></div><button type="button" onClick={() => setOpen(false)} aria-label="Fechar documento"><X size={18} /></button></header>
            <div className="lab-document-sheet"><span>CONTRATO DE PRESTAÇÃO DE SERVIÇO</span><i /><i /><i /><i /><b>Assinatura do cliente</b></div>
            <footer><button type="button"><Pencil size={16} /> Editar</button><button type="button" className="primary"><Printer size={16} /> Imprimir</button></footer>
          </article>
        </div>
      ) : null}
    </div>
  );
}

function AiThinkingPreview() {
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

type CardTone = "blue" | "rose" | "amber" | "violet" | "teal" | "gray";

function InsightActionCardPreview({ tone, classification, title, description, action }: { tone: CardTone; classification: string; title: string; description: string; action: string }) {
  return (
    <article className={`lab-insight-action-card tone-${tone}`}>
      <div className="lab-insight-action-head">
        <span>{classification}</span>
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
      <button className="lab-insight-action-button" type="button">{action}</button>
    </article>
  );
}

function InformativeMetricCardPreview({ tone, icon: Icon, title, value, change }: { tone: CardTone; icon: LucideIcon; title: string; value: string; change: string }) {
  return (
    <article className={`lab-informative-card tone-${tone}`}>
      <header>
        <span className="lab-informative-icon"><Icon size={20} strokeWidth={1.9} /></span>
        <button type="button" aria-label={`Entender ${title.toLowerCase()}`} title={`${title} no período`}>i</button>
      </header>
      <div className="lab-informative-copy">
        <span>{title}</span>
        <strong>{value}</strong>
        <small><ArrowUp size={13} strokeWidth={2.4} /> {change}</small>
      </div>
    </article>
  );
}

export default function Laboratorio() {
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
      </div>
    </main>
  );
}
