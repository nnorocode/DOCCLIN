# Base anatômica — verificação de viabilidade

Verificado em 09/10/2026. Nenhuma substituição visual aplicada nesta etapa.

## Requisito

Dois manequins, masculino e feminino, com pele, tecido subcutâneo, músculos
superficiais/profundos, vasos/nervos e ossos registrados no mesmo sistema de
coordenadas. Renderizar os cinco ângulos com câmera ortográfica, enquadramento,
iluminação e eixo fixos. Não normalizar cada camada por sua própria caixa
envolvente: isso muda sua escala e posição relativa.

## Fontes verificadas

- Z-Anatomy: https://github.com/Z-Anatomy/Models-of-human-anatomy
  O repositório identifica a base como masculina. Disponibiliza um template
  Blender, não um par masculino/feminino pronto com a aparência solicitada.
  Declara CC BY-SA 4.0 e atribuições de componentes; há componentes listados
  com restrição NC. É necessário selecionar e verificar individualmente os
  arquivos utilizados antes de distribuir qualquer derivado no aplicativo.
- Solicitação de modelo feminino, ainda aberta:
  https://github.com/Z-Anatomy/Models-of-human-anatomy/issues/4
  Isso não prova inexistência de alternativas; apenas não confirma uma base
  feminina fornecida por esse projeto.
- BodyParts3D, origem de parte das estruturas:
  https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
  Disponibiliza malhas anatômicas. Não foi validado como conjunto que satisfaça
  os dois manequins e todas as camadas/aparência pedidas.

## Bloqueio atual

Não foi encontrada e validada nesta pesquisa uma base gratuita completa que
atenda aos dois manequins. Conhecer a técnica de renderização não substitui
esse ativo. O protótipo anterior projeta retratos independentes sobre uma
malha externa e não deve ser tratado como solução para registro anatômico.

Um ensaio masculino com uma base gratuita pode ser uma etapa separada, mas
não deve substituir silenciosamente a entrega masculina e feminina. Criar
a anatomia feminina ou adaptar outra superfície requer modelagem e validação;
trocar textura/cabelo não transforma a anatomia masculina em feminina.

## Critérios antes de aprovação

1. Mesma matriz de transformação para todas as estruturas do manequim.
2. Cinco ângulos obtidos exclusivamente por rotação Y de uma mesma cena.
3. Escala e câmera constantes, sem recorte de nariz, cabeça ou pescoço.
4. Inspeção visual frente, ambos os 45° e ambos os 90° em cada camada.
5. Cor e identidade consistentes; sem projeção de fotos incompatíveis.
6. Marcação preservada em coordenadas da cena; não prometer correspondência
   física entre superfície da pele e osso sem definir a projeção.
7. Validar registro anatômico separadamente da consistência geométrica:
   uma câmera fixa garante enquadramento, não a correção dos modelos.
8. Manter o atendimento atual intacto até aprovação explícita do laboratório.
