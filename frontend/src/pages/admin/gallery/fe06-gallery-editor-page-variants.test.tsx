import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GalleryEditorPage } from './GalleryEditorPage';

const state = vi.hoisted(() => ({
  detail: { data: null as Record<string, unknown> | null, isLoading: false },
  create: { mutateAsync: vi.fn(async () => ({ id: 'g-new' })), isPending: false },
  update: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  picker: {} as Record<string, unknown>,
  photos: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../../hooks/use-content-admin', () => ({
  useCreateGallery: () => state.create,
  useUpdateGallery: () => state.update,
  useGalleryDetail: () => state.detail,
}));
vi.mock('../../../components/ui/skeleton', () => ({ Skeleton: () => <div>skeleton</div> }));
vi.mock('../../../components/admin/GalleryPhotoPicker', () => ({
  GalleryPhotoPicker: () => <div>picker</div>,
}));
vi.mock('../GalleryAdminPhotos', () => ({
  GalleryAdminPhotos: () => <div>photos</div>,
}));

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
  photos: [{ id: 'p1', path: 'a.jpg' }],
  ...over,
});

beforeEach(() => {
  state.detail = { data: detail(), isLoading: false };
  state.create = { mutateAsync: vi.fn(async () => ({ id: 'g-new' })), isPending: false };
  state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false };
});

describe('GalleryEditorPage — varijante zaštite nacrta (3 grane)', () => {
  it('refetch istog id bez izmjene ažurira naslov sa servera', () => {
    const view = render(<Harness id="g1" />);
    expect(screen.getByDisplayValue('Kup 2025')).toBeInTheDocument();
    // server promijeni naslov, korisnik nije dirao polje
    state.detail = { data: detail({ title: 'Kup 2026' }), isLoading: false };
    view.rerender(<Harness id="g1" />);
    expect(screen.getByDisplayValue('Kup 2026')).toBeInTheDocument();
  });

  it('refetch istog id sa izmijenjenim naslovom čuva nacrt', async () => {
    const user = userEvent.setup();
    const view = render(<Harness id="g1" />);
    const title = screen.getByDisplayValue('Kup 2025');
    await user.clear(title);
    await user.type(title, 'Moj nacrt');
    expect(screen.getByDisplayValue('Moj nacrt')).toBeInTheDocument();
    // server vrati novi naslov ali nacrt ostaje
    state.detail = { data: detail({ title: 'Server novi' }), isLoading: false };
    view.rerender(<Harness id="g1" />);
    expect(screen.getByDisplayValue('Moj nacrt')).toBeInTheDocument();
  });

  it('refetch istog id bez izmjene opisa ažurira opis', () => {
    const view = render(<Harness id="g1" />);
    expect(screen.getByDisplayValue('Finale')).toBeInTheDocument();
    state.detail = { data: detail({ description: 'Novi opis' }), isLoading: false };
    view.rerender(<Harness id="g1" />);
    expect(screen.getByDisplayValue('Novi opis')).toBeInTheDocument();
  });

  it('refetch istog id sa izmijenjenim opisom čuva nacrt opisa', async () => {
    const user = userEvent.setup();
    const view = render(<Harness id="g1" />);
    const desc = screen.getByDisplayValue('Finale');
    await user.clear(desc);
    await user.type(desc, 'Moj opis nacrt');
    state.detail = { data: detail({ description: 'Server opis novi' }), isLoading: false };
    view.rerender(<Harness id="g1" />);
    expect(screen.getByDisplayValue('Moj opis nacrt')).toBeInTheDocument();
  });

  it('promjena id bez touch koristi novi naslov sa servera', () => {
    const view = render(<Harness id="g1" />);
    expect(screen.getByDisplayValue('Kup 2025')).toBeInTheDocument();
    // prelazak na drugu galeriju bez uređivanja
    state.detail = { data: detail({ id: 'g2', title: 'Druga' }), isLoading: false };
    view.rerender(<Harness id="g2" />);
    expect(screen.getByDisplayValue('Druga')).toBeInTheDocument();
  });
});
