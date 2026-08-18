import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { LeagueHero } from '../src/components/league/LeagueHero';
import { LeagueLeadersSection } from '../src/components/league/LeagueLeadersSection';
import { LeagueMatchesSection } from '../src/components/league/LeagueMatchesSection';
import { LeagueRoundChips } from '../src/components/league/LeagueRoundChips';
import { LeagueSeasonChips } from '../src/components/league/LeagueSeasonChips';
import { LeagueStandingsList } from '../src/components/league/LeagueStandingsList';
import {
  loadLeagueScreen,
  type LeagueScreenData,
} from '../src/components/league/load-league-screen';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { useTheme } from '../src/lib/theme-context';
import { spacing } from '../src/lib/theme';

const emptyData: LeagueScreenData = {
  seasons: [],
  seasonId: '',
  seasonName: '',
  rounds: [],
  standings: [],
  matches: [],
  scorers: [],
  assists: [],
  teamCount: 0,
  roundsPlayed: 0,
};

export default function LeagueScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<LeagueScreenData>(emptyData);
  const [seasonId, setSeasonId] = useState<string | undefined>();
  const [upToRound, setUpToRound] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id?: string, round?: number | null) => {
    try {
      setError(null);
      const next = await loadLeagueScreen(id, round);
      setData(next);
      setSeasonId(next.seasonId || undefined);
    } catch {
      setData(emptyData);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void load(seasonId, upToRound).finally(() => setLoading(false));
  }, []);

  const handleSeasonChange = (id: string) => {
    setSeasonId(id);
    setUpToRound(null);
    setRefreshing(true);
    void load(id, null).finally(() => setRefreshing(false));
  };

  const handleRoundChange = (round: number | null) => {
    setUpToRound(round);
    setRefreshing(true);
    void load(seasonId, round).finally(() => setRefreshing(false));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    void load(seasonId, upToRound).finally(() => setRefreshing(false));
  };

  if (loading) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.surface }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ListSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.surface }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenEmpty
          message={error}
          icon="alert-circle-outline"
          actionLabel={t('retry')}
          onAction={() => {
            setLoading(true);
            void load(seasonId, upToRound).finally(() => setLoading(false));
          }}
        />
      </View>
    );
  }

  const tableTitle =
    upToRound != null ? t('leagueTableUpToTitle', { round: upToRound }) : t('leagueTableAllTitle');

  return (
    <View style={[styles.fill, { backgroundColor: colors.surface }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.link} />
        }
      >
        <LeagueHero
          seasonName={data.seasonName}
          teamCount={data.teamCount}
          roundsPlayed={data.roundsPlayed}
          leaderName={data.leaderName}
          leaderPoints={data.leaderPoints}
          leaderCrestPath={data.leaderCrestPath}
        />
        <View style={styles.filters}>
          <LeagueSeasonChips
            seasons={data.seasons}
            seasonId={data.seasonId}
            onChange={handleSeasonChange}
          />
          <LeagueRoundChips
            rounds={data.rounds}
            upToRound={upToRound}
            onChange={handleRoundChange}
          />
        </View>
        <View style={styles.sections}>
          <LeagueStandingsList rows={data.standings} title={tableTitle} />
          <LeagueMatchesSection matches={data.matches} locale={i18n.language} />
          <LeagueLeadersSection scorers={data.scorers} assists={data.assists} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: spacing.xl, flexGrow: 1 },
  filters: { gap: spacing.sm, marginTop: spacing.md },
  sections: { gap: spacing.xl, marginTop: spacing.lg },
});
