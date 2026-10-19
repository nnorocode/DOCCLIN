export type MessageRule = { id:string; title:string; days:number; text:string; enabled:boolean };
export const defaultMessageRules: MessageRule[] = [
  {id:"reservation",title:"Pré-reserva",days:0,text:"Olá, {nome}! Sua pré-reserva para {data} foi registrada. Podemos confirmar?",enabled:false},
  {id:"confirmation",title:"Confirmação de consulta",days:1,text:"Olá, {nome}! Confirma sua consulta em {data}?",enabled:false},
  {id:"aftercare",title:"Pós-atendimento",days:1,text:"Olá, {nome}! Como você está após o atendimento? Estamos à disposição.",enabled:false},
  {id:"return",title:"Retorno",days:1,text:"Olá, {nome}! Seu retorno está previsto para {data}. Vamos confirmar?",enabled:false},
  {id:"birthday",title:"Aniversário",days:0,text:"Parabéns, {nome}! Desejamos um excelente aniversário!",enabled:false},
];

/** Old empty/partial configurations must never hide a supported rule. */
export function resolveMessageRules(stored: unknown): MessageRule[] {
  const rows = Array.isArray(stored) ? stored : [];
  return defaultMessageRules.map(base => {
    const saved = rows.find(row => row && row.id === base.id);
    return {...base,
      days: typeof saved?.days === "number" && Number.isFinite(saved.days) ? Math.max(0,Math.min(365,Math.trunc(saved.days))) : base.days,
      text: typeof saved?.text === "string" ? saved.text : base.text,
      enabled: typeof saved?.enabled === "boolean" ? saved.enabled : base.enabled,
    };
  });
}

export type ConfirmationEvent = {id:number;date?:string;status?:string;client?:string;person?:string};
/** Read-only projection: never creates appointments, settings or messages. */
export function pendingConfirmations(events: ConfirmationEvent[], settings: unknown, now = new Date()): ConfirmationEvent[] {
  const days = resolveMessageRules(settings).find(rule=>rule.id==="confirmation")!.days;
  const start = new Date(now); start.setHours(0,0,0,0);
  const end = new Date(start); end.setDate(end.getDate()+days+1);
  return events.filter(event=>{
    if(!event.date || (event.status??"pending")!=="pending")return false;
    const day = event.date.slice(0,10);
    const check = new Date(`${day}T12:00:00Z`);
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(check.getTime()) && check.toISOString().slice(0,10) === day;
    if (!valid) return false;
    const date = new Date(`${day}T12:00:00`);
    return date >= start && date < end;
  });
}
