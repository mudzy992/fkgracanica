import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaPage } from './MediaPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

const state = vi.hoisted(() => ({
  folders: { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  assets: { data: { data: [] as unknown[], meta: { total: 0 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  perms: ['media.manage'] as string[],
  confirm: vi.fn(async () => true),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) => {
      if (opts?.defaultValue) {
        let s = opts.defaultValue as string;
        if (opts.time) s = s.replace('{{time}}', opts.time as string);
        return s;
      }
      return k;
    },
  }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { id: 'u1', permissions: state.perms } }) }));
vi.mock('../../hooks/use-media-library-access', () => ({ useMediaLibraryAccess: () => ({ canUpload: true, canManage: true }) }));
vi.mock('../../hooks/use-media-selection', () => ({
  useMediaSelection: () => ({ selectionMode: false, selectedCount: 0, selectedIds: new Set(), isSelected: () => false, toggle: vi.fn(), clear: vi.fn(), enterSelectionMode: vi.fn(), exitSelectionMode: vi.fn(), selectAll: vi.fn() }),
}));
vi.mock('../../hooks/use-media-upload-queue', () => ({
  useMediaUploadQueue: () => ({ enqueue: vi.fn(), retryRefresh: vi.fn(), clearReport: vi.fn(), state: { phase: 'idle' } }),
}));
vi.mock('../../hooks/use-media-file-chooser', () => ({ useMediaFileChooser: () => ({ choose: vi.fn(), onUpload: vi.fn() }) }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../hooks/use-media-admin', () => ({
  useMediaFolders: () => ({ data: state.folders.data, isLoading: state.folders.isLoading, isError: state.folders.isError, isFetching: state.folders.isFetching, dataUpdatedAt: state.folders.dataUpdatedAt, refetch: state.folders.refetch }),
  useMediaAssets: () => ({ data: state.assets.data, isLoading: state.assets.isLoading, isError: state.assets.isError, isFetching: state.assets.isFetching, dataUpdatedAt: state.assets.dataUpdatedAt, refetch: state.assets.refetch }),
  useCreateMediaFolder: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateMediaFolder: () => ({ mutateAsync: vi.fn() }),
  useDeleteMediaFolder: () => ({ mutateAsync: vi.fn() }),
  useReplaceMedia: () => ({ mutateAsync: vi.fn() }),
  useDeleteMedia: () => ({ mutateAsync: vi.fn() }),
  useUpdateMediaAsset: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: d.AdminPageShellDouble, AdminDataTable: d.AdminDataTableDouble };
});
vi.mock('../../components/admin/MediaFolderTree', () => ({ MediaFolderTree: () => <div>tree</div> }));
vi.mock('./media/MediaPageToolbar', () => ({ MediaPageToolbar: () => <div>toolbar</div> }));
vi.mock('./media/MediaFolderSheet', () => ({ MediaFolderSheet: () => null }));
vi.mock('./media/MediaUploadZone', () => ({ MediaUploadZone: () => null }));
vi.mock('./MediaAssetFormSheet', () => ({ MediaAssetFormSheet: () => null }));
vi.mock('./media/MediaPageFileInputs', () => ({ MediaPageFileInputs: () => null }));
vi.mock('./media/MediaPageAssetsSection', () => ({
  MediaPageAssetsSection: ({ isFetching }: { isFetching?: boolean }) => <div aria-busy={isFetching || undefined}>assets-section:{String(!!isFetching)}</div>,
}));
vi.mock('./media/media-page-helpers', () => ({ emptyMediaMessage: () => 'Nema medija', copyMediaOriginalUrl: vi.fn() }));
vi.mock('../../lib/as-array', () => ({ asArray: (x: unknown) => (Array.isArray(x) ? x : []) }));

beforeEach(() => {
  state.folders = { data: [{ id: 'f1', name: 'Prva' }] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
  state.assets = { data: { data: [{ id: 'a1', filename: 'slika.jpg', originalPath: 'x/slika.jpg' }] as unknown[], meta: { total: 1 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
  state.perms = ['media.manage'];
  adminShellState.retried = 0;
  adminShellState.refreshed = 0;
});

describe('B04 MediaPage — P1/P2', () => {
  it('error OR — role=alert, heading ostaje, retry zove oba refetch', async () => {
    state.folders = { data: [] as unknown[], isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
    state.assets = { data: { data: [] as unknown[], meta: { total: 0 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
    render(<MediaPage />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'admin.media' })).toBeInTheDocument();
    const btn = within(alert).getByRole('button', { name: 'pokušaj-ponovo' });
    await userEvent.click(btn);
    expect(state.folders.refetch).toHaveBeenCalled();
    expect(state.assets.refetch).toHaveBeenCalled();
  });

  it('error retry disabled kad isFetching', () => {
    state.folders = { data: [] as unknown[], isLoading: false, isError: true, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() };
    render(<MediaPage />);
    const btn = within(screen.getByRole('alert')).getByRole('button', { name: 'pokušaj-ponovo' });
    expect(btn).toBeDisabled();
  });

  it('loading — aria-busy', () => {
    state.folders = { data: [] as unknown[], isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() };
    state.assets = { data: { data: [] as unknown[], meta: { total: 0 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
    render(<MediaPage />);
    expect(document.querySelector('[aria-busy=\"true\"]')).toBeTruthy();
  });

  it('lastUpdated max i Osvježi zove oba', async () => {
    const now = Date.now();
    const later = now + 5000;
    state.folders = { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: now, refetch: vi.fn() };
    state.assets = { data: { data: [] as unknown[], meta: { total: 0 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: later, refetch: vi.fn() };
    render(<MediaPage />);
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    await userEvent.click(btn);
    expect(state.folders.refetch).toHaveBeenCalled();
    expect(state.assets.refetch).toHaveBeenCalled();
  });

  it('assets isFetching proslijeđen sekciji aria-busy', () => {
    state.assets = { data: { data: [] as unknown[], meta: { total: 0 } }, isLoading: false, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() };
    render(<MediaPage />);
    expect(screen.getByText('assets-section:true')).toBeInTheDocument();
    expect(document.querySelector('[aria-busy=\"true\"]')).toBeTruthy();
  });

  it('assets bez fetching nema aria-busy u sekciji', () => {
    state.assets = { data: { data: [] as unknown[], meta: { total: 0 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
    render(<MediaPage />);
    expect(screen.getByText('assets-section:false')).toBeInTheDocument();
  });
});
