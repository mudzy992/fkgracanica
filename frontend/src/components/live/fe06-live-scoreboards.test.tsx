import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LiveScoreboardCompact } from './LiveScoreboardCompact';
import { LiveScoreboardExpanded } from './LiveScoreboardExpanded';
import { LiveScoreboardOverlay } from './LiveScoreboardOverlay';

vi.mock('../public/clubs/ClubCrest', () => ({
  ClubCrest: ({ club, size }: { club?: { name?: string } | null; size?: string }) => (
    <span data-testid={`crest-${club?.name ?? 'none'}`}>{size}</span>
  ),
}));

const clock = {
  periodLabel: 'Prvo poluvrijeme',
  displayMinute: 23,
  displaySecond: 5,
  showStoppage: false,
  stoppage: 0,
  needsStoppageInput: false,
};

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'LIVE',
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  homeScore: 2,
  awayScore: 1,
  minute: 55,
  seasonId: 's1',
  homeClubId: 'k1',
  awayClubId: 'k2',
  scheduledAt: '2026-05-01T17:00:00.000Z',
  ...over,
});

describe('LiveScoreboardCompact', () => {
  it('prikazuje gostujući rezultat prvi i minute iz sata', () => {
    render(<LiveScoreboardCompact match={match() as never} clock={clock as never} onToggle={vi.fn()} />);
    expect(screen.getByText('FK Slavija')).toBeInTheDocument();
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
    expect(document.body.textContent).toContain('2');
    expect(document.body.textContent).toContain('1');
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
  });

  it('poluvrijeme prikazuje PAUZA', () => {
    render(
      <LiveScoreboardCompact
        match={match({ status: 'HALFTIME' }) as never}
        clock={null}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('PAUZA')).toBeInTheDocument();
  });

  it('penali prikazuju PEN i skor penala', () => {
    render(
      <LiveScoreboardCompact
        match={match({ matchPeriod: 'PENALTIES', penaltyHomeScore: 4, penaltyAwayScore: 3 }) as never}
        clock={null}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('PEN')).toBeInTheDocument();
    expect(screen.getByText('pen 3:4')).toBeInTheDocument();
  });

  it('klubovi bez imena imaju rezervne labelе', () => {
    render(
      <LiveScoreboardCompact
        match={match({ homeClub: null, awayClub: null }) as never}
        clock={null}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('Gost')).toBeInTheDocument();
    expect(screen.getByText('Domaćin')).toBeInTheDocument();
  });

  it('klik i Enter/Space pozivaju onToggle', async () => {
    const onToggle = vi.fn();
    render(<LiveScoreboardCompact match={match() as never} clock={null} onToggle={onToggle} />);
    const box = screen.getByRole('button');
    await userEvent.click(box);
    expect(onToggle).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(box, { key: 'Enter' });
    fireEvent.keyDown(box, { key: ' ' });
    fireEvent.keyDown(box, { key: 'Tab' });
    expect(onToggle).toHaveBeenCalledTimes(3);
  });
});

describe('LiveScoreboardExpanded', () => {
  it('prikazuje period sata za LIVE bez penala', () => {
    render(<LiveScoreboardExpanded match={match() as never} clock={clock as never} onToggle={vi.fn()} />);
    expect(screen.getByText('Prvo poluvrijeme')).toBeInTheDocument();
    expect(screen.queryByText('PEN')).toBeNull();
  });

  it('penali prikazuju zagrađeni skor bez perioda', () => {
    render(
      <LiveScoreboardExpanded
        match={match({ matchPeriod: 'PENALTIES', penaltyHomeScore: 5, penaltyAwayScore: 4 }) as never}
        clock={clock as never}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('(4:5 pen)')).toBeInTheDocument();
    expect(screen.queryByText('Prvo poluvrijeme')).toBeNull();
  });

  it('poluvrijeme nema period label', () => {
    render(
      <LiveScoreboardExpanded
        match={match({ status: 'HALFTIME' }) as never}
        clock={clock as never}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('PAUZA')).toBeInTheDocument();
    expect(screen.queryByText('Prvo poluvrijeme')).toBeNull();
  });

  it('tastatura aktivira toggle', () => {
    const onToggle = vi.fn();
    render(<LiveScoreboardExpanded match={match() as never} clock={null} onToggle={onToggle} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('Space aktivira toggle, drugi taster ne (batch 34)', () => {
    const onToggle = vi.fn();
    render(<LiveScoreboardExpanded match={match() as never} clock={null} onToggle={onToggle} />);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });
    expect(onToggle).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('bez klubova koristi zamjenske nazive i nule za penale (batch 34)', () => {
    render(
      <LiveScoreboardExpanded
        match={
          match({
            matchPeriod: 'PENALTIES',
            homeClub: null,
            awayClub: null,
            penaltyHomeScore: null,
            penaltyAwayScore: null,
          }) as never
        }
        clock={null}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('(0:0 pen)')).toBeInTheDocument();
    expect(screen.getByText('Gost')).toBeInTheDocument();
    expect(screen.getByText('Domaćin')).toBeInTheDocument();
  });
});

describe('LiveScoreboardOverlay', () => {
  const wrap = () => render(<MemoryRouter><LiveScoreboardOverlay match={match() as never} clock={clock as never} /></MemoryRouter>);

  it('počinje u kompaktnom prikazu i prebacuje na prošireni', async () => {
    wrap();
    const compact = screen.getByRole('button');
    expect(compact.className).toContain('w-[min(100%,23rem)]');
    await userEvent.click(compact);
    expect(screen.getByRole('button').className).toContain('w-[min(100%,40rem)]');
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button').className).toContain('w-[min(100%,23rem)]');
  });
});
