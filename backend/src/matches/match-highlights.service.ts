import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseYouTubeId, parseYouTubeStart } from './youtube.util';
import type { CreateMatchHighlightDto, UpdateMatchHighlightDto } from './match-highlight.dto';

@Injectable()
export class MatchHighlightsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertYoutube(url: string) {
    if (!parseYouTubeId(url)) throw new BadRequestException('Unesite ispravan YouTube URL');
  }

  async create(matchId: string, dto: CreateMatchHighlightDto) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    this.assertYoutube(dto.youtubeUrl);
    const count = await this.prisma.matchHighlight.count({ where: { matchId } });
    return this.prisma.matchHighlight.create({
      data: {
        matchId,
        title: dto.title.trim(),
        youtubeUrl: dto.youtubeUrl.trim(),
        startSeconds: dto.startSeconds ?? parseYouTubeStart(dto.youtubeUrl),
        sortOrder: dto.sortOrder ?? count,
      },
    });
  }

  async update(matchId: string, id: string, dto: UpdateMatchHighlightDto) {
    const row = await this.prisma.matchHighlight.findFirst({ where: { id, matchId } });
    if (!row) throw new NotFoundException('Klip nije pronađen');
    if (dto.youtubeUrl) this.assertYoutube(dto.youtubeUrl);
    return this.prisma.matchHighlight.update({
      where: { id },
      data: {
        ...(dto.title != null ? { title: dto.title.trim() } : {}),
        ...(dto.youtubeUrl != null ? { youtubeUrl: dto.youtubeUrl.trim() } : {}),
        ...(dto.startSeconds !== undefined ? { startSeconds: dto.startSeconds } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });
  }

  async remove(matchId: string, id: string) {
    const row = await this.prisma.matchHighlight.findFirst({ where: { id, matchId } });
    if (!row) throw new NotFoundException('Klip nije pronađen');
    await this.prisma.matchHighlight.delete({ where: { id } });
    return { ok: true };
  }
}
