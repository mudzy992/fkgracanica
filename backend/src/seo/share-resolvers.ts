import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  matchShareDescription,
  matchShareImage,
  matchShareTitle,
} from './match-share.util';
import { mediaPublicUrl } from './seo-url.util';
import type { PackInput, SiteDefaults } from './share-defaults';

@Injectable()
export class ShareResolvers {
  constructor(private readonly prisma: PrismaService) {}

  async fromCmsPage(slug: string, url: string, defaults: SiteDefaults): Promise<PackInput> {
    const page = await this.prisma.cmsPage.findUnique({ where: { slug } });
    return {
      title: page?.seoTitle ?? page?.title ?? defaults.siteName,
      description: page?.seoDesc ?? defaults.description,
      url,
    };
  }

  async fromNews(slug: string, defaults: SiteDefaults): Promise<PackInput> {
    const item = await this.prisma.news.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!item) {
      return { title: 'Vijest', description: defaults.description, url: `/vijesti/${slug}` };
    }
    return {
      title: item.seoTitle ?? item.title,
      description: item.seoDesc ?? item.excerpt ?? defaults.description,
      image: mediaPublicUrl(item.coverPath, 'medium'),
      url: `/vijesti/${slug}`,
      type: 'article',
    };
  }

  async fromMatch(id: string, live: boolean, defaults: SiteDefaults): Promise<PackInput> {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: { homeClub: true, awayClub: true, season: { include: { competition: true } } },
    });
    const url = live ? `/live/${id}` : `/utakmice/${id}`;
    if (!match) return { title: 'Utakmica', description: defaults.description, url };
    const scheduled = live && match.status === 'SCHEDULED';
    const title = scheduled
      ? `${matchShareTitle(match.homeClub, match.awayClub, match.status, match.homeScore, match.awayScore)} — Uskoro`
      : matchShareTitle(match.homeClub, match.awayClub, match.status, match.homeScore, match.awayScore, live);
    const crest = matchShareImage(match.homeClub, match.awayClub, defaults.crestPath);
    return {
      title,
      description: matchShareDescription({
        home: match.homeClub,
        away: match.awayClub,
        scheduledAt: match.scheduledAt,
        venue: match.venue,
        competition: match.season?.competition?.name,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        live: live || match.status === 'LIVE' || match.status === 'HALFTIME',
      }),
      image: mediaPublicUrl(crest, 'medium') ?? defaults.crestUrl,
      url,
      type: 'article',
    };
  }

  async fromGallery(slug: string, defaults: SiteDefaults): Promise<PackInput> {
    const item = await this.prisma.gallery.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      include: { photos: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    });
    const url = `/galerija/${slug}`;
    if (!item) return { title: 'Galerija', description: defaults.description, url };
    return {
      title: item.title,
      description: item.description ?? defaults.description,
      image: mediaPublicUrl(item.photos[0]?.path, 'medium'),
      url,
    };
  }

  async fromPlayer(id: string, defaults: SiteDefaults): Promise<PackInput> {
    const player = await this.prisma.player.findUnique({ where: { id } });
    const url = `/igrac/${id}`;
    if (!player) return { title: 'Igrač', description: defaults.description, url };
    const name = `${player.firstName} ${player.lastName}`.trim();
    return {
      title: name,
      description: player.bio ?? defaults.description,
      image: mediaPublicUrl(player.photoPath, 'medium'),
      url,
    };
  }
}
