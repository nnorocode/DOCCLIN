"use client";
import SectionNumber from "../../inicio/SectionNumber";

import { useEffect, useMemo, useRef, useState } from "react";
import { ScanFace, Smile, Eye, EyeOff, History } from "lucide-react";
import { AccessProvider, useAccess } from "../../inicio/AccessControl";
import { appStorage } from "../../../lib/local-store";
import { ClientSelect } from "../../inicio/ClientsExperience";
import "./preview.css";
import { occlusalReference } from "./occlusal-reference-data";
import { catalogDefaults } from "../../../lib/catalog-defaults";
import IntraoralExam from "../../inicio/IntraoralExam";

function RecessionControl({id,value,onChange}:{id:number;value:number;onChange:(value:number)=>void}) {
  const [custom,setCustom]=useState(false);
  return <div className="al-recession-inline" title={`Recessão gengival · elemento ${id}`}>{custom ? <input autoFocus type="number" min="0" max="20" step="0.1" aria-label={`Recessão do elemento ${id} em mm`} value={value||""} placeholder="mm" onChange={e=>onChange(Number(e.target.value))} onBlur={()=>setCustom(false)} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape")setCustom(false);}}/> : <ClientSelect hideLabel compact label={`Recessão do elemento ${id} em mm`} value={value?String(value):" "} options={["1","2","3","4","5","Outro…"]} onChange={option=>{if(option==="Outro…")setCustom(true);else onChange(Number(option));}}/>}{!value&&!custom&&<svg className="al-recession-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 9c-2-7 4-7 7-5 3-2 9-2 7 5l-3 11h-2l-2-7-2 7H8Z M3 9h18"/></svg>}</div>;
}
const upper = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const lower = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
const childUpper = [55,54,53,52,51,61,62,63,64,65];
const childLower = [85,84,83,82,81,71,72,73,74,75];
const childFrontIndices = [1,2,5,6,7,8,9,10,13,14];
const sectors = { superior: "0,0 40,0 27,13 13,13", direita: "40,0 40,40 27,27 27,13", inferior: "40,40 0,40 13,27 27,27", esquerda: "0,40 0,0 13,13 13,27", centro: "13,13 27,13 27,27 13,27" };
const upperFrontBounds = [0,160,309,418,535,650,775,880,1027,1168,1276,1401,1512,1630,1740,1886,2048];
const lowerFrontBounds = [0,168,326,454,571,691,809,925,1024,1134,1237,1357,1467,1591,1719,1880,2048];
// Render each element independently: its picture, hit area and label share one position.
type ToothCondition = "Presente" | "Ausente" | "Extraído" | "Implante" | "Faceta" | "Coroa" | "Aparelho" | "Canal";
const toothConditions: ToothCondition[] = ["Ausente", "Extraído", "Implante", "Faceta", "Coroa", "Aparelho", "Canal"];
function FrontTooth({ index, lower: bottom, recession = 0, condition = [] }: { index: number; lower: boolean; recession?: number; condition?: ToothCondition[] }) {
  const bounds = bottom ? lowerFrontBounds : upperFrontBounds;
  const left = bounds[index];
  const right = bounds[index+1];
  const clipId = `front-${bottom ? 'lower' : 'upper'}-${index}`;
  // Cervical reference in the illustration; millimetres are recorded separately.
  // The line is schematic, moving towards the apex as the entered value increases.
  const cervical = bottom
    ? [509,514,520,514,518,535,518,519,520,520,537,520,518,511,514,518][index]
    : [153,150,151,152,154,148,151,138,140,154,146,152,152,150,153,150][index];
  const lineY = cervical + (bottom ? 1 : -1) * recession * 6;
  const missing = condition.includes("Ausente") || condition.includes("Extraído");
  const center = (bottom ? [88,246,388,514,630,750,864,977,1078,1188,1302,1414,1530,1640,1800,1964] : [88,230,362,477,592,710,826,950,1098,1220,1337,1453,1570,1680,1815,1962])[index];
  const crownY = bottom ? 470 : 195;
  return <svg viewBox={`${left} ${bottom ? 383 : 0} ${right-left} 300`} aria-hidden="true">
    <defs>
      <linearGradient id={`${clipId}-metal`} x1="0" x2="1"><stop stopColor="#7b8c9a"/><stop offset=".35" stopColor="#f0f5f8"/><stop offset=".65" stopColor="#b5c4ce"/><stop offset="1" stopColor="#728796"/></linearGradient>
      <clipPath id={clipId}><rect x={left} y={bottom ? 383 : 0} width={right-left} height={300}/></clipPath>
      <filter id={`${clipId}-tooth-alpha`} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  12 0 -12 0 0"/>
      </filter>
      <mask id={`${clipId}-tooth-mask`} maskUnits="userSpaceOnUse" x={left} y={bottom ? 383 : 0} width={right-left} height="300" style={{maskType:'alpha'}}>
        <image href="/clinical-lab/frontal-v1.png" width="2048" height="683" filter={`url(#${clipId}-tooth-alpha)`}/>
      </mask>
    </defs>
    <image className="al-front-enamel" opacity={missing ? .13 : condition.includes("Implante") ? .8 : 1} clipPath={`url(#${clipId})`} href="/clinical-lab/frontal-v1.png" width="2048" height="683"/>
    {missing && <g className="al-condition-symbol" transform={`translate(${center} ${crownY})`} fill="none" stroke="#e34e58" strokeWidth="5" strokeLinecap="round">
      <circle r="24" fill="#ffd5d8" fillOpacity=".95" strokeWidth="3"/>
      {condition.includes("Extraído") ? <path d="M-12-12L12 12M12-12L-12 12"/> : <path d="M-12 0H12"/>}
    </g>}
    {condition.includes("Implante") && <g className="al-condition-symbol" transform={`translate(${center} ${bottom?520:150}) scale(1.3 ${bottom?-1.15:1.15})`} stroke="#597687" strokeWidth="3" strokeLinejoin="round">
      <path d="M-12-98Q0-108 12-98L15-15H-15Z" fill={`url(#${clipId}-metal)`}/>
      {Array.from({length:7},(_,i)=><path key={i} d={`M-15 ${-88+i*11}l30 -5`} fill="none"/>)}
      <path d="M-11-15H11L16 8H-16Z" fill={`url(#${clipId}-metal)`}/>
    </g>}
    {condition.includes("Canal") && <g clipPath={`url(#${clipId})`} mask={`url(#${clipId}-tooth-mask)`} fill="none" stroke="#e45b65" strokeWidth="7" strokeLinecap="round"><path d={`M${center} ${crownY} Q${center-8} ${cervical} ${center} ${bottom?625:45}`}/>{index<5||index>10?<path d={`M${center} ${cervical} Q${center+18} ${bottom?570:95} ${center+24} ${bottom?615:55}`}/>:null}</g>}
    {condition.includes("Aparelho") && <g className="al-condition-symbol" transform={`translate(${center} ${crownY})`} stroke="#718595" strokeWidth="2" strokeLinejoin="round">
      <rect x="-23" y="-20" width="46" height="40" rx="9" fill={`url(#${clipId}-metal)`}/>
      <rect x="-16" y="-15" width="10" height="30" rx="3" fill="#dce5ea"/><rect x="6" y="-15" width="10" height="30" rx="3" fill="#dce5ea"/>
      <path d={`M${-(right-left)*.37} 0H${(right-left)*.37}`} stroke="#536e83" strokeWidth="4" strokeLinecap="round"/>
      <path d="M-16-10Q0-20 16-10V10Q0 20-16 10Z" fill="none" stroke="#a5b4c1" strokeWidth="3"/>
    </g>}
    {(condition.includes("Faceta") || condition.includes("Coroa")) && <g mask={`url(#${clipId}-tooth-mask)`} clipPath={`url(#${clipId})`}>
      <rect x={left} y={bottom?383:cervical} width={right-left} height={bottom?cervical-383:300-cervical} fill={condition.includes("Faceta")?"#b4dce7":"#efbd43"} opacity=".85"/>
      <path d={`M${left} ${cervical+(bottom?-1:1)*12}Q${center} ${cervical+(bottom?-1:1)*25} ${right} ${cervical+(bottom?-1:1)*12}`} stroke={condition.includes("Faceta")?"#659aaf":"#b39959"} strokeWidth="3" fill="none"/>
    </g>}
    {recession > 0 && <g clipPath={`url(#${clipId})`} mask={`url(#${clipId}-tooth-mask)`}>
      <line className="al-recession-line" data-mm={recession} x1={left} x2={right} y1={lineY} y2={lineY} stroke="#dc3038" strokeWidth="2.4" vectorEffect="non-scaling-stroke"/>
    </g>}
  </svg>;
}
const layers = ["Pele", "Tecido subcutâneo", "Músculos superficiais", "Músculos profundos", "Vasos e nervos", "Ossos"];
function BoneLayer({ gender, angle }: { gender: "female" | "male"; angle: Angle }) {
  // Tight bounds isolate one skull, excluding atlas dividers and adjacent rows.
  const crops = gender === "female"
    ? [[102,12,303,433],[577,12,350,433],[1059,6,402,436]]
    : [[90,478,330,477],[569,478,384,477],[1049,478,436,475]];
  const [x,y,width,height] = crops[Math.abs(angle)];
  const profile = Math.abs(angle) === 2;
  // Atlas registration in the facial coordinate frame, not a separate thumbnail.
  // Each angle uses the intermediate layers' crown/chin and lateral envelope.
  const frames = gender === "female"
    ? [[33,5,344,495],[17,5,370,495],[14,75,365,405]]
    : [[30,5,346,515],[20,5,374,510],[30,78,370,415]];
  const [baseLeft,baseTop,baseWidth,baseHeight] = frames[Math.abs(angle)];
  const maleLeft = gender === "male" && angle < 0;
  const left = gender === "female" && angle === 0 ? baseLeft - 7 : maleLeft ? baseLeft - (profile ? 15 : 18) : baseLeft;
  const top = gender === "female" && angle === -2 ? baseTop + 3 : maleLeft ? baseTop + 7 : baseTop;
  const headWidth = gender === "female" && angle === -2 ? baseWidth * .98 : maleLeft ? baseWidth - 20 : baseWidth;
  const headHeight = gender === "female" && angle === -2 ? baseHeight * .98 : maleLeft ? baseHeight - 20 : baseHeight;
  return <svg className={`al-face-image ${angle < 0 ? "mirror" : ""}`} viewBox={profile ? "15 65 385 500" : "-30 0 470 683"} aria-hidden="true">
    <svg x={left} y={top} width={headWidth} height={headHeight} viewBox={`${x} ${y} ${width} ${height}`} preserveAspectRatio="none" overflow="hidden">
      <image href="/clinical-lab/bone-atlas-v1.png" width="1536" height="1024"/>
    </svg>
  </svg>;
}
// Crown crops from the supplied drawing, without its duplicate central numbering.
const referenceAdult = [
  [[155,350,33,30],[168,295,34,33],[183,237,36,38],[202,184,34,27],[225,147,34,28],[252,108,30,28],[292,86,27,27],[338,79,30,31]],
  [[159,551,33,33],[172,612,36,34],[194,675,37,36],[212,725,32,27],[234,762,27,25],[260,792,27,26],[300,808,29,25],[338,812,24,25]],
];
const referenceChild = [
  [[248,349,33,31],[258,299,28,29],[280,259,23,22],[305,234,20,17],[344,226,25,18]],
  [[247,557,33,35],[264,611,27,29],[288,646,21,17],[315,660,18,15],[343,669,17,14]],
];
const referenceAdultRight = [
  [[575,358,30,29],[560,306,31,31],[546,245,35,37],[530,191,33,27],[511,152,31,27],[482,113,29,28],[442,89,26,27],[394,80,29,30]],
  [[558,562,32,32],[543,620,31,33],[517,682,34,34],[495,733,29,26],[477,769,26,25],[447,793,26,25],[410,809,26,26],[374,814,22,25]],
];
const referenceChildRight = [
  [[479,354,32,30],[469,302,28,27],[450,264,22,23],[423,238,19,17],[390,225,25,18]],
  [[473,564,33,35],[453,618,25,28],[426,651,21,17],[399,662,18,15],[372,670,16,14]],
];
function toothSelectionBoundary(elements:{x:number;y:number}[],index:number) {
  const center=elements[index];
  let polygon=[[0,0],[445,0],[445,595],[0,595]];
  for(const [otherIndex,other] of elements.entries()) {
    if(otherIndex===index) continue;
    const nx=other.x-center.x,ny=other.y-center.y;
    const limit=(other.x**2+other.y**2-center.x**2-center.y**2)/2;
    const next:number[][]=[];
    for(let i=0;i<polygon.length;i++) {
      const a=polygon[i],b=polygon[(i+1)%polygon.length];
      const da=a[0]*nx+a[1]*ny-limit,db=b[0]*nx+b[1]*ny-limit;
      if(da<=0) next.push(a);
      if((da<=0)!==(db<=0)) {const t=da/(da-db);next.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
    }
    polygon=next;
  }
  return polygon.map(point=>point.join(',')).join(' ');
}
function OcclusalAtlas({child,selected,choose,faces,styles}:{child:boolean;selected:number[];choose:(id:number)=>void;faces:Record<number,string[]>;styles:Record<string,string>}) {
  const rows=child?[childUpper,childLower]:[upper,lower];
  const elements=child?occlusalReference.child:occlusalReference.adult;
  return <svg className="al-occlusal-atlas al-reference-atlas" viewBox="35 0 390 595" aria-label="Arcadas dentárias">
    <defs><clipPath id={child?"occlusal-child-visible":"occlusal-adult-visible"}><path clipRule="evenodd" d={(child?"":"M0 0H445V595H0Z ")+"M120 270V210L135 175L165 140L195 132H255L290 145L315 175L335 220V270Z M120 330H335V395L310 435L275 465H175L140 435L120 395Z"}/></clipPath></defs>
    <image href="/clinical-lab/occlusal-realistic-v1.png" width="445" height="595" preserveAspectRatio="none" clipPath={`url(#occlusal-${child?"child":"adult"}-visible)`} pointerEvents="none"/>
    {rows.flatMap((row,r)=>row.map((id,i)=>{
      const {x,y,rx,ry,path}=elements[r][i];
      const textureCenters=child ? [[[150,236],[157,207],[171,178],[189,157],[215,154],[246,154],[264,157],[287,177],[298,207],[310,240]],[[146,369],[158,400],[175,430],[195,443],[215,445],[237,445],[255,443],[275,432],[294,402],[308,369]]] : [[[82,238],[90,202],[102,162],[116,125],[133,96],[154,74],[179,54],[215,49],[252,49],[285,56],[316,76],[333,97],[350,125],[365,162],[370,202],[378,239]],[[82,367],[90,399],[107,442],[122,481],[133,514],[154,534],[181,546],[210,548],[239,548],[265,546],[292,534],[316,514],[333,484],[345,443],[362,401],[372,368]]];
      const [tx,ty]=textureCenters[r][i];
      const dx=tx-225,dy=ty-(r?350:265),length=Math.hypot(dx,dy);
      const labelX=tx+dx/length*(rx+12),labelY=ty+dy/length*(ry+12);
      const clipId=`occlusal-${child?'child':'adult'}-${id}`;
      const selectionClipId=`${clipId}-selection`;
      const colors=[...new Set((faces[id]??[]).map(face=>styles[`${id}:${face}`]??"satisfactory"))];
      if(!colors.length)colors.push("selected");
      return <g key={id} className="al-occlusal-tooth" role="button" tabIndex={0} aria-label={`Selecionar elemento ${id} na arcada`} aria-pressed={selected.includes(id)} onClick={()=>choose(id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(id);}}}>
        <defs><clipPath id={clipId}><path d={path}/></clipPath><clipPath id={selectionClipId}><polygon points={toothSelectionBoundary(textureCenters[r].map(([x,y])=>({x,y})),i)}/></clipPath></defs>
        <circle cx={tx} cy={ty} r={Math.min(rx,ry,15)} fill="transparent"/>{selected.includes(id)&&<g pointerEvents="none">{colors.map((style,j)=>{const a=j*2*Math.PI/colors.length,b=(j+1)*2*Math.PI/colors.length;const fill=style==="selected"?"#4ba77d":style==="undefined"?"white":style==="active"?"#e55764":"#359bd1";const stroke=style==="undefined"?"#d94353":"white";return colors.length===1?<circle key={style} cx={tx} cy={ty} r="9" fill={fill} stroke={stroke} strokeWidth="2"/>:<path key={style} d={`M${tx} ${ty} L${tx+9*Math.cos(a)} ${ty+9*Math.sin(a)} A9 9 0 ${b-a>Math.PI?1:0} 1 ${tx+9*Math.cos(b)} ${ty+9*Math.sin(b)} Z`} fill={fill} stroke={stroke} strokeWidth="1.5"/>;})}</g>}
        <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle">{id}</text>
      </g>;
    }))}
  </svg>;
}
const angles = ["Perfil esquerdo · 90°", "Esquerda · 45°", "Frente", "Direita · 45°", "Perfil direito · 90°"];
type Angle = -2 | -1 | 0 | 1 | 2;
type Mark = { id: string; layer: number; angle: Angle; gender: "female" | "male"; x: number; y: number; note: string; region: string; kind: "point" | "zone" | "line" | "pen"; color?:string; points?:{x:number;y:number}[]; size: number; width?:number; height?:number; endX?:number; endY?:number };
type Service = { id: string; name: string; price: number | null };
type Stock = { id: string; name: string; price: number | null; unit: string };
type Procedure = { id: string; serviceId: string; name: string; quantity: number; price: number | null };
type MaterialLink = { stockId: string; quantity: number };
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const parsePrice = (value?: string) => {
  if (!value) return null;
  const raw = value.replace(/[^\d,.-]/g, "");
  const decimal = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : /\.\d{3}$/.test(raw) ? raw.replace(/\./g, "") : raw;
  const number = Number(decimal);
  return Number.isFinite(number) && number >= 0 ? number : null;
};
function rows(key: string): string[][] { try { const value = JSON.parse(appStorage.getItem(key) ?? "[]"); return Array.isArray(value) ? value.filter((row): row is string[] => Array.isArray(row) && row.every((cell) => typeof cell === "string")) : []; } catch { return []; } }
function regionAt(x: number, y: number, layer: number, angle: Angle) {
  const side = angle === 0 ? (x < 43 ? " (lado esquerdo da imagem)" : x > 57 ? " (lado direito da imagem)" : "") : " (vista lateral)";
  const region = y < 18 ? "do couro cabeludo" : y < 34 ? "frontal" : y < 45 ? "temporal/periocular" : y < 55 ? "malar/nasal" : y < 64 ? "perioral" : y < 73 ? "mandibular" : "cervical";
  return `Região ${region}${side}${layer === 2 || layer === 3 ? " — músculo a confirmar" : ""}`;
}
function ServicePicker({ services, value, onChange }: { services: Service[]; value: string; onChange: (value: string) => void }) {
  const options = services.map(item => ({id: item.id, label: `${item.name}${item.price !== null ? ` · ${money(item.price)}` : ''}`}));
  return <div className="al-service-picker"><ClientSelect label="Serviço cadastrado" hideLabel value={options.find(item => item.id === value)?.label ?? "Selecione um serviço do Catálogo"} options={options.length ? options.map(item => item.label) : ["Nenhum serviço cadastrado"]} onChange={label => onChange(options.find(item => item.label === label)?.id ?? "")}/></div>;
}

export type AnatomyState = { child: boolean; selectedTeeth: number[]; notes: Record<number,string>; faces: Record<number,string[]>; recessions: Record<number,number>; marks: Mark[]; procedures: Record<string,Procedure[]>; groupNote: string; groupMode: boolean; toothConditions?: Record<number,ToothCondition | ToothCondition[]>; surfaceStyles?: Record<string,"satisfactory"|"active"|"undefined">; intraoralExam?: Record<string,string> };
export function ClinicalAtlas({ mode, initial, onSave, onChange, history = [], onHistory }: { history?: {id:string;label:string}[]; onHistory?: (id:string)=>void; mode?: "dental" | "face"; initial?: AnatomyState; onSave?: (value: AnatomyState) => Promise<boolean>; onChange?: (value: AnatomyState) => void }) {
  const [paintStyle,setPaintStyle]=useState<"satisfactory"|"active"|"undefined">("satisfactory");
  const [surfaceStyles,setSurfaceStyles]=useState<NonNullable<AnatomyState["surfaceStyles"]>>({});
  const [showBudget,setShowBudget]=useState(true);
  const [stylesExpanded,setStylesExpanded]=useState(false);
  const [explicitTeeth,setExplicitTeeth]=useState<number[]>([]);
  const historyControl = onHistory ? <div className="al-consult-history"><History size={16}/><ClientSelect label="Histórico de consultas" hideLabel compact value="Histórico" options={history.length ? history.map(item=>item.label) : ["Sem registros"]} onChange={label=>{const entry=history.find(item=>item.label===label);if(entry)onHistory(entry.id);}}/></div> : null;
  const [child, setChild] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [conditions,setConditions]=useState<Record<number,ToothCondition[]>>({});
  const [openTooth,setOpenTooth]=useState<number|null>(null);
  const [recordPicker,setRecordPicker]=useState<string|null>(null);
  const [manualDrafts,setManualDrafts]=useState<Record<string,string>>({});
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [intraoralExam, setIntraoralExam] = useState<Record<string,string>>({});
  const [notes, setNotes] = useState<Record<number,string>>({});
  const [groupNote,setGroupNote]=useState("");
  const [groupMode,setGroupMode]=useState(false);
  const [markTool,setMarkTool]=useState<"point"|"zone"|"line"|"pen"|"eraser">("point");
  const penPoints=useRef<{x:number;y:number}[]>([]);
  const [penDraft,setPenDraft]=useState<{x:number;y:number}[]>([]);
  const [markColor,setMarkColor]=useState("#147faa");
  const [showColors,setShowColors]=useState(false);
  const lineStart=useRef<{x:number;y:number}|null>(null);
  const [lineDraft,setLineDraft]=useState<{x:number;y:number;endX:number;endY:number}|null>(null);
  useEffect(()=>{const cancel=(e:KeyboardEvent)=>{if(e.key==="Escape"){lineStart.current=null;setLineDraft(null);}};window.addEventListener("keydown",cancel);return()=>window.removeEventListener("keydown",cancel);},[]);
  const [faces, setFaces] = useState<Record<number,string[]>>({});
  const [recessions, setRecessions] = useState<Record<number,number>>({});
  const [recessionTooth, setRecessionTooth] = useState<number | null>(null);
  const [layer, setLayer] = useState(0);
  const [gender, setGender] = useState<"female" | "male">("female");
  const [angle, setAngle] = useState<Angle>(0);
  useEffect(()=>{lineStart.current=null;setLineDraft(null);},[angle,gender,markTool]);
  const [turning, setTurning] = useState(false);
  const isProfile = Math.abs(angle)===2;
  const faceAsset = `${gender}-${angle === 0 ? 'front' : Math.abs(angle) === 1 ? 'quarter' : 'profile'}-v${isProfile ? 4 : 3}.png`;
  const faceBounds = isProfile && gender==='female' ? [0,430,830,1230,1640] : [0,409.6,819.2,1228.8,1638.4];
  // Register each panel's nasal landmark in the same frame. Keep the approved
  // scale; atlas panel boundaries are not anatomical alignment anchors.
  const layerShift = gender === 'female'
    ? (isProfile ? [-26,0,-2,-2,0] : Math.abs(angle)===1 ? [3,0,2,5,-8] : [0,0,-6,-11,-19])
    : (isProfile ? [3,0,-3,-3,2] : angle===-1 ? [1,0,0,5,5] : angle===1 ? [1,0,0,-1,-1] : [0,0,-3,-12,-15]);
  const profileEnds = gender === 'female' ? [430,830,1230,1640,2048] : [409.6,819.2,1228.8,1638.4,2048];
  const panelWidth = Math.abs(angle)===2 ? profileEnds[layer]-faceBounds[layer] : 409.6;
  const facialClip = Math.abs(angle)===1 && gender==='male'
    ? `M 12 0 H ${panelWidth-12} V 510 Q ${panelWidth-85} 600 ${panelWidth-55} 683 H 45 Q 95 600 12 510 Z`
    : isProfile
    ? `M 0 0 H ${panelWidth} V 683 H 0 Z`
    : `M 0 0 H ${panelWidth} V 520 Q ${panelWidth-85} 600 ${panelWidth-55} 683 H 45 Q 95 600 0 520 Z`;
  const [marks, renderMarks] = useState<Mark[]>([]);
  const cursorShape = markTool === "point" ? '<circle cx="12" cy="12" r="3" fill="#147faa"/>' : markTool === "zone" ? '<circle cx="12" cy="12" r="9" fill="#147faa22" stroke-dasharray="3 2"/>' : markTool === "line" ? '<path d="M4 20 20 4"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="4" r="2"/>' : markTool === "pen" ? '<path d="m4 20 2-7L16 3l5 5-10 10-7 2ZM14 5l5 5"/>' : '<path d="m3 14 10-10 8 8-8 9H9Z M7 10l8 8M12 21h10"/>';
  const toolCursor = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="#147faa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${cursorShape}</svg>`)}") ${markTool==="line"||markTool==="pen"?"4 20":"12 12"}, auto`;
  const marksRef=useRef<Mark[]>([]);
  const undoMarks=useRef<Mark[][]>([]), redoMarks=useRef<Mark[][]>([]);
  const [historyVersion,setHistoryVersion]=useState(0);
  const checkpointMarks=()=>{undoMarks.current.push(structuredClone(marksRef.current));redoMarks.current=[];setHistoryVersion(v=>v+1);};
  const setMarks=(update:(old:Mark[])=>Mark[],record=true)=>{if(record)checkpointMarks();const next=update(marksRef.current);marksRef.current=next;renderMarks(next);};
  const travelMarks=(redo:boolean)=>{const from=redo?redoMarks.current:undoMarks.current,to=redo?undoMarks.current:redoMarks.current;const next=from.pop();if(!next)return;to.push(structuredClone(marksRef.current));marksRef.current=next;renderMarks(next);setSelected(null);setHistoryVersion(v=>v+1);};
  const [selected, setSelected] = useState<string | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [links, setLinks] = useState<Record<string, MaterialLink[]>>({});
  const [procedures, setProcedures] = useState<Record<string, Procedure[]>>({});
  const [serviceChoice, setServiceChoice] = useState("");
  const [showServices, setShowServices] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [stockChoice, setStockChoice] = useState("");
  const [stockQuantity, setStockQuantity] = useState(1);
  const faceRef = useRef<HTMLDivElement>(null);
  const erasePrevious=useRef<{x:number;y:number}|null>(null);
  const [toolPointer,setToolPointer]=useState<{x:number;y:number}|null>(null);
  const eraseAt=(clientX:number,clientY:number)=>{
    const box=faceRef.current?.getBoundingClientRect();if(!box)return;
    const end={x:clientX-box.left,y:clientY-box.top},start=erasePrevious.current??end;
    erasePrevious.current=end;
    const steps=Math.max(1,Math.ceil(Math.hypot(end.x-start.x,end.y-start.y)/6));
    const distance=(p:{x:number;y:number},a:{x:number;y:number},b:{x:number;y:number})=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};
    const pixel=(p:{x:number;y:number})=>({x:p.x*box.width/100,y:p.y*box.height/100});
    const hit=(m:Mark)=>{if(m.gender!==gender||m.angle!==angle)return false;const center=pixel(m);for(let i=0;i<=steps;i++){const p={x:start.x+(end.x-start.x)*i/steps,y:start.y+(end.y-start.y)*i/steps};
      if(m.kind==="zone"){const rx=(m.width??m.size)*box.width/200+12,ry=(m.height??m.size)*box.height/200+12;if(((p.x-center.x)/rx)**2+((p.y-center.y)/ry)**2<=1)return true;}
      else if(m.kind==="line"){if(distance(p,center,pixel({x:m.endX??m.x,y:m.endY??m.y}))<=14)return true;}
      else if(m.kind==="pen"){const points=m.points??[];for(let j=1;j<points.length;j++)if(distance(p,pixel(points[j-1]),pixel(points[j]))<=14)return true;}
      else if(Math.hypot(p.x-center.x,p.y-center.y)<=22)return true;
    }return false;};
    const ids=new Set(marksRef.current.filter(hit).map(m=>m.id));if(ids.size){setMarks(old=>old.filter(m=>!ids.has(m.id)),false);if(selected&&ids.has(selected))setSelected(null);}
  };
  const trashRef = useRef<HTMLDivElement>(null);
  const turnStart = useRef<{x: number; angle: Angle} | null>(null);
  const resizeStart=useRef<{id:string;clientX:number;clientY:number;x:number;y:number;width:number;height:number;edgeX:number;edgeY:number}|null>(null);
  const suppressMarkClick=useRef(false);
  const pinStart = useRef<{id: string; x: number; y: number} | null>(null);
  const current = marks.find(m => m.id === selected);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!initial) return;
    setConditions(Object.fromEntries(Object.entries(initial.toothConditions ?? {}).map(([id,value])=>[id, (Array.isArray(value)?value:[value]).map(v=>String(v)==="Ausente / extraído"?"Ausente":String(v)==="Aparelho ortodôntico"?"Aparelho":v).filter(v=>v!=="Presente")]))); setChild(initial.child); setExplicitTeeth(initial.selectedTeeth.filter(id=>!initial.faces[id]?.length)); setSelectedTeeth(initial.selectedTeeth); setActive(initial.selectedTeeth.at(-1) ?? null);
    setIntraoralExam(initial.intraoralExam??{}); setSurfaceStyles(initial.surfaceStyles??{}); setNotes(initial.notes); setFaces(initial.faces); setRecessions(initial.recessions); renderMarks(initial.marks); marksRef.current = initial.marks;
    setProcedures(initial.procedures); setGroupNote(initial.groupNote); setGroupMode(initial.groupMode);
  }, []);
  const firstAtlasChange = useRef(true);
  useEffect(() => { if(firstAtlasChange.current){firstAtlasChange.current=false;return;} onChange?.({child,selectedTeeth,notes,faces,recessions,marks,procedures,groupNote,groupMode,toothConditions:conditions,surfaceStyles,intraoralExam}); }, [child,selectedTeeth,notes,faces,recessions,marks,procedures,groupNote,groupMode,conditions,surfaceStyles,intraoralExam,onChange]);
  const saveAtlas = async () => { const value = { child, selectedTeeth, notes, faces, recessions, marks, procedures, groupNote, groupMode, toothConditions:conditions, surfaceStyles, intraoralExam }; setSaved(onSave ? await onSave(value) : true); };
  useEffect(() => {
    const boneImage = new Image(); boneImage.src = '/clinical-lab/bone-atlas-v1.png';
    for(const sex of ["female","male"]) for(const view of ["front-v3","quarter-v3","profile-v4"]) { const image=new Image();image.src=`/clinical-lab/${sex}-${view}.png`; }
    const all = [...catalogDefaults, ...rows("gest-catalog-records"), ...rows("gest-priced-catalog")].filter(row => row[2] === "Serviço" && row[1]?.trim()).map(row => ({id: row[0], name: row[1], price: parsePrice(row[4])}));
    setServices([...new Map(all.map(item => [item.id, item])).values()]);
    setStock(rows("gest-stock-records").filter(row => row[1]?.trim()).map(row => ({id: row[0], name: row[1], price: parsePrice(row[5]), unit: row[3]?.match(/[A-Za-zÀ-ÿ]+/)?.[0] ?? "un."})));
    try { const value = JSON.parse(appStorage.getItem("gest-lab-anatomy-material-links") ?? "{}"); if (value && typeof value === "object" && !Array.isArray(value)) setLinks(value); } catch { /* Vínculos opcionais. */ }
  }, []);
  const contextKey = active !== null ? `tooth:${active}` : current ? `face:${current.id}` : "";
  const selectedProcedures = procedures[contextKey] ?? [];
  const selectedService = services.find(item => item.id === serviceChoice);
  const total = selectedProcedures.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  const materialEstimates = useMemo(() => {
    const quantities = new Map<string, number>();
    selectedProcedures.forEach(item => (links[item.serviceId] ?? []).forEach(link => quantities.set(link.stockId, (quantities.get(link.stockId) ?? 0) + link.quantity * item.quantity)));
    return [...quantities].map(([id, quantity]) => ({product: stock.find(item => item.id === id), quantity})).filter((item): item is {product: Stock; quantity: number} => Boolean(item.product));
  }, [selectedProcedures, links, stock]);
  const toothMarked = (id: number) => selectedTeeth.includes(id);
  const choose = (id: number) => { const marked = selectedTeeth.includes(id); setExplicitTeeth(old=>marked?old.filter(v=>v!==id):[...old,id]); const next = marked ? selectedTeeth.filter(value => value !== id) : [...selectedTeeth, id]; setSelectedTeeth(next); setActive(marked ? (active === id ? next.at(-1) ?? null : active) : id); setSelected(null); setServiceChoice(""); setSaved(false); };
  const focusTooth = (id: number) => { setSelectedTeeth(old => old.includes(id) ? old : [...old, id]); setActive(id); setSelected(null); setServiceChoice(""); setSaved(false); };
  const chooseMark = (id: string) => { setSelected(old => old === id ? null : id); setActive(null); setServiceChoice(""); setSaved(false); };
  const turn = (next: Angle) => { setAngle(next); setSelected(null); };
  const addMark = (x: number, y: number) => { if(markTool==="eraser")return; const id = crypto.randomUUID(); const start=markTool==='line'?lineStart.current:null; setMarks(old => [...old, {id, layer, angle, gender, x:start?.x??x, y:start?.y??y, endX:x,endY:y,kind:markTool,color:markColor,size:12,note:"", region: regionAt(x,y,layer,angle)}]);lineStart.current=null;setLineDraft(null); chooseMark(id); };
  useEffect(()=>{
    if(markTool!=="eraser")return;
    const down=(e:PointerEvent)=>{if(e.button!==0||!faceRef.current?.contains(e.target as Node))return;e.preventDefault();e.stopPropagation();checkpointMarks();erasePrevious.current=null;eraseAt(e.clientX,e.clientY);};
    const move=(e:PointerEvent)=>{if(!erasePrevious.current)return;if(!(e.buttons&1)){erasePrevious.current=null;return;}e.preventDefault();e.stopPropagation();eraseAt(e.clientX,e.clientY);};
    const up=()=>{erasePrevious.current=null;};
    window.addEventListener("pointerdown",down,true);window.addEventListener("pointermove",move,true);window.addEventListener("pointerup",up,true);window.addEventListener("pointercancel",up,true);window.addEventListener("blur",up);
    return()=>{window.removeEventListener("pointerdown",down,true);window.removeEventListener("pointermove",move,true);window.removeEventListener("pointerup",up,true);window.removeEventListener("pointercancel",up,true);window.removeEventListener("blur",up);};
  },[markTool,angle,gender,selected]);
  const removeMark = (id: string) => { setMarks(old => old.filter(mark => mark.id !== id));  if (selected === id) setSelected(null); setDragged(null); };
  const saveLinks = (next: Record<string, MaterialLink[]>) => { setLinks(next); appStorage.setItem("gest-lab-anatomy-material-links", JSON.stringify(next)); };
  const procedureEditor = contextKey ? <div className="al-procedures"><h4>Procedimentos neste local</h4><div className="al-procedure-entry"><input aria-label="Nome do procedimento" placeholder="Digite o procedimento" value={manualName} onChange={e=>setManualName(e.target.value)}/><button type="button" className="al-secondary" aria-label="Selecionar procedimentos cadastrados" aria-expanded={showServices} onClick={()=>setShowServices(v=>!v)}>+</button></div><div className="al-manual-entry"><input aria-label="Preço do procedimento" placeholder="Valor (opcional)" value={manualPrice} onChange={e=>setManualPrice(e.target.value)}/><button type="button" className="al-secondary" disabled={!manualName.trim()} onClick={()=>{setProcedures(old=>({...old,[contextKey]:[...(old[contextKey]??[]),{id:crypto.randomUUID(),serviceId:'',name:manualName.trim(),quantity:1,price:parsePrice(manualPrice)}]}));setManualName('');setManualPrice('');setSaved(false);}}>Adicionar procedimento</button></div>{showServices && <div className="al-service-options">{services.length ? services.map(service=><button type="button" className="al-secondary" key={service.id} onClick={()=>{setProcedures(old=>({...old,[contextKey]:[...(old[contextKey]??[]),{id:crypto.randomUUID(),serviceId:service.id,name:service.name,quantity:1,price:service.price}]}));setServiceChoice(service.id);setSaved(false);}}>{service.name}{service.price!==null?' · '+money(service.price):''}</button>) : <p>Cadastre um serviço no Catálogo para selecioná-lo aqui.</p>}</div>}
    {selectedProcedures.map(item => <div className="al-procedure-line" key={item.id}><span>{item.name}</span><label>Qtd. <input type="number" min="0.01" step="0.01" value={item.quantity} onChange={event => setProcedures(old => ({...old, [contextKey]: (old[contextKey] ?? []).map(row => row.id === item.id ? {...row, quantity: Math.max(0.01, Number(event.target.value) || 1)} : row)}))} /></label><strong>{item.price === null ? "Sem preço" : money(item.price * item.quantity)}</strong><button type="button" aria-label={`Remover ${item.name}`} onClick={() => setProcedures(old => ({...old, [contextKey]: (old[contextKey] ?? []).filter(row => row.id !== item.id)}))}>×</button></div>)}
    {selectedService && <details className="al-material-config"><summary>Materiais previstos para {selectedService.name}</summary><p>Vincule produtos do Estoque uma vez. O consumo será calculado nas próximas seleções.</p><div className="al-add-procedure"><select aria-label="Produto do estoque" value={stockChoice} onChange={event => setStockChoice(event.target.value)}><option value="">Produto do Estoque</option>{stock.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><label>Qtd. <input type="number" min="0.01" step="0.01" value={stockQuantity} onChange={event => setStockQuantity(Number(event.target.value))} /></label><button type="button" className="al-secondary" disabled={!stockChoice || !Number.isFinite(stockQuantity) || stockQuantity <= 0} onClick={() => { saveLinks({...links, [selectedService.id]: [...(links[selectedService.id] ?? []).filter(item => item.stockId !== stockChoice), {stockId: stockChoice, quantity: stockQuantity}]}); setStockChoice(""); setStockQuantity(1); }}>Vincular</button></div>{(links[selectedService.id] ?? []).map(item => <div key={item.stockId} className="al-material-line">{stock.find(product => product.id === item.stockId)?.name ?? "Produto indisponível"} · {item.quantity} <button type="button" aria-label="Desvincular material" onClick={() => saveLinks({...links, [selectedService.id]: (links[selectedService.id] ?? []).filter(link => link.stockId !== item.stockId)})}>×</button></div>)}{!stock.length && <p>Cadastre produtos no Estoque para prever o consumo.</p>}</details>}
    <div className="al-estimate"><div><span>Orçamento estimado</span><strong>{money(total)}{selectedProcedures.some(item => item.price === null) && " + itens sem preço"}</strong></div><div><span>Materiais previstos</span><strong>{materialEstimates.length ? money(materialEstimates.reduce((sum,item) => sum + (item.product.price ?? 0) * item.quantity, 0)) : "Sem vínculo"}</strong></div></div>{!!materialEstimates.length && <ul className="al-material-list">{materialEstimates.map(item => <li key={item.product.id}>{item.product.name}: {item.quantity.toLocaleString("pt-BR")} {item.product.unit}{item.product.price === null ? " · sem custo cadastrado" : ` · ${money(item.product.price * item.quantity)}`}</li>)}</ul>}<small>Estimativa da prévia. Não há lançamento no estoque ou financeiro.</small>
  </div> : null;
  const toggle = (id: number, sector: string) => {
    const key = `${id}:${sector}`;
    const previous = surfaceStyles[key] ?? "satisfactory";
    const remove = faces[id]?.includes(sector) && previous === paintStyle;
    const remaining=remove?(faces[id]??[]).filter(v=>v!==sector):[...new Set([...(faces[id]??[]),sector])];
    setFaces(old=>({...old,[id]:remaining}));
    if(remaining.length)focusTooth(id);else if(!explicitTeeth.includes(id)){const next=selectedTeeth.filter(v=>v!==id);setSelectedTeeth(next);setActive(next.at(-1)??null);}
    setSurfaceStyles(old=>({...old,[key]:paintStyle}));
    setSaved(false);
  };
  const updateRecession = (id: number, value: number) => {
    if (!Number.isFinite(value)) return;
    const mm = Math.round(Math.min(20, Math.max(0, value)) * 10) / 10;
    setRecessions(old => {
      const next = {...old};
      if (mm > 0) next[id] = mm; else delete next[id];
      return next;
    });
    setSaved(false);
  };
  const frontalUpper = child ? childUpper : upper;
  const frontalLower = child ? childLower : lower;
  return <main className={`anatomy-lab ${child ? "al-child-dentition" : ""} ${mode ? "al-embedded al-mode-" + mode : ""}`}>
    <header className="al-heading"><div><span>LABORATÓRIO · PRÉVIA VISUAL</span><h1>Atlas clínico</h1><p>Dois odontogramas e seis camadas faciais para experimentar.</p></div><a className="lab-create-activity" href="/laboratorio">Voltar ao laboratório</a></header>
    <aside className="al-notice">Ilustrações geradas para avaliação visual. Anatomia e áreas de seleção ainda precisam de validação profissional antes do uso clínico. As anotações desta prévia não são prontuários.</aside>
    <section className="al-panel al-dental-panel"><header><div>{mode ? <Smile size={18} /> : <span className="al-step">1</span>}<h2>{mode ? "Odontograma" : "Odontogramas"}</h2></div></header>
      <div className="al-dental-grid">
        <article><div className="al-front-heading"><h3><SectionNumber value={1} />Vista frontal</h3>{historyControl}<details className="al-front-info"><summary aria-label="Informações da vista frontal">i</summary><div>Todas as medidas de recessão são em milímetros. A linha vermelha indica a recessão; o azul indica os procedimentos selecionados. Clique novamente no elemento para desmarcar.</div></details></div><p>Selecione o elemento abaixo.</p>
          <div className="al-front-workspace"><div className={`al-dental-tools ${stylesExpanded?"is-expanded":""}`} onMouseEnter={()=>setStylesExpanded(true)} onMouseLeave={()=>setStylesExpanded(false)} aria-label="Estilo da marcação">{([{id:"satisfactory",label:"Satisfatório"},{id:"active",label:"Insatisfatório"},{id:"undefined",label:"Ativo"}] as const).map(style=><button type="button" key={style.id} aria-label={style.label} title={style.label} aria-pressed={paintStyle===style.id} onClick={()=>{setPaintStyle(style.id);setStylesExpanded(false);}}><span className={`al-style-swatch ${style.id}`}/><span>{style.label}</span></button>)}</div><div className="al-front-content"><div className="al-frontal-row upper" role="group" aria-label="Elementos superiores, vista frontal">{frontalUpper.map((id,i) => <div className="al-tooth-cell" key={id} onMouseEnter={()=>setOpenTooth(id)} onMouseLeave={()=>setOpenTooth(null)}><button type="button" key={id} className={`al-front-target ${toothMarked(id) ? "is-marked" : ""}`} aria-label={`Selecionar elemento ${id} frontal`} aria-pressed={toothMarked(id)} onFocus={()=>setOpenTooth(id)} onClick={() => {choose(id);setRecessionTooth(id);}}><span>{id}</span><FrontTooth index={child ? childFrontIndices[i] : i} lower={false} recession={recessions[id]} condition={conditions[id]}/></button><div className="al-tooth-menu" style={{display:openTooth===id?"block":"none"}}><strong>Elemento {id}</strong><div className="al-condition-options">{toothConditions.map(value=><button type="button" key={value} aria-pressed={(conditions[id]??[]).includes(value)} onClick={()=>{setConditions(old=>{const list=old[id]??[];return {...old,[id]:list.includes(value)?list.filter(v=>v!==value):[...list,value]};});setOpenTooth(null);setSaved(false);}}>{value}</button>)}</div></div></div>)}</div>
<div className="al-surface-pair">{[frontalUpper,frontalLower].map((row,r) => <div className={`al-surface-row ${r ? "lower" : ""}`} key={r} aria-label={`Faces dos elementos ${r ? "inferiores" : "superiores"}`}>{row.map(id => <div key={id}><svg viewBox="-1 -1 42 42" aria-label={`Faces do elemento ${id}`}>{Object.entries(sectors).map(([name,points]) => <polygon key={name} points={points} role="button" tabIndex={0} aria-label={`Elemento ${id}, setor ${name}`} aria-pressed={faces[id]?.includes(name) ?? false} className={faces[id]?.includes(name) ? "marked" : ""} style={faces[id]?.includes(name)?{fill:surfaceStyles[`${id}:${name}`]==="undefined"?"#fff":surfaceStyles[`${id}:${name}`]==="active"?"#e55764":"#359bd1",stroke:surfaceStyles[`${id}:${name}`]==="active"||surfaceStyles[`${id}:${name}`]==="undefined"?"#d94353":"#2483b2",strokeWidth:surfaceStyles[`${id}:${name}`]==="undefined"?4:2,strokeLinejoin:"round"}:undefined} onClick={() => toggle(id,name)} onKeyDown={e => {if(e.key === "Enter" || e.key === " "){e.preventDefault();toggle(id,name);}}}/>)}</svg><RecessionControl id={id} value={recessions[id]??0} onChange={value=>updateRecession(id,value)}/></div>)}</div>)}</div>
          <div className="al-frontal-row lower" role="group" aria-label="Elementos inferiores, vista frontal">{frontalLower.map((id,i) => <div className="al-tooth-cell" key={id} onMouseEnter={()=>setOpenTooth(id)} onMouseLeave={()=>setOpenTooth(null)}><button type="button" key={id} className={`al-front-target ${toothMarked(id) ? "is-marked" : ""}`} aria-label={`Selecionar elemento ${id} frontal`} aria-pressed={toothMarked(id)} onFocus={()=>setOpenTooth(id)} onClick={() => {choose(id);setRecessionTooth(id);}}><span>{id}</span><FrontTooth index={child ? childFrontIndices[i] : i} lower recession={recessions[id]} condition={conditions[id]}/></button><div className="al-tooth-menu" style={{display:openTooth===id?"block":"none"}}><strong>Elemento {id}</strong><div className="al-condition-options">{toothConditions.map(value=><button type="button" key={value} aria-pressed={(conditions[id]??[]).includes(value)} onClick={()=>{setConditions(old=>{const list=old[id]??[];return {...old,[id]:list.includes(value)?list.filter(v=>v!==value):[...list,value]};});setOpenTooth(null);setSaved(false);}}>{value}</button>)}</div></div></div>)}</div>
        </div></div></article>
        <article><div className="al-arch-heading"><h3><SectionNumber value={2} />Vista oclusal</h3><div className="al-model-toggle" role="group" aria-label="Dentição">{["Adulto","Infantil"].map(value=><button type="button" key={value} aria-pressed={child===(value==="Infantil")} onClick={()=>{setChild(value==="Infantil");setActive(null);}}>{value}</button>)}</div></div>
          <p>Selecione o elemento abaixo.</p>
          <div className={`al-arches ${child ? "child" : ""}`} role="group" aria-label="Arcadas dentárias">
            <OcclusalAtlas child={child} selected={selectedTeeth} choose={choose} faces={faces} styles={surfaceStyles}/>
          </div>
        </article>
      </div>
      <div className="al-note"><button type="button" className="al-secondary" disabled={!selectedTeeth.length} onClick={()=>{setExplicitTeeth([]);setSelectedTeeth([]);setFaces({});setSurfaceStyles({});setActive(null);setGroupNote("");setSaved(false);}}>Desmarcar todos os elementos</button><div className="al-dental-record"><div className="al-tooth-observations"><h3><SectionNumber value={3} />Observações por elemento ou grupo</h3><label><span><input type="checkbox" checked={groupMode} onChange={e=>setGroupMode(e.target.checked)}/> Preencher em grupo</span></label><div className="al-individual-notes">{(groupMode ? (selectedTeeth.length ? [selectedTeeth] : []) : selectedTeeth.map(id=>[id])).map(ids=>{
 const key=groupMode?"group":"tooth:"+ids[0];
 const items=groupMode?(procedures["tooth:"+ids[0]]??[]):(procedures[key]??[]);
 const add=(service:Service)=>{setProcedures(old=>{const updated={...old};ids.forEach(id=>{const target="tooth:"+id;updated[target]=[...(old[target]??[]),{id:crypto.randomUUID(),serviceId:service.id,name:service.name,price:service.price,quantity:1}];});return updated;});setSaved(false);};
 return <div className="al-tooth-record-card" key={key}><div className="al-tooth-record-heading"><strong>{groupMode?"Elementos "+ids.join(", "):"Elemento "+ids[0]}</strong><button type="button" className="al-secondary" aria-expanded={recordPicker===key} onClick={()=>setRecordPicker(recordPicker===key?null:key)}>+ Inserir procedimento</button></div>{recordPicker===key&&<div className="al-record-services"><div className="al-record-service-list" aria-label="Serviços cadastrados">{services.length?services.map(service=><button type="button" key={service.id} onClick={()=>add(service)}><span>{service.name}</span><small>{service.price===null?"+":money(service.price)}</small></button>):<p>Nenhum serviço cadastrado. Você pode inserir um procedimento abaixo.</p>}</div><div className="al-procedure-entry"><input aria-label="Procedimento manual" placeholder="Ou digite um procedimento" value={manualDrafts[key]??""} onChange={e=>setManualDrafts(old=>({...old,[key]:e.target.value}))}/><button type="button" className="al-secondary" disabled={!manualDrafts[key]?.trim()} onClick={()=>{add({id:"",name:manualDrafts[key].trim(),price:null});setManualDrafts(old=>({...old,[key]:""}));}}>Adicionar</button></div></div>}<textarea aria-label={groupMode?"Observação do grupo":"Observação do elemento "+ids[0]} placeholder="O que foi realizado?" value={groupMode?groupNote:notes[ids[0]]??""} onChange={e=>{const value=e.target.value;if(groupMode)setGroupNote(value);setNotes(old=>({...old,...Object.fromEntries(ids.map(id=>[id,value]))}));setSaved(false);}}/>{items.map((item,index)=><div className="al-procedure-line" key={item.id}><span>{item.name}</span><input aria-label={"Quantidade de "+item.name} type="number" min="1" step="1" value={item.quantity} onChange={e=>{const quantity=Math.max(1,Math.round(Number(e.target.value)||1));setProcedures(old=>({...old,...Object.fromEntries(ids.map(id=>{const target="tooth:"+id;return [target,(old[target]??[]).map((p,i)=>i===index?{...p,quantity}:p)];}))}));setSaved(false);}}/><button type="button" aria-label={"Remover "+item.name} onClick={()=>{setProcedures(old=>({...old,...Object.fromEntries(ids.map(id=>{const target="tooth:"+id;return [target,(old[target]??[]).filter((_,i)=>i!==index)];}))}));setSaved(false);}}>×</button></div>)}</div>;
})}{!selectedTeeth.length&&<p>Selecione um elemento para anotar.</p>}</div></div></div><IntraoralExam value={intraoralExam} onChange={value=>{setIntraoralExam(value);setSaved(false);}}/><div className="al-dental-budget"><h3><SectionNumber value={6} />Orçamento e materiais previstos · todos os elementos<button type="button" className="al-budget-toggle" aria-label={showBudget?"Ocultar orçamento e materiais":"Mostrar orçamento e materiais"} aria-expanded={showBudget} onClick={()=>setShowBudget(v=>!v)}>{showBudget?<Eye size={18}/>:<EyeOff size={18}/>}</button></h3><div><strong>{!showBudget?"——":money(selectedTeeth.reduce((sum,id)=>sum+(procedures[`tooth:${id}`]??[]).reduce((value,p)=>value+(p.price??0)*p.quantity,0),0))}</strong>{selectedTeeth.flatMap(id=>(procedures[`tooth:${id}`]??[]).map(p=><div key={p.id}>Elemento {id} · {p.name} · {p.quantity} · {!showBudget?'——':p.price===null?'Sem preço':money(p.price*p.quantity)}</div>))}<ul>{selectedTeeth.flatMap(id=>(procedures[`tooth:${id}`]??[]).flatMap(p=>(links[p.serviceId]??[]).map(link=><li key={`${id}-${p.id}-${link.stockId}`}>{stock.find(s=>s.id===link.stockId)?.name??'Material'} · {showBudget?(link.quantity*p.quantity).toLocaleString('pt-BR'):'——'}</li>)))}</ul><small>Prévia de laboratório: não lança dados no prontuário, estoque ou financeiro.</small></div></div><button type="button" className="lab-create-activity" disabled={!selectedTeeth.length && !Object.values(intraoralExam).some(Boolean)} onClick={saveAtlas}>{mode ? "Salvar rascunho" : "Registrar atendimento"}</button>{saved && <span role="status">{mode ? "Salvo no prontuário." : "Registrado nesta sessão de laboratório."}</span>}</div>
    </section>
    <section className="al-panel al-facial-panel"><header><div>{mode ? <ScanFace size={18} /> : <span className="al-step">2</span>}<h2>{mode ? "ROC" : "Mapa facial"}</h2></div>{historyControl}</header>
      <div className="al-face-toolbar"><div className="al-layer-tabs">{layers.map((name,i) => <button key={name} aria-pressed={layer===i} onClick={() => {setLayer(i);}}><span>{i+1}</span>{name}</button>)}</div><div className="al-model-toggle" role="group" aria-label="Modelo facial">{["Feminino","Masculino"].map(value=><button type="button" key={value} aria-pressed={gender===(value==="Feminino"?"female":"male")} onClick={()=>{setGender(value==="Feminino"?"female":"male");setSelected(null);}}>{value}</button>)}</div></div>
      <div className="al-face-layout"><div className="al-face-column"><div className="al-turn-controls"><button type="button" onClick={() => turn(Math.max(-2, angle-1) as Angle)} disabled={angle===-2} aria-label="Girar para a esquerda">‹</button><span>{angles[angle+2]}</span><button type="button" onClick={() => turn(Math.min(2, angle+1) as Angle)} disabled={angle===2} aria-label="Girar para a direita">›</button></div>
      <div className="al-face-tools" aria-label="Ferramentas de marcação"><div className="al-mark-history"><button type="button" aria-label="Desfazer marcação" title="Desfazer" disabled={!undoMarks.current.length} onClick={()=>travelMarks(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5 4 10l5 5M4 10h9a6 6 0 0 1 6 6v3"/></svg></button><button type="button" aria-label="Refazer marcação" title="Refazer" disabled={!redoMarks.current.length} onClick={()=>travelMarks(true)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5 5 5-5 5M20 10h-9a6 6 0 0 0-6 6v3"/></svg></button></div>{(["point","zone","line","pen","eraser"] as const).map(tool=><button type="button" key={tool} aria-label={tool==="point"?"Ponto":tool==="zone"?"Zona":tool==="line"?"Linha":tool==="pen"?"Caneta":"Borracha"} className={markTool===tool?"active":""} onClick={()=>{setMarkTool(tool);setShowColors(tool!=="eraser");}}><span aria-hidden="true">{tool==="point"?"•":tool==="zone"?"◌":tool==="line"?"╱":tool==="pen"?"✎":"▱"}</span><span className="al-tool-label">{tool==="point"?"Ponto":tool==="zone"?"Zona":tool==="line"?"Linha":tool==="pen"?"Caneta":"Borracha"}</span></button>)}<button type="button" aria-expanded={showColors} onClick={()=>setShowColors(v=>!v)} aria-label="Cor"><span className="al-tool-label">Cor</span><span className="al-current-color" style={{background:current?.color??markColor}}/></button>{showColors&&<div className="al-color-palette" aria-label="Cores da marcação">{[{name:'Azul',value:'#147faa'},{name:'Violeta',value:'#8757cf'},{name:'Rosa',value:'#d34383'},{name:'Laranja',value:'#e68a19'},{name:'Verde',value:'#248366'},{name:'Branco',value:'#ffffff'}].map(color=><button type="button" key={color.value} aria-label={color.name} title={color.name} aria-pressed={(current?.color??markColor)===color.value} style={{background:color.value}} onClick={()=>{setMarkColor(color.value);if(current)setMarks(old=>old.map(m=>m.id===current.id?{...m,color:color.value}:m));}}/>)}</div>}</div><div className={`al-face ${isProfile ? "profile" : ""}`} ref={faceRef} style={{cursor:markTool==="line"?"none":toolCursor,touchAction:markTool==="pen"?"none":undefined}} data-tool={markTool} role="group" aria-label={`Mapa facial: ${layers[layer]}, ${angles[angle+2]}`} onPointerDown={e => { if (e.target===e.currentTarget || (e.target as HTMLElement).classList.contains("al-face-image")) { if(markTool==='line'||markTool==='eraser')return;if(markTool==='pen'){const box=e.currentTarget.getBoundingClientRect();penPoints.current=[{x:(e.clientX-box.left)/box.width*100,y:(e.clientY-box.top)/box.height*100}];setPenDraft([...penPoints.current]);e.currentTarget.setPointerCapture(e.pointerId);return;}turnStart.current={x:e.clientX,angle}; setTurning(true);const box=e.currentTarget.getBoundingClientRect();lineStart.current={x:(e.clientX-box.left)/box.width*100,y:(e.clientY-box.top)/box.height*100}; } }} onPointerLeave={()=>setToolPointer(null)} onPointerMove={e=>{const cursorBox=e.currentTarget.getBoundingClientRect();setToolPointer({x:(e.clientX-cursorBox.left)/cursorBox.width*100,y:(e.clientY-cursorBox.top)/cursorBox.height*100});if(markTool==="line"&&lineStart.current){const box=e.currentTarget.getBoundingClientRect();setLineDraft({...lineStart.current,endX:(e.clientX-box.left)/box.width*100,endY:(e.clientY-box.top)/box.height*100});return;}if(markTool!=='pen'||!penPoints.current.length)return;const box=e.currentTarget.getBoundingClientRect();penPoints.current.push({x:Math.max(0,Math.min(100,(e.clientX-box.left)/box.width*100)),y:Math.max(0,Math.min(100,(e.clientY-box.top)/box.height*100))});setPenDraft([...penPoints.current]);}} onPointerUp={e => { if(markTool==="line"){const target=e.target as Element;if(target!==e.currentTarget&&!target.classList.contains("al-face-image"))return;const box=e.currentTarget.getBoundingClientRect(),x=(e.clientX-box.left)/box.width*100,y=(e.clientY-box.top)/box.height*100;if(lineStart.current)addMark(x,y);else{lineStart.current={x,y};setLineDraft({x,y,endX:x,endY:y});}return;}if(markTool==="eraser")return; if(markTool==='pen'&&penPoints.current.length){const points=penPoints.current;penPoints.current=[];setPenDraft([]);if(points.length>1){const id=crypto.randomUUID();setMarks(old=>[...old,{id,layer,angle,gender,x:points[0].x,y:points[0].y,kind:'pen',color:markColor,points,size:12,note:'',region:regionAt(points[0].x,points[0].y,layer,angle)}]);chooseMark(id);}return;}if(!turnStart.current)return; const distance=e.clientX-turnStart.current.x; setTurning(false); if(Math.abs(distance)>55){turn(Math.max(-2,Math.min(2,turnStart.current.angle+(distance>0?1:-1))) as Angle);turnStart.current=null;return;}turnStart.current=null;if(e.target!==e.currentTarget && !(e.target as HTMLElement).classList.contains("al-face-image"))return;const box=e.currentTarget.getBoundingClientRect();addMark((e.clientX-box.left)/box.width*100,(e.clientY-box.top)/box.height*100); }} onPointerCancel={() => { erasePrevious.current=null; penPoints.current=[];setPenDraft([]);turnStart.current=null; setTurning(false); }}>
        {layer===5 ? <BoneLayer gender={gender} angle={angle}/> : <svg className={`al-face-image ${angle<0 ? "mirror" : ""}`} viewBox={isProfile ? "15 65 385 500" : "-30 0 470 683"} aria-hidden="true"><defs><clipPath id="face-panel-clip"><path d={facialClip}/></clipPath><linearGradient id="face-neck-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="white"/><stop offset=".94" stopColor="white"/><stop offset="1" stopColor="#ccc"/></linearGradient><mask id="face-neck-mask" maskUnits="userSpaceOnUse" x="-30" y="0" width="470" height="683"><rect x="-30" width="470" height="683" fill="url(#face-neck-fade)"/></mask></defs><g mask="url(#face-neck-mask)">{["female","male"].flatMap(sex=>["front-v3","quarter-v3","profile-v4"].map(view=>{const asset=sex+"-"+view+".png";return <svg key={asset} x={layerShift[layer]} width={panelWidth} height="683" viewBox={`0 0 ${panelWidth} 683`} overflow="hidden" opacity={asset===faceAsset?1:0}><image href={`/clinical-lab/${asset}`} x={-faceBounds[layer]} width="2048" height="683" clipPath="url(#face-panel-clip)" preserveAspectRatio="xMidYMid meet"/></svg>;}))}</g></svg>}
<svg className="al-line-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">{lineDraft&&<g pointerEvents="none"><line x1={lineDraft.x} y1={lineDraft.y} x2={lineDraft.endX} y2={lineDraft.endY} stroke={markColor} strokeWidth=".9" strokeDasharray="1.5 1" strokeLinecap="round"/><circle cx={lineDraft.x} cy={lineDraft.y} r=".65" fill={markColor}/></g>}{marks.filter(m=>m.kind==='pen'&&m.angle===angle&&m.gender===gender).map(m=><polyline key={m.id} points={(m.points??[]).map(p=>p.x+','+p.y).join(' ')} fill="none" stroke={m.color??"#147faa"} strokeWidth=".7" strokeLinecap="round" strokeLinejoin="round" style={{pointerEvents:'stroke',cursor:'pointer'}} onClick={e=>{e.stopPropagation();if(markTool==="eraser")removeMark(m.id);else chooseMark(m.id);}}/>)}{penDraft.length>0&&<polyline points={penDraft.map(p=>p.x+','+p.y).join(' ')} fill="none" stroke={markColor} strokeWidth=".7" strokeLinecap="round" strokeLinejoin="round"/>}{marks.filter(m=>m.kind==="line" && m.angle===angle && m.gender===gender).map(m=><line key={m.id} x1={m.x} y1={m.y} x2={m.endX??m.x} y2={m.endY??m.y} stroke={m.color??"#147faa"} strokeWidth=".9" strokeLinecap="round" style={{pointerEvents:"stroke",cursor:"pointer"}} onClick={e=>{e.stopPropagation();if(markTool==="eraser")removeMark(m.id);else chooseMark(m.id);}}/>)}</svg>        <div className={`al-drag-cues ${turning ? "visible" : ""}`} aria-hidden="true"><span>← girar</span><span>girar →</span></div>
        {marks.filter(m=>m.kind!=="line" && m.kind!=="pen" && m.angle===angle && m.gender===gender).map((m,i)=><button type="button" key={m.id} className={`al-pin ${m.kind==="zone"?"al-zone":""} ${selected===m.id ? "selected" : ""}`} style={{background:m.kind==="zone"?`${m.color??"#147faa"}44`:(m.color??"#147faa"),borderColor:m.kind==="zone"?(m.color??"#147faa"):"#fff",color:m.color==="#ffffff"?"#244b64":"#fff",left:`${m.x}%`,top:`${m.y}%`,...(m.kind==="zone"?{width:`${m.width??m.size}%`,height:`${m.height??m.size}%`}:{})}} aria-label={`Editar marcação ${i+1}`} onClick={e=>{e.stopPropagation();if(markTool==="eraser"){removeMark(m.id);return;}if(suppressMarkClick.current){suppressMarkClick.current=false;return;}chooseMark(m.id);}} onPointerDown={e=>{e.stopPropagation();if(markTool==="eraser")return;checkpointMarks();const rect=e.currentTarget.getBoundingClientRect();const edgeX=e.clientX<rect.left+12?-1:e.clientX>rect.right-12?1:0;const edgeY=e.clientY<rect.top+12?-1:e.clientY>rect.bottom-12?1:0;if(m.kind==="zone"&&(edgeX||edgeY)){resizeStart.current={id:m.id,clientX:e.clientX,clientY:e.clientY,x:m.x,y:m.y,width:m.width??m.size,height:m.height??m.size,edgeX,edgeY};setSelected(m.id);}else{pinStart.current={id:m.id,x:e.clientX,y:e.clientY};setDragged(m.id);}e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(m.kind==="zone"&&!resizeStart.current){const rect=e.currentTarget.getBoundingClientRect();const ex=e.clientX<rect.left+12||e.clientX>rect.right-12;const ey=e.clientY<rect.top+12||e.clientY>rect.bottom-12;e.currentTarget.style.cursor=ex&&ey?"nwse-resize":ex?"ew-resize":ey?"ns-resize":"move";}const resize=resizeStart.current;if(resize?.id===m.id&&faceRef.current){const box=faceRef.current.getBoundingClientRect();const dx=(e.clientX-resize.clientX)/box.width*100,dy=(e.clientY-resize.clientY)/box.height*100;const width=Math.max(3,Math.min(60,resize.width+dx*resize.edgeX)),height=Math.max(3,Math.min(60,resize.height+dy*resize.edgeY));setMarks(old=>old.map(item=>item.id===m.id?{...item,width,height,x:resize.x+(width-resize.width)*resize.edgeX/2,y:resize.y+(height-resize.height)*resize.edgeY/2}:item),false);return;}if(pinStart.current?.id!==m.id || !faceRef.current)return;const box=faceRef.current.getBoundingClientRect();const x=Math.max(0,Math.min(100,(e.clientX-box.left)/box.width*100));const y=Math.max(0,Math.min(100,(e.clientY-box.top)/box.height*100));setMarks(old=>old.map(item=>item.id===m.id?{...item,x,y}:item),false);}} onPointerUp={e=>{e.stopPropagation();if(resizeStart.current?.id===m.id){resizeStart.current=null;suppressMarkClick.current=true;return;}if(pinStart.current?.id!==m.id)return;const moved=Math.abs(e.clientX-pinStart.current.x)+Math.abs(e.clientY-pinStart.current.y)>10;const trash=trashRef.current?.getBoundingClientRect();if(moved && trash && e.clientX>=trash.left && e.clientX<=trash.right && e.clientY>=trash.top && e.clientY<=trash.bottom)removeMark(m.id);else setDragged(null);pinStart.current=null;}} onPointerCancel={()=>{resizeStart.current=null;pinStart.current=null;setDragged(null);}}>{i+1}</button>)}
        {markTool==="line"&&toolPointer&&<svg aria-hidden="true" className="al-line-cursor" style={{left:`${toolPointer.x}%`,top:`${toolPointer.y}%`}} width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="#147faa" strokeWidth="2"><path d="M4 20 20 4"/><circle cx="4" cy="20" r="2" fill="#147faa"/><circle cx="20" cy="4" r="2"/></svg>}
        <div ref={trashRef} className={`al-trash ${dragged ? "visible" : ""}`} aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>Solte para excluir</div>
        {marks.some(m=>m.gender===gender&&m.angle!==angle)&&<div className="al-other-views" aria-label="Marcações em outros ângulos"><span>↗ Marcações em outras vistas</span>{([-2,-1,0,1,2] as Angle[]).filter(view=>view!==angle&&marks.some(m=>m.gender===gender&&m.angle===view)).map(view=><button type="button" key={view} onClick={()=>{setAngle(view);setSelected(marks.find(m=>m.gender===gender&&m.angle===view)?.id??null);}}>{angles[view+2]} · {marks.filter(m=>m.gender===gender&&m.angle===view).length}</button>)}</div>}
      </div></div>
      <div className="al-face-notes"><h3>{layers[layer]}</h3><p>Marque a região na vista escolhida. A sugestão de nome pode ser corrigida.</p><button type="button" className="al-secondary" onClick={()=>addMark(50,48)}>Adicionar marcação</button>
        {current ? <>{current.kind==="zone" && <label>Tamanho da zona<input type="range" min="4" max="40" value={current.size} onChange={e=>setMarks(old=>old.map(m=>m.id===current.id?{...m,size:Number(e.target.value),width:Number(e.target.value),height:Number(e.target.value)}:m))}/></label>}<label>Região ou músculo<input value={current.region} onChange={e=>setMarks(old=>old.map(m=>m.id===selected?{...m,region:e.target.value}:m))}/></label><small>Sugestão visual automática. Confirme a anatomia antes de usar.</small><label>Observações<textarea rows={3} value={current.note} placeholder="O que foi realizado neste local?" onChange={e=>setMarks(old=>old.map(m=>m.id===selected?{...m,note:e.target.value}:m))}/></label>{procedureEditor}<button type="button" className="al-secondary" onClick={()=>removeMark(current.id)}>Excluir este ponto</button></> : null}
        <div className="al-mark-list">{marks.filter(m=>m.gender===gender).map((m,i)=><div key={m.id}><button type="button" onClick={()=>{setAngle(m.angle);setSelected(m.id);setActive(null);setServiceChoice("");}}><strong>{i+1} · {m.region}</strong><small>Vista: {angles[m.angle+2]}</small><span>{procedures[`face:${m.id}`]?.length ? `${procedures[`face:${m.id}`].length} procedimento(s)` : m.note || "Sem anotação"}</span></button><button type="button" className="al-list-delete" aria-label={`Excluir marcação ${i+1}`} onClick={()=>removeMark(m.id)}>×</button></div>)}</div>
      </div></div>
    </section>
    {(!mode || mode === "face") && <p className="clinical-disclaimer">As vistas laterais são ilustrações; as regiões sugeridas exigem confirmação profissional. As marcações permanecem entre camadas. Use os indicadores para consultar outros ângulos; a posição não é projetada automaticamente entre vistas.</p>}
    {mode && <button type="button" className="lab-create-activity" onClick={saveAtlas}>Salvar {mode === "dental" ? "odontograma" : "ROC"}</button>}
  </main>;
}
function Gate(){const access=useAccess();if(access.loading)return <p>Carregando…</p>;if(!access.member || !access.manage)return <p>Acesso exclusivo do administrador. <a href="/inicio">Voltar</a></p>;return <ClinicalAtlas/>;}
export default function AnatomyLaboratory(){return <AccessProvider><Gate/></AccessProvider>;}
