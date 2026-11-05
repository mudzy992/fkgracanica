import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoundMatchesPanel } from './RoundMatchesPanel';
import {
  resetRoundMatchesState,
  roundMatch as match,
  roundMatchesState as state,
} from '../../../test/doubles/round-matches-panel-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks', async () =>
  (await import('../../../test/doubles/round-matches-panel-doubles')).matchesHooksModule(),
);
vi.mock('../../../hooks/use-competition-admin', async () =>
  (await import('../../../test/doubles/round-matches-panel-doubles')).competitionAdminModule(),
);
vi.mock('../../../hooks/use-confirm', async () =>
  (await import('../../../test/doubles/round-matches-panel-doubles')).confirmModule(),
);
vi.mock('../../../lib/auth', async () =>
  (await import('../../../test/doubles/round-matches-panel-doubles')).roundMatchesAuthModule(),
);
vi.mock('../../../lib/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/utils')>()),
  formatDateTime: (await import('../../../test/doubles/round-matches-panel-doubles'))
    .formatDateTimeDouble,
}));
vi.mock('../../../lib/match-status-label', () => ({
  matchStatusLabel: (status: string) => `status:${status}`,
}));
vi.mock('./MatchFormSheet', async () => ({
  MatchFormSheet: (await import('../../../test/doubles/round-matches-panel-doubles'))
    .roundMatchesSheetsModule().MatchFormSheet,
}));
vi.mock('./MatchLineupSheet', async () => ({
  MatchLineupSheet: (await import('../../../test/doubles/round-matches-panel-doubles'))
    .roundMatchesSheetsModule().MatchLineupSheet,
}));
vi.mock('../../../components/admin/AdminPageShell', async () =>
  (await import('../../../test/doubles/round-matches-panel-doubles')).roundMatchesTableModule(),
);

const renderPanel = (over: Record<string, unknown> = {}) =>
  render(
    <MemoryRouter>
      <RoundMatchesPanel seasonId="se1" roundId="r1" canManage {...over} />
    </MemoryRouter>,
  );

const row = (id: string) => screen.getByTestId(`row-${id}`);

beforeEach(() => {
  resetRoundMatchesState();
});

describe('RoundMatchesPanel — tabela', () => {
  it('prikazuje naslov, red, rezultat, status i datum', () => {
    renderPanel();
    expect(screen.getByText('admin.roundMatches.title')).toBeInTheDocument();
    expect(screen.getByText(/Domaći\s*:\s*Gost/)).toBeInTheDocument();
    expect(within(row('m1')).getByText('status:SCHEDULED')).toBeInTheDocument();
    expect(screen.getByText('dt:2026-05-10T17:00:00.000Z')).toBeInTheDocument();
  });

  it('zakazana utakmica dobija oznaku "Zakazano" bez retro oznake', () => {
    renderPanel();
    expect(within(row('m1')).getByText('Zakazano')).toBeInTheDocument();
    expect(within(row('m1')).queryByText('Retro')).toBeNull();
  });

  it('završena utakmica bez sata i odobrenja je retro', () => {
    state.matches = [match({ status: 'FINISHED', homeScore: 2, awayScore: 1, reportStatus: 'DRAFT' })];
    renderPanel();
    expect(within(row('m1')).getByText('Retro')).toBeInTheDocument();
    expect(within(row('m1')).queryByText('Zakazano')).toBeNull();
  });

  it('zakazane utakmice su prve, ostale po datumu', () => {
    state.matches = [
      match({ id: 'a', status: 'FINISHED', scheduledAt: '2026-05-01T10:00:00.000Z' }),
      match({ id: 'b', status: 'SCHEDULED', scheduledAt: '2026-05-20T10:00:00.000Z' }),
      match({ id: 'c', status: 'FINISHED', scheduledAt: '2026-04-01T10:00:00.000Z' }),
    ];
    renderPanel();
    const ids = screen.getAllByTestId(/^row-/).map((el) => el.getAttribute('data-testid'));
    expect(ids).toEqual(['row-b', 'row-c', 'row-a']);
  });

  it('prazna lista tokom učitavanja i poslije njega daje različitu poruku', () => {
    state.matches = [];
    state.isLoading = true;
    const { unmount } = renderPanel();
    expect(screen.getByText('Učitavanje...')).toBeInTheDocument();
    unmount();
    state.isLoading = false;
    renderPanel();
    expect(screen.getByText('Nema utakmica u ovom kolu.')).toBeInTheDocument();
  });
});

describe('RoundMatchesPanel — dozvole i akcije', () => {
  it('bez upravljanja nema dugmeta za novu utakmicu ni kolone akcija', () => {
    state.perms = [];
    renderPanel({ canManage: false });
    expect(screen.queryByRole('button', { name: /Utakmica/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Postava' })).toBeNull();
  });

  it('sa upravljanjem nudi novu utakmicu, izmjenu, postavu i brisanje', () => {
    state.perms = [];
    renderPanel();
    expect(screen.getByRole('button', { name: /Utakmica/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'actions.edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Postava' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'actions.delete' })).toBeInTheDocument();
  });

  it('završena utakmica sa odobrenim izvještajem nema akcija upravljanja', () => {
    state.matches = [match({ status: 'FINISHED', reportStatus: 'APPROVED', clockStartedAt: 'x' })];
    renderPanel();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.delete' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Postava' })).toBeNull();
    expect(within(row('m1')).queryByText('Retro')).toBeNull();
  });

  it('retro utakmica zadržava postavu, ali nema izmjene ni brisanja', () => {
    state.matches = [match({ status: 'FINISHED', reportStatus: 'DRAFT' })];
    renderPanel();
    expect(screen.getByRole('button', { name: 'Postava' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.delete' })).toBeNull();
    expect(within(row('m1')).getByText('Retro')).toBeInTheDocument();
  });
});
