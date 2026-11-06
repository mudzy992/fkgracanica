import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { TicketingAdminPage } from './TicketingAdminPage';

vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, actions, children }: {
    title: string; actions?: ReactNode; children: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <div data-testid="actions">{actions}</div>
      {children}
    </div>
  ),
}));

const state = vi.hoisted(() => ({
  permissions: [] as string[],
  home: '',
  seo: [] as (string | undefined)[],
  locationState: null as unknown,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../lib/staff-home', () => ({ resolveStaffHome: () => state.home }));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('./homes/AdminHome', () => ({ AdminHome: () => <div data-testid="admin-home" /> }));
vi.mock('./homes/CommentatorHome', () => ({ CommentatorHome: () => <div data-testid="commentator-home" /> }));
vi.mock('./homes/ModeratorHome', () => ({ ModeratorHome: () => <div data-testid="moderator-home" /> }));
vi.mock('./homes/WriterHome', () => ({ WriterHome: () => <div data-testid="writer-home" /> }));
vi.mock('./ticketing/TicketingOrdersTab', () => ({ TicketingOrdersTab: () => <div data-testid="tab-orders" /> }));
vi.mock('./ticketing/TicketingSettingsTab', () => ({
  TicketingSettingsTab: () => <div data-testid="tab-settings" />,
}));
vi.mock('./ticketing/TicketingPaymentsTab', () => ({
  TicketingPaymentsTab: () => <div data-testid="tab-payments" />,
}));
vi.mock('./ticketing/TicketingSeasonTab', () => ({ TicketingSeasonTab: () => <div data-testid="tab-season" /> }));

describe('DashboardPage', () => {
  beforeEach(() => {
    state.home = 'admin';
  });

  it.each([
    ['admin', 'admin-home'],
    ['moderator', 'moderator-home'],
    ['commentator', 'commentator-home'],
    ['writer', 'writer-home'],
  ])('vrsta doma %s renderuje %s', (kind, testId) => {
    state.home = kind;
    render(<DashboardPage />);
    expect(screen.getByTestId(testId)).toBeTruthy();
  });
});

describe('TicketingAdminPage', () => {
  beforeEach(() => {
    state.seo = [];
    state.locationState = null;
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <TicketingAdminPage />
      </MemoryRouter>,
    );

  it('postavlja naslov, SEO i podrazumijevani tab narudžbi', () => {
    renderPage();
    expect(state.seo).toContain('admin.ticketing');
    expect(screen.getByRole('heading', { name: 'admin.ticketing' })).toBeTruthy();
    expect(screen.getByTestId('tab-orders')).toBeTruthy();
    expect(screen.queryByTestId('tab-season')).toBeNull();
  });

  it('prikazuje četiri taba', () => {
    renderPage();
    ['Narudžbe', 'Sezona', 'Postavke', 'Online plaćanje'].forEach((label) =>
      expect(screen.getByRole('button', { name: label })).toBeTruthy(),
    );
  });

  it('klik na tabove mijenja sadržaj', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Sezona' }));
    expect(screen.getByTestId('tab-season')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Postavke' }));
    expect(screen.getByTestId('tab-settings')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Online plaćanje' }));
    expect(screen.getByTestId('tab-payments')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Narudžbe' }));
    expect(screen.getByTestId('tab-orders')).toBeTruthy();
  });
});
