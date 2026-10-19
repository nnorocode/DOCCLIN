# Padrão visual do DOCCLIN

Referência aprovada pelo usuário: Manutenção, conferida no navegador em 15/10/2026.
Aplicação compartilhada: `app/inicio/module-design-system.css`.

## Referência medida por função

Medidas CSS de Manutenção, conferidas no navegador em 16/10/2026. A escala do app muda os pixels renderizados, não estes valores.

| Elemento | Padrão |
| --- | --- |
| Família tipográfica operacional | Geist; manter fallback existente |
| Título do módulo | 32 px, peso 560, entrelinha 1,18, cor clara `#0d172d`; tema escuro usa o token de texto do tema |
| Ícone de informação junto ao título | Botão circular de 20 px; não adotar o tamanho das ações para o ícone de informação |
| Ação na linha do título | Caixa externa de 34 px de altura; engrenagem 34 × 34 px, última à direita e no JSX |
| Indicador | Componente aprovado `InformativeMetricCardPreview`, raio de 30 px, preenchimento 10/14/11 px; altura de referência ≈132 px CSS, com adaptação ao conteúdo |
| Rótulo do indicador | 15 px, peso 560; cores tonais aprovadas preservadas por variante |
| Valor do indicador | 30 px, peso 470, cor clara `#25364b` |
| Informação auxiliar do indicador | 11,5 px, peso 570, cor clara `#78818b` |
| Filtro da tabela | Altura de 38 px, fonte de 12 px, valor à esquerda |
| Quantidade por página nas listas equivalentes | Caixa de 48 × 28 px, fonte existente de 12 px |
| Página anterior/número/próxima | 28 × 28 px, fonte existente de 12 px |

O padrão é por função: cards de gráfico, formulários, kanban, alertas, estados semânticos e widgets da página inicial preservam variantes necessárias. Não aplicar a altura de um indicador a todos os cards nem a cor de um título a todos os textos. As rotas públicas, autenticação e laboratórios não recebem automaticamente o shell operacional.

Nos quatro cards de recomendações de Início (“O que eu faria agora”), usar os tokens `--home-insight-*-size`: título 18 px, resumo 13 px, ação 12 px e classificação 9 px. Aumento discreto solicitado em 19/10/2026; manter fonte, pesos, cores e espaçamentos existentes, com resumo em até três linhas.

Em telas estreitas, cabeçalhos com ações podem crescer para acomodar todos os controles, mantendo a referência mínima de 42 px; nunca deixar ações sobrepostas aos cards ou ao submenu. O Financeiro distribui as ações em uma segunda linha quando necessário.

## Estrutura e espaçamento

- Início usa a mesma largura disponível e o mesmo recuo lateral do contêiner compartilhado `.v2-page`, sem limite de largura ou margens laterais adicionais no conteúdo interno.

- Barra superior global: 54 px de altura. Pesquisa, ícones e conta mantêm os tamanhos existentes e ficam centralizados verticalmente; reduzir a caixa externa não reduz seus controles.

- Cabeçalho do módulo: 42 px de altura; preserva a posição do título em relação ao cabeçalho do app.
- Após esse cabeçalho, os cards começam sem margem externa adicional, como em Manutenção. A altura do cabeçalho já acomoda o título.
- Entre cards de indicadores: 14 px.
- Após os indicadores: 12 px.
- Após o submenu: 12 px antes do conteúdo.
- Entre caixas e blocos de conteúdo consecutivos em todo o app: 12 px, igual ao intervalo entre os quatro indicadores e a caixa seguinte de Manutenção. Reutilizar `--module-content-space` e `--module-section-space`, ambos de 12 px. Cada intervalo deve ter um único responsável, sem somar margem e gap.
- Na referência Manutenção, entre a tabela (incluindo paginação) e o gráfico seguinte: 12 px, igual ao intervalo dos indicadores até a tabela. Não somar margens para esse intervalo.
- Antes de “INDICAÇÃO PARA ESTA ÁREA”: 40 px, definidos pelo token compartilhado `--module-recommendation-space`. A margem inferior do bloco imediatamente anterior é zero, para não somar espaços. Esse respiro maior é específico do rodapé de indicação; a altura da faixa e os intervalos entre cards não mudam.
- Ficha e consulta: nome e ações → indicadores → submenu → conteúdo.
- Cada intervalo tem um único responsável. Não somar `gap`, `margin-bottom` e `margin-top` para o mesmo intervalo.
- Esses valores são CSS, antes da escala de visualização configurada no app. Comparar posições medidas no navegador considerando essa escala.

## Submenus e ações

- Ações na linha do título: referência de altura de 34 px, como a engrenagem de Manutenção; preservar as variantes visuais por função.

- Reutilizar `ScrollableTabBar` para as seções do módulo.
- Botões crescem para ocupar toda a faixa; altura mínima de 40 px, texto centralizado e em uma linha.
- Se a largura mínima dos textos não couber, manter rolagem horizontal e setas apenas no sentido com opções ocultas.
- Não aumentar a altura da faixa para preencher espaço horizontal.
- Engrenagem é sempre a última ação à direita, depois de ações como editar, exportar e voltar. Manter também essa ordem no JSX.
- Preservar as bordas arredondadas, cores, fonte e estados selecionados dos componentes existentes.

## Histórico e filtros

- Valores dos filtros alinhados à esquerda, conforme a referência Manutenção; preservar indicador de status, seta, fonte, cores e altura dos filtros. A centralização experimental foi rejeitada pelo usuário.
- Paginação da referência Manutenção: seletor de quantidade com caixa de 48 × 28 px e botões de página de 28 × 28 px, mantendo a fonte existente. Esses controles compactos não alteram a altura dos filtros da tabela.

- Histórico: títulos de registros em 14 px, peso 600; descrições em 13 px, entrelinha 1,5; datas em 12 px; valores destacados em 18 px.
- Registros usam 8 px entre linhas internas e 12 px entre os cards da mesma data.
- Filtros de Relatórios: controles de 36 px, caixa com 6 px de preenchimento vertical e 8 px horizontal.
- Não alterar fontes, cor, conteúdo, salvamentos ou regras de negócio para corrigir um espaçamento.

## Verificação antes de entregar

1. Conferir título, indicadores, submenu e primeiro conteúdo contra Manutenção.
2. Medir intervalos reais no navegador, não apenas as declarações CSS.
3. Conferir largura do submenu em tela ampla e rolagem em tela estreita.
4. Verificar ordem visual e de teclado das ações, com engrenagem por último.
5. Conferir Histórico com diferentes registros e filtros com lista suspensa aberta.
6. Executar TypeScript e build quando a alteração envolver componentes.

Uma mudança deste padrão depende de solicitação explícita do usuário. Novas telas devem consultar este documento e reutilizar os componentes e tokens existentes.


## Ajustes consolidados — 19/10/2026

- Etapas numeradas de formulários (Anamnese, exame intraoral, Precificação e Investimentos): círculo de 24 px, texto de 12 px/600, fundo `--module-step-background` e texto `--module-step-text`, derivados do modelo de Investimentos. No tema claro, azul suave preenchido `#355f80` com número `#dceaf3`; no escuro, `#436c8c` com número claro. O título deve existir no JSX, sem substituição de conteúdo por pseudo-elemento. Cabeçalhos equivalentes de Precificação/Investimentos usam 16 px/600 e rótulos de formulário 12 px.
- Consultas: o bloco Ontem/Hoje/Amanhã tem 40 px (`--module-recommendation-space`) antes de Atendimentos a finalizar, exceção explícita solicitada. Rascunhos permanecem cards individuais, base neutra, com alerta semântico para mais de um dia. Intervalos dentro da grade continuam 12 px.
- CRM: acompanhamento recolhido por padrão, sem apagar registros; responsável no card sempre quebra linha quando necessário, sem corte do nome.
- Compras: sinal considera as duas últimas cotações do produto: queda verde, estabilidade amarelo, alta vermelho. Sem histórico comparável, cinza e “Sem comparação”; o texto comunica o significado além da cor. Gráfico reutiliza DataChartContainer, tooltip e tokens de grade/preenchimento.
- Configurações → Plano: três cards comparativos, entrada à esquerda, Standard atual destacado no centro, superior à direita. Em larguras até 850 px, empilhar mantendo a ordem. Preservar quadro de capacidade e ação de consulta; botões reutilizam lab-create-activity, sem ativar assinatura ou cobrança. Opções de comparação da prévia não constituem contratação.
- Modo escuro: `dark-theme.css` centraliza as superfícies e estados operacionais com os tokens do tema azul escuro existente. Preservar destaque de seleção e significado de alertas/tons. Gráficos usam texto/eixos/tooltip legíveis. Ilustrações, cores de anatomia, marca e folhas de documentos imprimíveis não recebem recoloração indiscriminada; folhas mantêm papel branco com texto escuro explícito.

Estas alterações passaram por revisão de fonte; a validação visual geral no navegador permanece pendente conforme REVISAO_VISUAL_DOCCLIN.md.

O tema operacional também deve alcançar portais anexados a `document.body`: enquanto o app estiver montado, `data-docclin-theme` no documento acompanha a seleção e é restaurado ao desmontar. Pop-ups e anexos usam os mesmos tokens; o CSS do tema é carregado no layout raiz.


### Componentes globais no modo escuro

As regras escuras devem superar a receita clara do próprio componente, incluindo seletores por ancestral e declarações importantes. Aplique o tema ao componente interno, não apenas ao seu contêiner: NotificationCenter possui superfícies e categorias próprias. Tabelas operacionais reutilizam a receita para botões de linha inclusive quando não têm classe. Ranking mantém diamante/ouro/prata/bronze com números e ícones legíveis. Primário, secundário, seleção e ação destrutiva usam tokens por função; não apagar a distinção de Excluir ao padronizar rodapés. Pares declarados da paleta são verificados por `tests/theme-contrast.test.mjs`; isso não substitui conferir a cor computada e a aparência no navegador.


### Compras — cotações e marketplaces

Cotações registradas aparecem em cards com fornecedor, valor destacado e data; menor preço do período tem identificação textual. Ordem visual recente primeiro, sem alterar a ordem do gráfico ou registros. Grade de duas colunas quando a largura do próprio painel permite e uma coluna em painel estreito; gaps compartilhados de 12 px. Marketplaces usam cards de links com ícone local da marca, nome e ação de pesquisa. A base branca dos ícones preserva a identificação das marcas nos dois temas. Os cards reutilizam tokens de texto/superfície claro/escuro, sem consultas externas de preços.
