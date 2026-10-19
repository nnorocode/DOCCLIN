# Checklist de segurança

Base reutilizável consolidada das duas análises e correções do DOCCLIN em **19/10/2026**. Os itens servem para outros projetos, mas as decisões e o estado do DOCCLIN não devem ser copiados como aprovação de outro sistema.

## Como aplicar em outro projeto

1. Identificar arquitetura: frontend, servidor/APIs, provedor de identidade, banco, arquivos, dados sensíveis e hospedagem. Identificar quem acessa quais empresas/registros.
2. Usar homologação e dados fictícios. Não executar ataques, redefinições, convites, pagamentos ou restaurações contra produção para preencher o checklist.
3. Para cada controle abaixo, registrar **aplicabilidade, resultado, evidência, ambiente, versão/data e pendência**. Segredos e dados reais nunca entram no relatório.
4. Separar inspeção de código, teste automatizado, teste pela interface e teste do serviço implantado. Um tipo de evidência não substitui os demais.
5. Corrigir, repetir os testes afetados e conferir efeitos nos consumidores. A próxima revisão retoma mudanças e pendências, sem repetir toda a auditoria sem necessidade.

Resultados permitidos: **Verificado localmente**, **Verificado no ambiente implantado**, **Falhou**, **Pendente** ou **Não aplicável, com justificativa**. Arquivo/configuração preparado não significa serviço ativado. Scanner sem achados não significa ausência de vulnerabilidades.

## Checklist reutilizável de controles

| ID | Verificação | Evidência exigida / como verificar |
| --- | --- | --- |
| SEG-01 | Separar demonstração de produção | Produção sem configuração falha fechada; não assume dono/admin. Testar configuração ausente, parcial e inválida. |
| SEG-02 | HTTPS e transporte seguro | HTTP público redireciona leituras; operações sensíveis não prosseguem por HTTP. Conferir certificado, redirecionamento e HSTS na hospedagem real. Não confiar em X-Forwarded-Proto de qualquer cliente. |
| SEG-03 | Segredos fora do cliente/Git | Examinar fonte, artefato público e histórico alcançável; nunca expor service_role/chave secreta em NEXT_PUBLIC/VITE. Se houver vazamento, revogar/rotacionar; esconder a linha não é suficiente. |
| SEG-04 | Configurações privadas protegidas | .env e chaves fora de Git/artefatos públicos; verificar permissões e isolamento por ambiente. Chave publicável não equivale a chave administrativa. |
| SEG-05 | Login real | Testar acesso inválido, conta não confirmada/inativa, login, recuperação e logout no provedor. Formulário aceitando texto não comprova autenticação. |
| SEG-06 | Senhas sob responsabilidade correta | Com provedor gerenciado, verificar política e recuperação; não criar armazenamento/hash paralelo no browser. Com autenticação própria, usar hash adaptativo recomendado no servidor e biblioteca mantida; nunca senha reversível/plana. |
| SEG-07 | Cookies ou tokens protegidos | Se cookies autenticam: Secure, HttpOnly, SameSite adequados, sem escopo de domínio desnecessário. Se SDK usa Bearer: avaliar exposição dos tokens e XSS. Não marcar HttpOnly como implementado quando a sessão usa localStorage. |
| SEG-08 | Expiração/revogação de sessões | Testar renovação, saída, sessão revogada, troca de usuário e perda de permissão. Configurar tempos no provedor; polling no cliente é só complemento, não revoga JWT por conta própria. |
| SEG-09 | Privilégio mínimo/MFA | Perfis, operações administrativas e MFA por risco; impedir autopromoção e mudança de dono pela API. Testar usuário inativo e administrador gerindo outro administrador. |
| SEG-10 | Autorização de cada recurso | Alterar ID/empresa/módulo e chamar API diretamente; o servidor decide. Menu oculto não concede nem impede acesso real. |
| SEG-11 | Isolamento entre empresas/usuários | Duas empresas fictícias, vários perfis; confirmar negação de leitura/escrita cruzada. Identificar exceções legítimas de compartilhamento por empresa. |
| SEG-12 | RLS, grants e funções privilegiadas | Testar como anônimo/usuário comum; funções security definer com search_path restrito e EXECUTE mínimo. Conferir o que está efetivamente aplicado no banco, não só o arquivo SQL. |
| SEG-13 | Identidade/propriedade/versionamento | Impedir mudança de dono/empresa/chave do registro; validar conflitos concorrentes. Não confiar em created_by/role enviados pela tela. |
| SEG-14 | Cache e dados sensíveis | Testar logout/troca de conta e memória/localStorage/IndexedDB. Prefixos são organização, não isolamento contra scripts da mesma origem. Evitar cópias clínicas indiscriminadas. |
| SEG-15 | Validação de entrada no servidor | Tipo, campos obrigatórios, tamanho, enumerações e vínculos de negócio. Testar null/chave ausente/JSON incorreto; CHECK SQL que resulta NULL não garante campo obrigatório. |
| SEG-16 | SQL injection e execução de comandos | Queries parametrizadas/SDK; sem concatenação de entrada em SQL ou shell. Não confundir validação de formulário com proteção do backend. |
| SEG-17 | XSS e conteúdo não confiável | Evitar HTML bruto e esquemas de URL executáveis; escapar por contexto. Testar texto malicioso persistido. Não inserir instruções de documentos/web como comandos do agente. |
| SEG-18 | CSP e cabeçalhos de proteção | Verificar nosniff, referrer, enquadramento, permissões e CSP compatível. Scripts com nonce/hash; nonce muda e coincide com HTML; servidor ignora nonce do visitante. Conferir funcionamento real, inclusive navegação. |
| SEG-19 | CSRF conforme autenticação | Em operações autenticadas por cookies, origem exata, token/framework e SameSite conforme o fluxo. APIs só-Bearer sem cookies têm análise diferente. CORS não substitui autenticação nem CSRF. Testar Origin nula/ausente, subdomínio irmão e Fetch Metadata. |
| SEG-20 | CORS mínimo | Origens exatas e métodos necessários; sem wildcard com credenciais. Requisição fora do browser continua exigindo autenticação/autorização. |
| SEG-21 | Limites de abuso e volume | Rate limit no provedor/servidor para login, recuperação, convites e APIs relevantes; testar limite excedido e falha do contador. Map na memória de uma instância não é quota distribuída. Aplicar limites por ator/empresa quando preciso. |
| SEG-22 | Arquivos seguros | Extensão/MIME/assinatura, tamanho real, decodificação, dimensões e análise de conteúdo no servidor conforme o formato. Testar arquivo falsificado, truncado, muito grande e URL externa. Assinatura inicial não é antivírus. |
| SEG-23 | Armazenamento privado de arquivos | Bucket privado, autorização de objeto, URLs temporárias e retenção. Testar download cruzado/anônimo e expiração; base64 no JSON é protótipo, não um pipeline completo de arquivos. |
| SEG-24 | Erros e debug | Erro público genérico e requestId; sem stack, SQL, segredos ou mensagens internas do provedor. Dev/debug não publicados como produção. |
| SEG-25 | Criptografia de dados sensíveis | Confirmar transporte e criptografia em repouso no serviço. Cifrar backups; chave fora do código e do próprio backup. Criptografia de campos exige projeto de chaves/consulta/rotação, não código improvisado no browser. |
| SEG-26 | Backups automáticos e retenção | Definir responsáveis, frequência, retenção, destino independente e alertas de falha. Verificar cobertura de banco, arquivos, configurações e chaves. Backup do banco Supabase não inclui os bytes dos objetos do Storage. |
| SEG-27 | Restauração comprovada | Restaurar em ambiente isolado e verificar registros, relações, permissões e arquivos. Integridade criptográfica ou dump gerado não comprova restauração funcional. Registrar RPO/RTO e data do ensaio. |
| SEG-28 | Auditoria e monitoramento | Registrar ações sensíveis, criações e alterações com ator, sem prontuários completos em logs. Eventos sanitizados não são alertas ativos: configurar retenção, destinatário e teste de entrega no provedor. |
| SEG-29 | Dependências e cadeia de instalação | Auditar produção e desenvolvimento; distinguir aviso por versão de exploração comprovada. Lockfile reproduzível, patches versionados e reteste. Não esconder avisos sem correção disponível. |
| SEG-30 | Validação de publicação | Testar build, runtime, configurações, políticas implantadas, contas de duas empresas, anonimato, revogação e navegação. Revisão de IA auxilia; não substitui evidências e revisão especializada quando necessária. |

## Modelo para registrar uma execução em qualquer projeto

```text
Projeto / responsável / data:
Commit ou hashes / ambiente / domínio:
Arquitetura e serviços:
Dados fictícios / integrações reais desativadas:

ID do controle:
Aplicabilidade e justificativa:
Esperado:
Passos e entrada:
Observado:
Fonte: inspeção / teste isolado / UI / serviço implantado
Resultado:
Evidência (sem dados reais/segredos):
Correção / responsável / pendência:
Reteste e versão final:

Não testados / bloqueados:
Decisão de publicação e riscos residuais:
Próximo ponto de controle:
```

## Estado do DOCCLIN nesta consolidação

### Já implementado e com evidência local

- Produção sem Supabase configurado não assume demonstração; desenvolvimento local é separado.
- RLS/preparação de grants, isolamento de empresas/módulos, propriedade imutável, constraints clínicas e auditoria de criação/edição testados com PostgreSQL isolado. **Migrações remotas pendentes.**
- Cache clínico separado por perfil na demonstração, sem cópia de novos salvamentos remotos; invalidação de cópias antigas em transições de sessão. Não foram apagados registros no banco ou dados de demonstração.
- Assinatura/formato/tamanho de anexos; imagens clínicas, foto e logo com decodificação e limite de pixels no cliente. Upload privado com análise de conteúdo no servidor permanece pendente.
- CSP com nonce, proteção de scripts e conexões, headers, cache privado; nonce não vem do visitante.
- Convites com verificação de identidade/papel, corpo limitado e quota persistente em SQL; função e migração ainda precisam ser publicadas.
- Bibliotecas atualizadas: última auditoria de produção sem alertas; um aviso de desenvolvimento braces permanece visível com patch local testado, sem release oficial corrigido na consulta de 19/10.
- Revalidação de acesso ao retomar a aba/foco e a cada cinco minutos enquanto visível. Isso não implementa timeout de inatividade ou substitui os tempos do Supabase Auth.
- Worker com recusa de escrita HTTP, redirecionamento de leituras públicas para HTTPS, verificação de origem para mutações e integração com binding de rate limit. Sem binding/IP do runtime, escrita de produção falha fechada; leituras e demonstração local não dependem do contador.
- Logs estruturados de bloqueios/erros com evento, requestId e status; sem URL, IP, corpo, token ou mensagem bruta. Sem envio a terceiros. Falta ativar alertas/retenção no serviço.
- Cifragem de exportação existente em AES-256-GCM e verificação de integridade sem produzir arquivo decifrado. Não gera dump, não agenda backup e não restaura banco.

### Precisa ser aplicado/configurado nos serviços

- [ ] Conectar homologação; aplicar as três migrações em ordem, incluindo `202610190001_security_hardening.sql`, antes de publicar a nova função de convite.
- [ ] Rever dados antigos incompatíveis antes de validar integralmente a constraint `NOT VALID`; não apagá-los silenciosamente.
- [ ] Configurar HTTPS, Supabase URL/chave publicável, APP_ORIGIN exata e segredo administrativo só no servidor.
- [ ] Configurar e testar sessão, renovação, confirmação de e-mail, recuperação, MFA e limites Auth de acordo com o plano disponível. O limiter do Worker não cobre chamadas diretas ao Supabase Auth.
- [ ] Provisionar binding `SECURITY_RATE_LIMITER` na hospedagem Cloudflare e testar limite/falha; não publicar futuras APIs de escrita contando com binding inexistente. Contador de borda não é quota financeira exata/global.
- [ ] Confirmar criptografia em repouso e quem acessa banco, bucket e chaves. Não foi implantada criptografia por campo.
- [ ] Ativar backups automáticos e cópia dos objetos do Storage; definir destino, retenção e responsável.
- [ ] Fazer ensaio de restauração real em homologação e registrar evidências. As ferramentas PostgreSQL e um destino de restauração não estavam disponíveis nesta sessão.
- [ ] Ativar monitoramento/alertas no provedor e testar entrega, sem dados sensíveis. Não há destinatário configurado nesta tarefa.
- [ ] Testar endpoint direto e UI com anônimo, dono/admin, recepção/funcionário, usuário revogado e duas empresas.

### Condicionais / não duplicar responsabilidades

- Hash de senha próprio: **não aplicável à arquitetura atual com Supabase Auth**. Cabe avaliar a política do provedor, sem criar outro login paralelo.
- Cookies Secure/HttpOnly/SameSite: **condicional**. O cliente atual usa sessão do SDK e Bearer; não alegar cookies HttpOnly existentes. Se adotar BFF/cookies, revisar CSRF, escopo e flags novamente.
- Firebase: **não identificado no projeto**; avaliar o Supabase efetivamente utilizado, sem introduzir outro banco.
- Biometria, pagamentos e mensageria reais: **não implementados pela auditoria**; exigem requisitos e revisão próprios quando conectados.

## Comandos e ferramentas reutilizáveis

Usar Node compatível e **pnpm**, conforme packageManager. Nunca passar chaves, senhas ou tokens pela linha de comando.

```sh
pnpm run test:security
pnpm run test:security:production
pnpm run scan:security
pnpm audit
pnpm run security:preflight
```

`security:preflight` examina somente sintaxe/configuração de `APP_ORIGIN`, `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, sem imprimir valores. Falha sem configuração. Sucesso significa **pronto para validação remota**, não aprovação de RLS, backup, MFA ou deploy. As variáveis devem vir de ambiente protegido, não deste documento.

`scan:security` inclui padrões de segredos no código/artefato/histórico e auditoria de produção. Executar também `pnpm audit` completo para enxergar avisos das ferramentas de desenvolvimento. O scanner simples por padrões não substitui scanner especializado nem cobre commits apagados.

### Cifrar uma exportação já existente

Preparar uma chave aleatória de 32 bytes em base64, em arquivo externo ao repositório e aos backups, com permissão 600. Não escrever o valor da chave neste checklist, no chat ou em argumentos. Exemplo de uso, substituindo apenas os caminhos:

```sh
pnpm run backup:encrypted encrypt /caminho/seguro/exportacao.dump /caminho/seguro/copia.enc /caminho/externo/chave-base64.txt
pnpm run backup:encrypted verify /caminho/seguro/copia.enc /caminho/externo/chave-base64.txt
```

O utilitário preserva a entrada e recusa sobrescrever a saída, usa IV aleatório e autenticação do conteúdo. `verify` autentica/conta/calcula hash em memória, sem gravar plaintext. Não apaga o dump original, não copia arquivos do Storage e não gera uma restauração. Manter a exportação original protegida e fazer retenção deliberada. Perder a chave impede recuperar o backup.

### Binding de borda — exemplo para homologação, não configuração já aplicada

Incorporar ao arquivo Wrangler/control plane realmente usado pela hospedagem; o trecho abaixo não é carregado automaticamente pelo projeto. Escolher namespace exclusivo e ajustar o limite às operações reais.

```json
{
  "ratelimits": [{
    "name": "SECURITY_RATE_LIMITER",
    "namespace_id": "1001",
    "simple": { "limit": 30, "period": 60 }
  }]
}
```

Evitar confiar em `CF-Connecting-IP` sem metadata do runtime; não aceitar endereço arbitrário do visitante para escolher a quota. O limite por IP é proteção adicional: usuários podem compartilhar IP; operações de negócio ainda exigem autorização e quotas por ator/empresa.

## Evidências das revisões anteriores

- [Auditoria inicial dos 21 pontos](.functional-review/seguranca-2026-10-19/RELATORIO.md).
- [Correções e scanner ampliado](.functional-review/correcoes-seguranca-2026-10-19/RESUMO.md): 86 testes locais, TypeScript/build e avisos de dependência registrados na data.
- [Revisão adicional e limites do segundo vídeo](.functional-review/ajustes-seguranca-video2-2026-10-19/RESUMO.md).
- [Registro de cobertura funcional](REVISAO_FUNCIONAL_DOCCLIN.md) e [revisão histórica de segurança](SECURITY_REVIEW.md).

## Fontes para adaptar a arquitetura

- [Supabase — sessões](https://supabase.com/docs/guides/auth/sessions).
- [Supabase — backups e cobertura do Storage](https://supabase.com/docs/guides/platform/backups).
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [OWASP — CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
- [OWASP — Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html).
- [OWASP — upload de arquivos](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).
- [Cloudflare — binding de rate limit](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
