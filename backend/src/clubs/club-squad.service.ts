import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildFormationSlots,
  DEFAULT_BENCH_SIZE,
  validateFormation,
} from './formation-layout.util';

type SlotAssignment = { slotIndex: number; isBench: boolean; playerId?: string | null };

@Injectable()
export class ClubSquadService {
  constructor(private readonly prisma: PrismaService) {}

  async getSquad(clubId: string) {
    const club = await this.findClubOrThrow(clubId);
    await this.ensureSquadInitialized(clubId);
    await this.syncStarterCoordinates(clubId, club);
    const slots = await this.prisma.clubSquadSlot.findMany({
      where: { clubId },
      include: { player: true },
      orderBy: [{ isBench: 'asc' }, { slotIndex: 'asc' }],
    });
    return {
      formation: { def: club.formationDef, mid: club.formationMid, fwd: club.formationFwd },
      slots,
    };
  }

  async updateFormation(clubId: string, def: number, mid: number, fwd: number) {
    await this.findClubOrThrow(clubId);
    validateFormation({ def, mid, fwd });
    const existing = await this.prisma.clubSquadSlot.findMany({
      where: { clubId, isBench: false },
      include: { player: true },
    });
    const bench = await this.prisma.clubSquadSlot.findMany({
      where: { clubId, isBench: true },
      include: { player: true },
    });

    await this.prisma.$transaction([
      this.prisma.clubSquadSlot.deleteMany({ where: { clubId, isBench: false } }),
      this.prisma.club.update({
        where: { id: clubId },
        data: { formationDef: def, formationMid: mid, formationFwd: fwd },
      }),
    ]);

    const layouts = buildFormationSlots({ def, mid, fwd });
    const usedPlayerIds = new Set<string>();
    for (const layout of layouts) {
      const match = existing.find(
        (s) => s.lineRole === layout.lineRole && s.playerId && !usedPlayerIds.has(s.playerId),
      );
      const playerId = match?.playerId ?? null;
      if (playerId) usedPlayerIds.add(playerId);
      await this.prisma.clubSquadSlot.create({
        data: { clubId, ...layout, playerId },
      });
    }

    for (const b of bench) {
      await this.prisma.clubSquadSlot.create({
        data: {
          clubId,
          slotIndex: b.slotIndex,
          lineRole: b.player?.position ?? 'MID',
          positionX: 0,
          positionY: 0,
          isBench: true,
          benchOrder: b.benchOrder,
          playerId: b.playerId,
        },
      });
    }

    return this.getSquad(clubId);
  }

  private async syncStarterCoordinates(
    clubId: string,
    club: { formationDef: number; formationMid: number; formationFwd: number },
  ) {
    const layouts = buildFormationSlots({
      def: club.formationDef,
      mid: club.formationMid,
      fwd: club.formationFwd,
    });
    const starters = await this.prisma.clubSquadSlot.findMany({
      where: { clubId, isBench: false },
      orderBy: { slotIndex: 'asc' },
    });
    await Promise.all(
      layouts.map((layout, i) => {
        const slot = starters[i];
        if (!slot) return Promise.resolve();
        if (slot.positionX === layout.positionX && slot.positionY === layout.positionY) {
          return Promise.resolve();
        }
        return this.prisma.clubSquadSlot.update({
          where: { id: slot.id },
          data: { positionX: layout.positionX, positionY: layout.positionY },
        });
      }),
    );
  }

  async ensureSquadInitialized(clubId: string) {
    const count = await this.prisma.clubSquadSlot.count({ where: { clubId } });
    if (count > 0) return;
    const club = await this.findClubOrThrow(clubId);
    const layouts = buildFormationSlots({
      def: club.formationDef,
      mid: club.formationMid,
      fwd: club.formationFwd,
    });
    await this.prisma.clubSquadSlot.createMany({
      data: layouts.map((l) => ({ clubId, ...l })),
    });
    await this.prisma.clubSquadSlot.createMany({
      data: Array.from({ length: DEFAULT_BENCH_SIZE }, (_, i) => ({
        clubId,
        slotIndex: i,
        lineRole: 'MID' as const,
        isBench: true,
        benchOrder: i,
      })),
    });
  }

  async assignSlots(clubId: string, assignments: SlotAssignment[]) {
    await this.findClubOrThrow(clubId);
    await this.ensureSquadInitialized(clubId);
    const playerIds = assignments.map((a) => a.playerId).filter(Boolean) as string[];
    if (new Set(playerIds).size !== playerIds.length) {
      throw new BadRequestException('Igrač ne može biti na više pozicija.');
    }

    for (const a of assignments) {
      if (a.playerId) {
        const player = await this.prisma.player.findFirst({
          where: { id: a.playerId, clubId },
        });
        if (!player) throw new BadRequestException('Igrač ne pripada ovom klubu.');
        await this.prisma.clubSquadSlot.updateMany({
          where: { clubId, playerId: a.playerId, NOT: { slotIndex: a.slotIndex, isBench: a.isBench } },
          data: { playerId: null },
        });
      }
      await this.prisma.clubSquadSlot.updateMany({
        where: { clubId, slotIndex: a.slotIndex, isBench: a.isBench },
        data: { playerId: a.playerId ?? null },
      });
    }
    return this.getSquad(clubId);
  }

  private findClubOrThrow(clubId: string) {
    return this.prisma.club.findUnique({ where: { id: clubId } }).then((club) => {
      if (!club) throw new NotFoundException('Klub nije pronađen.');
      return club;
    });
  }
}
