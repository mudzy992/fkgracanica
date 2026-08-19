const VISITOR_ID_KEY = 'fk_visitor_id';
const VISIT_SESSION_KEY = 'fk_visit_sent';

function generateId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getOrCreateVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;
    const id = generateId();
    localStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch {
    return generateId();
  }
}

export function wasVisitSentThisSession(): boolean {
  try {
    return sessionStorage.getItem(VISIT_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function markVisitSent(): void {
  try {
    sessionStorage.setItem(VISIT_SESSION_KEY, '1');
  } catch {
    // ignore
  }
}
