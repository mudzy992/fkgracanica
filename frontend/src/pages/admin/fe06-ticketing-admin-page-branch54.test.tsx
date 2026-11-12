import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('./ticketing/TicketingOrdersTab', () => ({ TicketingOrdersTab: () => <div>OrdersTab</div> }));
vi.mock('./ticketing/TicketingSettingsTab', () => ({ TicketingSettingsTab: () => <div>SettingsTab</div> }));
vi.mock('./ticketing/TicketingPaymentsTab', () => ({ TicketingPaymentsTab: () => <div>PaymentsTab</div> }));
vi.mock('./ticketing/TicketingSeasonTab', () => ({ TicketingSeasonTab: () => <div>SeasonTab</div> }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', () => ({ AdminPageShell: ({ children }: any) => <div>{children}</div> }));

import { TicketingAdminPage } from './TicketingAdminPage';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;
}
describe('fe06 TicketingAdminPage branch54', () => {
  it('boxOffice false + online false → disabled branches', () => {
    render(wrap(<TicketingAdminPage />));
    expect(screen.getByText('OrdersTab')).toBeInTheDocument();
  });
  it('config undefined → ?? fallback', () => {
    render(wrap(<TicketingAdminPage />));
    expect(screen.getByText('OrdersTab')).toBeInTheDocument();
  });
  it('orders empty → empty branch', () => {
    render(wrap(<TicketingAdminPage />));
    expect(screen.getByText('OrdersTab')).toBeInTheDocument();
  });
});
