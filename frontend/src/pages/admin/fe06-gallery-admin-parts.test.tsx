import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GalleryAdminPage } from './GalleryAdminPage';

vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, isLoading, isError, onRetry, actions, children }: {
    title: string; isLoading?: boolean; isError?: boolean;
    onRetry?: () => void; actions?: ReactNode; children: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <div data-testid="actions">{actions}</div>
      {isError && <button onClick={() => onRetry?.()}>pokušaj-ponovo</button>}
      {isLoading ? <p>učitavanje</p> : children}
    </div>
  ),
  AdminDataTable: ({ rows, columns }: {
    rows: Array<Record<string, unknown> & { id: string }>;
    columns: Array<{ key: string; render: (row: never) => ReactNode }>;
  }) => (
    <div>
      {rows.map((row) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {columns.map((column) => (
            <span key={column.key} data-col={column.key}>{column.render(row as never)}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const state = vi.hoisted(() => ({
  list: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  publish: { mutateAsync: vi.fn(async () => ({})) },
  remove: { mutateAsync: vi.fn(async () => ({})) },
  removePhoto: { mutateAsync: vi.fn(async () => ({})) },
  reorder: { mutateAsync: vi.fn(async () => ({})) },
  confirm: vi.fn(async () => true),
  permissions: [] as string[],
  seo: [] as (string | undefined)[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-content-admin', () => ({
  useGalleryAdminList: () => state.list,
  useUpdateGalleryStatus: () => state.publish,
  useDeleteGallery: () => state.remove,
  useRemoveGalleryPhoto: () => state.removePhoto,
  useReorderGalleryPhotos: () => state.reorder,
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));

const gallery = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  title: `Galerija ${id}`,
  status: 'DRAFT',
  ...over,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <GalleryAdminPage />
    </MemoryRouter>,
  );

describe('GalleryAdminPage', () => {
  beforeEach(() => {
    state.permissions = ['gallery.manage', 'gallery.approve'];
    state.list = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
    state.publish = { mutateAsync: vi.fn(async () => ({})) };
    state.remove = { mutateAsync: vi.fn(async () => ({})) };
    state.confirm = vi.fn(async () => true);
    state.seo = [];
  });

  it('postavlja naslov, SEO i akciju za novu galeriju', () => {
    renderPage();
    expect(state.seo).toContain('admin.gallery');
    expect(screen.getByRole('heading', { name: 'admin.gallery' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Nova/ }).getAttribute('href')).toBe('/admin/gallery/new');
  });

  it('bez gallery.manage nema akcije za novu galeriju', () => {
    state.permissions = ['gallery.approve'];
    renderPage();
    expect(screen.queryByRole('link', { name: /Nova/ })).toBeNull();
  });

  it('red prikazuje naslov kao link, status i akcije', () => {
    state.list = {
      data: [gallery('g1'), gallery('g2', { status: 'PUBLISHED' })],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage();
    const first = screen.getByTestId('row-g1');
    expect(within(first).getByRole('link', { name: 'Galerija g1' }).getAttribute('href')).toBe(
      '/admin/gallery/g1/edit',
    );
    expect(within(first).getByText('Nacrt')).toBeTruthy();
    expect(within(first).getByRole('button', { name: 'Objavi' })).toBeTruthy();

    const second = screen.getByTestId('row-g2');
    expect(within(second).getByText('Objavljeno')).toBeTruthy();
    expect(within(second).queryByRole('button', { name: 'Objavi' })).toBeNull();
  });

  it('objava mijenja status na PUBLISHED', async () => {
    state.list = { data: [gallery('g1')], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Objavi' }));
    expect(state.publish.mutateAsync).toHaveBeenCalledWith({ id: 'g1', status: 'PUBLISHED' });
  });

  it('bez gallery.approve nema dugmeta Objavi', () => {
    state.permissions = ['gallery.manage'];
    state.list = { data: [gallery('g1')], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    expect(screen.queryByRole('button', { name: 'Objavi' })).toBeNull();
  });

  it('bez gallery.manage nema uređivanja ni brisanja', () => {
    state.permissions = ['gallery.approve'];
    state.list = { data: [gallery('g1')], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.delete' })).toBeNull();
  });

  it('brisanje traži potvrdu sa naslovom galerije', async () => {
    state.list = { data: [gallery('g1')], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'actions.delete' }));
    expect(state.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Obrisati galeriju?',
        description: '"Galerija g1" će biti trajno obrisana.',
      }),
    );
    expect(state.remove.mutateAsync).toHaveBeenCalledWith('g1');
  });

  it('odbijena potvrda ne briše galeriju', async () => {
    state.confirm = vi.fn(async () => false);
    state.list = { data: [gallery('g1')], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'actions.delete' }));
    expect(state.remove.mutateAsync).not.toHaveBeenCalled();
  });

  it('greška nudi ponovno učitavanje', async () => {
    state.list = { data: undefined, isLoading: false, isError: true, refetch: vi.fn() };
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.list.refetch).toHaveBeenCalled();
  });
});
