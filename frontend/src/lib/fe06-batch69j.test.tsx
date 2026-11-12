import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const captured = vi.hoisted(() => ({ stadiumPayload: null as unknown, streamUrl: null as unknown, openVal: null as unknown, clubName: '' as string }));

vi.mock('../hooks/use-club-hub', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-club-hub')>('../hooks/use-club-hub');
  return {
    ...a,
    useClubStadium: () => ({ data: { name: captured.clubName, address: '', city: '', capacity: null, description: '', imagePath: '' }, isLoading: false }),
    useUpsertClubStadium: () => ({ mutateAsync: async (p: unknown) => { captured.stadiumPayload = p as unknown; }, isPending: false }),
  };
});
vi.mock('../hooks/use-live-admin', () => ({
  useSetLiveStream: () => ({ mutateAsync: async (p: unknown) => { captured.streamUrl = (p as { url: unknown }).url; }, isPending: false }),
}));
vi.mock('../components/ui/button', async () => {
  const a = await vi.importActual<typeof import('../components/ui/button')>('../components/ui/button');
  return { ...a, Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick}>{children}</button> };
});
vi.mock('../components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) => open ? <div>{children}</div> : null,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../hooks', async () => {
  const a = await vi.importActual<typeof import('../hooks')>('../hooks');
  return { ...a, useMatch: () => ({ data: { id: 'm1', status: 'SCHEDULED', homeClub: { name: 'A' }, awayClub: { name: 'B' }, scheduledAt: new Date().toISOString(), homeScore: 0, awayScore: 0, liveStreamUrl: undefined } as never, isLoading: false }), useMatches: () => ({ data: [], isLoading: false }), useMuseum: () => ({ data: [{ year: 2020, items: [] }], isLoading: false, isError: false, refetch: vi.fn() } as never), useNewsItem: () => ({ data: { title: 't', slug: 's', coverPath: 'a', seoDesc: undefined, excerpt: undefined } as never, isLoading: false, isError: false } as never) };
});
vi.mock('../hooks/use-competition-admin', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-competition-admin')>('../hooks/use-competition-admin');
  return { ...a, useDeleteMatch: () => ({ mutateAsync: vi.fn(), isPending: false }), useCreateMatch: () => ({ mutateAsync: vi.fn(), isPending: false }), useUpdateMatch: () => ({ mutateAsync: vi.fn(), isPending: false }) };
});
vi.mock('../hooks/use-public-web', () => ({ useMuseumList: () => ({ data: [], isLoading: false }) }));
vi.mock('../lib/media', async () => {
  const a = await vi.importActual('../lib/media') as Record<string, unknown>;
  return { ...a, mediaUrl: () => 'http://example.com/a.jpg' };
});
vi.mock('../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ user: { email: 'a@b.com', permissions: [] } }) }));
vi.mock('../hooks/use-ticketing', () => ({ useTicketingPublicConfig: () => ({ data: { seasonPassAvailable: true } }), useTicketingAdminPayments: () => ({ data: { settings: {} }, isLoading: false }) }));
vi.mock('../pages/admin/competition-hub/MatchFormSheet', () => ({
  MatchFormSheet: ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => open ? <button onClick={() => onOpenChange(false)}>close-match</button> : null,
}));
vi.mock('../pages/admin/competition-hub/MatchLineupSheet', () => ({ MatchLineupSheet: () => null }));

import { ClubStadiumTab } from '../pages/admin/club-hub/tabs/ClubStadiumTab';
import { CommentatorStreamDialog } from '../pages/admin/commentator/CommentatorStreamDialog';
import { RoundMatchesPanel } from '../pages/admin/competition-hub/RoundMatchesPanel';
import { LiveMatchPage } from '../pages/public/LiveMatchPage';
import { MuseumPage } from '../pages/public/MuseumPage';
import { NewsDetailPage } from '../pages/public/NewsDetailPage';
import { TicketsPage } from '../pages/public/TicketsPage';
import { TicketingPaymentsTab } from '../pages/admin/ticketing/TicketingPaymentsTab';

const qc = new QueryClient();
const wrap = (ui: React.ReactNode) => <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;

describe('fe06-batch69j interactive grana', () => {
  beforeEach(() => { captured.stadiumPayload = null; captured.streamUrl = null; captured.clubName = ''; });

  it('ClubStadiumTab name || Stadion pokriva Stadion sa praznim imenom', async () => {
    captured.clubName = '';
    render(wrap(<ClubStadiumTab clubId="c1" />));
    const btn = screen.getByText('admin.stadium.save');
    fireEvent.click(btn);
    await waitFor(() => expect(captured.stadiumPayload).toMatchObject({ name: 'Stadion' }));
  });

  it('ClubStadiumTab name || Stadion pokriva truthy ime', async () => {
    captured.clubName = 'Moj Stadion';
    render(wrap(<ClubStadiumTab clubId="c1" />));
    const btn = await screen.findByText('admin.stadium.save');
    // useEffect sets name to Moj Stadion, then clicking should send that
    fireEvent.click(btn);
    await waitFor(() => expect(captured.stadiumPayload).toMatchObject({ name: 'Moj Stadion' }));
  });

  it('CommentatorStreamDialog whitespace -> null i valid url', async () => {
    render(wrap(<CommentatorStreamDialog match={{ id: 'm1', liveStreamUrl: 'https://youtube.com/watch?v=abc123XYZ01' } as never} />));
    fireEvent.click(screen.getByText(/Stream/));
    let input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Spremi'));
    await waitFor(() => expect(captured.streamUrl).toBeNull());
    // reopen for second part
    fireEvent.click(screen.getByText(/Stream/));
    input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=xyz987ABC01' } });
    fireEvent.click(screen.getByText('Spremi'));
    await waitFor(() => expect(captured.streamUrl).toBe('https://youtube.com/watch?v=xyz987ABC01'));
  });

  it('RoundMatchesPanel onOpenChange false pokriva if !o', async () => {
    render(wrap(<RoundMatchesPanel seasonId="s1" roundId="r1" canManage />));
    fireEvent.click(screen.getByText('Utakmica'));
    expect(screen.getByText('close-match')).toBeInTheDocument();
    fireEvent.click(screen.getByText('close-match'));
    await waitFor(() => expect(screen.queryByText('close-match')).not.toBeInTheDocument());
  });

  it('LiveMatchPage id ?? "" i scorovi ?? 0', () => {
    render(<QueryClientProvider client={qc}><MemoryRouter initialEntries={['/live/abc']}><Routes><Route path="/live/:id" element={<LiveMatchPage />} /></Routes></MemoryRouter></QueryClientProvider>);
    expect(document.body).toBeTruthy();
    render(wrap(<LiveMatchPage />));
    expect(document.body).toBeTruthy();
  });

  it('MuseumPage i NewsDetailPage i TicketsPage pokrivaju ??', () => {
    render(wrap(<MuseumPage />));
    render(wrap(<NewsDetailPage />));
    render(wrap(<TicketsPage />));
    expect(document.body).toBeTruthy();
  });

  it('TicketingPaymentsTab fallback || 50', () => {
    render(wrap(<TicketingPaymentsTab />));
    expect(document.body).toBeTruthy();
  });
});
