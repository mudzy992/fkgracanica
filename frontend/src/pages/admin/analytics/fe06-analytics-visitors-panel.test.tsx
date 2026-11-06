import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsVisitorsPanel } from './AnalyticsVisitorsPanel';
import { AnalyticsGeoPanel } from './AnalyticsGeoPanel';

const state = vi.hoisted(() => ({
  totals: { data: undefined as unknown, isLoading: false },
  trend: { data: undefined as unknown, isLoading: false },
  geo: { data: undefined as unknown, isLoading: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-analytics', () => ({
  useVisitorTotals: () => state.totals,
  useVisitorTrend: () => state.trend,
  useVisitorGeo: () => state.geo,
}));

const trend = [
  { date: '2026-05-01', web: 10, mobile: 5, total: 15 },
  { date: '2026-05-02', web: 20, mobile: 1, total: 21 },
];

describe('AnalyticsVisitorsPanel', () => {
  beforeEach(() => {
    state.totals = { data: { web: 120, mobile: 45, total: 165 }, isLoading: false };
    state.trend = { data: trend, isLoading: false };
    state.geo = { data: [], isLoading: false };
  });

  it('dok bilo koji upit učitava prikazuje poruku', () => {
    state.geo = { data: [], isLoading: true };
    render(<AnalyticsVisitorsPanel />);
    expect(screen.getByText('admin.analyticsPanel.loading')).toBeTruthy();
  });

  it('prikazuje tri KPI kartice sa ukupnim brojevima', () => {
    render(<AnalyticsVisitorsPanel />);
    expect(screen.getByText('admin.analyticsPanel.web30')).toBeTruthy();
    expect(screen.getByText('120')).toBeTruthy();
    expect(screen.getByText('45')).toBeTruthy();
    expect(screen.getByText('165')).toBeTruthy();
  });

  it('bez podataka o ukupnom broju prikazuje nule', () => {
    state.totals = { data: undefined, isLoading: false };
    render(<AnalyticsVisitorsPanel />);
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  it('prikazuje grafikon i tabelu sa obrnutim redom dana', () => {
    render(<AnalyticsVisitorsPanel />);
    expect(screen.getByText('admin.analyticsPanel.dailyTrend')).toBeTruthy();
    expect(screen.getByText('admin.analyticsPanel.table')).toBeTruthy();
    const rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]).getByText('2026-05-02')).toBeTruthy();
    expect(within(rows[1]).getByText('2026-05-01')).toBeTruthy();
    expect(within(rows[0]).getByText('21')).toBeTruthy();
  });

  it('bez trenda nema grafikona ni tabele', () => {
    state.trend = { data: [], isLoading: false };
    render(<AnalyticsVisitorsPanel />);
    expect(screen.queryByText('admin.analyticsPanel.dailyTrend')).toBeNull();
    expect(screen.queryByText('admin.analyticsPanel.table')).toBeNull();
  });

  it('uvijek prikazuje geo sekciju', () => {
    render(<AnalyticsVisitorsPanel />);
    expect(screen.getByText('admin.analyticsPanel.geo')).toBeTruthy();
    expect(screen.getByText(/Nema geo podataka/)).toBeTruthy();
  });
});

describe('AnalyticsGeoPanel', () => {
  it('bez redova prikazuje poruku', () => {
    render(<AnalyticsGeoPanel rows={[]} />);
    expect(screen.getByText(/Nema geo podataka/)).toBeTruthy();
  });

  it('poznata država dobija puni naziv, nepoznata kod', () => {
    render(
      <AnalyticsGeoPanel
        rows={[
          { countryCode: 'BA', count: 10, percent: 50 },
          { countryCode: 'XX', count: 5, percent: 25 },
        ]}
      />,
    );
    expect(screen.getByText('Bosna i Hercegovina')).toBeTruthy();
    expect(screen.getByText('XX')).toBeTruthy();
    expect(screen.getByText('10 · 50%')).toBeTruthy();
  });

  it('širina trake je proporcionalna maksimumu uz minimum 4%', () => {
    const { container } = render(
      <AnalyticsGeoPanel
        rows={[
          { countryCode: 'BA', count: 100, percent: 80 },
          { countryCode: 'HR', count: 1, percent: 1 },
        ]}
      />,
    );
    const widths = Array.from(container.querySelectorAll('div[style]')).map(
      (el) => (el as HTMLElement).style.width,
    );
    expect(widths[0]).toBe('100%');
    expect(widths[1]).toBe('4%');
  });
});
