# Diagnóstico inicial — Gest Base

Data: 13/08/2026

## Direção do produto

Base modular para empresas de serviços e comércio. O sistema deve conectar os processos, não apenas reunir telas.

Fluxos centrais:

1. Lead → proposta → venda → recebimento.
2. Cliente → agenda → ordem de serviço → cobrança.
3. Reposição → compra → entrada no estoque → conta a pagar.

## O que existe hoje

| Área | Situação atual |
| --- | --- |
| Início | Dashboard amplo com indicadores, agenda, receita, alertas e recomendações. |
| Agenda | Experiência própria com visualizações, criação, edição e resolução de atividades. |
| Clientes | Listagem, cadastro, filtros e página detalhada com histórico, vendas, financeiro, documentos e observações. |
| Vendas | Listagem e detalhes demonstrativos. |
| Catálogo | Produtos e serviços em estrutura genérica. |
| Financeiro | Módulo mais completo: visão geral, transações, contas, fechamento, configurações e lançamentos. |
| Documentos | Listagem em cartões, vínculos e cadastro demonstrativo. |
| Estoque | Quantidades, movimentações e alertas em estrutura genérica. |
| CRM | Comunicações e indicadores; ainda não representa bem um funil comercial completo. |
| Assistente | Resumo, prioridades, oportunidades e conversa simulada. |
| Manutenção | Equipamentos, custos e alertas. |
| Relatórios | Visão consolidada com filtros e indicadores. |
| Equipe | Membros, cargos, acessos e permissões demonstrativas. |
| Loja | Planos Standard, Plus e Pro. |
| Configurações | Empresa, preferências, plano e conta. |

## Principais problemas encontrados

- Quinze itens com o mesmo peso na lateral.
- Excesso de indicadores e blocos em algumas telas.
- Vários módulos usam a mesma tabela e o mesmo formulário genérico.
- CRM não possui um pipeline comercial claro.
- Existem implementações antigas e novas duplicadas no arquivo principal.
- Dados, regras de apresentação e navegação estão concentrados em componentes muito grandes.
- A landing page promete automações, integrações, multiempresa e auditoria que ainda não aparecem de forma completa no produto.
- O banco está vazio; o projeto é atualmente um protótipo de frontend.
- O pacote recebido não inicia porque falta `build/sites-vite-plugin.ts`.

## O que falta no produto

### Prioridade 1 — base universal

- Tarefas e projetos.
- Propostas e orçamentos.
- Ordens de serviço.
- Compras e fornecedores.
- Pipeline CRM em Kanban.
- Relação automática demonstrativa entre venda, estoque e financeiro.
- Linha do tempo única por cliente.
- Painel inicial por função: gestor, comercial e operação.

### Prioridade 2 — operação e escala

- Atendimento e tickets.
- Contratos e recorrências.
- Aprovações internas.
- Automações visuais.
- Campos, etapas e painéis personalizáveis.
- Auditoria de atividades.
- Multiempresa e unidades.
- Portal do cliente.

### Prioridade 3 — integrações futuras

- WhatsApp e e-mail.
- NF-e e NFS-e.
- Boletos, Pix e conciliação bancária.
- Assinatura eletrônica.
- API e webhooks.
- Marketplaces e canais de venda.

## Nova organização recomendada

| Grupo | Módulos |
| --- | --- |
| Minha rotina | Agenda, Tarefas e Projetos |
| Relacionamento | Clientes, CRM, Atendimento |
| Comercial | Propostas, Vendas, Catálogo |
| Operação | Ordens de Serviço, Estoque, Compras, Fornecedores, Manutenção |
| Gestão | Financeiro, Documentos, Relatórios, Equipe |
| Sistema | Assistente, Todos os módulos, Loja, Configurações |

A lateral mostrará grupos e favoritos. Todos os módulos permanecerão acessíveis em “Todos os módulos”.

## Referências de mercado

- Odoo: conjunto integrado de CRM, vendas, financeiro, estoque, compras, projetos, manutenção, atendimento, agenda e aprovações.
- Zoho One: organização por áreas, painéis personalizados, projetos, atendimento, automações, inventário, finanças e RH.
- Bitrix24: CRM, tarefas, projetos, atendimento multicanal, automações, colaboração e permissões.
- Omie, Conta Azul e Bling: forte integração brasileira entre vendas, notas, estoque, compras e financeiro.

Referências oficiais:

- https://www.odoo.com/page/all-apps
- https://www.zoho.com/one/applications/web.html
- https://www.bitrix24.com/
- https://www.omie.com.br/funcionalidades/
- https://contaazul.com/sistema-erp/
- https://www.bling.com.br/

## Controle de alterações

Nenhum item será removido sem aprovação expressa.

| Classificação | Regra |
| --- | --- |
| Mantido | Continua como está ou recebe melhorias. |
| Reorganizado | Muda de posição ou agrupamento, mas permanece acessível. |
| Substituição sugerida | Exige apresentação e aprovação antes da troca. |
| Remoção sugerida | Exige justificativa e aprovação antes da exclusão. |
| Novo | Funcionalidade adicionada ao protótipo. |

## Próxima entrega

Definir o conteúdo exato da nova tela Início e gerar três imagens comparativas:

1. Sóbria e premium.
2. Clara e tecnológica.
3. Humana e acolhedora.

Nenhuma alteração visual será aplicada ao código antes da escolha.
