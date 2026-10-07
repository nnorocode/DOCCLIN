import { getSupabase } from "./supabase/client";
import { appStorage } from "./local-store";
import type { AnatomyState } from "../app/laboratorio/anatomia/page";

export type Coverage = { kind: "Particular" | "Plano"; insurer: string; category: string; authorization: string };
export type ClinicalEncounter = {
  order?: import("../app/inicio/ClinicalOrder").ClinicalOrderData;
  registeredAt?: string;
  id: string; date: string; appointmentId?: string; service: string; tooth: string; region: string;
  toothNotes?: Record<string, string>; toothSurfaces?: Record<string, string[]>; facialNotes?: Record<string, string>;
  observations: string; products: Array<{ name: string; lot: string; expiry: string }>;
  coverage: Coverage; amount: number; paymentMethod: string; installments: number; cardBrand: string;
  paymentStatus?: "pending" | "paid" | "cancelled"; returnDate: string; completedSteps: string[];
  paidDates?: Record<string, string>; cancelledInstallments?: number[];
};
export type TreatmentStep = { id: string; title: string; plannedDate: string; done: boolean };
export type ClinicalDocument = { id: string; logo?: string; kind: "Contrato" | "Consentimento" | "Receita" | "Atestado" | "Outro"; title: string; status: "Pendente" | "Enviado" | "Assinado" | "Rascunho" | "Emitido"; updatedAt: string; content?: string; service?: string; encounterId?: string; signedAt?: string };
export type ClinicalRecord = {
  documentEmissions?: Array<{id:string;documentId:string;at:string;content:string;title:string;logo?:string}>;
  anatomyHistory?: Array<{id:string;date:string;mode:"dental"|"face";anatomy:AnatomyState}>;
  anatomy?: AnatomyState;
  anamnesisDetails?: Record<string, string>;
  patientId: string; patientName: string; allergies: string[]; conditions: string[]; medicines: string[];
  anamnesis: string; complementaryForm: string; planTitle: string; planEndDate: string;
  encounters: ClinicalEncounter[]; steps: TreatmentStep[]; documents: ClinicalDocument[];
  dentalNotes?: Record<string, string>; dentalSurfaces?: Record<string, string[]>; facialNotes?: Record<string, string>;
  mappedTeeth?: string[]; mappedRegions?: string[];
  coverage: Coverage;
};
const demo = new Map<string, ClinicalRecord>();
const emptyCoverage = (): Coverage => ({ kind: "Particular", insurer: "", category: "", authorization: "" });
export function emptyClinicalRecord(patientId: string, patientName: string): ClinicalRecord {
  return { patientId, patientName, allergies: [], conditions: [], medicines: [], anamnesis: "", complementaryForm: "", planTitle: "", planEndDate: "", encounters: [], steps: [], documents: [], dentalNotes: {}, dentalSurfaces: {}, facialNotes: {}, mappedTeeth: [], mappedRegions: [], coverage: emptyCoverage() };
}
export async function loadClinicalRecord(businessId: string, patientId: string, patientName: string): Promise<ClinicalRecord> {
  const db = getSupabase();
  if (!db) {
    const cached = demo.get(`${businessId}:${patientId}`);
    if (cached) return structuredClone(cached);
    try { const stored = appStorage.getItem(`clinical-record:${businessId}:${patientId}`); if (stored) return JSON.parse(stored) as ClinicalRecord; } catch { /* Cadastro ainda não salvo. */ }
    return emptyClinicalRecord(patientId, patientName);
  }
  const { data, error } = await db.from("clinical_records").select("data").eq("business_id", businessId).eq("patient_id", patientId).maybeSingle();
  if (error) throw error;
  return data?.data as ClinicalRecord ?? emptyClinicalRecord(patientId, patientName);
}
export async function saveClinicalRecord(businessId: string, record: ClinicalRecord): Promise<void> {
  const db = getSupabase();
  if (!db) { demo.set(`${businessId}:${record.patientId}`, structuredClone(record)); appStorage.setItem(`clinical-record:${businessId}:${record.patientId}`, JSON.stringify(record)); return; }
  const { error } = await db.from("clinical_records").upsert({ business_id: businessId, patient_id: record.patientId, data: record }, { onConflict: "business_id,patient_id" });
  if (error) throw error;
}
export async function listClinicalRecords(businessId: string): Promise<ClinicalRecord[]> {
  const db = getSupabase();
  if (!db) {
    const records=new Map<string,ClinicalRecord>();
    for(const key of appStorage.keys()) if(key.startsWith(`clinical-record:${businessId}:`)){
      try{const value=JSON.parse(appStorage.getItem(key)??"null") as ClinicalRecord|null;if(value?.patientId&&Array.isArray(value.encounters))records.set(value.patientId,value);}catch{}
    }
    for(const [key,value] of demo)if(key.startsWith(`${businessId}:`))records.set(value.patientId,structuredClone(value));
    return [...records.values()];
  }
  const { data, error } = await db.from("clinical_records").select("data").eq("business_id", businessId).order("updated_at", { ascending: false }).limit(500);
  if (error) throw error;
  return (data ?? []).map((row) => row.data as ClinicalRecord);
}
