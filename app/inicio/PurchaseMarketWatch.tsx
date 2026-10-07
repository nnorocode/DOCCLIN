"use client";
import { chartTooltipStyle } from "./chart-presentation";
import { appStorage } from "../../lib/local-store";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CircleHelp, ExternalLink, Search, TrendingDown, X } from "lucide-react";
import { ClientSelect } from "./ClientsExperience";
import TutorialStoryboard from "./TutorialStoryboard";

type PurchaseMetric = [string, string, string, string];

const products = [
  { id: "luva", name: "Luva de procedimento nitrílica", spec: "Caixa com 100 unidades · tamanho M", base: 32.9 },
  { id: "mascara", name: "Máscara descartável tripla", spec: "Caixa com 50 unidades", base: 21.5 },
  { id: "alcool", name: "Álcool 70%", spec: "Frasco de 1 litro", base: 16.8 },
];
const periods = ["1 semana", "1 mês", "2 meses", "1 ano"];
const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const makeHistory = (product: typeof products[number], count: number, period: string) => Array.from({ length: count }, (_, index) => {
  const progress = index / Math.max(1, count - 1);
  const wave = (1 + Math.sin(index * 1.7 + product.base)) / 2;
  const factor = product.id === "alcool" ? .72 + .2 * wave : product.id === "mascara" ? .84 + .28 * wave : 1.05 + .15 * (1 - progress) + .025 * wave;
  return { name: period === "1 semana" ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][index] : `${index + 1}`, price: index === count - 1 ? product.base : Number((product.base * factor).toFixed(2)) };
});

export default function PurchaseMarketWatch({ onMetricsChange }: { onMetricsChange?: (metrics: PurchaseMetric[]) => void }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("luva");
  const [customProduct, setCustomProduct] = useState<{ id: string; name: string; spec: string; base: number } | null>(null);
  const [period, setPeriod] = useState("2 meses");
  const [watching, setWatching] = useState<string[]>([]);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [hideTutorialNextTime, setHideTutorialNextTime] = useState(false);
  useEffect(() => { try { const value = JSON.parse(appStorage.getItem("gest-purchase-watchlist") || "[]"); if (Array.isArray(value)) setWatching(value); } catch { /* Empty watchlist. */ } }, []);
  useEffect(() => { try { if (appStorage.getItem("gest-purchase-tutorial-hidden-v2") !== "true") setTutorialOpen(true); } catch { setTutorialOpen(true); } }, []);
  const save = (next: string[]) => { setWatching(next); appStorage.setItem("gest-purchase-watchlist", JSON.stringify(next)); };
  const allProducts = customProduct ? [customProduct, ...products] : products;
  const selected = allProducts.find((item) => item.id === selectedId) || products[0];
  const visible = allProducts.filter((item) => `${item.name} ${item.spec}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")));
  const count = period === "1 semana" ? 7 : period === "1 mês" ? 12 : period === "2 meses" ? 16 : 24;
  const signalFor = (id: string): "green" | "yellow" | "red" => {
    const product = allProducts.find((item) => item.id === id);
    if (!product) return "yellow";
    const prices = makeHistory(product, count, period).map((point) => point.price);
    const low = Math.min(...prices), high = Math.max(...prices);
    const position = high > low ? (product.base - low) / (high - low) : .5;
    return position <= .25 ? "green" : position >= .72 ? "red" : "yellow";
  };
  const signalCopy = { green: "Bom preço", yellow: "Acompanhar preço", red: "Preço alto" } as const;
  useEffect(() => {
    const monitored = allProducts.filter((item) => watching.includes(item.id));
    const goodMoment = monitored.filter((item) => signalFor(item.id) === "green");
    const estimatedSavings = goodMoment.reduce((sum, item) => sum + item.base * .13, 0);
    const referenceValue = goodMoment.reduce((sum, item) => sum + item.base * 1.13, 0);
    const savingsPercent = referenceValue ? estimatedSavings / referenceValue * 100 : 0;
    onMetricsChange?.([
      ["Produtos em avaliação", String(monitored.length), "itens acompanhados", "blue"],
      ["Bom momento de compra", String(goodMoment.length), "com sinal verde", "green"],
      ["Compras do mês", "R$ 18.920", "valor demonstrativo", "violet"],
      ["Economia estimada", brl(estimatedSavings), `${savingsPercent.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% abaixo da referência`, "green"],
    ]);
  }, [watching, customProduct, period, onMetricsChange]);
  const history = makeHistory(selected, count, period);
  const historyMinimum = Math.min(...history.map((point) => point.price));
  const marketplaceQuery = encodeURIComponent(selected.name);
  const marketplaceSlug = selected.name.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const offers = [
    { name: "Mercado Livre", price: selected.base, delivery: "Consultar frete e prazo", url: `https://lista.mercadolivre.com.br/${marketplaceSlug}` },
    { name: "Amazon", price: selected.base * 1.04, delivery: "Consultar disponibilidade", url: `https://www.amazon.com.br/s?k=${marketplaceQuery}` },
    { name: "Magazine Luiza", price: selected.base * 1.08, delivery: "Consultar retirada ou entrega", url: `https://www.magazineluiza.com.br/busca/${marketplaceSlug}/` },
    { name: "Shopee", price: selected.base * 1.12, delivery: "Consultar vendedor e prazo", url: `https://shopee.com.br/search?keyword=${marketplaceQuery}` },
  ];
  const runSearch = () => {
    const term = search.trim();
    if (!term) return;
    const match = products.find((item) => `${item.name} ${item.spec}`.toLocaleLowerCase("pt-BR").includes(term.toLocaleLowerCase("pt-BR")));
    if (match) return setSelectedId(match.id);
    const generated = { id: `custom-${Date.now()}`, name: term, spec: "Pesquisa personalizada nos marketplaces", base: Math.max(12, Math.min(999, term.length * 4.7)) };
    setCustomProduct(generated);
    setSelectedId(generated.id);
  };
  const closeTutorial = () => { if (hideTutorialNextTime) { try { appStorage.setItem("gest-purchase-tutorial-hidden-v2", "true"); } catch { /* The tutorial can still close for this visit. */ } } setTutorialOpen(false); };
  return <section className="purchase-market"><header><div><h2>Monitore o produto antes de comprar <span title="Acompanhe a variação estimada do preço, compare referências e decida quando pesquisar ofertas reais nos marketplaces."><CircleHelp size={16} /></span></h2></div><button type="button" className="purchase-tutorial-link" onClick={() => setTutorialOpen(true)}><CircleHelp size={15} />Como funciona</button></header>
    <form className="purchase-market-search" onSubmit={(event) => { event.preventDefault(); runSearch(); }}><Search size={18} /><input aria-label="Buscar produto" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ex.: álcool 70%, luvas, impressora..." /><button type="submit">Pesquisar marketplaces</button></form>
    <div className="purchase-market-layout"><aside className="v2-card purchase-market-results"><h3>Produtos</h3>{visible.length ? visible.map((item) => { const signal = signalFor(item.id); return <button type="button" key={item.id} className={`signal-${signal}${selected.id === item.id ? " active" : ""}`} onClick={() => setSelectedId(item.id)}><span className="purchase-product-copy"><strong>{item.name}</strong><small><b>Especificação</b>{item.spec}</small></span><em className={signal}>{signalCopy[signal]}</em></button>; }) : <p>Digite o item e clique em pesquisar.</p>}</aside><article className="v2-card purchase-market-detail"><header><div><h3>{selected.name}</h3><small>{selected.spec}</small></div><button type="button" className="clock-secondary" onClick={() => save(watching.includes(selected.id) ? watching.filter((id) => id !== selected.id) : [...watching, selected.id])}>{watching.includes(selected.id) ? "✓ Acompanhando" : "+ Acompanhar"}</button></header><div className="purchase-market-prices"><span><small>Menor referência no gráfico</small><strong>{brl(historyMinimum)}</strong></span><span><small>Preço atual simulado</small><strong>{brl(history.at(-1)!.price)}</strong></span><span><small>Variação no período</small><strong><TrendingDown size={16} />{((history.at(-1)!.price / history[0].price - 1) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</strong></span></div><div className="purchase-market-chart-head"><h4>Histórico de referência</h4><ClientSelect compact hideLabel label="Período do histórico" value={period} onChange={setPeriod} options={periods} /></div><div className="purchase-market-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={history} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e1e9f1" strokeDasharray="3 5" /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#75889a" }} /><YAxis width={42} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#75889a" }} domain={["dataMin - 2", "dataMax + 2"]} /><Tooltip contentStyle={chartTooltipStyle} formatter={(value) => brl(Number(value))} /><Area dataKey="price" name="Preço" type="linear" stroke="#62b3e0" strokeWidth={2.5} fill="#eaf5fc" activeDot={{ r: 5 }} /></AreaChart></ResponsiveContainer></div><h4>Pesquisar nos marketplaces</h4><div className="purchase-market-offers">{offers.map((offer) => <div key={offer.name}><span><strong>{offer.name}</strong><small>{offer.delivery}</small></span><b>{brl(offer.price)}</b><a href={offer.url} target="_blank" rel="noreferrer">Abrir busca <ExternalLink size={13} /></a></div>)}</div><small className="purchase-market-disclaimer">Os valores desta prévia são estimativas locais. O preço final é confirmado no marketplace aberto.</small></article></div>
    {tutorialOpen ? <div className="purchase-tutorial-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeTutorial(); }}><section className="purchase-tutorial-dialog purchase-story-dialog" role="dialog" aria-modal="true" aria-label="Tutorial de compras"><header><span><CircleHelp size={18} /></span><button type="button" aria-label="Fechar tutorial" onClick={closeTutorial}><X size={18} /></button></header><TutorialStoryboard kind="compras" /><footer><label className="purchase-tutorial-dismiss"><input type="checkbox" checked={hideTutorialNextTime} onChange={(event) => setHideTutorialNextTime(event.target.checked)} />Não mostrar este tutorial novamente</label><button type="button" className="lab-create-activity" onClick={closeTutorial}>Entendi, começar a acompanhar</button></footer></section></div> : null}
  </section>;
}
