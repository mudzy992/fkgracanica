import { describe, expect, it, beforeAll } from 'vitest';
import { sanitizeHtml } from './sanitize-html';

describe('sanitize-html — branch45 (target _blank vs ostalo)', () => {
  beforeAll(() => {
    // DOMPurify needs document
  });

  it('sanitizeHtml sa _blank dodaje rel', () => {
    const html = '<a href="https://example.com" target="_blank">link</a>';
    const out = sanitizeHtml(html);
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('target="_blank"');
  });

  it('sanitizeHtml bez _blank ne dodaje rel', () => {
    const html = '<a href="https://example.com">link</a>';
    const out = sanitizeHtml(html);
    expect(out).toContain('href="https://example.com"');
    expect(out).not.toContain('noopener');
  });

  it('sanitizeHtml prazan i non-string vraća prazan', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml('   ')).toBe('');
    expect(sanitizeHtml(null as unknown as string)).toBe('');
  });

  it('sanitizeHtml iframe bez src zamjenjuje porukom', () => {
    const html = '<iframe></iframe>';
    const out = sanitizeHtml(html, 'Nedostupan');
    expect(out).toContain('Nedostupan');
    expect(out).toContain('role="status"');
  });

  it('sanitizeHtml sa div i bez target pokriva false granu', () => {
    const html = '<div>hello</div><p>world</p><a href="https://example.com" target="_self">x</a>';
    const out = sanitizeHtml(html);
    expect(out).toContain('hello');
    expect(out).toContain('world');
    expect(out).not.toContain('noopener');
  });

  it('sanitizeHtml img src pokriva img granu i false granu za class', () => {
    const out1 = sanitizeHtml('<img src="https://example.com/a.jpg" alt="x">');
    expect(out1).toContain('src="https://example.com/a.jpg"');
    const out2 = sanitizeHtml('<img src="javascript:alert(1)">');
    expect(out2).not.toContain('javascript:');
    const out3 = sanitizeHtml('<p class="foo" title="bar">hi</p><a href="/local">local</a>');
    expect(out3).toContain('class="foo"');
    expect(out3).toContain('href="/local"');
    const out4 = sanitizeHtml('<img src="data:image/png;base64,abc">');
    expect(out4).toContain('data:image');
    const out5 = sanitizeHtml('<a href="mailto:test@example.com">mail</a>');
    expect(out5).toContain('mailto:');
  });
});
