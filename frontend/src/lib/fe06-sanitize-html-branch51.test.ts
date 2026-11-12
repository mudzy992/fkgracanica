import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitize-html';

describe('sanitizeHtml — branch51 (target _blank i data:image)', () => {
  it('a target _blank dodaje rel noopener', () => {
    const out = sanitizeHtml('<a href="https://example.com" target="_blank">link</a>');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it('a bez _blank ne dodaje rel', () => {
    const out = sanitizeHtml('<a href="https://example.com">link</a>');
    expect(out).not.toContain('noopener');
  });

  it('data:image src dozvoljen', () => {
    const out = sanitizeHtml('<img src="data:image/png;base64,abc" alt="x">');
    expect(out).toContain('data:image');
  });

  it('javascript: src uklonjen', () => {
    const out = sanitizeHtml('<img src="javascript:alert(1)" alt="x">');
    expect(out).not.toContain('javascript');
  });

  it('iframe bez src dobija poruku', () => {
    const out = sanitizeHtml('<iframe></iframe>', 'Nema videa');
    expect(out).toContain('Nema videa');
    expect(out).toContain('role="status"');
  });
});
