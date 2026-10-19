"use client";
import { useStoredData } from "../../lib/operational-data";
import { ClientSelect } from "./ClientSelect";
import { MessageCircle } from "lucide-react";
import { defaultMessageRules, resolveMessageRules, type MessageRule } from "../../lib/message-automations";
export default function MessageAutomationSettings(){
 const [storedRules,setStoredRules]=useStoredData("gest-message-automation-settings",defaultMessageRules);
 const rules=resolveMessageRules(storedRules);
 const update=(id:string,patch:Partial<MessageRule>)=>setStoredRules(rules.map(rule=>rule.id===id?{...rule,...patch}:rule));
 return <section className="client-record-panel message-automation-settings"><header><h2><MessageCircle size={18}/>Automações de mensagens</h2></header>
   <p className="workflow-helper">As configurações são compartilhadas com Mensagens. O envio automático ainda não está conectado.</p>
   <div className="support-campaign-grid">{rules.map(rule=><details className="support-campaign-card" key={rule.id}>
     <summary><span><strong>{rule.title}</strong><small>{rule.days} dia{rule.days===1?"":"s"} · {rule.id==="aftercare"||rule.id==="reservation"?"após":"antes"}</small></span><i className={rule.enabled?"on":""}>{rule.enabled?"Habilitada":"Pausada"}</i></summary>
     <div className="automation-rule-fields">
       <div className="automation-rule-heading"><span>Habilitar regra</span><button type="button" className={rule.enabled?"switch on":"switch"} role="switch" aria-checked={rule.enabled} aria-label={`Habilitar ${rule.title}`} onClick={()=>update(rule.id,{enabled:!rule.enabled})}><i/></button></div>
       <ClientSelect label={rule.id==="aftercare"?"Dias após o atendimento":rule.id==="birthday"?"Dias antes do aniversário":rule.id==="reservation"?"Dias após a pré-reserva":"Dias antes da consulta / retorno"} value={String(rule.days)} options={[...new Set([0,1,2,3,5,7,10,15,30,60,90,120,365,rule.days])].sort((a,b)=>a-b).map(String)} onChange={value=>update(rule.id,{days:Number(value)})}/>
       <label className="clinical-field">Mensagem<textarea rows={4} value={rule.text} onChange={e=>update(rule.id,{text:e.target.value})}/></label>
       <small className="workflow-helper">Salvo neste navegador. Habilitar a regra não dispara mensagens sem integração.</small>
     </div>
   </details>)}</div>
   <small className="workflow-helper">Variáveis: {'{nome}'} e {'{data}'}. Respeite as preferências de contato do paciente.</small>
 </section>;
}
