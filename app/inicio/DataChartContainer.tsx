"use client";
import { Children, cloneElement, isValidElement, useState, type ReactNode, type ReactElement, type ComponentProps } from "react";
import { ResponsiveContainer } from "recharts";

function hasValues(node: ReactNode): boolean {
  return Children.toArray(node).some(child => {
    if (!isValidElement(child)) return false;
    const props = child.props as { data?: Record<string, unknown>[]; children?: ReactNode };
    if (props.data?.some(row => Object.entries(row).some(([key, value]) => key !== "name" && typeof value === "number" && Number.isFinite(value) && value !== 0))) return true;
    return props.children ? hasValues(props.children) : false;
  });
}
export default function DataChartContainer(props: ComponentProps<typeof ResponsiveContainer>) {
  const [width, setWidth] = useState(800);
  const present = (node: ReactNode): ReactNode => Children.map(node, child => {
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<Record<string, any>>;
    const type = element.type as { displayName?: string; name?: string };
    const name = type.displayName || type.name;
    const next: Record<string, any> = {};
    if (element.props.children) next.children = present(element.props.children);
    if (name === "XAxis" && element.props.type !== "number") {
      const count = Math.max(1, Children.toArray(props.children).reduce<number>((max, chart) => isValidElement(chart) ? Math.max(max, (chart.props as any).data?.length ?? 0) : max, 0));
      const rotate = width / count < 65;
      Object.assign(next, { interval: 0, minTickGap: 0, padding: { left: 20, right: 24 }, height: rotate ? 65 : 32, angle: rotate ? -45 : 0, textAnchor: rotate ? "end" : "middle", tick: { fill: "#738295", fontSize: 12 }, tickFormatter: (value: unknown) => String(value).replace(/\s+de\s+/g, " ") });
    }
    if (name === "YAxis" || (name === "XAxis" && element.props.type === "number")) Object.assign(next, { ...(name === "YAxis" ? { width: 82 } : {}), tick: { fill: "#738295", fontSize: 12 } });
    if (name === "Legend") next.wrapperStyle = { ...element.props.wrapperStyle, fontSize: 12 };
    return cloneElement(element, next);
  });
  if (!hasValues(props.children)) return <div className="gest-chart-empty" role="status">Sem dados no período.</div>;
  return <ResponsiveContainer {...props} onResize={(w, h) => { setWidth(w); props.onResize?.(w, h); }}>{Children.toArray(present(props.children))[0] as ReactElement}</ResponsiveContainer>;
}
