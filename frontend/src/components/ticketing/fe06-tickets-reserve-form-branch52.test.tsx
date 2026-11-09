import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../hooks/use-ticketing', async () => {
  const actual = await vi.importActual<typeof import('../../hooks/use-ticketing')>('../../hooks/use-ticketing');
  return { ...actual, useMatchAvailability: vi.fn(), useTicketingPublicConfig: vi.fn() };
});
import { useTicketingPublicConfig, useMatchAvailability } from '../../hooks/use-ticketing';
import { TicketsReserveForm } from './TicketsReserveForm';

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('fe06 TicketsReserveForm branch52', () => {
  it('!boxOffice && !online → Kupovina nije dostupna', () => {
    (useTicketingPublicConfig as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: { salesModes: { boxOffice: false, online: false }, categories: [], activeTicketMatch: { id: 'm1', scheduledAt: new Date().toISOString() } } });
    (useMatchAvailability as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined });
    render(wrapper(<TicketsReserveForm onSuccess={vi.fn()} />));
    expect(screen.getByText(/Kupovina ulaznica trenutno nije dostupna/)).toBeInTheDocument();
  });
  it('!activeMatch → nema zakazane utakmice', () => {
    (useTicketingPublicConfig as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: { salesModes: { boxOffice: true, online: true }, categories: [], activeTicketMatch: undefined } });
    (useMatchAvailability as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined });
    render(wrapper(<TicketsReserveForm onSuccess={vi.fn()} />));
    expect(screen.getByText(/Trenutno nema zakazane domaće utakmice/)).toBeInTheDocument();
  });
  it('boxOffice true, online true prikazuje formu', () => {
    (useTicketingPublicConfig as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: { salesModes: { boxOffice: true, online: true }, categories: [{ id: 'c1', label: 'Tribina', price: 10 }], activeTicketMatch: { id: 'm1', scheduledAt: new Date().toISOString(), homeClub: { name: 'FK' }, awayClub: { name: 'NK' } } } });
    (useMatchAvailability as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: { remaining: 10, capacity: 100, memberDiscountPercent: 0 } });
    render(wrapper(<TicketsReserveForm onSuccess={vi.fn()} />));
    expect(screen.getByText('Kategorija ulaznice')).toBeInTheDocument();
  });
});
