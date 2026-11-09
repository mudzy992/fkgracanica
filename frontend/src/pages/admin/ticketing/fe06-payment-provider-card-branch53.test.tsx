import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('./provider-gate.util', () => ({ providerGateBadge: () => ({ variant: 'default', label: 'gate' }) }));

import { PaymentProviderCard } from './PaymentProviderCard';

describe('fe06 PaymentProviderCard branch53', () => {
  it('stripe fallback ?? empty string', () => {
    render(<PaymentProviderCard id="stripe" label="Stripe" gate={{} as never} settings={{}} onSet={vi.fn()} />);
    expect(screen.getByText('Stripe')).toBeInTheDocument();
    expect(screen.getByText('gate')).toBeInTheDocument();
  });
  it('paypal fallback ?? empty string', () => {
    render(<PaymentProviderCard id="paypal" label="PayPal" gate={{} as never} settings={{}} onSet={vi.fn()} />);
    expect(screen.getByText('PayPal')).toBeInTheDocument();
  });
  it('monri branch id === monri', () => {
    render(<PaymentProviderCard id="monri" label="Monri" gate={{} as never} settings={{}} onSet={vi.fn()} />);
    expect(screen.getByText('Monri')).toBeInTheDocument();
  });
});
