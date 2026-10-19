"use client";
import { useEffect, useState } from "react";
import { ClientSelect } from "./ClientsExperience";
import { appStorage } from "../../lib/local-store";
export const journeyStatuses=["Em tratamento","Acompanhamento","Feedback","Aguardando resposta","Sem interesse agora","Não deseja contato"];
type Journey={name:string;status:string;date:string;message:string};
const key="gest-contact-journeys";
export const readJourneys=():Record<string,Journey>=>{try{return JSON.parse(appStorage.getItem(key)??"{}");}catch{return {};}};
const id=(name:string)=>name.trim().toLocaleLowerCase("pt-BR");
export function ContactJourney({name,onChange}:{name:string;onChange:()=>void}){
 const [status,setStatus]=useState("Aguardando resposta"),[date,setDate]=useState(""),[message,setMessage]=useState("");
 useEffect(()=>{const saved=readJourneys()[id(name)];setStatus(saved?.status??"Aguardando resposta");setDate(saved?.date??"");setMessage(saved?.message??"");},[name]);
 const save=()=>{const all=readJourneys();all[id(name)]={name,status,date:status==="Não deseja contato"?"":date,message};appStorage.setItem(key,JSON.stringify(all));onChange();window.dispatchEvent(new CustomEvent("gest-app-toast",{detail:"Situação e próximo contato salvos no CRM."}));};
 return <details className="support-contact-journey"><summary>Situação e próximo contato</summary><div className="clinical-form-grid"><ClientSelect label="Situação do cliente" value={status} options={journeyStatuses} onChange={setStatus}/><label className="clinical-field">Próximo contato<input type="date" value={date} disabled={status==="Não deseja contato"} onChange={event=>setDate(event.target.value)}/></label></div><div className="journey-presets">{[1,7,30].map(days=><button className="lab-create-activity" key={days} disabled={status==="Não deseja contato"} onClick={()=>{const day=new Date();day.setDate(day.getDate()+days);setDate(`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`);}}>Em {days} dia{days>1?"s":""}</button>)}</div><label className="clinical-field">Mensagem de retorno<textarea value={message} onChange={event=>setMessage(event.target.value)} rows={2}/></label><button className="lab-create-activity" onClick={save}>Salvar acompanhamento</button><small>O retorno fica registrado no CRM. Envio automático depende da integração; nenhum envio é feito nesta prévia.</small></details>;
}
export function CrmContactFollowups(){
 const [entries,setEntries]=useState<Journey[]>([]);
 useEffect(()=>{setEntries(Object.values(readJourneys()));},[]);
 if(!entries.length)return null;
 return <details className="crm-contact-followups"><summary>Acompanhamento das conversas <span>({entries.length})</span></summary>{entries.map(entry=><article key={id(entry.name)}><strong>{entry.name}</strong><span>{entry.status}</span><time>{entry.date?`Próximo contato: ${new Date(`${entry.date}T12:00:00`).toLocaleDateString("pt-BR")}`:"Sem contato programado"}</time><small>{entry.message}</small></article>)}</details>;
}
