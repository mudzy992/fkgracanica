import { afterEach, describe, expect, it, vi } from 'vitest';
import { escapeHtml, urlToDataUrl } from './pass-image';
import { downloadHtml, passDocumentShell } from './pass-print';
import { buildTicketPassesHtml, type TicketPassPrintData } from './ticket-pass-document';
import { buildMembershipCardsHtml, type MembershipCardPrintData } from './membership-card-document';
import { buildSeasonPassHtml } from './season-pass-document';
import type { SeasonPassVisualData } from './season-pass-visual';

vi.mock('./pass-qr', () => ({ qrDataUrl: async (value: string) => `data:image/png;base64,${value.length}` }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const parsed = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const query = (html: string, selector: string) => parsed(html).querySelector(selector);

const ticket: TicketPassPrintData = {
  clubName: 'FK Gračanica', backgroundUrl: 'https://cdn.example.test/bg.jpg',
  matchTitle: 'Domaći — Gosti', matchDate: '15.03.2026. 15:00',
  homeClubName: 'Domaći', awayClubName: 'Gosti',
  homeCrestUrl: 'https://cdn.example.test/home.png', awayCrestUrl: 'https://cdn.example.test/away.png',
  competitionName: 'Liga', seasonName: '2025/26', roundLabel: '3. kolo',
  category: 'Tribina', price: '10', status: 'ACTIVE', qrValue: 'ticket-qr', ticketRef: 'ABCD1234',
};

const membership: MembershipCardPrintData = {
  memberName: 'Amina Hodžić', clubName: 'FK Gračanica', crestUrl: 'https://cdn.example.test/crest.png',
  cardNumber: 'M-001', status: 'ACTIVE', validUntil: '31.12.2026', qrValue: 'member-qr',
};

const season: SeasonPassVisualData = {
  clubName: 'FK Gračanica', crestUrl: 'https://cdn.example.test/crest.png', label: 'Sezonska',
  seasonName: '2025/26', price: '100', status: 'ACTIVE', qrValue: 'season-qr', ticketRef: 'SEASON01',
};

describe('pass-image', () => {
  it('escapeHtml pokriva sve četiri opasna znaka', () => {
    expect(escapeHtml(`<a href="x">Tom & Jerry</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;',
    );
  });

  it('urlToDataUrl vraća data URL za uspješan odgovor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, blob: async () => new Blob(['x'], { type: 'image/png' }),
    }));
    await expect(urlToDataUrl('https://cdn.example.test/a.png')).resolves.toMatch(/^data:/);
  });

  it('urlToDataUrl vraća undefined za grešku, neuspjeh i odbijeni fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(urlToDataUrl('https://cdn.example.test/missing.png')).resolves.toBeUndefined();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('synthetic network failure')));
    await expect(urlToDataUrl('https://cdn.example.test/offline.png')).resolves.toBeUndefined();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, blob: async () => new Blob(['x']), // FileReader bez onload-a se ne završava
    }));
    const reader = vi.spyOn(window, 'FileReader').mockImplementation(() => {
      throw new Error('isolated FileReader failure');
    });
    await expect(urlToDataUrl('https://cdn.example.test/reader.png')).resolves.toBeUndefined();
    reader.mockRestore();
  });
});

describe('pass-print', () => {
  it('downloadHtml pokreće preuzimanje i oslobađa URL', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const revoke = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:synthetic'), revokeObjectURL: revoke });
    downloadHtml('kartica.html', '<p>x</p>');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledWith('blob:synthetic');
  });

  it('passDocumentShell escapeuje naslov i sadrži print kontrolu', () => {
    const html = passDocumentShell('<Zlonamjerni>', '<div class="wrap-item">tijelo</div>');
    expect(query(html, 'title')?.textContent).toBe('<Zlonamjerni>');
    expect(query(html, '.wrap')?.innerHTML).toContain('wrap-item');
    expect(query(html, 'button')?.getAttribute('onclick')).toBe('window.print()');
  });
});

describe('dokumenti za štampu', () => {
  it('ulaznica sadrži sve podatke i escapeuje tekstualna polja', async () => {
    const html = await buildTicketPassesHtml([
      { ...ticket, clubName: '<img src=x onerror=alert(1)>', category: 'A & B' },
    ], 'Ulaznica');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('A &amp; B');
    expect(html).toContain('Domaći');
    expect(html).toContain('Gosti');
    expect(html).toContain('Liga · 2025/26 · 3. kolo');
    expect(html).toContain('data:image/png;base64,9');
  });

  it('otkazana ulaznica dobija cancelled klasu, a bez backgrounda fallback', async () => {
    const cancelled = await buildTicketPassesHtml([{ ...ticket, status: 'CANCELLED', backgroundUrl: undefined }], 'x');
    expect(query(cancelled, '.sticket')?.className).toBe('sticket cancelled');
    expect(query(cancelled, '.st-fallback')).not.toBeNull();
    expect(query(cancelled, '.st-bg-wrap')).toBeNull();
    // Pozivalac odlučuje o QR-u; dokument ga prikazuje kad je vrijednost zadana.
    expect(query(cancelled, '.st-qr')).not.toBeNull();
    const withoutQr = await buildTicketPassesHtml([{ ...ticket, qrValue: undefined }], 'x');
    expect(query(withoutQr, '.st-qr')).toBeNull();
  });

  it('ulaznica bez bedževa i referenci koristi crtice i ne prikazuje ref', async () => {
    const bare = await buildTicketPassesHtml([{
      clubName: 'Klub', matchTitle: 'x', matchDate: 'y', category: 'A', price: '0', status: 'ACTIVE',
    }], 'x');
    expect(bare).toContain('>—<');
    expect(query(bare, '.st-ref')).toBeNull();
    expect(query(bare, '.st-team-fb')).not.toBeNull();
  });

  it('članska kartica escapeuje ime i prikazuje status i QR', async () => {
    const html = await buildMembershipCardsHtml([
      { ...membership, memberName: '<b>Amina</b>', cardNumber: 'M & 1' },
    ], 'Kartice');
    expect(html).not.toContain('<b>Amina</b>');
    expect(html).toContain('&lt;b&gt;Amina&lt;/b&gt;');
    expect(html).toContain('M &amp; 1');
    expect(html).toContain('Aktivno');
    expect(query(html, '.qr')?.getAttribute('src')).toBe('data:image/png;base64,9');
  });

  it('sezonska karta escapeuje labelu i označava otkazanu', async () => {
    const html = await buildSeasonPassHtml({ ...season, label: '<i>Sezona</i>', status: 'REFUNDED' }, 'x');
    expect(html).toContain('&lt;i&gt;Sezona&lt;/i&gt;');
    expect(html).toContain('class="spass cancelled"');
    const withoutQr = await buildSeasonPassHtml({ ...season, qrValue: undefined }, 'x');
    expect(query(withoutQr, '.sp-qr')).toBeNull();
  });
});
