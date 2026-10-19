"use client";
import { readData, useDataRevision } from "../../lib/operational-data";
import { pendingConfirmations } from "../../lib/message-automations";
export default function PendingConfirmations({onOpen}:{onOpen:()=>void}){
 useDataRevision();
 const events=readData<Array<{id:number;date?:string;status?:string;client?:string;person?:string}>>("gest-agenda-events",[]);
 const rules=readData<Array<{id:string;days:number}>>("gest-message-automation-settings",[]);
 const pending=pendingConfirmations(events,rules);
 if(!pending.length)return null;
 return <button type="button" className="urgent" onClick={onOpen}><span><strong>Consultas sem confirmação</strong><small>{pending.slice(0,2).map(event=>event.client||event.person||"Paciente não informado").join(" · ")}{pending.length>2?"…":""}</small></span><b>{pending.length}</b><i>›</i></button>;
}
