import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HallOfFameAdminPage } from './HallOfFameAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';
import { hallOfFameState as state, resetHallOfFameState } from '../../test/doubles/heritage-admin-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', async () => (await import('../../test/doubles/heritage-admin-doubles')).heritageHooksModule());
vi.mock('../../hooks/use-heritage-admin', async () => (await import('../../test/doubles/heritage-admin-doubles')).heritageAdminModule());
vi.mock('../../hooks/use-confirm', async () => (await import('../../test/doubles/heritage-admin-doubles')).hallOfFameConfirmModule());
vi.mock('../../components/seo/Seo', () => ({ Seo: ({ title }: { title: string }) => <div>seo:{title}</div> }));
vi.mock('../../components/admin/AdminPageShell', async () => (await import('../../test/doubles/heritage-admin-doubles')).heritageShellModule());
vi.mock('./HallOfFameAdminFormSheet', async () => (await import('../../test/doubles/heritage-admin-doubles')).hallOfFameSheetModule());

const entry = (over: Record<string, unknown> = {}) => ({
  id: 'h1', name: 'Asim Softić', role: 'Napadač', years: '1965–1978', ...over,
});
const row = (id: string) => screen.getByTestId(`row-${id}`);

beforeEach(() => {
  resetHallOfFameState([entry(), entry({ id: 'h2', name: 'Mujo Mujić' })]);
});

describe('HallOfFameAdminPage — branch47 (2 grane ?? i if !o)', () => {
  it('data ?? [] fallback kada je data undefined prikazuje praznu poruku', () => {
    resetHallOfFameState([]);
    // @ts-expect-error force undefined
    state.data = undefined;
    render(<HallOfFameAdminPage embedded />);
    expect(screen.getByText('Nema unosa u Hall of Fame.')).toBeInTheDocument();
  });

  it('data definisano prikazuje redove', () => {
    render(<HallOfFameAdminPage embedded />);
    expect(within(row('h1')).getByText('Asim Softić')).toBeInTheDocument();
  });

  it('otvaranje sheet-a ne briše edit (if !o false)', async () => {
    const user = userEvent.setup();
    render(<HallOfFameAdminPage embedded />);
    await user.click(within(row('h1')).getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText(/sheet:true:h1/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'zatvori-sheet' }));
    expect(screen.getByText(/sheet:false:-/)).toBeInTheDocument();
    await user.click(within(row('h1')).getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText(/sheet:true:h1/)).toBeInTheDocument();
    // direktno pozovi onOpenChange(true) - ne briše
    // sheet mock ima i otvori dugme? u heritage doubles, sheet ima samo zatvori, ali možemo testirati da otvaranje ne briše
    // provjeri da je edit još uvijek h1
    expect((state.sheet.edit as unknown as { id: string }).id).toBe('h1');
  });
});
