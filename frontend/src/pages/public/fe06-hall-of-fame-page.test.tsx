import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  HofLegendCard: ({ entry, onOpen }: {
    entry: { id: string; name: string }; onOpen: (e: unknown) => void;
  }) => (
    <button onClick={() => onOpen(entry)}>legenda:{entry.name}</button>
  ),
}));
vi.mock('../../components/public/hall-of-fame/HofLegendDialog', () => ({
  HofLegendDialog: (props: Record<string, unknown>) => {
    state.dialog = props;
    const entry = props.entry as { name?: string } | null;
    return (
      <div>
        dijalog:{String(props.open)}:{entry?.name ?? '-'}
        <button onClick={() => (props.onClose as () => void)()}>zatvori-dijalog</button>
      </div>
    );
  },
}));
vi.mock('../../lib/motion/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));
vi.mock('../../components/public/EmptyState', () => ({
  EmptyState: ({ message }: { message: string }) => <p>prazno:{message}</p>,
}));
vi.mock('../../components/common/DataError', () => ({
  DataError: ({ onRetry }: { onRetry?: () => void }) => (
    <div>
      greška
      <button onClick={onRetry}>pokušaj</button>
    </div>
  ),
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
  state.hof = {
    data: [entry(), entry({ id: 'h2', name: 'Branko Branković', years: '1965–1970' })],
    isLoading: false,
    isError: false,
  };
  state.refetch.mockReset();
  state.hero = {};
  state.dialog = {};
});

describe('HallOfFamePage — grupisanje', () => {
  it('prikazuje SEO, hero i legende grupisane po prvoj godini', () => {
    renderPage();
    expect(screen.getByText('seo:pages.hallOfFame.seoTitle')).toBeInTheDocument();
    expect(screen.getByText('hero:2:1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '1965' })).toBeInTheDocument();
    const names = screen.getAllByRole('button', { name: /^legenda:/ }).map((b) => b.textContent);
    expect(names).toEqual(['legenda:Asim Softić', 'legenda:Branko Branković']);
  });

  it('grupe su sortirane opadajuće po godini, a imena rastuće', () => {
    state.hof.data = [
      entry({ id: 'a', name: 'Zoran', years: '1990' }),
      entry({ id: 'b', name: 'Ana', years: '2020' }),
      entry({ id: 'c', name: 'Marko', years: '1990' }),
    ];
    renderPage();
    const headings = screen.getAllByRole('heading').map((h) => h.textContent);
    expect(headings).toContain('2020');
    expect(headings.indexOf('2020')).toBeLessThan(headings.indexOf('1990'));
    const names = screen.getAllByRole('button', { name: /^legenda:/ }).map((b) => b.textContent);
    expect(names).toEqual(['legenda:Ana', 'legenda:Marko', 'legenda:Zoran']);
  });

  it('unos bez godine ide u grupu sa praznim naslovom', () => {
    state.hof.data = [entry({ years: null })];
    renderPage();
    expect(screen.getByText('legenda:Asim Softić')).toBeInTheDocument();
    expect(screen.getByText('hero:1:1')).toBeInTheDocument();
  });

  it('years bez četverocifrenog broja daje praznu grupu', () => {
    state.hof.data = [entry({ years: 'nepoznato' })];
    renderPage();
    expect(screen.getByText('legenda:Asim Softić')).toBeInTheDocument();
  });

  it('prikazuje završnu notu i link nazad', () => {
    renderPage();
    expect(screen.getByText('Završna nota')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Nazad na O klubu/ })).toHaveAttribute('href', '/o-klubu');
  });
});

describe('HallOfFamePage — stanja', () => {
  it('dok se učitava prikazuje šest skeletona', () => {
    state.hof = { data: undefined, isLoading: true, isError: false };
    renderPage();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
    expect(screen.queryByText(/prazno:/)).toBeNull();
  });

  it('prazna lista prikazuje prazno stanje', () => {
    state.hof = { data: [], isLoading: false, isError: false };
    renderPage();
    expect(screen.getByText('prazno:pages.hallOfFame.empty')).toBeInTheDocument();
    expect(screen.getByText('hero:0:0')).toBeInTheDocument();
  });

  it('greška prikazuje DataError bez grupa i retry radi', async () => {
    const user = userEvent.setup();
    state.hof = { data: undefined, isLoading: false, isError: true };
    renderPage();
    expect(screen.getByText('greška')).toBeInTheDocument();
    expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
    await user.click(screen.getByText('pokušaj'));
    expect(state.refetch).toHaveBeenCalledTimes(1);
  });
});

describe('HallOfFamePage — dijalog legende', () => {
  it('otvara dijalog sa izabranim unosom i zatvara ga', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByText('dijalog:false:-')).toBeInTheDocument();
    await user.click(screen.getByText('legenda:Asim Softić'));
    expect(screen.getByText('dijalog:true:Asim Softić')).toBeInTheDocument();
    expect(state.dialog.entry).toMatchObject({ id: 'h1' });
    await user.click(screen.getByText('zatvori-dijalog'));
    expect(screen.getByText('dijalog:false:-')).toBeInTheDocument();
  });
});
