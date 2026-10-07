# Continuação compacta — 29/09/2026

## Pedido atual
Reavaliar a última entrega (Compras, acessos, segurança, preparação Supabase e modo escuro), verificar funcionamento e resumir a conversa. Esta rodada foi de revisão: não alterou funcionalidades nem aplicou banco remoto.

## Revalidado nesta rodada
- Build Vinext e TypeScript passaram; build mantém aviso de chunks grandes.
- 6/6 testes de segurança passaram, incluindo execução da migração SQL em PGlite, isolamento entre empresas, restrição financeira, versão concorrente e anexos.
- `pnpm audit`: nenhuma vulnerabilidade conhecida; `git diff --check`: sem erros; `/inicio`: HTTP 200.
- Navegador: tutorial Compras carregou `/tutorials/compras-storyboard-v2.png` (1536 px), fecha pelo botão e reaparece sem marcar ocultação.
- Cards inteiros verde/amarelo/vermelho no modo escuro, lâmpada verde acima e vermelha abaixo; status não aparece mais junto ao gráfico.
- Prévia da recepção: sem Financeiro/Precificação/Investimentos/indicadores gerenciais; Configurações somente Aparência e Conta. Perfil do dono restaurado ao final.
- Evidência visual: `/tmp/gest-revisao-compras.png`.

## Pendências encontradas por leitura do código
1. Permissões da interface e RLS divergem: a interface permite liberar Equipe/Relatórios/Assistente para terceiros, mas SQL bloqueia os registros desses módulos para quem não é dono/administrador. Alinhar sem liberar dados financeiros indiretamente.
2. Na prévia do administrador, salvar usuários/permissões usa o cache do administrador; ao recarregar, o provider lê o cache do dono. Alterações feitas nessa prévia podem não sobreviver ao reload. Caminho identificado em `AccessControl.tsx` e `lib/local-store.ts`; não foi executada alteração de permissões nesta revisão.
3. No modo Supabase, salvar acessos chama `load(businessId)`, que ativa loading e desmonta a tela; a mensagem de sucesso do componente anterior pode desaparecer.
4. Cabeçalho de Configurações mantém quantidade demonstrativa de usuários (3 de 10), embora a demonstração tenha quatro perfis. Não representa cadastro real.

## Não confundir preparação com integração pronta
Supabase ainda não conectado/aplicado remotamente. CRUD dos módulos, convites reais, recuperação de senha, upload privado e revogação precisam de homologação real. Compras usa preços simulados; Ponto não tem biometria real. Modo escuro foi conferido nas superfícies revisadas, não certificado em todos os modais e resoluções. Não cadastrar informações sensíveis reais nesta prévia.

## Próximo passo
Corrigir as pendências de acesso acima e conectar ambiente Supabase de homologação; depois testar os fluxos reais. Referência detalhada: `SECURITY_REVIEW.md`. Preservar todas as demais alterações pendentes do projeto. Sem commit, push ou remoções nesta rodada.
