export function formatGoalDifference(gd: number) {
  if (gd > 0) return `+${gd}`;
  return String(gd);
}
