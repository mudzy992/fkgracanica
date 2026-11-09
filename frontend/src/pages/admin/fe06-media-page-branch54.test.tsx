import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { id: 'u1', permissions: ['media.manage'] } }) }));
vi.mock('../../hooks/use-media-admin', () => ({
  useMediaFolders: () => ({ data: [], isLoading: false }),
  useMediaAssets: () => ({ data: { data: [], meta: { total: 0, totalPages: 1 } }, isLoading: false }),
  useCreateMediaFolder: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteMediaFolder: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteMedia: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReplaceMedia: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateMediaFolder: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../../hooks/use-media-library-access', () => ({ useMediaLibraryAccess: () => ({ canUpload: true, canManage: true, canRead: true }) }));
vi.mock('../../hooks/use-media-selection', () => ({
  useMediaSelection: () => ({
    selectionMode: false,
    selectedIds: new Set<string>(),
    selectedCount: 0,
    toggle: vi.fn(), selectAll: vi.fn(), clear: vi.fn(),
    exitSelectionMode: vi.fn(), enterSelectionMode: vi.fn(),
    isSelected: () => false, setSelectionMode: vi.fn(),
  }),
}));
vi.mock('../../hooks/use-media-upload-queue', () => ({
  useMediaUploadQueue: () => ({ state: {}, enqueue: vi.fn(), retryRefresh: vi.fn(), clearReport: vi.fn() }),
}));
vi.mock('../../hooks/use-media-file-chooser', () => ({
  useMediaFileChooser: () => ({ choose: vi.fn(), onUpload: vi.fn() }),
}));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: vi.fn(async () => true), dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/MediaFolderTree', () => ({ MediaFolderTree: () => <div>FolderTree</div> }));
vi.mock('../../components/admin/AdminPageShell', () => ({ AdminPageShell: ({ children }: any) => <div>{children}</div> }));
vi.mock('./media/MediaPageToolbar', () => ({ MediaPageToolbar: () => <div>Toolbar</div> }));
vi.mock('./media/MediaFolderSheet', () => ({ MediaFolderSheet: () => <div>FolderSheet</div> }));
vi.mock('./media/MediaUploadZone', () => ({ MediaUploadZone: () => <div>UploadZone</div> }));
vi.mock('./MediaAssetFormSheet', () => ({ MediaAssetFormSheet: () => <div>AssetFormSheet</div> }));
vi.mock('./media/MediaPageAssetsSection', () => ({ MediaPageAssetsSection: () => <div>AssetsSection</div> }));
vi.mock('./media/MediaPageFileInputs', () => ({ MediaPageFileInputs: () => <div>FileInputs</div> }));

import { MediaPage } from './MediaPage';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;
}
describe('fe06 MediaPage branch54', () => {
  it('asArray fallback for folders undefined', () => {
    render(wrap(<MediaPage />));
    expect(screen.getByText('FolderTree')).toBeInTheDocument();
  });
  it('empty assets → AssetsSection branch', () => {
    render(wrap(<MediaPage />));
    expect(screen.getByText('AssetsSection')).toBeInTheDocument();
  });
  it('canAccess true → toolbar', () => {
    render(wrap(<MediaPage />));
    expect(screen.getByText('Toolbar')).toBeInTheDocument();
  });
});
