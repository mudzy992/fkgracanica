import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildFormationSlots } from './formation-slots';
import { resolveEventSide } from './live-stats-count.util';
import { isPastDatetime } from './match-retrospective';
import { galleryPreviewUrl, mediaUrl } from './media';
import { museumCategoryLabel } from './museum-categories';
import { urlToDataUrl } from './pass-image';
import { getSettingsTabs } from './settings-sections';
import { safeRichIframeSrc } from './youtube';
import type { MatchEvent } from '../types';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('mediaUrl', () => {
  it('ostavlja apsolutne adrese netaknutim', () => {
    expect(mediaUrl('https://cdn.example/foto.jpg')).toBe('https://cdn.example/foto.jpg');
    expect(mediaUrl('http://cdn.example/foto.jpg')).toBe('http://cdn.example/foto.jpg');
    expect(mediaUrl(null)).toBeUndefined();
  });

  it('galleryPreviewUrl traži medium varijantu', () => {
    expect(galleryPreviewUrl('originals/foto.jpg')).toMatch(/\/medium\/foto\.webp$/);
  });
});

describe('museumCategoryLabel', () => {
  it('prazna vrijednost nema labelu, nepoznata se vraća kakva jeste', () => {
    expect(museumCategoryLabel()).toBe('');
    expect(museumCategoryLabel(null)).toBe('');
    expect(museumCategoryLabel('nepoznato')).toBe('nepoznato');
    expect(museumCategoryLabel('document')).toBe('Dokument');
  });
});

describe('resolveEventSide', () => {
  const event = { teamSide: null, player: { clubId: 'away-1' } } as unknown as MatchEvent;

  it('koristi klub igrača kad strana nije upisana', () => {
    expect(resolveEventSide(event, 'home-1', 'away-1')).toBe('away');
    expect(resolveEventSide(event, 'home-1', 'other')).toBeNull();
    expect(resolveEventSide({ teamSide: 'home' } as MatchEvent, 'home-1', 'away-1')).toBe('home');
  });
});

describe('isPastDatetime', () => {
  it('neispravan datum nije prošlost', () => {
    expect(isPastDatetime('nije-datum')).toBe(false);
    expect(isPastDatetime('2020-01-01T00:00:00.000Z')).toBe(true);
  });
});

describe('buildFormationSlots', () => {
  it('red bez igrača se preskače pri dodjeli', () => {
    const slots = buildFormationSlots([{ playerId: '', positionX: 50, positionY: 10 }]);
    expect(slots.every((slot) => slot.playerId === '')).toBe(true);
  });
});

describe('getSettingsTabs', () => {
  it('isključen live modul skriva grupu Live centar', () => {
    const withLive = getSettingsTabs('public', () => true, true).map((t) => t.id);
    const withoutLive = getSettingsTabs('public', () => true, false).map((t) => t.id);
    expect(withLive).toContain('live');
    expect(withoutLive).not.toContain('live');
    expect(withoutLive[0]).toBe('modules');
  });
});

describe('safeRichIframeSrc — origin parametar', () => {
  it('neispravan origin se odbacuje bez pada', () => {
    expect(safeRichIframeSrc('https://youtube.com/embed/abcdefghijk?origin=bez-url')).toBe(
      'https://youtube.com/embed/abcdefghijk',
    );
    expect(safeRichIframeSrc('https://youtube.com/embed/abcdefghijk?origin=https://fk.ba')).toBe(
      'https://youtube.com/embed/abcdefghijk?origin=https%3A%2F%2Ffk.ba',
    );
  });
});

describe('urlToDataUrl', () => {
  it('greška čitača daje undefined umjesto pada', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, blob: async () => new Blob(['x']) })));
    class BrokenReader {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      result: string | null = null;
      readAsDataURL() {
        this.onerror?.();
      }
    }
    vi.stubGlobal('FileReader', BrokenReader);
    await expect(urlToDataUrl('https://cdn.example/a.jpg')).resolves.toBeUndefined();
  });

  it('neuspješan odgovor i mrežna greška daju undefined', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })));
    await expect(urlToDataUrl('https://cdn.example/a.jpg')).resolves.toBeUndefined();
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    await expect(urlToDataUrl('https://cdn.example/a.jpg')).resolves.toBeUndefined();
  });
});
