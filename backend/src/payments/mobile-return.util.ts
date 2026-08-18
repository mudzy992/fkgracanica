export function isAllowedAppReturn(url: string): boolean {
  const lower = url.trim().toLowerCase();
  return lower.startsWith('fkgracanica:') || lower.startsWith('exp:') || lower.startsWith('exps:');
}

export function buildMobileReturnUrl(query: Record<string, string | undefined>): string {
  const fallback = 'fkgracanica://payment-return';
  const to = query.to && isAllowedAppReturn(query.to) ? query.to.trim() : fallback;
  const extra: Record<string, string> = {};
  if (query.kind) extra.kind = query.kind;
  if (query.paid) extra.paid = query.paid;
  if (query.cancelled) extra.cancelled = query.cancelled;
  if (query.session_id) extra.session_id = query.session_id;
  if (query.provider) extra.provider = query.provider;
  return appendQuery(to, extra);
}

function appendQuery(base: string, params: Record<string, string>): string {
  const entries = Object.entries(params).filter(([, value]) => Boolean(value));
  if (entries.length === 0) return base;
  const joiner = base.includes('?') ? '&' : '?';
  const qs = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return `${base}${joiner}${qs}`;
}
