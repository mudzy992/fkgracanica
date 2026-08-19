export const KPI_LABELS: Record<string, string> = {
  users: 'Korisnici',
  members: 'Članovi',
  activeMemberships: 'Aktivna članstva',
  publishedNews: 'Objavljene vijesti',
  matches: 'Utakmice',
  goals: 'Golovi',
  ticketsSold: 'Prodane ulaznice',
  pendingNews: 'Vijesti na odobrenju',
  pendingGalleries: 'Galerije na odobrenju',
  pendingLive: 'Live izvještaji',
  pendingMemberships: 'Članarine na čekanju',
  unreadInbox: 'Nepročitan inbox',
  uniqueVisitorsWeb: 'Posjetioci web (30d)',
  uniqueVisitorsMobile: 'Posjetioci mobile (30d)',
  uniqueVisitorsTotal30d: 'Ukupni posjetioci (30d)',
};

export function kpiLabel(key: string): string {
  return KPI_LABELS[key] ?? key;
}
