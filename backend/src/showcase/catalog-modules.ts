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
  m('public-portal', 'Javni portal', 95, 'ready', WM, 'Naslovna, CMS widgeti, identitet kluba, responzivni sajt.'),
  m('news', 'Vijesti', 95, 'ready', W, 'Draft → odobrenje → objava. Kategorije, tagovi, komentari članova.'),
  m('gallery', 'Galerija', 90, 'ready', W, 'Albumi, lightbox, workflow odobrenja, media biblioteka.'),
  m('timeline', 'O klubu', 90, 'ready', W, 'Vremenska linija historije, fotografije i ključne godine.'),
  m('team', 'Tim i igrači', 95, 'ready', W, 'Formacija na terenu, roster, profil igrača i statistika iz utakmica.'),
  m('league', 'Liga i statistika', 90, 'ready', W, 'Tabela, kola, raspored, strijelci, izvještaji utakmica.'),
  m('live', 'Live centar', 90, 'ready', W, 'Semafor, feed, YouTube ili countdown, Socket.IO, komentator desk.'),
  m('heritage', 'Nasljeđe', 90, 'ready', W, 'Trofeji, Hall of Fame, digitalni muzej.'),
  m('sponsors', 'Sponzori', 95, 'ready', W, 'Tierovi (generalni do partneri), logotipi i linkovi.'),
  m('cms', 'CMS stranice', 90, 'ready', WA, 'Page builder, meni, widgeti naslovne i statične stranice.'),
  m('media', 'Medijska biblioteka', 90, 'ready', WA, 'Folderi, upload, renditions, ponovna upotreba slika.'),
  m('rbac', 'Korisnici i uloge', 95, 'ready', W, 'Pet uloga, permission keys, zaštita posljednjeg admina.'),
  m('dashboard', 'Admin dashboard', 95, 'ready', W, 'KPI: korisnici, članovi, vijesti, utakmice, ulaznice.'),
  m('audit', 'Audit log', 95, 'ready', W, 'Prijave, izmjene, odobrenja, promjene postavki.'),
  m('contact', 'Kontakt', 95, 'ready', W, 'Javna forma, inbox u adminu, podaci iz postavki.'),
  m('membership', 'Članstvo', 90, 'ready', W, 'Prijava, digitalna kartica + QR, blagajna ili Stripe.'),
  m('ticketing', 'Ulaznice', 85, 'ready', W, 'Domaće utakmice, kategorije, QR, blagajna i/ili Stripe.'),
  m('notifications', 'Notifikacije', 95, 'ready', W, 'In-app lista, nepročitano, mark-as-read, zvono.'),
  m('seo', 'SEO', 80, 'ready', ['web'], 'Meta, sitemap, robots, Open Graph osnova.'),
  m('mobile-staff', 'Mobile staff', 85, 'in_progress', ['mobile'], 'Writer, komentator, moderacija, admin ops na telefonu.'),
  m('mobile-polish', 'Mobile vizuelni polish', 40, 'in_progress', ['mobile'], 'Dorada ekrana (home u toku, ostali u redu).'),
  m('email', 'Email obavijesti', 70, 'in_progress', W, 'SMTP + red; šalje se kad klub podesi SMTP.'),
  m('push', 'Push obavijesti', 75, 'in_progress', ['mobile'], 'Expo push tokeni i dostava na uređaj.'),
  m('newsletter', 'Newsletter pretplata', 80, 'in_progress', W, 'Prijava emaila i admin lista. Kampanje dolaze poslije.'),
  m('analytics', 'Napredna analitika', 60, 'in_progress', WA, 'Forma i H2H postoje; dublji trendovi i export kasnije.'),
  m('i18n-en', 'Engleski jezik', 30, 'in_progress', W, 'i18n infrastruktura postoji; EN prevodi se dopunjuju.'),
  m('cms-builder', 'CMS page builder', 90, 'web_only', ['web', 'admin'], 'Namjerno web-only. Mobile čita gotove stranice.'),
  m('formation-dnd', 'Formacija drag-and-drop', 90, 'web_only', ['web', 'admin'], 'Namjerno web-only. Mobile prikazuje sastav.'),
  m('media-tree', 'Media folder tree', 90, 'web_only', ['web', 'admin'], 'Namjerno web-only. Mobilni staff koristi jednostavniji upload.'),
  m('paypal', 'PayPal', 5, 'after_launch', W, 'Stub. Lansiranje ide sa Stripe + blagajnom.'),
  m('monri', 'Monri', 5, 'after_launch', W, 'Stub. Lokalni provider nakon lansiranja.'),
  m('newsletter-campaigns', 'Newsletter kampanje', 10, 'after_launch', ['admin'], 'Lista pretplatnika postoji; blast email kasnije.'),
  m('financial-export', 'Finansijski izvještaji', 0, 'after_launch', ['admin'], 'Excel/PDF export uplata — nakon lansiranja.'),
  m('pwa', 'PWA', 5, 'after_launch', ['web'], 'Instalacija sajta na telefon — nakon lansiranja.'),
  m('seasonal-tickets', 'Sezonske ulaznice', 20, 'after_launch', W, 'VIP je kategorija. Sezona kao poseban proizvod kasnije.'),
  m('video-highlights', 'Video sažeci', 10, 'after_launch', WM, 'Match center; video highlighti nakon lansiranja.'),
  m('play-store', 'Play Store', 20, 'after_launch', ['mobile'], 'EAS produkcijski profil postoji; submit nakon lansiranja.'),
];
