import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HeroWidget } from './HeroWidget';

const state = vi.hoisted(() => ({
  matches: { data: undefined as unknown },
  settings: { data: undefined as unknown },
}));

vi.mock('../../hooks', () => ({
  useMatches: () => state.matches,
  usePublicSettings: () => state.settings,
}));
vi.mock('../../lib/utils', () => ({
  cn: (...values: Array<string | undefined>) => values.filter(Boolean).join(' '),
  formatDateTime: (value: string) => `dt:${value}`,
}));

const config = (over: Record<string, unknown> = {}) => ({
  title: 'FK Gračanica',
  backgroundDisplay: 'all',
  showMatches: true,
  showLastResult: true,
  buttons: [],
  ...over,
});

const wrap = (configOver: Record<string, unknown> = {}) =>
  render(
    <MemoryRouter>
      <HeroWidget config={config(configOver) as never} />
    </MemoryRouter>,
  );

const match = (over: Record<string, unknown>) => ({
  id: 'm1',
  status: 'SCHEDULED',
  scheduledAt: '2099-05-01T17:00:00Z',
  homeClub: { name: 'FK Gračanica', shortName: 'GRA' },
  awayClub: { name: 'NK Zenica', shortName: 'ZEN' },
  venue: 'Stadion Luke',
  homeScore: null,
  awayScore: null,
  roundRel: { number: 5, name: null },
  ...over,
});

beforeEach(() => {
  state.matches = { data: [] };
  state.settings = { data: { 'club.name': 'FK Gračanica' } };
});

describe('HeroWidget — sadržaj', () => {
  it('prikazuje naslov i podnaslov', () => {
    wrap({ subtitle: 'Ponos Gračanice' });
    expect(screen.getByRole('heading', { level: 1, name: 'FK Gračanica' })).toBeInTheDocument();
    expect(screen.getByText('Ponos Gračanice')).toBeInTheDocument();
  });

  it('prikazuje značku sa godinom osnivanja', () => {
    wrap({ foundedYear: '1932' });
    expect(screen.getByText('Osnovan 1932. godine')).toBeInTheDocument();
  });

  it('bez godine i podnaslova nema tih elemenata', () => {
    wrap();
    expect(screen.queryByText(/Osnovan/)).toBeNull();
    expect(screen.queryAllByRole('paragraph')).toHaveLength(0);
  });

  it('prikazuje dugmad sa različitim stilovima i linkovima', () => {
    wrap({
      buttons: [
        { label: 'Ulaznice', url: '/ulaznice' },
        { label: 'O klubu', url: '/o-klubu', variant: 'outline' },
      ],
    });
    expect(screen.getByRole('link', { name: /Ulaznice/ })).toHaveAttribute('href', '/ulaznice');
    expect(screen.getByRole('link', { name: /O klubu/ })).toHaveAttribute('href', '/o-klubu');
  });

  it('pozadinska slika koristi mediaUrl za original', () => {
    const { container } = wrap({ backgroundImage: 'originals/hero.jpg' });
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toContain('/uploads/files/originals/hero.jpg');
  });

  it('prikaz „none“ skriva pozadinsku sliku', () => {
    const { container } = wrap({ backgroundImage: 'originals/hero.jpg', backgroundDisplay: 'none' });
    expect(container.querySelector('img')).toBeNull();
  });
});

describe('HeroWidget — grb i utakmice', () => {
  it('prikazuje grb sa nazivom kluba iz postavki', () => {
    state.settings = { data: { 'club.crestUrl': 'originals/grb.png', 'club.name': 'FK Gračanica' } };
    render(
      <MemoryRouter>
        <HeroWidget config={config() as never} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img', { name: 'FK Gračanica' })).toBeInTheDocument();
  });

  it('bez grba nema slike grba', () => {
    const { container } = wrap();
    expect(container.querySelector('img')).toBeNull();
  });

  it('prikazuje sljedeću utakmicu i zadnji rezultat', () => {
    state.matches = {
      data: [
        match({}),
        match({
          id: 'm0',
          status: 'FINISHED',
          scheduledAt: '2020-05-01T17:00:00Z',
          homeScore: 3,
          awayScore: 1,
        }),
      ],
    };
    wrap();
    expect(screen.getAllByText('FK Gračanica').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('NK Zenica')).toBeInTheDocument();
    expect(screen.getByText('5. kolo')).toBeInTheDocument();
    expect(screen.getByText('dt:2099-05-01T17:00:00Z')).toBeInTheDocument();
    expect(screen.getByText('Stadion Luke')).toBeInTheDocument();
    expect(screen.getByText('Zadnji rezultat')).toBeInTheDocument();
    expect(screen.getByText('3:1')).toBeInTheDocument();
  });

  it('showMatches=false skriva traku utakmica', () => {
    state.matches = { data: [match({})] };
    wrap({ showMatches: false });
    expect(screen.queryByText('VS')).toBeNull();
  });

  it('bez zakazanih utakmica traka se ne prikazuje', () => {
    state.matches = { data: [] };
    wrap();
    expect(screen.queryByText('VS')).toBeNull();
  });

  it('zadnji rezultat se skriva kada je isključen', () => {
    state.matches = {
      data: [match({ id: 'm0', status: 'FINISHED', scheduledAt: '2020-05-01T17:00:00Z', homeScore: 2, awayScore: 0 })],
    };
    wrap({ showLastResult: false });
    expect(screen.queryByText('Zadnji rezultat')).toBeNull();
  });

  it('utakmica bez klubova i naslova kola koristi zamjenske nazive', () => {
    state.matches = {
      data: [
        match({
          homeClub: null,
          awayClub: null,
          roundRel: null,
          name: 'Kup utakmica',
        }),
      ],
    };
    wrap();
    expect(screen.getByText('Sljedeća utakmica')).toBeInTheDocument();
  });
});
