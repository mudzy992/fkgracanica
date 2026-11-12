import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LeagueFilterBar } from './LeagueFilterBar';
import { LeagueSeasonPicker } from './LeagueSeasonPicker';
import { LeagueRoundPicker } from './LeagueRoundPicker';
import { LeaguePositionBadge } from './LeaguePositionBadge';
import type { SeasonOption } from '../../../lib/season-utils';
import type { CompetitionRound } from '../../../types';

const season = (id: string, over: Partial<SeasonOption> = {}): SeasonOption => ({
  id,
  name: `Sezona ${id}`,
  isActive: false,
  ...over,
});

const round = (number: number, over: Partial<CompetitionRound> = {}): CompetitionRound => ({
  id: `r${number}`,
  number,
  name: `${number}. kolo`,
  seasonId: 's1',
  ...over,
});

describe('LeagueFilterBar', () => {
  it('sa jednom sezonom ne prikazuje izbor sezone', () => {
    render(
      <LeagueFilterBar
        seasons={[season('s1')]}
        seasonId="s1"
        onSeasonChange={vi.fn()}
        rounds={[]}
        upToRound={null}
        onRoundChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /Sezona s1/ })).toBeNull();
  });

  it('više sezona daje pilule sa aktivnom oznakom i klik mijenja sezonu', async () => {
    const onSeasonChange = vi.fn();
    render(
      <LeagueFilterBar
        seasons={[season('s1', { isActive: true }), season('s2')]}
        seasonId="s2"
        onSeasonChange={onSeasonChange}
        rounds={[]}
        upToRound={null}
        onRoundChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/· aktivna/)).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: /Sezona s1/ }));
    expect(onSeasonChange).toHaveBeenCalledWith('s1');
  });

  it('malo kola prikazuje pilule do kola', async () => {
    const onRoundChange = vi.fn();
    render(
      <LeagueFilterBar
        seasons={[]}
        onSeasonChange={vi.fn()}
        rounds={[round(1), round(2)]}
        upToRound={2}
        onRoundChange={onRoundChange}
      />,
    );
    expect(screen.getByRole('button', { name: 'Ukupno' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: /Do 1\. kolo/ }));
    expect(onRoundChange).toHaveBeenCalledWith(1);
    await userEvent.click(screen.getByRole('button', { name: 'Ukupno' }));
    expect(onRoundChange).toHaveBeenLastCalledWith(null);
  });

  it('mnogo kola prelazi u select', async () => {
    const onRoundChange = vi.fn();
    const rounds = Array.from({ length: 9 }, (_, i) => round(i + 1));
    render(
      <LeagueFilterBar
        seasons={[]}
        onSeasonChange={vi.fn()}
        rounds={rounds}
        upToRound={null}
        onRoundChange={onRoundChange}
      />,
    );
    const select = screen.getByLabelText('Prikaz tabele po kolu') as HTMLSelectElement;
    await userEvent.selectOptions(select, '3');
    expect(onRoundChange).toHaveBeenCalledWith(3);
    await userEvent.selectOptions(select, '');
    expect(onRoundChange).toHaveBeenLastCalledWith(null);
  });
});

describe('LeagueSeasonPicker', () => {
  it('jedna sezona ne renderira select', () => {
    const { container } = render(
      <LeagueSeasonPicker seasons={[season('s1')]} onChange={vi.fn()} />,
    );
    expect(container.textContent).toBe('');
  });

  it('više sezona daje opcije sa aktivnom oznakom', () => {
    render(
      <LeagueSeasonPicker
        seasons={[season('s1'), season('s2', { isActive: true })]}
        value="s1"
        onChange={vi.fn()}
      />,
    );
    const select = screen.getByLabelText('Odaberi sezonu') as HTMLSelectElement;
    expect(select.value).toBe('s1');
    expect(select.textContent).toContain('· aktivna');
  });

  it('promjena zove onChange', async () => {
    const onChange = vi.fn();
    render(<LeagueSeasonPicker seasons={[season('s1'), season('s2')]} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('Odaberi sezonu'), 's2');
    expect(onChange).toHaveBeenCalledWith('s2');
  });
});

describe('LeagueRoundPicker', () => {
  it('bez kola ne renderira select', () => {
    const { container } = render(<LeagueRoundPicker rounds={[]} value={null} onChange={vi.fn()} />);
    expect(container.textContent).toBe('');
  });

  it('nudi ukupnu tabelu i tabelu do kola', async () => {
    const onChange = vi.fn();
    render(<LeagueRoundPicker rounds={[round(1)]} value={null} onChange={onChange} />);
    const select = screen.getByLabelText('Prikaz tabele') as HTMLSelectElement;
    expect(select.value).toBe('');
    await userEvent.selectOptions(select, '1');
    expect(onChange).toHaveBeenCalledWith(1);
  });
});

describe('LeaguePositionBadge', () => {
  it('bez promjene prikazuje crticu', () => {
    const { container } = render(<LeaguePositionBadge />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelector('[title="Bez promjene"]')).toBeTruthy();
  });

  it('nula je isto što i bez promjene', () => {
    const { container } = render(<LeaguePositionBadge change={0} />);
    expect(container.querySelector('[title="Bez promjene"]')).toBeTruthy();
  });

  it('pozitivna promjena prikazuje strelicu gore', () => {
    const { container } = render(<LeaguePositionBadge change={2} className="x" />);
    expect(container.querySelector('.x')).toBeTruthy();
    expect(container.textContent).toContain('2');
  });

  it('negativna promjena prikazuje strelicu dolje', () => {
    const { container } = render(<LeaguePositionBadge change={-1} />);
    expect(container.textContent).toContain('1');
  });
});
