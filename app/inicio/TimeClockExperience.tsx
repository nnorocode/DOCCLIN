"use client";
import { appStorage } from "../../lib/local-store";

import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, CircleHelp, Clock3, Edit3, MapPin, Plus, Smartphone, Trash2, UsersRound, X } from "lucide-react";
import { ClientSelect, StandardModuleTop } from "./ClientsExperience";
import ScrollableTabBar from "./ScrollableTabBar";
import { InformativeMetricCardPreview } from "../laboratorio/page";
import TutorialStoryboard from "./TutorialStoryboard";
import { useAccess } from "./AccessControl";

export type ClockWorker = { id: string; name: string; phone: string; start: string; end: string; device?: string };
export type ClockRecord = { id: string; workerId: string; type: "entrada" | "saída"; at: string; distance: number };
export type ClockState = { workers: ClockWorker[]; records: ClockRecord[]; place: { name: string; address: string; latitude: number | null; longitude: number | null; radius: number } };
export const clockStorageKey = "gest-time-clock";
export const initialClockState: ClockState = {
  workers: [],
  records: [],
  place: { name: "Bella Gestão", address: "", latitude: null, longitude: null, radius: 150 },
};

export function readClockState(): ClockState {
  if (typeof window === "undefined") return initialClockState;
  try {
    const saved = JSON.parse(appStorage.getItem(clockStorageKey) || "null");
    if (saved && Array.isArray(saved.workers) && Array.isArray(saved.records) && saved.place && typeof saved.place.name === "string" && Number.isFinite(saved.place.radius)) return { ...saved, workers: saved.workers.filter((worker: ClockWorker) => worker && [worker.id,worker.name,worker.phone,worker.start,worker.end].every((field) => typeof field === "string")), records: saved.records.filter((record: ClockRecord) => record && typeof record.id === "string" && typeof record.workerId === "string" && ["entrada","saída"].includes(record.type) && Number.isFinite(Date.parse(record.at)) && Number.isFinite(record.distance)), place: { ...saved.place, address: typeof saved.place.address === "string" ? saved.place.address : "", latitude: Number.isFinite(saved.place.latitude) && Math.abs(saved.place.latitude) <= 90 ? saved.place.latitude : null, longitude: Number.isFinite(saved.place.longitude) && Math.abs(saved.place.longitude) <= 180 ? saved.place.longitude : null, radius: Math.max(20,Math.min(1000,saved.place.radius)) } };
  } catch { /* Invalid local state falls back to initial data. */ }
  return initialClockState;
}

const dayKey = (at: string) => new Date(at).toLocaleDateString("pt-BR");
const timeLabel = (at: string) => new Date(at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dateLabel = (at: string) => new Date(at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const distanceMeters = (aLat: number, aLon: number, bLat: number, bLon: number) => {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLon = (bLon - aLon) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

function ClockLocationMap({ latitude, longitude, radius, onPick }: { latitude: number | null; longitude: number | null; radius: number; onPick: (latitude: number, longitude: number) => void }) {
  const [zoom, setZoom] = useState(16);
  const mapLat = latitude ?? -3.1190;
  const mapLon = longitude ?? -60.0217;
  const scale = 2 ** zoom;
  const centerX = ((mapLon + 180) / 360) * scale;
  const sin = Math.sin(mapLat * Math.PI / 180);
  const centerY = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
  const baseX = Math.floor(centerX);
  const baseY = Math.floor(centerY);
  const metersPerPixel = Math.cos(mapLat * Math.PI / 180) * 156543.03392 / scale;
  const tiles = Array.from({ length: 25 }, (_, index) => ({ x: baseX + (index % 5) - 2, y: baseY + Math.floor(index / 5) - 2 }));
  const selectOnMap = (event: React.MouseEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = centerX + (event.clientX - bounds.left - bounds.width / 2) / 256;
    const y = centerY + (event.clientY - bounds.top - bounds.height / 2) / 256;
    const selectedLon = x / scale * 360 - 180;
    const selectedLat = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / scale))) * 180 / Math.PI;
    onPick(selectedLat, selectedLon);
  };
  return <div className="clock-map-wrap"><div className="clock-map" aria-label="Mapa para definir o local de marcação do ponto">
    {tiles.map(({ x, y }) => <img key={`${zoom}-${x}-${y}`} alt="" draggable={false} loading="lazy" src={`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`} style={{ left: `calc(50% + ${(x - centerX) * 256}px)`, top: `calc(50% + ${(y - centerY) * 256}px)` }} />)}
    {latitude !== null && longitude !== null ? <><span className="clock-map-radius" style={{ width: Math.max(26, Math.min(600, radius / metersPerPixel * 2)), height: Math.max(26, Math.min(600, radius / metersPerPixel * 2)) }} /><span className="clock-map-pin"><MapPin size={24} fill="currentColor" /></span></> : null}
    <button type="button" className="clock-map-pick" aria-label="Clique no mapa para definir o centro do ponto" onClick={selectOnMap} />
    <div className="clock-map-zoom"><button type="button" aria-label="Aproximar mapa" onClick={() => setZoom((value) => Math.min(19, value + 1))}>+</button><button type="button" aria-label="Afastar mapa" onClick={() => setZoom((value) => Math.max(12, value - 1))}>−</button></div>
    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="clock-map-credit">© OpenStreetMap contributors</a>
  </div><small>Clique no mapa para posicionar o centro. Use +/− para ajustar a precisão visual.</small></div>;
}

export default function TimeClockExperience() {
  const access = useAccess();
  const [state, setState] = useState<ClockState>(initialClockState);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("Visão geral");
  const [workerId, setWorkerId] = useState("1");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("17:00");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [hideTutorialNextTime, setHideTutorialNextTime] = useState(false);
  const findAddress = async () => {
    if (!state.place.address.trim()) { setFeedback("Informe o endereço completo para localizar no mapa."); return; }
    setBusy(true); setFeedback("");
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(state.place.address)}`, { headers: { "Accept-Language": "pt-BR" } });
      if (!response.ok) throw new Error("Busca indisponível");
      const results = await response.json() as Array<{ lat: string; lon: string }>;
      if (!results.length) { setFeedback("Endereço não encontrado. Complete com cidade e estado ou marque o local no mapa."); return; }
      setState((current) => ({ ...current, place: { ...current.place, latitude: Number(results[0].lat), longitude: Number(results[0].lon) } }));
      setFeedback("Endereço localizado. Confira e ajuste o ponto no mapa antes de usar.");
    } catch { setFeedback("A busca do mapa está indisponível. Você ainda pode escolher o ponto manualmente."); }
    finally { setBusy(false); }
  };
  useEffect(() => { const saved = readClockState(); setState(saved); setWorkerId(saved.workers[0]?.id || ""); setLoaded(true); }, []);
  useEffect(() => { try { if (appStorage.getItem("gest-clock-tutorial-hidden") !== "true") setTutorialOpen(true); } catch { setTutorialOpen(true); } }, []);
  useEffect(() => { if (loaded) appStorage.setItem(clockStorageKey, JSON.stringify(state)); }, [state, loaded]);
  const closeTutorial = () => { if (hideTutorialNextTime) { try { appStorage.setItem("gest-clock-tutorial-hidden", "true"); } catch { /* The tutorial can still close for this visit. */ } } setTutorialOpen(false); };
  const selected = state.workers.find((worker) => worker.id === workerId);
  const today = new Date().toLocaleDateString("pt-BR");
  const todayRecords = state.records.filter((record) => dayKey(record.at) === today);
  const inside = todayRecords.filter((record) => record.type === "entrada" && !todayRecords.some((other) => other.workerId === record.workerId && other.type === "saída" && other.at > record.at));
  const getPosition = () => new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error("Este aparelho não oferece localização.")); return; }
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  });
  const setPlacePosition = async () => {
    setBusy(true); setFeedback("");
    try { const position = await getPosition(); setState((current) => ({ ...current, place: { ...current.place, latitude: position.coords.latitude, longitude: position.coords.longitude } })); setFeedback("Local do estabelecimento definido a partir da localização atual."); }
    catch { setFeedback("Não foi possível obter a localização. Ative a permissão do navegador e tente novamente."); }
    finally { setBusy(false); }
  };
  const registerDevice = () => {
    if (!selected) return;
    let device = appStorage.getItem("gest-clock-device");
    if (!device) { device = crypto.randomUUID(); appStorage.setItem("gest-clock-device", device); }
    setState((current) => ({ ...current, workers: current.workers.map((worker) => worker.id === selected.id ? { ...worker, device } : worker) }));
    setFeedback(`Este navegador foi vinculado a ${selected.name}.`);
  };
  const mark = async () => {
    if (!selected) { setFeedback("Selecione um funcionário."); return; }
    if (state.place.latitude === null || state.place.longitude === null) { setFeedback("Defina primeiro a localização do estabelecimento na aba Configuração."); return; }
    if (!selected.device || selected.device !== appStorage.getItem("gest-clock-device")) { setFeedback("Vincule este aparelho ao funcionário antes de marcar o ponto."); return; }
    setBusy(true); setFeedback("");
    try {
      const position = await getPosition();
      const distance = Math.round(distanceMeters(position.coords.latitude, position.coords.longitude, state.place.latitude, state.place.longitude));
      if (distance > state.place.radius) { setFeedback(`Fora do raio permitido: ${distance} m do estabelecimento. Limite: ${state.place.radius} m.`); return; }
      const last = todayRecords.filter((record) => record.workerId === selected.id).at(-1);
      const type = last?.type === "entrada" ? "saída" : "entrada";
      const at = new Date().toISOString();
      setState((current) => ({ ...current, records: [...current.records, { id: crypto.randomUUID(), workerId: selected.id, type, at, distance }] }));
      setFeedback(`${type === "entrada" ? "Entrada" : "Saída"} registrada às ${timeLabel(at)}.`);
    } catch { setFeedback("Não foi possível confirmar sua posição. Autorize a localização e tente novamente."); }
    finally { setBusy(false); }
  };
  const addWorker = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) { setFeedback("Preencha nome e celular."); return; }
    if (editingId) {
      setState((current) => ({ ...current, workers: current.workers.map((worker) => worker.id === editingId ? { ...worker, name: name.trim(), phone: phone.trim(), start, end } : worker) }));
      setEditingId(null); setName(""); setPhone(""); setFeedback("Cadastro e jornada atualizados."); return;
    }
    const worker = { id: crypto.randomUUID(), name: name.trim(), phone: phone.trim(), start, end };
    setState((current) => ({ ...current, workers: [...current.workers, worker] }));
    setWorkerId(worker.id); setName(""); setPhone(""); setFeedback(`${worker.name} cadastrado.`);
  };
  const workedDays = (id: string) => new Set(state.records.filter((record) => record.workerId === id && record.type === "entrada").map((record) => dayKey(record.at))).size;
  const lateDays = (worker: ClockWorker) => new Set(state.records.filter((record) => record.workerId === worker.id && record.type === "entrada" && new Date(record.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false }) > worker.start).map((record) => dayKey(record.at))).size;
  if (!access.manage) return <section className="clock-page"><StandardModuleTop title="Ponto digital" help="Seu registro individual de entrada e saída.">{null}</StandardModuleTop><article className="v2-card clock-panel"><h2>Meu ponto · {access.member?.name}</h2><p>Seu acesso não permite cadastrar pessoas ou alterar o local de marcação.</p><p>O registro individual pelo celular será habilitado após o vínculo seguro do funcionário no Supabase. Nenhuma marcação de outra pessoa é disponibilizada neste perfil.</p></article></section>;
  return <section className="clock-page">
    <StandardModuleTop title="Ponto digital" help="Configure a equipe, o local e os horários; acompanhe entradas e saídas." action={<div className="clock-top-actions"><button type="button" className="purchase-tutorial-link" onClick={() => setTutorialOpen(true)}><CircleHelp size={15} />Como funciona</button><button type="button" className="lab-create-activity" onClick={() => setTab("Pessoas")}><Plus size={16} />Cadastrar pessoa</button></div>}>
      <InformativeMetricCardPreview tone="blue" icon={UsersRound} title="Pessoas cadastradas" value={String(state.workers.length)} change="Equipe vinculada" />
      <InformativeMetricCardPreview tone="teal" icon={Clock3} title="Entradas hoje" value={String(todayRecords.filter((record) => record.type === "entrada").length)} change="Registros de entrada" />
      <InformativeMetricCardPreview tone="violet" icon={CheckCircle2} title="No estabelecimento" value={String(inside.length)} change="Pessoas presentes" />
      <InformativeMetricCardPreview tone="amber" icon={MapPin} title="Raio permitido" value={`${state.place.radius} m`} change={state.place.latitude === null ? "Local pendente" : "Local configurado"} />
    </StandardModuleTop>
    <ScrollableTabBar className="clock-tabs settings-modern-tabs" label="Áreas do controle de ponto">{["Visão geral", "Pessoas", "Marcação de pontos", "Configuração"].map((item) => <button type="button" key={item} className={tab === item ? "active" : ""} onClick={() => { setTab(item); setFeedback(""); }}>{item === "Visão geral" ? <CalendarDays size={15} /> : item === "Marcação de pontos" ? <Clock3 size={15} /> : item === "Pessoas" ? <UsersRound size={15} /> : <MapPin size={15} />}{item}</button>)}</ScrollableTabBar>
    {feedback ? <p role="status" className="clock-feedback">{feedback}</p> : null}
    {tab === "Visão geral" ? <div className="clock-layout"><article className="v2-card clock-panel"><h2>Jornada da equipe</h2><div className="clock-worker-list">{state.workers.map((worker, index) => <div key={worker.id}><span className="clock-worker-number"><i>{index + 1}</i><span><strong>{worker.name}</strong><small>{worker.start}–{worker.end} · {workedDays(worker.id)} dias trabalhados · {lateDays(worker)} com atraso</small></span></span><b className={inside.some((record) => record.workerId === worker.id) ? "clock-present" : ""}>{inside.some((record) => record.workerId === worker.id) ? "Presente" : "Fora"}</b></div>)}</div></article><article className="v2-card clock-panel"><h2>Registros recentes</h2><div className="clock-worker-list">{state.records.length ? [...state.records].reverse().slice(0, 12).map((record) => <div key={record.id}><span><strong>{state.workers.find((worker) => worker.id === record.workerId)?.name || "Pessoa removida"}</strong><small>{dateLabel(record.at)} · {timeLabel(record.at)} · {record.distance} m</small></span><b className={record.type === "entrada" ? "clock-present" : ""}>{record.type}</b></div>) : <p>Nenhum ponto registrado ainda.</p>}</div></article></div> : null}
    {tab === "Marcação de pontos" ? <article className="v2-card clock-panel clock-mobile-card"><i className="clock-large-icon"><Smartphone size={28} /></i><h2>Marcar ponto pelo celular</h2><p>Abra o GEST no celular, vincule este navegador ao funcionário e permita o acesso à localização.</p><ClientSelect compact label="Funcionário" value={selected?.name || "Selecione"} onChange={(value) => setWorkerId(state.workers.find((worker) => worker.name === value)?.id || "")} options={state.workers.map((worker) => worker.name)} /><div className="clock-actions"><button type="button" className="clock-secondary" onClick={registerDevice} disabled={!selected}><Smartphone size={16} />Vincular este aparelho</button><button type="button" className="lab-create-activity" onClick={mark} disabled={busy || !selected}><Clock3 size={16} />{todayRecords.filter((record) => record.workerId === workerId).at(-1)?.type === "entrada" ? "Registrar saída" : "Registrar entrada"}</button></div><small>Localização configurada: {state.place.latitude === null ? "pendente" : `${state.place.name} · raio de ${state.place.radius} m`}</small></article> : null}
    {tab === "Pessoas" ? <div className="clock-layout"><form className="v2-card clock-panel clock-form" onSubmit={addWorker}><h2>{editingId ? "Editar pessoa e jornada" : "Cadastrar pessoa"}</h2><label>Nome<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" required /></label><label>Celular<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(00) 00000-0000" type="tel" required /></label><div className="clock-time-grid"><label>Entrada<input type="time" value={start} onChange={(event) => setStart(event.target.value)} required /></label><label>Saída<input type="time" value={end} onChange={(event) => setEnd(event.target.value)} required /></label></div><button type="submit" className="lab-create-activity"><Plus size={16} />{editingId ? "Salvar alterações" : "Adicionar pessoa"}</button>{editingId ? <button type="button" className="clock-secondary" onClick={() => { setEditingId(null); setName(""); setPhone(""); }}>Cancelar edição</button> : null}</form><article className="v2-card clock-panel"><h2>Celulares e horários</h2><div className="clock-worker-list">{state.workers.map((worker) => <div key={worker.id}><span><strong>{worker.name}</strong><small>{worker.phone || "Celular pendente"} · {worker.start}–{worker.end} · {worker.device ? "aparelho vinculado" : "aparelho pendente"}</small></span><span className="clock-row-actions"><button type="button" aria-label={`Editar ${worker.name}`} title="Editar pessoa" onClick={() => { setEditingId(worker.id); setName(worker.name); setPhone(worker.phone); setStart(worker.start); setEnd(worker.end); }}><Edit3 size={16} /></button><button type="button" aria-label={`Remover ${worker.name}`} title="Remover pessoa" onClick={() => { if (!window.confirm(`Remover ${worker.name} e seus registros de ponto?`)) return; setState((current) => ({ ...current, workers: current.workers.filter((item) => item.id !== worker.id), records: current.records.filter((record) => record.workerId !== worker.id) })); if (workerId === worker.id) setWorkerId(""); }}><Trash2 size={16} /></button></span></div>)}</div></article></div> : null}
    {tab === "Configuração" ? <article className="v2-card clock-panel clock-form clock-place-form"><h2>Local de marcação do ponto</h2><p>Cadastre o endereço, confira o centro no mapa e defina o raio permitido. A posição será verificada ao registrar entrada ou saída.</p><label>Nome do estabelecimento<input value={state.place.name} onChange={(event) => setState((current) => ({ ...current, place: { ...current.place, name: event.target.value } }))} /></label><label>Endereço completo<input value={state.place.address} onChange={(event) => setState((current) => ({ ...current, place: { ...current.place, address: event.target.value } }))} placeholder="Rua, número, bairro, cidade e estado" /></label><div className="clock-actions"><button type="button" className="clock-secondary" onClick={findAddress} disabled={busy}>Buscar endereço</button><button type="button" className="clock-secondary" onClick={setPlacePosition} disabled={busy}><MapPin size={16} />Usar minha localização</button></div><ClockLocationMap latitude={state.place.latitude} longitude={state.place.longitude} radius={state.place.radius} onPick={(latitude, longitude) => { setState((current) => ({ ...current, place: { ...current.place, latitude, longitude } })); setFeedback("Centro do ponto definido no mapa."); }} /><label>Raio permitido em metros<input type="number" min="20" max="1000" value={state.place.radius} onChange={(event) => setState((current) => ({ ...current, place: { ...current.place, radius: Math.max(20, Math.min(1000, Number(event.target.value) || 20)) } }))} /></label><small>{state.place.latitude === null ? "Localização ainda não definida" : `Centro: ${state.place.latitude.toFixed(5)}, ${state.place.longitude?.toFixed(5)} · raio de ${state.place.radius} m`}</small><small>A busca de endereço e os mapas usam OpenStreetMap. Não inclua dados confidenciais na pesquisa.</small></article> : null}
    {tutorialOpen ? <div className="purchase-tutorial-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeTutorial(); }}><section className="purchase-tutorial-dialog purchase-story-dialog" role="dialog" aria-modal="true" aria-labelledby="clock-tutorial-title"><header><span><CircleHelp size={18} /></span><button type="button" aria-label="Fechar tutorial" onClick={closeTutorial}><X size={18} /></button></header><h2 id="clock-tutorial-title" className="purchase-story-title">Como funciona o Ponto</h2><TutorialStoryboard kind="ponto" /><footer><label className="purchase-tutorial-dismiss"><input type="checkbox" checked={hideTutorialNextTime} onChange={(event) => setHideTutorialNextTime(event.target.checked)} />Não mostrar este tutorial novamente</label><button type="button" className="lab-create-activity" onClick={closeTutorial}>Entendi, continuar</button></footer></section></div> : null}
  </section>;
}
