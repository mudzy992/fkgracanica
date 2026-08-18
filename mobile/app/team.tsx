import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { TeamFormationPitch } from '../src/components/team/TeamFormationPitch';
import { TeamHero } from '../src/components/team/TeamHero';
import { TeamRoster } from '../src/components/team/TeamRoster';
import { TeamSeasonStatsBlock } from '../src/components/team/TeamSeasonStatsBlock';
import { TeamSpotlight } from '../src/components/team/TeamSpotlight';
import { loadTeamScreen, type TeamScreenData } from '../src/components/team/load-team-screen';
import { useTheme } from '../src/lib/theme-context';
import { spacing } from '../src/lib/theme';

export default function TeamScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [data, setData] = useState<TeamScreenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await loadTeamScreen());
    } catch {
      setData(null);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) {
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
          message={error ?? t('error')}
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
        <TeamHero
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
          <TeamFormationPitch formation={data.formation} slots={data.pitchSlots} />
          <TeamSpotlight players={data.spotlight} />
          <TeamRoster players={data.players} />
          {data.clubId ? <TeamSeasonStatsBlock clubId={data.clubId} /> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: spacing.xl, flexGrow: 1 },
  sections: { gap: spacing.xl, marginTop: spacing.md },
});
