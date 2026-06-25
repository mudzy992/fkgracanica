import type { ContentStatus } from '../types';

export interface CmsPageSection {
  id: string;
  pageId: string;
  widgetType: string;
  sortOrder: number;
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  status: ContentStatus;
  seoTitle?: string | null;
  seoDesc?: string | null;
  isSystem: boolean;
  sections?: CmsPageSection[];
}

export interface CmsMenuItem {
  id: string;
  label: string;
  sortOrder: number;
  pageId?: string | null;
  path?: string | null;
  externalUrl?: string | null;
  isSystem?: boolean;
  enabled?: boolean;
  page?: { slug: string } | null;
  children?: CmsMenuItem[];
}

export interface CmsMenu {
  id: string;
  key: string;
  items: CmsMenuItem[];
}

export interface CmsWidgetMeta {
  type: string;
  label: string;
  category: string;
}
