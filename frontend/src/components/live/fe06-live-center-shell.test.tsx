import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LiveCenterShell } from './LiveCenterShell';

vi.mock('../public/clubs/ClubCrest', () => ({
  ClubCrest: ({ club }: { club?: { name?: string } | null }) => (
    <span data-testid={`crest-${club?.name ?? 'none'}`} />
  ),
}));
vi.mock('./use-live-event-toasts', () => ({
  useLiveEventToasts: () => ({ minute: 12, type: 'GOAL' }),
  LiveEventToast: ({ event }: { event: { minute: number } }) => (
    <div data-testid="toast">{event.minute}&apos;</div>
  ),
}));
vi.mock('./LiveHalftimePanel', () => ({
  LiveHalftimePanel: ({ compact }: { compact?: boolean }) => (
    <div data-testid="halftime">{compact ? 'compact' : 'full'}</div>
  ),
}));

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'LIVE',
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  homeScore: 2,
  awayScore: 1,
  minute: 55,
  seasonId: 's1',
  homeClubId: 'k1',
  awayClubId: 'k2',
  scheduledAt: '2026-05-01T17:00:00.000Z',
  events: [
    { id: 'e1', minute: 12, type: 'GOAL', player: { firstName: 'Amar', lastName: 'Hodžić' } },
    { id: 'e2', minute: 40, type: 'YELLOW_CARD', description: 'Grub start' },
  ],
  ...over,
});

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('LiveCenterShell', () => {
  it('prikazuje rezultat, minute i događaje obrnutim redom', () => {
    wrap(<LiveCenterShell match={match() as never} clock={null} />);
    expect(screen.getByText('Live centar')).toBeInTheDocument();
    expect(screen.getByText('Uživo')).toBeInTheDocument();
    const score = document.querySelector('main .font-display');
    expect(score?.textContent).toContain('2');
    expect(score?.textContent).toContain('1');
    const items = document.querySelectorAll('main ul li');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain('40');
    expect(screen.getByText('Grub start')).toBeInTheDocument();
  });

  it('bez događaja prikazuje poruku', () => {
    wrap(<LiveCenterShell match={match({ events: [] }) as never} clock={null} />);
    expect(screen.getByText('Još nema događaja')).toBeInTheDocument();
  });

  it('poluvrijeme prikazuje oznaku Pauza i panel bez događaja', () => {
    wrap(<LiveCenterShell match={match({ status: 'HALFTIME' }) as never} clock={null} />);
    expect(screen.getByText('Pauza')).toBeInTheDocument();
    expect(screen.queryByText('Uživo')).toBeNull();
    expect(screen.getByText('PAUZA')).toBeInTheDocument();
    expect(screen.getByTestId('halftime')).toHaveTextContent('compact');
    expect(screen.queryByText('Događaji')).toBeNull();
  });

  it('sat prikazuje period i vrijeme, bez perioda na poluvremenu', () => {
    wrap(
      <LiveCenterShell
        match={match() as never}
        clock={
          {
            periodLabel: 'Drugo poluvrijeme',
            displayMinute: 55,
            displaySecond: 30,
            showStoppage: true,
            stoppage: 2,
            needsStoppageInput: false,
          } as never
        }
      />,
    );
    expect(screen.getByText('Drugo poluvrijeme')).toBeInTheDocument();
    expect(screen.getByText('55:30 (+2)')).toBeInTheDocument();
  });

  it('prikazuje toast i link na detalje', () => {
    wrap(<LiveCenterShell match={match() as never} clock={null} />);
    expect(screen.getByTestId('toast')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Detalji utakmice' }).getAttribute('href')).toBe(
      '/utakmice/m1',
    );
  });
});
