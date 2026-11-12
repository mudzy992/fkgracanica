import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SeasonEditionFormSheet } from './SeasonEditionFormSheet';
import { formSheetState } from '../../test/doubles/form-sheet-doubles';

const state = vi.hoisted(() => ({
  competitions: [] as Array<{ id: string; name: string; isLeague?: boolean }>,
  clubs: [] as Array<{ id: string; name: string }>,
  addEdition: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  updateEdition: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  onOpenChange: vi.fn(),
  picker: {} as { clubs: unknown[]; value: string[]; onChange: (ids: string[]) => void },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useCompetitions: () => ({ data: state.competitions }),
  useClubs: () => ({ data: state.clubs }),
}));
vi.mock('../../hooks/use-season-admin', () => ({
  useAddSeasonCompetition: () => state.addEdition,
  useUpdateSeasonCompetition: () => state.updateEdition,
}));
vi.mock('../../components/admin/AdminFormSheet', async () => ({
  AdminFormSheet: (await import('../../test/doubles/form-sheet-doubles')).AdminFormSheetDouble,
}));
vi.mock('../../components/admin/EntitySelect', async () => ({
  EntitySelect: (await import('../../test/doubles/form-sheet-doubles')).EntitySelectDouble,
}));
vi.mock('../../components/ui/switch', async () => ({
  Switch: (await import('../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));
vi.mock('../../components/admin/SeasonClubPicker', () => ({
  SeasonClubPicker: (props: typeof state.picker) => {
    state.picker = props;
    return (
      <div>
        <span>picker:{props.value.join(',') || '-'}</span>
        <button onClick={() => props.onChange([...props.value, 'cl3'])}>dodaj-klub</button>
      </div>
    );
  },
}));

const edition = (over: Record<string, unknown> = {}) => ({
  id: 'ed1', competitionId: 'cp2', competition: { name: 'Kup BiH', isLeague: false },
  participants: [{ clubId: 'cl1' }],
  ...over,
});

const renderSheet = (editEdition: Record<string, unknown> | null = null) =>
  render(
    <SeasonEditionFormSheet
      open
      onOpenChange={state.onOpenChange}
      seasonId="se1"
      editEdition={editEdition as never}
    />,
  );

beforeEach(() => {
  state.competitions = [{ id: 'cp1', name: 'Kantonalna liga', isLeague: true }, { id: 'cp2', name: 'Kup BiH' }];
  state.clubs = [{ id: 'cl1', name: 'FK Graca' }, { id: 'cl2', name: 'FK Rival' }];
  state.addEdition = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.updateEdition = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.onOpenChange = vi.fn();
  state.picker = {} as typeof state.picker;
});

describe('SeasonEditionFormSheet — dodavanje', () => {
  it('novo takmičenje bira prvi katalog i sve klubove, bez prekidača lige', () => {
    renderSheet();
    expect(formSheetState.title).toBe('Dodaj takmičenje');
    expect(screen.getByLabelText('admin.seasonEdition.fromCatalog')).toHaveValue('cp1');
    expect(screen.getByText('picker:cl1,cl2')).toBeInTheDocument();
    expect(screen.queryByRole('switch')).toBeNull();
    expect(screen.getByRole('button', { name: 'Dodaj' })).toBeEnabled();
  });

  it('prekidač lige se pojavljuje samo kad je upisan novi naziv', async () => {
    const user = userEvent.setup();
    renderSheet();
    expect(screen.queryByRole('switch')).toBeNull();
    await user.type(screen.getByPlaceholderText('admin.seasonEdition.newCompetition'), 'Liga kantona');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    await user.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('dodavanje iz kataloga šalje competitionId i odabrane klubove', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.selectOptions(screen.getByLabelText('admin.seasonEdition.fromCatalog'), 'cp2');
    await user.click(screen.getByRole('button', { name: 'dodaj-klub' }));
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));
    await waitFor(() => expect(state.addEdition.mutateAsync).toHaveBeenCalledWith({
      seasonId: 'se1', competitionId: 'cp2', clubIds: ['cl1', 'cl2', 'cl3'],
    }));
    expect(state.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('novi naziv ima prednost i šalje oznaku lige', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.seasonEdition.newCompetition'), '  Novi kup  ');
    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));
    await waitFor(() => expect(state.addEdition.mutateAsync).toHaveBeenCalledWith({
      seasonId: 'se1', name: 'Novi kup', isLeague: true, clubIds: ['cl1', 'cl2'],
    }));
  });

  it('greška servera se prikazuje, a nepoznata greška daje generičku poruku', async () => {
    const user = userEvent.setup();
    state.addEdition = { ...state.addEdition, mutateAsync: vi.fn(async () => { throw new Error('Već postoji'); }) };
    const view = renderSheet();
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));
    await waitFor(() => expect(screen.getByText('Već postoji')).toBeInTheDocument());
    view.unmount();
    state.addEdition = { ...state.addEdition, mutateAsync: vi.fn(async () => { throw 'pad'; }) };
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));
    await waitFor(() => expect(screen.getByText('Spremanje nije uspjelo.')).toBeInTheDocument());
  });

  it('prazan katalog daje prazan izbor i dopušta unos novog naziva', () => {
    state.competitions = [];
    renderSheet();
    expect(screen.getByLabelText('admin.seasonEdition.fromCatalog')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Dodaj' })).toBeEnabled();
  });
});

describe('SeasonEditionFormSheet — izmjena učesnika', () => {
  it('prikazuje naziv takmičenja i postojeće učesnike bez kataloga', () => {
    renderSheet(edition());
    expect(formSheetState.title).toBe('Učesnici takmičenja');
    expect(screen.getByText('Kup BiH')).toBeInTheDocument();
    expect(screen.queryByLabelText('admin.seasonEdition.fromCatalog')).toBeNull();
    expect(screen.getByText('picker:cl1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Spremi' })).toBeEnabled();
  });

  it('spremanje šalje ID edicije i nove klubove', async () => {
    const user = userEvent.setup();
    renderSheet(edition());
    await user.click(screen.getByRole('button', { name: 'dodaj-klub' }));
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(state.updateEdition.mutateAsync).toHaveBeenCalledWith({
      seasonId: 'se1', editionId: 'ed1', clubIds: ['cl1', 'cl3'],
    }));
    expect(state.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('edicija bez učesnika i naziva radi sa praznom listom', () => {
    renderSheet(edition({ participants: undefined, competition: undefined }));
    expect(screen.getByText('picker:-')).toBeInTheDocument();
  });

  it('dok je mutacija u toku dugme je onemogućeno', () => {
    state.updateEdition = { ...state.updateEdition, isPending: true };
    renderSheet(edition());
    expect(screen.getByRole('button', { name: 'Spremi' })).toBeDisabled();
  });
});
describe('SeasonEditionFormSheet — zatvoren', () => {
  it('kad je open false ne popunjava polja iz editacije', () => {
    render(
      <SeasonEditionFormSheet
        open={false}
        onOpenChange={state.onOpenChange}
        seasonId="se1"
        editEdition={{ id: 'e1', name: 'Posebna liga', competitionId: 'c1', isLeague: true } as never}
      />,
    );
    expect(screen.queryByDisplayValue('Posebna liga')).toBeNull();
  });
});
