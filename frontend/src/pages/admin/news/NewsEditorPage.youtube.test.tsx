import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../i18n';
import { NewsEditorPage } from './NewsEditorPage';

const legacy = 'https://notyoutube.com/watch?v=abc123XYZ01';
const state = vi.hoisted(() => ({
  update: vi.fn(),
  create: vi.fn(),
  item: { id: 'n', title: 'Stari naslov', slug: 'stari', content: 'Dovoljno dug sadržaj vijesti', videoUrl: 'https://notyoutube.com/watch?v=abc123XYZ01' },
}));
vi.mock('../../../hooks/use-news-admin', () => ({
  useNewsById: () => ({ data: state.item }),
  useNewsCategories: () => ({ data: [] }),
  useUpdateNews: () => ({ mutateAsync: state.update, isPending: false }),
  useCreateNews: () => ({ mutateAsync: state.create, isPending: false }),
}));
vi.mock('../../../components/admin/RichTextEditor', () => ({ RichTextEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => <textarea aria-label="Sadržaj" value={value} onChange={(e) => onChange(e.target.value)} /> }));
vi.mock('../../../components/admin/MediaPicker', () => ({ MediaPicker: () => null }));
vi.mock('../../../components/admin/EntitySelect', () => ({ EntitySelect: () => null }));
vi.mock('../../../components/admin/SlugField', () => ({ SlugField: () => null }));
vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));
beforeEach(() => { state.update.mockReset().mockResolvedValue({}); state.create.mockReset().mockResolvedValue({}); });

async function open() {
  const view = render(<MemoryRouter initialEntries={['/admin/news/n/edit']}><Routes><Route path="/admin/news/:id/edit" element={<NewsEditorPage />} /><Route path="/admin/news" element={<p>Lista</p>} /></Routes></MemoryRouter>);
  const input = await screen.findByRole('textbox', { name: /video url/i });
  await waitFor(() => expect(input).toHaveValue(legacy));
  return { ...view, input };
}
function save() { fireEvent.click(screen.getByRole('button', { name: 'Sačuvaj' })); }

describe('video editor vijesti', () => {
  it('odbija nov neispravan URL uz pristupačno objašnjenje', async () => {
    const { input } = await open();
    fireEvent.change(input, { target: { value: 'https://youtu.be/short' } });
    save();
    const error = await screen.findByRole('alert');
    expect(error).toHaveTextContent('Unesite ispravan YouTube link');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
    expect(state.update).not.toHaveBeenCalled();
  });
  it('čuva druge promjene i nepromijenjeni stari link', async () => {
    const { container } = await open();
    fireEvent.change(container.querySelector('input[name="title"]')!, { target: { value: 'Novi naslov' } });
    save();
    await waitFor(() => expect(state.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'n', title: 'Novi naslov', videoUrl: legacy })));
  });
  it('prazno polje šalje kao null', async () => {
    const { input } = await open();
    fireEvent.change(input, { target: { value: '' } });
    save();
    await waitFor(() => expect(state.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'n', videoUrl: null })));
  });
});
