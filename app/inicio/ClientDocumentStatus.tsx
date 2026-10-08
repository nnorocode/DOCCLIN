"use client";
import { useEffect, useRef, useState } from "react";
import { FileCheck2, X } from "lucide-react";
import { loadClinicalRecord, type ClinicalRecord } from "../../lib/clinical-records";
import { useAccess } from "./AccessControl";

export default function ClientDocumentStatus({ patientId, patientName }: { patientId: string; patientName: string }) {
  const access = useAccess();
  const [record, setRecord] = useState<ClinicalRecord>();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const businessId = access.member?.businessId ?? "demo";
  useEffect(() => {
    let active = true;
    const refresh = () => { void loadClinicalRecord(businessId, patientId, patientName).then(value => { if (active) { setRecord(value); setError(""); } }).catch(() => { if (active) setError("Não foi possível consultar os documentos."); }); };
    refresh();
    window.addEventListener("gest-clinical-record-saved", refresh);
    return () => { active = false; window.removeEventListener("gest-clinical-record-saved", refresh); };
  }, [businessId, patientId, patientName]);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  const documents = record?.documents.filter(doc => doc.kind === "Contrato" || doc.kind === "Consentimento") ?? [];
  const pending = documents.filter(doc => doc.status !== "Assinado").length;
  return <><button type="button" className="lab-create-activity client-document-status" onClick={() => setOpen(true)} aria-label={`Documentos de ${patientName}`}><FileCheck2 size={15}/>{error ? "Consultar" : !record ? "Carregando…" : pending ? `${pending} pendente${pending > 1 ? "s" : ""}` : documents.length ? "Assinados" : "Sem registros"}</button>
    <dialog ref={dialog} className="client-documents-dialog" onCancel={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}><header><h2><FileCheck2 size={18}/>Documentos · {patientName}</h2><button type="button" className="lab-create-activity" aria-label="Fechar documentos" onClick={() => setOpen(false)}><X size={16}/></button></header>{error ? <p role="alert">{error}</p> : documents.length ? documents.map(doc => <article key={doc.id}><strong>{doc.title}</strong><span>{doc.kind} · {doc.status}</span><small>{doc.signedAt ? `Assinado em ${new Date(`${doc.signedAt.slice(0,10)}T12:00:00`).toLocaleDateString("pt-BR")}` : "Assinatura não registrada"}{doc.service ? ` · ${doc.service}` : ""}</small></article>) : <p>Sem contratos ou termos cadastrados. Isso não significa que não sejam necessários.</p>}<p>Consulte e atualize a situação em Atendimento → Documentos. A assinatura online ainda depende de integração.</p></dialog></>;
}
