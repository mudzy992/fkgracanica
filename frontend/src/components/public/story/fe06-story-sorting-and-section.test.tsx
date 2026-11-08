import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ClubTimelineEvent } from '../../../types';
import { sortStoryChapters } from './sort-story-chapters';
import { PublicSection } from '../shell/PublicSection';

/** Batch 34 — sortiranje bez `sortOrder` i sekcija bez naslova/akcija. */
vi.mock('../../lib/motion/Reveal', () => ({
  Reveal: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

const chapter = (id: string, year: number, sortOrder?: number) =>
  ({ id, year, title: id, sortOrder }) as ClubTimelineEvent;

describe('sortStoryChapters — nedostajući `sortOrder`', () => {
  it('poglavlja bez redoslijeda idu prije onih sa brojem u istoj godini', () => {
    const sorted = sortStoryChapters([
      chapter('sa-redom', 1999, 2),
      chapter('bez-reda', 1999),
    ]);
    expect(sorted.map((c) => c.id)).toEqual(['bez-reda', 'sa-redom']);
  });

  it('dva poglavlja bez redoslijeda zadržavaju redoslijed ulaza', () => {
    const sorted = sortStoryChapters([chapter('prvo', 2001), chapter('drugo', 2001)]);
    expect(sorted.map((c) => c.id)).toEqual(['prvo', 'drugo']);
  });

  it('prvo se sortira po godini, pa po redoslijedu', () => {
    const sorted = sortStoryChapters([
      chapter('c', 2010, 1),
      chapter('a', 1990, 5),
      chapter('b', 2010, 0),
    ]);
    expect(sorted.map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('ne mijenja ulazni niz', () => {
    const input = [chapter('b', 2000, 2), chapter('a', 2000, 1)];
    const sorted = sortStoryChapters(input);
    expect(input.map((c) => c.id)).toEqual(['b', 'a']);
    expect(sorted).not.toBe(input);
  });
});

describe('PublicSection — naslov, natpis i akcije', () => {
  it('bez naslova i akcija ne prikazuje zaglavlje', () => {
    render(
      <PublicSection className="extra">
        <p>tijelo</p>
      </PublicSection>,
    );
    expect(screen.getByText('tijelo')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).toBeNull();
    expect(document.querySelector('section')?.className).toContain('extra');
  });

  it('samo akcije prikazuju zaglavlje bez naslova i natpisa', () => {
    render(
      <PublicSection actions={<button>akcija</button>}>
        <p>tijelo</p>
      </PublicSection>,
    );
    expect(screen.getByRole('button', { name: 'akcija' })).toBeInTheDocument();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('naslov bez natpisa prikazuje samo naslov', () => {
    render(
      <PublicSection title="Naslov sekcije">
        <p>tijelo</p>
      </PublicSection>,
    );
    expect(screen.getByRole('heading', { name: 'Naslov sekcije' })).toBeInTheDocument();
    expect(document.querySelectorAll('p')).toHaveLength(1);
  });

  it('natpis i naslov zajedno prikazuju oba', () => {
    render(
      <PublicSection eyebrow="Natpis" title="Naslov sekcije" actions={<span>akcija</span>}>
        <p>tijelo</p>
      </PublicSection>,
    );
    expect(screen.getByText('Natpis')).toBeInTheDocument();
    expect(screen.getByText('akcija')).toBeInTheDocument();
  });
});
