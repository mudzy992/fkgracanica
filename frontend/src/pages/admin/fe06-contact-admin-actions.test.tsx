import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactAdminPage } from './ContactAdminPage';
import { contactAdminState as state } from '../../test/doubles/contact-admin-doubles';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-contact-admin', () => ({
  useContactMessages: (params: unknown) => {
    state.listArgs.push(params);
    return state.list;
  },
  useMarkContactRead: () => state.markRead,
  useMarkAllContactRead: () => state.markAll,
  useDeleteContact: () => state.remove,
}));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: d.AdminPageShellDouble, AdminDataTable: d.AdminDataTableDouble };
});
vi.mock('../../components/admin/AdminPagination', async () => ({
  AdminPagination: (await import('../../test/doubles/contact-admin-doubles')).AdminPaginationDouble,
}));
vi.mock('./ContactMessageSheet', async () => ({
  ContactMessageSheet: (await import('../../test/doubles/contact-admin-doubles')).ContactMessageSheetDouble,
}));

const message = (over: Record<string, unknown> = {}) => ({
  id: 'msg1', name: 'Marko Marković', email: 'marko@fk.ba', subject: 'Pitanje',
  isRead: false, createdAt: '2026-05-01T10:00:00.000Z',
  ...over,
});

beforeEach(() => {
  state.list = { data: { data: [], meta: undefined }, isLoading: false, isError: false, refetch: vi.fn() };
  state.listArgs = [];
  state.markRead = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.markAll = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.remove = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.confirm = vi.fn(async () => true);
  state.sheet = null;
  adminShellState.retried = 0;
});

describe('ContactAdminPage — akcije nad porukom', () => {
  it('otvaranje nepročitane poruke je automatski označava pročitanom', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: { data: [message()], meta: undefined } };
    render(<ContactAdminPage />);
    await user.click(screen.getByTestId('row-msg1'));
    expect(screen.getByText('sheet:msg1:false')).toBeInTheDocument();
    await waitFor(() => expect(state.markRead.mutateAsync).toHaveBeenCalledWith('msg1'));
  });

  it('pročitana poruka se otvara bez dodatnog zahtjeva', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: { data: [message({ isRead: true })], meta: undefined } };
    render(<ContactAdminPage />);
    await user.click(screen.getByTestId('row-msg1'));
    expect(screen.getByText('sheet:msg1:false')).toBeInTheDocument();
    expect(state.markRead.mutateAsync).not.toHaveBeenCalled();
  });

  it('sheet može ručno označiti poruku pročitanom i zatvoriti se', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: { data: [message({ isRead: true })], meta: undefined } };
    render(<ContactAdminPage />);
    await user.click(screen.getByTestId('row-msg1'));
    await user.click(screen.getByRole('button', { name: 'označi-pročitanim' }));
    await waitFor(() => expect(state.markRead.mutateAsync).toHaveBeenCalledWith('msg1'));
    await user.click(screen.getByRole('button', { name: 'zatvori-sheet' }));
    expect(screen.queryByText(/^sheet:/)).toBeNull();
  });

  it('označavanje svih poruka šalje zahtjev i poštuje isPending', async () => {
    const user = userEvent.setup();
    state.markAll = { ...state.markAll, isPending: true };
    const { unmount } = render(<ContactAdminPage />);
    expect(screen.getByRole('button', { name: 'Označi sve pročitanim' })).toBeDisabled();
    unmount();
    state.markAll = { ...state.markAll, isPending: false };
    render(<ContactAdminPage />);
    await user.click(screen.getByRole('button', { name: 'Označi sve pročitanim' }));
    await waitFor(() => expect(state.markAll.mutateAsync).toHaveBeenCalled());
  });

  it('brisanje traži potvrdu sa imenom pošiljaoca i ne otvara sheet', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: { data: [message({ isRead: true })], meta: undefined } };
    render(<ContactAdminPage />);
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.remove.mutateAsync).toHaveBeenCalledWith('msg1'));
    expect(state.confirm).toHaveBeenCalledWith({
      title: 'Obrisati poruku?', description: 'Od: Marko Marković', variant: 'danger', confirmLabel: 'Obriši',
    });
    expect(screen.queryByText(/^sheet:/)).toBeNull();
  });

  it('odbijena potvrda ne briše poruku', async () => {
    const user = userEvent.setup();
    state.confirm = vi.fn(async () => false);
    state.list = { ...state.list, data: { data: [message()], meta: undefined } };
    render(<ContactAdminPage />);
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledTimes(1));
    expect(state.remove.mutateAsync).not.toHaveBeenCalled();
  });
});
