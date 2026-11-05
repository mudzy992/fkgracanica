import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PaymentProviderCard } from './PaymentProviderCard';
import type { ProviderGate } from '../../../types/ticketing-config';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../components/ui/switch', async () => ({
  Switch: (await import('../../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));

const gate = (over: Partial<ProviderGate> = {}): ProviderGate => ({
  keysOk: false,
  checkoutReady: false,
  ...over,
});

const renderCard = (props: Partial<{
  id: 'stripe' | 'paypal' | 'monri';
  gate: ProviderGate;
  settings: Record<string, string>;
}> = {}) => {
  const onSet = vi.fn();
  render(
    <PaymentProviderCard
      id={props.id ?? 'stripe'}
      label="Provajder"
      gate={props.gate ?? gate()}
      settings={props.settings ?? {}}
      onSet={onSet}
    />,
  );
  return onSet;
};

describe('PaymentProviderCard — oznaka stanja', () => {
  it('checkout spreman daje zelenu oznaku', () => {
    renderCard({ gate: gate({ keysOk: true, checkoutReady: true }) });
    expect(screen.getByText('Spremno')).toBeInTheDocument();
  });

  it('samo ključevi daju oznaku upozorenja', () => {
    renderCard({ gate: gate({ keysOk: true }) });
    expect(screen.getByText('Ključevi')).toBeInTheDocument();
  });

  it('bez ključeva daje oznaku da nedostaje', () => {
    renderCard();
    expect(screen.getByText('Nedostaje')).toBeInTheDocument();
  });
});

describe('PaymentProviderCard — Stripe polja', () => {
  it('prazan Stripe nema vrijednosti i prekidač je isključen', () => {
    renderCard();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getAllByDisplayValue('')).toHaveLength(3);
  });

  it('prefill-a ključeve i uključenost iz postavki', () => {
    renderCard({
      settings: {
        'payments.stripe.enabled': 'true',
        'payments.stripe.publishableKey': 'pk_test_1',
        'payments.stripe.secretKey': 'sk_test_1',
        'payments.stripe.webhookSecret': 'whsec_1',
      },
    });
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByDisplayValue('pk_test_1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('sk_test_1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('whsec_1')).toBeInTheDocument();
  });

  it('tajni ključevi su polja tipa password', () => {
    renderCard({
      settings: { 'payments.stripe.secretKey': 'sk_test_1', 'payments.stripe.webhookSecret': 'whsec_1' },
    });
    const passwordFields = document.querySelectorAll('input[type="password"]');
    expect(passwordFields).toHaveLength(2);
  });

  it('izmjena i prekidač koriste prefiks stripe', async () => {
    const user = userEvent.setup();
    const onSet = renderCard();
    await user.type(screen.getAllByRole('textbox')[0], 'pk_live');
    expect(onSet).toHaveBeenCalledWith('payments.stripe.publishableKey', 'p');
    await user.click(screen.getByRole('switch'));
    expect(onSet).toHaveBeenCalledWith('payments.stripe.enabled', 'true');
  });
});

describe('PaymentProviderCard — PayPal polja', () => {
  it('prikazuje clientId, tajnu, mode, valutu i webhook', () => {
    renderCard({
      id: 'paypal',
      settings: {
        'payments.paypal.clientId': 'client-1',
        'payments.paypal.clientSecret': 'secret-1',
        'payments.paypal.webhookId': 'wh-1',
      },
    });
    expect(screen.getByDisplayValue('client-1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('secret-1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('wh-1')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('sandbox');
    expect(screen.getByDisplayValue('EUR')).toBeInTheDocument();
  });

  it('promjena moda i valute ide u postavke', async () => {
    const user = userEvent.setup();
    const onSet = renderCard({ id: 'paypal' });
    await user.selectOptions(screen.getByRole('combobox'), 'live');
    expect(onSet).toHaveBeenCalledWith('payments.paypal.mode', 'live');
  });

  it('nema Stripe ni Monri polja', () => {
    renderCard({ id: 'paypal' });
    expect(screen.queryByDisplayValue('sk_test_1')).toBeNull();
    expect(document.querySelectorAll('input[type="password"]')).toHaveLength(1);
  });
});

describe('PaymentProviderCard — Monri polja', () => {
  it('prikazuje merchant key, auth token i mode test', () => {
    renderCard({
      id: 'monri',
      settings: {
        'payments.monri.merchantKey': 'mk-1',
        'payments.monri.authenticationKey': 'ak-1',
      },
    });
    expect(screen.getByDisplayValue('mk-1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ak-1')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('test');
  });

  it('promjena autentikacijskog ključa koristi monri prefiks', async () => {
    const user = userEvent.setup();
    const onSet = renderCard({ id: 'monri' });
    await user.type(document.querySelector('input[type="password"]') as HTMLInputElement, 'a');
    expect(onSet).toHaveBeenCalledWith('payments.monri.authenticationKey', 'a');
  });

  it('prebacivanje moda na live se šalje', async () => {
    const user = userEvent.setup();
    const onSet = renderCard({ id: 'monri', settings: { 'payments.monri.mode': 'test' } });
    await user.selectOptions(screen.getByRole('combobox'), 'live');
    expect(onSet).toHaveBeenCalledWith('payments.monri.mode', 'live');
  });
});
