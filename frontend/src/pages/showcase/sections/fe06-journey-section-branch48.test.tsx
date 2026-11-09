import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { JourneySection } from './JourneySection';

vi.mock('../../../lib/motion/AnimatedSection', () => ({
  AnimatedSection: ({ children }: { children: unknown }) => <div>{children as never}</div>,
}));

vi.mock('../StatusBadge', () => ({
  StatusBadge: ({ badge }: { badge: string }) => <span data-testid="badge">{badge}</span>,
}));

vi.mock('./SectionIntro', () => ({
  SectionIntro: ({ title }: { title: string }) => <div data-testid="intro">{title}</div>,
}));

describe('JourneySection — branch48 (2 grane moduleIds ?? i related)', () => {
  const modules = [
    { id: 'm1', title: 'Mod A', badge: 'live', percent: 10 },
    { id: 'm2', title: 'Mod B', badge: 'soon', percent: 20 },
  ] as never;

  it('sa moduleIds undefined pokriva bid0 [9,0] fallback []', () => {
    const section = { id: 'journey', title: 'Put', moduleIds: undefined } as never;
    render(<JourneySection section={section} modules={modules} index={2} />);
    expect(screen.getByTestId('intro')).toBeInTheDocument();
    expect(screen.queryByTestId('badge')).toBeNull();
  });

  it('sa moduleIds [] prazno i bez related', () => {
    const section = { id: 'journey', title: 'Put', moduleIds: [] } as never;
    const { container } = render(<JourneySection section={section} modules={modules} index={2} />);
    expect(container.querySelector('.flex-wrap')).toBeNull();
  });

  it('sa valid moduleIds pokriva related.length true (bid1)', () => {
    const section = { id: 'journey', title: 'Put', moduleIds: ['m1', 'm2'] } as never;
    render(<JourneySection section={section} modules={modules} index={3} />);
    expect(screen.getAllByTestId('badge')).toHaveLength(2);
    expect(screen.getByText('Mod A')).toBeInTheDocument();
    expect(screen.getByText('Mod B')).toBeInTheDocument();
  });

  it('sa nepostojećim moduleIds related prazno', () => {
    const section = { id: 'journey', title: 'Put', moduleIds: ['xxx'] } as never;
    const { container } = render(<JourneySection section={section} modules={modules} index={1} />);
    expect(container.querySelector('.flex-wrap')).toBeNull();
  });

  it('prikazuje sve stepove', () => {
    const section = { id: 'journey', title: 'Put', moduleIds: [] } as never;
    render(<JourneySection section={section} modules={[]} index={1} />);
    expect(screen.getByText('Sadržaj')).toBeInTheDocument();
    expect(screen.getByText('Članstvo')).toBeInTheDocument();
    expect(screen.getByText('Ulaznica')).toBeInTheDocument();
    expect(screen.getByText('Ulaz')).toBeInTheDocument();
  });
});
