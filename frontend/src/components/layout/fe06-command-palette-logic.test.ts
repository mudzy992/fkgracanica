import { describe, expect, it, vi } from 'vitest';
import type { TFunction } from 'i18next';
import { buildCommands, filterCommands, normalize, type Command } from './admin-command-palette';
import type { AdminNavGroup } from './admin-nav-groups';

const t = ((key: string) => key) as unknown as TFunction;

const command = (over: Partial<Command>): Command => ({
  id: 'x', to: '/x', label: 'X', group: 'Grupa', keywords: '', ...over,
});

describe('normalize', () => {
  it('uklanja dijakritiku i normalizuje razmake', () => {
    expect(normalize('  ŠĆećer-Žaba ĐAK  ')).toBe('scecer-zaba dak');
    expect(normalize('ČĆŠŽĐ')).toBe('ccszd');
  });
});

describe('filterCommands', () => {
  const commands = [
    command({ id: '1', label: 'Vijesti', keywords: 'novosti clanci' }),
    command({ id: '2', label: 'Nova vijest', keywords: 'tekst' }),
    command({ id: '3', label: 'Galerija', group: 'Sadržaj' }),
  ];

  it('prazan upit vraća sve komande', () => {
    expect(filterCommands(commands, '   ')).toHaveLength(3);
  });

  it('prefiks labele ide prije ostalih poklapanja', () => {
    expect(filterCommands(commands, 'vij').map((c) => c.id)).toEqual(['1', '2']);
    expect(filterCommands(commands, 'vijest').map((c) => c.id)).toEqual(['1', '2']);
  });

  it('svaka riječ mora postojati u labeli, grupi ili ključnim riječima', () => {
    expect(filterCommands(commands, 'novosti clanci').map((c) => c.id)).toEqual(['1']);
    expect(filterCommands(commands, 'sadrzaj galerija').map((c) => c.id)).toEqual(['3']);
    expect(filterCommands(commands, 'vijest clanci').map((c) => c.id)).toEqual(['1']);
  });
});

describe('buildCommands', () => {
  const groups: AdminNavGroup[] = [
    {
      labelKey: 'grupa',
      items: [
        { to: '/admin/news', labelKey: 'vijesti', permissions: ['news.manage'] },
        { to: '/admin/news', labelKey: 'vijesti', permissions: ['news.manage'] },
        { to: 'https://docs.example', labelKey: 'docs', external: true, permissions: ['news.manage'] },
      ],
    },
  ];

  it('uklanja duplikate po putanji i labeli te čuva vanjske stavke', () => {
    const result = buildCommands({ groups, permissions: [], t });
    expect(result.map((c) => c.to)).toEqual(['/admin/news', 'https://docs.example']);
    expect(result[1].external).toBe(true);
  });

  it('dodaje samo brze akcije za koje korisnik ima dozvolu', () => {
    const withCms = buildCommands({ groups: [], permissions: ['cms.manage'], t });
    expect(withCms.map((c) => c.to)).toEqual(['/admin/cms']);
    const none = buildCommands({ groups: [], permissions: undefined, t });
    expect(none).toEqual([]);
    expect(withCms[0].group).toBe('admin.cmdkActions');
  });

  it('preuzima labele i grupe kroz prevodilačku funkciju', () => {
    const translate = vi.fn((key: string) => `T:${key}`) as unknown as TFunction;
    const [first] = buildCommands({ groups, permissions: [], t: translate });
    expect(first.label).toBe('T:vijesti');
    expect(first.group).toBe('T:grupa');
    expect(translate).toHaveBeenCalledWith('vijesti');
  });
});
