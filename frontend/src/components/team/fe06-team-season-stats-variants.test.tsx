import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { ClubSeasonStats } from '../../types/club-hub';
import { TeamSeasonStats } from './TeamSeasonStats';

/**
 * Batch 34 — varijante podataka za tabelu sezone: igrač sa djelimičnim
 * statistikama, izjednačeni golovi/asistencije/nastupi i sezona bez plasmana.
 */
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../components/public/players/PlayerLink', () => ({
  PlayerLink: ({ name }: { name: string }) => <span>{name}</span>,
}));
vi.mock('../../components/news/NewsSectionTitle', () => ({
  NewsSectionTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));
vi.mock('./TeamFormCard', () => ({
  TeamFormCard: ({ standing }: { standing: { form: string } }) => <div>forma:{standing.form}</div>,
}));
vi.mock('../../lib/utils', () => ({ cn: (...v: Array<string | undefined>) => v.filter(Boolean).join(' ') }));

const totals = {
  goals: 22,
  assists: 15,
  appearances: 132,
  yellowCards: 18,
  redCards: 1,
  minutes: 11880,
};

const season = { id: 's1', name: '2025/2026' };

const base = (over: Partial<ClubSeasonStats> = {}): ClubSeasonStats =>
  ({
    season,
    standing: null,
    totals,
    players: [],
    ...over,
  }) as ClubSeasonStats;

const renderStats = (stats: ClubSeasonStats) =>
  render(
    <MemoryRouter>
      <TeamSeasonStats stats={stats} />
    </MemoryRouter>,
  );

describe('TeamSeasonStats — bez plasmana', () => {
  it('prikazuje samo KPI sezone i zbir, bez bodova i forme', () => {
    renderStats(base());
    expect(screen.getByText('2025/2026')).toBeInTheDocument();
    expect(screen.queryByText('Bodovi')).toBeNull();
    expect(screen.queryByText('Gol razlika')).toBeNull();
    expect(screen.queryByText(/^forma:/)).toBeNull();
    expect(screen.getByText('Golovi')).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();
  });
});

describe('TeamSeasonStats — djelimične statistike igrača', () => {
  const sparse: ClubSeasonStats = base({
    players: [
      {
        id: 'p1',
        firstName: 'Amar',
        lastName: 'Hodžić',
        number: 9,
        // `stats` postoji, ali bez opcionalnih polja — svi `?? 0` fallbackovi.
        stats: { goals: undefined, assists: undefined, appearances: undefined },
      },
    ] as never,
  });

  it('prikazuje nule za polja koja nedostaju', () => {
    renderStats(sparse);
    const row = screen.getAllByRole('row')[1] as HTMLElement;
    // Utakm., Golovi, Asist., Ž/K — sve nule
    expect(row.textContent).toContain('0');
    expect(row.textContent).toContain('0/0');
    expect(screen.getByText('Amar Hodžić')).toBeInTheDocument();
  });

  it('prvi igrač bez golova nema istaknut red', () => {
    renderStats(sparse);
    const row = screen.getAllByRole('row')[1] as HTMLElement;
    expect(row.className).not.toContain('bg-primary/5');
  });
});

describe('TeamSeasonStats — sortiranje', () => {
  const player = (id: string, goals: number | undefined, assists: number | undefined, apps: number | undefined) => ({
    id,
    firstName: id,
    lastName: 'Igrač',
    number: 1,
    stats: { goals, assists, appearances: apps },
  });

  it('prvo po golovima, pa asistencijama, pa nastupima', () => {
    renderStats(
      base({
        players: [
          player('manjeGolova', 1, 99, 99),
          player('viseAsistencija', 5, 7, 10),
          player('manjeAsistencija', 5, 2, 10),
          player('viseNastupa', 5, 2, 20),
        ] as never,
      }),
    );
    const text = screen.getAllByRole('row').slice(1).map((r) => r.textContent ?? '');
    expect(text[0]).toContain('viseAsistencija');
    expect(text[1]).toContain('viseNastupa');
    expect(text[2]).toContain('manjeAsistencija');
    expect(text[3]).toContain('manjeGolova');
  });

  it('potpuno izjednačeni igrači zadržavaju stabilan redoslijed', () => {
    renderStats(
      base({
        players: [player('prvi', 3, 1, 5), player('drugi', 3, 1, 5)] as never,
      }),
    );
    const text = screen.getAllByRole('row').slice(1).map((r) => r.textContent ?? '');
    expect(text[0]).toContain('prvi');
    expect(text[1]).toContain('drugi');
  });

  it('prvi igrač sa golovima dobija istaknut red', () => {
    renderStats(base({ players: [player('zvijezda', 3, 1, 5)] as never }));
    const row = screen.getAllByRole('row')[1] as HTMLElement;
    expect(row.className).toContain('bg-primary/5');
  });
});

describe('TeamSeasonStats — bez sezone', () => {
  it('prikazuje poruku i za `undefined` i za sezonu bez imena', () => {
    const { unmount } = renderStats(base());
    expect(screen.getByText('Statistike sezone')).toBeInTheDocument();
    unmount();
    render(
      <MemoryRouter>
        <TeamSeasonStats stats={undefined} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Statistike za aktivnu sezonu nisu dostupne.')).toBeInTheDocument();
  });
});

describe('TeamSeasonStats — miješane statistike u poređenju', () => {
  const mixed = (id: string, goals?: number, assists?: number, apps?: number) => ({
    id,
    firstName: id,
    lastName: 'Igrač',
    number: 1,
    stats: { goals, assists, appearances: apps },
  });

  it('poređenje podnosi kombinaciju nedostajućih i nultih vrijednosti', () => {
    renderStats(
      base({
        players: [
          mixed('prazan'),
          mixed('nule', 0, 0, 0),
          mixed('pun', 2, 1, 5),
        ] as never,
      }),
    );
    const text = screen.getAllByRole('row').slice(1).map((r) => r.textContent ?? '');
    expect(text).toHaveLength(3);
    expect(text[0]).toContain('pun');
    // preostala dva imaju iste (nulte) vrijednosti — stabilan redoslijed
    expect(text[1]).toContain('prazan');
    expect(text[2]).toContain('nule');
  });

  it('sve nedostajuće vrijednosti ne ruše sortiranje', () => {
    renderStats(
      base({ players: [mixed('a'), mixed('b'), mixed('c')] as never }),
    );
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });
});

