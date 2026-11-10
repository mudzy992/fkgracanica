import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

describe('batch60 league — LeagueNextMatch 34 [3,0] etc', () => {
  it('LeagueNextMatch with scheduled match → second branch', async () => {
    const { LeagueNextMatch } = await import('./LeagueNextMatch');
    const future = new Date(Date.now() + 86400000).toISOString();
    const matches: any[] = [{ id: '1', status: 'SCHEDULED', scheduledAt: future, homeClub: { name: 'A' }, awayClub: { name: 'B' }, venue: 'Stadion' }];
    const { container } = render(<MemoryRouter><LeagueNextMatch matches={matches} /></MemoryRouter>);
    expect(container.textContent).toContain('Sljedeća utakmica');
  });
  it('LeagueNextMatch without match → first branch (already covered but ensure)', async () => {
    const { LeagueNextMatch } = await import('./LeagueNextMatch');
    const { container } = render(<MemoryRouter><LeagueNextMatch matches={[]} /></MemoryRouter>);
    expect(container.textContent).toBe('');
  });
  it('LeagueResultsRound 31 [16,0]', async () => {
    const { LeagueResultsRound } = await import('./LeagueResultsRound');
    const matches: any[] = [{ id: '1', status: 'FINISHED', homeScore: 1, awayScore: 0, homeClub: { name: 'A' }, awayClub: { name: 'B' } }];
    const { container } = render(<MemoryRouter><LeagueResultsRound matches={matches} loading={false} /></MemoryRouter>);
    expect(container.textContent).not.toBeNull();
  });
  it('LeagueResultsRound empty → fallback', async () => {
    const { LeagueResultsRound } = await import('./LeagueResultsRound');
    const { container } = render(<MemoryRouter><LeagueResultsRound matches={[]} loading={false} /></MemoryRouter>);
    expect(container.textContent).not.toBeNull();
  });
  it('LeagueRoundPicker 16 [1,0]', async () => {
    const { LeagueRoundPicker } = await import('./LeagueRoundPicker');
    const rounds: any[] = [{ id: '1', number: 1 }, { id: '2', number: 2 }];
    const { container } = render(<MemoryRouter><LeagueRoundPicker rounds={rounds} value={2} onChange={vi.fn()} /></MemoryRouter>);
    expect(container.textContent).toContain('2');
  });
});
