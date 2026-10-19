/** New laboratory-only assets. Every layer contains five independently rendered
 * views in order: left profile, left quarter, front, right quarter, right profile.
 * No mirrored view and no legacy atlas fallback.
 */
export const turntableLayers = ["skin", "subcutaneous", "superficial", "deep", "vessels", "bone"] as const;
export type TurntableSex = "female" | "male";
export function turntableSource(sex: TurntableSex, layer: number) {
  return `/clinical-lab/roc-v2/${sex}-${turntableLayers[layer]}.png`;
}
export function hasTurntable(sex: TurntableSex, layer: number) {
  return (sex === "female" || sex === "male") && layer >= 0 && layer < turntableLayers.length;
}
export const turntableSources = (["female", "male"] as const).flatMap(sex =>
  turntableLayers.flatMap((_, layer) => hasTurntable(sex, layer) ? [turntableSource(sex, layer)] : []),
);
