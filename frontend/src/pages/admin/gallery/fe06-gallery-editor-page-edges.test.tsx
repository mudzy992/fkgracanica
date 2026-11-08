import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
  GalleryPhotoPicker: (props: Record<string, unknown>) => {
    state.picker = props;
    return <div>picker:{(props.existingPaths as string[]).join(',') || '-'}</div>;
  },
}));
vi.mock('../GalleryAdminPhotos', () => ({
  GalleryAdminPhotos: (props: Record<string, unknown>) => {
    state.photos = props;
    return <div>photos:{(props.photos as unknown[]).length}</div>;
  },
}));
function Probe() {
  return <div data-testid="loc">{useLocation().pathname}</div>;
}

function GoTo({ to, label = 'prebaci' }: { to: string; label?: string }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)}>{label}</button>;
}

function Harness({ id }: { id?: string }) {
  return (
    <MemoryRouter initialEntries={[id ? `/admin/gallery/${id}/edit` : '/admin/gallery/new']}>
      <Probe />
      <GoTo to="/admin/gallery/g2/edit" />
      <Routes>
        <Route path="/admin/gallery/new" element={<GalleryEditorPage />} />
        <Route path="/admin/gallery/:id/edit" element={<GalleryEditorPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const renderAt = (id?: string) => render(<Harness id={id} />);

const detail = (over: Record<string, unknown> = {}) => ({
  id: 'g1', title: 'Kup 2025', description: 'Finale', status: 'PUBLISHED',
  photos: [{ id: 'p1', path: 'a.jpg' }, { id: 'p2', path: 'b.jpg' }],
  ...over,
});

beforeEach(() => {
  state.detail = { data: detail(), isLoading: false };
  state.create = { mutateAsync: vi.fn(async () => ({ id: 'g-new' })), isPending: false };
  state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.picker = {};
  state.photos = {};
});

/** Batch 34 — nedostajući opis galerije (odvojeno zbog limita dužine). */
describe('GalleryEditorPage — nedostajući opis i prelazak sa nacrtom (batch 34)', () => {
  it('galerija bez opisa ima prazno polje', () => {
    state.detail = { data: detail({ description: null }), isLoading: false };
    renderAt('g1');
    expect(screen.getByPlaceholderText('admin.galleryEditor.descriptionOptional')).toHaveValue('');
  });

  it('kreiranje bez opisa šalje `undefined`', async () => {
    const user = userEvent.setup();
    state.detail = { data: null, isLoading: false };
    renderAt();
    await user.type(screen.getByPlaceholderText('admin.galleryEditor.titleRequired'), 'Samo naslov');
    await user.click(screen.getByRole('button', { name: 'admin.galleryEditor.createAlbum' }));
    await waitFor(() =>
      expect(state.create.mutateAsync).toHaveBeenCalledWith({
        title: 'Samo naslov',
        description: undefined,
      }),
    );
  });
});
