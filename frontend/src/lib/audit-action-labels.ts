export const AUDIT_ACTION_LABELS: Record<string, string> = {
  'settings.update': 'Izmjena postavki',
  'rbac.role.permissions.update': 'Izmjena dozvola uloge',
  'rbac.role.create': 'Kreiranje uloge',
  'rbac.role.delete': 'Brisanje uloge',
  'users.create': 'Kreiranje korisnika',
  'users.update': 'Izmjena korisnika',
  'users.delete': 'Brisanje korisnika',
  'auth.login': 'Prijava',
  'auth.logout': 'Odjava',
};

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}
