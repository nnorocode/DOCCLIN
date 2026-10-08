# DocClin — avaliação funcional de 07/10/2026

## Conclusão

O app ainda não está pronto para receber dados reais e operar automaticamente de ponta a ponta. Há funções locais utilizáveis, caminhos preparados para Supabase e funções demonstrativas. Compilar e passar testes de segurança não comprova integração em produção.

Esta revisão foi de código, testes isolados e verificações locais de interface. Não houve envio real de mensagens, assinatura, pagamento, emissão fiscal ou gravação em banco de produção. Não foram modificadas permissões de pessoas durante os testes.

## Ajustes desta execução

- Configurações: títulos com ícone, tipografia, cores e controles arredondados; permissões com caixas arredondadas. Não alteradas regras de acesso.
- Documentos do atendimento: Atestados, Receitas, Contratos e Termo de consentimento separados; histórico filtrado por tipo. Botões mais próximos do título.
- Clientes: coluna Pendências de documentos, com consulta de contratos/termos registrados e situação assinada/pendente. Sem registros não é tratado como comprovação de regularidade.
- Gravação clínica publica um evento local para atualizar a consulta de documentos.
- Prescrições salvas no registro final voltam a ser carregadas ao reabrir o paciente.

## Estado dos fluxos

| Área | Evidência atual | Limitação para operação real |
| --- | --- | --- |
| Clientes | `ClientsExperience`: cadastro persiste em `gest-clients`; acesso à anamnese por ID | Dados ficam no navegador; revisão de identidade entre entradas da agenda/atendimento é necessária |
| Agenda / atendimento | Eventos persistem em `gest-agenda-events`; início e seletor consultam eventos | Não há confirmação recebida de WhatsApp real; data de retorno salva no prontuário não cria automaticamente agendamento |
| Prontuário / anamnese | `clinical-records`: salvar/carregar/listar em armazenamento local ou Supabase configurado | Banco remoto, migrações e políticas não foram verificados no ambiente de produção; rascunho atual é único por paciente |
| Odontograma / ROC | Componente compartilhado com laboratório, estado e histórico clínico | Precisão anatômica não foi certificada; as vistas são ilustrações, sem projeção 3D clínica entre ângulos |
| Finalização | Encontro clínico e snapshots registrados; rascunho removido; etapas selecionadas concluídas | Não é uma transação conjunta entre agenda, estoque, financeiro e documentos |
| Financeiro clínico | `FinanceExperience` deriva transações de encontros e salva baixas/estornos no registro clínico | Depende de acesso ao prontuário e leitura bem-sucedida; sincronização entre abas abertas não é garantida |
| Financeiro manual | Cadastro/edição atualizam `transactions` em estado React | Novos lançamentos e alterações manuais não têm persistência no caminho analisado; `statusOf` usa data padrão fixa de 05/08/2026 |
| Relatórios / início | Componentes e apresentação de gráficos | `reportValues` e vários indicadores usam séries fixas demonstrativas, não consolidação das bases |
| Estoque / catálogo / precificação | Cadastros locais são reutilizados na comanda e no registro do produto/lote | Finalização clínica não efetua baixa automática de quantidade nem transação por lote |
| Comanda | Serviços importados do atlas, quantidade, preço, desconto, taxa, custo e resultado estimado | Custo incompleto depende de preenchimento; não há cobrança real/recebimento externo |
| Documentos / receitas / atestados | Cabeçalho/logo persistidos; prévia; registro antes de solicitar impressão; histórico | Não comprova impressão concluída; PDF usa impressão do navegador; não há assinatura digital integrada |
| Contratos / consentimentos | Situação manual e data de assinatura; consulta no cadastro do cliente | Sem regras cadastradas serviço → documentos obrigatórios. Vínculo de documento preparado antes de finalizar precisa revisão; não prova assinatura real |
| Mensagens / CRM | Texto de documento prepara conversa interna; acompanhamento e próxima data salvos localmente | Mensagens não são enviadas por provedor WhatsApp real; data de contato não agenda disparo automático; conversas têm caminhos em memória |
| Assistente / inteligências | `AssistantExperience` possui `insights` e `priorities` fixos | Não há prova de análise automática dos dados reais nem serviço de IA nesse fluxo |
| Configurações / conta / integrações | Aparência, negócio e identificação clínica têm gravação local; controle de acesso tem caminho Supabase | Salvar conta apenas notifica; controles de integração não estabelecem conexão externa; resumo por e-mail compartilha estado com opção de vendas |
| Acesso / segurança | Testes locais de papéis, anexos, isolamento e migração PostgreSQL | Não certifica infraestrutura de produção, backup, auditoria de alterações ou conformidade clínica |
| Vendas / compras / fornecedores / tarefas / projetos / manutenção / equipe | Telas e cadastros demonstrativos/local-state existentes | Não homologados ponta a ponta com banco real, estoque e financeiro; salvar visualmente não é prova de persistência |

## Verificações executadas

- TypeScript sem erros; build Vinext concluído (aviso de tamanho de bundle).
- Seis testes de segurança aprovados, incluindo isolamento e permissões PostgreSQL em banco temporário.
- Cinco testes clínicos isolados: rascunho/histórico após recarregar módulo, contratos e consentimentos, retirada do rascunho após finalização, alertas afirmativos e falha de banco sem falso sucesso local.
- Prévia recuperada na mesma URL `/inicio` com HTTP 200; processo antigo específico foi encerrado. A aba original do navegador não respondeu à automação; usada aba temporária de verificação.
- Conferência visual de Configurações → Usuários e Acessos, sem salvar mudanças de permissões.
- Verificada a abertura da coluna de documentos de Clientes e das quatro opções no atendimento. A consulta vazia informa ausência de registros, sem afirmar regularidade. A aba de consentimento abriu formulário e prévia sem erros de console; nenhum documento foi emitido.
- A suíte antiga `rendered-html.test.mjs` verifica um skeleton de starter, não os fluxos DocClin; não é homologação funcional deste app.

## Ordem recomendada para fechar as pendências

1. Unificar fonte de dados e IDs; persistir financeiro manual e demais cadastros; tratar concorrência, falhas e backup.
2. Finalização transacional/idempotente: agenda + atendimento + financeiro + consumo de estoque, sem lançamentos duplicados.
3. Regras de documentos obrigatórios por serviço e integração de assinatura com evidência verificável.
4. WhatsApp real, confirmação via webhook e agendamento de retornos com controle de consentimento de contato.
5. Substituir indicadores/sugestões demonstrativos por cálculos das bases reais.
6. Homologar cada fluxo com dados fictícios em ambiente de teste, incluindo recarga, dois usuários, falhas e cancelamentos.

Esses itens de integração foram identificados, não implementados silenciosamente nesta avaliação.
