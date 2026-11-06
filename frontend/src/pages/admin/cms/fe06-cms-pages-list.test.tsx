import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CmsPagesList } from './CmsPagesList';

const state = vi.hoisted(() => ({
  pages: { data: [] as unknown[], isLoading: false, isError: false, refetch: vi.fn() },
  remove: { mutateAsync: vi.fn(async () => ({})) },
  confirmResult: true,
  confirmCalls: [] as Record<string, unknown>[],
  created: 0,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, o?: { title?: string }) => (o?.title ? `${k}:${o.title}` : k) }),
}));
vi.mock('../../../hooks/use-cms-pages', () => ({
  useCmsPages: () => state.pages,
  useDeleteCmsPage: () => state.remove,
}));
vi.mock('../../../hooks/use-confirm', () => ({
  useConfirm: () => ({
    confirm: async (opts: Record<string, unknown>) => {
      state.confirmCalls.push(opts);
      return state.confirmResult;
    },
    dialog: null,
  }),
}));
vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, actions, isLoading, isError, onRetry, children }: {
    title: string; actions?: React.ReactNode; isLoading?: boolean; isError?: boolean;
    onRetry?: () => void; children: React.ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <div data-testid="actions">{actions}</div>
      {isLoading && <p>učitavanje</p>}
      {isError && <button onClick={() => onRetry?.()}>pokušaj-ponovo</button>}
      {!isLoading && children}
    </div>
  ),
  AdminDataTable: ({ rows, columns, empty }: {
    rows: Array<Record<string, unknown> & { id: string }>;
    columns: Array<{ key: string; render: (row: never) => React.ReactNode }>;
    empty?: string;
  }) => (
    <div>
      {rows.length === 0 && <p>{empty}</p>}
      {rows.map((row) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {columns.map((column) => (
            <span key={column.key} data-col={column.key}>
              {column.render(row as never)}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const page = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  title: 'O nama',
  slug: 'o-nama',
  status: 'DRAFT',
  isSystem: false,
  ...over,
});

const renderList = () =>
  render(
    <MemoryRouter>
      <CmsPagesList onCreate={() => { state.created += 1; }} />
    </MemoryRouter>,
  );

describe('CmsPagesList', () => {
  beforeEach(() => {
    state.pages = { data: [page()], isLoading: false, isError: false, refetch: vi.fn() };
    state.remove = { mutateAsync: vi.fn(async () => ({})) };
    state.confirmResult = true;
    state.confirmCalls = [];
    state.created = 0;
  });

  it('prikazuje naslov, naslove kolona i prazno stanje', () => {
    state.pages = { ...state.pages, data: [] };
    renderList();
    expect(screen.getByRole('heading', { name: 'admin.cmsPages.title' })).toBeTruthy();
    expect(screen.getByText('admin.cmsPages.empty')).toBeTruthy();
  });

  it('prikazuje naslov, slug i statusnu oznaku stranice', () => {
    state.pages = {
      ...state.pages,
      data: [page(), page({ id: 'p2', title: 'Obavijesti', slug: 'obavijesti', status: 'PUBLISHED' })],
    };
    renderList();
    expect(screen.getByText('O nama')).toBeTruthy();
    expect(screen.getByText('o-nama')).toBeTruthy();
    expect(screen.getByText('Obavijesti')).toBeTruthy();
    expect(screen.getAllByText(/Nacrt|Objavljeno/).length).toBeGreaterThan(0);
  });

  it('dugme u zaglavlju zove onCreate', async () => {
    renderList();
    await userEvent.click(screen.getByRole('button', { name: 'admin.cmsPages.new' }));
    expect(state.created).toBe(1);
  });

  it('link „Uredi layout“ vodi na stranicu buildera', () => {
    renderList();
    const link = screen.getByRole('link', { name: 'Uredi layout' });
    expect(link.getAttribute('href')).toBe('/admin/cms/pages/p1');
  });

  it('samo nacrti koji nisu sistemski imaju dugme za brisanje', () => {
    state.pages = {
      ...state.pages,
      data: [page(), page({ id: 'p2', status: 'PUBLISHED' }), page({ id: 'p3', isSystem: true })],
    };
    renderList();
    expect(screen.getAllByRole('button', { name: 'Obriši' })).toHaveLength(1);
  });

  it('potvrđeno brisanje poziva API sa ID-em stranice', async () => {
    renderList();
    await userEvent.click(screen.getByRole('button', { name: 'Obriši' }));
    await waitFor(() => expect(state.remove.mutateAsync).toHaveBeenCalledWith('p1'));
    expect(state.confirmCalls[0]).toMatchObject({
      title: 'Obrisati stranicu?',
      description: 'O nama (o-nama) — samo nacrti se mogu obrisati.',
      variant: 'danger',
      confirmLabel: 'Obriši',
    });
  });

  it('odustajanje od potvrde ne briše stranicu', async () => {
    state.confirmResult = false;
    renderList();
    await userEvent.click(screen.getByRole('button', { name: 'Obriši' }));
    await waitFor(() => expect(state.confirmCalls).toHaveLength(1));
    expect(state.remove.mutateAsync).not.toHaveBeenCalled();
  });

  it('greška učitavanja poziva refetch', async () => {
    state.pages = { ...state.pages, isError: true };
    renderList();
    await userEvent.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.pages.refetch).toHaveBeenCalledTimes(1);
  });

  it('učitavanje prikazuje skeleton umjesto tabele', () => {
    state.pages = { ...state.pages, isLoading: true };
    renderList();
    expect(screen.getByText('učitavanje')).toBeTruthy();
    expect(screen.queryByText('O nama')).toBeNull();
  });
});
