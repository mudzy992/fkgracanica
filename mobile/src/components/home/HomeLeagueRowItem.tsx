import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomeLeagueRow } from './load-home-extras';
import { HomeLeagueFormDots } from './HomeLeagueFormDots';

const PODIUM = ['#EAB308', '#94A3B8', '#B45309'] as const;

type Props = { row: HomeLeagueRow };

function formatGd(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

export function HomeLeagueRowItem({ row }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const highlight = row.isHighlight ?? row.isOwn;
  const podium = row.position >= 1 && row.position <= 3 ? PODIUM[row.position - 1] : null;
  const posBg = podium ?? (highlight ? colors.primary : colors.surface);
  const posFg = podium || highlight ? colors.white : colors.textMuted;
  const canOpen = row.isOwn || Boolean(row.slug);

  const handlePress = () => {
    if (row.isOwn) {
      router.push('/team');
      return;
    }
    if (row.slug) router.push(`/clubs/${row.slug}`);
  };

  return (
    <Pressable
      style={[
        styles.row,
        {
          backgroundColor: highlight ? `${colors.primary}14` : colors.surface,
          borderColor: highlight ? `${colors.primary}33` : 'transparent',
        },
      ]}
      onPress={canOpen ? handlePress : undefined}
      disabled={!canOpen}
      accessibilityRole="button"
      accessibilityLabel={`${row.position}. ${row.clubName}, ${row.points}`}
    >
      <View style={[styles.posBadge, { backgroundColor: posBg }]}>
        <Text style={[styles.posText, { color: posFg }]}>{row.position}</Text>
      </View>
      <View style={[styles.crestShell, { backgroundColor: colors.background }]}>
        {row.crestPath ? (
          <RemoteImage path={row.crestPath} variant="thumb" style={styles.crest} />
        ) : (
          <Text style={[styles.crestFallback, { color: colors.textMuted }]}>
            {row.clubName.slice(0, 1)}
          </Text>
        )}
      </View>
      <View style={styles.clubBlock}>
        <Text style={[styles.clubName, { color: colors.text }]} numberOfLines={1}>
          {row.clubName}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {row.played} · {t('homeGdShort')} {formatGd(row.goalDifference)}
        </Text>
      </View>
      <HomeLeagueFormDots form={row.form} />
      <Text style={[styles.pts, { color: colors.link }]}>{row.points}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
  },
  posBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posText: { ...typography.caption, fontWeight: '800' },
  crestShell: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  crest: { width: '100%', height: '100%' },
  crestFallback: { ...typography.caption, fontWeight: '800' },
  clubBlock: { flex: 1, minWidth: 0 },
  clubName: { ...typography.body, fontWeight: '700', fontSize: 14 },
  meta: { ...typography.caption, marginTop: 1, fontSize: 11 },
  pts: { ...typography.heading, fontWeight: '800', minWidth: 28, textAlign: 'right' },
});
