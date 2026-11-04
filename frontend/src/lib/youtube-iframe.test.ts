import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitize-html';

function renderFragment(src: string) {
  const template = document.createElement('template');
  template.innerHTML = sanitizeHtml(`<iframe src="${src}" title="Video"></iframe>`, 'Video se ne može sigurno prikazati.');
  return template.content;
}

describe('P-FE06-21 iframe iz bogatog sadržaja', () => {
  it.each([
    'https://www.youtube.com/embed/abc123XYZ01?start=75&rel=0',
    'https://www.youtube-nocookie.com/embed/abc123XYZ01?controls=1',
    'https://www.youtube-nocookie.com/embed/videoseries?list=PLabcdef12345678&index=2',
    'https://player.vimeo.com/video/12345?h=test',
  ])('zadržava legitimni YouTube/nocookie/playlist/Vimeo: %s', (src) => {
    const root = renderFragment(src);
    expect(root.querySelector('iframe')?.getAttribute('src')).toBe(src);
    expect(root.querySelector('[role="status"]')).toBeNull();
  });
  it.each([
    'https://www.youtube.com/embed/../../redirect?q=https://example.invalid/',
    'https://www.youtube.com/embed/abc/../../redirect?q=https://example.invalid/',
    'http://www.youtube.com/embed/abc123XYZ01',
    'https://www.youtube.com:444/embed/abc123XYZ01',
    'javascript:alert(1)',
    'https://www.youtube.com/embed/%2e%2e/%2e%2e/redirect?q=https://example.invalid/',
    'https://www.youtube.com/redirect?q=https://example.invalid/',
    'https://www.youtube.com/embed/short',
    'https://www.youtube.com/embed/videoseries?list=..%2Fredirect',
    'https://youtube.com.example.invalid/embed/abc123XYZ01',
    'https://user@youtube.com/embed/abc123XYZ01',
  ])('umjesto nesigurnog iframea objašnjava problem: %s', (src) => {
    const root = renderFragment(src);
    expect(root.querySelector('iframe')).toBeNull();
    expect(root.querySelector('[role="status"]')?.textContent).toBe('Video se ne može sigurno prikazati.');
  });
  it('fallback poruka je tekst, ne novi HTML ili skripta', () => {
    const out = sanitizeHtml('<iframe src="https://example.invalid/x"></iframe>', '<img src=x onerror=alert(1)>');
    const template = document.createElement('template');
    template.innerHTML = out;
    expect(template.content.querySelector('img')).toBeNull();
    expect(template.content.querySelector('[role="status"]')?.textContent).toBe('<img src=x onerror=alert(1)>');
  });
  it('iz sigurnog embeda uklanja neprepoznate parametre', () => {
    const root = renderFragment('https://www.youtube.com/embed/abc123XYZ01?start=5&q=https://example.invalid/');
    expect(root.querySelector('iframe')?.getAttribute('src')).toBe('https://www.youtube.com/embed/abc123XYZ01?start=5');
  });
});
