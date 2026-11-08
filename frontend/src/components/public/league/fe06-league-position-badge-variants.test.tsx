import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LeaguePositionBadge } from './LeaguePositionBadge';

describe('LeaguePositionBadge — varijante (2 grane)', () => {
  it('up sa 1 i 2 pozicije', () => {
    const { container: c1 } = render(<LeaguePositionBadge change={1} />);
    expect(c1.textContent).toContain('1');
    expect(c1.querySelector('span')?.getAttribute('title')).toContain('poziciju');
    const { container: c2 } = render(<LeaguePositionBadge change={2} />);
    expect(c2.querySelector('span')?.getAttribute('title')).toContain('pozicije');
  });

  it('down sa 1 i 3 pozicije', () => {
    const { container: c1 } = render(<LeaguePositionBadge change={-1} />);
    expect(c1.querySelector('span')?.getAttribute('title')).toContain('poziciju');
    expect(c1.textContent).toContain('1');
    const { container: c2 } = render(<LeaguePositionBadge change={-3} />);
    expect(c2.querySelector('span')?.getAttribute('title')).toContain('pozicije');
  });
});
