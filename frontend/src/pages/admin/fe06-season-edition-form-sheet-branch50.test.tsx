import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SeasonEditionFormSheet } from './SeasonEditionFormSheet';

const state = vi.hoisted(() => ({
  competitions: undefined as unknown,
  clubs: undefined as unknown,
  addMutate: vi.fn(async () => ({})),
  updateMutate: vi.fn(async () => ({})),
  addPending: false,
  updatePending: false,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-season-admin', () => ({
  useAddSeasonCompetition: () => ({ mutateAsync: state.addMutate, isPending: state.addPending }),
  useUpdateSeasonCompetition: () => ({ mutateAsync: state.updateMutate, isPending: state.updatePending }),
}));
vi.mock('../../hooks', () => ({
  useCompetitions: () => ({ data: state.competitions }),
  useClubs: () => ({ data: state.clubs }),
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));
vi.mock('../../components/admin/SeasonClubPicker', () => ({
  SeasonClubPicker: ({ value }: { value: string[] }) => <div>picker:{value.join(',')}</div>,
}));
vi.mock('../../components/admin/EntitySelect', () => ({
  EntitySelect: ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { id: string; label: string }[] }) => (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('../../components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => <input {...props} />,
}));
vi.mock('../../components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) => (
    <button aria-label="switch" aria-pressed={checked} onClick={() => onCheckedChange(!checked)}>
      {checked ? 'on' : 'off'}
    </button>
  ),
}));
vi.mock('../../components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => (
    <button {...props}>{children}</button>
  ),
}));

describe('SeasonEditionFormSheet — branch50 (catalog/club fallback i save grane)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.competitions = undefined;
    state.clubs = undefined;
    state.addPending = false;
    state.updatePending = false;
  });

  it('catalog i clubs undefined fallback na [] (?? [])', () => {
    state.competitions = undefined as unknown;
    state.clubs = undefined as unknown;
    render(<SeasonEditionFormSheet open onOpenChange={vi.fn()} seasonId="s1" editEdition={null} />);
    expect(screen.getByText('Dodaj takmičenje')).toBeInTheDocument();
    expect(screen.getByLabelText('admin.seasonEdition.fromCatalog')).toBeInTheDocument();
  });

  it('editEdition sa participants fallback', () => {
    state.competitions = [{ id: 'c1', name: 'Liga' }] as unknown;
    state.clubs = [{ id: 'cl1', name: 'Klub' }] as unknown;
    const edit = { id: 'e1', competitionId: 'c1', competition: { name: 'Liga' }, participants: undefined } as never;
    render(<SeasonEditionFormSheet open onOpenChange={vi.fn()} seasonId="s1" editEdition={edit} />);
    expect(screen.getByText('Liga')).toBeInTheDocument();
    expect(screen.getByText('picker:')).toBeInTheDocument(); // clubIds fallback []
  });

  it('newName trim true prikazuje switch i save sa name', async () => {
    state.competitions = [{ id: 'c1', name: 'Kup' }] as unknown;
    state.clubs = [{ id: 'cl1', name: 'Klub' }] as unknown;
    render(<SeasonEditionFormSheet open onOpenChange={vi.fn()} seasonId="s1" editEdition={null} />);
    const input = screen.getByPlaceholderText('admin.seasonEdition.newCompetition') as HTMLInputElement;
    fireEvent.change(input, { target: { value: ' Nova liga ' } });
    expect(screen.getByLabelText('switch')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('switch'));
    expect(screen.getByLabelText('switch').getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByText('Dodaj'));
    await waitFor(() => expect(state.addMutate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Nova liga', isLeague: true })));
  });

  it('newName prazan koristi competitionId', async () => {
    state.competitions = [{ id: 'c2', name: 'Kup2' }] as unknown;
    state.clubs = [{ id: 'cl1', name: 'Klub' }] as unknown;
    render(<SeasonEditionFormSheet open onOpenChange={vi.fn()} seasonId="s1" editEdition={null} />);
    // ne upisuj newName, ostavi prazno -> competitionId je c2 (prvi u catalog)
    fireEvent.click(screen.getByText('Dodaj'));
    await waitFor(() => expect(state.addMutate).toHaveBeenCalledWith(expect.objectContaining({ competitionId: 'c2' })));
  });

  it('edit save poziva update', async () => {
    state.competitions = [{ id: 'c1', name: 'L' }] as unknown;
    state.clubs = [{ id: 'cl1', name: 'K' }] as unknown;
    const edit = { id: 'e1', competitionId: 'c1', competition: { name: 'L' }, participants: [{ clubId: 'cl1' }] } as never;
    render(<SeasonEditionFormSheet open onOpenChange={vi.fn()} seasonId="s1" editEdition={edit} />);
    fireEvent.click(screen.getByText('Spremi'));
    await waitFor(() => expect(state.updateMutate).toHaveBeenCalledWith(expect.objectContaining({ editionId: 'e1', clubIds: ['cl1'] })));
  });

  it('save greška prikazuje error', async () => {
    state.competitions = [{ id: 'c1', name: 'L' }] as unknown;
    state.clubs = [] as unknown;
    state.addMutate.mockRejectedValueOnce(new Error('boom'));
    render(<SeasonEditionFormSheet open onOpenChange={vi.fn()} seasonId="s1" editEdition={null} />);
    fireEvent.click(screen.getByText('Dodaj'));
    await waitFor(() => expect(screen.getByText('boom')).toBeInTheDocument());
  });

  it('disabled kada pending', () => {
    state.addPending = true;
    state.competitions = [{ id: 'c1', name: 'L' }] as unknown;
    state.clubs = [] as unknown;
    render(<SeasonEditionFormSheet open onOpenChange={vi.fn()} seasonId="s1" editEdition={null} />);
    expect(screen.getByText('Dodaj').closest('button')!).toBeDisabled();
  });
});
