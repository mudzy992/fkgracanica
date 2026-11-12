import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { GalleryAlbumHero } from '../gallery/GalleryAlbumHero';
import { NewsArticleHero } from '../news/NewsArticleHero';
import { NewsPhotoGallery } from '../news/NewsPhotoGallery';

vi.mock('../../lib/media', () => ({ mediaUrl: (p: string, size: string) => `/media/${size}/${p}` }));
vi.mock('../public/PremiumPhotoBento', () => ({
  PremiumPhotoBento: ({ photos }: { photos: Array<{ id: string }> }) => (
    <div data-testid="bento">{photos.length} fotografija</div>
  ),
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('GalleryAlbumHero', () => {
  it('prikazuje naslov, album oznaku i broj fotografija', () => {
    wrap(<GalleryAlbumHero title="Kup 2024" photoCount={3} />);
    expect(screen.getByRole('heading', { name: 'Kup 2024' })).toBeInTheDocument();
    expect(screen.getByText('Album')).toBeInTheDocument();
    expect(document.body.textContent).toContain('3 fotografije');
    expect(screen.getByRole('link', { name: /Galerija/ }).getAttribute('href')).toBe('/galerija');
  });

  it('bez slike prikazuje gradijent i ne prikazuje broj kad je nula', () => {
    const { container } = wrap(<GalleryAlbumHero title="Prazno" photoCount={0} />);
    expect(container.querySelector('img')).toBeNull();
    expect(document.body.textContent).not.toContain('fotografija');
  });

  it('koristi ispravan oblik riječi za jednu i više fotografija', () => {
    const { unmount } = wrap(<GalleryAlbumHero title="A" photoCount={1} />);
    expect(document.body.textContent).toContain('1 fotografija');
    unmount();
    wrap(<GalleryAlbumHero title="B" photoCount={7} />);
    expect(document.body.textContent).toContain('7 fotografija');
  });

  it('slika koristi originalnu veličinu', () => {
    const { container } = wrap(<GalleryAlbumHero title="C" coverPath="albumi/a.jpg" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/media/original/albumi/a.jpg');
  });
});

describe('NewsArticleHero', () => {
  it('prikazuje kategoriju, naslov i datum', () => {
    wrap(
      <NewsArticleHero
        title="Nova pobjeda"
        categoryName="Utakmice"
        publishedAt="2026-05-02T10:00:00.000Z"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Nova pobjeda' })).toBeInTheDocument();
    expect(screen.getByText('Utakmice')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Vijesti/ }).getAttribute('href')).toBe('/vijesti');
    expect(document.body.textContent).toMatch(/2026/);
  });

  it('bez kategorije i datuma prikazuje samo naslov', () => {
    wrap(<NewsArticleHero title="Samo naslov" />);
    expect(screen.getByRole('heading', { name: 'Samo naslov' })).toBeInTheDocument();
    expect(document.querySelectorAll('header p')).toHaveLength(0);
  });

  it('sa slikom koristi mediaUrl', () => {
    const { container } = wrap(<NewsArticleHero title="X" coverPath="vijesti/x.jpg" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/media/original/vijesti/x.jpg');
  });
});

describe('NewsPhotoGallery', () => {
  it('prosljeđuje fotografije bento mreži', () => {
    render(<NewsPhotoGallery photos={[{ id: 'p1' }, { id: 'p2' }] as never} />);
    expect(screen.getByTestId('bento')).toHaveTextContent('2 fotografija');
  });
});
