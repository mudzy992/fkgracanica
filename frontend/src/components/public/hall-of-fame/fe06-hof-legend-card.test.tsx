import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HofLegendCard } from './HofLegendCard';
import type { HallOfFameEntry } from '../../../types';

const entry = (over: Partial<HallOfFameEntry> = {}): HallOfFameEntry =>
  ({
    id: 'h1',
    name: 'Milan Jovanović',
    years: '1998–2006',
    role: 'Napadač',
    bio: 'Kratka biografija legende.',
    photoPath: 'originals/hof/milan.jpg',
    ...over,
  }) as HallOfFameEntry;

describe('HofLegendCard', () => {
  it('prikazuje ime, godine, rolu i fotografiju', () => {
    const { container } = render(<HofLegendCard entry={entry()} onOpen={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Milan Jovanović' })).toBeTruthy();
    expect(screen.getByText('1998–2006')).toBeTruthy();
    expect(screen.getByText('Napadač')).toBeTruthy();
    expect(container.querySelector('img')?.getAttribute('src')).toContain('medium/hof/milan');
  });

  it('bez fotografije prikazuje inicijal imena', () => {
    const { container } = render(
      <HofLegendCard entry={entry({ photoPath: null, imagePath: null })} onOpen={() => {}} />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('M')).toBeTruthy();
  });

  it('koristi imagePath kad photoPath nedostaje', () => {
    const { container } = render(
      <HofLegendCard entry={entry({ photoPath: null, imagePath: 'originals/hof/alt.jpg' })} onOpen={() => {}} />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toContain('alt');
  });

  it('kartica otvara detalj klikom', async () => {
    const onOpen = vi.fn();
    const e = entry();
    render(<HofLegendCard entry={e} onOpen={onOpen} />);
    await userEvent.click(screen.getByRole('heading', { name: 'Milan Jovanović' }));
    expect(onOpen).toHaveBeenCalledWith(e);
  });

  it('bez godina i role nema tih elemenata', () => {
    render(<HofLegendCard entry={entry({ years: null, role: null })} onOpen={() => {}} />);
    expect(screen.queryByText('Napadač')).toBeNull();
    expect(screen.queryByText('1998–2006')).toBeNull();
  });

  it('bez biografije nema prekidača za čitanje', () => {
    render(<HofLegendCard entry={entry({ bio: null })} onOpen={() => {}} />);
    expect(screen.queryByText('Pročitaj više')).toBeNull();
  });

  it('duga biografija nudi „Pročitaj više“ i mijenja u „Prikaži manje“', async () => {
    const longBio = 'a'.repeat(400);
    render(<HofLegendCard entry={entry({ bio: longBio })} onOpen={() => {}} />);
    await userEvent.click(screen.getByText('Pročitaj više'));
    expect(screen.getByText('Prikaži manje')).toBeTruthy();
    await userEvent.click(screen.getByText('Prikaži manje'));
    expect(screen.getByText('Pročitaj više')).toBeTruthy();
  });

  it('prekidač ne otvara detalj (stopPropagation)', async () => {
    const onOpen = vi.fn();
    render(<HofLegendCard entry={entry({ bio: 'b'.repeat(400) })} onOpen={onOpen} />);
    await userEvent.click(screen.getByText('Pročitaj više'));
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('tastatura Enter i Space mijenjaju proširenje, ostali tasteri ne', async () => {
    render(<HofLegendCard entry={entry({ bio: 'c'.repeat(400) })} onOpen={() => {}} />);
    const toggle = screen.getByText('Pročitaj više');
    toggle.focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('Prikaži manje')).toBeTruthy();
    toggle.focus();
    await userEvent.keyboard(' ');
    expect(screen.getByText('Pročitaj više')).toBeTruthy();
    toggle.focus();
    await userEvent.keyboard('a');
    expect(screen.getByText('Pročitaj više')).toBeTruthy();
  });

  it('proširena biografija nema line-clamp klase', async () => {
    render(<HofLegendCard entry={entry({ bio: 'd'.repeat(400) })} onOpen={() => {}} />);
    const p = screen.getByText('d'.repeat(400));
    expect(p.className).toContain('line-clamp-5');
    await userEvent.click(screen.getByText('Pročitaj više'));
    expect(p.className).not.toContain('line-clamp-5');
  });
});
