import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { MatchScoreRow } from '../live/MatchScoreRow';
import type { LeagueMatchItem } from './load-league-screen';

type Props = { matches: LeagueMatchItem[]; locale: string };

function pickNext(matches: LeagueMatchItem[]): LeagueMatchItem | undefined {
  return matches
    .filter((m) => m.status === 'SCHEDULED' || m.status === 'POSTPONED')
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
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

  const open = (id: string) => router.push(`/live/${id}`);

  return (
    <View style={styles.wrap}>
      {live.length > 0 ? (
        <View style={styles.block}>
          <Text style={[styles.title, { color: colors.text }]}>{t('leagueLiveMatches')}</Text>
          <View style={styles.list}>
            {live.map((match, index) => (
              <Row key={match.id} match={match} locale={locale} featured={index === 0} onPress={open} />
            ))}
          </View>
        </View>
      ) : null}
      {next ? (
        <View style={styles.block}>
          <Text style={[styles.title, { color: colors.text }]}>{t('leagueNextMatch')}</Text>
          <Row match={next} locale={locale} onPress={open} />
        </View>
      ) : null}
      {recent.length > 0 ? (
        <View style={styles.block}>
          <Text style={[styles.title, { color: colors.text }]}>{t('leagueRecentMatches')}</Text>
          <View style={styles.list}>
            {recent.map((match) => (
              <Row key={match.id} match={match} locale={locale} onPress={open} />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Row({
  match,
  locale,
  featured,
  onPress,
}: {
  match: LeagueMatchItem;
  locale: string;
  featured?: boolean;
  onPress: (id: string) => void;
}) {
  return (
    <MatchScoreRow
      homeName={match.homeName}
      awayName={match.awayName}
      homeCrestPath={match.homeCrestPath}
      awayCrestPath={match.awayCrestPath}
      status={match.status}
      homeScore={match.homeScore}
      awayScore={match.awayScore}
      minute={match.minute}
      scheduledAt={match.scheduledAt}
      locale={locale}
      featured={featured}
      onPress={() => onPress(match.id)}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, gap: spacing.lg },
  block: { gap: spacing.sm },
  title: { ...typography.heading, fontSize: 20, fontWeight: '800' },
  list: { gap: spacing.sm },
});
