# ROC V4 — resultado da validação

Data: 2026-10-12. Status: **60 imagens geradas; consistência reprovada; não implantadas no facial**.

## Arquivos e procedência

- 2 personagens × 6 camadas × 5 ângulos = 60 arquivos individuais.
- PNG, 1024 × 1024, 60 hashes SHA256 distintos; nenhum arquivo final duplicado.
- Ferramenta nativa image_gen, usando a pele do próprio ângulo como referência direta para cada camada interna. Frontal do mesmo sexo/camada também usado em parte das gerações como referência de material.
- Redimensionamento uniforme com sips; sem recorte, deformação, deslocamento ou correção de cor.
- Prompts, referências e originais: generation.json (pele) e internal-generation.json (50 camadas internas).
- Pranchas V2/V3 e revisão original de pele preservadas; não usadas como substituto dos 60 arquivos.

## Verificação realizada

- A página review.html decodificou 60/60 imagens a 1024 × 1024 no navegador.
- Alternância das seis camadas e controle de sobreposição de pele funcionam no comparador. Ambos os personagens e os cinco ângulos aparecem juntos.
- Imagens inspecionadas durante a geração; comparação adicional com pele em 50% de opacidade, sem transformações específicas por camada.
- Cabelo do couro cabeludo ausente nas camadas internas. Algumas imagens mantêm cílios e sobrancelhas.
- Primeiros ossos femininos com orelhas externas e pescoço de tecido foram rejeitados e regenerados. Primeira proposta subcutânea masculina influenciada pela referência feminina foi rejeitada; masculino regenerado com referências masculinas.

## Divergências que impedem aprovação

1. Músculos superficiais masculinos: deslocamentos visíveis em olhos, nariz, boca, mandíbula e orelhas; a sobreposição produz contornos duplicados. O problema não é apenas a diferença natural de superfície entre tecidos.
2. Também existem diferenças nas camadas profundas/vasculares masculinas e em vistas femininas, especialmente no perfil esquerdo muscular superficial.
3. Volumes cranianos e regiões orbitárias ósseas não foram registrados anatomicamente. Referências 2D não permitem validar que os ossos pertencem exatamente à mesma cabeça.
4. Vasos femininos left45: após falhas da ferramenta, a imagem obtida usa uma base lisa de manequim, diferente da base muscular das outras quatro vistas. Está registrada como candidata divergente, não aprovada.
5. As cores gerais dos tecidos se aproximam, mas não existe material único compartilhado nem garantia de cor idêntica entre gerações.

Evidência: alignment-review.png mostra os músculos superficiais sobrepostos à pele a 50%. O cabelo que aparece nessa captura vem da sobreposição da imagem de pele, não da camada muscular.

## Aplicação

A condição do plano era apresentar divergências antes da implantação caso a geração continuasse alterando o personagem. Portanto, **o visualizador /laboratorio/roc-3d continua com seus arquivos anteriores**. Não foram removidos controles nem ajustadas marcações para disfarçar as diferenças. A adaptação para imagens individuais e o teste das marcações no visualizador ficam pendentes de um conjunto visual aprovado.

Não declarar precisão milimétrica, registro geométrico ou fidelidade anatômica. Não há validação clínica deste material.
