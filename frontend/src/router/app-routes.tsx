import { Navigate, Route } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import {
  CmsHubPage,
  CmsPageBuilderPage,
  NewsEditorPage,
  GalleryEditorPage,
  ClubHubPage,
  SeasonHubPage,
  MembershipAdminPage,
  TicketingAdminPage,
} from './lazy-admin-pages';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { PermissionRoute } from '../components/common/PermissionRoute';
import { ModuleRoute } from '../components/common/ModuleRoute';
import { LiveMatchPage } from '../pages/public/LiveMatchPage';
import { LoginPage } from '../pages/public/LoginPage';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { AnalyticsPage } from '../pages/admin/AnalyticsPage';
import { PlatformStatusPage } from '../pages/admin/platform-status/PlatformStatusPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { AppReleasesAdminPage } from '../pages/admin/app-releases/AppReleasesAdminPage';
import { UsersRolesPage } from '../pages/admin/UsersRolesPage';
import { MediaPage } from '../pages/admin/MediaPage';
import { AuditPage } from '../pages/admin/AuditPage';
import { NewsAdminPage } from '../pages/admin/NewsAdminPage';
import { GalleryAdminPage } from '../pages/admin/GalleryAdminPage';
import { SponsorsAdminPage } from '../pages/admin/SponsorsAdminPage';
import { TrophiesAdminPage } from '../pages/admin/TrophiesAdminPage';
import { TimelineAdminPage } from '../pages/admin/TimelineAdminPage';
import { ClubsListPage } from '../pages/admin/club-hub/ClubsListPage';
import { CompetitionsAdminPage } from '../pages/admin/CompetitionsAdminPage';
import { CalendarSeasonPage } from '../pages/admin/CalendarSeasonPage';
import { MatchReportPage } from '../pages/admin/MatchReportPage';
import { CommentatorPage } from '../pages/admin/CommentatorPage';
import { LivePendingPage } from '../pages/admin/LivePendingPage';
import { FinanceAdminPage } from '../pages/admin/FinanceAdminPage';
import { HeritageAdminPage } from '../pages/admin/HeritageAdminPage';
import { CommsAdminPage } from '../pages/admin/CommsAdminPage';
import { NotificationsPage } from '../pages/admin/NotificationsPage';
import { ShowcasePage } from '../pages/showcase/ShowcasePage';
import { ShowcaseGate } from '../components/common/ShowcaseGate';
import { RootShell } from './root-shell';
import { publicLayoutRoutes } from './public-layout-routes';

const ADMIN = '/admin';

export const appRouteElements = (
  <Route element={<RootShell />}>
    <Route path="platforma" element={<ShowcasePage />} />
    <Route element={<ShowcaseGate />}>
      {publicLayoutRoutes}

      <Route element={<ModuleRoute moduleKey="feature.live" />}>
        <Route path="live/:id" element={<LiveMatchPage />} />
      </Route>
    </Route>

    <Route path="prijava" element={<LoginPage />} />

    <Route path="admin/login" element={<AdminLoginPage />} />

    <Route path="admin" element={<ProtectedRoute />}>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route element={<PermissionRoute permission="dashboard.read" />}>
          <Route path="stanje" element={<PlatformStatusPage />} />
        </Route>
        <Route element={<PermissionRoute permission="analytics.read" />}>
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
        <Route element={<PermissionRoute permission="settings.read" />}>
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route element={<PermissionRoute permission="app-releases.manage" />}>
          <Route path="app-releases" element={<AppReleasesAdminPage />} />
        </Route>
        <Route element={<PermissionRoute permission="dashboard.read" />}>
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        <Route element={<PermissionRoute anyOf={['users.read', 'rbac.read']} />}>
          <Route path="users" element={<UsersRolesPage />} />
        </Route>
        <Route path="roles" element={<Navigate to="/admin/users?tab=roles" replace />} />
        <Route element={<ModuleRoute moduleKey="modules.cms" redirectTo={ADMIN} />}>
          <Route path="cms" element={<CmsHubPage />} />
          <Route path="cms/pages/:id" element={<CmsPageBuilderPage />} />
        </Route>
        <Route element={<ModuleRoute moduleKey="modules.media" redirectTo={ADMIN} />}>
          <Route path="media" element={<MediaPage />} />
        </Route>
        <Route element={<PermissionRoute permission="audit.read" />}>
          <Route path="audit" element={<AuditPage />} />
        </Route>
        <Route element={<ModuleRoute moduleKey="modules.news" redirectTo={ADMIN} />}>
          <Route path="news" element={<NewsAdminPage />} />
          <Route path="news/new" element={<NewsEditorPage />} />
          <Route path="news/:id/edit" element={<NewsEditorPage />} />
        </Route>
        <Route element={<ModuleRoute moduleKey="modules.gallery" redirectTo={ADMIN} />}>
          <Route path="gallery" element={<GalleryAdminPage />} />
          <Route path="gallery/new" element={<GalleryEditorPage />} />
          <Route path="gallery/:id/edit" element={<GalleryEditorPage />} />
        </Route>
        <Route element={<ModuleRoute moduleKey="modules.sponsors" redirectTo={ADMIN} />}>
          <Route path="sponsors" element={<SponsorsAdminPage />} />
        </Route>
        <Route element={<ModuleRoute moduleKey="modules.trophies" redirectTo={ADMIN} />}>
          <Route path="trophies" element={<TrophiesAdminPage />} />
        </Route>
        <Route element={<ModuleRoute moduleKey="modules.timeline" redirectTo={ADMIN} />}>
          <Route path="club-timeline" element={<TimelineAdminPage />} />
        </Route>
        <Route element={<ModuleRoute moduleKey="modules.clubs" redirectTo={ADMIN} />}>
          <Route path="clubs" element={<ClubsListPage />} />
          <Route path="clubs/:id" element={<ClubHubPage />} />
          <Route path="players" element={<Navigate to="/admin/clubs" replace />} />
        </Route>
        <Route element={<ModuleRoute moduleKey="modules.competitions" redirectTo={ADMIN} />}>
          <Route path="competitions" element={<CompetitionsAdminPage />} />
          <Route path="seasons/:seasonId" element={<CalendarSeasonPage />} />
          <Route path="seasons/:seasonId/competitions/:editionId" element={<SeasonHubPage />} />
          <Route path="competitions/seasons/:seasonId" element={<SeasonHubPage />} />
          <Route path="rounds" element={<Navigate to="/admin/competitions" replace />} />
          <Route path="matches" element={<Navigate to="/admin/competitions" replace />} />
        </Route>
        <Route element={<ModuleRoute moduleKey="feature.live" redirectTo={ADMIN} />}>
          <Route element={<PermissionRoute permission="live.approve" />}>
            <Route path="live/pending" element={<LivePendingPage />} />
          </Route>
          <Route element={<PermissionRoute permission="live.manage" />}>
            <Route path="live/:id" element={<CommentatorPage />} />
            <Route path="matches/:id/report" element={<MatchReportPage />} />
          </Route>
        </Route>
        <Route element={<ModuleRoute moduleKey="feature.membership" redirectTo={ADMIN} />}>
          <Route element={<PermissionRoute permission="membership.manage" />}>
            <Route path="membership" element={<MembershipAdminPage />} />
          </Route>
        </Route>
        <Route element={<ModuleRoute moduleKey="modules.ticketing" redirectTo={ADMIN} />}>
          <Route element={<PermissionRoute permission="ticketing.manage" />}>
            <Route path="ticketing" element={<TicketingAdminPage />} />
          </Route>
        </Route>
        <Route element={<PermissionRoute permission="finance.read" />}>
          <Route path="finance" element={<FinanceAdminPage />} />
        </Route>
        <Route element={<PermissionRoute anyOf={['hall-of-fame.manage', 'museum.manage']} />}>
          <Route path="heritage" element={<HeritageAdminPage />} />
        </Route>
        <Route
          path="hall-of-fame"
          element={<Navigate to="/admin/heritage?tab=hall-of-fame" replace />}
        />
        <Route path="museum" element={<Navigate to="/admin/heritage?tab=museum" replace />} />
        <Route
          element={
            <PermissionRoute anyOf={['contact.read', 'newsletter.read', 'newsletter.manage']} />
          }
        >
          <Route path="comms" element={<CommsAdminPage />} />
        </Route>
        <Route path="contact" element={<Navigate to="/admin/comms?tab=contact" replace />} />
        <Route path="newsletter" element={<Navigate to="/admin/comms?tab=newsletter" replace />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Route>
);
