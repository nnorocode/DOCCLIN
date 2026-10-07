import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | null = null;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const supabaseConfigured = Boolean(url || publicKey);
let rememberSession = true;
try { if (typeof window !== "undefined") rememberSession = window.localStorage.getItem("gest-auth-remember") !== "false"; } catch { rememberSession = false; }
const authStorage = {
  getItem(key: string) { if (typeof window === "undefined") return null; try { return window.sessionStorage.getItem(key) ?? (rememberSession ? window.localStorage.getItem(key) : null); } catch { return null; } },
  setItem(key: string, value: string) { if (typeof window === "undefined") return; (rememberSession ? window.localStorage : window.sessionStorage).setItem(key,value); },
  removeItem(key: string) { if (typeof window === "undefined") return; try { window.localStorage.removeItem(key); window.sessionStorage.removeItem(key); } catch { /* Storage unavailable. */ } },
};
export function setSessionPersistence(remember: boolean) {
  rememberSession = remember;
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem("gest-auth-remember",String(remember)); if (!remember) window.localStorage.removeItem("gest-supabase-auth"); else window.sessionStorage.removeItem("gest-supabase-auth"); } catch { rememberSession = false; }
}
export function clearLocalAuthSession() { authStorage.removeItem("gest-supabase-auth"); authStorage.removeItem("gest-supabase-auth-code-verifier"); }
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (client) return client;
  if (!url || !publicKey) throw new Error("Preencha a URL e a chave pública do Supabase.");
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) throw new Error("O Supabase deve usar HTTPS.");
  if (!publicKey.startsWith("sb_publishable_")) throw new Error("Use a chave publicável do Supabase. Chaves secretas não podem ser usadas no navegador.");
  client = createClient(url, publicKey, { auth: { persistSession: true, storage: authStorage, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "gest-supabase-auth" } });
  return client;
}
