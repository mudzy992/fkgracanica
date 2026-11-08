import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HallOfFamePage } from './HallOfFamePage';

const state = vi.hoisted(() => ({
  hof: { data: undefined as unknown, isLoading: false, isError: false },
  refetch: vi.fn(),
  hero: {} as Record<string, unknown>,
  dialog: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useHallOfFame: () => ({ ...state.hof, refetch: state.refetch }),
}));
vi.mock('../../components/public/PageContainer', () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../components/public/hall-of-fame/HallOfFameCinematicHero', () => ({
  HallOfFameCinematicHero: (props: Record<string, unknown>) => {
    state.hero = props;
    return <div>hero:{String(props.totalCount)}:{String(props.yearCount)}</div>;
  },
}));
vi.mock('../../components/public/hall-of-fame/HofLegendCard', () => ({
  HofLegendCard: ({ entry }: { entry: { id: string; name: string } }) => (
    <div>legenda:{entry.name}</div>
  ),
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
  EmptyState: ({ message }: { message: string }) => <p>prazno:{message}</p>,
}));
vi.mock('../../components/common/DataError', () => ({
  DataError: () => <div>greška</div>,
}));
vi.mock('../../components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

const entry = (over: Record<string, unknown> = {}) => ({
  id: 'h1',
  name: 'Asim Softić',
  years: '1965–1978',
  ...over,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <HallOfFamePage />
    </MemoryRouter>,
  );

beforeEach(() => {
  state.hof = { data: [], isLoading: false, isError: false };
  state.hero = {};
});

describe('HallOfFamePage — sort grane (Number || 0 i localeCompare)', () => {
  it('prazna godina daje 0 i sortira se ispod validne godine', () => {
    state.hof.data = [entry({ id: 'a', name: 'Bez', years: null }), entry({ id: 'b', name: 'Valid', years: '2020' })];
    renderPage();
    // validna godina treba biti prije prazne (opadajuće)
    const legends = screen.getAllByText(/^legenda:/).map((n) => n.textContent);
    expect(legends[0]).toBe('legenda:Valid');
    expect(legends[1]).toBe('legenda:Bez');
    // hero yearCount treba brojati obje grupe
    expect(state.hero).toMatchObject({ totalCount: 2, yearCount: 2 });
  });

  it('dvije legende sa istom numeričkom godinom padaju na localeCompare', () => {
    state.hof.data = [
      entry({ id: 'a', name: 'Zoran', years: '1965' }),
      entry({ id: 'b', name: 'Ana', years: '1965' }),
    ];
    renderPage();
    const legends = screen.getAllByText(/^legenda:/).map((n) => n.textContent);
    // ista godina, sortirano po imenu unutar grupe, ali grupe same po localeCompare kad je numerički 0
    // grupa je ista godina '1965', pa unutar grupe imena sortirana rastuće
    expect(legends).toEqual(['legenda:Ana', 'legenda:Zoran']);
  });

  it('dvije prazne godine daju isti numerički 0 pa localeCompare praznih', () => {
    state.hof.data = [
      entry({ id: 'a', name: 'Prvi', years: '' }),
      entry({ id: 'b', name: 'Drugi', years: 'nepoznato' }),
    ];
    renderPage();
    // obje prazne godine '' -> Number('') || 0 = 0, pa localeCompare '' vs '' = 0, redoslijed stabilan
    expect(screen.getAllByText(/^legenda:/)).toHaveLength(2);
    expect(state.hero).toMatchObject({ yearCount: 1 }); // obje u istoj praznoj grupi
  });

  it('mješavina praznih i validnih sa istom nulom pokriva sve grane', () => {
    state.hof.data = [
      entry({ id: 'a', name: 'A', years: '1990' }),
      entry({ id: 'b', name: 'B', years: null }),
      entry({ id: 'c', name: 'C', years: '1990' }),
      entry({ id: 'd', name: 'D', years: '' }),
    ];
    renderPage();
    const legends = screen.getAllByText(/^legenda:/).map((n) => n.textContent);
    // 1990 grupa treba biti prije prazne
    expect(legends[0]).toBe('legenda:A');
    expect(legends[1]).toBe('legenda:C');
    // prazna grupa na kraju
    expect(legends).toContain('legenda:B');
    expect(legends).toContain('legenda:D');
  });
});
