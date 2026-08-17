export function paypalBaseUrl(mode: string) {
  return mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

export function formatPaypalAmount(n: number) {
  return n.toFixed(2);
}

export function paypalCustomId(kind: 'tickets' | 'membership' | 'season', id: string) {
  const prefix = kind === 'tickets' ? 't' : kind === 'membership' ? 'm' : 's';
  return `${prefix}:${id}`;
}

export function parsePaypalCustomId(raw?: string | null) {
  if (!raw) return null;
  const sep = raw.indexOf(':');
  if (sep < 1) return null;
  const prefix = raw.slice(0, sep);
  const id = raw.slice(sep + 1).trim();
  if (!id) return null;
  if (prefix === 't') return { kind: 'tickets' as const, id };
  if (prefix === 'm') return { kind: 'membership' as const, id };
  if (prefix === 's') return { kind: 'season' as const, id };
  return null;
}

export function paypalApproveUrl(links?: { rel?: string; href?: string }[]) {
  const hit = links?.find((l) => l.rel === 'approve' || l.rel === 'payer-action');
  return hit?.href?.trim() || null;
}

export function withPaypalReturnUrl(successUrl: string) {
  const filled = successUrl.replace('{CHECKOUT_SESSION_ID}', '');
  try {
    const url = new URL(filled);
    url.searchParams.set('paid', '1');
    url.searchParams.set('provider', 'paypal');
    url.searchParams.delete('session_id');
    return url.toString();
  } catch {
    return filled;
  }
}
