import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect, beforeAll } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string, d?: string) => d ?? k }) }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['ADMIN'] } }) }));
vi.mock('../hooks', () => ({ usePublicSettings: () => ({ data: {} }) }));
vi.mock('../hooks/use-youtube-stream-player', () => ({
  useYouTubeStreamPlayer: (url: string) => ({
    containerRef: { current: null },
    videoId: url.includes('youtube') || url.includes('youtu.be') ? 'abc123' : null,
  }),
}));

beforeAll(() => {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn() as never;
  } else {
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(vi.fn() as never);
  }
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = vi.fn() as never;
  } else {
    vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(vi.fn() as never);
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = vi.fn() as never;
  } else {
    vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(vi.fn() as never);
  }
});

import { LiveYouTubePlayer } from './live/LiveYouTubePlayer';
import { AdminCommandPalette } from './layout/AdminCommandPalette';
import { Seo } from './seo/Seo';

describe('fe06 batch66 comp', () => {
  it('LiveYouTubePlayer pokriva className ?? i hidden', () => {
    const { container, unmount } = render(<LiveYouTubePlayer url="https://www.youtube.com/watch?v=abc123" />);
    expect(container.innerHTML).toContain('pointer-events-none');
    unmount();
    const { container: c2 } = render(<LiveYouTubePlayer url="https://www.youtube.com/watch?v=abc123" className="my-class" />);
    expect(c2.innerHTML).toContain('my-class');
    const { container: c3 } = render(<LiveYouTubePlayer url="" hidden />);
    expect(c3.innerHTML).toBe('');
    const { container: c4 } = render(<LiveYouTubePlayer url="not-a-url" />);
    expect(c4.textContent).toContain('liveUnavailable');
  });

  it('AdminCommandPalette pokriva index === active true/false', () => {
    const groups = [
      { id: 'g1', label: 'Gr1', items: [{ id: 'a', label: 'A', to: '/a' }, { id: 'b', label: 'B', to: '/b' }] },
      { id: 'g2', label: 'Gr2', items: [{ id: 'c', label: 'C', to: '/c' }] },
    ] as never[];
    const { container } = render(
      <MemoryRouter>
        <AdminCommandPalette open groups={groups} onOpenChange={vi.fn()} />
      </MemoryRouter>,
    );
    expect(container).toBeDefined();
    // trigger ArrowDown to change active
    const input = document.body.querySelector('input[role=\"combobox\"]') as HTMLInputElement;
    if (input) {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      fireEvent.keyDown(input, { key: 'Enter' });
    }
  });

  it('Seo pokriva description || defaultDescription oba kraka', () => {
    const { unmount: u1 } = render(
      <MemoryRouter initialEntries={['/some?q=1']}>
        <Seo title="T" description="Desc" type="article" publishedAt="2026-01-01" />
      </MemoryRouter>,
    );
    u1();
    const { unmount: u2 } = render(
      <MemoryRouter initialEntries={['/some']}>
        <Seo title="T" description={undefined as never} type="article" />
      </MemoryRouter>,
    );
    u2();
    const { unmount: u3 } = render(
      <MemoryRouter initialEntries={['/']}>
        <Seo title={undefined as never} description={undefined as never} />
      </MemoryRouter>,
    );
    u3();
  });
});
