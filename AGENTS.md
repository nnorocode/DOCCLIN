# Interface e padrão visual

Antes de alterar a interface do app, leia `DESIGN_SYSTEM.md` e reutilize os tokens de `app/inicio/module-design-system.css` e os componentes aprovados.

- A referência de espaçamento é Manutenção. Não redefina medidas por tela para corrigir diferenças locais; identifique a margem ou o gap adicional.
- Ficha e Consultas: cabeçalho → cards → submenu → conteúdo.
- Os botões dos submenus ocupam a largura disponível; em telas menores, preservam uma única linha com rolagem.
- A engrenagem é a última ação à direita no cabeçalho, também na ordem do JSX.
- Não remova conteúdo, campos ou funcionalidades para corrigir aparência. Não altere outras áreas sem pedido do usuário.
- Confira as telas afetadas no navegador e meça os intervalos reais. Build e TypeScript não comprovam aparência correta.

## Revisor Visual do DOCCLIN

- Após alterações visuais e antes de entregar, acione `revisor_visual_docclin`, definido em `.codex/agents/revisor-visual-docclin.toml`, com pedido original, referências, mudanças da tarefa e estado local anterior.
- Revisão incremental conforme `REVISAO_VISUAL_DOCCLIN.md`: diferenças desde o ponto de controle, áreas solicitadas ainda pendentes e consumidores potencialmente afetados. Não repetir varredura global por padrão.
- O coordenador registra evidências, escopo e pendências antes de atualizar o checkpoint. Hashes não aprovam telas; mudanças preexistentes não pertencem automaticamente à tarefa atual.
- Se agente personalizado ou navegador não estiver disponível, informar a limitação. Revisão manual deve ser identificada como tal. Não declarar início do agente ou aparência validada sem evidências.

## Revisor Funcional do DOCCLIN

- Para auditorias funcionais, use `revisor_funcional_docclin`, definido em `.codex/agents/revisor-funcional-docclin.toml`. Se o carregador não o oferecer nesta sessão, delegue com leitura explícita da configuração e informe esse modo de execução.
- Registre cobertura em `REVISAO_FUNCIONAL_DOCCLIN.md`: abrir tela, testar ação e confirmar persistência/destino são verificações distintas. Preserve itens não testados e bloqueados.
- Primeira auditoria cobre o inventário geral; próximas retomam pendências e mudanças. Testes com escrita usam dados fictícios e ambiente isolado, sem integrações reais. Não altere código ou design durante a auditoria.
