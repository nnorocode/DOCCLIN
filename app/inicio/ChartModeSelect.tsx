"use client";
import { chartTooltipStyle } from "./chart-presentation";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ClientSelect } from "./ClientsExperience";

export type ChartMode = "Padrão" | "Linha" | "Colunas" | "Rosca" | "Card";
export type ChartSeries = { key: string; name: string; color: string; currency?: boolean };

export function ChartModeSelect({ value, onChange }: { value: ChartMode; onChange: (value: ChartMode) => void }) {
  return <div className="gest-chart-mode"><ClientSelect compact hideLabel label="Tipo de gráfico" value={value} onChange={(value) => onChange(value as ChartMode)} options={["Padrão", "Linha", "Colunas", "Rosca", "Card"]} /></div>;
}

export function FlexibleChart({ mode, data, series, currency = false }: { mode: ChartMode; data: Record<string, string | number>[]; series: ChartSeries[]; currency?: boolean }) {
  const format = (value: number, monetary = currency) => monetary ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value) : value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  const totals = series.map((item) => ({ ...item, value: data.reduce((sum, point) => sum + Number(point[item.key] || 0), 0) }));
  if (mode === "Card") return <div className="gest-flexible-cards">{series.map((item) => <article key={item.key}><i style={{ background: item.color }} /><span>{item.name}</span><strong>{format(Number(data.at(-1)?.[item.key] || 0), item.currency ?? currency)}</strong></article>)}</div>;
  if (mode === "Rosca") return <div className="gest-flexible-pie"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={totals} dataKey="value" nameKey="name" innerRadius="48%" outerRadius="72%" stroke="none" paddingAngle={2}>{totals.map((item) => <Cell key={item.key} fill={item.color} />)}</Pie><Tooltip contentStyle={chartTooltipStyle} formatter={(value, name) => format(Number(value), series.find(item => item.name === name)?.currency ?? currency)} /><Legend iconType="circle" iconSize={8} /></PieChart></ResponsiveContainer></div>;
  const axes = <><CartesianGrid stroke="#e3e9ee" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#788695", fontSize: 11 }} /><YAxis width={58} tickLine={false} axisLine={false} tick={{ fill: "#8793a0", fontSize: 10 }} tickFormatter={(value) => Number(value) >= 1000 ? `${Math.round(Number(value) / 1000)} mil` : String(value)} /><Tooltip contentStyle={chartTooltipStyle} formatter={(value, name) => format(Number(value), series.find(item => item.name === name)?.currency ?? currency)} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} /></>;
  return <div className="gest-flexible-plot"><ResponsiveContainer width="100%" height="100%">{mode === "Linha" ? <LineChart data={data}>{axes}{series.map((item) => <Line key={item.key} type="linear" dataKey={item.key} name={item.name} stroke={item.color} strokeWidth={2.5} dot={{ r: 2 }} />)}</LineChart> : <BarChart data={data}>{axes}{series.map((item) => <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color} radius={[5, 5, 0, 0]} />)}</BarChart>}</ResponsiveContainer></div>;
}
