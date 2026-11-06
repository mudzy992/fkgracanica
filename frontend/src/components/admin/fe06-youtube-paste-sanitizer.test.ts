import { describe, expect, it } from 'vitest';
import { safeEditorYoutubeSrc, safeYoutubePasteMatches, sanitizePastedIframes } from './secure-youtube-url';

const ID = 'dQw4w9WgXcQ';

describe('safeEditorYoutubeSrc', () => {
  it.each([
    [`https://www.youtube.com/watch?v=${ID}`, `https://www.youtube.com/embed/${ID}`],
    [`https://youtu.be/${ID}`, `https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube.com/embed/${ID}`, `https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube.com/shorts/${ID}`, `https://www.youtube.com/embed/${ID}`],
  ])('pretvara %s u embed', (input, expected) => {
    expect(safeEditorYoutubeSrc(input)).toBe(expected);
  });

  it('playlist URL postaje videoseries embed', () => {
    expect(safeEditorYoutubeSrc('https://www.youtube.com/playlist?list=PL123456')).toBe(
      'https://www.youtube-nocookie.com/embed/videoseries?list=PL123456',
    );
  });

  it('parametar t postaje start, a v se odbacuje', () => {
    const out = safeEditorYoutubeSrc(`https://www.youtube.com/watch?v=${ID}&t=90&autoplay=1`);
    expect(out).toContain('start=90');
    expect(out).toContain('autoplay=1');
    expect(out).not.toContain('v=');
  });

  it('start ostaje kad su data i t parametri', () => {
    const out = safeEditorYoutubeSrc(`https://www.youtube.com/watch?v=${ID}&t=90&start=30`);
    expect(out).toContain('start=30');
    expect(out).not.toContain('t=90');
  });

  it('odbija nevalidne izvore', () => {
    expect(safeEditorYoutubeSrc('https://example.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(safeEditorYoutubeSrc('ftp://youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(safeEditorYoutubeSrc('https://youtube.com:8443/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(safeEditorYoutubeSrc('https://youtube.com/watch?v=kratko')).toBeNull();
    expect(safeEditorYoutubeSrc('   ')).toBeNull();
  });

  it('playlist bez dozvoljenog list parametra se odbija', () => {
    expect(safeEditorYoutubeSrc('https://www.youtube.com/playlist?list=!')).toBeNull();
  });
});

describe('safeYoutubePasteMatches', () => {
  it('vraća samo validne YouTube linkove sa indeksima', () => {
    const text = `Pogledaj https://youtu.be/${ID} i https://example.com/x`;
    const matches = safeYoutubePasteMatches(text);
    expect(matches).toHaveLength(1);
    expect(matches[0].text).toBe(`https://youtu.be/${ID}`);
    expect(text.slice(matches[0].index)).toContain(ID);
  });

  it('bez linkova vraća prazan niz', () => {
    expect(safeYoutubePasteMatches('običan tekst')).toEqual([]);
  });
});

describe('sanitizePastedIframes', () => {
  const html = (src: string, attrs = '') =>
    `<p>opis</p><div data-youtube-video="" onclick="hack()"><iframe src="${src}"${attrs}></iframe></div>`;

  it('zadržava dozvoljene atribute i uklanja ostale', () => {
    const out = sanitizePastedIframes(
      html(`https://www.youtube.com/embed/${ID}`, ' title="Video" onload="hack()" width="560"'),
      'Nedostupno',
    );
    expect(out).toContain('title="Video"');
    expect(out).toContain('width="560"');
    expect(out).not.toContain('onload');
    expect(out).not.toContain('onclick');
    expect(out).toContain(`https://www.youtube.com/embed/${ID}`);
  });

  it('nevalidan src zamjenjuje iframe porukom', () => {
    const out = sanitizePastedIframes(html('https://example.com/x'), 'Ugradnja nije dostupna');
    expect(out).not.toContain('<iframe');
    expect(out).toContain('Ugradnja nije dostupna');
    expect(out).toContain('<p>opis</p>');
  });

  it('iframe bez src-a zamjenjuje porukom', () => {
    const out = sanitizePastedIframes('<iframe title="x"></iframe>', 'Nema');
    expect(out).not.toContain('<iframe');
    expect(out).toContain('Nema');
  });

  it('watch URL u iframe-u se normalizuje u embed', () => {
    const out = sanitizePastedIframes(html(`https://www.youtube.com/watch?v=${ID}`), 'x');
    expect(out).toContain(`https://www.youtube.com/embed/${ID}`);
  });

  it('Vimeo iframe ostaje dozvoljen', () => {
    const out = sanitizePastedIframes(html('https://player.vimeo.com/video/12345'), 'x');
    expect(out).toContain('player.vimeo.com/video/12345');
  });

  it('sadržaj bez iframe-a ostaje nepromijenjen', () => {
    const input = '<p>Nema ugrađenih okvira</p>';
    expect(sanitizePastedIframes(input, 'x')).toBe(input);
  });
});
