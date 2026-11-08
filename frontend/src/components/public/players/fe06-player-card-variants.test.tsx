import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PlayerCard } from './PlayerCard';

/**
 * Batch 34 — varijante kartice igrača: slika, broj, nepoznata pozicija i
 * `linkable={false}`. Ranije su testovi pokrivali samo pun profil sa brojem.
 */
vi.mock('../../../lib/media', () => ({
  mediaUrl: (path: string | undefined, variant: string) =>
    path ? `${variant}:${path}` : undefined,
}));

const base = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  firstName: 'Amar',
  lastName: 'Hodžić',
  number: 9,
  position: 'GK',
  photoPath: null,
  ...over,
});

const wrap = (over: Record<string, unknown> = {}, props: Record<string, unknown> = {}) =>
  render(
    <MemoryRouter>
      <PlayerCard player={base(over) as never} {...(props as Record<string, never>)} />
    </MemoryRouter>,
  );

describe('PlayerCard — slika i broj', () => {
  it('sa fotografijom prikazuje sliku umjesto broja', () => {
    const { container } = wrap({ photoPath: 'igraci/amar.jpg' });
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'thumb:igraci/amar.jpg');
    expect(screen.queryByText('9')).toBeNull();
  });

  it('bez fotografije i bez broja prikazuje upitnik', () => {
    wrap({ number: null });
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('bez pozicije prikazuje samo broj', () => {
    wrap({ position: null });
    expect(screen.getByText('#9')).toBeInTheDocument();
    expect(screen.getByText('#9').textContent).toBe('#9');
  });

  it('nepoznata pozicija prikazuje sirovu oznaku', () => {
    wrap({ position: 'NEPOZNATO' });
    expect(screen.getByText(/#9 · NEPOZNATO/)).toBeInTheDocument();
  });

  it('bez broja i bez pozicije ne prikazuje razdjelnik', () => {
    wrap({ number: null, position: null });
    const line = screen.getByText('Amar Hodžić').parentElement?.querySelector('p:last-child');
    expect(line?.textContent).toBe('');
  });
});

describe('PlayerCard — kompaktna i nelinkovana varijanta', () => {
  it('kompaktna varijanta koristi manje klase', () => {
    const { container } = wrap({}, { compact: true });
    expect((container.firstElementChild as HTMLElement).className).toContain('p-2');
  });

  it('sa fotografijom i kompaktno koristi `h-10 w-10`', () => {
    const { container } = wrap({ photoPath: 'igraci/mali.jpg' }, { compact: true });
    expect(container.querySelector('img')?.className).toContain('h-10');
  });

  it('nelinkovana varijanta je `div`, ne link', () => {
    const { container } = wrap({}, { linkable: false });
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('linkovana varijanta vodi na profil igrača', () => {
    wrap();
    expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringContaining('p1'));
  });
});
