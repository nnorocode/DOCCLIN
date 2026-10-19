"use client";
import { useEffect, useRef, useState } from "react";
import { TurntableImage as AtlasImage } from "./TurntableImage";
import { turntableSources } from "./turntable";
import { ArrowLeft, ScanFace, Circle, Pencil, Spline, Eraser, MoveHorizontal, Undo2, Redo2, Trash2, Ruler } from "lucide-react";
import { AccessProvider, useAccess } from "../../inicio/AccessControl";
import "./preview.css";
const layers=["Pele","Tecido subcutâneo","Músculos superficiais","Músculos profundos","Vasos e nervos","Ossos"];
const angles=[-90,-45,0,45,90];
const hairlessTrial="/clinical-lab/roc-v2/male-subcutaneous-hairless-trial.png";
type Sex="female"|"male";
type Tool="rotate"|"point"|"zone"|"line"|"pen"|"eraser";
type XY={x:number;y:number};
type Mark={id:string;sex:Sex;angle:number;tool:Tool;points:XY[];color:string;size:number;note:string};
const angleName=(a:number)=>a===0?"Frente":`${Math.abs(a)}° ${a<0?"esquerda":"direita"}`;
// Visual landmarks in the atlas's 2048 × 683 coordinate frame.
// Uniform transforms: no anisotropic stretching or claim of anatomical registration.
function distance(p:XY,a:XY,b:XY){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
function Preview(){
  const[showTrial,setShowTrial]=useState(false);
  const[sex,setSex]=useState<Sex>("female"),[angle,setAngle]=useState(0),[layer,setLayer]=useState(0),[tool,setTool]=useState<Tool>("rotate"),[color,setColor]=useState("#147faa"),[guides,setGuides]=useState(false);
  const[marks,setMarks]=useState<Mark[]>([]),[selected,setSelected]=useState<string|null>(null),[draft,setDraft]=useState<XY[]>([]),[ready,setReady]=useState(false),[error,setError]=useState(false);
  const stage=useRef<SVGSVGElement>(null),gesture=useRef<{point:XY;angle:number;points:XY[]}|null>(null),line=useRef<XY|null>(null),past=useRef<Mark[][]>([]),future=useRef<Mark[][]>([]);
  const current=marks.find(m=>m.id===selected);
  const trialAvailable=sex==="male"&&layer===1;
  const imageSource=trialAvailable&&showTrial?hairlessTrial:undefined;
  function checkpoint(){past.current.push(marks);future.current=[];}
  function change(next:Mark[]){checkpoint();setMarks(next);}
  useEffect(()=>{let alive=true;Promise.all([...turntableSources,hairlessTrial].map(async src=>{const img=new Image();img.src=src;await img.decode();})).then(()=>{if(alive)setReady(true);}).catch(()=>{if(alive)setError(true);});return()=>{alive=false;};},[]);
  useEffect(()=>{line.current=null;gesture.current=null;setDraft([]);},[angle,sex,tool,layer]);
  useEffect(()=>{const cancel=(e:KeyboardEvent)=>{if(e.key==="Escape"){line.current=null;gesture.current=null;setDraft([]);}};window.addEventListener("keydown",cancel);return()=>window.removeEventListener("keydown",cancel);},[]);
  function point(e:React.PointerEvent){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(stage.current!.getScreenCTM()!.inverse());return{x:p.x,y:p.y};}
  function add(points:XY[]){const id=crypto.randomUUID();change([...marks,{id,sex,angle,tool,points,color,size:38,note:""}]);setSelected(id);setDraft([]);}
  function erase(p:XY,previous=p){setMarks(old=>old.filter(m=>{if(m.sex!==sex||m.angle!==angle)return true;if(m.tool==="zone")return distance(m.points[0],previous,p)>m.size+12;return !m.points.some((q,i)=>distance(q,previous,p)<14||(i>0&&distance(p,m.points[i-1],q)<14));}));}
  const tools=[{id:"rotate",label:"Mudar vista",Icon:MoveHorizontal},{id:"point",label:"Ponto",Icon:Circle},{id:"zone",label:"Zona",Icon:ScanFace},{id:"line",label:"Linha",Icon:Spline},{id:"pen",label:"Caneta",Icon:Pencil},{id:"eraser",label:"Borracha",Icon:Eraser}] as const;
  return <main className="roc3-lab"><header className="roc3-heading"><div><span className="roc3-eyebrow">LABORATÓRIO · PRÉVIA ISOLADA</span><h1><ScanFace size={25}/>ROC · cinco vistas</h1><p>Cinco vistas por camada para avaliação visual.</p></div><a href="/laboratorio"><ArrowLeft size={16}/>Laboratório</a></header>
    <section className="roc3-panel"><div className="roc3-panel-heading"><h2><ScanFace size={20}/>Mapa facial</h2><div className="roc3-switch">{(["female","male"] as Sex[]).map(s=><button key={s} aria-pressed={sex===s} onClick={()=>{setSex(s);setSelected(null);}}>{s==="female"?"Feminino":"Masculino"}</button>)}</div></div>
    <div className="roc3-layers">{layers.map((l,i)=><button key={l} aria-pressed={layer===i} onClick={()=>setLayer(i)}>{l}</button>)}</div><div className="roc3-layout"><div className="roc3-view-column"><div className="roc3-angles">{angles.map(a=><button key={a} aria-pressed={angle===a} onClick={()=>setAngle(a)}>{angleName(a)}</button>)}</div>
    {trialAvailable&&<div className="roc5-trial"><span>Subcutâneo masculino · comparação</span><button aria-pressed={!showTrial} onClick={()=>setShowTrial(false)}>Original</button><button aria-pressed={showTrial} onClick={()=>setShowTrial(true)}>Teste sem cabelo</button></div>}
    <div className="roc3-stage-wrap roc5-stage-wrap"><div className="roc3-tools">{tools.map(({id,label,Icon})=><button key={id} title={label} aria-label={label} aria-pressed={tool===id} onClick={()=>setTool(id)}><Icon size={17}/></button>)}<div className="roc3-tools-divider"/>
      <button title="Desfazer" aria-label="Desfazer" disabled={!past.current.length} onClick={()=>{future.current.push(marks);setMarks(past.current.pop()!);}}><Undo2 size={17}/></button><button title="Refazer" aria-label="Refazer" disabled={!future.current.length} onClick={()=>{past.current.push(marks);setMarks(future.current.pop()!);}}><Redo2 size={17}/></button><label title="Cor"><input type="color" aria-label="Cor da marcação" value={color} onChange={e=>setColor(e.target.value)}/></label><button title="Guias de alinhamento" aria-label="Guias de alinhamento" aria-pressed={guides} onClick={()=>setGuides(v=>!v)}><Ruler size={17}/></button></div>
    {!ready?<div className="roc3-stage roc3-loading" role="status">{error?"Não foi possível carregar as imagens. Atualize a página para tentar novamente.":"Preparando as cinco vistas…"}</div>:<svg ref={stage} className={`roc5-stage roc3-tool-${tool}`} viewBox="0 -35 600 680" role="img" aria-label={`${sex==="female"?"Feminino":"Masculino"} · ${layers[layer]} · ${angleName(angle)}`}
      onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);const p=point(e);gesture.current={point:p,angle,points:[p]};if(tool==="eraser"){checkpoint();erase(p);}if(tool==="pen")setDraft([p]);}}
      onPointerMove={e=>{const p=point(e),g=gesture.current;if(tool==="line"&&line.current)setDraft([line.current,p]);if(!g)return;if(tool==="pen"){g.points.push(p);setDraft([...g.points]);}if(tool==="eraser"){erase(p,g.point);g.point=p;}}}
      onPointerUp={e=>{const p=point(e),g=gesture.current;gesture.current=null;if(!g)return;if(tool==="rotate"){const dx=p.x-g.point.x;if(Math.abs(dx)>25)setAngle(Math.max(-90,Math.min(90,g.angle+(dx>0?45:-45))));return;}if(tool==="eraser")return;if(tool==="line"){if(line.current){add([line.current,p]);line.current=null;}else{line.current=p;setDraft([p,p]);}}else if(tool==="pen"){if(g.points.length>1)add(g.points);else setDraft([]);}else add([p]);}}
      onPointerCancel={()=>{gesture.current=null;setDraft([]);}}><rect width="600" height="620" fill="white"/><AtlasImage sex={sex} angle={angle} layer={layer} source={imageSource}/>
      {guides&&<g stroke="#147faa" opacity=".45" strokeWidth="1" strokeDasharray="5 5"><path d="M300 15V600 M55 230H545 M55 450H545"/><text x="65" y="222" stroke="none" fill="#52677c" fontSize="11">Olhos · referência visual</text><text x="65" y="466" stroke="none" fill="#52677c" fontSize="11">Queixo · referência visual</text></g>}
      {marks.filter(m=>m.sex===sex&&m.angle===angle).map(m=><g key={m.id} fill={m.color} stroke={m.color}>{m.tool==="point"?<circle cx={m.points[0].x} cy={m.points[0].y} r="4.5" stroke="white" strokeWidth="1.5"/>:m.tool==="zone"?<circle cx={m.points[0].x} cy={m.points[0].y} r={m.size} fillOpacity=".18" strokeWidth="2" strokeDasharray="5 4"/>:<polyline points={m.points.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>}</g>)}{draft.length>0&&<polyline points={draft.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"/>}</svg>}
      <div className="roc3-stage-caption">{layers[layer]} · {angleName(angle)}{imageSource?" · teste sem cabelo":""}</div></div>
    <div className="roc5-thumbnails">{angles.map(a=><button key={a} aria-label={`Prévia ${angleName(a)}`} aria-pressed={angle===a} onClick={()=>setAngle(a)}><svg viewBox="0 -35 600 680" aria-hidden="true"><AtlasImage sex={sex} angle={a} layer={layer} source={imageSource}/></svg><span>{angleName(a)}</span></button>)}</div></div>
    <aside className="roc3-notes"><h3>Marcações de teste</h3><p>As marcações permanecem entre camadas da mesma vista. Selecione um registro para voltar ao ângulo em que foi criado.</p>{current&&<div className="roc3-editor"><label>Observações<textarea rows={4} value={current.note} onChange={e=>setMarks(old=>old.map(m=>m.id===current.id?{...m,note:e.target.value}:m))}/></label>{current.tool==="zone"&&<label>Tamanho da zona<input type="range" min="10" max="100" value={current.size} onPointerDown={checkpoint} onChange={e=>setMarks(old=>old.map(m=>m.id===current.id?{...m,size:Number(e.target.value)}:m))}/></label>}</div>}
    {marks.filter(m=>m.sex===sex).map((m,i)=><div className="roc3-note" key={m.id}><button aria-pressed={selected===m.id} onClick={()=>{setSelected(m.id);setAngle(m.angle);}}><span style={{background:m.color}}/><div><strong>Marcação {i+1} · {angleName(m.angle)}</strong><small>{m.note||"Sem observação"}</small></div></button><button aria-label={`Excluir marcação ${i+1}`} title="Excluir marcação" onClick={()=>change(marks.filter(v=>v.id!==m.id))}><Trash2 size={15}/></button></div>)}{!marks.some(m=>m.sex===sex)&&<span className="roc3-empty">Nenhuma marcação nesta prévia.</span>}
    <div className="roc3-study-note"><strong>Prévia em imagens · não é rotação 3D</strong><p>O atendimento não foi alterado. Marcações temporárias, sem gravação no prontuário.</p><p>Novas sequências de cinco vistas por camada, sem espelhar os perfis. Alinhamento visual, não registro anatômico preciso; pontos não são projetados entre ângulos.</p></div></aside></div></section>
    <footer className="roc3-footnote">Ilustrações para avaliação visual no laboratório. Ossos não incluem o volume da pele ou a cartilagem do nariz. Não utilizar para localização clínica precisa.</footer></main>;
}
function Gate(){const access=useAccess();if(access.loading)return <p>Carregando…</p>;if(!access.member||!access.manage)return <p>Acesso exclusivo do administrador. <a href="/inicio">Voltar</a></p>;return <Preview/>;}
export default function RocLaboratory(){return <AccessProvider><Gate/></AccessProvider>;}
