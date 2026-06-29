type Kind = 'tickets' | 'membership';

function key(kind: Kind, sessionId: string) {
  return `fk_confirm_${kind}:${sessionId}`;
}

export function isPaymentSessionConfirmed(kind: Kind, sessionId: string) {
  try {
    return sessionStorage.getItem(key(kind, sessionId)) === '1';
  } catch {
    return false;
  }
}

export function markPaymentSessionConfirmed(kind: Kind, sessionId: string) {
  try {
    sessionStorage.setItem(key(kind, sessionId), '1');
  } catch {
    /* ignore */
  }
}
