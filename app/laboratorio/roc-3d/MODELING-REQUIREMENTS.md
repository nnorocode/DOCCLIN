# ROC — requisitos de modelagem e bloqueio de implantação

## Estado verificado em 2026-10-12

A produção das 60 imagens e sua implantação estão bloqueadas pela ausência dos dois modelos personalizados com anatomia em camadas. Nenhuma nova imagem foi produzida nesta verificação e o visualizador continua usando roc-v2. Não apresentar os conjuntos gerados anteriormente como solução aprovada.

Inspeção direta de `public/clinical-lab/rotation-head.glb`: um mesh chamado LeePerrySmith, uma primitive e um material. É a cabeça externa de estudo documentada em rotation-head-LICENSE.md; não fornece os dois personagens nem suas camadas internas. Blender não está no PATH nem no diretório /Applications. Não há ferramenta de modelagem 3D entre as ferramentas disponíveis nesta sessão. Instalar um renderizador, por si só, não produz a modelagem anatômica necessária.

## Referências de identidade

- Mulher: `public/clinical-lab/roc-v2/female-skin.png`, vista frontal.
- Homem: `public/clinical-lab/roc-v3/male-skin-candidate.png`, vista frontal; rosto fino e aparência natural.
- Demais vistas das referências são auxiliares e contêm inconsistências; não devem definir geometrias independentes.

## Entrega necessária de modelagem

Dois arquivos de cena editáveis, um por personagem, com geometria personalizada e grupos separáveis para pele, subcutâneo, músculos superficiais, músculos profundos, vasos/nervos e ossos. Materiais e texturas incluídos. Todas as estruturas devem compartilhar origem, orientação e escala; nenhuma camada deve requerer correção de posição, escala ou câmera ao alternar sua visibilidade. Cabelo pertence exclusivamente à pele.

As superfícies internas não têm o mesmo contorno da pele: devem corresponder espacialmente ao mesmo personagem. Ossos não incluem cartilagens, orelhas ou volume dos tecidos externos. As referências não oferecem medidas físicas ou anatomia interna real; unidades em milímetros são uma convenção do modelo, não prova de precisão anatômica.

## Sequência de validação e renderização

1. Aprovar a aparência de cada modelo de pele em −90°, −45°, 0°, 45° e 90° antes de concluir as camadas internas.
2. Conferir as estruturas em sobreposição no mesmo espaço 3D e documentar pontos de referência e escala. Não declarar precisão milimétrica real sem dados de medição.
3. Fixar câmera ortográfica, resolução 1024 × 1024, enquadramento, iluminação neutra, exposição e gerenciamento de cor. Manter os mesmos materiais em todos os ângulos; não corrigir cor por imagem. Usar fundo branco e término suave do pescoço.
4. Exportar 60 PNGs individuais, acompanhados dos arquivos de cena e parâmetros reproduzíveis. Alterar somente ângulo de câmera e visibilidade dos grupos.
5. Conferir integralidade das vistas, ausência de cabelo nas camadas internas, identidade, correspondência geométrica e estabilidade dos materiais.
6. Só então adaptar o visualizador do laboratório para PNGs individuais, sem recortes de pranchas ou deslocamentos por camada. Preservar os assets anteriores para recuperação e testar todas as combinações e marcações.

Não substituir esta etapa por gerações independentes, deformações da cabeça genérica ou projeção das pranchas rejeitadas. O próximo insumo necessário é a modelagem personalizada dos dois personagens, produzida e validada em uma ferramenta de criação 3D.
