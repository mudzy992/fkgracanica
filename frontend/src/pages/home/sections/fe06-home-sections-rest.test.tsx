import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GallerySection } from './GallerySection';
import { FeaturedPlayers } from './FeaturedPlayers';
import { TrophiesSection } from './TrophiesSection';
import { SponsorsSection } from './SponsorsSection';
import { NextMatch } from './NextMatch';

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
const future = '2031-05-01T17:00:00.000Z';
const past = '2020-05-01T17:00:00.000Z';

beforeEach(() => {
  state.gallery = { data: [], isLoading: false };
  state.players = { data: [], isLoading: false };
  state.trophies = { data: [], isLoading: false };
  state.sponsors = { data: [], isLoading: false };
  state.matches = { data: [], isLoading: false };
  state.news = { data: [], isLoading: false };
});

describe('GallerySection', () => {
  it('dok se učitava prikazuje četiri kostura', () => {
    state.gallery = { data: undefined, isLoading: true };
    const { container } = wrap(<GallerySection />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(4);
  });

  it('prikazuje najviše četiri albuma sa slikom i linkom', () => {
    state.gallery = {
      data: Array.from({ length: 6 }, (_, i) => ({
        id: `g${i}`,
        slug: `album-${i}`,
        title: `Album ${i}`,
        photos: i === 0 ? [] : [{ path: `gal/${i}.jpg` }],
      })),
      isLoading: false,
    };
    const { container } = wrap(<GallerySection />);
    expect(screen.getAllByRole('link')).toHaveLength(5);
    expect(screen.getAllByText('Album 0').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('img')).toHaveLength(3);
  });
});

describe('FeaturedPlayers', () => {
  it('prikazuje samo aktivne igrače', () => {
    state.players = {
      data: [
        { id: 'p1', firstName: 'Amar', lastName: 'Hodžić', position: 'GK', number: 1, isActive: true },
        { id: 'p2', firstName: 'Emir', lastName: 'Softić', position: 'DEF', isActive: false },
      ],
      isLoading: false,
    };
    wrap(<FeaturedPlayers />);
    expect(screen.getByText('Amar Hodžić')).toBeInTheDocument();
    expect(screen.queryByText('Emir Softić')).toBeNull();
    expect(screen.getByText('GK')).toBeInTheDocument();
  });

  it('bez fotografije prikazuje broj, inače sliku', () => {
    state.players = {
      data: [
        { id: 'p1', firstName: 'A', lastName: 'B', position: 'GK', number: 9, isActive: true },
        { id: 'p2', firstName: 'C', lastName: 'D', position: 'DEF', isActive: true, photoPath: 'p/2.jpg' },
      ],
      isLoading: false,
    };
    const { container } = wrap(<FeaturedPlayers />);
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('dok se učitava prikazuje kosture', () => {
    state.players = { data: undefined, isLoading: true };
    const { container } = wrap(<FeaturedPlayers />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
  });
});

describe('TrophiesSection', () => {
  it('prikazuje trofeje sa takmičenjem i bez njega', () => {
    state.trophies = {
      data: [
        { id: 't1', year: 2024, name: 'Kup', competition: 'Kup BiH' },
        { id: 't2', year: 2023, name: 'Liga' },
      ],
      isLoading: false,
    };
    wrap(<TrophiesSection />);
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('Kup BiH')).toBeInTheDocument();
    expect(screen.getByText('Liga')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/trofeji');
  });

  it('dok se učitava prikazuje kosture', () => {
    state.trophies = { data: undefined, isLoading: true };
    const { container } = wrap(<TrophiesSection />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
  });
});

describe('SponsorsSection', () => {
  it('prikazuje logo ili ime i vanjski link', () => {
    state.sponsors = {
      data: [
        { id: 's1', name: 'BH Telecom', url: 'https://bh.ba', logoPath: 'sp/logo.png' },
        { id: 's2', name: 'Mtel', url: null, logoPath: null },
      ],
      isLoading: false,
    };
    wrap(<SponsorsSection />);
    expect(screen.getByRole('img', { name: 'BH Telecom' })).toBeInTheDocument();
    expect(screen.getByText('Mtel')).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links[1].getAttribute('href')).toBe('https://bh.ba');
    expect(links[1]).toHaveAttribute('target', '_blank');
    expect(links[2].getAttribute('href')).toBe('#');
  });
});

describe('NextMatch', () => {
  const match = (over: Record<string, unknown> = {}) => ({
    id: 'm1',
    status: 'SCHEDULED',
    scheduledAt: future,
    homeClub: { name: 'FK Gračanica' },
    awayClub: { name: 'FK Slavija' },
    venue: 'Gradski stadion',
    roundRel: { number: 5, name: '5. kolo' },
    ...over,
  });

  it('prikazuje najbližu buduću utakmicu', () => {
    state.matches = { data: [match(), match({ id: 'm2', scheduledAt: '2032-01-01T10:00:00.000Z' })], isLoading: false };
    wrap(<NextMatch />);
    expect(screen.getByText(/FK Gračanica vs/)).toBeInTheDocument();
    expect(screen.getByText('Gradski stadion')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/utakmice/m1');
  });

  it('bez buduće utakmice prikazuje poruku', () => {
    state.matches = { data: [match({ scheduledAt: past }), match({ status: 'FINISHED' })], isLoading: false };
    wrap(<NextMatch />);
    expect(screen.getByText('t:common.noResults')).toBeInTheDocument();
  });

  it('koristi rezervne nazive i labelu bez kola', () => {
    state.matches = { data: [match({ homeClub: null, awayClub: null, roundRel: null, venue: null })], isLoading: false };
    wrap(<NextMatch />);
    expect(screen.getByText(/t:home.teamHome vs/)).toBeInTheDocument();
    expect(screen.getByText(/t:home.teamAway/)).toBeInTheDocument();
    expect(screen.getByText('Utakmica')).toBeInTheDocument();
  });
});
