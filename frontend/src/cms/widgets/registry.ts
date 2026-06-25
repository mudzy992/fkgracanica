import type { ComponentType } from 'react';
import type { WidgetConfigMap, WidgetType } from './schemas';
import { HeroWidget } from './HeroWidget';
import { NewsFeedWidget } from './NewsFeedWidget';
import { GalleryWidget } from './GalleryWidget';
import { SponsorsWidget } from './SponsorsWidget';
import { NextMatchWidget } from './NextMatchWidget';
import { LastResultWidget } from './LastResultWidget';
import { FeaturedPlayersWidget } from './FeaturedPlayersWidget';
import { LeagueTableWidget } from './LeagueTableWidget';
import { MembershipCtaWidget } from './MembershipCtaWidget';
import { TicketsCtaWidget } from './TicketsCtaWidget';
import { TrophiesWidget } from './TrophiesWidget';
import { NewsletterWidget } from './NewsletterWidget';
import { RichTextWidget } from './RichTextWidget';
import { CustomHtmlWidget } from './CustomHtmlWidget';
import { CtaBandWidget } from './CtaBandWidget';

type WidgetComponent = ComponentType<{ config: WidgetConfigMap[WidgetType] }>;

export const widgetRegistry: Partial<Record<WidgetType, WidgetComponent>> = {
  hero: HeroWidget as WidgetComponent,
  'news-feed': NewsFeedWidget as WidgetComponent,
  gallery: GalleryWidget as WidgetComponent,
  sponsors: SponsorsWidget as WidgetComponent,
  'next-match': NextMatchWidget as WidgetComponent,
  'last-result': LastResultWidget as WidgetComponent,
  'featured-players': FeaturedPlayersWidget as WidgetComponent,
  'league-table': LeagueTableWidget as WidgetComponent,
  'membership-cta': MembershipCtaWidget as WidgetComponent,
  'tickets-cta': TicketsCtaWidget as WidgetComponent,
  trophies: TrophiesWidget as WidgetComponent,
  newsletter: NewsletterWidget as WidgetComponent,
  'rich-text': RichTextWidget as WidgetComponent,
  'custom-html': CustomHtmlWidget as WidgetComponent,
  'cta-band': CtaBandWidget as WidgetComponent,
};
