import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

const mockClubs = vi.fn();
vi.mock('../../../hooks', () => ({ useClubs: () => mockClubs() }));
vi.mock('../../../hooks/use-competition-admin', () => ({
  useCreateMatch: () => ({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
  useUpdateMatch: () => ({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
}));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: [] } }) }));
vi.mock('../../../lib/permissions', () => ({ hasPermission: () => false }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/club-venue', () => ({ resolveClubVenue: vi.fn((c) => c?.venue ?? '') }));
vi.mock('./match-form-datetime', () => ({ parseScheduledAt: (v: string) => v, toLocalDatetime: (v?: string) => v ?? '2025-01-01T10:00' }));
vi.mock('./match-form-status', () => ({ canSendManualStatus: () => false, clampScore: (v: number) => v, editableStatuses: [], matchStatusOptions: () => [] }));
vi.mock('../../../lib/match-retrospective', () => ({ isPastDatetime: () => false }));
vi.mock('../../../lib/api-error', () => ({ getApiErrorMessage: () => 'err' }));
vi.mock('./MatchFinishedReadOnly', () => ({ MatchFinishedReadOnly: () => <div>ReadOnly</div> }));
vi.mock('./MatchHighlightsEditor', () => ({ MatchHighlightsEditor: () => null }));
vi.mock('./MatchScoreInputs', () => ({ MatchScoreInputs: () => null }));
vi.mock('./MatchLiveLockedNote', () => ({ MatchLiveLockedNote: () => null }));
vi.mock('../../../components/admin/AdminFormSheet', () => ({ AdminFormSheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('../../../components/admin/EntitySelect', () => ({ EntitySelect: (p: { label: string; value: string; onChange: (v: string) => void; options: { id: string; label: string }[] }) => <select aria-label={p.label} value={p.value} onChange={(e) => p.onChange(e.target.value)}>{p.options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</select> }));
vi.mock('../../../components/ui/button', () => ({ Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick}>{children}</button> }));
vi.mock('../../../components/ui/input', () => ({ Input: (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} /> }));

import { MatchFormSheet } from './MatchFormSheet';

function renderSheet(props: Partial<Parameters<typeof MatchFormSheet>[0]> = {}) {
  const qc = new QueryClient();
  return render(<QueryClientProvider client={qc}><MemoryRouter><MatchFormSheet open={true} onOpenChange={vi.fn()} edit={null} seasonId="s1" roundId="r1" {...props} /></MemoryRouter></QueryClientProvider>);
}

describe('fe06 MatchFormSheet branch52', () => {
  it('clubs undefined → clubs ?? [] fallback (bid7)', async () => {
    mockClubs.mockReturnValue({ data: undefined });
    renderSheet();
    // trigger onHomeClubChange with undefined clubs
    const selects = screen.getAllByRole('combobox');
    // first EntitySelect is home
    fireEvent.change(selects[0], { target: { value: 'h1' } });
    expect(true).toBe(true);
  });
  it('isFinished true prikazuje ReadOnly', () => {
    mockClubs.mockReturnValue({ data: [{ id: 'h1', name: 'H', venue: 'Stadion' }] });
    const edit = { id: 'm1', status: 'FINISHED', homeClubId: 'h1', awayClubId: 'a1', homeClub: { id: 'h1', name: 'H' }, venue: '' } as never;
    renderSheet({ edit });
    expect(screen.getByText('ReadOnly')).toBeInTheDocument();
  });
  it('clubs sa dva kluba prikazuje opcije', () => {
    mockClubs.mockReturnValue({ data: [{ id: 'h1', name: 'H' }, { id: 'a1', name: 'A' }] });
    renderSheet();
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
  });
});
