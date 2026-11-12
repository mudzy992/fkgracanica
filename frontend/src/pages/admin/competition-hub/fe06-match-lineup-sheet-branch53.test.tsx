import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../../hooks', () => ({ useMatch: () => ({ data: null, isLoading: false }), usePlayers: () => ({ data: [], isLoading: false }) }));
vi.mock('../../../hooks/use-club-hub', () => ({ useClubSquad: () => ({ data: undefined, isLoading: false }) }));
vi.mock('../../../hooks/use-competition-admin', () => ({ useSetMatchLineup: () => ({ mutateAsync: vi.fn(), isPending: false }) }));
vi.mock('../../../lib/match-lineup-from-squad', () => ({ buildSquadFormationLayout: () => null }));
vi.mock('./match-lineup-slots', () => ({
  buildClubMatchLineup: () => [],
  excludeAssignedPlayers: (_a: any, _b: any) => [],
  hasSquadDefaults: () => false,
  playersIncludingSaved: () => [],
  retainUneditedLineupRows: () => [],
  slotsToLineupPayload: () => [],
}));
vi.mock('../../../components/admin/AdminFormSheet', () => ({ AdminFormSheet: ({ children, title }: any) => <div><div>{title}</div><div>{children}</div></div> }));
vi.mock('../../../components/admin/FormationPitch', () => ({ FormationPitch: () => <div>Pitch</div> }));
vi.mock('../../../components/ui/button', () => ({ Button: ({ children, ...p }: any) => <button {...p}>{children}</button> }));
vi.mock('../../../components/ui/skeleton', () => ({ Skeleton: () => <div>Skeleton</div> }));

import { MatchLineupSheet } from './MatchLineupSheet';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}
describe('fe06 MatchLineupSheet branch53', () => {
  it('match null → homeClubId ?? fallback empty', () => {
    render(wrap(<MatchLineupSheet matchId={null} open={true} onOpenChange={vi.fn()} />));
    expect(screen.getByText(/Postava:/)).toBeInTheDocument();
  });
  it('open false → early return branch', () => {
    render(wrap(<MatchLineupSheet matchId="m1" open={false} onOpenChange={vi.fn()} />));
    expect(screen.getByText(/Postava:/)).toBeInTheDocument();
  });
  it('side home vs away branch via default homeSlots', () => {
    render(wrap(<MatchLineupSheet matchId="m1" open={true} onOpenChange={vi.fn()} />));
    expect(screen.getByText('Pitch')).toBeInTheDocument();
  });
});
