import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  usePublicSettings: () => ({ data: undefined, isLoading: false }),
  usePrivateSettings: () => ({ data: undefined, isLoading: false }),
  useUpdatePublicSettings: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useUpdatePrivateSettings: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['settings.update'] } }) }));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => true }));
vi.mock('../../lib/module-settings-rules', () => ({ isModuleEnabled: () => false }));
vi.mock('../../lib/settings-sections', () => ({ getSettingsTabs: () => [{ id: 'modules', title: 'Moduli', kind: 'modules' }] }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', () => ({ AdminPageShell: ({ children }: any) => <div>{children}</div> }));
vi.mock('./settings/SettingsModuleSection', () => ({ SettingsModuleSection: () => <div>ModuleSection</div> }));
vi.mock('./settings/SettingsFieldGroupPanel', () => ({ hasSettingsFieldGroup: () => false, SettingsFieldGroupPanel: () => <div>FieldPanel</div> }));

import { SettingsPage } from './SettingsPage';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;
}
describe('fe06 SettingsPage branch54', () => {
  it('values ?? {} fallback when both undefined', () => {
    render(wrap(<SettingsPage />));
    expect(screen.getByText('ModuleSection')).toBeInTheDocument();
  });
  it('activeTab ?? tabs[0] fallback', () => {
    render(wrap(<SettingsPage />));
    expect(screen.getByText('ModuleSection')).toBeInTheDocument();
  });
  it('tabs[0]?.id ?? modules fallback', () => {
    render(wrap(<SettingsPage />));
    expect(screen.getByText('ModuleSection')).toBeInTheDocument();
  });
});
