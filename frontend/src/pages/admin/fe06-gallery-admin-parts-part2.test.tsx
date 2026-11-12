import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GalleryAdminPhotos } from './GalleryAdminPhotos';

vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, isLoading, isError, onRetry, actions, children }: {
    title: string; isLoading?: boolean; isError?: boolean;
    onRetry?: () => void; actions?: ReactNode; children: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <div data-testid="actions">{actions}</div>
      {isError && <button onClick={() => onRetry?.()}>pokušaj-ponovo</button>}
      {isLoading ? <p>učitavanje</p> : children}
    </div>
  ),
  AdminDataTable: ({ rows, columns }: {
    rows: Array<Record<string, unknown> & { id: string }>;
    columns: Array<{ key: string; render: (row: never) => ReactNode }>;
  }) => (
    <div>
      {rows.map((row) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {columns.map((column) => (
            <span key={column.key} data-col={column.key}>{column.render(row as never)}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const state = vi.hoisted(() => ({
  list: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  publish: { mutateAsync: vi.fn(async () => ({})) },
  remove: { mutateAsync: vi.fn(async () => ({})) },
  removePhoto: { mutateAsync: vi.fn(async () => ({})) },
  reorder: { mutateAsync: vi.fn(async () => ({})) },
  confirm: vi.fn(async () => true),
  permissions: [] as string[],
  seo: [] as (string | undefined)[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-content-admin', () => ({
  useGalleryAdminList: () => state.list,
  useUpdateGalleryStatus: () => state.publish,
  useDeleteGallery: () => state.remove,
  useRemoveGalleryPhoto: () => state.removePhoto,
  useReorderGalleryPhotos: () => state.reorder,
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));

describe('GalleryAdminPhotos', () => {
  const photos = [
    { id: 'p1', path: 'gallery/a.jpg', caption: 'Prva' },
    { id: 'p2', path: 'gallery/b.jpg', caption: null },
    { id: 'p3', path: 'gallery/c.jpg', caption: 'Treća' },
  ];

  beforeEach(() => {
    state.removePhoto = { mutateAsync: vi.fn(async () => ({})) };
    state.reorder = { mutateAsync: vi.fn(async () => ({})) };
  });

  it('bez fotografija prikazuje prazno stanje', () => {
    render(<GalleryAdminPhotos galleryId="g1" photos={[]} />);
    expect(screen.getByText('admin.galleryPhotos.empty')).toBeTruthy();
  });

  it('prikazuje slike sa alt tekstom i potpisom (fallback naziv fajla)', () => {
    const { container } = render(<GalleryAdminPhotos galleryId="g1" photos={photos as never} />);
    const images = Array.from(container.querySelectorAll('img'));
    expect(images).toHaveLength(3);
    expect(images[0].getAttribute('alt')).toBe('Prva');
    expect(images[1].getAttribute('alt')).toBe('');
    expect(screen.getByText('Prva')).toBeTruthy();
    expect(screen.getByText('b.jpg')).toBeTruthy();
  });

  it('prva fotografija ne može ići gore, zadnja ne može dolje', () => {
    render(<GalleryAdminPhotos galleryId="g1" photos={photos as never} />);
    const up = screen.getAllByRole('button', { name: 'admin.common.moveUp' });
    const down = screen.getAllByRole('button', { name: 'admin.common.moveDown' });
    expect(up[0]).toHaveProperty('disabled', true);
    expect(up[2]).toHaveProperty('disabled', false);
    expect(down[2]).toHaveProperty('disabled', true);
  });

  it('pomjeranje gore šalje novi redoslijed ID-eva', async () => {
    render(<GalleryAdminPhotos galleryId="g1" photos={photos as never} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'admin.common.moveUp' })[1]);
    expect(state.reorder.mutateAsync).toHaveBeenCalledWith({
      galleryId: 'g1',
      photoIds: ['p2', 'p1', 'p3'],
    });
  });

  it('pomjeranje dolje šalje novi redoslijed ID-eva', async () => {
    render(<GalleryAdminPhotos galleryId="g1" photos={photos as never} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'admin.common.moveDown' })[0]);
    expect(state.reorder.mutateAsync).toHaveBeenCalledWith({
      galleryId: 'g1',
      photoIds: ['p2', 'p1', 'p3'],
    });
  });

  it('brisanje fotografije šalje galleryId i photoId', async () => {
    render(<GalleryAdminPhotos galleryId="g1" photos={photos as never} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'actions.delete' })[1]);
    expect(state.removePhoto.mutateAsync).toHaveBeenCalledWith({ galleryId: 'g1', photoId: 'p2' });
  });
});
