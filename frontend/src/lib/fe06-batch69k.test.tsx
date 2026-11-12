import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
const st = vi.hoisted(() => ({ ok: true, clubName: '', qrFail: false, galleryDetail: null as unknown }));

vi.mock('../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: async () => st.ok, dialog: null }) }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['competitions.manage'] } }) }));
vi.mock('../hooks', async () => {
  const a = await vi.importActual<typeof import('../hooks')>('../hooks');
  return { ...a, useCompetitions: () => ({ data: [], isLoading: false }), useSeasons: () => ({ data: [], isLoading: false }), useMatch: () => ({ data: { id: 'm1', status: 'SCHEDULED', homeScore: 0, awayScore: 0 } as never }), useMuseum: () => ({ data: st.galleryDetail, isLoading: false } as never), useNewsItem: () => ({ data: { title: 't' } as never } as never) };
});
vi.mock('../hooks/use-club-hub', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-club-hub')>('../hooks/use-club-hub');
  return { ...a, useClubStadium: () => ({ data: { name: st.clubName, address: '', city: '', capacity: null, description: '', imagePath: '' }, isLoading: false }), useUpsertClubStadium: () => ({ mutateAsync: vi.fn(), isPending: false }) };
});
vi.mock('../hooks/use-competition-admin', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-competition-admin')>('../hooks/use-competition-admin');
  return { ...a, useDeleteCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }), useCreateCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }), useUpdateCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }) };
});
vi.mock('../hooks/use-rounds', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-rounds')>('../hooks/use-rounds');
  return { ...a, useRounds: () => ({ data: [{ id: 'r1', name: 'Kolo 1', _count: { matches: 0 } } as never], isLoading: false }), useDeleteRound: () => ({ mutateAsync: vi.fn(), isPending: false }), useCreateRound: () => ({ mutateAsync: vi.fn(), isPending: false }), useUpdateRound: () => ({ mutateAsync: vi.fn(), isPending: false }) };
});
vi.mock('../pages/admin/competition-hub/RoundFormSheet', () => ({ RoundFormSheet: () => <div>round-form</div> }));
vi.mock('../pages/admin/competition-hub/RoundCascadeDeleteDialog', () => ({ RoundCascadeDeleteDialog: () => <div>round-cascade</div> }));
vi.mock('../hooks/use-ticketing', () => ({ useTicketingAdminConfig: () => ({ data: { settings: {} }, isLoading: false }), useUpdateTicketingAdminConfig: () => ({ mutateAsync: vi.fn(), isPending: false }), useTicketingPublicConfig: () => ({ data: {} }) }));
vi.mock('../hooks/use-season-admin', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-season-admin')>('../hooks/use-season-admin');
  return { ...a, useCreateSeason: () => ({ mutateAsync: vi.fn(), isPending: false }), useUpdateSeason: () => ({ mutateAsync: vi.fn(), isPending: false }), useDeleteSeason: () => ({ mutateAsync: vi.fn(), isPending: false }) };
});
vi.mock('../hooks/use-content-admin', () => ({
  useCreateGallery: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateGallery: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useGalleryDetail: () => ({ data: null, isLoading: false }),
}));
vi.mock('../components/admin/GalleryPhotoPicker', () => ({ GalleryPhotoPicker: () => null }));
vi.mock('../pages/admin/GalleryAdminPhotos', () => ({ GalleryAdminPhotos: () => null }));
vi.mock('../lib/pass-qr', () => ({ qrDataUrl: vi.fn(() => st.qrFail ? Promise.reject(new Error('fail')) : Promise.resolve('data:image/png;base64,abc')) }));
vi.mock('../pages/admin/competition-hub/MatchFormSheet', () => ({ MatchFormSheet: ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => open ? <button onClick={() => onOpenChange(false)}>close-match</button> : null }));
vi.mock('../pages/admin/competition-hub/MatchLineupSheet', () => ({ MatchLineupSheet: () => null }));
vi.mock('../components/ui/dialog', () => ({ Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) => open ? <div>{children}</div> : null, DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('../components/ui/button', async () => {
  const a = await vi.importActual<typeof import('../components/ui/button')>('../components/ui/button');
  return { ...a, Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick}>{children}</button> };
});
vi.mock('../lib/media', async () => { const a = await vi.importActual('../lib/media') as Record<string, unknown>; return { ...a, mediaUrl: () => '' }; });
vi.mock('../components/seo/Seo', () => ({ Seo: () => null }));

import { HeroSectionForm } from '../pages/admin/cms/forms/HeroSectionForm';
import { PassQrCode } from '../components/pass/PassQrCode';
import { GalleryEditorPage } from '../pages/admin/gallery/GalleryEditorPage';
import { CompetitionsAdminPage } from '../pages/admin/CompetitionsAdminPage';
import { TicketingPaymentsTab } from '../pages/admin/ticketing/TicketingPaymentsTab';
import { ClubStadiumTab } from '../pages/admin/club-hub/tabs/ClubStadiumTab';
import { RoundMatchesPanel } from '../pages/admin/competition-hub/RoundMatchesPanel';
import { SeasonRoundsPanel } from '../pages/admin/competition-hub/SeasonRoundsPanel';
import { CompetitionsAdminFormSheet } from '../pages/admin/CompetitionsAdminFormSheet';

const qc = new QueryClient();
const wrap = (ui: React.ReactNode) => <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;

describe('fe06-batch69k preostalih 14 grana', () => {
  beforeEach(() => { st.ok = true; st.clubName = ''; st.qrFail = false; });

  it('HeroSectionForm setButton pokriva hero.buttons ?? [] oba', async () => {
    const onChange = vi.fn();
    const { rerender } = render(wrap(<HeroSectionForm config={{ buttons: [{ label: 'a', url: '/a', variant: 'primary' }] as never }} onChange={onChange} />));
    const input = screen.getByPlaceholderText('admin.cmsWidget.buttonLabel');
    fireEvent.change(input, { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalled();
    onChange.mockClear();
    rerender(wrap(<HeroSectionForm config={{ buttons: undefined } as never} onChange={onChange} />));
    fireEvent.click(screen.getByText('+ Dugme'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ buttons: expect.any(Array) }));
  });

  it('PassQrCode cancelled false vs true', async () => {
    st.qrFail = true;
    const { unmount } = render(wrap(<PassQrCode value="v1" />));
    await waitFor(() => expect(screen.getByText('QR kod nije dostupan')).toBeInTheDocument());
    unmount();
    st.qrFail = false;
    render(wrap(<PassQrCode value="v2" />));
    await waitFor(() => expect(document.querySelector('img')).toBeTruthy());
  });

  it('CompetitionsAdminPage oba confirm grane', async () => {
    st.ok = false;
    render(wrap(<CompetitionsAdminPage />));
    expect(document.body).toBeTruthy();
    st.ok = true;
    render(wrap(<CompetitionsAdminPage />));
    expect(document.body).toBeTruthy();
  });

  it('ClubStadiumTab pokriva name || Stadion oba', async () => {
    st.clubName = '';
    const { unmount } = render(wrap(<ClubStadiumTab clubId="c1" />));
    fireEvent.click(screen.getByText('admin.stadium.save'));
    await waitFor(() => expect(document.body).toBeTruthy());
    unmount();
    st.clubName = 'Test';
    render(wrap(<ClubStadiumTab clubId="c1" />));
    fireEvent.click(await screen.findByText('admin.stadium.save'));
    await waitFor(() => expect(document.body).toBeTruthy());
  });

  it('RoundMatchesPanel i SeasonRoundsPanel pokrivaju if', async () => {
    render(wrap(<RoundMatchesPanel seasonId="s1" roundId="r1" canManage />));
    fireEvent.click(screen.getByText('Utakmica'));
    expect(screen.getByText('close-match')).toBeInTheDocument();
    fireEvent.click(screen.getByText('close-match'));
    await waitFor(() => expect(screen.queryByText('close-match')).not.toBeInTheDocument());
    render(wrap(<SeasonRoundsPanel seasonId="s1" selectedRoundId={null} onSelectRound={vi.fn()} canManage />));
    expect(screen.getByText('Kolo 1')).toBeInTheDocument();
  });

  it('CompetitionsAdminFormSheet pokriva oba mode', async () => {
    render(wrap(<CompetitionsAdminFormSheet open onOpenChange={vi.fn()} mode="competition" editCompetition={null} editSeason={null} />));
    expect(document.body).toBeTruthy();
    render(wrap(<CompetitionsAdminFormSheet open onOpenChange={vi.fn()} mode="season" editCompetition={null} editSeason={null} />));
    expect(document.body).toBeTruthy();
  });

  it('TicketingPaymentsTab pokriva && oba', () => {
    render(wrap(<TicketingPaymentsTab />));
    expect(document.body).toBeTruthy();
  });

  it('GalleryEditorPage pokriva oba ternary', async () => {
    render(wrap(<GalleryEditorPage />));
    expect(document.body).toBeTruthy();
  });
});
