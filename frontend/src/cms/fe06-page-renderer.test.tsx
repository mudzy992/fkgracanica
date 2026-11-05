import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageRenderer } from './PageRenderer';

const state = vi.hoisted(() => ({
  page: { data: undefined as unknown, isLoading: false, isError: false },
  calls: [] as Array<{ slug: string; admin?: boolean }>,
  sections: [] as Array<Record<string, unknown>>,
  wrapper: {} as Record<string, unknown>,
  seo: {} as Record<string, unknown>,
  dividers: 0,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../hooks/use-cms-pages', () => ({
  useCmsPage: (slug: string, admin?: boolean) => {
    state.calls.push({ slug, admin });
    return state.page;
  },
}));
vi.mock('../components/seo/Seo', () => ({
  Seo: (props: Record<string, unknown>) => {
    state.seo = props;
    return <div>seo:{String(props.url)}</div>;
  },
}));
vi.mock('../components/public/shell/SectionDivider', () => ({
  SectionDivider: () => {
    state.dividers += 1;
    return <hr data-testid="divider" />;
  },
}));
vi.mock('../lib/motion/AnimatedSection', () => ({
  AnimatedSection: (props: Record<string, unknown>) => {
    state.wrapper = props;
    return <div data-variant={String(props.variant)} data-index={String(props.index)}>{props.children as React.ReactNode}</div>;
  },
}));
vi.mock('../components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" data-class={className} />
  ),
}));
vi.mock('./WidgetRenderer', () => ({
  WidgetRenderer: ({ section }: { section: { id: string } }) => (
    <div>widget:{section.id}</div>
  ),
}));

const section = (id: string, widgetType: string, over: Record<string, unknown> = {}) => ({
  id,
  widgetType,
  enabled: true,
  config: {},
  ...over,
});

const page = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  slug: 'home',
  title: 'Početna',
  status: 'PUBLISHED',
  seoTitle: 'SEO naslov',
  seoDesc: 'SEO opis',
  isSystem: true,
  sections: [section('s1', 'hero'), section('s2', 'news-feed'), section('s3', 'cta-band')],
  ...over,
});

beforeEach(() => {
  state.page = { data: page(), isLoading: false, isError: false };
  state.calls = [];
  state.wrapper = {};
  state.seo = {};
  state.dividers = 0;
});

describe('PageRenderer — stanja', () => {
  it('dok se stranica učitava prikazuje dva skeletona bez SEO-a', () => {
    state.page = { data: undefined, isLoading: true, isError: false };
    render(<PageRenderer slug="home" />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(2);
    expect(screen.queryByText(/seo:/)).toBeNull();
  });

  it('greška prikazuje poruku i prosljeđuje admin flag', () => {
    state.page = { data: undefined, isLoading: false, isError: true };
    render(<PageRenderer slug="o-nama" admin />);
    expect(screen.getByText('pages.notFound')).toBeInTheDocument();
    expect(state.calls[0]).toEqual({ slug: 'o-nama', admin: true });
  });

  it('stranica bez sekcija prikazuje samo SEO', () => {
    state.page = { data: page({ sections: [] }), isLoading: false, isError: false };
    render(<PageRenderer slug="prazna" />);
    expect(screen.queryByText(/widget:/)).toBeNull();
    expect(screen.getByText('seo:/p/prazna')).toBeInTheDocument();
  });
});

describe('PageRenderer — SEO', () => {
  it('za home koristi korijen bez naslova i opisa', () => {
    render(<PageRenderer slug="home" />);
    expect(state.seo).toEqual({
      title: undefined,
      description: undefined,
      url: '/',
      type: 'website',
    });
  });

  it('za ostale stranice koristi SEO polja ili naslov', () => {
    state.page = { data: page({ slug: 'o-nama' }), isLoading: false, isError: false };
    render(<PageRenderer slug="o-nama" />);
    expect(state.seo).toMatchObject({
      title: 'SEO naslov',
      description: 'SEO opis',
      url: '/p/o-nama',
    });
  });

  it('bez SEO polja koristi naslov i undefined opis', () => {
    state.page = {
      data: page({ seoTitle: null, seoDesc: null }),
      isLoading: false,
      isError: false,
    };
    render(<PageRenderer slug="kontakt" />);
    expect(state.seo).toMatchObject({ title: 'Početna', description: undefined, url: '/p/kontakt' });
  });
});

describe('PageRenderer — sekcije', () => {
  it('prikazuje sve sekcije redom', () => {
    render(<PageRenderer slug="home" />);
    expect(screen.getByText('widget:s1')).toBeInTheDocument();
    expect(screen.getByText('widget:s3')).toBeInTheDocument();
  });

  it('razdjelnik ide prije svake sekcije osim prve i hero sekcija', () => {
    render(<PageRenderer slug="home" />);
    expect(screen.getAllByTestId('divider')).toHaveLength(2);
    expect(state.dividers).toBe(2);
  });

  it('hero sekcija nema razdjelnik ni kad nije prva', () => {
    state.page = {
      data: page({ sections: [section('s1', 'news-feed'), section('s2', 'hero')] }),
      isLoading: false,
      isError: false,
    };
    render(<PageRenderer slug="home" />);
    expect(screen.queryByTestId('divider')).toBeNull();
  });

  it('varijanta animacije zavisi od tipa widgeta', () => {
    const { unmount } = render(<PageRenderer slug="home" />);
    expect(state.wrapper.variant).toBe('surface');
    unmount();
    state.page = {
      data: page({ sections: [section('s1', 'hero'), section('s2', 'sponsors')] }),
      isLoading: false,
      isError: false,
    };
    render(<PageRenderer slug="home" />);
    expect(state.wrapper.variant).toBe('default');
  });

  it('hero sekcija dobija hero varijantu animacije', () => {
    state.page = {
      data: page({ sections: [section('s1', 'hero')] }),
      isLoading: false,
      isError: false,
    };
    const { container } = render(<PageRenderer slug="home" />);
    const wrapper = container.querySelector('[data-variant]');
    expect(wrapper).toHaveAttribute('data-variant', 'hero');
    expect(wrapper).toHaveAttribute('data-index', '0');
  });
});
