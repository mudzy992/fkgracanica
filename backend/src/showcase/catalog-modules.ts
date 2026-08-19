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
  m('timeline', 'O klubu', 100, 'ready', W, 'Web dokumentar / scene spreman. Mobile heritage dump je zaseban red.'),
  m('team', 'Tim i igrači', 100, 'ready', W, 'Formacija, roster, profil i per-match historija na webu. Mobile polish je zaseban red.'),
  m('league', 'Liga i statistika', 100, 'ready', W, 'Tabela, kola, strijelci, round filter na webu. Mobile filter je zaseban red.'),
  m('live', 'Live centar', 100, 'ready', W, 'Web semafor + Socket.IO. Mobile lista bez socket-a je zaseban red.'),
  m('heritage', 'Nasljeđe', 100, 'ready', W, 'Web: trofeji, HoF, muzej. Mobile bullet dump je zaseban red.'),
  m('sponsors', 'Sponzori', 100, 'ready', W, 'Tierovi i logotipi na webu. EN copy je i18n-en red.'),
  m('cms', 'CMS stranice', 100, 'ready', WA, 'Public web render spreman. Builder je cms-builder; mobile text je zaseban red.'),
  m('media', 'Medijska biblioteka', 100, 'ready', WA, 'Folderi, upload, renditions na webu. Tree UI je media-tree; mobile upload zaseban red.'),
  m('rbac', 'Korisnici i uloge', 100, 'ready', W, 'Šest uloga uključujući Redar (admissions.scan). Permission keys na webu. Mobile create/delete je zaseban red.'),
  m('dashboard', 'Role dashboardi', 100, 'ready', W, 'Admin KPI; writer/komentator/moderator home na /admin; član na /clanstvo; Redar vidi validate panel. Mobile staff hub je zaseban red.'),
  m('audit', 'Audit log', 100, 'ready', W, 'Web filteri i paginacija. Mobile limit 50 je zaseban red.'),
  m('contact', 'Kontakt', 100, 'ready', W, 'Web forma, inbox, adresa. Mobile mapa je zaseban red.'),
  m('membership', 'Članstvo', 100, 'ready', W, 'Prijava, kartica, QR, Stripe/blagajna na webu. Mobile vizual kartice je zaseban red.'),
  m('ticketing', 'Ulaznice', 100, 'ready', W, 'Stripe + blagajna na webu, sold-out i cancel UX. Mobile buy i sezona su zasebni redovi.'),
  m('notifications', 'Notifikacije', 100, 'ready', W, 'Lista, unread, ikone tipa i deep link na webu. Push je zaseban red.'),
  m('seo', 'SEO', 100, 'ready', ['web'], 'Sitemap, robots i OG share za crawlere (vijest, galerija, igrač, static).'),
  m('mobile-staff', 'Mobile staff', 97, 'in_progress', ['mobile'], 'Admission scan (Redar): kamera, inspect/validate, overlay, vibracija, manual fallback. Komentator desk, live broadcast i events sheet. Writer: lista, editor, DOM body, cover, relacije, save/submit/archive drafta. Moderation: news/gallery/live queue, approve/reject, confirm za live. Admin hub: KPI, CRUD, orders, users.'),
  m('mobile-polish', 'Mobile vizuelni polish', 72, 'in_progress', ['mobile'], 'Live broadcast HUD, events sheet, YouTube stream. Home/liga/tim cinematic. Heritage/gallery/news jos potrebuju polish.'),
  m('email', 'Email obavijesti', 90, 'in_progress', W, 'HTML + FailedEmail log. Šalje se kad klub podesi SMTP (kontakt, članstvo, ulaznice).'),
  m('push', 'Push obavijesti', 72, 'in_progress', ['mobile'], 'Expo tokeni postoje. Dostava i payloadi se dorađuju.'),
  m('newsletter', 'Newsletter pretplata', 90, 'in_progress', W, 'Prijava, admin lista i CSV. Kampanje su zaseban red (newsletter-campaigns).'),
  m('analytics', 'Napredna analitika', 90, 'in_progress', WA, 'Team W/D/L, forma, H2H i admin stranica. Excel export je after_launch.'),
  m('i18n-en', 'Engleski jezik', 60, 'in_progress', W, 'Switcher + public chrome (nav, news, contact). Ostali stringovi još BS inline.'),
  m('cms-builder', 'CMS page builder', 100, 'web_only', ['web', 'admin'], 'Widget forme, enable toggle, custom-html. Namjerno web-only.'),
  m('formation-dnd', 'Formacija drag-and-drop', 100, 'web_only', ['web', 'admin'], 'DnD + vertikalni remap < lg. Namjerno web-only.'),
  m('media-tree', 'Media folder tree', 100, 'web_only', ['web', 'admin'], 'Hijerarhija iz parentId, collapse/expand. Namjerno web-only.'),
  m('paypal', 'PayPal', 100, 'ready', W, 'Orders API v2 sandbox/live. Charge u EUR (prikaz KM). Stripe ostaje default.'),
  m('monri', 'Monri', 100, 'ready', W, 'WebPay v2 form + digest. Test/live IPG. Merchant ključevi u adminu.'),
  m('newsletter-campaigns', 'Newsletter kampanje', 100, 'ready', ['admin'], 'Tekst + CTA u klupskom templateu. Draft → queue 10/min. Live Socket.IO brojke. Flag newsletter.blastEnabled.'),
  m('financial-export', 'Finansijski izvještaji', 100, 'ready', ['admin'], 'Excel/PDF: ulaznice (Payment), sezona (SeasonPass.price), članarine (ACTIVE × annualPrice).'),
  m('pwa', 'PWA', 100, 'ready', ['web'], 'Install banner, PNG ikone, SW v3, offline.html. iOS: Add to Home Screen.'),
  m('seasonal-tickets', 'Sezonske ulaznice', 100, 'ready', W, 'Jedan SeasonPass po sezoni, QR, scan jednom po utakmici, kapacitet, Stripe/PayPal/Monri + blagajna.'),
  m('video-highlights', 'Video sažeci', 100, 'ready', WM, 'YouTube klipovi po utakmici. Match center + mobile lista. Bez upload fajlova.'),
  m('play-store', 'Play Store', 20, 'after_launch', ['mobile'], 'EAS produkcijski profil postoji; submit nakon lansiranja.'),
];
