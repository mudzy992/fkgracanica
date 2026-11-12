import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
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
  id: 'g1', title: 'Kup 2025', description: 'Finale', status: 'PUBLISHED',
  photos: [{ id: 'p1', path: 'a.jpg' }], ...over,
});
beforeEach(() => {
  state.detail = { data: detail(), isLoading: false };
  state.create = { mutateAsync: vi.fn(async () => ({ id: 'g-new' })), isPending: false };
  state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.picker = {}; state.photos = {};
});

describe('GalleryEditorPage — branch47 (2 grane ?? fallback)', () => {
  it('description ?? fallback kada je description undefined koristi prazan string', () => {
    state.detail = { data: detail({ description: undefined }), isLoading: false };
    render(<Harness id="g1" />);
    // input should be empty or fallback?
    expect(screen.getByDisplayValue('Kup 2025')).toBeInTheDocument();
    // description input should be empty (fallback '')
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
  });

  it('description definisan koristi vrijednost', () => {
    render(<Harness id="g1" />);
    expect(screen.getByDisplayValue('Finale')).toBeInTheDocument();
  });

  it('photos ?? [] fallback kada je photos undefined daje praznu listu', () => {
    state.detail = { data: detail({ photos: undefined }), isLoading: false };
    render(<Harness id="g1" />);
    expect(screen.getByText('picker:-')).toBeInTheDocument();
    expect(screen.getByText('photos:0')).toBeInTheDocument();
  });

  it('photos definisano prikazuje listu', () => {
    render(<Harness id="g1" />);
    expect(screen.getByText('picker:a.jpg')).toBeInTheDocument();
    expect(screen.getByText('photos:1')).toBeInTheDocument();
  });
});
