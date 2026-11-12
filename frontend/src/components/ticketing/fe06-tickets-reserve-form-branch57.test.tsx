import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../hooks/use-ticketing', async () => {
  const actual = await vi.importActual<typeof import('../../hooks/use-ticketing')>('../../hooks/use-ticketing');
  return { ...actual, useMatchAvailability: vi.fn(), useTicketingPublicConfig: vi.fn() };
});
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual<typeof import('react-hook-form')>('react-hook-form');
  return {
    ...actual,
    useForm: () => ({
      register: () => ({}),
      watch: (name: string) => (name === 'categoryId' ? 'c1' : 2),
      formState: { errors: { categoryId: { message: 'Odaberite kategoriju' }, quantity: { message: 'Max 50' } } },
    }),
  };
});

import { useTicketingPublicConfig, useMatchAvailability } from '../../hooks/use-ticketing';
import { TicketsReserveForm } from './TicketsReserveForm';

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('fe06 TicketsReserveForm branch57 errors', () => {
  it('errors.categoryId prikazuje poruku', () => {
    (useTicketingPublicConfig as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        salesModes: { boxOffice: true, online: true },
        categories: [{ id: 'c1', label: 'Tribina', price: 10 }],
        activeTicketMatch: { id: 'm1', scheduledAt: new Date().toISOString() },
      },
    });
    (useMatchAvailability as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: { remaining: 10, capacity: 100, memberDiscountPercent: 0 } });
    render(wrapper(<TicketsReserveForm onSuccess={vi.fn()} />));
    expect(screen.getByText('Odaberite kategoriju')).toBeInTheDocument();
  });
  it('errors.quantity prikazuje poruku', () => {
    (useTicketingPublicConfig as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        salesModes: { boxOffice: true, online: true },
        categories: [{ id: 'c1', label: 'Tribina', price: 10 }],
        activeTicketMatch: { id: 'm1', scheduledAt: new Date().toISOString() },
      },
    });
    (useMatchAvailability as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: { remaining: 10, capacity: 100, memberDiscountPercent: 0 } });
    render(wrapper(<TicketsReserveForm onSuccess={vi.fn()} />));
    expect(screen.getByText('Max 50')).toBeInTheDocument();
  });
});
