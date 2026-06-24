import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RbacModule } from './rbac/rbac.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { UploadModule } from './upload/upload.module';
import { RealtimeModule } from './realtime/realtime.module';
import { HealthModule } from './health/health.module';
import { CmsModule } from './cms/cms.module';
import { MediaModule } from './media/media.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NewsModule } from './news/news.module';
import { GalleryModule } from './gallery/gallery.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { TrophiesModule } from './trophies/trophies.module';
import { ClubTimelineModule } from './club-timeline/club-timeline.module';
import { ContactModule } from './contact/contact.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { SearchModule } from './search/search.module';
import { ClubsModule } from './clubs/clubs.module';
import { PlayersModule } from './players/players.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { MatchesModule } from './matches/matches.module';
import { StatisticsModule } from './statistics/statistics.module';
import { LiveModule } from './live/live.module';
import { MembershipModule } from './membership/membership.module';
import { TicketingModule } from './ticketing/ticketing.module';
import { HallOfFameModule } from './hall-of-fame/hall-of-fame.module';
import { MuseumModule } from './museum/museum.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CacheModule } from './cache/cache.module';
import { JobsModule } from './jobs/jobs.module';
import { SeoModule } from './seo/seo.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '..', '.env'),
        join(__dirname, '..', '.env'),
      ],
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    UsersModule,
    RbacModule,
    RealtimeModule,
    SettingsModule,
    NotificationsModule,
    UploadModule,
    HealthModule,
    CmsModule,
    MediaModule,
    DashboardModule,
    NewsModule,
    GalleryModule,
    SponsorsModule,
    TrophiesModule,
    ClubTimelineModule,
    ContactModule,
    NewsletterModule,
    SearchModule,
    ClubsModule,
    PlayersModule,
    CompetitionsModule,
    MatchesModule,
    StatisticsModule,
    LiveModule,
    MembershipModule,
    TicketingModule,
    HallOfFameModule,
    MuseumModule,
    AnalyticsModule,
    CacheModule,
    JobsModule,
    SeoModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}
