import { describe, expect, it, vi } from 'vitest';
import { ADMIN_NAV_GROUPS, filterNavLeaves } from './admin-nav-groups';

const all = (): boolean => true;

describe('filterNavLeaves', () => {
  it('bez dozvola vraća prazan spisak i ne poziva filter modula', () => {
    const isVisible = vi.fn(all);
    expect(filterNavLeaves(undefined, isVisible)).toEqual([]);
    expect(filterNavLeaves([], isVisible)).toEqual([]);
    expect(isVisible).not.toHaveBeenCalled();
  });

  it('zadržava samo stavke za koje korisnik ima dozvolu', () => {
    const groups = filterNavLeaves(['dashboard.read'], all);
    const leaves = groups.flatMap((g) => g.items);
    expect(leaves.map((l) => l.to)).toEqual(['/admin', '/admin/stanje', '/admin/notifications', '/']);
    expect(groups).toHaveLength(1);
  });

  it('uklanja grupe bez ijedne preostale stavke', () => {
    const groups = filterNavLeaves(['ticketing.manage'], all);
    expect(groups.map((g) => g.labelKey)).toEqual(['admin.navGroup.monetization']);
    expect(groups[0].items.map((i) => i.to)).toEqual(['/admin/ticketing']);
  });

  it('stavka sa više dozvola prolazi ako ima barem jednu', () => {
    const groups = filterNavLeaves(['users.read'], all);
    expect(groups.flatMap((g) => g.items).map((i) => i.to)).toEqual(['/admin/users']);
  });

  it('isključen modul uklanja stavku i praznu grupu', () => {
    const groups = filterNavLeaves(['dashboard.read'], (item) => item.to !== '/admin/stanje');
    expect(groups.flatMap((g) => g.items).map((i) => i.to)).toEqual(['/admin', '/admin/notifications', '/']);
  });

  it('filter modula dobija svaku stavku sa dozvolom', () => {
    const seen: string[] = [];
    filterNavLeaves(['dashboard.read', 'ticketing.manage'], (item) => {
      seen.push(item.to);
      return true;
    });
    expect(seen).toEqual([
      '/admin', '/admin/stanje', '/admin/notifications', '/', '/admin/ticketing',
    ]);
  });

  it('nepoznata dozvola ne otvara nijednu stavku', () => {
    expect(filterNavLeaves(['nepostoji.do', 'dashboard.read'], all).flatMap((g) => g.items)).toHaveLength(4);
    expect(filterNavLeaves(['nepostoji.do'], all)).toEqual([]);
  });

  it('ne mijenja izvornu definiciju navigacije', () => {
    const before = JSON.stringify(ADMIN_NAV_GROUPS);
    filterNavLeaves(['dashboard.read', 'ticketing.manage'], all);
    expect(JSON.stringify(ADMIN_NAV_GROUPS)).toBe(before);
  });
});
