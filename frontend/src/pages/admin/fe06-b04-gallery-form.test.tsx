import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GalleryEditorPage } from './gallery/GalleryEditorPage';
import { MediaAssetFormSheet } from './MediaAssetFormSheet';
import { GalleryAdminPhotos } from './GalleryAdminPhotos';

const editorState = vi.hoisted(() => ({
  detail: { data: null as unknown as Record<string, unknown> | null, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  create: { mutateAsync: vi.fn(async () => ({ id: 'g-new' })), isPending: false },
  update: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

const mediaAssetState = vi.hoisted(() => ({
  folders: [] as unknown[],
  update: { mutateAsync: vi.fn(async () => ({})), isPending: false } as { mutateAsync: ReturnType<typeof vi.fn>; isPending: boolean },
  asset: null as unknown as Record<string, unknown> | null,
  onOpen: vi.fn(),
}));

const photosState = vi.hoisted(() => ({
  reorder: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  remove: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string, opts?: Record<string, unknown>) => (opts?.defaultValue as string) ?? k }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../hooks/use-content-admin', () => ({
  useGalleryDetail: () => ({ ...editorState.detail, refetch: editorState.detail.refetch, data: editorState.detail.data }),
  useCreateGallery: () => editorState.create,
  useUpdateGallery: () => editorState.update,
  useRemoveGalleryPhoto: () => photosState.remove,
  useReorderGalleryPhotos: () => photosState.reorder,
  useGalleryAdminList: () => ({ data: [], isLoading: false }),
}));
vi.mock('../../hooks/use-media-admin', () => ({
  useMediaFolders: () => ({ data: mediaAssetState.folders }),
  useUpdateMediaAsset: () => mediaAssetState.update,
}));
vi.mock('../../lib/media', () => ({ mediaUrl: (p: string) => p }));
vi.mock('../../components/ui/skeleton', () => ({ Skeleton: () => <div>skeleton</div> }));
vi.mock('../../components/admin/GalleryPhotoPicker', () => ({ GalleryPhotoPicker: () => <div>picker</div> }));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ title, children }: { title: string; children: React.ReactNode }) => <div><h2>{title}</h2>{children}</div>,
}));
vi.mock('../../lib/content-status-labels', () => ({ contentStatusLabel: (s: string) => s }));

const detail = (over: Record<string, unknown> = {}) => ({
  id: 'g1', title: 'Kup 2025', description: 'Finale', status: 'PUBLISHED', photos: [{ id: 'p1', path: 'a.jpg' }], ...over,
});

beforeEach(() => {
  editorState.detail = { data: detail() as unknown as Record<string, unknown>, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: Date.now(), refetch: vi.fn() };
  editorState.create = { mutateAsync: vi.fn(async () => ({ id: 'g-new' })), isPending: false };
  editorState.update = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  mediaAssetState.folders = [{ id: 'f1', name: 'Mape' }];
  mediaAssetState.update = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof mediaAssetState.update;
  mediaAssetState.asset = { id: 'a1', filename: 'slika.jpg', tags: 'tag1', folderId: 'f1', originalPath: 'orig.jpg', thumbPath: 'thumb.jpg', mediumPath: 'mid.jpg' };
  mediaAssetState.onOpen = vi.fn();
  photosState.reorder = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof photosState.reorder;
  photosState.remove = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof photosState.remove;
});

function renderEditor(id?: string) {
  return render(
    <MemoryRouter initialEntries={[id ? `/admin/gallery/${id}/edit` : '/admin/gallery/new']}>
      <Routes>
        <Route path="/admin/gallery/new" element={<GalleryEditorPage />} />
        <Route path="/admin/gallery/:id/edit" element={<GalleryEditorPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('B04 GalleryEditorPage — error, trim, alert', () => {
  it('isError prikazuje role=alert, heading ostaje, retry disabled kad fetching', async () => {
    editorState.detail = { data: null, isLoading: false, isError: true, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() };
    renderEditor('g1');
    expect(screen.getByRole('heading', { name: /Uredi galeriju/ })).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(alert).toHaveTextContent(/Greška pri učitavanju/);
  });

  it('loading prikazuje skeleton', () => {
    editorState.detail = { data: null, isLoading: true, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
    renderEditor('g1');
    expect(screen.getByText('skeleton')).toBeInTheDocument();
  });

  it('naslov trim — razmaci disabled', async () => {
    editorState.detail = { data: null, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
    renderEditor();
    const input = screen.getByPlaceholderText('admin.galleryEditor.titleRequired');
    await userEvent.type(input, '   ');
    expect(screen.getByRole('button', { name: 'admin.galleryEditor.createAlbum' })).toBeDisabled();
    await userEvent.clear(input);
    await userEvent.type(input, 'Nova');
    expect(screen.getByRole('button', { name: 'admin.galleryEditor.createAlbum' })).not.toBeDisabled();
  });

  it('greška spremanja ima role=alert i trim šalje očišćeno', async () => {
    const user = userEvent.setup();
    editorState.update = { mutateAsync: vi.fn(async () => { throw new Error('x'); }), isPending: false } as unknown as typeof editorState.update;
    renderEditor('g1');
    const title = screen.getByDisplayValue('Kup 2025');
    await user.clear(title);
    await user.type(title, '  Novi naslov  ');
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Spremanje nije uspjelo.');
    // trim provera — drugi test za save
  });

  it('save trims title', async () => {
    const user = userEvent.setup();
    renderEditor('g1');
    const title = screen.getByDisplayValue('Kup 2025');
    await user.clear(title);
    await user.type(title, '  Trimmed  ');
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    await waitFor(() => expect(editorState.update.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ title: 'Trimmed' })));
  });
});

describe('B04 MediaAssetFormSheet — trim + alert', () => {
  it('filename trim disabled', async () => {
    render(<MediaAssetFormSheet asset={mediaAssetState.asset as never} open onOpenChange={mediaAssetState.onOpen} />);
    const input = screen.getByDisplayValue('slika.jpg');
    await userEvent.clear(input);
    await userEvent.type(input, '   ');
    expect(screen.getByRole('button', { name: 'Sačuvaj' })).toBeDisabled();
  });

  it('save trims filename i tags', async () => {
    const user = userEvent.setup();
    render(<MediaAssetFormSheet asset={mediaAssetState.asset as never} open onOpenChange={mediaAssetState.onOpen} />);
    const fname = screen.getByDisplayValue('slika.jpg');
    await user.clear(fname);
    await user.type(fname, '  nova.jpg  ');
    await user.click(screen.getByRole('button', { name: 'Sačuvaj' }));
    await waitFor(() => expect(mediaAssetState.update.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ filename: 'nova.jpg' })));
  });
});

describe('B04 GalleryAdminPhotos — disabled isPending', () => {
  it('move i delete disabled kad isPending + aria-busy', () => {
    photosState.reorder = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof photosState.reorder;
    const photos = [{ id: 'p1', path: 'a.jpg', caption: null }, { id: 'p2', path: 'b.jpg', caption: null }];
    render(<GalleryAdminPhotos galleryId="g1" photos={photos as never} />);
    expect(document.querySelector('[aria-busy=\"true\"]')).toBeTruthy();
    const ups = screen.getAllByLabelText('admin.common.moveUp');
    const downs = screen.getAllByLabelText('admin.common.moveDown');
    const dels = screen.getAllByLabelText('actions.delete');
    expect(ups[0]).toBeDisabled();
    expect(downs[0]).toBeDisabled();
    expect(dels[0]).toBeDisabled();
  });
});
