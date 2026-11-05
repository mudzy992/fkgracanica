import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminLayout } from './AdminLayout';
import type { AdminNavGroup } from './admin-nav-groups';

const state = vi.hoisted(() => ({
  user: undefined as unknown,
  logout: vi.fn(),
  publicSettings: undefined as unknown,
  privateSettings: undefined as unknown,
  groups: [] as AdminNavGroup[],
  filterCalls: [] as Array<[unknown, unknown]>,
  navProps: {} as Record<string, unknown>,
  palette: {} as Record<string, unknown>,
  resetKeys: [] as unknown[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: state.user, logout: state.logout }),
}));
vi.mock('../../hooks', () => ({
  usePublicSettings: () => ({ data: state.publicSettings }),
  usePrivateSettings: () => ({ data: state.privateSettings }),
}));
vi.mock('../../lib/module-settings-rules', () => ({
  isModuleEnabled: (settings: Record<string, unknown>, key: string) => settings[key] !== false,
}));
vi.mock('../../lib/admin-module-map', () => ({
  resolveAdminModuleKey: (to: string) => (to === '/admin/media' ? 'media' : null),
}));
vi.mock('./admin-nav-groups', () => ({
  filterNavLeaves: (permissions: unknown, isVisible: (item: unknown) => boolean) => {
    state.filterCalls.push([permissions, typeof isVisible]);
    return state.groups;
  },
}));
vi.mock('../notifications/NotificationBell', () => ({
  NotificationBell: ({ admin }: { admin?: boolean }) => <span>zvono:{String(!!admin)}</span>,
}));
vi.mock('../common/ErrorBoundary', () => ({
  ErrorBoundary: ({ children, resetKey }: { children: React.ReactNode; resetKey: string }) => {
    state.resetKeys.push(resetKey);
    return <div>granica:{children}</div>;
  },
}));
vi.mock('../common/RouteLoading', () => ({ RouteLoading: () => <p>ucitavanje-rute</p> }));
vi.mock('../ui/sheet', () => ({
  Sheet: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="sheet">{children}</div> : null,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('./AdminSidebarNav', () => ({
  AdminSidebarNav: (props: Record<string, unknown>) => {
    state.navProps = props;
    return (
      <div>
        nav:{String((props.groups as unknown[]).length)}:{String(!!props.onNavigate)}
        <button onClick={() => (props.onNavigate as (() => void) | undefined)?.()}>idi</button>
      </div>
    );
  },
}));
vi.mock('./AdminShowcaseBanner', () => ({ AdminShowcaseBanner: () => <div>banner</div> }));
vi.mock('./AdminCommandPalette', () => ({
  AdminCommandPalette: (props: Record<string, unknown>) => {
    state.palette = props;
    return (
      <div>
        paleta:{String(props.open)}
        <button onClick={() => (props.onOpenChange as (o: boolean) => void)(true)}>otvori-paletu</button>
      </div>
    );
  },
}));

const group = { key: 'main', label: 'Glavno', leaves: [] } as unknown as AdminNavGroup;

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={['/admin/media']}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="media" element={<p>sadržaj stranice</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  state.user = { firstName: 'Amar', lastName: 'Hodžić', permissions: ['news.manage'] };
  state.logout.mockReset();
  state.publicSettings = { media: true };
  state.privateSettings = { news: false };
  state.groups = [group];
  state.filterCalls = [];
  state.navProps = {};
  state.palette = {};
  state.resetKeys = [];
});

describe('AdminLayout — ljuska i navigacija', () => {
  it('prikazuje brend, ime korisnika, zvono i filtrirane grupe', () => {
    renderLayout();
    expect(screen.getAllByText('FK Admin').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Amar Hodžić')).toBeInTheDocument();
    expect(screen.getAllByText('zvono:true')).toHaveLength(2);
    expect(screen.getByText(/nav:1:false/)).toBeInTheDocument();
  });

  it('bez korisnika nema imena, ali nav dobija dozvole', () => {
    state.user = { permissions: [] };
    renderLayout();
    expect(screen.queryByText(/Amar/)).toBeNull();
    expect(state.filterCalls[0][0]).toEqual([]);
  });

  it('spaja javne i privatne postavke i poštuje module', () => {
    renderLayout();
    expect(state.filterCalls).toHaveLength(1);
    expect(state.filterCalls[0][1]).toBe('function');
  });

  it('prikazuje sadržaj rute unutar granice greške', () => {
    renderLayout();
    expect(screen.getByText('sadržaj stranice')).toBeInTheDocument();
    expect(screen.getByText(/granica:/)).toBeInTheDocument();
    expect(state.resetKeys).toEqual(['/admin/media']);
  });

  it('dugme pretrage otvara paletu sa grupama', async () => {
    const user = userEvent.setup();
    renderLayout();
    expect(screen.getByText('paleta:false')).toBeInTheDocument();
    await user.click(screen.getByText(/admin.cmdkPlaceholder/).closest('button') as HTMLElement);
    expect(screen.getByText('paleta:true')).toBeInTheDocument();
    expect(state.palette.groups).toEqual([group]);
  });
});

describe('AdminLayout — pokretni meni', () => {
  it('dugme menija otvara sheet sa navigacijom i zatvara se klikom', async () => {
    const user = userEvent.setup();
    renderLayout();
    expect(screen.queryByTestId('sheet')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'admin.openMenu' }));
    expect(screen.getByTestId('sheet')).toBeInTheDocument();
    expect(screen.getByText(/nav:1:true/)).toBeInTheDocument();
    // dva rendera nav-a (bočna traka + sheet) → klik na onaj iz sheet-a
    await user.click(screen.getAllByRole('button', { name: 'idi' })[1]);
    expect(screen.queryByTestId('sheet')).toBeNull();
  });

  it('ikona pretrage u zaglavlju otvara paletu', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'admin.cmdkTitle' }));
    expect(screen.getByText('paleta:true')).toBeInTheDocument();
  });
});

describe('AdminLayout — odjava', () => {
  it('odjava iz bočne trake zove logout', async () => {
    const user = userEvent.setup();
    renderLayout();
    const buttons = screen.getAllByRole('button', { name: 'actions.logout' });
    expect(buttons).toHaveLength(1);
    await user.click(buttons[0]);
    expect(state.logout).toHaveBeenCalledTimes(1);
  });

  it('odjava iz pokretnog menija takođe zove logout', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'admin.openMenu' }));
    const buttons = screen.getAllByRole('button', { name: 'actions.logout' });
    expect(buttons).toHaveLength(2);
    await user.click(buttons[1]);
    expect(state.logout).toHaveBeenCalledTimes(1);
  });
});
