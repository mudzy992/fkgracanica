import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoundMatchesPanel } from './RoundMatchesPanel';
import {
  resetRoundMatchesState,
  roundMatch as match,
  roundMatchesState as state,
} from '../../../test/doubles/round-matches-panel-doubles';
import type { Match } from '../../../types';

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

describe('RoundMatchesPanel — live i izvještaj', () => {
  it('live dugme vodi na utakmicu uz live.manage', () => {
    renderPanel();
    expect(within(row('m1')).getByRole('link')).toHaveAttribute('href', '/admin/live/m1');
  });

  it('izvještaj je dostupan samo za završenu utakmicu sa otvorenim izvještajem', () => {
    state.matches = [
      match({ id: 'draft', status: 'FINISHED', reportStatus: 'DRAFT' }),
      match({ id: 'ok', status: 'FINISHED', reportStatus: 'APPROVED' }),
    ];
    renderPanel();
    expect(within(row('draft')).getByRole('link', { name: /Izvještaj/ })).toHaveAttribute(
      'href',
      '/admin/matches/draft/report',
    );
    expect(within(row('ok')).queryByRole('link', { name: /Izvještaj/ })).toBeNull();
  });

  it('bez live.manage nema live ni izvještaj linkova', () => {
    state.perms = [];
    state.matches = [match({ status: 'FINISHED', reportStatus: 'DRAFT' })];
    renderPanel();
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('RoundMatchesPanel — obrasci i brisanje', () => {
  it('nova utakmica otvara praznu formu sa sezonom i kolom', async () => {
    const user = userEvent.setup();
    renderPanel();
    expect(state.form.open).toBe(false);
    await user.click(screen.getByRole('button', { name: /Utakmica/ }));
    expect(state.form).toMatchObject({ open: true, edit: null, seasonId: 'se1', roundId: 'r1' });
  });

  it('izmjena šalje postojeći zapis u formu', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.edit' }));
    expect((state.form.edit as Match).id).toBe('m1');
    expect(state.form.open).toBe(true);
  });

  it('Postava otvara sheet sa id-em utakmice', async () => {
    const user = userEvent.setup();
    renderPanel();
    expect(state.lineup.matchId).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Postava' }));
    expect(state.lineup).toMatchObject({ open: true, matchId: 'm1' });
  });

  it('zatvaranje forme i postave sklanja odabir', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole('button', { name: /Utakmica/ }));
    await user.click(screen.getByRole('button', { name: 'zatvori-formu' }));
    expect(state.form.open).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Postava' }));
    await user.click(screen.getByRole('button', { name: 'zatvori-postavu' }));
    expect(state.lineup).toMatchObject({ open: false, matchId: null });
  });

  it('brisanje traži potvrdu sa imenima klubova pa briše', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() =>
      expect(state.confirm).toHaveBeenCalledWith({
        title: 'Obrisati utakmicu?',
        description: 'Domaći vs Gost',
        variant: 'danger',
        confirmLabel: 'Obriši',
      }),
    );
    await waitFor(() => expect(state.remove).toHaveBeenCalledWith('m1'));
  });

  it('odbijena potvrda ne briše utakmicu', async () => {
    const user = userEvent.setup();
    state.confirm.mockResolvedValue(false);
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalled());
    expect(state.remove).not.toHaveBeenCalled();
  });
});
