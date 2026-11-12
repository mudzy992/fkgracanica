import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinanceAdminPage } from '../FinanceAdminPage';

const state = vi.hoisted(() => ({
  summary: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  applied: [] as unknown[],
  exports: [] as unknown[],
  seo: [] as (string | undefined)[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-finance-summary', () => ({
  useFinanceSummary: (filters: unknown) => {
    state.applied.push(filters);
    return state.summary;
  },
  downloadFinanceExport: (format: string, filters: unknown) => {
    state.exports.push({ format, filters });
    return Promise.resolve();
  },
}));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('./FinanceKpiGrid', () => ({
  FinanceKpiGrid: ({ data }: { data: { total: number } }) => (
    <div data-testid="kpi-grid">ukupno:{data.total}</div>
  ),
}));
vi.mock('./FinanceBuckets', () => ({
  FinanceBuckets: ({ data }: { data: { total: number } }) => <div data-testid="buckets">{data.total}</div>,
}));
vi.mock('./FinanceFiltersForm', () => ({
  FinanceFiltersForm: ({ onApply }: { draft: unknown; setDraft: (v: unknown) => void; onApply: () => void }) => (
    <div data-testid="filters">
      <button onClick={onApply}>primijeni</button>
    </div>
  ),
}));

const summary = { total: 4200 };

describe('FinanceAdminPage', () => {
  beforeEach(() => {
    state.summary = { data: summary, isLoading: false, isError: false, refetch: vi.fn() };
    state.applied = [];
    state.exports = [];
    state.seo = [];
  });

  it('postavlja naslov i SEO te prikazuje period', () => {
    render(<FinanceAdminPage />);
    expect(state.seo).toContain('admin.finance');
    expect(screen.getByRole('heading', { name: 'admin.finance' })).toBeTruthy();
    expect(screen.getByText(/Pregled uplata ulaznica/)).toBeTruthy();
  });

  it('podrazumijevani filteri su od 1. januara do danas', () => {
    render(<FinanceAdminPage />);
    const year = new Date().getFullYear();
    expect(state.applied[0]).toEqual(
      expect.objectContaining({ from: `${year}-01-01`, provider: '', status: '' }),
    );
  });

  it('prikazuje KPI grid, buckete i napomenu o članarinama', () => {
    render(<FinanceAdminPage />);
    expect(screen.getByTestId('kpi-grid').textContent).toBe('ukupno:4200');
    expect(screen.getByTestId('buckets')).toBeTruthy();
    expect(screen.getByText(/Članarine su procjena/)).toBeTruthy();
  });

  it('dok se učitava prikazuje poruku', () => {
    state.summary = { data: undefined, isLoading: true, isError: false, refetch: vi.fn() };
    render(<FinanceAdminPage />);
    expect(screen.getByText('admin.common.loading')).toBeTruthy();
    expect(screen.queryByTestId('kpi-grid')).toBeNull();
  });

  it('greška nudi ponovno učitavanje', async () => {
    state.summary = { data: undefined, isLoading: false, isError: true, refetch: vi.fn() };
    render(<FinanceAdminPage />);
    await userEvent.click(screen.getByRole('button', { name: 'actions.retry' }));
    expect(state.summary.refetch).toHaveBeenCalled();
    expect(screen.queryByTestId('kpi-grid')).toBeNull();
  });

  it('primanje filtera ponovno koristi iste filtere za izvoz', async () => {
    render(<FinanceAdminPage />);
    await userEvent.click(screen.getByRole('button', { name: 'primijeni' }));
    // isti objekat filtera ne pokreće novi render/upit
    expect(state.applied.length).toBe(1);
    await userEvent.click(screen.getByRole('button', { name: 'Preuzmi Excel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Preuzmi PDF' }));
    expect(state.exports.map((e) => (e as { format: string }).format)).toEqual(['xlsx', 'pdf']);
    expect((state.exports[0] as { filters: unknown }).filters).toEqual(state.applied.at(-1));
  });

  void (null as ReactNode | null);
});
