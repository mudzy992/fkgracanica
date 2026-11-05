import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { ClubTimelineEvent } from '../../../types';
import { ClubStoryProgress } from './ClubStoryProgress';
import { ExpandableRichContent } from './ExpandableRichContent';
import { ClubStoryChapter } from './ClubStoryChapter';
import { ClubStoryFilm } from './ClubStoryFilm';
import { ClubStoryColdOpen } from './ClubStoryColdOpen';
import { ClubStoryCoda } from './ClubStoryCoda';

const events: ClubTimelineEvent[] = [
  { id: 'e1', year: 1922, title: 'Osnivanje', description: '<p>Prvi sastanak.</p>' },
  { id: 'e2', year: 1974, title: 'Prva titula' },
];

describe('ClubStoryProgress', () => {
  it('prikazuje oba navigaciona pojasa i označava aktivnu godinu', () => {
    render(<ClubStoryProgress events={events} activeId="e2" onSelect={vi.fn()} />);
    const navs = screen.getAllByRole('navigation', { name: 'Era' });
    expect(navs).toHaveLength(2);
    const active = screen.getAllByRole('button', { name: '1974' });
    expect(active[0].className).toContain('bg-primary');
    expect(screen.getAllByText('1974').length).toBeGreaterThan(1);
  });

  it('odsustvo aktivne godine ne prikazuje veliki broj', () => {
    render(<ClubStoryProgress events={events} activeId="nepostoji" onSelect={vi.fn()} />);
    expect(screen.queryByText('1922', { selector: 'p' })).toBeNull();
  });

  it('klik bira eru i skroluje do poglavlja', async () => {
    const onSelect = vi.fn();
    const chapter = document.createElement('div');
    chapter.id = 'story-chapter-e1';
    chapter.scrollIntoView = vi.fn();
    document.body.appendChild(chapter);
    render(<ClubStoryProgress events={events} activeId="e2" onSelect={onSelect} />);
    await userEvent.click(screen.getAllByRole('button', { name: '1922' })[0]);
    expect(onSelect).toHaveBeenCalledWith('e1');
    expect(chapter.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    chapter.remove();
  });
});

describe('ExpandableRichContent', () => {
  it('kratak sadržaj bez prelivanja nema dugme', () => {
    render(<ExpandableRichContent html="<p>Kratko</p>" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Kratko')).toBeTruthy();
  });

  it('dugačak sadržaj dobija dugme i može se proširiti pa skupiti', async () => {
    render(<ExpandableRichContent html={`<p>${'a'.repeat(320)}</p>`} />);
    const toggle = screen.getByRole('button', { name: 'Pročitaj više' });
    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Prikaži manje' })).toBeTruthy();
  });
});

describe('ClubStoryChapter', () => {
  it('prikazuje godinu, naslov i opis iz hronologije', () => {
    const { container } = render(<ClubStoryChapter event={events[0]} />);
    expect(screen.getByLabelText('1922 Osnivanje')).toBeTruthy();
    expect(container.querySelector('[id="story-chapter-e1"]')).not.toBeNull();
    expect(screen.getAllByText('1922').length).toBeGreaterThan(0);
    expect(screen.getByText('Osnivanje')).toBeTruthy();
    expect(screen.getByText('Prvi sastanak.')).toBeTruthy();
  });

  it('bez opisa nema sekcije sa bogatim sadržajem', () => {
    render(<ClubStoryChapter event={events[1]} />);
    expect(screen.getByText('Prva titula')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('ClubStoryFilm', () => {
  it('renderuje poglavlja i navigaciju za sve ere', () => {
    render(<ClubStoryFilm events={events} />);
    expect(screen.getAllByRole('navigation', { name: 'Era' })).toHaveLength(2);
    expect(screen.getByText('Osnivanje')).toBeTruthy();
    expect(screen.getByText('Prva titula')).toBeTruthy();
  });
});

describe('ClubStoryColdOpen', () => {
  it('prikazuje grb, naziv kluba i naslov sa prvom godinom', () => {
    render(
      <ClubStoryColdOpen
        club={{ name: 'FK Gračanica', crestPath: 'crest.png' } as never}
        firstYear={1922}
      />,
    );
    expect(screen.getByText('FK Gračanica')).toBeTruthy();
    expect(screen.getByText('Od 1922. srce Gračanice.')).toBeTruthy();
    expect(document.querySelector('img')?.getAttribute('src')).toContain('crest');
  });

  it('bez kluba koristi podrazumijevani naziv i opšti naslov', async () => {
    const film = document.createElement('div');
    film.id = 'story-film';
    film.scrollIntoView = vi.fn();
    document.body.appendChild(film);
    render(<ClubStoryColdOpen />);
    expect(screen.getByText('FK Gračanica')).toBeTruthy();
    expect(screen.getByText('Naša priča.')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Nastavi priču' }));
    expect(film.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    film.remove();
  });
});

describe('ClubStoryCoda', () => {
  const renderCoda = (images: string[], heritage?: string) =>
    render(
      <MemoryRouter>
        <ClubStoryCoda storyImages={images} heritageImage={heritage} />
      </MemoryRouter>,
    );

  it('sa slikama prikazuje oba linka i tri slike', () => {
    const { container } = renderCoda(['a.jpg', 'b.jpg'], 'h.jpg');
    expect(screen.getByRole('link', { name: 'Prvi tim' }).getAttribute('href')).toBe('/tim');
    expect(screen.getByRole('link', { name: 'Članstvo' }).getAttribute('href')).toBe('/clanstvo');
    expect(screen.getByText('Otključaj Kuću slavnih')).toBeTruthy();
    expect(container.querySelectorAll('img')).toHaveLength(3);
  });

  it('bez slika prikazuje tekstualne zamjene', () => {
    const { container } = renderCoda([]);
    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(screen.getByText('O klubu')).toBeTruthy();
    expect(screen.getByText('Era')).toBeTruthy();
    expect(screen.getByText('Kuća slavnih')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Otključaj Kuću slavnih/ }).getAttribute('href')).toBe(
      '/o-klubu/kuca-slavnih',
    );
  });
});
