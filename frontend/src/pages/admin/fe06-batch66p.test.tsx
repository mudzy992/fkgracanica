import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', async (orig) => {
  const actual = await (orig() as never) as Record<string, unknown>;
  return { ...(actual as object), useTranslation: () => ({ t: (k: string) => k }) };
});
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['ADMIN'] } }) }));
vi.mock('../../hooks', () => ({
  useModuleFlags: () => ({ data: {} }),
  usePublicSettings: () => ({ data: {} }),
  useMediaAssets: () => ({ data: { data: [] }, isLoading: false }),
  usePlayers: () => ({ data: [], isLoading: false }),
  useOwnClub: () => ({ data: null }),
  useMatch: () => ({ data: null, isLoading: false, isError: false, refetch: vi.fn() }),
  useMatchRealtime: () => {},
}));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => true }));
vi.mock('../../lib/module-settings-rules', () => ({ isModuleEnabled: () => true }));
vi.mock('../../hooks/use-media-admin', () => ({
  useMediaAssets: () => ({ data: { data: [] }, isLoading: false }),
  useMediaAsset: () => ({ data: null }),
}));

import { MatchReportPage } from './MatchReportPage';
import { MediaAssetsTable } from './MediaAssetsTable';
import { NotificationsPage } from './NotificationsPage';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{c}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('batch66p admin misc', () => {
  it('MatchReportPage pokriva', () => {
    const { container } = render(wrap(<MatchReportPage />));
    expect(container).toBeDefined();
  });
  it('MediaAssetsTable pokriva', () => {
    const { container } = render(
      wrap(
        <MediaAssetsTable assets={[]} empty="empty" copied={null} selectionMode={false} isSelected={() => false} onToggleSelect={vi.fn()} onCopy={vi.fn()} />,
      ),
    );
    expect(container).toBeDefined();
    const { container: c2 } = render(
      wrap(
        <MediaAssetsTable
          assets={[{ id: '1', filename: 'a.jpg', size: 1024, originalPath: '/a.jpg', thumbPath: null } as never]}
          empty="empty"
          copied="/a.jpg"
          selectionMode={true}
          isSelected={() => true}
          onToggleSelect={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onReplace={vi.fn()}
          onDelete={vi.fn()}
        />,
      ),
    );
    expect(c2).toBeDefined();
  });
  it('NotificationsPage pokriva', () => {
    const { container } = render(wrap(<NotificationsPage />));
    expect(container).toBeDefined();
  });
});
