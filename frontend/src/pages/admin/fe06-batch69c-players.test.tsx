import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const clubState = vi.hoisted(() => ({
  clubs: [] as Array<{ id: string; name: string; isOwnClub?: boolean }>,
  ownClub: undefined as unknown,
}));

vi.mock('../../hooks', () => ({
  useClubs: () => ({ data: clubState.clubs }),
  useOwnClub: () => ({ data: clubState.ownClub }),
}));

const createState = vi.hoisted(() => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
}));
const updateState = vi.hoisted(() => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
}));

vi.mock('../../hooks/use-competition-admin', () => ({
  useCreatePlayer: () => createState,
  useUpdatePlayer: () => updateState,
}));

vi.mock('../../components/admin/AdminFormSheet', async () => ({
  AdminFormSheet: (await import('../../test/doubles/form-sheet-doubles')).AdminFormSheetDouble,
}));
vi.mock('../../components/ui/dialog', async () => ({
  Dialog: ({ children }: { children: unknown }) => <div>{children as never}</div>,
  DialogHeader: ({ children }: { children: unknown }) => <div>{children as never}</div>,
  DialogBody: ({ children }: { children: unknown }) => <div>{children as never}</div>,
}));

import { PlayersAdminFormSheet } from './PlayersAdminFormSheet';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{c}</QueryClientProvider>;
}

describe('PlayersAdminFormSheet — clubId || undefined fallback', () => {
  beforeEach(() => {
    clubState.clubs = [];
    clubState.ownClub = undefined;
    createState.mutateAsync.mockReset().mockResolvedValue({});
    updateState.mutateAsync.mockReset().mockResolvedValue({});
  });

  it('kada su fixedClubId i clubId prazni -> clubId undefined (pokriva || undefined)', async () => {
    const user = userEvent.setup();
    // fixedClubId undefined, ownClub undefined, edit null -> clubId state will be '' (falsy)
    render(wrap(<PlayersAdminFormSheet open onOpenChange={vi.fn()} edit={null} />));
    await user.type(screen.getByPlaceholderText('admin.playerForm.firstName'), 'Marko');
    await user.type(screen.getByPlaceholderText('admin.playerForm.lastName'), 'Maric');
    // select position is default MID, so no need
    // click create
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() => expect(createState.mutateAsync).toHaveBeenCalled());
    // @ts-ignore mock.calls tuple
    const body = (createState.mutateAsync.mock.calls[0] as unknown as [Record<string, unknown>])[0];
    // clubId should be undefined when both fixed and selected are empty
    expect(body.clubId).toBeUndefined();
  });

  it('kada je fixedClubId postavljen -> koristi fixedClubId (ne undefined)', async () => {
    const user = userEvent.setup();
    clubState.ownClub = { id: 'own1' } as unknown;
    render(wrap(<PlayersAdminFormSheet open onOpenChange={vi.fn()} edit={null} clubId="fixed1" />));
    await user.type(screen.getByPlaceholderText('admin.playerForm.firstName'), 'Ana');
    await user.type(screen.getByPlaceholderText('admin.playerForm.lastName'), 'Anic');
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() => expect(createState.mutateAsync).toHaveBeenCalled());
    // @ts-ignore mock.calls tuple
    const body = (createState.mutateAsync.mock.calls[0] as unknown as [Record<string, unknown>])[0];
    expect(body.clubId).toBe('fixed1');
  });

  it('kada je clubId izabran preko selecta -> koristi clubId', async () => {
    const user = userEvent.setup();
    const edit = { id: 'p1', firstName: 'A', lastName: 'B', clubId: 'c1', position: 'MID' } as unknown as never;
    render(wrap(<PlayersAdminFormSheet open onOpenChange={vi.fn()} edit={edit} />));
    await user.type(screen.getByPlaceholderText('admin.playerForm.firstName'), ' X');
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    await waitFor(() => expect(updateState.mutateAsync).toHaveBeenCalled());
    // @ts-ignore mock.calls tuple
    const body2 = (updateState.mutateAsync.mock.calls[0] as unknown as [Record<string, unknown>])[0];
    expect(body2.clubId).toBe('c1');
  });
});
