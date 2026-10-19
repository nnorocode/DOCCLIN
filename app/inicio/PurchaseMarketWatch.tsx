"use client";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, ExternalLink, Plus, Search, Store } from "lucide-react";
import { ClientSelect } from "./ClientsExperience";
import DataChartContainer from "./DataChartContainer";
import { chartTooltipStyle } from "./chart-presentation";
import { money, useStoredData } from "../../lib/operational-data";
type Quote = { id:string; name:string; supplier:string; price:number; date:string };
type PurchaseMetric = [string,string,string,string];
export default function PurchaseMarketWatch({onMetricsChange}:{onMetricsChange?:(metrics:PurchaseMetric[])=>void}) {
  const [quotes,setQuotes] = useStoredData<Quote[]>("gest-purchase-quotes", []);
  const [watching,setWatching] = useStoredData<string[]>("gest-purchase-watchlist", []);
  const [search,setSearch] = useState(""); const [selected,setSelected] = useState(""); const [period,setPeriod] = useState("2 meses");
  const [form,setForm] = useState(false); const [name,setName] = useState(""); const [supplier,setSupplier] = useState(""); const [price,setPrice] = useState("");
  const names = [...new Set(quotes.map(quote=>quote.name))];
  const currentName = selected || search.trim() || names[0] || "";
  const limit=new Date(); limit.setMonth(limit.getMonth()-Number(period.split(" ")[0]));
  const history=quotes.filter(quote=>quote.name===currentName && new Date(quote.date)>=limit).sort((a,b)=>a.date.localeCompare(b.date));
  const minimum=history.length ? Math.min(...history.map(quote=>quote.price)) : null;
  const current=history.at(-1)?.price; const previous=history.at(-2)?.price;
  const variation=previous && current !== undefined ? (current-previous)/previous*100 : null;
  useEffect(()=>{ onMetricsChange?.([["Produtos em avaliação",String(names.length),"Com cotações registradas","blue"],["Cotações",String(quotes.length),"Informadas","green"],["Menor preço",minimum===null ? "—" : money(minimum),"Produto selecionado","violet"],["Variação",variation===null ? "—" : variation.toLocaleString("pt-BR",{maximumFractionDigits:1})+"%","Últimas cotações","green"]]); },[quotes,selected,period,search]);
  const query=encodeURIComponent(currentName);
  return <section className="purchase-market"><header><h2>Pesquisa de compras</h2><button type="button" className="lab-create-activity" onClick={()=>{setName(currentName);setForm(true);}}><Plus size={15}/>Registrar cotação</button></header>
    <div className="purchase-market-search"><Search size={18}/><input aria-label="Buscar produto" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Produto para pesquisar"/></div>
    <div className="purchase-market-layout"><aside className="v2-card purchase-market-results"><h3>Produtos</h3>{names.filter(item=>item.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(item=>{
      const prices=quotes.filter(quote=>quote.name===item).sort((a,b)=>a.date.localeCompare(b.date));
      const latest=prices.at(-1)!, prior=prices.at(-2);
      const change=prior && prior.price>0 ? (latest.price-prior.price)/prior.price*100 : null;
      const tone=change===null ? "gray" : change<0 ? "green" : change>0 ? "red" : "yellow";
      const label=change===null ? "Sem comparação" : change<0 ? "Preço caiu" : change>0 ? "Preço subiu" : "Preço estável";
      return <button type="button" className={`signal-${tone}${item===currentName ? " active" : ""}`} key={item} onClick={()=>setSelected(item)} aria-pressed={item===currentName}><span className="purchase-product-copy"><strong>{item}</strong><small>{money(latest.price)} · {latest.supplier}</small></span><em className={tone}>{label}</em></button>;
    })}{!names.length && <p>Sem cotações registradas.</p>}</aside><article className="v2-card purchase-market-detail"><header><h3>{currentName || "Histórico de cotações"}</h3>{currentName && <button type="button" className="clock-secondary" onClick={()=>setWatching(current=>current.includes(currentName)?current.filter(name=>name!==currentName):[...current,currentName])}>{watching.includes(currentName)?"✓ Acompanhando":"+ Acompanhar"}</button>}<ClientSelect compact hideLabel label="Período" value={period} onChange={setPeriod} options={["1 mês","2 meses","12 meses"]}/></header><div className="purchase-market-prices"><span><small>Menor preço informado</small><strong>{minimum===null ? "—" : money(minimum)}</strong></span><span><small>Última cotação</small><strong>{current===undefined ? "—" : money(current)}</strong></span><span><small>Variação</small><strong>{variation===null ? "—" : variation.toLocaleString("pt-BR",{maximumFractionDigits:1})+"%"}</strong></span></div>
    {history.length ? <div className="purchase-market-chart"><DataChartContainer width="100%" height="100%"><AreaChart data={history.map(quote=>({...quote,name:new Date(quote.date).toLocaleDateString("pt-BR")}))}><CartesianGrid vertical={false} stroke="var(--chart-grid, #e1e9f1)" strokeDasharray="3 5"/><XAxis dataKey="name" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false} tickFormatter={value=>money(Number(value))}/><Tooltip contentStyle={chartTooltipStyle} formatter={value=>money(Number(value))}/><Area type="monotone" strokeWidth={2} dataKey="price" name="Preço informado" stroke="#62b3e0" fill="var(--chart-area-fill, #eaf5fc)"/></AreaChart></DataChartContainer></div> : <p>Registre cotações para comparar preços e acompanhar a evolução.</p>}
    {history.length > 0 && <section className="purchase-quote-section" aria-label="Cotações registradas">
      <header><h4>Cotações registradas</h4><span>{history.length} {history.length === 1 ? "cotação" : "cotações"}</span></header>
      <div className="purchase-quote-grid">{[...history].reverse().map(quote => <article className={`purchase-quote-card${quote.price === minimum ? " is-best-price" : ""}`} key={quote.id}>
        <div className="purchase-quote-supplier"><i aria-hidden="true"><Store size={18}/></i><div><small>Fornecedor</small><strong>{quote.supplier}</strong></div></div>
        <div className="purchase-quote-price"><small>Valor cotado</small><strong>{money(quote.price)}</strong></div>
        <footer><time dateTime={quote.date}><CalendarDays size={14} aria-hidden="true"/>{new Date(quote.date).toLocaleDateString("pt-BR")}</time>{quote.price === minimum && <span className="purchase-quote-badge">Menor preço do período</span>}</footer>
      </article>)}</div>
    </section>}
    {currentName && <section className="purchase-marketplace-section" aria-label="Pesquisar nos marketplaces"><header><h4>Pesquisar nos marketplaces</h4><span>Compare outras ofertas</span></header><div className="purchase-marketplace-grid">{[
      {label:"Mercado Livre",image:"mercado-livre.ico",url:`https://lista.mercadolivre.com.br/${query}`},
      {label:"Amazon",image:"amazon.ico",url:`https://www.amazon.com.br/s?k=${query}`},
      {label:"Magazine Luiza",image:"magalu.ico",url:`https://www.magazineluiza.com.br/busca/${query}/`},
      {label:"Shopee",image:"shopee.png",url:`https://shopee.com.br/search?keyword=${query}`},
    ].map(marketplace => <a className="purchase-marketplace-card" href={marketplace.url} target="_blank" rel="noopener noreferrer" key={marketplace.label} aria-label={`Pesquisar ${currentName} em ${marketplace.label} (abre em nova aba)`}>
      <span className="purchase-marketplace-logo"><img src={`/brand/marketplaces/${marketplace.image}`} width={marketplace.image === "magalu.ico" ? 20 : 32} height={marketplace.image === "magalu.ico" ? 20 : 32} alt="" loading="lazy"/></span>
      <span className="purchase-marketplace-copy"><strong>{marketplace.label}</strong><small>Pesquisar produto</small></span><ExternalLink size={16} aria-hidden="true"/>
    </a>)}</div></section>}

    </article></div>
    {form && <div className="v2-record-drawer finance-modal-backdrop"><form className="finance-dialog" onSubmit={event=>{event.preventDefault();setQuotes(current=>[...current,{id:crypto.randomUUID(),name:name.trim(),supplier:supplier.trim(),price:Number(price),date:new Date().toISOString()}]);setSelected(name.trim());setForm(false);}}><header><h2>Registrar cotação</h2></header><section className="finance-form-grid"><label>Produto<input required value={name} onChange={event=>setName(event.target.value)}/></label><label>Fornecedor<input required value={supplier} onChange={event=>setSupplier(event.target.value)}/></label><label>Preço (R$)<input required type="number" min="0.01" step="0.01" value={price} onChange={event=>setPrice(event.target.value)}/></label></section><footer><button type="button" onClick={()=>setForm(false)}>Cancelar</button><button type="submit" className="lab-create-activity">Salvar cotação</button></footer></form></div>}
  </section>;
}
