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
  },
];
