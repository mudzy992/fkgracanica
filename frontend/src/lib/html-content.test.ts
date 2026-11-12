import { describe, expect, it } from 'vitest';
import { normalizeHtmlForRender, stripHtml } from './html-content';

describe('normalizeHtmlForRender (FE-02)', () => {
  it('trimuje i vraća prazno za prazan ulaz', () => {
    expect(normalizeHtmlForRender('   ')).toBe('');
    expect(normalizeHtmlForRender(undefined as unknown as string)).toBe('');
  });

  it('ostavlja ispravan HTML netaknut', () => {
    expect(normalizeHtmlForRender('<p>Tekst</p>')).toBe('<p>Tekst</p>');
  });

  it('dekodira dvostruko escapovan HTML', () => {
    expect(normalizeHtmlForRender('&lt;p&gt;Tekst&lt;/p&gt;')).toBe('<p>Tekst</p>');
  });
});

describe('stripHtml', () => {
  it('uklanja tagove i sabija razmake', () => {
    expect(stripHtml('<p>FK   Gračanica</p><p>1978</p>')).toBe('FK Gračanica1978');
  });

  it('radi i kad je sadržaj dvostruko escapovan', () => {
    expect(stripHtml('&lt;b&gt;Gol&lt;/b&gt;')).toBe('Gol');
  });

  it('vraća prazno za prazan ulaz', () => {
    expect(stripHtml('')).toBe('');
  });
});

it('pri izvlačenju teksta čuva ponašanje za head i iframe bez mijenjanja izvornog HTML-a', () => {
  const input =
    '<html><head><title>Naziv</title></head><body><p>Tekst</p><iframe src="https://www.youtube.com/embed/abc/../../redirect?q=https://example.invalid/">opis</iframe></body></html>';
  expect(stripHtml(input)).toBe('Tekstopis');
  expect(input).toContain('/redirect');
  expect(normalizeHtmlForRender('&lt;b&gt;Gol&lt;/b&gt;')).toBe('<b>Gol</b>');
});
