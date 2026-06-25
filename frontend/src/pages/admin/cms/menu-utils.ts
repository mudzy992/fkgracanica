import type { CmsMenuItem } from '../../../cms/types';

export type MenuDraftItem = {
  id?: string;
  label: string;
  path: string;
  sortOrder: number;
  pageId?: string;
  externalUrl?: string;
  isSystem: boolean;
  enabled: boolean;
};

export function menuItemToDraft(it: CmsMenuItem): MenuDraftItem {
  return {
    id: it.id,
    label: it.label,
    path: it.path ?? (it.page?.slug ? (it.page.slug === 'home' ? '/' : `/p/${it.page.slug}`) : '/'),
    sortOrder: it.sortOrder,
    pageId: it.pageId ?? undefined,
    externalUrl: it.externalUrl ?? undefined,
    isSystem: it.isSystem ?? false,
    enabled: it.enabled ?? true,
  };
}

export function menuHref(item: MenuDraftItem): string {
  if (item.externalUrl) return item.externalUrl;
  return item.path || '/';
}
