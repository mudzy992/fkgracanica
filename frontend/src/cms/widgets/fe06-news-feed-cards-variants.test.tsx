import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { NewsCompactCard, NewsFeaturedCard, NewsGridCard } from './news-feed-cards';

/**
 * Batch 34 — varijante podataka za tri kartice vijesti:
 * sa naslovnom slikom, bez datuma, bez izvoda i uz `prefers-reduced-motion`.
 */
vi.mock('framer-motion', () => ({
  motion: {
    article: ({ children, ...rest }: React.HTMLAttributes<HTMLElement>) => (
      <article {...rest}>{children}</article>
    ),
  },
  // `true` pokriva grane `initial={reduce ? false : …}` za sve tri kartice.
  useReducedMotion: () => true,
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../lib/utils', async (orig) => ({
  ...(await orig<Record<string, unknown>>()),
  formatDate: (value: string) => `datum:${value}`,
}));

const item = (over: Record<string, unknown> = {}) => ({
  id: 'n1',
  slug: 'vijest-1',
  title: 'Naslov vijesti',
  excerpt: '<p>Kratak opis</p>',
  coverPath: null,
  publishedAt: '2026-05-01T10:00:00Z',
  ...over,
});

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('NewsCompactCard — varijante', () => {
  it('sa naslovnom slikom prikazuje sliku i pun sadržaj', () => {
    const { container } = wrap(
      <NewsCompactCard item={item({ coverPath: 'mediji/slika.jpg' }) as never} delay={0} />,
    );
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      expect.stringContaining('slika.jpg'),
    );
    expect(screen.getByText('Naslov vijesti')).toBeInTheDocument();
    expect(screen.getByText('datum:2026-05-01T10:00:00Z')).toBeInTheDocument();
    expect(screen.getByText('Kratak opis')).toBeInTheDocument();
  });

  it('bez datuma i izvoda ne pada i ne prikazuje tekst', () => {
    wrap(
      <NewsCompactCard
        item={item({ publishedAt: null, excerpt: undefined }) as never}
        delay={0}
      />,
    );
    expect(screen.queryByText(/datum:/)).toBeNull();
    expect(screen.getByText('Naslov vijesti')).toBeInTheDocument();
  });
});

describe('NewsGridCard — varijante', () => {
  it('sa naslovnom slikom prikazuje sliku', () => {
    const { container } = wrap(
      <NewsGridCard item={item({ coverPath: 'mediji/mreza.jpg' }) as never} delay={0} />,
    );
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      expect.stringContaining('mreza.jpg'),
    );
  });

  it('bez slike i bez datuma prikazuje samo naslov', () => {
    const { container } = wrap(<NewsGridCard item={item({ publishedAt: null }) as never} delay={0} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByText(/datum:/)).toBeNull();
    expect(screen.getByText('Naslov vijesti')).toBeInTheDocument();
  });
});

describe('NewsFeaturedCard — varijante', () => {
  it('sa naslovnom slikom prikazuje sliku i poziv na čitanje', () => {
    const { container } = wrap(
      <NewsFeaturedCard item={item({ coverPath: 'mediji/istaknuta.jpg' }) as never} />,
    );
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      expect.stringContaining('istaknuta.jpg'),
    );
    expect(screen.getByText('t:news.readMore')).toBeInTheDocument();
  });

  it('bez slike i datuma ostaje bez slike, datuma i izvoda', () => {
    const { container } = wrap(
      <NewsFeaturedCard item={item({ coverPath: null, publishedAt: null, excerpt: null }) as never} />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByText(/datum:/)).toBeNull();
    expect(screen.getByText('Naslov vijesti')).toBeInTheDocument();
  });
});
