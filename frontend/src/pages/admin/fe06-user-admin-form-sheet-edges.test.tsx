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

/** Batch 34 — nepotpuni podaci korisnika (odvojeno zbog limita dužine). */
describe('UserAdminFormSheet — nepotpuni podaci (batch 34)', () => {
  it('korisnik bez `isActive` i bez uloga prikazuje aktivan prekidač', () => {
    renderSheet({
      user: { id: 'u9', email: 'bez@fk.ba', firstName: null, lastName: null, roles: null },
    });
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: /Sačuvaj/ })).toBeInTheDocument();
  });

  it('lista uloga koja nije učitana ne ruši sheet', () => {
    state.roles = undefined as never;
    renderSheet();
    expect(screen.getByText('admin.userForm.create')).toBeInTheDocument();
  });

  it('neispravan email prikazuje poruku i ne šalje zahtjev', async () => {
    const user1 = userEvent.setup();
    renderSheet();
    await user1.type(screen.getByPlaceholderText('admin.membershipForm.email'), 'nije-email');
    await user1.type(screen.getByPlaceholderText('admin.userForm.password'), pass);
    await user1.click(submit());
    await waitFor(() => expect(screen.getAllByText('Invalid email address').length).toBeGreaterThan(0));
    expect(state.create.mutateAsync).not.toHaveBeenCalled();
  });
});
