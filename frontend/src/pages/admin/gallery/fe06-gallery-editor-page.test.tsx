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

function GoTo({ to }: { to: string }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)}>prebaci</button>;
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

describe('GalleryEditorPage — učitavanje i prikaz', () => {
  it('dok se galerija učitava prikazuje skeleton, bez forme', () => {
    state.detail = { data: null, isLoading: true };
    renderAt('g1');
    expect(screen.getByText('skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Uredi galeriju')).toBeNull();
  });

  it('postojeća galerija prikazuje naslov, status, fotografije i birač', () => {
    renderAt('g1');
    expect(screen.getByText('Uredi galeriju')).toBeInTheDocument();
    expect(screen.getByText('Objavljeno')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kup 2025')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Finale')).toBeInTheDocument();
    expect(screen.getByText('picker:a.jpg,b.jpg')).toBeInTheDocument();
    expect(screen.getByText('photos:2')).toBeInTheDocument();
    expect(state.photos).toMatchObject({ galleryId: 'g1' });
  });

  it('nova galerija nema foto sekciju ni status', () => {
    state.detail = { data: null, isLoading: false };
    renderAt();
    expect(screen.getByText('Nova galerija')).toBeInTheDocument();
    expect(screen.getByText('admin.galleryEditor.afterCreate')).toBeInTheDocument();
    expect(screen.queryByText(/^picker:/)).toBeNull();
  });

  it('galerija bez statusa i bez fotografija prikazuje praznu sekciju', () => {
    state.detail = { data: detail({ status: '', photos: [] }), isLoading: false };
    renderAt('g1');
    expect(screen.getByText('picker:-')).toBeInTheDocument();
    expect(screen.getByText('photos:0')).toBeInTheDocument();
  });
});

describe('GalleryEditorPage — spremanje', () => {
  it('bez naslova dugme je onemogućeno', () => {
    state.detail = { data: null, isLoading: false };
    renderAt();
    expect(screen.getByRole('button', { name: 'admin.galleryEditor.createAlbum' })).toBeDisabled();
  });

  it('izmjena šalje tačan sadržaj i ne mijenja rutu', async () => {
    const user = userEvent.setup();
    renderAt('g1');
    const title = screen.getByDisplayValue('Kup 2025');
    await user.clear(title);
    await user.type(title, 'Kup 2026');
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledWith({
      id: 'g1', title: 'Kup 2026', description: 'Finale',
    }));
    expect(screen.getByTestId('loc')).toHaveTextContent('/admin/gallery/g1/edit');
  });

  it('prazan opis se ne šalje', async () => {
    const user = userEvent.setup();
    renderAt('g1');
    await user.clear(screen.getByDisplayValue('Finale'));
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledWith({
      id: 'g1', title: 'Kup 2025', description: undefined,
    }));
  });

  it('kreiranje vodi na novu galeriju bez vraćanja nazad', async () => {
    const user = userEvent.setup();
    state.detail = { data: null, isLoading: false };
    renderAt();
    await user.type(screen.getByPlaceholderText('admin.galleryEditor.titleRequired'), 'Nova');
    await user.type(screen.getByPlaceholderText('admin.galleryEditor.descriptionOptional'), 'Opis');
    await user.click(screen.getByRole('button', { name: 'admin.galleryEditor.createAlbum' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith({
      title: 'Nova', description: 'Opis',
    }));
    expect(screen.getByTestId('loc')).toHaveTextContent('/admin/gallery/g-new/edit');
  });

  it('greška spremanja ostaje vidljiva u formi', async () => {
    const user = userEvent.setup();
    state.update = { ...state.update, mutateAsync: vi.fn(async () => { throw new Error('x'); }) };
    renderAt('g1');
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    await waitFor(() => expect(screen.getByText('Spremanje nije uspjelo.')).toBeInTheDocument());
    expect(screen.getByTestId('loc')).toHaveTextContent('/admin/gallery/g1/edit');
  });
});

describe('GalleryEditorPage — zaštita nacrta pri osvježavanju', () => {
  it('refetch ne briše otkucani naslov, a preuzima nedodirnuti opis', async () => {
    const user = userEvent.setup();
    const view = renderAt('g1');
    const title = screen.getByDisplayValue('Kup 2025');
    await user.clear(title);
    await user.type(title, 'Nacrt korisnika');
    state.detail = { data: detail({ title: 'Kup 2025', description: 'Novi opis sa servera' }), isLoading: false };
    view.rerender(<Harness id="g1" />);
    expect(screen.getByDisplayValue('Nacrt korisnika')).toBeInTheDocument();
  });

  it('nedodirnuti naslov se osvježava sa servera', () => {
    const view = renderAt('g1');
    state.detail = { data: detail({ title: 'Novi naslov sa servera' }), isLoading: false };
    view.rerender(<Harness id="g1" />);
    expect(screen.getByDisplayValue('Novi naslov sa servera')).toBeInTheDocument();
  });
});

describe('GalleryEditorPage — promjena galerije', () => {
  it('nakon prelaska na drugu galeriju novo polje opet broji kao izmjena', async () => {
    const user = userEvent.setup();
    renderAt('g1');
    state.detail = { data: { ...detail(), id: 'g2', title: 'Kup 2027' }, isLoading: false };
    await user.click(screen.getByRole('button', { name: 'prebaci' }));
    expect(await screen.findByDisplayValue('Kup 2027')).toBeInTheDocument();
    const title = screen.getByDisplayValue('Kup 2027');
    await user.clear(title);
    await user.type(title, 'Novi naziv');
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledWith({
      id: 'g2', title: 'Novi naziv', description: 'Finale',
    }));
  });
});
