import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { HomeFadeSection } from '../../src/components/home/HomeFadeSection';
import { HomeFeaturedPlayers } from '../../src/components/home/HomeFeaturedPlayers';
import { HomeGalleryPreview } from '../../src/components/home/HomeGalleryPreview';
import { HomeHeritageCta } from '../../src/components/home/HomeHeritageCta';
import { HomeHeroBlock } from '../../src/components/home/HomeHeroBlock';
import { HomeLeagueSnippet } from '../../src/components/home/HomeLeagueSnippet';
import { HomeMatchWidget } from '../../src/components/home/HomeMatchWidget';
import { HomeMembershipBand } from '../../src/components/home/HomeMembershipBand';
import { HomeNewsSection } from '../../src/components/home/HomeNewsSection';
import { HomeSectionShell } from '../../src/components/home/HomeSectionShell';
import { HomeSkeleton } from '../../src/components/home/HomeSkeleton';
import { HomeSponsorsStrip } from '../../src/components/home/HomeSponsorsStrip';
import { HomeTrophiesStrip } from '../../src/components/home/HomeTrophiesStrip';
import { useHomeScreenData } from '../../src/components/home/use-home-screen-data';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { useModuleFlags } from '../../src/hooks/use-module-flags';
import { useAuth } from '../../src/lib/auth';
import { useTheme } from '../../src/lib/theme-context';
import { spacing } from '../../src/lib/theme';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { isEnabled, loading: flagsLoading } = useModuleFlags();
  const {
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
  } = useHomeScreenData();

  if (loading) return <HomeSkeleton />;
  if (error) {
    return (
      <ScreenEmpty
        message={error}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={retry}
      />
    );
  }

  const openMatch = (id: string) => router.push(`/live/${id}`);
  const showMembership = isEnabled('feature.membership');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} tintColor={colors.primary} onRefresh={refresh} />
      }
    >
      <HomeFadeSection>
        <HomeHeroBlock
          user={user}
          clubName={clubName}
          crestUrl={crestUrl}
          hero={hero}
          showMembership={showMembership}
          showTickets={isEnabled('modules.ticketing')}
          ctasLoading={flagsLoading}
        />
      </HomeFadeSection>

      {featuredMatch ? (
        <HomeFadeSection delay={60}>
          <View style={styles.padded}>
            <HomeSectionShell topGap="compact">
              <HomeMatchWidget featured={featuredMatch} lastResult={lastResult} onOpenMatch={openMatch} />
            </HomeSectionShell>
          </View>
        </HomeFadeSection>
      ) : null}

      <HomeFadeSection delay={120}>
        <View style={styles.padded}>
          <HomeSectionShell>
            <HomeNewsSection items={news} />
          </HomeSectionShell>
        </View>
      </HomeFadeSection>

      {extras.timeline.length > 0 ? (
        <HomeFadeSection delay={160}>
          <View style={styles.padded}>
            <HomeSectionShell>
              <HomeHeritageCta items={extras.timeline} span={extras.timelineSpan} />
            </HomeSectionShell>
          </View>
        </HomeFadeSection>
      ) : null}

      <HomeFadeSection delay={200}>
        <View style={styles.padded}>
          <HomeSectionShell>
            <HomeFeaturedPlayers players={extras.players} />
          </HomeSectionShell>
        </View>
      </HomeFadeSection>

      <HomeFadeSection delay={240}>
        <View style={styles.padded}>
          <HomeSectionShell>
            <HomeLeagueSnippet rows={extras.leagueRows} />
          </HomeSectionShell>
        </View>
      </HomeFadeSection>

      <HomeFadeSection delay={280}>
        <HomeSectionShell variant="gallery">
          <HomeGalleryPreview items={extras.gallery} />
        </HomeSectionShell>
      </HomeFadeSection>

      {showMembership ? (
        <HomeFadeSection delay={320}>
          <View style={styles.padded}>
            <HomeSectionShell>
              <HomeMembershipBand />
            </HomeSectionShell>
          </View>
        </HomeFadeSection>
      ) : null}

      <HomeFadeSection delay={360}>
        <View style={styles.padded}>
          <HomeSectionShell>
            <HomeTrophiesStrip items={extras.trophies} />
          </HomeSectionShell>
        </View>
      </HomeFadeSection>

      <HomeFadeSection delay={400}>
        <HomeSectionShell variant="sponsors">
          <HomeSponsorsStrip items={extras.sponsors} />
        </HomeSectionShell>
      </HomeFadeSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  padded: { paddingHorizontal: spacing.md },
});
