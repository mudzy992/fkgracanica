import type { Page } from '@playwright/test';

type Scenario = 'default' | 'empty' | 'saved' | 'away' | 'four-four-two' | 'overflow' | 'uninitialized' | 'conflict' | 'save-conflict' | 'finished-conflict' | 'patch-conflict' | 'restore-club';
type Slot = { playerId: string; clubId: string; positionX?: number; positionY?: number; isStarter: boolean };
const wing = { id: 'wing', firstName: 'Niko', lastName: 'Krilo', number: 11, position: 'FWD', isActive: true, clubId: 'home' };
const former = { id: 'former', firstName: 'Adi', lastName: 'Bivsi', number: 9, position: 'FWD', isActive: false, clubId: 'other' };
const reserve = { id: 'reserve', firstName: 'Roko', lastName: 'Rezerva', number: 12, position: 'MID', isActive: false, clubId: 'home' };
const away = { id: 'away-player', firstName: 'Goran', lastName: 'Gost', number: 8, position: 'FWD', isActive: true, clubId: 'away' };
type Row = Omit<Slot, 'positionX' | 'positionY'> & { id: string; positionX: number | null; positionY: number | null; player: typeof wing };
const midfielder = { id: 'mid', firstName: 'Miro', lastName: 'Vezni', number: 6, position: 'MID', isActive: true, clubId: 'home' };
const extraPlayers = Array.from({ length: 12 }, (_, i) => ({ id: `extra-${i}`, firstName: 'Test', lastName: `Overflow${i}`, number: i + 1, position: 'FWD', isActive: true, clubId: 'home' }));
const allPlayers = [wing, former, reserve, away, midfielder, ...extraPlayers];
const homeClub = { id: 'home', name: 'Domaći test', slug: 'home', isOwnClub: false };
const awayClub = { id: 'away', name: 'Gosti test', slug: 'away', isOwnClub: false };
const replacementClub = { id: 'other', name: 'Zamjenski test', slug: 'other', isOwnClub: false };
const defaultRow = { id: 'squad-default-home-10', clubId: 'home', playerId: wing.id, positionX: 75, positionY: 28, isStarter: true, player: wing };
const savedRow = { id: 'saved-former', clubId: 'home', playerId: former.id, positionX: 71, positionY: 25, isStarter: true, player: former };
const reserveRow = { id: 'saved-reserve', clubId: 'home', playerId: reserve.id, positionX: null, positionY: null, isStarter: false, player: reserve };
const awayRow = { id: 'saved-away', clubId: 'away', playerId: away.id, positionX: 75, positionY: 28, isStarter: true, player: away };
const homeSquad = { formation: { def: 4, mid: 3, fwd: 3 }, slots: [
  { id: 'empty-gk', clubId: 'home', slotIndex: 0, lineRole: 'GK', positionX: 14, positionY: 50, isBench: false, playerId: null, player: null },
  { id: 'wing-slot', clubId: 'home', slotIndex: 10, lineRole: 'FWD', positionX: 86, positionY: 88, isBench: false, playerId: wing.id, player: wing },
] };
const fourFourTwo = { formation: { def: 4, mid: 4, fwd: 2 }, slots: Array.from({ length: 11 }, (_, index) => {
  const lineRole = index === 0 ? 'GK' : index < 5 ? 'DEF' : index < 9 ? 'MID' : 'FWD';
  const positionX = index === 0 ? 14 : index < 5 ? 38 : index < 9 ? 62 : 86;
  const positionY = index === 0 ? 50 : index < 5 ? [12, 37, 63, 88][index - 1] :
    index < 9 ? [12, 37, 63, 88][index - 5] : [37, 63][index - 9];
  const player = index === 8 ? midfielder : index === 10 ? wing : null;
  return { id: `four-${index}`, clubId: 'home', slotIndex: index, lineRole, positionX, positionY, isBench: false,
    playerId: player?.id ?? null, player };
}) };
const default442 = [
  { ...defaultRow, id: 'squad-default-home-8', playerId: midfielder.id, player: midfielder, positionX: 88, positionY: 38 },
  { ...defaultRow, positionX: 63, positionY: 14 },
];
const overflowRows = extraPlayers.map((player, i) => ({
  id: `saved-${player.id}`, clubId: 'home', playerId: player.id,
  positionX: i === 0 ? 50 : 8 * i, positionY: i === 0 ? 90 : 30,
  isStarter: true, player,
}));
const awaySquad = { formation: { def: 4, mid: 3, fwd: 3 }, slots: [] };
const admin = {
  id: 'lineup-admin', email: 'audit@example.test', firstName: 'Test', lastName: 'User',
  permissions: ['settings.read', 'dashboard.read', 'competitions.manage', 'matches.manage'],
};

export async function setupLineupMock(page: Page, scenario: Scenario) {
  const requests: Slot[][] = [];
  const matchUpdates: Record<string, unknown>[] = [];
  const match = {
    id: 'lineup-match', seasonId: 'edition', homeClubId: scenario === 'restore-club' ? 'other' : 'home', awayClubId: 'away',
    homeClub: scenario === 'restore-club' ? replacementClub : homeClub, awayClub,
    homeScore: 0, awayScore: 0, minute: 0, status: scenario === 'finished-conflict' ? 'FINISHED' : 'SCHEDULED', reportStatus: 'DRAFT', clockStartedAt: null, scheduledAt: '2030-10-01T12:00:00.000Z',
    lineupConfigured: scenario !== 'default' && scenario !== 'four-four-two' && scenario !== 'uninitialized',
    lineup: (scenario === 'default' ? [defaultRow] : scenario === 'four-four-two' ? default442 : scenario === 'saved' || scenario === 'save-conflict' || scenario === 'patch-conflict' || scenario === 'restore-club' ? [savedRow, reserveRow] : scenario === 'conflict' || scenario === 'finished-conflict' ? [{ ...savedRow, clubId: 'old-club' }] : scenario === 'away' ? [awayRow] : scenario === 'overflow' ? overflowRows : []) as Row[],
  };
  await page.route('**/api/v1/auth/login', (route) => route.fulfill({ json: { user: admin, accessToken: 'mock-access', refreshToken: 'mock-refresh' } }));
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({ json: admin }));
  await page.route('**/api/v1/seasons', (route) => route.fulfill({ json: [{
    id: 'calendar', name: 'Sezona test', yearStart: 2026, yearEnd: 2027, isActive: true,
    competitions: [{ id: 'edition', competitionId: 'league', competition: { id: 'league', name: 'Liga test', isLeague: true } }],
  }] }));
  await page.route('**/api/v1/rounds?*', (route) => route.fulfill({ json: [{ id: 'round', seasonId: 'edition', number: 1, _count: { matches: 1 } }] }));
  await page.route('**/api/v1/matches?*', (route) => route.fulfill({ json: [match] }));
  await page.route('**/api/v1/matches/lineup-match', async (route) => {
    const method = route.request().method();
    if (method === 'GET') return route.fulfill({ json: match });
    if (method !== 'PATCH' || !['patch-conflict', 'restore-club'].includes(scenario)) throw new Error('Neočekivana izmjena mock utakmice');
    const body = route.request().postDataJSON() as Record<string, unknown>;
    matchUpdates.push(body);
    if (scenario === 'patch-conflict') return route.fulfill({ status: 409, json: { message: 'Spremljena postava sadrži redove prethodnog kluba.' } });
    if (body.homeClubId !== 'home' || body.awayClubId !== 'away') throw new Error('Neočekivani klubovi kod povrata');
    match.homeClubId = 'home';
    match.homeClub = homeClub;
    return route.fulfill({ json: match });
  });
  await page.route('**/api/v1/matches/lineup-match/lineup', async (route) => {
    if (route.request().method() !== 'PUT') throw new Error('Neočekivana mutacija mock postave');
    const { slots } = route.request().postDataJSON() as { slots: Slot[] };
    requests.push(slots);
    if (scenario === 'save-conflict') {
      await route.fulfill({ status: 409, json: { message: 'Postava je u sukobu s klubovima.' } });
      return;
    }
    match.lineupConfigured = true;
    match.lineup = slots.map((slot) => ({
      ...slot, id: `saved-${slot.playerId}`, positionX: slot.positionX ?? null, positionY: slot.positionY ?? null,
      player: allPlayers.find((player) => player.id === slot.playerId)!,
    }));
    await route.fulfill({ json: match.lineup });
  });
  await page.route('**/api/v1/players?*', (route) => {
    const clubId = new URL(route.request().url()).searchParams.get('clubId');
    return route.fulfill({ json: allPlayers.filter((player) => player.isActive && player.clubId === clubId) });
  });
  await page.route('**/api/v1/clubs', (route) => route.fulfill({ json: [homeClub, awayClub, replacementClub] }));
  await page.route('**/api/v1/clubs/home/squad', (route) => route.fulfill({ json: scenario === 'four-four-two' ? fourFourTwo : homeSquad }));
  await page.route('**/api/v1/clubs/away/squad', (route) => route.fulfill({ json: awaySquad }));
  await page.route('**/api/v1/sponsors', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/v1/ticketing/config', (route) => route.fulfill({ json: { modulesTicketing: false } }));
  return { requests, matchUpdates };
}
