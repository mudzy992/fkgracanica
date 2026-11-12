import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaPage } from '../MediaPage';
import { mediaPageState as state } from '../../../test/doubles/media-page-doubles';


vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: state.user }) }));
vi.mock('../../../hooks/use-media-admin', () => ({
  useMediaFolders: () => ({ data: state.folders, isLoading: false }),
  useMediaAssets: (args: Record<string, unknown>) => {
    state.assetsArgs = args;
    return { data: state.assets, isLoading: false };
  },
  useCreateMediaFolder: () => ({ mutateAsync: state.mutate.createFolder, isPending: false }),
  useUpdateMediaFolder: () => ({ mutateAsync: state.mutate.updateFolder }),
  useDeleteMediaFolder: () => ({ mutateAsync: state.mutate.deleteFolder }),
  useReplaceMedia: () => ({ mutateAsync: state.mutate.replace }),
  useDeleteMedia: () => ({ mutateAsync: state.mutate.deleteMedia }),
}));
vi.mock('../../../hooks/use-media-upload-queue', () => ({
  useMediaUploadQueue: () => ({
    enqueue: state.enqueue, retryRefresh: state.retryRefresh, clearReport: state.clearReport,
    state: { phase: 'idle' },
  }),
}));
vi.mock('../../../hooks/use-media-file-chooser', () => ({
  useMediaFileChooser: () => ({ choose: state.choose, onUpload: state.onUpload }),
}));
vi.mock('../../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../../components/admin/AdminPageShell', async () => ({
  AdminPageShell: (await import('../../../test/doubles/media-page-doubles')).AdminPageShellDouble,
}));
vi.mock('../../../components/admin/MediaFolderTree', async () => ({
  MediaFolderTree: (await import('../../../test/doubles/media-page-doubles')).MediaFolderTreeDouble,
}));
vi.mock('./MediaPageToolbar', async () => ({ MediaPageToolbar: (await import('../../../test/doubles/media-page-doubles')).MediaPageToolbarDouble }));
vi.mock('./MediaUploadZone', async () => ({ MediaUploadZone: (await import('../../../test/doubles/media-page-doubles')).MediaUploadZoneDouble }));
vi.mock('./MediaPageAssetsSection', async () => ({
  MediaPageAssetsSection: (await import('../../../test/doubles/media-page-doubles')).MediaPageAssetsSectionDouble,
}));
vi.mock('./MediaPageFileInputs', async () => ({
  MediaPageFileInputs: (await import('../../../test/doubles/media-page-doubles')).MediaPageFileInputsDouble,
}));
vi.mock('./MediaFolderSheet', async () => ({ MediaFolderSheet: (await import('../../../test/doubles/media-page-doubles')).MediaFolderSheetDouble }));
vi.mock('../MediaAssetFormSheet', async () => ({
  MediaAssetFormSheet: (await import('../../../test/doubles/media-page-doubles')).MediaAssetFormSheetDouble,
}));

beforeEach(() => {
  state.user = { id: 'u1', permissions: ['media.manage'] };
  state.folders = [{ id: 'f1', name: 'Prva' }, { id: 'f2', name: 'Druga' }];
  state.assets = { data: [{ id: 'a1', filename: 'slika.jpg', originalPath: 'x/slika.jpg' }], meta: { total: 5 } };
  state.confirm = vi.fn(async () => true);
  state.mutate = {
    createFolder: vi.fn(async () => ({})),
    updateFolder: vi.fn(async () => ({})),
    deleteFolder: vi.fn(async () => ({})),
    deleteMedia: vi.fn(async () => ({})),
    replace: vi.fn(async () => ({})),
  };
  state.enqueue = vi.fn();
  state.choose = vi.fn();
  state.onUpload = vi.fn();
});

describe('MediaPage — mapa, pretraga i upload', () => {
  it('bez mape upload je onemogućen, a odabir mape mijenja stanje', async () => {
    const user = userEvent.setup();
    render(<MediaPage />);
    expect(screen.getByText(/toolbar::0:false:true:Prvo odaberite mapu:5/)).toBeInTheDocument();
    expect(screen.getByText('assets:1:1:Nema medija u ovoj mapi.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'izaberi-f1' }));
    expect(screen.getByText(/toolbar::0:false:false:-:5/)).toBeInTheDocument();
    expect(screen.getByText('tree:2:f1')).toBeInTheDocument();
    expect(screen.getByText('zone:f1')).toBeInTheDocument();
    expect(state.sheetProps).toMatchObject({ open: false, selectedId: 'f1' });
  });

  it('pretraga se debounce-uje i prebacuje na globalni upit', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<MediaPage />);
    await user.type(screen.getByLabelText('pretraga'), 'dres');
    expect(state.assetsArgs).toMatchObject({ search: undefined, page: 1 });
    await act(async () => { vi.advanceTimersByTime(400); });
    expect(state.assetsArgs).toMatchObject({ search: 'dres', folderId: undefined, page: 1 });
    expect(screen.getByText(/Nema rezultata za „dres"\./)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('kreiranje mape prazni polje, a brisanje selektovane mape resetuje izbor', async () => {
    const user = userEvent.setup();
    render(<MediaPage />);
    await user.click(screen.getByRole('button', { name: 'izaberi-f1' }));
    await user.click(screen.getByRole('button', { name: 'napravi-mapu' }));
    await waitFor(() => expect(state.mutate.createFolder).toHaveBeenCalledWith({ name: '', parentId: 'f1' }));
    await user.click(screen.getByRole('button', { name: 'obriši-mapu' }));
    await waitFor(() => expect(state.mutate.deleteFolder).toHaveBeenCalledWith('f1'));
    await waitFor(() => expect(state.treeProps).toMatchObject({ selectedId: undefined }));
  });

  it('preimenovanje mape šalje novo ime', async () => {
    const user = userEvent.setup();
    render(<MediaPage />);
    await user.click(screen.getByRole('button', { name: 'preimenuj' }));
    await waitFor(() => expect(state.mutate.updateFolder).toHaveBeenCalledWith({ id: 'f1', name: 'Novo ime' }));
  });

  it('kad mapa nije aktivna brisanje mape ne resetuje izbor', async () => {
    const user = userEvent.setup();
    render(<MediaPage />);
    await user.click(screen.getByRole('button', { name: 'obriši-mapu' }));
    await waitFor(() => expect(state.mutate.deleteFolder).toHaveBeenCalledWith('f1'));
    expect(screen.getByText('tree:2:-')).toBeInTheDocument();
  });

  it('mapa-chip otvara sheet, a stranica se mijenja preko assets sekcije', async () => {
    const user = userEvent.setup();
    render(<MediaPage />);
    await user.click(screen.getByRole('button', { name: 'mapa-chip' }));
    expect(screen.getByText('folder-sheet:true')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'strana-2' }));
    expect(screen.getByText(/assets:1:2/)).toBeInTheDocument();
  });
});
