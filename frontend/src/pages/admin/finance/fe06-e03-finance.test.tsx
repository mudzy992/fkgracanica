import { render, screen, within } from '@testing-library/react';
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

const summary = { total: 4200 } as unknown as import('../../../hooks/use-finance-summary').FinanceSummary;

describe('E-03 FinanceAdminPage — P2', () => {
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

  it('isLoading pokazuje skeleton aria-busy i čuva Seo/h1 i export dugmad', () => {
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
    expect(screen.getByRole('heading', { name: 'admin.finance' })).toBeInTheDocument();
    expect(state.seo).toContain('admin.finance');
    expect(screen.getByRole('button', { name: 'Preuzmi Excel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preuzmi PDF' })).toBeInTheDocument();
    expect(screen.queryByTestId('kpi-grid')).toBeNull();
  });

  it('isError prikazuje role=alert i retry poziva refetch sa sačuvanim Seo/h1', async () => {
    state.summary = {
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.summary;
    render(<FinanceAdminPage />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'admin.finance' })).toBeInTheDocument();
    expect(state.seo).toContain('admin.finance');
    const btn = within(alert).getByRole('button', { name: 'Pokušaj ponovo' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(state.summary.refetch).toHaveBeenCalled();
  });

  it('isError retry je disabled dok je isFetching i prikazuje loading', () => {
    state.summary = {
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.summary;
    render(<FinanceAdminPage />);
    const alert = screen.getByRole('alert');
    const btn = within(alert).getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.textContent).toMatch(/loading/i);
  });

  it('success prikazuje lastUpdated i Osvježi poziva refetch', async () => {
    const ts = Date.now();
    state.summary = {
      data: summary,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: ts,
      refetch: vi.fn(),
    } as unknown as typeof state.summary;
    render(<FinanceAdminPage />);
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(state.summary.refetch).toHaveBeenCalled();
    expect(screen.getByTestId('kpi-grid')).toBeInTheDocument();
  });

  it('Osvježi je disabled dok je isFetching', () => {
    const ts = Date.now();
    state.summary = {
      data: summary,
      isLoading: false,
      isError: false,
      isFetching: true,
      dataUpdatedAt: ts,
      refetch: vi.fn(),
    } as unknown as typeof state.summary;
    render(<FinanceAdminPage />);
    const btn = screen.getByRole('button', { name: /loading/i });
    expect(btn).toBeDisabled();
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
  });

  it('Preuzmi Excel/PDF ostaju vidljivi u error i loading stanjima', async () => {
    state.summary = {
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.summary;
    const { unmount } = render(<FinanceAdminPage />);
    expect(screen.getByRole('button', { name: 'Preuzmi Excel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preuzmi PDF' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Preuzmi Excel' }));
    expect(state.exports[0]).toEqual(expect.objectContaining({ format: 'xlsx' }));
    unmount();
    state.summary = {
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.summary;
    state.exports = [];
    render(<FinanceAdminPage />);
    expect(screen.getByRole('button', { name: 'Preuzmi PDF' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Preuzmi PDF' }));
    expect(state.exports[0]).toEqual(expect.objectContaining({ format: 'pdf' }));
  });
});
