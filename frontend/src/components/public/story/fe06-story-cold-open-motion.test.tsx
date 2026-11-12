import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ClubStoryColdOpen } from './ClubStoryColdOpen';

/**
 * Batch 34 — sa `prefers-reduced-motion` animacije su isključene, skrol je
 * trenutan, a ikona ne skače.
 */
const motionTags = new Set(['div', 'h1', 'p', 'span', 'section']);
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

describe('ClubStoryColdOpen — smanjeno kretanje (batch 34)', () => {
  it('skroluje trenutno umjesto glatko', async () => {
    const film = document.createElement('div');
    film.id = 'story-film';
    film.scrollIntoView = vi.fn();
    document.body.appendChild(film);
    render(<ClubStoryColdOpen firstYear={1922} />);
    await userEvent.click(screen.getByRole('button', { name: 'Nastavi priču' }));
    expect(film.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
    film.remove();
  });

  it('bez ikone filma ne pada pri kliku', async () => {
    render(<ClubStoryColdOpen />);
    await userEvent.click(screen.getByRole('button', { name: 'Nastavi priču' }));
    expect(screen.getByText('Naša priča.')).toBeInTheDocument();
  });

  it('sa grbom prikazuje sliku bez animiranog skoka ikone', () => {
    const { container } = render(
      <ClubStoryColdOpen club={{ name: 'FK Gračanica', crestPath: 'crest.png' } as never} />,
    );
    expect(container.querySelector('img')).not.toBeNull();
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
    expect(container.querySelector('.animate-bounce')).toBeNull();
  });

  it('bez grba nema slike i koristi podrazumijevani naziv', () => {
    const { container } = render(<ClubStoryColdOpen club={null} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
  });
});
