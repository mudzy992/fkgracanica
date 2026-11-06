import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HallOfFameAdminPage } from './HallOfFameAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';
import {
  hallOfFameState as state,
  resetHallOfFameState,
} from '../../test/doubles/heritage-admin-doubles';

type Row = Record<string, unknown> & { id: string };

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', async () =>
  (await import('../../test/doubles/heritage-admin-doubles')).heritageHooksModule(),
);
vi.mock('../../hooks/use-heritage-admin', async () =>
  (await import('../../test/doubles/heritage-admin-doubles')).heritageAdminModule(),
);
vi.mock('../../hooks/use-confirm', async () =>
  (await import('../../test/doubles/heritage-admin-doubles')).hallOfFameConfirmModule(),
);
vi.mock('../../components/seo/Seo', () => ({ Seo: ({ title }: { title: string }) => <div>seo:{title}</div> }));
vi.mock('../../components/admin/AdminPageShell', async () =>
  (await import('../../test/doubles/heritage-admin-doubles')).heritageShellModule(),
);
vi.mock('./HallOfFameAdminFormSheet', async () =>
  (await import('../../test/doubles/heritage-admin-doubles')).hallOfFameSheetModule(),
);

const entry = (over: Record<string, unknown> = {}) => ({
  id: 'h1',
  name: 'Asim Softić',
  role: 'Napadač',
  years: '1965–1978',
  ...over,
});

const row = (id: string) => screen.getByTestId(`row-${id}`);

beforeEach(() => {
  resetHallOfFameState([
    entry(),
    entry({ id: 'h2', name: 'Mujo Mujić', role: null, years: null }),
  ]);
});

describe('HallOfFameAdminPage — ljuska i tabela', () => {
  it('ugrađeni prikaz nema SEO ni naslov ljuske, ali ima dugme Novi', () => {
    render(<HallOfFameAdminPage embedded />);
    expect(screen.queryByText('seo:admin.hallOfFame')).toBeNull();
    expect(adminShellState.title).toBe('');
    expect(screen.getByRole('button', { name: /Novi/ })).toBeInTheDocument();
  });

  it('samostalna stranica ima SEO, naslov i akciju u zaglavlju', () => {
    render(<HallOfFameAdminPage />);
    expect(screen.getByText('seo:admin.hallOfFame')).toBeInTheDocument();
    expect(adminShellState.title).toBe('admin.hallOfFame');
    expect(screen.getByTestId('actions')).toBeInTheDocument();
  });

  it('prikazuje ulogu i godine, odnosno crtice kad ih nema', () => {
    render(<HallOfFameAdminPage embedded />);
    expect(within(row('h1')).getByText('Napadač')).toBeInTheDocument();
    expect(within(row('h1')).getByText('1965–1978')).toBeInTheDocument();
    expect(within(row('h2')).getAllByText('—')).toHaveLength(2);
  });

  it('prazna lista daje poruku', () => {
    resetHallOfFameState([]);
    render(<HallOfFameAdminPage embedded />);
    expect(screen.getByText('Nema unosa u Hall of Fame.')).toBeInTheDocument();
  });

  it('greška učitavanja nudi ponovni pokušaj', async () => {
    const user = userEvent.setup();
    state.isError = true;
    render(<HallOfFameAdminPage />);
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
    expect(adminShellState.retried).toBe(1);
  });
});

describe('HallOfFameAdminPage — akcije', () => {
  it('Novi otvara praznu formu, izmjena šalje zapis', async () => {
    const user = userEvent.setup();
    render(<HallOfFameAdminPage embedded />);
    expect(state.sheet.open).toBe(false);
    await user.click(screen.getByRole('button', { name: /Novi/ }));
    expect(state.sheet).toMatchObject({ open: true, edit: null });
    await user.click(within(row('h1')).getByRole('button', { name: 'actions.edit' }));
    expect((state.sheet.edit as Row).id).toBe('h1');
    expect(screen.getByText('sheet:true:h1')).toBeInTheDocument();
  });

  it('brisanje traži potvrdu sa imenom pa briše', async () => {
    const user = userEvent.setup();
    render(<HallOfFameAdminPage embedded />);
    await user.click(within(row('h1')).getByRole('button', { name: 'actions.delete' }));
    await waitFor(() =>
      expect(state.confirm).toHaveBeenCalledWith({
        title: 'Obrisati unos?',
        description: 'Asim Softić',
        variant: 'danger',
        confirmLabel: 'Obriši',
      }),
    );
    await waitFor(() => expect(state.remove).toHaveBeenCalledWith('h1'));
  });

  it('odbijena potvrda ne briše unos', async () => {
    const user = userEvent.setup();
    state.confirm.mockResolvedValue(false);
    render(<HallOfFameAdminPage embedded />);
    await user.click(within(row('h2')).getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalled());
    expect(state.remove).not.toHaveBeenCalled();
  });

  it('zatvaranje sheeta briše odabrani zapis', async () => {
    const user = userEvent.setup();
    render(<HallOfFameAdminPage embedded />);
    await user.click(within(row('h1')).getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText(/sheet:true:h1/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'zatvori-sheet' }));
    expect(screen.getByText(/sheet:false:-/)).toBeInTheDocument();
  });
});
