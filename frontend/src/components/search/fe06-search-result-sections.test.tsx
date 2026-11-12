import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { SearchResponse } from '../../types/search';
import { SearchResultSections } from './SearchResultSections';

const empty = {
  news: [],
  players: [],
  clubs: [],
  matches: [],
  galleries: [],
  trophies: [],
  timeline: [],
  hallOfFame: [],
};

const data = {
  ...empty,
  facets: { news: 1, players: 1, clubs: 2, matches: 1, galleries: 1, trophies: 1, timeline: 1, hallOfFame: 2 },
  news: [{ id: 'n1', slug: 'derbi', title: 'Derbi u Gračanici' }],
  players: [{ id: 'p1', firstName: 'Amar', lastName: 'Hodžić' }],
  clubs: [
    { id: 'c1', name: 'FK Gračanica', slug: 'fk-gracanica' },
    { id: 'c2', name: 'Bez Sluga', slug: null },
  ],
  matches: [{ id: 'm1', homeClub: { name: 'FK Gračanica' }, awayClub: { name: 'FK Slavija' } }],
  galleries: [{ id: 'g1', slug: 'gal-1', title: 'Galerija derbija' }],
  trophies: [{ id: 't1', name: 'Kup BiH', year: 1998 }],
  timeline: [{ id: 'e1', title: 'Osnivanje kluba' }],
  hallOfFame: [
    { id: 'h1', name: 'Legenda Jedan', role: 'Napadač' },
    { id: 'h2', name: 'Legenda Dva', role: null },
  ],
} as unknown as SearchResponse;

const renderSections = (value: SearchResponse, type?: SearchResponse['type']) =>
  render(
    <MemoryRouter>
      <SearchResultSections data={value} type={type} />
    </MemoryRouter>,
  );

describe('SearchResultSections', () => {
  it('bez pogodaka ne prikazuje nijednu sekciju', () => {
    const { container } = renderSections({ ...empty, facets: data.facets } as unknown as SearchResponse);
    expect(container.querySelectorAll('section')).toHaveLength(0);
  });

  it('prikazuje samo sekcije sa rezultatima i njihove naslove', () => {
    renderSections(data);
    expect(screen.getByRole('heading', { name: 'Vijesti' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Igrači' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Klubovi' })).toBeTruthy();
    expect(screen.getByText('Derbi u Gračanici')).toBeTruthy();
    expect(screen.getByText('Amar Hodžić')).toBeTruthy();
    expect(screen.getByText('FK Gračanica vs FK Slavija')).toBeTruthy();
    expect(screen.getByText('Kup BiH (1998)')).toBeTruthy();
    expect(screen.getByText('Osnivanje kluba')).toBeTruthy();
    expect(screen.getByText('Legenda Jedan — Napadač')).toBeTruthy();
    expect(screen.getByText('Legenda Dva')).toBeTruthy();
  });

  it('vodi na ispravne rute za svaku vrstu rezultata', () => {
    renderSections(data);
    const href = (name: string) => screen.getByText(name).closest('a')?.getAttribute('href');
    expect(href('Derbi u Gračanici')).toBe('/vijesti/derbi');
    expect(href('Amar Hodžić')).toContain('/igrac/p1');
    expect(href('FK Gračanica')).toBe('/klub/fk-gracanica');
    expect(href('FK Gračanica vs FK Slavija')).toBe('/utakmice/m1');
    expect(href('Galerija derbija')).toBe('/galerija/gal-1');
    expect(href('Osnivanje kluba')).toBe('/o-klubu#e1');
    expect(screen.getByText('Legenda Dva').closest('a')?.getAttribute('href')).toBe('/hall-of-fame');
  });

  it('klub bez sluga nije link', () => {
    renderSections(data);
    expect(screen.getByText('Bez Sluga').closest('a')).toBeNull();
  });

  it('sa zadatim tipom prikazuje samo tu sekciju i bez naslova', () => {
    renderSections(data, 'trophies');
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Kup BiH (1998)')).toBeTruthy();
    expect(screen.queryByText('Derbi u Gračanici')).toBeNull();
  });

  it('zadati tip bez rezultata prikazuje praznu sekciju', () => {
    const { container } = renderSections({ ...empty, facets: data.facets } as unknown as SearchResponse, 'news');
    expect(container.querySelectorAll('section')).toHaveLength(1);
    expect(container.textContent).toBe('');
  });
});

describe('SearchResultSections — odgovor bez sekcija (batch 34)', () => {
  it('izostavljeni ključevi se tretiraju kao prazne liste', () => {
    const { container } = renderSections({} as SearchResponse);
    expect(container.querySelectorAll('section')).toHaveLength(0);
  });

  it('zadati tip bez podataka prikazuje praznu sekciju bez pada', () => {
    const { container } = renderSections({} as SearchResponse, 'news');
    expect(container.querySelectorAll('section')).toHaveLength(1);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('svaki tip pojedinačno radi i kad ostali ključevi nedostaju', () => {
    for (const type of ['news', 'players', 'clubs', 'matches', 'galleries', 'trophies', 'timeline', 'hallOfFame'] as const) {
      const { container, unmount } = renderSections({} as SearchResponse, type);
      expect(container.querySelectorAll('section')).toHaveLength(1);
      unmount();
    }
  });
});

