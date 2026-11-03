import { validateWidgetConfig } from './schemas';

/**
 * BE-09b/P-B09b-6: prije su se validirali samo `hero.title` i
 * `footer-about.text`, a ne-objekat konfiguracije se tiho pretvarao u `{}`.
 */
describe('validateWidgetConfig (BE-09b / P-B09b-6)', () => {
  it('odbija nepoznat tip widgeta', () => {
    const result = validateWidgetConfig('nepostojeci', {});
    expect(result.ok).toBe(false);
  });

  it('odbija ne-objekat konfiguraciju (prije: tiho {})', () => {
    expect(validateWidgetConfig('hero', 'tekst').ok).toBe(false);
    expect(validateWidgetConfig('hero', ['a']).ok).toBe(false);
    expect(validateWidgetConfig('hero', 42).ok).toBe(false);
  });

  it('prihvata nedostajuću konfiguraciju kao prazan objekat', () => {
    const result = validateWidgetConfig('club-about-cta', undefined);
    expect(result).toEqual({ ok: true, data: {} });
  });

  it('hero: prazan naslov je greška', () => {
    expect(validateWidgetConfig('hero', { title: '  ' }).ok).toBe(false);
  });

  it('footer-about: prazan tekst je greška', () => {
    expect(validateWidgetConfig('footer-about', { text: '' }).ok).toBe(false);
  });

  it('news-feed: limit mora biti broj', () => {
    expect(validateWidgetConfig('news-feed', { limit: '3' }).ok).toBe(false);
    expect(validateWidgetConfig('news-feed', { limit: 3 }).ok).toBe(true);
  });

  it('rich-text/custom-html: html mora biti tekst', () => {
    expect(validateWidgetConfig('rich-text', { html: 5 }).ok).toBe(false);
    expect(validateWidgetConfig('custom-html', { html: '<p>ok</p>' }).ok).toBe(
      true,
    );
  });

  it('validan hero prolazi i vraća podatke neizmijenjene', () => {
    const config = { title: 'FK Gračanica', showMatches: true };
    expect(validateWidgetConfig('hero', config)).toEqual({
      ok: true,
      data: config,
    });
  });
});
