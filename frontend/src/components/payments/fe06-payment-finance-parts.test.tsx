import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PaymentReturnNotice } from './PaymentReturnNotice';
import { PaymentProviderHints } from '../../pages/admin/ticketing/PaymentProviderHints';
import { FinanceBuckets } from '../../pages/admin/finance/FinanceBuckets';
import { FinanceKpiGrid } from '../../pages/admin/finance/FinanceKpiGrid';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, o?: { count?: number }) => `${k}${o?.count != null ? `:${o.count}` : ''}` }),
}));

const summary = {
  from: '2026-11-01',
  to: '2026-11-30',
  totalSum: 1234.5,
  tickets: { count: 12, sum: 300 },
  seasonPass: { count: 3, sum: 450 },
  membership: { count: 40, sum: 484.5 },
  byProvider: [
    { key: 'stripe', count: 5, sum: 150 },
    { key: 'nepoznat', count: 1, sum: 10 },
  ],
  byStatus: [
    { key: 'CONFIRMED', count: 4, sum: 120 },
    { key: 'CANCELLED', count: 2, sum: 30 },
  ],
};

describe('PaymentReturnNotice', () => {
  it('za uspješan status ne renderira ništa', () => {
    const { container } = render(<PaymentReturnNotice status={'idle' as never} onRetry={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('pending prikazuje poruku i retry dugme', async () => {
    const onRetry = vi.fn();
    render(<PaymentReturnNotice status={'pending' as never} onRetry={onRetry} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('paymentReturn.pending')).toBeInTheDocument();
    expect(screen.getByText('paymentReturn.retryInfo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'paymentReturn.retry' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('error prikazuje svoju poruku', () => {
    render(<PaymentReturnNotice status={'error' as never} onRetry={vi.fn()} />);
    expect(screen.getByText('paymentReturn.error')).toBeInTheDocument();
  });
});

describe('PaymentProviderHints', () => {
  it('prikazuje sva tri provajdera i test karticu', () => {
    render(<PaymentProviderHints />);
    expect(screen.getByText('admin.providerHints.stripeTitle')).toBeInTheDocument();
    expect(screen.getByText('admin.providerHints.paypalTitle')).toBeInTheDocument();
    expect(screen.getByText('admin.providerHints.monriTitle')).toBeInTheDocument();
    expect(screen.getByText('4242 4242 4242 4242')).toBeInTheDocument();
    expect(screen.getByText('admin.providerHints.monriWebhook')).toBeInTheDocument();
  });
});

describe('FinanceBuckets', () => {
  it('prikazuje obje tabele sa redovima', () => {
    render(<FinanceBuckets data={summary as never} />);
    expect(screen.getByText('admin.financeBuckets.byProvider')).toBeInTheDocument();
    expect(screen.getByText('admin.financeBuckets.byStatus')).toBeInTheDocument();
    expect(screen.getByText('Stripe')).toBeInTheDocument();
    expect(screen.getByText('nepoznat')).toBeInTheDocument();
    expect(screen.getByText('Plaćeno')).toBeInTheDocument();
    expect(screen.getByText('Otkazano')).toBeInTheDocument();
    expect(screen.getAllByText(/KM/).length).toBeGreaterThanOrEqual(4);
  });

  it('prazan bucket prikazuje poruku', () => {
    render(<FinanceBuckets data={{ ...summary, byProvider: [], byStatus: [] } as never} />);
    expect(screen.getAllByText('admin.financeBuckets.empty')).toHaveLength(2);
  });
});

describe('FinanceKpiGrid', () => {
  it('prikazuje pet KPI kartica sa periodom', () => {
    render(<FinanceKpiGrid data={summary as never} />);
    expect(screen.getByText('admin.financeKpi.tickets')).toBeInTheDocument();
    expect(screen.getByText('admin.financeKpi.transactions:12')).toBeInTheDocument();
    expect(screen.getByText('admin.financeKpi.cards:3')).toBeInTheDocument();
    expect(screen.getByText('admin.financeKpi.activeMembers:40')).toBeInTheDocument();
    expect(screen.getByText('admin.visitors.total')).toBeInTheDocument();
    expect(screen.getByText('01.11.2026. – 30.11.2026.')).toBeInTheDocument();
  });
});
