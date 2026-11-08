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

/** Batch 34 — rubni podaci i prekidači (odvojeno zbog limita dužine). */
describe('MediaPage — rubni podaci i prekidači (batch 34)', () => {
  it('korisnik bez sesije koristi prazan id u redu za upload', () => {
    state.user = undefined;
    render(<MediaPage />);
    expect(state.toolbarProps).toMatchObject({ canUpload: false, uploadDisabled: true });
    expect(screen.getByText(/^tree:2/)).toBeInTheDocument();
  });

  it('odgovor bez liste medija daje praznu selekciju', () => {
    state.assets = undefined;
    render(<MediaPage />);
    expect(screen.getByText(/toolbar::0:false/)).toBeInTheDocument();
  });

  it('odbijena potvrda ne briše mapu', async () => {
    const user = userEvent.setup();
    state.confirm = vi.fn(async () => false);
    render(<MediaPage />);
    await user.click(screen.getByRole('button', { name: 'obriši-mapu' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledTimes(1));
    expect(state.mutate.deleteFolder).not.toHaveBeenCalled();
  });

  it('potvrđeno brisanje mape briše izabranu mapu i čisti izbor', async () => {
    const user = userEvent.setup();
    render(<MediaPage />);
    await user.click(screen.getByRole('button', { name: 'izaberi-f1' }));
    expect(screen.getByText(/^tree:2:f1/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'obriši-mapu' }));
    await waitFor(() => expect(state.mutate.deleteFolder).toHaveBeenCalledWith('f1'));
    await waitFor(() => expect(screen.getByText(/^tree:2:-/)).toBeInTheDocument());
  });

  it('zamjena bez izabranog medija ne šalje zahtjev', async () => {
    const user = userEvent.setup();
    render(<MediaPage />);
    expect(screen.getByText('inputs:-')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'posalji-zamjenu' }));
    expect(state.mutate.replace).not.toHaveBeenCalled();
  });

  it('isključivanje selekcije gasi režim odabira', async () => {
    const user = userEvent.setup();
    render(<MediaPage />);
    await user.click(screen.getByRole('button', { name: 'selekcija' }));
    expect(screen.getByText(/toolbar::0:true/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'selekcija' }));
    expect(screen.getByText(/toolbar::0:false/)).toBeInTheDocument();
  });
});
