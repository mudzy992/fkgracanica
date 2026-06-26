export const FORMATION_OUTFIELD_TOTAL = 10;

export function formationOutfieldSum(def: string, mid: string, fwd: string): number {
  return [def, mid, fwd].reduce((sum, v) => sum + (Number(v) || 0), 0);
}

export function isFormationSumValid(def: string, mid: string, fwd: string): boolean {
  const nums = [def, mid, fwd].map((v) => Number(v));
  if (nums.some((n) => !Number.isInteger(n) || n < 1)) return false;
  return formationOutfieldSum(def, mid, fwd) === FORMATION_OUTFIELD_TOTAL;
}
