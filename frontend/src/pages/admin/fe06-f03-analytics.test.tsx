import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsPage } from './AnalyticsPage';

const state = vi.hoisted(() => ({
  seasonsRaw: [{ id: '2025', name: '2025/26' }] as unknown[],
  team: {
    data: {
      clubId: 'c1',
      clubName: 'FK Gračanica',
      played: 5,
      wins: 3,
      draws: 1,
      losses: 1,
      goalsFor: 10,
      goalsAgainst: 4,
      winPercent: 60,
      form: ['W', 'D', 'L'] as ('W' | 'D' | 'L')[],
      recent: [] as unknown[],
    } as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as Record<string, unknown>,
  totals: {
    data: { web: 100, mobile: 50, total: 150 } as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as Record<string, unknown>,
  trend: {
    data: [{ date: '2026-05-10', web: 10, mobile: 5, total: 15 }] as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as Record<string, unknown>,
  geo: {
    data: [{ countryCode: 'BA', count: 100, percent: 100 }] as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: unknown) => {
      if (typeof opts === 'string') return opts;
      const o = opts as Record<string, unknown> | undefined;
      if (o?.defaultValue) {
        let s = o.defaultValue as string;
        if (o.time) s = s.replace('{{time}}', o.time as string);
        return s;
      }
      return k;
    },
  }),
}));

vi.mock('../../hooks', () => ({
  useSeasons: () => ({ data: state.seasonsRaw }),
}));

vi.mock('../../hooks/use-analytics', () => ({
  useTeamAnalytics: () => state.team,
  useVisitorTotals: () => state.totals,
  useVisitorTrend: () => state.trend,
  useVisitorGeo: () => state.geo,
}));

vi.mock('../../components/seo/Seo', () => ({
  Seo: () => null,
}));

vi.mock('./analytics/AnalyticsTeamPanel', () => ({
  AnalyticsTeamPanel: ({ data }: { data: unknown }) => (
    <div data-testid="team-panel">{JSON.stringify(data)}</div>
  ),
}));
vi.mock('./analytics/AnalyticsH2hPanel', () => ({
  AnalyticsH2hPanel: () => <div data-testid="h2h-panel" />,
}));
vi.mock('./analytics/AnalyticsPlayerPanel', () => ({
  AnalyticsPlayerPanel: () => <div data-testid="player-panel" />,
}));
vi.mock('./analytics/AnalyticsGeoPanel', () => ({
  AnalyticsGeoPanel: () => <div data-testid="geo-panel" />,
}));
vi.mock('./analytics/AnalyticsVisitorsTrendChart', () => ({
  AnalyticsVisitorsTrendChart: () => <div data-testid="trend-chart" />,
}));

beforeEach(() => {
  state.seasonsRaw = [{ id: '2025', name: '2025/26' }] as unknown[];
  state.team = {
    data: {
      clubId: 'c1',
      clubName: 'FK Gračanica',
      played: 5,
      wins: 3,
      draws: 1,
      losses: 1,
      goalsFor: 10,
      goalsAgainst: 4,
      winPercent: 60,
      form: ['W', 'D', 'L'] as ('W' | 'D' | 'L')[],
      recent: [] as unknown[],
    } as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as typeof state.team;
  state.totals = {
    data: { web: 100, mobile: 50, total: 150 } as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as typeof state.totals;
  state.trend = {
    data: [{ date: '2026-05-10', web: 10, mobile: 5, total: 15 }] as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as typeof state.trend;
  state.geo = {
    data: [{ countryCode: 'BA', count: 100, percent: 100 }] as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as typeof state.geo;
});

describe('F-03 Analytics — tablist aria-pressed (P2-4)', () => {
  it('tabovi imaju role=tablist i aria-pressed', () => {
    render(<AnalyticsPage />);
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    expect(tabs[0]).toHaveAttribute('aria-pressed', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-pressed', 'false');
  });

  it('promjena taba mijenja sadržaj', async () => {
    render(<AnalyticsPage />);
    const tablist = screen.getByRole('tablist');
    const tabs = within(tablist).getAllByRole('tab');
    // team je default -> team-panel
    expect(screen.getByTestId('team-panel')).toBeInTheDocument();
    await userEvent.click(tabs[3]); // visitors
    expect(screen.getByTestId('geo-panel')).toBeInTheDocument();
    await userEvent.click(tabs[1]); // h2h
    expect(screen.getByTestId('h2h-panel')).toBeInTheDocument();
  });
});

describe('F-03 Analytics — team loading skeleton aria-busy (P2-2)', () => {
  it('isLoading prikazuje skeleton aria-busy bez team-panela', () => {
    state.team = {
      data: undefined as unknown,
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.team;
    render(<AnalyticsPage />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.queryByTestId('team-panel')).toBeNull();
  });
});

describe('F-03 Analytics — team error role=alert + retry disabled (P2-2/P2-3)', () => {
  it('isError prikazuje role=alert i retry je disabled dok je isFetching', async () => {
    const refetch = vi.fn();
    state.team = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch,
    } as unknown as typeof state.team;
    const { rerender } = render(<AnalyticsPage />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const btn = within(alert).getByRole('button', { name: 'Pokušaj ponovo' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();

    state.team = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch,
    } as unknown as typeof state.team;
    rerender(<AnalyticsPage />);
    const alert2 = screen.getByRole('alert');
    const btn2 = within(alert2).getByRole('button');
    expect(btn2).toBeDisabled();
  });
});

describe('F-03 Analytics — team lastUpdated/Osvježi (P2-3)', () => {
  it('success prikazuje lastUpdated i Osvježi poziva refetch', async () => {
    const ts = Date.now();
    const refetch = vi.fn();
    state.team = {
      data: {
        clubId: 'c1',
        clubName: 'FK Gračanica',
        played: 5,
        wins: 3,
        draws: 1,
        losses: 1,
        goalsFor: 10,
        goalsAgainst: 4,
        winPercent: 60,
        form: [],
        recent: [],
      } as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: ts,
      refetch,
    } as unknown as typeof state.team;
    const { rerender } = render(<AnalyticsPage />);
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();

    state.team = {
      data: {
        clubId: 'c1',
        clubName: 'FK Gračanica',
        played: 5,
        wins: 3,
        draws: 1,
        losses: 1,
        goalsFor: 10,
        goalsAgainst: 4,
        winPercent: 60,
        form: [],
        recent: [],
      } as unknown,
      isLoading: false,
      isError: false,
      isFetching: true,
      dataUpdatedAt: ts,
      refetch,
    } as unknown as typeof state.team;
    rerender(<AnalyticsPage />);
    expect(screen.getByRole('button', { name: 'admin.common.loading' })).toBeDisabled();
  });
});

describe('F-03 Analytics — Select disabled isFetching (P2-6)', () => {
  it('Select je disabled dok je isFetching', () => {
    state.team = {
      data: {
        clubId: 'c1',
        clubName: 'FK Gračanica',
        played: 5,
        wins: 3,
        draws: 1,
        losses: 1,
        goalsFor: 10,
        goalsAgainst: 4,
        winPercent: 60,
        form: [],
        recent: [],
      } as unknown,
      isLoading: false,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.team;
    render(<AnalyticsPage />);
    const select = document.querySelector('select');
    expect(select?.disabled).toBe(true);
  });
});

describe('F-03 AnalyticsVisitorsPanel — loading/error/lastUpdated (P2-5/P2-3)', () => {
  it('visitors tab isLoading prikazuje aria-busy', async () => {
    state.trend = {
      data: undefined as unknown,
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.trend;
    render(<AnalyticsPage />);
    const tablist = screen.getByRole('tablist');
    const tabs = within(tablist).getAllByRole('tab');
    await userEvent.click(tabs[3]);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('visitors error prikazuje role=alert i retry disabled', async () => {
    const refetchTotals = vi.fn();
    const refetchTrend = vi.fn();
    const refetchGeo = vi.fn();
    state.totals = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: refetchTotals,
    } as unknown as typeof state.totals;
    state.trend = {
      data: undefined as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: refetchTrend,
    } as unknown as typeof state.trend;
    state.geo = {
      data: undefined as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: refetchGeo,
    } as unknown as typeof state.geo;
    const { rerender } = render(<AnalyticsPage />);
    const tablist = screen.getByRole('tablist');
    const tabs = within(tablist).getAllByRole('tab');
    await userEvent.click(tabs[3]);
    const alert = screen.getByRole('alert');
    const btn = within(alert).getByRole('button', { name: 'Pokušaj ponovo' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetchTotals).toHaveBeenCalled();
    expect(refetchTrend).toHaveBeenCalled();
    expect(refetchGeo).toHaveBeenCalled();

    state.totals = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: refetchTotals,
    } as unknown as typeof state.totals;
    rerender(<AnalyticsPage />);
    const alert2 = screen.getByRole('alert');
    expect(within(alert2).getByRole('button')).toBeDisabled();
  });

  it('visitors success prikazuje lastUpdated i Osvježi', async () => {
    const ts = Date.now();
    state.totals = {
      data: { web: 10, mobile: 5, total: 15 } as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: ts,
      refetch: vi.fn(),
    } as unknown as typeof state.totals;
    state.trend = {
      data: [{ date: '2026-05-10', web: 10, mobile: 5, total: 15 }] as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: ts,
      refetch: vi.fn(),
    } as unknown as typeof state.trend;
    state.geo = {
      data: [{ countryCode: 'BA', count: 10, percent: 100 }] as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: ts,
      refetch: vi.fn(),
    } as unknown as typeof state.geo;
    render(<AnalyticsPage />);
    const tablist = screen.getByRole('tablist');
    await userEvent.click(within(tablist).getAllByRole('tab')[3]);
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Osvježi' })).toBeInTheDocument();
  });
});
