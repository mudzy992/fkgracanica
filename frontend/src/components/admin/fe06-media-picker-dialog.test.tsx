import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaPickerDialog } from './MediaPickerDialog';
import { installDialogPolyfill } from '../../test/dialog-polyfill';

const state = vi.hoisted(() => ({
  assets: { data: { data: [] as unknown[] }, isLoading: false },
  folders: { data: [] as unknown[] },
  queries: [] as Record<string, unknown>[],
  confirmed: [] as string[][],
  openChanges: [] as boolean[],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: { count?: number }) => (o?.count !== undefined ? `${k}:${o.count}` : k),
  }),
}));
vi.mock('../../hooks/use-media-admin', () => ({
  useMediaFolders: () => state.folders,
  useMediaAssets: (params: Record<string, unknown>) => {
    state.queries.push(params);
    return state.assets;
  },
}));
vi.mock('../ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogHeader: ({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) => (
    <header>
      {children}
      <button onClick={onClose}>zatvori-header</button>
    </header>
  ),
  DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
}));
vi.mock('../ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

const asset = (i: number) => ({
  id: `a${i}`,
  filename: `slika-${i}.jpg`,
  originalPath: `media/slika-${i}.jpg`,
  thumbPath: `media/thumb-${i}.jpg`,
  mimeType: 'image/jpeg',
  size: 1000,
});

const folders = [
  { id: 'f1', name: 'Utakmice', parentId: null, _count: { assets: 2 } },
  { id: 'f2', name: 'Ekipa', parentId: null, _count: { assets: 0 } },
];

/**
 * Q-FE06-36 (popravljeno): default je nekad bio `[]` — nova referenca svakog
 * rendera → efekt → setPicked → render → beskonačna petlja. Sada je modulska
 * konstanta, pa izostavljanje propa više ne visi (vidi test „bez selectedPaths“).
 */
const NO_PATHS: string[] = [];

const renderDialog = (over: Partial<React.ComponentProps<typeof MediaPickerDialog>> = {}) =>
  render(
    <MediaPickerDialog
      open
      selectedPaths={NO_PATHS}
      onOpenChange={(open) => state.openChanges.push(open)}
      onConfirm={(paths) => state.confirmed.push(paths)}
      {...over}
    />,
  );

describe('MediaPickerDialog', () => {
  beforeAll(() => installDialogPolyfill());

  beforeEach(() => {
    state.assets = { data: { data: [asset(1), asset(2)] }, isLoading: false };
    state.folders = { data: folders };
    state.queries = [];
    state.confirmed = [];
    state.openChanges = [];
  });

  it('zatvoren dijalog ne renderuje sadržaj i ne upituje listu', () => {
    renderDialog({ open: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('prikazuje naslov, pretragu i slike', () => {
    renderDialog({ title: 'Odabir naslovne' });
    expect(screen.getByText('Odabir naslovne')).toBeTruthy();
    expect(screen.getByPlaceholderText('admin.mediaPicker.searchPlaceholder')).toBeTruthy();
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByAltText('slika-1.jpg')).toBeTruthy();
  });

  it('single režim potvrđuje odmah na klik i zatvara dijalog', async () => {
    renderDialog();
    await userEvent.click(screen.getByAltText('slika-2.jpg').closest('button')!);
    expect(state.confirmed).toEqual([['media/slika-2.jpg']]);
    expect(state.openChanges).toEqual([false]);
    expect(screen.queryByText(/Odabrano:/)).toBeNull();
  });

  it('multiple režim broji odabrane i potvrđuje tek na dugme', async () => {
    renderDialog({ mode: 'multiple', selectedPaths: ['media/slika-1.jpg'] });
    expect(screen.getByText('Odabrano: 1')).toBeTruthy();
    await userEvent.click(screen.getByAltText('slika-1.jpg').closest('button')!);
    expect(screen.getByText('Odabrano: 0')).toBeTruthy();
    await userEvent.click(screen.getByAltText('slika-2.jpg').closest('button')!);
    expect(screen.getByText('Odabrano: 1')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj odabrane' }));
    expect(state.confirmed).toEqual([['media/slika-2.jpg']]);
    expect(state.openChanges).toEqual([false]);
  });

  it('„Odaberi vidljive“ dodaje sve i gasi se kad nema slika', async () => {
    renderDialog({ mode: 'multiple' });
    await userEvent.click(screen.getByRole('button', { name: 'Odaberi vidljive' }));
    expect(screen.getByText('Odabrano: 2')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj odabrane' }));
    expect(state.confirmed[0].sort()).toEqual(['media/slika-1.jpg', 'media/slika-2.jpg']);

    state.confirmed = [];
    state.assets = { data: { data: [] }, isLoading: false };
    renderDialog({ mode: 'multiple' });
    expect(screen.getAllByRole('button', { name: 'Odaberi vidljive' })[1]).toHaveProperty('disabled', true);
  });

  it('prazna lista prikazuje prazno stanje', () => {
    state.assets = { data: { data: [] }, isLoading: false };
    renderDialog();
    expect(screen.getByText('admin.mediaPicker.empty')).toBeTruthy();
  });

  it('učitavanje prikazuje poruku umjesto mreže', () => {
    state.assets = { data: { data: [] }, isLoading: true };
    renderDialog();
    expect(screen.getByText('admin.common.loading')).toBeTruthy();
    expect(screen.queryByText('admin.mediaPicker.empty')).toBeNull();
  });

  it('odabir foldera mijenja parametre upita', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: /Utakmice/ }));
    expect(state.queries[state.queries.length - 1]).toMatchObject({ folderId: 'f1', page: 1, limit: 60 });
    expect(screen.getByText('admin.mediaPicker.folderView')).toBeTruthy();
  });

  it('pretraga se debounce-uje i gasi filter foldera', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: /Utakmice/ }));
    await userEvent.type(screen.getByPlaceholderText('admin.mediaPicker.searchPlaceholder'), 'derbi');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });
    await waitFor(() =>
      expect(state.queries[state.queries.length - 1]).toMatchObject({ search: 'derbi', folderId: undefined }),
    );
    expect(screen.getByText('admin.mediaPicker.searchResults:2')).toBeTruthy();
  });

  it('naslov zaglavlja zatvara dijalog', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'zatvori-header' }));
    expect(state.openChanges).toEqual([false]);
  });
});
