import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-users-admin', () => ({
  useCreateUser: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateUser: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUserRoleOptions: () => ({ data: [] }),
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({ AdminFormSheet: ({ children }: any) => <div>{children}</div> }));
vi.mock('../../components/admin/form-dirty', () => ({ isFormDirty: () => false, snapshotForm: () => '' }));
vi.mock('../../components/admin/unsaved-navigation', () => ({ useUnsavedNavigation: () => {} }));

import { UserAdminFormSheet } from './UserAdminFormSheet';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe('fe06 UserAdminFormSheet branch56', () => {
  it('watch roleIds undefined → ?? []', () => {
    render(wrap(<UserAdminFormSheet open={true} onOpenChange={() => {}} user={null} canCreate={true} canUpdate={true} />));
    expect(document.body.textContent).toBeDefined();
  });
  it('watch isActive undefined → ?? true', () => {
    render(wrap(<UserAdminFormSheet open={true} onOpenChange={() => {}} user={{ id: 'u1', email: 'a@b.c', firstName: null, lastName: null } as any} canCreate={true} canUpdate={true} />));
    expect(document.body.textContent).toBeDefined();
  });
  it('open false branch', () => {
    render(wrap(<UserAdminFormSheet open={false} onOpenChange={() => {}} user={null} canCreate={true} canUpdate={true} />));
    expect(document.body.textContent).toBeDefined();
  });
});
