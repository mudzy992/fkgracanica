import { lazyRoute } from '../components/common/lazy-route';

export const CmsHubPage = lazyRoute(() =>
  import('../pages/admin/cms/CmsHubPage').then((module) => ({ default: module.CmsHubPage })),
);
export const CmsPageBuilderPage = lazyRoute(() =>
  import('../pages/admin/cms/CmsPageBuilderPage').then((module) => ({ default: module.CmsPageBuilderPage })),
);
export const NewsEditorPage = lazyRoute(() =>
  import('../pages/admin/news/NewsEditorPage').then((module) => ({ default: module.NewsEditorPage })),
);
export const GalleryEditorPage = lazyRoute(() =>
  import('../pages/admin/gallery/GalleryEditorPage').then((module) => ({ default: module.GalleryEditorPage })),
);
export const ClubHubPage = lazyRoute(() =>
  import('../pages/admin/club-hub/ClubHubPage').then((module) => ({ default: module.ClubHubPage })),
);
export const SeasonHubPage = lazyRoute(() =>
  import('../pages/admin/competition-hub/SeasonHubPage').then((module) => ({ default: module.SeasonHubPage })),
);
export const MembershipAdminPage = lazyRoute(() =>
  import('../pages/admin/MembershipAdminPage').then((module) => ({ default: module.MembershipAdminPage })),
);
export const TicketingAdminPage = lazyRoute(() =>
  import('../pages/admin/TicketingAdminPage').then((module) => ({ default: module.TicketingAdminPage })),
);
