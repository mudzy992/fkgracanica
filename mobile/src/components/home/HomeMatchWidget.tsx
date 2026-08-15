import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { ScreenEmpty } from '../ScreenEmpty';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { Match } from '../../types/api';
import { HomeMatchCard } from './HomeMatchCard';
import { homeInset, homeSurface } from './home-surface';
import { isMatchLive } from './pick-home-matches';

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
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {t('nextMatch')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('homeMatchSubtitle')}</Text>
        </View>
        <ScreenEmpty message={t('noMatches')} icon="football-outline" compact />
      </View>
    );
  }

  const live = isMatchLive(featured);
  const lastHome = lastResult?.homeClub.shortName ?? lastResult?.homeClub.name ?? '';
  const lastAway = lastResult?.awayClub.shortName ?? lastResult?.awayClub.name ?? '';
  const lastLabel = lastResult
    ? `${lastHome} ${lastResult.homeScore} : ${lastResult.awayScore} ${lastAway}`
    : '';

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          {t('nextMatch')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('homeMatchSubtitle')}</Text>
      </View>

      <View style={[homeSurface(colors, live), styles.block]}>
        <View style={[styles.accent, { backgroundColor: live ? colors.danger : colors.primary }]} />
        <HomeMatchCard match={featured} onPress={() => onOpenMatch(featured.id)} />

        {lastResult ? (
          <Pressable
            style={({ pressed }) => [
              homeInset(colors),
              styles.lastStrip,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => onOpenMatch(lastResult.id)}
            accessibilityRole="button"
            accessibilityLabel={lastLabel}
          >
            <View style={styles.lastCopy}>
              <Text style={[styles.lastKicker, { color: colors.textMuted }]}>{t('homeLastMatch')}</Text>
              <View style={styles.lastTeams}>
                <RemoteImage
                  path={lastResult.homeClub.crestPath}
                  variant="thumb"
                  style={styles.lastCrest}
                />
                <Text style={[styles.lastScore, { color: colors.text }]}>
                  {lastResult.homeScore} : {lastResult.awayScore}
                </Text>
                <RemoteImage
                  path={lastResult.awayClub.crestPath}
                  variant="thumb"
                  style={styles.lastCrest}
                />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.sm },
  title: { ...typography.heading, fontWeight: '800' },
  subtitle: { ...typography.caption, marginTop: 2 },
  block: { overflow: 'hidden', position: 'relative' },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  lastStrip: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
  },
  lastCopy: { flex: 1, gap: 4 },
  lastKicker: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  lastTeams: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  lastCrest: { width: 22, height: 22, borderRadius: 6 },
  lastScore: { ...typography.heading, fontWeight: '800', minWidth: 56, textAlign: 'center' },
});
