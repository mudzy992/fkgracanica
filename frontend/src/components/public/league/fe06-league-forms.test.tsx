import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LeagueFormDots } from './LeagueFormDots';
import { FormResultChips } from './FormResultChips';

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const formMatch = (over: Record<string, unknown> = {}) => ({
  result: 'W' as const,
  matchId: 'm1',
  scheduledAt: '2026-03-01T17:00:00.000Z',
  isHome: true,
  goalsFor: 3,
  goalsAgainst: 1,
  opponentName: 'FK Slavija',
  opponentSlug: 'fk-slavija',
  ...over,
});

describe('FormResultChips', () => {
  it('bez forme prikazuje crticu', () => {
    const { container } = wrap(<FormResultChips />);
    expect(container.textContent).toBe('—');
  });

  it('legacy forma bez detalja nema tooltip', () => {
    const { container } = wrap(<FormResultChips form="WDL" />);
    expect(container.textContent).toBe('WDL');
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('detalji daju tooltip sa protivnikom, rezultatom i datumom', () => {
    const { container } = wrap(
      <FormResultChips formMatches={[formMatch()]} clubName="FK Gračanica" />,
    );
    const tip = container.querySelector('[role="tooltip"]');
    expect(tip).not.toBeNull();
    expect(tip?.textContent).toContain('Pobjeda');
    expect(tip?.textContent).toContain('FK Gračanica vs FK Slavija');
    expect(tip?.textContent).toContain('3:1');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/utakmice/m1');
  });

  it('bez naziva kluba koristi protivnika i obrnut rezultat za gostovanje', () => {
    const { container } = wrap(
      <FormResultChips
        formMatches={[formMatch({ isHome: false, result: 'L', goalsFor: 0, goalsAgainst: 2, scheduledAt: '' })]}
      />,
    );
    const tip = container.querySelector('[role="tooltip"]');
    expect(tip?.textContent).toContain('Poraz');
    expect(tip?.textContent).toContain('vs FK Slavija');
    expect(tip?.textContent).toContain('2:0');
  });

  it('md veličina i dodatna klasa', () => {
    const { container } = wrap(<FormResultChips form="D" size="md" className="moja" />);
    expect(container.firstElementChild).toHaveClass('moja');
    expect(container.querySelector('span span')?.className).toContain('h-8');
  });
});

describe('LeagueFormDots', () => {
  it('prosljeđuje formu u FormResultChips', () => {
    const { container } = wrap(<LeagueFormDots form="WW" clubName="FK Gračanica" />);
    expect(container.textContent).toBe('WW');
  });
});
