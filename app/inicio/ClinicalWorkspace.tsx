"use client";

import ClinicalImages from "./ClinicalImages";
import PatientRecordReview, { PatientDocuments } from "./PatientRecordReview";
import { money, readData } from "../../lib/operational-data";
import ClinicalPayment, { ClinicalPaymentSummary } from "./ClinicalPayment";
import { emptyClinicalPayment, paymentSnapshot, paymentValidation, type ClinicalPaymentDraft, type ServiceTerms } from "../../lib/clinical-payment";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Settings, CalendarDays, Check, ChevronLeft, ClipboardPlus, FileText, HeartPulse, Plus, Printer, MessageCircle, Edit3 } from "lucide-react";
import ScrollableTabBar from "./ScrollableTabBar";
import { ClientSelect } from "./ClientsExperience";
import { ClinicalAtlas } from "../laboratorio/anatomia/page";
import ClinicalAnamnesis from "./ClinicalAnamnesis";
import ClinicalAlert from "./ClinicalAlert";
import ClinicalOrder, { type ClinicalOrderData } from "./ClinicalOrder";
import {ClinicalLetterhead,emptyLetterhead} from "./ClinicalLetterhead";
import {safeAttachmentUrl} from "../../lib/file-security";
import ClinicalDocumentPreview from "./ClinicalDocumentPreview";
import { InformativeMetricCardPreview } from "../laboratorio/page";
import { appStorage } from "../../lib/local-store";
import { useAccess } from "./AccessControl";
import { emptyClinicalRecord, loadClinicalRecord, saveClinicalRecord, type ClinicalDocument, type ClinicalEncounter, type ClinicalRecord, type Coverage } from "../../lib/clinical-records";

type Appointment = { id: string; service: string; coverage: Coverage };
type FilePanels = { render: (section: string, record: ClinicalRecord) => ReactNode; attachments: ReactNode; onEdit: () => void };
type Props = { initialSection?: Section; filePanels?: FilePanels; patientId: string; patientName: string; appointment?: Appointment; onBack: () => void; documentModels: string[][]; onMessage: () => void };
type Section = "Serviços" | "Anamnese" | "Odontograma" | "ROC" | "Receitas" | "Documentos" | "Resumo" | "RX" | "Dados" | "Histórico" | "Observações";
const commonAllergies = ["Nenhuma conhecida", "Látex", "Penicilina", "Anestésico", "Outro"];
const commonConditions = ["Diabetes", "Hipertensão", "Gestação", "Cirurgia recente", "Outra"];
const defaultServices: string[] = [];
const fmt = (date: string) => date ? new Date(date.includes("T")?date:`${date}T12:00:00`).toLocaleDateString("pt-BR") : "—";
const today = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; };
const toast = (message: string) => window.dispatchEvent(new CustomEvent("gest-app-toast", { detail: message }));

export default function ClinicalWorkspace({ initialSection, filePanels, patientId, patientName, appointment, onBack, documentModels, onMessage }: Props) {
  const access = useAccess();
  const businessId = access.member?.businessId ?? "demo";
  const [record, setRecord] = useState<ClinicalRecord>(() => emptyClinicalRecord(patientId, patientName));
  const [atlasVersion,setAtlasVersion]=useState(0);
  const [atlasSnapshot,setAtlasSnapshot]=useState<ClinicalRecord["anatomy"]>();
  const updateAnatomy = useCallback((anatomy: NonNullable<ClinicalRecord["anatomy"]>) => setRecord(current => ({...current,anatomy,mappedTeeth:anatomy.selectedTeeth.map(String),dentalNotes:anatomy.notes,dentalSurfaces:anatomy.faces,mappedRegions:anatomy.marks.map(mark=>mark.region),facialNotes:Object.fromEntries(anatomy.marks.map(mark=>[mark.id,mark.note]))})), []);
  const [documentHistory,setDocumentHistory]=useState("Todos");
  const [createDocument,setCreateDocument]=useState(false);
  const [documentEncounter,setDocumentEncounter]=useState("");
  const [documentService,setDocumentService]=useState("");
  const [section, setSection] = useState<Section>(initialSection??(filePanels?"Dados":"Anamnese"));
  const savedFileSignature = useRef<string | null>(null);
  useEffect(()=>{if(initialSection)setSection(initialSection);},[initialSection]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [service, setService] = useState(appointment?.service ?? "Consulta de avaliação");
  const [tooth, setTooth] = useState("");
  const [region, setRegion] = useState("");
  const [observations, setObservations] = useState("");
  const [product, setProduct] = useState("");
  const [lot, setLot] = useState("");
  const [expiry, setExpiry] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [installments, setInstallments] = useState("1");
  const [cardBrand, setCardBrand] = useState("");
  const [payment,setPayment]=useState<ClinicalPaymentDraft>(()=>emptyClinicalPayment(today()));
  const [serviceTerms,setServiceTerms]=useState<ServiceTerms>({});
  const [catalogRows,setCatalogRows]=useState<string[][]>([]);
  const [returnDate, setReturnDate] = useState("");
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [stepTitle, setStepTitle] = useState("");
  const [stepDate, setStepDate] = useState("");
  const [docKind, setDocKind] = useState<ClinicalDocument["kind"]>("Contrato");
  const [docTitle, setDocTitle] = useState("");
  const [docText, setDocText] = useState("");
  const [previewDoc, setPreviewDoc] = useState<ClinicalDocument | null>(null);
  const [modelRows, setModelRows] = useState(documentModels);
  const [modelId, setModelId] = useState("");
  const [letterhead,setLetterhead]=useState(emptyLetterhead);
  const [recipeType,setRecipeType]=useState("Atestado");
  const [order,setOrder]=useState<ClinicalOrderData>({lines:[],discount:0,fee:0,total:0,cost:null});
  const [reviewOrder,setReviewOrder]=useState(false);
  const documentHeader=[letterhead.clinic,letterhead.professional,letterhead.registration].filter(Boolean).join("\n");
  const documentFooter=["Assinatura: ____________________________________",letterhead.professional,letterhead.registration,letterhead.address,letterhead.phone].filter(Boolean).join("\n");
  const [letterheadOpen,setLetterheadOpen]=useState(false);
  const [documentMode,setDocumentMode]=useState<"Receita"|"Atestado"|"Contratos"|"Termo de consentimento">("Atestado");
  const [recipeHeader, setRecipeHeader] = useState("");
  useEffect(()=>{try{const saved=JSON.parse(appStorage.getItem("clinical-letterhead:"+businessId)??"null");if(saved)setLetterhead({...emptyLetterhead,...saved});}catch{}},[businessId]);
  const [recipeFooter, setRecipeFooter] = useState("");
  const [prescriptions, setPrescriptions] = useState<Record<string,string>>({});
  const prescription = prescriptions[recipeType] ?? "";
  const setPrescription = (text:string) => setPrescriptions(current=>({...current,[recipeType]:text}));
  const [recipePreviewOverride,setRecipePreviewOverride]=useState<string|null>(null);
  const baseText = recipeType === "Atestado"
    ? "Atesto, para os devidos fins, que o(a) paciente acima identificado(a) foi atendido(a) nesta data.\n\nPeríodo de afastamento, se necessário: [preencher pelo profissional].\nOrientações: [preencher pelo profissional]."
    : "1. [Medicamento / apresentação]\nDose: [preencher] · Via: [preencher]\nFrequência: [preencher] · Duração: [preencher]\n\nOrientações: [preencher pelo profissional].";
  const recipeContent = () => recipePreviewOverride ?? [recipeHeader||documentHeader||"[Clínica]\n[Profissional responsável · CRM / CRO e UF]",`Paciente: ${patientName}\nData: ${fmt(today())} · ${new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}`,prescription||baseText,recipeFooter||documentFooter].join("\n\n");
  useEffect(()=>setRecipePreviewOverride(null),[recipeHeader,recipeFooter,prescription,recipeType,letterhead]);
  useEffect(() => { setDocumentHistory("Todos"); }, [section]);
  useEffect(() => {
    try { setModelRows(JSON.parse(appStorage.getItem("gest-document-records") ?? "null") ?? documentModels); } catch { setModelRows(documentModels); }
    try { const settings = JSON.parse(appStorage.getItem(`clinical-recipe-${businessId}`) ?? "{}"); const business = JSON.parse(appStorage.getItem("gest-business-settings") ?? "{}"); setRecipeHeader(settings.header ?? [business.name, business.address, business.phone].filter(Boolean).join("\n")); setRecipeFooter(settings.footer ?? ""); } catch { /* Campos permanecem editáveis. */ }
  }, [section, businessId, documentModels]);
  const printDoc = async (doc: ClinicalDocument) => {
    const issued={...doc,id:doc.id==="preview"?crypto.randomUUID():doc.id,status:doc.kind==="Contrato"||doc.kind==="Consentimento"?doc.status:"Emitido" as const,updatedAt:new Date().toISOString(),logo:doc.logo??letterhead.logo};
    if(!await persist({...record,documents:[issued,...record.documents.filter(item=>item.id!==issued.id)],documentEmissions:[{id:crypto.randomUUID(),documentId:issued.id,at:issued.updatedAt,content:issued.content??"",title:issued.title,logo:doc.logo??letterhead.logo},...(record.documentEmissions??[])]},"Emissão registrada. Confirme a impressão na janela do navegador."))return;
    const frame = document.createElement("iframe"); frame.style.display = "none";
    const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
    frame.srcdoc = `<html><head><title>${escape(doc.title)}</title><style>body{font:16px Arial;padding:40px;white-space:pre-wrap;line-height:1.6}h1{font-size:22px}</style></head><body><h1>${escape(doc.title)}</h1>${safeAttachmentUrl(issued.logo)?`<img src="${issued.logo}" style="max-height:65px;max-width:180px"/>`:""}${escape(doc.content ?? "")}</body></html>`;
    frame.onload = () => { frame.contentWindow?.focus(); frame.contentWindow?.print(); window.setTimeout(() => frame.remove(), 60000); }; document.body.appendChild(frame);
  };
  const shareDoc = (doc: ClinicalDocument) => {
    appStorage.setItem("clinical-message-draft",JSON.stringify({patientId,patientName,text:`${doc.title}\n\n${doc.content ?? ""}`}));
    onMessage();
    toast("Documento preparado em Mensagens. Revise antes de enviar.");
  };
  const [stockRows, setStockRows] = useState<string[][]>([]);
  const [catalogServices, setCatalogServices] = useState<string[]>([]);
  useEffect(() => { try { const rows = JSON.parse(appStorage.getItem("gest-stock-records") ?? "[]"); if (Array.isArray(rows)) setStockRows(rows.filter((row): row is string[] => Array.isArray(row) && row.every((value) => typeof value === "string"))); } catch { /* Cadastro de estoque opcional. */ } }, []);
  useEffect(() => {
    const names = new Set<string>();
    const services:string[][]=[];
    for (const key of ["gest-catalog-records", "gest-priced-catalog"]) {
      try {
        const rows = JSON.parse(appStorage.getItem(key) ?? "[]");
        if (Array.isArray(rows)) rows.forEach((row) => { if (Array.isArray(row) && row[2] === "Serviço" && typeof row[1] === "string") { names.add(row[1]); services.push(row); } });
      } catch { /* Catálogo opcional na prévia. */ }
    }
    setCatalogServices([...names]);
    setCatalogRows(services);
    setServiceTerms(readData<ServiceTerms>("gest-service-commercial-terms",{}));
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    void loadClinicalRecord(businessId, patientId, patientName).then((value) => { if (active) { setRecord({ ...emptyClinicalRecord(patientId, patientName), ...value, ...(appointment ? { coverage: appointment.coverage } : {}) }); setPrescriptions(value.prescriptionDrafts??{}); if(value.draft){setService(value.draft.service);setObservations(value.draft.observations);setReturnDate(value.draft.returnDate);setPaymentMethod(value.draft.paymentMethod);setInstallments(value.draft.installments);setCardBrand(value.draft.cardBrand);setAmount(value.draft.amount);setPayment({...emptyClinicalPayment(today()),...value.draft.payment,feePercent:value.draft.payment?.feePercent??value.draft.order?.fee??0});setProduct(value.draft.product??"");setLot(value.draft.lot??"");setExpiry(value.draft.expiry??"");setSelectedSteps(value.draft.selectedSteps??[]);setPrescriptions(value.draft.prescriptions??value.prescriptionDrafts??{});} setTooth((value.mappedTeeth ?? []).join(", ")); setRegion((value.mappedRegions ?? []).join(", ")); } }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível abrir o prontuário."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [businessId, patientId, patientName, appointment]);
  const progress = useMemo(() => ({ done: record.steps.filter((step) => step.done).length, total: record.steps.length }), [record.steps]);
  const serviceOptions = useMemo(() => [...new Set([appointment?.service, ...catalogServices, ...defaultServices].filter((value): value is string => Boolean(value)))], [appointment?.service, catalogServices]);
  const appointmentEncounter = appointment ? record.encounters.find((item) => item.appointmentId === appointment.id) : undefined;
  const paymentTotal=order.lines.length?order.total:Math.max(0,Number(amount)||0)*(1-order.discount/100);
  const paymentLines=order.lines.length?order.lines.map(line=>({...line,serviceId:line.serviceId??catalogRows.find(row=>row[1]===line.name)?.[0]})):[{id:"service",serviceId:catalogRows.find(row=>row[1]===service)?.[0],name:service,quantity:1,price:paymentTotal}];
  const currentPayment=paymentSnapshot(payment,paymentLines,Math.round(paymentTotal*100),serviceTerms);
  const commissionTotal=currentPayment.commissions.reduce((sum,row)=>sum+row.amountCents,0)/100;
  const persist = async (next: ClinicalRecord, message: string): Promise<boolean> => {
    setSaving(true); setError("");
    try { const saved = { ...next, ...(next.encounters.length === record.encounters.length && !appointmentEncounter && !filePanels ? { draft: { createdAt: record.draft ? record.draft.createdAt : new Date().toISOString(), updatedAt: new Date().toISOString(), appointmentId: appointment?.id, service, observations, returnDate, paymentMethod, installments, cardBrand, amount, product, lot, expiry, selectedSteps, prescriptions, order, payment } } : {}) }; await saveClinicalRecord(businessId, saved); setRecord(saved); toast(message); return true; }
    catch (cause) { const message = cause instanceof Error ? cause.message : "Não foi possível salvar."; setError(message); toast(`Não foi possível salvar: ${message}`); return false; }
    finally { setSaving(false); }
  };
  const fileSignature = JSON.stringify([{...record,draft:undefined},service,observations,returnDate,paymentMethod,installments,cardBrand,amount,product,lot,expiry,selectedSteps,prescriptions,order,payment]);
  useEffect(() => {
    if (loading || appointmentEncounter || saving || filePanels) return;
    if(filePanels){
      if(savedFileSignature.current===null){savedFileSignature.current=fileSignature;return;}
      if(savedFileSignature.current===fileSignature)return;
    }
    const timer = window.setTimeout(() => {
      const next = { ...record, draft: { createdAt: record.draft ? record.draft.createdAt : new Date().toISOString(), updatedAt: new Date().toISOString(), appointmentId: appointment?.id, service, observations, returnDate, paymentMethod, installments, cardBrand, amount, product, lot, expiry, selectedSteps, prescriptions, order, payment } };
      void saveClinicalRecord(businessId,next).then(()=>{savedFileSignature.current=fileSignature;}).catch(cause=>setError(cause instanceof Error?cause.message:"Não foi possível salvar o rascunho."));
    }, 600);
    return () => window.clearTimeout(timer);
  }, [loading,saving,record,appointmentEncounter,appointment?.id,businessId,service,observations,returnDate,paymentMethod,installments,cardBrand,amount,product,lot,expiry,selectedSteps,prescriptions,order,payment,filePanels,fileSignature]);
  const toggle = (key: "allergies" | "conditions", value: string) => {
    const current = record[key];
    const next = { ...record, [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] };
    void persist(next, "Prontuário atualizado.");
  };
  const changeCoverage = (patch: Partial<Coverage>) => setRecord((current) => ({ ...current, coverage: { ...current.coverage, ...patch } }));
  const saveEncounter = async () => {
    if (saving) return;
    if (appointmentEncounter) { setError("Este evento já foi concluído. O registro está no histórico clínico."); return; }
    if (!service.trim()) { setError("Selecione o serviço realizado."); return; }
    if (product.trim() && (!lot.trim() || !expiry)) { setError("Informe lote e validade do produto utilizado."); return; }
    if (expiry && expiry < today()) { setError("O lote informado está vencido."); return; }
    if (record.coverage.kind === "Plano" && !record.coverage.insurer.trim()) { setError("Selecione o plano do atendimento."); return; }
    const paymentError=paymentValidation(currentPayment);
    if(paymentError){setError(paymentError);return;}
    const encounter: ClinicalEncounter = {
      id: crypto.randomUUID(), date: today(), appointmentId: appointment?.id, service: order.lines.length?order.lines.map(line=>line.name).join(" · "):service.trim(), tooth: (record.mappedTeeth ?? []).join(", ") || tooth.trim(), region: (record.mappedRegions ?? []).join(", ") || region.trim(), anatomy: record.anatomy ? structuredClone(record.anatomy) : undefined, anamnesisDetails: {...record.anamnesisDetails}, toothNotes: { ...record.dentalNotes }, toothSurfaces: { ...record.dentalSurfaces }, facialNotes: { ...record.facialNotes },
      observations: observations.trim(), products: product.trim() ? [{ name: product.trim(), lot: lot.trim(), expiry }] : [],
      coverage: { ...record.coverage }, amount: paymentTotal, order: structuredClone(order), registeredAt:new Date().toISOString(), paymentMethod, installments: Math.max(1, Number(installments) || 1), cardBrand,
      paymentStatus: "pending", returnDate, completedSteps: selectedSteps,
      payment:structuredClone(currentPayment),
    };
    const next = { ...record, prescriptionDrafts: prescriptions, draft: undefined, encounters: [encounter, ...record.encounters], steps: record.steps.map((step) => selectedSteps.includes(step.id) ? { ...step, done: true } : step) };
    if (await persist(next, "Atendimento finalizado e salvo.")) {
      setObservations(""); setSelectedSteps([]); setProduct(""); setLot(""); setExpiry(""); setSection("Resumo"); onBack();
    }
  };
  const addDocument = async () => {
    if (!docTitle.trim()) { setError("Informe o nome do documento."); return; }
    const doc: ClinicalDocument = { id: crypto.randomUUID(), kind: docKind, title: docTitle.trim(), status: docKind === "Contrato" || docKind === "Consentimento" ? "Pendente" : "Rascunho", updatedAt: today(), content: [documentHeader,docText.trim(),documentFooter].filter(Boolean).join("\n\n"), service: documentService || service, encounterId: documentEncounter || appointmentEncounter?.id };
    if (!await persist({ ...record, documents: [doc, ...record.documents] }, "Documento preparado.")) return;
    setPreviewDoc(doc);
    setDocTitle(""); setDocText("");
  };
  const tabs: Section[] = filePanels
    ? ["Dados", "Histórico", "Documentos", "Anamnese", "Odontograma", "ROC", "RX", "Serviços", "Resumo"]
    : ["Anamnese", "Odontograma", "ROC", "RX", "Documentos", "Serviços", "Resumo"];
  const navigation = <ScrollableTabBar className="detail-category-tabs clinical-tabs" label={filePanels ? "Ficha do paciente" : "Seções do prontuário"}>{tabs.map(item => <button type="button" aria-current={section === item ? "page" : undefined} className={section === item ? "active" : ""} key={item} onClick={() => setSection(item)}>{item === "Serviços" ? "Pagamento" : item}</button>)}</ScrollableTabBar>;
  return <section className={`clinical-page module-detail-page${filePanels ? " patient-record-workspace" : ""}`}>
    <header className="v2-intro client-compact-intro has-action clinical-head"><div><h1>{patientName} <ClinicalAlert patientId={patientId} patientName={patientName} record={record}/></h1></div><div className="clinical-header-actions">{filePanels && <button type="button" className="lab-create-activity clinical-back-button" disabled={saving || loading} onClick={async()=>{if(filePanels || savedFileSignature.current===fileSignature || await persist(record,"Rascunho salvo."))filePanels.onEdit();}}><Edit3 size={15}/>Editar paciente</button>}<button type="button" className="lab-create-activity support-create-button clinical-back-button" disabled={saving} onClick={async()=>{if(appointmentEncounter || filePanels || await persist(record,"Rascunho salvo."))onBack();}}><ChevronLeft size={15} />Voltar</button><button type="button" className="lab-create-activity clinical-settings-button" title="Configurar documentos da clínica" aria-label="Configurar documentos da clínica" onClick={()=>setLetterheadOpen(true)}><Settings size={16}/></button></div></header>
    <section className="v2-metrics client-overview-metrics clinical-metrics"><InformativeMetricCardPreview tone="blue" icon={ClipboardPlus} title="Atendimentos" value={String(record.encounters.length)} change="registrados" />{filePanels?<InformativeMetricCardPreview tone="teal" icon={HeartPulse} title="Total em serviços" value={money(record.encounters.filter(item=>item.paymentStatus!=="cancelled").reduce((total,item)=>total+item.amount,0))} change="consultas registradas"/>:<InformativeMetricCardPreview tone="teal" icon={HeartPulse} title="Plano de tratamento" value={`${progress.total ? Math.round(progress.done / progress.total * 100) : 0}%`} change={`${progress.done} de ${progress.total} etapas`} />}<InformativeMetricCardPreview tone="amber" icon={FileText} title="Documentos pendentes" value={String(record.documents.filter((doc) => doc.status === "Pendente" || doc.status === "Enviado").length)} change="para revisar" /><InformativeMetricCardPreview tone="violet" icon={CalendarDays} title="Próximo retorno" value={fmt(record.encounters.filter(item=>item.returnDate>=today()).sort((a,b)=>a.returnDate.localeCompare(b.returnDate))[0]?.returnDate ?? "")} change="registrado" /></section>
    {navigation}
    <div className="clinical-section-content">
    {loading ? <section className="client-record-panel"><p>Carregando prontuário…</p></section> : <>
      {filePanels?.render(section,record)}
      {filePanels && section === "Documentos" && <PatientDocuments record={record} attachments={filePanels.attachments} onOpen={setPreviewDoc} onCreate={()=>setCreateDocument(value=>!value)}/>}
      {filePanels && section !== "Documentos" ? <PatientRecordReview key={section} section={section} record={record}/> : <>
      {section === "Anamnese" ? <ClinicalAnamnesis record={record} onChange={setRecord} onSave={() => void persist({...record,anamnesisHistory:[{id:crypto.randomUUID(),date:new Date().toISOString(),details:{...record.anamnesisDetails},anamnesis:record.anamnesis,allergies:[...record.allergies],conditions:[...record.conditions],medicines:[...record.medicines]},...(record.anamnesisHistory??[])]}, "Anamnese salva como rascunho.")} saving={saving} /> : null}
      {section === "Resumo" && !reviewOrder && !appointmentEncounter ? <section className="client-record-panel"><header><h2><Check size={18}/>Finalizar atendimento</h2></header><p>Revise os registros antes de confirmar. O rascunho não gera lançamentos financeiros.</p><footer className="client-record-footer"><button type="button" className="lab-create-activity" disabled={saving} onClick={()=>void persist(record,"Rascunho salvo.")}>Salvar rascunho</button><button type="button" className="lab-create-activity" onClick={()=>setReviewOrder(true)}>Finalizar atendimento</button></footer></section> : null}
      {section === "Resumo" && reviewOrder ? <section className="client-record-panel"><header><h2><ClipboardPlus size={18}/>Confirmar atendimento</h2></header><p>{patientName} · {fmt(today())}</p>{order.lines.map(line=><p key={line.id}>{line.quantity} × {line.name} · {(line.quantity*line.price).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</p>)}<p>Total: {paymentTotal.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})} · {paymentMethod} · {installments}x {cardBrand}</p><ClinicalPaymentSummary payment={currentPayment} total={paymentTotal} method={paymentMethod} installments={Number(installments)||1} brand={cardBrand}/><label className="clinical-field">Próximo retorno<input type="date" min={today()} value={returnDate} onChange={e=>setReturnDate(e.target.value)}/></label><footer className="client-record-footer"><button className="lab-create-activity" onClick={()=>setSection("Serviços")}>Ajustar</button><button className="lab-create-activity" disabled={saving||Boolean(appointmentEncounter)} onClick={()=>void saveEncounter().then(()=>setReviewOrder(false))}>Confirmar e lançar no sistema</button></footer><p>Gera o registro clínico, as contas a receber e as comissões a pagar; o retorno é salvo como previsão.</p></section>:null}
      {section === "Resumo" ? <section className="client-record-panel"><header><h2><CalendarDays size={18} />Histórico clínico</h2></header>{record.encounters.length ? <div className="clinical-timeline">{record.encounters.map((item) => <article key={item.id}><time>{fmt(item.date)}</time><strong>{item.service}{item.tooth ? ` · Dente ${item.tooth}` : ""}</strong><p>{item.observations || "Sem observações adicionais."}</p>{item.order?.lines.map(line=><p key={line.id}>{line.source} · {line.quantity} × {line.name} · {(line.quantity*line.price).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</p>)}<p>Total: {item.amount.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})} · {item.paymentMethod} · {item.installments}x {item.cardBrand}</p>{item.returnDate&&<p>Retorno previsto: {fmt(item.returnDate)}</p>}<small>{item.coverage.kind === "Plano" ? item.coverage.insurer : "Particular"}{item.products.length ? ` · ${item.products.map((product) => `${product.name}, lote ${product.lot}`).join(", ")}` : ""}</small>{item.toothNotes && Object.entries(item.toothNotes).filter(([, note]) => note).map(([number, note]) => <small key={number}>Dente {number}: {note}</small>)}{item.facialNotes && Object.entries(item.facialNotes).filter(([, note]) => note).map(([zone, note]) => <small key={zone}>{zone}: {note}</small>)}</article>)}</div> : <p>Nenhum atendimento clínico registrado.</p>}</section> : null}
      {!filePanels && <div hidden={section !== "Odontograma" && section !== "ROC"}><ClinicalAtlas key={`${patientId}:${atlasVersion}`} history={(record.anatomyHistory??[]).filter(item=>item.mode===(section==="ROC"?"face":"dental")).map((item,index)=>({id:item.id,label:`${new Date(item.date).toLocaleString("pt-BR")} · ${index+1}`}))} onHistory={id=>{const entry=record.anatomyHistory?.find(item=>item.id===id);if(entry){setAtlasSnapshot(entry.anatomy);setAtlasVersion(v=>v+1);}}} mode={section === "ROC" ? "face" : "dental"} initial={atlasSnapshot??record.anatomy} onChange={updateAnatomy} onSave={async (anatomy) => { const next = { ...record, anatomy, anatomyHistory:[{id:crypto.randomUUID(),date:new Date().toISOString(),mode:section==="ROC"?"face" as const:"dental" as const,anatomy:structuredClone(anatomy)},...(record.anatomyHistory??[])], mappedTeeth: anatomy.selectedTeeth.map(String), dentalNotes: Object.fromEntries(Object.entries(anatomy.notes).map(([key,value]) => [key,value])), dentalSurfaces: Object.fromEntries(Object.entries(anatomy.faces).map(([key,value]) => [key,value])), mappedRegions: anatomy.marks.map(mark => mark.region), facialNotes: Object.fromEntries(anatomy.marks.map(mark => [mark.id, mark.note])) }; const ok = await persist(next, "Registros anatômicos salvos como rascunho."); if (ok) { setAtlasSnapshot(anatomy); setTooth(anatomy.selectedTeeth.join(", ")); setRegion(anatomy.marks.map(mark => mark.region).join(", ")); } return ok; }} /></div>}
      {section==="Odontograma"||section==="ROC"||section==="RX"?<ClinicalImages record={record} mode={section==="ROC"?"face":section==="RX"?"rx":"dental"} onSave={next=>persist(next,"Imagem salva no prontuário.")}/>:null}
      {!filePanels && <div hidden={section!=="Serviços"}><ClinicalOrder initial={record.draft?.order} anatomy={record.anatomy} options={serviceOptions} fee={payment.feePercent} commission={commissionTotal} amount={amount} onAmount={setAmount} onChange={setOrder}/></div>}
      {section === "Serviços" && <ClinicalPayment value={payment} onChange={setPayment} method={paymentMethod} onMethod={setPaymentMethod} installments={installments} onInstallments={setInstallments} brand={cardBrand} onBrand={setCardBrand} total={paymentTotal} lines={paymentLines} terms={serviceTerms}/>}
      {section === "Serviços" ? <section className="client-record-panel clinical-encounter"><header><h2><ClipboardPlus size={18} />Dados do atendimento</h2></header>{appointment ? <p>Da Agenda: {appointment.service}. Confirme os dados antes de concluir.</p> : null}{appointmentEncounter ? <p role="status">Este evento já foi concluído em {fmt(appointmentEncounter.date)}. Consulte o histórico na aba Resumo.</p> : null}<div className="clinical-form-grid"><div className="clinical-field"><ClientSelect label="Serviço realizado" value={service} onChange={setService} options={serviceOptions} /></div><div className="clinical-field"><ClientSelect label="Tipo de atendimento" value={record.coverage.kind} onChange={(value) => changeCoverage({ kind: value as Coverage["kind"] })} options={["Particular", "Plano"]} /></div>{record.coverage.kind === "Plano" ? <><label className="clinical-field">Plano / convênio<input value={record.coverage.insurer} onChange={(event) => changeCoverage({ insurer: event.target.value })} placeholder="Nome do plano" /></label><label className="clinical-field">Categoria<input value={record.coverage.category} onChange={(event) => changeCoverage({ category: event.target.value })} /></label><label className="clinical-field">Autorização<input value={record.coverage.authorization} onChange={(event) => changeCoverage({ authorization: event.target.value })} /></label></> : null}<label className="clinical-field">Próximo retorno<input type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} /></label></div><label className="clinical-field">Evolução e observações<textarea value={observations} onChange={(event) => setObservations(event.target.value)} rows={4} placeholder="O que foi avaliado e realizado hoje?" /></label><h3>Produto utilizado <small>(se aplicável)</small></h3><div className="clinical-form-grid"><label className="clinical-field">Produto<input list="clinical-stock-products" value={product} onChange={(event) => { const value = event.target.value; setProduct(value); const match = stockRows.find((row) => row[1].toLocaleLowerCase("pt-BR") === value.toLocaleLowerCase("pt-BR")); if (match) { setLot(match[7] ?? ""); setExpiry(match[8] ?? ""); } }} /><datalist id="clinical-stock-products">{stockRows.map((row) => <option value={row[1]} key={row[0]} />)}</datalist></label><label className="clinical-field">Lote<input value={lot} onChange={(event) => setLot(event.target.value)} /></label><label className="clinical-field">Validade<input type="date" value={expiry} onChange={(event) => setExpiry(event.target.value)} /></label></div>{record.steps.some((step) => !step.done) ? <><h3>Etapas concluídas neste atendimento</h3><div className="clinical-chips">{record.steps.filter((step) => !step.done).map((step) => <button key={step.id} type="button" className={selectedSteps.includes(step.id) ? "active" : ""} onClick={() => setSelectedSteps((current) => current.includes(step.id) ? current.filter((id) => id !== step.id) : [...current, step.id])}>{selectedSteps.includes(step.id) ? <Check size={14} /> : <Plus size={14} />}{step.title}</button>)}</div></> : null}</section> : null}
      {section === "Serviços" ? <details className="client-record-panel clinical-treatment-plan"><summary>Plano de tratamento</summary><div className="clinical-payment-plan-content"><div className="clinical-form-grid"><label className="clinical-field">Nome do plano<input value={record.planTitle} onChange={(event) => setRecord((current) => ({ ...current, planTitle: event.target.value }))} placeholder="Ex.: tratamento de 6 meses" /></label><label className="clinical-field">Previsão de término<input type="date" value={record.planEndDate} onChange={(event) => setRecord((current) => ({ ...current, planEndDate: event.target.value }))} /></label></div><button type="button" className="lab-create-activity" disabled={saving} onClick={() => void persist(record, "Plano salvo.")}>Salvar plano</button><p>{progress.done} de {progress.total} etapas concluídas · {progress.total ? Math.round(progress.done / progress.total * 100) : 0}% realizado</p><progress value={progress.done} max={Math.max(1, progress.total)} className="clinical-progress" /><div className="clinical-timeline">{record.steps.map((step, index) => <article key={step.id}><time>{index + 1} · {fmt(step.plannedDate)}</time><strong>{step.title}</strong><button type="button" className="lab-create-activity" disabled={saving} onClick={() => void persist({ ...record, steps: record.steps.map((item) => item.id === step.id ? { ...item, done: !item.done } : item) }, "Plano de tratamento atualizado.")}>{step.done ? "Concluído ✓" : "Marcar realizado"}</button></article>)}</div><div className="clinical-form-grid"><label className="clinical-field">Próxima etapa<input value={stepTitle} onChange={(event) => setStepTitle(event.target.value)} placeholder="Ex.: avaliação de retorno" /></label><label className="clinical-field">Data prevista<input type="date" value={stepDate} onChange={(event) => setStepDate(event.target.value)} /></label></div><button type="button" className="lab-create-activity" disabled={saving || !stepTitle.trim()} onClick={() => { void persist({ ...record, steps: [...record.steps, { id: crypto.randomUUID(), title: stepTitle.trim(), plannedDate: stepDate, done: false }] }, "Etapa adicionada ao plano."); setStepTitle(""); setStepDate(""); }}><Plus size={16} />Adicionar etapa</button></div></details> : null}
      {section === "Serviços" && <section className="client-record-panel clinical-payment-review-action"><p>Confira o pagamento, o recebimento e as comissões antes de finalizar.</p><button type="button" className="lab-create-activity" disabled={saving||Boolean(appointmentEncounter)} onClick={()=>{const message=paymentValidation(currentPayment);if(message){setError(message);return;}setError("");setReviewOrder(true);setSection("Resumo");}}>Revisar e finalizar atendimento</button></section>}
      {section === "Documentos" && (!filePanels || createDocument) ? <div className="clinical-document-workbench"><section className="client-record-panel"><header><h2><FileText size={18} />Documentos</h2><div className="clinical-document-history"><ClientSelect label="Histórico" hideLabel value={documentHistory} options={["Todos",...new Set(record.documents.filter(doc=>(documentMode==="Contratos"?(doc.kind==="Contrato"||doc.kind==="Outro"):doc.kind===(documentMode==="Termo de consentimento"?"Consentimento":documentMode))).map(doc=>fmt(doc.updatedAt)))]} onChange={setDocumentHistory}/></div></header><div className="clinical-recipe-types" role="group" aria-label="Tipos de documentos">{(["Atestado","Receita","Contratos","Termo de consentimento"] as const).map(type=><button type="button" className="lab-create-activity" key={type} aria-pressed={documentMode===type} onClick={()=>{setDocumentMode(type);if(type==="Receita"||type==="Atestado")setRecipeType(type);setModelId("");setDocText("");setDocTitle("");setDocKind(type==="Termo de consentimento"?"Consentimento":"Contrato");setDocumentHistory("Todos");setRecipePreviewOverride(null);}}>{type==="Receita"?"Receitas":type==="Atestado"?"Atestados":type}</button>)}</div><div className="clinical-document-list">{record.documents.filter((doc) => ((documentMode === "Contratos" ? (doc.kind === "Contrato" || doc.kind === "Outro") : doc.kind === (documentMode === "Termo de consentimento" ? "Consentimento" : documentMode))) && (documentHistory==="Todos" || fmt(doc.updatedAt)===documentHistory)).map((doc) => <article key={doc.id}><span><strong>{doc.title}</strong><small>{doc.kind} · {fmt(doc.updatedAt)} · {doc.status}{doc.service?` · ${doc.service}`:""}{doc.signedAt?` · Assinado em ${fmt(doc.signedAt)}`:""}</small></span><button type="button" className="lab-create-activity" onClick={() => setPreviewDoc(doc)}>Abrir</button><button type="button" className="lab-create-activity" onClick={() => printDoc(doc)}><Printer size={15} />Imprimir</button><button type="button" className="lab-create-activity" onClick={() => shareDoc(doc)}><MessageCircle size={15} />WhatsApp</button></article>)}</div>
      {(documentMode === "Receita" || documentMode === "Atestado") ? <><h3>Preparar {recipeType.toLocaleLowerCase("pt-BR")}</h3><div className="clinical-form-grid clinical-recipe-layout"><label className="clinical-field">Cabeçalho<textarea rows={3} value={recipeHeader||documentHeader} onChange={(event) => setRecipeHeader(event.target.value)} placeholder="Clínica, profissional e registro profissional" /></label><label className="clinical-field">Rodapé<textarea rows={3} value={recipeFooter||documentFooter} onChange={(event) => setRecipeFooter(event.target.value)} placeholder="Informações do profissional" /></label></div><div className="clinical-document-model-actions"><button className="lab-create-activity" onClick={() => { appStorage.setItem(`clinical-recipe-${businessId}`, JSON.stringify({ header: recipeHeader, footer: recipeFooter })); toast("Modelo da receita salvo."); }}>Salvar cabeçalho e rodapé</button><button type="button" className="lab-create-activity" onClick={()=>setPrescription(baseText)}>Usar modelo base</button></div><p>Paciente: {patientName} · Data: {fmt(today())}</p><label className="clinical-field">{recipeType==="Atestado"?"Texto do atestado":"Prescrição"}<textarea rows={6} value={prescription} onChange={(event) => setPrescription(event.target.value)} placeholder={recipeType==="Atestado"?"Texto do atestado — preencher e revisar pelo profissional.":"Medicamento, dose, via, frequência e duração — preencher e revisar pelo profissional."} /></label><button className="lab-create-activity" disabled={saving || !prescription.trim() || !(recipeHeader||documentHeader).trim()} onClick={async () => { const doc: ClinicalDocument = { id: crypto.randomUUID(), kind: recipeType as "Receita"|"Atestado", title: recipeType, status: "Rascunho", updatedAt: today(), content: recipeContent() }; if (await persist({ ...record, documents: [doc, ...record.documents] }, `${recipeType} preparado.`)) setPreviewDoc(doc); }}>Preparar {recipeType.toLocaleLowerCase("pt-BR")}</button></> : <><h3>Preparar documento</h3><div className="clinical-form-grid"><div className="clinical-field"><ClientSelect label="Procedimento vinculado" value={documentService||service} options={serviceOptions} onChange={setDocumentService}/></div><div className="clinical-field"><ClientSelect label="Consulta vinculada" value={record.encounters.find(item=>item.id===documentEncounter)?`${fmt(record.encounters.find(item=>item.id===documentEncounter)!.date)} · ${record.encounters.find(item=>item.id===documentEncounter)!.service}`:"Atendimento atual"} options={["Atendimento atual",...record.encounters.map(item=>`${fmt(item.date)} · ${item.service} · ${item.id.slice(0,6)}`)]} onChange={label=>setDocumentEncounter(record.encounters.find(item=>`${fmt(item.date)} · ${item.service} · ${item.id.slice(0,6)}`===label)?.id??"")}/></div></div>{record.encounters.filter(item=>!record.documents.some(doc=>(doc.kind==="Contrato"||doc.kind==="Consentimento")&&doc.encounterId===item.id&&doc.status==="Assinado")).map(item=><p key={item.id} className="clinical-document-pending">{fmt(item.date)} · {item.service}: assinatura de documento não registrada.</p>)}<div className="clinical-field"><ClientSelect label="Tipo / modelo cadastrado" value={modelRows.find((row) => row[0] === modelId)?.[1] ?? "Selecione o documento"} options={modelRows.filter(row=>documentMode==="Termo de consentimento"?/consentimento/i.test(row[1]):!/consentimento|receita|atestado/i.test(row[1])).map((row) => row[1])} onChange={(value) => { const row = modelRows.find((item) => item[1] === value); if (!row) return; setModelId(row[0]); setDocTitle(row[1].replace(/\.[^.]+$/, "").replace(/_/g, " ")); setDocKind(documentMode==="Termo de consentimento"?"Consentimento":"Contrato"); const fields: Record<string, string> = { paciente: patientName, data: fmt(today()), servico: service, convenio: record.coverage.insurer || "Particular", observacoes: observations }; const text = (row[6] ?? "").replace(/\{\{(paciente|data|servico|convenio|observacoes)\}\}/g, (_, key: string) => fields[key]); setDocText(`Paciente: ${patientName}\nData: ${fmt(today())}\nServiço: ${service}\nModalidade: ${record.coverage.kind}\n\n${text}`); }} /></div>{modelId && !modelRows.find((row) => row[0] === modelId)?.[6] ? <p>Este cadastro não contém texto de modelo. Insira o conteúdo abaixo antes de preparar.</p> : null}<label className="clinical-field">Título<input value={docTitle} onChange={(event) => setDocTitle(event.target.value)} /></label><label className="clinical-field">Documento preenchido — revise antes de emitir<textarea rows={6} value={docText} onChange={(event) => setDocText(event.target.value)} /></label><button className="lab-create-activity" disabled={saving || !modelId || !docText.trim()} onClick={addDocument}><Plus size={16} />Preparar documento</button></>}<p className="clinical-disclaimer">Revise antes de imprimir ou compartilhar. Enviar Whats abre a conversa do paciente em Mensagens com o texto preparado; revise antes de enviar. A conexão atual é demonstrativa.</p></section><ClinicalDocumentPreview logo={letterhead.logo} doc={{id:"preview",kind:(documentMode==="Receita"||documentMode==="Atestado")?recipeType as "Receita"|"Atestado":docKind,title:(documentMode==="Receita"||documentMode==="Atestado")?recipeType:docTitle||"Documento",status:"Rascunho",updatedAt:today(),content:(documentMode==="Receita"||documentMode==="Atestado")?recipeContent():[documentHeader,docText,documentFooter].filter(Boolean).join("\n\n")}} ready={(documentMode==="Receita"||documentMode==="Atestado")?Boolean(prescription.trim()&&(recipeHeader||documentHeader).trim()):Boolean(docText.trim())} onEdit={text=>(documentMode==="Receita"||documentMode==="Atestado")?setRecipePreviewOverride(text):setDocText(text)} onPrint={printDoc} onShare={shareDoc}/></div> : null}
    </>}
    </>}
    {error ? <p className="clinical-error" role="alert">{error}</p> : null}
    </div>
      {letterheadOpen ? <div className="client-document-overlay" onClick={e=>{if(e.target===e.currentTarget)setLetterheadOpen(false);}}><section className="client-record-panel clinical-letterhead-dialog" role="dialog" aria-modal="true" aria-label="Configuração de documentos"><header><h2>Documentos da clínica</h2><button className="lab-create-activity" onClick={()=>setLetterheadOpen(false)}>Voltar</button></header><ClinicalLetterhead businessId={businessId} value={letterhead} onChange={setLetterhead}/></section></div>:null}
    {previewDoc ? <div className="client-document-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewDoc(null); }}><section className="client-record-panel clinical-preview" role="dialog" aria-modal="true" aria-label={previewDoc.title}><header><h2>{previewDoc.title}</h2><button type="button" className="lab-create-activity" onClick={() => setPreviewDoc(null)}>Voltar</button></header><p>{previewDoc.kind} · {previewDoc.status}</p>{previewDoc.kind==="Contrato"||previewDoc.kind==="Consentimento"?<div className="clinical-form-grid"><div className="clinical-field"><ClientSelect label="Situação do documento" value={previewDoc.status} options={["Pendente","Enviado","Assinado"]} onChange={async value=>{const updated={...previewDoc,status:value as ClinicalDocument["status"],signedAt:value==="Assinado"?(previewDoc.signedAt||today()):undefined};if(await persist({...record,documents:record.documents.map(doc=>doc.id===updated.id?updated:doc)},"Situação do documento atualizada."))setPreviewDoc(updated);}}/></div>{previewDoc.status==="Assinado"?<label className="clinical-field">Data da assinatura<input type="date" value={previewDoc.signedAt??today()} onChange={async event=>{const updated={...previewDoc,signedAt:event.target.value};if(await persist({...record,documents:record.documents.map(doc=>doc.id===updated.id?updated:doc)},"Data da assinatura salva."))setPreviewDoc(updated);}}/></label>:null}</div>:null}<div className="clinical-document-sheet">{previewDoc.content || "Documento preparado para revisão do profissional."}</div><footer className="client-record-footer"><button className="lab-create-activity" onClick={() => printDoc(previewDoc)}><Printer size={15} />Imprimir</button><button className="lab-create-activity" onClick={() => shareDoc(previewDoc)}><MessageCircle size={15} />Enviar Whats</button></footer></section></div> : null}
  </section>;
}
