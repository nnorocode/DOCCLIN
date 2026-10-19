"use client";
import { useRef, useState } from "react";
import { ImagePlus, Images, X } from "lucide-react";
import { ClientSelect } from "./ClientSelect";
import { validateImage, safeAttachmentUrl } from "../../lib/file-security";
import type { ClinicalRecord } from "../../lib/clinical-records";
export default function ClinicalImages({record,mode,onSave,readOnly=false,allModes=false}:{record:ClinicalRecord;mode:"dental"|"face"|"rx";onSave:(record:ClinicalRecord)=>Promise<boolean>;readOnly?:boolean;allModes?:boolean}) {
 const [kind,setKind]=useState("Antes"),[note,setNote]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const [preview,setPreview]=useState<NonNullable<ClinicalRecord["images"]>[number]|null>(null);
 const upload=useRef<HTMLInputElement>(null);
 const [historyDate,setHistoryDate]=useState("Todas as datas");
 const available=(record.images??[]).filter(image=>safeAttachmentUrl(image.url)&&(allModes||image.mode===mode)).slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
 const images=available.filter(image=>historyDate==="Todas as datas"||new Date(image.createdAt).toLocaleDateString("pt-BR")===historyDate);
 const addImage=async(file?:File)=>{
   if(!file)return;
   setBusy(true);setError("");
   try {
     await validateImage(file);
     const url=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file);});
     const image={id:crypto.randomUUID(),mode,kind,note:note.trim(),url,createdAt:new Date().toISOString()};
     if(await onSave({...record,images:[...(record.images??[]),image]}))setNote("");
     else setError("Não foi possível salvar. Tente novamente.");
   } catch (cause) {setError(cause instanceof Error?cause.message:"Não foi possível carregar a imagem.");}
   finally {setBusy(false);}
 };
 return <section className="client-record-panel clinical-images">
   <header><h2><Images size={18}/>{allModes?"Controle de imagens":mode==="rx"?"RX e exames de imagem":"Imagens · antes e depois"}</h2>{readOnly&&<ClientSelect label="Data das imagens" hideLabel value={historyDate} onChange={setHistoryDate} options={["Todas as datas",...new Set(available.map(image=>new Date(image.createdAt).toLocaleDateString("pt-BR")))]}/>}</header>
   {!readOnly && <div className="clinical-image-toolbar">
     <ClientSelect label="Etapa" value={kind} onChange={setKind} options={["Antes","Depois","Acompanhamento"]}/>
     <label className="clinical-field">Descrição<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Descreva a imagem (opcional)"/></label>
     <button type="button" className="lab-create-activity" disabled={busy} onClick={()=>upload.current?.click()}><ImagePlus size={16}/>{busy?"Salvando…":"Adicionar imagem"}</button>
     <input ref={upload} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{void addImage(e.target.files?.[0]);e.target.value="";}}/>
   </div>}
   {error&&<p className="clinical-error" role="alert">{error}</p>}
   {images.length?<div className="clinical-image-grid">{images.map(image=><figure key={image.id}><button type="button" className="clinical-image-thumbnail" onClick={()=>setPreview(image)} aria-label={`Ampliar ${image.kind}: ${image.note||"imagem clínica"}`}><img src={image.url} alt={image.note||image.kind}/></button><figcaption><strong>{image.kind}</strong><time>{new Date(image.createdAt).toLocaleString("pt-BR")}</time>{image.note&&<p>{image.note}</p>}</figcaption></figure>)}</div>:<p className="clinical-images-empty">Nenhuma imagem registrada. Adicione imagens de antes, depois ou acompanhamento.</p>}
   {preview&&<div className="v2-record-drawer clinical-image-preview" role="presentation" onClick={event=>{if(event.target===event.currentTarget)setPreview(null);}} onKeyDown={event=>{if(event.key==="Escape")setPreview(null);}}><section className="v2-dialog" role="dialog" aria-modal="true" aria-label="Visualização da imagem"><header><h2>{preview.kind}</h2><button type="button" className="lab-create-activity" onClick={()=>setPreview(null)} aria-label="Fechar imagem"><X size={16}/></button></header><img src={preview.url} alt={preview.note||preview.kind}/><p>{preview.note}</p><time>{new Date(preview.createdAt).toLocaleString("pt-BR")}</time></section></div>}
 </section>;
}
