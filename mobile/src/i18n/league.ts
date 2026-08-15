export const leagueBs = {
  leagueKicker: 'Prvenstvo',
  leagueTitle: 'Liga',
  leagueFallbackSub: 'Tabela, rezultati i statistike sezone.',
  leagueTeams: 'Timova',
  leagueRounds: 'Kola',
  leagueLeader: 'Lider',
  leagueNextMatch: 'Sljedeća utakmica',
  leagueRecentMatches: 'Nedavni rezultati',
  leagueTopScorers: 'Najbolji strijelci',
  leagueTopAssists: 'Asistencije',
  leagueBackHome: 'Početna',
} as const;

export const leagueEn: Record<keyof typeof leagueBs, string> = {
  leagueKicker: 'Championship',
  leagueTitle: 'League',
  leagueFallbackSub: 'Standings, results and season stats.',
  leagueTeams: 'Teams',
  leagueRounds: 'Rounds',
  leagueLeader: 'Leader',
  leagueNextMatch: 'Next match',
  leagueRecentMatches: 'Recent results',
  leagueTopScorers: 'Top scorers',
  leagueTopAssists: 'Assists',
  leagueBackHome: 'Home',
};
