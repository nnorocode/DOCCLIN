> Consolidação adicional: [CHECKLIST_DE_SEGURANCA.md](CHECKLIST_DE_SEGURANCA.md) reúne as duas auditorias e os [ajustes do segundo vídeo](.functional-review/ajustes-seguranca-video2-2026-10-19/RESUMO.md), com 109 testes locais e pendências explícitas de implantação.

> Atualização de 19/10/2026: este documento descreve a revisão histórica de setembro. O estado atual e os testes das correções estão em [.functional-review/correcoes-seguranca-2026-10-19/RESUMO.md](.functional-review/correcoes-seguranca-2026-10-19/RESUMO.md). Auditoria atual: zero avisos nas dependências de produção; um aviso residual de desenvolvimento com mitigação local. Implantação Supabase e validação em produção continuam pendentes.

# Revisão de segurança e preparação Supabase

Data: 29/09/2026. Escopo: frontend, acessos, armazenamento, anexos, dependências, infraestrutura inicial e legibilidade no modo escuro. Alterações anteriores do projeto foram preservadas.

## Implementado

- Compras: tutorial ilustrado aprovado com preferência de ocultação versionada; cards inteiros em verde/amarelo/vermelho, fonte legível, semáforo verde em cima e vermelho embaixo; sinal removido da área do gráfico. Preços continuam explicitamente simulados, não são cotações reais.
- Configurações → Usuários e acessos: dono, administrador, recepção e funcionário. Dono e administrador têm acesso integral; os demais recebem permissões por aba. Apenas o dono pode administrar outros administradores. Sem alteração do próprio perfil ou promoção para dono.
- Menu e conteúdo verificam acesso. A página inicial restrita não mostra os indicadores financeiros; notificações gerenciais, configurações de negócio e cadastro de funcionários não aparecem para terceiros. A prévia de perfil funciona apenas no ambiente de demonstração.
- Cache local separado por empreendimento e usuário, com migração dos dados antigos somente para o dono da demonstração. Preferências visuais não são sobrescritas antes da leitura. Armazenamento cheio/indisponível preserva o estado da sessão e mostra aviso.
- Validação de dados locais em Clientes, documentos, widgets, dados do negócio e Ponto para evitar que dados inválidos derrubem essas telas.
- Anexos: formatos PDF/PNG/JPG/WebP, limite de 10 MB, conferência de assinatura inicial e MIME. HTML/SVG e URLs executáveis não entram na prévia. Iframes sem execução de scripts; exclusão continua exigindo confirmação.
- Removida a falsa indicação de autenticação em duas etapas/segurança monitorada. MFA não é apresentado como ativo sem configuração real.
- Login, cadastro, recuperação de senha e saída usam Supabase quando configurado; configuração incompleta falha fechada, sem cair no login demonstrativo. Sem credenciais, a interface permanece uma demonstração local. Senhas não são armazenadas pelo app.
- Cabeçalhos HTTP de proteção: nosniff, política de referência, restrição de enquadramento/objetos, permissões de câmera/microfone/localização somente na própria origem; HSTS em HTTPS.
- Modo escuro: correções de superfícies e contraste em Agenda, Compras, Investimentos, Precificação, Configurações, listas, paginação, gráficos e submenus.

## Estrutura de banco entregue

`supabase/migrations/202609290001_access_foundation.sql` contém empresas, vínculos de usuários, permissões por módulo, registros versionados, trilha de auditoria e bucket privado. RLS impede acesso anônimo, cruzamento de empresas e módulos não autorizados. Identidade/propriedade do registro não podem mudar em uma atualização. Alterações concorrentes são detectadas pela versão.

Funções administrativas validam o ator no banco. O papel não vem de metadados editáveis do usuário. `invite-member` valida sessão e vínculo antes de usar uma chave administrativa exclusivamente no servidor. O banco revalida quem está convidando. Administradores não podem criar outros administradores; somente o dono.

`lib/supabase/records.ts` oferece operações filtradas por empresa/módulo e versão. Isso é uma base de integração, não a migração completa de todos os formulários. O esquema genérico deve evoluir para tabelas e validações de domínio antes de operar dados reais.

## Validação realizada

- Testes automatizados: permissões, usuário inativo, cache entre empresas/usuários, reset limitado, anexos maliciosos, cabeçalhos HTTP e execução real da migração em PostgreSQL local (PGlite).
- Testes SQL verificam: leitura/escrita entre empresas bloqueadas, financeiro negado ao funcionário, autopromoção negada, propriedade imutável, conflito de versão, documentos privados e acesso anônimo negado.
- Verificação TypeScript e compilação Vinext.
- Navegação e contraste no navegador nas áreas principais; tutorial Compras carregado e cores/ordem do semáforo conferidas. Prévia da recepção sem Financeiro/Precificação/indicadores gerenciais confirmada.
- HTTP `/inicio` retorna 200 com os cabeçalhos configurados.
- `pnpm audit` completo (produção e ferramentas de desenvolvimento) terminou sem vulnerabilidades conhecidas. Atualizados Next, React, Vite, runtime RSC e ferramentas Cloudflare; correções transitivas ficam reproduzíveis em `pnpm-workspace.yaml`. Isso não é uma certificação de ausência de falhas.

## O que impede considerar o sistema pronto para produção

1. Não foi fornecido/conectado um projeto Supabase real. A migração e a função de convite NÃO foram aplicadas remotamente. Testes locais não substituem testes no projeto implantado.
2. Os módulos operacionais ainda usam cadastros/valores simulados e armazenamento local ou estado React. Agenda, Financeiro, CRM, Atendimento, Equipe, Estoque etc. ainda precisam substituir leituras/escritas pelas operações reais do banco, com testes de cada fluxo. Não se deve registrar dados reais nesta prévia.
3. Ponto móvel e reconhecimento facial não são autenticação real nesta versão. Precisam de vínculo usuário/funcionário, políticas por registro (somente o próprio funcionário), validação de servidor, dispositivo e privacidade/consentimento. A preparação atual NÃO habilita biometria.
4. Anexos precisam ser enviados ao bucket privado e abertos com URLs assinadas curtas. Conferência de formato não substitui antivírus, inspeção de PDF e controle de retenção. O cache local não é armazenamento seguro de prontuários/documentos reais.
5. Configurar confirmação de e-mail, SMTP, limites de tentativas, MFA, URLs de redirecionamento, domínio HTTPS, backups, recuperação, retenção e observabilidade. Testar login, convite, recuperação, revogação e troca de empresa com contas reais de teste.
6. Calendário comemorativo, automações, marketplaces, indicadores e outras integrações permanecem simulados. A auditoria não certifica que todos os botões e regras de negócio do produto tenham implementação real.
7. Antes de produção, restringir CSP de scripts/conexões com os domínios efetivamente usados e validar acessibilidade/contraste em todos os estados de formulário e tamanhos de tela, não apenas nas páginas principais. O build ainda avisa sobre chunks grandes.

## Como conectar de forma segura

1. Criar um ambiente Supabase de homologação vazio e aplicar a migração; não executar sobre tabelas reais existentes sem adaptar e testar.
2. Usar os nomes de `supabase.env.example` em um arquivo `.env.local` ignorado pelo Git. No navegador: URL e chave **publicável** apenas. Nunca usar `service_role`/`sb_secret_` em `NEXT_PUBLIC_*`.
3. Configurar as URLs permitidas de login/recuperação e o provedor de e-mail. Publicar `invite-member`, definir `APP_ORIGIN` como a origem HTTPS exata e manter a chave administrativa somente nos segredos da função.
4. Completar a adaptação dos módulos e anexos; então repetir os testes de RLS no projeto real usando dono, administrador, recepção e funcionário de duas empresas diferentes. Verificar rejeição também por chamadas diretas à API, não só pelo menu.
5. Usar pnpm e `pnpm-lock.yaml` para reproduzir as versões auditadas. O antigo `package-lock.json` do template não foi usado nem atualizado nesta revisão.

Referências oficiais: [RLS do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security) e [chaves de API](https://supabase.com/docs/guides/getting-started/api-keys). Ocultar uma aba não substitui autorização no banco; chaves administrativas ignoram RLS e jamais devem ir para o cliente.
