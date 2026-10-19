"use client";
import { useEffect, useState } from "react";
import { FileClock, UserRound } from "lucide-react";
import { listClinicalRecords, type ClinicalRecord } from "../../lib/clinical-records";
import { useAccess } from "./AccessControl";

export default function ClinicalDrafts({ onResume }: { onResume: (record: ClinicalRecord) => void }) {
  const businessId = useAccess().member?.businessId ?? "demo";
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => { let active = true; void listClinicalRecords(businessId).then(values => { if (active) setRecords(values.filter(value => value.draft)); }).catch(() => { if (active) setError(true); }); return () => { active = false; }; }, [businessId]);
  if (error) return <p role="alert">Não foi possível consultar os atendimentos em rascunho.</p>;
  if (!records.length) return null;
  return <section className="clinical-drafts"><header><h2><FileClock size={18}/>Atendimentos a finalizar</h2></header><div className="clinical-draft-grid">{records.map(record => {
    const created=record.draft!.createdAt??record.draft!.updatedAt;
    const overdue=Date.now()-new Date(created).getTime()>24*60*60*1000;
    return <article key={record.patientId} className={overdue?"is-overdue":""}><header className="clinical-draft-profile"><i><UserRound size={22}/></i><div><strong>{record.patientName}</strong><small>{record.draft!.createdAt ? "Criado em" : "Salvo em"} {new Date(created).toLocaleString("pt-BR")}</small></div></header><span className="clinical-draft-state">{overdue?"Pendente há mais de um dia":"Em rascunho"}</span><span>{record.draft!.service}</span><small>Atualizado em {new Date(record.draft!.updatedAt).toLocaleString("pt-BR")}</small><button type="button" className="lab-create-activity" onClick={() => onResume(record)}>Continuar atendimento</button></article>;
  })}</div></section>;
}
