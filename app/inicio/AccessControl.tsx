"use client";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AccessContext } from "./AccessContext";
import { ShieldCheck, Users, Plus } from "lucide-react";
import { ClientSelect } from "./ClientsExperience";
import { appModules, canAccess, canManageAccess, defaultPermissions, roleLabels, validatePermissions, type AccessRole, type BusinessMember, type ModulePermissions } from "../../lib/access-control";
import { appStorage, setStorageScope } from "../../lib/local-store";
import { clearLocalAuthSession, getSupabase, supabaseConfigured } from "../../lib/supabase/client";

const demoMembers: BusinessMember[] = [
  { id: "owner", businessId: "demo", name: "Mariana Oliveira", email: "mariana@bellagestao.com.br", role: "owner", active: true, permissions: defaultPermissions("owner") },
  { id: "admin", businessId: "demo", name: "Administrador", email: "admin@exemplo.com", role: "admin", active: true, permissions: defaultPermissions("admin") },
  { id: "reception", businessId: "demo", name: "Recepção", email: "recepcao@exemplo.com", role: "reception", active: true, permissions: defaultPermissions("reception") },
  { id: "employee", businessId: "demo", name: "Funcionário", email: "funcionario@exemplo.com", role: "employee", active: true, permissions: defaultPermissions("employee") },
];
export function useAccess() { const value = useContext(AccessContext); if (!value) throw new Error("Contexto de acesso indisponível."); return value; }
export function AccessProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<BusinessMember | null>(null);
  const [members, setMembers] = useState<BusinessMember[]>([]);
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const established = useRef(false);
  const currentBusiness = useRef<string | undefined>(undefined);
  const mode = supabaseConfigured ? "supabase" : "demo";
  const load = async (businessId?: string, showLoading = true) => {
    const request = ++requestId.current;
    if (!established.current || (businessId && showLoading)) setLoading(true);
    setError("");
    try {
      const db = getSupabase();
      if (!db) return;
      const { data: { user }, error: authError } = await db.auth.getUser();
      if (authError || !user) { if (request === requestId.current) { setMember(null); setMembers([]); } return; }
      const { data: memberships, error: membershipError } = await db.from("business_members").select("*, businesses(name)").eq("user_id", user.id).eq("active", true);
      if (membershipError) throw membershipError;
      const rows = memberships ?? [];
      const current = rows.find((row) => row.business_id === (businessId ?? currentBusiness.current)) ?? rows[0];
      if (!current) throw new Error("Sua conta ainda não está vinculada a um empreendimento. Solicite acesso ao administrador.");
      const { data: grants, error: grantsError } = await db.from("module_permissions").select("*").eq("business_id", current.business_id);
      if (grantsError) throw grantsError;
      const normalize = (row: typeof current): BusinessMember => ({ id: row.id, userId: row.user_id, businessId: row.business_id, name: row.display_name, email: row.email, role: row.role, active: row.active, permissions: (row.role === "owner" || row.role === "admin") ? defaultPermissions(row.role) : Object.fromEntries((grants ?? []).filter((grant) => grant.member_id === row.id).map((grant) => [grant.module, grant.allowed === true])) });
      const activeMember = normalize(current);
      const { data: colleagues, error: colleaguesError } = await db.from("business_members").select("*").eq("business_id", current.business_id);
      if (colleaguesError) throw colleaguesError;
      if (request !== requestId.current) return;
      setStorageScope(current.business_id, user.id);
      currentBusiness.current = current.business_id;
      established.current = true;
      setMember(activeMember); setMembers((colleagues ?? []).map(normalize));
      setBusinesses(rows.map((row) => ({ id: row.business_id, name: row.businesses?.name ?? "Empreendimento" })));
    } catch (cause) { if (request === requestId.current) { setMember(null); setError(cause instanceof Error ? cause.message : "Não foi possível carregar suas permissões."); } }
    finally { if (request === requestId.current) setLoading(false); }
  };
  useEffect(() => {
    if (!supabaseConfigured) {
      setStorageScope("demo", "owner");
      let saved = demoMembers;
      try { const value = JSON.parse(appStorage.getItem("gest-demo-members") ?? "null"); if (Array.isArray(value)) saved = value.filter((row) => row && typeof row.id === "string" && typeof row.name === "string" && typeof row.email === "string" && row.role in roleLabels).map((row) => ({ ...row, businessId: "demo", active: row.active === true, permissions: validatePermissions(row.permissions) })); } catch { /* Perfis padrão. */ }
      if (!saved.some((row) => row.id === "owner" && row.role === "owner" && row.active)) saved = demoMembers;
      setMembers(saved); setMember(saved.find((row) => row.id === "owner")!); setBusinesses([{ id: "demo", name: "Bella Gestão" }]); setLoading(false);
      return;
    }
    void load();
    let cleanup = () => {};
    try { const subscription = getSupabase()!.auth.onAuthStateChange(() => { window.setTimeout(() => void load(), 0); }); cleanup = () => subscription.data.subscription.unsubscribe(); } catch { /* load exibe o erro de configuração. */ }
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", refresh);
    return () => { requestId.current++; cleanup(); window.removeEventListener("focus", refresh); };
  }, []);
  const saveMember = async (next: BusinessMember) => {
    const original = members.find((row) => row.id === next.id);
    if (!canManageAccess(member) || !original || next.businessId !== member?.businessId || next.role === "owner" || original.role === "owner" || next.id === member.id || (member.role === "admin" && (original.role === "admin" || next.role === "admin"))) throw new Error("Sem permissão para alterar este usuário.");
    if (mode === "supabase") {
      const { error: saveError } = await getSupabase()!.rpc("set_member_permissions", { target_member: next.id, target_role: next.role, target_active: next.active, grants: validatePermissions(next.permissions) });
      if (saveError) throw saveError;
      await load(member.businessId, false);
    } else {
      const updated = members.map((row) => row.id === next.id ? next : row); setMembers(updated);
      setStorageScope("demo", "owner");
      try { appStorage.setItem("gest-demo-members", JSON.stringify(updated)); } finally { setStorageScope("demo", member.id); }
    }
  };
  const invite = async (name: string, email: string, role: AccessRole) => {
    if (!canManageAccess(member) || role === "owner" || (member?.role === "admin" && role === "admin")) throw new Error("Sem permissão para cadastrar este perfil.");
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Preencha nome e e-mail válido.");
    if (members.some((row) => row.email.toLowerCase() === email.trim().toLowerCase())) throw new Error("Este e-mail já está vinculado ao empreendimento.");
    if (mode === "supabase") {
      const { data, error: inviteError } = await getSupabase()!.functions.invoke("invite-member", { body: { business_id: member!.businessId, name: name.trim(), email: email.trim().toLowerCase(), role } });
      if (inviteError || data?.error) throw new Error(data?.error ?? "Não foi possível enviar o convite.");
      await load(member!.businessId, false);
    } else {
      const updated = [...members, { id: crypto.randomUUID(), businessId: "demo", name: name.trim(), email: email.trim().toLowerCase(), role, active: true, permissions: defaultPermissions(role) }];
      setMembers(updated);
      setStorageScope("demo", "owner");
      try { appStorage.setItem("gest-demo-members", JSON.stringify(updated)); } finally { setStorageScope("demo", member!.id); }
    }
  };
  const preview = (id: string) => { if (mode !== "demo") return; const next = members.find((row) => row.id === id && row.active); if (next) { setStorageScope("demo", next.id); setMember(next); } };
  const signOut = async () => { requestId.current++; try { if (mode === "supabase") await getSupabase()!.auth.signOut({ scope: "local" }); } finally { clearLocalAuthSession(); setMember(null); setStorageScope("signed-out", "none"); window.location.assign("/entrar"); } };
  return <AccessContext.Provider value={{ mode, loading, error, member, members, businesses, allowed: (view) => canAccess(member, view), manage: canManageAccess(member), saveMember, invite, preview, switchBusiness: load, signOut }}>{children}</AccessContext.Provider>;
}

export function AccessSettings() {
  const access = useAccess();
  const [selected, setSelected] = useState("");
  const person = access.members.find((row) => row.id === selected) ?? access.members.find((row) => row.role === "reception") ?? access.members[0];
  const [draft, setDraft] = useState<BusinessMember | null>(null);
  const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [role, setRole] = useState<AccessRole>("reception");
  useEffect(() => { setDraft(person ? { ...person, permissions: { ...person.permissions } } : null); }, [person]);
  const act = async (action: () => Promise<void>, message: string) => { setBusy(true); setNotice(""); try { await action(); setNotice(message); } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Não foi possível salvar."); } finally { setBusy(false); } };
  if (!access.manage || !draft) return <section className="client-record-panel"><header><h2>Meu acesso</h2></header><p>Seu administrador define quais áreas você pode utilizar.</p></section>;
  return <section className="access-settings client-record-panel">
    <header><h2><ShieldCheck size={18} />Usuários e acessos</h2></header>
    <p>Selecione uma pessoa cadastrada, marque ou desmarque as abas e salve para atualizar o acesso. O dono mantém acesso completo.</p>
    <div className="access-settings-controls">
      <div className="access-control-select"><ClientSelect label="Usuário" value={`${person.name} · ${person.email}`} onChange={(value) => setSelected(access.members.find((row) => `${row.name} · ${row.email}` === value)?.id ?? person.id)} options={access.members.map((row) => `${row.name} · ${row.email}`)} /></div>
      <div className="access-control-select">{draft.role === "owner" ? <label>Perfil<strong>{roleLabels.owner}</strong></label> : <ClientSelect label="Perfil" value={roleLabels[draft.role]} onChange={(value) => { const nextRole = (Object.entries(roleLabels).find(([, label]) => label === value)?.[0] ?? draft.role) as AccessRole; setDraft({ ...draft, role: nextRole, permissions: defaultPermissions(nextRole) }); }} options={Object.entries(roleLabels).filter(([id]) => id !== "owner").map(([, label]) => label)} />}</div>
      <label className="access-check"><input type="checkbox" checked={draft.active} disabled={draft.role === "owner"} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} />Acesso ativo</label>
    </div>
    <div className="access-module-grid">{appModules.map(([id, label, group]) => <label key={id}><input type="checkbox" checked={draft.role === "owner" || draft.role === "admin" || draft.permissions[id] === true} disabled={draft.role === "owner" || draft.role === "admin"} onChange={(event) => setDraft({ ...draft, permissions: { ...draft.permissions, [id]: event.target.checked } })} /><span>{label}<small>{group}</small></span></label>)}</div>
    <footer className="client-record-footer access-settings-actions"><button className="lab-create-activity" disabled={busy || draft.role === "owner"} onClick={() => void act(() => access.saveMember(draft), "Permissões salvas.")}>Salvar acessos</button>{access.mode === "demo" && person.active ? <button className="lab-create-activity is-secondary" onClick={() => access.preview(person.id)}>Visualizar como {person.name}</button> : null}</footer>
    {notice ? <p role="status">{notice}</p> : null}
    <section className="access-invite"><h3><Users size={18} />Adicionar usuário</h3><form onSubmit={(event) => { event.preventDefault(); void act(() => access.invite(name, email, role), access.mode === "demo" ? "Usuário cadastrado na demonstração." : "Convite enviado."); }}><label>Nome<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><div className="access-control-select"><ClientSelect label="Perfil" value={roleLabels[role]} onChange={(value) => setRole((Object.entries(roleLabels).find(([, label]) => label === value)?.[0] ?? role) as AccessRole)} options={["admin", "reception", "employee"].map((id) => roleLabels[id as AccessRole])} /></div><button disabled={busy} className="lab-create-activity"><Plus size={15} />{access.mode === "demo" ? "Cadastrar usuário" : "Enviar convite"}</button></form></section>
    {access.businesses.length > 1 ? <label>Empreendimento<select value={access.member?.businessId} onChange={(event) => void access.switchBusiness(event.target.value)}>{access.businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}</select></label> : null}
  </section>;
}
