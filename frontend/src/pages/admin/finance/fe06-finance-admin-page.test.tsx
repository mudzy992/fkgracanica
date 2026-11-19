import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinanceAdminPage } from '../FinanceAdminPage';

const state = vi.hoisted(() => ({
  summary: {
    data: undefined as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  },
  applied: [] as unknown[],
  exports: [] as unknown[],
  seo: [] as (string | undefined)[],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) => {
      if (opts?.defaultValue) {
        let s = opts.defaultValue as string;
        if (opts.from) s = s.replace('{{from}}', opts.from as string);
        if (opts.to) s = s.replace('{{to}}', opts.to as string);
        if (opts.time) s = s.replace('{{time}}', opts.time as string);
        if (opts.count !== undefined) s = s.replace('{{count}}', String(opts.count));
        return s;
      }
      return k;
    },
  }),
}));
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
    state.summary = {
      data: summary,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.summary;
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

  it('dok se učitava prikazuje skeleton aria-busy', () => {
    state.summary = {
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.summary;
    render(<FinanceAdminPage />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.queryByTestId('kpi-grid')).toBeNull();
  });

  it('greška nudi ponovno učitavanje uz role=alert i sačuvan Seo/h1', async () => {
    state.summary = {
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.summary;
    render(<FinanceAdminPage />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'admin.finance' })).toBeTruthy();
    expect(state.seo).toContain('admin.finance');
    const btn = screen.getByRole('button', { name: 'Pokušaj ponovo' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
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
