import { turntableSource, type TurntableSex } from "./turntable";

// Coordinates use a normalized 2048 × 683 sheet. Whitespace boundaries are
// explicit, so the wide profiles are never sliced into equal, narrower fifths.
const boundaries = {
  female: [0, 450, 835, 1207, 1592, 2048],
  male: [0, 438, 825, 1210, 1597, 2048],
};

export function TurntableImage({ sex, angle, layer, source }: {
  sex: TurntableSex;
  angle: number;
  layer: number;
  source?: string;
}) {
  const view = (angle + 90) / 45;
  const edges = boundaries[sex];
  const left = edges[view];
  const width = edges[view + 1] - left;
  return (
    <svg x={300 - width / 2} y={sex === "female" && layer === 3 ? -32 : -50} width={width} height={683}
      viewBox={`0 0 ${width} 683`} overflow="hidden" aria-hidden="true">
      <image href={source ?? turntableSource(sex, layer)} x={-left} width={2048} height={683}
        preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}
