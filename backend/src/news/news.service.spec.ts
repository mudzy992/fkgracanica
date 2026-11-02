import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { NewsService } from './news.service';
import { newsInclude } from './news-relations.util';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('NewsService', () => {
  let service: NewsService;
  const prisma = {
    news: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: { broadcast: jest.fn() } },
      ],
    }).compile();
    service = module.get(NewsService);
    jest.clearAllMocks();
  });

  it('findBySlug returns published article', async () => {
    const article = { id: '1', slug: 'test', status: ContentStatus.PUBLISHED };
    prisma.news.findFirst.mockResolvedValue(article);
    await expect(service.findBySlug('test')).resolves.toEqual(article);
    expect(prisma.news.findFirst).toHaveBeenCalledWith({
      where: { slug: 'test', status: ContentStatus.PUBLISHED },
      include: newsInclude,
    });
  });

  it('findBySlug throws when not found', async () => {
    prisma.news.findFirst.mockResolvedValue(null);
    await expect(service.findBySlug('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
