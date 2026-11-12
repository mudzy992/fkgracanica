import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks', async (orig) => { const a = await (orig as unknown as () => Promise<Record<string, unknown>>)(); return { ...(a as object), useMatches: vi.fn() }; });
vi.mock('../../../hooks/use-competition-admin', () => ({ useDeleteMatch: () => ({ mutateAsync: vi.fn() }) }));
vi.mock('../../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: vi.fn(), dialog: null }) }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../../../lib/permissions', () => ({ hasPermission: () => false }));
vi.mock('./round-matches-utils', () => ({ useRoundMatchesSorted: (d: any) => d ?? [], isScheduledMatch: () => false }));
vi.mock('./MatchFormSheet', () => ({ MatchFormSheet: () => <div>MatchFormSheet</div> }));
vi.mock('./MatchLineupSheet', () => ({ MatchLineupSheet: () => <div>MatchLineupSheet</div> }));

import { useMatches } from '../../../hooks';
import { RoundMatchesPanel } from './RoundMatchesPanel';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;
}
describe('fe06 RoundMatchesPanel branch53', () => {
  it('isLoading true → empty loading branch', () => {
    (useMatches as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    render(wrap(<RoundMatchesPanel seasonId="s1" roundId="r1" canManage={false} />));
    expect(screen.getByText('Učitavanje...')).toBeInTheDocument();
  });
  it('canManage false → no button branch', () => {
    (useMatches as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    render(wrap(<RoundMatchesPanel seasonId="s1" roundId="r1" canManage={false} />));
    expect(screen.queryByText('Utakmica')).not.toBeInTheDocument();
  });
  it('canManage true → button branch', () => {
    (useMatches as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    render(wrap(<RoundMatchesPanel seasonId="s1" roundId="r1" canManage={true} />));
    expect(screen.getByText('Utakmica')).toBeInTheDocument();
  });
});
