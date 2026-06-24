import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  subscribe(email: string) {
    return this.prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email },
      update: { isActive: true },
    });
  }

  findAll() {
    return this.prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
