"use client";
import { type LucideIcon } from "lucide-react";
import { InformativeMetricCardPreview, type CardTone } from "../laboratorio/page";
import { ClientSelect } from "./ClientsExperience";

export default function FinanceMetric({ label, value, detail, tone, icon: Icon, period, onPeriod, periodOptions }: { label:string; value:string; detail:string; tone:string; icon:LucideIcon; period?:string; onPeriod?:(value:string)=>void; periodOptions?:string[] }) {
  const cardTone:CardTone=tone==="red"?"rose":tone==="orange"?"amber":tone==="green"?"teal":"blue";
  return <div className="finance-kpi-cell"><InformativeMetricCardPreview tone={cardTone} icon={Icon} title={label} value={value} change={detail}/>{period && onPeriod && periodOptions ? <ClientSelect compact hideLabel label={`Período de ${label}`} value={period} onChange={onPeriod} options={periodOptions}/> : null}</div>;
}
