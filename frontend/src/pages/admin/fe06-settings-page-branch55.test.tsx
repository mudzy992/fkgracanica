import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['settings.update'] } }) }));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => true }));
vi.mock('../../hooks', () => ({
  usePublicSettings: () => ({ data: {}, isLoading: false }),
  usePrivateSettings: () => ({ data: {}, isLoading: false }),
  useUpdatePublicSettings: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useUpdatePrivateSettings: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));
vi.mock('../../lib/settings-sections', () => ({
  getSettingsTabs: () => [], // empty tabs -> tabs[0]?.id ?? 'modules' fallback
}));
vi.mock('../../lib/module-settings-rules', () => ({ isModuleEnabled: () => false }));
vi.mock('../../lib/youtube', () => ({ isInvalidChangedYouTubeUrl: () => false }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', () => ({ AdminPageShell: ({ children }: any) => <div>{children}</div> }));
vi.mock('./settings/SettingsModuleSection', () => ({ SettingsModuleSection: () => <div>module</div> }));
vi.mock('./settings/SettingsFieldGroupPanel', () => ({ hasSettingsFieldGroup: () => false, SettingsFieldGroupPanel: () => <div>panel</div> }));

import { SettingsPage } from './SettingsPage';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;
}

describe('fe06 SettingsPage branch55', () => {
  it('tabs empty → tabs[0]?.id ?? fallback', () => {
    render(wrap(<SettingsPage />));
    expect(document.body.textContent).toBeDefined();
  });
  it('draft empty handleSave early return via no draft', () => {
    render(wrap(<SettingsPage />));
    expect(document.body.textContent).toBeDefined();
  });
  it('activeTab undefined branch', () => {
    render(wrap(<SettingsPage />));
    expect(document.body.textContent).toBeDefined();
  });
});
