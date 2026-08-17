import { Route } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { ModuleRoute } from '../components/common/ModuleRoute';
import { HomePage } from '../pages/home/HomePage';
import { ClubTimelinePage } from '../pages/public/ClubTimelinePage';
import { NewsListPage } from '../pages/public/NewsListPage';
import { NewsDetailPage } from '../pages/public/NewsDetailPage';
import { GalleryListPage } from '../pages/public/GalleryListPage';
import { GalleryDetailPage } from '../pages/public/GalleryDetailPage';
import { SponsorsPage } from '../pages/public/SponsorsPage';
import { TrophiesPage } from '../pages/public/TrophiesPage';
import { FirstTeamPage } from '../pages/public/FirstTeamPage';
import { ClubPublicPage } from '../pages/public/ClubPublicPage';
import { PlayerDetailPage } from '../pages/public/PlayerDetailPage';
import { LeaguePage } from '../pages/public/LeaguePage';
import { MatchCenterPage } from '../pages/public/MatchCenterPage';
import { ContactPage } from '../pages/public/ContactPage';
import { SearchPage } from '../pages/public/SearchPage';
import { HallOfFamePage } from '../pages/public/HallOfFamePage';
import { MuseumPage } from '../pages/public/MuseumPage';
import { MembershipPage } from '../pages/public/MembershipPage';
import { NewsletterUnsubscribePage } from '../pages/public/NewsletterUnsubscribePage';
import { TicketsPage } from '../pages/public/TicketsPage';
import { MonriBridgePage } from '../pages/public/MonriBridgePage';
import { CmsDynamicPage } from '../pages/public/CmsDynamicPage';

export const publicLayoutRoutes = (
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
    <Route path="newsletter/unsubscribe" element={<NewsletterUnsubscribePage />} />
    <Route path="placanje/monri" element={<MonriBridgePage />} />
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
);
