import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { HomePage } from './pages/home/HomePage';
import { ClubTimelinePage } from './pages/public/ClubTimelinePage';
import { NewsListPage } from './pages/public/NewsListPage';
import { NewsDetailPage } from './pages/public/NewsDetailPage';
import { GalleryListPage } from './pages/public/GalleryListPage';
import { GalleryDetailPage } from './pages/public/GalleryDetailPage';
import { SponsorsPage } from './pages/public/SponsorsPage';
import { TrophiesPage } from './pages/public/TrophiesPage';
import { FirstTeamPage } from './pages/public/FirstTeamPage';
import { LeaguePage } from './pages/public/LeaguePage';
import { MatchCenterPage } from './pages/public/MatchCenterPage';
import { LiveMatchPage } from './pages/public/LiveMatchPage';
import { ContactPage } from './pages/public/ContactPage';
import { SearchPage } from './pages/public/SearchPage';
import { HallOfFamePage } from './pages/public/HallOfFamePage';
import { MuseumPage } from './pages/public/MuseumPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { RolesPage } from './pages/admin/RolesPage';
import { CmsPage } from './pages/admin/CmsPage';
import { MediaPage } from './pages/admin/MediaPage';
import { AuditPage } from './pages/admin/AuditPage';
import { NewsAdminPage } from './pages/admin/NewsAdminPage';
import { GalleryAdminPage } from './pages/admin/GalleryAdminPage';
import { SponsorsAdminPage } from './pages/admin/SponsorsAdminPage';
import { TrophiesAdminPage } from './pages/admin/TrophiesAdminPage';
import { TimelineAdminPage } from './pages/admin/TimelineAdminPage';
import { PlayersAdminPage } from './pages/admin/PlayersAdminPage';
import { ClubsAdminPage } from './pages/admin/ClubsAdminPage';
import { CompetitionsAdminPage } from './pages/admin/CompetitionsAdminPage';
import { MatchesAdminPage } from './pages/admin/MatchesAdminPage';
import { CommentatorPage } from './pages/admin/CommentatorPage';
import { MembershipAdminPage } from './pages/admin/MembershipAdminPage';
import { TicketingAdminPage } from './pages/admin/TicketingAdminPage';
import { ContactAdminPage } from './pages/admin/ContactAdminPage';
import { NewsletterAdminPage } from './pages/admin/NewsletterAdminPage';
import { HallOfFameAdminPage } from './pages/admin/HallOfFameAdminPage';
import { MuseumAdminPage } from './pages/admin/MuseumAdminPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="o-klubu" element={<ClubTimelinePage />} />
          <Route path="vijesti" element={<NewsListPage />} />
          <Route path="vijesti/:slug" element={<NewsDetailPage />} />
          <Route path="galerija" element={<GalleryListPage />} />
          <Route path="galerija/:slug" element={<GalleryDetailPage />} />
          <Route path="sponzori" element={<SponsorsPage />} />
          <Route path="trofeji" element={<TrophiesPage />} />
          <Route path="tim" element={<FirstTeamPage />} />
          <Route path="liga" element={<LeaguePage />} />
          <Route path="utakmice/:id" element={<MatchCenterPage />} />
          <Route path="live/:id" element={<LiveMatchPage />} />
          <Route path="kontakt" element={<ContactPage />} />
          <Route path="pretraga" element={<SearchPage />} />
          <Route path="hall-of-fame" element={<HallOfFamePage />} />
          <Route path="muzej" element={<MuseumPage />} />
        </Route>

        <Route path="admin/login" element={<AdminLoginPage />} />

        <Route path="admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="cms" element={<CmsPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="news" element={<NewsAdminPage />} />
            <Route path="gallery" element={<GalleryAdminPage />} />
            <Route path="sponsors" element={<SponsorsAdminPage />} />
            <Route path="trophies" element={<TrophiesAdminPage />} />
            <Route path="club-timeline" element={<TimelineAdminPage />} />
            <Route path="players" element={<PlayersAdminPage />} />
            <Route path="clubs" element={<ClubsAdminPage />} />
            <Route path="competitions" element={<CompetitionsAdminPage />} />
            <Route path="matches" element={<MatchesAdminPage />} />
            <Route path="live/:id" element={<CommentatorPage />} />
            <Route path="membership" element={<MembershipAdminPage />} />
            <Route path="ticketing" element={<TicketingAdminPage />} />
            <Route path="contact" element={<ContactAdminPage />} />
            <Route path="newsletter" element={<NewsletterAdminPage />} />
            <Route path="hall-of-fame" element={<HallOfFameAdminPage />} />
            <Route path="museum" element={<MuseumAdminPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
