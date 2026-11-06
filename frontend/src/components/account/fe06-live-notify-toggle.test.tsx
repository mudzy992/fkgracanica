import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LiveNotifyToggle } from './LiveNotifyToggle';

const state = vi.hoisted(() => ({
  user: null as Record<string, unknown> | null,
  applySession: vi.fn(),
  patch: vi.fn(),
  token: 'jwt-1' as string | null,
  refresh: 'refresh-1' as string | null,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: state.user, applySession: state.applySession }),
}));
vi.mock('../../lib/api', () => ({
  api: { patch: (...args: unknown[]) => state.patch(...args) },
  getAccessToken: () => state.token,
  getRefreshToken: () => state.refresh,
}));

beforeEach(() => {
  state.user = { id: 'u1', email: 'admin@fk.ba', notifyLiveMatch: true };
  state.applySession = vi.fn();
  state.patch = vi.fn().mockResolvedValue({ data: { notifyLiveMatch: false } });
  state.token = 'jwt-1';
  state.refresh = 'refresh-1';
});

describe('LiveNotifyToggle', () => {
  it('bez korisnika ne renderira ništa', () => {
    state.user = null;
    const { container } = render(<LiveNotifyToggle />);
    expect(container).toBeEmptyDOMElement();
  });

  it('podrazumijevano je uključen kad polje nije postavljeno', () => {
    state.user = { id: 'u1' };
    render(<LiveNotifyToggle />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('t:common.livePushTitle')).toBeInTheDocument();
    expect(screen.getByText('t:common.livePushHint')).toBeInTheDocument();
  });

  it('poštuje isključeno stanje', () => {
    state.user = { id: 'u1', notifyLiveMatch: false };
    render(<LiveNotifyToggle />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('prebacivanje šalje patch i osvježava sesiju', async () => {
    render(<LiveNotifyToggle />);
    await userEvent.click(screen.getByRole('switch'));
    expect(state.patch).toHaveBeenCalledWith('/auth/preferences', { notifyLiveMatch: false });
    await waitFor(() => expect(state.applySession).toHaveBeenCalled());
    expect(state.applySession).toHaveBeenCalledWith(
      { id: 'u1', email: 'admin@fk.ba', notifyLiveMatch: false },
      'jwt-1',
      'refresh-1',
    );
  });

  it('bez tokena šalje prazne stringove u sesiju', async () => {
    state.token = null;
    state.refresh = null;
    state.patch = vi.fn().mockResolvedValue({ data: {} });
    render(<LiveNotifyToggle />);
    await userEvent.click(screen.getByRole('switch'));
    await waitFor(() => expect(state.applySession).toHaveBeenCalled());
    expect(state.applySession).toHaveBeenCalledWith(
      { id: 'u1', email: 'admin@fk.ba', notifyLiveMatch: true },
      '',
      '',
    );
  });
});
