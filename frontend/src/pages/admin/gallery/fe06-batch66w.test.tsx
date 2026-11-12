import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GalleryEditorPage } from './GalleryEditorPage';

const state = vi.hoisted(() => ({
  detail: { data: null as unknown as Record<string, unknown> | null, isLoading: false },
  create: { mutateAsync: vi.fn(async () => ({ id: 'g-new' })), isPending: false },
  update: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../../hooks/use-content-admin', () => ({
  useCreateGallery: () => state.create,
  useUpdateGallery: () => state.update,
  useGalleryDetail: () => state.detail,
}));
vi.mock('../../../components/ui/skeleton', () => ({ Skeleton: () => <div>skeleton</div> }));
vi.mock('../../../components/admin/GalleryPhotoPicker', () => ({ GalleryPhotoPicker: () => <div>picker</div> }));
vi.mock('../GalleryAdminPhotos', () => ({ GalleryAdminPhotos: () => <div>photos</div> }));

function Harness({ id }: { id?: string }) {
  return (
    <MemoryRouter initialEntries={[id ? `/admin/gallery/${id}/edit` : '/admin/gallery/new']}>
      <Routes>
        <Route path="/admin/gallery/new" element={<GalleryEditorPage />} />
        <Route path="/admin/gallery/:id/edit" element={<GalleryEditorPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const detail = (over: Record<string, unknown> = {}) => ({
  id: 'g1',
  title: 'Kup 2025',
  description: 'Finale',
  status: 'PUBLISHED',
  photos: [],
  ...over,
});

beforeEach(() => {
  state.detail = { data: detail(), isLoading: false } as never;
});

describe('GalleryEditorPage batch66w — edited ? value : incoming (branch 6 & 9)', () => {
  it('edited.title true čuva nacrt kod refetch-a (pokriva edited.title ? value)', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness id="g1" />);
    const titleInput = screen.getByDisplayValue('Kup 2025') as HTMLInputElement;
    // korisnik mijenja naslov -> markTouched title = true
    await user.clear(titleInput);
    await user.type(titleInput, 'Moj nacrt');
    expect(titleInput.value).toBe('Moj nacrt');
    // server refetch sa novim naslovom, ali pošto je edited true, treba čuvati nacrt
    state.detail = { data: detail({ title: 'Server novi naslov' }), isLoading: false } as never;
    rerender(<Harness id="g1" />);
    // input treba i dalje biti Moj nacrt, ne Server novi naslov
    expect(screen.getByDisplayValue('Moj nacrt')).toBeInTheDocument();
  });

  it('edited.description true čuva nacrt kod refetch-a', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness id="g1" />);
    const desc = screen.getByDisplayValue('Finale') as HTMLTextAreaElement;
    await user.clear(desc);
    await user.type(desc, 'Moj opis');
    expect(desc.value).toBe('Moj opis');
    state.detail = { data: detail({ description: 'Server opis' }), isLoading: false } as never;
    rerender(<Harness id="g1" />);
    expect(screen.getByDisplayValue('Moj opis')).toBeInTheDocument();
  });

  it('kada previous.id === incoming.id i value === previous.title, ažurira na incoming.title', async () => {
    // inicijalno g1 sa title A
    state.detail = { data: detail({ title: 'A' }), isLoading: false } as never;
    const { rerender } = render(<Harness id="g1" />);
    expect(screen.getByDisplayValue('A')).toBeInTheDocument();
    // bez editovanja (edited false), server promijeni na B, treba ažurirati jer value === previous.title
    state.detail = { data: detail({ title: 'B' }), isLoading: false } as never;
    rerender(<Harness id="g1" />);
    // pošto nismo dirali input, value je bio A, previous.title je A, pa treba preći na B
    expect(screen.getByDisplayValue('B')).toBeInTheDocument();
  });

  it('kada previous.id === incoming.id i value !== previous.title, čuva value', async () => {
    const user = userEvent.setup();
    state.detail = { data: detail({ title: 'A' }), isLoading: false } as never;
    const { rerender } = render(<Harness id="g1" />);
    const input = screen.getByDisplayValue('A');
    await user.clear(input);
    await user.type(input, 'C');
    // server vrati B, ali pošto je value C !== previous.title A, čuva C
    state.detail = { data: detail({ title: 'B' }), isLoading: false } as never;
    rerender(<Harness id="g1" />);
    expect(screen.getByDisplayValue('C')).toBeInTheDocument();
  });
});
