import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import type { CmsPage, Match, NewsItem } from '../../types/api';
import { emptyExtras, loadHomeExtras, type HomeExtras } from './load-home-extras';
import { pickHeroConfig, type HomeHeroConfig } from './pick-hero-config';
import { pickFeaturedMatch, pickLastResult } from './pick-home-matches';

type PublicSettings = Record<string, string>;

export function useHomeScreenData() {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [lastResult, setLastResult] = useState<Match | null>(null);
  const [clubName, setClubName] = useState('');
  const [crestUrl, setCrestUrl] = useState<string | null>(null);
  const [hero, setHero] = useState<HomeHeroConfig | null>(null);
  const [extras, setExtras] = useState<HomeExtras>(emptyExtras);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [newsRes, matchesRes, settingsRes, cmsPage, homeExtras] = await Promise.all([
        api.get<NewsItem[]>('/news/published'),
        api.get<Match[]>('/matches'),
        api.get<PublicSettings>('/settings/public').catch(() => ({ data: {} as PublicSettings })),
        api.get<CmsPage>('/cms/pages/home').then((res) => res.data).catch(() => null),
        loadHomeExtras(),
      ]);
      const matches = matchesRes.data;
      setNews(newsRes.data.slice(0, 3));
      setFeaturedMatch(pickFeaturedMatch(matches));
      setLastResult(pickLastResult(matches));
      const pub = settingsRes.data;
      setClubName(pub['club.name'] ?? '');
      setCrestUrl(pub['club.crestUrl'] ?? null);
      setHero(pickHeroConfig(cmsPage));
      setExtras(homeExtras);
    } catch {
      setNews([]);
      setFeaturedMatch(null);
      setLastResult(null);
      setHero(null);
      setExtras(emptyExtras);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void loadData().finally(() => setLoading(false));
  }, [loadData]);

  const retry = useCallback(() => {
    setLoading(true);
    void loadData().finally(() => setLoading(false));
  }, [loadData]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    void loadData().finally(() => setRefreshing(false));
  }, [loadData]);

  return {
    news,
    featuredMatch,
    lastResult,
    clubName,
    crestUrl,
    hero,
    extras,
    loading,
    refreshing,
    error,
    retry,
    refresh,
  };
}
