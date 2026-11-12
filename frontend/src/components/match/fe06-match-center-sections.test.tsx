import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MatchLineupSection, MatchRelatedNewsSection } from './MatchCenterSections';
import type { Match } from '../../types';

vi.mock('../../lib/motion/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const player = (id: string, first: string, last: string, clubId = 'c1') => ({
  id,
  firstName: first,
  lastName: last,
  clubId,
});

const lineupRow = (over: Record<string, unknown>) =>
  ({ id: `l-${over.playerId ?? 'x'}`, clubId: 'c1', playerId: 'p1', isStarter: true, ...over }) as never;

const match = (over: Record<string, unknown> = {}) =>
  ({
    id: 'm1',
    homeClubId: 'c1',
    awayClubId: 'c2',
    homeClub: { name: 'FK Gračanica' },
    awayClub: { name: 'FK Slavija' },
    lineup: [
      lineupRow({ playerId: 'p1', player: player('p1', 'Amar', 'Hodžić') }),
      lineupRow({ clubId: 'c2', playerId: 'p2', player: player('p2', 'Emir', 'Karić', 'c2') }),
      lineupRow({ clubId: 'c1', playerId: 'p3', isStarter: false, player: player('p3', 'Rezervni', 'Igrač') }),
    ],
    ...over,
  }) as unknown as Match;

const renderWithRouter = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('MatchLineupSection', () => {
  it('bez sastava ne renderuje ništa', () => {
    const { container } = renderWithRouter(<MatchLineupSection match={match({ lineup: [] })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('prikazuje naslov i oba kluba sa startnim i rezervnim igračima', () => {
    renderWithRouter(<MatchLineupSection match={match()} />);
    expect(screen.getByText('Postave')).toBeTruthy();
    expect(screen.getByText('FK Gračanica')).toBeTruthy();
    expect(screen.getByText('FK Slavija')).toBeTruthy();
    expect(screen.getAllByText('Startna postava')).toHaveLength(2);
  });

  it('igrači su podijeljeni po klubu', () => {
    renderWithRouter(<MatchLineupSection match={match()} />);
    const home = screen.getByText('FK Gračanica').closest('.glass-premium') as HTMLElement;
    expect(within(home).getByText('Amar Hodžić')).toBeTruthy();
    expect(within(home).queryByText('Emir Karić')).toBeNull();
  });

  it('koristi lineups kad lineup nedostaje', () => {
    renderWithRouter(
      <MatchLineupSection
        match={match({
          lineup: undefined,
          lineups: [lineupRow({ playerId: 'p1', player: player('p1', 'Amar', 'Hodžić') })],
        })}
      />,
    );
    expect(screen.getByText('Amar Hodžić')).toBeTruthy();
  });

  it('red sa neusklađenim clubId i player.clubId ide samo u gostujuću postavu', () => {
    renderWithRouter(
      <MatchLineupSection
        match={match({
          lineup: [lineupRow({ clubId: 'cX', playerId: 'p1', player: player('p1', 'Amar', 'Hodžić', 'c2') })],
        })}
      />,
    );
    expect(screen.getAllByText('Amar Hodžić')).toHaveLength(1);
  });

  it('zamjenski nazivi kad klubovi nedostaju', () => {
    renderWithRouter(<MatchLineupSection match={match({ homeClub: undefined, awayClub: undefined })} />);
    expect(screen.getByText('Domaći')).toBeTruthy();
    expect(screen.getByText('Gosti')).toBeTruthy();
  });

  it('red bez igrača ostaje prazna stavka liste (bez teksta i linka)', () => {
    renderWithRouter(
      <MatchLineupSection match={match({ lineup: [lineupRow({ player: null })] })} />,
    );
    expect(screen.getByText('Startna postava')).toBeTruthy();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toBe('');
    expect(within(items[0]).queryByRole('link')).toBeNull();
  });

  it('igrači su linkovi na profil', () => {
    renderWithRouter(<MatchLineupSection match={match()} />);
    expect(screen.getByRole('link', { name: 'Amar Hodžić' }).getAttribute('href')).toBe('/igrac/p1');
  });
});

describe('MatchRelatedNewsSection', () => {
  const items = [
    { id: 'n1', slug: 'pobjeda', title: 'Pobjeda u derbiju' },
    { id: 'n2', slug: 'najava', title: 'Najava utakmice' },
  ];

  it('dok se učitava ne renderuje ništa', () => {
    const { container } = renderWithRouter(
      <MatchRelatedNewsSection items={items} loading />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('bez vijesti ne renderuje ništa', () => {
    const { container } = renderWithRouter(<MatchRelatedNewsSection items={[]} loading={false} />);
    expect(container).toBeEmptyDOMElement();
    const { container: c2 } = renderWithRouter(
      <MatchRelatedNewsSection items={undefined} loading={false} />,
    );
    expect(c2).toBeEmptyDOMElement();
  });

  it('prikazuje naslov i linkove na vijesti', () => {
    renderWithRouter(<MatchRelatedNewsSection items={items} loading={false} />);
    expect(screen.getByText('Povezane vijesti')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Pobjeda u derbiju' }).getAttribute('href')).toBe(
      '/vijesti/pobjeda',
    );
    expect(screen.getByRole('link', { name: 'Najava utakmice' }).getAttribute('href')).toBe(
      '/vijesti/najava',
    );
  });
});
