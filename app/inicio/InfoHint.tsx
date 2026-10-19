"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

export default function InfoHint({ text, fitViewport=false }: { text: string; fitViewport?:boolean }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  useEffect(() => {
    if (!position) return;
    const outside = (event: PointerEvent) => { if (!buttonRef.current?.contains(event.target as Node) && !(fitViewport && popoverRef.current?.contains(event.target as Node))) setPosition(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setPosition(null); };
    const close = (event:Event) => { if(fitViewport && event.target instanceof Node && popoverRef.current?.contains(event.target))return; setPosition(null); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [position,fitViewport]);
  return <>
    <button ref={buttonRef} type="button" className="v2-info-hint" aria-label={text} aria-expanded={Boolean(position)} onClick={() => {
      if (position) { setPosition(null); return; }
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) setPosition({ top: rect.bottom + 84 > window.innerHeight ? Math.max(8, rect.top - 76) : rect.bottom + 8, left: Math.min(window.innerWidth - 130, Math.max(130, rect.left + rect.width / 2)) });
    }}><Info size={12} strokeWidth={2.2} aria-hidden="true" /></button>
    {position && typeof document !== "undefined" ? createPortal(<span ref={popoverRef} tabIndex={fitViewport?0:undefined} className="v2-info-popover" role="tooltip" style={{ top: position.top, left: position.left, ...(fitViewport?{maxHeight:`calc(100dvh - ${position.top + 8}px)`,overflowY:"auto" as const,pointerEvents:"auto" as const}: {}) }}>{text}</span>, document.body) : null}
  </>;
}
