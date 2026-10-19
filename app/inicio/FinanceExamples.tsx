"use client";
import { useState } from "react";
import { FlaskConical, Plus } from "lucide-react";
import { useAccess } from "./AccessControl";
import { appStorage } from "../../lib/local-store";
import { emptyClinicalRecord, saveClinicalRecord, type ClinicalEncounter } from "../../lib/clinical-records";
import { financeRows, syncClinicalFinance, readData } from "../../lib/operational-data";
import { splitInstallments, type FinanceTransaction } from "./finance-model";

export default function FinanceExamples() {
  const access=useAccess();
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  if(access.mode!=="demo")return null;
  async function create() {
    if(!access.member)return;
    setBusy(true);
    try {
      const businessId=access.member.businessId;
      for(let patient=0;patient<2;patient++) {
        const record=emptyClinicalRecord(`PREVIEW-PATIENT-${patient}`,`Paciente de exemplo ${patient+1}`);
        for(let month=0;month<6;month++) {
          const date=new Date(); date.setDate(8); date.setMonth(date.getMonth()-month);
          const iso=date.toLocaleDateString("en-CA");
          const amount=patient===0?450+month*50:900+month*100;
          const encounter:ClinicalEncounter={id:`PREVIEW-${patient}-${month}`,date:iso,service:patient===0?"Consulta de exemplo":"Procedimento de exemplo",tooth:"",region:"",observations:"Registro fictício para avaliação visual. Não corresponde a um paciente real.",products:[],coverage:record.coverage,amount,paymentMethod:patient===0?"Pix":"Cartão de crédito",installments:patient===0?1:3,cardBrand:"",paymentStatus:month===0?"pending":"paid",returnDate:"",completedSteps:["Serviços"],registeredAt:date.toISOString()};
          if(month>0)encounter.paidDates=Object.fromEntries(Array.from({length:encounter.installments},(_,i)=>[String(i+1),iso]));
          record.encounters.push(encounter);
        }
        await saveClinicalRecord(businessId,record);
      }
      await syncClinicalFinance(businessId);
      const expenses:FinanceTransaction[]=Array.from({length:6},(_,month)=>{
        const date=new Date();date.setDate(10);date.setMonth(date.getMonth()-month);const iso=date.toLocaleDateString("en-CA"),id=`PREVIEW-EXPENSE-${month}`,grossCents=20000+month*2500;
        return {id,description:"Materiais de exemplo",kind:"expense",category:"Materiais",source:"manual",competenceDate:iso,grossCents,discountBps:0,taxBps:0,directCostCents:0,feeBps:0,paymentMethod:"Pix",installments:splitInstallments(id,grossCents,1,iso).map(part=>({...part,status:month===0?"pending":"paid",settledAt:month===0?undefined:iso}))};
      });
      appStorage.setItem("gest-finance-transactions",JSON.stringify([...financeRows().filter(row=>!row.id.startsWith("PREVIEW-EXPENSE-")),...expenses]));
      const clients=readData<Array<Record<string,unknown>>>("gest-clients",[]);
      appStorage.setItem("gest-clients",JSON.stringify([...clients.filter(row=>!String(row.id).startsWith("PREVIEW-PATIENT-")),...Array.from({length:2},(_,i)=>({id:`PREVIEW-PATIENT-${i}`,initials:`E${i+1}`,name:`Paciente de exemplo ${i+1}`,email:"",type:"Pessoa Física",contact:new Date().toLocaleDateString("pt-BR"),relative:"Exemplo",total:"R$ 0,00",status:"Ativo",source:"Prévia visual",createdAt:new Date(new Date().setMonth(new Date().getMonth()-5)).toISOString()}))]));
      setMessage("12 atendimentos e 6 despesas de exemplo registrados. Os indicadores são calculados a partir dessa base.");
    } catch { setMessage("Não foi possível registrar os exemplos. Tente novamente."); }
    finally {setBusy(false);}
  }
  return <aside className="finance-example-notice"><span><FlaskConical size={16}/> {message||"Prévia local: exemplos identificados, sem pacientes reais."}</span><button type="button" className="finance-secondary" disabled={busy} onClick={create}><Plus size={15}/>{busy?"Registrando…":"Carregar exemplos"}</button></aside>;
}
