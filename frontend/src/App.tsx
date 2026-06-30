import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { PermissionRoute } from './components/common/PermissionRoute';
import { ModuleRoute } from './components/common/ModuleRoute';
import { HomePage } from './pages/home/HomePage';
import { ClubTimelinePage } from './pages/public/ClubTimelinePage';
import { NewsListPage } from './pages/public/NewsListPage';
import { NewsDetailPage } from './pages/public/NewsDetailPage';
import { GalleryListPage } from './pages/public/GalleryListPage';
import { GalleryDetailPage } from './pages/public/GalleryDetailPage';
import { SponsorsPage } from './pages/public/SponsorsPage';
import { TrophiesPage } from './pages/public/TrophiesPage';
import { FirstTeamPage } from './pages/public/FirstTeamPage';
import { ClubPublicPage } from './pages/public/ClubPublicPage';
import { PlayerDetailPage } from './pages/public/PlayerDetailPage';
import { LeaguePage } from './pages/public/LeaguePage';
import { MatchCenterPage } from './pages/public/MatchCenterPage';
import { LiveMatchPage } from './pages/public/LiveMatchPage';
import { ContactPage } from './pages/public/ContactPage';
import { SearchPage } from './pages/public/SearchPage';
import { HallOfFamePage } from './pages/public/HallOfFamePage';
import { MuseumPage } from './pages/public/MuseumPage';
import { MembershipPage } from './pages/public/MembershipPage';
import { TicketsPage } from './pages/public/TicketsPage';
import { LoginPage } from './pages/public/LoginPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { UsersRolesPage } from './pages/admin/UsersRolesPage';
import { CmsHubPage } from './pages/admin/cms/CmsHubPage';
import { CmsPageBuilderPage } from './pages/admin/cms/CmsPageBuilderPage';
import { MediaPage } from './pages/admin/MediaPage';
import { AuditPage } from './pages/admin/AuditPage';
import { NewsAdminPage } from './pages/admin/NewsAdminPage';
import { GalleryAdminPage } from './pages/admin/GalleryAdminPage';
import { SponsorsAdminPage } from './pages/admin/SponsorsAdminPage';
import { TrophiesAdminPage } from './pages/admin/TrophiesAdminPage';
import { TimelineAdminPage } from './pages/admin/TimelineAdminPage';
import { ClubsListPage } from './pages/admin/club-hub/ClubsListPage';
import { ClubHubPage } from './pages/admin/club-hub/ClubHubPage';
import { CompetitionsAdminPage } from './pages/admin/CompetitionsAdminPage';
import { SeasonHubPage } from './pages/admin/competition-hub/SeasonHubPage';
import { MatchReportPage } from './pages/admin/MatchReportPage';
import { CommentatorPage } from './pages/admin/CommentatorPage';
import { LivePendingPage } from './pages/admin/LivePendingPage';
import { MembershipAdminPage } from './pages/admin/MembershipAdminPage';
import { TicketingAdminPage } from './pages/admin/TicketingAdminPage';
import { HeritageAdminPage } from './pages/admin/HeritageAdminPage';
import { CommsAdminPage } from './pages/admin/CommsAdminPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import { CmsDynamicPage } from './pages/public/CmsDynamicPage';

const ADMIN = '/admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route element={<ModuleRoute moduleKey="modules.timeline" />}>
            <Route path="o-klubu" element={<ClubTimelinePage />} />
          </Route>
          <Route element={<ModuleRoute moduleKey="modules.news" />}>
            <Route path="vijesti" element={<NewsListPage />} />
            <Route path="vijesti/:slug" element={<NewsDetailPage />} />
          </Route>
          <Route element={<ModuleRoute moduleKey="modules.gallery" />}>
            <Route path="galerija" element={<GalleryListPage />} />
            <Route path="galerija/:slug" element={<GalleryDetailPage />} />
          </Route>
          <Route element={<ModuleRoute moduleKey="modules.sponsors" />}>
            <Route path="sponzori" element={<SponsorsPage />} />
          </Route>
          <Route element={<ModuleRoute moduleKey="modules.trophies" />}>
            <Route path="trofeji" element={<TrophiesPage />} />
          </Route>
          <Route element={<ModuleRoute moduleKey="modules.clubs" />}>
            <Route path="tim" element={<FirstTeamPage />} />
            <Route path="klub/:slug" element={<ClubPublicPage />} />
            <Route path="igrac/:id" element={<PlayerDetailPage />} />
          </Route>
          <Route element={<ModuleRoute moduleKey="modules.competitions" />}>
            <Route path="liga" element={<LeaguePage />} />
            <Route path="utakmice/:id" element={<MatchCenterPage />} />
          </Route>
          <Route element={<ModuleRoute moduleKey="modules.contact" />}>
            <Route path="kontakt" element={<ContactPage />} />
          </Route>
          <Route path="pretraga" element={<SearchPage />} />
          <Route element={<ModuleRoute moduleKey="modules.hallOfFame" />}>
            <Route path="hall-of-fame" element={<HallOfFamePage />} />
          </Route>
          <Route element={<ModuleRoute moduleKey="modules.museum" />}>
            <Route path="muzej" element={<MuseumPage />} />
          </Route>
          <Route element={<ModuleRoute moduleKey="feature.membership" />}>
            <Route path="clanstvo" element={<MembershipPage />} />
          </Route>
          <Route element={<ModuleRoute moduleKey="modules.ticketing" />}>
            <Route path="ulaznice" element={<TicketsPage />} />
          </Route>
          <Route element={<ModuleRoute moduleKey="modules.cms" />}>
            <Route path="p/:slug" element={<CmsDynamicPage />} />
          </Route>
        </Route>

        <Route path="prijava" element={<LoginPage />} />

        <Route element={<ModuleRoute moduleKey="feature.live" />}>
          <Route path="live/:id" element={<LiveMatchPage />} />
        </Route>

        <Route path="admin/login" element={<AdminLoginPage />} />

        <Route path="admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route element={<PermissionRoute permission="settings.read" />}>
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="users" element={<UsersRolesPage />} />
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
            </Route>
            <Route element={<ModuleRoute moduleKey="modules.gallery" redirectTo={ADMIN} />}>
              <Route path="gallery" element={<GalleryAdminPage />} />
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
            <Route path="heritage" element={<HeritageAdminPage />} />
            <Route path="hall-of-fame" element={<Navigate to="/admin/heritage?tab=hall-of-fame" replace />} />
            <Route path="museum" element={<Navigate to="/admin/heritage?tab=museum" replace />} />
            <Route path="comms" element={<CommsAdminPage />} />
            <Route path="contact" element={<Navigate to="/admin/comms?tab=contact" replace />} />
            <Route path="newsletter" element={<Navigate to="/admin/comms?tab=newsletter" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
