"use client";
import { appStorage } from "../../lib/local-store";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import InfoHint from "./InfoHint";
import { InformativeMetricCardPreview } from "../laboratorio/page";
import {
  CircleDollarSign,
  Check,
  ChevronDown,
  Edit3,
  Grid2X2,
  GripVertical,
  List,
  ListFilter,
  Medal,
  Plus,
  Search,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

type Client = {
  id: string;
  initials: string;
  name: string;
  email: string;
  type: string;
  contact: string;
  relative: string;
  total: string;
  status: string;
  source: string;
  birthday?: string;
  photo?: string;
};

export function StandardModuleTop({ title, help, action, beforeCards, children }: { title: string; help: string; action?: ReactNode; beforeCards?: ReactNode; children: ReactNode }) {
  return (
    <>
      <div className={`v2-intro client-compact-intro${action ? " has-action" : ""}`}>
        <h1>
          {title}
          <InfoHint text={help} />
        </h1>
        {action ? <div className="module-title-action">{action}</div> : null}
      </div>
      {beforeCards}
      <section className="v2-metrics client-metrics client-overview-metrics">
        {children}
      </section>
    </>
  );
}

const initial: Client[] = [
  {
    id: "1248",
    initials: "AC",
    name: "Ana Carolina Souza",
    email: "ana.souza@email.com.br",
    type: "Pessoa Física",
    contact: "23/05/2025",
    relative: "Há 2 dias",
    total: "R$ 18.750,00",
    status: "Ativo",
    source: "Indicação",
    birthday: "1991-05-12",
  },
  {
    id: "1247",
    initials: "MP",
    name: "Marcos Pereira",
    email: "marcos.pereira@email.com.br",
    type: "Pessoa Física",
    contact: "21/05/2025",
    relative: "Há 4 dias",
    total: "R$ 7.250,00",
    status: "Ativo",
    source: "Instagram",
    birthday: "1988-11-03",
  },
  {
    id: "1246",
    initials: "LF",
    name: "Lojas Fênix Ltda.",
    email: "contato@lojasfenix.com.br",
    type: "Pessoa Jurídica",
    contact: "16/05/2025",
    relative: "Há 9 dias",
    total: "R$ 56.430,00",
    status: "Ativo",
    source: "Google",
    birthday: "1982-02-19",
  },
  {
    id: "1245",
    initials: "JB",
    name: "Juliana Batista",
    email: "juliana.batista@email.com.br",
    type: "Pessoa Física",
    contact: "14/05/2025",
    relative: "Há 11 dias",
    total: "R$ 3.980,00",
    status: "Inativo",
    source: "WhatsApp",
    birthday: "1995-07-26",
  },
  {
    id: "1244",
    initials: "TC",
    name: "TechConnect Soluções Ltda.",
    email: "comercial@techconnect.com.br",
    type: "Pessoa Jurídica",
    contact: "12/05/2025",
    relative: "Há 13 dias",
    total: "R$ 89.300,00",
    status: "Ativo",
    source: "Indicação",
    birthday: "1986-12-08",
  },
  {
    id: "1243",
    initials: "RP",
    name: "Roberto Pinheiro",
    email: "roberto.pinheiro@email.com.br",
    type: "Pessoa Física",
    contact: "08/05/2025",
    relative: "Há 17 dias",
    total: "R$ 2.150,00",
    status: "Inativo",
    source: "Instagram",
    birthday: "1979-04-14",
  },
];

const currencyToNumber = (value: string) =>
  Number(value.replace(/[^\d,]/g, "").replace(",", "."));

function clientRanking(rows: Client[], clientId: string) {
  const position =
    [...rows]
      .sort((a, b) => currencyToNumber(b.total) - currencyToNumber(a.total))
      .findIndex((client) => client.id === clientId) + 1;

  const tier =
    position === 1
      ? "diamond"
      : position <= 3
        ? "gold"
        : position <= 5
          ? "silver"
          : "bronze";

  return {
    position,
    tier,
    label:
      tier === "diamond"
        ? "Diamante"
        : tier === "gold"
          ? "Ouro"
          : tier === "silver"
            ? "Prata"
            : "Bronze",
  };
}

export default function ClientsExperience({
  onDetails, onAnamnesis,
}: {
  onDetails: (record: string[]) => void;
  onAnamnesis?: (id:string,name:string)=>void;
}) {
  const [rows, setRows] = useState<Client[]>(initial);
  const [rowsLoaded, setRowsLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Mais recentes");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [panel, setPanel] = useState<Client | null | "new">(null);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    const openNewClient = () => setPanel("new");
    window.addEventListener("gest:create-client", openNewClient);
    return () => window.removeEventListener("gest:create-client", openNewClient);
  }, []);
  useEffect(() => { try { const saved = JSON.parse(appStorage.getItem("gest-clients") || "null"); if (Array.isArray(saved)) setRows(saved.filter((row): row is Client => row && ["id","initials","name","email","type","contact","relative","total","status","source"].every((key) => typeof row[key] === "string"))); } catch { /* Use the sample client list. */ } finally { setRowsLoaded(true); } }, []);
  useEffect(() => { if (rowsLoaded) { try { appStorage.setItem("gest-clients", JSON.stringify(rows)); } catch { /* Keep the client list available for this visit. */ } } }, [rows, rowsLoaded]);

  const filtered = useMemo(
    () =>
      [...rows]
        .filter((client) =>
          `${client.name} ${client.email}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .filter((client) => statusFilter === "Todos" || client.status === statusFilter)
        .filter((client) => typeFilter === "Todos" || client.type === typeFilter)
        .sort((a, b) =>
          sort === "A–Z"
            ? a.name.localeCompare(b.name)
            : sort === "Z–A"
              ? b.name.localeCompare(a.name)
              : sort === "Maior valor"
                ? currencyToNumber(b.total) - currencyToNumber(a.total)
                : sort === "Menor valor"
                  ? currencyToNumber(a.total) - currencyToNumber(b.total)
                  : 0,
        ),
    [rows, query, sort, statusFilter, typeFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const visibleClients = filtered.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, sort, statusFilter, typeFilter, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const save = (client: Client) => {
    setRows((current) =>
      panel === "new"
        ? [client, ...current]
        : current.map((item) => (item.id === client.id ? client : item)),
    );
    setPanel(null);
    window.dispatchEvent(new CustomEvent("gest-app-toast", { detail: panel === "new" ? "Cliente cadastrado com sucesso." : "Cliente atualizado com sucesso." }));
  };

  return (
    <>
      <StandardModuleTop title="Clientes" help="Gerencie e acompanhe seus clientes e seu relacionamento.">
        <Metric
          label="Total de clientes"
          value="1.248"
          detail="7,2%"
          tone="blue"
        />
        <Metric
          label="Clientes ativos"
          value="1.047"
          detail="6,8%"
          tone="teal"
        />
        <Metric
          label="Clientes inativos"
          value="201"
          detail="4,1%"
          tone="rose"
        />
        <Metric
          label="Ticket médio"
          value="R$ 3.842,60"
          detail="9,5%"
          tone="violet"
        />
      </StandardModuleTop>

      <article className="v2-card v2-client-table v2-ranked-client-table">
        <header>
          <div className="lab-search-form client-local-search">
            <Search size={19} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar clientes por nome, e-mail ou telefone..."
            />
            <button type="button" className={query ? "visible" : ""} onClick={() => setQuery("")} aria-label="Limpar busca"><X size={16} /></button>
          </div>
          <ClientSelect label="Status" value={statusFilter} onChange={setStatusFilter} showDot options={["Todos", "Ativo", "Inativo"]} />
          <ClientSelect label="Tipo" value={typeFilter} onChange={setTypeFilter} options={["Todos", "Pessoa Física", "Pessoa Jurídica"]} />
          <ClientSelect label="Ordenar por" value={sort} onChange={setSort} options={["Mais recentes", "Mais antigos", "A–Z", "Z–A", "Maior valor", "Menor valor"]} />
          <button className="lab-create-activity" onClick={() => setPanel("new")}>
            <Plus size={17} />
            Cadastrar cliente
          </button>
          <div className="client-view-toggle" role="group" aria-label="Visualização dos clientes">
            <button type="button" className={viewMode === "list" ? "active" : ""} aria-label="Visualizar em lista" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}>
              <List size={18} />
            </button>
            <button type="button" className={viewMode === "grid" ? "active" : ""} aria-label="Visualizar em grade" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}>
              <Grid2X2 size={17} />
            </button>
          </div>
        </header>

        {viewMode === "list" ? <table>
          <thead>
            <tr>
              {[
                "Nº",
                "Ranking",
                "Cliente",
                "Tipo",
                "Último contato",
                "Total vendido",
                "Status",
                "Ações",
              ].map((item) => (
                <th key={item} className={item==="Ações"?"client-actions-heading":undefined}>{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleClients.map((client, index) => {
              const rank = clientRanking(rows, client.id);

              return (
                <tr key={client.id}>
                  <td>{pageStart + index + 1}</td>
                  <td>
                    <span className={`client-rank-badge ${rank.tier}`}>
                      <Medal size={13} strokeWidth={2} />
                      #{rank.position}
                    </span>
                  </td>
                  <td>
                    <i className="initials">{client.photo ? <img src={client.photo} alt={`Foto de ${client.name}`} /> : client.initials}</i>
                    <div>
                      <strong>{client.name}</strong>
                      <small>{client.email}</small>
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        client.type === "Pessoa Jurídica" ? "type legal" : "type"
                      }
                    >
                      {client.type}
                    </span>
                  </td>
                  <td>
                    <strong>{client.contact}</strong>
                    <small>{client.relative}</small>
                  </td>
                  <td>{client.total}</td>
                  <td>
                    <span
                      className={
                        client.status === "Ativo"
                          ? "status active"
                          : "status inactive"
                      }
                    >
                      ●　{client.status}
                    </span>
                  </td>
                  <td className="client-actions-cell">
                    {onAnamnesis&&<button type="button" className="lab-create-activity client-details-action" onClick={()=>onAnamnesis(client.id,client.name)}>Anamnese</button>}
                    <button
                      type="button"
                      className="lab-create-activity client-details-action"
                      onClick={() =>
                        onDetails([
                          String(pageStart + index + 1),
                          client.name,
                          client.type,
                          client.contact,
                          client.total,
                          client.status,
                          client.birthday ? new Date(`${client.birthday}T12:00:00`).toLocaleDateString("pt-BR") : "",
                          client.id,
                        ])
                      }
                    >
                      Ver detalhes
                    </button>
                    <button
                      className="v2-icon-button"
                      title="Editar cliente" aria-label="Editar cliente"
                      onClick={() => setPanel(client)}
                    >
                      <Edit3 size={17} />
                    </button>
                    <button
                      className="v2-icon-button"
                      title="Reordenar cliente" aria-label="Reordenar cliente"
                    >
                      <ListFilter size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table> : (
          <section className="client-card-grid" aria-label="Clientes em grade">
            {visibleClients.map((client, index) => (
              <ClientGridCard
                key={client.id}
                client={client}
                rank={clientRanking(rows, client.id)}
                tone={(["peach", "gray", "blue"] as const)[index % 3]}
                onDetails={() => onDetails([
                  String(pageStart + index + 1),
                  client.name,
                  client.type,
                  client.contact,
                  client.total,
                  client.status,
                  client.birthday ? new Date(`${client.birthday}T12:00:00`).toLocaleDateString("pt-BR") : "",
                  client.id,
                ])}
                onAnamnesis={onAnamnesis?()=>onAnamnesis(client.id,client.name):undefined}
                onEdit={() => setPanel(client)}
              />
            ))}
          </section>
        )}

        <footer>
          <ClientSelect compact label="Mostrar por página" value={String(pageSize)} onChange={(value) => setPageSize(Number(value))} options={["5", "10", "25", "50", "100"]} />
          <span>Mostrando {filtered.length ? pageStart + 1 : 0} a {Math.min(filtered.length, pageStart + pageSize)} de {filtered.length} clientes</span>
          <div className="pagination">
            <button type="button" aria-label="Página anterior" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>‹</button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                type="button"
                key={page}
                className={page === currentPage ? "active" : ""}
                aria-current={page === currentPage ? "page" : undefined}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button type="button" aria-label="Próxima página" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>›</button>
          </div>
        </footer>
      </article>

      {panel && (
        <ClientForm
          client={panel === "new" ? undefined : panel}
          onClose={() => setPanel(null)}
          onSave={save}
        />
      )}
    </>
  );
}

function Metric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "rose" | "amber" | "violet" | "teal" | "gray";
}) {
  const Icon = label.includes("inativos")
    ? UserRound
    : label.includes("ativos")
      ? UserCheck
      : label.includes("Ticket")
        ? CircleDollarSign
        : Users;

  return <InformativeMetricCardPreview tone={tone} icon={Icon} title={label} value={value} change={detail} />;
}

export function ClientSelect({ label, value, onChange, options, showDot = false, compact = false, hideLabel = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  showDot?: boolean;
  compact?: boolean;
  hideLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const statusDotClass = (option: string) => {
    const normalized = option.toLocaleLowerCase("pt-BR");
    if (/ativo|aprovad|paga|pago|recebid|resolvid|conclu|convertid|normal|enviad|em dia/.test(normalized) && !normalized.includes("inativo")) return "green";
    if (/inativo|cancelad|rejeitad|crítico|critico|atrasad|sem estoque|urgente|vencid/.test(normalized)) return "rose";
    if (/pendente|aguardando|em atendimento|andamento|agendad|atenção|atencao|proposta/.test(normalized)) return "amber";
    if (/novo|aberto|execução|execucao/.test(normalized)) return "blue";
    return "gray";
  };
  const dotClass = statusDotClass(value);

  return (
    <div className={compact ? "client-select compact" : "client-select"} ref={rootRef}>
      {hideLabel ? null : <label>{label}</label>}
      <div className="lab-select">
        <button type="button" className="lab-select-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          {showDot ? <i className={`client-select-dot ${dotClass}`} /> : null}
          <span>{value}</span>
          <ChevronDown size={16} className={open ? "open" : ""} />
        </button>
        {open ? (
          <div className="lab-select-menu" role="listbox" aria-label={label} onWheel={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()}>
            {options.map((option) => (
              <button type="button" role="option" aria-selected={value === option} key={option} onClick={() => { onChange(option); setOpen(false); }}>
                {showDot ? <i className={`client-select-dot ${statusDotClass(option)}`} /> : null}
                <span>{option}</span>
                {value === option ? <Check size={15} /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ClientGridCard({ client, rank, tone, onDetails, onEdit, onAnamnesis }: {
  client: Client;
  rank: ReturnType<typeof clientRanking>;
  tone: "peach" | "gray" | "blue";
  onDetails: () => void;
  onAnamnesis?:()=>void;
  onEdit: () => void;
}) {
  return (
    <article className={`client-grid-card is-${tone}`}>
      <div className="client-grid-profile">
        <div className="client-grid-avatar">
          {client.photo ? <img src={client.photo} alt={`Foto de ${client.name}`} /> : <span>{client.initials}</span>}
          <i className={client.status === "Ativo" ? "active" : ""} aria-hidden />
        </div>
        <h2>{client.name}</h2>
        <p>{client.email}</p>
      </div>
      <div className="client-grid-facts">
        <div><small>Tipo</small><strong>{client.type === "Pessoa Jurídica" ? "PJ" : "PF"}</strong></div>
        <div><small>Último contato</small><strong>{client.contact}</strong></div>
        <div><small>Total vendido</small><strong>{client.total}</strong></div>
        <div><small>Status</small><strong className="client-grid-status"><i /> {client.status}</strong></div>
        <div><small>Ranking</small><strong>{rank.label} · {rank.position}º</strong></div>
        <div><small>Retorno</small><strong>{client.status === "Ativo" ? "18 set, 10:00" : "A definir"}</strong></div>
      </div>
      <footer>
        {onAnamnesis&&<button type="button" className="lab-create-activity client-details-action" onClick={onAnamnesis}>Anamnese</button>}
        <button type="button" className="lab-create-activity client-details-action" onClick={onDetails}>Ver detalhes</button>
        <button type="button" title="Editar cliente" aria-label="Editar cliente" onClick={onEdit}><Edit3 size={17} /></button>
        <button type="button" title="Organizar posição" aria-label="Organizar posição"><GripVertical size={18} /></button>
      </footer>
    </article>
  );
}

function ClientForm({
  client,
  onClose,
  onSave,
}: {
  client?: Client;
  onClose: () => void;
  onSave: (client: Client) => void;
}) {
  const [name, setName] = useState(client?.name ?? "");
  const [photo, setPhoto] = useState(client?.photo ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [type, setType] = useState(client?.type ?? "Pessoa Física");
  const [source, setSource] = useState(client?.source ?? "Indicação");
  const [status, setStatus] = useState(client?.status ?? "Ativo");
  const [birthday, setBirthday] = useState(client?.birthday ?? "");

  return (
    <aside className="v2-record-drawer client-form-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form
        className="v2-dialog v2-client-form"
        onSubmit={(event) => {
          event.preventDefault();
          const initials = name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          onSave({
            id: client?.id ?? String(Date.now()).slice(-4),
            initials,
            name,
            email: email || "cliente@email.com.br",
            type,
            contact: client?.contact ?? "Hoje",
            relative: "Agora",
            total: client?.total ?? "R$ 0,00",
            status,
            source,
            birthday,
            photo,
          });
        }}
      >
        <button type="button" className="close" onClick={onClose}>
          <X />
        </button>
        <small>CLIENTES</small>
        <h2>{client ? "Editar cliente" : "Cadastrar cliente"}</h2>
        <p className="client-form-description">Preencha as informações principais para manter o relacionamento organizado.</p>
        <label className="client-photo-upload">
          <i className="initials">{photo ? <img src={photo} alt="Prévia da foto" /> : (name || "CL").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</i>
          <span>Foto do cliente<small>Opcional. O nome continua visível quando não houver foto.</small></span>
          <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) setPhoto(URL.createObjectURL(file)); }} />
        </label>
        <div>
          <label>
            Nome ou razão social *
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Bella Café"
            />
          </label>
          <label>
            CPF/CNPJ *
            <input defaultValue="" placeholder="00.000.000/0000-00" />
          </label>
          <ClientSelect compact label="Tipo" value={type} onChange={setType} options={["Pessoa Física", "Pessoa Jurídica"]} />
          <label>
            Telefone / WhatsApp
            <input placeholder="(00) 00000-0000" />
          </label>
          <label>
            E-mail
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="cliente@email.com" />
          </label>
          <label>
            Data de nascimento
            <input type="date" value={birthday} onChange={(event) => setBirthday(event.target.value)} />
          </label>
          <ClientSelect compact label="Origem do cliente" value={source} onChange={setSource} options={["Indicação", "Instagram", "Facebook", "Google", "WhatsApp", "Outro"]} />
          <label>
            Endereço
            <input placeholder="Rua, número, complemento" />
          </label>
          <label>
            Cidade / UF
            <input placeholder="Cidade, UF" />
          </label>
          <ClientSelect compact label="Status" value={status} onChange={setStatus} showDot options={["Ativo", "Inativo"]} />
        </div>
        <footer>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="v2-primary" type="submit">
            Salvar cliente
          </button>
        </footer>
      </form>
    </aside>
  );
}
