import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsPage } from '../AnalyticsPage';

const state = vi.hoisted(() => ({
  seasons: { data: undefined as unknown },
  team: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  seasonArgs: [] as (string | undefined)[],
  seo: [] as (string | undefined)[],
  panels: [] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks', () => ({ useSeasons: () => state.seasons }));
vi.mock('../../../hooks/use-analytics', () => ({
  useTeamAnalytics: (seasonId?: string) => {
    state.seasonArgs.push(seasonId);
    return state.team;
  },
}));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('./AnalyticsTeamPanel', () => ({
  AnalyticsTeamPanel: ({ data }: { data: { played: number } }) => (
    <div data-testid="team-panel">odigrano:{data.played}</div>
  ),
}));
vi.mock('./AnalyticsH2hPanel', () => ({
  AnalyticsH2hPanel: () => <div data-testid="h2h-panel" />,
}));
vi.mock('./AnalyticsPlayerPanel', () => ({
  AnalyticsPlayerPanel: () => <div data-testid="player-panel" />,
}));
vi.mock('./AnalyticsVisitorsPanel', () => ({
  AnalyticsVisitorsPanel: () => <div data-testid="visitors-panel" />,
}));

describe('AnalyticsPage', () => {
  beforeEach(() => {
    state.seasons = { data: undefined };
    state.team = { data: undefined, isLoading: false, isError: false, refetch: vi.fn() };
    state.seasonArgs = [];
    state.seo = [];
    state.panels = [];
  });

  it('podrazumijevano prikazuje tim panel i sezonu bez filtera', () => {
    state.team = { data: { played: 11 }, isLoading: false, isError: false, refetch: vi.fn() };
    render(<AnalyticsPage />);
    expect(state.seo).toContain('admin.analytics');
    expect(screen.getByRole('heading', { name: 'admin.analytics' })).toBeTruthy();
    expect(screen.getByTestId('team-panel').textContent).toBe('odigrano:11');
    expect(state.seasonArgs[0]).toBeUndefined();
  });

  it('prikazuje četiri taba sa labelama', () => {
    render(<AnalyticsPage />);
    ['admin.analyticsTabs.team', 'admin.analyticsTabs.h2h', 'admin.analyticsTabs.players', 'admin.analyticsTabs.visitors'].forEach(
      (label) => expect(screen.getByRole('button', { name: label })).toBeTruthy(),
    );
  });

  it('opcije sezone se pune iz liste sezona i šalju kao filter', async () => {
    state.seasons = {
      data: [
        { id: 's1', name: '2024/25' },
        { id: 's2', name: '2025/26' },
      ],
    };
    state.team = { data: { played: 3 }, isLoading: false, isError: false, refetch: vi.fn() };
    render(<AnalyticsPage />);
    const select = screen.getByRole('combobox');
    expect(screen.getByRole('option', { name: 'admin.analyticsPage.allSeasons' })).toBeTruthy();
    await userEvent.selectOptions(select, 's2');
    expect(state.seasonArgs.at(-1)).toBe('s2');
  });

  it('sezone primaju i omotani odgovor (asArray)', () => {
    state.seasons = { data: { data: [{ id: 's9', name: '2023/24' }] } };
    render(<AnalyticsPage />);
    expect(screen.getByRole('option', { name: '2023/24' })).toBeTruthy();
  });

  it('dok se tim učitava prikazuje poruku', () => {
    state.team = { data: undefined, isLoading: true, isError: false, refetch: vi.fn() };
    render(<AnalyticsPage />);
    expect(screen.getByText('admin.common.loading')).toBeTruthy();
    expect(screen.queryByTestId('team-panel')).toBeNull();
  });

  it('greška nudi ponovno učitavanje', async () => {
    state.team = { data: undefined, isLoading: false, isError: true, refetch: vi.fn() };
    render(<AnalyticsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'actions.retry' }));
    expect(state.team.refetch).toHaveBeenCalled();
  });

  it('tabovi mijenjaju panel, a filter sezone ostaje samo na tim tabu', async () => {
    state.team = { data: { played: 1 }, isLoading: false, isError: false, refetch: vi.fn() };
    render(<AnalyticsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'admin.analyticsTabs.h2h' }));
    expect(screen.getByTestId('h2h-panel')).toBeTruthy();
    expect(screen.queryByTestId('team-panel')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'admin.analyticsTabs.players' }));
    expect(screen.getByTestId('player-panel')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'admin.analyticsTabs.visitors' }));
    expect(screen.getByTestId('visitors-panel')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'admin.analyticsTabs.team' }));
    expect(screen.getByTestId('team-panel')).toBeTruthy();
    expect(screen.getByRole('combobox')).toBeTruthy();
  });
});
