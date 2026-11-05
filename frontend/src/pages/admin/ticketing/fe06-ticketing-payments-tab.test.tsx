import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketingPaymentsTab } from './TicketingPaymentsTab';

const state = vi.hoisted(() => ({
  config: undefined as unknown,
  isLoading: false,
  save: vi.fn(),
  pending: false,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-ticketing-admin', () => ({
  useTicketingAdminConfig: () => ({ data: state.config, isLoading: state.isLoading }),
  useUpdateTicketingAdminConfig: () => ({ mutateAsync: state.save, isPending: state.pending }),
}));
vi.mock('../../../components/ui/switch', async () => ({
  Switch: (await import('../../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));
vi.mock('./PaymentProviderHints', () => ({
  PaymentProviderHints: () => <div>hints</div>,
}));
vi.mock('./PaymentProviderCard', () => ({
  PaymentProviderCard: ({ id, gate, onSet }: {
    id: string; gate: { keysOk: boolean; checkoutReady: boolean };
    onSet: (key: string, value: string) => void;
  }) => (
    <div>
      kartica:{id}:{String(gate.checkoutReady)}
      <button onClick={() => onSet(`payments.${id}.enabled`, 'true')}>ukljuci-{id}</button>
    </div>
  ),
}));

const gate = (over: Partial<{ keysOk: boolean; checkoutReady: boolean }> = {}) => ({
  keysOk: false,
  checkoutReady: false,
  ...over,
});

const config = (over: Record<string, unknown> = {}) => ({
  settings: {
    'ticketing.onlineEnabled': 'true',
    'membership.onlineEnabled': 'false',
    'membership.annualPrice': '80',
    'payments.defaultProvider': 'monri',
    'payments.stripe.enabled': 'true',
  },
  salesModes: { online: true, boxOffice: true },
  onlineReady: true,
  providerStatus: { stripe: gate({ checkoutReady: true }), paypal: gate(), monri: gate({ keysOk: true }) },
  categories: [],
  ...over,
});

const switches = () => screen.getAllByRole('switch');

beforeEach(() => {
  state.config = config();
  state.isLoading = false;
  state.save.mockReset();
  state.save.mockResolvedValue({});
  state.pending = false;
});

describe('TicketingPaymentsTab — učitavanje i status', () => {
  it('dok nema konfiguracije prikazuje poruku učitavanja', () => {
    state.config = undefined;
    state.isLoading = true;
    render(<TicketingPaymentsTab />);
    expect(screen.getByText('admin.common.loading')).toBeInTheDocument();
    expect(screen.queryByRole('switch')).toBeNull();
  });

  it('spremno stanje i savjeti se prikazuju uz tri kartice provajdera', () => {
    render(<TicketingPaymentsTab />);
    expect(screen.getByText('Spremno')).toBeInTheDocument();
    expect(screen.getByText('hints')).toBeInTheDocument();
    expect(screen.getByText(/kartica:stripe:true/)).toBeInTheDocument();
    expect(screen.getByText(/kartica:paypal:false/)).toBeInTheDocument();
    expect(screen.getByText(/kartica:monri:false/)).toBeInTheDocument();
  });

  it('nije konfigurisano gasi prekidače i prikazuje uputstvo', () => {
    state.config = config({ onlineReady: false });
    render(<TicketingPaymentsTab />);
    expect(screen.getByText('Nije konfigurisano')).toBeInTheDocument();
    expect(switches()[0]).toHaveAttribute('aria-checked', 'false');
    expect(switches()[0]).toBeDisabled();
    expect(screen.getByText(/Omogućite Stripe/)).toBeInTheDocument();
  });

  it('preuzima cijenu članstva i podrazumijevani provajder iz postavki', () => {
    render(<TicketingPaymentsTab />);
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('monri');
    expect(switches()[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('bez spremljenih vrijednosti koristi 50 KM i stripe', () => {
    state.config = config({ settings: {}, onlineReady: true });
    render(<TicketingPaymentsTab />);
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('stripe');
    expect(switches()[0]).toHaveAttribute('aria-checked', 'false');
  });
});

describe('TicketingPaymentsTab — promjene i spremanje', () => {
  it('uključivanje online kupovine ulaznica ulazi u zahtjev', async () => {
    const user = userEvent.setup();
    state.config = config({ settings: {} });
    render(<TicketingPaymentsTab />);
    await user.click(switches()[0]);
    await user.click(screen.getByRole('button', { name: 'Spremi plaćanje' }));
    expect(state.save).toHaveBeenCalledWith(
      expect.objectContaining({ 'ticketing.onlineEnabled': 'true' }),
    );
  });

  it('promjena cijene, provajdera i kartice se šalje zajedno', async () => {
    const user = userEvent.setup();
    render(<TicketingPaymentsTab />);
    const price = screen.getByDisplayValue('80');
    await user.clear(price);
    await user.type(price, '95');
    await user.selectOptions(screen.getByRole('combobox'), 'paypal');
    await user.click(screen.getByRole('button', { name: 'ukljuci-paypal' }));
    await user.click(screen.getByRole('button', { name: 'Spremi plaćanje' }));
    expect(state.save).toHaveBeenCalledWith(
      expect.objectContaining({
        'membership.annualPrice': '95',
        'payments.defaultProvider': 'paypal',
        'payments.paypal.enabled': 'true',
        'membership.onlineEnabled': 'false',
      }),
    );
  });

  it('zadržava nepromijenjene postavke provajdera u payloadu', async () => {
    const user = userEvent.setup();
    render(<TicketingPaymentsTab />);
    await user.click(screen.getByRole('button', { name: 'Spremi plaćanje' }));
    expect(state.save.mock.calls[0][0]).toMatchObject({ 'payments.stripe.enabled': 'true' });
  });

  it('dok spremanje traje dugme je onemogućeno sa drugim tekstom', () => {
    state.pending = true;
    render(<TicketingPaymentsTab />);
    const button = screen.getByRole('button', { name: 'Spremanje...' });
    expect(button).toBeDisabled();
    expect(within(button).queryByText('Spremi plaćanje')).toBeNull();
  });
});
