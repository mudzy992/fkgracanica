import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { NotificationBell } from './NotificationBell';

installDialogPolyfill();

const state = vi.hoisted(() => ({
  items: [] as Array<{ id: string; title: string; body: string; createdAt: string }>,
  total: 0,
  markRead: vi.fn(),
  markAll: vi.fn(),
}));

vi.mock('../../hooks/use-notifications', () => ({
  useNotificationRealtime: vi.fn(),
  useNotifications: () => ({ data: { data: state.items, meta: { total: state.total } } }),
  useMarkNotificationRead: () => ({ mutateAsync: state.markRead }),
  useMarkAllNotificationsRead: () => ({ mutateAsync: state.markAll }),
}));

const item = (id: string, title = `Obavještenje ${id}`) => ({
  id,
  title,
  body: 'Kratak sadržaj',
  createdAt: '2026-11-06T10:00:00.000Z',
});

const renderBell = (admin = false) =>
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<NotificationBell admin={admin} />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  state.items = [];
  state.total = 0;
  state.markRead = vi.fn().mockResolvedValue(undefined);
  state.markAll = vi.fn().mockResolvedValue(undefined);
});

describe('NotificationBell — desktop dijalog', () => {
  it('bez obavještenja nema bedža i lista je prazna', async () => {
    renderBell();
    expect(screen.queryByText('9+')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Notifikacije' }));
    expect(screen.getByText('Nema novih notifikacija')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Označi sve pročitanim/ })).toBeNull();
  });

  it('prikazuje najviše deset obavještenja i broj preko devet kao "9+"', async () => {
    state.total = 12;
    state.items = Array.from({ length: 12 }, (_, i) => item(`n${i}`));
    renderBell();
    expect(screen.getByText('9+')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Notifikacije' }));
    const buttons = screen.getAllByRole('button', { name: /Obavještenje n/ });
    expect(buttons).toHaveLength(10);
    expect(screen.getAllByText('Kratak sadržaj')).toHaveLength(10);
  });

  it('oznaka označava sve pročitanim', async () => {
    state.total = 2;
    state.items = [item('a'), item('b')];
    renderBell(true);
    await userEvent.click(screen.getByRole('button', { name: 'Notifikacije' }));
    await userEvent.click(screen.getByRole('button', { name: /Označi sve pročitanim/ }));
    expect(state.markAll).toHaveBeenCalledWith();
  });

  it('klik na obavještenje šalje njegov id i prikazuje broj bez "9+"', async () => {
    state.total = 3;
    state.items = [item('a'), item('b')];
    renderBell();
    expect(screen.getByText('3')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Notifikacije' }));
    await userEvent.click(screen.getByRole('button', { name: /Obavještenje b/ }));
    expect(state.markRead).toHaveBeenCalledWith('b');
  });

  it('admin link vodi na /admin/notifications', async () => {
    state.total = 1;
    state.items = [item('a')];
    renderBell(true);
    await userEvent.click(screen.getByRole('button', { name: 'Notifikacije' }));
    const dialog = screen.getByRole('dialog', { name: 'Notifikacije' });
    expect(within(dialog).getByRole('link', { name: /Pogledaj sve/ })).toHaveAttribute(
      'href',
      '/admin/notifications',
    );
  });

  it('javni link vodi na /notifikacije i zatvara dijalog', async () => {
    state.total = 1;
    state.items = [item('a')];
    renderBell(false);
    await userEvent.click(screen.getByRole('button', { name: 'Notifikacije' }));
    const dialog = screen.getByRole('dialog', { name: 'Notifikacije' });
    await userEvent.click(within(dialog).getByRole('link', { name: /Pogledaj sve/ }));
    expect(screen.queryByRole('dialog', { name: 'Notifikacije' })).not.toBeInTheDocument();
  });
});
