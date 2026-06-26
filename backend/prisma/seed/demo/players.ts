import { PlayerPosition } from '@prisma/client';
import type { SeedPrisma } from '../prisma-client';

const PLAYERS = [
  { firstName: 'Adnan', lastName: 'Hadžić', number: 1, position: PlayerPosition.GK },
  { firstName: 'Kenan', lastName: 'Osmanović', number: 2, position: PlayerPosition.DEF },
  { firstName: 'Mirza', lastName: 'Kovačević', number: 4, position: PlayerPosition.DEF },
  { firstName: 'Haris', lastName: 'Begić', number: 5, position: PlayerPosition.DEF },
  { firstName: 'Emir', lastName: 'Salihović', number: 3, position: PlayerPosition.DEF },
  { firstName: 'Nermin', lastName: 'Jusić', number: 6, position: PlayerPosition.MID },
  { firstName: 'Amir', lastName: 'Čović', number: 8, position: PlayerPosition.MID },
  { firstName: 'Dino', lastName: 'Memić', number: 10, position: PlayerPosition.MID },
  { firstName: 'Armin', lastName: 'Softić', number: 7, position: PlayerPosition.MID },
  { firstName: 'Elvis', lastName: 'Mujić', number: 9, position: PlayerPosition.FWD },
  { firstName: 'Senad', lastName: 'Hasanović', number: 11, position: PlayerPosition.FWD },
  { firstName: 'Tarik', lastName: 'Imamović', number: 14, position: PlayerPosition.MID },
  { firstName: 'Benjamin', lastName: 'Smajić', number: 17, position: PlayerPosition.FWD },
] as const;

export async function seedPlayers(prisma: SeedPrisma, ownClubId: string, opponentClubId?: string) {
  await seedClubPlayers(prisma, ownClubId, PLAYERS);
  if (opponentClubId) {
    await seedClubPlayers(prisma, opponentClubId, OPPONENT_PLAYERS);
  }
}

async function seedClubPlayers(
  prisma: SeedPrisma,
  clubId: string,
  roster: readonly { firstName: string; lastName: string; number: number; position: PlayerPosition }[],
) {
  for (const player of roster) {
    const existing = await prisma.player.findFirst({
      where: { clubId, firstName: player.firstName, lastName: player.lastName },
    });
    if (existing) continue;
    await prisma.player.create({ data: { ...player, clubId, isActive: true } });
  }
}

const OPPONENT_PLAYERS = [
  { firstName: 'Marko', lastName: 'Petrović', number: 1, position: PlayerPosition.GK },
  { firstName: 'Ivan', lastName: 'Jurić', number: 4, position: PlayerPosition.DEF },
  { firstName: 'Luka', lastName: 'Matić', number: 5, position: PlayerPosition.DEF },
  { firstName: 'Petar', lastName: 'Nikolić', number: 6, position: PlayerPosition.DEF },
  { firstName: 'Stefan', lastName: 'Vuković', number: 8, position: PlayerPosition.MID },
  { firstName: 'Nikola', lastName: 'Đorđević', number: 10, position: PlayerPosition.MID },
  { firstName: 'Filip', lastName: 'Knežević', number: 9, position: PlayerPosition.FWD },
  { firstName: 'Andrej', lastName: 'Popović', number: 11, position: PlayerPosition.FWD },
] as const;
