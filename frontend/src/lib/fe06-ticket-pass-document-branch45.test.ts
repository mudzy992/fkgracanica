import { describe, expect, it, vi } from 'vitest';
import { buildTicketPassesHtml } from './ticket-pass-document';

vi.mock('./pass-image', () => ({
  escapeAttribute: (v: string) => v,
  escapeHtml: (v: string) => v,
  urlToDataUrl: async (u: string) => (u.includes('bg.jpg') ? 'data:bg' : undefined),
}));
vi.mock('./media', () => ({ mediaUrl: (p: string) => (p === 'fail.png' ? undefined : p ? `https://cdn/${p}` : undefined) }));
vi.mock('./pass-qr', () => ({ qrDataUrl: async (v: string) => (v ? 'data:qr' : '') }));
vi.mock('./pass-print', () => ({ passDocumentShell: (_t: string, b: string) => b }));
vi.mock('./ticketing-status', () => ({ ticketStatusLabel: (s: string) => s }));

describe('ticket-pass-document — branch45 (bgLayer i meta fallback)', () => {
  it('bg fallback i meta prazno — st-fallback bez meta, bez ref/qr', async () => {
    const html = await buildTicketPassesHtml(
      [
        {
          clubName: 'FK',
          matchTitle: 'A vs B',
          matchDate: '2026-11-09',
          category: 'Tribina',
          price: '10',
          status: 'ACTIVE',
        } as never,
      ],
      'Naslov',
    );
    expect(html).toContain('FK');
    expect(html).toContain('Tribina');
    expect(html).toContain('st-');
  });

  it('meta sa vrijednostima i ref/qr/crest prikazuje sve', async () => {
    const html = await buildTicketPassesHtml(
      [
        {
          clubName: 'FK',
          matchTitle: 'A vs B',
          matchDate: '2026-11-09',
          category: 'Tribina',
          price: '10',
          status: 'ACTIVE',
          competitionName: 'Liga',
          seasonName: '2024/25',
          roundLabel: '1. kolo',
          ticketRef: 'ABC123',
          qrValue: 'qr-123',
          homeClubName: 'A',
          awayClubName: 'B',
          homeCrestUrl: 'crestA.png',
          awayCrestUrl: 'crestB.png',
        } as never,
      ],
      'Naslov',
    );
    expect(html).toContain('Liga');
    expect(html).toContain('st-meta');
    expect(html).toContain('ABC123');
    expect(html).toContain('st-ref');
    expect(html).toContain('st-qr');
  });

  it('bg truthy (http) i cancelled status pokriva true grane', async () => {
    const html = await buildTicketPassesHtml(
      [
        {
          clubName: 'FK',
          matchTitle: 'A vs B',
          matchDate: '2026-11-09',
          category: 'Tribina',
          price: '10',
          status: 'CANCELLED',
          backgroundUrl: 'http://example.com/bg.jpg',
          competitionName: 'Kup',
          ticketRef: undefined,
          qrValue: undefined,
        } as never,
      ],
      'Naslov',
    );
    expect(html).toContain('sticket cancelled');
    expect(html).toContain('Kup');
    expect(html).toContain('st-bg-wrap');
    expect(html).toContain('data:bg');
  });

  it('crest fallback bez path i mediaUrl undefined pokriva else grane', async () => {
    const html = await buildTicketPassesHtml(
      [
        {
          clubName: 'FK',
          matchTitle: 'A vs B',
          matchDate: '2026-11-09',
          category: 'Tribina',
          price: '10',
          status: 'ACTIVE',
          homeCrestUrl: undefined,
          homeClubName: 'C',
          awayCrestUrl: undefined,
          awayClubName: undefined,
        } as never,
      ],
      'Naslov',
    );
    expect(html).toContain('st-team-fb');
  });

  it('crest sa fail.png pokriva url falsy i src falsy grane 101/103', async () => {
    const html = await buildTicketPassesHtml(
      [
        {
          clubName: 'FK',
          matchTitle: 'A vs B',
          matchDate: '2026-11-09',
          category: 'Tribina',
          price: '10',
          status: 'ACTIVE',
          homeCrestUrl: 'fail.png',
          homeClubName: 'C',
          awayCrestUrl: 'fail.png',
          awayClubName: 'D',
          backgroundUrl: 'fail.png',
        } as never,
      ],
      'Naslov',
    );
    // fallback FK za crest, i fallback bg
    expect(html).toContain('st-team-fb');
    expect(html).toContain('FK');
    expect(html).toContain('st-fallback');
  });
});
