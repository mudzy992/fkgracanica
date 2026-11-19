import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsEditorPage } from './news/NewsEditorPage';

const editorState = vi.hoisted(() => ({
  item: { data: null as unknown as Record<string, unknown> | null, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  create: { mutateAsync: vi.fn(async () => ({ id: 'n-new' })), isPending: false },
  update: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string, opts?: Record<string, unknown>) => (opts?.defaultValue as string) ?? k }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../hooks/use-news-admin', () => ({
  useNewsById: () => ({ ...editorState.item, refetch: editorState.item.refetch, data: editorState.item.data }),
  useCreateNews: () => editorState.create,
  useUpdateNews: () => editorState.update,
  useNewsCategories: () => ({ data: [] as unknown[] }),
}));
vi.mock('../../components/ui/skeleton', () => ({ Skeleton: () => <div>skeleton</div> }));
vi.mock('./news/NewsEditorMain', () => ({
  NewsEditorMain: (props: Record<string, unknown>) => {
    const r = props.register as (name: string) => Record<string, unknown>;
    const errs = props.errors as Record<string, { message?: string }> | undefined;
    return (
      <div>
        <input placeholder="title-mock" {...r('title')} />
        <textarea placeholder="content-mock" {...r('content')} />
        {errs?.title?.message && <p>{errs.title.message}</p>}
        {errs?.content?.message && <p>{errs.content.message}</p>}
      </div>
    );
  },
}));
vi.mock('./news/NewsEditorMeta', () => ({
  NewsEditorMeta: (props: Record<string, unknown>) => {
    const r = props.register as (name: string) => Record<string, unknown>;
    return (
      <div>
        <input placeholder="slug-mock" {...r('slug')} />
      </div>
    );
  },
}));
vi.mock('../../lib/youtube', () => ({ isInvalidChangedYouTubeUrl: () => false }));
vi.mock('../../lib/api-error', () => ({ getApiErrorMessage: () => 'Greška pri spremanju vijesti' }));

const item = (over: Record<string, unknown> = {}) => ({
  id: 'n1',
  title: 'Naslov vijesti',
  slug: 'naslov-vijesti',
  content: 'Ovo je sadržaj vijesti koji je duži od deset karaktera i zadovoljava validaciju.',
  excerpt: '',
  videoUrl: null,
  coverPath: null,
  categoryId: null,
  category: null,
  tags: [],
  seoTitle: null,
  seoDesc: null,
  galleryId: null,
  scheduledAt: null,
  relatedMatches: [],
  relatedPlayers: [],
  ...over,
});

beforeEach(() => {
  editorState.item = { data: item() as unknown as Record<string, unknown>, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: Date.now(), refetch: vi.fn() };
  editorState.create = { mutateAsync: vi.fn(async () => ({ id: 'n-new' })), isPending: false } as unknown as typeof editorState.create;
  editorState.update = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof editorState.update;
});

function renderEditor(id?: string) {
  return render(
    <MemoryRouter initialEntries={[id ? `/admin/news/${id}/edit` : '/admin/news/new']}>
      <Routes>
        <Route path="/admin/news/new" element={<NewsEditorPage />} />
        <Route path="/admin/news/:id/edit" element={<NewsEditorPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('B05 NewsEditorPage — error, pending, lastUpdated', () => {
  it('isError prikazuje role=alert, heading ostaje, retry disabled kad fetching', async () => {
    editorState.item = { data: null, isLoading: false, isError: true, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() };
    renderEditor('n1');
    expect(screen.getByRole('heading', { name: /Uredi vijest/ })).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const btn = within(alert).getByRole('button');
    expect(btn).toBeDisabled();
    expect(alert).toHaveTextContent(/Greška pri učitavanju/);
  });

  it('loading prikazuje skeleton', () => {
    editorState.item = { data: null, isLoading: true, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
    renderEditor('n1');
    expect(screen.getByText('skeleton')).toBeInTheDocument();
  });

  it('lastUpdated i Osvježi poziva refetch, disabled kad fetching', async () => {
    const ts = Date.now();
    editorState.item = { data: item() as unknown as Record<string, unknown>, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: ts, refetch: vi.fn() };
    renderEditor('n1');
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(editorState.item.refetch).toHaveBeenCalled();
  });

  it('Osvježi disabled kad isFetching', () => {
    editorState.item = { data: item() as unknown as Record<string, unknown>, isLoading: false, isError: false, isFetching: true, dataUpdatedAt: Date.now(), refetch: vi.fn() };
    renderEditor('n1');
    const btn = screen.getByRole('button', { name: 'admin.common.loading' });
    expect(btn).toBeDisabled();
  });

  it('Sačuvaj disabled kad isPending global', async () => {
    editorState.create = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof editorState.create;
    renderEditor();
    expect(screen.getByRole('button', { name: 'Kreiraj (nacrt)' })).toBeDisabled();
  });

  it('Sačuvaj disabled kad update isPending', () => {
    editorState.update = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof editorState.update;
    renderEditor('n1');
    expect(screen.getByRole('button', { name: 'Sačuvaj' })).toBeDisabled();
  });

  it('greška spremanja ima role=alert', async () => {
    const user = userEvent.setup();
    editorState.update = { mutateAsync: vi.fn(async () => { throw new Error('x'); }), isPending: false } as unknown as typeof editorState.update;
    renderEditor('n1');
    // popuni title/content da zadovolji zod? Mock editor main ne renderuje inpute, pa direktno submitaj formu
    const save = screen.getByRole('button', { name: 'Sačuvaj' });
    await user.click(save);
    // error se prikazuje nakon catch
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Greška pri spremanju vijesti'));
  });

  it('nova vijest bez id ne prikazuje lastUpdated ni error retry', () => {
    editorState.item = { data: null, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
    renderEditor();
    expect(screen.queryByText(/Ažurirano/)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
