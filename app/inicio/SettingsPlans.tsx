"use client";
import { CheckCircle2, Crown, Settings } from "lucide-react";

/** Comparison preview only: choosing a card never changes billing or the subscription. */
export default function SettingsPlans({ onCompare }: { onCompare?: () => void }) {
  const plans = [
    { name: "Essencial", label: "Opção de entrada", description: "Para começar a organizar uma operação individual.", features: ["Cadastros e rotina de atendimento", "Organização de clientes", "Controle operacional básico"], current: false },
    { name: "Standard", label: "Plano atual · Teste grátis", description: "Ideal para empresas em crescimento, com recursos completos para gestão.", features: ["Até 10 usuários", "Até 5.000 clientes", "Até 2.000 produtos ou serviços", "Relatórios avançados", "Suporte por e-mail"], current: true },
    { name: "Pro", label: "Opção superior", description: "Para ampliar a operação com automações e integrações.", features: ["Equipe e catálogo ampliados", "Automações operacionais", "Integrações externas"], current: false },
  ];
  return <section className="settings-plans">
    <div className="settings-plan-comparison" aria-label="Comparação de planos">
      {plans.map(plan => <article key={plan.name} className={`v2-card settings-section-card settings-plan-option${plan.current ? " is-current" : ""}`} aria-label={`${plan.name}${plan.current ? ", plano atual" : ""}`}>
        <header><span className="settings-plan-badge">{plan.label}</span><h2><Crown size={19} />{plan.name}</h2></header>
        <p>{plan.description}</p>
        <ul>{plan.features.map(item => <li key={item}><CheckCircle2 size={15} /><span>{item}</span></li>)}</ul>
        <footer><button type="button" className="lab-create-activity" onClick={onCompare}>{plan.current ? "Ver planos e upgrade" : "Consultar condições"}</button></footer>
      </article>)}
    </div>
    <article className="v2-card settings-section-card settings-plan-usage"><header className="settings-section-head"><div><small>USO DO PLANO</small><h2><Settings size={18} />Capacidade atual</h2></div></header><div className="settings-usage"><span>Usuários <b>3 / 10</b><i><em style={{ width: "30%" }} /></i></span><span>Clientes <b>1.248 / 5.000</b><i><em style={{ width: "25%" }} /></i></span><span>Catálogo <b>230 / 2.000</b><i><em style={{ width: "12%" }} /></i></span></div></article>
  </section>;
}
