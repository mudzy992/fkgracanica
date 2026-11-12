import { vi } from 'vitest';

/** Zajedničko stanje, mockovi i pomoćnici za `TicketsReserveActions` testove. */
export const ticketsReserveState = {
  reserve: vi.fn(),
  reservePending: false,
  reserveError: null as unknown,
  checkout: vi.fn(),
  checkoutPending: false,
  checkoutError: null as unknown,
  config: { readyProviders: ['stripe'] } as unknown,
  reserved: [] as Array<string | undefined>,
};

export function reserveHooksModule() {
  const state = ticketsReserveState;
  return {
    'use-online-checkout': {
      useOnlineTicketCheckout: () => ({
        mutateAsync: state.checkout, isPending: state.checkoutPending, error: state.checkoutError,
      }),
    },
    'use-ticketing': {
      useReserveTicket: () => ({
        mutateAsync: state.reserve, isPending: state.reservePending, error: state.reserveError,
      }),
      useTicketingPublicConfig: () => ({ data: state.config }),
    },
  };
}

export function onlinePaymentChoiceModule() {
  return {
    OnlinePaymentChoice: ({ providers, disabled, loading, onSelect }: {
      providers: string[]; disabled: boolean; loading: boolean; onSelect: (p: string) => void;
    }) => (
      <div>
        placanje:{providers.join(',')}:{String(disabled)}:{String(loading)}
        {providers.map((p) => (<button key={p} onClick={() => onSelect(p)}>online-{p}</button>))}
      </div>
    ),
  };
}

export function reserveProps(over: Record<string, unknown> = {}) {
  const state = ticketsReserveState;
  return {
    matchId: 'm1',
    category: { id: 'c1', label: 'Tribina', price: 10 },
    quantity: 2,
    boxOfficeMax: 4,
    onlineMax: 10,
    remaining: 50,
    boxOffice: false,
    online: true,
    onReserved: (id?: string) => state.reserved.push(id),
    ...over,
  };
}

/** Vraća stanje u podrazumijevane vrijednosti prije svakog testa. */
export function resetTicketsReserveState() {
  const state = ticketsReserveState;
  state.reserve.mockReset();
  state.reserve.mockResolvedValue({ id: 'o1' });
  state.reservePending = false;
  state.reserveError = null;
  state.checkout.mockReset();
  state.checkout.mockResolvedValue({ url: null });
  state.checkoutPending = false;
  state.checkoutError = null;
  state.config = { readyProviders: ['stripe'] };
  state.reserved = [];
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, href: 'https://fkgracanica.ba/karte' },
  });
}
