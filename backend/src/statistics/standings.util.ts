export interface StandingRow {
  clubId: string;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string;
}

export function computeStandings(
  matches: {
    homeClubId: string;
    awayClubId: string;
    homeScore: number;
    awayScore: number;
    status: string;
    homeClub: { name: string };
    awayClub: { name: string };
  }[],
): StandingRow[] {
  const table = new Map<string, StandingRow>();

  const ensure = (id: string, name: string) => {
    if (!table.has(id)) {
      table.set(id, {
        clubId: id,
        clubName: name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: '',
      });
    }
    return table.get(id)!;
  };

  const finished = matches.filter((m) => m.status === 'FINISHED');
  for (const m of finished) {
    const home = ensure(m.homeClubId, m.homeClub.name);
    const away = ensure(m.awayClubId, m.awayClub.name);
    home.played++;
    away.played++;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;
    if (m.homeScore > m.awayScore) {
      home.won++;
      away.lost++;
      home.points += 3;
    } else if (m.homeScore < m.awayScore) {
      away.won++;
      home.lost++;
      away.points += 3;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }

  for (const row of table.values()) {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
    const clubMatches = finished
      .filter((m) => m.homeClubId === row.clubId || m.awayClubId === row.clubId)
      .slice(-5);
    row.form = clubMatches
      .map((m) => {
        const isHome = m.homeClubId === row.clubId;
        const gf = isHome ? m.homeScore : m.awayScore;
        const ga = isHome ? m.awayScore : m.homeScore;
        if (gf > ga) return 'W';
        if (gf < ga) return 'L';
        return 'D';
      })
      .join('');
  }

  return [...table.values()].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
}
