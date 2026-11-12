import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LiveYouTubePlayer } from './live/LiveYouTubePlayer';
import { FormationPitch } from './admin/FormationPitch';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-youtube-stream-player', () => ({
  useYouTubeStreamPlayer: (url: string) => ({
    containerRef: { current: null },
    videoId: url.includes('dQw4w9WgXcQ') ? 'dQw4w9WgXcQ' : null,
  }),
}));

describe('fe06 batch63 components', () => {
  it('LiveYouTubePlayer className ?? default', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const { container, unmount } = render(<LiveYouTubePlayer url={url} />);
    expect(container.innerHTML).toContain('pointer-events-none');
    unmount();
    const { container: c2 } = render(<LiveYouTubePlayer url={url} className="custom-class" />);
    expect(c2.innerHTML).toContain('custom-class');
    expect(c2.innerHTML).not.toContain('pointer-events-none');
  });

  it('LiveYouTubePlayer hidden and invalid url', () => {
    const { container } = render(<LiveYouTubePlayer url="not-a-url" hidden={false} />);
    expect(container.textContent).toContain('video.liveUnavailable');
    const { container: c2 } = render(<LiveYouTubePlayer url="   " hidden={true} />);
    expect(c2.innerHTML).toBe('');
  });

  it('FormationPitch number fallback', () => {
    const slots: any = [
      { positionX: 50, positionY: 50, label: 'GK', playerId: 'p1' },
      { positionX: 30, positionY: 30, label: 'DEF', playerId: 'p2' },
    ];
    const players: any = [
      { id: 'p1', firstName: 'A', lastName: 'B', number: 7 },
      { id: 'p2', firstName: 'C', lastName: 'D', number: null },
    ];
    const { container } = render(<FormationPitch slots={slots} players={players} onSlotChange={vi.fn()} />);
    expect(container.textContent).toContain('7');
    expect(container.textContent).toContain('C D');
    // kada nema igrača, prikazuje label
    const slots2: any = [{ positionX: 50, positionY: 50, label: 'GK', playerId: '' }];
    const { container: c2 } = render(<FormationPitch slots={slots2} players={[]} onSlotChange={vi.fn()} />);
    expect(c2.textContent).toContain('GK');
  });
});
