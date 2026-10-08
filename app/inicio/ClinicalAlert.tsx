"use client";
import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { clinicalAlerts, loadClinicalRecord, type ClinicalRecord } from "../../lib/clinical-records";
import { useAccess } from "./AccessControl";

export default function ClinicalAlert({ patientId, patientName, record }: { patientId: string; patientName: string; record?: ClinicalRecord }) {
  const businessId = useAccess().member?.businessId ?? "demo";
  const [stored, setStored] = useState<ClinicalRecord>();
  useEffect(() => { if (record) return; let active = true; void loadClinicalRecord(businessId, patientId, patientName).then(value => { if (active) setStored(value); }).catch(() => {}); return () => { active = false; }; }, [businessId, patientId, patientName, record]);
  const alerts = record || stored ? clinicalAlerts((record || stored)!) : [];
  if (!alerts.length) return null;
  return <span className="clinical-attention" tabIndex={0} aria-label={`Atenção clínica: ${alerts.join("; ")}`}><TriangleAlert size={18}/><span role="tooltip">Atenção clínica: {alerts.join("; ")}</span></span>;
}
