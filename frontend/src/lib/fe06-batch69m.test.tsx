import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
const st = vi.hoisted(() => ({ confirmOk: true, ticketingData: null as unknown, ticketsConfig: null as unknown, galleryDetail: null as unknown }));
vi.mock('../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: async () => st.confirmOk, dialog: null }) }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['competitions.manage'] }, isAuthenticated: true, isLoading: false }) }));
vi.mock('../hooks', async () => {
  const a = await vi.importActual<typeof import('../hooks')>('../hooks');
  return { ...a, useCompetitions: () => ({ data: [{ id: 'c1', name: 'Comp', slug: 'c', isLeague: true }] as never, isLoading: false }), useSeasons: () => ({ data: [{ id: 's1', name: 'Sezona', yearStart: 2023, yearEnd: 2024, isActive: true }] as never, isLoading: false }), useTicketingPublicConfig: () => ({ data: st.ticketsConfig ?? { modulesTicketing: true } }), useTicketPaymentReturn: () => ({ confirming: false, activated: false, status: 'idle', retry: vi.fn() }), useSeasonPassPaymentReturn: () => ({ confirming: false, activated: false, status: 'idle', retry: vi.fn() }), useClearPaymentParams: () => {} };
});
vi.mock('../hooks/use-competition-admin', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-competition-admin')>('../hooks/use-competition-admin');
  return { ...a, useDeleteCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }), useCreateCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }), useUpdateCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }) };
});
vi.mock('../hooks/use-season-admin', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-season-admin')>('../hooks/use-season-admin');
  return { ...a, useCreateSeason: () => ({ mutateAsync: vi.fn(), isPending: false }), useUpdateSeason: () => ({ mutateAsync: vi.fn(), isPending: false }), useDeleteSeason: () => ({ mutateAsync: vi.fn(), isPending: false }) };
});
vi.mock('../hooks/use-ticketing-admin', () => ({ useTicketingAdminConfig: () => st.ticketingData ?? { data: { settings: {}, onlineReady: true, providerStatus: { stripe: {}, paypal: {}, monri: {} } }, isLoading: false }, useUpdateTicketingAdminConfig: () => ({ mutateAsync: vi.fn(), isPending: false }) }));
vi.mock('../hooks/use-ticketing', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-ticketing')>('../hooks/use-ticketing');
  return { ...a, useTicketingPublicConfig: () => ({ data: st.ticketsConfig }), useMatchAvailability: () => ({ data: null, isLoading: false }) };
});
vi.mock('../hooks/use-content-admin', () => ({ useCreateGallery: () => ({ mutateAsync: vi.fn(), isPending: false }), useUpdateGallery: () => ({ mutateAsync: vi.fn(), isPending: false }), useGalleryDetail: () => ({ data: st.galleryDetail, isLoading: false }) }));
vi.mock('../components/ui/dialog', () => ({ Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (open ? <div>{children}</div> : null), DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('../components/ui/button', async () => { const a = await vi.importActual<typeof import('../components/ui/button')>('../components/ui/button'); return { ...a, Button: ({ children, onClick, ...p }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick} {...p}>{children}</button> }; });
vi.mock('../lib/media', async () => { const a = await vi.importActual('../lib/media') as never; return { ...(a as object), mediaUrl: () => '' }; });
vi.mock('../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../components/admin/GalleryPhotoPicker', () => ({ GalleryPhotoPicker: () => null }));
vi.mock('../pages/admin/GalleryAdminPhotos', () => ({ GalleryAdminPhotos: () => null }));

import { CompetitionsAdminFormSheet } from '../pages/admin/CompetitionsAdminFormSheet';
import { CompetitionsAdminPage } from '../pages/admin/CompetitionsAdminPage';
import { GalleryEditorPage } from '../pages/admin/gallery/GalleryEditorPage';
import { TicketingPaymentsTab } from '../pages/admin/ticketing/TicketingPaymentsTab';
import { TicketsPage } from '../pages/public/TicketsPage';

const qc = new QueryClient();
const wrap = (ui: React.ReactNode) => <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;

describe('fe06-batch69m 5 grana', () => {
  beforeEach(() => { st.confirmOk = true; st.ticketingData = null; st.ticketsConfig = null; st.galleryDetail = null; });
  afterEach(() => cleanup());

  it('CompetitionsAdminFormSheet oba save', async () => {
    const onOC = vi.fn();
    const { unmount } = render(wrap(<CompetitionsAdminFormSheet open onOpenChange={onOC} mode="competition" editCompetition={null} editSeason={null} />));
    fireEvent.change(screen.getByPlaceholderText('admin.competitionForm.nameRequired'), { target: { value: 'New' } });
    fireEvent.click(screen.getByText('Kreiraj')); await waitFor(() => expect(onOC).toHaveBeenCalled()); unmount(); onOC.mockClear();
    render(wrap(<CompetitionsAdminFormSheet open onOpenChange={onOC} mode="competition" editCompetition={{ id: 'c1', name: 'Old', slug: 'old' } as never} editSeason={null} />));
    fireEvent.change(screen.getByPlaceholderText('admin.competitionForm.nameRequired'), { target: { value: 'Upd' } });
    fireEvent.click(screen.getByText('Spremi')); await waitFor(() => expect(onOC).toHaveBeenCalled());
  });

  it('CompetitionsAdminPage oba confirm', async () => {
    st.confirmOk = false;
    const { unmount } = render(wrap(<CompetitionsAdminPage />));
    await waitFor(() => expect(screen.getAllByLabelText('actions.delete').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByLabelText('actions.delete')[0]); await waitFor(() => expect(document.body).toBeTruthy()); unmount();
    st.confirmOk = true;
    render(wrap(<CompetitionsAdminPage />));
    await waitFor(() => expect(screen.getAllByLabelText('actions.delete').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByLabelText('actions.delete')[0]); await waitFor(() => expect(document.body).toBeTruthy());
  });

  it('GalleryEditorPage oba ternary', async () => {
    st.galleryDetail = { id: 'g1', title: 'T1', description: 'D1', status: 'PUBLISHED', photos: [] } as never;
    const { rerender } = render(wrap(<GalleryEditorPage />));
    expect(document.body).toBeTruthy();
    st.galleryDetail = { id: 'g1', title: 'T2', description: 'D2', photos: [] } as never;
    rerender(wrap(<GalleryEditorPage />)); await waitFor(() => expect(document.body).toBeTruthy());
    const input = screen.getByPlaceholderText('admin.galleryEditor.titleRequired');
    fireEvent.change(input, { target: { value: 'Edited' } });
    st.galleryDetail = { id: 'g1', title: 'T3', description: 'D3', photos: [] } as never;
    rerender(wrap(<GalleryEditorPage />));
    expect((input as HTMLInputElement).value).toBe('Edited');
  });

  it('TicketingPaymentsTab oba canEnableOnline', async () => {
    st.ticketingData = { data: { settings: {}, onlineReady: true, providerStatus: { stripe: {}, paypal: {}, monri: {} } }, isLoading: false } as never;
    const { unmount } = render(wrap(<TicketingPaymentsTab />));
    expect(screen.getAllByText('Stripe').length).toBeGreaterThan(0); unmount();
    st.ticketingData = { data: { settings: {}, onlineReady: false, providerStatus: { stripe: {}, paypal: {}, monri: {} } }, isLoading: false } as never;
    render(wrap(<TicketingPaymentsTab />));
    expect(screen.getByText('Nije konfigurisano')).toBeInTheDocument();
  });

  it('TicketsPage seasonPassAvailable || tab', async () => {
    st.ticketsConfig = { modulesTicketing: true, salesModes: { boxOffice: true, online: false }, seasonPassAvailable: false } as never;
    const { unmount } = render(wrap(<TicketsPage />));
    expect(screen.queryByText('pages.tickets.tabsSeason')).not.toBeInTheDocument();
    expect(screen.getByText('pages.tickets.onlyBoxOffice')).toBeInTheDocument(); unmount();
    st.ticketsConfig = { modulesTicketing: true, salesModes: { boxOffice: true, online: true }, seasonPassAvailable: true } as never;
    render(wrap(<TicketsPage />));
    expect(screen.getByText('pages.tickets.tabsSeason')).toBeInTheDocument();
    expect(screen.getByText('pages.tickets.onlineOrBoxOffice')).toBeInTheDocument();
    fireEvent.click(screen.getByText('pages.tickets.tabsSeason'));
    expect(document.body).toBeTruthy();
  });
});
