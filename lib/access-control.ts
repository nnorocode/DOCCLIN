export const appModules = [
  ["home", "Início", "Principal"], ["assistant", "Assistente", "Principal"],
  ["agenda", "Agenda", "Minha rotina"], ["tasks", "Tarefas", "Minha rotina"], ["projects", "Projetos", "Minha rotina"],
  ["clients", "Clientes", "Relacionamento"], ["clinical", "Prontuário", "Relacionamento"], ["crm", "CRM", "Relacionamento"], ["support", "Atendimento", "Relacionamento"],
  ["proposals", "Propostas", "Comercial"], ["sales", "Vendas", "Comercial"], ["catalog", "Catálogo", "Comercial"],
  ["inventory", "Estoque", "Operação"], ["maintenance", "Manutenção", "Operação"], ["documents", "Documentos", "Operação"],
  ["work_orders", "Ordens de Serviço", "Operação"], ["purchases", "Compras", "Operação"], ["suppliers", "Fornecedores", "Operação"],
  ["finance", "Financeiro", "Gestão"], ["pricing", "Precificação", "Gestão"], ["reports", "Relatórios", "Gestão"], ["team", "Equipe", "Gestão"],
  ["time_clock", "Ponto", "Principal"], ["investments", "Investimentos", "Principal"], ["onboarding", "Primeiros passos", "Principal"],
  ["store", "Loja", "Sistema"], ["settings", "Configurações", "Sistema"],
] as const;
export type ModuleId = typeof appModules[number][0];
export type AccessRole = "owner" | "admin" | "reception" | "employee";
export type ModulePermissions = Partial<Record<ModuleId, boolean>>;
export type BusinessMember = { id: string; userId?: string; businessId: string; name: string; email: string; role: AccessRole; active: boolean; permissions: ModulePermissions };
export const roleLabels: Record<AccessRole, string> = { owner: "Dono do empreendimento", admin: "Administrador", reception: "Recepção", employee: "Funcionário" };
export function moduleForView(view: string): ModuleId | undefined {
  if (view === "Detalhe") return "clients";
  return appModules.find(([, label]) => label === view)?.[0];
}
export function defaultPermissions(role: AccessRole): ModulePermissions {
  const allowed = role === "owner" || role === "admin" ? appModules.map(([id]) => id)
    : role === "reception" ? ["home", "agenda", "tasks", "clients", "crm", "support", "proposals", "sales", "catalog", "time_clock", "onboarding", "settings"]
    : ["home", "agenda", "tasks", "time_clock", "onboarding", "settings"];
  return Object.fromEntries(appModules.map(([id]) => [id, allowed.includes(id)]));
}
export function canAccess(member: BusinessMember | null, view: string): boolean {
  const module = moduleForView(view);
  return !!member?.active && !!module && (member.role === "owner" || member.permissions[module] === true);
}
export function canManageAccess(member: BusinessMember | null): boolean {
  return !!member?.active && (member.role === "owner" || member.role === "admin");
}
export function validatePermissions(input: unknown): ModulePermissions {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  return Object.fromEntries(appModules.map(([id]) => [id, (input as Record<string, unknown>)[id] === true]));
}
