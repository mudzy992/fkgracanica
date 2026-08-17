import type { ShowcaseSection } from './showcase.types';

export const SHOWCASE_SECTIONS: ShowcaseSection[] = [
  {
    id: 'surfaces',
    title: 'Tri površine, jedan sistem',
    body: 'FK Gračanica dobija centralnu digitalnu platformu — ne običan sajt. Isti podaci hrane javni web, administraciju i mobilnu aplikaciju. Jedan sistem, tri površine.',
    bullets: [
      'Javni web — navijači, vijesti, live, članstvo, ulaznice',
      'Admin — CMS, kadar, liga, komentator, blagajna, postavke',
      'Mobile — Expo aplikacija za navijače i osoblje na terenu',
    ],
  },
  {
    id: 'fan',
    title: 'Put navijača',
    body: 'Od prve posjete do digitalne ulaznice u džepu. Portal prati navijača kroz sadržaj, utakmicu, članstvo i kupovinu.',
    bullets: [
      'Čita vijesti, gleda galeriju i prati live semafor',
      'Postaje član — digitalna kartica s QR kodom',
      'Rezerviše ili plati ulaznicu (blagajna ili Stripe)',
      'Na ulazu skeniranje QR-a sa osoblja',
    ],
    moduleIds: ['news', 'live', 'membership', 'ticketing'],
  },
  {
    id: 'identity',
    title: 'Identitet kluba',
    body: 'Historija, kadar, trofeji i sponzori na jednom mjestu. Administrator uređuje sadržaj bez izmjene koda.',
    bullets: [
      'O klubu — animirana vremenska linija',
      'Prvi tim — formacija na terenu, profili igrača',
      'Trofeji, Hall of Fame, digitalni muzej',
      'Sponzori po kategorijama',
    ],
    moduleIds: ['timeline', 'team', 'heritage', 'sponsors'],
  },
  {
    id: 'competition',
    title: 'Takmičenje i live',
    body: 'Liga se računa iz utakmica. Na dan meča komentator vodi semafor; javnost vidi rezultat u stvarnom vremenu.',
    bullets: [
      'Tabela, kola, strijelci, izvještaj utakmice',
      'Komentator: golovi, kartoni, izmjene, komentari, stream',
      'Nakon utakmice moderator odobrava izvještaj — tek tada statistike igrača',
    ],
    moduleIds: ['league', 'live'],
  },
  {
    id: 'membership-tickets',
    title: 'Članstvo i ulaznice',
    body: 'Stripe, PayPal i Monri online, plus blagajna.',
    bullets: [
      'Članarina: prijava, odobrenje, digitalna kartica + QR',
      'Ulaznice samo za domaće utakmice, kategorije (uključujući VIP)',
      'Online (Stripe, PayPal ili Monri) i/ili rezervacija za blagajnu',
      'QR validacija na mobile staff ekranu',
    ],
    moduleIds: ['membership', 'ticketing', 'paypal', 'monri'],
  },
  {
    id: 'content',
    title: 'Sadržaj i CMS',
    body: 'Writer predaje, moderator odobrava, administrator drži sistem. Naslovna se slaže widgetima, bez programera.',
    bullets: [
      'Vijesti i galerije s workflowom Draft → Pending → Published',
      'CMS: hero, vijesti, tabela, CTA, newsletter, footer',
      'Centralna media biblioteka s folderima i renditions',
    ],
    moduleIds: ['news', 'gallery', 'cms', 'media'],
  },
  {
    id: 'admin',
    title: 'Uprava i operativa',
    body: 'Dashboard, korisnici, moduli, audit. Klub pali i gasi cijele segmente (vijesti, live, ulaznice) iz postavki.',
    bullets: [
      'KPI kartice i posljednje aktivnosti',
      'Upravljanje korisnicima i dozvolama',
      'Privatne postavke: SMTP, plaćanja, feature flagovi',
      'Audit svake bitne akcije',
    ],
    moduleIds: ['dashboard', 'rbac', 'audit'],
  },
  {
    id: 'mobile',
    title: 'Mobilna aplikacija',
    body: 'Expo aplikacija za navijače i osoblje. Flagship javni ekrani (home, liga, tim, klubovi) su cinematic. Vijesti, live lista, more i staff još ulaze u vizuelni polish. CMS builder i drag-drop formacija ostaju namjerno na webu.',
    bullets: [
      'Spremno vizuelno: home, liga, tim, igrač, javni klub',
      'Funkcionalno, polish u redu: vijesti, live, more, ulaznice, članstvo',
      'Staff: writer, komentator, moderacija, admin ops, QR — radi, polish slijedi',
      'Namjerno web-only: page builder, formacija drag-drop, media tree',
    ],
    moduleIds: ['mobile-staff', 'mobile-polish', 'cms-builder', 'formation-dnd', 'media-tree'],
  },
  {
    id: 'roadmap',
    title: 'Šta je danas, šta je sljedeće',
    body: 'Iskreno: portal se lansira sa onim što radi. Ostatak master plana ide u isporuku poslije lansiranja — ništa se ne briše s mape.',
    bullets: [
      'Spremno — radi u produkciji, ide u lansiranje',
      'U toku — postoji, dorađuje se (npr. mobile polish)',
      'Poslije lansiranja — newsletter kampanje, sezonske ulaznice',
    ],
  },
  {
    id: 'club-needs',
    title: 'Šta klub treba uraditi',
    body: 'Sistem živi ako klub ima ljude i sadržaj. Minimalni kadar za klub veličine FK Gračanica je mali.',
    bullets: [
      'Jedna osoba — administrator (sekretar): korisnici, moduli, SMTP, Stripe ključevi',
      'Jedna osoba — mediji (može biti ista): vijesti, galerija, odobrenja',
      'Komentator na dan utakmice; 1–2 osobe na ulazu sa telefonom za QR',
      'Dostaviti: grb, fotografije, roster, historiju, cjenovnik, pravne tekstove',
    ],
  },
];
