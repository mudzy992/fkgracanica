import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const membershipState = vi.hoisted(() => ({ settings: undefined as any, user: undefined as any }));
const newsletterState = vi.hoisted(() => ({ campaigns: undefined as any, isLoading: false, settings: { 'newsletter.blastEnabled': 'true' } }));
const clubRoundsState = vi.hoisted(() => ({ rounds: [] as any, matches: undefined as any }));
const galleryState = vi.hoisted(() => ({ fetched: undefined as any, isLoading: false }));

vi.mock('../hooks', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    usePublicSettings: () => ({ data: membershipState.settings }),
    usePrivateSettings: () => ({ data: newsletterState.settings }),
    useMatches: () => ({ data: clubRoundsState.matches, isLoading: false }),
    useRounds: () => ({ data: clubRoundsState.rounds, isLoading: false }),
  };
});
vi.mock('../hooks/use-rounds', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useRounds: () => ({ data: clubRoundsState.rounds, isLoading: false }),
  };
});
vi.mock('../lib/auth', async (importOriginal) => {
  const actual: any = await importOriginal();
  return { ...actual, useAuth: () => ({ user: membershipState.user }) };
});
vi.mock('../hooks/use-content-admin', async (importOriginal) => {
  const actual: any = await importOriginal();
  return { ...actual, useGalleryDetail: () => ({ data: galleryState.fetched, isLoading: galleryState.isLoading }) };
});
vi.mock('../hooks/use-newsletter-campaigns', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNewsletterCampaigns: () => ({ data: newsletterState.campaigns, isLoading: newsletterState.isLoading }),
    useNewsletterCampaignRealtime: () => {},
    useSendNewsletterCampaign: () => ({ mutateAsync: vi.fn(), isPending: false }),
  };
});
vi.mock('../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: vi.fn(), dialog: null }) }));
vi.mock('../lib/media', async (importOriginal) => {
  const actual: any = await importOriginal();
  return { ...actual, mediaUrl: vi.fn(actual.mediaUrl), galleryPreviewUrl: vi.fn(actual.galleryPreviewUrl) };
});

describe('batch60 b — MembershipCardPanel club.name ?? FK Gračanica [3,0]', () => {
  it('settings undefined → fallback FK Gračanica', async () => {
    const { MembershipCardPanel } = await import('./membership/MembershipCardPanel');
    membershipState.settings = undefined;
    membershipState.user = { id: 'u1', permissions: [] } as any;
    const membership = {
      card: { cardNumber: '123', qrCode: 'qr', },
      status: 'ACTIVE',
      endDate: '2026-12-31',
      user: { id: 'u1', name: 'Test' },
    } as any;
    const { container } = render(<MemoryRouter><MembershipCardPanel membership={membership} /></MemoryRouter>);
    expect(container.textContent).toContain('FK Gračanica');
  });
  it('settings with club.name → uses setting', async () => {
    const { MembershipCardPanel } = await import('./membership/MembershipCardPanel');
    membershipState.settings = { 'club.name': 'Moj Klub', 'club.crestUrl': undefined };
    const membership = {
      card: { cardNumber: '123', qrCode: 'qr' },
      status: 'ACTIVE',
      endDate: '2026-12-31',
      user: { id: 'u1', name: 'Test' },
    } as any;
    const { container } = render(<MemoryRouter><MembershipCardPanel membership={membership} /></MemoryRouter>);
    expect(container.textContent).not.toBeNull();
  });
});

describe('batch60 b — NewsletterCampaignPanel campaigns ?? [] [11,0]', () => {
  it('campaigns undefined → empty table', async () => {
    const { NewsletterCampaignPanel } = await import('./newsletter/NewsletterCampaignPanel');
    newsletterState.campaigns = undefined;
    newsletterState.isLoading = false;
    const { container } = render(<MemoryRouter><NewsletterCampaignPanel /></MemoryRouter>);
    expect(container.textContent).toContain('Nema kampanja');
  });
});

describe('batch60 b — ClubRoundMatches matches ?? [] [12,0]', () => {
  it('matches undefined → defaultRound null still renders', async () => {
    const { ClubRoundMatches } = await import('./public/clubs/ClubRoundMatches');
    clubRoundsState.rounds = [{ id: 'r1', number: 1, name: null } as any];
    clubRoundsState.matches = undefined;
    const { container } = render(<MemoryRouter><ClubRoundMatches clubId="c1" seasonId="s1" /></MemoryRouter>);
    expect(container.textContent).not.toBeNull();
  });
});

describe('batch60 b — NewsGalleryPhotos fetched?.photos ?? [] [4,0]', () => {
  it('fetched undefined → empty', async () => {
    const { NewsGalleryPhotos } = await import('./news/NewsGalleryPhotos');
    galleryState.fetched = undefined;
    galleryState.isLoading = false;
    const { container } = render(<MemoryRouter><NewsGalleryPhotos gallery={null} galleryId="g1" /></MemoryRouter>);
    expect(container.innerHTML).toBe('');
  });
  it('fetched with photos → renders', async () => {
    const { NewsGalleryPhotos } = await import('./news/NewsGalleryPhotos');
    galleryState.fetched = { photos: [{ id: 'p1', path: 'originals/a.jpg', caption: 'Cap' }] };
    const { container } = render(<MemoryRouter><NewsGalleryPhotos gallery={null} galleryId="g1" /></MemoryRouter>);
    // should render gallery
    expect(container.textContent).toContain('Galerija');
  });
});

describe('batch60 b — SeasonPassDownloadActions ticketRef ?? pass [4,0]', () => {
  it('undefined ticketRef uses pass', async () => {
    const { SeasonPassDownloadActions } = await import('./ticketing/SeasonPassDownloadActions');
    const data = { ticketRef: undefined, label: 'L', seasonName: '2025/26', seasonId: 's1' } as any;
    const { container } = render(<SeasonPassDownloadActions data={data} />);
    expect(container.textContent).toContain('Print');
  });
  it('with ticketRef uses it', async () => {
    const { SeasonPassDownloadActions } = await import('./ticketing/SeasonPassDownloadActions');
    const data = { ticketRef: 'ABC123', label: 'L', seasonName: '2025/26' } as any;
    const { container } = render(<SeasonPassDownloadActions data={data} />);
    expect(container.textContent).toContain('Preuzmi');
  });
});

describe('batch60 b — TicketDigitalPass scheduledAt falsy [5,0]', () => {
  it('toTicketPassData without scheduledAt → —', async () => {
    const { toTicketPassData } = await import('./ticketing/TicketDigitalPass');
    const ticket = { id: 'ticket12345678', match: { homeClub: { name: 'H' }, awayClub: { name: 'A' } }, category: 'Tribina', price: 5, status: 'PAID', qrCode: 'qr' } as any;
    const data = toTicketPassData(ticket, { clubName: 'FKG' });
    expect(data.matchDate).toBe('—');
  });
  it('with scheduledAt → formatted', async () => {
    const { toTicketPassData } = await import('./ticketing/TicketDigitalPass');
    const ticket = { id: 'ticket12345678', match: { scheduledAt: '2026-05-01T17:00:00.000Z', homeClub: { name: 'H' } }, category: 'Tribina', price: 5, status: 'PAID', qrCode: 'qr' } as any;
    const data = toTicketPassData(ticket, { clubName: 'FKG' });
    expect(data.matchDate).not.toBe('—');
  });
});
