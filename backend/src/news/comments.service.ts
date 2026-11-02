import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, MembershipStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../common/types/auth-user.type';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
} as const;

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByNews(newsId: string) {
    await this.assertPublishedNews(newsId);
    return this.prisma.comment.findMany({
      where: { newsId },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(newsId: string, user: AuthUser, content: string) {
    await this.assertPublishedNews(newsId);
    await this.assertCanComment(user);
    return this.prisma.comment.create({
      data: { newsId, userId: user.id, content: content.trim() },
      include: { user: { select: userSelect } },
    });
  }

  async remove(commentId: string, user: AuthUser) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Komentar nije pronađen');
    const isModerator = user.permissions.includes('news.manage');
    if (comment.userId !== user.id && !isModerator) {
      throw new ForbiddenException('Nemate dozvolu za brisanje komentara');
    }
    return this.prisma.comment.delete({ where: { id: commentId } });
  }

  private async assertPublishedNews(newsId: string) {
    const news = await this.prisma.news.findUnique({ where: { id: newsId } });
    if (!news || news.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Vijest nije pronađena');
    }
  }

  private async assertCanComment(user: AuthUser) {
    if (user.permissions.includes('news.manage')) return;
    const membership = await this.prisma.membership.findFirst({
      where: { userId: user.id, status: MembershipStatus.ACTIVE },
    });
    if (!membership) {
      throw new ForbiddenException('Samo aktivni članovi mogu komentirati');
    }
  }
}
