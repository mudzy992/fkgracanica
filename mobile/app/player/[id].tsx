import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { PlayerCinematicHero } from '../../src/components/player/PlayerCinematicHero';
import { PlayerStatGrid } from '../../src/components/player/PlayerStatGrid';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { Screen } from '../../src/components/primitives/Screen';
import { api } from '../../src/lib/api';
import { asRecord, asString } from '../../src/lib/content-helpers';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';

function num(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export default function PlayerScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [player, setPlayer] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(false);
      const { data } = await api.get(`/players/${id}/public`);
      setPlayer(asRecord(data));
    } catch {
      setPlayer(null);
      setError(true);
    }
  }, [id]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenLoading />
      </>
    );
  }

  if (error || !player) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenEmpty
          message={t('playerNotFound')}
          icon="alert-circle-outline"
          actionLabel={t('retry')}
          onAction={() => {
            setLoading(true);
            void load().finally(() => setLoading(false));
          }}
        />
      </>
    );
  }

  const season = asRecord(player.season);
  const seasonStats = asRecord(player.seasonStats);
  const career = asRecord(player.careerTotals);
  const firstName = asString(player.firstName) || asString(player.name, '—');
  const lastName = asString(player.lastName);
  const rawNumber = Number(player.number ?? player.shirtNumber);
  const seasonCells = [
    { label: t('playerAppearances'), value: num(seasonStats.appearances) },
    { label: t('playerGoals'), value: num(seasonStats.goals), highlight: true },
    { label: t('playerAssists'), value: num(seasonStats.assists) },
    { label: t('playerMinutes'), value: num(seasonStats.minutes) },
    { label: t('playerYellow'), value: num(seasonStats.yellowCards) },
    { label: t('playerRed'), value: num(seasonStats.redCards) },
  ];
  const careerCells = [
    { label: t('playerAppearances'), value: num(career.appearances) },
    { label: t('playerGoals'), value: num(career.goals), highlight: true },
    { label: t('playerAssists'), value: num(career.assists) },
    { label: t('playerMinutes'), value: num(career.minutes) },
    { label: t('playerYellow'), value: num(career.yellowCards) },
    { label: t('playerRed'), value: num(career.redCards) },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen scroll padded={false} contentStyle={styles.scroll}>
        <PlayerCinematicHero
          firstName={firstName}
          lastName={lastName}
          position={asString(player.position) || undefined}
          number={Number.isFinite(rawNumber) && rawNumber > 0 ? rawNumber : undefined}
          photoPath={asString(player.photoPath) || asString(player.imagePath) || undefined}
          club={
            asString(asRecord(player.club).name)
              ? {
                  name: asString(asRecord(player.club).name),
                  crestPath:
                    asString(asRecord(player.club).crestPath) ||
                    asString(asRecord(player.club).logoPath) ||
                    undefined,
                }
              : undefined
          }
        />
        <View style={styles.body}>
          {asString(player.bio) ? (
            <View style={[styles.bioCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.bioTitle, { color: colors.text }]}>{t('playerAbout')}</Text>
              <Text style={[styles.bio, { color: colors.textMuted }]}>{asString(player.bio)}</Text>
            </View>
          ) : null}
          {asString(season.name) ? (
            <PlayerStatGrid title={t('playerSeason', { name: asString(season.name) })} cells={seasonCells} />
          ) : null}
          <PlayerStatGrid title={t('playerCareer')} cells={careerCells} />
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, gap: spacing.lg },
  bioCard: { borderRadius: 16, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  bioTitle: { ...typography.heading, fontWeight: '800' },
  bio: { ...typography.body, lineHeight: 24 },
});
