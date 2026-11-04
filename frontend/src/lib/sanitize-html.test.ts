import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitize-html';

describe('sanitizeHtml (FE-03 / P-FE03-1)', () => {
  it('vraća prazno za prazan ili ne-string ulaz', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml('   ')).toBe('');
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });

  it('uklanja script tagove i inline event handlere (stored XSS)', () => {
    const out = sanitizeHtml('<p>Tekst</p><script>alert(1)</script>');
    expect(out).toContain('<p>Tekst</p>');
    expect(out).not.toMatch(/script/i);

    const img = sanitizeHtml('<img src="/a.jpg" onerror="alert(1)" alt="a">');
    expect(img).toContain('src="/a.jpg"');
    expect(img).not.toMatch(/onerror/i);
  });

  it('odbija javascript: i data:text/html linkove', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toMatch(/javascript:/i);
    expect(sanitizeHtml('<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>')).toBe('<a>x</a>');
  });

  it('dodaje rel="noopener noreferrer" na target="_blank"', () => {
    const out = sanitizeHtml('<a href="https://fkgracanica.ba" target="_blank">link</a>');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it('dozvoljava YouTube embed, a odbija iframe sa druge domene', () => {
    const ok = sanitizeHtml(
      '<iframe src="https://www.youtube.com/embed/abc123XYZ01" title="video" allowfullscreen></iframe>',
    );
    expect(ok).toContain('youtube.com/embed/abc123XYZ01');

    const bad = sanitizeHtml('<iframe src="https://evil.example.com/x"></iframe>');
    expect(bad).not.toContain('evil.example.com');
  });

  it('uklanja style, formu i ugrađene inpute', () => {
    const out = sanitizeHtml('<p style="color:red">x</p><form><input name="a"></form>');
    expect(out).not.toMatch(/style=/);
    expect(out).not.toMatch(/<form|<input/);
  });

  it('zadržava sigurno formatiranje teksta (naslovi, liste, citati, tabele)', () => {
    const html =
      '<h2>Naslov</h2><ul><li>a</li></ul><blockquote>citat</blockquote>' +
      '<table><tbody><tr><td>1</td></tr></tbody></table><p><strong>debelo</strong></p>';
    const out = sanitizeHtml(html);
    for (const tag of ['<h2>', '<ul>', '<li>', '<blockquote>', '<table>', '<td>', '<strong>']) {
      expect(out).toContain(tag);
    }
  });
});
