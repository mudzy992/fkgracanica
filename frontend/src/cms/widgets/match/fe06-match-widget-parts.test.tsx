import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MatchParallaxBg } from './MatchParallaxBg';
import { MatchSpotlightBody } from './MatchSpotlightBody';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => <div {...rest}>{children}</div>,
  },
  useReducedMotion: () => true,
  useScroll: () => ({ scrollYProgress: {} }),
  useTransform: () => '0%',
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('MatchParallaxBg', () => {
  it('bez slike prikazuje gradijent', () => {
    const { container } = wrap(<MatchParallaxBg />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.bg-gradient-to-br')).not.toBeNull();
  });

  it('sa slikom prikazuje dekorativnu sliku', () => {
    const { container } = wrap(<MatchParallaxBg imageUrl="/media/bg.jpg" />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/media/bg.jpg');
    expect(img?.getAttribute('alt')).toBe('');
  });

  it('uvijek ima zatamnjeni sloj', () => {
    const { container } = wrap(<MatchParallaxBg />);
    const layers = container.querySelectorAll('div');
    const overlay = Array.from(layers).find((d) => d.getAttribute('style')?.includes('linear-gradient'));
    expect(overlay).toBeTruthy();
  });
});

const next = {
  id: 'm1',
  scheduledAt: '2031-05-01T17:00:00.000Z',
  venue: 'Gradski stadion',
  homeClub: { name: 'FK Gračanica', shortName: 'GRA' },
  awayClub: { name: 'FK Slavija', shortName: 'SLA' },
};

const last = {
  id: 'm0',
  scheduledAt: '2026-04-01T17:00:00.000Z',
  homeClub: { name: 'FK Radnik', shortName: 'RAD' },
  awayClub: { name: 'FK Gračanica', shortName: 'GRA' },
  homeScore: 1,
  awayScore: 2,
};

describe('MatchSpotlightBody', () => {
  it('bez utakmica prikazuje poruku', () => {
    wrap(<MatchSpotlightBody next={undefined} last={undefined} showLast />);
    expect(screen.getByText('Nema zakazanih ili odigranih utakmica.')).toBeInTheDocument();
  });

  it('prikazuje sljedeću utakmicu sa stadionom i linkom', () => {
    wrap(<MatchSpotlightBody next={next as never} last={undefined} showLast />);
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
    expect(screen.getByText('VS')).toBeInTheDocument();
    expect(screen.getByText('FK Slavija')).toBeInTheDocument();
    expect(screen.getByText('Gradski stadion')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/utakmice/m1');
    expect(screen.getByText('Sljedeća utakmica')).toBeInTheDocument();
  });

  it('bez stadiona ne prikazuje ikonu lokacije', () => {
    wrap(<MatchSpotlightBody next={{ ...next, venue: null } as never} last={undefined} showLast />);
    expect(screen.queryByText('Gradski stadion')).toBeNull();
  });

  it('zadnji rezultat se prikazuje samo kad je showLast', () => {
    const { unmount } = wrap(<MatchSpotlightBody next={next as never} last={last as never} showLast={false} />);
    expect(screen.queryByText('Zadnji rezultat')).toBeNull();
    unmount();
    wrap(<MatchSpotlightBody next={next as never} last={last as never} showLast />);
    expect(screen.getByText('Zadnji rezultat')).toBeInTheDocument();
    expect(screen.getByText('RAD — GRA')).toBeInTheDocument();
    expect(screen.getByText('1:2')).toBeInTheDocument();
  });

  it('klubovi bez imena imaju rezervne oznake', () => {
    wrap(
      <MatchSpotlightBody
        next={{ ...next, homeClub: null, awayClub: null } as never}
        last={undefined}
        showLast
      />,
    );
    expect(screen.getByText('Domaćin')).toBeInTheDocument();
    expect(screen.getByText('Gost')).toBeInTheDocument();
  });
});
