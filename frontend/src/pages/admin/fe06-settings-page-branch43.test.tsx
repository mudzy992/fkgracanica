import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPage } from './SettingsPage';

const state = vi.hoisted(() => ({
  publicData: undefined as Record<string, string> | undefined,
  privateData: undefined as Record<string, string> | undefined,
  loadingPublic: false,
  loadingPrivate: false,
  savePublic: vi.fn().mockResolvedValue({}),
  savePrivate: vi.fn().mockResolvedValue({}),
  publicError: null as Error | null,
  privateError: null as Error | null,
  permissions: ['settings.update'] as string[],
}));

vi.mock('../../hooks', () => ({
  usePublicSettings: () => ({ data: state.publicData, isLoading: state.loadingPublic }),
  usePrivateSettings: () => ({ data: state.privateData, isLoading: state.loadingPrivate }),
  useUpdatePublicSettings: () => ({ mutateAsync: state.savePublic, isPending: false, error: state.publicError }),
  useUpdatePrivateSettings: () => ({ mutateAsync: state.savePrivate, isPending: false, error: state.privateError }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('./settings/SettingsModuleSection', () => ({
  SettingsModuleSection: ({ scope }: { scope: string }) => <div data-testid="modules">{scope}</div>,
}));
vi.mock('./settings/SettingsFieldGroupPanel', () => ({
  hasSettingsFieldGroup: () => true,
  SettingsFieldGroupPanel: ({ group, onDraft }: { group: string; onDraft: (k: string, v: string) => void }) => (
    <div data-testid="fields">
      {group}
      <button onClick={() => onDraft('club.name', 'Novo')}>promijeni-ime</button>
      <button onClick={() => onDraft('live.prematchAudioUrl', 'https://youtube.com/watch?v=abc')}>audio</button>
    </div>
  ),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/settings-sections', () => ({
  getSettingsTabs: (scope: string, hasGroup: (g: string) => boolean) => {
    const tabs = [{ id: 'modules', kind: 'modules', title: `${scope}-moduli` }];
    if (hasGroup('club')) tabs.push({ id: 'fields', kind: 'fields', title: 'Polja', group: 'club' } as never);
    return tabs;
  },
}));

beforeEach(() => {
  state.publicData = undefined;
  state.privateData = undefined;
  state.loadingPublic = false;
  state.loadingPrivate = false;
  state.savePublic = vi.fn().mockResolvedValue({});
  state.savePrivate = vi.fn().mockResolvedValue({});
  state.publicError = null;
  state.privateError = null;
  state.permissions = ['settings.update'];
});

describe('SettingsPage — branch43 (3 grane)', () => {
  it('values ?? {} pokriva undefined vs definisano (linija 44)', () => {
    state.publicData = undefined;
    state.privateData = undefined;
    const { unmount } = render(<SettingsPage />);
    expect(screen.getByTestId('modules').textContent).toBe('public');
    unmount();
    state.publicData = { 'club.name': 'FKG' };
    state.privateData = { 'theme.color': 'red' };
    render(<SettingsPage />);
    expect(screen.getByTestId('modules').textContent).toBe('public');
    expect(screen.getByRole('button', { name: 'public-moduli' })).toBeInTheDocument();
  });

  it('activeTab ?? tabs[0] pokriva nepostojeći tab (linija 62)', async () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Polja' }));
    expect(screen.getByTestId('fields').textContent).toContain('club');
    fireEvent.click(screen.getByRole('button', { name: 'public-moduli' }));
    expect(screen.getByTestId('modules')).toBeInTheDocument();
  });

  it('handleSave rano vraća bez drafta (linija 73)', async () => {
    render(<SettingsPage />);
    expect(screen.queryByRole('button', { name: 'Sačuvaj promjene' })).toBeNull();
  });

  it('handleSave sa draftom poziva save (linija 73 drugi pravac)', async () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Polja' }));
    fireEvent.click(screen.getByText('promijeni-ime'));
    expect(screen.getByRole('button', { name: 'Sačuvaj promjene' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sačuvaj promjene' }));
    await waitFor(() => expect(state.savePublic).toHaveBeenCalled());
  });

  it('bez dozvole nema trake za spremanje', () => {
    state.permissions = [];
    render(<SettingsPage />);
    expect(screen.queryByRole('button', { name: 'Sačuvaj promjene' })).toBeNull();
    expect(screen.getByTestId('modules')).toBeInTheDocument();
  });
});
