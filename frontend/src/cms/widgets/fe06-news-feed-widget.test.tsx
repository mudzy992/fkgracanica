import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsFeedWidget } from './NewsFeedWidget';

const state = vi.hoisted(() => ({
  news: { data: undefined as unknown, isLoading: false },
  categoryId: 'nije-postavljen' as string | undefined,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  usePublishedNews: (categoryId?: string) => {
    state.categoryId = categoryId;
    return state.news;
  },
}));
vi.mock('../../components/ui/skeleton', () => ({
  SkeletonCard: () => <div data-testid="skeleton-card" />,
}));
vi.mock('../../lib/utils', () => ({
  cn: (...values: Array<string | undefined>) => values.filter(Boolean).join(' '),
  formatDate: (value: string) => `datum:${value}`,
}));

const item = (n: number, over: Record<string, unknown> = {}) => ({
  id: `n${n}`,
  slug: `vijest-${n}`,
  title: `Vijest ${n}`,
  excerpt: '<p>Kratak opis</p>',
  coverPath: null,
  publishedAt: '2026-05-01T10:00:00Z',
  ...over,
});

const renderWidget = (config: Record<string, unknown> = {}) =>
  render(
    <MemoryRouter>
      <NewsFeedWidget config={{ limit: 3, ...config } as never} />
    </MemoryRouter>,
  );

beforeEach(() => {
  state.news = { data: [], isLoading: false };
  state.categoryId = 'nije-postavljen';
});

describe('NewsFeedWidget — zaglavlje', () => {
  it('prikazuje podrazumijevani naslov i link na sve vijesti', () => {
    state.news = { data: [item(1)], isLoading: false };
    renderWidget();
    expect(screen.getByRole('heading', { name: 'home.latestNews' })).toBeInTheDocument();
    expect(screen.getByText('home.latestNewsSubtitle')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'actions.viewAll' })).toHaveAttribute('href', '/vijesti');
  });

  it('koristi config naslov, kategoriju i oznaku linka', () => {
    state.news = { data: [item(1)], isLoading: false };
    renderWidget({ title: 'Saopštenja', categoryId: 'cat-1', viewAllUrl: '/saopstenja', viewAllLabel: 'Sva saopštenja' });
    expect(screen.getByRole('heading', { name: 'Saopštenja' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sva saopštenja' })).toHaveAttribute('href', '/saopstenja');
    expect(state.categoryId).toBe('cat-1');
  });
});

describe('NewsFeedWidget — sadržaj', () => {
  it('prva vijest je istaknuta, sljedeće dvije su kompaktne', () => {
    state.news = { data: [item(1), item(2), item(3)], isLoading: false };
    renderWidget();
    expect(screen.getAllByRole('link', { name: /Vijest/ })).toHaveLength(3);
    expect(screen.getAllByText('Kratak opis')).toHaveLength(3);
    expect(screen.getAllByText('datum:2026-05-01T10:00:00Z')).toHaveLength(3);
  });

  it('više od tri vijesti ide u mrežu', () => {
    state.news = { data: [item(1), item(2), item(3), item(4), item(5)], isLoading: false };
    renderWidget({ limit: 5 });
    expect(screen.getAllByRole('link', { name: /Vijest/ })).toHaveLength(5);
  });

  it('poštuje limit iz configa', () => {
    state.news = { data: [item(1), item(2), item(3), item(4)], isLoading: false };
    renderWidget({ limit: 2 });
    expect(screen.getAllByRole('link', { name: /Vijest/ })).toHaveLength(2);
  });

  it('bez vijesti prikazuje poruku bez rezultata', () => {
    renderWidget();
    expect(screen.getByText('common.noResults')).toBeInTheDocument();
  });

  it('dok se učitava prikazuje onoliko skeletona koliko je limit (najviše 3)', () => {
    state.news = { data: undefined, isLoading: true };
    const first = renderWidget({ limit: 5 });
    expect(screen.getAllByTestId('skeleton-card')).toHaveLength(3);
    first.unmount();
    renderWidget({ limit: 2 });
    expect(screen.getAllByTestId('skeleton-card')).toHaveLength(2);
  });

  it('vijest bez naslovne slike i datuma i dalje se prikazuje', () => {
    state.news = {
      data: [item(1, { coverPath: null, publishedAt: null, excerpt: null })],
      isLoading: false,
    };
    renderWidget();
    expect(screen.getByRole('link', { name: /Vijest 1/ })).toBeInTheDocument();
  });
});
