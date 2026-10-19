"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
export function ClientSelect({ label, value, onChange, options, showDot = false, compact = false, hideLabel = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  showDot?: boolean;
  compact?: boolean;
  hideLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const statusDotClass = (option: string) => {
    const normalized = option.toLocaleLowerCase("pt-BR");
    if (/ativo|aprovad|paga|pago|recebid|resolvid|conclu|convertid|normal|enviad|em dia/.test(normalized) && !normalized.includes("inativo")) return "green";
    if (/inativo|cancelad|rejeitad|crítico|critico|atrasad|sem estoque|urgente|vencid/.test(normalized)) return "rose";
    if (/pendente|aguardando|em atendimento|andamento|agendad|atenção|atencao|proposta/.test(normalized)) return "amber";
    if (/novo|aberto|execução|execucao/.test(normalized)) return "blue";
    return "gray";
  };
  const dotClass = statusDotClass(value);

  return (
    <div className={compact ? "client-select compact" : "client-select"} ref={rootRef}>
      {hideLabel ? null : <label>{label}</label>}
      <div className="lab-select">
        <button type="button" className="lab-select-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          {showDot ? <i className={`client-select-dot ${dotClass}`} /> : null}
          <span>{value}</span>
          <ChevronDown size={16} className={open ? "open" : ""} />
        </button>
        {open ? (
          <div className="lab-select-menu" role="listbox" aria-label={label} onWheel={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()}>
            {options.map((option) => (
              <button type="button" role="option" aria-selected={value === option} key={option} onClick={() => { onChange(option); setOpen(false); }}>
                {showDot ? <i className={`client-select-dot ${statusDotClass(option)}`} /> : null}
                <span>{option}</span>
                {value === option ? <Check size={15} /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
