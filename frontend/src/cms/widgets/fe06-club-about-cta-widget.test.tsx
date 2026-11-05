import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubAboutCtaWidget } from './ClubAboutCtaWidget';

const state = vi.hoisted(() => ({
  club: { data: undefined as unknown },
  timeline: { data: undefined as unknown },
  hof: { data: undefined as unknown },
}));

vi.mock('../../hooks', () => ({
  useOwnClub: () => state.club,
  useClubTimeline: () => state.timeline,
  useHallOfFame: () => state.hof,
}));

const renderWidget = () =>
  render(
    <MemoryRouter>
      <ClubAboutCtaWidget config={{} as never} />
    </MemoryRouter>,
  );

const chapter = (over: Record<string, unknown> = {}) => ({
  id: 't1',
  year: 1955,
  title: 'Prvo prvenstvo',
  sortOrder: 0,
  imagePath: null,
  ...over,
});

beforeEach(() => {
  state.club = { data: { id: 'c1', name: 'FK Gračanica' } };
  state.timeline = { data: [] };
  state.hof = { data: [] };
});

describe('ClubAboutCtaWidget — naslov i tekst', () => {
  it('bez podataka koristi naziv kluba i opći tekst', () => {
    renderWidget();
    expect(
      screen.getByRole('heading', {
        name: 'FK Gračanica vodi u priču koja završava u Kući slavnih.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Uđi u dokumentarnu priču kluba i otkrij/)).toBeInTheDocument();
    expect(screen.getByText('Dokumentar kluba')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Pregledaj O klubu/ })).toHaveAttribute('href', '/o-klubu');
  });

  it('koristi prvu godinu iz hronologije i tekst sa Kućom slavnih', () => {
    state.timeline = { data: [chapter({ year: 1968 }), chapter({ id: 't2', year: 1945 })] };
    state.hof = { data: [{ id: 'h1', name: 'Asim' }] };
    renderWidget();
    expect(
      screen.getByRole('heading', { name: /FK Gračanica od 1945\. vodi u priču/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/prođi kroz njegove ere/)).toBeInTheDocument();
  });

  it('bez kluba koristi podrazumijevani naziv', () => {
    state.club = { data: undefined };
    renderWidget();
    expect(screen.getByRole('heading', { name: /FK Gračanica vodi u priču/ })).toBeInTheDocument();
  });

  it('bez hronologije i uz Kuću slavnih i dalje koristi opći naslov', () => {
    state.hof = { data: [{ id: 'h1', name: 'Asim' }] };
    renderWidget();
    expect(screen.getByRole('heading', { name: /vodi u priču koja završava u Kući slavnih/ })).toBeInTheDocument();
  });
});

describe('ClubAboutCtaWidget — slike', () => {
  it('bez slika prikazuje gradijentne oznake', () => {
    renderWidget();
    expect(screen.getByText('O klubu')).toBeInTheDocument();
    expect(screen.getByText('Baština')).toBeInTheDocument();
  });

  it('koristi prvu sliku iz hronologije', () => {
    state.timeline = {
      data: [chapter({ imagePath: null }), chapter({ id: 't2', year: 1960, imagePath: 'mediji/stara.jpg' })],
    };
    const { container } = renderWidget();
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toContain('/uploads/files/mediji/stara.jpg');
  });

  it('koristi fotografiju iz Kuće slavnih kad postoji', () => {
    state.hof = {
      data: [
        { id: 'h1', name: 'Bez slike', photoPath: null, imagePath: null },
        { id: 'h2', name: 'Sa slikom', photoPath: 'mediji/legenda.jpg' },
      ],
    };
    const { container } = renderWidget();
    const srcs = [...container.querySelectorAll('img')].map((img) => img.getAttribute('src'));
    expect(srcs.some((src) => src?.includes('mediji/legenda.jpg'))).toBe(true);
    expect(screen.queryByText('Baština')).toBeNull();
  });

  it('koristi imagePath kad nema photoPath', () => {
    state.hof = { data: [{ id: 'h1', name: 'Legenda', imagePath: 'mediji/arhiva.jpg' }] };
    const { container } = renderWidget();
    const srcs = [...container.querySelectorAll('img')].map((img) => img.getAttribute('src'));
    expect(srcs.some((src) => src?.includes('mediji/arhiva.jpg'))).toBe(true);
  });
});
