import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SeasonPassPanel } from './SeasonPassPanel';

const state = vi.hoisted(() => ({
  myPass: { data: undefined as unknown, isLoading: false },
  open: { mutateAsync: vi.fn(), isPending: false },
  checkout: { mutateAsync: vi.fn(), isPending: false },
  providers: [] as string[],
  payment: {} as Record<string, unknown>,
  href: '',
}));

vi.mock('../../hooks/use-ticketing', () => ({
  useMySeasonPass: () => state.myPass,
  useOpenSeasonPass: () => state.open,
}));
vi.mock('../../hooks/use-online-checkout', () => ({
  useOnlineSeasonPassCheckout: () => state.checkout,
}));
vi.mock('../../lib/payment-providers', () => ({
  getReadyPaymentProviders: () => state.providers,
}));
vi.mock('./SeasonPassCard', () => ({
  SeasonPassCard: ({ pass }: { pass: { id: string } }) => <div>karta:{pass.id}</div>,
}));
vi.mock('../payments/OnlinePaymentChoice', () => ({
  OnlinePaymentChoice: (props: Record<string, unknown>) => {
    state.payment = props;
    const providers = props.providers as string[];
    return (
      <div>
        izbor:{providers.join(',')}:{String(props.loading)}:{String(props.disabled)}
        {providers.map((p) => (
          <button key={p} onClick={() => (props.onSelect as (id: string) => void)(p)}>
            plati-{p}
          </button>
        ))}
      </div>
    );
  },
}));

const offer = (over: Record<string, unknown> = {}) => ({
  label: 'Sezonska karta',
  price: 50,
  available: true,
  season: { name: '2025/26' },
  salesModes: { online: true },
  ...over,
});

const renderPanel = (over: Record<string, unknown> = {}) =>
  render(<SeasonPassPanel {...over} />);

beforeEach(() => {
  state.myPass = {
    data: { offer: offer(), pass: null },
    isLoading: false,
  };
  state.open.mutateAsync.mockReset();
  state.open.mutateAsync.mockResolvedValue({ id: 'p1' });
  state.open.isPending = false;
  state.checkout.mutateAsync.mockReset();
  state.checkout.mutateAsync.mockResolvedValue({ url: 'https://monri.example/pay' });
  state.checkout.isPending = false;
  state.providers = [];
  state.payment = {};
});

describe('SeasonPassPanel — stanja', () => {
  it('učitavanje prikazuje skeleton', () => {
    state.myPass = { data: undefined, isLoading: true };
    const { container } = renderPanel();
    expect(container.querySelector('.h-32')).toBeInTheDocument();
  });

  it('bez ponude u prodaji prikazuje poruku', () => {
    state.myPass = { data: undefined, isLoading: false };
    renderPanel();
    expect(screen.getByText('Sezonska karta trenutno nije u prodaji.')).toBeInTheDocument();
  });

  it('neprodana ponuda (available false) daje istu poruku', () => {
    state.myPass = { data: { offer: offer({ available: false }), pass: null }, isLoading: false };
    renderPanel();
    expect(screen.getByText('Sezonska karta trenutno nije u prodaji.')).toBeInTheDocument();
  });

  it('aktivna karta prikazuje karticu i poruku o uspjehu', () => {
    state.myPass = { data: { offer: offer(), pass: { id: 'p9', status: 'ACTIVE' } }, isLoading: false };
    renderPanel({ paymentSuccess: true });
    expect(screen.getByText('karta:p9')).toBeInTheDocument();
    expect(screen.getByText('Uplata je uspješna. Sezonska karta je aktivna.')).toBeInTheDocument();
  });

  it('aktivna karta bez potvrde nema poruku o uplati', () => {
    state.myPass = { data: { offer: offer(), pass: { id: 'p9', status: 'ACTIVE' } }, isLoading: false };
    renderPanel();
    expect(screen.queryByText(/Uplata je uspješna/)).toBeNull();
  });
});

describe('SeasonPassPanel — prodaja', () => {
  it('prikazuje naziv ponude, sezonu i cijenu', () => {
    renderPanel();
    expect(screen.getByText(/Sezonska karta · 2025\/26/)).toBeInTheDocument();
    expect(screen.getByText('50 KM')).toBeInTheDocument();
  });

  it('bez online kanala upućuje na blagajnu', () => {
    renderPanel();
    expect(screen.getByText('Kupovina na blagajni stadiona.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Plati/ })).toBeNull();
  });

  it('jedan provajder daje dugme koje otvara kartu pa plaćanje', async () => {
    const user = userEvent.setup();
    state.providers = ['monri'];
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, origin: 'https://fkgracanica.ba', assign, href: '' },
    });
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'Plati 50 KM' }));
    await waitFor(() => expect(state.checkout.mutateAsync).toHaveBeenCalledWith({
      passId: 'p1',
      provider: 'monri',
    }));
    expect(state.open.mutateAsync).toHaveBeenCalledTimes(1);
  });

  it('postojeća PENDING karta se ne otvara ponovo', async () => {
    const user = userEvent.setup();
    state.providers = ['monri'];
    state.myPass = {
      data: { offer: offer(), pass: { id: 'pend1', status: 'PENDING' } },
      isLoading: false,
    };
    state.checkout.mutateAsync.mockResolvedValue({});
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'Plati 50 KM' }));
    await waitFor(() => expect(state.checkout.mutateAsync).toHaveBeenCalledWith({
      passId: 'pend1',
      provider: 'monri',
    }));
    expect(state.open.mutateAsync).not.toHaveBeenCalled();
  });

  it('više provajdera prikazuje izbor, a PENDING nudi nastavak uplate', async () => {
    const user = userEvent.setup();
    state.providers = ['monri', 'stripe'];
    state.myPass = {
      data: { offer: offer(), pass: { id: 'pend2', status: 'PENDING' } },
      isLoading: false,
    };
    state.checkout.mutateAsync.mockResolvedValue({});
    renderPanel();
    expect(screen.getByText(/izbor:monri,stripe:false:false/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nastavi uplatu' }));
    expect(screen.getByText(/izbor:monri,stripe:false:undefined/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'plati-stripe' }));
    await waitFor(() => expect(state.checkout.mutateAsync).toHaveBeenCalledWith({
      passId: 'pend2',
      provider: 'stripe',
    }));
  });

  it('otkazana uplata prikazuje poruku i dalje nudi kupovinu', () => {
    state.providers = ['monri'];
    renderPanel({ paymentCancelled: true });
    expect(screen.getByText('Online uplata je otkazana. Možete pokušati ponovo.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Plati 50 KM' })).toBeInTheDocument();
  });

  it('zauzetost onemogućava dugme i mijenja tekst', () => {
    state.providers = ['monri'];
    state.checkout.isPending = true;
    renderPanel();
    expect(screen.getByRole('button', { name: 'Priprema…' })).toBeDisabled();
  });
});

describe('SeasonPassPanel — izbor provajdera', () => {
  it('odabir provajdera pokreće plaćanje', async () => {
    const user = userEvent.setup();
    state.providers = ['monri', 'stripe'];
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'plati-stripe' }));
    await waitFor(() => expect(state.checkout.mutateAsync).toHaveBeenCalledWith({
      passId: 'p1',
      provider: 'stripe',
    }));
  });
});
