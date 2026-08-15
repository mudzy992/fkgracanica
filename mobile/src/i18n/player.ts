export const playerBs = {
  playerAbout: 'O igraču',
  playerSeason: 'Sezona {{name}}',
  playerCareer: 'Karijera (ukupno)',
  playerAppearances: 'Nastupi',
  playerGoals: 'Golovi',
  playerAssists: 'Asist.',
  playerMinutes: 'Minute',
  playerYellow: 'Žuti',
  playerRed: 'Crveni',
  playerBackTeam: 'Tim',
  playerNotFound: 'Igrač nije pronađen.',
} as const;

export const playerEn: Record<keyof typeof playerBs, string> = {
  playerAbout: 'About the player',
  playerSeason: 'Season {{name}}',
  playerCareer: 'Career (total)',
  playerAppearances: 'Apps',
  playerGoals: 'Goals',
  playerAssists: 'Assists',
  playerMinutes: 'Minutes',
  playerYellow: 'Yellow',
  playerRed: 'Red',
  playerBackTeam: 'Team',
  playerNotFound: 'Player not found.',
};
