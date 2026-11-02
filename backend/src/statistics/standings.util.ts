export type FormResult = 'W' | 'D' | 'L';

export interface FormMatchEntry {
  result: FormResult;
  matchId: string;
  scheduledAt: string;
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
  opponentName: string;
  opponentSlug: string;
}

export interface StandingRow {
  clubId: string;
  clubName: string;
  clubSlug: string;
  crestPath?: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  /** Zadnjih 5 ligaških utakmica u sezoni (najstarija → najnovija). */
  form: string;
  formMatches: FormMatchEntry[];
}

type MatchInput = {
  id?: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  status: string;
  scheduledAt?: string | Date | null;
  homeClub: { name: string; slug: string; crestPath?: string | null };
  awayClub: { name: string; slug: string; crestPath?: string | null };
};

export type StandingParticipant = {
  id: string;
  name: string;
  slug: string;
  crestPath?: string | null;
};

type ClubInfo = { name: string; slug: string; crestPath?: string | null };

function resolveCrest(club: ClubInfo) {
  return club.crestPath ?? null;
}

function sortStandings(rows: StandingRow[]) {
  return rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.clubName.localeCompare(b.clubName, 'bs'),
  );
}

function matchTime(m: MatchInput) {
  if (!m.scheduledAt) return 0;
  return new Date(m.scheduledAt).getTime();
}

function resultForClub(
  m: MatchInput,
  clubId: string,
): Pick<
  FormMatchEntry,
  | 'result'
  | 'isHome'
  | 'goalsFor'
  | 'goalsAgainst'
  | 'opponentName'
  | 'opponentSlug'
> {
  const isHome = m.homeClubId === clubId;
  const goalsFor = isHome ? m.homeScore : m.awayScore;
  const goalsAgainst = isHome ? m.awayScore : m.homeScore;
  const opponent = isHome ? m.awayClub : m.homeClub;
  let result: FormResult = 'D';
  if (goalsFor > goalsAgainst) result = 'W';
  else if (goalsFor < goalsAgainst) result = 'L';
  return {
    result,
    isHome,
    goalsFor,
    goalsAgainst,
    opponentName: opponent.name,
    opponentSlug: opponent.slug,
  };
}

export function computeStandings(
  matches: MatchInput[],
  participants?: StandingParticipant[],
): StandingRow[] {
  const table = new Map<string, StandingRow>();

  const ensure = (id: string, club: ClubInfo) => {
    const crestPath = resolveCrest(club);
    if (!table.has(id)) {
      table.set(id, {
        clubId: id,
        clubName: club.name,
        clubSlug: club.slug,
        crestPath,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: '',
        formMatches: [],
      });
    } else if (crestPath && !table.get(id)!.crestPath) {
      table.get(id)!.crestPath = crestPath;
    }
    return table.get(id)!;
  };

  for (const club of participants ?? []) {
    ensure(club.id, club);
  }

  const finished = matches.filter((m) => m.status === 'FINISHED');
  for (const m of finished) {
    const home = ensure(m.homeClubId, m.homeClub);
    const away = ensure(m.awayClubId, m.awayClub);
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
      .sort(
        (a, b) =>
          matchTime(a) - matchTime(b) || (a.id ?? '').localeCompare(b.id ?? ''),
      )
      .slice(-5);

    row.formMatches = clubMatches.map((m, i) => ({
      matchId: m.id ?? `${row.clubId}-form-${i}`,
      scheduledAt: m.scheduledAt ? new Date(m.scheduledAt).toISOString() : '',
      ...resultForClub(m, row.clubId),
    }));
    row.form = row.formMatches.map((e) => e.result).join('');
  }

  return sortStandings([...table.values()]);
}
