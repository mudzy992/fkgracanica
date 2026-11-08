import { describe, expect, it, vi } from 'vitest';
import { buildTicketPassesHtml } from './ticket-pass-document';

vi.mock('./pass-image', () => ({
  escapeAttribute: (s: string) => s,
  escapeHtml: (s: string) => s,
  urlToDataUrl: vi.fn(async () => null),
}));
vi.mock('./media', () => ({ mediaUrl: (p: string) => `http://cdn/${p}` }));
vi.mock('./pass-qr', () => ({ qrDataUrl: async () => 'data:qr' }));
vi.mock('./pass-print', () => ({ passDocumentShell: (_: string, body: string) => `<html>${body}</html>` }));
vi.mock('./ticketing-status', () => ({ ticketStatusLabel: (s: string) => s }));

describe('ticket-pass-document — varijante (5 grana)', () => {
  it('bez backgroundUrl i bez qr pokriva grane', async () => {
    const html = await buildTicketPassesHtml(
      [
        {
          clubName: 'FK',
          matchTitle: 'M1',
          matchDate: '2026-01-01',
          category: 'A',
          price: '10',
          status: 'VALID',
          homeClubName: 'A',
          awayClubName: 'B',
        },
      ],
      'title',
    );
    expect(html).toContain('st-fallback');
  });

  it('sa backgroundUrl i cancelled', async () => {
    const html = await buildTicketPassesHtml(
      [
        {
          clubName: 'FK',
          backgroundUrl: 'bg.jpg',
          matchTitle: 'M1',
          matchDate: '2026-01-01',
          category: 'A',
          price: '10',
          status: 'CANCELLED',
          qrValue: 'qr1',
          ticketRef: 'R1',
          competitionName: 'Liga',
          seasonName: '2025/26',
          roundLabel: '1',
          homeCrestUrl: 'h.png',
          awayCrestUrl: 'a.png',
        },
      ],
      'title',
    );
    expect(html).toContain('cancelled');
    expect(html).toContain('data:qr');
  });

  it('sa http backgroundUrl i bez crest', async () => {
    const html = await buildTicketPassesHtml(
      [
        {
          clubName: 'FK',
          backgroundUrl: 'http://ext/bg.jpg',
          matchTitle: 'M1',
          matchDate: '2026-01-01',
          category: 'A',
          price: '10',
          status: 'REFUND_REQUESTED',
        },
      ],
      'title',
    );
    expect(html).toContain('cancelled');
  });
});
