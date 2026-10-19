# Revisão funcional do DOCCLIN

## Campos da confirmação da Agenda e comparação de planos — 19/10/2026

Revisor funcional com configuração explícita: **12/12 contratos isolados passaram** nos novos campos Particular/Plano, responsável confirmado, terceiros, limpeza de valores ocultos e hidratação local; comparação de planos só navega pelo callback. Regressões existentes 42/42 passaram. Relatórios e TAP em `.visual-review/ajustes-anotados-2026-10-19/`. Abertura de tela, cliques reais, persistência no navegador, destino por evento e integrações não foram verificados. A revisão concluída usa o mecanismo local preexistente da Agenda; limitações anteriores não são aprovadas por estes testes. Demais cobertura e bloqueios históricos permanecem abaixo.


## Ajustes do segundo vídeo e checklist — 19/10/2026

Usuário autorizou implementar os controles pertinentes e consolidar as duas auditorias num arquivo reutilizável. Entregue CHECKLIST_DE_SEGURANCA.md. Adicionados HTTPS/CSRF/rate binding/logs sanitizados no Worker, revalidação de acesso, cifragem/verificação de exportações e preflight de configuração. Revisor funcional delegado executou 13 contratos independentes; retorno de erro bruto de imagens encontrado, corrigido e retestado. Suite final: 109/109 passou; TypeScript/build concluídos. Sem alterações de design.

Relatório: `.functional-review/ajustes-seguranca-video2-2026-10-19/RESUMO.md`. Mantidos bloqueados/não testados: implantação Supabase/Cloudflare, sessões e limites do provedor, backups automáticos/restauração real, alertas e UI. Preflight de configuração recusou o estado atual sem variáveis; não foi convertido em aprovação. Nenhum dado real ou serviço externo alterado.

## Correções de segurança e reteste ampliado — 19/10/2026

Autorização: corrigir os achados e ampliar o scanner. Fase de correção separada da auditoria anterior; revisor funcional voltou somente para reteste dos arquivos finais, sem modificar aplicação. Resultado: 86/86 testes isolados/contratos/SQL e Worker compilado passaram; TypeScript e build sem erros. Fonte detalhada: `.functional-review/correcoes-seguranca-2026-10-19/RESUMO.md`.

Dependências de produção: 9→0 alertas; varredura completa: 17→1, residual de desenvolvimento braces sem release corrigido e com patch local de profundidade reproduzível/testado. Scanner de segredos fonte/cliente/histórico sem candidatos nos padrões examinados. Nova migration e função de convite testadas localmente, NÃO implantadas. Pendentes: Supabase remoto, configurações Auth/abuso/MFA, dados legados da constraint NOT VALID, pipeline completo de arquivos e UI. Nenhum resultado histórico da interface foi promovido a aprovado.

## Auditoria de segurança solicitada — 19/10/2026

Analisados os 21 pontos do vídeo: código, configurações, Git/dependências e execuções locais isoladas. Revisor funcional delegado acionado para autorização, SQL e convite, sem alterar o app. Seis testes existentes passaram; três reproduções adicionais confirmaram problemas/limitação no cache clínico e CSP; PGlite confirmou CHECK clínico aceitando identificação ausente/nula. Auditoria pnpm: 17 apontamentos gerais, 9 em produção; severidade do pacote não comprova exploração no runtime Vinext.

Relatório: `.functional-review/seguranca-2026-10-19/RELATORIO.md`, com matriz dos 21 pontos, prioridades e evidências. Produção, login real, permissões efetivamente implantadas, limites de tentativas e testes pela interface permanecem não verificados. Nenhum resultado histórico da UI foi promovido a aprovado nem checkpoint visual alterado. Nenhuma correção de aplicação executada nesta auditoria.

## Correções autorizadas e reteste isolado — 18/10/2026

Após o baseline em snapshot separado, o usuário autorizou corrigir os erros e usar testes isolados, sem navegador. **57/57 testes finais passaram**, além de30/30e25/25 nos cenários históricos de domínio; TypeScript e build passaram. Escopo, correções e limites estão em `.functional-review/correcoes-2026-10-18/RESUMO.md`, com evidências e hashes. A expectativa antiga INV08 não observava a discriminação por pessoa; o contrato atual de orçamento total foi testado separadamente, sem modificar o histórico para esconder resultados.

As falhas de código descritas nesse resumo foram corrigidas e retestadas por contrato isolado; a aparência e os fluxos UI ainda não foram retestados. **Auditoria integral permanece incompleta pelo bloqueio da ferramenta de navegador.** As873verificações anteriores não foram reclassificadas como aprovadas nem aumentadas por testes de código. Checkpoint visual preservado.

## Retomada das pendências — 18/10/2026

Inspeção complementar registrada em `.functional-review/retomada-coordenacao-2026-10-18.md`. O relatório preserva, por controle, o caminho encontrado no código e o teste UI que ainda precisa ser executado.

O usuário esclareceu que deseja concluir a análise restante, e não encerrá-la parcial. Confirmou também que **a permissão efetiva do navegador ainda não foi alterada**. A recusa anterior continua sendo o impedimento para executar controles na interface; não foi repetida nem contornada. A janela de impressão já foi fechada e não é mais o bloqueio operacional.

Foi retomada a inspeção estática das pendências pelo Revisor Funcional, executado por delegação com leitura explícita da configuração `.codex/agents/revisor-funcional-docclin.toml`. Fonte separada dos testes UI; nenhum teste novo aprovado por inspeção. O `page.tsx` mantém SHA256 `1dc5f73c3fc9635bb586bfdb123a2073eb29abbba32f81972ce1f4c1e32d9c9c`. As 873 verificações UI e seus resultados permanecem inalterados.

## Retomada após fechamento da impressão — 17/10/2026

Atualização: o usuário informou que autorizou a origem. A tentativa seguinte continuou rejeitada, agora com indicação explícita de permissão salva ou política gerenciada que nega acesso. A autorização informada não foi refletida na permissão efetiva da ferramenta. Nenhum novo teste foi contabilizado; não houve tentativa de contornar o bloqueio.

O usuário confirmou que fechou a janela de impressão. A primeira tentativa de observar a aba de auditoria foi rejeitada explicitamente pela política de segurança do navegador: a origem `http://127.0.0.1:3001` consta com autorização recusada. Nenhum conteúdo de página foi observado nessa tentativa; nenhum controle foi testado e nenhuma nova aprovação funcional foi registrada. Não houve nova navegação nem tentativa de contornar a recusa. Foi solicitado ao usuário autorizar a origem de teste antes da continuação da UI.

As873verificações anteriores permanecem com seus estados. A auditoria integral continua incompleta; o bloqueio operacional atual é autorização da origem, e não a janela de impressão já fechada. Código e design não foram alterados.

## Continuação executada — 17/10/2026

**Estado: auditoria integral ainda não concluída.** A execução avançou e registrou falhas reais; nenhum caso pendente foi aprovado por inspeção. O pedido de testar todas as funcionalidades permanece aberto. A impressão bloqueou a interação com a prévia e foi solicitado ao usuário fechar a janela; acesso ao aplicativo nativo para conferir o diálogo foi negado pelo controle de segurança.

### Evidências e contagens atuais

- **873 verificações UI registradas**, não funções únicas:554históricas +189em `continuacao-ui.json` +130em `campanhas-ui.json`. Fonte de cada resultado preservada. Total agregado:831Passou,26Falhou,2Com divergência,10Não testado integralmente,4Bloqueado. Os quatro bloqueios do JSON da continuação incluem serviços externos, localização/aparelho, prompt da prévia e impressão; não equivalem a quatro defeitos do app.
- **66cenários adicionais de domínio**:30anteriores(21/9),25novos(20/5),11Investimentos(5/6);46passaram/20falharam. São funções reais extraídas/transpiladas, com cache e DB simulados quando indicados. Não foram convertidos em testes UI.
- As34asserções das cinco suítes existentes foram repetidas:33passaram,1falhou na asserção de quota já identificada. Reexecução não aumenta cobertura nem mascara falha.
- Modelo de efeitos em `transicao-modulos.md` comprovou duplicação persistida do Catálogo. É simulação do código original, sem React DOM; não provou persistência cruzada em Documentos.
- Código do app não foi alterado nesta continuação. `page.tsx` permaneceu SHA256 `1dc5f73c3fc9635bb586bfdb123a2073eb29abbba32f81972ce1f4c1e32d9c9c`. Dados de teste exclusivamente fictícios na origem3001; origem3000 não recebeu gravações.

### Novas falhas relevantes

1. **Precificação:** Salvar exibe sucesso, mas sair e voltar zera os dados. Alterar depois de salvar mantém o rótulo de salvo. Catálogo recebe nome/tipo/preço, mas perde custo, unidade, margem e tributos preenchidos.
2. **Catálogo:** ao retornar, serviços precificados são concatenados novamente à base e persistidos com IDs duplicados. UI mostrou quatro cópias do serviço fictício; modelo do efeito original comprova crescimento a cada montagem.
3. **Tarefas/Projetos:** conjunto criado com tarefa, comentário e anexo desaparece ao sair e voltar. Parâmetros de responsável obrigatório e alertas voltam ligados ao reabrir, apesar de salvar desligados. Responsável apagado não bloqueia criação e viraMariana.
4. **Documentos:** Arquivo/Cliente/Venda-serviço preenchidos reabrem vazios. Prévia genérica omite a descrição. Durante transição do Catálogo surgiram cards de serviços junto ao documento; alternar lista/grade deixou somente o documento. Não atribuir esse quadro a contaminação persistida sem evidência adicional.
5. **Colaboradores:** nova pessoa recebe cargo, ingresso e nascimento fictícios não cadastrados. CRM, Propostas e Ordens mostram responsávelMariana/Não informado ou valor120 no campo de responsável, divergindo do cadastro.
6. **Configurações:** Resumo por e-mail e Vendas integradas compartilham estado; alternar um muda o outro. Preferência original restaurada na origem de teste.
7. **Investimentos:** juros0 projeta220 corretamente para100iniciais+10×12, mas indica aporte0 para meta36000; esperado2991,67. Campos pessoas/reserva/extras/giro são inertes nas fórmulas extraídas. A regra exata de incorporação é decisão de produto para correção.
8. **Pacientes:** CPF/CNPJ tem asterisco no rótulo, mas salvar somente com nome foi permitido e ficha mostraNão informado.
9. **Propostas:** uma propostaAtivo eleva Aprovadas/Conversão para1 sem aprovação/conversão correspondente.
10. Domínio também identificou datas31/02 aceitas e normalizadas em lembretes; parcelas fracionárias perdem centavos; desconto100% apaga custo do resultado. Alcance de entradas inválidas pela UI está separado e não foi presumido.

### Fluxos que avançaram com resultado observável

Compras salvou preços100/80 e produtoB10,50; rejeitou negativo, preservou histórico, acompanhamento e dados após recarga. Precificação completa considerou16controles e calculou31,69; excluir impostos/taxas produziu29,43/27,47 conforme os valores informados.

Mensagens testou9etapas,6situações,3atalhos de data,11filtros de jornada, envio simulado local e destino do acompanhamento no CRM. CRM moveu lead pelas etapas atéConvertido, atualizou conversão100%, conservou etapa ao sair/voltar e testou renomear/cancelar/salvar etapas. Treze campanhas tiveram130verificações de habilitação/prazo/público/prévia; estados iniciais restaurados, nenhum envio real.

ROC:6camadas,2modelos,5vistas, limites de rotação, marcação com observação, procedimentos manual e deCatálogo, quantidade/orçamento, vínculo previsto de material, desfazer/refazer e persistência ao reabrir. Isso não valida anatomia nem todos os gestos de desenho. RX incluiu PNG fictício, ampliou/fechou e preservou imagem/descrição/etapa ao reabrir.

Documentos clínicos prepararam atestado/receita fictícios emRascunho e contratoPendente com a identificação salva e paciente correto. Sem assinatura, emissão ou compartilhamento externo. Observação de paciente persistiu ao reabrir. Ponto preservou edição, tutorial, centro manual público e raio200; mapa carregou25tiles e zoom16→17→16. Nenhuma localização pessoal foi acessada.

### Bloqueio atual e trabalho restante

A ação Imprimir foi acionada na prévia de Documentos. Depois, comandos da página passaram a expirar, apesar de a árvore ainda apresentar a página. A tentativa de inspecionar o diálogo no aplicativoCodex foi negada por segurança; não houve tentativa de contornar a restrição. Foi solicitado fechar a janela de impressão para retomar a UI. Não afirmar que PDF ou impressão foram validados.

`cobertura-pendente.md` mantém a fila compacta por fluxo. Ainda há controles locais sem teste, incluindo ações restantes de Projetos/Tarefas, salvamento completo do negócio, partes dos documentos clínicos, edição de acessos demo, link de segurança, aplicação financeira das configurações e tipo de Investimentos. Impressão, prompts, integração real e dispositivo têm limites próprios. **Esta entrega de evidências não encerra o pedido integral nem significa que o app está funcionando corretamente.**

## Auditoria ampliada solicitada — 16/10/2026

Usuário pediu todas as opções, do simples ao complexo, após os ajustes de Início/Relatórios. Configuração executada por delegação explícita; coordenador realizou testes UI. **Auditoria ainda incompleta: não é possível declarar todas as funcionalidades testadas ou funcionando.** As pendências não são omitidas nem transformadas em aprovações.

Artefatos atuais:

- `.functional-review/inventario-completo.md`: inventário estático de55TSX, com2346 registros de controles/eventos/variantes,142opções de módulos e135fontes dinâmicas a expandir. Não representa2346funções únicas nem testes UI. Em page.tsx,115registros não têm ligação estática com o fluxo atual; os outros617 incluem caminhos condicionais/helpers. Componentes de laboratório não são automaticamente funções ativas do app.
- `.functional-review/ui-executados-2026-10-16.md` e JSON correspondente: resultado individual das verificações UI desta ampliação; resumo em `ui-resumo.json`. Inclui opções Sim/Não, campos, dentições, exame intraoral, pagamento, parcelas, navegação financeira, configurações, automações e fluxos entre módulos. Não somar como controles únicos: algumas verificações testam persistência ou repetem o mesmo controle em outro estado.
- `.functional-review/dominio.md` e `verificacao-dominio.mjs`:30cenários isolados em funções reais,21passaram e9falharam. Fonte transpilada em memória com armazenamento simulado; sem alteração de cache do usuário. O teste original de quota continua identificado como asserção incorreta, sem correção artificial para obter aprovação.
- Os34testes existentes da execução inicial permanecem registrados abaixo:33passaram e1falhou. Não confundir essa suíte com os30cenários adicionais.

### Falhas prioritárias e confirmações

1. Venda250 foi cadastrada, localizada e liquidada no Financeiro pela UI. Editar somente o nome fez a mesma parcela voltar a Pendente, sem data de liquidação. Confirma DOM-04 na UI.
2. Campo Status da venda aceita Cancelado e a lista mostra Cancelado, mas recebível250 continua Pendente no Financeiro. Confirma DOM-05 na UI; o valor de status está disponível pelo campo textual.
3. Agenda: responsável fictício preenchido, mas evento salvo mostra Marina Costa. Clique em Adicionar videoconferência não produziu controle/diálogo; ausência de handler confirmada estaticamente. Local/observação/etiqueta preenchidos não entram no payload por inspeção; não foi comprovada reabertura desses campos pela UI.
4. Estoque: produto fictício quantidade3, preço10 resulta corretamente em valor30. Salvar/reabrir mínimo5 funciona, mas Estoque crítico permanece0. Domínio confirma que o limite configurado é ignorado.
5. Filtro Status do Estoque oferece somenteTodos apesar de registroAtivo. Extração real lê último campo(Validade). Testes isolados confirmam deslocamento também em registros novos de Venda, Manutenção e Catálogo; Período do Estoque lê Quantidade.
6. Ordenação Menor valor em Fornecedores mantém60primeiro/10último. Código implementa apenas A–Z/Z–A; outros rótulos não têm comparador próprio. O teste com datas iguais não aprova ordenação temporal.
7. Estornar recebível clínico mostrouCancelado, e nova montagem posterior mostrouPendente novamente. Registrar divergência de estado/contrato; não afirmar estorno correto com base apenas no clique.
8. Persistem os achados da execução inicial: tarefa desaparece ao sair/voltar; Cancelar edição de detalhe grava override; lista/detalhe divergem em responsável/status. Nenhuma correção funcional realizada nesta auditoria.

### Fluxo completo fictício que passou nas condições executadas

Agenda→prontuário preservou a identidade fictícia. Anamnese:96opções Sim/Não selecionaram corretamente;22campos e48respostas finais permaneceram após salvar e alternar abas. Seleção de64controles adultos e40infantis e77opções/expansões intraorais respondeu; salvar exibiu rascunho. Isso não valida fidelidade clínica/anatômica nem todos os conteúdos persistidos do odontograma.

Pagamento clínico:500com desconto10%=450; sete formas selecionadas e24parcelamentos conferidos; paciente24x/recebimento à vista resultou em uma entrada; taxa2%=9, líquido441; comissão10%=45. Sem beneficiário, revisão bloqueou com alerta. Com beneficiário fictício, revisão e finalização geraram recebível450 e comissão45 nos módulos corretos. Baixa/reabertura de comissão respondeu. São lançamentos demonstrativos locais, sem transferência real.

Automações: cinco regras×13prazos e dois estados totalizam75verificações; textos fictícios persistiram entre Configurações e Mensagens. Todas terminaram pausadas, prazos originais restaurados. Envio real não testado porque não está conectado. Aparência: seis cores responderam, tamanho100→105→100, claro→escuro→claro, Azul padrão restaurado na origem de teste.

### Limites e continuação obrigatória

Ainda restam ações e estados do inventário sem execução UI, inclusive fontes dinâmicas por dados/permissões, todos os fluxos de imagens/documentos, ROC/RX, CRM, projetos, compras, precificação, ponto, colaboradores e variações dos formulários. Listar presença de tela não os aprova. A matriz estática fornece o inventário a retomar; sua conciliação com os casos UI continua necessária para uma cobertura completa.

Campos de data nativos: preenchimento automatizado mostrou valor DOM, mas não houve confirmação de mudança React/persistência. Não atribuir automaticamente a falha ao app; retestar pela interface nativa com evidência adequada. Uploads, impressão/diálogos nativos, dispositivos/localização e cenários de permissões precisam de casos próprios. Autenticação real, integrações, pagamentos e mensagens externos dependem de ambiente/contas de teste; não foram acionados.

As origens3001/3002 foram iniciadas com Supabase desativado e dados fictícios. Origem3000 não recebeu gravações de teste. Nenhum defeito foi corrigido ou dado real excluído para fazer a auditoria passar.

## Escopo e critérios

Pedido: após concluir a configuração de design, criar agente que percorra telas e funções, verifique comportamento e destino das informações. Configuração: `.codex/agents/revisor-funcional-docclin.toml`, seguindo o formato da documentação oficial: https://learn.chatgpt.com/docs/agent-configuration/subagents .

Este registro separa configuração do agente de conclusão da auditoria. Estados: **Passou**, **Falhou**, **Bloqueado**, **Não testado**. Cada evidência identifica UI, teste automatizado ou inspeção. Navegação não aprova funções; mock não comprova integração real.

## Execução inicial — 16/10/2026

Estado local: diversos arquivos modificados e não versionados preexistentes. Nenhuma falha é atribuída à configuração sem reprodução. Auditoria não autoriza corrigir código nem alterar design. Usar origem local separada e integrações reais desativadas para escritas fictícias; sem isolamento confirmado, somente leitura.

| Área | Evidência disponível | Estado funcional |
| --- | --- | --- |
| Início, Assistente, Agenda | Telas abertas na revisão visual anterior | Não testado |
| Tarefas | Validação e criação pela UI; registro desaparece ao sair/voltar | Falhou (persistência) |
| Consultas, Pacientes, Mensagens, CRM | Telas abertas na revisão visual anterior | Não testado |
| Propostas, Vendas, Catálogo | Telas abertas na revisão visual anterior | Não testado |
| Estoque, Documentos, Ordens de Serviço | Telas abertas na revisão visual anterior | Não testado |
| Manutenção | Cadastro, busca e recarga; cancelamento do detalhe grava e grade diverge da lista | Falhou (casos abaixo) |
| Compras, Fornecedores | Telas abertas na revisão visual anterior | Não testado |
| Financeiro, Precificação, Relatórios | Telas abertas na revisão visual anterior | Não testado |
| Ponto, Colaboradores | Telas abertas na revisão visual anterior | Não testado |
| Investimentos, Primeiros passos, Configurações | Telas abertas na revisão visual anterior | Não testado |
| Autenticação e serviços externos reais | Exigem ambiente/contas e integrações de teste | Bloqueado |

Os grupos serão desdobrados em ações verificáveis durante a execução; esta tabela não é uma lista completa de todas as funções.

## Registro de casos

Para cada caso: identificador, área/ação, precondição e dados fictícios, passos, esperado, observado, destino/persistência, estado, tipo e localização da evidência. Falhas incluem reprodução; bloqueios indicam requisito ausente. O relatório final mantém contagens de cobertura e pendências, sem aprovação global com itens não testados.

### Ambiente e execução do agente

Criado servidor separado em `http://127.0.0.1:3001/inicio` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` vazios, selecionando modo demonstrativo local conforme `lib/supabase/client.ts`. Origem distinta da prévia do usuário na porta 3000. Nenhuma mensagem real, compra ou pagamento executado. Cadastro fictício permanece somente nessa origem de teste, sem limpeza de dados existentes.

TOML validado com tomllib. Revisor funcional executado como subagente real com leitura explícita da configuração; carregamento automático do papel recém-criado não comprovado nesta sessão. Delegado fez inspeção de código e dos resultados dos testes, sem navegador nem alterações. Coordenador executou os casos UI abaixo. Evidências DOM emitidas na conversa; sem captura arquivada em disco. Resultado da auditoria inicial: **incompleta, com falhas confirmadas**, sem aprovação global.

### Casos UI executados pelo coordenador

| Caso | Passos e esperado | Observado | Resultado |
| --- | --- | --- | --- |
| UI-01 Tarefa obrigatória | Adicionar tarefa; salvar título vazio. Deve impedir cadastro. | Mensagem nativa “Preencha este campo”; formulário permanece. | Passou |
| UI-02 Criar tarefa | Título `AUDITORIA DOCCLIN — tarefa fictícia 16-10`, descrição fictícia; salvar. Deve entrar em Entrada. | Cartão aparece, contador 1 e “Tarefa criada com sucesso”. | Passou (criação imediata) |
| UI-03 Persistir tarefa | Após UI-02, abrir Início e voltar a Tarefas. Deve conservar cartão. | Cartão desaparece e contadores retornam a 0. | **Falhou** |
| UI-04 Validar equipamento | Novo equipamento; preencher nome/tipo/responsável/valor, deixar descrição vazia e salvar. | Campo Descrição bloqueia envio com “Preencha este campo”. | Passou (comportamento observado; obrigatoriedade de descrição não aprovada pelo usuário) |
| UI-05 Cadastro e recarga | Salvar `AUDITORIA — equipamento fictício`, tipo Teste local, responsável Auditoria, valor 10 e descrição fictícia; recarregar e abrir Manutenção. | Lista mantém registro; indicadores atualizam para 1 e R$10,00. | Passou (persistência do cadastro) |
| UI-06 Cancelar detalhe | Abrir detalhes → Editar equipamento → nome `AUDITORIA — alteração CANCELADA` → Cancelar. Deve descartar alteração. | Detalhe mostra nome alterado; permanece ao reabrir após recarga. Título e lista continuam originais. | **Falhou** |
| UI-07 Responsável no detalhe | No registro UI-05, conferir responsável cadastrado Auditoria. | Indicador mostra Mariana e seção Equipamento mostra Não informado. | **Falhou** (destino inconsistente) |
| UI-08 Buscar e limpar | Buscar `INEXISTENTE-AUDITORIA`; limpar busca. | 0 registros na busca; registro retorna após limpar. | Passou |
| UI-09 Lista/grade | Alternar para grade no mesmo registro, comparar status Ativo da lista. | Grade mostra Status 0; lista mostrava Ativo. | **Falhou** (representação do dado) |

São nove casos, cinco passaram e quatro falharam. Resultados limitados às condições e dados indicados; não equivalem a nove módulos completos. UI-05 foi confirmado após recarga, e UI-06 foi confirmado novamente após recarga/reabertura.

### Fontes e reprodução técnica

- UI-03: `WorkflowKanban`, `app/inicio/page.tsx`, define `taskCards`/`workflowProjects` vazios e efeito em `[view]` faz `setCards(taskCards)` e `setProjects(workflowProjects)`, substituindo estado persistido ao montar. Projetos têm a mesma causa candidata, mas não foram criados pela UI nesta execução.
- UI-06: `FullDetailView` liga campos diretamente ao estado persistido de `gest-record-details-*`; Cancelar somente fecha. Overrides não atualizam a coleção `gest-module-*`, explicando a diferença observada entre detalhe e lista.
- UI-07 e UI-09: valores observados pela UI; exigir correção e reteste direcionados antes de marcar resolvido. Nenhuma correção funcional realizada nesta auditoria.

### Testes automatizados existentes

Executados `finance-data`, `clinical-workflows`, `clinical-payment`, `message-automations` e `security` com Node do runtime local: **34 testes, 33 passaram e 1 falhou**. Saída completa em `.functional-review/tests-2026-10-16.txt`.

Os aprovados cobrem cálculos financeiros, parcelamento, sincronização clínica simulada, lembretes, isolamento e migração em PGlite. Não comprovam UI completa nem serviços reais.

A falha `a full browser cache keeps the newest change in session and warns the user`, em `tests/security.test.mjs`, espera um evento total, mas `lib/local-store.ts` emite dois tipos (`gest-storage-warning` e `gest-data-changed`). O valor mais recente é preservado no teste. Classificação: **falha da asserção de contagem**, sem evidência de dois avisos ou perda do valor nesse cenário. Teste não foi modificado para obter aprovação artificial.

### Candidatos por inspeção, ainda sem reprodução UI

| Caso pendente | Evidência estática | Próxima verificação |
| --- | --- | --- |
| Projetos perdem dados ao voltar | Mesmo efeito de Tarefas em WorkflowKanban | Criar projeto fictício e voltar ao módulo |
| Excluir em detalhe sem ação | Botão de FullDetailView sem onClick | Verificar disponibilidade e ausência de efeito, sem excluir dados existentes |
| Venda editada perde baixas | `registerModuleSale`, lib/operational-data.ts, reconstrói parcelas sem preservar baixas existentes | Criar venda, liquidar parcela fictícia, editar e comparar |
| Venda cancelada não cancela Financeiro | Conversão ignora status row[5] | Cancelar venda fictícia e conferir compromissos |
| Mensagens somente locais | sendMessage grava histórico local | Separar teste de conversa simulada e integração real bloqueada |

### Inventário para continuação da auditoria geral

Manter cada ação abaixo como **Não testado** até haver caso executado; itens UI acima têm precedência apenas no escopo descrito.

- Início: destinos dos atalhos, indicadores, filtros da timeline, personalização e persistência.
- Agenda/Consultas/Pacientes: agendar, editar, cancelar, identidade do paciente, atendimento, rascunho, finalização e retorno à origem.
- Tarefas/CRM: projetos, etapas, arrastar, comentários/anexos, edição, filtros e persistência.
- Mensagens: contatos, filtros, histórico, anexos/documentos e campanhas; envio externo bloqueado sem integração de teste.
- Propostas/Vendas/Catálogo: criar, editar, buscar, filtrar, paginar e vínculos comerciais/financeiros/estoque.
- Estoque/Manutenção/Fornecedores/OS: formulários, detalhes, cancelamento, alertas, filtros e persistência.
- Documentos: criar, editar, ordenar, anexos, lista/cards e persistência.
- Compras: cotações, produtos, acompanhamento, período, histórico e destinos dos links; link externo não prova compra nem consulta de preço automática.
- Financeiro/Precificação/Relatórios: lançamentos, parcelas, baixas/estornos/cancelamento, caixa/competência, bancos, taxas, Catálogo e relatórios derivados.
- Ponto/Colaboradores: cadastro, jornada, aparelhos, entrada/saída, localização e persistência; permissões de dispositivo dependem de teste específico.
- Assistente/Investimentos/Primeiros passos: ações, destinos, simulações e tutoriais.
- Configurações: Negócio, Documentos clínicos, Automações, Aparência, Conta, Usuários e acessos, Plano, Segurança, Integrações e Dados. Autenticação real e serviços externos permanecem bloqueados sem ambiente/contas de teste próprios.
