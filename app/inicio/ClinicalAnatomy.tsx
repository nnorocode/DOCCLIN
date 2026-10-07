"use client";

import { useState } from "react";
import ClinicalDental from "./ClinicalDental";

type Layer = "pele" | "subcutaneo" | "superficial" | "profundo" | "vasos";
const layers: { id: Layer; title: string }[] = [
  { id: "pele", title: "1 · Rosto" }, { id: "subcutaneo", title: "2 · Subcutâneo" },
  { id: "superficial", title: "3 · Músculos superficiais" }, { id: "profundo", title: "4 · Músculos profundos" },
  { id: "vasos", title: "5 · Vasos e nervos" },
];
type Zone = { id: string; label: string; x: number; y: number };
const zones: Record<Layer, Zone[]> = {
  pele: [{ id: "Frontal", label: "Testa", x: 50, y: 22 }, { id: "Periorbital direita", label: "Olho direito", x: 34, y: 41 }, { id: "Periorbital esquerda", label: "Olho esquerdo", x: 66, y: 41 }, { id: "Nasal", label: "Nariz", x: 50, y: 54 }, { id: "Malar direita", label: "Maçã direita", x: 27, y: 59 }, { id: "Malar esquerda", label: "Maçã esquerda", x: 73, y: 59 }, { id: "Perioral", label: "Boca", x: 50, y: 73 }, { id: "Mento", label: "Queixo", x: 50, y: 85 }],
  subcutaneo: [{ id: "Frontal direito", label: "Subcutâneo frontal direito", x: 35, y: 25 }, { id: "Frontal esquerdo", label: "Subcutâneo frontal esquerdo", x: 65, y: 25 }, { id: "Malar direita", label: "Subcutâneo malar direito", x: 30, y: 57 }, { id: "Malar esquerda", label: "Subcutâneo malar esquerdo", x: 70, y: 57 }, { id: "Perioral", label: "Subcutâneo perioral", x: 50, y: 75 }],
  superficial: [{ id: "Frontal direito", label: "Frontal direito", x: 35, y: 25 }, { id: "Frontal esquerdo", label: "Frontal esquerdo", x: 65, y: 25 }, { id: "Orbicular do olho direito", label: "Orbicular do olho direito", x: 32, y: 43 }, { id: "Orbicular do olho esquerdo", label: "Orbicular do olho esquerdo", x: 68, y: 43 }, { id: "Zigomático maior direito", label: "Zigomático maior direito", x: 31, y: 61 }, { id: "Zigomático maior esquerdo", label: "Zigomático maior esquerdo", x: 69, y: 61 }, { id: "Orbicular da boca", label: "Orbicular da boca", x: 50, y: 74 }],
  profundo: [{ id: "Prócero", label: "Prócero", x: 50, y: 39 }, { id: "Nasal direito", label: "Nasal direito", x: 43, y: 55 }, { id: "Nasal esquerdo", label: "Nasal esquerdo", x: 57, y: 55 }, { id: "Masseter direito", label: "Masseter direito", x: 22, y: 70 }, { id: "Masseter esquerdo", label: "Masseter esquerdo", x: 78, y: 70 }, { id: "Mentoniano", label: "Mentoniano", x: 50, y: 86 }],
  vasos: [{ id: "Frontal direito", label: "Região frontal direita", x: 35, y: 26 }, { id: "Frontal esquerdo", label: "Região frontal esquerda", x: 65, y: 26 }, { id: "Periorbital direita", label: "Região periorbital direita", x: 31, y: 44 }, { id: "Periorbital esquerda", label: "Região periorbital esquerda", x: 69, y: 44 }, { id: "Malar direita", label: "Região malar direita", x: 28, y: 60 }, { id: "Malar esquerda", label: "Região malar esquerda", x: 72, y: 60 }, { id: "Perioral", label: "Região perioral", x: 50, y: 75 }],
};

type Props = { kind: "dental" | "face"; notes: Record<string, string>; selected: string; surfaces?: Record<string, string[]>; onSelect: (value: string) => void; onNote: (key: string, value: string) => void; onSurfaceChange?: (key: string, value: string[]) => void; onSave: () => void; saving: boolean };

function FaceDrawing({ layer }: { layer: Layer }) {
  return <svg className={`clinical-layer-face layer-${layer}`} viewBox="0 0 280 390" role="img" aria-label={`Ilustração esquemática: ${layers.find((item) => item.id === layer)?.title}`}>
    <defs><linearGradient id="clinical-skin" x2="1" y2="1"><stop stopColor="#f4d6c8" /><stop offset=".55" stopColor="#eac3b2" /><stop offset="1" stopColor="#d9a997" /></linearGradient><pattern id="clinical-fibers" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M1 0 L6 7" stroke="#a45755" strokeOpacity=".36" strokeWidth="1" /></pattern></defs>
    <path className="clinical-face-neck" d="M104 315 L95 371 Q140 390 185 371 L176 315" />
    <path className="clinical-face-head" d="M140 15 C82 13 49 63 52 140 C38 132 38 178 55 190 C62 256 92 320 140 340 C188 320 218 256 225 190 C242 178 242 132 228 140 C231 63 198 13 140 15Z" />
    {layer === "subcutaneo" ? <g className="clinical-face-fat"><ellipse cx="94" cy="205" rx="37" ry="38"/><ellipse cx="186" cy="205" rx="37" ry="38"/><ellipse cx="140" cy="74" rx="61" ry="43"/><ellipse cx="140" cy="280" rx="40" ry="32"/></g> : null}
    {layer === "superficial" || layer === "profundo" ? <g className={`clinical-face-muscles ${layer}`}>
      <path d="M79 30 Q113 17 136 30 L134 110 Q105 104 79 30Z M201 30 Q167 17 144 30 L146 110 Q175 104 201 30Z"/>
      <ellipse cx="101" cy="155" rx="43" ry="27"/><ellipse cx="179" cy="155" rx="43" ry="27"/>
      <path d="M64 186 Q78 235 125 265 L136 250 Q103 207 64 186Z M216 186 Q202 235 155 265 L144 250 Q177 207 216 186Z"/>
      <ellipse cx="140" cy="268" rx="43" ry="17"/>
      {layer === "profundo" ? <><path d="M61 202 Q51 268 91 306 L113 286 L91 205Z M219 202 Q229 268 189 306 L167 286 L189 205Z"/><path d="M132 104 L148 104 L154 213 L126 213Z"/></> : null}
    </g> : null}
    {layer === "vasos" ? <g className="clinical-face-vessels"><path d="M71 299 C76 256 75 209 99 171 C119 136 105 98 108 53 M209 299 C204 256 205 209 181 171 C161 136 175 98 172 53 M86 241 Q110 213 140 205 Q170 213 194 241 M137 321 L137 232"/><path d="M90 306 C91 262 106 218 97 172 C88 131 86 89 85 62 M190 306 C189 262 174 218 183 172 C192 131 194 89 195 62 M73 225 Q105 244 135 230 Q175 244 207 225"/></g> : null}
    <g className="clinical-face-features"><path d="M74 142 Q100 129 125 143 M155 143 Q180 129 206 142"/><path d="M78 160 Q100 145 122 160 Q101 175 78 160Z M158 160 Q180 145 202 160 Q179 175 158 160Z"/><path d="M140 164 Q134 210 127 223 Q140 231 153 223 Q146 210 140 164"/><path d="M111 270 Q140 256 169 270 Q140 287 111 270Z"/><path d="M104 307 Q140 318 176 307"/></g>
  </svg>;
}

export default function ClinicalAnatomy(props: Props) {
  const [layer, setLayer] = useState<Layer>("pele");
  const [active, setActive] = useState(props.selected.split(",").map((item) => item.trim()).find(Boolean) ?? "");
  if (props.kind === "dental") return <ClinicalDental notes={props.notes} surfaces={props.surfaces ?? {}} selected={props.selected} onSelect={props.onSelect} onNote={props.onNote} onSurfaceChange={props.onSurfaceChange ?? (() => {})} onSave={props.onSave} saving={props.saving} />;
  const selectedItems = props.selected.split(",").map((item) => item.trim()).filter(Boolean);
  const choose = (key: string) => { setActive(key); if (!selectedItems.includes(key)) props.onSelect([...selectedItems, key].join(", ")); };
  const current = zones[layer];
  const activeZone = Object.entries(zones).flatMap(([layerId, items]) => items.map((item) => ({ ...item, key: `${layerId}:${item.id}` }))).find((item) => item.key === active);
  return <section className="client-record-panel clinical-anatomy-panel clinical-layer-panel">
    <header><h2>Mapa facial</h2></header>
    <div className="clinical-layer-tabs" role="group" aria-label="Camada do mapa facial">{layers.map((item) => <button type="button" key={item.id} className={layer === item.id ? "active" : ""} onClick={() => setLayer(item.id)}>{item.title}</button>)}</div>
    <div className="clinical-layer-layout"><div className="clinical-face-canvas"><FaceDrawing layer={layer} />{current.map(({ id, label, x, y }) => { const key = `${layer}:${id}`; return <button type="button" key={key} className={`clinical-face-point ${selectedItems.includes(key) ? "is-marked" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} aria-label={`Marcar ${label}`} aria-pressed={selectedItems.includes(key)} title={label} onClick={() => choose(key)}>{selectedItems.includes(key) ? "✓" : "+"}</button>; })}</div><div className="clinical-face-sidebar"><h3>{layers.find((item) => item.id === layer)?.title}</h3><p>Selecione uma região no rosto ou na lista.</p><div className="clinical-zone-legend">{current.map(({ id, label }) => { const key = `${layer}:${id}`; return <button type="button" key={key} className={selectedItems.includes(key) ? "active" : ""} onClick={() => choose(key)}>{label}</button>; })}</div><p className="clinical-face-disclaimer">Mapa ilustrativo para registro de localização. Não deve ser usado para planejar aplicação ou localizar vasos e nervos.</p></div></div>
    {active ? <label className="clinical-field">{activeZone?.label ?? active}<textarea rows={3} value={props.notes[active] ?? ""} onChange={(event) => props.onNote(active, event.target.value)} placeholder="Registre o que foi realizado nesta região" /></label> : <p>Selecione uma região para registrar o procedimento.</p>}
    <button type="button" className="lab-create-activity" disabled={props.saving} onClick={props.onSave}>Salvar mapa facial</button>
  </section>;
}
