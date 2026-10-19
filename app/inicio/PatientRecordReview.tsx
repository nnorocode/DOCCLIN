"use client";
import { useState } from "react";
import { CalendarDays, FileText, ClipboardList } from "lucide-react";
import type { ClinicalRecord, ClinicalDocument } from "../../lib/clinical-records";
import { money } from "../../lib/operational-data";
import { ClientSelect } from "./ClientSelect";
import ClinicalImages from "./ClinicalImages";
import { ClinicalPaymentSummary } from "./ClinicalPayment";
import { ClinicalAtlas } from "../laboratorio/anatomia/page";

const date = (value: string) => new Date(value.includes("T") ? value : `${value}T12:00:00`).toLocaleString("pt-BR", value.includes("T") ? {dateStyle:"short",timeStyle:"short"} : {dateStyle:"short"});
const empty = <p className="gest-empty-list-panel">Sem registro</p>;

export function PatientDocuments({record,onOpen,attachments,onCreate}: {record:ClinicalRecord;onOpen:(doc:ClinicalDocument)=>void;attachments:React.ReactNode;onCreate:()=>void}) {
  const pending = record.documents.filter(doc=>doc.status==="Pendente" || doc.status==="Enviado");
  const rows = (documents: ClinicalDocument[]) => documents.length ? <div className="patient-document-register">{[...documents].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(doc=><article key={doc.id}><div><strong>{doc.title}</strong><small>{doc.kind} · {date(doc.updatedAt)}{doc.signedAt?` · Assinado em ${date(doc.signedAt)}`:""}</small></div><span className={`client-record-status${doc.status==="Pendente"||doc.status==="Enviado"?" is-pending":""}`}>{doc.status}</span><button className="lab-create-activity" onClick={()=>onOpen(doc)}>Abrir</button></article>)}</div> : <p className="clinical-images-empty">Sem registro</p>;
  return <>
    <section className="client-record-panel"><header><h2><FileText size={18}/>Documentos pendentes</h2></header>{rows(pending)}</section>
    <section className="client-record-panel"><header><h2><FileText size={18}/>Documentos gerados</h2></header>{rows(record.documents)}</section>
    <details className="client-record-panel patient-attachments"><summary>Documentos adicionados ao prontuário</summary>{attachments}</details>
    <section className="client-record-panel patient-document-create"><div><h2>Gerar novo documento</h2><p>Atestado, receita, contrato ou termo de consentimento.</p></div><button type="button" className="lab-create-activity" onClick={onCreate}>Gerar novo documento</button></section>
  </>;
}

export default function PatientRecordReview({section,record}: {section:string;record:ClinicalRecord}) {
  const [selected,setSelected] = useState("current");
  if(section==="RX") return <ClinicalImages record={record} mode="rx" readOnly allModes onSave={async()=>false}/>;
  if(section==="Anamnese") {
    const versions = [
      ...(record.anamnesisHistory??[]).map(item=>({id:item.id,date:item.date,details:item.details,anamnesis:item.anamnesis,allergies:item.allergies,conditions:item.conditions,medicines:item.medicines})),
      ...record.encounters.filter(item=>item.anamnesisDetails && Object.values(item.anamnesisDetails).some(Boolean)).map(item=>({id:item.id,date:item.registeredAt??item.date,details:item.anamnesisDetails!,anamnesis:"",allergies:[] as string[],conditions:[] as string[],medicines:[] as string[]})),
    ].sort((a,b)=>b.date.localeCompare(a.date));
    const version=versions.find(item=>item.id===selected);
    const data=version?.details??record.anamnesisDetails??{};
    const fields=Object.entries({...data,...(!data["Queixa principal"] && (version?.anamnesis??record.anamnesis)?{"Queixa principal":version?.anamnesis??record.anamnesis}:{})}).filter(([,value])=>value);
    const labels=versions.map((item,index)=>`${date(item.date)} · ${versions.length-index}`);
    return <section className="client-record-panel patient-saved-review"><header><h2><ClipboardList size={18}/>Anamnese</h2><ClientSelect label="Histórico de anamneses" hideLabel value={selected==="current"?"Última anamnese salva":labels[versions.findIndex(item=>item.id===selected)]??"Última anamnese salva"} options={["Última anamnese salva",...labels]} onChange={label=>setSelected(versions[labels.indexOf(label)]?.id??"current")}/></header><p className="workflow-helper">{version?`Registro de ${date(version.date)}`:"Último registro salvo no prontuário"} · Visualização</p>{fields.length?<dl className="client-record-fields">{fields.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>:empty}{["allergies","conditions","medicines"].map((key,index)=>{const values=(version??record)[key as "allergies"|"conditions"|"medicines"];return values.length?<p key={key}><strong>{["Alergias","Condições de saúde","Medicamentos"][index]}: </strong>{values.join(", ")}</p>:null;})}</section>;
  }
  if(section==="Odontograma"||section==="ROC") {
    const mode=section==="ROC"?"face":"dental";
    const versions=[...(record.anatomyHistory??[]).filter(item=>item.mode===mode),...record.encounters.filter(item=>item.anatomy).map(item=>({id:`encounter:${item.id}`,date:item.registeredAt??item.date,anatomy:item.anatomy!}))].sort((a,b)=>b.date.localeCompare(a.date));
    const labels=versions.map((item,index)=>`${date(item.date)} · ${versions.length-index}`);
    const version=versions.find(item=>item.id===selected);
    const anatomy=version?.anatomy??record.anatomy??versions[0]?.anatomy;
    return <><section className="client-record-panel patient-saved-review"><header><h2><CalendarDays size={18}/>{section} · registros salvos</h2><ClientSelect label={`Histórico de ${section}`} hideLabel value={version?labels[versions.indexOf(version)]:"Último registro salvo"} options={["Último registro salvo",...labels]} onChange={label=>setSelected(versions[labels.indexOf(label)]?.id??"current")}/></header><p className="workflow-helper">{version?date(version.date):"Última versão do prontuário"} · Visualização</p></section>{anatomy?<ClinicalAtlas key={`${section}:${selected}`} readOnly mode={mode} initial={anatomy}/>:<section className="client-record-panel">{empty}</section>}<ClinicalImages record={record} mode={mode} readOnly onSave={async()=>false}/></>;
  }
  if(section==="Serviços"||section==="Resumo") {
    const encounters=[...record.encounters].sort((a,b)=>(b.registeredAt??b.date).localeCompare(a.registeredAt??a.date));
    const labels=encounters.map((item,index)=>`${date(item.registeredAt??item.date)} · ${encounters.length-index}`);
    const item=encounters.find(item=>item.id===selected)??encounters[0];
    return <section className="client-record-panel patient-saved-review"><header><h2><ClipboardList size={18}/>{section==="Resumo"?"Resumo da consulta":"Pagamento"}</h2>{item&&<ClientSelect label="Histórico de consultas" hideLabel value={selected==="current"?"Última consulta":labels[encounters.indexOf(item)]} options={["Última consulta",...labels]} onChange={label=>setSelected(encounters[labels.indexOf(label)]?.id??"current")}/>}</header>{item?<><div className="patient-encounter-highlight"><div><time>{date(item.registeredAt??item.date)}</time><h3>{item.service}</h3></div><strong>{money(item.amount)}</strong></div><dl className="client-record-fields"><div><dt>Pagamento</dt><dd>{item.paymentMethod} · {item.installments}x</dd></div><div><dt>Situação</dt><dd>{item.paymentStatus==="paid"?"Pago":item.paymentStatus==="cancelled"?"Cancelado":"Pagamento pendente"}</dd></div><div><dt>Retorno previsto</dt><dd>{item.returnDate?date(item.returnDate):"Não informado"}</dd></div></dl>{item.order?.lines.length?<div className="patient-document-register">{item.order.lines.map(line=><article key={line.id}><strong>{line.quantity} × {line.name}</strong><span>{money(line.price*line.quantity)}</span></article>)}</div>:null}<ClinicalPaymentSummary payment={item.payment} total={item.amount} method={item.paymentMethod} installments={item.installments} brand={item.cardBrand}/>{item.observations&&<p>{item.observations}</p>}{item.products.length>0&&<p>Materiais: {item.products.map(product=>product.name).join(", ")}</p>}</>:empty}</section>;
  }
  return null;
}
