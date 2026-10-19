# ROC — cinco vistas em imagens

## Revisão atual — 12/10/2026

As 12 folhas originais foram inspecionadas visualmente nesta revisão (cinco
vistas por folha). Isso não é aprovação do conjunto, validação anatômica nem
teste funcional das 60 combinações renderizadas no navegador.

- Cabelo confirmado nas cinco vistas de subcutâneo, superficial, profundo e
  vasos masculinos. Profundo feminino diverge da referência em rosto/pescoço;
  o deslocamento vertical especial existente não corrige essa diferença.
- Uma única edição representativa foi gerada, sem substituir originais:
  `public/clinical-lab/roc-v2/male-subcutaneous-hairless-trial.png`.
- Em Masculino > Tecido subcutâneo, os botões Original / Teste sem cabelo
  alternam a folha no palco e nas miniaturas, conservando recorte e marcações.
  O original continua sendo a opção inicial. Não há persistência dessa escolha.
- Teste visual no navegador: frente, esquerda/direita 45° e 90° com guias;
  nariz/nuca inteiros, sem cabeça vizinha visível e pescoço esfumaçado.
  Sem cabelo no couro cabeludo; a edição ainda conserva detalhes escuros nas
  pálpebras/sobrancelhas. Comparação de marcos é visual aproximada, sem medição
  de registro físico nem garantia de identidade geométrica.
- Próximo passo: avaliar este padrão antes de repetir nas demais folhas com
  falhas. Não houve integração ao atendimento ou alteração do ROC clínico.

Inspeção funcional do código: esta prévia possui ferramentas básicas,
cor, observações, tamanho de zona por slider, desfazer/refazer e lista de
marcas de todos os ângulos do manequim ativo. Faltam mover/redimensionar zonas
  no palco, cursores com hotspot próprio, região editável, procedimentos por
local, orçamento/materiais, rascunhos e histórico. Esses recursos não devem
ser apresentados como implementados aqui. `ClinicalAtlas` e
`ClinicalWorkspace` já contêm estruturas de procedimentos, materiais e
histórico; foram lidos sem alteração, para orientar reaproveitamento futuro.

Os registros de conferência abaixo são históricos; não comprovam aprovação
ou funcionamento integral da versão atual em imagens.

Verificação desta edição: TypeScript `--noEmit --incremental false` passou.
No navegador, um ponto permaneceu exatamente em (299.2444131904184,
112.28608366391808) ao alternar teste/original; desfazer removeu esse ponto.
Sem erros de console capturados nesse teste. Não foi executado build nesta
revisão nem homologado o restante das ferramentas. A tentativa de iniciar
servidor pelo terminal restrito falhou ao abrir a porta de inspector 9229;
a prévia já disponível no navegador permitiu a conferência visual com HMR.

## Registro anterior — 11/10/2026

## Implementação atual

A rota renderiza exclusivamente 12 sequências novas (60 vistas), em
`public/clinical-lab/roc-v2/`, diretamente em SVG, sem a projeção 3D rejeitada.
`TurntableImage.tsx` recorta os cinco painéis sem distorcer suas proporções.
`LegacyProjection.tsx` preserva o experimento anterior
somente para recuperação: não é importado pela página atual.

- Feminino/masculino, seis camadas, cinco ângulos discretos; sem espelhar lados.
- Um único viewBox 600 × 680, com escala uniforme e referências visuais de
  pálpebra/queixo. Sem deformação não uniforme da imagem.
- Miniaturas das cinco vistas e guias opcionais para comparação.
- Imagens pré-carregadas antes da exibição para reduzir piscadas.
- Pontos, zonas, linha em dois cliques, caneta, borracha, desfazer/refazer,
  cor e observações temporárias. Marcações compartilhadas entre camadas do
  mesmo ângulo, sem projeção inventada para os demais ângulos.
- Nenhuma alteração no componente compartilhado com o atendimento.

Geradas pela ferramenta nativa ImageGen, com as peles novas como referência.
Prompts e proveniência: `public/clinical-lab/roc-v2/female-prompts.md` e
`app/laboratorio/roc-3d/MALE-GENERATION.md`. Nenhum atlas antigo é usado nesta rota.

Limitação: são ilustrações geradas; alinhamento visual não garante
identidade geométrica ou precisão anatômica. Crânio usa enquadramento próprio
uniforme (não é registro físico da superfície da pele). Ainda requer aprovação
visual do usuário. Não houve adoção de modelo 3D pago.

## Histórico do experimento anterior (não é a implementação atual)

Rota isolada: `/laboratorio/roc-3d`. A entrada está em `/laboratorio`.
Não substituir `ClinicalAtlas`, não importar esta experiência no atendimento sem aprovação.

## O que este protótipo demonstra

- Uma única malha real, renderizada com OGL já instalado no projeto.
- Rotação contínua de -90° a +90°, sobre Y, com origem e câmera ortográfica fixas.
- Mesmo enquadramento nas seis camadas; nenhuma troca de fotografia por ângulo.
- Texturas existentes do laboratório, cores originais e iluminação neutra fixa.
- Área do modelo maior e coluna de observações compacta.
- Pontos, zonas, linhas de dois cliques, caneta, borracha por arraste, observações e desfazer.
- Marcação em coordenadas locais da malha via raycast, reprojetada na câmera.
- Marcações do lado oposto ficam invisíveis na superfície, mas continuam na lista.
- Nenhuma leitura/gravação de prontuários, históricos, estoque ou financeiro; somente estado React temporário.

## Limites importantes / não considerar concluído

Esta é uma prova da arquitetura de rotação, não o manequim definitivo solicitado.
As fotos atuais foram geradas independentemente: não são mapas UV de um modelo comum.
A projeção estática das fotos sobre a malha ainda pode apresentar emendas e distorções,
principalmente em perfil, orelhas e cabelo. Feminino e masculino usam a mesma malha-base,
com materiais diferentes; não são reconstruções da identidade dos retratos existentes.
O cabelo é textura, não cabelo volumétrico. Ossos e músculos são texturas ilustrativas,
não geometria de crânio, mandíbula, músculos, nervos ou vasos. Não usar para planejamento clínico.
Zonas são representações gráficas ancoradas no centro 3D, não áreas geodésicas da pele.
Linhas ligam amostras 3D; não equivalem a um trajeto anatômico validado sobre a superfície.

Para concluir a fidelidade visual e anatômica, produzir/adquirir dois modelos próprios
com seis camadas anatomicamente registradas, câmera/origem/unidade compartilhadas,
texturas UV coerentes e cabelo 3D. Validar marcos correspondentes profissionalmente.
Marcação de pele não corresponde automaticamente a um mesmo ponto físico de osso:
isso precisa de uma definição explícita de projeção entre estruturas e validação.
Os pontos atuais dos prontuários são 2D e não devem ser migrados automaticamente
para esta malha sem correspondência validada e preservação dos originais.

## Origem

`public/clinical-lab/rotation-head.glb`: Infinite, 3D Head Scan, Lee Perry-Smith,
CC BY 3.0, distribuído nos exemplos oficiais de Three.js. Licença e atribuição
em `public/clinical-lab/rotation-head-LICENSE.md` e no rodapé da experiência.
Geometria original preservada; materiais/projeção adaptados no shader local.

## Conferência

TypeScript (`--noEmit --incremental false`) e build Vinext concluídos.
Conferência no navegador: frente, 45° e perfil; apresentação feminina e masculina;
criar ponto; seis camadas com a mesma coordenada de tela do ponto frontal
(49.12545054380003%, 24.64756774902343%); girar com a marcação na superfície;
linha com dois cliques; borracha por arraste e desfazer. Foi corrigida uma
condição de corrida entre projeções do frame anterior e exclusão da marcação,
e a exclusão foi retestada sem erro. Captura em `preview.jpg`.
Ainda não homologados: redimensionamento de zonas, caneta prolongada, tela estreita,
fidelidade anatômica, todas as combinações visuais de camada/gênero/ângulo.
Isso não é validação clínica nem aprovação de identidade/texturas.
# Refinamento visual — 9 de outubro de 2026

Recalibrada a projeção lateral usando regiões separadas para occipital, orelha
e face. O fundo branco dos atlas deixa de ser aplicado diretamente na malha;
o pescoço e o topo usam uma projeção afunilada para reduzir faixas esticadas.
A transição frontal/lateral ocorre atrás dos traços faciais. A camada óssea
agora usa também a imagem de perfil do atlas, em coordenadas fixas da malha.
Iluminação suavizada, sem alterar câmera, eixo ou coordenadas das marcações.

Conferência visual: feminino pele a 45° e 90°, masculino músculos superficiais
e ossos a -90°. TypeScript e build passaram. Ainda há deformação de detalhes
e diferenças entre a geometria escaneada e as ilustrações; o crânio continua
sendo uma textura na malha externa. Não representa aprovação anatômica nem
substitui modelos próprios com texturas UV registradas.
