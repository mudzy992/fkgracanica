import { describe, expect, it } from 'vitest';
import type { CmsMenuItem } from '../../../cms/types';
import { menuHref, menuItemToDraft } from './menu-utils';
import { blockedModuleForItem, findBlockedMenuItems } from './menu-module-warnings';
import type { MenuDraftItem } from './menu-utils';

const item = (over: Partial<CmsMenuItem> = {}) =>
  ({
    id: 'i1',
    label: 'Početna',
    sortOrder: 1,
    isSystem: true,
    enabled: true,
    ...over,
  }) as CmsMenuItem;

const draft = (over: Partial<MenuDraftItem> = {}): MenuDraftItem => ({
  label: 'Stavka',
  path: '/',
  sortOrder: 0,
  isSystem: false,
  enabled: true,
  ...over,
});

describe('menuItemToDraft', () => {
  it('koristi postojeći path kad ga stavka ima', () => {
    expect(menuItemToDraft(item({ path: '/vijesti' }))).toMatchObject({ path: '/vijesti' });
  });

  it('home slug prevodi u korijen', () => {
    const result = menuItemToDraft(item({ page: { slug: 'home' } as never, path: null as never }));
    expect(result.path).toBe('/');
  });

  it('ostali slugovi idu na /p/<slug>', () => {
    const result = menuItemToDraft(item({ page: { slug: 'o-nama' } as never, path: null as never }));
    expect(result.path).toBe('/p/o-nama');
  });

  it('bez patha i bez stranice pada na korijen', () => {
    expect(menuItemToDraft(item({ path: null as never, page: null as never })).path).toBe('/');
  });

  it('popunjava zastavice i preslikava id/redoslijed/eksterni link', () => {
    const result = menuItemToDraft(
      item({ id: 'x', sortOrder: 7, pageId: 'pg1', externalUrl: 'https://ffbih.ba', isSystem: undefined, enabled: undefined }),
    );
    expect(result).toMatchObject({
      id: 'x',
      sortOrder: 7,
      pageId: 'pg1',
      externalUrl: 'https://ffbih.ba',
      isSystem: false,
      enabled: true,
    });
  });

  it('eksplicitno isključena stavka ostaje isključena', () => {
    expect(menuItemToDraft(item({ enabled: false, isSystem: true }))).toMatchObject({
      enabled: false,
      isSystem: true,
    });
  });
});

describe('menuHref', () => {
  it('eksterni link ima prednost', () => {
    expect(menuHref(draft({ path: '/vijesti', externalUrl: 'https://x.ba' }))).toBe('https://x.ba');
  });

  it('prazan path pada na korijen', () => {
    expect(menuHref(draft({ path: '' }))).toBe('/');
  });
});

describe('findBlockedMenuItems', () => {
  const items = [
    draft({ label: 'Vijesti', path: '/vijesti' }),
    draft({ label: 'Galerija', path: '/galerija' }),
    draft({ label: 'Savez', path: 'https://ffbih.ba', externalUrl: 'https://ffbih.ba' }),
    draft({ label: 'Početna', path: '/' }),
    draft({ label: 'Isključena', path: '/trofeji', enabled: false }),
  ];

  it('bez isključenih modula nema blokada', () => {
    expect(findBlockedMenuItems(items, {})).toEqual([]);
    expect(findBlockedMenuItems(items, undefined)).toEqual([]);
  });

  it('prijavljuje samo uključene interne stavke čiji je modul isključen', () => {
    const blocked = findBlockedMenuItems(items, { 'modules.news': 'false', 'modules.trophies': 'false' });
    expect(blocked).toEqual([
      { label: 'Vijesti', href: '/vijesti', moduleKey: 'modules.news', moduleLabel: 'Vijesti' },
    ]);
  });

  it('stavka bez modula i eksterni link nikada nisu blokirani', () => {
    const blocked = findBlockedMenuItems(
      [draft({ label: 'Početna', path: '/' }), draft({ label: 'Savez', path: 'https://a.ba', externalUrl: 'https://a.ba' })],
      { 'modules.news': 'false', 'modules.gallery': 'false' },
    );
    expect(blocked).toEqual([]);
  });

  it('nepoznat modul koristi ključ kao oznaku', () => {
    const blocked = findBlockedMenuItems([draft({ path: '/muzej' })], { 'modules.museum': 'false' });
    expect(blocked[0].moduleLabel).toBe('Muzej');
  });

  it('blockedModuleForItem vraća prvu blokadu ili null', () => {
    expect(blockedModuleForItem(draft({ path: '/liga' }), { 'modules.competitions': 'false' })).toMatchObject({
      moduleKey: 'modules.competitions',
      href: '/liga',
    });
    expect(blockedModuleForItem(draft({ path: '/liga' }), {})).toBeNull();
  });
});
