"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
export default function ScrollableTabBar({ className, label, children }: { className: string; label: string; children: ReactNode }) {
  const navRef = useRef<HTMLElement>(null);
  const [overflow, setOverflow] = useState({ previous: false, next: false });
  const measure = useCallback(() => {
    const nav = navRef.current;
    if (nav) {
      const fits = nav.scrollWidth <= (nav.parentElement?.clientWidth ?? nav.clientWidth) + 2;
      setOverflow({ previous: !fits && nav.scrollLeft > 2, next: !fits && nav.scrollWidth - nav.clientWidth - nav.scrollLeft > 2 });
    }
  }, []);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    Array.from(nav.children).forEach(child => observer.observe(child));
    measure();
    return () => observer.disconnect();
  }, [measure, children]);
  const move = (direction: number) => navRef.current?.scrollBy({ left: direction * Math.max(240, navRef.current.clientWidth * .72), behavior: "smooth" });
  return <div className="gest-horizontal-nav" data-overflow={overflow.previous || overflow.next}>
    <button hidden={!overflow.previous} type="button" className="gest-horizontal-nav-arrow previous" onClick={() => move(-1)} aria-label={`Ver opções anteriores de ${label}`}><ChevronLeft size={17} /></button>
    <nav ref={navRef} onScroll={measure} className={className} aria-label={label}>{children}</nav>
    <button hidden={!overflow.next} type="button" className="gest-horizontal-nav-arrow next" onClick={() => move(1)} aria-label={`Ver próximas opções de ${label}`}><ChevronRight size={17} /></button>
  </div>;
}
