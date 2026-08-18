import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { formatMatchDayLabel, formatMatchTime } from '../home/format-match-display';
import type { LeagueMatchItem } from './load-league-screen';

type Props = { matches: LeagueMatchItem[]; locale: string };

function pickNext(matches: LeagueMatchItem[]): LeagueMatchItem | undefined {
  const upcoming = matches
    .filter((m) => m.status === 'SCHEDULED' || m.status === 'POSTPONED')
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  return upcoming[0];
}

function pickLive(matches: LeagueMatchItem[]): LeagueMatchItem[] {
  return matches.filter((m) => m.status === 'LIVE' || m.status === 'HALFTIME');
}

function pickRecent(matches: LeagueMatchItem[]): LeagueMatchItem[] {
  return matches
    .filter((m) => m.status === 'FINISHED')
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
    .slice(0, 8);
}

export function LeagueMatchesSection({ matches, locale }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const next = pickNext(matches);
  const live = pickLive(matches);
  const recent = pickRecent(matches);

  if (!next && live.length === 0 && recent.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {live.length > 0 ? (
        <View style={styles.block}>
          <Text style={[styles.title, { color: colors.text }]}>{t('leagueLiveMatches')}</Text>
          <View style={styles.list}>
            {live.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                locale={locale}
                onPress={() => router.push(`/live/${match.id}`)}
              />
            ))}
          </View>
        </View>
      ) : null}
      {next ? (
        <View style={styles.block}>
          <Text style={[styles.title, { color: colors.text }]}>{t('leagueNextMatch')}</Text>
          <MatchRow match={next} locale={locale} onPress={() => router.push(`/live/${next.id}`)} />
        </View>
      ) : null}
      {recent.length > 0 ? (
        <View style={styles.block}>
          <Text style={[styles.title, { color: colors.text }]}>{t('leagueRecentMatches')}</Text>
          <View style={styles.list}>
            {recent.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                locale={locale}
                onPress={() => router.push(`/live/${match.id}`)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function MatchRow({
  match,
  locale,
  onPress,
}: {
  match: LeagueMatchItem;
  locale: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const live = match.status === 'LIVE' || match.status === 'HALFTIME';
  const day = match.scheduledAt ? formatMatchDayLabel(match.scheduledAt, locale) : '';
  const time = match.scheduledAt ? formatMatchTime(match.scheduledAt) : '';

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.background, borderColor: colors.border }]}
      accessibilityRole="button"
      accessibilityLabel={`${match.homeName} vs ${match.awayName}`}
    >
      <View style={styles.teams}>
        <Text style={[styles.names, { color: colors.text }]} numberOfLines={1}>
          {match.homeName} vs {match.awayName}
        </Text>
        <Text style={[styles.meta, { color: live ? colors.danger : colors.textMuted }]}>
          {live || match.status === 'FINISHED' ? match.meta : `${day} · ${time}`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, gap: spacing.lg },
  block: { gap: spacing.sm },
  title: { ...typography.heading, fontSize: 20, fontWeight: '800' },
  list: { gap: spacing.sm },
  row: { borderRadius: 14, borderWidth: 1, padding: spacing.md },
  teams: { gap: 4 },
  names: { ...typography.body, fontWeight: '700' },
  meta: { ...typography.caption, fontWeight: '600' },
});
