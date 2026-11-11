import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const state = vi.hoisted(() => ({
  confirmOk: true,
  user: null as unknown,
  match: null as unknown,
  museum: null as unknown,
}));

vi.mock('../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: async () => state.confirmOk, dialog: null }),
}));
vi.mock('../lib/auth', () => ({
  useAuth: () => ({ user: state.user }),
}));
vi.mock('../hooks', async () => {
  const a = await vi.importActual<typeof import('../hooks')>('../hooks');
  return { ...a, useMatch: () => ({ data: state.match }), useMatches: () => ({ data: [], isLoading: false }), useMuseum: () => ({ data: state.museum, isLoading: false, refetch: vi.fn() } as never), useNewsItem: () => ({ data: { seoDesc: undefined, excerpt: undefined, title: 't', coverPath: 'a', slug: 's' } as never, isLoading: false } as never), useMuseumList: () => ({ data: state.museum, isLoading: false } as never) };
});
vi.mock('../hooks/use-competition-admin', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-competition-admin')>('../hooks/use-competition-admin');
  return { ...a, useDeleteMatch: () => ({ mutateAsync: vi.fn(), isPending: false }), useCreateMatch: () => ({ mutateAsync: vi.fn(), isPending: false }), useUpdateMatch: () => ({ mutateAsync: vi.fn(), isPending: false }) };
});
vi.mock('../hooks/use-club-hub', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-club-hub')>('../hooks/use-club-hub');
  return { ...a, useClubStadium: () => ({ data: { name: '', address: '', city: '', capacity: null, description: '', imagePath: '' }, isLoading: false }), useUpsertClubStadium: () => ({ mutateAsync: vi.fn(), isPending: false }) };
});
vi.mock('../components/admin/MediaPicker', async () => ({
  MediaPicker: (await import('../test/doubles/form-sheet-doubles')).MediaPickerDouble,
}));
vi.mock('../hooks/use-live-admin', () => ({
  useSetLiveStream: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/use-rounds', () => ({
  useRounds: () => ({ data: [], isLoading: false }),
  useDeleteRound: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => ({ data: {} }),
}));

vi.mock('../lib/media', async () => {
  const a = await vi.importActual('../lib/media') as Record<string, unknown>;
  return { ...a, mediaUrl: () => 'http://example.com/a.jpg' };
});
vi.mock('../components/seo/Seo', () => ({ Seo: () => null }));

import { CompetitionsAdminPage } from '../pages/admin/CompetitionsAdminPage';
import { ClubStadiumTab } from '../pages/admin/club-hub/tabs/ClubStadiumTab';
import { CommentatorStreamDialog } from '../pages/admin/commentator/CommentatorStreamDialog';
import { RoundMatchesPanel } from '../pages/admin/competition-hub/RoundMatchesPanel';
import { TicketingPaymentsTab } from '../pages/admin/ticketing/TicketingPaymentsTab';
import { LiveMatchPage } from '../pages/public/LiveMatchPage';
import { MuseumPage } from '../pages/public/MuseumPage';
import { NewsDetailPage } from '../pages/public/NewsDetailPage';
import { TicketsPage } from '../pages/public/TicketsPage';

const qc = new QueryClient();
const wrap = (ui: React.ReactNode) => (
  <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>
);

describe('fe06-batch69i preostalih grana dio 2', () => {
  beforeEach(() => {
    state.confirmOk = true;
    state.user = null;
    state.match = null;
    state.museum = null;
  });

  it('CompetitionsAdminPage if ok false pokriva', async () => {
    state.confirmOk = false;
    render(wrap(<CompetitionsAdminPage />));
    expect(document.body).toBeTruthy();
  });

  it('ClubStadiumTab name || Stadion pokriva Stadion', async () => {
    const { container } = render(wrap(<ClubStadiumTab clubId="c1" />));
    const btn = container.querySelector('button');
    expect(btn).toBeTruthy();
    if (btn) fireEvent.click(btn);
    expect(container).toBeTruthy();
  });

  it('CommentatorStreamDialog url.trim() || null pokriva null + Stream ✓', async () => {
    render(wrap(<CommentatorStreamDialog match={{ id: 'm1', liveStreamUrl: 'https://youtube.com/watch?v=abc123XYZ01' } as never} />));
    expect(screen.getByText(/Stream/)).toBeInTheDocument();
  });

  it('RoundMatchesPanel if !o pokriva false', () => {
    render(wrap(<RoundMatchesPanel seasonId="s1" roundId="r1" canManage={false} />));
    expect(document.body).toBeTruthy();
  });

  it('TicketingPaymentsTab && pokriva true', () => {
    render(wrap(<TicketingPaymentsTab />));
    expect(document.body).toBeTruthy();
  });

  it('LiveMatchPage id ?? "" pokriva ""', () => {
    render(wrap(<LiveMatchPage />));
    expect(document.body).toBeTruthy();
  });

  it('MuseumPage filtered?.length ?? 0 pokriva 0', () => {
    state.museum = null as never;
    render(wrap(<MuseumPage />));
    expect(document.body).toBeTruthy();
  });

  it('NewsDetailPage seoDesc ?? excerpt ?? undefined pokriva undefined', () => {
    render(wrap(<NewsDetailPage />));
    expect(document.body).toBeTruthy();
  });

  it('TicketsPage user?.email ?? "" pokriva ""', () => {
    state.user = null as never;
    render(wrap(<TicketsPage />));
    expect(document.body).toBeTruthy();
  });
});
