import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('ContactAdminPage — prikaz i filteri', () => {
  it('prikazuje naslov, praznu listu i dugme za sve pročitano', () => {
    render(<ContactAdminPage />);
    expect(screen.getByText('admin.contactPage.title')).toBeInTheDocument();
    expect(screen.getByText('Nema poruka.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Označi sve pročitanim' })).toBeInTheDocument();
  });

  it('traži prvu stranicu sa uključenim filterom nepročitanih', async () => {
    const user = userEvent.setup();
    render(<ContactAdminPage />);
    expect(state.listArgs.at(-1)).toEqual({ page: 1, search: undefined, unreadOnly: false });
    await user.click(screen.getByRole('button', { name: 'Samo nepročitane' }));
    await waitFor(() => expect(state.listArgs.at(-1)).toEqual({ page: 1, search: undefined, unreadOnly: true }));
    await user.click(screen.getByRole('button', { name: 'Samo nepročitane' }));
    await waitFor(() => expect(state.listArgs.at(-1)).toEqual({ page: 1, search: undefined, unreadOnly: false }));
  });

  it('pretraga se šalje i vraća na prvu stranicu', async () => {
    const user = userEvent.setup();
    render(<ContactAdminPage />);
    await user.type(screen.getByPlaceholderText('admin.usersAdmin.search'), 'dres');
    await waitFor(() => expect(state.listArgs.at(-1)).toEqual({ page: 1, search: 'dres', unreadOnly: false }));
  });

  it('red prikazuje ime, email, status i naslov, a prazan naslov crticu', () => {
    state.list = {
      ...state.list,
      data: { data: [message(), message({ id: 'msg2', subject: null, isRead: true })], meta: undefined },
    };
    render(<ContactAdminPage />);
    const first = screen.getByTestId('row-msg1');
    expect(within(first).getByText('Marko Marković')).toBeInTheDocument();
    expect(within(first).getByText('marko@fk.ba')).toBeInTheDocument();
    expect(within(first).getByText('Novo')).toBeInTheDocument();
    const second = screen.getByTestId('row-msg2');
    expect(within(second).getByText('—')).toBeInTheDocument();
    expect(within(second).getByText('Pročitano')).toBeInTheDocument();
  });

  it('greška učitavanja nudi ponovni pokušaj', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, isError: true };
    render(<ContactAdminPage />);
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.list.refetch).toHaveBeenCalledTimes(1);
  });

  it('paginacija se prikazuje samo uz meta i mijenja stranicu', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ContactAdminPage />);
    expect(screen.queryByText(/^paginacija:/)).toBeNull();
    unmount();
    state.list = { ...state.list, data: { data: [message()], meta: { totalPages: 3 } } };
    render(<ContactAdminPage />);
    expect(screen.getByText('paginacija:1/3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'dalje' }));
    await waitFor(() => expect(state.listArgs.at(-1)).toEqual({ page: 2, search: undefined, unreadOnly: false }));
  });

  it('embedded režim skriva ljusku i naslov, ali zadržava akciju', () => {
    state.list = { ...state.list, data: { data: [message()], meta: undefined } };
    render(<ContactAdminPage embedded />);
    expect(screen.queryByText('admin.contactPage.title')).toBeNull();
    expect(screen.getByRole('button', { name: 'Označi sve pročitanim' })).toBeInTheDocument();
    expect(screen.getByTestId('row-msg1')).toBeInTheDocument();
  });
});
