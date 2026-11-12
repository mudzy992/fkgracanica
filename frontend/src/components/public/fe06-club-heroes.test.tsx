import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ClubCinematicHero } from './clubs/ClubCinematicHero';
import { ClubProfileHero } from './clubs/ClubProfileHero';
import { ClubInfoSection } from './clubs/ClubInfoSection';
import { ContactInfoAside } from './contact/ContactInfoAside';
import { ContactCinematicHero } from './contact/ContactCinematicHero';
import { MuseumFilters } from './museum/MuseumFilters';

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const club = {
  id: 'c1',
  name: 'FK Gračanica',
  slug: 'fk-gracanica',
  crestPath: 'clubs/crest.png',
  city: 'Gračanica',
  stadium: 'Gradski stadion',
  isOwnClub: true,
  description: 'Klub iz Gračanice',
};
const slot = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  clubId: 'c1',
  slotIndex: 0,
  isBench: false,
  lineRole: 'DEF',
  positionX: 30,
  positionY: 40,
  playerId: null,
  player: null,
  ...over,
});

describe('ClubCinematicHero', () => {
  it('prikazuje naziv, opis i oznaku našeg kluba', () => {
    wrap(<ClubCinematicHero club={club as never} />);
    expect(screen.getByRole('heading', { name: 'FK Gračanica' })).toBeInTheDocument();
    expect(screen.getByText('Naš klub')).toBeInTheDocument();
    expect(screen.getByText('Klub iz Gračanice')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Stranica prvog tima/ }).getAttribute('href')).toBe('/tim');
  });

  it('tuđi klub nema oznaku ni link na tim', () => {
    wrap(<ClubCinematicHero club={{ ...club, isOwnClub: false } as never} />);
    expect(screen.queryByText('Naš klub')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('koristi stadion iz zasebnog objekta i prikazuje KPI', () => {
    wrap(
      <ClubCinematicHero
        club={{ ...club, isOwnClub: false } as never}
        stadium={{ name: 'Stadion Luke', city: 'Gračanica' } as never}
        squad={{
          formation: { def: 4, mid: 4, fwd: 2 },
          slots: [slot({ playerId: 'p1' })],
        } as never}
        stats={{ season: { id: 's1', name: '2025/26' }, standing: { points: 30 } } as never}
      />,
    );
    expect(screen.getByText('Gračanica · Stadion Luke')).toBeInTheDocument();
    expect(screen.getByText('4-4-2')).toBeInTheDocument();
    expect(screen.getByText('2025/26')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });
});

describe('ClubProfileHero', () => {
  it('dok se učitava prikazuje skeletone', () => {
    const { container } = wrap(<ClubProfileHero isLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBe(3);
  });

  it('prikazuje grb, naslov i metu', () => {
    const { container } = wrap(<ClubProfileHero club={club as never} eyebrow="Klub" />);
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
    expect(screen.getByText('Klub')).toBeInTheDocument();
    expect(screen.getByText('Gračanica · Gradski stadion')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('bez kluba koristi zadati naslov i nema grba', () => {
    const { container } = wrap(<ClubProfileHero title="Rezervni naslov" subtitle="Opis" />);
    expect(screen.getByText('Rezervni naslov')).toBeInTheDocument();
    expect(screen.getByText('Opis')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });
});

describe('ClubInfoSection', () => {
  it('prikazuje sva dostupna polja stadiona', () => {
    wrap(
      <ClubInfoSection
        stadium={{
          name: 'Gradski stadion',
          city: 'Gračanica',
          address: 'Ulica 1',
          capacity: 5000,
          description: 'Dom kluba',
        } as never}
      />,
    );
    expect(screen.getByText('Stadion')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
    expect(screen.getByText('Ulica 1')).toBeInTheDocument();
    expect(screen.getByText('Dom kluba')).toBeInTheDocument();
  });

  it('bez opcionalnih polja prikazuje samo naziv', () => {
    wrap(<ClubInfoSection stadium={{ name: 'Pomoćni teren' } as never} />);
    expect(screen.getByText('Pomoćni teren')).toBeInTheDocument();
    expect(screen.queryByText('Grad')).toBeNull();
    expect(screen.queryByText('Kapacitet')).toBeNull();
  });
});

describe('ContactInfoAside', () => {
  it('bez podataka prikazuje poruku', () => {
    wrap(<ContactInfoAside />);
    expect(screen.getByText('Informacije')).toBeInTheDocument();
    expect(screen.getByText(/Kontakt podaci nisu objavljeni/)).toBeInTheDocument();
  });

  it('prikazuje mailto, tel i adresu', () => {
    wrap(<ContactInfoAside email="info@fk.ba" phone="+387 61 000 111" address="Gračanica" />);
    const links = screen.getAllByRole('link');
    expect(links[0].getAttribute('href')).toBe('mailto:info@fk.ba');
    expect(links[1].getAttribute('href')).toBe('tel:+38761000111');
    expect(screen.getByText('Gračanica')).toBeInTheDocument();
  });

  it('samo adresa nema linkova', () => {
    wrap(<ContactInfoAside address="Gračanica" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Adresa')).toBeInTheDocument();
  });
});

describe('ContactCinematicHero', () => {
  it('bez podataka nema KPI pločica uz naslov', () => {
    const { container } = wrap(<ContactCinematicHero />);
    expect(container.querySelector('.grid.gap-3')).toBeNull();
    expect(screen.getByText('contactPage.title')).toBeInTheDocument();
  });

  it('prikazuje pločice za dostupne kontakt podatke', () => {
    wrap(<ContactCinematicHero hasEmail hasAddress />);
    expect(screen.getByText('contactPage.email')).toBeInTheDocument();
    expect(screen.getByText('contactPage.address')).toBeInTheDocument();
    expect(screen.queryByText('contactPage.phone')).toBeNull();
  });

  it('sva tri podatka daju tri pločice', () => {
    const { container } = wrap(<ContactCinematicHero hasEmail hasPhone hasAddress />);
    expect(container.querySelector('.grid-cols-3')).not.toBeNull();
    expect(screen.getByText('contactPage.phone')).toBeInTheDocument();
  });
});

describe('MuseumFilterBar', () => {
  it('prikazuje godine i klikove', () => {
    const years: (number | undefined)[] = [];
    wrap(
      <MuseumFilters
        years={[2020, 2021]}
        categories={[]}
        categoryLabel={(c) => c}
        onYear={(y) => years.push(y)}
        onCategory={() => undefined}
      />,
    );
    screen.getByRole('button', { name: 'Sve godine' }).click();
    screen.getByRole('button', { name: '2021' }).click();
    expect(years).toEqual([undefined, 2021]);
    expect(screen.queryByText('Sve kategorije')).toBeNull();
  });

  it('prikazuje kategorije sa labelom', () => {
    const picked: (string | undefined)[] = [];
    wrap(
      <MuseumFilters
        years={[]}
        categories={['foto', 'dres']}
        year={2020}
        category="foto"
        categoryLabel={(c) => (c === 'foto' ? 'Fotografije' : 'Dresovi')}
        onYear={() => undefined}
        onCategory={(c) => picked.push(c)}
      />,
    );
    expect(screen.getByText('Fotografije')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Sve kategorije' }).click();
    screen.getByRole('button', { name: 'Dresovi' }).click();
    expect(picked).toEqual([undefined, 'dres']);
  });
});
