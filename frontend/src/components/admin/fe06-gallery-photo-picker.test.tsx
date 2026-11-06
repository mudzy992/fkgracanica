import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { GalleryPhotoPicker } from './GalleryPhotoPicker';

const state = vi.hoisted(() => ({
  batch: {
    state: { phase: 'ready', notice: null as string | null },
    add: vi.fn(async () => ({})),
    retryRefresh: vi.fn(async () => ({})),
  },
  folders: { data: [] as unknown },
  pickerConfirm: [] as ((paths: string[]) => void)[],
  pickerProps: [] as Record<string, unknown>[],
  folderPicks: [] as ((id: string) => void)[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-gallery-photo-batch', () => ({
  useGalleryPhotoBatch: () => state.batch,
}));
vi.mock('../../hooks/use-media-admin', () => ({
  useMediaFolders: () => state.folders,
}));
vi.mock('./MediaPickerDialog', () => ({
  MediaPickerDialog: (props: {
    open: boolean;
    onConfirm: (paths: string[]) => void;
    selectedPaths: string[];
  }) => {
    state.pickerProps.push(props as unknown as Record<string, unknown>);
    state.pickerConfirm.push(props.onConfirm);
    return props.open ? (
      <div data-testid="media-picker">
        <span>{`odabrano:${props.selectedPaths.length}`}</span>
        <button onClick={() => props.onConfirm(['a.jpg', 'b.jpg'])}>potvrdi-picker</button>
      </div>
    ) : null;
  },
}));
vi.mock('./MediaFolderPicker', () => ({
  MediaFolderPicker: ({ folders, onSelect }: { folders: unknown[]; onSelect: (id: string) => void }) => {
    state.folderPicks.push(onSelect);
    return (
      <div data-testid="folder-picker">
        <span>{`foldera:${folders.length}`}</span>
        <button onClick={() => onSelect('f1')}>odaberi-folder</button>
      </div>
    );
  },
}));

const batch = (phase: string, notice: string | null = null) => {
  state.batch = {
    state: { phase, notice },
    add: vi.fn(async () => ({})),
    retryRefresh: vi.fn(async () => ({})),
  };
};

describe('GalleryPhotoPicker', () => {
  beforeEach(() => {
    installDialogPolyfill();
    batch('ready');
    state.folders = { data: [] };
    state.pickerConfirm = [];
    state.pickerProps = [];
    state.folderPicks = [];
  });

  it('nudi odabir slika i dodavanje mape', () => {
    render(<GalleryPhotoPicker galleryId="g1" existingPaths={[]} />);
    expect(screen.getByRole('button', { name: /Odaberi slike/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Dodaj mapu/ })).toBeTruthy();
  });

  it('picker dobija postojeće putanje', () => {
    render(<GalleryPhotoPicker galleryId="g1" existingPaths={['a.jpg', 'b.jpg']} />);
    expect(state.pickerProps[0].selectedPaths).toEqual(['a.jpg', 'b.jpg']);
    expect(state.pickerProps[0].mode).toBe('multiple');
  });

  it('potvrda pickera dodaje odabrane putanje', async () => {
    render(<GalleryPhotoPicker galleryId="g1" existingPaths={[]} />);
    await userEvent.click(screen.getByRole('button', { name: /Odaberi slike/ }));
    await userEvent.click(screen.getByText('potvrdi-picker'));
    expect(state.batch.add).toHaveBeenCalledWith({ paths: ['a.jpg', 'b.jpg'] });
  });

  it('mapa se dodaje tek nakon odabira i potvrde', async () => {
    render(<GalleryPhotoPicker galleryId="g1" existingPaths={[]} />);
    await userEvent.click(screen.getByRole('button', { name: /Dodaj mapu/ }));
    const confirm = screen.getAllByRole('button', { name: 'Dodaj mapu' }).at(-1)!;
    expect((confirm as HTMLButtonElement).disabled).toBe(true);
    await userEvent.click(screen.getByText('odaberi-folder'));
    expect((confirm as HTMLButtonElement).disabled).toBe(false);
    await userEvent.click(confirm);
    expect(state.batch.add).toHaveBeenCalledWith({ folderId: 'f1' });
  });

  it('mape se prosljeđuju iz omotanih podataka', async () => {
    state.folders = { data: { data: [{ id: 'f1' }, { id: 'f2' }] } };
    render(<GalleryPhotoPicker galleryId="g1" existingPaths={[]} />);
    await userEvent.click(screen.getByRole('button', { name: /Dodaj mapu/ }));
    expect(screen.getByText('foldera:2')).toBeTruthy();
  });

  it('faza dodavanja prikazuje status i onemogućava dugmad', () => {
    batch('adding');
    render(<GalleryPhotoPicker galleryId="g1" existingPaths={[]} />);
    expect(screen.getByRole('status').textContent).toBe('admin.galleryBatch.checking');
    expect(
      (screen.getByRole('button', { name: /Odaberi slike/ }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('faza provjere također blokira dugmad', () => {
    batch('checking');
    render(<GalleryPhotoPicker galleryId="g1" existingPaths={[]} />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('faza blocked nudi ponovno učitavanje', async () => {
    batch('blocked', 'partial');
    render(<GalleryPhotoPicker galleryId="g1" existingPaths={[]} />);
    expect(screen.getByRole('alert').textContent).toBe('admin.galleryBatch.partial');
    await userEvent.click(screen.getByRole('button', { name: 'admin.galleryBatch.retry' }));
    expect(state.batch.retryRefresh).toHaveBeenCalledTimes(1);
  });

  it('obavijest o osvježavanju ima status ulogu', () => {
    batch('ready', 'refreshed');
    render(<GalleryPhotoPicker galleryId="g1" existingPaths={[]} />);
    expect(screen.getByRole('status').textContent).toBe('admin.galleryBatch.refreshed');
  });

  it('bez obavijesti nema poruke', () => {
    render(<GalleryPhotoPicker galleryId="g1" existingPaths={[]} />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('zatvaranje dijaloga mape ne dodaje ništa', async () => {
    render(<GalleryPhotoPicker galleryId="g1" existingPaths={[]} />);
    await userEvent.click(screen.getByRole('button', { name: /Dodaj mapu/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Odustani' }));
    expect(state.batch.add).not.toHaveBeenCalled();
  });
});
