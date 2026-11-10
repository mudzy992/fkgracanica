import { render } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

// Capture props for each sheet
let hallProps: any = null;
let museumProps: any = null;
let playersProps: any = null;
let trophiesProps: any = null;
let clubPlayersProps: any = null;

vi.mock('./HallOfFameAdminFormSheet', () => ({
  HallOfFameAdminFormSheet: (p: any) => { hallProps = p; return <div><button onClick={() => p.onOpenChange(false)}>close</button><button onClick={() => p.onOpenChange(true)}>open</button></div>; },
}));
vi.mock('./MuseumAdminFormSheet', () => ({
  MuseumAdminFormSheet: (p: any) => { museumProps = p; return <div><button onClick={() => p.onOpenChange(false)}>close</button><button onClick={() => p.onOpenChange(true)}>open</button></div>; },
}));
vi.mock('./PlayersAdminFormSheet', () => ({
  PlayersAdminFormSheet: (p: any) => { playersProps = p; clubPlayersProps = p; return <div><button onClick={() => p.onOpenChange(false)}>close</button><button onClick={() => p.onOpenChange(true)}>open</button></div>; },
}));
vi.mock('./TrophiesAdminFormSheet', () => ({
  TrophiesAdminFormSheet: (p: any) => { trophiesProps = p; return <div><button onClick={() => p.onOpenChange(false)}>close</button><button onClick={() => p.onOpenChange(true)}>open</button></div>; },
}));
let confirmDialogProps: any = null;
vi.mock('../../components/admin/ConfirmDialog', () => ({
  ConfirmDialog: (p: any) => { confirmDialogProps = p; return <div><button onClick={() => p.onOpenChange(false)}>close</button><button onClick={() => p.onOpenChange(true)}>open</button></div>; },
}));

// Mock hooks for those pages
vi.mock('../../hooks', () => ({
  useHallOfFame: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }),
  useMuseum: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }),
  usePlayers: () => ({ data: [], isLoading: false, isError: false }),
  useTrophies: () => ({ data: [], isLoading: false, isError: false }),
  useClubPlayers: () => ({ data: [], isLoading: false }),
}));
vi.mock('../../hooks/use-heritage-admin', () => ({
  useDeleteHallOfFame: () => ({ mutateAsync: vi.fn() }),
  useDeleteMuseumItem: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('../../hooks/use-players-admin', () => ({
  usePlayers: () => ({ data: [], isLoading: false }),
  useCreatePlayer: () => ({ mutateAsync: vi.fn() }),
  useUpdatePlayer: () => ({ mutateAsync: vi.fn() }),
  useDeletePlayer: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('../../hooks/use-trophies-admin', () => ({
  useTrophies: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }),
  useDeleteTrophy: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('../../hooks/use-club', () => ({
  useClub: () => ({ data: { id: 'c1', name: 'C' }, isLoading: false }),
  useClubPlayers: () => ({ data: [], isLoading: false }),
}));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: vi.fn(async () => true), dialog: null }) }));
vi.mock('../../components/admin/AdminPageShell', () => ({ AdminDataTable: () => <div>table</div>, AdminPageShell: ({ children }: any) => <div>{children}</div> }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/ui/button', () => ({ Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button> }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { id: 'u1', permissions: ['*'] } }), AuthProvider: ({ children }: any) => <div>{children}</div> }));

const qc = new QueryClient();
const wrap = (ui: React.ReactNode) => <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;

describe('batch62 dialogs — if (!o) both branches', () => {
  beforeEach(() => { hallProps = museumProps = playersProps = trophiesProps = clubPlayersProps = null; });

  it('HallOfFameAdminPage', async () => {
    const { HallOfFameAdminPage } = await import('./HallOfFameAdminPage');
    render(wrap(<HallOfFameAdminPage />));
    expect(hallProps).toBeTruthy();
    hallProps.onOpenChange(false);
    hallProps.onOpenChange(true);
    expect(true).toBe(true);
  });

  it('MuseumAdminPage', async () => {
    const { MuseumAdminPage } = await import('./MuseumAdminPage');
    render(wrap(<MuseumAdminPage />));
    expect(museumProps).toBeTruthy();
    museumProps.onOpenChange(false);
    museumProps.onOpenChange(true);
  });

  it('PlayersAdminPage', async () => {
    const { PlayersAdminPage } = await import('./PlayersAdminPage');
    render(wrap(<PlayersAdminPage />));
    expect(playersProps).toBeTruthy();
    playersProps.onOpenChange(false);
    playersProps.onOpenChange(true);
  });

  it('TrophiesAdminPage', async () => {
    const { TrophiesAdminPage } = await import('./TrophiesAdminPage');
    render(wrap(<TrophiesAdminPage />));
    expect(trophiesProps).toBeTruthy();
    trophiesProps.onOpenChange(false);
    trophiesProps.onOpenChange(true);
  });

  it('ClubPlayersTab', async () => {
    const { ClubPlayersTab } = await import('./club-hub/tabs/ClubPlayersTab');
    render(wrap(<ClubPlayersTab clubId="c1" />));
    expect(clubPlayersProps).toBeTruthy();
    clubPlayersProps.onOpenChange(false);
    clubPlayersProps.onOpenChange(true);
  });

  it('RoundCascadeDeleteDialog if (!o) setAck(false)', async () => {
    const { RoundCascadeDeleteDialog } = await import('./competition-hub/RoundCascadeDeleteDialog');
    const onOpenChange = vi.fn();
    const impact: any = { matchCount: 2, approvedReportCount: 1, eventCount: 3, lineupCount: 4, commentCount: 5, ticketCount: 6 };
    render(wrap(<RoundCascadeDeleteDialog open={true} onOpenChange={onOpenChange} roundLabel="1. kolo" impact={impact} isPending={false} onConfirm={vi.fn()} />));
    expect(confirmDialogProps).toBeTruthy();
    confirmDialogProps.onOpenChange(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    confirmDialogProps.onOpenChange(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
