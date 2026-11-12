import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ClubProfileHero } from './clubs/ClubProfileHero';

/**
 * Batch 34 — `prefers-reduced-motion` isključuje početno stanje animacija,
 * a meta red koristi samo ono što klub ima.
 */
const motionTags = new Set(['img', 'h1', 'h2', 'p', 'div', 'span', 'section', 'header', 'article']);
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        motionTags.has(tag)
          ? (props: Record<string, unknown>) => {
              const Tag = tag as React.ElementType;
              const rest = { ...props };
              delete rest.children;
              return <Tag {...rest}>{props.children as React.ReactNode}</Tag>;
            }
          : undefined,
    },
  ),
  useReducedMotion: () => true,
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const club = (over: Record<string, unknown> = {}) =>
  ({ id: 'c1', name: 'FK Gračanica', city: 'Gračanica', stadium: 'Gradski stadion', ...over }) as never;

describe('ClubProfileHero — smanjeno kretanje (batch 34)', () => {
  it('prikazuje grb, naslov i opis bez početnog stanja animacije', () => {
    const { container } = wrap(
      <ClubProfileHero club={club({ crestPath: 'clubs/grb.png', description: 'Opis kluba' })} />,
    );
    expect(container.querySelector('img')).toHaveAttribute('alt', 'FK Gračanica');
    expect(screen.getByRole('heading', { name: 'FK Gračanica' })).toBeInTheDocument();
    expect(screen.getByText('Opis kluba')).toBeInTheDocument();
  });

  it('natpis iznad naslova se prikazuje bez početnog stanja animacije', () => {
    wrap(<ClubProfileHero club={club()} eyebrow="Prvi tim" />);
    expect(screen.getByText('Prvi tim')).toBeInTheDocument();
  });

  it('grb bez naziva kluba dobija prazan alt', () => {
    const { container } = wrap(
      <ClubProfileHero club={club({ name: undefined, crestPath: 'clubs/grb.png' })} />,
    );
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    expect(screen.getByRole('heading', { name: 'Klub' })).toBeInTheDocument();
  });

  it('koristi samo stadion kad nema grada', () => {
    wrap(<ClubProfileHero club={club({ city: null, stadium: 'Stadion Luke' })} />);
    expect(screen.getByText('Stadion Luke')).toBeInTheDocument();
  });

  it('koristi samo grad kad nema stadiona', () => {
    wrap(<ClubProfileHero club={club({ city: 'Gračanica', stadium: null })} />);
    expect(screen.getByText('Gračanica')).toBeInTheDocument();
  });

  it('bez kluba, meta reda i opisa prikazuje samo zadati naslov', () => {
    wrap(<ClubProfileHero title="Naslov" />);
    expect(screen.getByRole('heading', { name: 'Naslov' })).toBeInTheDocument();
    expect(screen.queryByText(/ · /)).toBeNull();
  });

  it('zadati podnaslov ima prednost nad opisom kluba', () => {
    wrap(<ClubProfileHero club={club({ description: 'Opis kluba' })} subtitle="Zadati opis" />);
    expect(screen.getByText('Zadati opis')).toBeInTheDocument();
    expect(screen.queryByText('Opis kluba')).toBeNull();
  });
});
