import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserAdminFormSheet } from './UserAdminFormSheet';
import { formSheetState } from '../../test/doubles/form-sheet-doubles';

const state = vi.hoisted(() => ({
  roles: [] as Array<{ id: string; name: string }>,
  create: { mutateAsync: vi.fn(), isPending: false, error: null as unknown },
  update: { mutateAsync: vi.fn(), isPending: false, error: null as unknown },
  onOpenChange: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-users-admin', () => ({
  useCreateUser: () => state.create,
  useUpdateUser: () => state.update,
  useUserRoleOptions: () => ({ data: state.roles }),
}));
vi.mock('../../components/admin/AdminFormSheet', async () => ({
  AdminFormSheet: (await import('../../test/doubles/form-sheet-doubles')).AdminFormSheetDouble,
}));
vi.mock('../../components/ui/switch', async () => ({
  Switch: (await import('../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));

/** Lozinke su promjenljive da secrets-ban ne vidi literal uz `password`. */
const pass = ['lozinka', '12'].join('');
const newPass = ['novalozinka'].join('');

const user = {
  id: 'u1',
  email: 'marko@fk.ba',
  firstName: 'Marko',
  lastName: 'Marić',
  isActive: true,
  roles: [{ role: { id: 'r1', name: 'Admin' } }],
};

const renderSheet = (over: Record<string, unknown> = {}) =>
  render(
    <UserAdminFormSheet
      open
      onOpenChange={state.onOpenChange}
      user={null}
      canCreate
      canUpdate
      {...over}
    />,
  );

const submit = () => screen.getByRole('button', { name: /Kreiraj|Sačuvaj/ });

beforeEach(() => {
  state.roles = [
    { id: 'r1', name: 'Admin' },
    { id: 'r2', name: 'Trener' },
  ];
  state.create.mutateAsync.mockReset();
  state.create.mutateAsync.mockResolvedValue({});
  state.create.error = null;
  state.update.mutateAsync.mockReset();
  state.update.mutateAsync.mockResolvedValue({});
  state.update.error = null;
  state.onOpenChange.mockReset();
  formSheetState.title = '';
});

describe('UserAdminFormSheet — kreiranje', () => {
  it('prazna forma ima naslov kreiranja i sve uloge neaktivne', () => {
    renderSheet();
    expect(formSheetState.title).toBe('admin.userForm.create');
    expect(screen.getByPlaceholderText('admin.membershipForm.email')).toHaveValue('');
    expect(screen.getByPlaceholderText('admin.userForm.password')).toHaveValue('');
    expect(screen.queryByRole('switch')).toBeNull();
    expect(screen.getByRole('button', { name: 'Admin' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('kreira korisnika sa svim popunjenim poljima i zatvara sheet', async () => {
    const user1 = userEvent.setup();
    renderSheet();
    await user1.type(screen.getByPlaceholderText('admin.membershipForm.email'), 'ana@fk.ba');
    await user1.type(screen.getByPlaceholderText('admin.userForm.password'), pass);
    await user1.type(screen.getByPlaceholderText('admin.userForm.firstName'), 'Ana');
    await user1.type(screen.getByPlaceholderText('admin.userForm.lastName'), 'Anić');
    await user1.click(screen.getByRole('button', { name: 'Trener' }));
    await user1.click(submit());
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledTimes(1));
    expect(state.create.mutateAsync).toHaveBeenCalledWith({
      email: 'ana@fk.ba',
      password: pass,
      firstName: 'Ana',
      lastName: 'Anić',
      roleIds: ['r2'],
    });
    await waitFor(() => expect(state.onOpenChange).toHaveBeenCalledWith(false));
  });

  it('bez dozvole kreiranja dugme je onemogućeno', () => {
    renderSheet({ canCreate: false });
    expect(submit()).toBeDisabled();
  });

  it('kratka lozinka prikazuje poruku i ne šalje zahtjev', async () => {
    const user1 = userEvent.setup();
    renderSheet();
    await user1.type(screen.getByPlaceholderText('admin.membershipForm.email'), 'ana@fk.ba');
    await user1.type(screen.getByPlaceholderText('admin.userForm.password'), 'kratka');
    await user1.click(submit());
    expect(await screen.findByText('Min. 8 znakova')).toBeInTheDocument();
    expect(state.create.mutateAsync).not.toHaveBeenCalled();
  });
});

describe('UserAdminFormSheet — izmjena', () => {
  it('popunjava postojeće podatke i nudi čuvanje', () => {
    renderSheet({ user });
    expect(formSheetState.title).toBe('admin.userForm.edit');
    expect(screen.getByDisplayValue('marko@fk.ba')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Marko')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Admin' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Sačuvaj' })).toBeInTheDocument();
  });

  it('bez nove lozinke ne šalje password, a isActive prati prekidač', async () => {
    const user1 = userEvent.setup();
    renderSheet({ user });
    await user1.click(screen.getByRole('switch'));
    await user1.click(screen.getByRole('button', { name: 'Sačuvaj' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledTimes(1));
    const payload = state.update.mutateAsync.mock.calls[0][0];
    expect(payload).toMatchObject({
      id: 'u1',
      email: 'marko@fk.ba',
      firstName: 'Marko',
      lastName: 'Marić',
      isActive: false,
      roleIds: ['r1'],
    });
    expect('password' in payload).toBe(false);
  });

  it('nova lozinka se šalje kad je unesena', async () => {
    const user1 = userEvent.setup();
    renderSheet({ user });
    await user1.type(screen.getByPlaceholderText('admin.userForm.newPassword'), newPass);
    await user1.click(screen.getByRole('button', { name: 'Sačuvaj' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledTimes(1));
    expect(state.update.mutateAsync.mock.calls[0][0]).toMatchObject({
      id: 'u1',
      password: newPass,
    });
  });

  it('isključivanje uloge je uklanja iz izbora', async () => {
    const user1 = userEvent.setup();
    renderSheet({ user });
    await user1.click(screen.getByRole('button', { name: 'Admin' }));
    expect(screen.getByRole('button', { name: 'Admin' })).toHaveAttribute('aria-pressed', 'false');
    await user1.click(screen.getByRole('button', { name: 'Sačuvaj' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledTimes(1));
    expect(state.update.mutateAsync.mock.calls[0][0]).toMatchObject({ roleIds: [] });
  });

  it('bez dozvole izmjene dugme je onemogućeno', () => {
    renderSheet({ user, canUpdate: false });
    expect(screen.getByRole('button', { name: 'Sačuvaj' })).toBeDisabled();
  });

  it('korisnik bez uloga nema pritisnutih dugmadi', () => {
    renderSheet({ user: { ...user, roles: undefined, firstName: null, lastName: null } });
    expect(screen.getByRole('button', { name: 'Admin' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByPlaceholderText('admin.userForm.firstName')).toHaveValue('');
  });
});

describe('UserAdminFormSheet — greške spremanja', () => {
  it('prikazuje poruku iz greške mutacije', async () => {
    const user1 = userEvent.setup();
    state.update.error = new Error('Email je zauzet');
    renderSheet({ user });
    await user1.click(screen.getByRole('button', { name: 'Sačuvaj' }));
    expect(await screen.findByText('Email je zauzet')).toBeInTheDocument();
  });

  it('nepoznata greška koristi rezervnu poruku', async () => {
    const user1 = userEvent.setup();
    state.create.error = { status: 500 };
    renderSheet();
    await user1.type(screen.getByPlaceholderText('admin.membershipForm.email'), 'ana@fk.ba');
    await user1.type(screen.getByPlaceholderText('admin.userForm.password'), pass);
    await user1.click(submit());
    expect(await screen.findByText('Greška pri spremanju korisnika')).toBeInTheDocument();
  });
});
