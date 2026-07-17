import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenEmpty } from '../ScreenEmpty';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { Match } from '../../types/api';
import { HomeMatchCard } from './HomeMatchCard';
import { HomeSectionTitle } from './HomeSectionTitle';
import { homeInset, homeSurface } from './home-surface';

type Props = {
  featured: Match | null;
  lastResult: Match | null;
  onOpenMatch: (id: string) => void;
};

export function HomeMatchWidget({ featured, lastResult, onOpenMatch }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (!featured) {
    return (
      <View>
        <HomeSectionTitle title={t('nextMatch')} />
        <ScreenEmpty message={t('noMatches')} icon="football-outline" compact />
      </View>
    );
  }

  const lastHome = lastResult?.homeClub.shortName ?? lastResult?.homeClub.name ?? '';
  const lastAway = lastResult?.awayClub.shortName ?? lastResult?.awayClub.name ?? '';
  const lastLabel = lastResult
    ? `${lastHome} ${lastResult.homeScore} : ${lastResult.awayScore} ${lastAway}`
    : '';

  return (
    <View>
      <HomeSectionTitle title={t('nextMatch')} />
      <View style={[homeSurface(colors, false), styles.block]}>
        <HomeMatchCard match={featured} onPress={() => onOpenMatch(featured.id)} />
        {lastResult ? (
          <>
            <View style={[styles.divider, { backgroundColor: colors.surface }]} />
            <Text style={[styles.lastTitle, { color: colors.textMuted }]}>{t('homeLastMatch')}</Text>
            <Pressable
              style={({ pressed }) => [
                homeInset(colors),
                styles.lastRow,
                { opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => onOpenMatch(lastResult.id)}
              accessibilityRole="button"
              accessibilityLabel={lastLabel}
            >
              <Text style={[styles.lastTeams, { color: colors.text }]} numberOfLines={1}>
                {lastHome}
              </Text>
              <Text style={[styles.lastScore, { color: colors.primary }]}>
                {lastResult.homeScore} : {lastResult.awayScore}
              </Text>
              <Text style={[styles.lastTeams, { color: colors.text }]} numberOfLines={1}>
                {lastAway}
              </Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: spacing.sm },
  divider: { height: 1, marginVertical: spacing.md },
  lastTitle: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  lastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  lastTeams: { ...typography.body, flex: 1, fontWeight: '600' },
  lastScore: { ...typography.heading, minWidth: 64, textAlign: 'center' },
});
