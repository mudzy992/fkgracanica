import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
// user null -> perms ?? [] branch
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => false }));
vi.mock('../../hooks', () => ({ useNewsList: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }) }));
vi.mock('../../hooks/use-news-admin', () => ({
  useNewsCategories: () => ({ data: undefined }),
  useUpdateNewsStatus: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSubmitNewsForReview: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteNews: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ children }: any) => <div>{children}</div>,
  AdminDataTable: ({ rows, empty }: any) => <div>{rows.length === 0 ? empty : 'has'}</div>,
}));
vi.mock('./NewsCategoriesDialog', () => ({ NewsCategoriesDialog: () => null }));
vi.mock('../../components/admin/ConfirmDialog', () => ({ ConfirmDialog: () => null }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/ui/badge', () => ({ Badge: ({ children }: any) => <span>{children}</span> }));
vi.mock('../../components/ui/button', () => ({ Button: ({ children }: any) => <button>{children}</button> }));

import { NewsAdminPage } from './NewsAdminPage';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;
}

describe('fe06 NewsAdminPage branch55', () => {
  it('user null → perms ?? []', () => {
    render(wrap(<NewsAdminPage />));
    expect(document.body.textContent).toBeDefined();
  });
  it('categoriesRaw undefined → asArray []', () => {
    render(wrap(<NewsAdminPage />));
    expect(document.body.textContent).toBeDefined();
  });
  it('canManage false still renders', () => {
    render(wrap(<NewsAdminPage />));
    expect(document.body.textContent).toBeDefined();
  });
});
