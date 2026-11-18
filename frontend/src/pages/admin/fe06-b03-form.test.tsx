import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubsAdminFormSheet } from './ClubsAdminFormSheet';
import { PlayersAdminFormSheet } from './PlayersAdminFormSheet';

const state = vi.hoisted(() => ({
  clubs: [{ id: 'c1', name: 'FK Graca', isOwnClub: true }, { id: 'c2', name: 'FK Rival' }] as Array<{ id: string; name: string; isOwnClub?: boolean }>,
  ownClub: { id: 'c1' } as { id: string } | null,
  createClub: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  updateClub: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  createPlayer: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  updatePlayer: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  onOpenChange: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string, opts?: Record<string, unknown>) => (opts?.defaultValue as string) ?? k }) }));
vi.mock('../../hooks', () => ({
  useClubs: () => ({ data: state.clubs }),
  useOwnClub: () => ({ data: state.ownClub }),
}));
vi.mock('../../hooks/use-competition-admin', () => ({
  useCreateClub: () => state.createClub,
  useUpdateClub: () => state.updateClub,
  useCreatePlayer: () => state.createPlayer,
  useUpdatePlayer: () => state.updatePlayer,
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ title, children }: { title: string; children: React.ReactNode }) => <div><h2>{title}</h2>{children}</div>,
}));
vi.mock('../../components/admin/MediaPicker', () => ({
  MediaPicker: ({ value, onChange, label }: { value: string; onChange: (p: string) => void; label: string }) => (
    <div><span>media:{label}:{value || '-'}</span><button onClick={() => onChange('media/novo.jpg')}>odaberi-medij</button></div>
  ),
}));
vi.mock('../../components/admin/EntitySelect', () => ({
  EntitySelect: ({ label, options, value, onChange }: { label: string; options: Array<{ id: string; label: string }>; value: string; onChange: (v: string) => void }) => (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  ),
}));
vi.mock('../../components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) => (
    <button role="switch" aria-checked={checked} onClick={() => onCheckedChange(!checked)}>switch:{String(checked)}</button>
  ),
}));

beforeEach(() => {
  state.clubs = [{ id: 'c1', name: 'FK Graca', isOwnClub: true }, { id: 'c2', name: 'FK Rival' }];
  state.ownClub = { id: 'c1' };
  state.createClub = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.updateClub = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.createPlayer = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.updatePlayer = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.onOpenChange = vi.fn();
});

describe('B03 ClubsAdminFormSheet — trim + role=alert', () => {
  it('razmaci u nazivu su disabled (trim)', async () => {
    render(<ClubsAdminFormSheet open onOpenChange={state.onOpenChange} edit={null} />);
    const input = screen.getByPlaceholderText('admin.club.nameRequired');
    await userEvent.type(input, '   ');
    expect(screen.getByRole('button', { name: 'Kreiraj' })).toBeDisabled();
    await userEvent.clear(input);
    await userEvent.type(input, 'FK Novi');
    expect(screen.getByRole('button', { name: 'Kreiraj' })).not.toBeDisabled();
  });

  it('feedback ima role=alert', async () => {
    const user = userEvent.setup();
    state.createClub = { mutateAsync: vi.fn(async () => { throw new Error('x'); }), isPending: false } as unknown as typeof state.createClub;
    render(<ClubsAdminFormSheet open onOpenChange={state.onOpenChange} edit={null} />);
    await user.type(screen.getByPlaceholderText('admin.club.nameRequired'), 'FK Novi');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('admin.common.saveFailed');
    expect(state.onOpenChange).not.toHaveBeenCalled();
  });

  it('trim šalje očišćeno', async () => {
    const user = userEvent.setup();
    render(<ClubsAdminFormSheet open onOpenChange={state.onOpenChange} edit={null} />);
    await user.type(screen.getByPlaceholderText('admin.club.nameRequired'), '  FK Novi  ');
    await user.type(screen.getByPlaceholderText('admin.club.city'), '  Mostar  ');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.createClub.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ name: 'FK Novi', city: 'Mostar' })));
  });

  it('pending disable', () => {
    state.createClub = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof state.createClub;
    render(<ClubsAdminFormSheet open onOpenChange={state.onOpenChange} edit={{ id: 'c1', name: 'FK', city: null, stadium: null, description: null, crestPath: null, isOwnClub: false } as never} />);
    expect(screen.getByRole('button', { name: 'Spremi' })).toBeDisabled();
  });
});

describe('B03 PlayersAdminFormSheet — trim + number 1-99 + role=alert', () => {
  it('razmaci u imenu/prezimenu su disabled', async () => {
    render(<PlayersAdminFormSheet open onOpenChange={state.onOpenChange} edit={null} />);
    const first = screen.getByPlaceholderText('admin.playerForm.firstName');
    const last = screen.getByPlaceholderText('admin.playerForm.lastName');
    await userEvent.type(first, '   ');
    await userEvent.type(last, '   ');
    expect(screen.getByRole('button', { name: 'actions.create' })).toBeDisabled();
    await userEvent.clear(first);
    await userEvent.type(first, 'Emir');
    // still disabled because last is spaces
    expect(screen.getByRole('button', { name: 'actions.create' })).toBeDisabled();
    await userEvent.clear(last);
    await userEvent.type(last, 'Begić');
    expect(screen.getByRole('button', { name: 'actions.create' })).not.toBeDisabled();
  });

  it('broj van 1-99 je disabled', async () => {
    const user = userEvent.setup();
    render(<PlayersAdminFormSheet open onOpenChange={state.onOpenChange} edit={null} />);
    await user.type(screen.getByPlaceholderText('admin.playerForm.firstName'), 'Emir');
    await user.type(screen.getByPlaceholderText('admin.playerForm.lastName'), 'Begić');
    const number = screen.getByPlaceholderText('admin.playerForm.shirt');
    await user.type(number, '0');
    expect(screen.getByRole('button', { name: 'actions.create' })).toBeDisabled();
    await user.clear(number);
    await user.type(number, '100');
    expect(screen.getByRole('button', { name: 'actions.create' })).toBeDisabled();
    await user.clear(number);
    await user.type(number, '99');
    expect(screen.getByRole('button', { name: 'actions.create' })).not.toBeDisabled();
    await user.clear(number);
    await user.type(number, '1');
    expect(screen.getByRole('button', { name: 'actions.create' })).not.toBeDisabled();
  });

  it('feedback role=alert i trim', async () => {
    const user = userEvent.setup();
    state.createPlayer = { mutateAsync: vi.fn(async () => { throw new Error('x'); }), isPending: false } as unknown as typeof state.createPlayer;
    render(<PlayersAdminFormSheet open onOpenChange={state.onOpenChange} edit={null} />);
    await user.type(screen.getByPlaceholderText('admin.playerForm.firstName'), '  Emir  ');
    await user.type(screen.getByPlaceholderText('admin.playerForm.lastName'), '  Begić  ');
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Spremanje nije uspjelo');
  });

  it('broj prazan je dozvoljen, trim šalje očišćeno', async () => {
    const user = userEvent.setup();
    render(<PlayersAdminFormSheet open onOpenChange={state.onOpenChange} edit={null} />);
    await user.type(screen.getByPlaceholderText('admin.playerForm.firstName'), '  Emir  ');
    await user.type(screen.getByPlaceholderText('admin.playerForm.lastName'), '  Begić  ');
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() => expect(state.createPlayer.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Emir', lastName: 'Begić', number: undefined })));
  });
});
