"use client";
import { CalendarDays, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { ClinicalPaymentSummary } from "./ClinicalPayment";
import type { ClinicalRecord } from "../../lib/clinical-records";
import { financeRows, money } from "../../lib/operational-data";

type Entry = { id: string; date: string; title: string; detail: ReactNode };
const displayDate = (value: string) => new Date(value.includes("T") ? value : `${value}T12:00:00`).toLocaleString("pt-BR", value.includes("T") ? {} : { dateStyle: "short" });
const localDay = (value: string) => {
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
};

export default function PatientHistory({ record }: { record: ClinicalRecord }) {
  const entries: Entry[] = [
    ...record.encounters.map(item => ({
      id: `encounter:${item.id}`, date: item.registeredAt ?? item.date, title: item.service,
      detail: <><div className="patient-history-payment"><strong>{money(item.amount)}</strong><span>{item.paymentMethod} · {item.installments}x</span></div>{item.payment&&<details><summary>Pagamento, recebimento e comissões</summary><ClinicalPaymentSummary payment={item.payment} total={item.amount} method={item.paymentMethod} installments={item.installments} brand={item.cardBrand}/></details>}<p>{item.observations || "Sem observações adicionais."}</p>
        {!!item.order?.lines.length && <ul>{item.order.lines.map(line => <li key={line.id}>{line.quantity} × {line.name}</li>)}</ul>}
        {item.anamnesisDetails && <details><summary>Anamnese desta consulta</summary><dl className="client-record-fields">{Object.entries(item.anamnesisDetails).filter(([, value]) => value).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></details>}
        {Object.entries(item.toothNotes ?? {}).filter(([, note])=>note).map(([element, note])=><p key={element}>Elemento {element}: {note}</p>)}
        {Object.entries(item.facialNotes ?? {}).filter(([, note])=>note).map(([region, note])=><p key={region}>{region}: {note}</p>)}
      </>,
    })),
    ...(record.anatomyHistory ?? []).map(item => ({ id:`anatomy:${item.id}`, date:item.date, title:item.mode==="face"?"ROC salvo":"Odontograma salvo", detail:<p>Versão preservada no histórico da seção correspondente.</p> })),
    ...record.documents.map(doc => ({ id:`document:${doc.id}`, date:doc.updatedAt, title:doc.title, detail:<><p><FileText size={14}/> {doc.kind} · {doc.status}{doc.signedAt ? ` · Assinado em ${displayDate(doc.signedAt)}` : ""}</p>{doc.service && <p>Procedimento: {doc.service}</p>}<details><summary>Conteúdo do documento</summary><p className="patient-document-content">{doc.content || "Sem conteúdo registrado."}</p></details></> })),
    ...(record.documentEmissions ?? []).map(doc => ({ id:`emission:${doc.id}`, date:doc.at, title:`Emissão · ${doc.title}`, detail:<details><summary>Documento emitido</summary><p className="patient-document-content">{doc.content}</p></details> })),
    ...(record.images ?? []).map(image => ({ id:`image:${image.id}`, date:image.createdAt, title:`${image.mode==="face"?"ROC":image.mode==="dental"?"Odontograma":"RX"} · ${image.kind}`, detail:<details><summary>Visualizar imagem</summary><figure className="patient-history-image"><img src={image.url} alt={image.note || image.kind}/><figcaption>{image.note}</figcaption></figure></details> })),
    ...financeRows().filter(row=>row.customer===record.patientName && row.source!=="clinical").map(row=>({ id:`finance:${row.id}`, date:row.competenceDate, title:row.description, detail:<p>{money(row.grossCents/100)} · {row.paymentMethod} · {row.cancelled?"Cancelado":"Lançamento financeiro"}</p> })),
  ].filter(entry=>entry.date && Number.isFinite(Date.parse(entry.date))).sort((a,b)=>b.date.localeCompare(a.date));
  const days = [...new Set(entries.map(entry=>localDay(entry.date)))];
  return <section className="client-record-panel patient-history"><header><h2><CalendarDays size={18}/>Histórico do paciente</h2></header>
    {days.length ? days.map(day=><section key={day} className="patient-history-date"><h3>{displayDate(day)}</h3><div className="clinical-timeline">{entries.filter(entry=>localDay(entry.date)===day).map(entry=><article key={entry.id}><time>{displayDate(entry.date)}</time><strong>{entry.title}</strong>{entry.detail}</article>)}</div></section>) : <p className="gest-empty-list-panel">Sem registro</p>}
  </section>;
}
