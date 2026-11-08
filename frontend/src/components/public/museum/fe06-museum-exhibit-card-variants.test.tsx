import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MuseumExhibitCard } from './MuseumExhibitCard';

vi.mock('../RichContent', () => ({
  RichContent: ({ html }: { html: string }) => <div data-testid="rich">{html}</div>,
}));
vi.mock('../../../lib/media', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/media')>('../../../lib/media');
  return { ...actual, mediaUrl: (p: string) => `media:${p}` };
});

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('MuseumExhibitCard — varijante (3 grane)', () => {
  it('sa slikom prikazuje img i koristi mediaUrl', () => {
    const { container } = wrap(
      <MuseumExhibitCard
        item={{ id: 'e1', title: 'Pehat', year: 1978, imagePath: 'muzej/pehat.jpg', category: 'jersey', description: null } as never}
      />,
    );
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain('media:muzej/pehat.jpg');
    expect(screen.getByText('Pehat')).toBeInTheDocument();
  });

  it('bez godine prikazuje crticu i nema godinu ispod', () => {
    wrap(
      <MuseumExhibitCard
        item={{ id: 'e2', title: 'Lopta', year: null, imagePath: null, category: null, description: null } as never}
      />,
    );
    expect(screen.getByText('·')).toBeInTheDocument();
    expect(screen.queryByText('1978')).toBeNull();
    // year != null branch false, so no year paragraph
    expect(screen.getByText('Lopta')).toBeInTheDocument();
  });

  it('sa opisom prikazuje RichContent', () => {
    wrap(
      <MuseumExhibitCard
        item={{ id: 'e3', title: 'Dres', year: 1990, imagePath: null, category: 'jersey', description: '<p>Opis</p>' } as never}
      />,
    );
    expect(screen.getByTestId('rich')).toHaveTextContent('<p>Opis</p>');
  });
});
