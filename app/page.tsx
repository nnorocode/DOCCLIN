"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import DecryptedText from "./components/DecryptedText";
import Particles from "./components/Particles";

const navItems = ["Visão geral", "Agenda", "Clientes", "Vendas", "Catálogo", "Financeiro", "Documentos", "Estoque", "CRM", "Relatórios", "Equipe"];

const plans = [
  { name: "Standard", price: "R$ 79", suffix: "/mês", lead: "A base para organizar o negócio.", items: ["Dashboard, agenda e clientes", "Vendas, catálogo e financeiro básico", "Documentos, estoque e CRM manual", "Até 2 usuários e 500 clientes", "500 MB e relatórios de 12 meses"], cta: "Testar 30 dias grátis", featured: false, provisional: false },
  { name: "Plus", price: "R$ 149", suffix: "/mês", lead: "Mais equipe, integrações e controle.", items: ["Tudo que está no Standard", "Até 10 usuários e 5.000 clientes", "WhatsApp e e-mail integrados", "Automações básicas e permissões", "Estoque e relatórios avançados", "Até 10 GB de arquivos"], cta: "Escolher o Plus", featured: false, provisional: true },
  { name: "Pro", price: "R$ 299", suffix: "/mês", lead: "A experiência mais completa do Gest Base.", items: ["Tudo que está no Standard e Plus", "20+ usuários e 20.000+ clientes", "Automações e permissões avançadas", "API externa, auditoria e backups", "Multiempresa e relatórios personalizados", "Até 100 GB e histórico completo"], cta: "Escolher o Pro", featured: true, provisional: true },
  { name: "Consultoria", price: "Sob medida", suffix: "", lead: "Um sistema desenhado para sua operação.", items: ["Diagnóstico do negócio", "Fluxos e módulos personalizados", "Integrações específicas", "Implantação acompanhada", "Escopo e investimento personalizados"], cta: "Solicitar consultoria", featured: false, provisional: false },
];

function Brand() { return <Link className="n-brand" href="/" aria-label="Gest, início"><span>G</span><b>gest.</b></Link>; }

function MiniDashboard() {
  return <div className="product-window">
    <div className="window-bar"><div><i/><i/><i/></div><span>app.gest.com.br</span><b>•••</b></div>
    <div className="window-body">
      <aside className="app-sidebar"><div className="app-mark">G</div>{navItems.map((item,i)=><div className={i===0?"on":""} key={item}><i>{["⌂","◷","♙","↗","◇","◫","▤","◈","◎","⌁","♧"][i]}</i><span>{item}</span></div>)}<div className="app-settings">⚙ <span>Configurações</span></div></aside>
      <div className="app-main">
        <div className="app-top"><span>⌕ &nbsp; Buscar no Gest</span><div>◌ <b>MC</b></div></div>
        <div className="app-welcome"><div><small>SEGUNDA, 13 DE JULHO</small><h3>Bom dia, Marina.</h3></div><button>+ Nova atividade</button></div>
        <div className="app-metrics"><article><span>Receita do mês</span><strong>R$ 82.450</strong><small>↑ 14,2%</small></article><article><span>Negócios em aberto</span><strong>36</strong><small>R$ 126 mil</small></article><article><span>Clientes ativos</span><strong>1.284</strong><small>+48 este mês</small></article></div>
        <div className="app-panels"><div className="app-chart"><header><span>Visão financeira</span><small>6 meses⌄</small></header><div className="chart-lines"><i/><i/><i/><div className="chart-wave">⌁</div></div><footer><span>● Receita</span><span>● Despesas</span></footer></div><div className="app-tasks"><header><span>Próximas tarefas</span><small>Ver todas</small></header>{["Revisar proposta comercial","Fechamento financeiro","Reunião com a equipe","Follow-up Clínica Vitta"].map((x,i)=><div key={x}><i className={i===0?"done":""}>{i===0?"✓":""}</i><span>{x}<small>{["09:30 · Marina","11:00 · Financeiro","14:30 · Equipe","16:00 · Carlos"][i]}</small></span></div>)}</div></div>
      </div>
    </div>
  </div>;
}

function FeatureVisual({ kind }: { kind: string }) {
  if(kind==="timeline") return <div className="v-timeline"><span>Cliente criado</span><i/><span>Proposta enviada</span><i/><span>Venda concluída</span></div>;
  if(kind==="chart") return <div className="v-bars">{[40,62,48,75,68,92,81].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div>;
  if(kind==="calendar") return <div className="v-calendar"><header>Julho 2026 <span>‹ &nbsp; ›</span></header><div>{Array.from({length:21},(_,i)=><i className={[3,8,13,18].includes(i)?"busy":""} key={i}>{i+6}</i>)}</div></div>;
  if(kind==="kanban") return <div className="v-kanban"><div><small>NOVOS</small><span>Arco Studio<b>R$ 8.400</b></span><span>Norte Co.<b>R$ 3.200</b></span></div><div><small>NEGOCIAÇÃO</small><span>Vitta Clinic<b>R$ 12.800</b></span></div><div><small>GANHOS</small><span>Modo Casa<b>R$ 6.900</b></span></div></div>;
  return <div className="v-files"><span><i>PDF</i> Contrato_Arco.pdf <b>2,4 MB</b></span><span><i>XLS</i> Financeiro_Jul.xlsx <b>1,1 MB</b></span><span><i>IMG</i> Comprovante.png <b>840 KB</b></span></div>;
}

function PlanDemo({ level }: { level: "standard" | "plus" | "pro" }) {
  if(level==="standard") return <div className="plan-demo standard-demo"><div className="demo-chrome"><i/><i/><i/><span>gest / visão geral</span></div><div className="std-layout"><aside><b>G</b>{["⌂","◷","♙","↗","◫","▤"].map((x,i)=><i className={i===0?"on":""} key={i}>{x}</i>)}</aside><main><header><div><small>VISÃO GERAL</small><strong>Bom dia, Marina.</strong></div><span>+ Nova atividade</span></header><section className="std-kpis"><article><small>Receita</small><b>R$ 48.290</b><i>↑ 12,4%</i></article><article><small>Clientes ativos</small><b>384</b><i>+18 no mês</i></article><article><small>Vendas</small><b>126</b><i>72% concluídas</i></article></section><section className="std-bottom"><div><header>Agenda de hoje <span>Ver agenda</span></header>{["09:30 Reunião comercial","11:00 Follow-up proposta","14:30 Fechamento do caixa"].map(x=><p key={x}>{x}</p>)}</div><div><header>Resumo financeiro</header><div className="mini-columns">{[42,68,55,82,70,94].map((h,i)=><i style={{height:`${h}%`}} key={i}/>)}</div></div></section></main></div></div>;
  if(level==="plus") return <div className="plan-demo plus-demo"><div className="demo-chrome"><i/><i/><i/><span>gest / automações</span></div><div className="plus-canvas"><div className="flow-start"><small>QUANDO</small><b>Nova venda for criada</b><span>Vendas · qualquer canal</span></div><i className="flow-line line-a"/><div className="flow-node node-mail"><small>ENTÃO</small><b>Enviar confirmação</b><span>E-mail integrado</span></div><i className="flow-line line-b"/><div className="flow-node node-stock"><small>E TAMBÉM</small><b>Atualizar estoque</b><span>Baixa automática</span></div><div className="integration-dock"><span>W</span><span>@</span><span>◷</span><span>⌁</span><b>+8 integrações</b></div><div className="plus-stat"><small>EXECUÇÕES ESTE MÊS</small><b>1.284</b><span>98,7% concluídas</span></div></div></div>;
  return <div className="plan-demo pro-demo"><div className="demo-chrome"><i/><i/><i/><span>gest / controle executivo</span></div><div className="pro-layout"><div className="pro-sidebar"><b>Empresas</b><span className="selected">Matriz São Paulo <i>●</i></span><span>Filial Manaus <i>●</i></span><span>Unidade Recife <i>●</i></span><button>+ Adicionar unidade</button></div><div className="pro-main"><header><div><small>VISÃO CONSOLIDADA</small><b>Grupo Arco</b></div><span>Últimos 12 meses⌄</span></header><div className="pro-kpis"><span><small>Receita consolidada</small><b>R$ 2,48 mi</b></span><span><small>Margem operacional</small><b>28,4%</b></span></div><div className="pro-insight"><i>✦</i><div><small>INSIGHT DO GEST</small><b>A unidade Manaus cresceu 18% acima da média do grupo.</b><span>Ver análise completa →</span></div></div><div className="audit-list"><header>Atividade e auditoria <span>Exportar</span></header><p><i>MC</i><b>Marina alterou uma permissão</b><small>há 4 min</small></p><p><i>API</i><b>Integração sincronizada</b><small>há 12 min</small></p><p><i>JS</i><b>João exportou um relatório</b><small>há 28 min</small></p></div></div></div></div>;
}

export default function Home() {
  const landingRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = landingRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach(target => target.classList.add("is-visible"));
      return;
    }
    root.classList.add("reveal-enabled");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, []);
  return <main className="landing" ref={landingRef}>
    <section className="dark-hero">
      <header className="n-header n-wrap"><Brand/><nav><a href="#produto">Produto</a><a href="#planos">Planos</a><a href="#versoes">Versões</a><a href="#consultoria">Consultoria</a></nav><div><Link href="/entrar">Entrar</Link><Link className="n-pill light-pill" href="/cadastro">Começar grátis</Link></div></header>
      <div className="hero-particles"><Particles particleColors={["#ffffff","#d8e7ff","#8fb7ff","#737980"]} particleCount={260} particleSpread={10} speed={0.045} particleBaseSize={118} sizeRandomness={1.15} cameraDistance={18} alphaParticles disableRotation={false} pixelRatio={1.35}/></div>
      <div className="n-wrap hero-center"><span className="mono-label">GEST BASE · 30 DIAS GRÁTIS</span><h1>O negócio inteiro.<br/><em><DecryptedText text="Em um só ritmo." speed={34} sequential revealDirection="center" animateOn="view" characters="GEST0123456789#$%&*" className="decrypt-revealed" encryptedClassName="decrypt-encrypted" /></em></h1><p>Clientes, vendas, financeiro e equipe em uma plataforma feita para transformar movimento em clareza.</p><div className="center-actions"><Link className="n-pill white-pill" href="/cadastro">Experimentar grátis <span>↗</span></Link><a href="#produto">Conhecer o Gest <span>↓</span></a></div></div>
      <div className="n-wrap hero-product"><MiniDashboard/><div className="bounce-card bounce-one"><small>PREVISÃO DO MÊS</small><b>R$ 82.450</b><span>↑ 14,2%</span></div><div className="bounce-card bounce-two"><i>✓</i><div><b>Venda concluída</b><small>Clínica Vitta · R$ 12.800</small></div></div></div>
      <div className="n-wrap proof-row"><span>Uma base para diferentes caminhos</span><div><b>gest. base</b><b>gest. clinic</b><b>gest. pets</b><b>gest. beauty</b></div></div>
    </section>

    <section className="product-intro n-wrap" id="produto" data-reveal="up"><span className="mono-label dark-label">A PLATAFORMA</span><h2>Feito para a rotina real.<br/>Desenhado para desaparecer.</h2><p>Menos tempo operando o sistema.<br/>Mais tempo entendendo o negócio.</p></section>

    <section className="chrome-grid n-wrap">
      <article className="chrome-card wide-card" data-reveal="scale"><div className="card-copy"><span>01 · VISÃO GERAL</span><h3>O dia começa<br/>com contexto.</h3><p>Prioridades, caixa e equipe na primeira tela.</p></div><div className="overview-demo"><div className="od-metrics"><span><small>Receita</small><b>R$ 82.450</b></span><span><small>Em aberto</small><b>36</b></span><span><small>Concluído</small><b>84%</b></span></div><div className="od-chart"><i/><i/><i/><b>⌁</b></div></div></article>
      <article className="chrome-card" data-reveal="scale"><div className="card-copy"><span>02 · CLIENTES</span><h3>Histórico sem caça ao contexto.</h3></div><FeatureVisual kind="timeline"/></article>
      <article className="chrome-card" data-reveal="scale"><div className="card-copy"><span>03 · RELATÓRIOS</span><h3>Respostas,<br/>não planilhas.</h3></div><FeatureVisual kind="chart"/></article>
      <article className="chrome-card tall-card" data-reveal="scale"><div className="card-copy"><span>04 · AGENDA</span><h3>O próximo passo já está visível.</h3></div><FeatureVisual kind="calendar"/></article>
      <article className="chrome-card wide-card" data-reveal="scale"><div className="card-copy"><span>05 · CRM & VENDAS</span><h3>O funil inteiro<br/>em movimento.</h3></div><FeatureVisual kind="kanban"/></article>
      <article className="chrome-card" data-reveal="scale"><div className="card-copy"><span>06 · DOCUMENTOS</span><h3>Tudo ligado ao lugar certo.</h3></div><FeatureVisual kind="files"/></article>
    </section>

    <section className="plan-story" id="jornada-planos">
      <div className="n-wrap plan-story-intro" data-reveal="up"><span className="mono-label dark-label">TRÊS NÍVEIS · UMA MESMA BASE</span><h2>O Gest cresce<br/>junto com a operação.</h2><p>Cada plano mantém tudo que veio antes. A diferença está na profundidade, no volume e no quanto o sistema trabalha por você.</p></div>
      <article className="plan-chapter standard-chapter" data-reveal="up"><div className="n-wrap plan-chapter-grid"><div className="chapter-copy"><span className="chapter-number">01</span><small>GEST BASE STANDARD</small><h3>Organize o essencial.<br/>Sem complicar.</h3><p>Para empresas pequenas que precisam reunir a rotina em um só lugar e começar com uma operação clara.</p><ul><li>Dashboard, agenda e tarefas</li><li>Clientes, vendas e catálogo</li><li>Financeiro e estoque básicos</li><li>Documentos, CRM e relatórios</li></ul><Link href="/cadastro">Testar 30 dias grátis <span>↗</span></Link></div><PlanDemo level="standard"/></div></article>
      <article className="plan-chapter plus-chapter" data-reveal="up"><div className="n-wrap plan-chapter-grid reverse-grid"><PlanDemo level="plus"/><div className="chapter-copy"><span className="chapter-number">02</span><small>GEST BASE PLUS</small><h3>Tudo do Standard.<br/><em>Agora conectado.</em></h3><p>O Plus adiciona escala e automação para equipes que já usam o Gest no centro da operação.</p><div className="inherits">INCLUI TUDO DO STANDARD</div><ul><li>WhatsApp e e-mail integrados</li><li>Automações e permissões intermediárias</li><li>Estoque e relatórios avançados</li><li>Até 10 usuários e 10 GB</li></ul><a href="#planos">Ver plano Plus <span>↓</span></a></div></div></article>
      <article className="plan-chapter pro-chapter" data-reveal="up"><div className="n-wrap plan-chapter-grid"><div className="chapter-copy"><span className="chapter-number">03</span><small>GEST BASE PRO</small><h3>Todo o controle.<br/>Nenhum limite artificial.</h3><p>A experiência completa para empresas maiores, múltiplas unidades e decisões que exigem rastreabilidade.</p><div className="inherits">INCLUI TUDO DO STANDARD + PLUS</div><ul><li>Automações avançadas e API externa</li><li>Auditoria, backups e permissões avançadas</li><li>Multiempresa e relatórios personalizados</li><li>Histórico completo e insights</li></ul><a href="#planos">Ver plano Pro <span>↓</span></a></div><PlanDemo level="pro"/></div></article>
    </section>

    <section className="versions-section n-wrap" id="versoes"><div className="versions-copy" data-reveal="left"><span className="mono-label dark-label">UM ECOSSISTEMA</span><h2>Começa no Base.<br/>E cresce por segmento.</h2><p>A primeira versão atende negócios em geral. As próximas aprofundam fluxos de mercados específicos.</p></div><div className="version-stack">{[["Disponível primeiro","Gest Base","Gestão completa para negócios que precisam de uma operação mais clara."],["Em planejamento","Gest Clinic","Rotinas de clínicas e consultórios."],["Em planejamento","Gest Pets","Operação para pet shops e serviços."],["Em planejamento","Novos segmentos","Beauty, Food e outras versões."]].map((version,i)=><article className={i===0?"active-version":""} key={version[1]} data-reveal="right"><span>{version[0]}</span><h3>{version[1]}</h3><p>{version[2]}</p>{i===0&&<b>Standard · Plus · Pro</b>}</article>)}</div></section>

    <section className="pricing-section" id="planos"><div className="n-wrap"><div className="pricing-head" data-reveal="up"><span className="mono-label">PLANOS DO GEST BASE</span><h2>Três planos.<br/>Uma evolução contínua.</h2><p>O Standard fica liberado por 30 dias. Plus herda tudo do Standard; Pro reúne tudo dos dois planos e adiciona a experiência mais completa.</p></div><div className="pricing-grid">{plans.map(p=><article key={p.name} data-reveal="scale" className={p.featured?"featured-plan":""} id={p.name==="Consultoria"?"consultoria":undefined}>{p.featured&&<span className="plan-tag">EXPERIÊNCIA COMPLETA</span>}<header><h3>{p.name}</h3><p>{p.lead}</p>{p.provisional&&<small className="provisional-price">VALOR PROVISÓRIO</small>}</header><div className="plan-price"><b>{p.price}</b><span>{p.suffix}</span></div><ul>{p.items.map((x,i)=><li key={x} className={i===0&&p.provisional?"included-base":""}><i>✓</i>{x}</li>)}</ul><Link href={p.name==="Standard"?"/cadastro":"#contato"}>{p.cta}<span>↗</span></Link></article>)}</div></div></section>

    <section className="final-cta" id="contato"><div className="cta-glow"/><div className="n-wrap" data-reveal="up"><span className="mono-label">GEST BASE STANDARD</span><h2>Trinta dias para sentir<br/>a diferença.</h2><p>Teste o sistema completo para começar. Sem cartão, sem compromisso e com seus dados preservados caso decida assinar.</p><div><Link className="n-pill white-pill" href="/cadastro">Começar agora <span>↗</span></Link><a href="mailto:contato@gest.com.br">Falar com a equipe</a></div></div></section>
    <footer className="n-footer n-wrap" id="rodape">
      <div className="footer-brand"><Brand/><p>Gestão leve.<br/>Decisões claras.</p></div>
      <div className="footer-column"><b>Gest</b><a href="#produto">Produto</a><a href="#jornada-planos">Planos</a><a href="#versoes">Versões</a><a href="#consultoria">Consultoria</a></div>
      <div className="footer-column footer-socials"><b>Redes sociais</b><a href="https://instagram.com/nnorocode" target="_blank" rel="noreferrer"><span>IG</span> @nnorocode <i>↗</i></a><a href="https://www.tiktok.com/@nnorocode" target="_blank" rel="noreferrer"><span>TT</span> @nnorocode <i>↗</i></a></div>
      <div className="footer-column footer-company"><b>Desenvolvido por</b><a href="https://nnorocode.github.io/norocode/" target="_blank" rel="noreferrer">Noro Code <i>↗</i></a><small>Produto e tecnologia para negócios que querem avançar.</small></div>
      <div className="footer-bottom"><span>© 2026 Gest</span><span>Uma plataforma Noro Code.</span><a href="#">Privacidade</a><a href="#">Termos</a></div>
    </footer>
  </main>;
}
