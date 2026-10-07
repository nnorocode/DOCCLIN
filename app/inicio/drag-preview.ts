import type { DragEvent } from "react";

/** Captura somente o card arrastado, no tamanho renderizado após o zoom da interface. */
export function setExactDragPreview(event: DragEvent<HTMLElement>) {
  const source = event.currentTarget;
  const bounds = source.getBoundingClientRect();
  const styles = getComputedStyle(source);
  const ghost = source.cloneNode(true) as HTMLElement;
  // O clone sai da árvore `.gest-v2`; copie as cores calculadas antes disso.
  // Assim o preview mantém inclusive os tons pastéis e o modo noturno.
  const originals = [source, ...source.querySelectorAll<HTMLElement>("*")];
  const copies = [ghost, ...ghost.querySelectorAll<HTMLElement>("*")];
  originals.forEach((node, index) => {
    const computed = getComputedStyle(node);
    const copy = copies[index];
    if (!copy) return;
    for (const property of ["color", "background", "border-color", "box-shadow", "text-shadow", "fill", "stroke"]) {
      copy.style.setProperty(property, computed.getPropertyValue(property));
    }
  });
  ghost.style.cssText = `position:fixed;top:0;left:0;z-index:2147483647;width:${bounds.width}px;height:${bounds.height}px;min-width:0;min-height:0;max-width:none;box-sizing:border-box;margin:0;transform:none;opacity:1;overflow:hidden;pointer-events:none;box-shadow:${styles.boxShadow};border-radius:${styles.borderRadius};background:${styles.background};color:${styles.color};`;
  ghost.querySelectorAll("button, input, select").forEach((node) => { (node as HTMLElement).style.pointerEvents = "none"; });
  document.body.appendChild(ghost);
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setDragImage(ghost, Math.min(bounds.width / 2, 110), Math.min(bounds.height / 2, 32));
  window.setTimeout(() => ghost.remove(), 0);
}
