import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { HomeFadeSection } from '../../src/components/home/HomeFadeSection';
import { HomeFeaturedPlayers } from '../../src/components/home/HomeFeaturedPlayers';
import { HomeGalleryPreview } from '../../src/components/home/HomeGalleryPreview';
import { HomeHero } from '../../src/components/home/HomeHero';
import { HomeLeagueSnippet } from '../../src/components/home/HomeLeagueSnippet';
import { HomeMatchWidget } from '../../src/components/home/HomeMatchWidget';
import { HomeMembershipBand } from '../../src/components/home/HomeMembershipBand';
import { HomeModuleCtas } from '../../src/components/home/HomeModuleCtas';
import { HomeNewsSection } from '../../src/components/home/HomeNewsSection';
import { HomeSponsorsStrip } from '../../src/components/home/HomeSponsorsStrip';
import { HomeTrophiesStrip } from '../../src/components/home/HomeTrophiesStrip';
import { emptyExtras, loadHomeExtras, type HomeExtras } from '../../src/components/home/load-home-extras';
import { pickHeroConfig, type HomeHeroConfig } from '../../src/components/home/pick-hero-config';
import { pickFeaturedMatch, pickLastResult } from '../../src/components/home/pick-home-matches';
import { ListSkeleton } from '../../src/components/ListSkeleton';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { useModuleFlags } from '../../src/hooks/use-module-flags';
import { api } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth';
import { useTheme } from '../../src/lib/theme-context';
import { spacing } from '../../src/lib/theme';
import type { CmsPage, Match, NewsItem } from '../../src/types/api';

type PublicSettings = Record<string, string>;

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { isEnabled, loading: flagsLoading } = useModuleFlags();
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

  if (loading) return <ListSkeleton rows={4} />;
  if (error) {
    return (
      <ScreenEmpty
        message={error}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void loadData().finally(() => setLoading(false));
        }}
      />
    );
  }

  const openMatch = (id: string) => router.push(`/(tabs)/live/${id}`);
  const showMembership = isEnabled('feature.membership');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={colors.primary}
          onRefresh={() => {
            setRefreshing(true);
            void loadData().finally(() => setRefreshing(false));
          }}
        />
      }
    >
      <HomeFadeSection>
        <HomeHero user={user} clubName={clubName} crestUrl={crestUrl} hero={hero} />
        {!flagsLoading ? (
          <View style={styles.padded}>
            <HomeModuleCtas showMembership={showMembership} showTickets={isEnabled('modules.ticketing')} />
          </View>
        ) : null}
      </HomeFadeSection>

      <HomeFadeSection delay={60}>
        <View style={styles.padded}>
          <HomeMatchWidget featured={featuredMatch} lastResult={lastResult} onOpenMatch={openMatch} />
        </View>
      </HomeFadeSection>

      <HomeFadeSection delay={120}>
        <View style={styles.padded}>
          <HomeNewsSection items={news} />
        </View>
      </HomeFadeSection>

      <HomeFadeSection delay={160}>
        <View style={styles.padded}>
          <HomeFeaturedPlayers players={extras.players} />
        </View>
      </HomeFadeSection>

      <HomeFadeSection delay={200}>
        <View style={styles.padded}>
          <HomeLeagueSnippet rows={extras.leagueRows} />
        </View>
      </HomeFadeSection>

      <HomeFadeSection delay={240}>
        <View style={styles.padded}>
          <HomeGalleryPreview items={extras.gallery} />
        </View>
      </HomeFadeSection>

      {showMembership ? (
        <HomeFadeSection delay={280}>
          <View style={styles.padded}>
            <HomeMembershipBand />
          </View>
        </HomeFadeSection>
      ) : null}

      <HomeFadeSection delay={320}>
        <View style={styles.padded}>
          <HomeTrophiesStrip items={extras.trophies} />
        </View>
      </HomeFadeSection>

      <HomeFadeSection delay={360}>
        <View style={styles.padded}>
          <HomeSponsorsStrip items={extras.sponsors} />
        </View>
      </HomeFadeSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  padded: { paddingHorizontal: spacing.md },
});
