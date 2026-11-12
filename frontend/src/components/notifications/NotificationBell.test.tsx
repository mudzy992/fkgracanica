import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { NotificationBell } from './NotificationBell';

installDialogPolyfill();
const state = vi.hoisted(() => ({
  items: [] as Array<Record<string, unknown>>,
  total: 0,
  markRead: vi.fn(async () => ({})),
  markAll: vi.fn(async () => ({})),
}));
vi.mock('../../hooks/use-notifications', () => ({
  useNotificationRealtime: vi.fn(),
  useNotifications: () => ({ data: { data: state.items, meta: { total: state.total } } }),
  useMarkNotificationRead: () => ({ mutateAsync: state.markRead }),
  useMarkAllNotificationsRead: () => ({ mutateAsync: state.markAll }),
}));

beforeEach(() => {
  state.items = [];
  state.total = 0;
  state.markRead.mockClear();
  state.markAll.mockClear();
});
afterEach(() => vi.restoreAllMocks());

describe('NotificationBell mobile Sheet', () => {
  it('otvara imenovane notifikacije i čuva navigaciju na sve notifikacije', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: true, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(),
      removeEventListener: vi.fn(), dispatchEvent: () => false,
    }));
    const user = userEvent.setup();
    render(<MemoryRouter><Routes>
      <Route path="/" element={<NotificationBell admin />} />
      <Route path="/admin/notifications" element={<p>Odredište notifikacija</p>} />
    </Routes></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Notifikacije' }));
    const sheet = screen.getByRole('dialog', { name: 'Notifikacije' });
    expect(within(sheet).getByText('Nema novih notifikacija')).toBeInTheDocument();
    await user.click(within(sheet).getByRole('link', { name: /Pogledaj sve/ }));
    expect(await screen.findByText('Odredište notifikacija')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Notifikacije' })).not.toBeInTheDocument();
  });

  it('Zatvori u zaglavlju lista zatvara obavještenja', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><NotificationBell admin /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Notifikacije' }));
    const dialog = screen.getByRole('dialog', { name: 'Notifikacije' });
    const closes = within(dialog).getAllByRole('button', { name: 'Zatvori' });
    await user.click(closes[closes.length - 1]);
    expect(screen.queryByRole('dialog', { name: 'Notifikacije' })).not.toBeInTheDocument();
  });

  it('mobilni Sheet se zatvara preko zaglavlja', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: true, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(),
      removeEventListener: vi.fn(), dispatchEvent: () => false,
    }));
    const user = userEvent.setup();
    render(<MemoryRouter><NotificationBell admin /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Notifikacije' }));
    const sheet = screen.getByRole('dialog', { name: 'Notifikacije' });
    const closes = within(sheet).getAllByRole('button', { name: 'Zatvori' });
    await user.click(closes[closes.length - 1]);
    expect(screen.queryByRole('dialog', { name: 'Notifikacije' })).not.toBeInTheDocument();
  });

  it('stavka se označava pročitanom, a dugme označava sve', async () => {
    state.items = [{
      id: 'n1', title: 'Gol u 12.', body: 'FK Gračanica vodi', createdAt: '2026-05-01T17:00:00.000Z',
    }];
    state.total = 3;
    const user = userEvent.setup();
    render(<MemoryRouter><NotificationBell admin /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Notifikacije' }));
    const dialog = screen.getByRole('dialog', { name: 'Notifikacije' });
    await user.click(within(dialog).getByText('Gol u 12.'));
    expect(state.markRead).toHaveBeenCalledWith('n1');
    await user.click(within(dialog).getByRole('button', { name: /Označi sve/i }));
    expect(state.markAll).toHaveBeenCalledTimes(1);
  });

  it('više od devet nepročitanih prikazuje 9+', async () => {
    state.items = [];
    state.total = 2;
    render(<MemoryRouter><NotificationBell admin /></MemoryRouter>);
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
