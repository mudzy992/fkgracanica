import { afterEach, describe, expect, it, vi } from 'vitest';
import { escapeAttribute } from './pass-image';
import { openPrintHtml } from './pass-print';
import { buildTicketPassesHtml, type TicketPassPrintData } from './ticket-pass-document';
import { buildMembershipCardsHtml, type MembershipCardPrintData } from './membership-card-document';
import { buildSeasonPassHtml } from './season-pass-document';
import type { SeasonPassVisualData } from './season-pass-visual';

vi.mock('./pass-qr', () => ({ qrDataUrl: async (value: string) => `data:image/png;base64,${value.length}` }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

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

describe('P-FE06-27 escapeovanje URL atributa', () => {
  it('escapeAttribute escapeuje HTML znake i apostrof', () => {
    expect(escapeAttribute(`a&b<c>d"e'f`)).toBe('a&amp;b&lt;c&gt;d&quot;e&#39;f');
  });

  it('putanja s navodnikom ne ubacuje atribute ni u jedan dokument', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('isolated synthetic fetch failure')));
    const unsafe = 'https://example.invalid/x\" onerror=\"window.__fe06Probe=1';
    const injectedBackground = "https://cdn.example.test/bg.jpg');window.__fe06Probe=1;('";
    const [membershipDoc, seasonDoc, ticketDoc] = await Promise.all([
      buildMembershipCardsHtml([{ ...membership, crestUrl: unsafe }], 'Kartica'),
      buildSeasonPassHtml({ ...season, crestUrl: unsafe }, 'Karta'),
      buildTicketPassesHtml([{ ...ticket, homeCrestUrl: unsafe, backgroundUrl: injectedBackground }], 'Ulaznica'),
    ]);
    for (const html of [membershipDoc, seasonDoc, ticketDoc]) {
      const doc = parsed(html);
      expect(doc.querySelector('img[onerror]')).toBeNull();
      // Escapeovani tekst smije sadržavati string, ali nijedan element ne smije imati takav atribut.
      expect(Array.from(doc.querySelectorAll('*')).some((el) => el.hasAttribute('onerror'))).toBe(false);
    }
    expect(query(membershipDoc, '.crest')?.getAttribute('src')).toBe(unsafe);
    expect(query(seasonDoc, '.sp-crest')?.getAttribute('src')).toBe(unsafe);
    expect(query(ticketDoc, '.st-team-crest')?.getAttribute('src')).toBe(unsafe);
    expect(ticketDoc).toContain('&#39;');
    expect(ticketDoc).not.toContain("');window.__fe06Probe");
    expect(query(ticketDoc, '.st-bg')?.getAttribute('style')).toContain('url(');
  });
});

describe('P-FE06-28 štampa tačno jednom', () => {
  const popup = () => {
    let load!: () => void;
    const printed = vi.fn();
    const win = {
      focus: vi.fn(),
      print: printed,
      addEventListener: (_name: string, callback: () => void) => { load = callback; },
    };
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:synthetic'), revokeObjectURL: vi.fn() });
    vi.spyOn(window, 'open').mockReturnValue(win as unknown as Window);
    return { win, printed, load: () => load() };
  };

  it('load i fallback timer ne otvaraju dva dijaloga', () => {
    vi.useFakeTimers();
    const { printed, load } = popup();
    openPrintHtml('<p>synthetic</p>');
    load();
    vi.advanceTimersByTime(600);
    expect(printed).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(5000);
    expect(printed).toHaveBeenCalledTimes(1);
  });

  it('kada load stigne poslije fallbacka, nema druge štampe', () => {
    vi.useFakeTimers();
    const { printed, load } = popup();
    openPrintHtml('<p>synthetic</p>');
    vi.advanceTimersByTime(2500);
    expect(printed).toHaveBeenCalledTimes(1);
    load();
    vi.advanceTimersByTime(600);
    expect(printed).toHaveBeenCalledTimes(1);
  });

  it('bez popupa iframe fallback štampa jednom, i nakon kasnog load-a', () => {
    vi.useFakeTimers();
    const printed = vi.fn();
    const fakeDoc = { open: vi.fn(), write: vi.fn(), close: vi.fn() };
    const fakeWin = { focus: vi.fn(), print: printed };
    const originalWindow = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');
    const originalDocument = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentDocument');
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', { configurable: true, get: () => fakeWin });
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentDocument', { configurable: true, get: () => fakeDoc });
    const created: HTMLIFrameElement[] = [];
    const create = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string, options?: ElementCreationOptions) => {
      const element = create(tag, options);
      if (tag === 'iframe') created.push(element as HTMLIFrameElement);
      return element;
    }) as typeof document.createElement);
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:synthetic'), revokeObjectURL: vi.fn() });
    vi.spyOn(window, 'open').mockReturnValue(null);
    try {
      openPrintHtml('<p>fallback</p>');
      expect(created).toHaveLength(1);
      expect(fakeDoc.write).toHaveBeenCalledWith('<p>fallback</p>');
      created[0].onload?.(new Event('load'));
      vi.advanceTimersByTime(500);
      expect(printed).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(5000);
      expect(printed).toHaveBeenCalledTimes(1);
    } finally {
      if (originalWindow) Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', originalWindow);
      if (originalDocument) Object.defineProperty(HTMLIFrameElement.prototype, 'contentDocument', originalDocument);
    }
  });
});
