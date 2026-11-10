import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchFormSheet } from './MatchFormSheet';

const state = vi.hoisted(() => ({
  clubs: [{ id: 'c1', name: 'A' }, { id: 'c2', name: 'B' }],
  createMutate: vi.fn(async () => ({})),
  createPending: false,
  updateMutate: vi.fn(async () => ({})),
  updatePending: false,
  perms: ['live.manage'] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks', () => ({ useClubs: () => ({ data: state.clubs }) }));
vi.mock('../../../hooks/use-competition-admin', () => ({
  useCreateMatch: () => ({ mutateAsync: state.createMutate, isPending: state.createPending }),
  useUpdateMatch: () => ({ mutateAsync: state.updateMutate, isPending: state.updatePending }),
}));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('../../../components/admin/EntitySelect', () => ({
  EntitySelect: ({ value, onChange, options, label }: any) => (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} data-testid={`select-${label}`}>
      <option value="">--</option>
      {options.map((o: any) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('../../../components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));
vi.mock('../../../components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));
vi.mock('./match-form-datetime', () => ({
  parseScheduledAt: (v: string) => (v === '2025-01-01T12:01' || v === '' ? null : new Date(v).toISOString()),
  toLocalDatetime: () => '2025-01-01T12:00',
}));
vi.mock('./match-form-status', () => ({
  canSendManualStatus: () => false,
  clampScore: (v: number) => v,
  editableStatuses: ['SCHEDULED', 'FINISHED'],
  matchStatusOptions: () => [],
}));
vi.mock('./MatchFinishedReadOnly', () => ({ MatchFinishedReadOnly: () => null }));
vi.mock('./MatchHighlightsEditor', () => ({ MatchHighlightsEditor: () => null }));
vi.mock('./MatchScoreInputs', () => ({ MatchScoreInputs: () => null }));
vi.mock('./MatchLiveLockedNote', () => ({ MatchLiveLockedNote: () => null }));
vi.mock('../../../lib/match-retrospective', () => ({ isPastDatetime: () => true }));
vi.mock('../../../lib/club-venue', () => ({ resolveClubVenue: () => '' }));
vi.mock('../../../lib/api-error', () => ({ getApiErrorMessage: () => 'err' }));

describe('MatchFormSheet — parseScheduledAt guard (branch59)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.createPending = false;
    state.updatePending = false;
  });

  it('save sa neispravnim scheduledAt ne poziva create i prikazuje grešku (removeAttribute trik)', async () => {
    const { container } = render(<MatchFormSheet open={true} onOpenChange={vi.fn()} edit={null} seasonId="s1" roundId="r1" />);
    // Wait for useEffect to set initial scheduledAt
    const datetimeInit = await screen.findByDisplayValue('2025-01-01T12:00');
    expect(datetimeInit).toBeInTheDocument();
    const selects = screen.getAllByTestId(/select-/);
    fireEvent.change(selects[0], { target: { value: 'c1' } });
    fireEvent.change(selects[1], { target: { value: 'c2' } });
    const datetime = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    fireEvent.change(datetime, { target: { value: '2025-01-01T12:01' } });
    const btn = screen.getByRole('button', { name: /Kreiraj/i }) as HTMLButtonElement;
    btn.removeAttribute('disabled');
    fireEvent.click(btn);
    expect(state.createMutate).not.toHaveBeenCalled();
    expect(await screen.findByText(/Unesite ispravan datum i vrijeme/i)).toBeInTheDocument();
  });

  it('save sa ispravnim scheduledAt poziva create', async () => {
    const { container } = render(<MatchFormSheet open={true} onOpenChange={vi.fn()} edit={null} seasonId="s1" roundId="r1" />);
    await screen.findByDisplayValue('2025-01-01T12:00');
    const selects = screen.getAllByTestId(/select-/);
    fireEvent.change(selects[0], { target: { value: 'c1' } });
    fireEvent.change(selects[1], { target: { value: 'c2' } });
    const datetime = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    fireEvent.change(datetime, { target: { value: '2025-01-02T12:00' } });
    const btn = screen.getByRole('button', { name: /Kreiraj/i }) as HTMLButtonElement;
    btn.removeAttribute('disabled');
    fireEvent.click(btn);
    expect(state.createMutate).toHaveBeenCalled();
  });
});
