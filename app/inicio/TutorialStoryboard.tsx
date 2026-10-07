"use client";

type StoryboardKind = "ponto" | "compras";

const pointCaptions = [
  "Escolha onde a equipe vai registrar o ponto.",
  "Vincule cada funcionário ao seu celular.",
  "O funcionário usa o app no próprio celular.",
  "Na chegada, vá até o ponto definido.",
  "Faça a leitura do rosto pelo celular.",
  "Confirme a chegada com poucos toques.",
  "Ao sair, repita a leitura e registre a saída.",
  "Os registros ficam reunidos no sistema.",
  "O gestor consulta a jornada de cada pessoa.",
];

const purchaseCaptions = [
  "O que você precisa comprar?",
  "Veja como o preço mudou.",
  "Confira preço, frete e prazo.",
  "Escolha a oferta que faz sentido.",
];

export default function TutorialStoryboard({ kind }: { kind: StoryboardKind }) {
  const isPoint = kind === "ponto";
  return <div className={`tutorial-storyboard tutorial-storyboard-${kind}`} role="img" aria-label={`${isPoint ? "Controle a entrada e saída dos colaboradores, tudo em um só lugar." : "Acompanhe os preços e escolha o melhor momento para fazer sua compra."} ${(isPoint ? pointCaptions : purchaseCaptions).join(" ")}`}>
    <img src={`/tutorials/${isPoint ? "ponto-storyboard-v3" : "compras-storyboard-v2"}.png`} alt="" aria-hidden="true" />
  </div>;
}
