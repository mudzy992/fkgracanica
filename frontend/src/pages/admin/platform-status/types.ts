import type { ShowcaseBadge, ShowcaseModule } from '../../showcase/types';

export type PlatformStatusPayload = {
  overallPercent: number;
  counted: number;
  afterLaunch: number;
  counts: Record<ShowcaseBadge, number>;
  modules: ShowcaseModule[];
};
