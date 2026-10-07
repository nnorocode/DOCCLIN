"use client";

import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, X } from "lucide-react";
import { appStorage } from "../../lib/local-store";

type TourStep = { title: string; detail: string; selectors: string[]; openSelector?: string };

const specific: Record<string, TourStep[]> = {
  Agenda: [
    { title: "Escolha o período", detail: "Use as setas e alterne entre dia, semana e mês.", selectors: [".lab-agenda-toolbar"] },
    { title: "Crie um evento", detail: "Clique em Adicionar e informe cliente, serviço e horário.", selectors: [".lab-create-activity"] },
    { title: "Dê um título", detail: "Identifique claramente a reunião, consulta ou atividade.", selectors: ['.lab-event-card input[placeholder="Adicionar título"]'], openSelector: ".lab-agenda-toolbar .lab-create-activity" },
    { title: "Complete os detalhes", detail: "Escolha data, horário, cliente, responsável e serviço.", selectors: [".lab-event-card .lab-event-grid"], openSelector: ".lab-agenda-toolbar .lab-create-activity" },
    { title: "Acompanhe os horários", detail: "Salve e depois encontre o evento no calendário; dê dois cliques para editar.", selectors: [".lab-agenda-board"] },
  ],
  Tarefas: [
    { title: "Escolha um projeto", detail: "Filtre as tarefas por projeto ou veja todas.", selectors: [".workflow-project-filter"] },
    { title: "Crie ou edite tarefas", detail: "Adicione uma tarefa; dê dois cliques em um card para editar.", selectors: [".workflow-top-actions", ".shelf-kanban-card"] },
    { title: "Acompanhe as etapas", detail: "Arraste os cards entre colunas e use a barra inferior para ver todas.", selectors: [".workflow-kanban-shell"] },
  ],
  Clientes: [
    { title: "Cadastre clientes", detail: "Use a ação de cadastro para registrar os dados de contato.", selectors: [".lab-create-activity"] },
    { title: "Informe o nome", detail: "Digite o nome ou razão social do cliente.", selectors: ['.client-form-backdrop input[placeholder="Ex.: Bella Café"]'], openSelector: ".lab-create-activity" },
    { title: "Complete o cadastro", detail: "Revise identificação, contato e demais campos antes de salvar.", selectors: [".client-form-backdrop .v2-client-form"], openSelector: ".lab-create-activity" },
    { title: "Abra o histórico", detail: "Use Ver detalhes para consultar os registros do cliente.", selectors: [".v2-client-table"] },
  ],
  Financeiro: [
    { title: "Leia os indicadores", detail: "Os cards resumem o período selecionado.", selectors: [".finance-metrics-grid"] },
    { title: "Ajuste os filtros", detail: "Escolha período e regime para mudar a leitura dos dados.", selectors: [".finance-context-controls"] },
    { title: "Explore os gráficos", detail: "Arraste gráficos para organizar ou remover; use Inserir gráfico para restaurar.", selectors: [".finance-chart-library-grid"] },
  ],
  Relatórios: [
    { title: "Escolha a área", detail: "As categorias trocam os indicadores apresentados.", selectors: [".reports-category-tabs"] },
    { title: "Confira os cards", detail: "Veja os números principais da categoria escolhida.", selectors: [".reports-summary-metrics"] },
    { title: "Personalize a análise", detail: "Selecione período, indicadores e gráficos.", selectors: [".reports-filter-row", ".reports-modern"] },
  ],
  Catálogo: [
    { title: "Selecione Catálogo", detail: "Entre na aba Catálogo para cadastrar seus produtos e serviços.", selectors: ['[data-view="Catálogo"]'] },
    { title: "Abra o cadastro", detail: "Clique em Novo item para começar um produto ou serviço.", selectors: [".lab-create-activity"] },
    { title: "Dê um nome", detail: "Preencha o nome que sua equipe reconhecerá nas vendas e agendamentos.", selectors: ['.v2-record-drawer input[placeholder="Nome / título"]'], openSelector: ".lab-create-activity" },
    { title: "Classifique o item", detail: "Informe o tipo e a categoria para facilitar a busca.", selectors: ['.v2-record-drawer input[placeholder="Tipo"]'], openSelector: ".lab-create-activity" },
    { title: "Informe os valores", detail: "Preencha custo e preço de venda antes de salvar.", selectors: ['.v2-record-drawer input[placeholder="Preço de venda"]'], openSelector: ".lab-create-activity" },
    { title: "Revise e salve", detail: "Confira os campos do cadastro e salve quando estiver pronto.", selectors: [".v2-record-drawer button[type=submit]", ".v2-record-drawer footer"], openSelector: ".lab-create-activity" },
  ],
  Estoque: [
    { title: "Cadastre o produto", detail: "Informe unidade, quantidade e limite de estoque crítico.", selectors: [".lab-create-activity"] },
    { title: "Nomeie o produto", detail: "Preencha o nome do item que será acompanhado.", selectors: ['.v2-record-drawer input[placeholder="Nome do produto"]'], openSelector: ".lab-create-activity" },
    { title: "Informe quantidade e preço", detail: "Revise os campos de saldo e referência de preço.", selectors: [".v2-record-drawer form"], openSelector: ".lab-create-activity" },
    { title: "Acompanhe o saldo", detail: "Use a lista e as movimentações para manter o estoque atualizado.", selectors: [".v2-module-table", ".v2-client-table"] },
  ],
};

const generic: TourStep[] = [
  { title: "Conheça esta área", detail: "Este título identifica a página em que você está.", selectors: [".v2-intro h1", ".client-compact-intro h1", ".v2-page h1"] },
  { title: "Confira os indicadores", detail: "Os cards mostram os dados mais importantes desta área.", selectors: [".client-metrics", ".v2-metrics", ".finance-metrics-grid", ".v2-page article.v2-card"] },
  { title: "Use as opções", detail: "Pesquise, filtre ou abra os registros para continuar.", selectors: [".v2-module-table", ".v2-client-table", ".v2-page section.v2-card", ".v2-page article.v2-card"] },
];

export default function GuidedTour({ view, onClose }: { view: string; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [hideNextTime, setHideNextTime] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const steps = specific[view] ?? generic;
  useEffect(() => {
    const findTarget = () => steps[step].selectors.map((selector) => document.querySelector<HTMLElement>(selector) ?? document.querySelector<HTMLElement>(`.v2-page ${selector}`)).find(Boolean);
    if (!steps[step].openSelector) document.querySelector<HTMLElement>(".v2-record-drawer .close")?.click();
    if (!findTarget() && steps[step].openSelector) document.querySelector<HTMLElement>(`.v2-page ${steps[step].openSelector}`)?.click();
    const scrollTimer = window.setTimeout(() => findTarget()?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 40);
    const update = () => {
      setRect(findTarget()?.getBoundingClientRect() ?? null);
    };
    const timer = window.setTimeout(update, 80);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { window.clearTimeout(timer); window.clearTimeout(scrollTimer); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [step, steps]);
  const finish = () => { document.querySelector<HTMLElement>(".v2-record-drawer .close")?.click(); if (hideNextTime) appStorage.setItem(`gest-guide-hidden-${view}`, "true"); onClose(); };
  return <div className="gest-tour-layer" role="dialog" aria-modal="true" aria-label={`Tutorial de ${view}`}>
    {rect ? <div className="gest-tour-highlight" style={{ top: rect.top - 5, left: rect.left - 5, width: rect.width + 10, height: rect.height + 10 }} /> : <div className="gest-tour-shade" />}
    <article className="gest-tour-card" style={rect && typeof window !== "undefined" ? { top: Math.max(84, Math.min(window.innerHeight - 330, rect.top)), bottom: "auto", ...(rect.left > window.innerWidth * .55 ? { left: 24, right: "auto" } : { right: 24 }) } : undefined}>
      <header><span><BookOpen size={18} /></span><div><small>{view.toUpperCase()} · {step + 1} DE {steps.length}</small><h2>{steps[step].title}</h2></div><button type="button" aria-label="Fechar tutorial" onClick={finish}><X size={17} /></button></header>
      <p>{steps[step].detail}</p>
      <div className="gest-tour-dots" aria-hidden="true">{steps.map((_, index) => <i key={index} className={index === step ? "active" : ""} />)}</div>
      <footer><label><input type="checkbox" checked={hideNextTime} onChange={(event) => setHideNextTime(event.target.checked)} />Não mostrar novamente</label><div><button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft size={15} />Voltar</button><button type="button" className="lab-create-activity" onClick={() => step < steps.length - 1 ? setStep(step + 1) : finish()}>{step < steps.length - 1 ? "Avançar" : "Entendi"}{step < steps.length - 1 ? <ChevronRight size={15} /> : null}</button></div></footer>
    </article>
  </div>;
}
