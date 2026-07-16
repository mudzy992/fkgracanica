import { asString } from '../../lib/content-helpers';
import type { EntityCrudConfig } from './entity-crud-types';

const num = (v: string): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const opt = (v: string): string | undefined => (v.trim() ? v.trim() : undefined);

export const sponsorsConfig: EntityCrudConfig = {
  endpoint: '/sponsors',
  permission: 'sponsors.manage',
  titleKey: 'sponsors',
  fields: [
    { key: 'name', labelKey: 'name', required: true },
    {
      key: 'tier',
      labelKey: 'sponsorTier',
      type: 'choice',
      choices: ['GENERAL', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER'],
    },
    { key: 'url', labelKey: 'url' },
    { key: 'logoPath', labelKey: 'logoPath' },
  ],
  itemTitle: (r) => asString(r.name),
  itemSubtitle: (r) => asString(r.tier),
  buildBody: (v) => ({
    name: v.name.trim(),
    tier: v.tier || 'PARTNER',
    url: opt(v.url),
    logoPath: opt(v.logoPath),
  }),
};

export const trophiesConfig: EntityCrudConfig = {
  endpoint: '/trophies',
  permission: 'trophies.manage',
  titleKey: 'trophies',
  fields: [
    { key: 'name', labelKey: 'name', required: true },
    { key: 'year', labelKey: 'year', type: 'number', required: true },
    { key: 'competition', labelKey: 'competitionName' },
    { key: 'description', labelKey: 'description', type: 'multiline' },
    { key: 'imagePath', labelKey: 'imagePath' },
  ],
  itemTitle: (r) => asString(r.name),
  itemSubtitle: (r) => String(r.year ?? ''),
  buildBody: (v) => ({
    name: v.name.trim(),
    year: num(v.year) ?? new Date().getFullYear(),
    competition: opt(v.competition),
    description: opt(v.description),
    imagePath: opt(v.imagePath),
  }),
};

export const timelineConfig: EntityCrudConfig = {
  endpoint: '/club-timeline',
  permission: 'club-timeline.manage',
  titleKey: 'timeline',
  fields: [
    { key: 'year', labelKey: 'year', type: 'number', required: true },
    { key: 'title', labelKey: 'title', required: true },
    { key: 'description', labelKey: 'description', type: 'multiline' },
    { key: 'imagePath', labelKey: 'imagePath' },
  ],
  itemTitle: (r) => asString(r.title),
  itemSubtitle: (r) => String(r.year ?? ''),
  buildBody: (v) => ({
    year: num(v.year) ?? new Date().getFullYear(),
    title: v.title.trim(),
    description: opt(v.description),
    imagePath: opt(v.imagePath),
  }),
};

export const hallOfFameConfig: EntityCrudConfig = {
  endpoint: '/hall-of-fame',
  permission: 'hall-of-fame.manage',
  titleKey: 'hallOfFame',
  fields: [
    { key: 'name', labelKey: 'name', required: true },
    { key: 'role', labelKey: 'role', required: true },
    { key: 'years', labelKey: 'years' },
    { key: 'bio', labelKey: 'bio', type: 'multiline' },
    { key: 'imagePath', labelKey: 'imagePath' },
  ],
  itemTitle: (r) => asString(r.name),
  itemSubtitle: (r) => asString(r.role),
  buildBody: (v) => ({
    name: v.name.trim(),
    role: v.role.trim(),
    years: opt(v.years),
    bio: opt(v.bio),
    imagePath: opt(v.imagePath),
  }),
};

export const museumConfig: EntityCrudConfig = {
  endpoint: '/museum',
  permission: 'museum.manage',
  titleKey: 'museum',
  fields: [
    { key: 'title', labelKey: 'title', required: true },
    {
      key: 'category',
      labelKey: 'category',
      type: 'choice',
      required: true,
      choices: ['artifact', 'photo', 'jersey', 'trophy', 'document', 'other'],
    },
    { key: 'year', labelKey: 'year', type: 'number' },
    { key: 'description', labelKey: 'description', type: 'multiline' },
    { key: 'imagePath', labelKey: 'imagePath' },
  ],
  itemTitle: (r) => asString(r.title),
  itemSubtitle: (r) => asString(r.category),
  buildBody: (v) => ({
    title: v.title.trim(),
    category: v.category || 'other',
    year: num(v.year),
    description: opt(v.description),
    imagePath: opt(v.imagePath),
  }),
};

export const clubsConfig: EntityCrudConfig = {
  endpoint: '/clubs',
  permission: 'clubs.manage',
  titleKey: 'clubs',
  fields: [
    { key: 'name', labelKey: 'name', required: true },
    { key: 'city', labelKey: 'city' },
    { key: 'stadium', labelKey: 'venue' },
    { key: 'description', labelKey: 'description', type: 'multiline' },
    { key: 'crestPath', labelKey: 'crestPath' },
  ],
  itemTitle: (r) => asString(r.name),
  itemSubtitle: (r) => asString(r.city),
  buildBody: (v) => ({
    name: v.name.trim(),
    city: opt(v.city),
    stadium: opt(v.stadium),
    description: opt(v.description),
    crestPath: opt(v.crestPath),
  }),
};
