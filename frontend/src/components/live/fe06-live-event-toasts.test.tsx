import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LiveEventToast, useLiveEventToasts } from './use-live-event-toasts';
import type { MatchEvent } from '../../types';

vi.mock('../../lib/match-event-labels', () => ({
  matchEventLabel: (type: string) => `label:${type}`,
}));
vi.mock('../../lib/live-event-text', () => ({
  formatEventPlayers: (event: MatchEvent) => (event as { playersText?: string }).playersText ?? '',
}));

const event = (over: Record<string, unknown> = {}): MatchEvent => ({
  id: 'e1',
  type: 'GOAL',
  minute: 12,
  description: null,
  ...over,
} as unknown as MatchEvent);

function Probe({ events }: { events?: MatchEvent[] }) {
  const toast = useLiveEventToasts(events);
  if (!toast) return <span>nema-toasta</span>;
  return (
    <div>
      <span>toast:{toast.id}</span>
      <LiveEventToast event={toast} />
    </div>
  );
}

describe('useLiveEventToasts — izbor događaja', () => {
  it('bez događaja ne prikazuje toast', () => {
    render(<Probe />);
    expect(screen.getByText('nema-toasta')).toBeInTheDocument();
  });

  it('prazna lista ne prikazuje toast', () => {
    render(<Probe events={[]} />);
    expect(screen.getByText('nema-toasta')).toBeInTheDocument();
  });

  it('početak, poluvrijeme i komentar ne prave toast', () => {
    for (const type of ['KICKOFF', 'HALFTIME', 'SECOND_HALF', 'COMMENT']) {
      const { unmount } = render(<Probe events={[event({ id: type, type })]} />);
      expect(screen.getByText('nema-toasta')).toBeInTheDocument();
      unmount();
    }
  });

  it('komentar sa sudijskom odlukom ipak prikazuje toast', () => {
    render(<Probe events={[event({ id: 'c1', type: 'COMMENT', description: 'Sudijska odluka' })]} />);
    expect(screen.getByText('toast:c1')).toBeInTheDocument();
  });

  it('gol i kartice prikazuju zadnji događaj', () => {
    render(<Probe events={[event({ id: 'a' }), event({ id: 'b', type: 'YELLOW_CARD' })]} />);
    expect(screen.getByText('toast:b')).toBeInTheDocument();
    expect(screen.getByText('label:YELLOW_CARD')).toBeInTheDocument();
  });

  it('nepoznat tip događaja ostaje bez toasta', () => {
    render(<Probe events={[event({ id: 'x', type: 'CORNER' })]} />);
    expect(screen.getByText('nema-toasta')).toBeInTheDocument();
  });

  it('isti broj događaja sa novim zadnjim mijenja toast', () => {
    const { rerender } = render(<Probe events={[event({ id: 'a' })]} />);
    expect(screen.getByText('toast:a')).toBeInTheDocument();
    rerender(<Probe events={[event({ id: 'b' })]} />);
    expect(screen.getByText('toast:b')).toBeInTheDocument();
  });
});

describe('useLiveEventToasts — automatsko skrivanje', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('gol nestaje nakon 15 sekundi', () => {
    render(<Probe events={[event({ id: 'g1' })]} />);
    expect(screen.getByText('toast:g1')).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(14_999));
    expect(screen.getByText('toast:g1')).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(1));
    expect(screen.getByText('nema-toasta')).toBeInTheDocument();
  });

  it('zamjena nestaje nakon 7 sekundi, a kartica nakon 8', () => {
    const { rerender } = render(<Probe events={[event({ id: 's1', type: 'SUBSTITUTION' })]} />);
    act(() => void vi.advanceTimersByTime(7_000));
    expect(screen.getByText('nema-toasta')).toBeInTheDocument();
    rerender(<Probe events={[event({ id: 'y1', type: 'YELLOW_CARD' })]} />);
    act(() => void vi.advanceTimersByTime(7_999));
    expect(screen.getByText('toast:y1')).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(1));
    expect(screen.getByText('nema-toasta')).toBeInTheDocument();
  });

  it('nepoznat tip u mapi traje podrazumijevanih 8 sekundi', () => {
    render(<Probe events={[event({ id: 'p1', type: 'PENALTY_MISSED' })]} />);
    act(() => void vi.advanceTimersByTime(8_000));
    expect(screen.getByText('nema-toasta')).toBeInTheDocument();
  });
});

describe('LiveEventToast — izgled po tipu', () => {
  const classOf = (type: string) => {
    const { container, unmount } = render(
      <LiveEventToast event={event({ type, minute: 33 })} />,
    );
    const cls = container.firstElementChild?.className ?? '';
    unmount();
    return cls;
  };

  it('gol i penal imaju primarnu pozadinu', () => {
    expect(classOf('GOAL')).toContain('bg-primary/95');
    expect(classOf('PENALTY_SCORED')).toContain('bg-primary/95');
  });

  it('autogol, kartice, promašaj i zamjena imaju svoje klase', () => {
    expect(classOf('OWN_GOAL')).toContain('live-toast-goal');
    expect(classOf('YELLOW_CARD')).toContain('live-toast-yellow');
    expect(classOf('RED_CARD')).toContain('live-toast-red');
    expect(classOf('PENALTY_MISSED')).toContain('live-toast-penalty');
    expect(classOf('SUBSTITUTION')).toContain('live-toast-sub');
    expect(classOf('COMMENT')).toContain('bg-black/85');
  });

  it('prikazuje minutu, naziv događaja i igrače kad postoje', () => {
    render(<LiveEventToast event={event({ playersText: 'Ana, Bora', description: 'opis' })} />);
    expect(screen.getByText("12'")).toBeInTheDocument();
    expect(screen.getByText('label:GOAL')).toBeInTheDocument();
    expect(screen.getByText('Ana, Bora')).toBeInTheDocument();
    expect(screen.queryByText('opis')).toBeNull();
  });

  it('bez igrača prikazuje opis, a bez opisa ništa', () => {
    const { unmount } = render(<LiveEventToast event={event({ description: 'opis' })} />);
    expect(screen.getByText('opis')).toBeInTheDocument();
    unmount();
    const { container } = render(<LiveEventToast event={event({ description: null })} />);
    expect(container.querySelectorAll('p')).toHaveLength(2);
  });
});
