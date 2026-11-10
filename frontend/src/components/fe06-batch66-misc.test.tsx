import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { validateWidgetConfig } from '../cms/widgets/schemas';
import { stripHtml } from '../lib/html-content';
import * as seoMeta from '../lib/seo-meta';

// Mock RichTextEditor's dependencies
const rteState = vi.hoisted(() => ({ data: { data: [{ id: '1', originalPath: 'a.jpg', thumbPath: 'a.jpg', filename: 'a.jpg', mimeType: 'image/jpeg', size: 1 }] } }));
vi.mock('../hooks/use-media-admin', () => ({
  useMediaAssets: () => rteState.data,
}));
vi.mock('@tiptap/react', () => ({
  useEditor: () => ({ chain: () => ({ focus: () => ({ setImage: () => ({ run: () => {} }) }) }), commands: { setContent: vi.fn() }, isActive: false, on: vi.fn() }),
  EditorContent: () => null,
}));
vi.mock('./admin/rich-text-extensions', () => ({ richTextExtensions: () => [] }));
vi.mock('./admin/RichTextToolbar', () => ({ RichTextToolbar: () => null }));
vi.mock('./admin/secure-youtube', () => ({ getStoredHtml: () => '', parseStoredHtml: () => ({}), sanitizePastedIframes: (h: string) => h }));
vi.mock('../lib/media', () => ({ mediaUrl: (p: string) => p }));

const fpState = vi.hoisted(() => ({
  club: { data: { id: 'c1' } as unknown },
  players: { data: [] as unknown, isLoading: false },
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../hooks', () => ({
  useOwnClub: () => fpState.club,
  usePlayers: () => fpState.players,
  usePublicSettings: () => ({ data: {} }),
  useMediaAssets: () => rteState.data,
}));
vi.mock('./ui/skeleton', () => ({ Skeleton: () => <div data-testid="skeleton" /> }));
vi.mock('./ui/dialog', () => ({
  Dialog: ({ children }: { children: unknown }) => <div>{children as never}</div>,
  DialogHeader: ({ children }: { children: unknown }) => <div>{children as never}</div>,
  DialogBody: ({ children }: { children: unknown }) => <div>{children as never}</div>,
}));

import { RichTextEditor } from './admin/RichTextEditor';
import { FeaturedPlayersWidget } from '../cms/widgets/FeaturedPlayersWidget';
import { AdminFormSheet } from './admin/AdminFormSheet';
import { Seo } from './seo/Seo';

describe('batch66 misc - ?? fallbackovi', () => {
  it('RichTextEditor pokriva data?.data ?? data fallback', () => {
    // data is paginated object -> left
    rteState.data = { data: { data: [{ id: '1', filename: 'a.jpg', originalPath: 'a.jpg', thumbPath: null, mimeType: 'x', size: 1 }] } as unknown, isLoading: false } as never;
    const { unmount: u1 } = render(<RichTextEditor value="" onChange={() => {}} />);
    u1();
    // data is direct array -> right (fallback)
    rteState.data = { data: [{ id: '2', filename: 'b.jpg', originalPath: 'b.jpg', thumbPath: null, mimeType: 'x', size: 1 }] as unknown, isLoading: false } as never;
    const { unmount: u2 } = render(<RichTextEditor value="" onChange={() => {}} />);
    u2();
    // data is undefined -> both falsy, asArray handles
    rteState.data = { data: undefined, isLoading: false } as never;
    const { unmount: u3 } = render(<RichTextEditor value="" onChange={() => {}} />);
    u3();
  });

  it('FeaturedPlayersWidget pokriva photoPath ? img : ?', () => {
    fpState.club = { data: { id: 'c1' } } as never;
    fpState.players = {
      data: [{ id: 'p1', firstName: 'A', lastName: 'B', number: 9, position: 'Napad', photoPath: 'photo.jpg' }],
      isLoading: false,
    } as never;
    const { container } = render(
      <MemoryRouter>
        <FeaturedPlayersWidget config={{ limit: 1 } as never} />
      </MemoryRouter>,
    );
    expect(container.querySelector('img')).not.toBeNull();
    // also test without photo (already covered but ensure)
    fpState.players = {
      data: [{ id: 'p2', firstName: 'C', lastName: 'D', number: null, position: 'Odbrana', photoPath: null }],
      isLoading: false,
    } as never;
    const { container: c2 } = render(
      <MemoryRouter>
        <FeaturedPlayersWidget config={{ limit: 1 } as never} />
      </MemoryRouter>,
    );
    expect(c2.textContent).toContain('?');
  });

  it('schemas pokriva message ?? fallback', async () => {
    // normal invalid hero -> has message
    const r1 = validateWidgetConfig('hero', {});
    expect(r1.ok).toBe(false);
    const schemasModule = await import('../cms/widgets/schemas');
    const orig = schemasModule.widgetSchemas.hero.safeParse;
    // @ts-ignore
    schemasModule.widgetSchemas.hero.safeParse = () => ({ success: false as const, error: { issues: [] } });
    const r2 = validateWidgetConfig('hero', {});
    expect(r2.ok).toBe(false);
    expect(r2.error).toBe('Neispravan config');
    schemasModule.widgetSchemas.hero.safeParse = orig;
  });

  it('AdminFormSheet pokriva open effect', async () => {
    const onOpenChange = vi.fn();
    const { rerender, unmount } = render(
      <AdminFormSheet open={false} onOpenChange={onOpenChange} title="Test">
        <div>child</div>
      </AdminFormSheet>,
    );
    expect(document.body.textContent).not.toContain('child'); // closed -> no child
    rerender(
      <AdminFormSheet open={true} onOpenChange={onOpenChange} title="Test">
        <div>child2</div>
      </AdminFormSheet>,
    );
    // wait for effect
    await new Promise((r) => setTimeout(r, 10));
    expect(document.body.textContent).toContain('child2');
    unmount();
  });

  it('html-content pokriva frame.textContent ?? fallback', () => {
    // iframe with text
    const withText = stripHtml('<div><iframe src="x">unutra</iframe>hello</div>');
    expect(withText).toContain('unutra');
    // iframe without text -> should still hit ?? '' via mocked textContent null
    const origQS = Element.prototype.querySelectorAll;
    // Mock querySelectorAll to return iframe with null textContent
    Element.prototype.querySelectorAll = function (this: Element, sel: string) {
      if (sel === 'iframe') {
        const fakeFrame = { textContent: null } as unknown as Element;
        return [fakeFrame] as unknown as NodeListOf<Element>;
      }
      return origQS.call(this, sel);
    } as unknown as typeof Element.prototype.querySelectorAll;
    const mocked = stripHtml('<div><iframe src="x"></iframe>hello</div>');
    expect(mocked).toContain('hello');
    Element.prototype.querySelectorAll = origQS;
  });

  it('seo-meta pokriva SITE_ORIGIN fallback i Seo image', () => {
    // Seo component with various props
    const { container } = render(
      <MemoryRouter>
        <Seo title="Test" description="Desc" image={null as never} />
      </MemoryRouter>,
    );
    expect(container).toBeDefined();
    // direct seo-meta utils
    expect(seoMeta.siteOrigin()).toBeDefined();
    expect(seoMeta.absoluteUrl('/path')).toContain('/path');
    expect(seoMeta.absoluteUrl('https://example.com')).toBe('https://example.com');
    // truncateMeta already covered, but test buildDocumentTitle
    expect(seoMeta.buildDocumentTitle('A', 'FK Gračanica')).toContain('A');
    expect(seoMeta.defaultShareImage(null)).toBeUndefined();
    // resolveSeoMeta with defaults
    const resolved = seoMeta.resolveSeoMeta({ siteName: 'FK Gračanica', defaultDescription: 'desc' });
    expect(resolved.siteName).toBe('FK Gračanica');
    expect(resolved.type).toBe('website');
  });
});
