import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPage } from './SettingsPage';

const state = vi.hoisted(() => ({
  publicData: {} as Record<string, string> | undefined,
  privateData: {} as Record<string, string> | undefined,
  loadingPublic: false,
  loadingPrivate: false,
  savePublic: vi.fn(),
  savePrivate: vi.fn(),
  publicError: null as Error | null,
  privateError: null as Error | null,
  permissions: ['settings.update'] as string[],
}));

vi.mock('../../hooks', () => ({
  usePublicSettings: () => ({ data: state.publicData, isLoading: state.loadingPublic }),
  usePrivateSettings: () => ({ data: state.privateData, isLoading: state.loadingPrivate }),
  useUpdatePublicSettings: () => ({
    mutateAsync: state.savePublic,
    isPending: false,
    error: state.publicError,
  }),
  useUpdatePrivateSettings: () => ({
    mutateAsync: state.savePrivate,
    isPending: false,
    error: state.privateError,
  }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('./settings/SettingsModuleSection', () => ({
  SettingsModuleSection: ({ scope, readOnly }: { scope: string; readOnly: boolean }) => (
    <div data-testid="modules">
      {scope}|{readOnly ? 'readonly' : 'editable'}
    </div>
  ),
}));
vi.mock('./settings/SettingsFieldGroupPanel', () => ({
  hasSettingsFieldGroup: () => true,
  SettingsFieldGroupPanel: ({
    group,
    readOnly,
    invalidKey,
    onDraft,
  }: {
    group: string;
    readOnly: boolean;
    invalidKey?: string;
    onDraft: (k: string, v: string) => void;
  }) => (
    <div data-testid="fields">
      {group}|{readOnly ? 'readonly' : 'editable'}|{invalidKey ?? 'ok'}
      <button onClick={() => onDraft('club.name', 'Novo')}>promijeni-ime</button>
    </div>
  ),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => (k === 'video.invalidInput' ? 'NEVALIDNO' : k) }),
}));
vi.mock('../../lib/settings-sections', () => ({
  getSettingsTabs: (scope: string) => [
    { id: 'modules', kind: 'modules', title: `${scope}-moduli`, description: 'Opis modula' },
    { id: 'fields', kind: 'fields', title: 'Polja', group: 'club' },
    { id: 'plain', kind: 'other', title: 'Bez opisa' },
  ],
}));

beforeEach(() => {
  state.publicData = {};
  state.privateData = {};
  state.loadingPublic = false;
  state.loadingPrivate = false;
  state.savePublic = vi.fn().mockResolvedValue({});
  state.savePrivate = vi.fn().mockResolvedValue({});
  state.publicError = null;
  state.privateError = null;
  state.permissions = ['settings.update'];
});

describe('SettingsPage — scope i tabovi', () => {
  it('podrazumijevano prikazuje javne postavke sa opisom modula', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('modules').textContent).toBe('public|editable');
    expect(screen.getByText(/Modul koji ovisi o drugom/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Javne' })).toBeInTheDocument();
  });

  it('prebacivanje na privatne postavke mijenja scope', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Privatne' }));
    expect(screen.getByTestId('modules').textContent).toBe('private|editable');
    expect(screen.getByRole('button', { name: 'private-moduli' })).toBeInTheDocument();
  });

  it('tab polja prikazuje panel grupe bez opisa', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Polja' }));
    expect(screen.getByTestId('fields').textContent).toContain('club|editable|ok');
    expect(screen.queryByText(/Modul koji ovisi o drugom/)).toBeNull();
  });

  it('bez dozvole paneli su samo za čitanje i draft se ne pamti', () => {
    state.permissions = [];
    render(<SettingsPage />);
    expect(screen.getByTestId('modules').textContent).toBe('public|readonly');
    fireEvent.click(screen.getByRole('button', { name: 'Polja' }));
    expect(screen.getByTestId('fields').textContent).toContain('club|readonly|ok');
    fireEvent.click(screen.getByText('promijeni-ime'));
    expect(screen.queryByRole('button', { name: 'Sačuvaj promjene' })).toBeNull();
  });

  it('promjena polja otvara traku za spremanje', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Polja' }));
    fireEvent.click(screen.getByText('promijeni-ime'));
    expect(screen.getByRole('button', { name: 'Sačuvaj promjene' })).toBeInTheDocument();
  });
});

describe('SettingsPage — spremanje', () => {
  it('javne promjene šalju draft i čiste ga', async () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Polja' }));
    fireEvent.click(screen.getByText('promijeni-ime'));
    fireEvent.click(screen.getByRole('button', { name: 'Sačuvaj promjene' }));
    await waitFor(() => expect(state.savePublic).toHaveBeenCalledWith({ 'club.name': 'Novo' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Sačuvaj promjene' })).toBeNull(),
    );
  });

  it('privatne promjene traže potvrdu', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Privatne' }));
    fireEvent.click(screen.getByRole('button', { name: 'Polja' }));
    fireEvent.click(screen.getByText('promijeni-ime'));
    fireEvent.click(screen.getByRole('button', { name: 'Sačuvaj promjene' }));
    await waitFor(() => expect(state.savePrivate).toHaveBeenCalledWith({ 'club.name': 'Novo' }));
    confirm.mockRestore();
  });

  it('otkazana potvrda ne šalje privatne promjene', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Privatne' }));
    fireEvent.click(screen.getByRole('button', { name: 'Polja' }));
    fireEvent.click(screen.getByText('promijeni-ime'));
    fireEvent.click(screen.getByRole('button', { name: 'Sačuvaj promjene' }));
    expect(state.savePrivate).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it('greška spremanja se prikazuje', () => {
    state.publicError = new Error('Server nije dostupan');
    render(<SettingsPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Server nije dostupan');
  });

  it('uspješno spremanje ne prikazuje alert', async () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Polja' }));
    fireEvent.click(screen.getByText('promijeni-ime'));
    fireEvent.click(screen.getByRole('button', { name: 'Sačuvaj promjene' }));
    await waitFor(() => expect(state.savePublic).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
