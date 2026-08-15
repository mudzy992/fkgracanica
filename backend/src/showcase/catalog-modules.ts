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
  m('public-portal', 'Javni portal', 92, 'ready', WM, 'Naslovna i CMS widgeti spremni. EN copy i CMS edge slučajevi ostaju.'),
  m('news', 'Vijesti', 92, 'ready', W, 'Web: draft → odobrenje → objava. Mobile lista još nije featured/bento.'),
  m('gallery', 'Galerija', 90, 'ready', W, 'Web: albumi, lightbox, workflow. Mobile lista nije bento.'),
  m('timeline', 'O klubu', 90, 'ready', W, 'Web vremenska linija spremna. Mobile heritage je tekstualni dump.'),
  m('team', 'Tim i igrači', 92, 'ready', W, 'Formacija, roster, profil — web i mobile cinematic. Career/history tanji.'),
  m('league', 'Liga i statistika', 90, 'ready', W, 'Tabela, kola, strijelci. Round filter na webu dublji nego na mobile.'),
  m('live', 'Live centar', 88, 'ready', W, 'Web semafor + Socket.IO. Mobile lista bez live updatea i cresta.'),
  m('heritage', 'Nasljeđe', 88, 'ready', W, 'Web: trofeji, HoF, muzej. Mobile spaja sve u bullet listu (42%).'),
  m('sponsors', 'Sponzori', 92, 'ready', W, 'Tierovi i logotipi. EN copy nedostaje.'),
  m('cms', 'CMS stranice', 88, 'ready', WA, 'Web builder spreman. Mobile čita widgete kao plain text.'),
  m('media', 'Medijska biblioteka', 88, 'ready', WA, 'Folderi, upload, renditions. Mobile upload jednostavniji.'),
  m('rbac', 'Korisnici i uloge', 92, 'ready', W, 'Pet uloga, permission keys. Mobile roles bez create/delete.'),
  m('dashboard', 'Admin dashboard', 90, 'ready', W, 'Web KPI spreman. Mobile dashboard 60% (nema skeleton/chart).'),
  m('audit', 'Audit log', 90, 'ready', W, 'Web audit spreman. Mobile limit 50, bez filtera.'),
  m('contact', 'Kontakt', 92, 'ready', W, 'Web forma + inbox. Mobile bez adrese/mape.'),
  m('membership', 'Članstvo', 88, 'ready', W, 'Prijava, kartica, QR, Stripe/blagajna. Mobile kartica nije vizual.'),
  m('ticketing', 'Ulaznice', 82, 'ready', W, 'Domaće utakmice, QR, blagajna/Stripe na webu. Mobile buy = box_office.'),
  m('notifications', 'Notifikacije', 90, 'ready', W, 'Lista, unread, mark-as-read. Mobile bez type icon/deep link.'),
  m('seo', 'SEO', 74, 'ready', ['web'], 'Sitemap i robots postoje. OG meta je SPA-only (botovi bez JS ne vide).'),
  m('mobile-staff', 'Mobile staff', 70, 'in_progress', ['mobile'], 'Prosjek 24 ekrana. Writer/komentator rade; validate/dashboard/moderation slabiji.'),
  m('mobile-polish', 'Mobile vizuelni polish', 69, 'in_progress', ['mobile'], 'Prosjek 23 public ekrana. Home/liga/tim cinematic; heritage/gallery/news niski.'),
  m('email', 'Email obavijesti', 68, 'in_progress', W, 'Nodemailer + red. Šalje se kad klub podesi SMTP.'),
  m('push', 'Push obavijesti', 72, 'in_progress', ['mobile'], 'Expo tokeni postoje. Dostava i payloadi se dorađuju.'),
  m('newsletter', 'Newsletter pretplata', 78, 'in_progress', W, 'Prijava i admin lista. Blast kampanje su after_launch.'),
  m('analytics', 'Napredna analitika', 42, 'in_progress', WA, 'Nema H2H ni admin stranice. Forma/trendovi nisu implementirani.'),
  m('i18n-en', 'Engleski jezik', 28, 'in_progress', W, 'i18n infrastruktura postoji. Puno UI stringova je i dalje BS inline.'),
  m('cms-builder', 'CMS page builder', 90, 'web_only', ['web', 'admin'], 'Namjerno web-only. Mobile čita gotove stranice.'),
  m('formation-dnd', 'Formacija drag-and-drop', 90, 'web_only', ['web', 'admin'], 'Namjerno web-only. Mobile prikazuje sastav.'),
  m('media-tree', 'Media folder tree', 80, 'web_only', ['web', 'admin'], 'Folder sheet picker, ne hijerarhijski tree. Namjerno web-only.'),
  m('paypal', 'PayPal', 5, 'after_launch', W, 'Stub. Lansiranje ide sa Stripe + blagajnom.'),
  m('monri', 'Monri', 5, 'after_launch', W, 'Stub. Lokalni provider nakon lansiranja.'),
  m('newsletter-campaigns', 'Newsletter kampanje', 10, 'after_launch', ['admin'], 'Lista pretplatnika postoji; blast email kasnije.'),
  m('financial-export', 'Finansijski izvještaji', 0, 'after_launch', ['admin'], 'Excel/PDF export uplata — nakon lansiranja.'),
  m('pwa', 'PWA', 22, 'after_launch', ['web'], 'manifest.json + sw.js postoje. Install UX i ikone nisu gotovi.'),
  m('seasonal-tickets', 'Sezonske ulaznice', 20, 'after_launch', W, 'VIP je kategorija. Sezona kao poseban proizvod kasnije.'),
  m('video-highlights', 'Video sažeci', 10, 'after_launch', WM, 'Match center; video highlighti nakon lansiranja.'),
  m('play-store', 'Play Store', 20, 'after_launch', ['mobile'], 'EAS produkcijski profil postoji; submit nakon lansiranja.'),
];
