import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => true };
});
vi.mock('../hooks', () => ({
  useOwnClub: () => ({ data: null }),
  usePlayers: () => ({ data: [], isLoading: false }),
  useClubs: () => ({ data: [] }),
  useMatches: () => ({ data: [{ id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' }, status: 'SCHEDULED', scheduledAt: new Date().toISOString() }] }),
}));
vi.mock('../lib/media', async () => {
  const actual = await vi.importActual<typeof import('../lib/media')>('../lib/media');
  return { ...actual, mediaUrl: (p: string) => (p ? `https://cdn/${p}` : undefined) };
});
vi.mock('../cms/widgets/hero/hero-match-utils', () => ({
  isHeroMatchDockVisible: () => true,
  pickNextAndLast: () => ({ next: { id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' }, scheduledAt: new Date().toISOString() }, last: null }),
}));

import { CtaBandWidget } from '../cms/widgets/CtaBandWidget';
import { FeaturedPlayersWidget } from '../cms/widgets/FeaturedPlayersWidget';
import { HeroMatchDock } from '../cms/widgets/hero/HeroMatchDock';
import { MatchScoreHero } from './match/MatchScoreHero';
import { TeamCinematicHero } from './team/TeamCinematicHero';
import { SponsorsCinematicHero } from './public/sponsors/SponsorsCinematicHero';
import { ClubStoryChapter } from './public/story/ClubStoryChapter';
import { ClubStoryCoda } from './public/story/ClubStoryCoda';
import { LeagueCinematicHero } from './public/league/LeagueCinematicHero';

describe('reduce-motion — branch45 (7x1 reduce true)', () => {
  it('CtaBandWidget reduce true', () => {
    const { container } = render(
      <MemoryRouter><CtaBandWidget config={{ title: 'T', text: 'txt', buttons: [{ label: 'B', url: '/a', variant: 'primary' as never }] } as never} /></MemoryRouter>,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('FeaturedPlayersWidget reduce true', () => {
    const { container } = render(<MemoryRouter><FeaturedPlayersWidget config={{ limit: 2, title: 'T' } as never} /></MemoryRouter>);
    expect(container.firstChild).toBeTruthy();
  });

  it('HeroMatchDock reduce true', () => {
    const { container } = render(<MemoryRouter><HeroMatchDock showLast={true} /></MemoryRouter>);
    expect(container.firstChild).toBeTruthy();
  });

  it('MatchScoreHero reduce true', () => {
    const { container } = render(<MemoryRouter><MatchScoreHero homeClub={{ name: 'A', slug: 'a' } as never} awayClub={{ name: 'B' } as never} homeScore={1} awayScore={0} live /></MemoryRouter>);
    expect(container.firstChild).toBeTruthy();
  });

  it('TeamCinematicHero reduce true', () => {
    const { container } = render(<MemoryRouter><TeamCinematicHero club={{ name: 'FK', slogan: 'S' } as never} stats={undefined as never} /></MemoryRouter>);
    expect(container.firstChild).toBeTruthy();
  });

  it('SponsorsCinematicHero reduce true', () => {
    const { container } = render(<SponsorsCinematicHero totalCount={5} premiumCount={2} partnerCount={3} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('ClubStoryChapter i Coda reduce true', () => {
    const { container: c1 } = render(<ClubStoryChapter event={{ id: 'e1', year: 2020, title: 'T', description: 'D', imagePath: 'a.jpg' } as never} />);
    expect(c1.firstChild).toBeTruthy();
    const { container: c2 } = render(<MemoryRouter><ClubStoryCoda storyImages={['a.jpg', 'b.jpg']} heritageImage={'c.jpg'} /></MemoryRouter>);
    expect(c2.firstChild).toBeTruthy();
  });

  it('LeagueCinematicHero reduce true', () => {
    const { container } = render(<LeagueCinematicHero season={null} teamCount={10} roundsPlayed={5} leaderName={'FK'} leaderPoints={12} />);
    expect(container.firstChild).toBeTruthy();
  });
});
