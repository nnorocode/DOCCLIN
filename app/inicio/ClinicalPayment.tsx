"use client";
import { CreditCard, WalletCards, UsersRound } from "lucide-react";
import { ClientSelect } from "./ClientSelect";
import { money } from "../../lib/operational-data";
import { splitInstallments } from "./finance-model";
import { commissionPreview, safePercent, type ClinicalPaymentDraft, type ClinicalPayment as PaymentSnapshot, type PaymentService, type ServiceTerms } from "../../lib/clinical-payment";

type Props = {
  value:ClinicalPaymentDraft; onChange:(value:ClinicalPaymentDraft)=>void;
  method:string; onMethod:(value:string)=>void; installments:string; onInstallments:(value:string)=>void;
  brand:string; onBrand:(value:string)=>void; total:number; lines:PaymentService[]; terms:ServiceTerms;
};
const dateLabel=(value:string)=>value?new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR"):"—";

export default function ClinicalPayment({value,onChange,method,onMethod,installments,onInstallments,brand,onBrand,total,lines,terms}:Props) {
  const patch=(next:Partial<ClinicalPaymentDraft>)=>onChange({...value,...next});
  const count=value.receiptMode==="single"?1:Math.max(1,Number(installments)||1);
  const parts=splitInstallments("preview",Math.round(total*100),count,value.firstReceiptDate||new Date().toLocaleDateString("en-CA"));
  const commissions=commissionPreview(lines,Math.round(total*100),value,terms);
  const commissionTotal=commissions.reduce((sum,row)=>sum+row.amountCents,0)/100;
  const fees=Math.round(total*value.feePercent)/100;
  const isCard=/crédito|débito/i.test(method);
  return <>
    <section className="client-record-panel clinical-payment-panel"><header><h2><WalletCards size={18}/>Pagamento e recebimento</h2></header>
      <div className="clinical-payment-columns">
        <section><h3><CreditCard size={16}/>Como o paciente paga</h3><div className="clinical-form-grid">
          <ClientSelect label="Forma de pagamento" value={method} options={["Pix","Crédito","Débito","Dinheiro","Boleto","Transferência","Plano"]} onChange={onMethod}/>
          <ClientSelect label="Parcelas do paciente" value={`${installments}x`} options={Array.from({length:24},(_,index)=>`${index+1}x`)} onChange={next=>onInstallments(next.replace("x",""))}/>
          {isCard&&<label className="clinical-field">Bandeira do cartão<input value={brand} placeholder="Ex.: Visa, Mastercard" onChange={event=>onBrand(event.target.value)}/></label>}
        </div><p className="workflow-helper">{installments}x de aproximadamente {money(total/Math.max(1,Number(installments)||1))} · Total {money(total)}</p></section>
        <section><h3><WalletCards size={16}/>Como a clínica recebe</h3><div className="clinical-form-grid">
          <ClientSelect label="Recebimento da clínica" value={value.receiptMode==="single"?"Tudo de uma vez":"Receber parcelado"} options={["Tudo de uma vez","Receber parcelado"]} onChange={next=>patch({receiptMode:next==="Tudo de uma vez"?"single":"installments"})}/>
          <label className="clinical-field">{count===1?"Data prevista do recebimento":"Primeiro recebimento"}<input type="date" value={value.firstReceiptDate} onChange={event=>patch({firstReceiptDate:event.target.value})}/></label>
          {isCard&&<label className="clinical-field">Operadora / maquininha<input value={value.processor} placeholder="Ex.: operadora contratada" onChange={event=>patch({processor:event.target.value})}/></label>}
          <label className="clinical-field">Taxa total do recebimento (%)<input type="number" min="0" max="100" step="0.01" value={value.feePercent} onChange={event=>patch({feePercent:safePercent(Number(event.target.value))})}/></label>
        </div><p className="workflow-helper">Inclua a taxa da operação e eventual antecipação. {value.receiptMode==="single"?"Uma entrada prevista, mesmo se o paciente parcelar.":`${count} ${count===1?"entrada prevista":"entradas mensais previstas"}, conforme o parcelamento do paciente.`}</p></section>
      </div>
      <div className="clinical-payment-totals"><span>Total do paciente<strong>{money(total)}</strong></span><span>Taxas do recebimento<strong>{money(fees)}</strong></span><span>Líquido a receber<strong>{money(total-fees)}</strong></span><span>Comissões a pagar<strong>{money(commissionTotal)}</strong></span></div>
      <details className="clinical-receipt-schedule"><summary>Ver previsão de {count} {count===1?"recebimento":"recebimentos"}</summary><div>{parts.map(part=><article key={part.id}><span>{part.number}/{part.total}</span><time>{dateLabel(part.dueDate)}</time><strong>{money((part.amountCents-Math.round(part.amountCents*value.feePercent/100))/100)}</strong></article>)}</div><p className="workflow-helper">Valores líquidos previstos. A confirmação do atendimento gera contas em aberto; a baixa é feita no Financeiro.</p></details>
    </section>
    <section className="client-record-panel clinical-payment-commissions"><header><h2><UsersRound size={18}/>Comissões</h2></header><p className="workflow-helper">Cada comissão gera uma conta a pagar da clínica, separada do recebimento do paciente.</p>
      <div className="clinical-commission-list">{lines.map(line=>{
        const choice=value.commissions[line.id]??{mode:"catalog" as const,rate:0,beneficiary:"",dueDate:value.firstReceiptDate};
        const result=commissions.find(row=>row.id===line.id)!;
        const change=(next:Partial<typeof choice>)=>patch({commissions:{...value.commissions,[line.id]:{...choice,...next}}});
        const defaultRate=terms[line.serviceId??""]?.commissionRate;
        return <article key={line.id}><header><strong>{line.name}</strong><span>Base após desconto: {money(result.baseCents/100)} · Comissão: <b>{money(result.amountCents/100)}</b></span></header><div className="clinical-form-grid">
          <ClientSelect label={`Comissão · ${line.name}`} value={choice.mode==="none"?"Não pagar comissão":choice.mode==="custom"?"Definir neste atendimento":"Usar cadastro do serviço"} options={["Usar cadastro do serviço","Não pagar comissão","Definir neste atendimento"]} onChange={next=>change({mode:next==="Não pagar comissão"?"none":next==="Definir neste atendimento"?"custom":"catalog"})}/>
          <label className="clinical-field">Comissão (%)<input type="number" min="0" max="100" step="0.01" disabled={choice.mode!=="custom"} value={choice.mode==="custom"?choice.rate:result.rate} onChange={event=>change({rate:safePercent(Number(event.target.value))})}/></label>
          {result.amountCents>0&&<><label className="clinical-field">Beneficiário da comissão<input value={choice.beneficiary} placeholder="Nome do profissional ou parceiro" onChange={event=>change({beneficiary:event.target.value})}/></label><label className="clinical-field">Vencimento da comissão<input type="date" value={choice.dueDate||value.firstReceiptDate} onChange={event=>change({dueDate:event.target.value})}/></label></>}
        </div>{choice.mode==="catalog"&&<p className="workflow-helper">{defaultRate===undefined?"Este serviço ainda não tem comissão cadastrada. Defina uma para este atendimento, se necessário.":`Taxa cadastrada: ${defaultRate}%`}</p>}</article>;
      })}</div>
    </section>
  </>;
}

export function ClinicalPaymentSummary({payment,total,method,installments,brand}:{payment?:PaymentSnapshot;total:number;method:string;installments:number;brand:string}) {
  if(!payment)return <p>{method} · {installments}x {brand}</p>;
  const count=payment.receiptMode==="single"?1:installments;
  return <div className="clinical-payment-summary"><dl className="client-record-fields"><div><dt>Pagamento do paciente</dt><dd>{method} · {installments}x {brand}</dd></div><div><dt>Recebimento da clínica</dt><dd>{count===1?"Tudo de uma vez":`${count} parcelas mensais`} · {dateLabel(payment.firstReceiptDate)}{payment.processor?` · ${payment.processor}`:""}</dd></div><div><dt>Taxa do recebimento</dt><dd>{payment.feePercent}% · {money(Math.round(total*payment.feePercent)/100)}</dd></div><div><dt>Líquido a receber</dt><dd>{money(total-Math.round(total*payment.feePercent)/100)}</dd></div></dl>{payment.commissions.length>0&&<div className="clinical-payment-summary-commissions"><h3>Comissões a pagar</h3>{payment.commissions.map(row=><p key={row.id}><strong>{row.beneficiary} · {money(row.amountCents/100)}</strong><span>{row.service} · {row.rate}% · Vencimento {dateLabel(row.dueDate)}</span></p>)}</div>}</div>;
}
