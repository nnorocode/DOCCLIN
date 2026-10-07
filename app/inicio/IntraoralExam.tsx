"use client";
import SectionNumber from "./SectionNumber";
import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";

export default function IntraoralExam({ value, onChange }: { value: Record<string,string>; onChange: (value: Record<string,string>) => void }) {
  const [details, setDetails] = useState<string[]>([]);
  const update = (key:string, answer:string) => onChange({...value, [key]:value[key]===answer?"":answer});
  const row = (label:string, options:string[]) => <div className="clinical-exam-row" key={label}><span>{label}</span><div className="clinical-exam-answers">{options.map(answer=><button type="button" key={answer} aria-pressed={value[label]===answer} onClick={()=>update(label,answer)}>{answer}</button>)}<button type="button" aria-label={`Mais informações: ${label}`} aria-expanded={details.includes(label)} onClick={()=>setDetails(old=>old.includes(label)?old.filter(item=>item!==label):[...old,label])}><MessageSquarePlus size={16}/></button></div>{details.includes(label)&&<textarea aria-label={`Observações: ${label}`} rows={2} value={value[`${label}: observações`]??""} onChange={event=>onChange({...value,[`${label}: observações`]:event.target.value})}/>}</div>;
  return <section className="clinical-intraoral-exam"><h3><SectionNumber value={4} />Exame intraoral</h3><p>Escala de 1 a 5: 1 ruim · 5 boa. Deixe em branco o que não foi avaliado.</p><div className="clinical-exam-grid">{["Higiene","Halitose","Mucosa","Língua","Palato","Palato mole","Assoalho bucal","Lábios"].map(label=>row(label,["1","2","3","4","5"]))}</div><h3><SectionNumber value={5} />Periodontal</h3><div className="clinical-exam-grid">{["Placa bacteriana visível","Sangramento gengival","Tártaro","Mobilidade dental"].map(label=>row(label,["Sim","Não"]))}{["Apinhamento","Diastema"].map(label=>row(label,["1","2","3","4","5"]))}{row("Mordida",["Normal","Aberta","Cruzada","Profunda"])}</div><label className="clinical-field">Desvio de linha média / outras alterações<textarea rows={2} value={value["Outras alterações"]??""} onChange={event=>onChange({...value,"Outras alterações":event.target.value})}/></label></section>;
}
