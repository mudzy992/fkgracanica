import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MuseumAdminPage } from './MuseumAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';
import { museumState as state, resetMuseumState } from '../../test/doubles/heritage-admin-doubles';

type Row = Record<string, unknown> & { id: string };

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', async () =>
  (await import('../../test/doubles/heritage-admin-doubles')).heritageHooksModule(),
);
vi.mock('../../hooks/use-heritage-admin', async () =>
  (await import('../../test/doubles/heritage-admin-doubles')).heritageAdminModule(),
);
vi.mock('../../hooks/use-confirm', async () =>
  (await import('../../test/doubles/heritage-admin-doubles')).heritageConfirmModule(),
);
vi.mock('../../components/seo/Seo', () => ({ Seo: ({ title }: { title: string }) => <div>seo:{title}</div> }));
vi.mock('../../components/admin/AdminPageShell', async () =>
  (await import('../../test/doubles/heritage-admin-doubles')).heritageShellModule(),
);
vi.mock('./MuseumAdminFormSheet', async () =>
  (await import('../../test/doubles/heritage-admin-doubles')).museumSheetModule(),
);
vi.mock('../../lib/museum-categories', async () =>
  (await import('../../test/doubles/heritage-admin-doubles')).museumCategoriesModule(),
);

const item = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  title: 'Dres iz 1974.',
  category: 'gear',
  year: 1974,
  ...over,
});

const row = (id: string) => screen.getByTestId(`row-${id}`);

beforeEach(() => {
  resetMuseumState([item(), item({ id: 'm2', title: 'Fotografija finala', category: 'photo', year: null })]);
});

describe('MuseumAdminPage — ljuska i tabela', () => {
  it('ugrađeni prikaz nema SEO ni naslov ljuske, ali ima dugme Novi', () => {
    render(<MuseumAdminPage embedded />);
    expect(screen.queryByText('seo:admin.museum')).toBeNull();
    expect(adminShellState.title).toBe('');
    expect(screen.getByRole('button', { name: /Novi/ })).toBeInTheDocument();
    expect(screen.getByText('Dres iz 1974.')).toBeInTheDocument();
  });

  it('samostalna stranica ima SEO, naslov i akciju u zaglavlju', () => {
    render(<MuseumAdminPage />);
    expect(screen.getByText('seo:admin.museum')).toBeInTheDocument();
    expect(adminShellState.title).toBe('admin.museum');
    expect(screen.getByTestId('actions')).toBeInTheDocument();
  });

  it('prikazuje kategoriju i godinu sa crticama za nedostajuće vrijednosti', () => {
    render(<MuseumAdminPage embedded />);
    expect(within(row('m1')).getByText('Oprema')).toBeInTheDocument();
    expect(within(row('m1')).getByText('1974')).toBeInTheDocument();
    expect(within(row('m2')).getByText('Fotografija')).toBeInTheDocument();
    expect(within(row('m2')).getByText('—')).toBeInTheDocument();
  });

  it('nepoznata kategorija daje crticu, a prazna lista poruku', () => {
    resetMuseumState([item({ category: 'ostalo', year: undefined })]);
    const { unmount } = render(<MuseumAdminPage embedded />);
    expect(within(row('m1')).getAllByText('—')).toHaveLength(2);
    unmount();
    resetMuseumState([]);
    render(<MuseumAdminPage embedded />);
    expect(screen.getByText('Nema predmeta u muzeju.')).toBeInTheDocument();
  });

  it('greška učitavanja nudi ponovni pokušaj', async () => {
    const user = userEvent.setup();
    state.isError = true;
    render(<MuseumAdminPage />);
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
    expect(adminShellState.retried).toBe(1);
  });
});

describe('MuseumAdminPage — akcije', () => {
  it('Novi otvara praznu formu, izmjena šalje zapis', async () => {
    const user = userEvent.setup();
    render(<MuseumAdminPage embedded />);
    expect(state.sheet.open).toBe(false);
    await user.click(screen.getByRole('button', { name: /Novi/ }));
    expect(state.sheet).toMatchObject({ open: true, edit: null });
    expect(screen.getByText('sheet:true:-')).toBeInTheDocument();
    await user.click(within(row('m1')).getByRole('button', { name: 'actions.edit' }));
    expect((state.sheet.edit as Row).id).toBe('m1');
    expect(screen.getByText('sheet:true:m1')).toBeInTheDocument();
  });

  it('brisanje traži potvrdu sa naslovom pa briše', async () => {
    const user = userEvent.setup();
    render(<MuseumAdminPage embedded />);
    await user.click(within(row('m1')).getByRole('button', { name: 'actions.delete' }));
    await waitFor(() =>
      expect(state.confirm).toHaveBeenCalledWith({
        title: 'Obrisati predmet?',
        description: 'Dres iz 1974.',
        variant: 'danger',
        confirmLabel: 'Obriši',
      }),
    );
    await waitFor(() => expect(state.remove).toHaveBeenCalledWith('m1'));
  });

  it('odbijena potvrda ne briše predmet', async () => {
    const user = userEvent.setup();
    state.confirm.mockResolvedValue(false);
    render(<MuseumAdminPage embedded />);
    await user.click(within(row('m2')).getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalled());
    expect(state.remove).not.toHaveBeenCalled();
  });
});
