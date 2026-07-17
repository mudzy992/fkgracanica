export const homeBs = {
  lastResult: 'Zadnji rezultat',
  homeLastMatch: 'Posljednja utakmica',
  seeAllNews: 'Sve vijesti',
  homeSeeAll: 'Sve',
  matchDetails: 'Detalji utakmice',
  homeGuestWelcome: 'Dobrodošli u {{club}}',
  liveNow: 'UŽIVO',
  homeFounded: 'Osnovan {{year}}',
  homeTagline: 'Klub, grad i navijači u jednom ritmu.',
  featuredPlayers: 'Naši igrači',
  leagueTable: 'Tabela',
  joinClub: 'Budi dio kluba',
  joinClubDesc: 'Postani član i podrži klub iz prve linije.',
  club: 'Klub',
  points: 'Bod',
} as const;

export const homeEn: Record<keyof typeof homeBs, string> = {
  lastResult: 'Last result',
  homeLastMatch: 'Last match',
  seeAllNews: 'All news',
  homeSeeAll: 'See all',
  matchDetails: 'Match details',
  homeGuestWelcome: 'Welcome to {{club}}',
  liveNow: 'LIVE',
  homeFounded: 'Founded {{year}}',
  homeTagline: 'Club, city and supporters in one rhythm.',
  featuredPlayers: 'Our players',
  leagueTable: 'League table',
  joinClub: 'Join the club',
  joinClubDesc: 'Become a member and support the club up close.',
  club: 'Club',
  points: 'Pts',
};
