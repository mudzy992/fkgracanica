import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { NotificationBell } from './NotificationBell';

installDialogPolyfill();

const state = vi.hoisted(() => ({
  data: undefined as unknown,
} as { data: unknown }));

vi.mock('../../hooks/use-notifications', () => ({
  useNotificationRealtime: vi.fn(),
  useNotifications: () => ({ data: state.data } as unknown),
  useMarkNotificationRead: () => ({ mutateAsync: vi.fn(async () => ({})) }),
  useMarkAllNotificationsRead: () => ({ mutateAsync: vi.fn(async () => ({})) }),
}));

describe('NotificationBell — branch47 (2 grane ?? fallback)', () => {
  it('kada je data undefined koristi fallback [] i 0 (pokriva oba ??)', async () => {
    state.data = undefined;
    render(<MemoryRouter><NotificationBell /></MemoryRouter>);
    // badge ne treba prikazati count jer je 0
    expect(screen.queryByText('0')).toBeNull();
    expect(screen.queryByText('9+')).toBeNull();
    // badge sa count>0 ne postoji
    const btn = screen.getByRole('button', { name: /Notifikacije|Notifications/ });
    expect(btn).toBeInTheDocument();
  });

  it('kada je data.data undefined ali meta.total undefined koristi unread.length fallback', async () => {
    state.data = { data: undefined, meta: { total: undefined } };
    render(<MemoryRouter><NotificationBell /></MemoryRouter>);
    expect(screen.queryByText('0')).toBeNull();
  });

  it('kada je data.data postoje ali meta.total undefined koristi dužinu niza', async () => {
    state.data = { data: [{ id: 'n1', title: 'T', body: 'B', createdAt: '2026-05-01T12:00:00.000Z' }], meta: {} };
    render(<MemoryRouter><NotificationBell /></MemoryRouter>);
    // unread.length =1, total fallback => count 1 => badge "1"
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('kada je data.data i meta.total definisani koristi total', async () => {
    state.data = { data: [{ id: 'n1', title: 'T', body: 'B', createdAt: '2026-05-01T12:00:00.000Z' }], meta: { total: 5 } };
    render(<MemoryRouter><NotificationBell /></MemoryRouter>);
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
