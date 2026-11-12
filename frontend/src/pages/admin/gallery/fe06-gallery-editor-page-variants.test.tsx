import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GalleryEditorPage } from './GalleryEditorPage';
import { useState } from 'react';

const state = vi.hoisted(() => ({
  create: { mutateAsync: vi.fn(async () => ({ id: 'g-new' })), isPending: false },
  update: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../../hooks/use-content-admin', () => ({
  useCreateGallery: () => state.create,
  useUpdateGallery: () => state.update,
  useGalleryDetail: () => (globalThis as unknown as { __galleryDetail?: unknown }).__galleryDetail as unknown,
}));
vi.mock('../../../components/ui/skeleton', () => ({ Skeleton: () => <div>skeleton</div> }));
vi.mock('../../../components/admin/GalleryPhotoPicker', () => ({
  GalleryPhotoPicker: () => <div>picker</div>,
}));
vi.mock('../GalleryAdminPhotos', () => ({
  GalleryAdminPhotos: () => <div>photos</div>,
}));

const detail = (over: Record<string, unknown> = {}) => ({
  id: 'g1',
  title: 'Kup 2025',
  description: 'Finale',
  status: 'PUBLISHED',
  photos: [{ id: 'p1', path: 'a.jpg' }],
  ...over,
});

function Wrapper({ initialId = 'g1', initialDetail = detail() }: { initialId?: string; initialDetail?: unknown }) {
  const [current, setCurrent] = useState({ data: initialDetail, isLoading: false });
  (globalThis as unknown as Record<string, unknown>).__setGalleryDetail = setCurrent;
  (globalThis as unknown as Record<string, unknown>).__galleryDetail = current;
  return (
    <MemoryRouter initialEntries={[`/admin/gallery/${initialId}/edit`]}>
      <Routes>
        <Route path="/admin/gallery/:id/edit" element={<GalleryEditorPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  state.create = { mutateAsync: vi.fn(async () => ({ id: 'g-new' })), isPending: false };
  state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  (globalThis as unknown as Record<string, unknown>).__galleryDetail = { data: detail(), isLoading: false };
});

describe('GalleryEditorPage — varijante zaštite nacrta (3 grane)', () => {
  it('refetch istog id bez izmjene ažurira naslov sa servera', async () => {
    render(<Wrapper />);
    expect(screen.getByDisplayValue('Kup 2025')).toBeInTheDocument();
    const set = (globalThis as unknown as Record<string, unknown>).__setGalleryDetail as (v: unknown) => void;
    await act(async () => {
      set({ data: detail({ title: 'Kup 2026' }), isLoading: false });
    });
    expect(screen.getByDisplayValue('Kup 2026')).toBeInTheDocument();
  });

  it('refetch istog id sa izmijenjenim naslovom čuva nacrt', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const title = screen.getByDisplayValue('Kup 2025');
    await user.clear(title);
    await user.type(title, 'Moj nacrt');
    expect(screen.getByDisplayValue('Moj nacrt')).toBeInTheDocument();
    const set = (globalThis as unknown as Record<string, unknown>).__setGalleryDetail as (v: unknown) => void;
    await act(async () => {
      set({ data: detail({ title: 'Server novi' }), isLoading: false });
    });
    expect(screen.getByDisplayValue('Moj nacrt')).toBeInTheDocument();
  });

  it('refetch istog id bez izmjene opisa ažurira opis', async () => {
    render(<Wrapper />);
    expect(screen.getByDisplayValue('Finale')).toBeInTheDocument();
    const set = (globalThis as unknown as Record<string, unknown>).__setGalleryDetail as (v: unknown) => void;
    await act(async () => {
      set({ data: detail({ description: 'Novi opis' }), isLoading: false });
    });
    expect(screen.getByDisplayValue('Novi opis')).toBeInTheDocument();
  });

  it('refetch istog id sa izmijenjenim opisom čuva nacrt opisa', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const desc = screen.getByDisplayValue('Finale');
    await user.clear(desc);
    await user.type(desc, 'Moj opis nacrt');
    const set = (globalThis as unknown as Record<string, unknown>).__setGalleryDetail as (v: unknown) => void;
    await act(async () => {
      set({ data: detail({ description: 'Server opis novi' }), isLoading: false });
    });
    expect(screen.getByDisplayValue('Moj opis nacrt')).toBeInTheDocument();
  });

  it('promjena id bez touch koristi novi naslov sa servera', async () => {
    render(<Wrapper initialId="g1" initialDetail={detail({ id: 'g1', title: 'Kup 2025' })} />);
    expect(screen.getByDisplayValue('Kup 2025')).toBeInTheDocument();
    const set = (globalThis as unknown as Record<string, unknown>).__setGalleryDetail as (v: unknown) => void;
    await act(async () => {
      set({ data: detail({ id: 'g2', title: 'Druga' }), isLoading: false });
    });
    expect(screen.getByDisplayValue('Druga')).toBeInTheDocument();
  });
});
