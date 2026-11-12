import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../i18n';
import { NewsEditorPage } from './NewsEditorPage';

const state = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  item: null as Record<string, unknown> | null,
  loading: false,
}));

vi.mock('../../../hooks/use-news-admin', () => ({
  useNewsById: () => ({ data: state.item, isLoading: state.loading }),
  useNewsCategories: () => ({ data: [] }),
  useUpdateNews: () => ({ mutateAsync: state.update, isPending: false }),
  useCreateNews: () => ({ mutateAsync: state.create, isPending: false }),
}));
vi.mock('../../../components/admin/RichTextEditor', () => ({
  RichTextEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="Sadržaj" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));
vi.mock('../../../components/admin/MediaPicker', () => ({ MediaPicker: () => null }));
vi.mock('../../../components/admin/EntitySelect', () => ({ EntitySelect: () => null }));
vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/news/new" element={<NewsEditorPage />} />
        <Route path="/admin/news/:id/edit" element={<NewsEditorPage />} />
        <Route path="/admin/news" element={<p>Lista vijesti</p>} />

      </Routes>
    </MemoryRouter>,
  );

const fillRequired = async () => {
  const title = document.querySelector<HTMLInputElement>('input[name="title"]');
  fireEvent.change(title as HTMLInputElement, { target: { value: 'Nova vijest' } });
  fireEvent.change(await screen.findByLabelText('Sadržaj'), {
    target: { value: 'Dovoljno dug sadržaj vijesti za formu.' },
  });
};

beforeEach(() => {
  state.create = vi.fn().mockResolvedValue({ id: 'n1' });
  state.update = vi.fn().mockResolvedValue({});
  state.item = null;
  state.loading = false;
});

afterEach(() => vi.restoreAllMocks());

describe('NewsEditorPage — tok kreiranja', () => {
  it('uspješno kreiranje vodi na uređivanje nove vijesti', async () => {
    renderAt('/admin/news/new');
    await fillRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Kreiraj (nacrt)' }));
    await waitFor(() => expect(state.create).toHaveBeenCalled());
    expect(await screen.findByRole('heading', { name: 'Uredi vijest' })).toBeInTheDocument();
  });

  it('greška kreiranja se prikazuje u alertu', async () => {
    state.create.mockRejectedValue(new Error('Server pao'));
    renderAt('/admin/news/new');
    await fillRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Kreiraj (nacrt)' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Server pao');
    expect(state.create).toHaveBeenCalledTimes(1);
  });

  it('neuspješno kreiranje ne navigira sa forme', async () => {
    state.create.mockRejectedValue(new Error('409'));
    renderAt('/admin/news/new');
    await fillRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Kreiraj (nacrt)' }));
    await screen.findByRole('alert');
    expect(screen.queryByText('Uređivanje kreirane vijesti')).toBeNull();
  });
});

describe('NewsEditorPage — napuštanje i učitavanje', () => {
  it('bez izmjena povratak ne pita', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    renderAt('/admin/news/new');
    fireEvent.click(screen.getByRole('button', { name: 'Odustani' }));
    expect(confirm).not.toHaveBeenCalled();
    expect(await screen.findByText('Lista vijesti')).toBeInTheDocument();
  });

  it('izmjena pa odustajanje pita i ostaje na formi kad se potvrda odbije', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderAt('/admin/news/new');
    fireEvent.change(document.querySelector<HTMLInputElement>('input[name="title"]')!, {
      target: { value: 'Nedovršena vijest' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Odustani' }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Lista vijesti')).toBeNull();
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Odustani' }));
    expect(await screen.findByText('Lista vijesti')).toBeInTheDocument();
  });

  it('potvrđena izmjena pa povratak pita tačno jednom po kliku', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderAt('/admin/news/new');
    fireEvent.change(document.querySelector<HTMLInputElement>('input[name="title"]')!, {
      target: { value: 'Spremna vijest' },
    });
    fireEvent.click(screen.getByRole('button', { name: '← Vijesti' }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Lista vijesti')).toBeInTheDocument();
  });

  it('uređivanje dok se vijest učitava prikazuje skeleton bez forme', () => {
    state.loading = true;
    renderAt('/admin/news/n1/edit');
    expect(screen.queryByRole('button', { name: 'Kreiraj (nacrt)' })).toBeNull();
    expect(screen.queryByText('Uredi vijest')).toBeNull();
  });
});
