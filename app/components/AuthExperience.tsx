"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { demoAllowed, getSupabase, setSessionPersistence, supabaseConfigured } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

type AuthMode = "login" | "signup";
type LoginView = "login" | "recover" | "reset";
type SignupStep = 1 | 2 | 3 | 4;

const businessTypes = ["Serviços", "Comércio", "Clínica", "Pet shop", "Consultoria", "Outro"];
const states = ["AM", "SP", "RJ", "MG", "PR", "SC", "RS", "BA", "PE", "GO", "DF"];

const emptySignup = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  terms: false,
  company: "",
  businessType: "Serviços",
  document: "",
  companyPhone: "",
  companyEmail: "",
  city: "",
  state: "AM",
};

function Field({
  label,
  placeholder,
  type = "text",
  icon,
  required,
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder: string;
  type?: string;
  icon?: ReactNode;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <label className={`modern-field ${error ? "field-error" : ""}`}>
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      <div>
        {icon}
        <input type={isPassword && visible ? "text" : type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
        {isPassword ? (
          <button type="button" className="password-eye" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Ocultar senha" : "Mostrar senha"}>
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        ) : null}
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="modern-field">
      <span>{label}</span>
      <div>
        <Building2 size={17} />
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {children}
        </select>
      </div>
    </label>
  );
}

function Progress({ step, onSelect }: { step: SignupStep; onSelect: (step: SignupStep) => void }) {
  const labels = ["Dados do usuário", "Dados da empresa", "Plano", "Concluído"] as const;

  return (
    <div className="signup-progress" aria-label="Etapas do cadastro">
      {labels.map((label, index) => {
        const itemStep = (index + 1) as SignupStep;
        const active = itemStep <= step;
        return (
          <button key={label} type="button" className={active ? "active" : ""} onClick={() => itemStep < step && onSelect(itemStep)} disabled={itemStep > step}>
            <i>{active && itemStep < step ? <Check size={13} /> : itemStep}</i>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function AuthVisual({ mode, step, loginView }: { mode: AuthMode; step: SignupStep; loginView: LoginView }) {
  const title =
    mode === "signup"
      ? step === 4
        ? "Tudo pronto para começar."
        : "Comece simples. Cresça no seu ritmo."
      : loginView === "recover"
        ? "Recupere o acesso sem stress."
        : loginView === "reset"
          ? "Nova senha. Mesmo ritmo."
          : "Seu negócio volta para o centro.";

  const body =
    mode === "signup"
      ? "O Standard fica liberado por 30 dias para testar a base do Gest com clientes, vendas, agenda e financeiro."
      : loginView === "login"
        ? "Acesse a operação sem ruído: visão geral, agenda, clientes, vendas e financeiro no mesmo lugar."
        : supabaseConfigured ? "Use as instruções enviadas ao seu e-mail para recuperar o acesso à sua conta." : "Fluxo demonstrativo: nenhum e-mail é enviado neste ambiente local.";

  return (
    <section className="auth-visual">
      <div className="auth-brand-mini">
        <span>G</span>
        <b>gest.</b>
      </div>
      <div className="visual-orbit">
        <span />
        <span />
        <span />
      </div>
      <div className="auth-visual-copy">
        <p>{mode === "signup" ? "GEST BASE · 30 DIAS GRÁTIS" : loginView === "login" ? "BEM-VINDO DE VOLTA" : "ACESSO SEGURO"}</p>
        <h2>{title}</h2>
        <span>{body}</span>
      </div>
      <div className="auth-mini-window" aria-hidden="true">
        <header>
          <i />
          <i />
          <i />
          <small>app.gest.com.br</small>
        </header>
        <div className="mini-window-body">
          <aside>
            <b>G</b>
            <span />
            <span />
            <span />
          </aside>
          <main>
            <small>{mode === "signup" ? `Etapa ${Math.min(step, 4)} de 4` : loginView === "login" ? "Visão geral" : "Conta"}</small>
            <strong>{mode === "signup" ? "Configuração guiada" : loginView === "login" ? "Bem-vindo(a), Marina" : "Verificação enviada"}</strong>
            <div className="mini-metrics">
              <span>
                <em>Receita</em>
                <b>R$ 82k</b>
              </span>
              <span>
                <em>Clientes</em>
                <b>1.284</b>
              </span>
            </div>
            <div className="mini-line" />
          </main>
        </div>
      </div>
      <ul className="auth-benefits">
        <li>
          <ShieldCheck size={16} /> Ambiente seguro
        </li>
        <li>
          <Sparkles size={16} /> Visual limpo
        </li>
        <li>
          <Check size={16} /> Sem cartão no teste
        </li>
      </ul>
    </section>
  );
}

function LoginForms({ view, setView }: { view: LoginView; setView: (view: LoginView) => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [keepConnected, setKeepConnected] = useState(true);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!supabaseConfigured) return;
    try { const { data } = getSupabase()!.auth.onAuthStateChange((event) => { if (event === "PASSWORD_RECOVERY") setView("reset"); }); return () => data.subscription.unsubscribe(); } catch { setMessage("A configuração de acesso precisa ser revisada."); }
  }, [setView]);

  const copy = useMemo(() => {
    if (view === "recover") return { kicker: "Recuperar senha", title: "Vamos te enviar o acesso.", text: "Informe o e-mail da conta para receber as instruções de recuperação." };
    if (view === "reset") return { kicker: "Redefinir senha", title: "Crie uma nova senha.", text: "Escolha uma senha segura para voltar a usar o Gest." };
    return { kicker: "Entrar", title: "Acesse sua conta.", text: "Continue acompanhando clientes, vendas e financeiro sem perder o ritmo." };
  }, [view]);

  async function submitLogin() {
    if (busy) return;
    if (!supabaseConfigured && !demoAllowed) { setMessage("Configure o acesso seguro antes de utilizar o aplicativo."); return; }
    const missing = [!email ? "email" : "", !password ? "password" : ""].filter(Boolean);
    setErrors(missing);
    if (missing.length) {
      setMessage("Preencha e-mail e senha.");
      return;
    }
    if (supabaseConfigured) {
      setBusy(true);
      try {
        const db = getSupabase()!;
        setSessionPersistence(keepConnected);
        const { data, error } = await db.auth.signInWithPassword({ email: email.trim(), password });
        if (error || !data.user) { setMessage("Não foi possível entrar. Confira suas credenciais."); return; }
        const { data: memberships, error: membershipError } = await db.from("business_members").select("id").eq("user_id", data.user.id).limit(1);
        if (membershipError) { setMessage("Não foi possível consultar o vínculo com o empreendimento."); return; }
        if (!memberships?.length && data.user.user_metadata.business_name) {
          const { error: onboardingError } = await db.rpc("create_owned_business", { business_name: data.user.user_metadata.business_name, owner_name: data.user.user_metadata.full_name || "Responsável" });
          if (onboardingError) { setMessage("Seu cadastro precisa ser concluído pelo administrador."); return; }
        }
        setPassword(""); router.push("/inicio");
      } catch { setMessage("A configuração de acesso precisa ser revisada."); } finally { setBusy(false); }
      return;
    }
    setMessage("Entrando na demonstração local...");
    window.setTimeout(() => router.push("/inicio"), 420);
  }

  async function submitRecover() {
    if (busy) return;
    if (!supabaseConfigured && !demoAllowed) { setMessage("Configure o acesso seguro antes de utilizar o aplicativo."); return; }
    setErrors(!email ? ["email"] : []);
    if (!email) {
      setMessage("Digite o e-mail para simular o envio.");
      return;
    }
    if (supabaseConfigured) {
      setBusy(true);
      try { await getSupabase()!.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/entrar` }); setMessage("Se o e-mail estiver cadastrado, você receberá as instruções de recuperação."); } catch { setMessage("Não foi possível solicitar a recuperação agora."); } finally { setBusy(false); }
      return;
    }
    setMessage("Demonstração: simulando a redefinição, sem enviar e-mail.");
    window.setTimeout(() => setView("reset"), 520);
  }

  async function submitReset() {
    if (busy) return;
    if (!supabaseConfigured && !demoAllowed) { setMessage("Configure o acesso seguro antes de utilizar o aplicativo."); return; }
    const missing = [!newPassword ? "newPassword" : "", !confirmPassword ? "confirmPassword" : ""].filter(Boolean);
    setErrors(missing);
    if (missing.length || newPassword !== confirmPassword || newPassword.length < 8) {
      setMessage(newPassword !== confirmPassword ? "As senhas precisam ser iguais." : "Use uma senha com pelo menos 8 caracteres.");
      return;
    }
    if (supabaseConfigured) {
      setBusy(true);
      try { const db = getSupabase()!; const { error } = await db.auth.updateUser({ password: newPassword }); if (error) { setMessage("Use o link de recuperação válido enviado ao seu e-mail."); return; } await db.auth.signOut(); } catch { setMessage("Não foi possível redefinir a senha."); return; } finally { setBusy(false); }
    }
    setNewPassword(""); setConfirmPassword(""); setMessage(supabaseConfigured ? "Senha redefinida. Você já pode entrar." : "Senha redefinida apenas na demonstração.");
    window.setTimeout(() => setView("login"), 520);
  }

  return (
    <section className="auth-form-panel">
      <Link className="auth-back-link" href="/">
        <ChevronLeft size={16} /> Voltar ao site
      </Link>
      <div className="auth-form-copy">
        <span>{copy.kicker}</span>
        <h1>{copy.title}</h1>
        <p>{copy.text}</p>
      </div>

      {message ? <div className={errors.length ? "auth-toast warning" : "auth-toast"}>{message}</div> : null}

      {view === "login" ? (
        <form className="modern-auth-form" onSubmit={(event) => event.preventDefault()}>
          <Field label="E-mail" type="email" placeholder="seu@email.com" icon={<Mail size={17} />} required value={email} onChange={setEmail} error={errors.includes("email")} />
          <Field label="Senha" type="password" placeholder="Digite sua senha" icon={<Lock size={17} />} required value={password} onChange={setPassword} error={errors.includes("password")} />
          <div className="auth-form-row">
            <label className="modern-check">
              <input type="checkbox" checked={keepConnected} onChange={(event) => setKeepConnected(event.target.checked)} />
              <span /> Manter conectado
            </label>
            <button type="button" onClick={() => { setMessage(""); setErrors([]); setView("recover"); }}>
              Esqueci minha senha
            </button>
          </div>
          <button className="modern-submit" type="button" onClick={submitLogin}>
            Entrar <ArrowRight size={17} />
          </button>
          <p className="modern-switch">
            Ainda não tem uma conta? <Link href="/cadastro">Criar conta</Link>
          </p>
        </form>
      ) : view === "recover" ? (
        <form className="modern-auth-form" onSubmit={(event) => event.preventDefault()}>
          <Field label="E-mail" type="email" placeholder="seu@email.com" icon={<Mail size={17} />} required value={email} onChange={setEmail} error={errors.includes("email")} />
          <button className="modern-submit" type="button" onClick={submitRecover}>
            Enviar instruções <ArrowRight size={17} />
          </button>
          <button className="auth-text-button" type="button" onClick={() => { setMessage(""); setErrors([]); setView("login"); }}>
            <ArrowLeft size={15} /> Voltar para login
          </button>
        </form>
      ) : (
        <form className="modern-auth-form" onSubmit={(event) => event.preventDefault()}>
          <Field label="Nova senha" type="password" placeholder="Mínimo de 8 caracteres" icon={<Lock size={17} />} required value={newPassword} onChange={setNewPassword} error={errors.includes("newPassword")} />
          <Field label="Confirmar senha" type="password" placeholder="Digite novamente" icon={<Lock size={17} />} required value={confirmPassword} onChange={setConfirmPassword} error={errors.includes("confirmPassword")} />
          <button className="modern-submit" type="button" onClick={submitReset}>
            Salvar nova senha <ArrowRight size={17} />
          </button>
          <button className="auth-text-button" type="button" onClick={() => { setMessage(""); setErrors([]); setView("login"); }}>
            <ArrowLeft size={15} /> Voltar para login
          </button>
        </form>
      )}
    </section>
  );
}

function SignupForms({ step, setStep }: { step: SignupStep; setStep: (step: SignupStep) => void }) {
  const router = useRouter();
  const [form, setForm] = useState(emptySignup);
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const update = (key: keyof typeof emptySignup) => (value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  function validateUserStep() {
    const missing = ["name", "email", "phone", "password", "confirmPassword"].filter((key) => !form[key as keyof typeof form]);
    if (form.password.length < 8) missing.push("password");
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) missing.push("confirmPassword");
    if (!form.terms) missing.push("terms");
    setErrors(missing);
    if (missing.length) {
      setMessage(form.password !== form.confirmPassword && form.confirmPassword ? "As senhas precisam ser iguais." : "Preencha os obrigatórios e aceite os termos para continuar.");
      return false;
    }
    setMessage("");
    return true;
  }

  function validateCompanyStep() {
    const missing = ["company"].filter((key) => !form[key as keyof typeof form]);
    setErrors(missing);
    if (missing.length) {
      setMessage("O nome da empresa é obrigatório para continuar.");
      return false;
    }
    setMessage("");
    return true;
  }

  function nextFromUser() {
    if (validateUserStep()) setStep(2);
  }

  function nextFromCompany() {
    if (validateCompanyStep()) setStep(3);
  }

  async function finishSignup() {
    if (busy || !validateUserStep() || !validateCompanyStep()) return;
    if (!supabaseConfigured && !demoAllowed) { setMessage("Configure o acesso seguro antes de utilizar o aplicativo."); return; }
    if (supabaseConfigured) {
      setBusy(true);
      try {
        const db = getSupabase()!;
        const { data, error } = await db.auth.signUp({ email: form.email.trim(), password: form.password, options: { emailRedirectTo: `${window.location.origin}/entrar`, data: { full_name: form.name.trim(), business_name: form.company.trim() } } });
        if (error || !data.user) { setMessage("Não foi possível concluir o cadastro. Confira os dados e tente novamente."); return; }
        if (data.session) { const { error: onboardingError } = await db.rpc("create_owned_business", { business_name: form.company.trim(), owner_name: form.name.trim() }); if (onboardingError) { setMessage("Conta criada; o vínculo com o empreendimento ainda precisa ser concluído."); return; } }
        setForm((current) => ({ ...current, password: "", confirmPassword: "" }));
        setMessage(data.session ? "Conta criada. Você pode acessar o sistema." : "Confira seu e-mail para confirmar o cadastro antes de entrar.");
        setStep(4);
      } catch { setMessage("A configuração de acesso precisa ser revisada."); } finally { setBusy(false); }
      return;
    }
    setMessage("Cadastro concluído. Preparando seu Gest Base...");
    window.setTimeout(() => setStep(4), 420);
  }

  return (
    <section className="auth-form-panel signup-form-panel">
      <Link className="auth-back-link" href="/">
        <ChevronLeft size={16} /> Voltar ao site
      </Link>
      {step < 4 ? <Progress step={step} onSelect={(nextStep) => setStep(nextStep)} /> : null}
      {message ? <div className={errors.length ? "auth-toast warning" : "auth-toast"}>{message}</div> : null}

      {step === 1 ? (
        <>
          <div className="auth-form-copy">
            <span>Dados do usuário</span>
            <h1>Crie sua conta no Gest.</h1>
            <p>Esses dados identificam o administrador inicial da empresa.</p>
          </div>
          <form className="modern-auth-form two-columns" onSubmit={(event) => event.preventDefault()}>
            <Field label="Nome completo" placeholder="Seu nome completo" icon={<UserRound size={17} />} required value={form.name} onChange={update("name")} error={errors.includes("name")} />
            <Field label="E-mail" type="email" placeholder="seu@email.com" icon={<Mail size={17} />} required value={form.email} onChange={update("email")} error={errors.includes("email")} />
            <Field label="Telefone" placeholder="(92) 99999-9999" icon={<Phone size={17} />} required value={form.phone} onChange={update("phone")} error={errors.includes("phone")} />
            <Field label="Senha" type="password" placeholder="Mínimo de 8 caracteres" icon={<Lock size={17} />} required value={form.password} onChange={update("password")} error={errors.includes("password")} />
            <Field label="Confirmar senha" type="password" placeholder="Digite novamente" icon={<Lock size={17} />} required value={form.confirmPassword} onChange={update("confirmPassword")} error={errors.includes("confirmPassword")} />
            <label className={`modern-check full ${errors.includes("terms") ? "check-error" : ""}`}>
              <input type="checkbox" checked={form.terms} onChange={(event) => update("terms")(event.target.checked)} />
              <span /> Aceito os termos de uso e a política de privacidade
            </label>
            <button className="modern-submit full" type="button" onClick={nextFromUser}>
              Continuar <ArrowRight size={17} />
            </button>
            <p className="modern-switch full">
              Já tem uma conta? <Link href="/entrar">Entrar</Link>
            </p>
          </form>
        </>
      ) : step === 2 ? (
        <>
          <div className="auth-form-copy">
            <span>Dados da empresa</span>
            <h1>Agora o espaço do negócio.</h1>
            <p>Essas informações ajudam a preparar a base inicial do sistema.</p>
          </div>
          <form className="modern-auth-form two-columns" onSubmit={(event) => event.preventDefault()}>
            <Field label="Nome da empresa" placeholder="Nome do negócio" icon={<Building2 size={17} />} required value={form.company} onChange={update("company")} error={errors.includes("company")} />
            <SelectField label="Tipo de negócio" value={form.businessType} onChange={update("businessType")}>
              {businessTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </SelectField>
            <Field label="CNPJ/CPF" placeholder="00.000.000/0001-00" icon={<Building2 size={17} />} value={form.document} onChange={update("document")} />
            <Field label="Telefone da empresa" placeholder="(92) 3333-3333" icon={<Phone size={17} />} value={form.companyPhone} onChange={update("companyPhone")} />
            <Field label="E-mail da empresa" type="email" placeholder="contato@empresa.com" icon={<Mail size={17} />} value={form.companyEmail} onChange={update("companyEmail")} />
            <Field label="Cidade" placeholder="Manaus" icon={<MapPin size={17} />} value={form.city} onChange={update("city")} />
            <SelectField label="Estado" value={form.state} onChange={update("state")}>
              {states.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </SelectField>
            <div className="signup-actions full">
              <button type="button" onClick={() => { setErrors([]); setMessage(""); setStep(1); }}>
                Voltar
              </button>
              <button type="button" onClick={nextFromCompany}>
                Continuar <ArrowRight size={17} />
              </button>
            </div>
          </form>
        </>
      ) : step === 3 ? (
        <>
          <div className="auth-form-copy">
            <span>Escolha do plano</span>
            <h1>Confirme seu teste grátis.</h1>
            <p>Você começa no Free com acesso ao Gest Base Standard por 30 dias.</p>
          </div>
          <div className="plan-options">
            <button type="button" className={selectedPlan === "free" ? "selected" : ""} onClick={() => setSelectedPlan("free")}>
              <small>Plano Free</small>
              <strong>Teste inicial</strong>
              <span>Acesso liberado por 30 dias.</span>
            </button>
            <button type="button" className={selectedPlan === "standard" ? "selected" : ""} onClick={() => setSelectedPlan("standard")}>
              <small>Plano Standard</small>
              <strong>Gest Base Standard</strong>
              <span>Plano que será assinado após o teste.</span>
            </button>
          </div>
          <div className="plan-confirm-card">
            <header>
              <span>{selectedPlan === "free" ? "Plano Free" : "Plano Standard"}</span>
              <strong>{selectedPlan === "free" ? "30 dias grátis" : "Gest Base Standard"}</strong>
              <small>Resumo dos limites</small>
            </header>
            <ul>
              <li>Até 2 usuários</li>
              <li>Clientes, agenda, vendas e catálogo</li>
              <li>Financeiro e estoque básicos</li>
              <li>Documentos, CRM e relatórios essenciais</li>
            </ul>
          </div>
          <div className="signup-actions">
            <button type="button" onClick={() => setStep(2)}>
              Voltar
            </button>
            <button type="button" onClick={finishSignup}>
              Confirmar <ArrowRight size={17} />
            </button>
          </div>
        </>
      ) : (
        <div className="signup-complete">
          <i>
            <Check size={28} />
          </i>
          <span>Cadastro concluído</span>
          <h1>Seu Gest está pronto.</h1>
          <p>Agora é só entrar na plataforma e começar a visualizar sua operação.</p>
          <button className="modern-submit" type="button" onClick={() => router.push("/inicio")}>
            Ir para o sistema <ArrowRight size={17} />
          </button>
        </div>
      )}
    </section>
  );
}

export default function AuthExperience({ mode }: { mode: AuthMode }) {
  const [loginView, setLoginView] = useState<LoginView>("login");
  const [signupStep, setSignupStep] = useState<SignupStep>(1);

  return (
    <main className={`modern-auth-shell ${mode === "signup" ? "signup-mode" : "login-mode"}`}>
      <div className="auth-bg-noise" />
      <div className="auth-card-modern">
        <div className="auth-card-gradient" />
        {mode === "login" ? (
          <>
            <AuthVisual mode="login" step={1} loginView={loginView} />
            <LoginForms view={loginView} setView={setLoginView} />
          </>
        ) : (
          <>
            <SignupForms step={signupStep} setStep={setSignupStep} />
            <AuthVisual mode="signup" step={signupStep} loginView="login" />
          </>
        )}
      </div>
    </main>
  );
}
