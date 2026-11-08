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
  confirmArgs: [] as unknown[],
  updatePage: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  updateSection: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  deleteSection: { mutateAsync: vi.fn(async () => ({})) },
  reorder: { mutateAsync: vi.fn(async () => ({})) },
  picker: { open: false, pageId: '' },
  editDialog: { open: false, section: null as CmsPageSection | null, dirty: false, onSave: null as null | (() => void) },
}));

vi.mock('../../../hooks/use-cms-pages', () => ({
  useCmsPages: () => state.pages,
  useUpdateCmsPage: () => state.updatePage,
  useUpdateCmsSection: () => state.updateSection,
  useDeleteCmsSection: () => state.deleteSection,
  useReorderCmsSections: () => state.reorder,
}));
vi.mock('../../../hooks/use-confirm', () => ({
  useConfirm: () => ({
    confirm: async (args: unknown) => {
      state.confirmArgs.push(args);
      return (state.confirm as unknown as (a: unknown) => Promise<boolean>)(args);
    },
    dialog: null,
  }),
}));
vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../../components/admin/AdminBreadcrumbs', () => ({
  AdminBreadcrumbs: ({ items }: { items: Array<{ label: string }> }) => <nav>{items.map((i) => i.label).join(' › ')}</nav>,
}));
vi.mock('./CmsPageMetaForm', () => ({
  CmsPageMetaForm: ({ meta, onChange, onSave, isPending }: {
    meta: { title: string; slug: string; status: string };
    onChange: (m: { title: string; slug: string; status: string }) => void; onSave: () => void; isPending?: boolean;
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
      <button onClick={() => onSelect(sections[1] ?? sections[0])}>otvori-drugu</button>
      <button onClick={() => onReorder(sections.map((s) => s.id).reverse())}>promijeni-red</button>
      <button onClick={() => onDelete(sections[0].id)}>obriši-prvu</button>
      <button onClick={() => onDelete(sections[1]?.id ?? sections[0].id)}>obriši-drugu</button>
      <button onClick={() => onToggleEnabled(sections[0].id, false)}>isključi-prvu</button>
    </div>
  ),
}));
vi.mock('./CmsSectionEditDialog', () => ({
  CmsSectionEditDialog: ({ open, section, dirty, onChange, onSave, onOpenChange }: {
    open: boolean; section: CmsPageSection | null; dirty: boolean;
    onChange: (c: Record<string, unknown>) => void; onSave: () => void; onOpenChange: (o: boolean) => void;
  }) => {
    state.editDialog = { open, section, dirty, onSave };
    return (
      <div>
        {open ? (
          <div data-testid="edit-dialog">
            <span>dijalog:{section?.id} dirty:{String(dirty)}</span>
            <button onClick={() => onChange({ title: 'Novo' })}>promijeni-config</button>
            <button onClick={() => onOpenChange(true)}>zadrži-dijalog</button>
            <button onClick={() => onOpenChange(false)}>zatvori-dijalog</button>
            <button onClick={onSave}>sačuvaj-sekciju</button>
          </div>
        ) : null}
        <button onClick={onSave}>sačuvaj-bez-edit</button>
      </div>
    );
  },
}));

const section = (id: string, widgetType?: string, config: unknown = { text: id }): CmsPageSection =>
  ({ id, widgetType, enabled: true, config } as unknown as CmsPageSection);
const page = (over: Partial<CmsPage> = {}): CmsPage =>
  ({ id: 'pg1', title: 'O nama', slug: 'o-nama', status: 'DRAFT', sections: [section('s1', 'text'), section('s2', 'gallery')], ...over }) as unknown as CmsPage;

const renderPage = (id = 'pg1') => render(
  <MemoryRouter initialEntries={[`/admin/cms/${id}`]}>
    <Routes><Route path="/admin/cms/:id" element={<CmsPageBuilderPage />} /></Routes>
  </MemoryRouter>,
);

beforeEach(() => {
  state.pages = { data: [page()], isLoading: false };
  state.confirm = vi.fn(async () => true);
  state.confirmArgs = [];
  state.updatePage = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.updateSection = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.deleteSection = { mutateAsync: vi.fn(async () => ({})) };
  state.reorder = { mutateAsync: vi.fn(async () => ({})) };
  state.picker = { open: false, pageId: '' };
  state.editDialog = { open: false, section: null, dirty: false, onSave: null };
});

describe('CmsPageBuilderPage — varijante (6 grana)', () => {
  it('brisanje sekcije bez widgetType koristi fallback opis', async () => {
    const user = userEvent.setup();
    const p = page({ sections: [section('sx', undefined, { text: 'sx' })] });
    state.pages = { data: [p], isLoading: false };
    renderPage();
    await user.click(screen.getByRole('button', { name: 'obriši-prvu' }));
    expect(state.confirmArgs[0]).toMatchObject({ description: 'Sekcija i njen sadržaj biće obrisani.' });
    await waitFor(() => expect(state.deleteSection.mutateAsync).toHaveBeenCalledWith('sx'));
  });

  it('brisanje druge sekcije dok je prva u edit ne zatvara dijalog (editSection id mismatch)', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'otvori-prvu' }));
    expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'obriši-drugu' }));
    expect(state.confirmArgs[0]).toMatchObject({ description: expect.stringContaining('gallery') });
    await waitFor(() => expect(state.deleteSection.mutateAsync).toHaveBeenCalledWith('s2'));
    expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
  });

  it('otvaranje sekcije sa config null koristi ?? {} fallback', async () => {
    const user = userEvent.setup();
    const p = page({ sections: [section('s9', 'text', null as unknown as Record<string, unknown>)] });
    state.pages = { data: [p], isLoading: false };
    renderPage();
    await user.click(screen.getByRole('button', { name: 'otvori-prvu' }));
    expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'promijeni-config' }));
    await user.click(screen.getByRole('button', { name: 'sačuvaj-sekciju' }));
    await waitFor(() => expect(state.updateSection.mutateAsync).toHaveBeenCalledWith({ sectionId: 's9', config: { title: 'Novo' } }));
  });

  it('save bez editSection pokriva if (!editSection) return', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'sačuvaj-bez-edit' }));
    expect(state.updateSection.mutateAsync).not.toHaveBeenCalled();
  });

  it('isLoading true bez stranice pokriva page?.title ?? fallbackove', async () => {
    state.pages = { data: [], isLoading: true };
    renderPage('nema');
    expect(screen.queryByText(/cmsBuilder.notFound|Nije pronađena/i)).toBeNull();
    expect(screen.getByText(/Stranica/)).toBeInTheDocument();
    expect(screen.getByText(/Nema sekcija/i)).toBeInTheDocument();
  });

  it('section config undefined također pokriva ?? {}', async () => {
    const user = userEvent.setup();
    const p = page({ sections: [{ id: 'su', widgetType: 'text', enabled: true, config: undefined } as unknown as CmsPageSection] });
    state.pages = { data: [p], isLoading: false };
    renderPage();
    await user.click(screen.getByRole('button', { name: 'otvori-prvu' }));
    await user.click(screen.getByRole('button', { name: 'promijeni-config' }));
    await user.click(screen.getByRole('button', { name: 'sačuvaj-sekciju' }));
    await waitFor(() => expect(state.updateSection.mutateAsync).toHaveBeenCalledWith({ sectionId: 'su', config: { title: 'Novo' } }));
  });
});
