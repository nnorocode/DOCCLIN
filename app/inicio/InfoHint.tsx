"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

export default function InfoHint({ text }: { text: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  useEffect(() => {
    if (!position) return;
    const outside = (event: PointerEvent) => { if (!buttonRef.current?.contains(event.target as Node)) setPosition(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setPosition(null); };
    const close = () => setPosition(null);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [position]);
  return <>
    <button ref={buttonRef} type="button" className="v2-info-hint" aria-label={text} aria-expanded={Boolean(position)} onClick={() => {
      if (position) { setPosition(null); return; }
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) setPosition({ top: rect.bottom + 84 > window.innerHeight ? Math.max(8, rect.top - 76) : rect.bottom + 8, left: Math.min(window.innerWidth - 130, Math.max(130, rect.left + rect.width / 2)) });
    }}><Info size={12} strokeWidth={2.2} aria-hidden="true" /></button>
    {position && typeof document !== "undefined" ? createPortal(<span className="v2-info-popover" role="tooltip" style={{ top: position.top, left: position.left }}>{text}</span>, document.body) : null}
  </>;
}
