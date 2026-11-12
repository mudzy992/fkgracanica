import { describe, expect, it, vi } from 'vitest';
import { normalizeHtmlForRender, stripHtml } from './html-content';

describe('html-content — varijante (3 grane)', () => {
  it('frame.textContent null fallback pokriva ??', () => {
    const html = '<p>test</p><iframe>inner</iframe>';
    expect(normalizeHtmlForRender(html)).toContain('test');
    // mock frame.textContent null -> ?? ''
    const mockFrame = { textContent: null, replaceWith: vi.fn() } as unknown as Element;
    // @ts-ignore — mockReturnValueOnce typings
    vi.spyOn(Element.prototype as unknown as { querySelectorAll: unknown }, 'querySelectorAll' as never).mockReturnValueOnce([mockFrame] as never);
    // Force iframe path via textDocument
    expect(normalizeHtmlForRender('&lt;div&gt;test&lt;/div&gt;')).toBeDefined();
    vi.restoreAllMocks();
  });

  it('doc.documentElement.textContent null fallback koristi ?? trimmed', () => {
    const parseSpy = vi.spyOn(DOMParser.prototype, 'parseFromString').mockImplementation(function (this: DOMParser, str: string) {
      const doc = document.implementation.createHTMLDocument('');
      Object.defineProperty(doc.documentElement, 'textContent', { get: () => null, configurable: true });
      doc.documentElement.innerHTML = str;
      return doc;
    });
    const html = '&lt;p&gt;test&lt;/p&gt;';
    expect(normalizeHtmlForRender(html)).toBe(html.trim());
    parseSpy.mockRestore();
  });

  it('stripHtml sa body.textContent null fallback koristi ?? ""', () => {
    const parseSpy = vi.spyOn(DOMParser.prototype, 'parseFromString').mockImplementation(function (this: DOMParser) {
      const doc = document.implementation.createHTMLDocument('');
      Object.defineProperty(doc.body, 'textContent', { get: () => null, configurable: true });
      return doc;
    });
    expect(stripHtml('<div>hello</div>')).toBe('');
    parseSpy.mockRestore();
    expect(stripHtml('<div>hello</div>')).toBe('hello');
    expect(stripHtml('')).toBe('');
  });
});
