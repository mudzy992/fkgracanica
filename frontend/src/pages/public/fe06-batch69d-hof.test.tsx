import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HallOfFamePage } from './HallOfFamePage';

const state = vi.hoisted(() => ({
  hof: { data: undefined as unknown, isLoading: false, isError: false },
  refetch: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useHallOfFame: () => ({ ...state.hof, refetch: state.refetch }),
}));
vi.mock('../../components/public/PageContainer', () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../components/public/hall-of-fame/HallOfFameCinematicHero', () => ({
  HallOfFameCinematicHero: (props: Record<string, unknown>) => <div>hero:{String(props.yearCount)}</div>,
}));
vi.mock('../../components/public/hall-of-fame/HofLegendCard', () => ({
  HofLegendCard: ({ entry }: { entry: { name: string } }) => <div>karta:{entry.name}</div>,
}));
vi.mock('../../components/public/hall-of-fame/HofLegendDialog', () => ({
  HofLegendDialog: () => <div>dijalog</div>,
}));
vi.mock('../../lib/motion/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: () => <div>seo</div>,
}));
vi.mock('../../components/public/EmptyState', () => ({
  EmptyState: ({ message }: { message: string }) => <div>prazno:{message}</div>,
}));
vi.mock('../../components/common/DataError', () => ({
  DataError: () => <div>greška</div>,
}));
vi.mock('../../components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

const entry = (over: Record<string, unknown> = {}) => ({
  id: 'h1',
  name: 'Test',
  years: '1965',
  ...over,
});

describe('fe06-batch69d HallOfFamePage sort fallback [Number||0 fallback + localeCompare]', () => {
  beforeEach(() => {
    state.hof = { data: undefined, isLoading: false, isError: false };
  });

  it('pokriva (Number(b.year)||0) i localeCompare kada oba daju 0', () => {
    // '0000' => Number('0000')=0, '' => Number('')=0 => difference 0 => fallback localeCompare
    state.hof.data = [
      entry({ id: 'a', name: 'A', years: '0000' }),
      entry({ id: 'b', name: 'B', years: null }),
      entry({ id: 'c', name: 'C', years: '0000' }),
    ] as never;
    render(
      <MemoryRouter>
        <HallOfFamePage />
      </MemoryRouter>,
    );
    // both buckets should render headings: '0000' and '' (empty)
    // empty heading renders as <h2></h2> but still present; we check cards
    expect(screen.getByText('karta:A')).toBeInTheDocument();
    expect(screen.getByText('karta:B')).toBeInTheDocument();
    expect(screen.getByText('karta:C')).toBeInTheDocument();
    // hero yearCount should be 2 (buckets '0000' and '')
    expect(screen.getByText('hero:2')).toBeInTheDocument();
  });

  it('pokriva extractYears ?? [] i map.get ?? [] kombinovano', () => {
    state.hof.data = [
      entry({ id: '1', years: 'nepoznato' }),
      entry({ id: '2', years: '1999' }),
      entry({ id: '3', years: '1999' }),
      entry({ id: '4', years: null }),
    ] as never;
    render(
      <MemoryRouter>
        <HallOfFamePage />
      </MemoryRouter>,
    );
    expect(screen.getAllByText(/karta:/)).toHaveLength(4);
  });
});
