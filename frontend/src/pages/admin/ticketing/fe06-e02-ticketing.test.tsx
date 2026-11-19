import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketingAdminPage } from '../TicketingAdminPage';
import { TicketingOrdersTab } from './TicketingOrdersTab';
import { TicketingSettingsTab } from './TicketingSettingsTab';
import { TicketingPaymentsTab } from './TicketingPaymentsTab';
import { TicketingSeasonTab } from './TicketingSeasonTab';

const state = vi.hoisted(() => ({
  orders: {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  },
  ordersMutations: {
    confirmPayment: { mutateAsync: vi.fn(async () => ({})), isPending: false },
    confirmRefund: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  },
  // shared config for settings + payments
  config: undefined as unknown,
  configIsLoading: false,
  configIsError: false,
  configIsFetching: false,
  configUpdatedAt: 0,
  configRefetch: vi.fn(),
  save: vi.fn(async () => ({})),
  saving: false,
  // season
  seasonList: { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as Record<string, unknown>,
  issue: { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as Record<string, unknown>,
  canManage: true,
  confirm: vi.fn(async () => true),
  categoryChange: null as null | ((next: unknown[]) => void),
  backgroundValue: '',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) => {
      if (opts?.defaultValue) {
        let s = opts.defaultValue as string;
        if (opts.time) s = s.replace('{{time}}', opts.time as string);
        if (opts.from) s = s.replace('{{from}}', opts.from as string);
        if (opts.to) s = s.replace('{{to}}', opts.to as string);
        return s;
      }
      return k;
    },
  }),
}));



vi.mock('../../../hooks/use-ticketing-admin', () => ({
  useTicketingAdminOrders: () => state.orders,
  useConfirmTicketingPayment: () => state.ordersMutations.confirmPayment,
  useConfirmTicketingRefund: () => state.ordersMutations.confirmRefund,
  useTicketingAdminConfig: () => ({
    data: state.config,
    isLoading: state.configIsLoading,
    isError: state.configIsError,
    isFetching: state.configIsFetching,
    dataUpdatedAt: state.configUpdatedAt,
    refetch: state.configRefetch,
  }),
  useUpdateTicketingAdminConfig: () => ({ mutateAsync: state.save, isPending: state.saving }),
  useSeasonPassAdminList: () => state.seasonList,
  useIssueSeasonPass: () => state.issue,
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { permissions: state.canManage ? ['ticketing.manage'] : [] } }),
}));

vi.mock('../../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));

vi.mock('../../../components/ticketing/TicketingValidatePanel', () => ({
  TicketingValidatePanel: () => <div>validate-panel</div>,
}));

vi.mock('../TicketingOrderSheet', () => ({
  TicketingOrderSheet: () => <div>order-sheet</div>,
}));

vi.mock('../../../components/ui/switch', async () => ({
  Switch: (await import('../../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));

vi.mock('./TicketingCategoriesEditor', () => ({
  TicketingCategoriesEditor: ({ categories }: { categories: unknown[] }) => <div>kategorije:{categories.length}</div>,
}));

vi.mock('./TicketingCardBackgroundField', () => ({
  TicketingCardBackgroundField: ({ value }: { value: string }) => <div>pozadina:{value || '-'}</div>,
}));

vi.mock('./PaymentProviderHints', () => ({
  PaymentProviderHints: () => <div>hints</div>,
}));

vi.mock('./PaymentProviderCard', () => ({
  PaymentProviderCard: ({ id }: { id: string }) => <div>kartica:{id}</div>,
}));

vi.mock('../../../components/seo/Seo', () => ({
  Seo: () => null,
}));

// minimal AdminDataTable replacement to keep table tests simple — real table logic not needed for E-02 P2
vi.mock('../../../components/admin/AdminPageShell', async () => {
  const actual = (await vi.importActual('../../../components/admin/AdminPageShell')) as Record<string, unknown>;
  return {
    ...(actual as object),
    AdminDataTable: (await import('../../../test/doubles/ticketing-orders-doubles')).AdminDataTableDouble,
    AdminPageShell: ({ title, actions, children }: { title: string; actions: unknown; children: unknown }) => (
      <div>
        <h1>{title}</h1>
        <div>{actions as never}</div>
        <div>{children as never}</div>
      </div>
    ),
  };
});

const configBase = (over: Record<string, unknown> = {}) => ({
  settings: {
    'ticketing.stadiumCapacity': '5000',
    'ticketing.memberDiscountPercent': '10',
    'ticketing.maxBoxOfficeTicketsPerUser': '4',
    'ticketing.seasonPassPrice': '0',
    'ticketing.seasonPassLabel': 'Sezonska karta',
    'ticketing.boxOfficeEnabled': 'true',
    'ticketing.ticketCardBackground': '',
    'ticketing.onlineEnabled': 'true',
    'membership.onlineEnabled': 'false',
    'membership.annualPrice': '50',
    'payments.defaultProvider': 'stripe',
  },
  categories: [],
  salesModes: { online: true, boxOffice: true },
  onlineReady: true,
  providerStatus: { stripe: { keysOk: true, checkoutReady: true }, paypal: { keysOk: false, checkoutReady: false }, monri: { keysOk: false, checkoutReady: false } },
  ...over,
});

beforeEach(() => {
  state.orders = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.orders;
  state.ordersMutations = { confirmPayment: { mutateAsync: vi.fn(async () => ({})), isPending: false }, confirmRefund: { mutateAsync: vi.fn(async () => ({})), isPending: false } } as unknown as typeof state.ordersMutations;
  state.config = configBase() as unknown as typeof state.config;
  state.configIsLoading = false;
  state.configIsError = false;
  state.configIsFetching = false;
  state.configUpdatedAt = 0;
  state.configRefetch = vi.fn();
  state.save = vi.fn(async () => ({}));
  state.saving = false;
  state.seasonList = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.seasonList;
  state.issue = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.issue;
  state.canManage = true;
  state.confirm = vi.fn(async () => true);
});

describe('E-02 Ticketing — loading skeleton aria-busy (P2-2)', () => {
  it('orders isLoading pokazuje skeleton aria-busy bez tabele', () => {
    state.orders = { data: [], isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.orders;
    render(<TicketingOrdersTab />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
    expect(screen.queryByText('Nema narudžbi.')).toBeNull();
  });

  it('settings isLoading pokazuje skeleton aria-busy bez forme', () => {
    state.config = undefined as unknown as typeof state.config;
    state.configIsLoading = true;
    state.configIsFetching = true;
    render(<TicketingSettingsTab />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'admin.ticketingForm.save' })).toBeNull();
  });

  it('payments isLoading pokazuje skeleton aria-busy bez prekidača', () => {
    state.config = undefined as unknown as typeof state.config;
    state.configIsLoading = true;
    state.configIsFetching = true;
    render(<TicketingPaymentsTab />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.queryByRole('switch')).toBeNull();
  });

  it('season isLoading pokazuje skeleton aria-busy bez redova', () => {
    state.seasonList = { data: [{ id: 's1' }], isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.seasonList;
    render(<TicketingSeasonTab />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.queryByTestId('row-s1')).toBeNull();
  });
});

describe('E-02 Ticketing — error role=alert + retry disabled (P2-3)', () => {
  it('orders isError prikazuje role=alert i retry poziva refetch, disabled dok isFetching', async () => {
    const refetch = vi.fn();
    state.orders = { data: undefined as unknown as unknown[], isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, refetch } as unknown as typeof state.orders;
    const { rerender } = render(<TicketingOrdersTab />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const btn = within(alert).getByRole('button', { name: 'Pokušaj ponovo' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();
    // fetching disabled state
    state.orders = { data: undefined as unknown as unknown[], isLoading: false, isError: true, isFetching: true, dataUpdatedAt: 0, refetch } as unknown as typeof state.orders;
    rerender(<TicketingOrdersTab />);
    const alert2 = screen.getByRole('alert');
    const btn2 = within(alert2).getByRole('button');
    expect(btn2).toBeDisabled();
    expect(btn2.textContent).toMatch(/admin\.common\.loading/);
  });

  it('settings/payments error retry je disabled dok je isFetching', () => {
    state.configIsError = true;
    state.configIsFetching = true;
    render(<TicketingSettingsTab />);
    const alert = screen.getByRole('alert');
    expect(within(alert).getByRole('button')).toBeDisabled();
  });
});

describe('E-02 Ticketing — lastUpdated/Osvježi + tablist a11y (P2-4..6)', () => {
  it('success prikazuje lastUpdated i Osvježi poziva refetch, disabled dok isFetching', async () => {
    const ts = Date.now();
    const refetch = vi.fn();
    state.orders = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: ts, refetch } as unknown as typeof state.orders;
    const { rerender } = render(<TicketingOrdersTab />);
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();
    // fetching state disables button and shows loading
    state.orders = { data: [], isLoading: false, isError: false, isFetching: true, dataUpdatedAt: ts, refetch } as unknown as typeof state.orders;
    rerender(<TicketingOrdersTab />);
    const btn2 = screen.getByRole('button', { name: 'admin.common.loading' });
    expect(btn2).toBeDisabled();
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
  });

  it('tablist ima role tablist i tabovi aria-pressed/aria-selected, hardcode zamijenjen i18n', async () => {
    // default orders active
    render(
      <MemoryRouter>
        <TicketingAdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    // labels are via t() with defaults: Narudžbe/Sezona/Postavke/Online plaćanje (mock returns key if no default, but we pass defaultValue)
    // our mock returns defaultValue, so check for those strings
    expect(tabs[0].textContent).toBe('Narudžbe');
    expect(tabs[1].textContent).toBe('Sezona');
    expect(tabs[2].textContent).toBe('Postavke');
    expect(tabs[3].textContent).toBe('Online plaćanje');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-pressed', 'true');
    expect(tabs[1]).toHaveAttribute('aria-pressed', 'false');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    // click switches tab
    const user = userEvent.setup();
    await user.click(tabs[1]);
    expect(tabs[1]).toHaveAttribute('aria-pressed', 'true');
    expect(tabs[0]).toHaveAttribute('aria-pressed', 'false');
    // after switch, season content visible (heading inside season tab)
    expect(screen.getByText('admin.seasonTicket.issueTitle')).toBeInTheDocument();
    await user.click(tabs[0]);
    expect(tabs[0]).toHaveAttribute('aria-pressed', 'true');
    // orders content again
    expect(screen.getByText('Nema narudžbi.')).toBeInTheDocument();
  });
});
