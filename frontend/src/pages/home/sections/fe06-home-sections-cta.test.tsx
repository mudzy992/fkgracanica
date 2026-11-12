import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LatestNews } from './LatestNews';
import { LastResult } from './LastResult';
import { TicketsCTA } from './TicketsCTA';
import { MembershipCTA } from './MembershipCTA';

const state = vi.hoisted(() => ({
  gallery: { data: [] as unknown[] | undefined, isLoading: false },
  players: { data: [] as unknown[] | undefined, isLoading: false },
  trophies: { data: [] as unknown[] | undefined, isLoading: false },
  sponsors: { data: [] as unknown[] | undefined, isLoading: false },
  matches: { data: [] as unknown[] | undefined, isLoading: false },
  news: { data: [] as unknown[] | undefined, isLoading: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../../hooks', () => ({
  useGalleryList: () => state.gallery,
  usePlayers: () => state.players,
  useTrophies: () => state.trophies,
  useSponsors: () => state.sponsors,
  useMatches: () => state.matches,
  usePublishedNews: () => state.news,
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);
const past = '2020-05-01T17:00:00.000Z';

beforeEach(() => {
  state.gallery = { data: [], isLoading: false };
  state.players = { data: [], isLoading: false };
  state.trophies = { data: [], isLoading: false };
  state.sponsors = { data: [], isLoading: false };
  state.matches = { data: [], isLoading: false };
  state.news = { data: [], isLoading: false };
});

describe('LatestNews', () => {
  it('dok se učitava prikazuje tri kostura bez vijesti', () => {
    state.news = { data: undefined, isLoading: true };
    const { container } = wrap(<LatestNews />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(9);
    expect(screen.queryByRole('link', { name: /vijesti\// })).toBeNull();
  });

  it('prikazuje naslov, sažetak i datum', () => {
    state.news = {
      data: [
        {
          id: 'n1',
          slug: 'vijest-1',
          title: 'Pobjeda u derbiju',
          excerpt: '<p>Kratak <strong>sadržaj</strong></p>',
          publishedAt: '2026-02-03T10:00:00.000Z',
          coverPath: 'news/1.jpg',
        },
      ],
      isLoading: false,
    };
    const { container } = wrap(<LatestNews />);
    expect(screen.getByText('Pobjeda u derbiju')).toBeInTheDocument();
    expect(screen.getByText('Kratak sadržaj')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeNull();
    expect(screen.getAllByRole('link').some((a) => a.getAttribute('href') === '/vijesti/vijest-1')).toBe(true);
  });

  it('bez sažetka i datuma ne prikazuje tekst', () => {
    state.news = { data: [{ id: 'n2', slug: 'v', title: 'Bez detalja' }], isLoading: false };
    wrap(<LatestNews />);
    expect(screen.getByText('Bez detalja')).toBeInTheDocument();
  });
});

describe('LastResult', () => {
  it('od više završenih utakmica bira najnoviju', () => {
    state.matches = {
      data: [
        { id: 'm-old', status: 'FINISHED', scheduledAt: '2020-01-01T17:00:00.000Z', homeScore: 1, awayScore: 2, homeClub: { shortName: 'DOM' }, awayClub: { shortName: 'GOS' } },
        { id: 'm-new', status: 'FINISHED', scheduledAt: '2026-02-01T17:00:00.000Z', homeScore: 3, awayScore: 0, homeClub: { shortName: 'DOM' }, awayClub: { shortName: 'GOS' } },
      ],
      isLoading: false,
    };
    const { container } = wrap(<LastResult />);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/utakmice/m-new');
    expect(screen.getByText(/3\s*:/)).toBeInTheDocument();
  });

  it('prikazuje najnoviji završeni rezultat sa skraćenim imenima', () => {
    state.matches = {
      data: [
        {
          id: 'm1',
          status: 'FINISHED',
          scheduledAt: past,
          homeScore: 3,
          awayScore: 1,
          homeClub: { name: 'FK Gračanica', shortName: 'FKG' },
          awayClub: { name: 'FK Slavija', shortName: null },
        },
      ],
      isLoading: false,
    };
    wrap(<LastResult />);
    expect(screen.getByText(/FKG 3 :/)).toBeInTheDocument();
    expect(screen.getByText(/FK Slavija/)).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/utakmice/m1');
  });

  it('bez završene utakmice prikazuje poruku', () => {
    state.matches = { data: [{ id: 'm1', status: 'LIVE' }], isLoading: false };
    wrap(<LastResult />);
    expect(screen.getByText('t:common.noResults')).toBeInTheDocument();
  });
});

describe('CTA sekcije', () => {
  it('TicketsCTA prikazuje naslov i dugme', () => {
    wrap(<TicketsCTA />);
    expect(screen.getByRole('heading', { name: 't:home.tickets' })).toBeInTheDocument();
    expect(screen.getByText('t:home.ticketsDesc')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 't:home.tickets' })).toBeInTheDocument();
  });

  it('MembershipCTA vodi na /clanstvo', () => {
    wrap(<MembershipCTA />);
    expect(screen.getByRole('heading', { name: 't:home.membership' })).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/clanstvo');
  });
});
