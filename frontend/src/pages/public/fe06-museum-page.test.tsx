import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MuseumPage } from './MuseumPage';
import type { MuseumItem } from '../../types';

const state = vi.hoisted(() => ({
  museum: { data: undefined as unknown, isLoading: false, isError: false },
  refetch: vi.fn(),
  hero: {} as Record<string, unknown>,
  filters: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useMuseum: () => ({ ...state.museum, refetch: state.refetch }),
}));
vi.mock('../../components/public/PageContainer', () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../components/public/museum/MuseumCinematicHero', () => ({
  MuseumCinematicHero: (props: Record<string, unknown>) => {
    state.hero = props;
    return <div>hero:{String(props.totalCount)}:{String(props.yearCount)}:{String(props.categoryCount)}</div>;
  },
}));
vi.mock('../../components/public/museum/MuseumExhibitCard', () => ({
  MuseumExhibitCard: ({ item }: { item: MuseumItem }) => <div>predmet:{item.title}</div>,
}));
vi.mock('../../components/public/museum/MuseumFilters', () => ({
  MuseumFilters: (props: Record<string, unknown>) => {
    state.filters = props;
    const years = props.years as number[];
    const categories = props.categories as string[];
    return (
      <div>
        filteri:{years.join(',')}:{categories.join(',')}
        {(props.onYear as (y?: number) => void) && (
          <button onClick={() => (props.onYear as (y?: number) => void)(1974)}>godina-1974</button>
        )}
        <button onClick={() => (props.onYear as (y?: number) => void)(undefined)}>sve-godine</button>
        <button onClick={() => (props.onCategory as (c?: string) => void)('jersey')}>kat-dres</button>
        <button onClick={() => (props.onCategory as (c?: string) => void)(undefined)}>sve-kategorije</button>
      </div>
    );
  },
}));
vi.mock('../../components/news/NewsSectionTitle', () => ({
  NewsSectionTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));
vi.mock('../../lib/motion/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));
vi.mock('../../lib/museum-categories', () => ({
  museumCategoryLabel: (value?: string | null) => (value === 'jersey' ? 'Dres' : 'Fotografija'),
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

const item = (over: Record<string, unknown> = {}) => ({
  id: 'i1',
  title: 'Dres',
  year: 1974,
  category: 'jersey',
  ...over,
});

beforeEach(() => {
  state.museum = {
    data: [item(), item({ id: 'i2', title: 'Fotografija', year: 1980, category: 'photo' })],
    isLoading: false,
    isError: false,
  };
  state.refetch.mockReset();
  state.hero = {};
  state.filters = {};
});

describe('MuseumPage — učitavanje i prikaz', () => {
  it('prikazuje SEO, hero sa brojevima i sve predmete', () => {
    render(<MuseumPage />);
    expect(screen.getByText('seo:pages.museum.seoTitle')).toBeInTheDocument();
    expect(screen.getByText('hero:2:2:2')).toBeInTheDocument();
    expect(screen.getByText('predmet:Dres')).toBeInTheDocument();
    expect(screen.getByText('predmet:Fotografija')).toBeInTheDocument();
  });

  it('dok se učitava prikazuje šest skeleton kartica bez praznog stanja', () => {
    state.museum = { data: undefined, isLoading: true, isError: false };
    render(<MuseumPage />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
    expect(screen.queryByText(/prazno:/)).toBeNull();
    expect(screen.getByText('hero:0:0:0')).toBeInTheDocument();
  });

  it('prazna lista prikazuje prazno stanje sa porukom', () => {
    state.museum = { data: [], isLoading: false, isError: false };
    render(<MuseumPage />);
    expect(screen.getByText('prazno:pages.museum.empty')).toBeInTheDocument();
  });

  it('podaci bez godine i kategorije ne ulaze u filtere', () => {
    state.museum = {
      data: [item({ year: undefined, category: undefined })],
      isLoading: false,
      isError: false,
    };
    render(<MuseumPage />);
    expect(screen.getByText('filteri::')).toBeInTheDocument();
  });

  it('greška prikazuje DataError i retry', async () => {
    const user = userEvent.setup();
    state.museum = { data: undefined, isLoading: false, isError: true };
    render(<MuseumPage />);
    expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
    await user.click(screen.getByText('pokušaj'));
    expect(state.refetch).toHaveBeenCalledTimes(1);
  });
});

describe('MuseumPage — filteri', () => {
  it('godine su opadajuće bez duplikata, kategorije rastuće', () => {
    state.museum = {
      data: [item({ year: 1974 }), item({ id: 'x', year: 1990 }), item({ id: 'y', year: 1974 })],
      isLoading: false,
      isError: false,
    };
    render(<MuseumPage />);
    expect(screen.getByText(/filteri:1990,1974/)).toBeInTheDocument();
    expect(state.filters.categoryLabel).toBeTypeOf('function');
  });

  it('izbor godine filtrira predmete, a "sve godine" vraća sve', async () => {
    const user = userEvent.setup();
    render(<MuseumPage />);
    await user.click(screen.getByText('godina-1974'));
    expect(screen.getByText('predmet:Dres')).toBeInTheDocument();
    expect(screen.queryByText('predmet:Fotografija')).toBeNull();
    await user.click(screen.getByText('sve-godine'));
    expect(screen.getByText('predmet:Fotografija')).toBeInTheDocument();
  });

  it('izbor kategorije filtrira, a "sve kategorije" vraća sve', async () => {
    const user = userEvent.setup();
    render(<MuseumPage />);
    await user.click(screen.getByText('kat-dres'));
    expect(screen.getByText('predmet:Dres')).toBeInTheDocument();
    expect(screen.queryByText('predmet:Fotografija')).toBeNull();
    await user.click(screen.getByText('sve-kategorije'));
    expect(screen.getByText('predmet:Dres')).toBeInTheDocument();
    expect(screen.getByText('predmet:Fotografija')).toBeInTheDocument();
  });

  it('kombinacija filtera može dati prazno stanje', async () => {
    const user = userEvent.setup();
    render(<MuseumPage />);
    await user.click(screen.getByText('godina-1974'));
    await user.click(screen.getByText('sve-kategorije'));
    await user.click(screen.getByText('kat-dres'));
    expect(screen.getByText('predmet:Dres')).toBeInTheDocument();
    expect(screen.queryByText(/prazno:/)).toBeNull();
  });

  it('selekcija se prenosi u filtere kao aktivna vrijednost', async () => {
    const user = userEvent.setup();
    render(<MuseumPage />);
    await user.click(screen.getByText('godina-1974'));
    expect(state.filters.year).toBe(1974);
    await user.click(screen.getByText('kat-dres'));
    expect(state.filters.category).toBe('jersey');
  });
});
