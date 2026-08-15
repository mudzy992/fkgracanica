import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ClubInfoSection } from '../../src/components/club/ClubInfoSection';
import { ClubPublicHero } from '../../src/components/club/ClubPublicHero';
import { loadClubPublic, type ClubPublicData } from '../../src/components/club/load-club-public';
import { ListSkeleton } from '../../src/components/ListSkeleton';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { TeamFormationPitch } from '../../src/components/team/TeamFormationPitch';
import { TeamRoster } from '../../src/components/team/TeamRoster';
import { TeamSeasonSummary } from '../../src/components/team/TeamSeasonSummary';
import { TeamSpotlight } from '../../src/components/team/TeamSpotlight';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';

export default function ClubPublicScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { slug: raw } = useLocalSearchParams<{ slug: string | string[] }>();
  const slug = Array.isArray(raw) ? raw[0] : raw;
  const [data, setData] = useState<ClubPublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const load = useCallback(async () => {
    if (!slug) {
      setData(null);
      setError(t('clubNotFound'));
      return;
    }
    try {
      setError(null);
      const next = await loadClubPublic(slug);
      if (next.isOwnClub) {
        setRedirecting(true);
        router.replace('/team');
        return;
      }
      setData(next);
    } catch {
      setData(null);
      setError(t('clubNotFound'));
    }
  }, [slug, t, router]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading || redirecting) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.surface }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ListSkeleton />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.surface }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenEmpty
          message={error ?? t('clubNotFound')}
          icon="alert-circle-outline"
          actionLabel={t('retry')}
          onAction={() => {
            setLoading(true);
            void load().finally(() => setLoading(false));
          }}
        />
      </View>
    );
  }

  const location = [data.city, data.stadiumName].filter(Boolean).join(' · ');
  const hasSquad = data.players.length > 0;
  const hasPitch = data.pitchSlots.some((s) => s.player);

  return (
    <View style={[styles.fill, { backgroundColor: colors.surface }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load().finally(() => setRefreshing(false));
            }}
            tintColor={colors.link}
          />
        }
      >
        <ClubPublicHero
          clubName={data.clubName}
          crestPath={data.crestPath}
          location={location || undefined}
          formation={data.formation}
          playerCount={data.players.length}
          seasonName={data.seasonName}
          points={data.standing?.points}
          starters={data.starters}
          benchCount={data.benchCount}
        />
        <View style={styles.sections}>
          {data.stadium ? <ClubInfoSection stadium={data.stadium} /> : null}
          {hasPitch ? (
            <TeamFormationPitch formation={data.formation} slots={data.pitchSlots} />
          ) : null}
          {hasSquad ? (
            <>
              <TeamSpotlight players={data.spotlight} />
              <TeamRoster players={data.players} />
            </>
          ) : (
            <Text style={[styles.empty, { color: colors.textMuted }]}>{t('clubEmptyRoster')}</Text>
          )}
          <TeamSeasonSummary
            seasonName={data.seasonName}
            standing={data.standing}
            totals={data.totals}
            players={data.players}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: spacing.xl, flexGrow: 1 },
  sections: { gap: spacing.xl, marginTop: spacing.md },
  empty: { ...typography.body, textAlign: 'center', paddingHorizontal: spacing.md },
});
