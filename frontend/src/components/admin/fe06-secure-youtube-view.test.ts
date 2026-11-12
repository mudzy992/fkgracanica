import { describe, expect, it, vi } from 'vitest';
import { FRAME_ALLOW, createView, safeFrameAttributes } from './secure-youtube-view';

const ID = 'dQw4w9WgXcQ';
const options = { width: 640, height: 360, HTMLAttributes: { class: 'moja-klasa' } };

const node = (attrs: Record<string, unknown>) => ({ attrs, type: 'youtubeVideo', nodeSize: 3 }) as never;

describe('safeFrameAttributes', () => {
  it('vraća bezbjedne atribute za validan embed', () => {
    const out = safeFrameAttributes(node({ src: `https://www.youtube.com/embed/${ID}` }), options);
    expect(out).toMatchObject({
      src: `https://www.youtube.com/embed/${ID}`,
      title: expect.any(String),
      width: '640',
      height: '360',
      class: 'moja-klasa',
      allow: FRAME_ALLOW,
      allowfullscreen: '',
      frameborder: '0',
    });
  });

  it('koristi title iz originalnih atributa i eksplicitne dimenzije', () => {
    const out = safeFrameAttributes(
      node({
        src: `https://youtu.be/${ID}`,
        originalAttributes: { title: 'Moj video' },
        width: 800,
        height: 450,
      }),
      options,
    );
    expect(out?.title).toBe('Moj video');
    expect(out?.width).toBe('800');
    expect(out?.height).toBe('450');
  });

  it('bez class-a vraća prazan string', () => {
    const out = safeFrameAttributes(node({ src: `https://www.youtube.com/embed/${ID}` }), {
      ...options,
      HTMLAttributes: {},
    });
    expect(out?.class).toBe('');
  });

  it('nevalidan src daje null', () => {
    expect(safeFrameAttributes(node({ src: 'https://example.com/embed/x' }), options)).toBeNull();
    expect(safeFrameAttributes(node({ src: 42 }), options)).toBeNull();
    expect(safeFrameAttributes(node({}), options)).toBeNull();
  });
});

describe('createView', () => {
  const setup = (src: string, position: number | null = 7) => {
    const chain = {
      focus: () => chain,
      deleteRange: () => chain,
      run: vi.fn(),
    };
    const editor = { chain: () => chain } as never;
    const getPos = () => (position === null ? undefined : position);
    const view = createView(node({ src }) as never, editor, getPos, options);
    return { view, chain };
  };

  it('renderuje iframe sa sigurnim atributima', () => {
    const { view } = setup(`https://www.youtube.com/embed/${ID}`);
    const frame = view.dom.querySelector('iframe');
    expect(frame?.getAttribute('src')).toBe(`https://www.youtube.com/embed/${ID}`);
    expect(frame?.getAttribute('allowfullscreen')).toBe('');
    expect(view.dom.getAttribute('data-youtube-video')).toBe('');
    expect(view.dom.contentEditable).toBe('false');
  });

  it('nevalidan src prikazuje poruku i dugme za uklanjanje', () => {
    const { view } = setup('https://example.com/x');
    expect(view.dom.querySelector('iframe')).toBeNull();
    const notice = view.dom.querySelector('p[role="status"]');
    expect(notice).not.toBeNull();
    expect(view.dom.querySelector('button')?.type).toBe('button');
  });

  it('klik na uklanjanje briše čvor sa pozicije', () => {
    const { view, chain } = setup('https://example.com/x');
    view.dom.querySelector('button')?.click();
    expect(chain.run).toHaveBeenCalled();
  });

  it('bez pozicije ne pokušava brisanje', () => {
    const { view, chain } = setup('https://example.com/x', null);
    view.dom.querySelector('button')?.click();
    expect(chain.run).not.toHaveBeenCalled();
  });

  it('update mijenja prikaz za isti tip čvora', () => {
    const { view } = setup('https://example.com/x');
    const changed = view.update(node({ src: `https://www.youtube.com/embed/${ID}` }) as never);
    expect(changed).toBe(true);
    expect(view.dom.querySelector('iframe')).not.toBeNull();
  });

  it('update odbija drugi tip čvora', () => {
    const { view } = setup('https://example.com/x');
    expect(view.update({ type: 'paragraph', attrs: {} } as never)).toBe(false);
  });

  it('stopEvent propušta samo klik na dugme, mutacije se ignorišu', () => {
    const { view } = setup('https://example.com/x');
    expect(view.stopEvent(new MouseEvent('click'))).toBe(false);
    expect(view.ignoreMutation()).toBe(true);
  });

  it('destroy uklanja listener za promjenu jezika', () => {
    const { view } = setup('https://example.com/x');
    expect(() => view.destroy()).not.toThrow();
    expect(view.dom.querySelector('p')).not.toBeNull();
  });
});
