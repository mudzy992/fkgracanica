import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { RoundsModule } from './rounds/rounds.module';
import { MatchesModule } from './matches/matches.module';
import { StatisticsModule } from './statistics/statistics.module';
import { LiveModule } from './live/live.module';
import { MembershipModule } from './membership/membership.module';
import { TicketingModule } from './ticketing/ticketing.module';
import { PaymentsModule } from './payments/payments.module';
import { HallOfFameModule } from './hall-of-fame/hall-of-fame.module';
import { MuseumModule } from './museum/museum.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FinanceModule } from './finance/finance.module';
import { CacheModule } from './cache/cache.module';
import { JobsModule } from './jobs/jobs.module';
import { SeoModule } from './seo/seo.module';
import { ShowcaseModule } from './showcase/showcase.module';
import { AppReleasesModule } from './app-releases/app-releases.module';
import { PublicAnalyticsModule } from './public-analytics/public-analytics.module';
import { EmailLogModule } from './email-log/email-log.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validate';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '..', '.env'),
        join(__dirname, '..', '.env'),
      ],
      // BE-01/P1+P2 (odobreno): tipizirana konfiguracija + fail-fast
      // validacija obaveznih env varijabla (bez novih npm zavisnosti).
      load: [configuration],
      validate: validateEnv,
    }),
    // BE-01/Q-11(a) (odobreno): globalni rate limit 100 zahtjeva/60s po IP-u.
    // Auth rute imaju stroži @Throttle (10/60s); `trust proxy` u main.ts je
    // OBAVEZAN dio ove odluke (Coolify proxy = 1 hop).
    // BE-02 korekcija: THROTTLER SAMO NA HTTP — WS poruke nemaju req.ip u
    // switchToHttp kontekstu (zajednički bucket / rizik pada live feeda).
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 100 }],
      skipIf: (context) => context.getType() !== 'http',
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
    RoundsModule,
    MatchesModule,
    StatisticsModule,
    LiveModule,
    MembershipModule,
    PaymentsModule,
    TicketingModule,
    HallOfFameModule,
    MuseumModule,
    AnalyticsModule,
    FinanceModule,
    CacheModule,
    JobsModule,
    SeoModule,
    ShowcaseModule,
    AppReleasesModule,
    PublicAnalyticsModule,
    EmailLogModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    // BE-01/Q-11(a): ThrottlerGuard prvi — rate limit važi i za
    // neautorizirane pokušaje (brute-force broji prije auth odbijanja).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // BE-02/Q-12(a) — D-006: globalni JwtAuthGuard (default-deny);
    // @Public() rute preskaču (popis: route-access.spec.ts).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
