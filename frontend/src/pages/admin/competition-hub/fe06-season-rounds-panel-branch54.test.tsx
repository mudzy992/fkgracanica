import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-rounds', () => ({ useRounds: vi.fn(), useDeleteRound: () => ({ mutateAsync: vi.fn(), isPending: false }) }));
vi.mock('../../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: vi.fn(), dialog: null }) }));
vi.mock('../../../lib/api', () => ({ api: { get: vi.fn() } }));
vi.mock('./RoundFormSheet', () => ({ RoundFormSheet: () => <div>RoundFormSheet</div> }));
vi.mock('./RoundCascadeDeleteDialog', () => ({ RoundCascadeDeleteDialog: () => <div>CascadeDialog</div> }));

import { useRounds } from '../../../hooks/use-rounds';
import { SeasonRoundsPanel } from './SeasonRoundsPanel';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}
describe('fe06 SeasonRoundsPanel branch54', () => {
  it('rounds undefined → ?? [] fallback empty', () => {
    (useRounds as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: false });
    render(wrap(<SeasonRoundsPanel seasonId="s1" selectedRoundId={null} onSelectRound={vi.fn()} canManage={false} />));
    expect(screen.getByText('admin.roundsPanel.empty')).toBeInTheDocument();
  });
  it('rounds with count ?? 0 fallback', () => {
    (useRounds as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: [{ id: 'r1', number: 1, _count: undefined } as never], isLoading: false });
    render(wrap(<SeasonRoundsPanel seasonId="s1" selectedRoundId={null} onSelectRound={vi.fn()} canManage={false} />));
    expect(screen.getByText('admin.roundsPanel.matches')).toBeInTheDocument();
  });
  it('cascadeImpact ?? fallback when null', () => {
    (useRounds as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    render(wrap(<SeasonRoundsPanel seasonId="s1" selectedRoundId={null} onSelectRound={vi.fn()} canManage={true} />));
    expect(screen.getByText('admin.roundsPanel.round')).toBeInTheDocument();
  });
});
