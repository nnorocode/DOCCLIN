# Revisão das fontes de dados — 14/10/2026

## Regra implementada

As telas operacionais iniciam sem registros de exemplo. Séries financeiras não substituem resultados zero por históricos fictícios. Cadastros e preferências usam armazenamento local por empreendimento/usuário; os prontuários mantêm o adaptador Supabase existente quando configurado.

## Fontes e cálculos

| Área | Fonte | Comportamento |
| --- | --- | --- |
| Início | Lançamentos financeiros, clientes, agenda, estoque e módulos locais | Indicadores e séries calculados; pendências contadas dos registros; nenhuma previsão de receita inventada |
| Financeiro | `gest-finance-transactions` | Receitas, despesas, parcelas, baixas, cancelamentos e resultado por período |
| Atendimento → Financeiro | Prontuários salvos | Lançamentos por ID do atendimento, sem duplicação, mantendo parcelas e datas de baixa |
| Vendas → Financeiro | Cadastro de venda | Receita vinculada por ID, valor, desconto, taxa, custo, parcelas e cliente |
| Caixa / Competência | Datas de liquidação / competência dos mesmos lançamentos | Cálculos separados; recebimentos exibidos pelo caixa |
| Fluxo, DRE e Fechamentos | Mesmos lançamentos | Séries e detalhamentos calculados, sem números de referência preenchidos à mão |
| Bancos | Contas e saldos iniciais informados; associação de movimentos liquidados | Conciliação manual; saldo derivado da abertura e dos movimentos vinculados |
| Comissões | Profissional, receita e percentual informados | Comissão calculada; despesa vinculada no financeiro e confirmação de pagamento |
| Relatórios | Mesmas fontes operacionais | Comparativos, ranking por serviço e composição da receita; personalização e ordem persistidas |
| Clientes | `gest-clients` e recebimentos vinculados pelo nome | Contagens de ativos/inativos e total recebido calculados; cópias exatas dos clientes de exemplo são retiradas com backup local |
| CRM, tarefas e projetos | Cadastros locais persistidos | Quadros iniciam vazios; alterações e etapas são salvas |
| Mensagens | Contatos e mensagens locais | Contatos/conversas de exemplo deixam de ser a base inicial; registros locais persistidos |
| Estoque, Catálogo e demais cadastros | Registros por módulo | Dados iniciais vazios, registros e campos preenchidos preservados; indicadores derivados dos cadastros |
| Compras | Cotações informadas por produto/fornecedor/data | Histórico e variação calculados; links de pesquisa não apresentam preços fabricados de marketplaces |
| Equipe / Ponto | Trabalhadores e marcações cadastrados | Sem trabalhadores de exemplo como padrão; horas derivadas de entradas/saídas |
| Anamnese, odontograma, ROC e documentos clínicos | Prontuário do paciente | Dados clínicos existentes mantidos; seleção de serviços usa catálogo cadastrado |
| Precificação e Investimentos | Campos do simulador | Valores de saída calculados pelas fórmulas a partir dos campos de entrada; simulação não é um lançamento financeiro |

## Interface

- Regras e metas saíram do submenu Financeiro e ficam na engrenagem superior.
- Personalizados saiu do submenu Relatórios e fica na engrenagem superior.
- Transações recebeu cards de resumo e ações compactas.
- Controles financeiros e de relatórios usam as fontes, cores e bordas arredondadas compartilhadas.
- Nenhum agrupamento das demais sub-abas foi realizado.

## Validação realizada

- TypeScript sem erros e build de produção concluído.
- Onze testes: base vazia, desconto/custos/taxas/tributos, caixa versus competência, centavos do parcelamento, cancelamento total/parcial, vencimento no fim do mês, fonte compartilhada de Relatórios, venda sem duplicação, valor do estoque por quantidade × preço e saldo disponível separado do custo estimado.
- Navegação nas dez áreas financeiras e onze categorias de Relatórios; engrenagens verificadas na prévia local, sem erros de console observados nesse percurso.

## Limites da validação

Esta revisão não é uma certificação de que todas as funções do produto estão prontas para produção. Não foram executados pagamentos reais, envios reais de WhatsApp, sincronização bancária, assinatura digital nem testes de todas as operações com Supabase real. Bancos e mensagens possuem controles locais; integrações externas precisam de configuração e testes próprios. Cadastros antigos sem data não permitem reconstruir um histórico temporal preciso. Distribuição por sexo depende de esse dado existir no cadastro. Indicadores sem dados suficientes não devem ser interpretados como comprovação de uma situação real do negócio.

Arquivos e alterações anteriores do laboratório ROC foram preservados. Nenhum commit ou envio ao GitHub foi realizado nesta revisão.
# Revisão visual de 14/10/2026

- Padrão visual compartilhado aplicado às contas a receber/a pagar, fluxo de caixa, DRE, bancos, cobranças, comissões, fechamentos e regras/metas: tipografia, cores, campos arredondados, ações e espaçamento.
- Gráficos Recharts de Financeiro, Relatórios e demais gráficos compartilhados mostram “Sem dados no período” quando todos os valores são zero. Modos alternativos e os gráficos da tela inicial também recebem estado vazio.
- Prévia local explicitamente identificada: 2 pacientes fictícios, 12 atendimentos em seis meses e 6 despesas. Os registros alimentam o mesmo cálculo dos indicadores; não existem totais pré-fixados nos gráficos. Os exemplos são adicionados por ação manual, não na primeira abertura. Não são enviados ao Supabase, nem a bancos ou WhatsApp.
- Navegação conferida nas áreas financeiras e nas 11 categorias de relatórios. A conferência visual não equivale à validação de integrações externas ou de todos os fluxos do aplicativo.
