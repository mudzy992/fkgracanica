import { describe, expect, it } from 'vitest';
import { stripHtml, normalizeHtmlForRender } from './html-content';

describe('batch60 lib3 — html-content 6 [1,0]', () => {
  it('normalizeHtmlForRender with &lt; and iframe', () => {
    const html = '&lt;div&gt;hi&lt;/div&gt;';
    const norm = normalizeHtmlForRender(html);
    expect(typeof norm).toBe('string');
  });
  it('stripHtml with iframe fallback', () => {
    const html = '<div>hello <iframe>fallback text</iframe> world</div>';
    const txt = stripHtml(html);
    expect(txt).toContain('hello');
  });
  it('stripHtml empty', () => {
    expect(stripHtml('')).toBe('');
    expect(normalizeHtmlForRender('')).toBe('');
  });
});
