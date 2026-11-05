import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  state.choose = vi.fn();
});

describe('MediaPage — brisanje, zamjena i dozvole', () => {
  it('brisanje medija ide kroz potvrdu', async () => {
    const user = userEvent.setup();
    render(<MediaPage />);
    await user.click(screen.getByRole('button', { name: 'obriši-medij' }));
    await waitFor(() => expect(state.mutate.deleteMedia).toHaveBeenCalledWith('a1'));
    expect(state.confirm).toHaveBeenCalledWith({
      title: 'Obrisati medij?', description: 'slika.jpg', variant: 'danger', confirmLabel: 'Obriši',
    });
  });

  it('odbijena potvrda ne briše medij', async () => {
    const user = userEvent.setup();
    state.confirm = vi.fn(async () => false);
    render(<MediaPage />);
    await user.click(screen.getByRole('button', { name: 'obriši-medij' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledTimes(1));
    expect(state.mutate.deleteMedia).not.toHaveBeenCalled();
  });

  it('masovno brisanje koristi potvrdu sa brojem', async () => {
    const user = userEvent.setup();
    render(<MediaPage />);
    await user.click(screen.getByRole('button', { name: 'obriši-odabrane' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledWith({
      title: 'Obrisati 2 medija?', description: 'Ova radnja se ne može poništiti.',
      variant: 'danger', confirmLabel: 'Obriši',
    }));
  });

  it('zamjena fajla postavlja replaceId i čisti ga nakon slanja', async () => {
    const user = userEvent.setup();
    render(<MediaPage />);
    await user.click(screen.getByRole('button', { name: 'zamijeni' }));
    expect(screen.getByText('inputs:a1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'posalji-zamjenu' }));
    await waitFor(() => expect(state.mutate.replace).toHaveBeenCalledWith({ id: 'a1', file: expect.any(File) }));
    await waitFor(() => expect(screen.getByText('inputs:-')).toBeInTheDocument());
  });

  it('uređivanje otvara asset sheet, a selekcija broji odabrane', async () => {
    const user = userEvent.setup();
    render(<MediaPage />);
    expect(screen.getByText('asset-sheet:false')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'uredi' }));
    expect(screen.getByText('asset-sheet:true')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'selekcija' }));
    await user.click(screen.getByRole('button', { name: 'označi' }));
    expect(screen.getByText(/toolbar::1:true/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'sve' }));
    expect(screen.getByText(/toolbar::1:true/)).toBeInTheDocument();
  });

  it('ograničene dozvole gase upload, uređivanje i brisanje', async () => {
    const user = userEvent.setup();
    state.user = { id: 'u2', permissions: ['media.read'] };
    render(<MediaPage />);
    expect(screen.getByText('dozvole:false')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'obriši-medij' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'uredi' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'zamijeni' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'obriši-odabrane' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'napravi-mapu' })).toBeNull();
    expect(state.toolbarProps).toMatchObject({ canUpload: false, uploadDisabled: true });
    await user.click(screen.getByRole('button', { name: 'upload' }));
    expect(state.choose).toHaveBeenCalled();
  });

  it('dozvola samo za upload pušta upload, ali ne i upravljanje', () => {
    state.user = { id: 'u3', permissions: ['media.upload'] };
    render(<MediaPage />);
    expect(state.toolbarProps).toMatchObject({ canUpload: true, canManage: false, uploadDisabled: true });
    expect(screen.queryByRole('button', { name: 'preimenuj' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'obriši-mapu' })).toBeNull();
  });
});
