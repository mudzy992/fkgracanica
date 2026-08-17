export function newsletterPublicOrigin() {
  const cors = process.env.CORS_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean)[0];
  if (cors) return cors.replace(/\/$/, '');
  return 'https://fkgracanica.ba101.top';
}

export function unsubscribeUrl(origin: string, token: string) {
  return `${origin}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function withUnsubscribeFooter(html: string, origin: string, token: string) {
  const url = unsubscribeUrl(origin, token);
  return `${html}<p style="margin-top:24px;font-size:12px;color:#666"><a href="${url}">Odjava s newslettera</a></p>`;
}

export function htmlToText(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function campaignFinalStatus(sentCount: number, failCount: number, targetCount: number) {
  if (sentCount + failCount < targetCount) return null;
  return sentCount > 0 ? ('SENT' as const) : ('FAILED' as const);
}
