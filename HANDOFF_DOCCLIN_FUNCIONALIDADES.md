# DocClin — handoff funcional e técnico para continuidade por outra IA

Data de referência: 08/10/2026. Repositório: https://github.com/nnorocode/DOCCLIN.

Este documento descreve o produto, suas áreas, interações, dados e limites conhecidos. Foi preparado a partir do código atual e da avaliação funcional existente, não de uma homologação integral em produção. Não é uma declaração de que todos os botões já executam operações reais.

## 1. Leia isto antes de continuar

O DocClin combina gestão administrativa/comercial com atendimento de saúde, odontologia e estética. O princípio central é **selecionar uma vez e reaproveitar a informação**, evitando cadastros duplicados e redigitação entre agenda, paciente, registro clínico, serviços, documentos e financeiro.

O usuário exige preservação do design aprovado: bordas arredondadas, cores azul/cinza, tipografia, escala e espaçamentos consistentes. Não redesenhar o app, remover funções ou alterar módulos fora do pedido. Quando ele disser “toma nota e me dá OK”, apenas registrar o requisito na conversa; implementar somente após autorização. Não escrever em memórias pessoais sem pedido explícito.

Existem três níveis distintos de funcionamento:

| Nível | Significado |
| --- | --- |
| Local | A interação funciona no navegador. Alguns dados persistem em armazenamento local; outros vivem apenas no estado React. |
| Caminho remoto preparado | Há código para Supabase/autenticação/permissões/prontuário. Isso não comprova configuração, migração ou operação no ambiente de produção. |
| Demonstrativo | Séries, números, listas, sugestões ou ações usam exemplos/estado local. Uma mensagem de sucesso não comprova integração externa. |

Não confundir persistência local com banco compartilhado, confirmação manual com webhook, estado “Assinado” com assinatura verificável, nem mapa facial ilustrativo com reconstrução 3D clínica.

## 2. Identidade, versão e execução

- Pasta: `/Users/renannoronha/Downloads/GEST_ENVIO_CODEX`.
- App local: `http://127.0.0.1:3000/inicio`. Manter esse endereço; não inventar novos links com parâmetros para aparentar atualização.
- Tecnologia: React, TypeScript, Vinext/Vite compatível com estrutura Next, CSS global, Lucide, Recharts; cliente Supabase opcional.
- Versão inicial publicada: branch `codex/v1.0.0`, tag `v1.0.0`, commit `bdbe41a`.
- Versão posterior publicada: branch `codex/v1.0.1`, tag `v1.0.1`, commit `f6a843d`. Era a branch/HEAD na preparação deste documento.
- Branches/tags foram enviadas e conferidas no GitHub na conversa anterior. Este handoff é um arquivo novo; não foi automaticamente incluído nesses commits.
- `package.json` ainda declara `1.0.0`; distinguir versão do pacote de branch/tag. Não sobrescrever tags publicadas.
- `tsconfig.tsbuildinfo` estava modificado antes deste handoff e não foi incluído no último commit; preservar, não tratar como trabalho deste documento.

Comandos de referência:

```sh
./scripts/ensure-local-preview
./node_modules/.bin/tsc --noEmit --incremental false
./node_modules/.bin/vinext build
node --test tests/clinical-workflows.test.mjs tests/security.test.mjs
git diff --check
```

Se Node não estiver no PATH, existe o runtime em `/Users/renannoronha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin`. Confirmar sua existência antes de usá-lo. O preview estável usa os scripts do projeto; não encerrar indiscriminadamente processos do computador.

## 3. Mapa de navegação e nomes internos

O app principal muda de módulo por estado dentro de `/inicio`; não há necessariamente uma URL separada para cada aba.

| Grupo | Áreas exibidas |
| --- | --- |
| Principal / acessos auxiliares | Início, Assistente, Primeiros passos, Investimentos, Loja, Configurações, conforme navegação e permissões |
| Minha rotina | Agenda, Tarefas |
| Relacionamento | Atendimento, Clientes, Mensagens, CRM, nessa ordem |
| Comercial | Propostas, Vendas, Catálogo |
| Operação | Estoque, Manutenção, Documentos, Ordens de Serviço, Compras, Fornecedores |
| Gestão | Financeiro, Precificação, Relatórios |
| Equipe | Ponto, Colaboradores |

**Atenção aos nomes internos:** `View = "Prontuário"` é exibida como **Atendimento**; `View = "Atendimento"` é exibida como **Mensagens**; `View = "Equipe"` é exibida como **Colaboradores**. Não trocar essas chaves ingenuamente: elas também participam das permissões. Projetos tem implementação e identificador de módulo, mas não está na lista atual de itens de Minha rotina.

### Comportamentos compartilhados

- Menu lateral agrupado, recolhível, com preferências locais; navegação móvel e checagem de acesso.
- Cabeçalho com navegação/conta, notificações e acesso a orientação da área.
- `ClientSelect`: lista suspensa customizada compartilhada. Usar esse padrão, não introduzir selects nativos visualmente divergentes.
- Tabelas/quadros com busca, filtros, paginação e ordenação conforme o módulo. Nem todas as opções de ordenação expostas têm implementação completa; conferir o comparador real.
- Cards de indicadores, dicas de informação e gráficos com modos de apresentação.
- Notificação global no canto superior direito com barra de duração: eventos `gest-app-toast` e `gest-app-notification`, cerca de 2,8 segundos; estilo distingue remoção/erro por texto. Nem todo caminho antigo necessariamente emite esse evento.
- Tutoriais/guias contextuais e preferências para não exibi-los novamente.
- Recomendações profissionais são conteúdo de interface; não presumir análise automática das bases.

## 4. Início

**Objetivo:** visão rápida do dia e do negócio, com atalhos para a rotina.

- Saudação por horário e data atual.
- Área de pergunta/sugestão de IA e pendências do dia; conteúdo e recomendações têm componentes demonstrativos.
- Linha de atividades do dia, paciente/contato, serviço, horário e status; abertura de atendimento pelos eventos elegíveis. Não abrir atendimento de evento cancelado.
- Abertura reaproveita o evento e tenta localizar o paciente cadastrado pelo nome. Se não encontrar, há fallback de identidade; isso precisa unificação por ID antes de produção.
- Painel “dados do negócio” com faturamento, lucro, saldo, contas a receber/pagar, meta, despesas, receita recebida, vendas e ticket médio.
- Indicadores podem ser acrescentados, reordenados, removidos por arrastar para descarte, redimensionados e ter tipo de gráfico trocado. Ordem, tipos e tamanhos persistem localmente.
- Trocar o tipo visual não deve alterar valor ou percentual do indicador. O catálogo atual contém vários valores e séries fixos.
- Para perfis sem acesso financeiro, há uma visão reduzida de rotina e áreas autorizadas, não o dashboard financeiro completo.

**Arquivos:** `HomeView` em `app/inicio/page.tsx`; componentes de timeline/cards em `app/laboratorio/page.tsx`.

## 5. Agenda

**Objetivo:** organizar compromissos e iniciar o atendimento com contexto preenchido.

- Vista dia, semana e mês; mini calendário; navegação temporal e linha de horário atual.
- Compromissos mostram pessoa, serviço, horários, tipo, responsável e status. Há cores/prioridades e edição/criação de evento.
- Modelo inclui horário inicial, duração, extensão entre dias, paciente/cliente, iniciais, responsável, prioridade, lembrete, repetição e serviço; cobertura Particular/Plano, convênio, categoria e autorização também podem acompanhar a abertura clínica.
- Arrastar/redimensionar eventos ajusta posicionamento/duração no modelo local.
- Botões de lupa alteram o zoom vertical dos intervalos; não confundir com escala global do app.
- Acesso ao atendimento a partir do evento, levando paciente, serviço e cobertura.
- Revisão do resultado de evento com realizado/não realizado, motivo, serviços, produtos, valor, parcelas, pagamento e previsão de retorno. É um caminho separado, ainda demonstrativo em parte.
- Lista de rascunhos clínicos a finalizar também aparece ao acessar Agenda.
- Eventos são persistidos em `gest-agenda-events`.

**Limites:** o modelo ainda usa coluna/posição semanal, não uma agenda plenamente normalizada por timestamp. Há contagens e revisão especial de evento demonstrativo; repetição/lembrete visíveis não comprovam agendamento automático. Não existe confirmação real via WhatsApp nem sincronização externa comprovada. Revisão da agenda e finalização clínica não são a mesma transação.

**Arquivo ativo:** `AgendaExperience` delega para `AgendaPreview` em `app/laboratorio/page.tsx`. `LegacyAgendaExperience` e outras versões antigas não são a tela atual.

## 6. Atendimento — entrada e prontuário

### 6.1 Entrada sem paciente aberto

- Quadros de Ontem, Hoje e Amanhã, numa área branca; Hoje mais evidente e dias vizinhos discretos.
- Cards com nome da pessoa destacado, horário, serviço e ação de atendimento. Confirmados têm tratamento verde; outros mantêm seus estados.
- Abaixo da agenda estão os **Atendimentos a finalizar**, com paciente, serviço, data/hora do rascunho e “Continuar atendimento”.
- Voltar de um paciente encerra o contexto aberto e retorna a essa entrada de Atendimento, não a Início.
- Não há alternância quadro/lista nessa entrada atual.

**Arquivos:** `ClinicalAttendancePicker.tsx`, `ClinicalDrafts.tsx`, `TimelinePreview`.

### 6.2 Estrutura do paciente aberto

- Título com nome do paciente e alerta clínico, quando houver informações relevantes.
- Voltar e atalho de engrenagem para identificação/documentos da clínica.
- Quatro indicadores: atendimentos registrados, progresso do plano, documentos pendentes e próximo retorno previsto.
- Sub-abas na ordem: **Anamnese, Odontograma, ROC, Documentos, Serviços, Resumo**. Receitas foram incorporadas a Documentos; não recriar uma aba duplicada só porque o tipo interno antigo ainda existe.
- Registro por paciente com histórico, documentos, plano, dados clínicos e estado anatômico.
- Rascunho automático com debounce de aproximadamente 600 ms, além dos salvamentos explícitos e do salvamento ao voltar.
- Rascunho não gera lançamento financeiro. O modelo atual tem um rascunho por paciente, não vários independentes por agendamento.

### 6.3 Anamnese

Dados reaproveitados de Clientes quando disponíveis e vinculados pelo ID: nascimento em formato brasileiro, idade calculada, e-mail, telefone, CPF, endereço, emergência e responsável. Alguns desses campos são consumidos pela anamnese mas não estão disponíveis no formulário simples atual de Clientes.

Blocos numerados, num listão contínuo; respostas Sim/Não expostas na própria caixa. Clicar na resposta já selecionada deixa em branco; branco significa não respondido, não “Não”. Não existe “Não se aplica” nessa seleção.

1. **Motivo e evolução:** queixa principal; início/evolução; dor, local, intensidade e fatores; tratamentos prévios e resposta.
2. **Condições de saúde:** hipertensão, diabetes, doença cardíaca/arritmia, respiratória/asma, renal, hepática, coagulação/sangramento, epilepsia/neurológica, autoimune/imunossupressão, infectocontagiosa, câncer/radio/quimioterapia, saúde mental, gestação e amamentação; detalhes/acompanhamento médico.
3. **Alergias e reações:** medicamentos, anestésicos, látex, antissépticos/cosméticos, alimentos, reação anterior; substância, reação, gravidade e data.
4. **Medicamentos/antecedentes:** anticoagulantes/antiagregantes, corticoides/imunossupressores, bisfosfonatos/antirreabsortivos, cirurgia/internação, problema com anestesia, dispositivo/prótese/marca-passo; doses/frequência, suplementos, automedicação, datas, família e acompanhamento profissional.
5. **Hábitos/sintomas:** tabagismo/vape, álcool, outras substâncias; alterações cardiovasculares, respiratórias, digestivas, urinárias, neurológicas, pele e sono; alimentação/atividade física e outros sistemas.
6. **História odontológica:** dor/sensibilidade, sangramento, bruxismo, ATM, lesão, prótese/aparelho, trauma e boca seca; última consulta, tratamentos, higiene e expectativas.
7. **Estética/complementos:** procedimento estético, preenchimento/toxina anteriores, infecção/lesão na área, queloide/cicatrização; produtos/locais/datas, exames, ficha complementar, responsável/emergência.

Há revisão profissional e salvar anamnese. Alertas usam condições/alergias/medicamentos registrados e respostas afirmativas relevantes; aparecem no atendimento, na anamnese e nos clientes. Não são diagnóstico, triagem automática validada ou classificação de risco clínica certificada.

### 6.4 Odontograma

**Usa o componente aprovado do laboratório**, não uma versão aproximada. `ClinicalAtlas` é compartilhado; `ClinicalDental.tsx`/`ClinicalAnatomy.tsx` antigos não são o atlas atual.

- Chave Adulto/Infantil com dentição permanente e decídua sincronizada entre vistas.
- **1 Vista frontal:** números, imagens dos elementos superiores/inferiores, quadrinhos de faces e recessão junto aos elementos. Não repetir números desnecessários nas faces.
- Seleção direta do elemento em verde. Marcação de face tem estado clínico próprio: Satisfatório azul; Insatisfatório vermelho preenchido; Ativo branco com borda vermelha reforçada. Os nomes internos são `satisfactory`, `active` e `undefined`, respectivamente; não deduzir o texto pelo nome da chave.
- Desmarcar todas as faces deve retirar seleção originada somente pelas faces; clique direto no elemento é uma seleção independente. Botão “Desmarcar todos” disponível.
- Menu por elemento: Ausente, Extraído, Implante, Faceta, Coroa, Aparelho e Canal. Opções podem coexistir; clicar novamente desmarca. Símbolos e texturas representam a condição.
- Ausente/extraído esmaecem o elemento e mostram sinal vermelho; implante tem parafuso; aparelho tem bracket; coroa tem destaque amarelo; canal tem desenho interno avermelhado.
- Recessão: lista 1 a 5 e entrada personalizada, em milímetros; valor compacto e linha vermelha no elemento. Recessão sozinha não equivale a selecionar procedimento. Representação gráfica proporcional é ilustrativa, não medição calibrada da anatomia do paciente.
- **2 Vista oclusal:** arcadas superior/inferior, números externos e adulto/infantil; marca circular no elemento selecionado. Seleção isolada verde; havendo faces clínicas, os estados aparecem em setores da mesma bolinha, inclusive combinações azul/vermelho/branco-borda vermelha.
- **3 Observações por elemento/grupo:** caixas por elemento e modo “Preencher em grupo”. Em grupo só o quadro coletivo deve aparecer. Texto livre, inserir serviços cadastrados, múltiplos procedimentos e quantidade inteira; evitar quadro lateral redundante.
- **4 Exame intraoral:** Higiene, Halitose, Mucosa, Língua, Palato, Palato mole, Assoalho bucal e Lábios, escala 1–5 (texto atual: 1 ruim, 5 boa); observações adicionais por item.
- **5 Periodontal:** placa visível, sangramento, tártaro e mobilidade Sim/Não; apinhamento/diastema 1–5; mordida Normal/Aberta/Cruzada/Profunda; desvio de linha média/outras alterações em texto. Escalas são um roteiro do app, não índice clínico homologado.
- **6 Orçamento/materiais:** consolidação dos procedimentos selecionados, preços disponíveis e materiais previstos pelos vínculos de serviço. Olho oculta somente valores com traços, sem remover linhas/reorganizar a tela.
- Salvar gera estado e snapshot anatômico por data. Histórico de consultas abre datas; vazio informa “Sem registros”; selecionar restaura o snapshot para consulta/continuidade.

**Limites:** não é prontuário dental 3D, diagnóstico, análise radiográfica ou baixa automática de estoque. O vínculo entre serviço/material é previsão; revisar antes de consumo real.

### 6.5 ROC / mapa facial

- Mesma implementação compartilhada do laboratório, preservando imagens, escala, controles e funções.
- Chave Feminino/Masculino; seis camadas: Pele, Tecido subcutâneo, Músculos superficiais, Músculos profundos, Vasos e nervos, Ossos.
- Cinco ângulos: perfil esquerdo 90°, esquerda 45°, frente, direita 45°, perfil direito 90°. A troca simula rotação entre imagens; não é modelo tridimensional contínuo.
- Ferramentas verticais compactas com expansão no hover: ponto, zona, linha, caneta, borracha; desfazer/refazer e paleta de cores.
- Zona com preenchimento transparente, tamanho e redimensionamento por bordas; linha por dois cliques com prévia acompanhando o cursor; caneta para desenho livre; borracha por clique/arraste sobre marcas; remoção também por descarte central/ação disponível.
- Cursor visual deve corresponder à ferramenta; início do traço deve coincidir com a ponta visual. Não alterar esse alinhamento inadvertidamente.
- Marca guarda localização, tipo, cor, camada de origem, ângulo, gênero, região sugerida e anotação; linhas/desenhos guardam pontos/coordenadas.
- Mesma marca permanece ao trocar camada no mesmo contexto de vista. Lista lateral mostra registros das diferentes vistas com identificação do ângulo; indicadores permitem consultar marcas de outros ângulos.
- Não há projeção anatômica automática exata entre ângulos. Região/músculo sugerido exige confirmação pelo profissional; não apresentar localização ilustrada de vasos/nervos como orientação segura de aplicação.
- Serviços por local: texto manual ou seleção dos cadastrados, múltiplos procedimentos, quantidades, preço e materiais vinculados.
- Salvamento e histórico por data como no odontograma; histórico vazio explícito.
- Informação de uso ilustrativo fica no rodapé, sem caixa vazia redundante na área de trabalho.

**Pendência importante:** alinhamento entre imagens, sobretudo osso masculino e algumas camadas/ângulos, teve ajustes sucessivos. Não afirmar precisão clínica pela aparência. Antes de alterar imagens/transforms, testar ponto de referência em todas as camadas e gêneros no mesmo ângulo.

### 6.6 Documentos do atendimento

- Seletor exclusivo: **Atestados, Receitas, Contratos, Termo de consentimento**. Só o selecionado recebe cor ativa.
- Receitas/atestados têm modelo-base textual, identificação do paciente, data/hora, cabeçalho e rodapé editáveis, dados de clínica/profissional/CRM ou CRO e linha de assinatura.
- Configuração persistida de identificação/logo em Configurações → Documentos clínicos, também acessível pela engrenagem. Logo PNG/JPEG/WebP, validada e lida para conteúdo local.
- Cabeçalho/rodapé específicos da receita podem ser salvos e reutilizados; texto da prescrição/atestado é editável. Documento não é apenas título vazio.
- Contratos/consentimentos reutilizam tipos/modelos cadastrados em Operação → Documentos, com preenchimento contextual disponível, escolha de serviço/atendimento vinculado e conteúdo revisável.
- Pré-visualização lateral editável, zoom 50–150%, imprimir, salvar PDF e “Enviar Whats”.
- PDF usa a janela de impressão do navegador. Não há geração/armazenamento comprovado de PDF final no servidor.
- Imprimir registra uma emissão com conteúdo, título, logo e data/hora antes de abrir o diálogo; não comprova impressão física concluída nem assinatura.
- “Enviar Whats” prepara texto e paciente na área **Mensagens** interna, não abre WhatsApp externo; ainda não envia arquivo PDF real por provedor.
- Histórico de documentos/receitas/atestados, datas e estados: Pendente, Enviado, Assinado, Rascunho, Emitido, conforme tipo/caminho.
- Contratos/consentimentos têm controle manual de assinatura/data e são consultáveis em Clientes.

**Limites:** sem assinatura eletrônica integrada, prova/verificação de assinatura ou arquivo assinado garantido; não existe regra completa serviço → documento obrigatório. Templates não foram homologados juridicamente ou para categorias especiais de prescrição. Revisão pelo profissional é obrigatória; não emitir como documento legal validado só porque a UI tem CRM/CRO.

### 6.7 Serviços / comanda e plano

- Importa procedimentos do odontograma/ROC com indicação de origem; permite serviços adicionais.
- Quantidade, preço e custo unitário editáveis; remoção de linhas; descontos percentuais e taxa de pagamento.
- Mostra subtotal, desconto, total, custo, resultado estimado e margem. Custo desconhecido não deve ser tratado como zero confirmado: a UI pede informar custos.
- Materiais previstos agregados pelos vínculos serviço/material e multiplicados pelas quantidades.
- Fórmulas da comanda: total = subtotal × (1 − desconto/100); líquido estimado = total × (1 − taxa/100); resultado = líquido − custo; margem = resultado/total, quando há dados suficientes.
- Atendimento de hoje: serviço realizado, Particular/Plano, convênio/categoria/autorização, valor, pagamento Pix/Crédito/Débito/Dinheiro/Boleto/Plano, 1–12 parcelas, bandeira quando crédito, retorno e evolução.
- Produto utilizado pode puxar lote/validade do cadastro do estoque. O modelo atual de atendimento tem um campo de produto/lote; não é consumo multilotado completo por cada linha da comanda.
- Plano de tratamento: nome, previsão de término, etapas com data, progresso, marcar realizado e selecionar etapas concluídas no encontro.

### 6.8 Resumo e finalizar

- Revisão final antes de confirmar: paciente/data, serviços, quantidades/valores, pagamento e retorno.
- Salvar rascunho mantém trabalho sem finalizar. “Finalizar atendimento” abre revisão; “Confirmar e lançar no sistema” grava encontro.
- Valida serviço, produto com lote/validade, lote vencido, convênio informado e duplicação por `appointmentId` quando disponível.
- Encontro recebe snapshot de anatomia, anamnese, notas, faces, regiões, comanda, produtos, pagamento, data/hora e etapas concluídas; retira rascunho e retorna ao seletor de atendimento.
- Histórico clínico lista encontros e detalhes de serviços/pagamento/retorno/materiais/notas.
- Financeiro deriva recebíveis dos encontros finalizados com valor positivo; não do rascunho.

**Não implementado como transação conjunta:** baixa de estoque, mudança de status da agenda, agendamento real do retorno, documentos obrigatórios e cobrança externa. Retorno é uma previsão no registro. Há proteção local por evento, não garantia distribuída de idempotência ou concorrência.

## 7. Clientes

- Cadastro PF/PJ, nome, foto, e-mail, nascimento, origem e status; campos/indicadores de contato, total e relacionamento na listagem.
- Busca, status/tipo, ordenação, paginação e lista/quadros; cadastro e edição local.
- Ações: Anamnese, detalhes, editar e organização conforme apresentação; ícones com identificação por hover devem manter o padrão.
- Persistência principal em `gest-clients`; foto do formulário usa URL temporária de objeto, portanto não presumir durabilidade da foto após recarga.
- Detalhe com áreas de dados e relacionamento (vendas, financeiro, histórico, arquivos/documentos, observações, conforme configuração); vários valores associados ainda são exemplos.
- Anexos do cliente têm upload validado, prévia, impressão e remoção com confirmação, armazenados localmente quando há conteúdo.
- Observações locais por cliente e atalho para atendimento/anamnese.
- Ícone de alerta clínico reaproveita informações do prontuário.
- Coluna **Pendências de documentos** abre contratos/termos registrados e respectivas situações, sem entrar em detalhes. Sem registros não prova ausência de obrigação documental.

**Limites:** identidade por nome/fallback em alguns caminhos de Agenda/Atendimento pode abrir registro diferente; precisam convergir para o mesmo ID. Cadastros, totais, interações e detalhes não formam ainda um cadastro mestre remoto homogêneo.

## 8. Mensagens

- Central de conversas com lista/kanban, contato selecionado, histórico local, texto, anexos e nova conversa.
- Organização por Novos, Responder hoje, Em atendimento, Aguardando cliente, Intensificar, Resolvidos, Aguardando equipe, Retorno agendado e Sem resposta.
- Filtros de canal/responsável, busca e situação de relacionamento; caminhos de histórico do cliente e alteração do tamanho de fonte da conversa.
- Áreas de conversas, assistente e modelos; modelos de boas-vindas, confirmação, cobrança e encerramento; controles de regras automáticas.
- Anexar oferece **do computador** e **documentos já disponíveis no app** (conteúdo de modelos, arquivos do cliente e documentos clínicos autorizados). Anexo é adicionado à conversa local.
- Recebe texto preparado em Documentos clínicos e seleciona/cria contato correspondente. Revise antes de enviar.
- Situação/próximo contato: Em tratamento, Acompanhamento, Feedback, Aguardando resposta, Sem interesse agora, Não deseja contato; data, atalhos 1/7/30 dias e mensagem de retorno. “Não deseja contato” desabilita data.
- Esse acompanhamento é salvo e aparece no CRM. Conversas/mensagens principais têm caminhos em estado React e não devem ser consideradas histórico remoto durável.
- Campanhas de datas comemorativas/anuais com opções locais persistidas.
- Campanhas configuram ativação, antecedência (no dia, 1/3/7 dias antes), público, público personalizado e mensagem; datas móveis são calculadas para o ano. Esses controles não têm um executor de envio.

**Limites:** não há WhatsApp real conectado, recebimento por webhook, entrega de anexos, disparo automático agendado ou IA conversacional comprovada. Salvar data de retorno não executa envio. Contato é associado por nome em partes do fluxo, exigindo revisão por ID.

## 9. CRM

- Funil kanban: Captação → Primeiro contato → Necessidade → Proposta → Agendamento → Atendimento → Convertido.
- Cards com origem, objetivo, valor, prioridade, responsável, progresso e contagens de comentários/anexos.
- Arrastar entre etapas, criar lead geral/por etapa, abrir detalhes e configurar etapas; controle de rolagem horizontal.
- Bloco de acompanhamentos de Mensagens exibe situação e próximo contato salvo.
- KPIs de leads, sem resposta, conversão e lucro são predominantemente demonstrativos.

**Limites:** funil/novos leads/movimentação usam estado React no caminho atual; não há automação real de conversão, criação de agenda/venda ou disparo. Distinguir acompanhamento persistido de contatos do kanban demonstrativo.

## 10. Tarefas e Projetos

- Tarefas: Entrada, A fazer, Em andamento, Em revisão, Concluída; cartões com título, detalhe, responsável, prazo, prioridade, dias na etapa e vínculo a projeto.
- Criar/editar tarefa, mover por drag, selecionar projeto, configurar etapas, visualizar/acrescentar comentários e nomes de arquivos anexos.
- Projetos: existe componente e módulo interno com cadastro/dados de projeto e organização do trabalho; conferir o acesso efetivo na navegação antes de torná-lo visível.
- As telas compartilham `WorkflowKanban`/`WorkflowComposer` e exemplos de projetos/tarefas.

**Limites:** tarefas/projetos e comentários usam estado de interface; anexar nesse caminho guarda nome, não um arquivo remoto. Não afirmar sincronização com agenda, equipe, banco ou notificações externas.

## 11. Propostas e Vendas

### Propostas

- Indicadores de abertas, aguardando, aprovadas e conversão; filtros por status/validade/responsável, cadastro, lista/quadros e detalhe.
- Detalhe organizado em Dados, Itens, Condições, Documento e Histórico.
- Objetivo do produto: orçamento/proposta comercial que possa originar venda. A conversão automática não está homologada/implementada integralmente.

### Vendas

- Visão de vendidos, abertos, pendentes e cancelados; busca/status/pagamento/período, cadastro/edição e detalhe.
- Tabela com pagamento, referência, valor final, desconto, parcelas/taxas e status; parte desses valores complementares é demonstrativa por linha.
- Detalhe: Dados, Itens, Pagamento, Comprovantes, Recibo/PDF e Histórico; arquivos compartilham mecanismos locais de anexos.

**Limites dos dois módulos:** não presumir checkout, faturamento, emissão fiscal, gateway, venda→financeiro ou venda→estoque. Formulários genéricos não persistem todos os campos exibidos. Vários registros/detalhes têm conteúdo de exemplo.

## 12. Catálogo

- Produtos/serviços, busca, tipo/status, preço, disponibilidade, lista/quadros e cadastro/edição.
- Formulário apresenta nome, tipo, categoria, duração do serviço, SKU/código, custo, preço, margem, quantidade/unidade, impostos/taxas e descrição.
- Detalhe em Dados, Preço, Estoque, Histórico e Categorias.
- Junta cadastros locais, itens adicionados por Precificação e exemplos padrões.
- Serviços são consumidos no odontograma/ROC e comanda; preços disponíveis alimentam orçamento.

**Limite importante:** formulário genérico salva uma linha simplificada; categoria, duração, composição de custo e vários campos exibidos não têm persistência estruturada completa. Não tratar todos como cadastro operacional completo só por estarem na tela.

## 13. Estoque

- Produtos, quantidade, unidade textual, lote, validade, atualização, preço unitário e status; busca/filtros, lista/quadros, cadastro e edição.
- Cadastro local em `gest-stock-records` com posições específicas para lote/validade.
- Detalhe possui Dados, Entradas, Saídas, Movimentações e Alertas; conteúdo de movimentações é em parte demonstrativo.
- Configuração de alertas local e dados de materiais utilizados pelo atlas/comanda.
- Atendimento pode reaproveitar produto/lote/validade e guardar seu uso no prontuário.

**Limites:** não existe inventário transacional completo por lote nem baixa automática finalizada. Editar uma linha demonstrativa pode não persistir, pois o salvamento exclui IDs dos exemplos padrões. Guardar produto/lote no encontro não comprova ajuste da quantidade em estoque.

## 14. Manutenção

- Cadastro/lista de equipamentos, categoria, data de manutenção, custo, status e responsável; busca/filtros/edição/detalhes.
- Áreas de Equipamento, Manutenção, Histórico e Alertas; configuração local de alertas.
- Gráfico de custo/quantidade por período com valores demonstrativos.
- **Referência visual de espaçamento aprovada pelo usuário** para o restante do app.

**Limites:** cadastros gerais nesse caminho não são persistência remota; cronograma, alertas reais e lançamentos financeiros ainda não formam fluxo operacional integrado.

## 15. Documentos — módulo da Operação

- Biblioteca administrativa/modelos: contratos, documentos de clientes, vendas e empresa; não é a mesma tela de emissão do atendimento.
- Cards, busca, filtros de categoria/tipo/vínculo, ordenação, cadastro/upload e edição.
- Organização por arrastar, ordem local persistida; prévia e detalhes de Dados, Vínculos e Histórico.
- Modelos textuais salvos em `gest-document-records` são usados por Documentos do atendimento e pelo seletor de anexos de Mensagens.
- Arquivos de clientes/registros usam chaves próprias e validação de anexos.

**Limites:** o cadastro genérico de documento/modelo não equivale a upload remoto do binário. Não há repositório de arquivos assinado auditável nem política serviço→consentimento obrigatório completa.

## 16. Ordens de Serviço, Compras e Fornecedores

### Ordens de Serviço

- Listagem/cadastro de ordens, status, responsável e prazo; indicadores de execução/atraso/conclusão/aguardando peças.
- Detalhe em Serviço, Cliente, Equipe, Materiais e Histórico.
- Modelo administrativo local/demonstrativo; não comprova reserva/consumo de materiais ou geração de cobrança.

### Compras

- Tela ativa é **monitoramento de preço**, `PurchaseMarketWatch`, não um ERP completo de pedidos/recebimentos apesar dos metadados antigos em `modules.Compras`.
- Busca/seleção de produto, período (semana, mês, dois meses, ano), acompanhamento, gráfico de referência e classificação Bom preço/Acompanhar/Preço alto.
- Mostra mínimo, referência atual, variação, economia estimada e links de busca em marketplaces.
- Lista de acompanhamento persiste em `gest-purchase-watchlist`; tutorial pode ser ocultado.
- Históricos, preços e ofertas são estimativas geradas localmente; busca personalizada também gera referência simulada. Abrir marketplace é pesquisa externa, não scraping/API de preço confirmado.

### Fornecedores

- Busca, filtros, cadastro, lista/quadros, situação, categoria e referência de compras.
- Detalhe: Dados, Compras, Financeiro, Documentos e Histórico.
- Parceiros/condições/históricos são caminho visual/demonstrativo; não há cadeia homologada fornecedor→pedido→recebimento→estoque→conta a pagar.

## 17. Financeiro

Sub-abas: Visão geral, Transações, A receber, A pagar, Fluxo de caixa, DRE gerencial, Bancos, Cobranças, Comissões, Fechamentos, Regras e metas.

- Visão geral: saldo, faturamento, receitas, custos, lucro, recebíveis, contas a pagar, projeção e indicadores adicionais; período e regime Caixa/Competência.
- Gráficos com mudança de tipo, período, variação, dicas e organização/remoção/restauração de indicadores. Indicadores selecionados e algumas preferências gráficas são locais.
- Transações: receitas/despesas, busca/filtros, novo/editar lançamento; descrição, categoria, origem, cliente/produto, competência/vencimento, valor bruto, desconto, custo, tributos, forma, operadora, bandeira, parcelas e taxa personalizada.
- Prévia de cálculo; modelo monetário em centavos e percentuais em pontos-base para cálculos financeiros.
- A receber/A pagar operam parcelas e situação Liquidado/Pendente/Vencido/Cancelado, com baixa/cancelamento/retorno ao pendente conforme ação.
- Fechamentos e sínteses utilizam transações e metas do modelo; várias séries/painéis auxiliares ainda são exemplos.
- Regras/metas: metas, categorias, alíquotas e regras de taxa por meio/operadora/bandeira/faixa de parcelas. Algumas ações expostas, como criar nova regra, não têm implementação completa.
- Fluxo de caixa, DRE, Bancos, Cobranças e Comissões têm painéis preparados com conteúdo demonstrativo; não equivalem a conciliação bancária, DRE contábil real ou cobranças enviadas.
- Encontros finalizados com valor positivo são importados como `CLIN-<encounterId>` e parcelados. Custo/taxa da comanda acompanham o registro. Exige permissão de prontuário nesse caminho.
- Baixa/estorno/cancelamento de parcela clínica escreve datas/parcelas no prontuário. Edição do valor clínico é remetida ao atendimento, não feita como lançamento manual independente.

**Limites:** lançamentos manuais/regras têm estado React no caminho analisado; não há persistência universal ou sync em tempo real. `statusOf`/formulário usam referências fixas de agosto/2026 em partes do modelo. Não afirmar integração bancária, emissão de boleto, cobrança, contabilidade/fiscal ou venda automática externa.

## 18. Precificação

- Chave Produto/Serviço, identificação e unidade de venda.
- Produto: valor total da compra, unidades, adicionais do lote, custo unitário derivado, insumos, embalagem e frete unitário.
- Serviço: remuneração mensal, horas produtivas, duração de execução e materiais/terceiros; valor econômico da hora.
- Estrutura mensal: aluguel, consumo/internet, outros fixos e volume vendido para rateio.
- Perdas/desperdícios, impostos opcionais, taxa/comissão opcionais, reserva de desconto e margem desejada.
- Cards e resumo lateral recalculam custo base, preço sugerido, margem e tributos/taxas.
- Custo unitário de compra = (compra + adicionais)/unidades; rateio fixo = custos fixos/volume; preço = custo base / máximo(0,05; 1 − percentuais comerciais/100).
- “Adicionar à lista de produtos/serviços” grava item precificado em `gest-priced-catalog`, visível no Catálogo.
- “Salvar precificação” atualmente muda estado visual; não salva o formulário/cenário completo.

**Limites:** avaliar contagem de estrutura no cálculo de serviço (hora econômica já inclui fixos e há rateio adicional); não presumir validação econômica/tributária. Unidade selecionada não muda toda a lógica de cálculo. Não é tabela fiscal oficial.

## 19. Relatórios

- Categorias: Visão executiva, Financeiro, Vendas, Clientes, CRM e marketing, Agenda, Serviços e OS, Estoque, Compras, Atendimento, Equipe, Personalizados.
- Cards de indicadores, filtros de período e seleção de séries comparáveis; gráfico principal e secundários (colunas, ranking, rosca etc.).
- Opções de indicadores incluem quantidade/faturamento/lucro, faixa etária/sexo, estoque/valor, manutenção/custo, receita/despesa, atividades, CRM, compras, conversas/retornos e equipe/horas/atrasos.
- Variação calculada sobre a série utilizada; formato monetário ou quantitativo conforme indicador; tooltip/padrão visual compartilhado.
- Inserir/remover/restaurar indicadores, drag de ordem e descarte, modo de gráfico e exportar via impressão/PDF do navegador.
- Filtros numa área própria; gráficos separados, sem caixa externa englobando todos; alinhamentos e gaps devem seguir o sistema aprovado.

**Limites:** `reportValues` e rankings/origens são séries demonstrativas; categorias/personalização usam estado em parte não persistido. Exportar não transforma números de exemplo em relatório real consolidado.

## 20. Ponto e Colaboradores

### Ponto

- Cadastro/edição de colaborador, celular, jornada início/fim, lista e histórico de entradas/saídas.
- Configura local do estabelecimento por endereço, coordenadas GPS ou mapa; raio permitido. Mapa usa tiles OpenStreetMap e busca de endereço Nominatim.
- Vincula navegador/aparelho por identificador local, seleciona trabalhador e marca entrada/saída alternadamente.
- Pede geolocalização; calcula distância e recusa fora do raio ou navegador não vinculado. Guarda data/hora/distância; histórico, indicadores e tutorial.
- Dados locais em `gest-time-clock` e identificador em `gest-clock-device`.

**Limites:** não é prova inviolável de presença, relógio de ponto legal homologado, biometria ou identificação física segura do aparelho. Geolocalização pode falhar/ser imprecisa; dados podem ser alterados localmente; não há fechamento trabalhista remoto certificado.

### Colaboradores

- Área interna `Equipe`, visualização lista/cards, busca, situação, jornada e ordenação.
- Reaproveita pessoas e registros de Ponto para dias trabalhados, atrasos, horas e presenças de hoje; atalho para configurar ponto.
- Datas/cargos auxiliares ainda têm exemplos; soma de horas usa pares entrada/saída simples e não uma folha de pagamento completa.
- Gestão real de permissões fica em Configurações → Usuários e acessos, não nesse resumo.

## 21. Assistente, Investimentos, Primeiros passos e Loja

### Assistente

- Insights/riscos/oportunidades/prioridades, áreas e ações/atalhos para módulos.
- Seletor Visão geral/Prioridades/Oportunidades, prioridade selecionada, diálogo de orientação/aprovação local, calendário comercial de quatro meses navegáveis e perguntas gerenciais com atalhos. Aprovar uma sugestão visual não executa uma alteração externa de negócio.
- Conteúdo atual de insights/prioridades é predefinido; não há prova de motor de IA que leia bases reais. Não apresentar recomendações como auditoria inteligente automática.

### Investimentos

- Simulador de objetivo/manual, valor inicial, aporte mensal, taxa anual, meses/prazo e meta; gráficos de patrimônio/aportes e projeções.
- Objetivos de férias, licença-maternidade, expansão e formação.
- Campos específicos incluem meses de licença/pró-labore, viajantes/reserva de viagem, finalidade/capital de giro da expansão e curso/custos extras. Há aporte necessário, prazo estimado para meta, viabilidade e análise expandida; conferir quais campos efetivamente entram nas fórmulas antes de presumir efeito.
- Juros compostos calculados localmente a partir de taxa informada; não há investimentos executados, cotações garantidas, recomendação financeira personalizada ou carteira conectada.

### Primeiros passos

- Guia de implantação/navegação por módulos com acesso a tutoriais contextuais.
- Ocultar guia é preferência local; checklist visual não comprova implementação/configuração das integrações.

### Loja

- Cards Standard, Plus, Pro e Consultoria com capacidades/preços ilustrativos e botões de plano/consulta.
- Não há checkout/assinatura/pagamento contratado nesse caminho. Textos e limites diferem entre Loja e Configurações → Plano: não tratá-los como política comercial oficial consolidada.

## 22. Configurações e acesso

### Configurações

- **Negócio:** nome, documento, e-mail, endereço/bairro/cidade/UF/CEP/telefone; salvar/restaurar dados localmente. Selecionar logo nesse painel guarda nome/estado, não é o mesmo upload durável do cabeçalho clínico.
- **Documentos clínicos:** clínica, profissional, CRM/CRO e UF, endereço, contato e logo persistida; alimenta documentos do atendimento.
- **Aparência:** claro/escuro, cor lateral predefinida/personalizada, interface 75–125%. O novo 100% corresponde ao antigo 120%; fator real = valor exibido × 1,2. Preservar a migração `standard-120-v3`.
- **Conta:** nome/e-mail e preferência de resumo; salvar perfil ainda informa necessidade de conectar a gravação, não altera cadastro remoto completo.
- **Usuários e acessos:** membros, papéis, ativo/inativo e permissões por módulo; convite/cadastro, edição autorizada e preview de perfil no demo.
- **Plano:** capacidades/uso/upgrade demonstrativos.
- **Segurança:** mostra modo de autenticação e recuperação; duas etapas não está implementada/ativada por esse painel.
- **Integrações:** chaves visuais de vendas/agenda externa. Não estabelecem conexão real; estado de resumo por e-mail compartilha variável com vendas integradas no código atual.
- **Dados:** limpar somente dados/preferências locais do escopo, com confirmação e digitação ZERAR; exemplos embutidos reaparecem. Não é exclusão de banco remoto ou backup.

### Login e autorização

- `/entrar`: login, lembrar sessão, recuperação/reset de senha; cadastro em etapas de usuário, empresa, plano e conclusão.
- Com Supabase configurado, há chamadas de autenticação e associação a empreendimento. Sem ele, perfis locais são demonstração, não segurança de produção.
- Papéis: owner, admin, reception, employee. Dono tem acesso total; outros dependem de permissões/regras. Usuário inativo não deve acessar módulo.
- Usuários não gestores veem apenas Conta/Aparência nas configurações; profissionais recepcionistas/funcionários não recebem acesso financeiro/clínico por suposição.
- Proteções contra alterar dono/próprio acesso e contra administrador promover outro administrador em caminhos restritos; RPC `set_member_permissions` no remoto.
- Convite remoto depende da função `invite-member`; existência do cliente chamador não comprova função implantada.
- Supabase usa `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; nunca expor chave secreta no navegador/documento.
- Cadastro/login não significa que todos os módulos passaram a usar Supabase.

## 23. Fluxos e interdependências reais versus pretendidos

| Origem → destino | O que existe | O que não presumir |
| --- | --- | --- |
| Clientes → Anamnese | Busca por ID dos dados disponíveis | Cadastro mestre remoto universal |
| Agenda/Início → Atendimento | Paciente, serviço, cobertura/contexto | Identidade sempre consistente ou confirmação externa |
| Anamnese → alertas de cliente/atendimento | Sinais afirmativos e dados salvos | Diagnóstico/triagem homologada |
| Catálogo/Precificação → Atlas | Serviços/preços locais | Composição estruturada completa de todos os campos |
| Estoque → Atlas/Comanda | Materiais e vínculos previstos | Baixa/reserva transacional |
| Odontograma/ROC → Serviços | Procedimentos, quantidades, preços e origem | Cobrança real ou consumo confirmado |
| Serviços → Resumo → Prontuário | Snapshot final do encontro | Transação única com todos os módulos |
| Prontuário finalizado → Financeiro | Receita clínica/parcelas derivadas | Gateway, caixa recebido ou estoque atualizado |
| Financeiro → Prontuário | Datas de baixa/cancelamentos clínicos | Sincronização contínua multiusuário garantida |
| Operação Documentos → Atendimento/Mensagens | Modelos/conteúdo salvos | Arquivo assinado obrigatório automático |
| Atendimento Documentos → Mensagens | Texto preparado e contato | Entrega WhatsApp/PDF real |
| Mensagens → CRM | Situação/próximo contato local | Disparo automático na data |
| Ponto → Colaboradores | Resumo dos registros locais | Folha, biometria ou compliance de ponto |

## 24. Dados, persistência e recuperação

`appStorage` em `lib/local-store.ts` cria namespace por empreendimento/usuário (`gest-local:<escopo>:<chave>`). Algumas preferências de aparência são globais ao navegador. Há migração de dados antigos do dono demo e fallback em memória quando o armazenamento falha, com aviso visual: nesse caso, fechar a página pode perder alterações.

Principais chaves lógicas (não procurar só nomes crus no localStorage, pois são prefixados):

| Chave | Conteúdo |
| --- | --- |
| `gest-clients` | Cadastro de clientes |
| `gest-agenda-events` | Eventos da agenda |
| `gest-agenda-event-review` | Revisão do caminho demonstrativo de evento |
| `clinical-record:<businessId>:<patientId>` | Registro clínico, rascunho, encontros, documentos, atlas e snapshots |
| `clinical-letterhead:<businessId>` | Identificação/logo da clínica |
| `clinical-recipe-<businessId>` | Cabeçalho/rodapé específico |
| `clinical-message-draft` | Transferência temporária de texto para Mensagens |
| `gest-catalog-records`, `gest-priced-catalog` | Itens cadastrados/precificados |
| `gest-stock-records` | Produtos, preços, lotes/validade |
| `gest-document-records`, `gest-document-order` | Modelos/documentos e ordem |
| `gest-client-documents-<id>`, `gest-client-observation-<id>` | Anexos/observações de cliente |
| `gest-record-documents-…` | Arquivos do detalhe de módulos |
| `gest-lab-anatomy-material-links` | Quantidade prevista de material por serviço |
| `gest-contact-journeys`, `gest-automatic-campaigns` | Acompanhamento e campanhas |
| `gest-home-widget-order`, `gest-home-widget-types`, `gest-home-widget-sizes` | Organização do dashboard |
| `gest-finance-metrics` | Indicadores selecionados |
| `gest-time-clock`, `gest-clock-device` | Ponto e navegador vinculado |
| `gest-business-settings`, `gest-demo-members` | Negócio/perfis demo |

No remoto, `clinical_records` guarda o documento JSON clínico por empresa/paciente. Há migrations/políticas Supabase e repositório genérico `business_records`, mas a presença desse repositório não significa que todos os componentes o usam. Falha remota deve ser exibida como falha, não sucesso local silencioso.

Histórico/snapshot não é automaticamente trilha de auditoria imutável. Não há backup, recuperação, concorrência, versionamento de todo registro e retenção clínica integral homologados. Não usar dados reais de pacientes no ambiente demonstrativo.

## 25. Design system — regras para não regredir

- Fonte/cor/tamanho devem vir dos componentes aprovados, não de estilos locais improvisados; textos principais azul/cinza, evitando preto aleatório.
- Cabeçalhos de cards com ícone + título como Documentos/Anamnese; numeração pequena circular para seções internas, sem bolinhas gigantes.
- Referência de layout: Manutenção e componentes `StandardModuleTop`, `client-record-panel`, `ClientSelect`, `lab-create-activity`. Classe `gest-compact-page` tem referência de gaps de seção/cards/conteúdo; conferir CSS vigente antes de mudar valores.
- Botões arredondados, ícones centrados, tamanho coerente com Voltar; engrenagem compacta sem invadir cards.
- Chaves Adulto/Infantil, Feminino/Masculino, Produto/Serviço são pares lado a lado, selecionado preenchido e outro branco; não converter em lista suspensa.
- Históricos compactos, arredondados, proporções semelhantes no odontograma/ROC e menu adequado ao botão; vazio abre “Sem registros”.
- Ferramentas laterais expandem como overlay sem empurrar imagens/odontograma; rótulos/fontes do mesmo padrão.
- Ocultar valores não deve alterar altura/layout; trocar gráfico não deve alterar KPI.
- Gráficos: títulos, variações, tooltips, filtros e botões coerentes; controle de modo à direita; descarte via arrastar mantendo cor/tamanho do card.
- Reutilizar `ClinicalAtlas` literalmente entre app e laboratório. Não recortar/recriar dentes, alterar proporções ou caixas individualmente para “corrigir escala”. Escalar conjunto de forma responsiva.
- Conferir janela reduzida, escala global 100%, modo escuro, menus/portais e hover: oclusal não pode sair da tela.
- CSS é extenso com overrides no fim: avaliar especificidade e cascata antes de adicionar mais uma regra global.

## 26. Guia de arquivos para outra IA

| Arquivo/área | Responsabilidade |
| --- | --- |
| `app/inicio/page.tsx` | Navegação principal, Início, Configurações, módulos genéricos, CRM/Mensagens, Tarefas/Projetos, Precificação, Relatórios, Loja, Colaboradores |
| `app/globals.css` | Design global e overrides; preservar padrões |
| `app/laboratorio/page.tsx` | Componentes aprovados de agenda/timeline/cards e laboratório visual |
| `app/laboratorio/anatomia/page.tsx` | `ClinicalAtlas`, odontograma e ROC compartilhados |
| `app/laboratorio/anatomia/preview.css` e arquivos oclusais | Estilo/geometria/ativos do atlas; referências históricas coexistem |
| `public/clinical-lab/` | Imagens anatômicas aprovadas e derivados |
| `ClinicalWorkspace.tsx` | Contexto do paciente, persistência, documentos, finalização, histórico |
| `ClinicalAnamnesis.tsx`, `ClinicalAlert.tsx` | Perguntas e alertas |
| `IntraoralExam.tsx` | Exame/periodontal |
| `ClinicalOrder.tsx` | Comanda, materiais e simulação |
| `ClinicalLetterhead.tsx`, `ClinicalDocumentPreview.tsx` | Identificação, logo, prévia/impressão/envio interno |
| `ClinicalAttendancePicker.tsx`, `ClinicalDrafts.tsx` | Entrada do atendimento e pendentes |
| `ClientsExperience.tsx`, `ClientDocumentStatus.tsx` | Cadastro, controles compartilhados e pendências documentais |
| `AgendaExperience.tsx` | Wrapper da agenda ativa; versões antigas coexistem |
| `FinanceExperience.tsx`, `finance-model.ts` | Telas financeiras e cálculos |
| `chart-presentation.ts`, `ChartModeSelect.tsx`, `drag-preview.ts` | Padrão de gráficos/tooltips/drag |
| `ContactJourney.tsx`, `MessageAttachments.tsx` | Acompanhamento de contatos e anexos internos |
| `PurchaseMarketWatch.tsx`, `TimeClockExperience.tsx` | Compras e ponto |
| `AccessControl.tsx`, `lib/access-control.ts` | Permissões, perfis, empresa e escopo |
| `lib/clinical-records.ts`, `lib/local-store.ts` | Modelo clínico e persistência local/remota |
| `lib/supabase/`, `supabase/migrations/`, `supabase/functions/` | Infraestrutura preparada; verificar chamadas/implantação |
| `lib/file-security.ts`, `lib/security-headers.ts` | Validação de anexos/headers |
| `app/components/AuthExperience.tsx`, `app/entrar/page.tsx` | Login/cadastro/recuperação |
| `AVALIACAO_FUNCIONAL_DOCCLIN.md`, `SECURITY_REVIEW.md` | Limites e avaliação anterior; confirmar deriva no código atual |

Arquivos antigos `DIAGNOSTICO_PRODUTO.md`/`CONTINUACAO_GEST.md` podem estar desatualizados. Não declarar módulo inexistente com base neles quando a UI/código atual já o contém.

## 27. Validação e pendências antes de uso real

Na avaliação anterior, TypeScript/build passaram e 11 testes clínicos/segurança foram aprovados. Esses testes não certificam todas as telas, integrações externas ou legalidade clínica. Este handoff é inspeção/documentação; não repetiu homologação geral nem enviou mensagens/emitiu documentos de pacientes.

Prioridades de engenharia:

1. Identidade única por paciente, serviço, agendamento e encontro, sem vínculo por nome.
2. Persistência remota de todos os módulos hoje locais/React, com tratamento de falhas, concorrência, auditoria e backup.
3. Finalização idempotente/transacional: prontuário, agenda, financeiro, estoque por lote e retorno; rascunhos por encontro.
4. Regras de documentos obrigatórios por serviço, assinatura verificável e armazenamento da versão assinada.
5. Mensagens/WhatsApp real, anexos e confirmação por webhook; contato programado com consentimento e respeito a “Não deseja contato”.
6. Indicadores/IA derivados das bases reais, sem séries fixas confundidas com dados operacionais.
7. Revisão anatômica/profissional e registro preciso, sem promessas de mapa 3D/exatidão inexistentes.
8. Homologação de acesso e ambiente Supabase, migrations/funções e proteção de dados clínicos antes de dados reais.

### Checklist de continuidade

- Abrir paciente pelo Início, Agenda, seletor e Clientes e provar que é o mesmo ID/prontuário.
- Preencher e recarregar anamnese; comprovar data brasileira/idade e alertas afirmativos corretos.
- Marcar/desmarcar elemento e face; provar seleção verde e status/pizza coerentes entre vistas; adulto/infantil responsivos.
- Salvar/restaurar snapshots odontograma/ROC; histórico vazio e não vazio; nenhuma mudança visual no componente aprovado.
- Marcar no ROC, alternar camadas/ângulos, desfazer/refazer/apagar; verificar limite de projeção e posição dos cursores.
- Selecionar procedimento, editar quantidade/preço/custo e conferir comanda sem duplicações; orçamento oculto sem salto de layout.
- Preparar cada tipo de documento, logo, prévia, emissão/histórico e status. Testar cancelamento de impressão sem confundi-lo com entrega.
- Transferir documento para Mensagens e selecionar anexo do app/computador sem alegar envio real.
- Salvar rascunho, sair/voltar, finalizar uma vez, confirmar encontro e parcelas; testar falha de salvamento sem falso sucesso.
- Confirmar baixas clínicas após recarga e distingui-las de lançamentos manuais não persistidos.
- Testar retornos, lotes e documentos obrigatórios explicitamente: ausência de automação deve ser informada.
- Testar papéis diferentes, dois usuários/empresas, logout, falha de storage e erro remoto.
- Testar Ponto com GPS permitido/negado, raio e aparelho; revisar resumo de Colaboradores.
- Conferir Financeiro/Relatórios/Precificação com fonte/borda/gaps padrão e dados identificados como exemplo.
- Antes de commit, preservar mudanças alheias; criar próxima branch/tag sem reescrever as versões anteriores. Publicar somente quando solicitado.

## 28. Instrução pronta para colar na outra IA

> Você está continuando o DocClin no repositório nnorocode/DOCCLIN. Leia este handoff completo e confirme o código atual antes de agir. Preserve o design aprovado, a escala 100%=antigo120%, o espaçamento baseado em Manutenção e o ClinicalAtlas compartilhado do laboratório. Não remova funções ou redesenhe módulos sem autorização. Implemente apenas o pedido atual. Distinga função local, dados de demonstração e integração real; não declare que o app inteiro está pronto para produção. Clientes/Agenda/Atendimento/Documentos/Serviços/Financeiro devem compartilhar dados por identidade única. Verifique persistência e falhas, não apenas aparência. O nome interno Prontuário corresponde ao Atendimento clínico; Atendimento interno corresponde a Mensagens. Use os componentes aprovados e não recrie odontograma/ROC. Ao concluir, diga o que foi alterado, o que foi testado e quais limites permanecem, sem inventar resultados.
