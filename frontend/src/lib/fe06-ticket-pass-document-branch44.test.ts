import { describe, expect, it, vi } from 'vitest';
import { buildTicketPassesHtml } from './ticket-pass-document';

vi.mock('./pass-image', () => ({
  escapeHtml: (s: string) => s,
  escapeAttribute: (s: string) => s,
  urlToDataUrl: vi.fn(async () => undefined),
}));
vi.mock('./media', () => ({ mediaUrl: (p: string) => `https://cdn.test/${p}` }));
vi.mock('./pass-qr', () => ({ qrDataUrl: vi.fn(async () => 'data:qr') }));
vi.mock('./pass-print', () => ({ passDocumentShell: (_t: string, body: string) => `<html>${body}</html>` }));
vi.mock('./ticketing-status', () => ({ ticketStatusLabel: (s: string) => s }));

describe('ticket-pass-document — branch44 (2 grane bgLayer/meta)', () => {
  it('bgLayer fallback kada nema backgroundUrl', async () => {
    const html = await buildTicketPassesHtml(
      [
        {
          clubName: 'FK',
          matchTitle: 'A vs B',
          matchDate: '2026-11-08',
          category: 'VIP',
          price: '10',
          status: 'ACTIVE',
          ticketRef: 'R1',
        } as never,
      ],
      'Naslov',
    );
    expect(html).toContain('<div class="st-fallback"');
    expect(html).not.toContain('<div class="st-bg-wrap"');
  });

  it('meta prazno kada nema competition/season/round', async () => {
    const html = await buildTicketPassesHtml(
      [
        {
          clubName: 'FK',
          matchTitle: 'A vs B',
          matchDate: '2026-11-08',
          category: 'VIP',
          price: '10',
          status: 'ACTIVE',
        } as never,
      ],
      'Naslov',
    );
    expect(html).not.toContain('<div class="st-meta"');
  });

  it('bgLayer sa backgroundUrl koristi st-bg-wrap', async () => {
    const html = await buildTicketPassesHtml(
      [
        {
          clubName: 'FK',
          matchTitle: 'A vs B',
          matchDate: '2026-11-08',
          category: 'VIP',
          price: '10',
          status: 'ACTIVE',
          backgroundUrl: 'bg.jpg',
          homeCrestUrl: 'crest.png',
          awayCrestUrl: 'crest2.png',
          homeClubName: 'Dom',
          awayClubName: 'Gost',
        } as never,
      ],
      'Naslov',
    );
    expect(html).toContain('<div class="st-bg-wrap"');
  });
});
