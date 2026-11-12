import { describe, expect, it } from 'vitest';
import { filterCommands, type Command } from './admin-command-palette';

const commands: Command[] = [
  { id: '1', to: '/admin/news', label: 'Vijesti', group: 'Sadržaj', keywords: '' },
  { id: '2', to: '/admin/gallery', label: 'Galerija', group: 'Sadržaj', keywords: '' },
  {
    id: '3',
    to: '/admin/news/new',
    label: 'Nova vijest',
    group: 'Brze akcije',
    keywords: 'clanak tekst',
  },
  { id: '4', to: '/admin/users', label: 'Korisnici i role', group: 'Sistem', keywords: 'dozvole' },
  { id: '5', to: '/admin/settings', label: 'Postavke', group: 'Sistem', keywords: 'moduli' },
];

const labels = (query: string) => filterCommands(commands, query).map((c) => c.label);

describe('admin komandna paleta (FE-05 / P-FE05-3)', () => {
  it('prazan upit vraća sve komande', () => {
    expect(filterCommands(commands, '')).toHaveLength(commands.length);
    expect(filterCommands(commands, '   ')).toHaveLength(commands.length);
  });

  it('nalazi bez obzira na dijakritiku i velika slova', () => {
    expect(labels('sadrzaj')).toContain('Vijesti');
    expect(labels('GALERIJA')).toEqual(['Galerija']);
    expect(labels('korisnici')).toEqual(['Korisnici i role']);
  });

  it('traži i po ključnim riječima, ne samo po naslovu', () => {
    expect(labels('clanak')).toEqual(['Nova vijest']);
    expect(labels('dozvole')).toEqual(['Korisnici i role']);
    expect(labels('moduli')).toEqual(['Postavke']);
  });

  it('sve riječi upita moraju se naći (AND)', () => {
    expect(labels('nova galerija')).toEqual([]);
    expect(labels('nova vijest')).toEqual(['Nova vijest']);
  });

  it('prefiks naslova ide ispred pogotka u sredini', () => {
    // „vij" je prefiks za „Vijesti", a sadržan u „Nova vijest"
    expect(labels('vij')[0]).toBe('Vijesti');
    expect(labels('vij')).toContain('Nova vijest');
  });

  it('nepostojeći upit vraća prazno (bez pada)', () => {
    expect(filterCommands(commands, 'nema-ovoga')).toEqual([]);
  });
});
