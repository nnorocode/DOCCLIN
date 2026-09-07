"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  MapPin,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type Activity = {
  id: number;
  day: number;
  hour: number;
  duration: number;
  span: number;
  color: string;
  title: string;
  time: string;
  responsible: string;
  location: string;
  note: string;
  contactName?: string;
  contactInitials?: string;
  linkedSale?: string;
  status?: "scheduled" | "completed" | "cancelled";
};
const initialActivities: Activity[] = [
  {
    id: 1,
    day: 0,
    hour: 1,
    duration: 1,
    span: 1,
    color: "blue",
    title: "Reunião comercial",
    time: "09:00 – 10:00",
    responsible: "João Silva",
    location: "Sala 2",
    note: "Apresentação de proposta comercial.",
    contactName: "Ana Carolina",
    contactInitials: "AC",
    linkedSale: "Venda #VND-1278",
    status: "scheduled",
  },
  {
    id: 2,
    day: 1,
    hour: 3,
    duration: 1,
    span: 1,
    color: "green",
    title: "Visita técnica",
    time: "11:00 – 12:00",
    responsible: "Carlos Lima",
    location: "Instalação Alfa",
    note: "Visita de acompanhamento ao cliente.",
    contactName: "Alfa Instalações",
    contactInitials: "AI",
  },
  {
    id: 3,
    day: 2,
    hour: 2,
    duration: 1,
    span: 1,
    color: "purple",
    title: "Proposta comercial",
    time: "10:00 – 11:00",
    responsible: "Mariana Oliveira",
    location: "Online",
    note: "Envio e alinhamento de proposta.",
    contactName: "Vitta Clinic",
    contactInitials: "VC",
  },
  {
    id: 4,
    day: 3,
    hour: 1,
    duration: 1,
    span: 1,
    color: "orange",
    title: "Ligação de follow-up",
    time: "09:00 – 10:00",
    responsible: "João Silva",
    location: "Telefone",
    note: "Retorno comercial para oportunidade aberta.",
    contactName: "Bella Modas",
    contactInitials: "BM",
  },
  {
    id: 5,
    day: 4,
    hour: 6,
    duration: 2,
    span: 1,
    color: "blue",
    title: "Reunião de equipe",
    time: "14:00 – 15:30",
    responsible: "Mariana Oliveira",
    location: "Sala 1",
    note: "Planejamento semanal da equipe.",
    contactName: "Equipe comercial",
    contactInitials: "EC",
  },
];
const times = [
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
];
const days = [
  "Seg 26",
  "Ter 27",
  "Qua 28",
  "Qui 29",
  "Sex 30",
  "Sáb 31",
  "Dom 1",
];
const months2025 = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function AgendaExperience() {
  const [activities, setActivities] = useState(initialActivities);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [form, setForm] = useState<{
    activity?: Activity;
    day?: number;
    hour?: number;
  } | null>(null);
  // No protótipo, a atividade das 09:00 simula uma automação detectada ao abrir a Agenda.
  const [review, setReview] = useState(true);
  const [dragged, setDragged] = useState<number | null>(null);
  const [mode, setMode] = useState<"Semanal" | "Mensal" | "Anual">("Semanal");
  const [selectedDate, setSelectedDate] = useState(26);
  const [selectedMonth, setSelectedMonth] = useState(4);
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [confirmation, setConfirmation] = useState(true);
  const [waitlist, setWaitlist] = useState(true);
  const [notice, setNotice] = useState("");
  // A agenda usa uma data demonstrativa; por isso o horário atual também é simulado.
  const currentMinutes = 9 * 60 + 32;
  const calendarStart = 8 * 60;
  const calendarEnd = 18 * 60;
  const currentTimeTop = 38 + ((currentMinutes - calendarStart) / (calendarEnd - calendarStart)) * 622;
  const currentTimeLabel = "09:32";
  const currentDayIndex = 3;
  const moveActivity = (id: number, day: number, hour: number) =>
    setActivities((previous) =>
      previous.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              day,
              hour,
              time: `${times[hour]} – ${times[Math.min(hour + activity.duration, times.length - 1)]}`,
            }
          : activity,
      ),
    );
  const startResize = (
    event: React.PointerEvent,
    id: number,
    axis: "horizontal" | "vertical",
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX,
      startY = event.clientY;
    const current = activities.find((activity) => activity.id === id);
    if (!current) return;
    const move = (pointer: PointerEvent) => {
      const units =
        axis === "horizontal"
          ? Math.round((pointer.clientX - startX) / 120)
          : Math.round((pointer.clientY - startY) / 58);
      setActivities((previous) =>
        previous.map((activity) =>
          activity.id === id
            ? {
                ...activity,
                [axis === "horizontal" ? "span" : "duration"]: Math.max(
                  1,
                  Math.min(
                    axis === "horizontal"
                      ? 7 - activity.day
                      : times.length - activity.hour,
                    current[axis === "horizontal" ? "span" : "duration"] +
                      units,
                  ),
                ),
              }
            : activity,
        ),
      );
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };
  const save = (activity: Activity) => {
    setActivities((previous) =>
      previous.some((item) => item.id === activity.id)
        ? previous.map((item) => (item.id === activity.id ? activity : item))
        : [...previous, activity],
    );
    setForm(null);
    setSelected(activity);
  };
  const reviewActivity = activities.find((activity) => activity.id === 1);
  const resolveReview = (action: "completed" | "cancelled" | "postponed" | "deleted", date?: string, time?: string) => {
    if (!reviewActivity) return setReview(false);
    if (action === "deleted") {
      setActivities((items) => items.filter((item) => item.id !== reviewActivity.id));
    } else if (action === "postponed") {
      const newDate = date ? new Date(`${date}T12:00:00`) : null;
      const newDay = newDate ? Math.max(0, Math.min(6, newDate.getDate() - 26)) : reviewActivity.day;
      const requestedHour = Number(time?.split(":")[0]);
      const newHour = Number.isFinite(requestedHour) ? Math.max(0, Math.min(times.length - 1, requestedHour - 8)) : reviewActivity.hour;
      moveActivity(reviewActivity.id, newDay, newHour);
      setNotice("Atividade postergada e agenda atualizada.");
    } else {
      setActivities((items) => items.map((item) => item.id === reviewActivity.id ? { ...item, status: action } : item));
      setNotice(action === "completed" ? "Atividade confirmada como concluída." : "Atividade cancelada e mantida na agenda.");
    }
    setReview(false);
  };
  return (
    <>
      <div className="v2-intro">
        <h1>Agenda</h1>
        <p>Acompanhe seus compromissos, reuniões e atividades da semana.</p>
      </div>
      <div className="v2-agenda-tools">
        <div className="v2-segment">
          {(["Semanal", "Mensal", "Anual"] as const).map((item) => (
            <button
              key={item}
              className={mode === item ? "selected" : ""}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <span />
        <button
          className="v2-primary"
          onClick={() => setForm({ day: 0, hour: 1 })}
        >
          <Plus size={17} />
          Nova atividade
        </button>
      </div>
      {notice && <div className="v2-agenda-notice">{notice}</div>}
      <div className="v2-agenda-layout">
        <aside className="v2-agenda-left">
          <MiniCalendar
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            activities={activities}
            onSelect={(date) => {
              setSelectedDate(date);
              setMode("Semanal");
            }}
            onMonthChange={setSelectedMonth}
          />
          <section className="v2-card v2-booking">
            <span>AGENDAMENTO ONLINE</span>
            <h3>Capte fora do horário</h3>
            <p>
              {bookingEnabled
                ? "Link público ativo para serviços e horários disponíveis."
                : "O agendamento público está pausado."}
            </p>
            <button
              onClick={() => {
                setBookingEnabled((value) => !value);
                setNotice(
                  bookingEnabled
                    ? "Link público pausado."
                    : "Link público ativado.",
                );
              }}
            >
              {bookingEnabled ? "Link publicado" : "Publicar link"}
            </button>
            <label>
              <input
                type="checkbox"
                checked={confirmation}
                onChange={(event) => setConfirmation(event.target.checked)}
              />{" "}
              Confirmação e lembrete
            </label>
            <label>
              <input
                type="checkbox"
                checked={waitlist}
                onChange={(event) => setWaitlist(event.target.checked)}
              />{" "}
              Lista de espera
            </label>
          </section>
        </aside>
        {mode === "Semanal" ? (
          <section className="v2-calendar v2-card">
            <header>
              <h2>
                {selectedDate} de {months2025[selectedMonth].toLowerCase()} de
                2025
              </h2>
              <small>
                Arraste, redimensione ou dê duplo clique para criar.
              </small>
            </header>
            <div className="v2-calendar-grid">
              <div className="v2-times">
                <span />
                <span className="v2-current-time-label" style={{ top: `${currentTimeTop}px` }}>{currentTimeLabel}</span>
                {times.map((time) => (
                  <span key={time}>{time}</span>
                ))}
              </div>
              {days.map((day, dayIndex) => (
                <div className="v2-day" key={day}>
                  <b className={dayIndex === currentDayIndex ? "today" : ""}>
                    {day}
                  </b>
                  {dayIndex === currentDayIndex && (
                    <div className="v2-current-time-line" style={{ top: `${currentTimeTop}px` }} aria-label={`Horário atual: ${currentTimeLabel}`}>
                    </div>
                  )}
                  {times.map((_, hour) => (
                    <div
                      className="v2-hour"
                      key={hour}
                      onDoubleClick={() => setForm({ day: dayIndex, hour })}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() =>
                        dragged !== null &&
                        moveActivity(dragged, dayIndex, hour)
                      }
                    >
                      {activities
                        .filter(
                          (activity) =>
                            activity.day === dayIndex && activity.hour === hour,
                        )
                        .map((activity) => (
                          <article
                            key={activity.id}
                            draggable
                            onDragStart={() => setDragged(activity.id)}
                            onClick={() => setSelected(activity)}
                            className={`v2-event v2-stripe-event ${activity.color} ${activity.status ?? "scheduled"}`}
                            style={{
                              height: `calc(${activity.duration * 100}% - 10px)`,
                              width: `calc(${activity.span * 100}% - 10px)`,
                            }}
                          >
                            <strong>{activity.title}</strong>
                            <span className="v2-event-person"><i>{activity.contactInitials ?? activity.responsible.split(" ").map((part) => part[0]).join("").slice(0, 2)}</i><b>{activity.contactName ?? activity.responsible}</b></span>
                            {activity.status === "completed" && <em className="v2-event-status completed"><CheckCircle2 size={12} />Concluída</em>}
                            {activity.status === "cancelled" && <em className="v2-event-status cancelled">Cancelada</em>}
                            <div className="v2-event-popover">
                              <b>{activity.title}</b>
                              <span>
                                <Clock3 size={13} />
                                {activity.time}
                              </span>
                              <span>
                                <MapPin size={13} />
                                {activity.location}
                              </span>
                              <span>
                                <UserRound size={13} />
                                {activity.responsible}
                              </span>
                              <small>{activity.note}</small>
                            </div>
                            <i
                              className="v2-resize-x"
                              onPointerDown={(event) =>
                                startResize(event, activity.id, "horizontal")
                              }
                            />
                            <i
                              className="v2-resize-y"
                              onPointerDown={(event) =>
                                startResize(event, activity.id, "vertical")
                              }
                            />
                          </article>
                        ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : (
          <AgendaOverview
            mode={mode}
            activities={activities}
            onCreate={() => setForm({ day: 0, hour: 1 })}
            onSelect={setSelected}
          />
        )}{" "}
        {selected && (
          <aside className="v2-activity-detail v2-card">
            <button className="close" onClick={() => setSelected(null)}>
              <X />
            </button>
            <span>DETALHES DA ATIVIDADE</span>
            <h2>{selected.title}</h2>
            <dl>
              <dt>
                <Clock3 size={15} />
                Data e hora
              </dt>
              <dd>
                26/05/2025
                <br />
                {selected.time}
              </dd>
              <dt>
                <MapPin size={15} />
                Local
              </dt>
              <dd>{selected.location}</dd>
              <dt>
                <UserRound size={15} />
                Responsável
              </dt>
              <dd>{selected.responsible}</dd>
              <dt>Descrição</dt>
              <dd>{selected.note}</dd>
            </dl>
            <footer>
              <button onClick={() => setForm({ activity: selected })}>
                <Edit3 size={16} />
                Editar
              </button>
              <button
                className="danger"
                onClick={() => {
                  setActivities((items) =>
                    items.filter((item) => item.id !== selected.id),
                  );
                  setSelected(null);
                }}
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </footer>
          </aside>
        )}
      </div>
      {form && (
        <ActivityForm
          seed={form.activity}
          day={form.day}
          hour={form.hour}
          onClose={() => setForm(null)}
          onSave={save}
        />
      )}{" "}
      {review && reviewActivity && <AutomationReview activity={reviewActivity} onClose={() => setReview(false)} onResolve={resolveReview} />}
    </>
  );
}

function MiniCalendar({
  selectedDate,
  selectedMonth,
  activities,
  onSelect,
  onMonthChange,
}: {
  selectedDate: number;
  selectedMonth: number;
  activities: Activity[];
  onSelect: (date: number) => void;
  onMonthChange: (month: number) => void;
}) {
  // Grade com seis semanas fixas: evita que o card mude de altura ou selecione dias de outro mês.
  const firstWeekDay = new Date(2025, selectedMonth, 1).getDay();
  const daysInMonth = new Date(2025, selectedMonth + 1, 0).getDate();
  const cells = Array.from(
    { length: 42 },
    (_, index) => index - firstWeekDay + 1,
  );
  return (
    <article className="v2-card v2-mini-month">
      <header>
        <select
          value={selectedMonth}
          onChange={(event) => onMonthChange(Number(event.target.value))}
        >
          {months2025.map((item, index) => (
            <option key={item} value={index}>
              {item} 2025
            </option>
          ))}
        </select>
      </header>
      <div>
        {["D", "S", "T", "Q", "Q", "S", "S", ...cells].map((date, index) => {
          const number = typeof date === "number" ? date : 0;
          const isHeader = index < 7;
          const isOutside = number < 1 || number > daysInMonth;
          const hasActivity =
            selectedMonth === 4 &&
            !isOutside &&
            number >= 26 &&
            activities.some((item) => item.day === number - 26);
          const firstActivity = hasActivity
            ? activities.find((item) => item.day === number - 26)
            : undefined;
          return (
            <button
              type="button"
              disabled={!isHeader && isOutside}
              className={`${selectedMonth === 4 && number === selectedDate && !isOutside ? "chosen" : ""} ${hasActivity ? "has-activity" : ""} ${isOutside && !isHeader ? "outside" : ""} ${isHeader ? "week-label" : ""}`}
              key={`${selectedMonth}-${index}`}
              onClick={() => number && !isOutside && onSelect(number)}
            >
              {date}
              {hasActivity && <i className={firstActivity?.color} />}
            </button>
          );
        })}
      </div>
    </article>
  );
}
function AgendaOverview({
  mode,
  activities,
  onCreate,
  onSelect,
}: {
  mode: "Mensal" | "Anual";
  activities: Activity[];
  onCreate: () => void;
  onSelect: (activity: Activity) => void;
}) {
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return (
    <section className="v2-card v2-agenda-overview">
      <header>
        <h2>{mode === "Mensal" ? "Maio 2025" : "Agenda anual 2025"}</h2>
        <small>Duplo clique para criar uma atividade.</small>
      </header>
      {mode === "Mensal" ? (
        <div className="v2-month-grid">
          {Array.from({ length: 35 }, (_, index) => {
            const day = index - 3;
            return (
              <button
                key={index}
                onDoubleClick={onCreate}
                className={day === 26 ? "today" : ""}
              >
                <b>{day > 0 && day <= 31 ? day : ""}</b>
                {activities
                  .filter((item) => item.day === Math.max(0, day - 26))
                  .slice(0, 2)
                  .map((item) => (
                    <span
                      key={item.id}
                      className={item.color}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(item);
                      }}
                    >
                      {item.title}
                    </span>
                  ))}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="v2-year-grid">
          {months.map((month, index) => (
            <button key={month} onClick={onCreate}>
              <b>{month}</b>
              <span>{index === 4 ? "8 atividades" : "0 atividades"}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
function ActivityForm({
  seed,
  day = 0,
  hour = 1,
  onClose,
  onSave,
}: {
  seed?: Activity;
  day?: number;
  hour?: number;
  onClose: () => void;
  onSave: (activity: Activity) => void;
}) {
  const [title, setTitle] = useState(seed?.title ?? "");
  const [color, setColor] = useState(seed?.color ?? "blue");
  const [linkedSale, setLinkedSale] = useState(seed?.linkedSale ?? "Não vinculada");
  return (
    <aside className="v2-record-drawer">
      <form
        className="v2-dialog v2-activity-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            id: seed?.id ?? Date.now(),
            day: seed?.day ?? day,
            hour: seed?.hour ?? hour,
            duration: seed?.duration ?? 1,
            span: seed?.span ?? 1,
            color,
            title,
            time:
              seed?.time ?? `${times[hour]} – ${times[Math.min(hour + 1, 9)]}`,
            responsible: seed?.responsible ?? "Mariana Oliveira",
            location: seed?.location ?? "A definir",
            note: seed?.note ?? "Atividade criada pela agenda.",
            linkedSale: linkedSale === "Não vinculada" ? undefined : linkedSale,
            status: seed?.status ?? "scheduled",
          });
        }}
      >
        <button type="button" className="close" onClick={onClose}>
          <X />
        </button>
        <small>{seed ? "EDITAR ATIVIDADE" : "NOVA ATIVIDADE"}</small>
        <h2>{seed ? "Editar agenda" : "Criar atividade"}</h2>
        <div>
          <label>
            Título *
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Reunião comercial"
            />
          </label>
          <label>
            Dia *
            <select defaultValue={seed?.day ?? day}>
              {days.map((item, index) => (
                <option key={item} value={index}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Hora *
            <select defaultValue={seed?.hour ?? hour}>
              {times.map((item, index) => (
                <option key={item} value={index}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cor da etiqueta
            <select
              value={color}
              onChange={(event) => setColor(event.target.value)}
            >
              {["blue", "green", "purple", "orange", "red"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Local
            <input defaultValue={seed?.location ?? ""} placeholder="Opcional" />
          </label>
          <label>
            Responsável
            <select defaultValue={seed?.responsible ?? "Mariana Oliveira"}>
              <option>Mariana Oliveira</option>
              <option>João Silva</option>
              <option>Carlos Lima</option>
            </select>
          </label>
          <label>
            Venda relacionada
            <select value={linkedSale} onChange={(event) => setLinkedSale(event.target.value)}>
              <option>Não vinculada</option>
              <option>Venda #VND-1278</option>
              <option>Venda #VND-1264</option>
            </select>
          </label>
        </div>
        <footer>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="v2-primary" type="submit">
            Salvar atividade
          </button>
        </footer>
      </form>
    </aside>
  );
}
function AutomationReview({ activity, onClose, onResolve }: { activity: Activity; onClose: () => void; onResolve: (action: "completed" | "cancelled" | "postponed" | "deleted", date?: string, time?: string) => void }) {
  const [postponing, setPostponing] = useState(false);
  const [newDate, setNewDate] = useState("2025-05-29");
  const [newTime, setNewTime] = useState("10:00");
  return (
    <aside className="v2-record-drawer">
      <section className="v2-dialog v2-review">
        <button className="close" onClick={onClose}>
          <X />
        </button>
        <small>CONFIRMAÇÃO DE ATIVIDADE</small>
        <h2>{activity.title}</h2>
        <p>
          A atividade <b>{activity.title}</b>{activity.linkedSale ? <> está relacionada à <b>{activity.linkedSale}</b>. Ao confirmar a conclusão, o histórico da venda também será atualizado.</> : <> não está relacionada a nenhuma venda e atualizará somente a agenda.</>}
        </p>
        <article className="v2-review-summary">
          <Clock3 size={18} />
          <div><b>{activity.time}</b><span>{activity.responsible} · {activity.location}</span></div>
        </article>
        <h3>O que aconteceu com esta atividade?</h3>
        <div className="v2-review-actions">
          <button className="completed" onClick={() => onResolve("completed")}><CheckCircle2 size={16} />Aconteceu</button>
          <button className="cancelled" onClick={() => onResolve("cancelled")}><X size={16} />Foi cancelada</button>
          <button className="postponed" onClick={() => setPostponing(true)}><Clock3 size={16} />Postergar</button>
          <button className="deleted" onClick={() => onResolve("deleted")}><Trash2 size={16} />Excluir</button>
        </div>
        {postponing && <div className="v2-postpone-fields"><label>Nova data<input type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} /></label><label>Novo horário<input type="time" value={newTime} onChange={(event) => setNewTime(event.target.value)} /></label><button className="v2-primary" onClick={() => onResolve("postponed", newDate, newTime)}>Confirmar novo horário</button></div>}
        <footer><button onClick={onClose}>Decidir depois</button></footer>
      </section>
    </aside>
  );
}
