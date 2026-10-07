"use client";

import { useState } from "react";

const adultTop = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const adultBottom = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const childTop = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
const childBottom = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];
const areas = ["superior", "direita", "central", "inferior", "esquerda"] as const;
type Props = {
  notes: Record<string, string>;
  surfaces: Record<string, string[]>;
  selected: string;
  onSelect: (value: string) => void;
  onNote: (key: string, value: string) => void;
  onSurfaceChange: (key: string, value: string[]) => void;
  onSave: () => void;
  saving: boolean;
};

function ToothGlyph({ number, upsideDown = false }: { number: number; upsideDown?: boolean }) {
  const kind = number % 10;
  return <svg className={`clinical-dental-glyph ${upsideDown ? "is-inverted" : ""}`} viewBox="0 0 36 48" aria-hidden="true">
    <path d={kind <= 2 ? "M11 5 Q18 1 25 5 L26 23 Q24 32 21 43 L18 37 L15 43 Q12 32 10 23 Z" : kind === 3 ? "M11 9 L18 2 L25 9 L26 24 Q23 34 18 44 Q13 34 10 24 Z" : "M7 7 Q18 2 29 7 L28 23 Q26 30 23 42 L18 35 L13 42 Q10 31 8 23 Z"} />
    <path d="M9 20 Q18 25 27 20" />
  </svg>;
}

function SurfaceMap({ number, value, onChange }: { number: number; value: string[]; onChange: (next: string[]) => void }) {
  const shapes: Record<(typeof areas)[number], string> = {
    superior: "0,0 42,0 29,13 13,13", direita: "42,0 42,42 29,29 29,13",
    central: "13,13 29,13 29,29 13,29", inferior: "0,42 42,42 29,29 13,29",
    esquerda: "0,0 13,13 13,29 0,42",
  };
  return <svg className="clinical-dental-surface" viewBox="-1 -1 44 44" aria-label={`Faces do dente ${number}`}>
    {areas.map((area) => <polygon key={area} points={shapes[area]} role="button" tabIndex={0} aria-label={`Marcar área ${area} do dente ${number}`} aria-pressed={value.includes(area)} className={value.includes(area) ? "is-marked" : ""} onClick={() => onChange(value.includes(area) ? value.filter((item) => item !== area) : [...value, area])} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onChange(value.includes(area) ? value.filter((item) => item !== area) : [...value, area]); } }} />)}
  </svg>;
}

function Arch({ teeth, upper, selected, onPick }: { teeth: number[]; upper: boolean; selected: string[]; onPick: (id: string) => void }) {
  return <div className={`clinical-dental-arch ${upper ? "is-upper" : "is-lower"}`}>
    {teeth.map((tooth, index) => {
      const fraction = index / (teeth.length - 1);
      const x = (teeth.length === 10 ? 18 : 7) + (teeth.length === 10 ? 64 : 86) * fraction;
      const y = upper ? 76 - 49 * Math.sin(Math.PI * fraction) : 24 + 49 * Math.sin(Math.PI * fraction);
      return <button type="button" key={tooth} className={selected.includes(String(tooth)) ? "is-marked" : ""} style={{ left: `${x}%`, top: `${y}%` }} aria-pressed={selected.includes(String(tooth))} aria-label={`Dente ${tooth}`} onClick={() => onPick(String(tooth))}><span>{tooth}</span><ToothGlyph number={tooth} upsideDown={!upper} /></button>;
    })}
  </div>;
}

export default function ClinicalDental({ notes, surfaces, selected, onSelect, onNote, onSurfaceChange, onSave, saving }: Props) {
  const [dentition, setDentition] = useState<"adulto" | "infantil">("adulto");
  const [active, setActive] = useState(selected.split(",").map((item) => item.trim()).find(Boolean) ?? "");
  const selectedItems = selected.split(",").map((item) => item.trim()).filter(Boolean);
  const pick = (id: string) => { setActive(id); if (!selectedItems.includes(id)) onSelect([...selectedItems, id].join(", ")); };
  const top = dentition === "adulto" ? adultTop : childTop;
  const bottom = dentition === "adulto" ? adultBottom : childBottom;
  return <section className="client-record-panel clinical-anatomy-panel clinical-dental-panel">
    <header><h2>Odontograma</h2></header>
    <div className="clinical-dental-layout">
      <div className="clinical-dental-view clinical-dental-surface-view">
        <h3>Vista frontal e faces</h3><p>Clique no dente e marque as áreas do procedimento.</p>
        {[top, bottom].map((row, rowIndex) => <div className="clinical-dental-row" key={rowIndex}>
          {row.map((tooth, index) => <div className={`clinical-dental-unit ${active === String(tooth) ? "is-active" : ""}`} key={tooth}>
            <button type="button" className="clinical-dental-tooth-select" aria-pressed={selectedItems.includes(String(tooth))} onClick={() => pick(String(tooth))}>
              {rowIndex === 0 ? <span>{dentition === "adulto" ? index + 1 : tooth}</span> : null}
              <ToothGlyph number={tooth} upsideDown={rowIndex === 1} />
              {rowIndex === 1 ? <span>{dentition === "adulto" ? 32 - index : tooth}</span> : null}
            </button>
            <SurfaceMap number={tooth} value={surfaces[String(tooth)] ?? []} onChange={(next) => { pick(String(tooth)); onSurfaceChange(String(tooth), next); }} />
          </div>)}
        </div>)}
      </div>
      <div className="clinical-dental-view clinical-dental-occlusal-view">
        <div className="clinical-dental-view-head"><div><h3>Vista das arcadas</h3><p>Selecione o dente pela posição na arcada.</p></div><div className="clinical-dentition-switch" role="group" aria-label="Tipo de dentição"><button type="button" className={dentition === "adulto" ? "active" : ""} onClick={() => { setDentition("adulto"); setActive(""); }}>Adulto</button><button type="button" className={dentition === "infantil" ? "active" : ""} onClick={() => { setDentition("infantil"); setActive(""); }}>Infantil</button></div></div>
        <div className="clinical-dental-arches"><Arch teeth={top} upper selected={selectedItems} onPick={pick} /><div className="clinical-dental-midline" aria-hidden="true" /><Arch teeth={bottom} upper={false} selected={selectedItems} onPick={pick} /></div>
      </div>
    </div>
    {active ? <label className="clinical-field clinical-dental-note">Dente {active}{surfaces[active]?.length ? ` · áreas: ${surfaces[active].join(", ")}` : ""}<textarea rows={3} value={notes[active] ?? ""} onChange={(event) => onNote(active, event.target.value)} placeholder="Descreva o procedimento realizado neste dente" /></label> : <p>Selecione um dente em qualquer visão para registrar o procedimento.</p>}
    <button type="button" className="lab-create-activity" disabled={saving} onClick={onSave}>Salvar odontograma</button>
  </section>;
}
