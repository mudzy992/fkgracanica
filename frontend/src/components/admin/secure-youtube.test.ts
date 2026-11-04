import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { afterEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { safeEditorYoutubeSrc } from './secure-youtube-url';
import {
  SecureYoutube,
  getStoredHtml,
  parseStoredHtml,
  safeYoutubePasteMatches,
  sanitizePastedIframes,
} from './secure-youtube';

const unsafe = 'https://www.youtube.com/embed/abc/../../redirect?q=https://example.invalid/';
const legacy = `<p>Primjer teksta.</p><div data-youtube-video=""><iframe title="Legacy" src="${unsafe}"></iframe></div>`;
const editors: Editor[] = [];
function create(content: string) {
  const mount = document.createElement('div');
  document.body.append(mount);
  const editor = new Editor({
    element: mount,
    extensions: [StarterKit, SecureYoutube],
    content: '<p></p>',
  });
  editor.commands.setContent(parseStoredHtml(editor, content), { emitUpdate: false });
  editors.push(editor);
  return editor;
}
afterEach(() => {
  for (const editor of editors.splice(0)) editor.destroy();
});

describe('P-FE06-22 Tiptap YouTube', () => {
  it('za unsafe legacy prikazuje objašnjenje, nikad iframe, a serializer čuva izvorni src', () => {
    const editor = create(legacy);
    expect(editor.view.dom.querySelector('iframe')).toBeNull();
    expect(editor.view.dom.querySelector('[role="status"]')?.textContent).toContain(
      'Ugrađeni video nije dostupan',
    );
    expect(getStoredHtml(editor)).toContain(`src="${unsafe.replaceAll('&', '&amp;')}"`);
    expect(getStoredHtml(editor)).toContain('title="Legacy"');
    editor.commands.insertContentAt(2, 'X');
    expect(getStoredHtml(editor)).toContain(`src="${unsafe.replaceAll('&', '&amp;')}"`);
    editor.view.setProps({ nodeViews: {} });
    expect(editor.view.dom.querySelector('iframe')).toBeNull();
    expect(editor.view.dom.querySelector('[role="status"]')).not.toBeNull();
  });
  it('podržava nocookie, playlist i Vimeo bez promjene originalnog src', () => {
    for (const src of [
      'https://www.youtube-nocookie.com/embed/abc123XYZ01?controls=1',
      'https://www.youtube-nocookie.com/embed/videoseries?list=PLabcdef12345678&index=2',
      'https://player.vimeo.com/video/12345',
    ]) {
      const editor = create(
        `<div data-youtube-video=""><iframe title="Film" src="${src.replaceAll('&', '&amp;')}"></iframe></div>`,
      );
      expect(editor.view.dom.querySelector('iframe')?.getAttribute('src')).toBe(src);
      expect(getStoredHtml(editor)).toContain(`src="${src.replaceAll('&', '&amp;')}"`);
    }
  });
  it('strogo validira komandu za umetanje i podržava video i playlistu', () => {
    const editor = create('<p>Tekst</p>');
    expect(editor.commands.setYoutubeVideo({ src: unsafe })).toBe(false);
    expect(editor.view.dom.querySelector('iframe')).toBeNull();
    expect(editor.commands.setYoutubeVideo({ src: 'https://youtu.be/abc123XYZ01' })).toBe(true);
    expect(editor.view.dom.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://www.youtube.com/embed/abc123XYZ01',
    );
    editor.commands.setTextSelection(2);
    expect(
      editor.commands.setYoutubeVideo({
        src: 'https://www.youtube.com/playlist?list=PLabcdef12345678',
      }),
    ).toBe(true);
    expect(editor.view.dom.querySelectorAll('iframe')).toHaveLength(2);
  });
  it('ne pravi iframe od neispravnog zalijepljenog teksta, ali prepoznaje valjane linkove', () => {
    expect(safeYoutubePasteMatches(unsafe)).toEqual([]);
    expect(safeYoutubePasteMatches('https://notyoutube.com/watch?v=abc123XYZ01')).toEqual([]);
    expect(safeYoutubePasteMatches('https://youtu.be/abc123XYZ01')).toHaveLength(1);
    expect(
      safeYoutubePasteMatches('https://www.youtube.com/playlist?list=PLabcdef12345678'),
    ).toHaveLength(1);
  });
  it('pri lijepljenju HTML-a zamijeni unsafe iframe, sigurne ostavlja bez opasnih atributa', () => {
    const html = `<iframe src="${unsafe}" onload="alert(1)"></iframe><iframe src="https://www.youtube.com/embed/abc123XYZ01" onload="alert(1)"></iframe>`;
    const out = sanitizePastedIframes(html, 'Neispravan video');
    expect(out).toContain('Neispravan video');
    expect(out).not.toContain('redirect');
    expect(out).not.toContain('onload');
    expect(out).toContain('youtube.com/embed/abc123XYZ01');
  });
});

it('retains a bare legacy iframe and wrapper attributes while changing other text', () => {
  const editor = create(
    `<p>Before</p><iframe src="${unsafe}" srcdoc="&lt;b&gt;legacy&lt;/b&gt;" onload="alert(1)"></iframe><div data-youtube-video="" data-legacy="keep"><iframe src="${unsafe}"></iframe></div>`,
  );
  expect(editor.view.dom.querySelectorAll('iframe')).toHaveLength(0);
  editor.commands.insertContentAt(2, ' changed');
  const doc = new DOMParser().parseFromString(getStoredHtml(editor), 'text/html');
  const [bare, wrapped] = Array.from(doc.querySelectorAll('iframe'));
  expect(bare.parentElement?.tagName).toBe('BODY');
  expect(bare.getAttribute('srcdoc')).toBe('<b>legacy</b>');
  expect(bare.getAttribute('onload')).toBe('alert(1)');
  expect(wrapped.parentElement?.getAttribute('data-legacy')).toBe('keep');
});

describe('siguran YouTube unos', () => {
  it.each([
    'https://notyoutube.com/watch?v=abc123XYZ01',
    'https://youtube.com.evil.invalid/watch?v=abc123XYZ01',
    'https://youtube.com:444/playlist?list=PLabcdef12345678',
    'https://user@youtube.com/watch?v=abc123XYZ01',
    'https://www.youtube.com/embed/abc123XYZ01/extra',
    'https://player.vimeo.com/video/12345',
    'javascript:alert(1)',
    'https://www.youtube.com/playlist?list=PL%20bad',
    unsafe,
  ])('odbija %s', (value) => expect(safeEditorYoutubeSrc(value)).toBeNull());

  it.each([
    ['https://youtu.be/abc123XYZ01', 'https://www.youtube.com/embed/abc123XYZ01'],
    [
      'https://m.youtube.com/watch?v=abc123XYZ01&t=30',
      'https://www.youtube.com/embed/abc123XYZ01?start=30',
    ],
    ['https://www.youtube.com/shorts/abc123XYZ01', 'https://www.youtube.com/embed/abc123XYZ01'],
    ['https://youtube.com/live/abc123XYZ01', 'https://www.youtube.com/embed/abc123XYZ01'],
    [
      'https://www.youtube-nocookie.com/embed/abc123XYZ01?controls=1',
      'https://www.youtube-nocookie.com/embed/abc123XYZ01?controls=1',
    ],
    [
      'https://www.youtube.com/playlist?list=PLabcdef12345678',
      'https://www.youtube-nocookie.com/embed/videoseries?list=PLabcdef12345678',
    ],
  ])('kanonizuje %s', (value, expected) => expect(safeEditorYoutubeSrc(value)).toBe(expected));

  it('prevodi status pri promjeni jezika bez izmjene spremljenog iframea', async () => {
    const editor = create(legacy);
    try {
      await i18n.changeLanguage('en');
      expect(editor.view.dom.querySelector('[role="status"]')?.textContent).toContain(
        'Embedded video unavailable',
      );
      expect(editor.view.dom.querySelector('button')?.textContent).toBe('Remove video');
      expect(getStoredHtml(editor)).toContain('embed/abc/../../redirect');
    } finally {
      await i18n.changeLanguage('bs');
    }
  });
});
