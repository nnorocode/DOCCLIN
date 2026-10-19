import { validIsoDate, splitInstallments, type FinanceTransaction } from "../app/inicio/finance-model";
import type { ClinicalRecord } from "./clinical-records";

export type ServiceTerms = Record<string, { commissionRate: number }>;
export type CommissionChoice = { mode: "catalog" | "custom" | "none"; rate: number; beneficiary: string; dueDate: string };
export type ClinicalPaymentDraft = {
  receiptMode: "single" | "installments";
  firstReceiptDate: string;
  processor: string;
  feePercent: number;
  commissions: Record<string, CommissionChoice>;
};
export type ClinicalCommission = {
  id: string; service: string; serviceId?: string; rate: number; baseCents: number; amountCents: number;
  beneficiary: string; dueDate: string; paidAt?: string; cancelled?: boolean;
};
export type ClinicalPayment = Omit<ClinicalPaymentDraft, "commissions"> & { commissions: ClinicalCommission[] };
export type PaymentService = { id: string; serviceId?: string; name: string; quantity: number; price: number };
export const emptyClinicalPayment = (date: string): ClinicalPaymentDraft => ({ receiptMode:"installments", firstReceiptDate:date, processor:"", feePercent:0, commissions:{} });
export const safePercent = (value: number) => Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

/** Allocate the discounted total in cents so commissions never exceed their real base. */
export function commissionPreview(lines: PaymentService[], totalCents: number, payment: ClinicalPaymentDraft, terms: ServiceTerms): ClinicalCommission[] {
  const weights = lines.map(line => Math.max(0, Math.round(line.price * line.quantity * 100)));
  const gross = weights.reduce((sum, value) => sum + value, 0);
  let allocated = 0;
  return lines.map((line, index) => {
    const baseCents = index === lines.length - 1 ? Math.max(0,totalCents - allocated) : gross ? Math.floor(totalCents * weights[index] / gross) : 0;
    allocated += baseCents;
    const choice = payment.commissions[line.id];
    const rate = safePercent(choice?.mode === "none" ? 0 : choice?.mode === "custom" ? choice.rate : terms[line.serviceId ?? ""]?.commissionRate ?? 0);
    return { id:line.id, service:line.name, serviceId:line.serviceId, rate, baseCents, amountCents:Math.round(baseCents * rate / 100), beneficiary:choice?.beneficiary.trim() ?? "", dueDate:choice?.dueDate || payment.firstReceiptDate };
  });
}
export function paymentSnapshot(payment: ClinicalPaymentDraft, lines: PaymentService[], totalCents: number, terms: ServiceTerms): ClinicalPayment {
  return { ...payment, feePercent:safePercent(payment.feePercent), commissions:commissionPreview(lines,totalCents,payment,terms).filter(row=>row.amountCents>0) };
}
export function paymentValidation(payment: ClinicalPayment): string | null {
  if (!validIsoDate(payment.firstReceiptDate)) return "Informe a data do primeiro recebimento da clínica.";
  for (const row of payment.commissions) {
    if (!row.beneficiary) return `Informe quem receberá a comissão de ${row.service}.`;
    if (!validIsoDate(row.dueDate)) return `Informe o vencimento da comissão de ${row.service}.`;
  }
  return null;
}

/** Only finalized encounters generate receivables and separate commission payables. */
export function clinicalTransactions(record: ClinicalRecord): FinanceTransaction[] {
  return record.encounters.filter(item=>item.amount>0 && item.paymentStatus!=="cancelled").flatMap(item=>{
    const id=`CLIN-${item.id}`, cents=Math.round(item.amount*100), payment=item.payment;
    const count=payment?.receiptMode==="single" ? 1 : item.installments || 1;
    const income:FinanceTransaction={
      id,description:item.service,kind:"income",category:"Atendimento clínico",source:"clinical",customer:record.patientName,product:item.service,
      clinicalEncounterId:item.id,clinicalPatientId:record.patientId,competenceDate:item.date,grossCents:cents,discountBps:0,taxBps:0,
      directCostCents:Math.round((item.order?.cost??0)*100),feeBps:Math.round((payment?.feePercent??item.order?.fee??0)*100),
      paymentMethod:item.paymentMethod||"A definir",processor:payment?.processor,brand:item.cardBrand,customerInstallments:item.installments,
      installments:splitInstallments(id,cents,count,payment?.firstReceiptDate||item.date).map(part=>({...part,status:item.cancelledInstallments?.includes(part.number)?"cancelled":item.paidDates?.[part.number]?"paid":"pending",settledAt:item.paidDates?.[part.number]})),
    };
    const expenses:FinanceTransaction[]=(payment?.commissions??[]).map(row=>{
      const expenseId=`CLINCOM-${item.id}-${row.id}`;
      return {id:expenseId,description:`Comissão · ${row.beneficiary} · ${row.service}`,kind:"expense",category:"Comissões",source:"clinical",customer:row.beneficiary,
        clinicalEncounterId:item.id,clinicalPatientId:record.patientId,clinicalCommissionId:row.id,commissionRate:row.rate,
        competenceDate:item.date,grossCents:row.amountCents,discountBps:0,taxBps:0,directCostCents:0,feeBps:0,paymentMethod:"A definir",
        installments:splitInstallments(expenseId,row.amountCents,1,row.dueDate).map(part=>({...part,status:row.cancelled?"cancelled":row.paidAt?"paid":"pending",settledAt:row.paidAt})),cancelled:row.cancelled};
    });
    return [income,...expenses];
  });
}
