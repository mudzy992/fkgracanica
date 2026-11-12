import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubTimelinePage } from './ClubTimelinePage';

const state = vi.hoisted(() => ({
  ownClub: { data: undefined as unknown, isLoading: false },
  timeline: { data: undefined as unknown, isLoading: false },
  hallOfFame: { data: undefined as unknown },
  seo: [] as Record<string, unknown>[],
  coldOpen: [] as Record<string, unknown>[],
  film: [] as Record<string, unknown>[],
  coda: [] as Record<string, unknown>[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useOwnClub: () => state.ownClub,
  useClubTimeline: () => state.timeline,
  useHallOfFame: () => state.hallOfFame,
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: (props: Record<string, unknown>) => {
    state.seo.push(props);
    return null;
  },
}));
vi.mock('../../components/public/story/ClubStoryColdOpen', () => ({
  ClubStoryColdOpen: (props: Record<string, unknown>) => {
    state.coldOpen.push(props);
    return <div data-testid="cold-open" />;
  },
}));
vi.mock('../../components/public/story/ClubStoryFilm', () => ({
  ClubStoryFilm: (props: Record<string, unknown>) => {
    state.film.push(props);
    return <div data-testid="story-film" />;
  },
}));
vi.mock('../../components/public/story/ClubStoryCoda', () => ({
  ClubStoryCoda: (props: Record<string, unknown>) => {
    state.coda.push(props);
    return <div data-testid="story-coda" />;
  },
}));

const chapter = (id: string, year: number, extra: Record<string, unknown> = {}) => ({
  id,
  year,
  title: `Naslov ${id}`,
  imagePath: null,
  ...extra,
});

describe('ClubTimelinePage', () => {
  beforeEach(() => {
    state.ownClub = { data: undefined, isLoading: false };
    state.timeline = { data: undefined, isLoading: false };
    state.hallOfFame = { data: undefined };
    state.seo = [];
    state.coldOpen = [];
    state.film = [];
    state.coda = [];
  });

  it('dok se podaci učitavaju prikazuje skeleton uz SEO', () => {
    state.timeline = { data: undefined, isLoading: true };
    const { container } = render(<ClubTimelinePage />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    expect(state.seo[0]).toEqual({ title: 'pages.club.aboutClub', description: 'pages.club.timelineSeoDesc' });
    expect(state.coldOpen).toHaveLength(0);
  });

  it('skeleton se prikazuje i dok se klub učitava', () => {
    state.ownClub = { data: undefined, isLoading: true };
    state.timeline = { data: [chapter('a', 1950)], isLoading: false };
    const { container } = render(<ClubTimelinePage />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('bez poglavlja prikazuje prazno stanje i cold open bez prve godine', () => {
    render(<ClubTimelinePage />);
    expect(screen.getByTestId('cold-open')).toBeTruthy();
    expect(screen.getByText('pages.club.timelineEmpty')).toBeTruthy();
    expect(state.coldOpen[0].firstYear).toBeUndefined();
    expect(state.film).toHaveLength(0);
  });

  it('poglavlja se sortiraju i prikazuju u filmu', () => {
    state.timeline = { data: [chapter('b', 1999), chapter('a', 1950)], isLoading: false };
    render(<ClubTimelinePage />);
    const events = state.film[0].events as { id: string }[];
    expect(events.map((e) => e.id)).toEqual(['a', 'b']);
    expect(state.coldOpen[0].firstYear).toBe(1950);
  });

  it('SEO opis koristi opis kluba kada postoji', () => {
    state.ownClub = { data: { description: 'Opis kluba' }, isLoading: false };
    render(<ClubTimelinePage />);
    expect(state.seo[0].description).toBe('Opis kluba');
  });

  it('storyImages uzima najviše dvije slike iz poglavlja', () => {
    state.timeline = {
      data: [
        chapter('a', 1950, { imagePath: 'originals/a.jpg' }),
        chapter('b', 1960, { imagePath: null }),
        chapter('c', 1970, { imagePath: 'originals/c.jpg' }),
        chapter('d', 1980, { imagePath: 'originals/d.jpg' }),
      ],
      isLoading: false,
    };
    render(<ClubTimelinePage />);
    expect(state.coda[0].storyImages).toEqual(['originals/a.jpg', 'originals/c.jpg']);
  });

  it('naslijeđe koristi photoPath prvog unosa sa slikom', () => {
    state.timeline = { data: [chapter('a', 1950)], isLoading: false };
    state.hallOfFame = {
      data: [
        { id: 'h0' },
        { id: 'h1', photoPath: 'originals/h1.jpg', imagePath: 'originals/h1b.jpg' },
        { id: 'h2', photoPath: null, imagePath: 'originals/h2.jpg' },
      ],
    };
    render(<ClubTimelinePage />);
    expect(state.coda[0].heritageImage).toBe('originals/h1.jpg');
  });

  it('naslijeđe pada na imagePath kada photoPath nema', () => {
    state.timeline = { data: [chapter('a', 1950)], isLoading: false };
    state.hallOfFame = { data: [{ id: 'h2', photoPath: null, imagePath: 'originals/h2.jpg' }] };
    render(<ClubTimelinePage />);
    expect(state.coda[0].heritageImage).toBe('originals/h2.jpg');
  });

  it('bez naslijeđa coda dobija undefined sliku', () => {
    state.timeline = { data: [chapter('a', 1950)], isLoading: false };
    state.hallOfFame = { data: [] };
    render(<ClubTimelinePage />);
    expect(state.coda[0].heritageImage).toBeUndefined();
  });
});
