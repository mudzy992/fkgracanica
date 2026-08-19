import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatMatchDayLabel, formatMatchTime } from '../home/format-match-display';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

export type MatchScoreRowProps = {
  homeName: string;
  awayName: string;
  homeCrestPath?: string;
  awayCrestPath?: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  minute?: number | string;
  scheduledAt?: string;
  locale: string;
  featured?: boolean;
  metaLine?: string;
  hasStream?: boolean;
  onPress: () => void;
};

export function MatchScoreRow({
  homeName,
  awayName,
  homeCrestPath,
  awayCrestPath,
  status,
  homeScore,
  awayScore,
  minute,
  scheduledAt,
  locale,
  featured,
  metaLine,
  hasStream,
  onPress,
}: MatchScoreRowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const live = status === 'LIVE' || status === 'HALFTIME';
  const showScore = live || status === 'FINISHED';
  const day = scheduledAt ? formatMatchDayLabel(scheduledAt, locale) : '';
  const time = scheduledAt ? formatMatchTime(scheduledAt) : '';
  const scoreSize = featured ? 28 : 18;
  const minuteLabel = typeof minute === 'number' ? `${minute}'` : minute;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        featured && styles.featured,
        { backgroundColor: colors.background, borderColor: live ? colors.danger : colors.border },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${homeName} vs ${awayName}`}
    >
      {live ? (
        <Text style={[styles.live, { color: colors.danger }]}>
          {status === 'HALFTIME' ? t('matchHalftime') : t('matchLive')}
          {minuteLabel != null && minuteLabel !== '' ? ` · ${minuteLabel}` : ''}
          {hasStream ? ` · ${t('matchStream')}` : ''}
        </Text>
      ) : null}
      <View style={styles.teams}>
        <Side name={homeName} crestPath={homeCrestPath} align="right" />
        <View style={styles.center}>
          {showScore ? (
            <Text style={[styles.score, { color: colors.white, fontSize: scoreSize }]}>
              {homeScore ?? 0} – {awayScore ?? 0}
            </Text>
          ) : (
            <Text style={[styles.kickoff, { color: colors.textMuted }]}>
              {day}{day && time ? '\n' : ''}{time}
            </Text>
          )}
        </View>
        <Side name={awayName} crestPath={awayCrestPath} align="left" />
      </View>
      {metaLine ? (
        <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
          {metaLine}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Side({
  name,
  crestPath,
  align,
}: {
  name: string;
  crestPath?: string;
  align: 'left' | 'right';
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.side]}>
      <RemoteImage path={crestPath} variant="thumb" transparent style={styles.crest} />
      <Text
        style={[styles.name, { color: colors.text, textAlign: align }]}
        numberOfLines={2}
      >
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderRadius: 16, borderWidth: 1, padding: spacing.md, gap: spacing.xs },
  featured: { paddingVertical: spacing.lg },
  live: {
    ...typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  teams: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  side: { flex: 1, alignItems: 'center', gap: 6 },
  crest: { width: 36, height: 36 },
  name: { ...typography.caption, fontWeight: '700', fontSize: 12 },
  center: { minWidth: 72, alignItems: 'center' },
  score: { fontWeight: '800', letterSpacing: 0.5 },
  kickoff: { ...typography.caption, fontWeight: '700', textAlign: 'center' },
  meta: { ...typography.caption, textAlign: 'center', marginTop: 4 },
});
