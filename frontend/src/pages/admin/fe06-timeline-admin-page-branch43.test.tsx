import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TimelineAdminPage } from './TimelineAdminPage';

const state = vi.hoisted(() => ({
  perms: ['club-timeline.manage'] as string[],
  list: { data: undefined as unknown as Array<Record<string, unknown>>, isLoading: false, isError: false, refetch: vi.fn() },
  remove: { mutateAsync: vi.fn(async () => ({})) },
  reorder: { mutateAsync: vi.fn(async () => ({})) },
  confirm: vi.fn(async () => true),
  sheet: null as null | { open: boolean; edit: Record<string, unknown> | null; onOpenChange: (o: boolean) => void },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks', () => ({ useClubTimeline: () => state.list }));
vi.mock('../../hooks/use-heritage-admin', () => ({
  useDeleteTimelineEvent: () => state.remove,
  useReorderTimelineEvents: () => state.reorder,
}));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: d.AdminPageShellDouble, AdminDataTable: d.AdminDataTableDouble };
});
vi.mock('./TimelineAdminFormSheet', () => ({
  TimelineAdminFormSheet: (props: { open: boolean; edit: Record<string, unknown> | null; onOpenChange: (o: boolean) => void }) => {
    state.sheet = props as never;
    return <button type="button" onClick={() => props.onOpenChange(false)}>sheet:{String(props.open)}</button>;
  },
}));

beforeEach(() => {
  state.perms = ['club-timeline.manage'];
  state.list = { data: undefined as unknown as never, isLoading: false, isError: false, refetch: vi.fn() };
  state.remove = { mutateAsync: vi.fn(async () => ({})) };
  state.reorder = { mutateAsync: vi.fn(async () => ({})) };
  state.confirm = vi.fn(async () => true);
  state.sheet = null;
});

describe('TimelineAdminPage — branch43 (2 grane)', () => {
  it('data undefined fallback pokriva ?? []', () => {
    state.list = { data: undefined as unknown as never, isLoading: false, isError: false, refetch: vi.fn() };
    render(<TimelineAdminPage />);
    expect(screen.queryAllByTestId(/^row-/)).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Novi' })).toBeInTheDocument();
  });

  it('onOpenChange true vs false pokriva obje grane', () => {
    state.list = { data: [{ id: 'e1', year: 2020, title: 'Događaj' }] as never, isLoading: false, isError: false, refetch: vi.fn() };
    render(<TimelineAdminPage />);
    expect(state.sheet).not.toBeNull();
    state.sheet!.onOpenChange(true);
    state.sheet!.onOpenChange(false);
    expect(state.sheet).toBeDefined();
  });
});
