"use client";
import { TimelinePreview } from "../laboratorio/page";
type Entry={id:string;patientName:string;service:string;coverage:{kind:"Particular";insurer:string;category:string;authorization:string}};
export default function ClinicalAttendancePicker({onOpen,onOpenAgenda}:{onOpen:(event:Entry)=>void;onOpenAgenda:()=>void}){
 return <section className="clinical-attendance-picker is-grid"><header className="v2-intro client-compact-intro"><h1>Atendimento</h1></header><div className="clinical-attendance-days">{[-1,0,1].map(offset=><section className={`clinical-attendance-day ${offset===0?"is-today":"is-adjacent"}`} key={offset}><h3>{offset===-1?"Ontem":offset===0?"Hoje":"Amanhã"} · {new Date(new Date().setDate(new Date().getDate()+offset)).toLocaleDateString("pt-BR")}</h3><TimelinePreview dayOffset={offset} appointmentsOnly onOpenAgenda={onOpenAgenda} onOpenClinical={onOpen}/></section>)}</div></section>;
}
