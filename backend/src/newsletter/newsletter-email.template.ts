export type NewsletterTemplateInput = {
  clubName: string;
  crestUrl?: string;
  subject: string;
  textBody: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  unsubscribeUrl: string;
};

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function textToParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 12px;font-size:16px;line-height:1.5;color:#111">${escapeHtml(p)}</p>`,
    )
    .join('');
}

export function renderNewsletterHtml(input: NewsletterTemplateInput) {
  const name = escapeHtml(input.clubName || 'FK Gračanica');
  const title = escapeHtml(input.subject);
  const crest = input.crestUrl
    ? `<img src="${escapeHtml(input.crestUrl)}" alt="" width="56" height="56" style="display:block;margin:0 auto 12px;border-radius:8px"/>`
    : '';
  const cta =
    input.ctaLabel?.trim() && input.ctaUrl?.trim()
      ? `<p style="margin:24px 0 8px;text-align:center"><a href="${escapeHtml(input.ctaUrl.trim())}" style="display:inline-block;background:#1e3a8a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600">${escapeHtml(input.ctaLabel.trim())}</a></p>`
      : '';
  const unsub = escapeHtml(input.unsubscribeUrl);
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Inter,Arial,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:12px;padding:32px 28px;border:1px solid #e4e4e7">
<tr><td style="text-align:center">${crest}<p style="margin:0 0 20px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#1e3a8a;font-weight:700">${name}</p></td></tr>
<tr><td><h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#111">${title}</h1>${textToParagraphs(input.textBody)}${cta}</td></tr>
<tr><td style="padding-top:28px;border-top:1px solid #e4e4e7"><p style="margin:0;font-size:12px;color:#71717a">${name}</p>
<p style="margin:8px 0 0;font-size:12px;color:#71717a"><a href="${unsub}" style="color:#71717a">Odjava s newslettera</a></p></td></tr>
</table></td></tr></table></body></html>`;
}
