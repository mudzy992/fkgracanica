import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { MuseumCinematicHero } from './museum/MuseumCinematicHero';
import { MuseumExhibitCard } from './museum/MuseumExhibitCard';
import { HofLegendDialog } from './hall-of-fame/HofLegendDialog';
import { HallOfFameCinematicHero } from './hall-of-fame/HallOfFameCinematicHero';

vi.mock('./RichContent', () => ({
  RichContent: ({ html }: { html: string }) => <div data-testid="rich">{html}</div>,
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

beforeAll(() => installDialogPolyfill());

describe('MuseumCinematicHero', () => {
  it('prikazuje brojeve eksponata i godina', () => {
    wrap(<MuseumCinematicHero totalCount={30} yearCount={12} categoryCount={3} />);
    expect(screen.getByRole('heading', { name: 'Muzej' })).toBeInTheDocument();
    expect(screen.getByText('Predmeta')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Kategorije')).toBeInTheDocument();
  });
});

describe('MuseumExhibitCard', () => {
  it('prikazuje naslov i godinu bez slike', () => {
    wrap(
      <MuseumExhibitCard
        item={{ id: 'e1', title: 'Dres iz 1985', year: 1985, imagePath: null, category: 'jersey' } as never}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Dres iz 1985' })).toBeInTheDocument();
    expect(screen.getByText('Dres')).toBeInTheDocument();
    expect(screen.getAllByText('1985').length).toBeGreaterThan(0);
  });
});

describe('HallOfFameCinematicHero', () => {
  it('prikazuje ukupan broj legendi', () => {
    wrap(<HallOfFameCinematicHero totalCount={7} yearCount={1990} />);
    expect(screen.getByText('Legendi')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('1990')).toBeInTheDocument();
  });
});

describe('HofLegendDialog', () => {
  const entry = {
    id: 'l1',
    name: 'Asim Hodžić',
    role: 'Kapiten',
    years: '1980–1990',
    photoPath: null,
    imagePath: null,
    description: '<p>Legenda</p>',
  };

  it('bez legende ne renderira ništa', () => {
    const { container } = wrap(<HofLegendDialog entry={null} open onClose={() => undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('zatvoren dijalog ne prikazuje ime', () => {
    wrap(<HofLegendDialog entry={entry as never} open={false} onClose={() => undefined} />);
    expect(screen.queryByText('Asim Hodžić')).toBeNull();
  });

  it('otvoren prikazuje podatke legende i početno slovo bez slike', () => {
    wrap(<HofLegendDialog entry={entry as never} open onClose={() => undefined} />);
    expect(screen.getByText('Legenda kluba')).toBeInTheDocument();
    expect(screen.getByText('Kapiten')).toBeInTheDocument();
    expect(screen.getByText('1980–1990')).toBeInTheDocument();
    expect(screen.getAllByText('A').length).toBeGreaterThan(0);
  });

  it('sa fotografijom prikazuje sliku u portalu', () => {
    wrap(
      <HofLegendDialog
        entry={{ ...entry, photoPath: 'hof/1.jpg' } as never}
        open
        onClose={() => undefined}
      />,
    );
    expect(document.body.querySelector('img')).not.toBeNull();
  });
});
