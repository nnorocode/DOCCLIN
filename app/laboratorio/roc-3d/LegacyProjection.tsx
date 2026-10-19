"use client";
// Rejected experiment, retained for recovery only; not mounted by the route.

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Eraser, MoveHorizontal, RotateCcw, ScanFace, Undo2, Circle, Pencil, Spline, Trash2 } from "lucide-react";
import { AccessProvider, useAccess } from "../../inicio/AccessControl";
import "./preview.css";

const layers = ["Pele", "Tecido subcutâneo", "Músculos superficiais", "Músculos profundos", "Vasos e nervos", "Ossos"];
type Point = [number, number, number];
type Tool = "rotate" | "point" | "zone" | "line" | "pen" | "eraser";
type Mark = { id: string; gender: string; kind: Tool; points: Point[]; normal: Point; color: string; note: string; size: number };
type Projection = { id: string; points: { x: number; y: number }[]; visible: boolean };
type SceneApi = { pick: (x: number, y: number) => { point: Point; normal: Point } | null; project: (p: Point) => { x: number; y: number }; dispose: () => void };

// The texture coordinates depend on object-space position, never the view angle.
// This is deliberately a visual registration study, not an anatomical 3D atlas.
const vertex = `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
varying vec3 localPosition;
varying vec3 localNormal;
varying vec3 viewNormal;
void main() {
  localPosition = position;
  localNormal = normal;
  viewNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const fragment = `
precision highp float;
uniform sampler2D front;
uniform sampler2D profile;
uniform sampler2D bone;
uniform float layer;
uniform float female;
varying vec3 localPosition;
varying vec3 localNormal;
varying vec3 viewNormal;
vec3 palette(float l) {
  if(l < .5) return vec3(.76,.54,.41);
  if(l < 1.5) return vec3(.86,.65,.31);
  if(l < 3.5) return vec3(.67,.31,.23);
  if(l < 4.5) return vec3(.64,.38,.29);
  return vec3(.86,.82,.70);
}
float paper(vec3 c) { return smoothstep(.88,.98,min(c.r,min(c.g,c.b))); }
// Extend the illustration inside its own panel. Sampling beyond its silhouette
// previously painted the white backdrop and neighbouring panel onto the head.
vec3 sideSample(vec2 uv) {
  float lower = .055 + .24*(1.0-smoothstep(.28,.48,uv.y)) + .34*smoothstep(.78,.91,uv.y);
  float upper = .965 - .40*(1.0-smoothstep(.18,.38,uv.y)) - .35*smoothstep(.79,.91,uv.y);
  float taper = max(1.0-smoothstep(.28,.42,uv.y),smoothstep(.78,.91,uv.y));
  uv.x = mix(uv.x,mix(lower+.025,upper-.025,uv.x),taper);
  uv.x = clamp(uv.x,lower,upper);
  vec3 c = texture2D(profile,vec2((layer+uv.x)/5.0,uv.y)).rgb;
  for(int i=0;i<8;i++) {
    float empty = step(.05,paper(c));
    uv = mix(uv,vec2(.47,.55),.12 * empty);
    c = mix(c,texture2D(profile,vec2((layer+uv.x)/5.0,uv.y)).rgb,empty);
  }
  return c;
}
void main() {
  vec3 p = localPosition;
  if(p.y < -2.15) discard;
  float fy = clamp((p.y + 2.30) / 6.28, .01, .99);
  float fx = clamp((p.x + .10) / 3.72 + .5, .025, .975);
  vec2 fuv = vec2((layer + fx) / 5.0, fy);
  // A second fixed projection supplies the sides, not a different frame on turn.
  // Register the back of the skull, ear and nose separately. The old linear
  // projection clamped the entire occiput onto a single strip of background.
  float sx = p.z < -.10
    ? mix(.08,.34,clamp((p.z+2.60)/2.50,0.0,1.0))
    : mix(.34,.98,clamp((p.z+.10)/2.70,0.0,1.0));
  float sy = clamp(.10 + fy * .80, .02, .98);
  vec3 a = texture2D(front, fuv).rgb;
  vec3 b = sideSample(vec2(sx,sy));
  a = mix(a,b,paper(a));
  // Blend only around the temple, behind facial features; never across the ear.
  float side = 1.0 - smoothstep(.35,1.35,p.z);
  float neck = 1.0-smoothstep(-1.20,-.65,p.y);
  b = mix(b,a,neck * smoothstep(.1,.7,p.z));
  vec3 color = mix(a,b,side);
  float white = smoothstep(.84,.98,min(color.r,min(color.g,color.b)));
  color = mix(color,palette(layer),white);
  if(layer > 4.5) {
    float headY = clamp((p.y + .85) / 4.82, .0, 1.0);
    float bx = (102.0 + fx * 303.0) / 1536.0;
    float by = 1.0 - (12.0 + (1.0-headY) * 433.0) / 1024.0;
    if(female < .5) { bx = (90.0 + fx * 330.0)/1536.0; by = 1.0-(478.0+(1.0-headY)*477.0)/1024.0; }
    vec3 boneFront = texture2D(bone,vec2(bx,clamp(by,.01,.99))).rgb;
    float sideX = (1064.0 + clamp((p.z+2.60)/5.20,.02,.98)*391.0)/1536.0;
    float sideY = 1.0-(13.0+(1.0-headY)*427.0)/1024.0;
    if(female < .5) { sideX=(1058.0+clamp((p.z+2.60)/5.20,.02,.98)*422.0)/1536.0; sideY=1.0-(482.0+(1.0-headY)*470.0)/1024.0; }
    vec3 boneSide = texture2D(bone,vec2(sideX,sideY)).rgb;
    color = mix(boneFront,boneSide,side);
    float background = smoothstep(.85,.98,min(color.r,min(color.g,color.b)));
    color = mix(color,palette(5.0),background);
    color = mix(palette(5.0),color,smoothstep(-.85,-.65,p.y));
  }
  // Neutral, fixed studio illumination: no angle-specific exposure or tint.
  float diffuse = max(0.0,dot(normalize(viewNormal),normalize(vec3(-.3,.5,1.0))));
  float fill = max(0.0,dot(normalize(viewNormal),normalize(vec3(.7,.1,.7))));
  gl_FragColor = vec4(color * (.83 + diffuse * .13 + fill * .04),1.0);
}`;

function Preview() {
  const [gender, setGender] = useState("female");
  const [layer, setLayer] = useState(0);
  const [angle, setAngle] = useState(0);
  const [tool, setTool] = useState<Tool>("rotate");
  const [color, setColor] = useState("#147faa");
  const [marks, setMarks] = useState<Mark[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [projections, setProjections] = useState<Projection[]>([]);
  const [status, setStatus] = useState("Carregando malha 3D e texturas…");
  const [ready, setReady] = useState(false);
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<SceneApi | null>(null);
  const live = useRef({ gender, layer, angle, marks });
  const undo = useRef<Mark[][]>([]);
  const gesture = useRef<{ x: number; angle: number; points: Point[]; normal: Point } | null>(null);
  const lineStart = useRef<{ point: Point; normal: Point } | null>(null);
  const [linePreview, setLinePreview] = useState<Projection | null>(null);
  live.current = { gender, layer, angle, marks };
  const current = marks.find(m => m.id === selected);
  function changeMarks(next: Mark[]) { undo.current.push(marks); setMarks(next); }
  useEffect(() => { lineStart.current = null; setLinePreview(null); }, [tool, gender]);
  useEffect(() => { const cancel = (e: KeyboardEvent) => { if (e.key === "Escape") { lineStart.current = null; setLinePreview(null); } }; window.addEventListener("keydown", cancel); return () => window.removeEventListener("keydown", cancel); }, []);

  useEffect(() => {
    let cancelled = false;
    let clean = () => {};
    async function initialize() {
      const { Renderer, Camera, Transform, Program, Mesh, Texture, GLTFLoader, Raycast, Vec3 } = await import("ogl");
      if (!mount.current || cancelled) return;
      const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(devicePixelRatio, 2) });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      mount.current.appendChild(gl.canvas);
      const camera = new Camera(gl, { near: .1, far: 100 });
      camera.position.set(0, .95, 18);
      camera.lookAt([0, .95, 0]);
      const scene = new Transform();
      const root = new Transform();
      root.setParent(scene);
      const loaded = await GLTFLoader.load(gl, "/clinical-lab/rotation-head.glb");
      if (cancelled) { gl.canvas.remove(); return; }
      const geometry = loaded.meshes[0].primitives[0].geometry;
      const textures: InstanceType<typeof Texture>[] = [];
      const loadTexture = async (src: string) => {
        const img = new Image(); img.src = src; await img.decode();
        const texture = new Texture(gl, { image: img, generateMipmaps: true, flipY: true });
        textures.push(texture); return texture;
      };
      const [femaleFront, femaleSide, maleFront, maleSide, bone] = await Promise.all([
        loadTexture("/clinical-lab/female-front-v3.png"), loadTexture("/clinical-lab/female-profile-v4.png"),
        loadTexture("/clinical-lab/male-front-v3.png"), loadTexture("/clinical-lab/male-profile-v4.png"),
        loadTexture("/clinical-lab/bone-atlas-v1.png"),
      ]);
      if (cancelled) { geometry.remove(); textures.forEach(t => gl.deleteTexture(t.texture)); gl.canvas.remove(); return; }
      const program = new Program(gl, { vertex, fragment, cullFace: null, uniforms: {
        front: { value: femaleFront }, profile: { value: femaleSide }, bone: { value: bone }, layer: { value: 0 }, female: { value: 1 },
      } });
      const mesh = new Mesh(gl, { geometry, program });
      mesh.setParent(root);
      const ray = new Raycast();
      const resize = () => {
        if (!mount.current) return;
        const { width, height } = mount.current.getBoundingClientRect();
        renderer.setSize(width, height);
        // Fixed vertical bounds, including on profile; width follows available area.
        const halfHeight = Math.max(3.55, 2.5 * height / width), halfWidth = halfHeight * width / height;
        camera.orthographic({ left: -halfWidth, right: halfWidth, top: halfHeight, bottom: -halfHeight });
      };
      const observer = new ResizeObserver(resize); observer.observe(mount.current); resize();
      const project = (p: Point) => {
        const v = new Vec3(...p).applyMatrix4(mesh.worldMatrix);
        camera.project(v); return { x: (v.x + 1) * 50, y: (1 - v.y) * 50 };
      };
      api.current = { project, pick: (clientX, clientY) => {
        const rect = gl.canvas.getBoundingClientRect();
        ray.castMouse(camera, [(clientX - rect.left) / rect.width * 2 - 1, 1 - (clientY - rect.top) / rect.height * 2]);
        scene.updateMatrixWorld();
        const hit = ray.intersectMeshes([mesh], { includeNormal: true })[0]?.hit;
        if (!hit?.localPoint || !hit.localNormal || hit.localPoint.y < -2.15) return null;
        return { point: [...hit.localPoint] as Point, normal: [...hit.localNormal] as Point };
      }, dispose: () => clean() };
      let frame = 0, lastProjection = "", renderedAngle = 0;
      const draw = () => {
        if (cancelled) return;
        const state = live.current;
        const radians = state.angle * Math.PI / 180;
        renderedAngle += (radians - renderedAngle) * .18;
        if (Math.abs(renderedAngle - radians) < .0001) renderedAngle = radians;
        root.rotation.y = renderedAngle;
        // Both presentations keep one rig, origin, and camera; no view substitutions.
        program.uniforms.front.value = state.gender === "female" ? femaleFront : maleFront;
        program.uniforms.profile.value = state.gender === "female" ? femaleSide : maleSide;
        program.uniforms.layer.value = state.layer;
        program.uniforms.female.value = state.gender === "female" ? 1 : 0;
        renderer.render({ scene, camera });
        const next = state.marks.filter(m => m.gender === state.gender).map(m => {
          const facing = -m.normal[0] * Math.sin(renderedAngle) + m.normal[2] * Math.cos(renderedAngle);
          return { id: m.id, points: m.points.map(project), visible: facing > .05 };
        });
        const key = JSON.stringify(next);
        if (lastProjection !== key) { lastProjection = key; setProjections(next); }
        frame = requestAnimationFrame(draw);
      };
      clean = () => {
        cancelAnimationFrame(frame); observer.disconnect(); geometry.remove();
        textures.forEach(t => gl.deleteTexture(t.texture)); gl.deleteProgram(program.program);
        gl.getExtension("WEBGL_lose_context")?.loseContext(); gl.canvas.remove(); api.current = null;
      };
      setReady(true); setStatus(""); draw();
    }
    initialize().catch(() => { if (!cancelled) { setStatus("Não foi possível abrir a prévia 3D. Verifique o suporte WebGL e recarregue."); setReady(false); } });
    return () => { cancelled = true; clean(); };
  }, []);

  function add(points: Point[], normal: Point) {
    const id = crypto.randomUUID();
    changeMarks([...marks, { id, gender, kind: tool, points, normal, color, note: "", size: 28 }]);
    setSelected(id);
  }
  function erase(x: number, y: number) {
    const rect = mount.current?.getBoundingClientRect(); if (!rect) return;
    const hits = projections.filter(p => p.visible && p.points.some((v, i) => {
      const a = { x: rect.left + v.x / 100 * rect.width, y: rect.top + v.y / 100 * rect.height };
      const next = p.points[i + 1];
      if (!next) return Math.hypot(a.x - x, a.y - y) < 24;
      const b = { x: rect.left + next.x / 100 * rect.width, y: rect.top + next.y / 100 * rect.height };
      const dx = b.x - a.x, dy = b.y - a.y;
      const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1)));
      return Math.hypot(a.x + t * dx - x, a.y + t * dy - y) < 24;
    })).map(p => p.id);
    if (hits.length) setMarks(old => old.filter(m => !hits.includes(m.id)));
  }
  const tools = [
    { id: "rotate", label: "Girar", icon: MoveHorizontal }, { id: "point", label: "Ponto", icon: Circle },
    { id: "zone", label: "Zona", icon: ScanFace }, { id: "line", label: "Linha", icon: Spline },
    { id: "pen", label: "Caneta", icon: Pencil }, { id: "eraser", label: "Borracha", icon: Eraser },
  ] as const;
  return <main className="roc3-lab">
    <header className="roc3-heading"><div><span className="roc3-eyebrow">LABORATÓRIO · PROPOSTA PARA APROVAÇÃO</span><h1><ScanFace size={25} /> ROC · rotação 3D</h1><p>Um único eixo. Enquadramento fixo. Marcações ligadas à superfície.</p></div><a href="/laboratorio/anatomia"><ArrowLeft size={16} /> Laboratório atual</a></header>
    <section className="roc3-panel">
      <header className="roc3-panel-heading"><h2><ScanFace size={19} /> Manequim de estudo</h2><div className="roc3-switch">{[["female", "Feminino"], ["male", "Masculino"]].map(([id, name]) => <button key={id} aria-pressed={gender === id} onClick={() => { setGender(id); setSelected(null); }}>{name}</button>)}</div></header>
      <div className="roc3-layers">{layers.map((name, i) => <button key={name} aria-pressed={layer === i} onClick={() => setLayer(i)}>{name}</button>)}</div>
      <div className="roc3-layout"><div className="roc3-view-column">
        <div className="roc3-angles">{[-90, -45, 0, 45, 90].map(n => <button key={n} aria-pressed={angle === n} onClick={() => setAngle(n)}>{n === 0 ? "Frente" : `${Math.abs(n)}° ${n < 0 ? "esquerda" : "direita"}`}</button>)}</div>
        <div className="roc3-stage-wrap">
          <div className="roc3-tools">{tools.map(({ id, label, icon: Icon }) => <button key={id} aria-label={label} title={label} aria-pressed={tool === id} onClick={() => setTool(id)}><Icon size={18} /></button>)}<span className="roc3-tools-divider"/><button aria-label="Desfazer" title="Desfazer" disabled={!undo.current.length} onClick={() => { const previous = undo.current.pop(); if (previous) { setMarks(previous); setSelected(null); } }}><Undo2 size={18} /></button><label title="Cor da marcação"><input aria-label="Cor da marcação" type="color" value={color} onChange={e => setColor(e.target.value)}/></label></div>
          <div ref={mount} className={`roc3-stage roc3-tool-${tool}`} role="group" aria-label={`Modelo 3D ${gender === "female" ? "feminino" : "masculino"}, ${layers[layer]}, ${angle} graus`} data-ready={ready} data-angle={angle}
            onPointerDown={e => {
              if (!ready) return;
              if (tool === "eraser") undo.current.push(marks);
              const hit = api.current?.pick(e.clientX, e.clientY);
              gesture.current = { x: e.clientX, angle, points: hit ? [hit.point] : [], normal: hit?.normal ?? [0, 0, 1] };
              e.currentTarget.setPointerCapture(e.pointerId);
              if (tool === "eraser") erase(e.clientX, e.clientY);
            }}
            onPointerMove={e => {
              const g = gesture.current;
              if (g && tool === "rotate") { setAngle(Math.max(-90, Math.min(90, Math.round(g.angle + (e.clientX - g.x) * .4)))); return; }
              if (g && tool === "eraser") { erase(e.clientX, e.clientY); return; }
              if (g && tool === "pen") { const hit = api.current?.pick(e.clientX, e.clientY); if (hit) g.points.push(hit.point); }
              if (tool === "line" && lineStart.current && mount.current) {
                const hit = api.current?.pick(e.clientX, e.clientY);
                if(hit && api.current) setLinePreview({ id: "draft", visible: true, points: [api.current.project(lineStart.current.point), api.current.project(hit.point)] });
              }
            }}
            onPointerUp={e => {
              const g = gesture.current; gesture.current = null;
              if (!g || tool === "rotate" || tool === "eraser") return;
              const hit = api.current?.pick(e.clientX, e.clientY); if (!hit) return;
              if (tool === "line") {
                if (!lineStart.current) { lineStart.current = hit; setLinePreview(null); }
                else { add([lineStart.current.point, hit.point], lineStart.current.normal); lineStart.current = null; setLinePreview(null); }
              } else if (tool === "pen") { if (g.points.length > 1) add(g.points, g.normal); }
              else add([hit.point], hit.normal);
            }} onPointerCancel={() => { gesture.current = null; }}>
            {status && <div className="roc3-loading" role="status">{status}</div>}
            <svg className="roc3-marks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{projections.filter(p => p.visible).map(p => {
              const m = marks.find(item => item.id === p.id); const first = p.points[0];
              if (!m || !first) return null;
              return <g key={p.id} stroke={m.color} fill={m.color}>
                {m.kind === "line" || m.kind === "pen" ? <polyline points={p.points.map(v => `${v.x},${v.y}`).join(" ")} fill="none" strokeWidth=".45" strokeLinecap="round" strokeLinejoin="round"/> : m.kind === "zone" ? <ellipse cx={first.x} cy={first.y} rx={m.size / 4} ry={m.size / 4} fillOpacity=".18" strokeWidth=".35" strokeDasharray=".8 .5"/> : <circle cx={first.x} cy={first.y} r=".7" stroke="white" strokeWidth=".2"/>}
              </g>;
            })}{linePreview && <polyline points={linePreview.points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={color} strokeWidth=".4" strokeDasharray="1 .5"/>}</svg>
          </div>
          <div className="roc3-stage-caption">{layers[layer]} <span>·</span> {Math.abs(angle)}° {angle < 0 ? "esquerda" : angle > 0 ? "direita" : "frontal"}</div>
        </div>
        <div className="roc3-rotation"><button aria-label="Girar à esquerda" onClick={() => setAngle(Math.max(-90, angle - 5))}><ChevronLeft size={17}/></button><input aria-label="Rotação contínua do manequim" type="range" min="-90" max="90" step="1" value={angle} onChange={e => setAngle(Number(e.target.value))}/><button aria-label="Girar à direita" onClick={() => setAngle(Math.min(90, angle + 5))}><ChevronRight size={17}/></button><button aria-label="Voltar à frente" title="Voltar à frente" onClick={() => setAngle(0)}><RotateCcw size={17}/></button></div>
      </div><aside className="roc3-notes"><h3>Marcações de teste</h3><p>Escolha uma ferramenta e marque a superfície. Use Girar para observar o mesmo local em outro ângulo.</p>
        {current && <div className="roc3-editor"><label>Observações<textarea rows={4} value={current.note} onChange={e => setMarks(old => old.map(m => m.id === current.id ? { ...m, note: e.target.value } : m))}/></label>{current.kind === "zone" && <label>Tamanho da zona<input type="range" min="8" max="48" value={current.size} onChange={e => setMarks(old => old.map(m => m.id === current.id ? { ...m, size: Number(e.target.value) } : m))}/></label>}</div>}
        {marks.filter(m => m.gender === gender).map((m, i) => <div className="roc3-note" key={m.id}><button aria-pressed={selected === m.id} onClick={() => setSelected(m.id)}><span style={{ background: m.color }}/><div><strong>Marcação {i + 1}</strong><small>{m.note || "Sem observação"}</small></div></button><button title="Excluir marcação" aria-label={`Excluir marcação ${i + 1}`} onClick={() => changeMarks(marks.filter(item => item.id !== m.id))}><Trash2 size={15}/></button></div>)}
        {!marks.some(m => m.gender === gender) && <span className="roc3-empty">Nenhuma marcação nesta prévia.</span>}
        <div className="roc3-study-note"><strong>Prévia isolada</strong><p>Nenhum dado do atendimento é alterado. Marcações temporárias, somente nesta sessão.</p><p>A rotação é 3D real. As camadas são texturas ilustrativas projetadas sobre uma malha-base, não estruturas anatômicas 3D validadas. Feminino e masculino reutilizam a malha de estudo; a identidade e o cabelo ainda exigem modelagem própria.</p></div>
      </aside></div>
    </section>
    <footer className="roc3-footnote">Malha-base: <a href="https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/LeePerrySmith">Infinite, 3D Head Scan · Lee Perry-Smith</a> · CC BY 3.0. Texturas do laboratório DocClin. Adaptação experimental de materiais e projeção. Não usar para decisão clínica.</footer>
  </main>;
}
function Gate() { const access = useAccess(); if (access.loading) return <p>Carregando…</p>; if (!access.member || !access.manage) return <p>Acesso exclusivo do administrador. <a href="/inicio">Voltar</a></p>; return <Preview/>; }
export default function Roc3DLaboratory() { return <AccessProvider><Gate/></AccessProvider>; }
