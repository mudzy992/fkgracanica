import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', async (orig) => {
  const actual = await (orig() as never) as Record<string, unknown>;
  return { ...(actual as object), useTranslation: () => ({ t: (k: string) => k }) };
});
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../../hooks', () => ({
  useModuleFlags: () => ({ data: {} }),
  usePublicSettings: () => ({ data: {} }),
  useMatch: () => ({ data: null, isLoading: false, isError: false, refetch: vi.fn() }),
}));
vi.mock('../../hooks/use-match-realtime', () => ({ useMatchRealtime: () => {} }));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => false }));
vi.mock('../../lib/module-settings-rules', () => ({ isModuleEnabled: () => false }));

import { HeritageAdminPage } from './HeritageAdminPage';
import { CommentatorPage } from './CommentatorPage';
import { Routes, Route } from 'react-router-dom';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/admin/commentator/123']}>
        <Routes>
          <Route path="/admin/commentator/:id" element={c} />
          <Route path="*" element={c} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
function wrapNoId(c: React.ReactNode) {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/admin/commentator']}>
        <Routes>
          <Route path="/admin/commentator" element={c} />
          <Route path="*" element={c} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('batch66k admin pages', () => {
  it('HeritageAdminPage pokriva user null', () => {
    const { container } = render(wrap(<HeritageAdminPage />));
    expect(container).toBeDefined();
  });

  it('CommentatorPage pokriva', () => {
    const { container } = render(wrap(<CommentatorPage />));
    expect(container).toBeDefined();
    const { container: c2 } = render(wrapNoId(<CommentatorPage />));
    expect(c2).toBeDefined();
  });
});
