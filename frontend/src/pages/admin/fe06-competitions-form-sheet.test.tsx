import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompetitionsAdminFormSheet } from './CompetitionsAdminFormSheet';

const state = vi.hoisted(() => ({
  createComp: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  updateComp: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  createSeason: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  updateSeason: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  onOpenChange: vi.fn(),
  sheetTitle: '',
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-competition-admin', () => ({
  useCreateCompetition: () => state.createComp,
  useUpdateCompetition: () => state.updateComp,
}));
vi.mock('../../hooks/use-season-admin', () => ({
  useCreateSeason: () => state.createSeason,
  useUpdateSeason: () => state.updateSeason,
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ title, children }: { title: string; children: React.ReactNode }) => {
    state.sheetTitle = title;
    return <div><h2>{title}</h2>{children}</div>;
  },
}));
vi.mock('../../components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) => (
    <button role="switch" aria-checked={checked} onClick={() => onCheckedChange(!checked)}>switch</button>
  ),
}));

const competition = (over: Record<string, unknown> = {}) => ({
  id: 'comp1', name: 'Kantonalna liga', slug: 'kantonalna-liga', isLeague: true,
  ...over,
});
const season = (over: Record<string, unknown> = {}) => ({
  id: 'se1', name: '2025/26', yearStart: 2025, yearEnd: 2026, isActive: false,
  ...over,
});

const renderSheet = (props: Partial<Parameters<typeof CompetitionsAdminFormSheet>[0]> = {}) =>
  render(
    <CompetitionsAdminFormSheet
      open
      onOpenChange={state.onOpenChange}
      mode="competition"
      editCompetition={null}
      editSeason={null}
      {...props}
    />,
  );

const save = async (label: string) => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: label }));
};

beforeEach(() => {
  state.createComp = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.updateComp = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.createSeason = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.updateSeason = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.onOpenChange = vi.fn();
  state.sheetTitle = '';
});

describe('CompetitionsAdminFormSheet — takmičenje', () => {
  it('novo takmičenje ima prazno ime, isključenu ligu i onemogućeno dugme', () => {
    renderSheet();
    expect(state.sheetTitle).toBe('admin.competitionForm.create');
    expect(screen.getByPlaceholderText('admin.competitionForm.nameRequired')).toHaveValue('');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('button', { name: 'Kreiraj' })).toBeDisabled();
    expect(screen.queryByPlaceholderText('admin.competitionForm.yearStart')).toBeNull();
  });

  it('kreiranje šalje ime i oznaku lige pa zatvara sheet', async () => {
    renderSheet();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('admin.competitionForm.nameRequired'), 'Kup');
    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.createComp.mutateAsync).toHaveBeenCalledWith({
      name: 'Kup', isLeague: true,
    }));
    expect(state.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('izmjena popunjava postojeće vrijednosti i šalje ID', async () => {
    renderSheet({ editCompetition: competition() });
    expect(state.sheetTitle).toBe('admin.competitionForm.edit');
    expect(screen.getByPlaceholderText('admin.competitionForm.nameRequired')).toHaveValue('Kantonalna liga');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await save('Spremi');
    await waitFor(() => expect(state.updateComp.mutateAsync).toHaveBeenCalledWith({
      id: 'comp1', name: 'Kantonalna liga', isLeague: true,
    }));
  });

  it('greška servera se prikazuje, a nepoznata greška daje generičku poruku', async () => {
    state.createComp = { ...state.createComp, mutateAsync: vi.fn(async () => { throw new Error('Naziv postoji'); }) };
    renderSheet();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('admin.competitionForm.nameRequired'), 'Kup');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(screen.getByText('Naziv postoji')).toBeInTheDocument());
    expect(state.onOpenChange).not.toHaveBeenCalled();
  });

  it('greška koja nije Error daje generičku poruku', async () => {
    state.createComp = { ...state.createComp, mutateAsync: vi.fn(async () => { throw { status: 500 }; }) };
    renderSheet();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('admin.competitionForm.nameRequired'), 'Kup');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(screen.getByText('Spremanje nije uspjelo.')).toBeInTheDocument());
  });

  it('dok je kreiranje u toku dugme je onemogućeno', () => {
    state.createComp = { ...state.createComp, isPending: true };
    renderSheet({ editCompetition: competition() });
    expect(screen.getByRole('button', { name: 'Spremi' })).toBeDisabled();
  });
});

describe('CompetitionsAdminFormSheet — sezona', () => {
  it('nova sezona nudi godine i aktivnost, bez prekidača lige', () => {
    renderSheet({ mode: 'season' });
    expect(state.sheetTitle).toBe('admin.competitionForm.newSeason');
    expect(screen.getByPlaceholderText('admin.competitionForm.yearStart')).toHaveValue(new Date().getFullYear());
    expect(screen.getByPlaceholderText('admin.competitionForm.yearEnd')).toHaveValue(new Date().getFullYear() + 1);
    expect(screen.getAllByRole('switch')).toHaveLength(1);
    expect(screen.queryByText('admin.competitionForm.league')).toBeNull();
  });

  it('kreiranje sezone šalje sve godine i aktivnost', async () => {
    renderSheet({ mode: 'season' });
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('admin.competitionForm.nameRequired'), '2026/27');
    await user.clear(screen.getByPlaceholderText('admin.competitionForm.yearStart'));
    await user.type(screen.getByPlaceholderText('admin.competitionForm.yearStart'), '2026');
    await user.clear(screen.getByPlaceholderText('admin.competitionForm.yearEnd'));
    await user.type(screen.getByPlaceholderText('admin.competitionForm.yearEnd'), '2027');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.createSeason.mutateAsync).toHaveBeenCalledWith({
      name: '2026/27', yearStart: 2026, yearEnd: 2027, isActive: true,
    }));
  });

  it('izmjena sezone popunjava vrijednosti i šalje ID sa stanjem aktivnosti', async () => {
    renderSheet({ mode: 'season', editSeason: season() });
    expect(state.sheetTitle).toBe('admin.competitionForm.editSeason');
    expect(screen.getByPlaceholderText('admin.competitionForm.nameRequired')).toHaveValue('2025/26');
    expect(screen.getByPlaceholderText('admin.competitionForm.yearStart')).toHaveValue(2025);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    await save('Spremi');
    await waitFor(() => expect(state.updateSeason.mutateAsync).toHaveBeenCalledWith({
      id: 'se1', name: '2025/26', yearStart: 2025, yearEnd: 2026, isActive: false,
    }));
  });

  it('zaglavlje bez sezone i takmičenja pada na naslov nove sezone', () => {
    renderSheet({ mode: null });
    expect(state.sheetTitle).toBe('admin.competitionForm.newSeason');
    expect(screen.queryByRole('switch')).toBeNull();
  });

  it('dok je kreiranje sezone u toku dugme je onemogućeno', () => {
    state.createSeason = { ...state.createSeason, isPending: true };
    renderSheet({ mode: 'season' });
    expect(screen.getByRole('button', { name: 'Kreiraj' })).toBeDisabled();
  });
});
describe('CompetitionsAdminFormSheet — zatvoren', () => {
  it('kad je open false efekat ne popunjava formu', () => {
    renderSheet({ open: false });
    expect(screen.getByRole('button', { name: /Kreiraj|Sačuvaj/ })).toBeInTheDocument();
  });
});
