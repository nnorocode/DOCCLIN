/** Share the operational theme with body portals, restoring the host on unmount. */
export function applyDocumentTheme(root: Pick<HTMLElement, "dataset">, dark: boolean) {
  const previous = root.dataset.docclinTheme;
  root.dataset.docclinTheme = dark ? "dark" : "light";
  return () => {
    if (previous === undefined) delete root.dataset.docclinTheme;
    else root.dataset.docclinTheme = previous;
  };
}
