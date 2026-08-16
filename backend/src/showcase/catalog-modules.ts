import type { ShowcaseModule, ShowcaseSurface } from './showcase.types';

const W: ShowcaseSurface[] = ['web', 'admin', 'mobile'];
const WA: ShowcaseSurface[] = ['web', 'admin'];
const WM: ShowcaseSurface[] = ['web', 'mobile'];

function m(
  id: string,
  title: string,
  percent: number,
  badge: ShowcaseModule['badge'],
  surfaces: ShowcaseSurface[],
  summary: string,
): ShowcaseModule {
  return { id, title, percent, badge, surfaces, summary };
}

export const SHOWCASE_MODULES: ShowcaseModule[] = [
  m('public-portal', 'Javni portal', 100, 'ready', WM, 'Naslovna, CMS widgeti, empty/error, language switcher. Mobile polish je zaseban red.'),
  m('news', 'Vijesti', 100, 'ready', W, 'Web: draft → odobrenje → objava, featured i kategorije. Mobile polish je zaseban red.'),
  m('gallery', 'Galerija', 100, 'ready', W, 'Web: albumi, bento, lightbox, workflow. Mobile bento je zaseban red.'),
  m('timeline', 'O klubu', 100, 'ready', W, 'Web vremenska linija spremna. Mobile heritage dump je zaseban red.'),
  m('team', 'Tim i igrači', 100, 'ready', W, 'Formacija, roster, profil i per-match historija na webu. Mobile polish je zaseban red.'),
  m('league', 'Liga i statistika', 100, 'ready', W, 'Tabela, kola, strijelci, round filter na webu. Mobile filter je zaseban red.'),
  m('live', 'Live centar', 100, 'ready', W, 'Web semafor + Socket.IO. Mobile lista bez socket-a je zaseban red.'),
  m('heritage', 'Nasljeđe', 100, 'ready', W, 'Web: trofeji, HoF, muzej. Mobile bullet dump je zaseban red.'),
  m('sponsors', 'Sponzori', 100, 'ready', W, 'Tierovi i logotipi na webu. EN copy je i18n-en red.'),
  m('cms', 'CMS stranice', 100, 'ready', WA, 'Public web render spreman. Builder je cms-builder; mobile text je zaseban red.'),
  m('media', 'Medijska biblioteka', 100, 'ready', WA, 'Folderi, upload, renditions na webu. Tree UI je media-tree; mobile upload zaseban red.'),
  m('rbac', 'Korisnici i uloge', 100, 'ready', W, 'Pet uloga, permission keys na webu. Mobile create/delete je zaseban red.'),
  m('dashboard', 'Admin dashboard', 100, 'ready', W, 'Web KPI + /admin/stanje. Mobile dashboard je zaseban red; chart je analytics.'),
  m('audit', 'Audit log', 100, 'ready', W, 'Web filteri i paginacija. Mobile limit 50 je zaseban red.'),
  m('contact', 'Kontakt', 100, 'ready', W, 'Web forma, inbox, adresa. Mobile mapa je zaseban red.'),
  m('membership', 'Članstvo', 100, 'ready', W, 'Prijava, kartica, QR, Stripe/blagajna na webu. Mobile vizual kartice je zaseban red.'),
  m('ticketing', 'Ulaznice', 100, 'ready', W, 'Stripe + blagajna na webu, sold-out i cancel UX. Mobile buy i sezona su zasebni redovi.'),
  m('notifications', 'Notifikacije', 100, 'ready', W, 'Lista, unread, ikone tipa i deep link na webu. Push je zaseban red.'),
  m('seo', 'SEO', 100, 'ready', ['web'], 'Sitemap, robots i OG share za crawlere (vijest, galerija, igrač, static).'),
  m('mobile-staff', 'Mobile staff', 70, 'in_progress', ['mobile'], 'Prosjek 24 ekrana. Writer/komentator rade; validate/dashboard/moderation slabiji.'),
  m('mobile-polish', 'Mobile vizuelni polish', 69, 'in_progress', ['mobile'], 'Prosjek 23 public ekrana. Home/liga/tim cinematic; heritage/gallery/news niski.'),
  m('email', 'Email obavijesti', 90, 'in_progress', W, 'HTML + FailedEmail log. Šalje se kad klub podesi SMTP (kontakt, članstvo, ulaznice).'),
  m('push', 'Push obavijesti', 72, 'in_progress', ['mobile'], 'Expo tokeni postoje. Dostava i payloadi se dorađuju.'),
  m('newsletter', 'Newsletter pretplata', 90, 'in_progress', W, 'Prijava, admin lista i CSV export. Blast kampanje su after_launch.'),
  m('analytics', 'Napredna analitika', 90, 'in_progress', WA, 'Team W/D/L, forma, H2H i admin stranica. Excel export je after_launch.'),
  m('i18n-en', 'Engleski jezik', 60, 'in_progress', W, 'Switcher + public chrome (nav, news, contact). Ostali stringovi još BS inline.'),
  m('cms-builder', 'CMS page builder', 100, 'web_only', ['web', 'admin'], 'Widget forme, enable toggle, custom-html. Namjerno web-only.'),
  m('formation-dnd', 'Formacija drag-and-drop', 100, 'web_only', ['web', 'admin'], 'DnD + vertikalni remap < lg. Namjerno web-only.'),
  m('media-tree', 'Media folder tree', 100, 'web_only', ['web', 'admin'], 'Hijerarhija iz parentId, collapse/expand. Namjerno web-only.'),
  m('paypal', 'PayPal', 5, 'after_launch', W, 'Stub. Lansiranje ide sa Stripe + blagajnom.'),
  m('monri', 'Monri', 5, 'after_launch', W, 'Stub. Lokalni provider nakon lansiranja.'),
  m('newsletter-campaigns', 'Newsletter kampanje', 10, 'after_launch', ['admin'], 'Lista pretplatnika postoji; blast email kasnije.'),
  m('financial-export', 'Finansijski izvještaji', 0, 'after_launch', ['admin'], 'Excel/PDF export uplata — nakon lansiranja.'),
  m('pwa', 'PWA', 22, 'after_launch', ['web'], 'manifest.json + sw.js postoje. Install UX i ikone nisu gotovi.'),
  m('seasonal-tickets', 'Sezonske ulaznice', 20, 'after_launch', W, 'VIP je kategorija. Sezona kao poseban proizvod kasnije.'),
  m('video-highlights', 'Video sažeci', 10, 'after_launch', WM, 'Match center; video highlighti nakon lansiranja.'),
  m('play-store', 'Play Store', 20, 'after_launch', ['mobile'], 'EAS produkcijski profil postoji; submit nakon lansiranja.'),
];
