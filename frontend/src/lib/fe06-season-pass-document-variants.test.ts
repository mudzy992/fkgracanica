import { describe, expect, it, vi } from 'vitest';
import { buildSeasonPassHtml } from './season-pass-document';

vi.mock('./pass-image', () => ({
  escapeAttribute: (s: string) => s,
  escapeHtml: (s: string) => s,
  urlToDataUrl: vi.fn(async () => null),
}));
vi.mock('./media', () => ({ mediaUrl: (p: string) => `http://cdn/${p}` }));
vi.mock('./pass-qr', () => ({ qrDataUrl: async () => 'data:qr' }));
vi.mock('./pass-print', () => ({ passDocumentShell: (_: string, body: string) => `<html>${body}</html>` }));
vi.mock('./ticketing-status', () => ({ ticketStatusLabel: (s: string) => s }));

describe('season-pass-document — varijante (3 grane)', () => {
  it('bez crest i bez qr', async () => {
    const html = await buildSeasonPassHtml(
      { clubName: 'FK', label: 'Sezona 1', seasonName: '2025/26', price: '100', status: 'VALID', qrValue: undefined } as never,
      'title',
    );
    expect(html).toContain('FK');
  });

  it('sa crest i cancelled via flag', async () => {
    const html = await buildSeasonPassHtml(
      { clubName: 'FK', label: 'Sezona', seasonName: '2025/26', price: '100', status: 'VALID', crestUrl: 'crest.png', cancelled: true, qrValue: 'qr1', ticketRef: 'R1' } as never,
      'title',
    );
    expect(html).toContain('cancelled');
    expect(html).toContain('data:qr');
  });

  it('sa http crest i status CANCELLED', async () => {
    const html = await buildSeasonPassHtml(
      { clubName: 'FK', label: 'Sezona', seasonName: '2025/26', price: '100', status: 'CANCELLED', crestUrl: 'http://ext/crest.png' } as never,
      'title',
    );
    expect(html).toContain('cancelled');
  });
});
