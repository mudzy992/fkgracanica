import { describe, expect, it } from 'vitest';
import {
  isInvalidChangedYouTubeUrl,
  isYouTubeVideoId,
  parseYouTubeId,
  safeRichIframeSrc,
} from './youtube';
import {
  PAYMENT_STATUS_OPTIONS,
  PROVIDER_META,
  formatDay,
  formatKm,
  isFinanceProvider,
  localIsoDate,
  paymentStatusLabel,
  paymentStatusVariant,
} from '../pages/admin/finance/finance-labels';

const ID = 'dQw4w9WgXcQ';

describe('isYouTubeVideoId', () => {
  it('prihvata tačno 11 dozvoljenih znakova', () => {
    expect(isYouTubeVideoId(ID)).toBe(true);
    expect(isYouTubeVideoId('short')).toBe(false);
    expect(isYouTubeVideoId(`${ID} `)).toBe(false);
  });
});

describe('parseYouTubeId', () => {
  it.each([
    [`https://www.youtube.com/watch?v=${ID}`, ID],
    [`https://youtube.com/watch/?v=${ID}`, ID],
    [`https://youtu.be/${ID}`, ID],
    [`https://m.youtube.com/embed/${ID}`, ID],
    [`https://www.youtube.com/live/${ID}?feature=share`, ID],
    [`https://www.youtube.com/shorts/${ID}`, ID],
  ])('izvlači ID iz %s', (url, expected) => {
    expect(parseYouTubeId(url)).toBe(expected);
  });

  it('odbija nevalidne oblike i hostove', () => {
    expect(parseYouTubeId('nije-url')).toBeNull();
    expect(parseYouTubeId(`ftp://youtube.com/watch?v=${ID}`)).toBeNull();
    expect(parseYouTubeId(`https://user:pass@youtube.com/watch?v=${ID}`)).toBeNull();
    expect(parseYouTubeId(`https://evilyoutube.com/watch?v=${ID}`)).toBeNull();
    expect(parseYouTubeId(`https://youtube.com./watch?v=${ID}`)).toBeNull();
    expect(parseYouTubeId('https://www.youtube.com/watch?v=kratko')).toBeNull();
    expect(parseYouTubeId(`https://www.youtube.com/channel/${ID}`)).toBeNull();
    expect(parseYouTubeId(`https://youtu.be/${ID}/extra`)).toBeNull();
  });
});

describe('isInvalidChangedYouTubeUrl', () => {
  it('prazna i nepromijenjena vrijednost nisu greška', () => {
    expect(isInvalidChangedYouTubeUrl(undefined)).toBe(false);
    expect(isInvalidChangedYouTubeUrl(null, 'https://x')).toBe(false);
    expect(isInvalidChangedYouTubeUrl('', '')).toBe(false);
    expect(isInvalidChangedYouTubeUrl('   ', null)).toBe(false);
    expect(isInvalidChangedYouTubeUrl('https://youtu.be/abc', 'https://youtu.be/abc')).toBe(false);
  });

  it('promijenjena nevalidna vrijednost jeste greška', () => {
    expect(isInvalidChangedYouTubeUrl('https://example.com/video')).toBe(true);
    expect(isInvalidChangedYouTubeUrl(`https://youtu.be/${ID}`)).toBe(false);
  });
});

describe('safeRichIframeSrc', () => {
  it('normalizuje YouTube embed i zadržava dozvoljene parametre', () => {
    const out = safeRichIframeSrc(
      `https://www.youtube.com/embed/${ID}?start=30&autoplay=1&controls=1&rel=0&hl=bs`,
    );
    expect(out).toBe(
      `https://www.youtube.com/embed/${ID}?start=30&autoplay=1&controls=1&rel=0&hl=bs`,
    );
  });

  it('odbacuje nedozvoljene parametre i loše izvore', () => {
    expect(safeRichIframeSrc(`https://www.youtube.com/embed/${ID}?evil=1`)).toBe(
      `https://www.youtube.com/embed/${ID}`,
    );
    expect(safeRichIframeSrc('http://www.youtube.com/embed/abc')).toBeNull();
    expect(safeRichIframeSrc(`https://youtube.com:8443/embed/${ID}`)).toBeNull();
    expect(safeRichIframeSrc('https://example.com/embed/abc')).toBeNull();
    expect(safeRichIframeSrc('https://www.youtube.com/embed/kratko')).toBeNull();
  });

  it('playlista mora imati validan list', () => {
    expect(safeRichIframeSrc('https://www.youtube.com/embed/videoseries')).toBeNull();
    expect(
      safeRichIframeSrc('https://www.youtube.com/embed/videoseries?list=PL123456'),
    ).toBe('https://www.youtube.com/embed/videoseries?list=PL123456');
  });

  it('propusta Vimeo embed nepromijenjen', () => {
    expect(safeRichIframeSrc('https://player.vimeo.com/video/12345')).toBe(
      'https://player.vimeo.com/video/12345',
    );
  });

  it('validira posebne parametre', () => {
    expect(safeRichIframeSrc(`https://www.youtube.com/embed/${ID}?color=red`)).toContain(
      'color=red',
    );
    expect(safeRichIframeSrc(`https://www.youtube.com/embed/${ID}?color=blue`)).not.toContain(
      'color=blue',
    );
    expect(
      safeRichIframeSrc(`https://www.youtube.com/embed/${ID}?playlist=${ID},${ID}`),
    ).toContain('playlist=');
    expect(safeRichIframeSrc(`https://www.youtube.com/embed/${ID}?playlist=xyz`)).not.toContain(
      'playlist=',
    );
    expect(
      safeRichIframeSrc(`https://www.youtube.com/embed/${ID}?origin=https://fkgracanica.ba`),
    ).toContain('origin=');
    expect(
      safeRichIframeSrc(`https://www.youtube.com/embed/${ID}?origin=https://a.b/path`),
    ).not.toContain('origin=');
    expect(safeRichIframeSrc(`https://www.youtube.com/embed/${ID}?hl=toolong-language!`)).toBe(
      `https://www.youtube.com/embed/${ID}`,
    );
  });
});

describe('finance-labels', () => {
  it('prepoznaje provajdere', () => {
    expect(isFinanceProvider('stripe')).toBe(true);
    expect(isFinanceProvider('membership')).toBe(true);
    expect(isFinanceProvider('gotovina')).toBe(false);
    expect(Object.values(PROVIDER_META).map((m) => m.label)).toContain('Blagajna');
  });

  it('labeli i varijante statusa', () => {
    expect(paymentStatusLabel('CONFIRMED')).toBe('Plaćeno');
    expect(paymentStatusLabel('NEPOZNAT')).toBe('NEPOZNAT');
    expect(paymentStatusVariant('ACTIVE')).toBe('success');
    expect(paymentStatusVariant('PENDING_ONLINE')).toBe('warning');
    expect(paymentStatusVariant('PENDING_BOX_OFFICE')).toBe('warning');
    expect(paymentStatusVariant('CANCELLED')).toBe('danger');
    expect(paymentStatusVariant('REFUNDED')).toBe('muted');
    expect(PAYMENT_STATUS_OPTIONS[0]).toEqual({ value: '', label: 'Svi statusi' });
    expect(PAYMENT_STATUS_OPTIONS).toHaveLength(6);
  });

  it('formatira datum i iznos', () => {
    expect(formatDay('2026-11-06T10:00:00.000Z')).toBe('06.11.2026.');
    expect(formatDay('06.11.2026')).toBe('06.11.2026');
    expect(formatKm(1234.5)).toContain('KM');
    expect(formatKm(1234.5)).toContain('1.234,50');
  });

  it('localIsoDate daje lokalni datum bez TZ pomaka', () => {
    expect(localIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
