import { vi } from 'vitest';
import type { MembershipRow, MembershipStatus } from '../../types/membership';

/** Zajedničko stanje i dvojnici za MembershipAdminPage testove (dva fajla). */
export const membershipState = {
  perms: [] as string[],
  rows: [] as MembershipRow[],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  confirm: vi.fn((_options: { title: string }) => Promise.resolve(true)),
  pending: { activate: false, renew: false, suspend: false, cancel: false },
  mutate: {
    activate: vi.fn((id: string) => Promise.resolve(id)),
    renew: vi.fn((id: string) => Promise.resolve(id)),
    suspend: vi.fn((id: string) => Promise.resolve(id)),
    cancel: vi.fn((id: string) => Promise.resolve(id)),
  },
  formSheet: { open: false, onOpenChange: null as ((o: boolean) => void) | null },
  detail: { id: '', open: false },
};

export const membershipRow = (over: Partial<MembershipRow> = {}): MembershipRow => ({
  id: 'm1',
  status: 'ACTIVE' as MembershipStatus,
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T00:00:00.000Z',
  user: { id: 'u1', email: 'ana@example.com', firstName: 'Ana', lastName: 'Anić' },
  card: { id: 'c1', cardNumber: 'K-001', qrCode: 'qr', issuedAt: '2026-01-01' },
  ...over,
});

export function resetMembershipAdminState() {
  const state = membershipState;
  state.perms = ['membership.manage'];
  state.rows = [membershipRow()];
  state.isLoading = false;
  state.isError = false;
  state.pending = { activate: false, renew: false, suspend: false, cancel: false };
  state.formSheet = { open: false, onOpenChange: null };
  state.detail = { id: '', open: false };
  state.refetch.mockClear();
  state.confirm.mockReset();
  state.confirm.mockResolvedValue(true);
  Object.values(state.mutate).forEach((fn) => fn.mockClear());
}

export function membershipHooksModule() {
  const state = membershipState;
  return {
    useMemberships: () => ({
      data: state.rows,
      isLoading: state.isLoading,
      isError: state.isError,
      refetch: state.refetch,
    }),
    useActivateMembership: () => ({ isPending: state.pending.activate, mutateAsync: state.mutate.activate }),
    useRenewMembership: () => ({ isPending: state.pending.renew, mutateAsync: state.mutate.renew }),
    useSuspendMembership: () => ({ isPending: state.pending.suspend, mutateAsync: state.mutate.suspend }),
    useCancelMembership: () => ({ isPending: state.pending.cancel, mutateAsync: state.mutate.cancel }),
  };
}

export function membershipAuthModule() {
  return { useAuth: () => ({ user: { permissions: membershipState.perms } }) };
}

export function membershipConfirmModule() {
  return { useConfirm: () => ({ confirm: membershipState.confirm, dialog: null }) };
}

export function membershipSeoModule() {
  return { Seo: () => null };
}

export function membershipExportModule() {
  return {
    MembershipCardsBulkExport: ({ memberships }: { memberships: MembershipRow[] }) => (
      <div>izvoz-kartica:{memberships.length}</div>
    ),
  };
}

export function membershipDetailModule() {
  return {
    MembershipDetailSheet: ({ membership, open, onOpenChange }: {
      membership: MembershipRow | null; open: boolean; onOpenChange?: (open: boolean) => void;
    }) => {
      membershipState.detail = { id: membership?.id ?? '', open };
      return (
        <div>
          detalj:{membership?.id ?? 'nema'}:{String(open)}
          {onOpenChange ? <button onClick={() => onOpenChange(false)}>zatvori-detalj</button> : null}
        </div>
      );
    },
  };
}

export function membershipFormModule() {
  return {
    MembershipAdminFormSheet: ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
      membershipState.formSheet = { open, onOpenChange };
      return <div>nova-forma:{String(open)}</div>;
    },
  };
}
