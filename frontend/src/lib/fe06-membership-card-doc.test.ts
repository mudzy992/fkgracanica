import { describe, expect, it, vi } from 'vitest';
import { buildMembershipCardsHtml } from './membership-card-document';

vi.mock('qrcode', () => ({
  default: { toDataURL: async () => 'data:image/png;base64,qr' },
}));
vi.mock('./pass-image', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./pass-image')>();
  return { ...actual, urlToDataUrl: async () => 'data:image/png;base64,crest' };
});

const card = (over: Record<string, unknown> = {}) => ({
  memberName: 'Ana <Anić>',
  clubName: 'FK Gračanica',
  cardNumber: 'CG 2026 001',
  status: 'ACTIVE',
  validUntil: '31.12.2026.',
  qrValue: 'FKG-1',
  ...over,
}) as never;

describe('buildMembershipCardsHtml', () => {
  it('aktivan status dobija osnovnu značku bez grba koristi fallback', async () => {
    const html = await buildMembershipCardsHtml([card()], 'Članske kartice');
    expect(html).toContain('<title>Članske kartice</title>');
    expect(html).toContain('class="badge"');
    expect(html).toContain('crest-fb');
    expect(html).toContain('Ana &lt;Anić&gt;');
  });

  it('PENDING dobija warn značku, ostali statusi danger', async () => {
    const html = await buildMembershipCardsHtml(
      [card({ status: 'PENDING', crestUrl: 'https://cdn/grb.png' }), card({ status: 'EXPIRED' })],
      'Kartice',
    );
    expect(html).toContain('badge warn');
    expect(html).toContain('badge danger');
    expect(html).toContain('src="data:image/png;base64,crest"');
    expect(html.match(/class="dcard"/g)).toHaveLength(2);
  });
});
