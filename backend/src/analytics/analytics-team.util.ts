import type { MatchStatus } from '@prisma/client';

export type MatchSide = {
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  scheduledAt: Date;
};

export function teamResult(match: MatchSide, clubId: string): 'W' | 'D' | 'L' | null {
  if (match.status !== 'FINISHED') return null;
  const home = match.homeClubId === clubId;
  const away = match.awayClubId === clubId;
  if (!home && !away) return null;
  const ours = home ? match.homeScore : match.awayScore;
  const theirs = home ? match.awayScore : match.homeScore;
  if (ours > theirs) return 'W';
  if (ours < theirs) return 'L';
  return 'D';
}

export function aggregateClubMatches(matches: MatchSide[], clubId: string) {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  const form: ('W' | 'D' | 'L')[] = [];
  const finished = [...matches]
    .filter((m) => m.status === 'FINISHED')
    .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
  for (const match of finished) {
    const result = teamResult(match, clubId);
    if (!result) continue;
    const home = match.homeClubId === clubId;
    goalsFor += home ? match.homeScore : match.awayScore;
    goalsAgainst += home ? match.awayScore : match.homeScore;
    if (result === 'W') wins += 1;
    else if (result === 'D') draws += 1;
    else losses += 1;
    if (form.length < 5) form.push(result);
  }
  const played = wins + draws + losses;
  return {
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    winPercent: played ? Math.round((wins / played) * 100) : 0,
    form,
  };
}
