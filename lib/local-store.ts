// Cache de demonstração; nunca é uma fonte de autorização do banco.
let scope = "demo:owner";
const globalPreferences = new Set(["gest-theme", "gest-sidebar-color", "gest-app-scale", "gest-sidebar-collapsed"]);
const volatile = new Map<string, string>();
const keyFor = (key: string) => globalPreferences.has(key) ? key : `gest-local:${scope}:${key}`;
function browserStorage(): Storage | null { try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; } }
export function setStorageScope(businessId: string, userId: string) {
  const next = `${encodeURIComponent(businessId)}:${encodeURIComponent(userId)}`;
  if (next !== scope) {
    // Remove legacy remote clinical copies only; demo records and other modules are preserved.
    for (const target of [scope,next]) if (!target.startsWith("demo:")) {
      const prefix = `gest-local:${target}:clinical-record:`;
      try { const storage = browserStorage(); if (storage) for (let i=storage.length-1;i>=0;i--) { const key=storage.key(i); if(key?.startsWith(prefix))storage.removeItem(key); } } catch { /* Fail-safe: never read these legacy copies below. */ }
      for (const key of volatile.keys()) if(key.startsWith(prefix))volatile.delete(key);
    }
  }
  scope = next;
}
export const appStorage = {
  keys(): string[] {
    const prefix = `gest-local:${scope}:`;
    const keys = new Set<string>();
    for (const key of volatile.keys()) if (key.startsWith(prefix)) keys.add(key.slice(prefix.length));
    try { for (const key of Object.keys(browserStorage() ?? {})) {
      if (key.startsWith(prefix)) keys.add(key.slice(prefix.length));
      else if (scope === "demo:owner" && (key.startsWith("gest-") || key.startsWith("clinical-record:")) && !key.startsWith("gest-local:")) keys.add(key);
    } } catch { /* Somente o escopo atual fica disponível. */ }
    return [...keys];
  },
  getItem(key: string): string | null {
    if (key.startsWith("clinical-record:") && !scope.startsWith("demo:")) return null;
    const target = keyFor(key); const storage = browserStorage();
    try {
      const stored = volatile.get(target) ?? storage?.getItem(target) ?? null;
      if (stored !== null) return stored;
      // Migração apenas do proprietário da demonstração, preservando os dados existentes.
      if (scope === "demo:owner" && !globalPreferences.has(key)) {
        const legacy = storage?.getItem(key) ?? null;
        if (legacy !== null) { storage?.setItem(target, legacy); return legacy; }
      }
    } catch { /* Cotas e navegação privada não interrompem a interface. */ }
    return volatile.get(target) ?? null;
  },
  setItem(key: string, value: string): void { if(key.startsWith("clinical-record:") && !scope.startsWith("demo:"))return; const previous = this.getItem(key); const target = keyFor(key); volatile.set(target, value); try { const storage = browserStorage(); if (!storage) throw new Error("Storage unavailable"); storage.setItem(target, value); } catch { if (typeof window !== "undefined") window.dispatchEvent(new Event("gest-storage-warning")); } if (previous !== value && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("gest-data-changed", { detail: { key } })); },
  removeItem(key: string): void { const target = keyFor(key); volatile.delete(target); try { browserStorage()?.removeItem(target); if (scope === "demo:owner") browserStorage()?.removeItem(key); } catch { /* Sem armazenamento disponível. */ } },
  clearNamespace(): void {
    const storage = browserStorage();
    try { if (storage) for (const key of Object.keys(storage)) if (key.startsWith(`gest-local:${scope}:`) || (scope === "demo:owner" && key.startsWith("gest-") && !key.startsWith("gest-local:") && !globalPreferences.has(key))) storage.removeItem(key); } catch { /* Navegação privada. */ }
    for (const key of volatile.keys()) if (key.startsWith(`gest-local:${scope}:`)) volatile.delete(key);
  },
};
