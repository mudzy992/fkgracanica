import type { ShowcaseRole } from './showcase.types';

export const SHOWCASE_ROLES: ShowcaseRole[] = [
  {
    id: 'administrator',
    title: 'Administrator',
    who: 'Sekretar ili IT osoba u upravi',
    tasks: [
      'Korisnici, uloge, moduli i postavke',
      'SMTP, Stripe, kapacitet stadiona, cjenovnik',
      'CMS naslovna i meni',
      'Uključivanje režima „u izradi” / lansiranje portala',
    ],
    home: [
      'Queue: članarine, vijesti, live izvještaji, inbox',
      'Zdravlje: članstva, ulaznice, objavljene vijesti',
      'Brze akcije: CMS, korisnici, postavke',
    ],
  },
  {
    id: 'moderator',
    title: 'Moderator',
    who: 'PR / mediji (može biti ista osoba kao admin)',
    tasks: [
      'Odobrava vijesti, galerije i live izvještaje',
      'Uređuje sadržaj; ne dira Settings Registry',
      'Prati kontakt inbox i newsletter listu',
    ],
    home: [
      'Vijesti, galerije i live na odobrenju',
      'Inbox nepročitano',
      'Brzo odobri iz queue liste',
    ],
  },
  {
    id: 'writer',
    title: 'Writer',
    who: 'Novinar ili volonter',
    tasks: [
      'Piše vijesti i slaže albume',
      'Predaje na odobrenje (Pending)',
      'Ne objavljuje samostalno',
    ],
    home: [
      'Nacrti, pending, objavljene, albumi',
      'Mape i upload slika u biblioteku',
      'Nova vijest / novi album; objavu radi moderator',
    ],
  },
  {
    id: 'komentator',
    title: 'Komentator',
    who: 'Speaker / volonter na utakmici',
    tasks: [
      'Start/kraj, golovi, kartoni, izmjene, komentari',
      'Semafor i opciono YouTube stream',
      'Po završetku predaje izvještaj na odobrenje',
    ],
    home: [
      'Uživo, zakazane, izvještaji za predaju',
      'Desk lista utakmica',
      'Brzi ulaz u semafor i javni live',
    ],
  },
  {
    id: 'clan',
    title: 'Član',
    who: 'Navijač s nalogom',
    tasks: [
      'Profil, komentari na vijestima',
      'Članarina i digitalna kartica',
      'Kupovina ili rezervacija ulaznica',
    ],
    home: [
      'Status članarine i digitalna kartica + QR',
      'Sljedeća utakmica i ulaznice',
      'Nepročitane obavijesti',
    ],
  },
];
