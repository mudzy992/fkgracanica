import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CmsMenuEditor } from './CmsMenuEditor';
import type { MenuDraftItem } from './menu-utils';

const state = vi.hoisted(() => ({
  menu: { data: null as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  pages: { data: [] as unknown[] },
  flags: { data: {} as Record<string, string> },
  save: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  listProps: [] as { items: MenuDraftItem[]; pages: unknown[] }[],
  previewProps: [] as { items: MenuDraftItem[] }[],
  shell: { title: '', isLoading: false, isError: false, retried: 0 },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-cms-pages', () => ({
  useCmsMenu: () => state.menu,
  useCmsPages: () => state.pages,
  useSaveCmsMenu: () => state.save,
}));
vi.mock('../../../hooks', () => ({ useModuleFlags: () => state.flags }));
vi.mock('../../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, isLoading, isError, onRetry, children }: {
    title: string; isLoading?: boolean; isError?: boolean; onRetry?: () => void; children: React.ReactNode;
  }) => {
    state.shell = { title, isLoading: !!isLoading, isError: !!isError, retried: state.shell.retried };
    return (
      <div>
        <h1>{title}</h1>
        {isError && <button onClick={() => onRetry?.()}>pokušaj-ponovo</button>}
        {children}
      </div>
    );
  },
}));
vi.mock('./CmsMenuPreviewBar', () => ({
  CmsMenuPreviewBar: ({ items }: { items: MenuDraftItem[] }) => {
    state.previewProps.push({ items });
    return <p>preview:{items.map((i) => i.label).join(',')}</p>;
  },
}));
vi.mock('./CmsMenuSortableList', () => ({
  CmsMenuSortableList: ({ items, pages }: { items: MenuDraftItem[]; pages: unknown[] }) => {
    state.listProps.push({ items, pages });
    return <p>lista:{items.length}</p>;
  },
}));

const menu = {
  id: 'm1',
  key: 'main',
  items: [
    { id: 'i2', label: 'Vijesti', path: '/vijesti', sortOrder: 2, isSystem: true, enabled: true },
    { id: 'i1', label: 'Početna', path: '/', sortOrder: 1, isSystem: true, enabled: true },
  ],
};

const renderEditor = () => render(<CmsMenuEditor />);

describe('CmsMenuEditor', () => {
  beforeEach(() => {
    state.menu = { data: menu, isLoading: false, isError: false, refetch: vi.fn() };
    state.pages = { data: [{ id: 'p1', title: 'O nama', slug: 'o-nama' }] };
    state.flags = { data: { 'modules.news': 'true' } };
    state.save = { mutateAsync: vi.fn(async () => ({})), isPending: false };
    state.listProps = [];
    state.previewProps = [];
    state.shell = { title: '', isLoading: false, isError: false, retried: 0 };
  });

  it('prikazuje naslov, preview i sortiranu listu stavki', () => {
    renderEditor();
    expect(screen.getByRole('heading', { name: 'admin.cmsMenu.title' })).toBeTruthy();
    expect(screen.getByText('preview:Početna,Vijesti')).toBeTruthy();
    expect(screen.getByText('lista:2')).toBeTruthy();
    const listProps = state.listProps[state.listProps.length - 1];
    expect(listProps.items[0]).toMatchObject({ id: 'i1', path: '/' });
    expect(listProps.pages).toHaveLength(1);
  });

  it('prazan meni ne pada i lista je prazna', () => {
    state.menu = { ...state.menu, data: null };
    renderEditor();
    expect(screen.getByText('lista:0')).toBeTruthy();
  });

  it('dodavanje prilagođene stavke je dodaje na kraj', async () => {
    renderEditor();
    await userEvent.click(screen.getByRole('button', { name: '+ Prilagođena stavka' }));
    const items = state.listProps[state.listProps.length - 1].items;
    expect(items).toHaveLength(3);
    expect(items[2]).toMatchObject({
      label: 'Nova stavka',
      path: '/p/',
      sortOrder: 2,
      enabled: true,
      isSystem: false,
    });
    expect(state.previewProps[state.previewProps.length - 1].items).toHaveLength(3);
  });

  it('čuvanje šalje stavke sa redoslijedom po indeksu i null poljima', async () => {
    renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Sačuvaj meni' }));
    await waitFor(() => expect(state.save.mutateAsync).toHaveBeenCalledTimes(1));
    expect(state.save.mutateAsync).toHaveBeenCalledWith([
      { id: 'i1', label: 'Početna', path: '/', sortOrder: 0, pageId: null, externalUrl: null, enabled: true },
      { id: 'i2', label: 'Vijesti', path: '/vijesti', sortOrder: 1, pageId: null, externalUrl: null, enabled: true },
    ]);
  });

  it('čuvanje zadržava pageId i eksterni link kad postoje', async () => {
    state.menu = {
      ...state.menu,
      data: {
        items: [
          {
            id: 'i3',
            label: 'O nama',
            pageId: 'p1',
            externalUrl: 'https://ffbih.ba',
            sortOrder: 1,
            isSystem: false,
            enabled: false,
          },
        ],
      },
    };
    renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Sačuvaj meni' }));
    await waitFor(() => expect(state.save.mutateAsync).toHaveBeenCalled());
    expect(state.save.mutateAsync).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'i3', pageId: 'p1', externalUrl: 'https://ffbih.ba', enabled: false }),
    ]);
  });

  it('dok traje čuvanje dugme je onemogućeno', () => {
    state.save = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    renderEditor();
    expect(screen.getByRole('button', { name: 'Sačuvaj meni' })).toHaveProperty('disabled', true);
  });

  it('greška učitavanja poziva refetch', async () => {
    state.menu = { ...state.menu, isError: true };
    renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.menu.refetch).toHaveBeenCalledTimes(1);
  });

  it('prosljeđuje zastavice modula u preview i listu', () => {
    state.flags = { data: { 'modules.news': 'false' } };
    renderEditor();
    expect(state.listProps[state.listProps.length - 1].items).toHaveLength(2);
  });
});
