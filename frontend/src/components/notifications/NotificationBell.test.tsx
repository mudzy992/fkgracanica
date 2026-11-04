import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { NotificationBell } from './NotificationBell';

installDialogPolyfill();
vi.mock('../../hooks/use-notifications', () => ({
  useNotificationRealtime: vi.fn(),
  useNotifications: () => ({ data: { data: [], meta: { total: 0 } } }),
  useMarkNotificationRead: () => ({ mutateAsync: vi.fn() }),
  useMarkAllNotificationsRead: () => ({ mutateAsync: vi.fn() }),
}));

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
});
