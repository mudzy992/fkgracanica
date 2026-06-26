export function mapPitchPosition(x: number, y: number, horizontal: boolean) {
  if (horizontal) return { left: x, top: y };
  return { left: y, top: 100 - x };
}
