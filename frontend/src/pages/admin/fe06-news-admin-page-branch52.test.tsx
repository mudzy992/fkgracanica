import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['news.manage', 'news.approve', 'news.submit'] } }) }));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => true }));
vi.mock('../../hooks', () => ({ useNewsList: () => ({ data: [{ id: '1', title: 'Test', slug: 'test', status: 'DRAFT', category: { name: 'Cat' } }], isLoading: false, isError: false, refetch: vi.fn() }) }));
vi.mock('../../hooks/use-news-admin', () => ({
  useNewsCategories: () => ({ data: [{ id: 'c1', name: 'Cat1' }] }),
  useUpdateNewsStatus: () => ({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
  useSubmitNewsForReview: () => ({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
  useDeleteNews: () => ({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
}));
vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ children, actions }: { children: React.ReactNode; actions: React.ReactNode }) => <div>{actions}{children}</div>,
  AdminDataTable: ({ rows, columns }: { rows: never[]; columns: { key: string; render: (r: never) => React.ReactNode }[] }) => <div>{rows.map((r: never, i: number) => <div key={i}>{columns.map((c) => <div key={c.key}>{c.render(r)}</div>)}</div>)}</div>,
}));
vi.mock('./NewsCategoriesDialog', () => ({ NewsCategoriesDialog: () => null }));
vi.mock('../../components/admin/ConfirmDialog', () => ({ ConfirmDialog: ({ open, description }: { open: boolean; description: string }) => open ? <div>{description}</div> : null }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/ui/badge', () => ({ Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock('../../components/ui/button', () => ({ Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick}>{children}</button> }));

import { NewsAdminPage } from './NewsAdminPage';

function renderPage() {
  const qc = new QueryClient();
  return render(<QueryClientProvider client={qc}><MemoryRouter><NewsAdminPage /></MemoryRouter></QueryClientProvider>);
}

describe('fe06 NewsAdminPage branch52', () => {
  it('asArray categoriesRaw array path', () => {
    renderPage();
    expect(screen.getByText('Cat1')).toBeInTheDocument();
  });
  it('deleteTarget truthy pokazuje ConfirmDialog description', async () => {
    renderPage();
    fireEvent.click(screen.getByText('Obriši'));
    // after click, deleteTarget set, dialog description should appear (t key)
    expect(await screen.findByText('admin.newsAdmin.deleteConfirm')).toBeInTheDocument();
  });
});
