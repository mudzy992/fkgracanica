export interface TicketCategoryDef {
  id: string;
  label: string;
  price: number;
  isActive: boolean;
}

export const DEFAULT_TICKET_CATEGORIES: TicketCategoryDef[] = [
  { id: 'tribina', label: 'Tribina', price: 5, isActive: true },
  { id: 'sjever', label: 'Sjever', price: 7, isActive: true },
  { id: 'jug', label: 'Jug', price: 7, isActive: true },
  { id: 'vip', label: 'VIP', price: 15, isActive: true },
];

export function parseTicketCategories(
  raw?: string | null,
): TicketCategoryDef[] {
  if (!raw?.trim()) return DEFAULT_TICKET_CATEGORIES;
  try {
    const parsed = JSON.parse(raw) as TicketCategoryDef[];
    if (!Array.isArray(parsed) || !parsed.length)
      return DEFAULT_TICKET_CATEGORIES;
    return parsed.filter((c) => c.id && c.label && typeof c.price === 'number');
  } catch {
    return DEFAULT_TICKET_CATEGORIES;
  }
}

export function activeTicketCategories(categories: TicketCategoryDef[]) {
  return categories.filter((c) => c.isActive !== false);
}

export function findCategoryById(categories: TicketCategoryDef[], id: string) {
  return categories.find((c) => c.id === id);
}

export function findCategoryByLabel(
  categories: TicketCategoryDef[],
  label: string,
) {
  return categories.find((c) => c.label === label);
}
