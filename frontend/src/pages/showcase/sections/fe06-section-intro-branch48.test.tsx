import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionIntro } from './SectionIntro';

describe('SectionIntro — branch48 (2 grane chapter i body)', () => {
  it('sa chapter i body prikazuje oba (pokriva true grane)', () => {
    render(<SectionIntro kicker="Platforma" title="Naslov" body="Opis sekcije" chapter={3} />);
    expect(screen.getByText('Platforma')).toBeInTheDocument();
    expect(screen.getByText('Naslov')).toBeInTheDocument();
    expect(screen.getByText('Opis sekcije')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('bez chapter i bez body pokriva false grane [87,0]', () => {
    const { container } = render(<SectionIntro kicker="Put" title="Drugi" />);
    expect(screen.getByText('Put')).toBeInTheDocument();
    expect(screen.getByText('Drugi')).toBeInTheDocument();
    // chapter nije prikazan, body nije prikazan — provjeri odsustvo teksta koji sadrži chapter
    expect(screen.queryByText('03')).toBeNull();
    expect(screen.queryByText('01')).toBeNull();
    expect(container.querySelector('p.mt-4')).toBeNull();
  });

  it('sa chapter 0 i praznim body', () => {
    const { container } = render(<SectionIntro kicker="K" title="T" chapter={0} body="" />);
    // chapter 0 je != null, pa se prikazuje "00"
    expect(screen.getByText('00')).toBeInTheDocument();
    // prazan body je falsy, ne prikazuje se
    expect(container.querySelector('p.mt-4')).toBeNull();
  });

  it('samo body bez chapter', () => {
    render(<SectionIntro kicker="K2" title="T2" body="Samo body" />);
    expect(screen.getByText('Samo body')).toBeInTheDocument();
    expect(screen.queryByText('00')).toBeNull();
    expect(screen.queryByText('01')).toBeNull();
  });
});
