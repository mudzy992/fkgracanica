import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../i18n';
import { CmsPageBuilderPage } from './CmsPageBuilderPage';
import type { CmsPage, CmsPageSection } from '../../../cms/types';

const state = vi.hoisted(() => ({
  pages: { data: [] as unknown[], isLoading: false },
  confirm: vi.fn(async () => true),
  updatePage: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  updateSection: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  deleteSection: { mutateAsync: vi.fn(async () => ({})) },
  reorder: { mutateAsync: vi.fn(async () => ({})) },
  picker: { open: false, pageId: '' },
  editDialog: { open: false, section: null as CmsPageSection | null, dirty: false },
}));

vi.mock('../../../hooks/use-cms-pages', () => ({
  useCmsPages: () => state.pages,
  useUpdateCmsPage: () => state.updatePage,
  useUpdateCmsSection: () => state.updateSection,
  useDeleteCmsSection: () => state.deleteSection,
  useReorderCmsSections: () => state.reorder,
}));
vi.mock('../../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../../components/admin/AdminBreadcrumbs', () => ({
  AdminBreadcrumbs: ({ items }: { items: Array<{ label: string }> }) => <nav>{items.map((i) => i.label).join(' › ')}</nav>,
}));
vi.mock('./CmsPageMetaForm', () => ({
  CmsPageMetaForm: ({ meta, onChange, onSave, isPending }: {
    meta: { title: string; slug: string; status: string };
    onChange: (m: { title: string; slug: string; status: string }) => void;
    onSave: () => void; isPending?: boolean;
  }) => (
    <div>
      <span>meta:{meta.title}|{meta.slug}|{meta.status}</span>
      <button onClick={() => onChange({ ...meta, title: `${meta.title}!` })}>promijeni-meta</button>
      <button onClick={onSave} disabled={isPending}>sačuvaj-meta</button>
    </div>
  ),
}));
vi.mock('./CmsWidgetPicker', () => ({
  CmsWidgetPicker: ({ open, pageId }: { open: boolean; pageId: string }) => {
    state.picker = { open, pageId };
    return open ? <div>picker:{pageId}</div> : null;
  },
}));
vi.mock('./CmsPreviewPanel', () => ({
  CmsPreviewPanel: ({ sections, editingId, draftConfig }: { sections: CmsPageSection[]; editingId?: string; draftConfig?: unknown }) => (
    <div>preview:{sections.length} edit:{editingId ?? '-'} draft:{draftConfig ? 'da' : 'ne'}</div>
  ),
}));
vi.mock('./CmsSortableSections', () => ({
  CmsSortableSections: ({ sections, selectedId, onSelect, onReorder, onDelete, onToggleEnabled }: {
    sections: CmsPageSection[]; selectedId: string | null;
    onSelect: (s: CmsPageSection) => void; onReorder: (ids: string[]) => void;
    onDelete: (id: string) => void; onToggleEnabled: (id: string, enabled: boolean) => void;
  }) => (
    <div>
      <span>sekcije:{sections.length} izabrano:{selectedId ?? '-'}</span>
      <button onClick={() => onSelect(sections[0])}>otvori-prvu</button>
      <button onClick={() => onReorder(sections.map((s) => s.id).reverse())}>promijeni-red</button>
      <button onClick={() => onDelete(sections[0].id)}>obriši-prvu</button>
      <button onClick={() => onToggleEnabled(sections[0].id, false)}>isključi-prvu</button>
    </div>
  ),
}));
vi.mock('./CmsSectionEditDialog', () => ({
  CmsSectionEditDialog: ({ open, section, dirty, onChange, onSave }: {
    open: boolean; section: CmsPageSection | null; dirty: boolean;
    onChange: (c: Record<string, unknown>) => void; onSave: () => void;
  }) => {
    state.editDialog = { open, section, dirty };
    return open ? (
      <div data-testid="edit-dialog">
        <span>dijalog:{section?.id} dirty:{String(dirty)}</span>
        <button onClick={() => onChange({ title: 'Novo' })}>promijeni-config</button>
        <button onClick={onSave}>sačuvaj-sekciju</button>
      </div>
    ) : null;
  },
}));

const section = (id: string, widgetType = 'text'): CmsPageSection => ({ id, widgetType, enabled: true, config: { text: id } }) as unknown as CmsPageSection;
const page = (over: Partial<CmsPage> = {}): CmsPage => ({
  id: 'pg1', title: 'O nama', slug: 'o-nama', status: 'DRAFT',
  sections: [section('s1'), section('s2', 'gallery')],
  ...over,
}) as unknown as CmsPage;

const renderPage = (id = 'pg1') =>
  render(
    <MemoryRouter initialEntries={[`/admin/cms/${id}`]}>
      <Routes>
        <Route path="/admin/cms/:id" element={<CmsPageBuilderPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  state.pages = { data: [page()], isLoading: false };
  state.confirm = vi.fn(async () => true);
  state.updatePage = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.updateSection = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.deleteSection = { mutateAsync: vi.fn(async () => ({})) };
  state.reorder = { mutateAsync: vi.fn(async () => ({})) };
  state.picker = { open: false, pageId: '' };
  state.editDialog = { open: false, section: null, dirty: false };
});

describe('CmsPageBuilderPage', () => {
  it('nepoznata stranica prikazuje poruku, a poznata meta podatke i sekcije', () => {
    state.pages = { data: [page()], isLoading: false };
    const { unmount } = renderPage('nema');
    expect(screen.getByText(/cmsBuilder.notFound|Nije pronađena/i)).toBeInTheDocument();
    unmount();
    renderPage();
    expect(screen.getByText('meta:O nama|o-nama|DRAFT')).toBeInTheDocument();
    expect(screen.getByText('sekcije:2 izabrano:-')).toBeInTheDocument();
    expect(screen.getByText('preview:2 edit:- draft:ne')).toBeInTheDocument();
  });

  it('spremanje meta šalje izmijenjene vrijednosti', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'promijeni-meta' }));
    await user.click(screen.getByRole('button', { name: 'sačuvaj-meta' }));
    await waitFor(() => expect(state.updatePage.mutateAsync).toHaveBeenCalledWith({ id: 'pg1', title: 'O nama!', slug: 'o-nama', status: 'DRAFT' }));
  });

  it('greška pri spremanju meta prikazuje poruku i ostaje vidljiva', async () => {
    const user = userEvent.setup();
    state.updatePage = { ...state.updatePage, mutateAsync: vi.fn(async () => { throw new Error('Meta nije sačuvana'); }) };
    renderPage();
    await user.click(screen.getByRole('button', { name: 'sačuvaj-meta' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Meta nije sačuvana'));
  });

  it('otvaranje sekcije priprema draft, a spremanje šalje config', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'otvori-prvu' }));
    expect(screen.getByTestId('edit-dialog')).toHaveTextContent('dijalog:s1 dirty:false');
    expect(screen.getByText('preview:2 edit:s1 draft:ne')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'promijeni-config' }));
    expect(state.editDialog.dirty).toBe(true);
    expect(screen.getByText('preview:2 edit:s1 draft:da')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'sačuvaj-sekciju' }));
    await waitFor(() => expect(state.updateSection.mutateAsync).toHaveBeenCalledWith({ sectionId: 's1', config: { title: 'Novo' } }));
    await waitFor(() => expect(screen.queryByTestId('edit-dialog')).toBeNull());
  });

  it('brisanje sekcije ide kroz potvrdu i zatvara otvoreni dijalog', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'otvori-prvu' }));
    await user.click(screen.getByRole('button', { name: 'obriši-prvu' }));
    expect(state.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Obrisati sekciju?', description: 'Sekcija „text” i njen sadržaj biće obrisani.', variant: 'danger' }));
    await waitFor(() => expect(state.deleteSection.mutateAsync).toHaveBeenCalledWith('s1'));
    expect(screen.queryByTestId('edit-dialog')).toBeNull();
  });

  it('odbijena potvrda ne briše sekciju', async () => {
    const user = userEvent.setup();
    state.confirm = vi.fn(async () => false);
    renderPage();
    await user.click(screen.getByRole('button', { name: 'obriši-prvu' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledTimes(1));
    expect(state.deleteSection.mutateAsync).not.toHaveBeenCalled();
  });

  it('reorder i uključivanje sekcije šalju očekivane zahtjeve', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'promijeni-red' }));
    await waitFor(() => expect(state.reorder.mutateAsync).toHaveBeenCalledWith(['s2', 's1']));
    await user.click(screen.getByRole('button', { name: 'isključi-prvu' }));
    await waitFor(() => expect(state.updateSection.mutateAsync).toHaveBeenCalledWith({ sectionId: 's1', enabled: false }));
  });

  it('widget picker se otvara za trenutnu stranicu, a prazna stranica nema sekcija', async () => {
    const user = userEvent.setup();
    state.pages = { data: [page({ sections: [] })], isLoading: false };
    renderPage();
    expect(screen.getByText(/Nema sekcija/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '+ Widget' }));
    expect(screen.getByText('picker:pg1')).toBeInTheDocument();
    expect(state.picker).toEqual({ open: true, pageId: 'pg1' });
  });
});
