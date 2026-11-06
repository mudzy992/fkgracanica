import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MembershipAdminFormSheet } from './MembershipAdminFormSheet';

const state = vi.hoisted(() => ({
  create: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-membership', () => ({ useCreateMembershipAdmin: () => state.create }));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, title, onOpenChange, children }: {
    open: boolean; title: string; onOpenChange: (open: boolean) => void; children: ReactNode;
  }) =>
    open ? (
      <section aria-label={title}>
        {children}
        <button onClick={() => onOpenChange(false)}>zatvori-sheet</button>
      </section>
    ) : null,
}));

const emailInput = () => screen.getByPlaceholderText('admin.membershipForm.emailPlaceholder') as HTMLInputElement;
const submitButton = () => screen.getByRole('button', { name: /Dodaj člana/ });

describe('MembershipAdminFormSheet', () => {
  beforeEach(() => {
    state.create = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  });

  it('zatvoren sheet ne prikazuje formu', () => {
    render(<MembershipAdminFormSheet open={false} onOpenChange={() => {}} />);
    expect(screen.queryByLabelText('admin.membershipForm.newMember')).toBeNull();
  });

  it('prazan email prikazuje grešku i ne šalje zahtjev', async () => {
    render(<MembershipAdminFormSheet open onOpenChange={() => {}} />);
    await userEvent.click(submitButton());
    expect(screen.getByText('Unesite email korisnika.')).toBeTruthy();
    expect(state.create.mutateAsync).not.toHaveBeenCalled();
  });

  it('email od samih razmaka tretira se kao prazan', async () => {
    render(<MembershipAdminFormSheet open onOpenChange={() => {}} />);
    await userEvent.type(emailInput(), '   ');
    await userEvent.click(submitButton());
    expect(screen.getByText('Unesite email korisnika.')).toBeTruthy();
    expect(state.create.mutateAsync).not.toHaveBeenCalled();
  });

  it('dodaje člana sa trimovanim emailom i activira po potrebi', async () => {
    const onOpenChange = vi.fn();
    render(<MembershipAdminFormSheet open onOpenChange={onOpenChange} />);
    await userEvent.type(emailInput(), '  clan@example.com  ');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(submitButton());
    expect(state.create.mutateAsync).toHaveBeenCalledWith({ email: 'clan@example.com', activate: true });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('bez štikliranja activate je false', async () => {
    render(<MembershipAdminFormSheet open onOpenChange={() => {}} />);
    await userEvent.type(emailInput(), 'clan@example.com');
    await userEvent.click(submitButton());
    expect(state.create.mutateAsync).toHaveBeenCalledWith({ email: 'clan@example.com', activate: false });
  });

  it('greška pri dodavanju prikazuje poruku i ne zatvara sheet', async () => {
    const onOpenChange = vi.fn();
    state.create = {
      mutateAsync: vi.fn(async () => {
        throw new Error('conflict');
      }),
      isPending: false,
    };
    render(<MembershipAdminFormSheet open onOpenChange={onOpenChange} />);
    await userEvent.type(emailInput(), 'clan@example.com');
    await userEvent.click(submitButton());
    expect(await screen.findByText('Dodavanje nije uspjelo. Provjerite email i postojeće članstvo.')).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('tokom dodavanja dugme je onemogućeno i piše Dodavanje...', () => {
    state.create = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    render(<MembershipAdminFormSheet open onOpenChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Dodavanje...' })).toHaveProperty('disabled', true);
  });

  it('zatvaranje resetuje polja i grešku', async () => {
    const { rerender } = render(<MembershipAdminFormSheet open onOpenChange={() => {}} />);
    await userEvent.type(emailInput(), 'clan@example.com');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'zatvori-sheet' }));
    rerender(<MembershipAdminFormSheet open onOpenChange={() => {}} />);
    expect(emailInput().value).toBe('');
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
  });
});
