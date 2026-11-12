import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MuseumAdminPage } from './MuseumAdminPage';
import { museumState, resetMuseumState } from '../../test/doubles/heritage-admin-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', async () => (await import('../../test/doubles/heritage-admin-doubles')).heritageHooksModule());
vi.mock('../../hooks/use-heritage-admin', async () => (await import('../../test/doubles/heritage-admin-doubles')).heritageAdminModule());
vi.mock('../../hooks/use-confirm', async () => (await import('../../test/doubles/heritage-admin-doubles')).heritageConfirmModule());
vi.mock('../../components/seo/Seo', () => ({ Seo: ({ title }: { title: string }) => <div>seo:{title}</div> }));
vi.mock('../../components/admin/AdminPageShell', async () => (await import('../../test/doubles/heritage-admin-doubles')).heritageShellModule());
vi.mock('./MuseumAdminFormSheet', async () => (await import('../../test/doubles/heritage-admin-doubles')).museumSheetModule());
vi.mock('../../lib/museum-categories', async () => (await import('../../test/doubles/heritage-admin-doubles')).museumCategoriesModule());

describe('MuseumAdminPage — branch49 (fallback ?? [] i ?? —)', () => {
  beforeEach(() => {
    resetMuseumState([
      { id: 'm1', title: 'Predmet', category: 'gear', year: 2020 },
      { id: 'm2', title: 'Drugi', category: undefined as unknown as string, year: null as unknown as number },
    ]);
  });

  it('data undefined fallback na prazan niz (?? [])', () => {
    museumState.data = undefined as unknown as never;
    render(<MuseumAdminPage embedded />);
    expect(screen.getByText('Nema predmeta u muzeju.')).toBeInTheDocument();
  });

  it('year nullish i prazna kategorija daju — fallback', () => {
    render(<MuseumAdminPage embedded />);
    // m2 ima category undefined i year null => oba —
    const rows = screen.getAllByText('—');
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('nepoznata kategorija i bez godine', () => {
    resetMuseumState([{ id: 'm3', title: 'Treci', category: 'unknown', year: undefined }]);
    render(<MuseumAdminPage embedded />);
    // oba polja — (kategorija '' daje —, godina undefined daje —)
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });
});
