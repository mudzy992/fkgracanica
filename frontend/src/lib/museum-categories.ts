export const MUSEUM_CATEGORIES = [
  { value: 'artifact', label: 'Artefakt' },
  { value: 'photo', label: 'Fotografija' },
  { value: 'jersey', label: 'Dres' },
  { value: 'trophy', label: 'Trofej' },
  { value: 'document', label: 'Dokument' },
  { value: 'other', label: 'Ostalo' },
] as const;

export function museumCategoryLabel(value?: string | null): string {
  if (!value) return '';
  return MUSEUM_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
