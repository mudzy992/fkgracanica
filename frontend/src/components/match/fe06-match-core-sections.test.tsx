import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchScoreHero } from './MatchScoreHero';
import { MatchEventsSection } from './MatchEventsSection';
import { MatchHighlights } from './MatchHighlights';
import { MatchReportApproval } from './MatchReportApproval';
import { MatchCenterToolbar } from './MatchCenterToolbar';

const state = vi.hoisted(() => ({
  approve: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  videos: [] as { url: string; title: string }[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/motion/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('../../hooks/use-live-admin', () => ({ useApproveMatchReport: () => state.approve }));
vi.mock('../public/VideoEmbed', () => ({
  VideoEmbed: ({ url, title }: { url: string; title: string }) => {
    state.videos.push({ url, title });
    return <div data-testid="video-embed" />;
  },
}));

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const club = (name: string, over: Record<string, unknown> = {}) => ({
  id: name,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  crestPath: null,
  ...over,
});

describe('MatchScoreHero', () => {
  it('prikazuje rezultat i imena klubova kao linkove', () => {
    const { container } = wrap(
      <MatchScoreHero
        homeClub={club('FK Gračanica')}
        awayClub={club('FK Slavija')}
        homeScore={3}
        awayScore={1}
        meta="01.05.2026 · Stadion"
      />,
    );
    const score = container.querySelector('.font-display') as HTMLElement;
    expect(score.textContent?.replace(/\s+/g, '')).toBe('3:1');
    expect(screen.getByRole('link', { name: 'FK Gračanica' })).toBeTruthy();
    expect(screen.getByText('01.05.2026 · Stadion')).toBeTruthy();
  });

  it('bez rezultata prikazuje nule', () => {
    const { container } = wrap(<MatchScoreHero homeClub={club('A')} awayClub={club('B')} />);
    expect(container.textContent).toContain('0');
    expect(container.textContent).toContain(':');
  });

  it('klub bez slug-a nije link', () => {
    wrap(
      <MatchScoreHero
        homeClub={club('FK Gračanica', { slug: null })}
        awayClub={club('FK Slavija')}
        homeScore={0}
        awayScore={0}
      />,
    );
    expect(screen.queryByRole('link', { name: 'FK Gračanica' })).toBeNull();
    expect(screen.getByText('FK Gračanica')).toBeTruthy();
  });

  it('live prikazuje oznaku Uživo umjesto statusa', () => {
    wrap(<MatchScoreHero live statusLabel="U toku" homeScore={1} awayScore={1} />);
    expect(screen.getByText('Uživo')).toBeTruthy();
    expect(screen.queryByText('U toku')).toBeNull();
  });

  it('status bez live prikazuje labelu', () => {
    wrap(<MatchScoreHero statusLabel="Završeno" />);
    expect(screen.getByText('Završeno')).toBeTruthy();
    expect(screen.queryByText('Uživo')).toBeNull();
  });

  it('bez statusa i meta nema tih elemenata', () => {
    const { container } = wrap(<MatchScoreHero />);
    expect(container.textContent).not.toMatch(/Uživo|Završeno/);
  });
});

describe('MatchEventsSection', () => {
  it('prazna lista događaja ne renderira sekciju', () => {
    const { container } = render(<MatchEventsSection events={[]} />);
    expect(container.textContent).toBe('');
  });

  it('prikazuje događaje sa minutom i igračem', () => {
    wrap(
      <MatchEventsSection
        events={[
          {
            id: 'e1',
            minute: 23,
            type: 'GOAL',
            player: { id: 'p1', firstName: 'Amar', lastName: 'Hodžić' },
          },
          { id: 'e2', minute: 45, type: 'YELLOW_CARD', player: null },
        ] as never}
      />,
    );
    expect(screen.getByText('Događaji')).toBeTruthy();
    expect(screen.getByText("23'")).toBeTruthy();
    expect(screen.getByText("45'")).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Amar Hodžić' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('MatchHighlights', () => {
  beforeEach(() => {
    state.videos = [];
  });

  it('bez prenosa i isječaka ne renderira sekciju', () => {
    const { container } = render(<MatchHighlights />);
    expect(container.textContent).toBe('');
    expect(state.videos).toHaveLength(0);
  });

  it('prenos se prikazuje pod naslovom punog snimka', () => {
    render(<MatchHighlights streamUrl="https://stream/1" />);
    expect(screen.getByText('match.fullStream')).toBeTruthy();
    expect(state.videos[0]).toEqual({ url: 'https://stream/1', title: 'match.fullStream' });
  });

  it('isječci se prikazuju u listi', () => {
    render(
      <MatchHighlights
        highlights={[
          { id: 'h1', title: 'Gol 1', youtubeUrl: 'https://yt/1', startSeconds: 30 },
          { id: 'h2', title: 'Gol 2', youtubeUrl: 'https://yt/2', startSeconds: null },
        ] as never}
      />,
    );
    expect(screen.getByText('match.highlights')).toBeTruthy();
    expect(screen.getByText('Gol 1')).toBeTruthy();
    expect(state.videos).toEqual([
      { url: 'https://yt/1', title: 'Gol 1' },
      { url: 'https://yt/2', title: 'Gol 2' },
    ]);
    expect(screen.queryByText('match.fullStream')).toBeNull();
  });
});

describe('MatchReportApproval', () => {
  beforeEach(() => {
    state.approve = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  });

  it('bez statusa čekanja ne renderira ništa', () => {
    const { container } = render(<MatchReportApproval matchId="m1" reportStatus="DRAFT" />);
    expect(container.textContent).toBe('');
  });

  it('prikazuje poziv i odobrava izvještaj', async () => {
    render(<MatchReportApproval matchId="m1" reportStatus="PENDING_APPROVAL" />);
    expect(screen.getByText('Čeka odobrenje')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Odobri izvještaj' }));
    expect(state.approve.mutateAsync).toHaveBeenCalledWith('m1');
  });

  it('tokom odobravanja dugme je onemogućeno', () => {
    state.approve = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    render(<MatchReportApproval matchId="m1" reportStatus="PENDING_APPROVAL" />);
    const btn = screen.getByRole('button', { name: 'Odobri izvještaj' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe('MatchCenterToolbar', () => {
  it('live utakmica nudi live centar', () => {
    wrap(<MatchCenterToolbar matchId="m1" status="LIVE" isLive canCommentate={false} />);
    const link = screen.getByRole('link', { name: /Live centar/ });
    expect(link.getAttribute('href')).toBe('/live/m1');
    expect(screen.queryByRole('link', { name: /Komentator/ })).toBeNull();
  });

  it('završena utakmica nudi live prikaz', () => {
    wrap(<MatchCenterToolbar matchId="m1" status="FINISHED" isLive={false} canCommentate={false} />);
    expect(screen.getByRole('link', { name: /Live prikaz/ })).toBeTruthy();
  });

  it('komentator dobija link na admin live stranicu', () => {
    wrap(<MatchCenterToolbar matchId="m1" status="LIVE" isLive canCommentate />);
    const link = screen.getByRole('link', { name: /Komentator/ });
    expect(link.getAttribute('href')).toBe('/admin/live/m1');
  });
});
