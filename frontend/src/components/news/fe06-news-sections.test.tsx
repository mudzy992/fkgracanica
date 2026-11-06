import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsCategoryFilter } from './NewsCategoryFilter';
import { NewsRelatedMatches, NewsRelatedPlayers } from './NewsDetailSections';
import { NewsGalleryPhotos } from './NewsGalleryPhotos';

const state = vi.hoisted(() => ({
  gallery: { photos: [] as unknown[] } as { photos: unknown[] } | undefined,
  isLoading: false,
}));

vi.mock('../../hooks/use-content-admin', () => ({
  useGalleryDetail: () => ({ data: state.gallery, isLoading: state.isLoading }),
}));
vi.mock('./NewsPhotoGallery', () => ({
  NewsPhotoGallery: ({ photos }: { photos: unknown[] }) => (
    <ul data-testid="photo-gallery">{photos.length} fotografija</ul>
  ),
}));
vi.mock('../public/PremiumPhotoBento', () => ({ PremiumPhotoBento: () => null }));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

beforeEach(() => {
  state.gallery = { photos: [] };
  state.isLoading = false;
});

describe('NewsCategoryFilter', () => {
  it('bez kategorija ne renderira ništa', () => {
    const { container } = render(
      <NewsCategoryFilter categories={[]} onChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('prikazuje Sve i sve kategorije', () => {
    render(
      <NewsCategoryFilter
        categories={[
          { id: 'c1', name: 'Vijesti' },
          { id: 'c2', name: 'Utakmice' },
        ]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Sve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vijesti' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Utakmice' })).toBeInTheDocument();
  });

  it('klik na Sve vraća undefined, klik na kategoriju vraća id', async () => {
    const onChange = vi.fn();
    render(
      <NewsCategoryFilter
        categories={[{ id: 'c1', name: 'Vijesti' }]}
        activeId="c1"
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Sve' }));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
    await userEvent.click(screen.getByRole('button', { name: 'Vijesti' }));
    expect(onChange).toHaveBeenLastCalledWith('c1');
  });

  it('aktivna kategorija ima istaknutu klasu', () => {
    render(
      <NewsCategoryFilter
        categories={[{ id: 'c1', name: 'Vijesti' }]}
        activeId="c1"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Vijesti' }).className).toContain('bg-primary/20');
    expect(screen.getByRole('button', { name: 'Sve' }).className).not.toContain('bg-primary/20');
  });
});

describe('NewsRelatedMatches', () => {
  const match = (over: Record<string, unknown> = {}) => ({
    id: 'm1',
    homeScore: 2,
    awayScore: 1,
    homeClub: { name: 'FK Gračanica' },
    awayClub: { name: 'FK Slavija' },
    ...over,
  });

  it('bez utakmica ne renderira ništa', () => {
    const { container } = wrap(<NewsRelatedMatches />);
    expect(container).toBeEmptyDOMElement();
  });

  it('preskače stavke bez utakmice', () => {
    const { container } = wrap(
      <NewsRelatedMatches matches={[{}, { match: match() as never }]} />,
    );
    expect(container.querySelectorAll('a')).toHaveLength(1);
  });

  it('prikazuje rezultat i link na utakmicu', () => {
    wrap(<NewsRelatedMatches matches={[{ match: match() as never }]} />);
    expect(screen.getByText('Povezane utakmice')).toBeInTheDocument();
    expect(screen.getByText('2:1')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/utakmice/m1');
  });
});

describe('NewsRelatedPlayers', () => {
  const player = {
    id: 'p1',
    firstName: 'Amar',
    lastName: 'Hodžić',
    number: 9,
    position: 'FORWARD',
    photoPath: null,
  };

  it('bez igrača ne renderira ništa', () => {
    const { container } = wrap(<NewsRelatedPlayers />);
    expect(container).toBeEmptyDOMElement();
  });

  it('preskače prazne stavke i prikazuje igrače', () => {
    wrap(<NewsRelatedPlayers players={[{}, { player: player as never }]} />);
    expect(screen.getByText('Povezani igrači')).toBeInTheDocument();
    expect(screen.getByText('Amar Hodžić')).toBeInTheDocument();
  });
});

describe('NewsGalleryPhotos', () => {
  it('bez galerije i galleryId ne renderira ništa', () => {
    const { container } = wrap(<NewsGalleryPhotos />);
    expect(container).toBeEmptyDOMElement();
  });

  it('koristi ugrađene fotografije bez dohvata', () => {
    wrap(
      <NewsGalleryPhotos
        gallery={{ id: 'g1', photos: [{ id: 'p1', path: 'a.jpg' }] } as never}
      />,
    );
    expect(screen.getByText('Galerija')).toBeInTheDocument();
    expect(screen.getByTestId('photo-gallery')).toHaveTextContent('1 fotografija');
  });

  it('sa galleryId i bez ugrađenih prikazuje učitavanje', () => {
    state.isLoading = true;
    wrap(<NewsGalleryPhotos galleryId="g2" />);
    expect(screen.getByText('Učitavanje fotografija…')).toBeInTheDocument();
  });

  it('dohvaćene fotografije se prikazuju', () => {
    state.gallery = { photos: [{ id: 'p1' }, { id: 'p2' }] };
    wrap(<NewsGalleryPhotos galleryId="g2" />);
    expect(screen.getByTestId('photo-gallery')).toHaveTextContent('2 fotografija');
  });

  it('prazna galerija se ne prikazuje', () => {
    const { container } = wrap(<NewsGalleryPhotos gallery={{ id: 'g1', photos: [] } as never} galleryId="g1" />);
    expect(container).toBeEmptyDOMElement();
  });
});
