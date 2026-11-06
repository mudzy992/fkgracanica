import { render as rtlRender, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsListPage } from './NewsListPage';

const state = vi.hoisted(() => ({
  categories: { data: undefined as unknown },
  news: {
    data: undefined as unknown,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
  filters: [] as Record<string, unknown>[],
  cards: [] as { kind: string; id: string }[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useNewsCategories: () => state.categories,
  usePublishedNews: (categoryId?: string) => {
    state.filters.push({ categoryId });
    return state.news;
  },
}));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/news/NewsCategoryFilter', () => ({
  NewsCategoryFilter: (props: Record<string, unknown>) => (
    <div data-testid="news-filter">
      <button onClick={() => (props.onChange as (id?: string) => void)('cat-1')}>filter-1</button>
      <button onClick={() => (props.onChange as (id?: string) => void)(undefined)}>filter-all</button>
    </div>
  ),
}));
vi.mock('../../cms/widgets/news-feed-cards', () => ({
  NewsFeaturedCard: ({ item }: { item: { id: string } }) => {
    state.cards.push({ kind: 'featured', id: item.id });
    return <div data-testid={`featured-${item.id}`} />;
  },
  NewsCompactCard: ({ item }: { item: { id: string } }) => {
    state.cards.push({ kind: 'compact', id: item.id });
    return <div data-testid={`compact-${item.id}`} />;
  },
  NewsGridCard: ({ item }: { item: { id: string } }) => {
    state.cards.push({ kind: 'grid', id: item.id });
    return <div data-testid={`grid-${item.id}`} />;
  },
}));

const item = (id: string) => ({ id, title: `Vijest ${id}`, slug: id });

const render = (ui: React.ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

describe('NewsListPage', () => {
  beforeEach(() => {
    state.categories = { data: [] };
    state.news = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
    state.filters = [];
    state.cards = [];
  });

  it('prikazuje hero, SEO i filter kategorija', () => {
    render(<NewsListPage />);
    expect(screen.getByText('news.title')).toBeTruthy();
    expect(screen.getByTestId('news-filter')).toBeTruthy();
  });

  it('dok se vijesti učitavaju prikazuje šest skeleton kartica', () => {
    state.news = { data: undefined, isLoading: true, isError: false, refetch: vi.fn() };
    const { container } = render(<NewsListPage />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(18);
    expect(state.cards).toHaveLength(0);
  });

  it('greška prikazuje DataError i retry poziva refetch', async () => {
    state.news = { data: undefined, isLoading: false, isError: true, refetch: vi.fn() };
    render(<NewsListPage />);
    expect(screen.getByRole('alert')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'actions.retry' }));
    expect(state.news.refetch).toHaveBeenCalledTimes(1);
  });

  it('bez vijesti prikazuje prazno stanje', () => {
    render(<NewsListPage />);
    expect(screen.getByText('news.empty')).toBeTruthy();
  });

  it('feed raspored: prva vijest je izdvojena, sljedeće dvije kompaktne', () => {
    state.news = { data: [item('a'), item('b'), item('c')], isLoading: false, isError: false, refetch: vi.fn() };
    render(<NewsListPage />);
    expect(state.cards).toEqual([
      { kind: 'featured', id: 'a' },
      { kind: 'compact', id: 'b' },
      { kind: 'compact', id: 'c' },
    ]);
  });

  it('feed raspored: ostatak ide u mrežu', () => {
    state.news = {
      data: [item('a'), item('b'), item('c'), item('d'), item('e')],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    render(<NewsListPage />);
    expect(state.cards.map((c) => `${c.kind}:${c.id}`)).toEqual([
      'featured:a',
      'compact:b',
      'compact:c',
      'grid:d',
      'grid:e',
    ]);
  });

  it('jedna vijest daje samo izdvojenu karticu', () => {
    state.news = { data: [item('a')], isLoading: false, isError: false, refetch: vi.fn() };
    render(<NewsListPage />);
    expect(state.cards).toEqual([{ kind: 'featured', id: 'a' }]);
  });

  it('odabrana kategorija prelazi u mrežni raspored bez izdvajanja', async () => {
    state.news = {
      data: [item('a'), item('b')],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    render(<NewsListPage />);
    await userEvent.click(screen.getByText('filter-1'));
    expect(state.cards.slice(-2)).toEqual([
      { kind: 'grid', id: 'a' },
      { kind: 'grid', id: 'b' },
    ]);
  });

  it('filter prosljeđuje kategoriju hooku i prima omotane podatke', () => {
    state.categories = { data: { data: [{ id: 'cat-1', name: 'Klub' }] } };
    state.news = {
      data: { items: [item('x')] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    render(<NewsListPage />);
    expect(state.cards).toEqual([
      { kind: 'featured', id: 'x' },
    ]);
    expect(state.filters[0]).toEqual({ categoryId: undefined });
  });
});
