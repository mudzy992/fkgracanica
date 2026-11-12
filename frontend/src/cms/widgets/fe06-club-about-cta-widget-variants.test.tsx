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

const renderW = () =>
  render(
    <MemoryRouter>
      <ClubAboutCtaWidget config={{} as never} />
    </MemoryRouter>,
  );

describe('ClubAboutCtaWidget — varijante (2 grane)', () => {
  beforeEach(() => {
    state.club = { data: { id: 'c1', name: 'FK Gračanica' } };
    state.timeline = { data: undefined };
    state.hof = { data: undefined };
  });

  it('timeline null koristi fallback [] — bez prve godine', () => {
    state.timeline = { data: null as unknown as [] };
    state.hof = { data: null as unknown as [] };
    renderW();
    expect(screen.getByRole('heading', { name: /vodi u priču koja završava u Kući slavnih/ })).toBeInTheDocument();
  });

  it('hallOfFame null koristi 0 fallback — baštinski tekst bez ere', () => {
    state.timeline = { data: [] };
    state.hof = { data: undefined as unknown as [] };
    renderW();
    expect(screen.getByText(/otkrij baštinsko poglavlje/)).toBeInTheDocument();
  });

  it('hallOfFame sa length koristi pozitive granu', () => {
    state.timeline = { data: [] };
    state.hof = { data: [{ id: 'h1', name: 'A' }] };
    renderW();
    expect(screen.getByText(/prođi kroz njegove ere/)).toBeInTheDocument();
  });
});
