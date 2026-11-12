import { APP_MODULE_DEFINITIONS } from '../../../lib/module-definitions';
import { resolvePublicModuleKey } from '../../../lib/route-module-map';
import { isModuleEnabled } from '../../../lib/module-settings-rules';
import type { MenuDraftItem } from './menu-utils';
import { menuHref } from './menu-utils';

export type MenuModuleBlock = {
  label: string;
  href: string;
  moduleKey: string;
  moduleLabel: string;
};

function moduleLabelFor(key: string): string {
  return APP_MODULE_DEFINITIONS.find((m) => m.key === key)!.label;
}

/** Aktivna meni stavka čiji modul je ugašen → neće se prikazati javno. */
export function findBlockedMenuItems(
  items: MenuDraftItem[],
  moduleFlags?: Record<string, string>,
): MenuModuleBlock[] {
  const out: MenuModuleBlock[] = [];
  for (const item of items) {
    if (!item.enabled) continue;
    const href = menuHref(item);
    if (href.startsWith('http')) continue;
    const moduleKey = resolvePublicModuleKey(href);
    if (!moduleKey) continue;
    if (isModuleEnabled(moduleFlags, moduleKey)) continue;
    out.push({
      label: item.label,
      href,
      moduleKey,
      moduleLabel: moduleLabelFor(moduleKey),
    });
  }
  return out;
}

export function blockedModuleForItem(
  item: MenuDraftItem,
  moduleFlags?: Record<string, string>,
): MenuModuleBlock | null {
  return findBlockedMenuItems([item], moduleFlags)[0] ?? null;
}
