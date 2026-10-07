"use client";
import SectionNumber from "./SectionNumber";
import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { appStorage } from "../../lib/local-store";
import type { ClinicalRecord } from "../../lib/clinical-records";

const groups = [
  { title: "Motivo da consulta e evolução", fields: ["Queixa principal", "Início e evolução dos sintomas", "Dor: local, intensidade e fatores associados", "Tratamentos já realizados e resposta"] },
  { title: "Condições de saúde", questions: ["Hipertensão", "Diabetes", "Doença cardíaca / arritmia", "Doença respiratória / asma", "Doença renal", "Doença hepática", "Distúrbio de coagulação / sangramento", "Epilepsia / condição neurológica", "Doença autoimune / imunossupressão", "Doença infectocontagiosa", "Câncer / radioterapia / quimioterapia", "Condição de saúde mental", "Gestação", "Amamentação"], fields: ["Detalhes das condições e acompanhamento médico"] },
  { title: "Alergias e reações adversas", questions: ["Alergia a medicamentos", "Alergia a anestésicos", "Alergia a látex", "Alergia a antissépticos / cosméticos", "Alergia alimentar", "Reação em procedimento anterior"], fields: ["Substância, reação apresentada, gravidade e data"] },
  { title: "Medicamentos e antecedentes", questions: ["Uso de anticoagulantes / antiagregantes", "Uso de corticoides / imunossupressores", "Uso de bisfosfonatos / antirreabsortivos", "Cirurgia ou internação anterior", "Problema com anestesia", "Dispositivo implantado / prótese / marca-passo"], fields: ["Medicamentos em uso: dose e frequência", "Suplementos e automedicação", "Cirurgias, internações e datas", "Antecedentes familiares relevantes", "Profissional responsável pelo acompanhamento"] },
  { title: "Hábitos e revisão de sintomas", questions: ["Tabagismo / vape", "Consumo de álcool", "Uso de outras substâncias", "Alteração cardiovascular", "Alteração respiratória", "Alteração digestiva", "Alteração urinária", "Alteração neurológica", "Alteração de pele", "Alteração de sono"], fields: ["Alimentação, atividade física e hábitos", "Detalhes dos sintomas / outros sistemas"] },
  { title: "História odontológica", questions: ["Dor ou sensibilidade dentária", "Sangramento gengival", "Bruxismo / apertamento", "Dor ou estalo na articulação", "Lesão na boca", "Uso de prótese / aparelho", "Trauma dentário", "Boca seca"], fields: ["Última consulta odontológica", "Tratamentos odontológicos anteriores", "Higiene bucal e frequência", "Dificuldades e expectativas do paciente"] },
  { title: "Procedimentos estéticos e complementos", questions: ["Procedimento estético anterior", "Preenchimento / toxina anterior", "Infecção ou lesão na área", "Tendência a queloide / cicatrização alterada"], fields: ["Produtos, locais e datas dos procedimentos anteriores", "Exames relevantes e resultados", "Outras informações / ficha complementar", "Responsável legal e contato de emergência"] },
] as const;
function birthDetails(value?: string) {
  if (!value) return null;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  const br = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!iso && !br) return null;
  const [year, month, day] = iso ? [+iso[1], +iso[2], +iso[3]] : [+br![3], +br![2], +br![1]];
  const date = new Date(year, month - 1, day);
  const today = new Date();
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date > today) return null;
  const age = today.getFullYear() - year - (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day) ? 1 : 0);
  return { formatted: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`, age };
}
export default function ClinicalAnamnesis({ record, onChange, onSave, saving }: { record: ClinicalRecord; onChange: (value: ClinicalRecord) => void; onSave: () => void; saving: boolean }) {
  const [client, setClient] = useState<Record<string, string>>({});
  const birth = birthDetails(client.birthday);
  useEffect(() => { try { const rows = JSON.parse(appStorage.getItem("gest-clients") ?? "[]"); const found = rows.find((row: Record<string,string>) => row.id === record.patientId); setClient(found ?? {}); } catch { setClient({}); } }, [record.patientId]);
  const value = (key: string) => record.anamnesisDetails?.[key] ?? (key === "Queixa principal" ? record.anamnesis : key === "Medicamentos em uso: dose e frequência" ? record.medicines.join(", ") : key === "Outras informações / ficha complementar" ? record.complementaryForm : key === "Detalhes das condições e acompanhamento médico" ? record.conditions.join(", ") : key === "Substância, reação apresentada, gravidade e data" ? record.allergies.join(", ") : "");
  const update = (key: string, text: string) => onChange({ ...record, anamnesisDetails: { ...record.anamnesisDetails, [key]: text }, ...(key === "Queixa principal" ? { anamnesis: text } : {}), ...(key === "Medicamentos em uso: dose e frequência" ? { medicines: text.split(",").map(item => item.trim()).filter(Boolean) } : {}) });
  return <section className="client-record-panel clinical-anamnesis"><header><h2><ClipboardList size={18} />Anamnese</h2><button className="lab-create-activity" disabled={saving} onClick={onSave}>Salvar anamnese</button></header><div className="clinical-patient-summary">{[["Nascimento", birth?.formatted ?? client.birthday], ["Idade", birth ? `${birth.age} anos` : ""], ["E-mail", client.email], ["Telefone", client.phone], ["CPF", client.cpf], ["Endereço", client.address], ["Contato de emergência", client.emergencyContact], ["Responsável", client.guardian]].filter(([,text]) => text).map(([label,text]) => <div key={label}><small>{label}</small><strong>{text}</strong></div>)}</div>{groups.map((group, index) => <section key={group.title} className="clinical-anamnesis-group"><h3><SectionNumber value={index + 1} />{group.title}</h3>{"questions" in group && <div className="clinical-question-list">{group.questions.map(question => <div className="clinical-question-item" key={question}><span className="clinical-question-label">{question}</span><div className="clinical-question-answers" role="group" aria-label={question}>{["Sim", "Não"].map(answer => <button type="button" key={answer} aria-pressed={value(question) === answer} onClick={() => update(question, value(question) === answer ? "" : answer)}>{answer}</button>)}</div></div>)}</div>}<div className="clinical-form-grid">{group.fields.map(field => <label className="clinical-field" key={field}>{field}<textarea rows={2} value={value(field)} onChange={event => update(field, event.target.value)} /></label>)}</div></section>)}<label className="clinical-field">Revisão profissional<textarea rows={2} value={value("Revisão profissional")} onChange={event => update("Revisão profissional",event.target.value)} placeholder="Complementos e observações relevantes" /></label><button className="lab-create-activity" disabled={saving} onClick={onSave}>Salvar anamnese</button><p className="clinical-disclaimer">Roteiro geral adaptável à especialidade. Não substitui avaliação, exame clínico ou validação pelo profissional.</p></section>;
}
