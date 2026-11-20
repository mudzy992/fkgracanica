import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditPage } from './AuditPage';

const state = vi.hoisted(() => ({
  audit: {
    data: {
      data: [
        {
          id: 'a1',
          action: 'user.login',
          entity: 'User',
          createdAt: '2026-05-10T17:00:00.000Z',
          actor: { email: 'admin@fkgracanica.ba' },
        },
      ],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    } as unknown,
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
  useAuditLog: () => state.audit,
}));

vi.mock('../../lib/audit-action-labels', () => ({
  auditActionLabel: (a: string) => a,
}));

vi.mock('../../lib/utils', async () => {
  const actual = (await vi.importActual('../../lib/utils')) as Record<string, unknown>;
  return {
    ...actual,
    formatDateTime: (d: string) => d,
  };
});

vi.mock('../../components/seo/Seo', () => ({
  Seo: () => null,
}));

beforeEach(() => {
  state.audit = {
    data: {
      data: [
        {
          id: 'a1',
          action: 'user.login',
          entity: 'User',
          createdAt: '2026-05-10T17:00:00.000Z',
          actor: { email: 'admin@fkgracanica.ba' },
        },
      ],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    } as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as typeof state.audit;
});

describe('F-02 Audit — loading skeleton aria-busy (P2-2)', () => {
  it('isLoading prikazuje skeleton aria-busy bez tabele', () => {
    state.audit = {
      data: undefined as unknown,
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.audit;
    render(<AuditPage />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.queryByText('admin@fkgracanica.ba')).toBeNull();
  });
});

describe('F-02 Audit — error role=alert + retry disabled (P2-2/P2-3)', () => {
  it('isError prikazuje role=alert i retry je disabled dok je isFetching', async () => {
    const refetch = vi.fn();
    state.audit = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch,
    } as unknown as typeof state.audit;
    const { rerender } = render(<AuditPage />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const btn = within(alert).getByRole('button', { name: 'Pokušaj ponovo' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();

    state.audit = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch,
    } as unknown as typeof state.audit;
    rerender(<AuditPage />);
    const alert2 = screen.getByRole('alert');
    const btn2 = within(alert2).getByRole('button');
    expect(btn2).toBeDisabled();
  });
});

describe('F-02 Audit — empty + pagination i18n (P2-4)', () => {
  it('prazan entries prikazuje Nema zapisa.', () => {
    state.audit = {
      data: { data: [], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } } as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.audit;
    render(<AuditPage />);
    expect(screen.getByText('Nema zapisa.')).toBeInTheDocument();
  });

  it('paginacija koristi i18n Prethodna/Sljedeća i aria-live', async () => {
    state.audit = {
      data: { data: [{ id: 'a1', action: 'x', entity: 'E', createdAt: '', actor: null }], meta: { totalPages: 3, page: 1, limit: 20, total: 1 } } as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.audit;
    render(<AuditPage />);
    expect(screen.getByRole('button', { name: 'Prethodna' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sljedeća' })).not.toBeDisabled();
    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toContain('1 / 3');
  });

  it('paginacija je disabled dok je isFetching', () => {
    state.audit = {
      data: { data: [{ id: 'a1', action: 'x', entity: 'E', createdAt: '', actor: null }], meta: { totalPages: 3, page: 1, limit: 20, total: 1 } } as unknown,
      isLoading: false,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.audit;
    render(<AuditPage />);
    expect(screen.getByRole('button', { name: 'Sljedeća' })).toBeDisabled();
  });
});

describe('F-02 Audit — lastUpdated/Osvježi (P2-2)', () => {
  it('success prikazuje lastUpdated i Osvježi poziva refetch, disabled dok isFetching', async () => {
    const ts = Date.now();
    const refetch = vi.fn();
    state.audit = {
      data: {
        data: [{ id: 'a1', action: 'user.login', entity: 'User', createdAt: '', actor: { email: 'a@b.ba' } }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      } as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: ts,
      refetch,
    } as unknown as typeof state.audit;
    const { rerender } = render(<AuditPage />);
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();

    state.audit = {
      data: {
        data: [{ id: 'a1', action: 'user.login', entity: 'User', createdAt: '', actor: { email: 'a@b.ba' } }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      } as unknown,
      isLoading: false,
      isError: false,
      isFetching: true,
      dataUpdatedAt: ts,
      refetch,
    } as unknown as typeof state.audit;
    rerender(<AuditPage />);
    expect(screen.getByRole('button', { name: 'Učitavanje…' })).toBeDisabled();
  });
});
