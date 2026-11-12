import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayersAdminFormSheet } from './PlayersAdminFormSheet';

const state = vi.hoisted(() => ({
  clubs: [] as Array<{ id: string; name: string; isOwnClub?: boolean }>,
  ownClub: { id: 'own1' } as { id: string } | null,
  create: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  update: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  onOpenChange: vi.fn(),
  sheet: {} as { open: boolean; title: string },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useClubs: () => ({ data: state.clubs }),
  useOwnClub: () => ({ data: state.ownClub }),
}));
vi.mock('../../hooks/use-competition-admin', () => ({
  useCreatePlayer: () => state.create,
  useUpdatePlayer: () => state.update,
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ title, children }: { title: string; children: React.ReactNode }) => {
    state.sheet = { open: true, title };
    return <div><h2>{title}</h2>{children}</div>;
  },
}));
vi.mock('../../components/admin/EntitySelect', () => ({
  EntitySelect: ({ label, options, value, onChange }: {
    label: string; options: Array<{ id: string; label: string }>;
    value: string; onChange: (v: string) => void;
  }) => (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  ),
}));
vi.mock('../../components/admin/MediaPicker', () => ({
  MediaPicker: ({ value, onChange, label }: { value: string; onChange: (p: string) => void; label: string }) => (
    <div>
      <span>media:{label}:{value || '-'}</span>
      <button onClick={() => onChange('photos/p1.jpg')}>odaberi-foto</button>
    </div>
  ),
}));
vi.mock('../../components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) => (
    <button role="switch" aria-checked={checked} onClick={() => onCheckedChange(!checked)}>
      switch:{String(checked)}
    </button>
  ),
}));

const player = (over: Record<string, unknown> = {}) => ({
  id: 'pl1', firstName: 'Amar', lastName: 'Agić', clubId: 'c1', position: 'FWD',
  number: 9, photoPath: 'photos/a.jpg', bio: 'Kapiten', isActive: false,
  ...over,
}) as never;

const renderSheet = (props: Partial<Parameters<typeof PlayersAdminFormSheet>[0]> = {}) =>
  render(
    <PlayersAdminFormSheet open onOpenChange={state.onOpenChange} edit={null} {...props} />,
  );

beforeEach(() => {
  state.clubs = [
    { id: 'c1', name: 'FK Graca', isOwnClub: true },
    { id: 'c2', name: 'FK Rival' },
  ];
  state.ownClub = { id: 'c1' };
  state.create = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.onOpenChange = vi.fn();
  state.sheet = {} as { open: boolean; title: string };
});

describe('PlayersAdminFormSheet — kreiranje', () => {
  it('bez imena i prezimena dugme je onemogućeno', () => {
    renderSheet();
    expect(screen.getByRole('button', { name: 'actions.create' })).toBeDisabled();
  });

  it('novi igrač preuzima vlastiti klub i označava ga u listi', () => {
    renderSheet();
    expect(state.sheet.title).toBe('admin.playerForm.create');
    expect(screen.getByLabelText('admin.playerForm.club')).toHaveValue('c1');
    expect(screen.getByRole('option', { name: 'FK Graca (naš)' })).toBeInTheDocument();
  });

  it('bez vlastitog kluba polje kluba ostaje prazno', () => {
    state.ownClub = null;
    renderSheet();
    expect(screen.getByLabelText('admin.playerForm.club')).toHaveValue('');
  });

  it('kreiranje šalje sva polja i zatvara sheet', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.playerForm.firstName'), 'Emir');
    await user.type(screen.getByPlaceholderText('admin.playerForm.lastName'), 'Begić');
    const [clubSelect, positionSelect] = screen.getAllByRole('combobox');
    await user.selectOptions(clubSelect, 'c2');
    await user.selectOptions(positionSelect, 'DEF');
    await user.type(screen.getByPlaceholderText('admin.playerForm.shirt'), '7');
    await user.click(screen.getByRole('button', { name: 'odaberi-foto' }));
    await user.type(screen.getByPlaceholderText('admin.playerForm.bio'), 'Novi igrač');
    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Emir', lastName: 'Begić', clubId: 'c2', position: 'DEF', number: 7,
      photoPath: 'photos/p1.jpg', bio: 'Novi igrač', isActive: false,
    })));
    expect(state.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('prazna opcionalna polja se ne šalju', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.playerForm.firstName'), 'Emir');
    await user.type(screen.getByPlaceholderText('admin.playerForm.lastName'), 'Begić');
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith({
      firstName: 'Emir', lastName: 'Begić', clubId: 'c1', position: 'MID',
      number: undefined, photoPath: undefined, bio: undefined, isActive: true,
    }));
  });

  it('fiksirani klub skriva izbor kluba i šalje ga umjesto odabranog', async () => {
    const user = userEvent.setup();
    renderSheet({ clubId: 'c9' });
    expect(screen.queryByLabelText('admin.playerForm.club')).toBeNull();
    await user.type(screen.getByPlaceholderText('admin.playerForm.firstName'), 'Emir');
    await user.type(screen.getByPlaceholderText('admin.playerForm.lastName'), 'Begić');
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ clubId: 'c9' }),
    ));
  });

  it('greška spremanja ostaje u sheetu', async () => {
    const user = userEvent.setup();
    state.create = { ...state.create, mutateAsync: vi.fn(async () => { throw new Error('x'); }) };
    const { rerender } = renderSheet();
    await user.type(screen.getByPlaceholderText('admin.playerForm.firstName'), 'Emir');
    await user.type(screen.getByPlaceholderText('admin.playerForm.lastName'), 'Begić');
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() => expect(screen.getByText('Spremanje nije uspjelo. Pokušajte ponovo.')).toBeInTheDocument());
    expect(state.onOpenChange).not.toHaveBeenCalled();
    rerender(<PlayersAdminFormSheet open={false} onOpenChange={state.onOpenChange} edit={null} />);
    rerender(<PlayersAdminFormSheet open onOpenChange={state.onOpenChange} edit={null} />);
    expect(screen.queryByText('Spremanje nije uspjelo. Pokušajte ponovo.')).toBeNull();
  });
});

describe('PlayersAdminFormSheet — izmjena', () => {
  it('postojeći igrač puni sva polja', () => {
    renderSheet({ edit: player() });
    expect(state.sheet.title).toBe('admin.playerForm.edit');
    expect(screen.getByDisplayValue('Amar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Agić')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kapiten')).toBeInTheDocument();
    expect(screen.getByText('media:admin.playerForm.photo:photos/a.jpg')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByLabelText('admin.playerForm.club')).toHaveValue('c1');
  });

  it('igrač bez broja i fotografije ostavlja polja prazna', () => {
    renderSheet({ edit: player({ number: null, photoPath: null, bio: null, position: null }) });
    expect(screen.queryByDisplayValue('9')).toBeNull();
    expect(screen.getByText('media:admin.playerForm.photo:-')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('izmjena šalje ID igrača i zatvara sheet', async () => {
    const user = userEvent.setup();
    renderSheet({ edit: player() });
    const first = screen.getByDisplayValue('Amar');
    await user.clear(first);
    await user.type(first, 'Amar2');
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      id: 'pl1', firstName: 'Amar2', lastName: 'Agić', number: 9, isActive: false,
    })));
    expect(state.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('dok je mutacija u toku dugme je onemogućeno', () => {
    state.update = { ...state.update, isPending: true };
    renderSheet({ edit: player() });
    expect(screen.getByRole('button', { name: 'actions.save' })).toBeDisabled();
  });
});
