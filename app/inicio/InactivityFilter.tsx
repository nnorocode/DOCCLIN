"use client";
import { useEffect, useState } from "react";
import { useAccess } from "./AccessControl";
import { listClinicalRecords, type ClinicalRecord } from "../../lib/clinical-records";
import { ClientSelect } from "./ClientSelect";
import { readData, useDataRevision } from "../../lib/operational-data";
export function contactDate(value:string):number|null { const br=value?.match(/^(\d{2})\/(\d{2})\/(\d{4})/);const text=br?`${br[3]}-${br[2]}-${br[1]}`:value;if(!/^\d{4}-\d{2}-\d{2}/.test(text??""))return null;const stamp=Date.parse(text);return Number.isFinite(stamp)?stamp:null; }
export function useInactivity(compact = false){
 useDataRevision();
 const [custom,setCustom]=useState(false);
 const [mode,setMode]=useState("Todos"),[months,setMonths]=useState(1),[records,setRecords]=useState<ClinicalRecord[]>([]);
 const businessId=useAccess().member?.businessId??"demo";
 useEffect(()=>{let live=true;const load=()=>void listClinicalRecords(businessId).then(rows=>{if(live)setRecords(rows);}).catch(()=>{});load();window.addEventListener("gest-clinical-record-saved",load);return()=>{live=false;window.removeEventListener("gest-clinical-record-saved",load);};},[businessId]);
 const matches=(name:string,lastContact:string)=>{
   if(mode==="Todos")return true;
   const key=name.trim().toLocaleLowerCase("pt-BR");let date:number|null=null;
   if(mode==="Sem visita"){
     const visits=records.filter(row=>row.patientName.trim().toLocaleLowerCase("pt-BR")===key).flatMap(row=>row.encounters.map(item=>contactDate(item.date))).filter((x):x is number=>x!==null);
     if(visits.length)date=Math.max(...visits);
   }else{
     const client=readData<Array<{name:string;contact:string}>>("gest-clients",[]).find(client=>client.name.trim().toLocaleLowerCase("pt-BR")===key);
     date=contactDate(lastContact)??contactDate(client?.contact??"");
     const tracked=contactDate(readData<Record<string,string>>("gest-contact-last-interaction",{})[key]);
     if(tracked!==null)date=Math.max(date??0,tracked);
   }
   if(mode==="Sem data registrada")return date===null;
   if(date===null)return false;
   const threshold=new Date();threshold.setMonth(threshold.getMonth()-months);return date<threshold.getTime();
 };
 const timed=mode!=="Todos"&&mode!=="Sem data registrada";
 return {matches,filterKey:`${mode}:${months}`,controls:<>
   <ClientSelect compact={compact} hideLabel={compact} label="Inatividade" value={mode} onChange={setMode} options={["Todos","Sem contato","Sem visita","Sem data registrada"]}/>
   {timed&&<ClientSelect compact={compact} hideLabel={compact} label="Há pelo menos" value={custom?"Personalizado":`${months} ${months===1?"mês":"meses"}`} onChange={value=>{setCustom(value==="Personalizado");if(value!=="Personalizado")setMonths(Number(value.split(" ")[0]));}} options={[...[1,2,3,6,10,12,18,24].map(count=>`${count} ${count===1?"mês":"meses"}`),"Personalizado"]}/>}
   {timed&&custom&&<label className="clinical-field patient-inactivity-custom">Meses<input type="number" min={1} max={120} value={months} onChange={event=>setMonths(Math.max(1,Math.min(120,Number(event.target.value))))}/></label>}
 </>};
}
