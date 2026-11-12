import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayersAdminPage } from './PlayersAdminPage';

const state = vi.hoisted(() => ({
  players: { data: undefined as unknown, isLoading: false, isError: false },
  refetch: vi.fn(),
  confirm: vi.fn(),
  remove: vi.fn(),
  sheet: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  usePlayers: () => ({ ...state.players, refetch: state.refetch }),
}));
vi.mock('../../hooks/use-competition-admin', () => ({
  useDeletePlayer: () => ({ mutateAsync: state.remove }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['players.manage'] } }) }));
vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));
vi.mock('../../lib/player-utils', () => ({
  playerPositionLabel: (position?: string | null) => (position ? `poz:${position}` : '—'),
}));
vi.mock('../../components/seo/Seo', () => ({ Seo: ({ title }: { title: string }) => <div>seo:{title}</div> }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const doubles = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: doubles.AdminPageShellDouble, AdminDataTable: doubles.AdminDataTableDouble };
});
vi.mock('./PlayersAdminFormSheet', () => ({
  PlayersAdminFormSheet: (props: Record<string, unknown>) => {
    state.sheet = props;
    return <div>sheet:{String(props.open)}</div>;
  },
}));

const player = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  firstName: 'Amar',
  lastName: 'Hodzic',
  position: 'GK',
  number: 1,
  isActive: true,
  club: { name: 'FK Gracanica' },
  ...over,
});

describe('PlayersAdminPage — branch49 (?? fallbackovi)', () => {
  beforeEach(() => {
    state.players = { data: [player(), player({ id: 'p2', number: null, position: null, club: null, isActive: false })], isLoading: false, isError: false };
    state.confirm.mockReset();
    state.confirm.mockResolvedValue(true);
    state.remove.mockReset();
  });

  it('number nullish i prazan klub daju — (pokriva ??)', () => {
    render(<PlayersAdminPage />);
    const r1 = screen.getByTestId('row-p1');
    expect(within(r1).getByText('1')).toBeInTheDocument();
    expect(within(r1).getByText('FK Gracanica')).toBeInTheDocument();
    const r2 = screen.getByTestId('row-p2');
    expect(within(r2).getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });

  it('data undefined fallback na [] (?? [])', () => {
    state.players = { data: undefined as unknown as never, isLoading: false, isError: false };
    render(<PlayersAdminPage />);
    expect(screen.queryByTestId('row-p1')).toBeNull();
    expect(screen.queryByText('prazno')).toBeNull(); // AdminDataTableDouble pokaze prazno ali ne moramo provjeravati tekst
  });

  it('data null fallback', () => {
    state.players = { data: null as unknown as never, isLoading: false, isError: false };
    render(<PlayersAdminPage />);
    expect(screen.queryByTestId('row-p1')).toBeNull();
  });

  it('position null i number undefined daju — preko playerPositionLabel', () => {
    state.players = {
      data: [player({ id: 'p3', number: undefined as unknown as number, position: undefined as unknown as string, club: { name: undefined as unknown as string } })],
      isLoading: false,
      isError: false,
    };
    render(<PlayersAdminPage />);
    const r = screen.getByTestId('row-p3');
    expect(within(r).getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });
});
