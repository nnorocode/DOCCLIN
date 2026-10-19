"use client";
import { Children, isValidElement, useEffect, useRef, useState, type ReactNode } from "react";

/** Preserve the table structure and pagination when a filtered list is empty. */
function emptyMessage(node: ReactNode): string {
  return Children.toArray(node).map(child => isValidElement(child) ? emptyMessage((child.props as { children?: ReactNode }).children) : String(child)).join(" ");
}
export default function EmptyTableBody({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLTableSectionElement>(null);
  const [columns, setColumns] = useState(1);
  const rows = Children.toArray(children);
  const empty = rows.length === 0 || (rows.length === 1 && /^(sem |nenhum|nenhuma)/i.test(emptyMessage(rows[0]).trim()) && isValidElement(rows[0]) && Children.toArray((rows[0].props as { children?: ReactNode }).children).some(cell => isValidElement(cell) && Number((cell.props as { colSpan?: number }).colSpan) > 1));
  useEffect(() => {
    const headings = ref.current?.closest("table")?.tHead?.rows[0]?.cells;
    if (headings) setColumns(Array.from(headings).reduce((total, cell) => total + cell.colSpan, 0));
  }, [empty]);
  return <tbody ref={ref}>{empty ? <tr className="gest-empty-list-row"><td colSpan={columns}><span role="status">Sem registro</span></td></tr> : children}</tbody>;
}
