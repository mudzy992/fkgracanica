import { describe, expect, it } from 'vitest';
import { normalizeHtmlForRender, stripHtml } from './html-content';

describe('batch61 html-content 6 [2,0]', () => {
  it('frame.textContent ?? fallback', () => {
    expect(stripHtml('<p>test</p>')).toBe('test');
    expect(stripHtml('<iframe>hello</iframe>')).toBe('hello');
    expect(normalizeHtmlForRender('<p>&lt;div&gt;hi&lt;/div&gt;</p>')).toContain('hi');
    expect(normalizeHtmlForRender('')).toBe('');
    expect(stripHtml('')).toBe('');
  });
});
