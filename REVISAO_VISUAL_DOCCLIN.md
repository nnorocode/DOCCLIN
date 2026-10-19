# Revisão visual do DOCCLIN

## Compras — cotações e identificação dos marketplaces — 19/10/2026

Pedido: organizar fornecedor/data/valor abaixo do gráfico e tornar marketplaces visuais com logos. Agora cotações são cards e os quatro marketplaces mantêm os links em tiles com ícones locais obtidos dos próprios sites. Histórico/dados/gráfico preservados; só a listagem visual usa recentes primeiro. Grade considera largura do painel e viewport; cores por tokens nos dois temas. Revisor incremental sem achado estático confirmado. TypeScript/build conferidos; **validação visual incompleta**, sem navegador/medidas ou captura posterior. Evidências e baseline em `.visual-review/compras-cotacoes-2026-10-19/`; fontes dos ícones em `public/brand/marketplaces/README.md`. Demais pendências anteriores preservadas.

## Tema noturno global — todas as famílias — 19/10/2026

Usuário relata que a cobertura anterior ainda era incompleta e exige todas as abas. Ampliadas receitas compartilhadas de controles, botões de linhas sem classe, modais, abas, seleção, ranking e NotificationCenter; corrigida a especificidade de ajuda/sino. Matriz global de cobertura **de fonte** e evidências em `.visual-review/noturno-global-2026-10-19/`. Build e onze contratos de paleta/escopo passaram. Revisor apontou três exceções, corrigidas: diálogo de etapas, chips de investimento e variante destrutiva de rodapé. Não houve inspeção visual: origem segue bloqueada. Todas as famílias continuam com **verificação visual incompleta** até conferência real, sem apagar pendências históricas. Checkpoint registra estado técnico, não aprovação.

## Modo noturno — prints de Pacientes e Mensagens — 19/10/2026

Os prints enviados pelo usuário confirmaram que a entrega anterior deixou fundos claros em cabeçalhos de tabelas, ações e indicação e fundos quadrados nos wrappers dos filtros. Corrigidas essas regras compartilhadas e os estados/contadores de filtros de Mensagens, sem alterar layout, conteúdo ou medidas. Evidência anterior, baseline, patch e relatório em `.visual-review/noturno-prints-2026-10-19/`. Build e diff-check passaram; revisor incremental acionado. **Conferência visual posterior continua incompleta**: os prints são anteriores e a origem permanece bloqueada. Preservar pendências e não promover nenhuma área a aprovação visual.

## Retorno sobre o modo noturno — 19/10/2026

Usuário informa que segue igual: **modo noturno não concluído/validado globalmente**. Correção adicional de portais fora de main, propagação e limpeza do atributo do tema no documento e importação do CSS no layout raiz; controles secundários Financeiro/Documentos tratados. TypeScript/build e dois contratos isolados passaram. Evidências e limites em `.visual-review/correcao-noturno-2026-10-19/`. Acesso à aba foi retentado e negado por política. Não há prova visual das correções ou das demais telas: manter todas as pendências visuais anteriores.

## Sete ajustes anotados e modo escuro — 19/10/2026

Implementados os pedidos autorizados para Agenda, Consultas, CRM, Compras, etapas numeradas, Configurações → Plano e tema escuro operacional. Escopo e comparação com estado anterior em `.visual-review/ajustes-anotados-2026-10-19/RESUMO.md`, `before/` e `alteracoes.patch`; alterações Git preexistentes não pertencem automaticamente a esta tarefa. DESIGN_SYSTEM.md atualizado com os padrões explícitos e exceção de separação de Consultas.

Revisor visual acionado pela configuração explícita e rechecado após correções; nenhum achado estático aberto. TypeScript/build e 54 contratos isolados passaram, `git diff --check` limpo. **Verificação visual incompleta em todas as sete áreas**: sem acesso à origem bloqueada, sem capturas, medidas, viewport/zoom ou teste amplo/estreito. Nenhuma tela foi aprovada; revisão geral de modo escuro permanece pendente no navegador. Relatório do revisor em `revisor.md` na pasta da tarefa. Checkpoint capturado somente como estado técnico após consolidar evidências, sem alterar aprovação e mantendo pendências históricas.

## Fontes dos quatro insights de Início — 19/10/2026

Pedido: aumentar discretamente as fontes dos quatro cards abaixo de “O que eu faria agora”. Mudança desta tarefa somente no bloco `.gest-redesign .home-insight-grid` de `module-design-system.css` e no padrão documentado: título 17→18 px, resumo 12→13 px, ação 11→12 px, classificação 8→9 px. Família, peso, cores, intervalos, preenchimento e altura mínima declarada preservados; resumo continua limitado a três linhas. Demais diferenças dos 23 arquivos indicados pelo checkpoint são anteriores e não pertencem a esta tarefa.

Revisor `revisor_visual_docclin` acionado: revisão estática incremental sem bug concreto; seletores específicos do Início e precedência sobre as regras legadas conferidos, incluindo o `!important` preexistente do resumo. `git diff --check` passou. Verificação visual incompleta: navegador da origem continua bloqueado conforme histórico; não houve medida real ou conferência de novas quebras/cortes. Checkpoint visual não atualizado como aprovação; pendências anteriores preservadas.

## Largura de Início — 19/10/2026

Pedido: igualar as margens laterais de Início às outras abas. Antes desta tarefa, `.gest-ai-home` tinha limite legado de 1360 px e margens automáticas dentro do contêiner compartilhado. Alteração limitada a `max-width:none` e `margin-inline:0` no seletor `.gest-redesign .gest-ai-home`, em `module-design-system.css`, e registro da regra no DESIGN_SYSTEM.md. O preenchimento responsivo de `.v2-page` permanece responsável pelo recuo. Nenhuma alteração nos demais arquivos preexistentes pertence a esta tarefa.

Revisor `revisor_visual_docclin` acionado: conferência estática incremental sem bug concreto; especificidade supera as regras legadas, com um consumidor JSX no Início. `git diff --check` passou. Verificação visual incompleta: acesso ao navegador segue bloqueado pela política previamente informada; sem medidas reais, capturas ou aprovação de aparência nesta tarefa. Checkpoint de aprovação não atualizado e demais pendências preservadas.

## Ajustes solicitados de Início e Relatórios — 16/10/2026

Pedido: remover prefixos redundantes dos títulos dos cards de Relatórios, distinguir quantidades; em Início sem registros, no máximo quatro cards com fundo cinza, títulos legíveis e “Sem registro no momento”; explicação junto ao título no ícone informativo.

Estado anterior: diff do checkpoint sem alterações no início desta tarefa. Preservados os demais ajustes preexistentes. Alterações atuais somente em `app/inicio/page.tsx` (apresentação dos títulos, variante vazia, limite visual e escolha de indicadores) e nas regras iniciais de `module-design-system.css`. Chaves de indicadores e preferências salvas preservadas. O informativo já havia sido implementado em outra tarefa; nesta execução foi confirmado na UI, sem nova alteração.

Coordenador conferiu no navegador: onze categorias de Relatórios, com títulos sem prefixos redundantes e identificação de quantidades de origens distintas. Em Início, viewport DOM amplo1777×1272, zoom do app observado≈1,20: quatro cards com fundo rgb(241,243,245), altura renderizada158,40px≈132pxCSS, sem corte horizontal nos títulos. No estreito, viewport DOM efetivo520×1125 (override390×844): quatro cards132px, títulos íntegros e sem transbordamento global; captura da parte inferior inspecionada. Override restaurado. Tema escuro: fundo rgb(26,38,52), texto rgb(237,243,248), tema claro restaurado.

Origem vazia separada3002: selecionar Contas a pagar promove o indicador ao início, mantendo quatro e a preferência após recarregar. Origem3001 com registros fictícios: dez indicadores salvos voltam a aparecer; o limite vazio não apagou a configuração. Tooltip junto a “O que eu faria agora” abriu e fechou por Escape. Não foram arquivadas capturas em disco; imagens e medidas emitidas na conversa.

Revisor delegado executou revisão estática incremental, sem navegador disponível. Identificou que zero não significa ausência de registros: critério corrigido para consultar também as fontes de cada indicador. Identificou divisão0/0 em Rosca com registros zero: participação agora usa0 quando denominador for zero/não finito, correção confirmada estaticamente. Essas verificações não aprovam todos os modos de gráfico ou todos os estados com dados.

Validação: TypeScript e build finais concluídos com código0. Resultado: **conferido no escopo descrito**, com cobertura visual manual do coordenador e revisão estática delegada. Demais pendências anteriores continuam abertas; checkpoint técnico não as aprova.

## Notas de Início, Consultas e Investimentos — 16/10/2026

Pedido: quatro insights resumidos (máximo três linhas), explicação no ícone de informação e detalhes ao clicar; Consultas com base branca/cinza e pendências superiores a 24 horas em amarelo; compactar controles e tipografia de Investimentos conforme o padrão salvo.

Estado anterior: repositório com numerosas alterações preexistentes. Comparação inicial com checkpoint sem diferenças. Escopo efetivo desta tarefa: `page.tsx` (apenas insights), `ClinicalDrafts.tsx`, bloco inicial de `module-design-system.css` e opção local de contenção no `InfoHint.tsx`. Alterações anteriores de Pagamento e demais áreas não pertencem a esta tarefa.

Revisor personalizado `revisor_visual_docclin` executado por delegação, com configuração explícita. Revisão **estática**, não manual no navegador: quatro recomendações, resumo limitado, diálogo de detalhes, cores dos rascunhos, limiar de 24 horas, especificidade dos controles de Investimentos e preservação de campos/cálculos conferidos. Resultado nas três áreas: **Verificação incompleta**.

Achado estático do revisor: explicação extensa poderia exceder a altura disponível do popover. Acrescentada opção `fitViewport`, ativada somente no informativo dos insights, que limita a altura restante da viewport e permite rolagem interna. Segunda revisão identificou conflito com `pointer-events:none` e fechamento ao rolar; variante agora permite foco/interação e ignora rolagem/clique internos, mantendo fechamento externo e por Escape. Revisor confirmou resolução estática na terceira conferência. Outros consumidores mantêm comportamento anterior.

Limitação: navegador bloqueado nesta sequência; não houve contorno, capturas, medidas reais, viewport/escala/zoom registrados ou aprovação de aparência. Pendentes: encaixe amplo/estreito, tema escuro, menus abertos, textos longos dos objetivos e estados expandidos. Pendências anteriores permanecem abertas. Checkpoint técnico não equivale a aprovação visual.

## Estado

- Configuração TOML criada e validada. Revisor iniciado por delegação explícita que leu o arquivo; descoberta automática pelo carregador ainda não comprovada.
- Nenhuma tela aprovada por este registro. Primeiro escopo: Financeiro; próximo: Relatórios.
- Referências: DESIGN_SYSTEM.md, tokens e componentes aprovados; Manutenção para espaçamento.
- Preservar mudanças locais anteriores e não atribuí-las à configuração do revisor.
- Etapa de configuração e teste do agente de design concluída por delegação explícita; auditoria geral inicial registrada abaixo. Isso não é aprovação irrestrita de todas as telas/estados.

## Pontos de controle

`python3 scripts/visual-review-checkpoint.py diff` compara os arquivos com `.visual-review/checkpoint.json`. `capture` salva uma base, incluindo arquivos não versionados. O snapshot é um registro técnico, não aprovação visual. Só o coordenador o avança após consolidar o relatório. Pendências continuam abertas mesmo quando os hashes avançam.

Sem checkpoint válido, registrar a limitação e revisar apenas o escopo solicitado, sem varredura global. Áreas já verificadas voltam à revisão quando afetadas por mudanças. Mudanças globais exigem avaliar consumidores e registrar o alcance real.

## Registro de cada revisão

- Data, pedido, referência e escopo.
- Revisão Git, estado local anterior e diferenças desde a base.
- Tela/estado, viewport, escala, zoom, imagens e medidas reais.
- Resultado por área: Conferido / Com divergências / Verificação incompleta.
- Divergência: elemento, esperado, observado, referência e evidência.
- Consumidores afetados, áreas não verificadas e pendências anteriores.
- Correções verificadas e snapshot correspondente.

## Pendências iniciais

- Confirmar descoberta automática do agente personalizado pelo carregador do Codex. O diagnóstico local inclui a regra do AGENTS.md, mas não fornece essa comprovação.
- Corrigir sobreposição no Financeiro estreito somente em tarefa posterior autorizada; a configuração do revisor não altera o aplicativo.
- Validar demais abas e estados apenas quando solicitados ou afetados por mudanças.
- Relatórios e demais áreas não revisados.

## Teste inicial — 16/10/2026

Pedido: configurar e testar o revisor, preservando o app. Escopo: Financeiro, Visão geral. Estado local anterior: vários arquivos alterados e não versionados já existentes, inclusive Financeiro e estilos compartilhados; nenhum achado abaixo é atribuído à configuração.

### Conferências no navegador

| Área/estado | Medida observada | Resultado |
| --- | --- | --- |
| Amplo, viewport DOM 1707 × 960, escala app 1,26, DPR 1,5 | Cabeçalho 52,92 px renderizados = 42 px CSS; submenu→indicadores e indicadores→gráficos 15,12 px renderizados = 12 px CSS; gap dos indicadores 17,64 px renderizados = 14 px CSS | Intervalos amostrados conformes aos tokens |
| Indicadores e títulos dos gráficos amostrados, amplo | Quatro indicadores com 166,68 px renderizados de altura; títulos amostrados Geist, 16 px CSS, peso 650, rgb(82,106,128) | Consistentes entre si; não equivale a aprovação de toda tipografia/cor |
| Primeiro gráfico visível, amplo | Título, eixos e legenda legíveis na captura | Sem sobreposição visível nesse estado |
| Estreito, viewport DOM efetivo 520 × 1125, escala app 1, visualViewport.scale 1 | Cabeçalho y148–190; submenu y190–237; ações y197,75–346,75; indicadores a partir de y249 | **Com divergências:** ações sobrepõem submenu e primeiro card |

No estreito, “Novo indicador” ocupa y197,75–228,75 sobre o submenu; filtros ocupam y237,75–307,75 e engrenagem y358,75–392,75 sobre o primeiro indicador. Esperado: blocos sem sobreposição. O coordenador reproduziu os retângulos via DOM e confirmou a captura visual. Evidência emitida na conversa; imagem não arquivada em disco. Referência: estrutura e espaçamento do DESIGN_SYSTEM.md.

O override solicitado foi 390 × 844, mas o ambiente entregou 520 × 1125; não declarar teste em 390 px. Override restaurado ao final. Submenu estreito mantém linha única, botões de 40 px e indicação de opções ocultas.

### Limites e resultado

**Com divergências**, com cobertura parcial. Não verificados: outras abas financeiras, Relatórios, menus abertos, hover/foco, tooltips, modo escuro e comparação visual viva com Manutenção. Comparação de espaçamento foi contra tokens documentados. Não houve correções nem aprovação global do app.

Configuração: campos TOML obrigatórios validados; modelo/permissões herdados. Não foi comprovada seleção automática do agente pelo nome. A execução de teste foi um subagente real com leitura explícita da configuração.

Checkpoint: oito cenários passaram em repositório temporário (base ausente, sem mudanças, modificação, adição não versionada, exclusão, JSON inválido, schema inválido e hashes inválidos). O bug de raiz JSON não objeto foi corrigido antes da captura inicial. O snapshot inicial representa estado técnico e cobertura parcial acima, mantendo todas as pendências abertas.

### Segundo teste incremental

Snapshot inicial salvo com 222 arquivos relevantes. Duas comparações do coordenador e uma execução adicional do revisor retornaram listas vazias de adições, exclusões e modificações. Na segunda execução o revisor não reabriu o navegador nem repetiu inspeção visual, preservando as pendências. Ausência de mudanças não significa aprovação visual.

O reaproveitamento da revisão também depende da referência, tema, escala, viewport e estados/dados relevantes permanecerem aplicáveis. Se esses fatores mudarem ou o usuário solicitar nova conferência, revisar o escopo correspondente mesmo sem alteração de arquivos. Pendências conhecidas não exigem nova inspeção sem correção, mudança relevante ou solicitação.

## Refinamento da referência Manutenção — 16/10/2026

Pedido do usuário: reduzir altura da barra superior sem reduzir pesquisa, ícones ou conta; centralizar valores dos filtros; compactar quantidade por página e paginação mantendo fontes; preservar título, cards e espaçamentos como referência. Alterações limitadas ao CSS compartilhado e documentação. Barra superior é global; ajustes de filtros/paginação estão limitados à referência Manutenção enquanto o usuário define o padrão.

Conferência **manual do coordenador** no navegador, viewport DOM 1707 × 960, escala app 1,26:

- Barra: de 62 para 54 px CSS; pesquisa permanece 32 px e conta 34 px. Controles centralizados verticalmente.
- Título: 32 px, peso 560, rgb(13,23,45), preservado. Engrenagem permanece 34 × 34 px CSS, à direita.
- Indicadores: altura renderizada 166,68 px preservada; gap compartilhado de 14 px e intervalo seguinte de 12 px preservados.
- Quatro valores dos filtros com centro geométrico coincidente com a caixa (desvio menor que 0,001 px renderizado); altura 38 px e fonte 12 px preservadas.
- Quantidade por página: 48 × 28 px CSS; fonte 12 px preservada.
- Paginação: 28 × 28 px CSS; fonte 12 px preservada.
- Captura visual emitida na conversa; sem imagem arquivada em disco.

Limites: o revisor delegado confirmou o escopo incremental e as regras estaticamente, mas não teve navegador disponível nesta execução. Não atribuir a ele a inspeção visual feita pelo coordenador. Largura estreita, dropdowns abertos e amostra visual de Início ainda não conferidos nesta alteração. O texto longo de ordenação usa reticências no espaço disponível. Não foi feita padronização do aplicativo inteiro; demais pendências anteriores continuam abertas.

### Igualar tabela→gráfico a indicadores→tabela

Pedido posterior: manter abaixo da tabela o mesmo intervalo existente abaixo dos quatro indicadores. Coordenador mediu antes 12 px CSS entre indicadores/tabela e 16 px entre tabela/gráfico. Regra específica da referência Manutenção passou a reutilizar `--module-content-space`, sem nova medida local. Conferência manual no navegador, viewport 1707 × 960, confirmou 15,11458 e 15,11459 px renderizados, respectivamente (ambos 12 px CSS na escala do app). Revisor delegado conferiu seletor/adjacência estaticamente, sem divergências. Demais pendências permanecem abertas.

### Filtros de volta à esquerda

Usuário rejeitou a centralização experimental. Removidos somente os quatro blocos CSS de grid/centralização. Coordenador conferiu visualmente no navegador e mediu os quatro triggers: display flex, texto alinhado à esquerda e altura de 38 px CSS. Espaçamento abaixo da tabela permanece 12 px. Documentação atualizada; revisor conferiu a reversão estaticamente. Esta decisão substitui a centralização registrada acima.

### Espaço antes da indicação e definição global

Usuário pediu aumentar o respiro antes de “INDICAÇÃO PARA ESTA ÁREA”. Medição no navegador detectou margem inferior preexistente de 18 px no bloco anterior; a regra consolidada agora zera essa margem e dá ao rodapé margem superior de 40 px, sem alterar a altura interna da faixa. Em Manutenção, viewport 1707 × 960, medidos 50,3958 px renderizados (40 px CSS), margem anterior 0 e altura interna preservada de 63,0456 px CSS. Revisão estática inicial do delegado foi complementada pela medição manual do coordenador, que identificou e resolveu a soma de margens.

Depois, o usuário definiu explicitamente o intervalo dos quatro indicadores até a caixa seguinte como padrão vertical global entre caixas. Documento e token `--module-section-space` atualizados para 12 px, igual a `--module-content-space`. A separação maior da indicação é uma exceção solicitada separadamente. Não declarar todo o app validado: consumidores do token global e estilos legados ainda precisam de conferência incremental antes da entrega da padronização completa.

## Consolidação e revisão geral inicial

Usuário autorizou extrair os demais padrões de Manutenção e revisar o app antes do agente funcional. Foram consolidados título operacional (32 px/560/cor por tema), altura das ações principais (34 px), paginação das listas equivalentes e row-gap dos grids entre caixas. Preservados gaps horizontais e preenchimentos internos. Cabeçalhos estreitos com ações ganharam altura adaptativa; no Financeiro, ações ficam em segunda linha. A grade de Equipe foi contida para a tabela usar sua rolagem interna sem ampliar a página. Apenas CSS e documentação foram alterados nesta consolidação.

### Cobertura real

Conferência manual do coordenador via navegador, viewport DOM amplo 1707 × 960: **25 entradas principais abertas** — Início, Assistente, Agenda, Tarefas, Consultas, Pacientes, Mensagens, CRM, Propostas, Vendas, Catálogo, Estoque, Manutenção, Documentos, Ordens de Serviço, Compras, Fornecedores, Financeiro, Precificação, Relatórios, Ponto, Colaboradores, Investimentos, Primeiros passos e Configurações. Os nomes são os rótulos visíveis atuais; não renomeados por esta tarefa.

Títulos operacionais amostrados nessas entradas: 32 px, peso 560, cor rgb(13,23,45); cabeçalho global 54 px; cabeçalhos compactos 42 px no amplo; indicadores com gap vertical 12 px e horizontal 14 px. A saudação de Início mantém seu papel próprio de 36 px. Ações aninhadas em Tarefas foram rechecadas após consolidação: todas 34 px. Ícones de informação e botões internos de controles segmentados preservam dimensões próprias.

Conferência estreita (override solicitado 390 × 844; viewport DOM real **520 × 1125**): Financeiro, Manutenção, Relatórios, Pacientes, Ponto, Consultas, Tarefas e Colaboradores. Após correção, Financeiro: ações terminam em y350,75, dentro do cabeçalho; submenu começa y362,75. Tarefas: ações e cabeçalho terminam em y256; próximo bloco inicia y256, sem sobreposição. Relatórios: botões y144–178 dentro do cabeçalho y140–182. Colaboradores: página com largura de 520 px; tabela com rolagem interna (483 px de área e 1117 px de conteúdo), sem transbordamento global. O transbordamento detectado inicialmente em Colaboradores foi corrigido e rechecado no amplo e estreito.

Tema escuro amostrado em Manutenção e Financeiro: título operacional rgb(237,243,248), mesmas dimensões; tema claro restaurado. Capturas de Financeiro e Relatórios estreitos foram inspecionadas e emitidas na conversa. Viewport temporário restaurado.

Auditoria estática global do revisor delegado: famílias de listas operacionais; Clientes/Compras/Assistente/Ponto/Equipe; clínica; Financeiro/Relatórios; kanban/Atendimento; Agenda/Investimentos/Configurações; Início/Loja. Rotas públicas e laboratórios são variantes separadas. A auditoria estática não é prova visual; medições acima foram feitas pelo coordenador.

### Validação e limites

- Build Vinext final concluído com código 0 em 16/10/2026; TypeScript sem erros após a consolidação. Avisos de tamanho de chunks e classificação estática de rotas não impediram o build.
- Configuração TOML e execução delegada testadas; reconhecimento automático pelo carregador ainda não comprovado. As instruções do projeto permitem informar essa limitação e executar com leitura explícita.
- Revisão geral não é teste de todas as funções. Ficha de paciente com dados, todos os submenus, dropdowns, estados vazios/com dados, tooltips e todos os breakpoints não foram integralmente cobertos. Sem afirmação de aprovação global ou ausência absoluta de divergências.
- A inspeção de todos os fluxos funcionais pertence à etapa seguinte, com ambiente/dados de teste isolados e relatório de cobertura.

### Fechamento da configuração de design

Revisor delegado concluiu revisão estática final sem bug concreto nos seletores examinados (títulos, ações, intervalos, cabeçalho responsivo do Financeiro e contenção da tabela de Equipe). Não repetiu navegador nem varredura global. A sobreposição estreita do Financeiro registrada no teste inicial foi corrigida e rechecada pelo coordenador conforme medidas acima. Configuração e consolidação encerradas; cobertura visual parcial permanece explicitamente delimitada. Este fechamento não aprova estados não examinados nem substitui aprovação visual do usuário. Próxima etapa: configuração e auditoria funcional em registro separado.
