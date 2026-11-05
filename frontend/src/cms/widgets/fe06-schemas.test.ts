import { describe, expect, it } from 'vitest';
import { validateWidgetConfig, widgetMeta, widgetSchemas } from './schemas';

describe('widgetMeta', () => {
  it('svaki tip widgeta ima oznaku i kategoriju', () => {
    for (const type of Object.keys(widgetSchemas)) {
      const meta = widgetMeta[type as keyof typeof widgetMeta];
      expect(meta?.label, type).toBeTruthy();
      expect(['layout', 'module', 'global']).toContain(meta?.category);
    }
  });

  it('deprecated widgeti su označeni u nazivu', () => {
    expect(widgetMeta['next-match'].label).toContain('ukloniti');
    expect(widgetMeta['last-result'].label).toContain('ukloniti');
    expect(widgetMeta['footer-about'].category).toBe('global');
  });
});

describe('validateWidgetConfig — nepoznat tip', () => {
  it('vraća grešku sa nazivom tipa', () => {
    expect(validateWidgetConfig('nepostoji', {})).toEqual({
      ok: false,
      error: 'Nepoznat widget: nepostoji',
    });
  });
});

describe('validateWidgetConfig — validacija', () => {
  it('hero zahtijeva naslov', () => {
    const result = validateWidgetConfig('hero', { title: '' });
    expect(result.ok).toBe(false);
  });

  it('hero popunjava podrazumijevane vrijednosti', () => {
    const result = validateWidgetConfig('hero', { title: 'FK Gračanica' });
    expect(result).toEqual({
      ok: true,
      data: {
        title: 'FK Gračanica',
        backgroundDisplay: 'all',
        showMatches: true,
        showLastResult: true,
        buttons: [],
      },
    });
  });

  it('hero prihvata dugmad i opciona polja', () => {
    const result = validateWidgetConfig('hero', {
      title: 'Naslov',
      subtitle: 'Podnaslov',
      foundedYear: '1932',
      backgroundImage: 'mediji/slika.jpg',
      backgroundDisplay: 'mobile',
      showMatches: false,
      buttons: [{ label: 'Ulaznice', url: '/ulaznice', variant: 'outline' }],
    });
    expect(result.ok).toBe(true);
    const data = (result as { data: Record<string, unknown> }).data;
    expect(data.buttons).toHaveLength(1);
    expect(data.backgroundDisplay).toBe('mobile');
  });

  it('nepoznata vrijednost enum-a prijavljuje prvu grešku', () => {
    const result = validateWidgetConfig('hero', { title: 'X', backgroundDisplay: 'tablet' });
    expect(result).toEqual({
      ok: false,
      error: 'Invalid option: expected one of "all"|"desktop"|"mobile"|"none"',
    });
  });

  it('news-feed i gallery popunjavaju limite', () => {
    expect(validateWidgetConfig('news-feed', {})).toEqual({
      ok: true,
      data: { mode: 'latest', limit: 3 },
    });
    expect(validateWidgetConfig('gallery', {})).toEqual({
      ok: true,
      data: { mode: 'latest', limit: 4 },
    });
  });

  it('limiti van opsega se odbijaju', () => {
    expect(validateWidgetConfig('news-feed', { limit: 0 }).ok).toBe(false);
    expect(validateWidgetConfig('news-feed', { limit: 13 }).ok).toBe(false);
    expect(validateWidgetConfig('trophies', { limit: 99 }).ok).toBe(false);
  });

  it('tickets-cta i rich-text imaju svoje podrazumijevane vrijednosti', () => {
    expect(validateWidgetConfig('tickets-cta', {})).toEqual({ ok: true, data: { mode: 'auto' } });
    expect(validateWidgetConfig('rich-text', {})).toEqual({ ok: true, data: { html: '' } });
    expect(validateWidgetConfig('custom-html', undefined)).toEqual({ ok: true, data: { html: '' } });
  });

  it('cta-band prihvata dugmad, a club-about-cta je prazan objekat', () => {
    const cta = validateWidgetConfig('cta-band', { title: 'Pridruži se' });
    expect(cta).toEqual({ ok: true, data: { title: 'Pridruži se', buttons: [] } });
    expect(validateWidgetConfig('club-about-cta', { bilo: 'šta' })).toEqual({ ok: true, data: {} });
  });

  it('footer-about zahtijeva tekst', () => {
    expect(validateWidgetConfig('footer-about', { text: '' }).ok).toBe(false);
    expect(validateWidgetConfig('footer-about', { text: 'O klubu' })).toEqual({
      ok: true,
      data: { text: 'O klubu' },
    });
  });

  it('deprecated tipovi prolaze sa praznim configom', () => {
    expect(validateWidgetConfig('next-match', {})).toEqual({
      ok: true,
      data: { showLastResult: true },
    });
    expect(validateWidgetConfig('last-result', {})).toEqual({ ok: true, data: {} });
  });
});
