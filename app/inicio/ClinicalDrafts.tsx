"use client";
import { useEffect, useState } from "react";
import { FileClock } from "lucide-react";
import { listClinicalRecords, type ClinicalRecord } from "../../lib/clinical-records";
import { useAccess } from "./AccessControl";

export default function ClinicalDrafts({ onResume }: { onResume: (record: ClinicalRecord) => void }) {
  const businessId = useAccess().member?.businessId ?? "demo";
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => { let active = true; void listClinicalRecords(businessId).then(values => { if (active) setRecords(values.filter(value => value.draft)); }).catch(() => { if (active) setError(true); }); return () => { active = false; }; }, [businessId]);
  if (error) return <p role="alert">Não foi possível consultar os atendimentos em rascunho.</p>;
  if (!records.length) return null;
  return <section className="client-record-panel clinical-drafts"><header><h2><FileClock size={18}/>Atendimentos a finalizar</h2></header><div className="clinical-draft-grid">{records.map(record => <article key={record.patientId}><strong>{record.patientName}</strong><span>{record.draft!.service}</span><small>Rascunho · {new Date(record.draft!.updatedAt).toLocaleString("pt-BR")}</small><button type="button" className="lab-create-activity" onClick={() => onResume(record)}>Continuar atendimento</button></article>)}</div></section>;
}
