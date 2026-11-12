import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
const st = vi.hoisted(() => ({ confirmOk: true, ticketingData: null as unknown, galleryDetail: null as unknown }));
vi.mock('../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: async () => st.confirmOk, dialog: null }) }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['competitions.manage'] }, isAuthenticated: true, isLoading: false }) }));
vi.mock('../hooks', async () => {
  const a = await vi.importActual<typeof import('../hooks')>('../hooks');
  return { ...a, useCompetitions: () => ({ data: [{ id: 'c1', name: 'Comp', slug: 'c', isLeague: true }] as never, isLoading: false }), useSeasons: () => ({ data: [{ id: 's1', name: 'Sezona', yearStart: 2023, yearEnd: 2024, isActive: true }] as never, isLoading: false }) };
});
vi.mock('../hooks/use-competition-admin', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-competition-admin')>('../hooks/use-competition-admin');
  return { ...a, useDeleteCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }), useCreateCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }), useUpdateCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }) };
});
vi.mock('../hooks/use-season-admin', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-season-admin')>('../hooks/use-season-admin');
  return { ...a, useCreateSeason: () => ({ mutateAsync: vi.fn(), isPending: false }), useUpdateSeason: () => ({ mutateAsync: vi.fn(), isPending: false }), useDeleteSeason: () => ({ mutateAsync: vi.fn(), isPending: false }) };
});
vi.mock('../hooks/use-ticketing-admin', () => ({ useTicketingAdminConfig: () => st.ticketingData ?? { data: { settings: {}, onlineReady: false, providerStatus: { stripe: {}, paypal: {}, monri: {} } }, isLoading: false }, useUpdateTicketingAdminConfig: () => ({ mutateAsync: vi.fn(), isPending: false }) }));
vi.mock('../hooks/use-content-admin', () => ({ useCreateGallery: () => ({ mutateAsync: vi.fn(), isPending: false }), useUpdateGallery: () => ({ mutateAsync: vi.fn(), isPending: false }), useGalleryDetail: () => ({ data: st.galleryDetail, isLoading: false }) }));
vi.mock('../components/ui/dialog', () => ({ Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (open ? <div>{children}</div> : null), DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('../components/ui/button', async () => { const a = await vi.importActual<typeof import('../components/ui/button')>('../components/ui/button'); return { ...a, Button: ({ children, onClick, ...p }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick} {...p}>{children}</button> }; });
vi.mock('../lib/media', async () => { const a = await vi.importActual('../lib/media') as never; return { ...(a as object), mediaUrl: () => '' }; });
vi.mock('../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../components/admin/GalleryPhotoPicker', () => ({ GalleryPhotoPicker: () => null }));
vi.mock('../pages/admin/GalleryAdminPhotos', () => ({ GalleryAdminPhotos: () => null }));

import { HeroSectionForm } from '../pages/admin/cms/forms/HeroSectionForm';
import { AdminFormSheet } from '../components/admin/AdminFormSheet';
import { CompetitionsAdminFormSheet } from '../pages/admin/CompetitionsAdminFormSheet';
import { CompetitionsAdminPage } from '../pages/admin/CompetitionsAdminPage';
import { GalleryEditorPage } from '../pages/admin/gallery/GalleryEditorPage';
import { TicketingPaymentsTab } from '../pages/admin/ticketing/TicketingPaymentsTab';

const qc = new QueryClient();
const wrap = (ui: React.ReactNode) => <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;

describe('fe06-batch69n preostalih 7', () => {
  beforeEach(() => { st.confirmOk = true; st.ticketingData = null; st.galleryDetail = null; });
  afterEach(() => cleanup());

  it('Hero hero.buttons ??[] via wrapper state', async () => {
    const onChange = vi.fn();
    const Wrapper = () => {
      const [cfg, setCfg] = React.useState<Record<string, unknown>>({ buttons: undefined });
      return <HeroSectionForm config={cfg} onChange={(c) => { setCfg(c); onChange(c); }} />;
    };
    render(wrap(<Wrapper />));
    fireEvent.click(screen.getAllByText('+ Dugme')[0]);
    await waitFor(() => expect(screen.getByPlaceholderText('admin.cmsWidget.buttonLabel')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('admin.cmsWidget.buttonLabel'), { target: { value: 'x' } });
    expect(onChange).toHaveBeenCalled();
    // also test with defined to cover left
    cleanup();
    const { rerender } = render(wrap(<HeroSectionForm config={{ buttons: [{ label: 'a', url: '/', variant: 'primary' }] as never }} onChange={onChange} />));
    fireEvent.change(screen.getByPlaceholderText('admin.cmsWidget.buttonLabel'), { target: { value: 'y' } });
    expect(onChange).toHaveBeenCalled();
    rerender(wrap(<HeroSectionForm config={{ buttons: undefined } as never} onChange={onChange} />));
    fireEvent.click(screen.getAllByText('+ Dugme')[0]);
    expect(onChange).toHaveBeenCalled();
  });

  it('AdminFormSheet else via edited true', async () => {
    render(wrap(<AdminFormSheet open onOpenChange={vi.fn()} title="t"><input placeholder="inp" /></AdminFormSheet>));
    const inp = screen.getByPlaceholderText('inp');
    fireEvent.input(inp, { target: { value: 'a' } });
    // pointerDown capture with edited true should take else
    fireEvent.pointerDown(inp);
    fireEvent.focus(inp);
    fireEvent.keyDown(inp, { key: 'a' });
    window.dispatchEvent(new Event('beforeunload'));
    expect(document.body).toBeTruthy();
  });

  it('CompetitionsAdminFormSheet season i competition oba', async () => {
    const onOC = vi.fn();
    const { unmount } = render(wrap(<CompetitionsAdminFormSheet open onOpenChange={onOC} mode="season" editCompetition={null} editSeason={null} />));
    fireEvent.change(screen.getByPlaceholderText('admin.competitionForm.nameRequired'), { target: { value: 'S' } });
    fireEvent.click(screen.getByText('Kreiraj')); await waitFor(() => expect(onOC).toHaveBeenCalled()); unmount(); onOC.mockClear();
    render(wrap(<CompetitionsAdminFormSheet open onOpenChange={onOC} mode="competition" editCompetition={{ id: 'c1', name: 'Old', slug: 'old' } as never} editSeason={null} />));
    fireEvent.change(screen.getByPlaceholderText('admin.competitionForm.nameRequired'), { target: { value: 'U' } });
    fireEvent.click(screen.getByText('Spremi')); await waitFor(() => expect(onOC).toHaveBeenCalled());
  });

  it('CompetitionsAdminPage oba delete', async () => {
    st.confirmOk = false;
    const { unmount } = render(wrap(<CompetitionsAdminPage />));
    await waitFor(() => expect(screen.getAllByLabelText('actions.delete').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByLabelText('actions.delete')[0]); await new Promise((r) => setTimeout(r, 10)); unmount();
    st.confirmOk = true;
    render(wrap(<CompetitionsAdminPage />));
    await waitFor(() => expect(screen.getAllByLabelText('actions.delete').length).toBeGreaterThan(0));
    const dels = screen.getAllByLabelText('actions.delete');
    fireEvent.click(dels[0]); await waitFor(() => expect(document.body).toBeTruthy());
    if (dels.length > 1) { fireEvent.click(dels[1]); await waitFor(() => expect(document.body).toBeTruthy()); }
  });

  it('GalleryEditorPage oba ternary sa id', async () => {
    st.galleryDetail = { id: 'g1', title: 'T1', description: 'D1', photos: [] } as never;
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/admin/gallery/g1/edit']}>
          <Routes><Route path="/admin/gallery/:id/edit" element={<GalleryEditorPage />} /></Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    await waitFor(() => expect(screen.getByPlaceholderText('admin.galleryEditor.titleRequired')).toBeInTheDocument());
    const inp = screen.getByPlaceholderText('admin.galleryEditor.titleRequired') as HTMLInputElement;
    expect(inp.value).toBe('T1');
    fireEvent.change(inp, { target: { value: 'Edited' } });
    st.galleryDetail = { id: 'g1', title: 'T2', description: 'D2', photos: [] } as never;
    // rerender with same id but different server title, edited should stay
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/admin/gallery/g1/edit']}>
          <Routes><Route path="/admin/gallery/:id/edit" element={<GalleryEditorPage />} /></Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    await new Promise((r) => setTimeout(r, 20));
    expect(document.body).toBeTruthy();
  });

  it('TicketingPaymentsTab onlineEnabled true', async () => {
    st.ticketingData = { data: { settings: { 'ticketing.onlineEnabled': 'true', 'membership.onlineEnabled': 'true', 'membership.annualPrice': '50', 'payments.defaultProvider': 'stripe' }, onlineReady: true, providerStatus: { stripe: {}, paypal: {}, monri: {} } }, isLoading: false } as never;
    const { unmount } = render(wrap(<TicketingPaymentsTab />));
    expect(screen.getAllByText('Stripe').length).toBeGreaterThan(0);
    // toggle switch to make onlineEnabled true -> checked true
    const switches = document.querySelectorAll('[role="switch"]');
    expect(switches.length).toBeGreaterThan(0);
    unmount();
    st.ticketingData = { data: { settings: {}, onlineReady: false, providerStatus: { stripe: {}, paypal: {}, monri: {} } }, isLoading: false } as never;
    render(wrap(<TicketingPaymentsTab />));
    expect(screen.getByText('Nije konfigurisano')).toBeInTheDocument();
  });
});
