import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { formatDateTimeBs } from '../../lib/format-date';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { Match } from '../../types/api';

type Props = { match: Match; onPress: (id: string) => void };

export function LiveMatchRow({ match, onPress }: Props) {
  const { colors } = useTheme();
  const live = match.status === 'LIVE' || match.status === 'HALFTIME';
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
      ]}
      onPress={() => onPress(match.id)}
      accessibilityRole="button"
      accessibilityLabel={`${match.homeClub.name} vs ${match.awayClub.name}`}
    >
      <View style={styles.row}>
        <RemoteImage path={match.homeClub.crestPath} variant="thumb" transparent style={styles.crest} />
        <Text style={[styles.teams, { color: colors.text }]} numberOfLines={2}>
          {match.homeClub.name} vs {match.awayClub.name}
        </Text>
        <RemoteImage path={match.awayClub.crestPath} variant="thumb" transparent style={styles.crest} />
      </View>
      <Text style={[styles.meta, { color: live ? colors.danger : colors.textMuted }]}>
        {live
          ? `${match.homeScore} : ${match.awayScore} · ${match.minute}'`
          : formatDateTimeBs(match.scheduledAt)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 10, padding: spacing.md, borderWidth: 1, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  crest: { width: 28, height: 28 },
  teams: { ...typography.heading, flex: 1 },
  meta: { ...typography.caption, marginTop: spacing.xs },
});
