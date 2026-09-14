"use client";

import { useEffect, useMemo, useState } from "react";
import InfoHint from "./InfoHint";
import {
  ArrowUp,
  CircleDollarSign,
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
  photo?: string;
};

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
  onDetails,
}: {
  onDetails: (record: string[]) => void;
}) {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Mais recentes");
  const [panel, setPanel] = useState<Client | null | "new">(null);
  const [pageSize, setPageSize] = useState(25);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    const openNewClient = () => setPanel("new");
    window.addEventListener("gest:create-client", openNewClient);
    return () => window.removeEventListener("gest:create-client", openNewClient);
  }, []);

  const filtered = useMemo(
    () =>
      [...rows]
        .filter((client) =>
          `${client.name} ${client.email}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
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
    [rows, query, sort],
  );

  const save = (client: Client) => {
    setRows((current) =>
      panel === "new"
        ? [client, ...current]
        : current.map((item) => (item.id === client.id ? client : item)),
    );
    setPanel(null);
  };

  return (
    <>
      <div className="v2-intro client-compact-intro">
        <h1>
          Clientes
          <InfoHint text="Gerencie e acompanhe seus clientes e seu relacionamento." />
        </h1>
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

      <article className="v2-card v2-client-table v2-ranked-client-table">
        <header>
          <div className="v2-local-search">
            <Search size={19} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar clientes por nome, e-mail ou telefone..."
            />
          </div>
          <label>
            Status
            <select>
              <option>Todos</option>
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </label>
          <label>
            Tipo
            <select>
              <option>Todos</option>
              <option>Pessoa Física</option>
              <option>Pessoa Jurídica</option>
            </select>
          </label>
          <label>
            Ordenar por
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option>Mais recentes</option>
              <option>Mais antigos</option>
              <option>A–Z</option>
              <option>Z–A</option>
              <option>Maior valor</option>
              <option>Menor valor</option>
            </select>
          </label>
          <button className="v2-primary" onClick={() => setPanel("new")}>
            <Plus size={18} />
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
                "ID",
                "Ranking",
                "Cliente",
                "Tipo",
                "Último contato",
                "Total vendido",
                "Status",
                "Ações",
              ].map((item) => (
                <th key={item}>{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, pageSize).map((client) => {
              const rank = clientRanking(rows, client.id);

              return (
                <tr key={client.id}>
                  <td>{client.id}</td>
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
                  <td>
                    <button
                      onClick={() =>
                        onDetails([
                          `#CL-${client.id}`,
                          client.name,
                          client.type,
                          client.contact,
                          client.total,
                          client.status,
                        ])
                      }
                    >
                      Ver detalhes
                    </button>
                    <button
                      className="v2-icon-button"
                      aria-label="Editar cliente"
                      onClick={() => setPanel(client)}
                    >
                      <Edit3 size={17} />
                    </button>
                    <button
                      className="v2-icon-button"
                      aria-label="Reordenar cliente"
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
            {filtered.slice(0, pageSize).map((client, index) => (
              <ClientGridCard
                key={client.id}
                client={client}
                rank={clientRanking(rows, client.id)}
                tone={(["peach", "gray", "blue"] as const)[index % 3]}
                onDetails={() => onDetails([
                  `#CL-${client.id}`,
                  client.name,
                  client.type,
                  client.contact,
                  client.total,
                  client.status,
                ])}
                onEdit={() => setPanel(client)}
              />
            ))}
          </section>
        )}

        <footer>
          <label className="client-page-size">Mostrar por página <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label>
          <span>Mostrando 1 a {Math.min(filtered.length, pageSize)} de 1.248 clientes</span>
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
  tone: string;
}) {
  const Icon = label.includes("inativos")
    ? UserRound
    : label.includes("ativos")
      ? UserCheck
      : label.includes("Ticket")
        ? CircleDollarSign
        : Users;

  return (
    <article className={`client-informative-card tone-${tone}`}>
      <header>
        <span><Icon size={20} strokeWidth={1.9} /></span>
        <InfoHint text={`Entenda o indicador ${label.toLowerCase()} e como ele é calculado.`} />
      </header>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small><ArrowUp size={13} strokeWidth={2.4} /> {detail}</small>
      </div>
    </article>
  );
}

function ClientGridCard({ client, rank, tone, onDetails, onEdit }: {
  client: Client;
  rank: ReturnType<typeof clientRanking>;
  tone: "peach" | "gray" | "blue";
  onDetails: () => void;
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
        <button type="button" className="primary" onClick={onDetails}>Ver detalhes</button>
        <button type="button" aria-label="Editar cliente" onClick={onEdit}><Edit3 size={17} /></button>
        <button type="button" aria-label="Organizar posição"><GripVertical size={18} /></button>
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

  return (
    <aside className="v2-record-drawer">
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
            email: client?.email ?? "cliente@email.com.br",
            type: client?.type ?? "Pessoa Física",
            contact: client?.contact ?? "Hoje",
            relative: "Agora",
            total: client?.total ?? "R$ 0,00",
            status: client?.status ?? "Ativo",
            source: client?.source ?? "Indicação",
            photo,
          });
        }}
      >
        <button type="button" className="close" onClick={onClose}>
          <X />
        </button>
        <small>{client ? "EDITAR CLIENTE" : "CADASTRAR CLIENTE"}</small>
        <h2>{client ? "Editar cliente" : "Novo cliente"}</h2>
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
          <label>
            Tipo
            <select defaultValue={client?.type ?? "Pessoa Física"}>
              <option>Pessoa Física</option>
              <option>Pessoa Jurídica</option>
            </select>
          </label>
          <label>
            Telefone / WhatsApp
            <input placeholder="(00) 00000-0000" />
          </label>
          <label>
            E-mail
            <input defaultValue={client?.email ?? ""} placeholder="cliente@email.com" />
          </label>
          <label>
            Origem do cliente
            <select defaultValue={client?.source ?? "Indicação"}>
              <option>Indicação</option>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>Google</option>
              <option>WhatsApp</option>
              <option>Outro</option>
            </select>
          </label>
          <label>
            Endereço
            <input placeholder="Rua, número, complemento" />
          </label>
          <label>
            Cidade / UF
            <input placeholder="Cidade, UF" />
          </label>
          <label>
            Status
            <select defaultValue={client?.status ?? "Ativo"}>
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </label>
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
