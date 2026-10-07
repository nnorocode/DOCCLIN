import { getSupabase } from "./client";
import type { ModuleId } from "../access-control";
export type BusinessRecord = { id: string; business_id: string; module: ModuleId; data: Record<string, unknown>; version: number; created_at: string; updated_at: string };
// O servidor aplica RLS e decide acesso; business_id não concede autorização.
export function recordsRepository(businessId: string, module: ModuleId) {
  const db = getSupabase();
  if (!db) throw new Error("Supabase ainda não configurado.");
  return {
    async list() { const { data, error } = await db.from("business_records").select("*").eq("business_id", businessId).eq("module", module).order("updated_at", { ascending: false }).limit(200); if (error) throw error; return data as BusinessRecord[]; },
    async create(data: Record<string, unknown>) { const { data: record, error } = await db.from("business_records").insert({ business_id: businessId, module, data }).select().single(); if (error) throw error; return record as BusinessRecord; },
    async update(record: Pick<BusinessRecord, "id" | "version">, data: Record<string, unknown>) { const { data: updated, error } = await db.from("business_records").update({ data }).eq("id", record.id).eq("business_id", businessId).eq("module", module).eq("version", record.version).select().maybeSingle(); if (error) throw error; if (!updated) throw new Error("Registro alterado por outra pessoa ou sem permissão. Atualize antes de salvar."); return updated as BusinessRecord; },
    async remove(id: string) { const { data, error } = await db.from("business_records").delete().eq("id", id).eq("business_id", businessId).eq("module", module).select("id"); if (error) throw error; if (!data?.length) throw new Error("Registro indisponível ou sem permissão."); },
  };
}
