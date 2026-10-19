"use client";
import { useEffect, useState, type RefObject } from "react";

export function useHorizontalOverflow(ref: RefObject<HTMLElement | null>) {
  const [state, setState] = useState({ previous: false, next: false });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const fits = element.parentElement?.classList.contains("gest-horizontal-nav") && element.scrollWidth <= element.parentElement.clientWidth + 2;
      setState({ previous: !fits && element.scrollLeft > 2, next: !fits && element.scrollWidth - element.clientWidth - element.scrollLeft > 2 });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    Array.from(element.children).forEach(child => observer.observe(child));
    const changes = new MutationObserver(() => { Array.from(element.children).forEach(child => observer.observe(child)); measure(); });
    changes.observe(element, { childList: true });
    element.addEventListener("scroll", measure, { passive: true });
    measure();
    return () => { observer.disconnect(); changes.disconnect(); element.removeEventListener("scroll", measure); };
  }, [ref]);
  return state;
}
