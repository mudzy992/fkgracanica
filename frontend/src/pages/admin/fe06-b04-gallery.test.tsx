import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GalleryAdminPage } from './GalleryAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

const state = vi.hoisted(() => ({
  gallery: { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  perms: [] as string[],
  confirm: vi.fn(async () => true),
  publish: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  remove: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) => {
      if (opts?.defaultValue) {
        let s = opts.defaultValue as string;
        if (opts.time) s = s.replace('{{time}}', opts.time as string);
        return s;
      }
      return k;
    },
  }),
}));
vi.mock('../../hooks/use-content-admin', () => ({
  useGalleryAdminList: () => ({ ...state.gallery, refetch: state.gallery.refetch }),
  useGalleryDetail: () => ({ data: null, isLoading: false }),
  useDeleteGallery: () => ({ mutateAsync: state.remove.mutateAsync, isPending: state.remove.isPending }),
  useUpdateGalleryStatus: () => ({ mutateAsync: state.publish.mutateAsync, isPending: state.publish.isPending }),
  useCreateGallery: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateGallery: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: d.AdminPageShellDouble, AdminDataTable: d.AdminDataTableDouble };
});
vi.mock('../../lib/content-status-labels', () => ({ contentStatusLabel: (s: string) => s }));
vi.mock('../../lib/action-errors', () => ({ runAction: (p: Promise<unknown>) => p.catch(() => {}) }));

const gallery = (over: Record<string, unknown> = {}) => ({
  id: 'g1', title: 'Kup 2025', status: 'DRAFT', ...over,
});

beforeEach(() => {
  state.gallery = { data: [gallery(), gallery({ id: 'g2', title: 'Liga', status: 'PUBLISHED' })] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
  state.perms = ['gallery.manage', 'gallery.approve'];
  state.confirm = vi.fn(async () => true);
  state.publish = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.publish;
  state.remove = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.remove;
  adminShellState.retried = 0;
  adminShellState.refreshed = 0;
  adminShellState.title = '';
});

describe('B04 GalleryAdminPage — P1/P2', () => {
  it('error — role=alert, heading ostaje, retry poziva refetch', async () => {
    state.gallery = { data: [] as unknown[], isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    render(<MemoryRouter><GalleryAdminPage /></MemoryRouter>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'admin.gallery' })).toBeInTheDocument();
    const btn = within(alert).getByRole('button', { name: 'pokušaj-ponovo' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(state.gallery.refetch).toHaveBeenCalled();
  });

  it('error retry disabled kad isFetching', () => {
    state.gallery = { data: [] as unknown[], isLoading: false, isError: true, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    render(<MemoryRouter><GalleryAdminPage /></MemoryRouter>);
    const alert = screen.getByRole('alert');
    const btn = within(alert).getByRole('button', { name: 'pokušaj-ponovo' });
    expect(btn).toBeDisabled();
  });

  it('loading — aria-busy skeleton', () => {
    state.gallery = { data: [] as unknown[], isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    render(<MemoryRouter><GalleryAdminPage /></MemoryRouter>);
    expect(document.querySelector('[aria-busy=\"true\"]')).toBeTruthy();
    expect(screen.getByText('učitavanje')).toBeInTheDocument();
  });

  it('empty ima role=status', () => {
    state.gallery = { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    render(<MemoryRouter><GalleryAdminPage /></MemoryRouter>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lastUpdated i Osvježi poziva refetch, disabled kad fetching', async () => {
    const ts = Date.now();
    state.gallery = { data: [gallery()] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: ts, refetch: vi.fn() } as unknown as typeof state.gallery;
    render(<MemoryRouter><GalleryAdminPage /></MemoryRouter>);
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(state.gallery.refetch).toHaveBeenCalled();
  });

  it('Objavi i Obriši disabled kad isPending (global)', () => {
    state.publish = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof state.publish;
    render(<MemoryRouter><GalleryAdminPage /></MemoryRouter>);
    const objavi = screen.getByRole('button', { name: 'Objavi' });
    const del = screen.getAllByRole('button', { name: 'actions.delete' })[0];
    expect(objavi).toBeDisabled();
    expect(del).toBeDisabled();
  });

  it('bez permisije nema Nova ni Objavi', () => {
    state.perms = [];
    render(<MemoryRouter><GalleryAdminPage /></MemoryRouter>);
    expect(screen.queryByText('Nova')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Objavi' })).toBeNull();
  });
});
